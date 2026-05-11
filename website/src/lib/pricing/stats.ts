import { sql } from "@vercel/postgres";
import { PACKS, getActivePackMembers } from "@/lib/packs";

// ── Static pricing stats (used by /pricing client component) ───────────────────
//
// Kept as static values rather than computed at build time so that the
// framework registry (which reads from the filesystem) is never bundled into
// the client-side pricing page.

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
  minds: 18,
  debatesInLibrary: 30,
};

/**
 * Format the stats row shown below the pricing hero.
 *
 * Returns an ordered list of short label strings, e.g.:
 *   ["18 minds", "30 debates in the library", "Free to start"]
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

// ── Live pricing stats (used by /api/stats server route) ────────────────────────
//
// These are fetched dynamically from the database and framework registry.
// getAllFrameworks() uses Node.js `fs` so it must only be called server-side.

export interface LivePricingStats {
  frameworkCount: number;
  activePackCount: number;
  agonsRun: number;
  freeAgonsPerDay: number;
  proAgonsPerMonth: number;
  proTrialDays: number;
  proMonthlyPrice: number;
  proAnnualPrice: number;
  foundingMemberAnnualPrice: number;
}

function toSafeInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
}

export function buildPricingStats(input: {
  frameworkCount: number;
  activePackCount: number;
  agonsRun: number;
}): LivePricingStats {
  return {
    frameworkCount: toSafeInt(input.frameworkCount),
    activePackCount: toSafeInt(input.activePackCount),
    agonsRun: toSafeInt(input.agonsRun),
    freeAgonsPerDay: 3,
    proAgonsPerMonth: 100,
    proTrialDays: 7,
    proMonthlyPrice: 30,
    proAnnualPrice: 300,
    foundingMemberAnnualPrice: 300,
  };
}

async function readAgonsRunCount(): Promise<number> {
  const result = await sql<{ count: string | number }>`
    SELECT COUNT(*)::int AS count
    FROM agons
  `;
  return toSafeInt(result.rows[0]?.count ?? 0);
}

function countActivePacks(frameworks: Array<{ slug: string }>): number {
  const liveSlugs = new Set(frameworks.map((framework) => framework.slug));

  return PACKS.filter((pack) => getActivePackMembers(pack, liveSlugs).length > 0).length || 0;
}

export async function getPricingStats(): Promise<LivePricingStats> {
  // Dynamic import keeps getAllFrameworks (which reads from the filesystem via
  // Node's `fs`) out of the client bundle. The /pricing page is 'use client'
  // and imports this module for the static formatPricingStats helper; a
  // top-level static import of frameworks.ts would break the browser build.
  const { getAllFrameworks } = await import("@/lib/frameworks");
  const frameworks = getAllFrameworks();
  const frameworkCount = frameworks.length;
  const activePackCount = countActivePacks(frameworks);
  const agonsRun = await readAgonsRunCount();

  return buildPricingStats({
    frameworkCount,
    activePackCount,
    agonsRun,
  });
}
