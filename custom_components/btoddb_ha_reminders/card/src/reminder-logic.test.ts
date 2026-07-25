import { describe, expect, it } from "vitest";

import { buildTimeServiceData, needsScopePrompt } from "./reminder-logic";

describe("needsScopePrompt", () => {
  it("prompts when editing a recurring reminder with no scope chosen", () => {
    expect(needsScopePrompt("uid1", true)).toBe(true);
  });

  it("does not prompt when creating", () => {
    expect(needsScopePrompt("", true)).toBe(false);
  });

  it("does not prompt when the reminder was not recurring", () => {
    expect(needsScopePrompt("uid1", false)).toBe(false);
  });

  it("does not prompt again once a scope was chosen", () => {
    expect(needsScopePrompt("uid1", true, "this")).toBe(false);
    expect(needsScopePrompt("uid1", true, "future")).toBe(false);
    expect(needsScopePrompt("uid1", true, "all")).toBe(false);
  });
});

describe("buildTimeServiceData", () => {
  const base = { message: "water plants", when: "2026-07-25T18:00" };

  it("creates without rrule or scope", () => {
    expect(
      buildTimeServiceData({ ...base, rrule: "", editingUid: "" }),
    ).toEqual({ message: "water plants", when: "2026-07-25T18:00" });
  });

  it("includes the rrule when repeat is on", () => {
    expect(
      buildTimeServiceData({ ...base, rrule: "FREQ=DAILY", editingUid: "" }),
    ).toEqual({ ...base, rrule: "FREQ=DAILY" });
  });

  it("clears the rrule explicitly when editing with repeat off", () => {
    expect(
      buildTimeServiceData({ ...base, rrule: "", editingUid: "uid1" }),
    ).toEqual({ ...base, rrule: null });
  });

  it("passes the chosen scope only when editing", () => {
    expect(
      buildTimeServiceData({
        ...base,
        rrule: "FREQ=DAILY",
        editingUid: "uid1",
        scope: "this",
      }),
    ).toEqual({ ...base, rrule: "FREQ=DAILY", scope: "this" });
    expect(
      buildTimeServiceData({ ...base, rrule: "", editingUid: "", scope: "all" }),
    ).toEqual(base);
  });
});
