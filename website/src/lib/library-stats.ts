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
