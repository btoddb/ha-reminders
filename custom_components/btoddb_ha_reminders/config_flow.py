"""
Config flow for the Reminders integration.

A single config entry. Setup asks only for the calendar name; the notify target that
the delivery loop pushes to now lives in the BToddB Notifications integration (issue
#72), not here. ``calendar_source`` is reserved for a future option (pick an existing
calendar vs. component-created) and is fixed to "internal" in v1.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_CALENDAR_NAME,
    CONF_SNOOZE_DURATIONS,
    DEFAULT_CALENDAR_NAME,
    DEFAULT_SNOOZE_DURATIONS,
    DOMAIN,
)


def _user_schema(default_name: str) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_CALENDAR_NAME, default=default_name): vol.All(
                selector.TextSelector(), vol.Length(min=1)
            ),
        }
    )


def _snooze_durations_to_str(durations: list[int]) -> str:
    """Convert a list of snooze durations to a comma-separated display string."""
    return ", ".join(str(d) for d in durations)


def _coerce_snooze_durations(value: object) -> list[int]:
    """Validate and coerce a comma-separated string or list to ``list[int]``."""
    if isinstance(value, list):
        tokens: list[object] = value
    elif isinstance(value, str):
        tokens = [v.strip() for v in value.split(",") if v.strip()]
    else:
        msg = f"Expected string or list, got {type(value).__name__}"
        raise vol.Invalid(msg)
    try:
        result = [int(v) for v in tokens]
    except (TypeError, ValueError) as err:
        msg = "Enter whole numbers separated by commas (e.g. 15, 60)."
        raise vol.Invalid(msg) from err
    if not result:
        msg = "Enter at least one snooze duration in minutes."
        raise vol.Invalid(msg)
    if any(v < 1 for v in result):
        msg = "All snooze durations must be at least 1 minute."
        raise vol.Invalid(msg)
    return result


def _options_schema(default_snooze: str) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(
                CONF_SNOOZE_DURATIONS, default=default_snooze
            ): selector.TextSelector(),
        }
    )


class RemindersConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the (only) setup step: pick the calendar name."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            title = user_input[CONF_CALENDAR_NAME]
            return self.async_create_entry(title=title, data=user_input)
        return self.async_show_form(
            step_id="user",
            data_schema=_user_schema(DEFAULT_CALENDAR_NAME),
        )

    @staticmethod
    @callback
    def async_get_options_flow(_config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow handler (snooze durations is its only field)."""
        return RemindersOptionsFlow()


class RemindersOptionsFlow(OptionsFlow):
    """Allow changing the snooze durations after setup."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the (only) options step: change snooze durations."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                snooze_durations = _coerce_snooze_durations(
                    user_input[CONF_SNOOZE_DURATIONS]
                )
            except vol.Invalid:
                errors[CONF_SNOOZE_DURATIONS] = "invalid_snooze_durations"
            else:
                return self.async_create_entry(
                    title="",
                    data={CONF_SNOOZE_DURATIONS: snooze_durations},
                )
        # Existing entries may still carry a "notify_service" key in data/options from
        # before issue #72's extraction; it is simply ignored now.
        current_durations: list[int] = self.config_entry.options.get(
            CONF_SNOOZE_DURATIONS
        ) or self.config_entry.data.get(CONF_SNOOZE_DURATIONS, DEFAULT_SNOOZE_DURATIONS)
        return self.async_show_form(
            step_id="init",
            data_schema=_options_schema(_snooze_durations_to_str(current_durations)),
            errors=errors,
        )
