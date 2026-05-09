/**
 * Home (/) hero conversion strip + CTA hrefs.
 *
 * The home hero shows a single-line social-proof strip directly under the H1
 * with three signals:
 *   1. the live count of historical minds (frameworks) — the only dynamic value,
 *      sourced from `getAllFrameworks().length`
 *   2. the Free-tier daily agon cap
 *   3. the Pro tier price + headline benefit
 *
 * Pricing copy here mirrors `docs/pricing.md` (canonical pricing reference).
 * If pricing changes, update both this file and `docs/pricing.md` together.
 *
 * The CTA hrefs are exported as constants so the home page and tests share the
 * exact same query string (UTM params are part of the conversion gate).
 */

export type HeroStats = {
  /** Number of historical minds available in the council. */
  minds: number;
};

/** Free-tier label shown in the social-proof strip. */
export const HERO_STATS_FREE_TIER_LABEL = "Free 3 agons/day";

/**
 * Pro-tier label shown in the social-proof strip.
 * "$30/mo Pro" matches docs/pricing.md monthly price.
 * "unlimited Opus" reflects Pro using Claude Opus for the consensus pass
 * without per-agon Opus rate limits beyond the Pro monthly cap.
 */
export const HERO_STATS_PRO_TIER_LABEL = "$30/mo Pro for unlimited Opus";

/**
 * Primary CTA href for the home hero.
 *
 * UTM params let Vercel Analytics + the Stripe checkout passthrough
 * (capsule 5e035f41) attribute conversions back to this surface.
 * Test asserts the exact string so a typo here will fail CI.
 */
export const HERO_PRIMARY_CTA_HREF =
  "/agora?utm_source=home&utm_campaign=hero_primary";

/** Primary CTA copy (kept here for reuse + snapshot stability). */
export const HERO_PRIMARY_CTA_LABEL =
  "Begin your council — 3 free agons today";

/** Secondary CTA href for the home hero. */
export const HERO_SECONDARY_CTA_HREF = "/pricing";

/** Secondary CTA copy. */
export const HERO_SECONDARY_CTA_LABEL = "See pricing";

/**
 * Build the social-proof strip shown directly under the H1.
 *
 * Returns a single dotted-separator line, e.g.:
 *   "26 historical minds · Free 3 agons/day · $30/mo Pro for unlimited Opus"
 *
 * Pluralisation: "historical mind" when count === 1.
 * Throws on non-finite or negative input — those values indicate a bug
 * in the upstream framework registry, not a renderable state.
 */
export function formatHeroStats(stats: HeroStats): string {
  const { minds } = stats;
  if (!Number.isFinite(minds)) {
    throw new Error("formatHeroStats: minds must be a finite number");
  }
  if (minds < 0) {
    throw new Error("formatHeroStats: minds must be non-negative");
  }
  const mindLabel = minds === 1 ? "historical mind" : "historical minds";
  return [
    `${minds} ${mindLabel}`,
    HERO_STATS_FREE_TIER_LABEL,
    HERO_STATS_PRO_TIER_LABEL,
  ].join(" · ");
}
