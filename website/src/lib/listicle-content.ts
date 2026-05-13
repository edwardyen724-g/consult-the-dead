/**
 * Listicle content loader + UTM CTA URL builder.
 *
 * Long-tail SEO surface at /listicles/[slug] feeds the conversion funnel
 * by pre-loading the Agora council with the suggested minds. CTAs always
 * carry utm_source=listicle, utm_campaign=longtail_seo, utm_content=<slug>
 * so funnel attribution shows up in Vercel Analytics + Stripe metadata
 * (per the marketing playbook §8 server-side hooks wiring).
 *
 * Content lives in /website/data/listicles/<slug>.json (one file per topic)
 * so marketing can iterate copy without touching TS code. The loader is
 * synchronous + filesystem-driven (`fs.readFileSync`) on purpose: every
 * page is statically generated at build time, so this runs once per slug,
 * not per request.
 *
 * Coverage gate: tests in __tests__/listicle-content.test.ts and
 * __tests__/listicle-cta-url.test.ts cover the loader + URL builder.
 */
import fs from "fs";
import path from "path";

/* ── Allowed slugs ──
 * Marketing brief listicle-content-brief-2026-05-08.md prioritises in
 * descending traffic estimate; preserved here as DISPLAY_ORDER. */
export const LISTICLE_SLUGS = [
  "startup-pivot",
  "career-change",
  "leadership-crisis",
  "investing-risk",
  "product-strategy",
  // Wave 10 additions — high-traffic founder pain points
  "founder-burnout",
  "co-founder-conflict",
  "pricing-decision",
  // Wave 13 additions — hiring and funding decisions
  "hiring-first-employee",
  "raising-startup-funding",
] as const;

export type ListicleSlug = (typeof LISTICLE_SLUGS)[number];

export interface ListicleMind {
  /** Mind framework slug — must match an entry in ALLOWED_SLUGS for /agora pre-fill to work. */
  slug: string;
  /** Display name for the listicle table (uses real diacritics, e.g. "Niccolò"). */
  name: string;
  /** Why this mind is on this debate. Marketing-controlled copy. */
  rationale: string;
}

export interface ListicleContent {
  slug: ListicleSlug;
  /** SEO H1 (also used as <title>). Keyword in first 60 chars. */
  h1: string;
  /** SEO meta description (≤160 chars per brief). Keyword present. */
  metaDescription: string;
  /** Topic value sent to the /agora ?topic= param (URL-encoded by buildCtaUrl). */
  topicForCta: string;
  /** Intro paragraphs (200-300w total per brief), rendered in order. */
  intro: string[];
  /** 3-4 council minds, rendered as a table on the page. */
  minds: ListicleMind[];
  /** Headline above the CTA button. */
  ctaHeadline: string;
  /** CTA button label. */
  ctaButtonLabel: string;
  /** Sub-line under the CTA button (e.g. "Free. No signup required..."). */
  ctaSubtext: string;
}

/** Path to the JSON data directory. Resolved relative to repo root so it works
 *  in both `next build` (CWD = website/) and vitest (CWD = website/). */
const DATA_DIR = path.join(process.cwd(), "data", "listicles");

/** Cache the parsed JSON per slug. Build-time generation hits each slug once,
 *  but the dev server may render multiple times — small map keeps re-parse off. */
const CACHE = new Map<ListicleSlug, ListicleContent>();

/** Type-guard: is this string one of the 5 allowed listicle slugs? */
export function isListicleSlug(slug: string): slug is ListicleSlug {
  return (LISTICLE_SLUGS as readonly string[]).includes(slug);
}

/**
 * Load a listicle JSON file from disk and validate its shape.
 *
 * Throws on:
 *  - missing/unreadable JSON file
 *  - JSON parse error
 *  - structural mismatch (missing required field, wrong type, mind-count out of 3-4 range)
 *  - slug field doesn't match the requested slug (file rename / typo guard)
 *
 * Returns null when given an unknown slug (caller should `notFound()`).
 */
export function loadListicleContent(slug: string): ListicleContent | null {
  if (!isListicleSlug(slug)) return null;

  const cached = CACHE.get(slug);
  if (cached) return cached;

  const filePath = path.join(DATA_DIR, `${slug}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const validated = validateListicleContent(parsed, slug);
  CACHE.set(slug, validated);
  return validated;
}

/** Internal: assert the parsed JSON matches the ListicleContent shape. */
export function validateListicleContent(
  data: unknown,
  expectedSlug: ListicleSlug,
): ListicleContent {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Listicle ${expectedSlug}: payload is not an object`);
  }
  const d = data as Record<string, unknown>;

  if (d.slug !== expectedSlug) {
    throw new Error(
      `Listicle ${expectedSlug}: slug field "${String(d.slug)}" mismatches filename`,
    );
  }
  for (const k of [
    "h1",
    "metaDescription",
    "topicForCta",
    "ctaHeadline",
    "ctaButtonLabel",
    "ctaSubtext",
  ]) {
    if (typeof d[k] !== "string" || (d[k] as string).length === 0) {
      throw new Error(`Listicle ${expectedSlug}: field "${k}" must be a non-empty string`);
    }
  }
  if (!Array.isArray(d.intro) || d.intro.length === 0) {
    throw new Error(`Listicle ${expectedSlug}: intro must be a non-empty string array`);
  }
  for (const para of d.intro) {
    if (typeof para !== "string") {
      throw new Error(`Listicle ${expectedSlug}: intro entries must be strings`);
    }
  }
  if (!Array.isArray(d.minds) || d.minds.length < 3 || d.minds.length > 4) {
    throw new Error(`Listicle ${expectedSlug}: minds must be a 3-4-item array`);
  }
  for (const m of d.minds) {
    if (typeof m !== "object" || m === null) {
      throw new Error(`Listicle ${expectedSlug}: each mind must be an object`);
    }
    const mr = m as Record<string, unknown>;
    for (const k of ["slug", "name", "rationale"]) {
      if (typeof mr[k] !== "string" || (mr[k] as string).length === 0) {
        throw new Error(
          `Listicle ${expectedSlug}: mind.${k} must be a non-empty string`,
        );
      }
    }
  }
  return data as ListicleContent;
}

/** Public site origin used in canonical URL helpers. Kept as a const so tests
 *  can import + assert. Mirrors SITE_URL in src/app/sitemap.ts. */
export const SITE_URL = "https://www.consultthedead.com";

/**
 * Build the UTM-tagged /agora pre-fill URL for a listicle CTA.
 *
 * Example output for startup-pivot:
 *   /agora?topic=startup%20pivot&minds=niccolo-machiavelli,sun-tzu,...&utm_source=listicle&utm_campaign=longtail_seo&utm_content=startup-pivot
 *
 * Notes:
 * - topic= uses encodeURIComponent (spaces → %20) per marketing brief §2.
 * - mind slugs are joined with literal commas (no encoding) because the
 *   /agora handler parses minds= as a comma-separated list and `,` is a
 *   reserved but not encoded sub-delim in query strings. URLSearchParams
 *   would encode them to %2C, which is why we build the string manually.
 * - utm_* params are static for this surface so we hard-code them rather
 *   than allocating a URLSearchParams instance.
 */
export function buildCtaUrl(content: ListicleContent): string {
  const topicEncoded = encodeURIComponent(content.topicForCta);
  const mindsCsv = content.minds.map((m) => m.slug).join(",");
  return (
    `/agora?topic=${topicEncoded}` +
    `&minds=${mindsCsv}` +
    `&utm_source=listicle` +
    `&utm_campaign=longtail_seo` +
    `&utm_content=${content.slug}`
  );
}

/** Canonical URL for a listicle page (used in sitemap + <link rel=canonical>). */
export function listicleCanonicalUrl(slug: ListicleSlug): string {
  return `${SITE_URL}/listicles/${slug}`;
}

/* ── Share-card helpers ── */

const SAFE_SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

export const LISTICLE_SHARE_IMAGE_WIDTH = 1200;
export const LISTICLE_SHARE_IMAGE_HEIGHT = 630;
export const LISTICLE_SHARE_IMAGE_ORIGIN = SITE_URL;

export type ListicleShareImageKind = "opengraph" | "twitter";

export interface ListicleShareCardCopy {
  eyebrow: string;
  title: string;
  councilCueLabel: string;
  councilCue: string;
  ctaHeadline: string;
  ctaButtonLabel: string;
  ctaSubtext: string;
}

function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function titleFromSlug(slug: string): string {
  const clean = slug.trim().replace(/[-_]+/gu, " ");
  if (!clean) return "Consult The Dead";
  return clean
    .split(/\s+/u)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export function buildListicleShareImagePath(
  slug: string,
  kind: ListicleShareImageKind = "opengraph",
): string | null {
  if (typeof slug !== "string") return null;
  const id = slug.trim();
  if (!id || !SAFE_SLUG_PATTERN.test(id)) return null;
  return `/listicles/${id}/${kind}-image`;
}

export function buildListicleShareImageUrl(
  slug: string,
  kind: ListicleShareImageKind = "opengraph",
  origin: string = LISTICLE_SHARE_IMAGE_ORIGIN,
): string | null {
  const path = buildListicleShareImagePath(slug, kind);
  if (!path) return null;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return `${normalized}${path}`;
}

export interface ListicleShareImageUrls {
  openGraph: string;
  twitter: string;
}

export function buildListicleShareImageUrls(
  slug: string,
  origin: string = LISTICLE_SHARE_IMAGE_ORIGIN,
): ListicleShareImageUrls {
  const path = buildListicleShareImagePath(slug);
  const normalized = normalizeOrigin(origin);
  if (!path || !normalized) {
    return { openGraph: "", twitter: "" };
  }
  return {
    openGraph: `${normalized}${path}`,
    twitter: `${normalized}${path.replace("/opengraph-image", "/twitter-image")}`,
  };
}

export function buildListicleShareCardCopy(
  content: ListicleContent | null | undefined,
  fallbackSlug = "",
): ListicleShareCardCopy {
  const minds = content?.minds ?? [];
  const title = content?.h1?.trim() || titleFromSlug(fallbackSlug);
  const councilCue =
    minds.length > 0
      ? minds
          .slice(0, 3)
          .map((mind) => mind.name.trim())
          .filter((name) => name.length > 0)
          .join(" · ")
      : "";

  return {
    eyebrow: "LISTICLE",
    title,
    councilCueLabel: "Council cue",
    councilCue: councilCue || "Recommended council",
    ctaHeadline:
      content?.ctaHeadline?.trim() || "Read the listicle, then run your own council",
    ctaButtonLabel: content?.ctaButtonLabel?.trim() || "Open in Agora →",
    ctaSubtext:
      content?.ctaSubtext?.trim() || "Pre-filled with the recommended minds.",
  };
}
