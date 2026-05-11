/**
 * Pure helpers for the public /explore agon-gallery surface.
 *
 * Kept React-free + Next-free + DB-free so vitest can exercise every
 * branch without booting the framework. The /explore client component
 * consumes these helpers to filter the card list and to build UTM-
 * tagged outbound links — both behaviors are unit-tested below in
 * src/lib/__tests__/explore-filter.test.ts.
 *
 * UTM contract (per task 22376873 acceptance):
 *   - Card → /agora/a/<share_id>?utm_source=explore&utm_campaign=gallery_card
 *   - Bottom CTA → /agora?utm_source=explore&utm_campaign=gallery_cta
 *
 * Intersection semantics for the mind-chip filter:
 *   - Empty selection (no chips active) returns the full card list.
 *   - Selecting one or more chips returns only cards whose council
 *     contains EVERY selected mind slug. The chip strip is therefore
 *     additive — picking two chips narrows, never widens. This is the
 *     contract the chip UI commits to in the gallery (and it matches
 *     the founder-directive intent: viewers searching for "what would
 *     Newton + Curie say about X" should see only that intersection).
 */

/* ── Types ────────────────────────────────────────────────────── */

/**
 * Card-shaped data the gallery actually consumes. Kept structurally
 * looser than `PublicAgonRecord` so this helper module can stay
 * dependency-free of the DB client (the server component does the
 * `PublicAgonRecord → ExploreCard` mapping).
 */
export interface ExploreCard {
  /** Public share handle (used in /agora/a/<share_id> URLs). */
  shareId: string;
  /** Topic / question text for the agon. Substring-searched. */
  topic: string;
  /** Council mind slugs (e.g. "isaac-newton"). Filtered against. */
  mindSlugs: string[];
  /** ISO-8601 timestamp; only used for sort/display by callers. */
  createdAt: string;
}

/** Options for buildShareCardHref. */
export interface ShareCardHrefOptions {
  /** utm_source — defaults to "explore". */
  utmSource?: string;
  /** utm_campaign — defaults to "gallery_card". */
  utmCampaign?: string;
  /** utm_content — optional, omitted from the URL when absent. */
  utmContent?: string;
}

/** Options for buildBottomCtaHref. */
export interface BottomCtaHrefOptions {
  /** utm_source — defaults to "explore". */
  utmSource?: string;
  /** utm_campaign — defaults to "gallery_cta". */
  utmCampaign?: string;
  /** utm_content — optional, omitted from the URL when absent. */
  utmContent?: string;
}

/* ── Mind-chip filter (intersection) ────────────────────────────── */

/**
 * Filter a card list down to cards whose `mindSlugs` contains EVERY
 * slug in `selectedSlugs`. Empty selection short-circuits to the full
 * input list (callers don't need a separate guard).
 *
 * Pure — does not mutate input arrays.
 */
export function filterCardsByMinds<T extends Pick<ExploreCard, "mindSlugs">>(
  cards: T[],
  selectedSlugs: string[],
): T[] {
  if (!Array.isArray(cards)) return [];
  if (!Array.isArray(selectedSlugs) || selectedSlugs.length === 0) {
    // No chip active → no filter; return the full list.
    return [...cards];
  }
  // De-dupe selection so a caller passing ["x","x"] doesn't double-cost.
  const wanted = Array.from(new Set(selectedSlugs.filter((s) => typeof s === "string" && s.length > 0)));
  if (wanted.length === 0) return [...cards];
  return cards.filter((card) => {
    const have = new Set(Array.isArray(card.mindSlugs) ? card.mindSlugs : []);
    return wanted.every((s) => have.has(s));
  });
}

/* ── Topic substring search ─────────────────────────────────────── */

/**
 * Filter a card list by a case-insensitive substring match against
 * the topic. Empty / whitespace-only query returns the full list.
 *
 * The match is intentionally simple substring rather than fuzzy —
 * the seed list is ~30 rows and a substring contract is what the
 * search-box UI commits to in v1.
 */
export function filterCardsByTopic<T extends Pick<ExploreCard, "topic">>(
  cards: T[],
  query: string,
): T[] {
  if (!Array.isArray(cards)) return [];
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return [...cards];
  return cards.filter((card) => {
    const t = typeof card.topic === "string" ? card.topic.toLowerCase() : "";
    return t.includes(q);
  });
}

/* ── Combined filter ────────────────────────────────────────────── */

/**
 * Apply both the mind-chip intersection filter and the topic substring
 * filter. Equivalent to `filterCardsByTopic(filterCardsByMinds(...), q)`
 * but avoids the intermediate array allocation when the caller already
 * has both inputs.
 */
export function filterCards<T extends Pick<ExploreCard, "mindSlugs" | "topic">>(
  cards: T[],
  selectedSlugs: string[],
  query: string,
): T[] {
  const byMinds = filterCardsByMinds(cards, selectedSlugs);
  return filterCardsByTopic(byMinds, query);
}

/* ── URL builders (UTM-tagged) ──────────────────────────────────── */

/**
 * Build the per-card outbound href:
 *
 *     /agora/a/<share_id>?utm_source=explore&utm_campaign=gallery_card
 *
 * `utm_content` is forwarded when provided so callers can attribute
 * specific card variants (e.g. featured row vs. tail) without
 * touching this helper.
 *
 * Throws on empty share_id rather than silently returning a broken
 * URL — the gallery's render path is the only caller and a missing
 * share_id is a programming error there.
 */
export function buildShareCardHref(
  shareId: string,
  options: ShareCardHrefOptions = {},
): string {
  if (!shareId || typeof shareId !== "string") {
    throw new Error("buildShareCardHref: shareId is required");
  }
  const utmSource = options.utmSource ?? "explore";
  const utmCampaign = options.utmCampaign ?? "gallery_card";
  const params = new URLSearchParams();
  params.set("utm_source", utmSource);
  params.set("utm_campaign", utmCampaign);
  if (options.utmContent && options.utmContent.length > 0) {
    params.set("utm_content", options.utmContent);
  }
  // encodeURIComponent on shareId so a stray slash/space in seed data
  // can't break out of the path segment.
  return `/agora/a/${encodeURIComponent(shareId)}?${params.toString()}`;
}

/**
 * Build the bottom-CTA outbound href:
 *
 *     /agora?utm_source=explore&utm_campaign=gallery_cta
 *
 * `utm_content` forwarded when provided.
 */
export function buildBottomCtaHref(
  options: BottomCtaHrefOptions = {},
): string {
  const utmSource = options.utmSource ?? "explore";
  const utmCampaign = options.utmCampaign ?? "gallery_cta";
  const params = new URLSearchParams();
  params.set("utm_source", utmSource);
  params.set("utm_campaign", utmCampaign);
  if (options.utmContent && options.utmContent.length > 0) {
    params.set("utm_content", options.utmContent);
  }
  return `/agora?${params.toString()}`;
}
