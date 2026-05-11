/**
 * Pricing page stats counter.
 *
 * Static values for v1 (per marketing brief 22ee79de §Part 4 Variant A:
 * "Capability signal — available now, static"). When task 55af6ebe lands,
 * the live `agora_self_run` event count from Vercel Analytics can replace
 * the static minds/debatesInLibrary numbers without changing the page JSX
 * — just swap the source feeding `formatPricingStats`.
 *
 * NOTE: this file is imported by the /pricing 'use client' page and must
 * remain free of server-only dependencies (Node fs, @vercel/postgres, etc.).
 * Live/dynamic stats live in ./live-stats.ts (server-only).
 */

export type PricingStats = {
  /** Number of historical minds available in the council. */
  minds: number;
  /** Number of seeded debates in the public library (outreach transcripts). */
  debatesInLibrary: number;
};

/**
 * Default static stats used by `/pricing` until live counters ship.
 * Source of truth: `website/src/lib/frameworks.ts` ALLOWED_SLUGS length
 * (minds) and `docs/outreach-debates/*.md` count (debatesInLibrary).
 *
 * NOTE: kept hard-coded here rather than computed at build time to avoid
 * pulling the framework registry into the pricing page bundle. Update both
 * places when the roster grows.
 */
export const PRICING_STATS_DEFAULT: PricingStats = {
  minds: 26,
  debatesInLibrary: 30,
};

/**
 * Format the stats row shown below the pricing hero.
 *
 * Returns an ordered list of short label strings, e.g.:
 *   ["26 minds", "30 debates in the library", "Free to start"]
 *
 * Pluralization: drops the trailing "s" when count === 1 so a future
 * single-mind / single-debate state still reads correctly.
 *
 * Throws if either count is negative or non-finite — those values
 * indicate a bug in the upstream source, not a renderable state.
 */
export function formatPricingStats(stats: PricingStats): string[] {
  const { minds, debatesInLibrary } = stats;

  if (!Number.isFinite(minds) || !Number.isFinite(debatesInLibrary)) {
    throw new Error('formatPricingStats: stats must be finite numbers');
  }
  if (minds < 0 || debatesInLibrary < 0) {
    throw new Error('formatPricingStats: stats must be non-negative');
  }

  const mindLabel = minds === 1 ? 'mind' : 'minds';
  const debateLabel = debatesInLibrary === 1 ? 'debate' : 'debates';

  return [
    `${minds} ${mindLabel}`,
    `${debatesInLibrary} ${debateLabel} in the library`,
    'Free to start',
  ];
}
