"""
Persistence for countdown timers (.storage/btoddb_ha_reminders_timers).

Parallel to :class:`LocationReminderStore` but with its own storage key so neither the
time-based nor the location store needs migrating when timers change (TM-11, following
the LOC-4 precedent). The timer services, the sensor entity, and the timer delivery
runtime all go through this class and never touch storage directly.

Completed / stopped / cancelled timers are simply removed (TM-13) — a finished kitchen
timer has no review value, so there is no retention window here.
"""

from __future__ import annotations

import dataclasses
from typing import TYPE_CHECKING

from homeassistant.core import callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import STORAGE_KEY_TIMERS, STORAGE_VERSION_TIMERS
from .timers import Timer

if TYPE_CHECKING:
    from collections.abc import Callable

    from homeassistant.core import HomeAssistant


class TimerStore:
    """In-memory countdown timers, persisted to HA ``.storage``."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Bind to ``hass`` storage; call ``async_load`` to populate state."""
        self._store: Store = Store(hass, STORAGE_VERSION_TIMERS, STORAGE_KEY_TIMERS)
        self.timers: list[Timer] = []
        self._listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Load timers from disk (restart recovery — TM-12)."""
        data = await self._store.async_load() or {}
        timers: list[Timer] = []
        for raw in data.get("timers", []):
            created_at = dt_util.parse_datetime(raw["created_at"])
            finishes_at = dt_util.parse_datetime(raw["finishes_at"])
            if created_at is None or finishes_at is None:
                continue
            timers.append(
                Timer(
                    uid=raw["uid"],
                    duration_seconds=int(raw["duration_seconds"]),
                    created_at=created_at,
                    finishes_at=finishes_at,
                    label=raw.get("label"),
                    device_id=raw.get("device_id"),
                    state=raw.get("state", "running"),
                )
            )
        self.timers = timers

    @callback
    def _data(self) -> dict:
        return {
            "timers": [
                {
                    "uid": t.uid,
                    "duration_seconds": t.duration_seconds,
                    "created_at": t.created_at.isoformat(),
                    "finishes_at": t.finishes_at.isoformat(),
                    "label": t.label,
                    "device_id": t.device_id,
                    "state": t.state,
                }
                for t in self.timers
            ],
        }

    async def _async_persist(self) -> None:
        await self._store.async_save(self._data())
        for listener in self._listeners:
            listener()

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Register a callback fired after the store changes (sensor refresh)."""
        self._listeners.append(listener)

        def _remove() -> None:
            self._listeners.remove(listener)

        return _remove

    def get(self, uid: str) -> Timer | None:
        """Return the timer with ``uid``, or ``None``."""
        return next((t for t in self.timers if t.uid == uid), None)

    async def async_add(self, timer: Timer) -> None:
        """Add a timer and persist (TM-4: any number may run concurrently)."""
        self.timers.append(timer)
        await self._async_persist()

    async def async_remove(self, uid: str) -> bool:
        """Remove a timer by uid and persist (TM-13). Returns True if found."""
        kept = [t for t in self.timers if t.uid != uid]
        if len(kept) == len(self.timers):
            return False
        self.timers = kept
        await self._async_persist()
        return True

    async def async_set_state(self, uid: str, state: str) -> None:
        """Flip a timer's state (running -> nagging) and persist."""
        changed = False
        timers: list[Timer] = []
        for t in self.timers:
            if t.uid == uid and t.state != state:
                timers.append(dataclasses.replace(t, state=state))
                changed = True
            else:
                timers.append(t)
        if changed:
            self.timers = timers
            await self._async_persist()
