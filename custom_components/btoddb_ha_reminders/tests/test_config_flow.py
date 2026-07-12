"""Tests for the Reminders config and options flows."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import config_validation as cv
from voluptuous_serialize import convert

from custom_components.btoddb_ha_reminders import config_flow
from custom_components.btoddb_ha_reminders.const import CONF_SNOOZE_DURATIONS


@pytest.fixture
def options_flow(monkeypatch: pytest.MonkeyPatch) -> config_flow.RemindersOptionsFlow:
    """Return an options flow linked to a minimal config entry."""
    entry = SimpleNamespace(options={}, data={})
    monkeypatch.setattr(
        config_flow.RemindersOptionsFlow,
        "config_entry",
        property(lambda _self: entry),
    )
    return config_flow.RemindersOptionsFlow()


def test_options_form_schema_is_serializable(options_flow):
    """The options form must be serializable for the Home Assistant frontend."""
    result = asyncio.run(options_flow.async_step_init())

    assert result["type"] is FlowResultType.FORM
    convert(result["data_schema"], custom_serializer=cv.custom_serializer)


def test_options_flow_stores_validated_durations(options_flow):
    """Valid comma-separated durations are stored as integers."""
    result = asyncio.run(
        options_flow.async_step_init({CONF_SNOOZE_DURATIONS: "15, 60"})
    )

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_SNOOZE_DURATIONS: [15, 60]}


def test_options_flow_rejects_invalid_durations(options_flow):
    """Invalid durations redisplay the form with a field error."""
    result = asyncio.run(
        options_flow.async_step_init({CONF_SNOOZE_DURATIONS: "0, later"})
    )

    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_SNOOZE_DURATIONS: "invalid_snooze_durations"}
