/**
 * URL helpers for the dynamic Open-Graph / Twitter image route at
 * `/agora/a/[id]/opengraph-image`.
 *
 * Next.js auto-injects the OG image meta tag from the file convention
 * (`opengraph-image.tsx` in a route segment), so callers do not need
 * to hand-build the URL for routine HTML rendering. These helpers
 * exist for the cases that DO need an explicit URL:
 *   - JSON-LD structured-data injection (`schema.org/ImageObject`)
 *   - server-side share-card generation in transactional emails
 *   - legacy embed surfaces that don't auto-resolve OG meta from the
 *     site origin
 *
 * The helpers are pure (no Next/React/DB imports) so vitest exercises
 * them at 100% coverage without booting the route.
 *
 * Per CTO PR #5 policy on the `src/app/**` coverage exclusion: any
 * route-handler logic that needs unit-test coverage extracts pure
 * helpers to `src/lib/`.
 */

const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Default site origin for absolute OG image URLs. Matches the value
 * baked into `app/sitemap.ts` and `app/agora/a/[id]/page.tsx` so all
 * three converge on the same canonical host.
 */
export const DEFAULT_OG_IMAGE_ORIGIN = "https://www.consultthedead.com";

/**
 * Width × height of the OG image, in pixels. Frozen as constants so
 * the route's ImageResponse and any consumer building structured-data
 * blocks pull from the same source of truth.
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Trim a leading `https://`/`http://` and any trailing slash so the
 * caller can pass either `consultthedead.com`, `https://consultthedead.com`,
 * or `https://consultthedead.com/`. Internal helper, not exported.
 */
function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Path-only OG image URL for a given share id. Returns `null` when
 * the share id fails the safe-URL alphabet check; the route file
 * convention only resolves shapes Next.js's URL parser would have
 * already matched, so a malformed input is a programmer error and
 * shouldn't be silently coerced.
 *
 * Example:
 *   buildOgImagePath("abhishek-chakravarty")
 *     → "/agora/a/abhishek-chakravarty/opengraph-image"
 */
export function buildOgImagePath(shareId: string): string | null {
  if (typeof shareId !== "string") return null;
  const id = shareId.trim();
  if (!id) return null;
  if (!SHARE_ID_PATTERN.test(id)) return null;
  return `/agora/a/${id}/opengraph-image`;
}

/**
 * Absolute OG image URL for a given share id. Composes
 * `buildOgImagePath` with a normalized origin.
 *
 * Returns `null` when:
 *   - `shareId` fails the safe-URL alphabet check, OR
 *   - `origin` is empty after normalization.
 */
export function buildOgImageUrl(
  shareId: string,
  origin: string = DEFAULT_OG_IMAGE_ORIGIN,
): string | null {
  const path = buildOgImagePath(shareId);
  if (!path) return null;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return `${normalized}${path}`;
}

/**
 * Companion helper: extract a share id back out of a `/agora/a/<id>`
 * URL or path. Useful for the OG image route to validate the segment
 * it was handed by Next.js, and for any consumer that needs to round
 * trip a share URL back into the underlying id.
 *
 * Returns `null` when the URL does not match the public-agon shape.
 */
export function extractShareIdFromAgoraUrl(input: string): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Allow either an absolute URL or a path-only string.
  let pathname: string;
  try {
    const url = new URL(trimmed);
    pathname = url.pathname;
  } catch {
    pathname = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
  // Strip trailing slash, then match.
  const cleaned = pathname.replace(/\/+$/u, "");
  // Match either `/agora/a/<id>` or `/agora/a/<id>/opengraph-image`.
  const m = /^\/agora\/a\/([^/]+)(?:\/opengraph-image)?$/u.exec(cleaned);
  if (!m) return null;
  // Group 1 is required by the regex above, so it's always defined
  // when m matches — no `?? ""` fallback needed.
  let decoded: string;
  try {
    decoded = decodeURIComponent(m[1]);
  } catch {
    // Malformed percent-encoding (e.g. `%XX`) — treat as invalid.
    return null;
  }
  if (!decoded || !SHARE_ID_PATTERN.test(decoded)) return null;
  return decoded;
}
