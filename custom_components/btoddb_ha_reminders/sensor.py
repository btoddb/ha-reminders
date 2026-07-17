"""
Sensor platform — location reminders (LOC-6) and countdown timers (TM-14).

Read surfaces the dashboard card consumes: each sensor's state is a count and its
attributes hold the full list. The card reads the lists straight off the entity
attributes and re-renders when the entity updates — the same "watch ``last_updated``"
pattern it already uses for the calendar entity, so no extra REST/websocket round-trip
is needed. The timers sensor does **not** tick every second; the card computes the live
countdown client-side from each timer's ``finishes_at`` (TM-14).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.sensor import SensorEntity

from .const import DATA_LOCATION_STORE, DATA_TIMER_STORE, DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from .location_store import LocationReminderStore
    from .timer_store import TimerStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the location-reminders and timers sensor entities from a config entry."""
    data = hass.data[DOMAIN][entry.entry_id]
    store: LocationReminderStore = data[DATA_LOCATION_STORE]
    timer_store: TimerStore = data[DATA_TIMER_STORE]
    async_add_entities(
        [LocationRemindersSensor(store, entry), TimersSensor(timer_store, entry)]
    )


class LocationRemindersSensor(SensorEntity):
    """Exposes location reminders to the card via state (count) + attributes (list)."""

    _attr_has_entity_name = False
    _attr_name = "BToddB Location Reminders"
    _attr_icon = "mdi:map-marker-radius"
    _attr_should_poll = False

    def __init__(self, store: LocationReminderStore, entry: ConfigEntry) -> None:
        """Initialize bound to the location store and owning config entry."""
        self._store = store
        self._attr_unique_id = f"{entry.entry_id}_location"

    async def async_added_to_hass(self) -> None:
        """Refresh the entity whenever the store changes."""
        self.async_on_remove(self._store.async_add_listener(self.async_write_ha_state))

    @property
    def native_value(self) -> int:
        """Count of undelivered location reminders."""
        return sum(1 for e in self._store.events if e.delivered_at is None)

    @property
    def extra_state_attributes(self) -> dict:
        """The full reminder list (undelivered + delivered-within-retention)."""
        return {
            # Stable marker so the card can find this sensor even if it's renamed in the
            # entity registry, instead of hard-coding the default entity_id.
            "btoddb_ha_reminders_location": True,
            "reminders": [
                {
                    "uid": e.uid,
                    "summary": e.summary,
                    "person": e.person,
                    "zone": e.zone,
                    "trigger": e.trigger,
                    "delivered_at": (
                        e.delivered_at.isoformat() if e.delivered_at else None
                    ),
                    "persistent": e.persistent,
                }
                for e in self._store.events
            ],
        }


class TimersSensor(SensorEntity):
    """Exposes countdown timers to the card via state (count) + attributes (TM-14)."""

    _attr_has_entity_name = False
    _attr_name = "BToddB Timers"
    _attr_icon = "mdi:timer-outline"
    _attr_should_poll = False

    def __init__(self, store: TimerStore, entry: ConfigEntry) -> None:
        """Initialize bound to the timer store and owning config entry."""
        self._store = store
        self._attr_unique_id = f"{entry.entry_id}_timers"

    async def async_added_to_hass(self) -> None:
        """Refresh the entity whenever the store changes."""
        self.async_on_remove(self._store.async_add_listener(self.async_write_ha_state))

    @property
    def native_value(self) -> int:
        """Count of running/nagging timers."""
        return len(self._store.timers)

    @property
    def extra_state_attributes(self) -> dict:
        """The full timer list; the card derives the live countdown client-side."""
        return {
            # Stable marker so the card can find this sensor even if it's renamed in
            # the entity registry, instead of hard-coding the default entity_id.
            "btoddb_ha_reminders_timers": True,
            "timers": [
                {
                    "uid": t.uid,
                    "label": t.label,
                    "device_id": t.device_id,
                    "duration_seconds": t.duration_seconds,
                    "created_at": t.created_at.isoformat(),
                    "finishes_at": t.finishes_at.isoformat(),
                    "state": t.state,
                }
                for t in self._store.timers
            ],
        }
