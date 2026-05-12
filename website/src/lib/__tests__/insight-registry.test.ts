/**
 * Registry tests for INSIGHT_ENTRIES — verifies the 3 new SEO listicle
 * articles (task c7400a14) are registered with correct slugs, types,
 * framework slugs, and SEO metadata.
 */
import { describe, expect, it } from "vitest";
import { INSIGHT_ENTRIES } from "@/lib/insights";

const LISTICLE_SLUGS = [
  "stoics-on-failure",
  "steve-jobs-on-product",
  "founders-on-pricing",
];

const LISTICLE_FRAMEWORK_SLUGS: Record<string, string> = {
  "stoics-on-failure": "marcus-aurelius",
  "steve-jobs-on-product": "steve-jobs",
  "founders-on-pricing": "john-d-rockefeller",
};

describe("SEO listicle articles registry", () => {
  it("all 3 listicle slugs are present in INSIGHT_ENTRIES", () => {
    const registeredSlugs = INSIGHT_ENTRIES.map((e) => e.slug);
    for (const slug of LISTICLE_SLUGS) {
      expect(registeredSlugs).toContain(slug);
    }
  });

  it("all 3 listicle entries are single-framework type", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry).toBeDefined();
      expect(entry!.type).toBe("single");
    }
  });

  it("all 3 listicle entries reference correct framework slugs", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry).toBeDefined();
      expect((entry as { frameworkSlug?: string }).frameworkSlug).toBe(
        LISTICLE_FRAMEWORK_SLUGS[slug]
      );
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

  it("all 3 listicle entries have a publishedAt date", () => {
    for (const slug of LISTICLE_SLUGS) {
      const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
      expect(entry?.publishedAt).toBeTruthy();
      expect(typeof entry?.publishedAt).toBe("string");
    }
  });
});
