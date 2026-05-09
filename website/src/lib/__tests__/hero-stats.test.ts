import { describe, expect, it } from "vitest";

import {
  formatHeroStats,
  HERO_PRIMARY_CTA_HREF,
  HERO_PRIMARY_CTA_LABEL,
  HERO_SECONDARY_CTA_HREF,
  HERO_SECONDARY_CTA_LABEL,
  HERO_STATS_FREE_TIER_LABEL,
  HERO_STATS_PRO_TIER_LABEL,
} from "../hero-stats";

describe("formatHeroStats", () => {
  it("formats the live-roster (26 minds) social-proof strip", () => {
    expect(formatHeroStats({ minds: 26 })).toBe(
      "26 historical minds · Free 3 agons/day · $30/mo Pro for unlimited Opus",
    );
  });

  it('singularizes to "historical mind" when minds === 1', () => {
    expect(formatHeroStats({ minds: 1 })).toBe(
      "1 historical mind · Free 3 agons/day · $30/mo Pro for unlimited Opus",
    );
  });

  it("handles 0 minds (empty roster bootstrapping)", () => {
    expect(formatHeroStats({ minds: 0 })).toBe(
      "0 historical minds · Free 3 agons/day · $30/mo Pro for unlimited Opus",
    );
  });

  it("throws on negative mind count", () => {
    expect(() => formatHeroStats({ minds: -1 })).toThrow(/non-negative/);
  });

  it("throws on NaN", () => {
    expect(() => formatHeroStats({ minds: Number.NaN })).toThrow(/finite/);
  });

  it("throws on +Infinity", () => {
    expect(() =>
      formatHeroStats({ minds: Number.POSITIVE_INFINITY }),
    ).toThrow(/finite/);
  });

  it("throws on -Infinity", () => {
    expect(() =>
      formatHeroStats({ minds: Number.NEGATIVE_INFINITY }),
    ).toThrow(/finite/);
  });
});

describe("HERO_PRIMARY_CTA_HREF", () => {
  it("matches the exact UTM-tagged target string", () => {
    // Acceptance gate (2): primary CTA must carry both UTM params verbatim.
    expect(HERO_PRIMARY_CTA_HREF).toBe(
      "/agora?utm_source=home&utm_campaign=hero_primary",
    );
  });

  it("parses to /agora with utm_source=home & utm_campaign=hero_primary", () => {
    const url = new URL(HERO_PRIMARY_CTA_HREF, "https://www.consultthedead.com");
    expect(url.pathname).toBe("/agora");
    expect(url.searchParams.get("utm_source")).toBe("home");
    expect(url.searchParams.get("utm_campaign")).toBe("hero_primary");
  });
});

describe("HERO_SECONDARY_CTA_HREF", () => {
  it("links to the pricing page", () => {
    expect(HERO_SECONDARY_CTA_HREF).toBe("/pricing");
  });
});

describe("CTA labels + tier-strip constants", () => {
  it("primary CTA copy matches conversion brief", () => {
    expect(HERO_PRIMARY_CTA_LABEL).toBe(
      "Begin your council — 3 free agons today",
    );
  });

  it("secondary CTA label is the canonical pricing-link copy", () => {
    expect(HERO_SECONDARY_CTA_LABEL).toBe("See pricing");
  });

  it("free-tier label reflects 3 agons/day cap", () => {
    expect(HERO_STATS_FREE_TIER_LABEL).toBe("Free 3 agons/day");
  });

  it("pro-tier label reflects $30/mo + Opus benefit per docs/pricing.md", () => {
    expect(HERO_STATS_PRO_TIER_LABEL).toBe(
      "$30/mo Pro for unlimited Opus",
    );
  });
});
