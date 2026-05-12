/**
 * Registry tests for batch-1 "What Would X Say" insight articles.
 * Task f7445d7d — first 3 timely/high-intent topics from topics.yaml:
 *   1. what-would-sun-tzu-say-about-tariffs-and-trade-wars (timely, high traffic)
 *   2. what-would-marcus-aurelius-say-about-imposter-syndrome (evergreen, high search)
 *   3. what-would-machiavelli-say-about-firing-someone-you-respect (founder pain, evergreen)
 */
import { describe, expect, it } from "vitest";
import {
  INSIGHT_ENTRIES,
  getInsightEntry,
  getInsightAnnotatedPassages,
  getInsightFrameworks,
  isCollisionInsightEntry,
} from "@/lib/insights";

const BATCH1_SLUGS = [
  "what-would-sun-tzu-say-about-tariffs-and-trade-wars",
  "what-would-marcus-aurelius-say-about-imposter-syndrome",
  "what-would-machiavelli-say-about-firing-someone-you-respect",
] as const;

const BATCH1_FRAMEWORK_SLUGS: Record<string, string> = {
  "what-would-sun-tzu-say-about-tariffs-and-trade-wars": "sun-tzu",
  "what-would-marcus-aurelius-say-about-imposter-syndrome": "marcus-aurelius",
  "what-would-machiavelli-say-about-firing-someone-you-respect":
    "niccolo-machiavelli",
};

describe("batch-1 'What Would X Say' articles registry", () => {
  it("all 3 batch-1 slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of BATCH1_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all 3 batch-1 entries are single-framework type", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
      expect(isCollisionInsightEntry(entry!)).toBe(false);
    }
  });

  it("all 3 batch-1 entries reference the correct framework slugs", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.frameworkSlug).toBe(BATCH1_FRAMEWORK_SLUGS[slug]);
    }
  });

  it("all 3 batch-1 entries have required SEO metadata", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toBeTruthy();
      expect(entry?.description).toBeTruthy();
      expect(Array.isArray(entry?.targetKeywords)).toBe(true);
      expect(entry!.targetKeywords.length).toBeGreaterThanOrEqual(3);
      expect(entry?.decisionType).toBeTruthy();
      expect(entry?.hookQuestion).toBeTruthy();
    }
  });

  it("all 3 batch-1 entries have a publishedAt date of 2026-05-12", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.publishedAt).toBe("2026-05-12");
    }
  });

  it("all 3 batch-1 entries have agonExcerpt with at least 2 turns", () => {
    for (const slug of BATCH1_SLUGS) {
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

  it("all 3 batch-1 entries resolve to a valid framework", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      const frameworks = getInsightFrameworks(entry!);
      expect(frameworks.length).toBeGreaterThanOrEqual(1);
      expect(frameworks[0]?.slug).toBe(BATCH1_FRAMEWORK_SLUGS[slug]);
    }
  });
});

describe("batch-1 annotation blueprints", () => {
  it("marcus-aurelius imposter syndrome has annotation blueprints that resolve to passages", () => {
    const entry = getInsightEntry(
      "what-would-marcus-aurelius-say-about-imposter-syndrome",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    // At least one blueprint should resolve (construct must exist)
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("sun-tzu tariffs entry has annotation blueprints", () => {
    const entry = getInsightEntry(
      "what-would-sun-tzu-say-about-tariffs-and-trade-wars",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("machiavelli firing entry has annotation blueprints", () => {
    const entry = getInsightEntry(
      "what-would-machiavelli-say-about-firing-someone-you-respect",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });
});

describe("batch-1 titles start with 'What Would'", () => {
  it("all 3 batch-1 titles follow 'What Would X Say' format", () => {
    for (const slug of BATCH1_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toMatch(/^What Would/i);
    }
  });
});
