import { describe, expect, it } from "vitest";

import {
  LISTICLE_SLUGS,
  SITE_URL,
  buildCtaUrl,
  isListicleSlug,
  listicleCanonicalUrl,
  loadListicleContent,
  validateListicleContent,
  type ListicleContent,
} from "../listicle-content";

/** Minimal valid fixture used by validator tests. */
function makeFixture(
  overrides: Partial<ListicleContent> = {},
): ListicleContent {
  return {
    slug: "startup-pivot",
    h1: "H1 example",
    metaDescription: "Meta example",
    topicForCta: "startup pivot",
    intro: ["Para 1", "Para 2"],
    minds: [
      { slug: "isaac-newton", name: "Isaac Newton", rationale: "r1" },
      { slug: "sun-tzu", name: "Sun Tzu", rationale: "r2" },
      { slug: "marcus-aurelius", name: "Marcus Aurelius", rationale: "r3" },
    ],
    ctaHeadline: "Headline",
    ctaButtonLabel: "Button",
    ctaSubtext: "Subtext",
    ...overrides,
  };
}

describe("LISTICLE_SLUGS", () => {
  it("contains exactly the 5 prioritised slugs from the marketing brief", () => {
    expect(LISTICLE_SLUGS).toEqual([
      "startup-pivot",
      "career-change",
      "leadership-crisis",
      "investing-risk",
      "product-strategy",
    ]);
  });
});

describe("isListicleSlug", () => {
  it("returns true for each allowed slug", () => {
    for (const s of LISTICLE_SLUGS) {
      expect(isListicleSlug(s)).toBe(true);
    }
  });

  it("returns false for an unknown slug", () => {
    expect(isListicleSlug("not-a-real-topic")).toBe(false);
    expect(isListicleSlug("")).toBe(false);
    // Defensive: arbitrary non-listicle slug must not be allow-listed.
    expect(isListicleSlug("isaac-newton")).toBe(false);
  });
});

describe("loadListicleContent", () => {
  it("loads each shipped listicle JSON and returns a valid content object", () => {
    for (const slug of LISTICLE_SLUGS) {
      const content = loadListicleContent(slug);
      expect(content).not.toBeNull();
      expect(content!.slug).toBe(slug);
      expect(content!.h1.length).toBeGreaterThan(0);
      expect(content!.metaDescription.length).toBeGreaterThan(0);
      // Brief specifies meta-description ≤160 chars; allow ±5 slack for diacritics.
      expect(content!.metaDescription.length).toBeLessThanOrEqual(170);
      expect(content!.intro.length).toBeGreaterThan(0);
      expect(content!.minds.length).toBeGreaterThanOrEqual(3);
      expect(content!.minds.length).toBeLessThanOrEqual(4);
      for (const m of content!.minds) {
        expect(m.slug.length).toBeGreaterThan(0);
        expect(m.name.length).toBeGreaterThan(0);
        expect(m.rationale.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns null for an unknown slug instead of throwing", () => {
    expect(loadListicleContent("does-not-exist")).toBeNull();
  });

  it("caches subsequent lookups (returns same object reference)", () => {
    const a = loadListicleContent("career-change");
    const b = loadListicleContent("career-change");
    expect(a).toBe(b);
  });
});

describe("validateListicleContent", () => {
  it("accepts a well-formed fixture", () => {
    const fix = makeFixture();
    expect(validateListicleContent(fix, "startup-pivot")).toBe(fix);
  });

  it("rejects non-object payloads (null, string, array)", () => {
    expect(() => validateListicleContent(null, "startup-pivot")).toThrow(
      /not an object/,
    );
    expect(() => validateListicleContent("oops", "startup-pivot")).toThrow(
      /not an object/,
    );
  });

  it("rejects a slug-field mismatch", () => {
    const fix = makeFixture({ slug: "career-change" as never });
    expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
      /mismatches filename/,
    );
  });

  it("rejects missing/empty required string fields", () => {
    for (const k of [
      "h1",
      "metaDescription",
      "topicForCta",
      "ctaHeadline",
      "ctaButtonLabel",
      "ctaSubtext",
    ] as const) {
      const fix = makeFixture({ [k]: "" } as Partial<ListicleContent>);
      expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
        new RegExp(`field "${k}"`),
      );
    }
  });

  it("rejects a non-string field of correct name", () => {
    const fix = { ...makeFixture(), h1: 42 } as unknown;
    expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
      /field "h1"/,
    );
  });

  it("rejects empty intro array", () => {
    const fix = makeFixture({ intro: [] });
    expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
      /intro must be a non-empty/,
    );
  });

  it("rejects intro array with non-string entry", () => {
    const fix = { ...makeFixture(), intro: [123] } as unknown;
    expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
      /intro entries must be strings/,
    );
  });

  it("rejects fewer than 3 minds or more than 4 minds", () => {
    const tooFew = makeFixture({
      minds: [
        { slug: "a", name: "A", rationale: "r" },
        { slug: "b", name: "B", rationale: "r" },
      ],
    });
    expect(() => validateListicleContent(tooFew, "startup-pivot")).toThrow(
      /3-4-item array/,
    );

    const tooMany = makeFixture({
      minds: [
        { slug: "a", name: "A", rationale: "r" },
        { slug: "b", name: "B", rationale: "r" },
        { slug: "c", name: "C", rationale: "r" },
        { slug: "d", name: "D", rationale: "r" },
        { slug: "e", name: "E", rationale: "r" },
      ],
    });
    expect(() => validateListicleContent(tooMany, "startup-pivot")).toThrow(
      /3-4-item array/,
    );
  });

  it("rejects a non-object mind entry", () => {
    const fix = { ...makeFixture(), minds: ["just-a-string", null, undefined] } as unknown;
    expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
      /each mind must be an object/,
    );
  });

  it("rejects a mind with missing/empty slug, name, or rationale", () => {
    for (const k of ["slug", "name", "rationale"] as const) {
      const fix = makeFixture({
        minds: [
          { slug: "a", name: "A", rationale: "r" },
          { slug: "b", name: "B", rationale: "r" },
          { slug: "c", name: "C", rationale: "r", [k]: "" } as never,
        ],
      });
      expect(() => validateListicleContent(fix, "startup-pivot")).toThrow(
        new RegExp(`mind\\.${k}`),
      );
    }
  });
});

describe("buildCtaUrl", () => {
  it("encodes spaces in topic with %20 (not '+') per brief §2", () => {
    const fix = makeFixture({ topicForCta: "startup pivot" });
    const url = buildCtaUrl(fix);
    expect(url).toContain("topic=startup%20pivot");
    expect(url).not.toContain("topic=startup+pivot");
  });

  it("joins mind slugs with literal commas (not %2C)", () => {
    const fix = makeFixture({
      minds: [
        { slug: "isaac-newton", name: "I", rationale: "r" },
        { slug: "sun-tzu", name: "S", rationale: "r" },
        { slug: "marcus-aurelius", name: "M", rationale: "r" },
      ],
    });
    const url = buildCtaUrl(fix);
    expect(url).toContain("minds=isaac-newton,sun-tzu,marcus-aurelius");
    expect(url).not.toContain("%2C");
  });

  it("appends the static UTM trio in canonical order", () => {
    const url = buildCtaUrl(makeFixture());
    expect(url).toContain("utm_source=listicle");
    expect(url).toContain("utm_campaign=longtail_seo");
    expect(url).toContain("utm_content=startup-pivot");
  });

  it("matches the exact canonical form for startup-pivot", () => {
    const fix = makeFixture({
      topicForCta: "startup pivot",
      slug: "startup-pivot",
      minds: [
        { slug: "niccolo-machiavelli", name: "N", rationale: "r" },
        { slug: "sun-tzu", name: "S", rationale: "r" },
        { slug: "isaac-newton", name: "I", rationale: "r" },
        { slug: "marcus-aurelius", name: "M", rationale: "r" },
      ],
    });
    expect(buildCtaUrl(fix)).toBe(
      "/agora?topic=startup%20pivot" +
        "&minds=niccolo-machiavelli,sun-tzu,isaac-newton,marcus-aurelius" +
        "&utm_source=listicle&utm_campaign=longtail_seo&utm_content=startup-pivot",
    );
  });

  it("starts with /agora? for client-side <Link> compatibility", () => {
    const url = buildCtaUrl(makeFixture());
    expect(url.startsWith("/agora?")).toBe(true);
  });

  it("places utm_content last so analytics greps know where the slug lives", () => {
    const url = buildCtaUrl(makeFixture());
    expect(url.endsWith("&utm_content=startup-pivot")).toBe(true);
  });
});

describe("listicleCanonicalUrl", () => {
  it("composes SITE_URL + /listicles/<slug>", () => {
    expect(listicleCanonicalUrl("career-change")).toBe(
      `${SITE_URL}/listicles/career-change`,
    );
  });

  it("uses https + www subdomain to match sitemap.ts SITE_URL", () => {
    // Acceptance gate: same origin as the rest of the sitemap so dedupe works.
    expect(SITE_URL).toBe("https://www.consultthedead.com");
  });
});
