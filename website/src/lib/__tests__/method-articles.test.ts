/**
 * Registry tests for method/framework-explainer articles.
 * Task 7deb5fb2 — high-SEO framework explainers shipped via insight page infrastructure.
 *
 * Method articles differ from "What Would X Say" insight articles:
 *  - No single historical figure as protagonist
 *  - Primary search intent is "how does X work" / framework explanation
 *  - Still uses /insights/{slug} page via INSIGHT_ENTRIES (consistent page infrastructure)
 *  - frameworkSlug picks the most thematically aligned historical figure
 *  - agonExcerpt is present and shows multi-voice debate on the framework
 */
import { describe, expect, it } from "vitest";
import {
  INSIGHT_ENTRIES,
  getInsightEntry,
  getInsightAnnotatedPassages,
  getInsightFrameworks,
} from "@/lib/insights";
import { getFramework } from "@/lib/frameworks";

const METHOD_SLUGS = [
  "cynefin-framework-explained",
] as const;

const METHOD_FRAMEWORK_SLUGS: Record<string, string> = {
  "cynefin-framework-explained": "leonardo-da-vinci",
};

const METHOD_DECISION_TYPES: Record<string, string> = {
  "cynefin-framework-explained": "systems",
};

describe("method articles registry", () => {
  it("all method article slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of METHOD_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all method article entries are single-framework type", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
    }
  });

  it("all method article entries reference the expected framework slug", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.frameworkSlug).toBe(METHOD_FRAMEWORK_SLUGS[slug]);
    }
  });

  it("all method article entries have required SEO metadata", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.title).toBeTruthy();
      expect(entry?.description).toBeTruthy();
      expect(Array.isArray(entry?.targetKeywords)).toBe(true);
      expect(entry!.targetKeywords.length).toBeGreaterThanOrEqual(5);
      expect(entry?.decisionType).toBeTruthy();
      expect(entry?.hookQuestion).toBeTruthy();
    }
  });

  it("all method article entries have the correct decisionType", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.decisionType).toBe(METHOD_DECISION_TYPES[slug]);
    }
  });

  it("all method article entries are published on 2026-05-12", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.publishedAt).toBe("2026-05-12");
    }
  });

  it("all method article entries have agonExcerpt with ≥3 turns", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(Array.isArray(entry!.agonExcerpt)).toBe(true);
      expect(entry!.agonExcerpt!.length).toBeGreaterThanOrEqual(3);
      for (const turn of entry!.agonExcerpt!) {
        expect(typeof turn.speaker).toBe("string");
        expect(turn.speaker.length).toBeGreaterThan(0);
        expect(typeof turn.text).toBe("string");
        expect(turn.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("framework resolution works for all method article entries", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      const frameworks = getInsightFrameworks(entry!);
      expect(frameworks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("annotation blueprints resolve without error for all method articles", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      const framework = getFramework(entry!.frameworkSlug);
      expect(framework).not.toBeNull();
      expect(() => getInsightAnnotatedPassages(entry!, framework!)).not.toThrow();
    }
  });

  it("cynefin-framework-explained has the primary keyword in its title", () => {
    const entry = getInsightEntry("cynefin-framework-explained");
    expect(entry?.title).toContain("Cynefin");
  });

  it("cynefin-framework-explained has at least 3 distinct speakers in agonExcerpt", () => {
    const entry = getInsightEntry("cynefin-framework-explained");
    expect(entry?.agonExcerpt).toBeDefined();
    const speakers = new Set(entry!.agonExcerpt!.map((t) => t.speaker));
    expect(speakers.size).toBeGreaterThanOrEqual(3);
  });
});
