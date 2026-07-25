// Pure logic for btoddb-reminders-card, split out for unit testing (Vitest).

/** Edit scope for a recurring reminder (RM-17). */
export type EditScope = "this" | "future" | "all";

/**
 * True when saving this edit must first ask which occurrences it applies to:
 * only when editing a reminder that was recurring when the edit started and no
 * scope has been chosen yet.
 */
export function needsScopePrompt(
  editingUid: string,
  wasRecurring: boolean,
  scope?: EditScope,
): boolean {
  return !!editingUid && wasRecurring && !scope;
}

/**
 * Build the service data for `btoddb_ha_reminders.create` / `.update` from the
 * add-row form state. When editing with repeat turned off, `rrule: null` is sent
 * explicitly so the engine clears the recurrence. `scope` is only meaningful on
 * update, so it is included only when editing.
 */
export function buildTimeServiceData(opts: {
  message: string;
  when: string;
  rrule: string;
  editingUid: string;
  scope?: EditScope;
}): Record<string, unknown> {
  const data: Record<string, unknown> = {
    message: opts.message,
    when: opts.when,
  };
  if (opts.rrule) data.rrule = opts.rrule;
  if (opts.editingUid && !opts.rrule) data.rrule = null;
  if (opts.editingUid && opts.scope) data.scope = opts.scope;
  return data;
}
