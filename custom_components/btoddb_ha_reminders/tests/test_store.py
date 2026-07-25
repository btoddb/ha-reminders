"""
Store-level tests for ReminderStore.

Covers series_uid persistence and the RM-17 "edit all occurrences" summary
rewrite. HA storage is bypassed via a no-op / fake ``Store`` so no hass
instance is required (same pattern as test_location_store).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

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
