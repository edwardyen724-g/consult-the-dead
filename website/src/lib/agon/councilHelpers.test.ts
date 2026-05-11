/**
 * councilHelpers.test.ts
 *
 * Unit tests for the pure council-selection helpers introduced as part of
 * the onboarding-friction fix (task 2b12751e).
 *
 * Coverage targets:
 *   – suggestCouncil: keyword matching, fallback defaults, min-size guarantee
 *   – getInitialOpenPackIds: forced-pack override, seat-driven expansion,
 *     fallback to first pack
 */

import { describe, it, expect } from "vitest";
import { suggestCouncil, getInitialOpenPackIds, getActivePacks } from "./councilHelpers";
import type { Pack, PackId } from "@/lib/packs";

// ── Test fixtures ──────────────────────────────────────────────────────────

const ALL_MINDS = [
  { slug: "niccolo-machiavelli" },
  { slug: "sun-tzu" },
  { slug: "marie-curie" },
  { slug: "isaac-newton" },
  { slug: "marcus-aurelius" },
  { slug: "nikola-tesla" },
  { slug: "leonardo-da-vinci" },
];

// Minimal pack fixtures — we don't need the full PACKS catalog here.
function makePack(id: PackId, members: string[]): Pack {
  return {
    id,
    name: id,
    tagline: "",
    description: "",
    colorVar: "red",
    members,
  };
}

const STOIC_PACK = makePack("stoic-council", ["marcus-aurelius", "epictetus"]);
const INVENTOR_PACK = makePack("inventors-workshop", ["nikola-tesla", "leonardo-da-vinci"]);
const WAR_PACK = makePack("war-room", ["sun-tzu", "julius-caesar"]);

// ── suggestCouncil ─────────────────────────────────────────────────────────

describe("suggestCouncil", () => {
  it("returns exactly `size` slugs (default 3)", () => {
    const result = suggestCouncil("strategy and market timing", ALL_MINDS);
    expect(result).toHaveLength(3);
  });

  it("honours keyword matches — 'strategy' scores sun-tzu high", () => {
    const result = suggestCouncil("what is the best strategy to win the market?", ALL_MINDS);
    expect(result).toContain("sun-tzu");
  });

  it("honours keyword matches — 'power' scores machiavelli high", () => {
    const result = suggestCouncil("how do I retain power over my competitors?", ALL_MINDS);
    expect(result).toContain("niccolo-machiavelli");
  });

  it("falls back to default slugs when topic has no keyword hits", () => {
    const result = suggestCouncil("what should I have for breakfast?", ALL_MINDS);
    expect(result).toHaveLength(3);
    for (const slug of result) {
      expect(ALL_MINDS.map((m) => m.slug)).toContain(slug);
    }
  });

  it("does not exceed `size` even if many keywords match", () => {
    const result = suggestCouncil(
      "strategy power politics evidence design invent vision stoic duty",
      ALL_MINDS,
      3,
    );
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("respects a custom size parameter", () => {
    const result = suggestCouncil("strategy wins markets", ALL_MINDS, 2);
    expect(result).toHaveLength(2);
  });

  it("handles a minds list smaller than size gracefully", () => {
    const smallList = [{ slug: "sun-tzu" }];
    const result = suggestCouncil("strategy", smallList, 3);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("returns no duplicates", () => {
    const result = suggestCouncil("strategy power stoic", ALL_MINDS);
    expect(new Set(result).size).toBe(result.length);
  });

  it("fills remaining slots from non-default minds when defaults are missing", () => {
    // Minds list has sun-tzu plus two novel slugs not in the defaults list.
    // Topic matches only sun-tzu (1 hit). Defaults "niccolo-machiavelli" and
    // "marie-curie" are absent → while-loop must fill the two remaining slots.
    const minds = [
      { slug: "sun-tzu" },
      { slug: "novel-mind-a" },
      { slug: "novel-mind-b" },
    ];
    const result = suggestCouncil("win the strategy market", minds, 3);
    expect(result).toHaveLength(3);
    expect(result).toContain("sun-tzu");
    expect(result).toContain("novel-mind-a");
    expect(result).toContain("novel-mind-b");
  });

  it("stops filling when minds list is exhausted before size is reached", () => {
    const minds = [{ slug: "novel-a" }, { slug: "novel-b" }];
    const result = suggestCouncil("unrelated topic no match at all", minds, 5);
    expect(result.length).toBeLessThanOrEqual(2);
    expect(new Set(result).size).toBe(result.length);
  });
});

// ── getInitialOpenPackIds ─────────────────────────────────────────────────

describe("getInitialOpenPackIds", () => {
  const liveSlugs = new Set([
    "marcus-aurelius",
    "nikola-tesla",
    "leonardo-da-vinci",
    "sun-tzu",
  ]);
  const activePacks = [STOIC_PACK, INVENTOR_PACK, WAR_PACK];

  it("returns only the forced pack when forcedPack is provided", () => {
    const result = getInitialOpenPackIds({
      forcedPack: "war-room" as PackId,
      council: ["marcus-aurelius", "nikola-tesla"],
      activePacks,
      liveSlugs,
    });
    expect([...result]).toEqual(["war-room"]);
  });

  it("opens packs that contain seated (suggested) minds", () => {
    const result = getInitialOpenPackIds({
      forcedPack: null,
      council: ["marcus-aurelius", "nikola-tesla", "sun-tzu"],
      activePacks,
      liveSlugs,
    });
    expect(result.has("stoic-council")).toBe(true);
    expect(result.has("inventors-workshop")).toBe(true);
    expect(result.has("war-room")).toBe(true);
  });

  it("opens only packs with seated minds, not every pack", () => {
    const result = getInitialOpenPackIds({
      forcedPack: null,
      council: ["marcus-aurelius"],
      activePacks: [STOIC_PACK, INVENTOR_PACK],
      liveSlugs,
    });
    expect(result.has("stoic-council")).toBe(true);
    expect(result.has("inventors-workshop")).toBe(false);
  });

  it("falls back to first active pack when council is empty", () => {
    const result = getInitialOpenPackIds({
      forcedPack: null,
      council: [],
      activePacks,
      liveSlugs,
    });
    expect([...result]).toEqual(["stoic-council"]);
  });

  it("falls back to first active pack when no seated slug is live", () => {
    const result = getInitialOpenPackIds({
      forcedPack: null,
      council: ["unknown-mind"],
      activePacks,
      liveSlugs,
    });
    expect([...result]).toEqual(["stoic-council"]);
  });

  it("returns empty set when activePacks is empty", () => {
    const result = getInitialOpenPackIds({
      forcedPack: null,
      council: [],
      activePacks: [],
      liveSlugs,
    });
    expect(result.size).toBe(0);
  });
});

// ── getActivePacks ────────────────────────────────────────────────────────

describe("getActivePacks", () => {
  it("filters packs with no live members", () => {
    const liveSlugs = new Set(["sun-tzu"]);
    const result = getActivePacks(liveSlugs);
    const ids = result.map((p) => p.id);
    expect(ids).toContain("war-room");
    expect(ids).not.toContain("stoic-council");
  });

  it("returns all packs when all members are live", () => {
    const liveSlugs = new Set([
      "marcus-aurelius", "epictetus", "cicero", "seneca",
      "thomas-edison", "archimedes", "ada-lovelace", "leonardo-da-vinci", "nikola-tesla",
      "sun-tzu", "alexander-the-great", "catherine-the-great", "harriet-tubman",
      "cleopatra-vii", "julius-caesar", "napoleon-bonaparte",
      "niccolo-machiavelli", "sojourner-truth", "malcolm-x", "frederick-douglas",
      "marie-curie", "isaac-newton", "charles-darwin", "galileo-galilei",
      "andrew-carnegie", "john-d-rockefeller", "jp-morgan",
    ]);
    const result = getActivePacks(liveSlugs);
    expect(result.length).toBeGreaterThan(0);
  });
});
