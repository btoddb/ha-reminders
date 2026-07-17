# Timer card — `btoddb-timer-card`

Shipped in v0.8.3. Manages Home Assistant's **built-in `timer` helpers** from
Lovelace: see, start, pause, cancel, and (for admins) create/delete timers.
There is **no integration-side timer code** — the custom timer engine that
briefly shipped in v0.8.0/v0.8.1 was reverted in v0.8.2. Voice timers are
handled by Assist's built-in intents on the satellites (see
[`examples/timers.yaml`](../../examples/timers.yaml) for the custom sentence
that adds the name-first "set a pasta timer for 30 seconds" phrasing);
finish-time actions (announce, push) belong to user automations on the
`timer.finished` event.

Source: `card/src/timer-card.ts` (element + editor) and
`card/src/timer-logic.ts` (pure logic), compiled into the shared
`btoddb-ha-reminders.js` bundle alongside the other two cards.

## Rules

- **TC-1 (constraint)** Custom element `btoddb-timer-card` lives in
  `card/src/timer-card.ts`, is registered from `src/index.ts`, advertised in
  `window.customCards`, and compiles into the existing single bundle.
- **TC-2 (constraint)** Config: optional `entities:` list of `timer.*`
  entity_ids (rendered in the given order). When omitted, the card
  auto-discovers every `timer.*` entity visible to the user and sorts per
  TC-8. Optional `title` (default "Timers"). Non-`timer.*` entries are ignored
  with a console warning.
- **TC-3 (constraint)** Each timer renders one row whose controls follow the
  entity state:
  - `idle`: name, default duration (dimmed, tappable per TC-6), **Start**.
  - `active`: name, live countdown, **Pause**, **Cancel**.
  - `paused`: name, frozen `remaining`, **Resume** (`timer.start` with no
    duration), **Cancel**.
- **TC-4 (constraint)** The live countdown is computed client-side from the
  `finishes_at` attribute (never by polling), and a 1-second re-render tick
  runs **only while at least one active timer is rendered** — idle/paused-only
  cards do no interval work.
- **TC-5** Active rows show a slim progress bar (elapsed fraction of
  `duration`); the countdown renders as `M:SS` under an hour (minutes
  unpadded) and `H:MM:SS` at an hour and above.
- **TC-6 (constraint)** Ad-hoc durations: tapping an idle row's duration opens
  an inline editor (minutes/seconds inputs plus `+1m` / `+5m` / `+10m` chips);
  **Start** then calls `timer.start` with that `duration` override. The
  helper's stored default duration is not modified.
- **TC-7 (constraint)** When the card observes a `timer.finished` event for a
  rendered entity (WS event subscription), the row shows a pulsing "Done"
  treatment for ~10 seconds (or until tapped), then returns to its idle
  rendering. No sound, no nag — notification is the job of user automations.
- **TC-8 (constraint)** Auto-discovered rows sort: active (soonest
  `finishes_at` first), then paused (smallest `remaining` first), then idle
  (alphabetical by friendly name); unknown states (e.g. `unavailable`) sort
  last so a broken entity stays visible. An explicit `entities:` list keeps
  its configured order.
- **TC-9 (constraint)** For admin users (`hass.user.is_admin`) only: a
  ＋ header button creates a helper via WS `timer/create` (name + duration,
  `restore: true`), and an idle-row ⋮ menu offers **Delete** after a
  `confirm()` — resolved via `config/entity_registry/get` → `unique_id` →
  `timer/delete`, so YAML-defined timers fail with an explanatory error.
  Non-admin users see neither affordance (those WS commands are admin-only).
- **TC-10** Visual config editor (`btoddb-timer-card-editor`): title field
  plus a grow-as-you-type list of `timer` entity pickers; an empty list is
  stored as no `entities:` key (auto-discover).
- **TC-11 (constraint)** Pure card logic — duration parsing (`H:MM:SS` and
  timedelta `"N days, H:MM:SS"` forms), countdown formatting and math from
  `finishes_at`, progress fraction, sort order, config partition — lives in
  exported functions in `card/src/timer-logic.ts`, covered by Vitest
  (`npm test` from `card/`).

## Out of scope

- Integration-side timer code: no services, no storage, no sensor, no
  delivery/nag engine.
- Voice/agent functions and prompt guidance — Assist's built-in timer intents
  cover voice; the LLM agent's prompt guards timer requests from becoming
  reminders.
- Finish-time announcements or phone push — user automations on
  `timer.finished`.
