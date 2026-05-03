/* ── Pack catalog ──
 *
 * Packs are themed collections used purely for browse/organization in
 * the UI; they do not change debate mechanics. A mind may belong to
 * multiple packs.
 *
 * `members` lists the *aspirational* roster — i.e. every mind we'd want
 * in the pack eventually. The website only renders members that are
 * actually live (see `getActivePackMembers`), so it is safe to include
 * slugs that aren't extracted yet.
 *
 * This module avoids importing from `frameworks.ts` because that file
 * uses Node-only APIs (fs/path) and cannot be bundled into a client
 * component. Callers pass the live slug set in.
 */

export type PackId =
  | "stoic-council"
  | "inventors-workshop"
  | "war-room"
  | "republic"
  | "trailblazers"
  | "moguls";

export interface Pack {
  id: PackId;
  name: string;
  description: string;
  /** Single-sentence pitch shown on pack cards. */
  tagline: string;
  /** CSS custom-property name (defined in globals.css). */
  colorVar: string;
  /** Aspirational member list — filtered to ALLOWED_SLUGS at render time. */
  members: string[];
}

export const PACKS: Pack[] = [
  {
    id: "stoic-council",
    name: "Stoic Council",
    tagline: "Inner resilience, duty, rational governance.",
    description:
      "The minds who taught the West how to carry a hard decision without flinching — emperors who wrote at midnight, slaves who out-argued their masters, statesmen who chose duty over comfort.",
    colorVar: "var(--pack-stoic-council)",
    members: ["marcus-aurelius", "epictetus", "cicero", "seneca"],
  },
  {
    id: "inventors-workshop",
    name: "Inventors' Workshop",
    tagline: "Systematic invention, applied genius.",
    description:
      "The makers and tinkerers — minds who turned curiosity into machines, mathematics into industry, and proved that a single workshop can move the world.",
    colorVar: "var(--pack-inventors-workshop)",
    members: [
      "thomas-edison",
      "archimedes",
      "ada-lovelace",
      "leonardo-da-vinci",
      "nikola-tesla",
    ],
  },
  {
    id: "war-room",
    name: "War Room",
    tagline: "Strategy, conquest, covert operations.",
    description:
      "Generals, conquerors, and covert operators. They thought in terrain and timing, in feints and fait accomplis, in what an opponent must believe before the first move is made.",
    colorVar: "var(--pack-war-room)",
    members: [
      "sun-tzu",
      "alexander-the-great",
      "catherine-the-great",
      "harriet-tubman",
      "cleopatra-vii",
      "julius-caesar",
      "napoleon-bonaparte",
    ],
  },
  {
    id: "republic",
    name: "The Republic",
    tagline: "Statecraft, political philosophy, the long game of power.",
    description:
      "The architects of states. They wrote constitutions, ran spy networks, founded nations, and asked the question every leader must eventually face: who holds power, and on what terms.",
    colorVar: "var(--pack-republic)",
    members: [
      "niccolo-machiavelli",
      "catherine-the-great",
      "cicero",
      "cleopatra-vii",
      "benjamin-franklin",
      "abraham-lincoln",
      "frederick-douglass",
    ],
  },
  {
    id: "trailblazers",
    name: "Trailblazers",
    tagline: "Pioneers who broke the barriers.",
    description:
      "Minds who walked through doors that were not supposed to open for them — and walked through anyway, with the receipts to prove it could be done.",
    colorVar: "var(--pack-trailblazers)",
    members: [
      "harriet-tubman",
      "florence-nightingale",
      "frederick-douglass",
      "marie-curie",
    ],
  },
  {
    id: "moguls",
    name: "The Moguls",
    tagline: "Empire builders, industrial and intellectual titans.",
    description:
      "The compounders. They saw how a small advantage, ruthlessly reinvested, becomes a fortune, a discipline, a calendar named after them.",
    colorVar: "var(--pack-moguls)",
    members: [
      "john-d-rockefeller",
      "andrew-carnegie",
      "isaac-newton",
      "julius-caesar",
      "napoleon-bonaparte",
    ],
  },
];

/** Lookup a pack by id. */
export function getPack(id: PackId): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

/** Members of a pack that are actually live in the provided slug set. */
export function getActivePackMembers(
  pack: Pack,
  liveSlugs: ReadonlySet<string>,
): string[] {
  return pack.members.filter((slug) => liveSlugs.has(slug));
}

/** Packs containing at least one live mind, in display order. */
export function getActivePacks(liveSlugs: ReadonlySet<string>): Pack[] {
  return PACKS.filter(
    (p) => getActivePackMembers(p, liveSlugs).length > 0,
  );
}

/** All packs a given mind belongs to. Stable order matches PACKS. */
export function getPacksForMind(slug: string): Pack[] {
  return PACKS.filter((p) => p.members.includes(slug));
}
