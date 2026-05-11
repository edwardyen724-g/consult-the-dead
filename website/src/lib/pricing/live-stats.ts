/**
 * Live pricing stats — server-only.
 *
 * Fetches real counts from the database and framework registry.
 * This module must only be imported by server-side code (API routes,
 * Server Components, Server Actions). It is intentionally separate from
 * ./stats.ts so that the /pricing 'use client' page can import the static
 * helpers without dragging Node-only deps (fs, @vercel/postgres) into the
 * browser bundle.
 */

import { sql } from "@vercel/postgres";
import { getAllFrameworks } from "@/lib/frameworks";
import { PACKS, getActivePackMembers } from "@/lib/packs";
import { PRICING_STATS_DEFAULT } from "./stats";
import {
  FREE_AGONS_PER_DAY,
  PRO_AGONS_PER_MONTH,
  PRO_TRIAL_DAYS,
  PRO_MONTHLY_PRICE,
  PRO_ANNUAL_PRICE,
  FOUNDING_MEMBER_ANNUAL_PRICE,
} from "./pricing-constants";

export interface LivePricingStats {
  /** Live count from getAllFrameworks() — matches PricingStats.minds contract. */
  minds: number;
  activePackCount: number;
  agonsRun: number;
  /** Static passthrough from PRICING_STATS_DEFAULT until a live source exists. */
  debatesInLibrary: number;
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
  minds: number;
  activePackCount: number;
  agonsRun: number;
}): LivePricingStats {
  return {
    minds: toSafeInt(input.minds),
    activePackCount: toSafeInt(input.activePackCount),
    agonsRun: toSafeInt(input.agonsRun),
    debatesInLibrary: PRICING_STATS_DEFAULT.debatesInLibrary,
    freeAgonsPerDay: FREE_AGONS_PER_DAY,
    proAgonsPerMonth: PRO_AGONS_PER_MONTH,
    proTrialDays: PRO_TRIAL_DAYS,
    proMonthlyPrice: PRO_MONTHLY_PRICE,
    proAnnualPrice: PRO_ANNUAL_PRICE,
    foundingMemberAnnualPrice: FOUNDING_MEMBER_ANNUAL_PRICE,
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
  const frameworks = getAllFrameworks();
  const minds = frameworks.length;
  const activePackCount = countActivePacks(frameworks);
  const agonsRun = await readAgonsRunCount();

  return buildPricingStats({
    minds,
    activePackCount,
    agonsRun,
  });
}
