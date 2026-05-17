import { describe, expect, it } from "vitest";

import {
  DECISION_ENTRIES,
  getActiveDecisions,
  isDecisionPublished,
} from "./decisions";

describe("decision publish gate", () => {
  it("treats an entry shipped in the past as published", () => {
    const entry = DECISION_ENTRIES.find((e) => e.shippedAt <= "2026-05-15");
    if (!entry) throw new Error("expected at least one past entry");
    expect(isDecisionPublished(entry, new Date("2026-05-17T00:00:00Z"))).toBe(true);
  });

  it("treats an entry with a future shippedAt as not yet published", () => {
    const entry: (typeof DECISION_ENTRIES)[number] = {
      ...DECISION_ENTRIES[0]!,
      slug: "test-future-entry",
      shippedAt: "2099-01-01",
    };
    expect(isDecisionPublished(entry, new Date("2026-05-17T00:00:00Z"))).toBe(false);
  });

  it("getActiveDecisions monotonically grows as the date advances", () => {
    const earlier = getActiveDecisions(new Date("2026-05-12T00:00:00Z")).length;
    const later = getActiveDecisions(new Date("2026-05-25T23:59:59Z")).length;
    expect(later).toBeGreaterThanOrEqual(earlier);
    expect(later).toBe(DECISION_ENTRIES.length);
  });

  it("active count today matches the day's drip schedule", () => {
    const today = new Date("2026-05-17T12:00:00Z");
    const active = getActiveDecisions(today);
    expect(active.length).toBe(86);
    expect(active.every((e) => e.shippedAt <= "2026-05-17")).toBe(true);
  });
});
