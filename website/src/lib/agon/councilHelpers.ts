/**
 * councilHelpers.ts
 *
 * Pure helper functions for Agora council-selection logic.
 * Extracted from AgoraApp.tsx so they can be unit-tested in isolation
 * without a React environment.
 */

import { PACKS, getActivePackMembers, type Pack, type PackId } from "@/lib/packs";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MindEntry {
  slug: string;
}

// ── suggestCouncil ─────────────────────────────────────────────────────────

/**
 * Return an ordered list of mind slugs to pre-seat for `topic`.
 *
 * Strategy:
 *  1. Score each keyworded mind against the topic.
 *  2. If ≥ `size` keyword-matched minds exist, return the top `size`.
 *  3. Otherwise fill up to `size` using preferred defaults, then any
 *     remaining live minds.
 */
export function suggestCouncil(
  topic: string,
  minds: MindEntry[],
  size = 3,
): string[] {
  const t = topic.toLowerCase();
  const keywords: Record<string, string[]> = {
    "niccolo-machiavelli": ["power", "politics", "negotiate", "leverage", "competitor", "rival"],
    "sun-tzu": ["strategy", "compete", "terrain", "market", "timing", "win"],
    "marie-curie": ["evidence", "data", "research", "test", "validate", "study"],
    "isaac-newton": ["first principles", "system", "rebuild", "proof", "fundamental"],
    "leonardo-da-vinci": ["design", "creative", "cross", "combine", "invent", "prototype"],
    "nikola-tesla": ["vision", "future", "invent", "technology", "breakthrough"],
    "marcus-aurelius": ["duty", "virtue", "stoic", "long term", "integrity", "reputation"],
  };

  const scored = minds
    .map((m) => ({
      slug: m.slug,
      score: (keywords[m.slug] ?? []).reduce(
        (acc, kw) => acc + (t.includes(kw) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const topScoring = scored.filter((s) => s.score > 0).map((s) => s.slug);
  if (topScoring.length >= size) {
    return topScoring.slice(0, size);
  }

  const fallback = [...topScoring];
  for (const d of ["niccolo-machiavelli", "sun-tzu", "marie-curie"]) {
    if (fallback.length >= size) break;
    if (!fallback.includes(d) && minds.some((m) => m.slug === d)) fallback.push(d);
  }
  while (fallback.length < size && fallback.length < minds.length) {
    const next = minds.find((m) => !fallback.includes(m.slug));
    if (!next) break;
    fallback.push(next.slug);
  }
  return fallback;
}

// ── getInitialOpenPackIds ──────────────────────────────────────────────────

/**
 * Compute the set of pack IDs that the council accordion should open on first
 * render of the council stage.
 *
 * Rules (in priority order):
 *  1. If `forcedPack` is provided, open exactly that pack.
 *  2. Open every active pack that contains at least one seated (suggested)
 *     mind — so users see their pre-selection without hunting.
 *  3. Fall back to the first active pack if none of the seated slugs are in
 *     any active pack.
 */
export function getInitialOpenPackIds(opts: {
  forcedPack: PackId | null | undefined;
  council: string[];
  activePacks: Pack[];
  liveSlugs: ReadonlySet<string>;
}): ReadonlySet<PackId> {
  const { forcedPack, council, activePacks, liveSlugs } = opts;

  if (forcedPack) return new Set([forcedPack]);

  const withSeated = activePacks
    .filter((p) =>
      getActivePackMembers(p, liveSlugs).some((s) => council.includes(s)),
    )
    .map((p) => p.id);

  if (withSeated.length > 0) return new Set(withSeated);

  // Fallback
  const first = activePacks[0]?.id;
  return first ? new Set([first]) : new Set<PackId>();
}

// ── getActivePacks ─────────────────────────────────────────────────────────

/** Return only packs that have at least one live member. */
export function getActivePacks(liveSlugs: ReadonlySet<string>): Pack[] {
  return PACKS.filter((p) => getActivePackMembers(p, liveSlugs).length > 0);
}
