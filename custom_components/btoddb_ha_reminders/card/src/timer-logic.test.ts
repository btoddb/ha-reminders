import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  parseDuration,
  partitionTimerEntities,
  progressFraction,
  secondsRemaining,
  sortTimerRows,
  toServiceDuration,
  type TimerRowData,
} from "./timer-logic";

describe("parseDuration", () => {
  it("parses H:MM:SS", () => {
    expect(parseDuration("0:05:00")).toBe(300);
    expect(parseDuration("1:02:03")).toBe(3723);
    expect(parseDuration("12:00:00")).toBe(43200);
  });

  it("parses timedelta day prefixes", () => {
    expect(parseDuration("1 day, 0:00:00")).toBe(86400);
    expect(parseDuration("2 days, 1:00:30")).toBe(2 * 86400 + 3630);
  });

  it("accepts numeric seconds", () => {
    expect(parseDuration(90)).toBe(90);
    expect(parseDuration(90.9)).toBe(90);
  });

  it("returns 0 for garbage", () => {
    expect(parseDuration(undefined)).toBe(0);
    expect(parseDuration(null)).toBe(0);
    expect(parseDuration("")).toBe(0);
    expect(parseDuration("soon")).toBe(0);
    expect(parseDuration("0:99:00")).toBe(0);
    expect(parseDuration(NaN)).toBe(0);
  });
});

describe("toServiceDuration", () => {
  it("formats H:MM:SS", () => {
    expect(toServiceDuration(300)).toBe("0:05:00");
    expect(toServiceDuration(3723)).toBe("1:02:03");
    expect(toServiceDuration(0)).toBe("0:00:00");
  });

  it("clamps negatives to zero", () => {
    expect(toServiceDuration(-5)).toBe("0:00:00");
  });
});

describe("formatCountdown", () => {
  it("uses M:SS under an hour, minutes unpadded", () => {
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(59)).toBe("0:59");
    expect(formatCountdown(300)).toBe("5:00");
    expect(formatCountdown(3599)).toBe("59:59");
  });

  it("uses H:MM:SS from an hour up", () => {
    expect(formatCountdown(3600)).toBe("1:00:00");
    expect(formatCountdown(3723)).toBe("1:02:03");
  });

  it("clamps negatives to zero", () => {
    expect(formatCountdown(-10)).toBe("0:00");
  });
});

describe("secondsRemaining", () => {
  it("rounds up to whole seconds", () => {
    const now = 1_000_000;
    expect(secondsRemaining(now + 5_000, now)).toBe(5);
    expect(secondsRemaining(now + 4_001, now)).toBe(5);
  });

  it("clamps past finish times to zero", () => {
    expect(secondsRemaining(1_000, 5_000)).toBe(0);
  });
});

describe("progressFraction", () => {
  it("reports elapsed fraction", () => {
    expect(progressFraction(100, 75)).toBe(0.25);
    expect(progressFraction(100, 0)).toBe(1);
    expect(progressFraction(100, 100)).toBe(0);
  });

  it("clamps out-of-range inputs", () => {
    expect(progressFraction(0, 10)).toBe(0);
    expect(progressFraction(100, 150)).toBe(0);
    expect(progressFraction(100, -5)).toBe(1);
  });
});

const row = (over: Partial<TimerRowData>): TimerRowData => ({
  entityId: "timer.x",
  name: "X",
  state: "idle",
  durationSec: 60,
  remainingSec: 60,
  finishesAtMs: null,
  ...over,
});

describe("sortTimerRows", () => {
  it("orders active by finishes_at, then paused by remaining, then idle by name", () => {
    const rows = [
      row({ entityId: "timer.tea", name: "Tea", state: "idle" }),
      row({ entityId: "timer.p2", name: "P2", state: "paused", remainingSec: 500 }),
      row({ entityId: "timer.a2", name: "A2", state: "active", finishesAtMs: 9_000 }),
      row({ entityId: "timer.bread", name: "Bread", state: "idle" }),
      row({ entityId: "timer.a1", name: "A1", state: "active", finishesAtMs: 4_000 }),
      row({ entityId: "timer.p1", name: "P1", state: "paused", remainingSec: 20 }),
    ];
    expect(sortTimerRows(rows).map((r) => r.entityId)).toEqual([
      "timer.a1",
      "timer.a2",
      "timer.p1",
      "timer.p2",
      "timer.bread",
      "timer.tea",
    ]);
  });

  it("sorts unknown states last and does not mutate its input", () => {
    const rows = [
      row({ entityId: "timer.bad", state: "unavailable" }),
      row({ entityId: "timer.ok", state: "idle" }),
    ];
    const sorted = sortTimerRows(rows);
    expect(sorted.map((r) => r.entityId)).toEqual(["timer.ok", "timer.bad"]);
    expect(rows.map((r) => r.entityId)).toEqual(["timer.bad", "timer.ok"]);
  });

  it("sorts active timers missing finishes_at after those with one", () => {
    const rows = [
      row({ entityId: "timer.nofin", state: "active", finishesAtMs: null }),
      row({ entityId: "timer.fin", state: "active", finishesAtMs: 1_000 }),
    ];
    expect(sortTimerRows(rows).map((r) => r.entityId)).toEqual([
      "timer.fin",
      "timer.nofin",
    ]);
  });
});

describe("partitionTimerEntities", () => {
  it("keeps timer.* strings and rejects everything else", () => {
    expect(
      partitionTimerEntities(["timer.tea", "light.kitchen", 42, "timer.pasta"]),
    ).toEqual({
      valid: ["timer.tea", "timer.pasta"],
      rejected: ["light.kitchen", "42"],
    });
  });

  it("handles missing config", () => {
    expect(partitionTimerEntities(undefined)).toEqual({ valid: [], rejected: [] });
  });
});
