import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("redis", () => ({
  createClient: vi.fn(),
}));

import { quotaResetAt, type RateRejectReason } from "./rateLimit";

describe("quotaResetAt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the next UTC midnight for daily quota reasons", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T10:15:30Z"));

    for (const reason of ["ip", "user", "global"] satisfies RateRejectReason[]) {
      const resetAt = quotaResetAt(reason);
      expect(resetAt).toBe(Date.UTC(2026, 4, 12, 0, 0, 0) / 1000);
    }
  });

  it("returns the first day of the next month for pro quota reasons", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T10:15:30Z"));

    expect(quotaResetAt("pro")).toBe(Date.UTC(2026, 5, 1, 0, 0, 0) / 1000);
  });
});
