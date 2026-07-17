# Timer card — manage built-in HA timers from Lovelace

**Status:** proposed
**Touches:** card-ux

## Goal

Give timers a dedicated, polished Lovelace card built on Home Assistant's
**built-in `timer` helper** instead of a custom timer engine. Voice ("start a
5 minute timer") is already handled natively by Assist on satellites, and
finish-time actions (announce, push) belong to user automations on the
`timer.finished` event — so the card's only job is a great management UI:
see, start, pause, cancel, and create timers.

This replaces the reverted custom timer feature (#82/#83/#84, removed on this
branch). It is a **separate card** from `btoddb-reminders-card`, following the
`btoddb-calendar-list-card` pattern: its own source file and custom element,
compiled into the same `btoddb-ha-reminders.js` bundle.

## Background: what the built-in `timer` helper provides

- Entities `timer.*` with states `idle` / `active` / `paused` and attributes
  `duration`, `remaining`, and (while active) `finishes_at`.
- Actions `timer.start` (accepts an ad-hoc `duration` override; without one it
  resumes a paused timer or starts at the default), `timer.pause`,
  `timer.cancel`, `timer.finish`, `timer.change`.
- Events `timer.started`, `timer.paused`, `timer.cancelled`, `timer.finished`,
  `timer.restarted`.
- `restore: true` lets a timer survive HA restarts.
- Helpers are a storage collection: WS `timer/create` / `timer/update` /
  `timer/delete` (admin-only) manage them — no YAML, no `.storage` edits.

## Behavior

1. **TC-1 (constraint)** New custom element `btoddb-timer-card` in
   `card/src/timer-card.ts`, registered from `src/index.ts` and advertised in
   `window.customCards`, compiled into the existing single bundle.
2. **TC-2 (constraint)** Config: optional `entities:` list of `timer.*`
   entity_ids (rendered in the given order). When omitted, the card
   auto-discovers every `timer.*` entity visible to the user and sorts per
   TC-8. Optional `title`. Non-`timer.*` entries are ignored with a console
   warning.
3. **TC-3 (constraint)** Each timer renders one row whose controls follow the
   entity state:
   - `idle`: name, default duration (dimmed), **Start**.
   - `active`: name, live countdown, **Pause**, **Cancel**.
   - `paused`: name, frozen `remaining`, **Resume** (`timer.start` with no
     duration), **Cancel**.
4. **TC-4 (constraint)** The live countdown is computed client-side from the
   `finishes_at` attribute (never by polling), and a 1-second re-render tick
   runs **only while at least one active timer is rendered** — idle/paused-only
   cards do no interval work.
5. **TC-5 (suggestion)** Active rows show a slim progress bar (elapsed fraction
   of `duration`); the countdown switches to tenths-free `M:SS` under an hour
   and `H:MM:SS` above.
6. **TC-6 (constraint)** Ad-hoc durations: tapping an idle row's duration opens
   an inline editor (minutes/seconds inputs plus `+1m` / `+5m` / `+10m` chips);
   **Start** then calls `timer.start` with that `duration` override. The
   helper's stored default duration is not modified.
7. **TC-7 (constraint)** When the card observes `timer.finished` for a rendered
   entity (WS event subscription), the row flashes a "Done" treatment for
   ~10 seconds (or until tapped), then returns to its idle rendering. No sound,
   no nag — notification is the job of user automations.
8. **TC-8 (constraint)** Auto-discovered rows sort: active (soonest
   `finishes_at` first), then paused (smallest `remaining` first), then idle
   (alphabetical by friendly name). An explicit `entities:` list keeps its
   configured order.
9. **TC-9 (constraint)** A "＋ New timer" affordance (name + duration,
   `restore: true` default) creates a helper via WS `timer/create`; a row
   overflow menu offers **Delete** via `timer/delete` after a confirm. Both are
   hidden for non-admin users, since those WS commands are admin-only.
10. **TC-10 (suggestion)** A visual config editor (`btoddb-timer-card-editor`)
    offering title and an entity picker list, mirroring the reminders card's
    editor pattern.
11. **TC-11 (constraint)** Pure card logic — duration parsing/formatting,
    countdown math from `finishes_at`, row-state classification, sort order —
    lives in exported functions covered by Vitest.

## UI (only if applicable)

```
┌─ Timers ──────────────────────────── ＋ ┐
│ ● Pasta            08:42  ⏸  ✕          │   active: countdown + progress bar
│ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂░░░░░░░░             │
│ ⏸ Laundry          41:10  ▶  ✕          │   paused: frozen remaining
│ ○ Tea               3:00  ▶      ⋮      │   idle: dimmed default duration
│ ✓ Eggs — Done!                          │   finished flash (~10 s)
└─────────────────────────────────────────┘
```

Built like the existing cards: stock HA web components (`ha-card`, `ha-icon`,
`ha-icon-button`) plus native inputs and Lit — no `custom-card-helpers`.

## Out of scope

- Any integration-side timer code: no services, no storage, no sensor, no
  delivery/nag engine (all removed by the revert this proposal ships with).
- Voice/agent functions and prompt guidance — Assist's built-in timer intents
  cover voice on satellites.
- Finish-time announcements or phone push — user automations on
  `timer.finished` (an example automation in `examples/` may be added later,
  but is not part of this card).
- Changes to `btoddb-reminders-card` or `btoddb-calendar-list-card`.

## Acceptance criteria

- [ ] Card appears in the "Add card" picker; with no config it lists all
      `timer.*` entities sorted per TC-8.
- [ ] Start / pause / resume / cancel round-trip against a real HA timer entity
      and the countdown matches `finishes_at` within 1 s.
- [ ] Ad-hoc start with an inline duration override works and leaves the
      helper's stored duration unchanged.
- [ ] `timer.finished` produces the flash treatment; the card does no
      1-second interval work when nothing is active.
- [ ] Create and delete work for an admin user; both affordances are absent
      for a non-admin user.
- [ ] Vitest covers the TC-11 pure functions; `python3 -m pytest` and
      `scripts/lint` stay green (no Python changes expected).
