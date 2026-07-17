// Pure logic for the `btoddb-timer-card` (TC-11): duration parsing/formatting,
// countdown math from `finishes_at`, and row sort order. No Lit, no DOM, no
// Home Assistant imports — covered by Vitest in timer-logic.test.ts.

/** The subset of a `timer.*` entity the sort and render logic needs. */
export interface TimerRowData {
  entityId: string;
  /** Friendly name (falls back to entity_id at the call site). */
  name: string;
  state: "idle" | "active" | "paused" | string;
  /** The helper's configured default duration, in seconds. */
  durationSec: number;
  /** Frozen `remaining` attribute, in seconds (meaningful when paused). */
  remainingSec: number;
  /** Epoch ms parsed from `finishes_at` (active timers only), else null. */
  finishesAtMs: number | null;
}

/**
 * Parse an HA timer duration string — `"H:MM:SS"`, optionally prefixed like
 * Python timedelta's `"1 day, 2:03:04"` — into whole seconds. Returns 0 for
 * anything unparseable.
 */
export function parseDuration(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value !== "string") return 0;
  const match = value
    .trim()
    .match(/^(?:(\d+)\s+days?,\s*)?(\d+):([0-5]?\d):([0-5]?\d)$/);
  if (!match) return 0;
  const [, days, h, m, s] = match;
  return (
    (days ? parseInt(days, 10) * 86_400 : 0) +
    parseInt(h, 10) * 3_600 +
    parseInt(m, 10) * 60 +
    parseInt(s, 10)
  );
}

const pad = (n: number): string => String(n).padStart(2, "0");

/** Format seconds as the `"H:MM:SS"` string timer service calls expect. */
export function toServiceDuration(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3_600);
  const m = Math.floor((sec % 3_600) / 60);
  const s = sec % 60;
  return `${h}:${pad(m)}:${pad(s)}`;
}

/**
 * Countdown display (TC-5): `M:SS` under an hour (minutes unpadded),
 * `H:MM:SS` at an hour and above.
 */
export function formatCountdown(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  if (sec < 3_600) return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
  return toServiceDuration(sec);
}

/** Whole seconds until `finishesAtMs`, clamped at 0. */
export function secondsRemaining(finishesAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((finishesAtMs - nowMs) / 1_000));
}

/** Elapsed fraction of an active/paused timer, clamped to [0, 1]. */
export function progressFraction(
  durationSec: number,
  remainingSec: number,
): number {
  if (durationSec <= 0) return 0;
  return Math.min(1, Math.max(0, (durationSec - remainingSec) / durationSec));
}

/**
 * Sort order for auto-discovered timers (TC-8): active (soonest `finishes_at`
 * first), then paused (smallest `remaining` first), then idle (alphabetical by
 * name). Unknown states sort last so a broken entity is visible, not hidden.
 */
export function sortTimerRows(rows: TimerRowData[]): TimerRowData[] {
  const rank = (r: TimerRowData): number =>
    r.state === "active" ? 0 : r.state === "paused" ? 1 : r.state === "idle" ? 2 : 3;
  return [...rows].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    if (a.state === "active") {
      return (a.finishesAtMs ?? Infinity) - (b.finishesAtMs ?? Infinity);
    }
    if (a.state === "paused") return a.remainingSec - b.remainingSec;
    return a.name.localeCompare(b.name);
  });
}

/** Split `entities:` config into valid `timer.*` ids and rejected entries (TC-2). */
export function partitionTimerEntities(entities: unknown): {
  valid: string[];
  rejected: string[];
} {
  const valid: string[] = [];
  const rejected: string[] = [];
  if (!Array.isArray(entities)) return { valid, rejected };
  for (const entry of entities) {
    if (typeof entry === "string" && entry.startsWith("timer.")) {
      valid.push(entry);
    } else {
      rejected.push(String(entry));
    }
  }
  return { valid, rejected };
}
