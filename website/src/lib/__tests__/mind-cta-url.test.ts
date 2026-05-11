import { describe, expect, it } from "vitest";

import { MIND_SLUGS, buildMindCtaUrl } from "../mind-content";

describe("buildMindCtaUrl", () => {
  it("returns a /agora? prefixed URL for a valid slug", () => {
    const url = buildMindCtaUrl("isaac-newton");
    expect(url.startsWith("/agora?")).toBe(true);
  });

  it("includes the slug as mind= param", () => {
    expect(buildMindCtaUrl("isaac-newton")).toContain("mind=isaac-newton");
    expect(buildMindCtaUrl("niccolo-machiavelli")).toContain(
      "mind=niccolo-machiavelli",
    );
    expect(buildMindCtaUrl("sun-tzu")).toContain("mind=sun-tzu");
  });

  it("appends utm_source=mind_page", () => {
    const url = buildMindCtaUrl("marie-curie");
    expect(url).toContain("utm_source=mind_page");
  });

  it("appends utm_campaign=longtail_seo", () => {
    const url = buildMindCtaUrl("marcus-aurelius");
    expect(url).toContain("utm_campaign=longtail_seo");
  });

  it("matches the exact canonical form for isaac-newton", () => {
    expect(buildMindCtaUrl("isaac-newton")).toBe(
      "/agora?mind=isaac-newton&utm_source=mind_page&utm_campaign=longtail_seo",
    );
  });

  it("matches the exact canonical form for seneca", () => {
    expect(buildMindCtaUrl("seneca")).toBe(
      "/agora?mind=seneca&utm_source=mind_page&utm_campaign=longtail_seo",
    );
  });

  it("returns empty string for an unknown slug", () => {
    expect(buildMindCtaUrl("does-not-exist")).toBe("");
    expect(buildMindCtaUrl("albert-einstein")).toBe("");
    expect(buildMindCtaUrl("")).toBe("");
  });

  it("works for all 25 active MIND_SLUGS", () => {
    for (const slug of MIND_SLUGS) {
      const url = buildMindCtaUrl(slug);
      expect(url).toContain(`mind=${slug}`);
      expect(url).toContain("utm_source=mind_page");
      expect(url).toContain("utm_campaign=longtail_seo");
    }
  });
});
