import { describe, expect, it } from "vitest";

import {
  buildBottomCtaHref,
  buildShareCardHref,
  filterCards,
  filterCardsByMinds,
  filterCardsByTopic,
  type ExploreCard,
} from "../explore-filter";

/* ── Fixtures ─────────────────────────────────────────────────── */

function card(overrides: Partial<ExploreCard> = {}): ExploreCard {
  return {
    shareId: "abc-123",
    topic: "How should a young founder pivot when the market shifts?",
    mindSlugs: ["isaac-newton", "sun-tzu", "marcus-aurelius"],
    createdAt: "2026-05-01T12:00:00.000Z",
    ...overrides,
  };
}

const ALL_CARDS: ExploreCard[] = [
  card({
    shareId: "newton-curie-tubman",
    topic: "Should we open-source our research?",
    mindSlugs: ["isaac-newton", "marie-curie", "harriet-tubman"],
  }),
  card({
    shareId: "suntzu-mach-cleo",
    topic: "How to handle a hostile competitor?",
    mindSlugs: ["sun-tzu", "niccolo-machiavelli", "cleopatra-vii"],
  }),
  card({
    shareId: "newton-suntzu-aurelius",
    topic: "Pivot decision under shifting market signals",
    mindSlugs: ["isaac-newton", "sun-tzu", "marcus-aurelius"],
  }),
  card({
    shareId: "edison-tesla-rockefeller",
    topic: "Capital allocation in a downturn",
    mindSlugs: ["thomas-edison", "nikola-tesla", "john-d-rockefeller"],
  }),
];

/* ── filterCardsByMinds: intersection logic ───────────────────── */

describe("filterCardsByMinds", () => {
  it("returns full list when no chips selected (empty array)", () => {
    expect(filterCardsByMinds(ALL_CARDS, [])).toHaveLength(ALL_CARDS.length);
  });

  it("returns full list when selectedSlugs is not an array", () => {
    // @ts-expect-error — intentionally passing a non-array
    const result = filterCardsByMinds(ALL_CARDS, null);
    expect(result).toHaveLength(ALL_CARDS.length);
  });

  it("returns empty list when input cards is empty", () => {
    expect(filterCardsByMinds([], ["isaac-newton"])).toEqual([]);
  });

  it("returns empty list when cards is not an array", () => {
    // @ts-expect-error — intentionally passing a non-array
    expect(filterCardsByMinds(null, ["isaac-newton"])).toEqual([]);
  });

  it("filters by a single mind slug", () => {
    const result = filterCardsByMinds(ALL_CARDS, ["isaac-newton"]);
    expect(result.map((c) => c.shareId)).toEqual([
      "newton-curie-tubman",
      "newton-suntzu-aurelius",
    ]);
  });

  it("filters by intersection of two slugs (AND, not OR)", () => {
    const result = filterCardsByMinds(ALL_CARDS, [
      "isaac-newton",
      "sun-tzu",
    ]);
    expect(result.map((c) => c.shareId)).toEqual(["newton-suntzu-aurelius"]);
  });

  it("returns empty list when no card matches all selected slugs", () => {
    const result = filterCardsByMinds(ALL_CARDS, [
      "isaac-newton",
      "thomas-edison",
    ]);
    expect(result).toEqual([]);
  });

  it("ignores duplicate slugs in selection", () => {
    const result = filterCardsByMinds(ALL_CARDS, [
      "isaac-newton",
      "isaac-newton",
    ]);
    expect(result.map((c) => c.shareId)).toEqual([
      "newton-curie-tubman",
      "newton-suntzu-aurelius",
    ]);
  });

  it("ignores empty-string and non-string entries in selection", () => {
    const result = filterCardsByMinds(ALL_CARDS, [
      "",
      "isaac-newton",
      // @ts-expect-error — intentionally a non-string
      null,
    ]);
    expect(result.map((c) => c.shareId)).toEqual([
      "newton-curie-tubman",
      "newton-suntzu-aurelius",
    ]);
  });

  it("returns full list when selection is non-empty but all entries are blank/non-string", () => {
    const result = filterCardsByMinds(ALL_CARDS, [
      "",
      // @ts-expect-error — intentionally a non-string
      null,
      "   ".replace(/\s/g, ""),
    ]);
    expect(result).toHaveLength(ALL_CARDS.length);
  });

  it("treats card with non-array mindSlugs as having no minds", () => {
    const malformed = [
      ...ALL_CARDS,
      { ...card(), mindSlugs: undefined as unknown as string[] },
    ];
    const result = filterCardsByMinds(malformed, ["isaac-newton"]);
    expect(result).toHaveLength(2); // unchanged from ALL_CARDS branch
  });

  it("does not mutate the input array", () => {
    const input = [...ALL_CARDS];
    const before = input.map((c) => c.shareId).join(",");
    filterCardsByMinds(input, ["isaac-newton"]);
    expect(input.map((c) => c.shareId).join(",")).toBe(before);
  });

  it("returns a new array instance even when filter is a no-op", () => {
    const out = filterCardsByMinds(ALL_CARDS, []);
    expect(out).not.toBe(ALL_CARDS);
    expect(out).toEqual(ALL_CARDS);
  });
});

/* ── filterCardsByTopic: substring search ─────────────────────── */

describe("filterCardsByTopic", () => {
  it("returns full list on empty query", () => {
    expect(filterCardsByTopic(ALL_CARDS, "")).toHaveLength(ALL_CARDS.length);
  });

  it("returns full list on whitespace-only query", () => {
    expect(filterCardsByTopic(ALL_CARDS, "   ")).toHaveLength(
      ALL_CARDS.length,
    );
  });

  it("returns empty list when input cards is empty", () => {
    expect(filterCardsByTopic([], "anything")).toEqual([]);
  });

  it("returns empty list when cards is not an array", () => {
    // @ts-expect-error — intentionally a non-array
    expect(filterCardsByTopic(undefined, "any")).toEqual([]);
  });

  it("matches case-insensitively", () => {
    const result = filterCardsByTopic(ALL_CARDS, "PIVOT");
    expect(result.map((c) => c.shareId)).toEqual(["newton-suntzu-aurelius"]);
  });

  it("matches partial substrings", () => {
    const result = filterCardsByTopic(ALL_CARDS, "compet");
    expect(result.map((c) => c.shareId)).toEqual(["suntzu-mach-cleo"]);
  });

  it("returns empty when no card matches", () => {
    expect(filterCardsByTopic(ALL_CARDS, "xyzzy")).toEqual([]);
  });

  it("treats non-string topic as empty (does not throw)", () => {
    const malformed = [
      ...ALL_CARDS,
      { ...card(), topic: 42 as unknown as string },
    ];
    expect(() => filterCardsByTopic(malformed, "pivot")).not.toThrow();
  });

  it("returns a new array instance", () => {
    const out = filterCardsByTopic(ALL_CARDS, "");
    expect(out).not.toBe(ALL_CARDS);
  });

  it("treats null query as empty", () => {
    // @ts-expect-error — intentionally null
    expect(filterCardsByTopic(ALL_CARDS, null)).toHaveLength(ALL_CARDS.length);
  });
});

/* ── filterCards: combined ────────────────────────────────────── */

describe("filterCards (combined)", () => {
  it("applies both filters", () => {
    const result = filterCards(ALL_CARDS, ["isaac-newton"], "pivot");
    expect(result.map((c) => c.shareId)).toEqual(["newton-suntzu-aurelius"]);
  });

  it("returns empty when chip filter narrows then topic filter empties", () => {
    const result = filterCards(ALL_CARDS, ["isaac-newton"], "competitor");
    expect(result).toEqual([]);
  });

  it("equivalent to no-op when both filters are empty", () => {
    const result = filterCards(ALL_CARDS, [], "");
    expect(result).toHaveLength(ALL_CARDS.length);
  });
});

/* ── buildShareCardHref ───────────────────────────────────────── */

describe("buildShareCardHref", () => {
  it("emits the documented UTM contract by default", () => {
    const href = buildShareCardHref("abc-123");
    expect(href).toBe(
      "/agora/a/abc-123?utm_source=explore&utm_campaign=gallery_card",
    );
  });

  it("includes utm_content when provided", () => {
    const href = buildShareCardHref("abc-123", { utmContent: "row-2" });
    expect(href).toBe(
      "/agora/a/abc-123?utm_source=explore&utm_campaign=gallery_card&utm_content=row-2",
    );
  });

  it("omits utm_content when empty string", () => {
    const href = buildShareCardHref("abc-123", { utmContent: "" });
    expect(href).toBe(
      "/agora/a/abc-123?utm_source=explore&utm_campaign=gallery_card",
    );
  });

  it("allows overriding utm_source and utm_campaign", () => {
    const href = buildShareCardHref("abc-123", {
      utmSource: "newsletter",
      utmCampaign: "spring_drop",
    });
    // URLSearchParams.toString() preserves insertion order — assert
    // the final string so a future refactor can't silently swap key
    // ordering.
    expect(href).toBe(
      "/agora/a/abc-123?utm_source=newsletter&utm_campaign=spring_drop",
    );
  });

  it("URL-encodes path-unsafe shareId characters", () => {
    const href = buildShareCardHref("abc def/xyz");
    expect(href).toBe(
      "/agora/a/abc%20def%2Fxyz?utm_source=explore&utm_campaign=gallery_card",
    );
  });

  it("throws on empty shareId", () => {
    expect(() => buildShareCardHref("")).toThrow();
  });

  it("throws on non-string shareId", () => {
    // @ts-expect-error — intentional bad input
    expect(() => buildShareCardHref(undefined)).toThrow();
    // @ts-expect-error — intentional bad input
    expect(() => buildShareCardHref(null)).toThrow();
  });
});

/* ── buildBottomCtaHref ───────────────────────────────────────── */

describe("buildBottomCtaHref", () => {
  it("emits documented UTM contract by default", () => {
    expect(buildBottomCtaHref()).toBe(
      "/agora?utm_source=explore&utm_campaign=gallery_cta",
    );
  });

  it("includes utm_content when provided", () => {
    expect(buildBottomCtaHref({ utmContent: "mobile-sticky" })).toBe(
      "/agora?utm_source=explore&utm_campaign=gallery_cta&utm_content=mobile-sticky",
    );
  });

  it("omits utm_content when empty string", () => {
    expect(buildBottomCtaHref({ utmContent: "" })).toBe(
      "/agora?utm_source=explore&utm_campaign=gallery_cta",
    );
  });

  it("allows overriding source and campaign", () => {
    expect(
      buildBottomCtaHref({
        utmSource: "footer",
        utmCampaign: "always_on",
      }),
    ).toBe("/agora?utm_source=footer&utm_campaign=always_on");
  });
});
