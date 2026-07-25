"""
Delivery-loop regression tests for RM-16 crash recovery.

Exercises ``ReminderDelivery.async_tick`` against a real ``ReminderStore``
(persistence stubbed out) and a fake ``hass`` that records notification service
calls, covering the persisted intermediate state where a fired copy exists but
the series advance was lost.
"""

from __future__ import annotations

import asyncio
from datetime import timedelta
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
