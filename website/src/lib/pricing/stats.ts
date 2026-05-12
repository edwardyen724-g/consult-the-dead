/**
 * Pricing page stats counter.
 *
 * Static values for v1 (per marketing brief 22ee79de §Part 4 Variant A:
 * "Capability signal — available now, static"). The `agonsRun` field is
 * populated at runtime by fetching `/api/stats` from the client. Until
 * that fetch resolves, the field is `undefined` and omitted from the
 * rendered strip.
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
  /**
   * Live total agon count fetched from /api/stats.
   * When `undefined` the stat is omitted from the hero strip so the
   * static fallback never shows a misleading zero.
   */
  agonsRun?: number;
};

/**
 * Fallback stats used by `/pricing` when live counts are unavailable.
 * Source of truth for the seeded fallback: `website/src/lib/frameworks.ts`
 * ALLOWED_SLUGS length (minds) and `docs/outreach-debates/*.md` count
 * (debatesInLibrary).
 *
 * NOTE: kept hard-coded here rather than computed at build time to avoid
 * pulling the framework registry into the pricing page bundle. Update both
 * places when the roster grows.
 */
export const PRICING_STATS_DEFAULT: PricingStats = {
  minds: 18,
  debatesInLibrary: 30,
};

/**
 * Format the stats row shown below the pricing hero.
 *
 * Returns an ordered list of short label strings, e.g.:
 *   ["18 minds", "30 debates in the library", "1,234 agons run", "Free to start"]
 *
 * The `agonsRun` label is only included when `stats.agonsRun` is defined so
 * the strip always shows meaningful social proof — never a zero placeholder.
 *
 * Pluralization: drops the trailing "s" when count === 1 so a future
 * single-mind / single-debate / single-agon state still reads correctly.
 *
 * Throws if any provided count is negative or non-finite — those values
 * indicate a bug in the upstream source, not a renderable state.
 */
export function formatPricingStats(stats: PricingStats): string[] {
  const { minds, debatesInLibrary, agonsRun } = stats;

  if (!Number.isFinite(minds) || !Number.isFinite(debatesInLibrary)) {
    throw new Error('formatPricingStats: stats must be finite numbers');
  }
  if (minds < 0 || debatesInLibrary < 0) {
    throw new Error('formatPricingStats: stats must be non-negative');
  }
  if (agonsRun !== undefined) {
    if (!Number.isFinite(agonsRun)) {
      throw new Error('formatPricingStats: agonsRun must be a finite number');
    }
    if (agonsRun < 0) {
      throw new Error('formatPricingStats: agonsRun must be non-negative');
    }
  }

  const mindLabel = minds === 1 ? 'mind' : 'minds';
  const debateLabel = debatesInLibrary === 1 ? 'debate' : 'debates';

  const labels: string[] = [
    `${minds} ${mindLabel}`,
    `${debatesInLibrary} ${debateLabel} in the library`,
  ];

  if (agonsRun !== undefined) {
    const agonLabel = agonsRun === 1 ? 'agon run' : 'agons run';
    labels.push(`${agonsRun} ${agonLabel}`);
  }

  labels.push('Free to start');

  return labels;
}
