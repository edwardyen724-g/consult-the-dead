/**
 * Constants and helpers for the homepage root OG/Twitter image routes.
 *
 * The route files themselves (`app/opengraph-image.tsx`, `app/twitter-image.tsx`)
 * are Next.js file-convention handlers excluded from vitest coverage
 * (src/app/** is integration-tested by Playwright per the vitest.config.ts
 * exclusion policy). This module extracts the pure, testable surface so
 * unit tests can exercise it without booting the Next.js route.
 *
 * Follows the same pattern as src/lib/og-image-url.ts (agon OG images)
 * and src/lib/framework-og-image.ts (framework OG images).
 */

/**
 * Default site origin for absolute homepage OG image URLs.
 * Matches the value baked into the layout.ts metadata and sitemap.ts.
 */
export const DEFAULT_HOMEPAGE_OG_IMAGE_ORIGIN =
  "https://www.consultthedead.com";

/**
 * Canonical OG image dimensions for the homepage (1200×630, the
 * Twitter summary_large_image standard).
 */
export const HOMEPAGE_OG_IMAGE_WIDTH = 1200;
export const HOMEPAGE_OG_IMAGE_HEIGHT = 630;
export const HOMEPAGE_OG_IMAGE_SIZE = {
  width: HOMEPAGE_OG_IMAGE_WIDTH,
  height: HOMEPAGE_OG_IMAGE_HEIGHT,
} as const;

/**
 * Canonical alt text for the homepage OG/Twitter image.
 * Surfaced here so tests can assert it without importing the Next.js
 * route module (which requires the full Next.js runtime).
 */
export const HOMEPAGE_OG_IMAGE_ALT =
  "Consult The Dead — Unlock the minds of history's greatest thinkers";

/**
 * The canonical path to the homepage OG image, relative to the site root.
 */
export const HOMEPAGE_OG_IMAGE_PATH = "/opengraph-image";

/**
 * The canonical path to the homepage Twitter image, relative to the site root.
 */
export const HOMEPAGE_TWITTER_IMAGE_PATH = "/twitter-image";

/**
 * Normalize an origin string: trim whitespace, strip trailing slashes,
 * and prepend https:// if no scheme is present. Returns "" for empty input.
 */
function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Build an absolute URL to the homepage OG image.
 * Returns null when `origin` is empty after normalization.
 *
 * Example:
 *   buildHomepageOgImageUrl()
 *     → "https://www.consultthedead.com/opengraph-image"
 */
export function buildHomepageOgImageUrl(
  origin: string = DEFAULT_HOMEPAGE_OG_IMAGE_ORIGIN,
): string | null {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return `${normalized}${HOMEPAGE_OG_IMAGE_PATH}`;
}

/**
 * Build an absolute URL to the homepage Twitter image.
 * Returns null when `origin` is empty after normalization.
 *
 * Example:
 *   buildHomepageTwitterImageUrl()
 *     → "https://www.consultthedead.com/twitter-image"
 */
export function buildHomepageTwitterImageUrl(
  origin: string = DEFAULT_HOMEPAGE_OG_IMAGE_ORIGIN,
): string | null {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return `${normalized}${HOMEPAGE_TWITTER_IMAGE_PATH}`;
}
