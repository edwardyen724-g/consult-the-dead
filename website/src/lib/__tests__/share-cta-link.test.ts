import { describe, expect, it } from "vitest";

import {
  SHARE_CTA_BUTTON_LABEL,
  SHARE_CTA_HEADLINE,
  SHARE_CTA_SUBLINE,
  SHARE_SOCIAL_PROOF_LINE,
  buildShareCtaHref,
} from "../share-cta-link";

/* ── Default-path contract (the live caller's only path) ───────── */

describe("buildShareCtaHref — defaults", () => {
  it("uses utm_source=share and utm_campaign=agon_share", () => {
    const href = buildShareCtaHref("abc-123");
    expect(href.startsWith("/agora?")).toBe(true);
    const url = new URL(href, "https://example.com");
    expect(url.pathname).toBe("/agora");
    expect(url.searchParams.get("utm_source")).toBe("share");
    expect(url.searchParams.get("utm_campaign")).toBe("agon_share");
  });

  it("defaults utm_content to the share_id", () => {
    const href = buildShareCtaHref("ali-rohde-pivot");
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_content")).toBe("ali-rohde-pivot");
  });

  it("trims whitespace around the share_id before using it", () => {
    const href = buildShareCtaHref("  ali-rohde  ");
    const url = new URL(href, "https://example.com");
    // utm_content reflects the (untrimmed) input but URL encoding works
    expect(url.searchParams.get("utm_content")).toBe("ali-rohde");
  });

  it("does not set a topic query param when not requested", () => {
    const href = buildShareCtaHref("abc-123");
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.has("topic")).toBe(false);
  });
});

/* ── Override surface ───────────────────────────────────────────── */

describe("buildShareCtaHref — overrides", () => {
  it("respects an explicit utm_source override", () => {
    const href = buildShareCtaHref("abc-123", { utmSource: "twitter" });
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("twitter");
  });

  it("respects an explicit utm_campaign override", () => {
    const href = buildShareCtaHref("abc-123", { utmCampaign: "ab_test_v2" });
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_campaign")).toBe("ab_test_v2");
  });

  it("respects an explicit utm_content override", () => {
    const href = buildShareCtaHref("abc-123", { utmContent: "hero_button" });
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_content")).toBe("hero_button");
  });

  it("includes a topic query param when topic option is non-empty", () => {
    const href = buildShareCtaHref("abc-123", { topic: "How should I pivot?" });
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("topic")).toBe("How should I pivot?");
  });

  it("ignores an all-whitespace topic option", () => {
    const href = buildShareCtaHref("abc-123", { topic: "   " });
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.has("topic")).toBe(false);
  });

  it("URL-encodes utm_content with special characters", () => {
    const href = buildShareCtaHref("abc-123", { utmContent: "a b&c=d" });
    // raw href contains the encoded form
    expect(href).toContain("utm_content=a+b%26c%3Dd");
    const url = new URL(href, "https://example.com");
    // round-trip decode matches the original
    expect(url.searchParams.get("utm_content")).toBe("a b&c=d");
  });

  it("omits utm_content when explicitly set to empty string", () => {
    const href = buildShareCtaHref("abc-123", { utmContent: "" });
    const url = new URL(href, "https://example.com");
    // Default fallback to share_id only fires when utmContent is `undefined`,
    // not when caller passes an empty string. Empty string → no param.
    expect(url.searchParams.has("utm_content")).toBe(false);
  });
});

/* ── Defensive guards ──────────────────────────────────────────── */

describe("buildShareCtaHref — invalid input", () => {
  it("throws when share_id is empty string", () => {
    expect(() => buildShareCtaHref("")).toThrow(/shareId is required/);
  });

  it("throws when share_id is whitespace only", () => {
    expect(() => buildShareCtaHref("   ")).toThrow(/shareId is required/);
  });

  it("throws when share_id is not a string", () => {
    // @ts-expect-error — exercising defensive guard
    expect(() => buildShareCtaHref(undefined)).toThrow(/shareId is required/);
    // @ts-expect-error — exercising defensive guard
    expect(() => buildShareCtaHref(null)).toThrow(/shareId is required/);
    // @ts-expect-error — exercising defensive guard
    expect(() => buildShareCtaHref(42)).toThrow(/shareId is required/);
  });
});

/* ── Copy constants — guard against silent edits ─────────────── */

describe("share-cta-link copy constants", () => {
  it("exposes a non-empty headline", () => {
    expect(typeof SHARE_CTA_HEADLINE).toBe("string");
    expect(SHARE_CTA_HEADLINE.length).toBeGreaterThan(0);
  });

  it("exposes a non-empty subline mentioning the free tier", () => {
    expect(typeof SHARE_CTA_SUBLINE).toBe("string");
    expect(SHARE_CTA_SUBLINE).toMatch(/free/i);
  });

  it("exposes a non-empty button label", () => {
    expect(typeof SHARE_CTA_BUTTON_LABEL).toBe("string");
    expect(SHARE_CTA_BUTTON_LABEL.length).toBeGreaterThan(0);
  });

  it("social-proof line names the brand and the roster size", () => {
    expect(SHARE_SOCIAL_PROOF_LINE).toContain("Consult The Dead");
    expect(SHARE_SOCIAL_PROOF_LINE).toMatch(/26 minds/);
  });
});
