/**
 * Registry tests for batch-3 "What Would X Say" insight articles.
 * Task 9b797e96 — 2 high-intent topics from topics.yaml:
 *   1. what-would-marcus-aurelius-say-about-burnout
 *   2. what-would-marie-curie-say-about-when-to-trust-the-data
 */
import { describe, expect, it } from "vitest";
import {
  INSIGHT_ENTRIES,
  getInsightEntry,
  getInsightAnnotatedPassages,
  getInsightFrameworks,
  isCollisionInsightEntry,
} from "@/lib/insights";

const BATCH3_SLUGS = [
  "what-would-marcus-aurelius-say-about-burnout",
  "what-would-marie-curie-say-about-when-to-trust-the-data",
] as const;

const BATCH3_FRAMEWORK_SLUGS: Record<string, string> = {
  "what-would-marcus-aurelius-say-about-burnout": "marcus-aurelius",
  "what-would-marie-curie-say-about-when-to-trust-the-data": "marie-curie",
};

describe("batch-3 'What Would X Say' articles registry", () => {
  it("all 2 batch-3 slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of BATCH3_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all 2 batch-3 entries are single-framework type", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
      expect(isCollisionInsightEntry(entry!)).toBe(false);
    }
  });

  it("all 2 batch-3 entries reference the correct framework slugs", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.frameworkSlug).toBe(BATCH3_FRAMEWORK_SLUGS[slug]);
    }
  });

  it("all 2 batch-3 entries have required SEO metadata", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toBeTruthy();
      expect(entry?.description).toBeTruthy();
      expect(Array.isArray(entry?.targetKeywords)).toBe(true);
      expect(entry!.targetKeywords.length).toBeGreaterThanOrEqual(3);
      expect(entry?.decisionType).toBeTruthy();
      expect(entry?.hookQuestion).toBeTruthy();
    }
  });

  it("all 2 batch-3 entries have a publishedAt date of 2026-05-12", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.publishedAt).toBe("2026-05-12");
    }
  });

  it("all 2 batch-3 entries have agonExcerpt with at least 2 turns", () => {
    for (const slug of BATCH3_SLUGS) {
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

  it("all 2 batch-3 entries resolve to a valid framework", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      const frameworks = getInsightFrameworks(entry!);
      expect(frameworks.length).toBeGreaterThanOrEqual(1);
      expect(frameworks[0]?.slug).toBe(BATCH3_FRAMEWORK_SLUGS[slug]);
    }
  });
});

describe("batch-3 annotation blueprints", () => {
  it("marcus-aurelius burnout entry has annotation blueprints that resolve", () => {
    const entry = getInsightEntry("what-would-marcus-aurelius-say-about-burnout");
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });

  it("marie-curie trust-the-data entry has annotation blueprints that resolve", () => {
    const entry = getInsightEntry(
      "what-would-marie-curie-say-about-when-to-trust-the-data",
    );
    expect(entry).toBeDefined();
    const frameworks = getInsightFrameworks(entry!);
    expect(frameworks.length).toBeGreaterThan(0);
    const passages = getInsightAnnotatedPassages(entry!, frameworks[0]!);
    expect(passages.length).toBeGreaterThanOrEqual(0);
  });
});

describe("batch-3 titles start with 'What Would'", () => {
  it("all 2 batch-3 titles follow 'What Would X Say' format", () => {
    for (const slug of BATCH3_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toMatch(/^What Would/i);
    }
  });
});
