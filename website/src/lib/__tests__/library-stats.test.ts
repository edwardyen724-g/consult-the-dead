import { describe, expect, it } from "vitest";
import {
  formatLibraryProgressStats,
  getLibraryProgressStats,
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
