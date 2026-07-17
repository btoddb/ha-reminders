"""
Countdown-timer scheduling and alarm delivery (TM-5..TM-9, TM-12).

The HA-side runtime for ``timers.py``: each pending timer is armed with its own
``async_track_point_in_time`` listener so it fires at its due second, independent of
the once-a-minute reminder watermark loop (TM-5). At zero the timer nags — the alarm
plays on its target device via ``assist_satellite.announce`` and repeats every
``NAG_INTERVAL_SECONDS`` until stopped/cancelled (TM-6/TM-7) or the cap is reached,
at which point a phone push goes out instead (TM-8). Deciding *what* to do lives in
``timers.py``; this module only schedules and calls services.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.core import callback
from homeassistant.helpers.event import async_call_later, async_track_point_in_time
from homeassistant.util import dt as dt_util

from .timers import (
    NAG_INTERVAL_SECONDS,
    STARTUP_ARM,
    STARTUP_NAG,
    STATE_NAGGING,
    Timer,
    announcement_text,
    fallback_message,
    is_past_cap,
    nagging_timers_to_stop,
    startup_action,
)

if TYPE_CHECKING:
    from collections.abc import Awaitable, Callable
    from datetime import datetime

    from homeassistant.core import HomeAssistant

    from .timer_store import TimerStore

_LOGGER = logging.getLogger(__name__)

ASSIST_SATELLITE_DOMAIN = "assist_satellite"
ASSIST_SATELLITE_SERVICE_ANNOUNCE = "announce"


class TimerDelivery:
    """Arms, fires, nags, and recovers countdown timers."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: TimerStore,
        notify: Callable[[str], Awaitable[bool]],
    ) -> None:
        """
        Bind to the timer store.

        ``notify`` sends the phone-push fallback (message) and returns success —
        injected so this module never imports the integration ``__init__``.
        """
        self._hass = hass
        self._store = store
        self._notify = notify
        # One scheduled callback per timer uid — either the pending point-in-time
        # listener or the next nag repeat. Cancelled on stop/cancel/unload.
        self._unsubs: dict[str, Callable[[], None]] = {}

    async def async_start(self) -> None:
        """Recover stored timers on startup (TM-12)."""
        now = dt_util.now()
        for timer in list(self._store.timers):
            action = startup_action(timer, now)
            if action == STARTUP_ARM:
                self.async_arm(timer)
            elif action == STARTUP_NAG:
                await self._store.async_set_state(timer.uid, STATE_NAGGING)
                await self._async_nag(timer.uid)
            else:  # STARTUP_FALLBACK — long past the cap window; push, don't ring.
                await self._async_push_fallback(timer, now)
                await self._async_finish(timer.uid)

    @callback
    def async_shutdown(self) -> None:
        """Cancel every scheduled callback (config-entry unload)."""
        for unsub in self._unsubs.values():
            unsub()
        self._unsubs.clear()

    @callback
    def async_arm(self, timer: Timer) -> None:
        """Schedule a timer to fire at its due second (TM-5)."""

        async def _fire(_now: datetime) -> None:
            self._unsubs.pop(timer.uid, None)
            await self._store.async_set_state(timer.uid, STATE_NAGGING)
            await self._async_nag(timer.uid)

        self._cancel(timer.uid)
        self._unsubs[timer.uid] = async_track_point_in_time(
            self._hass, _fire, timer.finishes_at
        )

    async def async_stop(
        self, uid: str | None = None, device_id: str | None = None
    ) -> list[Timer]:
        """
        Silence nagging timer(s) (TM-9); returns the timers stopped.

        With ``uid``, stops exactly that timer. Otherwise stops the nagging timers for
        ``device_id``, or every nagging timer when no device is resolvable.
        """
        if uid is not None:
            timer = self._store.get(uid)
            targets = [timer] if timer is not None else []
        else:
            targets = nagging_timers_to_stop(list(self._store.timers), device_id)
        for timer in targets:
            await self._async_finish(timer.uid)
        return targets

    async def async_cancel(self, uid: str) -> bool:
        """
        Cancel a timer by uid, pending or nagging (TM-10).

        Cancelling a nagging timer behaves like stopping it, so the card's one cancel
        button works before and after zero. Returns True if the uid existed.
        """
        if self._store.get(uid) is None:
            return False
        await self._async_finish(uid)
        return True

    @callback
    def _cancel(self, uid: str) -> None:
        unsub = self._unsubs.pop(uid, None)
        if unsub is not None:
            unsub()

    async def _async_finish(self, uid: str) -> None:
        """Stop scheduling and drop the timer from the store (TM-13)."""
        self._cancel(uid)
        await self._store.async_remove(uid)

    async def _async_nag(self, uid: str) -> None:
        """One nag beat: cap check, announce, schedule the next repeat (TM-6..TM-8)."""
        timer = self._store.get(uid)
        if timer is None:
            return
        now = dt_util.now()
        if is_past_cap(now, timer.finishes_at):
            # Nagged the whole cap window without acknowledgement (TM-8).
            await self._async_push_fallback(timer, now)
            await self._async_finish(uid)
            return
        announced = await self._async_announce(timer, now)
        if not announced:
            # No target device, or the announce failed — the alarm must never be
            # silently dropped (TM-7), so push to the phone and complete the timer.
            await self._async_push_fallback(timer, now)
            await self._async_finish(uid)
            return

        async def _repeat(_now: datetime) -> None:
            self._unsubs.pop(uid, None)
            await self._async_nag(uid)

        self._cancel(uid)
        self._unsubs[uid] = async_call_later(self._hass, NAG_INTERVAL_SECONDS, _repeat)

    async def _async_announce(self, timer: Timer, now: datetime) -> bool:
        """Play the alarm on the timer's target device (TM-7). True on success."""
        if timer.device_id is None:
            return False
        try:
            await self._hass.services.async_call(
                ASSIST_SATELLITE_DOMAIN,
                ASSIST_SATELLITE_SERVICE_ANNOUNCE,
                {"message": announcement_text(timer.label, now, timer.finishes_at)},
                blocking=True,
                target={"device_id": timer.device_id},
            )
        except Exception:
            _LOGGER.exception(
                "Failed to announce timer %r on device %s", timer.uid, timer.device_id
            )
            return False
        return True

    async def _async_push_fallback(self, timer: Timer, now: datetime) -> None:
        """Send the phone-push fallback (TM-7/TM-8); failure is logged, not retried."""
        message = fallback_message(timer.label, now, timer.finishes_at)
        if not await self._notify(message):
            _LOGGER.warning(
                "Timer %r fallback push failed; alarm was not delivered", timer.uid
            )
