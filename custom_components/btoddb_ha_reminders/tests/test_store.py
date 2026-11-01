"""
Store-level tests for ReminderStore.

Covers series_uid persistence, the RM-17 "edit all occurrences" summary
rewrite, and RM-18 time-zone handling (wall-clock re-anchoring on load, elapsed
``in_minutes``). HA storage is bypassed via a no-op / fake ``Store`` so no hass
instance is required (same pattern as test_location_store).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest
from conftest import load_package

pkg = load_package()
ReminderStore = pkg.ReminderStore
# Use the package's ReminderEvent so dataclass equality matches events built by
# the package-loaded store (a load_module copy would be a distinct class).
ReminderEvent = pkg.ReminderEvent

NOW = datetime(2026, 6, 21, 12, 0, tzinfo=UTC)


def _make_store(events: list) -> tuple[ReminderStore, list]:
    """Minimal store with persistence recorded into the returned list."""
    store = object.__new__(ReminderStore)
    store.events = list(events)
    store.watermark = None
    store._listeners = []
    persists: list = []

    async def _record() -> None:
        persists.append(store._data())

    store._async_persist = _record
    return store, persists


def _series(uid: str = "series1") -> ReminderEvent:
    return ReminderEvent(uid=uid, summary="water plants", start=NOW, rrule="FREQ=DAILY")


def _copy(uid: str, series_uid: str, days_ago: int) -> ReminderEvent:
    return ReminderEvent(
        uid=uid,
        summary="water plants",
        start=NOW - timedelta(days=days_ago),
        rrule=None,
        series_uid=series_uid,
    )


def test_data_round_trips_series_uid():
    store, _ = _make_store([_series(), _copy("c1", "series1", 1)])
    data = store._data()
    assert "series_uid" not in data["events"][0]
    assert data["events"][1]["series_uid"] == "series1"

    loaded = object.__new__(ReminderStore)
    loaded._listeners = []

    async def _fake_load() -> dict:
        return data

    loaded._store = SimpleNamespace(async_load=_fake_load)
    loaded.watermark = None
    asyncio.run(loaded.async_load())
    assert loaded.events == store.events


def test_update_series_summaries_renames_only_the_series_copies():
    other = ReminderEvent(uid="other", summary="feed cat", start=NOW)
    store, persists = _make_store(
        [_series(), _copy("c1", "series1", 1), _copy("c2", "otherseries", 2), other]
    )
    asyncio.run(store.async_update_series_summaries("series1", "water the plants"))
    by_uid = {e.uid: e for e in store.events}
    assert by_uid["c1"].summary == "water the plants"
    assert by_uid["c1"].start == NOW - timedelta(days=1)  # history keeps its time
    assert by_uid["c2"].summary == "water plants"
    assert by_uid["other"].summary == "feed cat"
    # The series event itself is untouched here — the update service edits it
    # through async_update_event; this method only sweeps the fired copies.
    assert by_uid["series1"].summary == "water plants"
    assert len(persists) == 1


def test_update_series_summaries_no_match_does_not_persist():
    store, persists = _make_store([_series()])
    asyncio.run(store.async_update_series_summaries("series1", "water plants"))
    assert persists == []


# ---------------------------------------------------------------------------
# RM-18 — wall-clock time across DST (``la_tz``: America/Los_Angeles).
# ---------------------------------------------------------------------------

LA = ZoneInfo("America/Los_Angeles")


def _load_event(raw_start: str, rrule: str | None = None) -> ReminderEvent:
    """Load a single stored event with ``raw_start`` (and optional rrule)."""
    loaded = object.__new__(ReminderStore)
    loaded._listeners = []
    raw = {"uid": "u1", "summary": "s", "start": raw_start}
    if rrule is not None:
        raw["rrule"] = rrule

    async def _fake_load() -> dict:
        return {"events": [raw]}

    loaded._store = SimpleNamespace(async_load=_fake_load)
    loaded.watermark = None
    asyncio.run(loaded.async_load())
    return loaded.events[0]


def _load_start(raw_start: str) -> datetime:
    """Load a single stored event with ``raw_start`` and return its start."""
    return _load_event(raw_start).start


@pytest.mark.usefixtures("la_tz")
def test_load_reanchors_stale_offset_to_wall_clock():
    # Saved with the summer offset, but Nov 2 is PST: the wall clock wins (RM-18a).
    start = _load_start("2026-11-02T08:00:00-07:00")
    assert start.tzinfo is LA
    assert (start.hour, start.minute) == (8, 0)
    assert start.utcoffset() == timedelta(hours=-8)


@pytest.mark.usefixtures("la_tz")
def test_load_round_trips_correctly_saved_start():
    original = datetime(2026, 11, 2, 8, 0, tzinfo=LA)
    start = _load_start(original.isoformat())
    assert start.tzinfo is LA
    assert start == original
    assert start.utcoffset() == original.utcoffset()


@pytest.mark.usefixtures("la_tz")
def test_load_repeated_fall_back_hour_later_instance_uses_fold_1():
    start = _load_start("2026-11-01T01:30:00-08:00")
    assert start.tzinfo is LA
    assert start.fold == 1
    assert start.utcoffset() == timedelta(hours=-8)
    assert start.astimezone(UTC) == datetime(2026, 11, 1, 9, 30, tzinfo=UTC)


@pytest.mark.usefixtures("la_tz")
def test_load_repeated_fall_back_hour_earlier_instance_uses_fold_0():
    start = _load_start("2026-11-01T01:30:00-07:00")
    assert start.tzinfo is LA
    assert start.fold == 0
    assert start.utcoffset() == timedelta(hours=-7)
    assert start.astimezone(UTC) == datetime(2026, 11, 1, 8, 30, tzinfo=UTC)


@pytest.mark.usefixtures("la_tz")
def test_load_naive_start_is_held_in_local_zone():
    start = _load_start("2026-11-02T08:00:00")
    assert start.tzinfo is LA
    assert (start.hour, start.minute) == (8, 0)


@pytest.mark.usefixtures("la_tz")
def test_resolve_start_in_minutes_is_elapsed_time_across_dst():
    # 01:30 PDT (first pass) + 60 real minutes = 01:30 PST (second pass) (RM-18b).
    now = datetime(2026, 11, 1, 1, 30, tzinfo=LA)
    start = pkg._resolve_start(now, None, 60)
    assert start.tzinfo is LA
    assert start.astimezone(UTC) - now.astimezone(UTC) == timedelta(minutes=60)
    assert (start.hour, start.minute, start.fold) == (1, 30, 1)


@pytest.mark.usefixtures("la_tz")
def test_loaded_daily_reminder_keeps_8am_after_dst_ends():
    # Issue #92 end to end: saved in summer, advanced past the change -> 08:00 PST.
    event = _load_event("2026-10-31T08:00:00-07:00", rrule="FREQ=DAILY")
    nxt = pkg.advance_recurring(event, datetime(2026, 11, 1, 9, 0, tzinfo=LA))
    assert nxt is not None
    assert nxt.start.tzinfo is LA
    assert (nxt.start.month, nxt.start.day, nxt.start.hour) == (11, 2, 8)
    assert nxt.start.utcoffset() == timedelta(hours=-8)


def test_update_past_check_compares_instants_in_repeated_hour(la_tz, monkeypatch):
    # now is 01:40 PDT; 01:30 PST (fold=1) is 50 real minutes later, so it is not
    # in the past even though its wall clock is earlier (RM-18b).
    now = datetime(2026, 11, 1, 1, 40, tzinfo=la_tz)
    monkeypatch.setattr(pkg.dt_util, "now", lambda *_: now)
    store, _ = _make_store(
        [ReminderEvent(uid="u1", summary="s", start=now + timedelta(hours=3))]
    )
    handler = pkg._make_update_handler(store)
    call = SimpleNamespace(data={"uid": "u1", "when": "2026-11-01T01:30:00-08:00"})
    asyncio.run(handler(call))
    start = store.events[0].start
    assert start.tzinfo is la_tz
    assert start.fold == 1
    assert start.astimezone(UTC) == datetime(2026, 11, 1, 9, 30, tzinfo=UTC)


def test_prune_compares_instants_in_repeated_hour():
    # 01:30 PST (fold=1) is 50 real minutes after 01:40 PDT, so it is kept; it is
    # 10 real minutes before 01:40 PST, so it is dropped (RM-18c).
    event = ReminderEvent(
        uid="u1", summary="s", start=datetime(2026, 11, 1, 1, 30, tzinfo=LA, fold=1)
    )
    store, _ = _make_store([event])
    asyncio.run(store.async_prune(datetime(2026, 11, 1, 1, 40, tzinfo=LA)))
    assert store.events == [event]

    asyncio.run(store.async_prune(datetime(2026, 11, 1, 1, 40, tzinfo=LA, fold=1)))
    assert store.events == []


def test_in_range_compares_instants_in_repeated_hour():
    # [01:20, 01:40] PDT ends before 01:30 PST; the same wall range in PST holds it.
    event = ReminderEvent(
        uid="u1", summary="s", start=datetime(2026, 11, 1, 1, 30, tzinfo=LA, fold=1)
    )
    store, _ = _make_store([event])
    pdt = (
        datetime(2026, 11, 1, 1, 20, tzinfo=LA),
        datetime(2026, 11, 1, 1, 40, tzinfo=LA),
    )
    pst = tuple(bound.replace(fold=1) for bound in pdt)
    assert store.in_range(*pdt) == []
    assert store.in_range(*pst) == [event]
