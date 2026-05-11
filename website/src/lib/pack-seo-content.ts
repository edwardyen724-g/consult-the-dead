/**
 * Pack SEO content helpers.
 *
 * Pure helpers consumed by the programmatic /packs/[id] long-tail SEO
 * landing pages. Kept separate from packs.ts so packs.ts (Edge-safe,
 * client-importable) does not absorb SEO copy / page-only concerns.
 *
 * Scope:
 *   - URL builder for the "Convene this Council" CTA (UTM-stamped)
 *   - Per-pack sample agon prompts (3 each, themed)
 *   - Per-pack page metadata (title + description)
 *   - Pure member-resolution wrapper that delegates to packs.ts
 *   - Canonical URL builder used by JSON-LD CollectionPage
 *
 * Out of scope (kept in packs.ts):
 *   - PACK catalog
 *   - getActivePackMembers (called via wrapper here so callers can mock)
 */
import {
  PACKS,
  getPack,
  getActivePackMembers,
  type Pack,
  type PackId,
} from "./packs";

export const PACK_UTM_SOURCE = "pack";
export const PACK_UTM_CAMPAIGN = "longtail_seo";
export const PACK_CANONICAL_BASE = "https://www.consultthedead.com";

/* ── Per-pack page metadata (SEO title + meta description) ── */

interface PackSeoMeta {
  /** <title> tag — keyword-front, brand suffix. */
  title: string;
  /** <meta name="description"> — 140-160 chars ideally. */
  description: string;
  /** H1 used on the page itself. */
  heading: string;
  /** Italic intro paragraph rendered above the member grid. */
  intro: string;
}

const PACK_META: Record<PackId, PackSeoMeta> = {
  "stoic-council": {
    title: "Stoic Council — Marcus Aurelius, Epictetus, Seneca, Cicero | Consult The Dead",
    description:
      "Convene a council of Stoic minds — Marcus Aurelius, Epictetus, Seneca, Cicero — to weigh your hardest decision. Built from documented historical incidents, not quotes.",
    heading: "The Stoic Council",
    intro:
      "When you need to carry a hard decision without flinching: the emperor who wrote at midnight, the slave who out-argued his masters, the statesman who chose duty over comfort. Bring a question you can't decide alone, and watch them disagree about it on the record.",
  },
  "inventors-workshop": {
    title: "Inventors' Workshop — Edison, Tesla, da Vinci, Lovelace | Consult The Dead",
    description:
      "Convene the Inventors' Workshop — Edison, Tesla, Leonardo da Vinci, Ada Lovelace, Archimedes — to argue your build/buy/patent decision. Frameworks from documented incidents.",
    heading: "The Inventors' Workshop",
    intro:
      "The makers and tinkerers — minds who turned curiosity into machines, mathematics into industry, and proved a single workshop can move the world. Pose a build, prototype, or patent question and let them argue it through their own decision frameworks.",
  },
  "war-room": {
    title: "War Room — Sun Tzu, Alexander, Napoleon, Caesar | Consult The Dead",
    description:
      "Convene the War Room — Sun Tzu, Alexander the Great, Napoleon, Caesar, Cleopatra — for strategy, market warfare, or competitive timing decisions. Council debate from documented battles.",
    heading: "The War Room",
    intro:
      "Generals, conquerors, and covert operators. They thought in terrain and timing, in feints and fait accomplis, in what an opponent must believe before the first move is made. Pose a strategy question and watch the room disagree.",
  },
  "republic": {
    title: "The Republic — Machiavelli, Cicero, Lincoln, Franklin | Consult The Dead",
    description:
      "Convene The Republic — Machiavelli, Cicero, Lincoln, Franklin, Catherine the Great — for statecraft, governance, and political-power decisions. Frameworks from documented history.",
    heading: "The Republic",
    intro:
      "The architects of states. They wrote constitutions, ran spy networks, founded nations, and asked the question every leader must eventually face: who holds power, and on what terms. Bring an org-design or political-capital question.",
  },
  "trailblazers": {
    title: "Trailblazers — Tubman, Curie, Nightingale, Douglass | Consult The Dead",
    description:
      "Convene the Trailblazers — Harriet Tubman, Marie Curie, Florence Nightingale, Frederick Douglass — for breaking a barrier or pioneering a contested path. Frameworks from documented decisions.",
    heading: "The Trailblazers",
    intro:
      "Minds who walked through doors that were not supposed to open for them — and walked through anyway, with the receipts to prove it could be done. Bring a question about a path no one in your circle has walked.",
  },
  "moguls": {
    title: "The Moguls — Rockefeller, Carnegie, Newton, Caesar | Consult The Dead",
    description:
      "Convene The Moguls — Rockefeller, Carnegie, Newton, Napoleon, Caesar — for capital allocation, compounding strategy, and empire-scale decisions. Frameworks from documented incidents.",
    heading: "The Moguls",
    intro:
      "The compounders. They saw how a small advantage, ruthlessly reinvested, becomes a fortune, a discipline, a calendar named after them. Bring an allocation or scaling question that needs a long-game perspective.",
  },
};

/* ── Per-pack sample agon prompts (3 each, themed to the pack) ── */

const PACK_SAMPLE_PROMPTS: Record<PackId, string[]> = {
  "stoic-council": [
    "Should I quit my safe job to build my own thing?",
    "My business partner is underperforming — when does loyalty become a liability?",
    "Everything is going wrong this quarter — what's actually within my control?",
  ],
  "inventors-workshop": [
    "Do I patent my prototype or open-source it for adoption?",
    "I've failed at this build 12 times — pivot or persist?",
    "I'm stuck between two creative directions — how do I prototype both cheaply?",
  ],
  "war-room": [
    "Should I compete head-on with the market leader or find an uncontested niche?",
    "We need to move faster than our resources allow — where do I concentrate force?",
    "A competitor just announced our exact roadmap — how do I respond?",
  ],
  "republic": [
    "I inherited a broken organization — what do I modernize first?",
    "How do I frame an unpopular decision so my team actually follows through?",
    "My co-founder wants to bring on a third partner — what's the power dynamic?",
  ],
  "trailblazers": [
    "I'm the first person from my background in this room — how do I keep my edge?",
    "I need to execute a risky plan with unreliable people — how do I structure it?",
    "I see a pattern across our failures — how do I turn that into a system?",
  ],
  "moguls": [
    "I'm profitable but small — should I reinvest everything or take profit?",
    "I have $X to deploy — single concentrated bet or diversified portfolio?",
    "How do I structure equity so reinvestment compounds for a decade?",
  ],
};

/* ── Public helpers ── */

/** All known pack IDs, in display order (matches PACKS). */
export function listPackIds(): PackId[] {
  return PACKS.map((p) => p.id);
}

/** Throws if id is not a known pack. */
export function getPackOrThrow(id: PackId): Pack {
  const pack = getPack(id);
  if (!pack) {
    throw new Error(`Unknown pack id: ${id}`);
  }
  return pack;
}

/** Returns SEO metadata (title/description/heading/intro) for a pack id. */
export function getPackSeoMeta(id: PackId): PackSeoMeta {
  const meta = PACK_META[id];
  if (!meta) {
    throw new Error(`No SEO metadata for pack id: ${id}`);
  }
  return meta;
}

/** Returns 3 sample agon prompts for a pack. */
export function getPackPrompts(id: PackId): string[] {
  const prompts = PACK_SAMPLE_PROMPTS[id];
  if (!prompts) {
    throw new Error(`No prompts for pack id: ${id}`);
  }
  return prompts;
}

/**
 * Resolve a pack id to the slugs that are actually live in the provided
 * roster (order preserved from PACKS.members).
 *
 * Returns an empty array if the pack is unknown OR no members are live.
 * (Empty result is a render-time signal to the caller to 404 / hide.)
 */
export function resolvePackMembers(
  id: PackId,
  liveSlugs: ReadonlySet<string>,
): string[] {
  const pack = getPack(id);
  if (!pack) return [];
  return getActivePackMembers(pack, liveSlugs);
}

/**
 * Build the "Convene this Council" CTA URL with UTM params.
 *
 * Encoding: slugs are joined with `,` and the whole `minds` value is
 * passed through URLSearchParams (which percent-encodes any unsafe
 * glyphs). The post-stringify replace turns the `%2C` separators back
 * into raw `,` so the agora page's `?minds=`.split(",") parses cleanly.
 *
 * Throws if `slugs` is empty — callers should 404 the page when no live
 * minds are available rather than emit a CTA that prefills nothing.
 */
export function agoraUrlForPack(
  id: PackId,
  slugs: ReadonlyArray<string>,
): string {
  if (slugs.length === 0) {
    throw new Error(`agoraUrlForPack: refused to build CTA URL for empty slugs (pack=${id})`);
  }
  const params = new URLSearchParams({
    minds: slugs.join(","),
    utm_source: PACK_UTM_SOURCE,
    utm_campaign: PACK_UTM_CAMPAIGN,
    utm_content: id,
  });
  // URLSearchParams escapes the `,` separators (and uses `+` for spaces).
  // Restore raw commas so /agora can split, and convert `+` back to `%20`
  // so links remain valid in non-form-urlencoded contexts (Slack, plain
  // browsers, RSS readers etc.).
  const qs = params.toString().replace(/%2C/g, ",").replace(/\+/g, "%20");
  return `/agora?${qs}`;
}

/** Canonical https:// URL for a pack page (used by JSON-LD + OG). */
export function packCanonicalUrl(id: PackId): string {
  return `${PACK_CANONICAL_BASE}/packs/${id}`;
}
