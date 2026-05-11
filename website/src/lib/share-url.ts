/**
 * Share URL builder for public agon pages.
 *
 * Closes the conversion loop: every shared agon = a free distribution unit
 * (founder directive). The Share button on a completed agon takes the
 * `shareId` returned by POST /api/library and turns it into a URL the user
 * can paste anywhere, plus a payload shaped for `navigator.share`.
 *
 * Why a dedicated helper:
 *   - Tests can pin the path layout (`/agora/a/<shareId>`) so a future
 *     refactor of the public-page route immediately fails CI here.
 *   - Centralises the canonical SITE_URL with the rest of the site
 *     (sitemap.ts, layout.tsx) instead of inlining it in components.
 *   - Keeps the `<ShareAgonPanel>` component thin and easy to test in
 *     isolation from URL construction concerns.
 *
 * Validation: every entry point runs `looksLikeShareId` so we never produce
 * a link that the public route would 404 on.
 */
import { looksLikeShareId } from "./share-id";

/**
 * Canonical production origin for the public site. Kept in sync with
 * `src/app/sitemap.ts` and `src/app/layout.tsx`. Changing the live origin
 * means updating all three call sites.
 */
export const SITE_ORIGIN = "https://www.consultthedead.com";

/**
 * Path-only form of a public agon URL — useful for in-app `<Link>` targets
 * where we want the router to handle navigation client-side.
 */
export function buildShareUrlPath(shareId: string): string {
  if (!looksLikeShareId(shareId)) {
    throw new Error(`invalid shareId: ${JSON.stringify(shareId)}`);
  }
  return `/agora/a/${shareId}`;
}

/**
 * Absolute, copy-pasteable URL for a public agon. This is what we want
 * inside the clipboard / native share sheet so the link works no matter
 * where it's pasted.
 *
 * `origin` defaults to the production origin. Tests and dev environments
 * can pass a custom origin without touching env vars.
 */
export function buildShareUrl(
  shareId: string,
  options: { origin?: string } = {},
): string {
  const path = buildShareUrlPath(shareId);
  const origin = (options.origin ?? SITE_ORIGIN).replace(/\/+$/, "");
  return `${origin}${path}`;
}

/**
 * Payload shape consumed by `navigator.share` and our copy-to-clipboard
 * fallback. The `title` is what shows up in the system share sheet header
 * on iOS / Android; `text` is what appears as the body in iMessage / SMS /
 * paste-as-rich-text targets; `url` is the link itself.
 *
 * Empty/whitespace topics fall back to a generic label so the share sheet
 * never shows a blank title.
 */
export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

const DEFAULT_TITLE = "Consult The Dead — The Agora";

/** Hard cap on `text` so the iMessage preview doesn't get truncated mid-word. */
const MAX_TEXT_LENGTH = 200;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  // Trim back to the last whitespace within the limit so we don't cut a word.
  const slice = value.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max / 2 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}

/**
 * Build the `navigator.share`-shaped payload for a completed agon. Topic
 * and shareId are required; `origin` is the same override knob used by
 * `buildShareUrl`.
 */
export function buildSharePayload(input: {
  shareId: string;
  topic: string;
  origin?: string;
}): SharePayload {
  const url = buildShareUrl(input.shareId, { origin: input.origin });
  const trimmedTopic = (input.topic ?? "").trim();
  if (!trimmedTopic) {
    return {
      title: DEFAULT_TITLE,
      text: "A council of dead minds debated this question. See the result.",
      url,
    };
  }

  const safeTopic = truncate(trimmedTopic, MAX_TEXT_LENGTH - 60);
  return {
    title: DEFAULT_TITLE,
    // Keep the body short — iMessage / Twitter previews truncate aggressively.
    text: `A council of dead minds debated: "${safeTopic}"`,
    url,
  };
}
