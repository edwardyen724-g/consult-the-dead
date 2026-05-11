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
