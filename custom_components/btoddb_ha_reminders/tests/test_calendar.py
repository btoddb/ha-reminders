"""
Calendar entity presentation tests (RM-16a, RM-18).

Past reminders are struck through at read time, and edits arriving through the
calendar entity are stripped of the decoration before hitting the store. Recurring
expansion and edits keep HA's local zone so wall-clock times survive DST.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, date, datetime, timedelta
from importlib import import_module

import pytest
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


def test_expand_recurring_daily_keeps_wall_clock_across_dst(la_tz):
    # DST ends 2026-11-01 02:00 local: every occurrence stays at 08:00 (RM-18).
    event = ReminderEvent(
        uid="r1",
        summary="medicine",
        start=datetime(2026, 10, 30, 8, 0, tzinfo=la_tz),
        rrule="FREQ=DAILY",
    )
    got = calendar._expand_recurring(
        event,
        datetime(2026, 10, 30, 0, 0, tzinfo=la_tz),
        datetime(2026, 11, 3, 23, 59, tzinfo=la_tz),
    )
    assert [e.start.date() for e in got] == [
        date(2026, 10, 30),
        date(2026, 10, 31),
        date(2026, 11, 1),
        date(2026, 11, 2),
        date(2026, 11, 3),
    ]
    for e in got:
        local = e.start.astimezone(la_tz)
        assert (local.hour, local.minute) == (8, 0)


@pytest.mark.usefixtures("la_tz")
def test_update_event_stores_start_in_local_zone():
    entity = object.__new__(calendar.ReminderCalendarEntity)
    recorded: dict = {}

    class _FakeStore:
        async def async_update_event(self, uid, *, summary=None, start=None):
            recorded["uid"] = uid
            recorded["summary"] = summary
            recorded["start"] = start
            return True

    entity._store = _FakeStore()
    utc_start = datetime(2026, 11, 2, 16, 0, tzinfo=UTC)  # 08:00 PST
    ha_event = CalendarEvent(
        summary="water plants",
        start=utc_start,
        end=utc_start + timedelta(minutes=1),
        uid="u1",
    )
    asyncio.run(entity.async_update_event("u1", ha_event))
    stored = recorded["start"]
    assert stored.tzinfo is dt_util.DEFAULT_TIME_ZONE
    assert stored == utc_start
    assert (stored.hour, stored.minute) == (8, 0)
