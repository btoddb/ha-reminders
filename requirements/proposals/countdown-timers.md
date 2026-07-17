# Countdown timers ("start a 5 minute timer")

Implement https://github.com/btoddb/ha-reminders/issues/79

**Status:** proposed
**Touches:** time-based | card-ux *(new timer area; time-based reminders RM-* unaffected)*

## Goal

Say "start a 5 minute timer" to a voice satellite (or type one into the dashboard
card) and, when it reaches zero, have an alarm **nag like a kitchen timer** on the
device that heard the request until the user says "stop timer" or cancels it from
the card. Timers are a third reminder kind alongside time-based (RM-*) and
location (LOC-*) reminders: short-lived, second-precision, device-targeted, and
loud until acknowledged.

Rule IDs below are tentative `TM-*`; they become stable spec IDs when this ships.

## Behavior

### Creating a timer

1. **TM-1 (constraint).** A new `btoddb_ha_reminders.create_timer` service accepts
   `duration_seconds` (required, positive integer), optional `label` (e.g. "pasta"),
   and optional `device_id` — the device that heard the request. The component
   computes `now() + duration` itself; the caller never does clock arithmetic
   (same rationale as RM-4a). Natural-language parsing ("five and a half minutes")
   stays with the conversation agent, exactly as for RM-* reminders.
2. **TM-2 (constraint).** The originating device is resolved in this order:
   explicit `device_id` parameter, then `ServiceCall.context` when the call came
   through Assist (the satellite's device), then no device. The resolved target is
   persisted with the timer. `examples/` gains a `create_timer` agent function +
   prompt snippet that forwards the satellite `device_id`, and `test_examples.py`
   keeps it in sync.
3. **TM-3 (constraint).** `create_timer` returns response data
   (`{success, message, finishes_at, confirmation}`) with a spoken-language
   confirmation ("Timer set for 5 minutes"), same contract and rationale as RM-9.
4. **TM-4.** Multiple timers may run concurrently (kitchen reality: pasta + oven).
   Each gets its own uid and its own target device.

### Firing and nagging

5. **TM-5 (constraint).** A timer fires **at its due second**, not on the minute
   poll: each timer is armed with its own point-in-time listener
   (`async_track_point_in_time`), independent of the RM-6/RM-7 watermark loop. A
   30-second timer must ring ~30 seconds after creation, not up to a minute late.
6. **TM-6 (constraint).** When a timer reaches zero it **nags**: the alarm plays on
   the timer's target device and **repeats on an interval until stopped or
   cancelled** — like a kitchen timer or alarm clock, not a single chime.
   **suggestion:** repeat roughly every 15–30 seconds; announcement text includes
   the label ("Your pasta timer is done").
7. **TM-7 (constraint).** The alarm is delivered to the **originating device** via
   `assist_satellite.announce` (with a chime/alarm sound) targeted at the stored
   device. If the timer has no target device or the announce call fails, fall back
   to a `btoddb_notifications.send` push (title "⏲️ Timer") so the alarm is never
   silently dropped.
8. **TM-8 (constraint).** Nagging is **capped** (suggestion: ~10 minutes of nagging).
   When the cap is reached without acknowledgement, the nag stops and a fallback
   `btoddb_notifications.send` push is sent so an unheard timer still reaches the
   user's phone.

### Stopping and cancelling

9. **TM-9 (constraint).** A new `btoddb_ha_reminders.stop_timer` service silences a
   nagging timer. Saying **"stop timer"** to a satellite must stop the nag; the
   agent function forwards the satellite `device_id`, and with no uid given the
   service stops the currently-nagging timer(s) for that device (or all nagging
   timers when no device is resolvable). Stopping a nag completes the timer; it
   does not affect other pending timers.
10. **TM-10 (constraint).** A pending (not yet fired) timer can be **cancelled** by
    uid via `btoddb_ha_reminders.cancel_timer` — from the card or by voice ("cancel
    the pasta timer"; the agent picks the uid from the active-timer list). Calling
    `cancel_timer` on a timer that is already nagging behaves like `stop_timer`,
    so the card's one cancel button works before **and** after zero.

### Storage and restart

11. **TM-11.** Timers persist in their **own** `Store`
    (`.storage/btoddb_ha_reminders_timers`), separate from the RM-* and LOC-*
    stores so none needs migrating when another changes (LOC-4 precedent). Timer
    engine logic (due math, nag scheduling decisions, spoken durations) lives in a
    **pure, HA-free module** unit-tested under plain pytest, like `delivery.py`.
12. **TM-12 (constraint).** On Home Assistant start, pending timers are re-armed
    from the store. A timer that expired **while HA was down** starts nagging
    immediately on startup (with "went off N minutes ago" wording, suggestion),
    subject to the TM-8 cap measured from the original due time — a timer that is
    long past its cap window falls back to the phone push instead of ringing.
13. **TM-13.** Completed/stopped/cancelled timers are removed from the store (no
    7-day retention — unlike LOC-5, a finished kitchen timer has no review value).
    **suggestion:** keep the most recent handful in the sensor attributes briefly
    so the card can show "finished" state transitions cleanly.

### Read surface

14. **TM-14.** Active timers are surfaced through a new
    `sensor.btoddb_timers` entity: state = count of running/nagging timers,
    attributes = the full list (uid, label, target device, created_at,
    finishes_at, state: running | nagging). The card computes the live countdown
    client-side from `finishes_at` — the sensor does **not** update every second.

## UI

The existing dashboard card gains a **Timers** tab (alongside time-based and
location reminders — LOC proposal precedent of one card, per-kind tabs):

- **Create by typing:** duration entry (minutes/seconds), optional label, and a
  target-device picker listing `assist_satellite` devices (suggestion: default to
  the last-used device; "phone notification only" is a valid choice → no device).
- **Live list:** running timers with label, target device, and **actively updating
  time remaining** (client-side 1-second tick from `finishes_at`, per TM-14 — same
  re-render-on-entity-update pattern as LOC-6, plus a local interval).
- **Nagging state:** a timer past zero shows as ringing/nagging, visually distinct.
- **Cancel/stop:** every row has a cancel button that works before firing
  (cancels) and while nagging (silences) — one button, TM-10 semantics.

Card version bumps independently via `scripts/deploy-card` per the two-version
rule in `ai-rules/PROJECT_CONTEXT.md`.

## Out of scope

- **Pause/resume** of a running timer.
- **Natural-language parsing** of durations — stays with the conversation agent
  (spec preamble; RM-1..RM-4 live with the deployment).
- **Custom alarm sounds / media_player-based alarms** — v1 uses
  `assist_satellite.announce`; a fancier TTS/media pipeline can slot in behind
  TM-7 later without reshaping the model.
- Changing anything about RM-* or LOC-* behavior, storage, or delivery.
- Timers on devices other than the originating satellite ("start a timer in the
  kitchen" from the living room) — the stored `device_id` field doesn't preclude
  it later.

## Acceptance criteria

- [ ] "Start a 5 minute timer" to a Living Room satellite → that satellite (and
      only that one) starts alarming ~5:00 later, second-precision (TM-1/2/5/7).
- [ ] The alarm repeats until acknowledged (TM-6) and stops on "stop timer"
      spoken to the satellite (TM-9).
- [ ] Nag cap reached without acknowledgement → nag stops, phone push arrives
      (TM-8).
- [ ] Timer created with no resolvable device → phone push at zero, no crash
      (TM-7 fallback).
- [ ] Two concurrent timers on different devices fire independently (TM-4).
- [ ] Card: type in a 90-second timer with a label, watch remaining time count
      down live, cancel it before zero → it never fires; cancel a nagging timer →
      it silences (TM-10, UI).
- [ ] Restart HA with a pending timer → it still fires on time; restart with a
      timer that expired during downtime → it nags immediately (TM-12).
- [ ] Engine pure-logic tests pass with no HA installed (`python3 -m pytest`),
      and `test_examples.py` covers the new agent functions (TM-2/11).
