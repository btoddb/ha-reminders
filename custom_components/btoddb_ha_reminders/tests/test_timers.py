"""Tests for the pure countdown-timer logic in ``timers.py`` (TM-*). HA-free."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from conftest import load_module

timers = load_module("timers")

NOW = datetime(2026, 7, 17, 12, 0, 0, tzinfo=UTC)


def _timer(**overrides):
    defaults = {
        "uid": "t1",
        "duration_seconds": 300,
        "created_at": NOW - timedelta(minutes=5),
        "finishes_at": NOW,
        "label": None,
        "device_id": None,
        "state": timers.STATE_RUNNING,
    }
    defaults.update(overrides)
    return timers.Timer(**defaults)


# --- spoken_duration (TM-3) ---


def test_spoken_duration_seconds_only():
    assert timers.spoken_duration(30) == "30 seconds"
    assert timers.spoken_duration(1) == "1 second"


def test_spoken_duration_whole_minutes():
    assert timers.spoken_duration(300) == "5 minutes"
    assert timers.spoken_duration(60) == "1 minute"


def test_spoken_duration_minutes_and_seconds():
    assert timers.spoken_duration(90) == "1 minute 30 seconds"


def test_spoken_duration_hours():
    assert timers.spoken_duration(3600) == "1 hour"
    assert timers.spoken_duration(5400) == "1 hour 30 minutes"
    assert timers.spoken_duration(3661) == "1 hour 1 minute 1 second"


# --- confirmations (TM-3, TM-9) ---


def test_create_confirmation_unlabeled():
    assert timers.build_create_confirmation(None, 300) == "Timer set for 5 minutes."


def test_create_confirmation_labeled():
    assert (
        timers.build_create_confirmation("pasta", 480)
        == "Pasta timer set for 8 minutes."
    )


def test_stop_confirmation_none():
    assert timers.build_stop_confirmation([]) == "No timer is going off."


def test_stop_confirmation_one_labeled():
    stopped = [_timer(label="pasta", state=timers.STATE_NAGGING)]
    assert timers.build_stop_confirmation(stopped) == "Pasta timer stopped."


def test_stop_confirmation_one_unlabeled():
    stopped = [_timer(state=timers.STATE_NAGGING)]
    assert timers.build_stop_confirmation(stopped) == "Timer stopped."


def test_stop_confirmation_many():
    stopped = [
        _timer(uid="a", state=timers.STATE_NAGGING),
        _timer(uid="b", state=timers.STATE_NAGGING),
    ]
    assert timers.build_stop_confirmation(stopped) == "2 timers stopped."


# --- announcement wording (TM-6, TM-12) ---


def test_announcement_on_time():
    assert timers.announcement_text(None, NOW, NOW) == "Your timer is done."


def test_announcement_labeled():
    assert timers.announcement_text("pasta", NOW, NOW) == "Your pasta timer is done."


def test_announcement_within_first_minute_has_no_overdue_clause():
    text = timers.announcement_text(None, NOW, NOW - timedelta(seconds=45))
    assert text == "Your timer is done."


def test_announcement_overdue_wording():
    text = timers.announcement_text("pasta", NOW, NOW - timedelta(minutes=3))
    assert text == "Your pasta timer is done. It went off 3 minutes ago."


def test_announcement_overdue_singular():
    text = timers.announcement_text(None, NOW, NOW - timedelta(seconds=90))
    assert text == "Your timer is done. It went off 1 minute ago."


# --- nag cap (TM-8) ---


def test_before_cap_is_not_past():
    assert not timers.is_past_cap(NOW, NOW - timers.NAG_CAP + timedelta(seconds=1))


def test_at_cap_is_past():
    assert timers.is_past_cap(NOW, NOW - timers.NAG_CAP)


def test_nag_deadline_is_cap_after_due_time():
    assert timers.nag_deadline(NOW) == NOW + timers.NAG_CAP


# --- restart classification (TM-12) ---


def test_startup_pending_timer_is_rearmed():
    timer = _timer(finishes_at=NOW + timedelta(minutes=2))
    assert timers.startup_action(timer, NOW) == timers.STARTUP_ARM


def test_startup_expired_during_downtime_nags_immediately():
    timer = _timer(finishes_at=NOW - timedelta(minutes=2))
    assert timers.startup_action(timer, NOW) == timers.STARTUP_NAG


def test_startup_long_past_cap_falls_back_to_push():
    timer = _timer(finishes_at=NOW - timers.NAG_CAP - timedelta(minutes=1))
    assert timers.startup_action(timer, NOW) == timers.STARTUP_FALLBACK


def test_startup_already_nagging_timer_resumes_nagging():
    timer = _timer(finishes_at=NOW - timedelta(minutes=1), state=timers.STATE_NAGGING)
    assert timers.startup_action(timer, NOW) == timers.STARTUP_NAG


# --- stop selection (TM-9) ---


def test_stop_selects_only_nagging():
    running = _timer(uid="r")
    nagging = _timer(uid="n", state=timers.STATE_NAGGING)
    assert timers.nagging_timers_to_stop([running, nagging], None) == [nagging]


def test_stop_is_device_scoped():
    kitchen = _timer(uid="k", device_id="dev_k", state=timers.STATE_NAGGING)
    living = _timer(uid="l", device_id="dev_l", state=timers.STATE_NAGGING)
    assert timers.nagging_timers_to_stop([kitchen, living], "dev_k") == [kitchen]


def test_stop_without_device_stops_all_nagging():
    kitchen = _timer(uid="k", device_id="dev_k", state=timers.STATE_NAGGING)
    living = _timer(uid="l", device_id="dev_l", state=timers.STATE_NAGGING)
    assert timers.nagging_timers_to_stop([kitchen, living], None) == [kitchen, living]


def test_stop_for_device_with_no_nagging_timer_stops_nothing():
    kitchen = _timer(uid="k", device_id="dev_k", state=timers.STATE_NAGGING)
    assert timers.nagging_timers_to_stop([kitchen], "dev_other") == []
