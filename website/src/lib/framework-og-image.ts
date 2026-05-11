/**
 * URL helpers for the dynamic Open Graph / Twitter image route at
 * `/frameworks/[slug]/opengraph-image`.
 *
 * The route files themselves are Next.js file-convention handlers, so
 * callers usually do not need to build these URLs manually. The helper
 * exists for explicit metadata wiring, structured-data consumers, and
 * tests that need to validate slug handling without booting the route.
 */

import { ALLOWED_SLUGS, type FrameworkSlug } from "@/lib/frameworks";

const FRAMEWORK_SLUGS = new Set<string>(ALLOWED_SLUGS);

export const DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN =
  "https://www.consultthedead.com";
export const FRAMEWORK_OG_IMAGE_WIDTH = 1200;
export const FRAMEWORK_OG_IMAGE_HEIGHT = 630;
export const FRAMEWORK_OG_IMAGE_SIZE = {
  width: FRAMEWORK_OG_IMAGE_WIDTH,
  height: FRAMEWORK_OG_IMAGE_HEIGHT,
} as const;

function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isFrameworkSlug(value: string): value is FrameworkSlug {
  return FRAMEWORK_SLUGS.has(value);
}

export function buildFrameworkOgImagePath(slug: string): string | null {
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  if (!trimmed) return null;
  if (!isFrameworkSlug(trimmed)) return null;
  return `/frameworks/${trimmed}/opengraph-image`;
}

export function buildFrameworkOgImageUrl(
  slug: string,
  origin: string = DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN,
): string | null {
  const path = buildFrameworkOgImagePath(slug);
  if (!path) return null;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return `${normalized}${path}`;
}

export function extractFrameworkSlugFromFrameworkUrl(
  input: string,
): FrameworkSlug | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let pathname: string;
  try {
    const url = new URL(trimmed);
    pathname = url.pathname;
  } catch {
    pathname = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const cleaned = pathname.replace(/\/+$/u, "");
  const match = /^\/frameworks\/([^/]+)(?:\/(opengraph-image|twitter-image))?$/u.exec(
    cleaned,
  );
  if (!match) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  if (!isFrameworkSlug(decoded)) return null;
  return decoded;
}
