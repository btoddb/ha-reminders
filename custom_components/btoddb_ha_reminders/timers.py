"""
Pure countdown-timer logic — no Home Assistant imports (TM-*).

This module is deliberately HA-free so its tests run under plain pytest, mirroring
``delivery.py`` and ``location.py``. It owns the timer shape and the kitchen-timer
math: spoken durations, announcement wording, the nag cap, and the restart
classification (arm again / start nagging / fall back to a phone push — TM-12).

The HA layer (``timer_delivery.py``) owns the actual scheduling
(``async_track_point_in_time`` per timer — TM-5) and the ``assist_satellite.announce``
/ ``btoddb_notifications.send`` calls; everything it needs to *decide* lives here.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from datetime import datetime

# A running timer that hasn't reached zero yet.
STATE_RUNNING = "running"
# A timer past zero that is alarming on its target device until acknowledged (TM-6).
STATE_NAGGING = "nagging"

# How often the alarm repeats while nagging (TM-6 suggestion: every 15-30 seconds).
NAG_INTERVAL_SECONDS = 20
# How long a timer nags before giving up and falling back to a phone push (TM-8).
NAG_CAP = timedelta(minutes=10)

# Restart classification results (TM-12).
STARTUP_ARM = "arm"
STARTUP_NAG = "nag"
STARTUP_FALLBACK = "fallback"

_SECONDS_PER_MINUTE = 60
_MINUTES_PER_HOUR = 60


@dataclass(frozen=True)
class Timer:
    """
    A single countdown timer.

    ``device_id`` is the device that heard the request (TM-2) — the alarm target —
    or ``None`` when no device could be resolved (phone-push fallback, TM-7).
    ``state`` is :data:`STATE_RUNNING` until the timer reaches zero, then
    :data:`STATE_NAGGING` while the alarm repeats (TM-6). ``created_at`` and
    ``finishes_at`` are timezone-aware local datetimes; the component computes
    ``finishes_at = created_at + duration`` itself (TM-1).
    """

    uid: str
    duration_seconds: int
    created_at: datetime
    finishes_at: datetime
    label: str | None = None
    device_id: str | None = None
    state: str = STATE_RUNNING


def spoken_duration(seconds: int) -> str:
    """
    Render a duration in seconds as a spoken phrase (TM-3).

    "5 minutes", "90 seconds" -> "1 minute 30 seconds", "3600" -> "1 hour" — the
    largest units a person would say, so the confirmation can be echoed verbatim.
    """
    if seconds < _SECONDS_PER_MINUTE:
        return _plural(seconds, "second")
    minutes, secs = divmod(seconds, _SECONDS_PER_MINUTE)
    hours, minutes = divmod(minutes, _MINUTES_PER_HOUR)
    parts: list[str] = []
    if hours:
        parts.append(_plural(hours, "hour"))
    if minutes:
        parts.append(_plural(minutes, "minute"))
    if secs:
        parts.append(_plural(secs, "second"))
    return " ".join(parts)


def _plural(n: int, unit: str) -> str:
    return f"{n} {unit}" if n == 1 else f"{n} {unit}s"


def _timer_name(label: str | None) -> str:
    """Return "pasta timer" for a labeled timer, plain "timer" otherwise."""
    return f"{label} timer" if label else "timer"


def build_create_confirmation(label: str | None, duration_seconds: int) -> str:
    """Ready-to-say confirmation for a created timer (TM-3), echoed verbatim."""
    name = _timer_name(label)
    return f"{name[0].upper()}{name[1:]} set for {spoken_duration(duration_seconds)}."


def build_stop_confirmation(stopped: list[Timer]) -> str:
    """Ready-to-say result of a stop request (TM-9), echoed verbatim."""
    if not stopped:
        return "No timer is going off."
    if len(stopped) == 1:
        name = _timer_name(stopped[0].label)
        return f"{name[0].upper()}{name[1:]} stopped."
    return f"{len(stopped)} timers stopped."


def build_cancel_confirmation(cancelled: list[Timer]) -> str:
    """Ready-to-say result of a cancel request (TM-10), echoed verbatim."""
    if len(cancelled) == 1:
        name = _timer_name(cancelled[0].label)
        return f"{name[0].upper()}{name[1:]} cancelled."
    return f"{len(cancelled)} timers cancelled."


def describe_timers(timers: list[Timer]) -> str:
    """List active timers for an error message the agent can re-ask from."""
    return ", ".join(f"{_timer_name(t.label)} (uid {t.uid})" for t in timers)


def find_timers_to_cancel(
    timers: list[Timer], uid: str | None, label: str | None
) -> tuple[list[Timer], str | None]:
    """
    Resolve a cancel request to concrete timers (TM-10).

    Returns ``(matches, error)`` — exactly one of the two is meaningful. Resolution,
    in order:

    - ``uid`` given: that timer exactly.
    - ``label`` given: every active timer whose label matches case-insensitively
      ("cancel the pasta timer" with two pasta timers cancels both).
    - neither: the sole active timer, so "cancel the timer" works without the model
      ever having seen a uid; ambiguous with several running.

    Errors include the active-timer list so a conversation agent can re-ask
    intelligently instead of guessing.
    """
    if uid is not None:
        timer = next((t for t in timers if t.uid == uid), None)
        if timer is None:
            return [], f"Timer with uid {uid!r} not found."
        return [timer], None
    if label is not None:
        return _find_by_label(timers, label)
    return _sole_timer(timers)


def _find_by_label(timers: list[Timer], label: str) -> tuple[list[Timer], str | None]:
    """Match ``label`` case-insensitively against active timers."""
    wanted = label.strip().casefold()
    matches = [t for t in timers if (t.label or "").strip().casefold() == wanted]
    if matches:
        return matches, None
    if not timers:
        return [], f"No {label!r} timer found; no timers are active."
    return [], f"No {label!r} timer found. Active timers: {describe_timers(timers)}."


def _sole_timer(timers: list[Timer]) -> tuple[list[Timer], str | None]:
    """Resolve an identifier-less cancel to the only active timer."""
    if not timers:
        return [], "No timers are active."
    if len(timers) > 1:
        return (
            [],
            "More than one timer is active; say which one. "
            f"Active timers: {describe_timers(timers)}.",
        )
    return list(timers), None


def announcement_text(label: str | None, now: datetime, finishes_at: datetime) -> str:
    """
    Return the spoken alarm text for a timer at/past zero (TM-6, TM-12).

    Includes the label when present ("Your pasta timer is done") and, when the timer
    went off noticeably in the past (HA was down — TM-12), how long ago.
    """
    text = f"Your {_timer_name(label)} is done."
    overdue_minutes = int((now - finishes_at).total_seconds()) // _SECONDS_PER_MINUTE
    if overdue_minutes >= 1:
        text += f" It went off {_plural(overdue_minutes, 'minute')} ago."
    return text


def fallback_message(label: str | None, now: datetime, finishes_at: datetime) -> str:
    """Phone-push body when the alarm can't (or can no longer) ring (TM-7, TM-8)."""
    return announcement_text(label, now, finishes_at)


def nag_deadline(finishes_at: datetime) -> datetime:
    """Return the instant nagging gives up in favor of a phone push (TM-8)."""
    return finishes_at + NAG_CAP


def is_past_cap(now: datetime, finishes_at: datetime) -> bool:
    """Return True once ``now`` is past the nag cap from the due time (TM-8)."""
    return now >= nag_deadline(finishes_at)


def startup_action(timer: Timer, now: datetime) -> str:
    """
    Classify a stored timer on Home Assistant start (TM-12).

    - :data:`STARTUP_ARM` — still pending; re-arm its point-in-time listener.
    - :data:`STARTUP_NAG` — expired while HA was down (or was already nagging) but is
      still inside the cap window measured from the original due time; start nagging
      immediately.
    - :data:`STARTUP_FALLBACK` — long past its cap window; send the phone push instead
      of ringing.
    """
    if timer.finishes_at > now:
        return STARTUP_ARM
    if is_past_cap(now, timer.finishes_at):
        return STARTUP_FALLBACK
    return STARTUP_NAG


def nagging_timers_to_stop(timers: list[Timer], device_id: str | None) -> list[Timer]:
    """
    Return the nagging timers a "stop timer" request silences (TM-9).

    With a resolvable device, only that device's nagging timers stop; with none, every
    nagging timer stops (a typed/deviceless "stop timer" must always work).
    """
    nagging = [t for t in timers if t.state == STATE_NAGGING]
    if device_id is None:
        return nagging
    return [t for t in nagging if t.device_id == device_id]
