import type { AgonRecord } from "@/lib/db/client";

export type LibraryProgressStats = {
  consultedMinds: number;
  savedDebates: number;
};

type LibraryProgressSource = Pick<AgonRecord, "mind_slugs"> & {
  mind_slugs?: string[] | null;
};

/**
 * Derive the live library progress counts from the saved agons.
 *
 * The consulted-minds figure is cumulative across the full set of unique
 * mind slugs represented in the library, so returning users see the archive
 * growing with every additional debate.
 */
export function getLibraryProgressStats(
  agons: LibraryProgressSource[],
): LibraryProgressStats {
  const consultedMinds = new Set<string>();

  for (const agon of agons) {
    for (const mindSlug of agon.mind_slugs ?? []) {
      consultedMinds.add(mindSlug);
    }
  }

  return {
    consultedMinds: consultedMinds.size,
    savedDebates: agons.length,
  };
}

/**
 * Format the library progress strip labels.
 *
 * Returns short live-data strings suitable for a compact header strip.
 * The copy stays grounded in the counts passed in from the page.
 */
export function formatLibraryProgressStats(
  stats: LibraryProgressStats,
): string[] {
  const { consultedMinds, savedDebates } = stats;

  if (!Number.isFinite(consultedMinds) || !Number.isFinite(savedDebates)) {
    throw new Error("formatLibraryProgressStats: stats must be finite numbers");
  }
  if (consultedMinds < 0 || savedDebates < 0) {
    throw new Error("formatLibraryProgressStats: stats must be non-negative");
  }

  const mindLabel = consultedMinds === 1 ? "mind" : "minds";
  const debateLabel = savedDebates === 1 ? "saved debate" : "saved debates";

  return [
    `${consultedMinds} ${mindLabel} consulted so far`,
    `${savedDebates} ${debateLabel}`,
    "Growing with every return",
  ];
}

/* ── Upsell nudge ───────────────────────────────────────────────── */

/**
 * Returns an upgrade nudge when a Pro user's saved-debate count is
 * approaching or at the monthly cap (100 agons/month), otherwise null.
 *
 * Thresholds:
 *   - ≥ 90 saved (≤ 10 remaining): show "running low" nudge
 *   - ≥ 100 saved (cap reached): show "cap reached" nudge
 *
 * The nudge is purely informational — there is no hard block in the
 * library UI. Rate-limit enforcement happens at /api/agon. This helper
 * drives the notice only.
 */
export type LibraryUpsellNudge = {
  kind: "running-low" | "cap-reached";
  message: string;
  remaining: number;
};

const PRO_MONTHLY_CAP = 100;
const NUDGE_THRESHOLD = 90;

export function getLibraryUpsellNudge(
  savedDebates: number,
): LibraryUpsellNudge | null {
  if (!Number.isFinite(savedDebates) || savedDebates < 0) return null;

  const remaining = Math.max(0, PRO_MONTHLY_CAP - savedDebates);

  if (savedDebates >= PRO_MONTHLY_CAP) {
    return {
      kind: "cap-reached",
      message: `You've reached your 100-agon monthly limit. Older agons are still safe in your library — new consultations resume next month.`,
      remaining: 0,
    };
  }

  if (savedDebates >= NUDGE_THRESHOLD) {
    const plural = remaining === 1 ? "" : "s";
    return {
      kind: "running-low",
      message: `You have ${remaining} consultation${plural} left this month (${savedDebates}/${PRO_MONTHLY_CAP} used).`,
      remaining,
    };
  }

  return null;
}
