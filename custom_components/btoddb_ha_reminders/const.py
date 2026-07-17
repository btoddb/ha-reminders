"""Constants for the Reminders integration."""

from __future__ import annotations

DOMAIN = "btoddb_ha_reminders"

# Config / option keys.
CONF_CALENDAR_NAME = "calendar_name"
CONF_SNOOZE_DURATIONS = "snooze_durations"
# Reserved for a future option (pick an existing calendar vs. component-created).
# v1 is fixed to "internal" — see store.py, which is the swap seam.
CONF_CALENDAR_SOURCE = "calendar_source"

# Defaults.
DEFAULT_CALENDAR_NAME = "BToddB Reminders"
# Snooze durations shown as action buttons on time-based notifications (RM-12).
DEFAULT_SNOOZE_DURATIONS: list[int] = [15, 60]
CALENDAR_SOURCE_INTERNAL = "internal"

# Notification channel passed to btoddb_notifications.send (RM-6). Keeps the
# pre-split Android notification channel name so users' per-channel settings survive
# the migration to btoddb_notifications, which otherwise defaults to its own channel.
NOTIFY_CHANNEL = "BToddB Reminders"

# Notification presentation (RM-6): high-priority delivery so Android delivers
# immediately instead of holding it in Doze until the phone is unlocked. This is now
# owned by the btoddb_notifications integration (NT-3); this component only supplies
# the title and channel.
NOTIFY_TITLE = "⏰ Reminder"

# Keys for the per-entry runtime data dict (holds all three reminder stores).
DATA_STORE = "store"
DATA_LOCATION_STORE = "location_store"
DATA_TIMER_STORE = "timer_store"
DATA_TIMER_DELIVERY = "timer_delivery"

# Storage (.storage/reminders).
STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1

# Location reminders persist separately (.storage/btoddb_ha_reminders_location) so the
# time-based store needs no migration (LOC-4).
STORAGE_KEY_LOCATION = f"{DOMAIN}_location"
STORAGE_VERSION_LOCATION = 1

# Countdown timers persist separately (.storage/btoddb_ha_reminders_timers) so neither
# other store needs migrating when timers change (TM-11, LOC-4 precedent).
STORAGE_KEY_TIMERS = f"{DOMAIN}_timers"
STORAGE_VERSION_TIMERS = 1

# Delivery loop cadence (RM-6): poll every minute, not the calendar trigger.
DELIVERY_INTERVAL_MINUTES = 1

# Notification presentation for a timer that fell back to a phone push (TM-7/TM-8).
NOTIFY_TITLE_TIMER = "⏲️ Timer"

# Notification presentation for a delivered location reminder (LOC-1). Same channel as
# time reminders; only the title differs so the user can tell them apart.
NOTIFY_TITLE_LOCATION = "📍 Reminder"

# A delivered location reminder lingers in the UI this long after it fires (LOC-5),
# then is pruned to bound storage.
LOCATION_RETENTION_DAYS = 7
