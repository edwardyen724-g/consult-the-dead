/**
 * Registry tests for method/framework-explainer articles.
 * Task 7deb5fb2 — cynefin-framework-explained (single type).
 * Task ad9b2580 — the-ooda-loop-vs-the-cynefin-framework (collision type).
 * Task ea2ab1d9 — critical-decision-method-explained (single type).
 * Trendslop — trendslop-why-all-llms-give-the-same-strategic-advice (single type).
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

const SINGLE_METHOD_SLUGS = [
  "cynefin-framework-explained",
  "critical-decision-method-explained",
  "trendslop-why-all-llms-give-the-same-strategic-advice",
] as const;

const COLLISION_METHOD_SLUGS = [
  "the-ooda-loop-vs-the-cynefin-framework",
] as const;

const METHOD_SLUGS = [...SINGLE_METHOD_SLUGS, ...COLLISION_METHOD_SLUGS] as const;

const METHOD_FRAMEWORK_SLUGS: Record<string, string> = {
  "cynefin-framework-explained": "leonardo-da-vinci",
  "the-ooda-loop-vs-the-cynefin-framework": "sun-tzu",
  "critical-decision-method-explained": "marcus-aurelius",
  "trendslop-why-all-llms-give-the-same-strategic-advice": "isaac-newton",
};

const METHOD_DECISION_TYPES: Record<string, string> = {
  "cynefin-framework-explained": "systems",
  "the-ooda-loop-vs-the-cynefin-framework": "strategy",
  "critical-decision-method-explained": "leadership",
  "trendslop-why-all-llms-give-the-same-strategic-advice": "reasoning",
};

const METHOD_PUBLISHED_DATES: Record<string, string> = {
  "cynefin-framework-explained": "2026-05-12",
  "the-ooda-loop-vs-the-cynefin-framework": "2026-05-13",
  "critical-decision-method-explained": "2026-05-13",
  "trendslop-why-all-llms-give-the-same-strategic-advice": "2026-05-13",
};

describe("method articles registry", () => {
  it("all method article slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of METHOD_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("single-framework method articles have type: single", () => {
    for (const slug of SINGLE_METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
    }
  });

  it("collision method articles have type: collision", () => {
    for (const slug of COLLISION_METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("collision");
    }
  });

  it("all method article entries reference the expected primary framework slug", () => {
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

  it("all method article entries have the correct publishedAt date", () => {
    for (const slug of METHOD_SLUGS) {
      const entry = getInsightEntry(slug);
      expect(entry?.publishedAt).toBe(METHOD_PUBLISHED_DATES[slug]);
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

  // ── cynefin-framework-explained specific ────────────────────────────────
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

  // ── the-ooda-loop-vs-the-cynefin-framework specific ─────────────────────
  it("the-ooda-loop-vs-the-cynefin-framework has both framework keywords in its title", () => {
    const entry = getInsightEntry("the-ooda-loop-vs-the-cynefin-framework");
    expect(entry?.title).toContain("OODA");
    expect(entry?.title).toContain("Cynefin");
  });

  it("the-ooda-loop-vs-the-cynefin-framework has at least 3 distinct speakers in agonExcerpt", () => {
    const entry = getInsightEntry("the-ooda-loop-vs-the-cynefin-framework");
    expect(entry?.agonExcerpt).toBeDefined();
    const speakers = new Set(entry!.agonExcerpt!.map((t) => t.speaker));
    expect(speakers.size).toBeGreaterThanOrEqual(3);
  });

  it("the-ooda-loop-vs-the-cynefin-framework collision includes both sun-tzu and leonardo-da-vinci", () => {
    const entry = getInsightEntry("the-ooda-loop-vs-the-cynefin-framework");
    expect(entry?.type).toBe("collision");
    if (entry?.type === "collision") {
      expect(entry.collisionFrameworkSlugs).toContain("sun-tzu");
      expect(entry.collisionFrameworkSlugs).toContain("leonardo-da-vinci");
    }
  });

  // ── critical-decision-method-explained specific ────────────────────────
  it("critical-decision-method-explained has CDM in its title or description", () => {
    const entry = getInsightEntry("critical-decision-method-explained");
    const combined = `${entry?.title ?? ""} ${entry?.description ?? ""}`;
    expect(combined).toMatch(/Critical Decision Method|CDM/);
  });

  it("critical-decision-method-explained has at least 3 distinct speakers in agonExcerpt", () => {
    const entry = getInsightEntry("critical-decision-method-explained");
    expect(entry?.agonExcerpt).toBeDefined();
    const speakers = new Set(entry!.agonExcerpt!.map((t) => t.speaker));
    expect(speakers.size).toBeGreaterThanOrEqual(3);
  });

  // ── trendslop-why-all-llms-give-the-same-strategic-advice specific ─────
  it("trendslop article title contains 'trendslop' or 'LLM'", () => {
    const entry = getInsightEntry(
      "trendslop-why-all-llms-give-the-same-strategic-advice",
    );
    const combined = `${entry?.title ?? ""} ${entry?.description ?? ""}`;
    expect(combined).toMatch(/[Tt]rendslop|LLM|HBR/);
  });

  it("trendslop article has at least 3 distinct speakers in agonExcerpt", () => {
    const entry = getInsightEntry(
      "trendslop-why-all-llms-give-the-same-strategic-advice",
    );
    expect(entry?.agonExcerpt).toBeDefined();
    const speakers = new Set(entry!.agonExcerpt!.map((t) => t.speaker));
    expect(speakers.size).toBeGreaterThanOrEqual(3);
  });
});
