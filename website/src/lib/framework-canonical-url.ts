/**
 * Canonical URL helpers for `/frameworks/[slug]` detail pages.
 *
 * Used in `generateMetadata` to populate the HTML
 * `<link rel="canonical">` tag via Next.js `alternates.canonical`.
 * Keeping it as a standalone export makes it directly unit-testable
 * without needing to invoke the Next.js metadata pipeline.
 */

import { ALLOWED_SLUGS, type FrameworkSlug } from "@/lib/frameworks";

const FRAMEWORK_SLUGS = new Set<string>(ALLOWED_SLUGS);

/** Public site origin. Mirrors SITE_URL in src/app/sitemap.ts. */
export const FRAMEWORK_CANONICAL_ORIGIN = "https://www.consultthedead.com";

function isFrameworkSlug(value: string): value is FrameworkSlug {
  return FRAMEWORK_SLUGS.has(value);
}

/**
 * Returns the absolute canonical URL for a framework detail page, e.g.
 * `https://www.consultthedead.com/frameworks/isaac-newton`.
 *
 * Returns `null` if `slug` is not in the allow-list so callers can
 * safely fall through to a 404 without emitting a bogus canonical.
 */
export function buildFrameworkCanonicalUrl(
  slug: string,
  origin: string = FRAMEWORK_CANONICAL_ORIGIN,
): string | null {
  if (typeof slug !== "string") return null;
  const trimmedSlug = slug.trim();
  if (!trimmedSlug) return null;
  if (!isFrameworkSlug(trimmedSlug)) return null;

  const trimmedOrigin = origin.trim().replace(/\/+$/u, "");
  if (!trimmedOrigin) return null;
  const normalizedOrigin = /^https?:\/\//i.test(trimmedOrigin)
    ? trimmedOrigin
    : `https://${trimmedOrigin}`;

  return `${normalizedOrigin}/frameworks/${trimmedSlug}`;
}
