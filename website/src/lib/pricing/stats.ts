import { sql } from "@vercel/postgres";
import { getAllFrameworks } from "@/lib/frameworks";
import { PACKS, getActivePackMembers } from "@/lib/packs";

export interface PricingStats {
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
}): PricingStats {
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

export async function getPricingStats(): Promise<PricingStats> {
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
