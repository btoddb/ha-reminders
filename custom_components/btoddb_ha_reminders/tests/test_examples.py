"""Regression checks for copy-paste conversation-agent examples."""

from __future__ import annotations

from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]


def _load_example(name: str) -> list[dict]:
    return yaml.safe_load((ROOT / "examples" / name).read_text())


def test_create_reminder_function_exposes_and_forwards_rrule():
    """Voice recurring reminders need rrule in the typed function contract."""
    function = _load_example("create_reminder.function.yaml")[0]

    properties = function["spec"]["parameters"]["properties"]
    service_data = function["function"]["sequence"][0]["data"]

    assert "rrule" in properties
    assert "FREQ=DAILY" in properties["rrule"]["description"]
    assert "FREQ=WEEKLY;BYDAY=MO" in properties["rrule"]["description"]
    assert function["spec"]["parameters"]["required"] == ["message"]
    assert service_data["rrule"] == "{{ rrule }}"


def test_create_reminder_function_exposes_monthly_rrule_forms():
    """Monthly RRULE forms must appear in the function schema so models use them."""
    function = _load_example("create_reminder.function.yaml")[0]

    spec_desc = function["spec"]["description"]
    rrule_desc = function["spec"]["parameters"]["properties"]["rrule"]["description"]

    # Fixed day-of-month
    assert "FREQ=MONTHLY;BYMONTHDAY=15" in spec_desc
    assert "FREQ=MONTHLY;BYMONTHDAY=15" in rrule_desc
    # Last day of month
    assert "FREQ=MONTHLY;BYMONTHDAY=-1" in spec_desc
    assert "FREQ=MONTHLY;BYMONTHDAY=-1" in rrule_desc
    # Ordinal weekday (first Friday)
    assert "FREQ=MONTHLY;BYDAY=1FR" in spec_desc
    assert "FREQ=MONTHLY;BYDAY=1FR" in rrule_desc
    # Last-ordinal prefix documented
    assert "-1" in rrule_desc


def test_prompt_examples_tell_agent_to_use_rrule_for_recurring_reminders():
    for prompt_name in ("prompt-snippet.txt", "prompt-actual.txt"):
        prompt = (ROOT / "examples" / prompt_name).read_text()

        assert "call create_reminder with rrule" in prompt
        assert "FREQ=DAILY" in prompt
        assert "FREQ=WEEKLY;BYDAY=MO" in prompt


def test_prompt_examples_teach_monthly_rrule_forms():
    """All three MONTHLY RRULE forms must appear in both prompt files."""
    for prompt_name in ("prompt-snippet.txt", "prompt-actual.txt"):
        prompt = (ROOT / "examples" / prompt_name).read_text()

        # Fixed day-of-month
        assert "FREQ=MONTHLY;BYMONTHDAY=15" in prompt, (
            f"{prompt_name}: missing BYMONTHDAY=15 example"
        )
        # Last day of month
        assert "FREQ=MONTHLY;BYMONTHDAY=-1" in prompt, (
            f"{prompt_name}: missing BYMONTHDAY=-1 example"
        )
        # Ordinal weekday
        assert "FREQ=MONTHLY;BYDAY=1FR" in prompt, (
            f"{prompt_name}: missing ordinal weekday BYDAY=1FR example"
        )
        # INTERVAL guidance present for monthly
        assert "FREQ=MONTHLY" in prompt, f"{prompt_name}: missing FREQ=MONTHLY"


def test_create_timer_function_forwards_duration_label_and_device():
    """Voice timers need duration/label/device_id in the typed function contract."""
    function = _load_example("create_timer.function.yaml")[0]

    properties = function["spec"]["parameters"]["properties"]
    service_data = function["function"]["sequence"][0]["data"]

    assert function["spec"]["name"] == "create_timer"
    assert set(properties) == {"duration_seconds", "label", "device_id"}
    assert function["spec"]["parameters"]["required"] == ["duration_seconds"]
    assert service_data["duration_seconds"] == "{{ duration_seconds }}"
    assert service_data["label"] == "{{ label }}"
    # TM-2: the alarm targets the device that heard the request.
    assert service_data["device_id"] == "{{ device_id }}"
    assert function["function"]["sequence"][0]["response_variable"] == (
        "_function_result"
    )


def test_stop_timer_function_forwards_device():
    """Ensure "stop timer" silences the alarm on the device that heard it (TM-9)."""
    function = _load_example("stop_timer.function.yaml")[0]

    properties = function["spec"]["parameters"]["properties"]
    service_data = function["function"]["sequence"][0]["data"]

    assert function["spec"]["name"] == "stop_timer"
    assert set(properties) == {"uid", "device_id"}
    assert function["spec"]["parameters"]["required"] == []
    assert service_data["device_id"] == "{{ device_id }}"
    assert function["function"]["sequence"][0]["response_variable"] == (
        "_function_result"
    )


def test_prompt_examples_teach_timers_and_forward_the_current_device():
    """Both prompt files must expose current_device_id and route timers through it."""
    for prompt_name in ("prompt-snippet.txt", "prompt-actual.txt"):
        prompt = (ROOT / "examples" / prompt_name).read_text()

        assert "{{ current_device_id }}" in prompt, (
            f"{prompt_name}: missing current_device_id"
        )
        assert "call create_timer with duration_seconds" in prompt, (
            f"{prompt_name}: missing create_timer guidance"
        )
        assert "stop_timer" in prompt, f"{prompt_name}: missing stop_timer guidance"


def test_cancel_timer_function_forwards_label_and_uid():
    """Voice cancels resolve by spoken label, uid only as fallback (TM-10)."""
    function = _load_example("cancel_timer.function.yaml")[0]

    properties = function["spec"]["parameters"]["properties"]
    service_data = function["function"]["sequence"][0]["data"]

    assert function["spec"]["name"] == "cancel_timer"
    assert set(properties) == {"label", "uid"}
    assert function["spec"]["parameters"]["required"] == []
    assert service_data["label"] == "{{ label }}"
    assert service_data["uid"] == "{{ uid }}"
    assert function["function"]["sequence"][0]["response_variable"] == (
        "_function_result"
    )


def test_prompt_examples_teach_cancel_and_list_active_timers():
    """Cancel guidance + a live uid list must appear in both prompt files (TM-10)."""
    for prompt_name in ("prompt-snippet.txt", "prompt-actual.txt"):
        prompt = (ROOT / "examples" / prompt_name).read_text()

        assert "call cancel_timer with label" in prompt, (
            f"{prompt_name}: missing cancel_timer guidance"
        )
        assert "state_attr('sensor.btoddb_timers', 'timers')" in prompt, (
            f"{prompt_name}: missing live active-timer list"
        )
