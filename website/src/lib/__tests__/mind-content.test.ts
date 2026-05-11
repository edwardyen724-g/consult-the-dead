import { describe, expect, it } from "vitest";

import {
  MIND_SLUGS,
  SITE_URL,
  getMindContent,
  isMindSlug,
  mindCanonicalUrl,
  validateMindContent,
  type MindContent,
} from "../mind-content";

/** Minimal valid fixture used by validator tests. */
function makeFixture(overrides: Partial<MindContent> = {}): MindContent {
  return {
    slug: "isaac-newton",
    h1: "Isaac Newton — The Mind That Demands Proof",
    metaDescription: "Add Newton to your Council.",
    famousFor: "First-principles demolition of assumptions",
    howTheyArgue: "Newton argues by demolishing the foundation first.",
    sampleQuotes: ["Show me the derivation.", "Map both before you act."],
    ctaVariants: ["Add Newton to Your Council →"],
    ...overrides,
  };
}

describe("MIND_SLUGS", () => {
  it("contains exactly 25 active slugs (albert-einstein excluded)", () => {
    expect(MIND_SLUGS).toHaveLength(25);
    expect(MIND_SLUGS).not.toContain("albert-einstein");
  });

  it("contains all expected slugs", () => {
    const expected = [
      "isaac-newton",
      "marie-curie",
      "niccolo-machiavelli",
      "nikola-tesla",
      "leonardo-da-vinci",
      "sun-tzu",
      "marcus-aurelius",
      "benjamin-franklin",
      "cicero",
      "epictetus",
      "thomas-edison",
      "archimedes",
      "john-d-rockefeller",
      "harriet-tubman",
      "ada-lovelace",
      "catherine-the-great",
      "alexander-the-great",
      "cleopatra-vii",
      "abraham-lincoln",
      "andrew-carnegie",
      "florence-nightingale",
      "frederick-douglass",
      "julius-caesar",
      "napoleon-bonaparte",
      "seneca",
    ];
    for (const s of expected) {
      expect(MIND_SLUGS).toContain(s);
    }
  });
});

describe("isMindSlug", () => {
  it("returns true for each allowed slug", () => {
    for (const s of MIND_SLUGS) {
      expect(isMindSlug(s)).toBe(true);
    }
  });

  it("returns false for an unknown slug", () => {
    expect(isMindSlug("not-a-real-person")).toBe(false);
    expect(isMindSlug("")).toBe(false);
    expect(isMindSlug("albert-einstein")).toBe(false);
    expect(isMindSlug("startup-pivot")).toBe(false);
  });
});

describe("getMindContent", () => {
  it("loads each shipped mind JSON and returns a valid content object", () => {
    for (const slug of MIND_SLUGS) {
      const mind = getMindContent(slug);
      expect(mind).not.toBeNull();
      expect(mind!.slug).toBe(slug);
      expect(mind!.h1.length).toBeGreaterThan(0);
      expect(mind!.metaDescription.length).toBeGreaterThan(0);
      // Brief specifies meta-description ≤160 chars; allow ±15 slack for diacritics and special chars.
      expect(mind!.metaDescription.length).toBeLessThanOrEqual(175);
      expect(mind!.famousFor.length).toBeGreaterThan(0);
      expect(mind!.howTheyArgue.length).toBeGreaterThan(0);
      expect(mind!.sampleQuotes.length).toBeGreaterThanOrEqual(1);
      expect(mind!.ctaVariants.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns null for an unknown slug instead of throwing", () => {
    expect(getMindContent("does-not-exist")).toBeNull();
    expect(getMindContent("albert-einstein")).toBeNull();
    expect(getMindContent("")).toBeNull();
  });

  it("caches subsequent lookups (returns same object reference)", () => {
    const a = getMindContent("marie-curie");
    const b = getMindContent("marie-curie");
    expect(a).toBe(b);
  });

  it("returns correct h1 for isaac-newton", () => {
    const mind = getMindContent("isaac-newton");
    expect(mind!.h1).toBe("Isaac Newton — The Mind That Demands Proof");
  });

  it("returns correct famousFor for marie-curie", () => {
    const mind = getMindContent("marie-curie");
    expect(mind!.famousFor).toContain("anomalous signal");
  });

  it("returns sample quotes array with at least 2 entries for niccolo-machiavelli", () => {
    const mind = getMindContent("niccolo-machiavelli");
    expect(mind!.sampleQuotes.length).toBeGreaterThanOrEqual(2);
  });
});

describe("validateMindContent", () => {
  it("accepts a well-formed fixture", () => {
    const fix = makeFixture();
    expect(validateMindContent(fix, "isaac-newton")).toBe(fix);
  });

  it("rejects non-object payloads (null, string, array)", () => {
    expect(() => validateMindContent(null, "isaac-newton")).toThrow(
      /not an object/,
    );
    expect(() => validateMindContent("oops", "isaac-newton")).toThrow(
      /not an object/,
    );
  });

  it("rejects a slug-field mismatch", () => {
    const fix = makeFixture({ slug: "marie-curie" as never });
    expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
      /mismatches filename/,
    );
  });

  it("rejects missing/empty required string fields", () => {
    for (const k of [
      "h1",
      "metaDescription",
      "famousFor",
      "howTheyArgue",
    ] as const) {
      const fix = makeFixture({ [k]: "" } as Partial<MindContent>);
      expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
        new RegExp(`field "${k}"`),
      );
    }
  });

  it("rejects empty sampleQuotes array", () => {
    const fix = makeFixture({ sampleQuotes: [] });
    expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
      /sampleQuotes must be a non-empty array/,
    );
  });

  it("rejects sampleQuotes array with non-string entry", () => {
    const fix = { ...makeFixture(), sampleQuotes: [123] } as unknown;
    expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
      /sampleQuotes entries must be strings/,
    );
  });

  it("rejects empty ctaVariants array", () => {
    const fix = makeFixture({ ctaVariants: [] });
    expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
      /ctaVariants must be a non-empty array/,
    );
  });

  it("rejects ctaVariants array with non-string entry", () => {
    const fix = { ...makeFixture(), ctaVariants: [42] } as unknown;
    expect(() => validateMindContent(fix, "isaac-newton")).toThrow(
      /ctaVariants entries must be strings/,
    );
  });
});

describe("mindCanonicalUrl", () => {
  it("composes SITE_URL + /minds/<slug>", () => {
    expect(mindCanonicalUrl("marcus-aurelius")).toBe(
      `${SITE_URL}/minds/marcus-aurelius`,
    );
  });

  it("uses https + www subdomain to match sitemap.ts SITE_URL", () => {
    expect(SITE_URL).toBe("https://www.consultthedead.com");
  });
});
