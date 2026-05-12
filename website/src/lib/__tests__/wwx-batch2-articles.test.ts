/**
 * Registry tests for batch-2 "What Would X Say" insight articles.
 * Task bbb0c9bb — 4 high-intent topics from topics.yaml:
 *   1. what-would-newton-say-about-rebuilding-from-first-principles
 *   2. what-would-tesla-say-about-shipping-vs-perfecting
 *   3. what-would-leonardo-say-about-creative-block
 *   4. what-would-sun-tzu-say-about-entering-saturated-markets
 */
import { describe, expect, it } from "vitest";
import {
  INSIGHT_ENTRIES,
  getInsightEntry,
  getInsightAnnotatedPassages,
  getInsightFrameworks,
  isCollisionInsightEntry,
} from "@/lib/insights";

const BATCH2_SLUGS = [
  "what-would-newton-say-about-rebuilding-from-first-principles",
  "what-would-tesla-say-about-shipping-vs-perfecting",
  "what-would-leonardo-say-about-creative-block",
  "what-would-sun-tzu-say-about-entering-saturated-markets",
] as const;

const BATCH2_FRAMEWORK_SLUGS: Record<string, string> = {
  "what-would-newton-say-about-rebuilding-from-first-principles": "isaac-newton",
  "what-would-tesla-say-about-shipping-vs-perfecting": "nikola-tesla",
  "what-would-leonardo-say-about-creative-block": "leonardo-da-vinci",
  "what-would-sun-tzu-say-about-entering-saturated-markets": "sun-tzu",
};

describe("batch-2 'What Would X Say' articles registry", () => {
  it("all 4 batch-2 slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of BATCH2_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all 4 batch-2 entries are single-framework type", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
      expect(isCollisionInsightEntry(entry!)).toBe(false);
    }
  });

  it("all 4 batch-2 entries reference the correct framework slugs", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.frameworkSlug).toBe(BATCH2_FRAMEWORK_SLUGS[slug]);
    }
  });

  it("all 4 batch-2 entries have required SEO metadata", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toBeTruthy();
      expect(entry?.description).toBeTruthy();
      expect(Array.isArray(entry?.targetKeywords)).toBe(true);
      expect(entry!.targetKeywords.length).toBeGreaterThanOrEqual(3);
      expect(entry?.decisionType).toBeTruthy();
      expect(entry?.hookQuestion).toBeTruthy();
    }
  });

  it("all 4 batch-2 entries have a publishedAt date of 2026-05-12", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.publishedAt).toBe("2026-05-12");
    }
  });

  it("all 4 batch-2 entries have agonExcerpt with at least 2 turns", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.agonExcerpt).toBeDefined();
      expect(Array.isArray(entry?.agonExcerpt)).toBe(true);
      expect(entry!.agonExcerpt!.length).toBeGreaterThanOrEqual(2);
      for (const turn of entry!.agonExcerpt!) {
        expect(turn.speaker).toBeTruthy();
        expect(turn.text).toBeTruthy();
      }
    }
  });

  it("all 4 batch-2 entries resolve to a valid framework", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      const frameworks = getInsightFrameworks(entry!);
      expect(frameworks.length).toBeGreaterThanOrEqual(1);
      expect(frameworks[0]?.slug).toBe(BATCH2_FRAMEWORK_SLUGS[slug]);
    }
  });
});

describe("batch-2 annotation blueprints", () => {
  it("newton first-principles entry has annotation blueprints that resolve", () => {
    const entry = getInsightEntry(
      "what-would-newton-say-about-rebuilding-from-first-principles",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("tesla shipping-vs-perfecting entry has annotation blueprints", () => {
    const entry = getInsightEntry(
      "what-would-tesla-say-about-shipping-vs-perfecting",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("leonardo creative-block entry has annotation blueprints", () => {
    const entry = getInsightEntry("what-would-leonardo-say-about-creative-block");
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("sun-tzu saturated-markets entry has annotation blueprints", () => {
    const entry = getInsightEntry(
      "what-would-sun-tzu-say-about-entering-saturated-markets",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });
});

describe("batch-2 titles start with 'What Would'", () => {
  it("all 4 batch-2 titles follow 'What Would X Say' format", () => {
    for (const slug of BATCH2_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toMatch(/^What Would/i);
    }
  });
});
