/**
 * Unit tests for pack-seo-content helpers.
 *
 * Coverage targets:
 *   - listPackIds (membership + display order)
 *   - getPackOrThrow (happy + throw)
 *   - getPackSeoMeta (every pack id has meta)
 *   - getPackPrompts (every pack id returns 3 strings)
 *   - resolvePackMembers (happy + unknown id + filtered roster)
 *   - agoraUrlForPack (UTM stamping + comma round-trip + empty rejection)
 *   - packCanonicalUrl (https + path)
 *
 * Run with: `npm test -w website` (vitest globals).
 */
import { describe, it, expect } from "vitest";
import { PACKS, type PackId } from "./packs";
import {
  PACK_CANONICAL_BASE,
  PACK_UTM_CAMPAIGN,
  PACK_UTM_SOURCE,
  agoraUrlForPack,
  getPackOrThrow,
  getPackPrompts,
  getPackSeoMeta,
  listPackIds,
  packCanonicalUrl,
  resolvePackMembers,
} from "./pack-seo-content";

const ALL_PACK_IDS = PACKS.map((p) => p.id) as PackId[];

describe("listPackIds", () => {
  it("returns 6 pack ids matching the PACKS catalog order", () => {
    expect(listPackIds()).toEqual([
      "stoic-council",
      "inventors-workshop",
      "war-room",
      "republic",
      "trailblazers",
      "moguls",
    ]);
  });
});

describe("getPackOrThrow", () => {
  it("returns the pack object for every known id", () => {
    for (const id of ALL_PACK_IDS) {
      const p = getPackOrThrow(id);
      expect(p.id).toBe(id);
      expect(p.name.length).toBeGreaterThan(0);
    }
  });

  it("throws on an unknown pack id", () => {
    expect(() => getPackOrThrow("not-a-pack" as PackId)).toThrow();
  });
});

describe("getPackSeoMeta", () => {
  it("returns title/description/heading/intro for every pack id", () => {
    for (const id of ALL_PACK_IDS) {
      const meta = getPackSeoMeta(id);
      expect(meta.title.length).toBeGreaterThan(20);
      expect(meta.description.length).toBeGreaterThan(80);
      expect(meta.description.length).toBeLessThanOrEqual(220);
      expect(meta.heading.length).toBeGreaterThan(0);
      expect(meta.intro.length).toBeGreaterThan(40);
    }
  });

  it("titles include the brand suffix Consult The Dead", () => {
    for (const id of ALL_PACK_IDS) {
      expect(getPackSeoMeta(id).title.includes("Consult The Dead")).toBe(true);
    }
  });

  it("throws on an unknown pack id", () => {
    expect(() => getPackSeoMeta("not-a-pack" as PackId)).toThrow();
  });
});

describe("getPackPrompts", () => {
  it("returns exactly 3 non-empty prompts for every pack id", () => {
    for (const id of ALL_PACK_IDS) {
      const prompts = getPackPrompts(id);
      expect(prompts.length).toBe(3);
      for (const p of prompts) {
        expect(typeof p).toBe("string");
        expect(p.length).toBeGreaterThan(0);
      }
    }
  });

  it("throws on an unknown pack id", () => {
    expect(() => getPackPrompts("not-a-pack" as PackId)).toThrow();
  });
});

describe("resolvePackMembers", () => {
  it("returns members in declaration order for the live roster", () => {
    // Stoic council members: marcus-aurelius, epictetus, cicero, seneca.
    // Live roster (today) excludes seneca.
    const live = new Set([
      "marcus-aurelius",
      "epictetus",
      "cicero",
      "isaac-newton", // unrelated, just to prove non-members are ignored
    ]);
    const out = resolvePackMembers("stoic-council", live);
    expect(out).toEqual(["marcus-aurelius", "epictetus", "cicero"]);
  });

  it("returns an empty array for an unknown pack id", () => {
    const out = resolvePackMembers("not-a-pack" as PackId, new Set(["isaac-newton"]));
    expect(out).toEqual([]);
  });

  it("returns an empty array when no members are live", () => {
    const out = resolvePackMembers("stoic-council", new Set(["isaac-newton"]));
    expect(out).toEqual([]);
  });
});

describe("agoraUrlForPack", () => {
  it("stamps utm_source=pack utm_campaign=longtail_seo utm_content=<id>", () => {
    const url = agoraUrlForPack("stoic-council", ["marcus-aurelius", "epictetus", "cicero"]);
    expect(url.startsWith("/agora?")).toBe(true);
    expect(url.includes(`utm_source=${PACK_UTM_SOURCE}`)).toBe(true);
    expect(url.includes(`utm_campaign=${PACK_UTM_CAMPAIGN}`)).toBe(true);
    expect(url.includes("utm_content=stoic-council")).toBe(true);
  });

  it("preserves comma-separated minds (not %2C-encoded) so /agora can split", () => {
    const url = agoraUrlForPack("war-room", ["sun-tzu", "alexander-the-great"]);
    expect(url.includes("minds=sun-tzu,alexander-the-great")).toBe(true);
    expect(url.includes("%2C")).toBe(false);
  });

  it("URL-encodes individual slug glyphs (defensive — no current slug needs it)", () => {
    const url = agoraUrlForPack("republic", ["a slug/with space", "ok"]);
    // The space and slash should be percent-encoded, the joining comma must not be.
    expect(url.includes("a%20slug%2Fwith%20space,ok")).toBe(true);
  });

  it("throws when slugs is empty (caller should 404 instead)", () => {
    expect(() => agoraUrlForPack("moguls", [])).toThrow();
  });

  it("constructs a valid relative URL parseable by URL constructor", () => {
    const url = agoraUrlForPack("inventors-workshop", ["thomas-edison", "ada-lovelace"]);
    const parsed = new URL(url, "https://www.consultthedead.com");
    expect(parsed.pathname).toBe("/agora");
    expect(parsed.searchParams.get("utm_source")).toBe("pack");
    expect(parsed.searchParams.get("utm_campaign")).toBe("longtail_seo");
    expect(parsed.searchParams.get("utm_content")).toBe("inventors-workshop");
    expect(parsed.searchParams.get("minds")).toBe("thomas-edison,ada-lovelace");
  });
});

describe("packCanonicalUrl", () => {
  it("returns https://www.consultthedead.com/packs/<id>", () => {
    expect(packCanonicalUrl("stoic-council")).toBe(`${PACK_CANONICAL_BASE}/packs/stoic-council`);
    expect(packCanonicalUrl("moguls")).toBe(`${PACK_CANONICAL_BASE}/packs/moguls`);
  });

  it("base constant uses https + www host (canonical for SEO)", () => {
    expect(PACK_CANONICAL_BASE.startsWith("https://www.")).toBe(true);
  });
});
