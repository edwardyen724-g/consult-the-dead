import { describe, expect, it } from "vitest";
import {
  formatLibraryProgressStats,
  getLibraryProgressStats,
  getLibraryUpsellNudge,
  type LibraryProgressStats,
} from "@/lib/library-stats";

describe("getLibraryProgressStats", () => {
  it("counts unique consulted minds across the saved library", () => {
    expect(
      getLibraryProgressStats([
        { mind_slugs: ["sun-tzu", "marcus-aurelius"] },
        { mind_slugs: ["sun-tzu", "cicero"] },
        { mind_slugs: ["epictetus"] },
      ]),
    ).toEqual({
      consultedMinds: 4,
      savedDebates: 3,
    });
  });

  it("returns zeroed counts for an empty library", () => {
    expect(getLibraryProgressStats([])).toEqual({
      consultedMinds: 0,
      savedDebates: 0,
    });
  });
});

describe("formatLibraryProgressStats", () => {
  it("formats the live progress strip labels", () => {
    expect(
      formatLibraryProgressStats({
        consultedMinds: 4,
        savedDebates: 3,
      }),
    ).toEqual([
      "4 minds consulted so far",
      "3 saved debates",
      "Growing with every return",
    ]);
  });

  it("singularizes the first two labels when counts are one", () => {
    expect(
      formatLibraryProgressStats({
        consultedMinds: 1,
        savedDebates: 1,
      }),
    ).toEqual([
      "1 mind consulted so far",
      "1 saved debate",
      "Growing with every return",
    ]);
  });

  it("rejects invalid counts", () => {
    expect(() =>
      formatLibraryProgressStats({
        consultedMinds: -1,
        savedDebates: 1,
      }),
    ).toThrow(/non-negative/);
    expect(() =>
      formatLibraryProgressStats({
        consultedMinds: Number.NaN,
        savedDebates: 1,
      } as LibraryProgressStats),
    ).toThrow(/finite/);
  });
});

describe("getLibraryUpsellNudge", () => {
  it("returns null when well below the nudge threshold", () => {
    expect(getLibraryUpsellNudge(0)).toBeNull();
    expect(getLibraryUpsellNudge(50)).toBeNull();
    expect(getLibraryUpsellNudge(89)).toBeNull();
  });

  it("returns a running-low nudge between 90 and 99 saved agons", () => {
    const nudge90 = getLibraryUpsellNudge(90);
    expect(nudge90).not.toBeNull();
    expect(nudge90?.kind).toBe("running-low");
    expect(nudge90?.remaining).toBe(10);
    expect(nudge90?.message).toContain("10 consultations left this month");
    expect(nudge90?.message).toContain("90/100");

    const nudge99 = getLibraryUpsellNudge(99);
    expect(nudge99?.kind).toBe("running-low");
    expect(nudge99?.remaining).toBe(1);
    expect(nudge99?.message).toContain("1 consultation left this month");
  });

  it("returns a cap-reached nudge at exactly 100 saved agons", () => {
    const nudge = getLibraryUpsellNudge(100);
    expect(nudge?.kind).toBe("cap-reached");
    expect(nudge?.remaining).toBe(0);
    expect(nudge?.message).toContain("100-agon monthly limit");
  });

  it("returns a cap-reached nudge above 100 saved agons", () => {
    const nudge = getLibraryUpsellNudge(115);
    expect(nudge?.kind).toBe("cap-reached");
    expect(nudge?.remaining).toBe(0);
  });

  it("returns null for invalid inputs", () => {
    expect(getLibraryUpsellNudge(-1)).toBeNull();
    expect(getLibraryUpsellNudge(Number.NaN)).toBeNull();
  });
});
