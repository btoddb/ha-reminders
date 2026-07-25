"""
Calendar entity presentation tests (RM-16a).

Past reminders are struck through at read time, and edits arriving through the
calendar entity are stripped of the decoration before hitting the store.
"""

from __future__ import annotations

import asyncio
from datetime import timedelta
from importlib import import_module

from conftest import load_module, load_package
from homeassistant.components.calendar import CalendarEvent
from homeassistant.util import dt as dt_util

strikethrough = load_module("strikethrough")
strike_text = strikethrough.strike_text

pkg = load_package()
calendar = import_module(f"{pkg.__name__}.calendar")
ReminderEvent = pkg.ReminderEvent


def _event(minutes_from_now: int, summary: str = "water plants") -> ReminderEvent:
    return ReminderEvent(
        uid="u1",
        summary=summary,
        start=dt_util.now() + timedelta(minutes=minutes_from_now),
    )


def test_future_event_summary_is_clean():
    assert calendar._to_calendar_event(_event(10)).summary == "water plants"


def test_past_event_summary_is_struck_through():
    assert calendar._to_calendar_event(_event(-10)).summary == strike_text(
        "water plants"
    )


def test_event_still_inside_its_minute_slot_is_not_struck():
    # The 1-minute calendar slot hasn't fully passed yet.
    assert calendar._to_calendar_event(_event(0)).summary == "water plants"


def test_update_event_strips_strikethrough_before_storing():
    entity = object.__new__(calendar.ReminderCalendarEntity)
    recorded: dict = {}

    class _FakeStore:
        async def async_update_event(self, uid, *, summary=None, start=None):
            recorded["uid"] = uid
            recorded["summary"] = summary
            recorded["start"] = start
            return True

    entity._store = _FakeStore()
    start = dt_util.now() - timedelta(hours=1)
    ha_event = CalendarEvent(
        summary=strike_text("water plants"),
        start=start,
        end=start + timedelta(minutes=1),
        uid="u1",
    )
    asyncio.run(entity.async_update_event("u1", ha_event))
    assert recorded == {"uid": "u1", "summary": "water plants", "start": start}
