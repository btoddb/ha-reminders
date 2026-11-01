"""
Delivery-loop regression tests for RM-16 crash recovery.

Exercises ``ReminderDelivery.async_tick`` against a real ``ReminderStore``
(persistence stubbed out) and a fake ``hass`` that records notification service
calls, covering the persisted intermediate state where a fired copy exists but
the series advance was lost.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from conftest import load_package
from homeassistant.util import dt as dt_util

pkg = load_package()
ReminderDelivery = pkg.ReminderDelivery
ReminderStore = pkg.ReminderStore
ReminderEvent = pkg.ReminderEvent
fired_copy = pkg.fired_copy


def _make_store(events: list, watermark) -> ReminderStore:
    store = object.__new__(ReminderStore)
    store.events = list(events)
    store.watermark = watermark
    store._listeners = []

    async def _noop() -> None:
        pass

    store._async_persist = _noop
    return store


def _make_hass(calls: list) -> SimpleNamespace:
    async def _async_call(domain, service, payload, **_kwargs):
        calls.append((domain, service, payload))
        return {"success": True}

    return SimpleNamespace(services=SimpleNamespace(async_call=_async_call))


def _run_tick(events: list, watermark) -> tuple[ReminderStore, list]:
    store = _make_store(events, watermark)
    calls: list = []
    hass = _make_hass(calls)
    entry = SimpleNamespace(options={}, data={})
    delivery = ReminderDelivery(hass, entry, store)
    asyncio.run(delivery.async_tick())
    return store, calls


def test_due_recurring_event_sends_once_and_freezes_a_fired_copy():
    now = dt_util.now()
    series = ReminderEvent(
        uid="series1",
        summary="water plants",
        start=now - timedelta(minutes=2),
        rrule="FREQ=DAILY",
    )
    store, calls = _run_tick([series], watermark=now - timedelta(minutes=5))

    assert len(calls) == 1
    copies = [e for e in store.events if e.series_uid == "series1"]
    assert len(copies) == 1
    assert copies[0].start == series.start
    advanced = next(e for e in store.events if e.uid == "series1")
    assert advanced.start == series.start + timedelta(days=1)


def test_crash_between_copy_and_advance_recovers_without_resending():
    # Persisted intermediate state (RM-16): the fired copy exists, but HA stopped
    # before the series was advanced — both sit at the same past start inside the
    # delivery window. The copy is proof of delivery: no notification may go out,
    # no second copy may be minted, and the series must advance.
    now = dt_util.now()
    series = ReminderEvent(
        uid="series1",
        summary="water plants",
        start=now - timedelta(minutes=2),
        rrule="FREQ=DAILY",
    )
    copy = fired_copy(series)
    store, calls = _run_tick([series, copy], watermark=now - timedelta(minutes=5))

    assert calls == []
    copies = [e for e in store.events if e.series_uid == "series1"]
    assert copies == [copy]
    advanced = next(e for e in store.events if e.uid == "series1")
    assert advanced.start == series.start + timedelta(days=1)
    assert store.watermark is not None and store.watermark >= now


def test_series_in_repeated_hour_waits_for_second_pass(la_tz, monkeypatch):
    # A daily series at 01:30 PST (fold=1) ticked at 01:35 PDT is still 55 real
    # minutes ahead: it was neither missed nor due, so it must stay put and fire
    # on the second pass of the repeated hour (RM-18c).
    start = datetime(2026, 11, 1, 1, 30, tzinfo=la_tz, fold=1)
    series = ReminderEvent(
        uid="series1", summary="water plants", start=start, rrule="FREQ=DAILY"
    )
    store = _make_store([series], datetime(2026, 11, 1, 1, 34, tzinfo=la_tz))
    calls: list = []
    delivery = ReminderDelivery(
        _make_hass(calls), SimpleNamespace(options={}, data={}), store
    )

    now = datetime(2026, 11, 1, 1, 35, tzinfo=la_tz)
    monkeypatch.setattr(dt_util, "now", lambda *_: now)
    asyncio.run(delivery.async_tick())
    assert calls == []
    current = next(e for e in store.events if e.uid == "series1")
    assert current.start.astimezone(UTC) == start.astimezone(UTC)

    now = datetime(2026, 11, 1, 1, 30, 40, tzinfo=la_tz, fold=1)
    asyncio.run(delivery.async_tick())
    assert len(calls) == 1
    advanced = next(e for e in store.events if e.uid == "series1")
    assert advanced.start.tzinfo is la_tz
    assert (advanced.start.day, advanced.start.hour, advanced.start.minute) == (
        2,
        1,
        30,
    )


def test_prune_retention_is_elapsed_time_across_fall_back(la_tz, monkeypatch):
    # Ticked at 01:30 PST (fold=1), a one-shot from 7 days and 30 real minutes
    # ago is past the 7-day retention and must be pruned. A wall-clock cutoff
    # (01:30 PDT a week earlier) would keep it an extra hour (RM-18c).
    now = datetime(2026, 11, 1, 1, 30, tzinfo=la_tz, fold=1)
    start = datetime(2026, 10, 25, 9, 0, tzinfo=UTC).astimezone(la_tz)
    old = ReminderEvent(uid="old1", summary="water plants", start=start)
    store = _make_store([old], now - timedelta(minutes=1))
    delivery = ReminderDelivery(
        _make_hass([]), SimpleNamespace(options={}, data={}), store
    )

    monkeypatch.setattr(dt_util, "now", lambda *_: now)
    asyncio.run(delivery.async_tick())
    assert store.events == []
