/**
 * Content integrity tests — regression guard against data-layer duplicates.
 *
 * These tests import the real data arrays (not mocks) and assert structural
 * invariants that the rendering tests cannot catch because they operate on
 * mock data. A duplicate slug in INSIGHT_ENTRIES or DECISION_ENTRIES causes
 * silent route collisions in Next.js dynamic segments.
 */
import { describe, expect, it } from "vitest";

import { DECISION_ENTRIES } from "../../content/decisions";
import { INSIGHT_ENTRIES } from "./insights";

describe("INSIGHT_ENTRIES integrity", () => {
  it("has no duplicate slugs", () => {
    const slugs = INSIGHT_ENTRIES.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    if (uniqueSlugs.size !== slugs.length) {
      const seen = new Set<string>();
      const dupes = slugs.filter((s) => {
        if (seen.has(s)) return true;
        seen.add(s);
        return false;
      });
      throw new Error(`Duplicate insight slugs found: ${dupes.join(", ")}`);
    }
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("each entry has a non-empty slug", () => {
    for (const entry of INSIGHT_ENTRIES) {
      expect(entry.slug).toBeTruthy();
      expect(typeof entry.slug).toBe("string");
    }
  });

  it("each entry has a non-empty title", () => {
    for (const entry of INSIGHT_ENTRIES) {
      expect(entry.title).toBeTruthy();
    }
  });
});

describe("DECISION_ENTRIES integrity", () => {
  it("has no duplicate slugs", () => {
    const slugs = DECISION_ENTRIES.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    if (uniqueSlugs.size !== slugs.length) {
      const seen = new Set<string>();
      const dupes = slugs.filter((s) => {
        if (seen.has(s)) return true;
        seen.add(s);
        return false;
      });
      throw new Error(`Duplicate decision slugs found: ${dupes.join(", ")}`);
    }
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("each entry has a non-empty slug", () => {
    for (const entry of DECISION_ENTRIES) {
      expect(entry.slug).toBeTruthy();
      expect(typeof entry.slug).toBe("string");
    }
  });

  it("each entry has a non-empty title", () => {
    for (const entry of DECISION_ENTRIES) {
      expect(entry.title).toBeTruthy();
    }
  });
});
