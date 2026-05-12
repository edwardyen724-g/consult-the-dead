/**
 * Registry tests for INSIGHT_ENTRIES — verifies the 3 new SEO listicle
 * articles (task c7400a14) are registered with correct slugs, types,
 * framework slugs, and agon excerpt content.
 */
import { describe, expect, it } from "vitest";
import { INSIGHT_ENTRIES, isCollisionInsightEntry } from "@/lib/insights";

const LISTICLE_SLUGS = [
  "marcus-aurelius-vs-sun-tzu-on-product-decisions",
  "seneca-and-epictetus-on-dealing-with-failure",
  "tesla-and-ada-lovelace-on-the-future-of-computing",
];

describe("SEO listicle articles registry", () => {
  it("all 3 listicle slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of LISTICLE_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all 3 listicle entries are collision type", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry).toBeDefined();
      expect(isCollisionInsightEntry(entry!)).toBe(true);
    }
  });

  it("all 3 listicle entries have agonExcerpt with at least 2 turns", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry?.agonExcerpt).toBeDefined();
      expect(entry?.agonExcerpt?.length).toBeGreaterThanOrEqual(2);
      for (const turn of entry?.agonExcerpt ?? []) {
        expect(typeof turn.speaker).toBe("string");
        expect(turn.speaker.length).toBeGreaterThan(0);
        expect(typeof turn.text).toBe("string");
        expect(turn.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("all 3 listicle entries have SEO title, description, and targetKeywords", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry?.title).toBeTruthy();
      expect(entry?.description).toBeTruthy();
      expect(Array.isArray(entry?.targetKeywords)).toBe(true);
      expect(entry?.targetKeywords.length).toBeGreaterThan(0);
    }
  });

  it("collision framework slugs reference known FrameworkSlugs", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      if (entry && isCollisionInsightEntry(entry)) {
        expect(entry.collisionFrameworkSlugs).toHaveLength(2);
        expect(typeof entry.collisionFrameworkSlugs[0]).toBe("string");
        expect(typeof entry.collisionFrameworkSlugs[1]).toBe("string");
      }
    }
  });
});
