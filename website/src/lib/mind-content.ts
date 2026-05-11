/**
 * Per-mind landing page content loader + UTM CTA URL builder.
 *
 * Long-tail SEO surface at /minds/[id] feeds the conversion funnel by
 * pre-selecting a specific historical mind in the Agora council. CTAs
 * always carry utm_source=mind_page, utm_campaign=longtail_seo so funnel
 * attribution shows up in Vercel Analytics (per the marketing playbook).
 *
 * Content lives in /website/data/minds/<slug>.json (one file per mind)
 * so marketing can iterate copy without touching TS code. The loader is
 * synchronous + filesystem-driven (`fs.readFileSync`) on purpose: every
 * page is statically generated at build time, so this runs once per slug,
 * not per request.
 *
 * Coverage gate: tests in src/lib/__tests__/mind-content.test.ts and
 * src/lib/__tests__/mind-cta-url.test.ts cover the loader + URL builder.
 */
import fs from "fs";
import path from "path";

/* ── Allowed slugs ──
 * 25 active minds — albert-einstein excluded pending Hebrew University
 * trademark legal review (see docs/roster-expansion.md).
 * Includes the 7 roster-expansion minds from task 8987b12a even when those
 * slugs aren't yet in ALLOWED_SLUGS in frameworks.ts (phased rollout). */
export const MIND_SLUGS = [
  "isaac-newton",
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
  "marcus-aurelius",
  "benjamin-franklin",
  "cicero",
  "epictetus",
  "thomas-edison",
  "archimedes",
  "john-d-rockefeller",
  "harriet-tubman",
  "ada-lovelace",
  "catherine-the-great",
  "alexander-the-great",
  "cleopatra-vii",
  "abraham-lincoln",
  "andrew-carnegie",
  "florence-nightingale",
  "frederick-douglass",
  "julius-caesar",
  "napoleon-bonaparte",
  "seneca",
] as const;

export type MindSlug = (typeof MIND_SLUGS)[number];

export interface MindContent {
  /** Framework slug — must be one of the 25 active MIND_SLUGS. */
  slug: MindSlug;
  /** SEO H1 (also used as <title>). Keyword in first 60 chars. */
  h1: string;
  /** SEO meta description (≤160 chars per brief). Keyword present. */
  metaDescription: string;
  /** 8–12 word tagline capturing the mind's signature contribution. */
  famousFor: string;
  /** 1-paragraph debate behavior description (~80–120 words). */
  howTheyArgue: string;
  /** 2–3 sample debate quotes. */
  sampleQuotes: string[];
  /** CTA button label variants. */
  ctaVariants: string[];
}

/** Path to the JSON data directory. Resolved relative to CWD (website/) so
 *  it works in both `next build` and vitest. */
const DATA_DIR = path.join(process.cwd(), "data", "minds");

/** Cache the parsed JSON per slug. Build-time generation hits each slug once,
 *  but the dev server may render multiple times — small map keeps re-parse off. */
const CACHE = new Map<MindSlug, MindContent>();

/** Type-guard: is this string one of the 25 allowed mind slugs? */
export function isMindSlug(slug: string): slug is MindSlug {
  return (MIND_SLUGS as readonly string[]).includes(slug);
}

/**
 * Load a mind JSON file from disk and validate its shape.
 *
 * Returns null when given an unknown slug (caller should `notFound()`).
 * Throws on:
 *  - missing/unreadable JSON file
 *  - JSON parse error
 *  - structural mismatch (missing required field, wrong type)
 *  - slug field doesn't match the requested slug (file rename / typo guard)
 */
export function getMindContent(slug: string): MindContent | null {
  if (!isMindSlug(slug)) return null;

  const cached = CACHE.get(slug);
  if (cached) return cached;

  const filePath = path.join(DATA_DIR, `${slug}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const validated = validateMindContent(parsed, slug);
  CACHE.set(slug, validated);
  return validated;
}

/** Internal: assert the parsed JSON matches the MindContent shape. */
export function validateMindContent(
  data: unknown,
  expectedSlug: MindSlug,
): MindContent {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Mind ${expectedSlug}: payload is not an object`);
  }
  const d = data as Record<string, unknown>;

  if (d.slug !== expectedSlug) {
    throw new Error(
      `Mind ${expectedSlug}: slug field "${String(d.slug)}" mismatches filename`,
    );
  }
  for (const k of ["h1", "metaDescription", "famousFor", "howTheyArgue"]) {
    if (typeof d[k] !== "string" || (d[k] as string).length === 0) {
      throw new Error(`Mind ${expectedSlug}: field "${k}" must be a non-empty string`);
    }
  }
  if (!Array.isArray(d.sampleQuotes) || d.sampleQuotes.length < 1) {
    throw new Error(`Mind ${expectedSlug}: sampleQuotes must be a non-empty array`);
  }
  for (const q of d.sampleQuotes) {
    if (typeof q !== "string") {
      throw new Error(`Mind ${expectedSlug}: sampleQuotes entries must be strings`);
    }
  }
  if (!Array.isArray(d.ctaVariants) || d.ctaVariants.length < 1) {
    throw new Error(`Mind ${expectedSlug}: ctaVariants must be a non-empty array`);
  }
  for (const v of d.ctaVariants) {
    if (typeof v !== "string") {
      throw new Error(`Mind ${expectedSlug}: ctaVariants entries must be strings`);
    }
  }
  return data as MindContent;
}

/** Public site origin. Mirrors SITE_URL in src/app/sitemap.ts. */
export const SITE_URL = "https://www.consultthedead.com";

/**
 * Build the UTM-tagged /agora pre-fill URL for a per-mind CTA.
 *
 * Example output for isaac-newton:
 *   /agora?mind=isaac-newton&utm_source=mind_page&utm_campaign=longtail_seo
 *
 * Returns empty string for unknown slugs so callers can guard without crashing.
 */
export function buildMindCtaUrl(slug: string): string {
  if (!isMindSlug(slug)) return "";
  return (
    `/agora?mind=${slug}` +
    `&utm_source=mind_page` +
    `&utm_campaign=longtail_seo`
  );
}

/** Canonical URL for a per-mind landing page (used in sitemap + <link rel=canonical>). */
export function mindCanonicalUrl(slug: MindSlug): string {
  return `${SITE_URL}/minds/${slug}`;
}
