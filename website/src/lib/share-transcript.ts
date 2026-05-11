/**
 * Share-transcript helper — formats a transcript excerpt into a ready-to-share
 * text blob for clipboard copy, SMS, or social media posting.
 *
 * Distinct from `share-url.ts` (which builds the navigator.share payload for
 * a whole agon) because transcript sharing targets a single pull-quote from
 * one mind's response rather than the full debate link. The formatted text
 * includes:
 *
 *   - A title line ("Consult The Dead — <topic>")
 *   - The excerpt (truncated to EXCERPT_MAX_CHARS with an ellipsis)
 *   - The canonical URL of the public agon page
 *   - An attribution line so readers know where the quote came from
 *
 * Why a separate module:
 *   - The text format is tested independently from the URL builder so
 *     accidental changes to either module surface immediately in CI.
 *   - Centralises the SITE_ORIGIN constant (shared with sitemap.ts / layout)
 *     so a domain rename is a one-line change.
 */

/** Canonical production origin — keep in sync with share-url.ts, sitemap.ts. */
export const SITE_ORIGIN = "https://www.consultthedead.com";

/** Hard cap on the excerpt so the text stays readable in share previews. */
export const EXCERPT_MAX_CHARS = 280;

/** Attribution suffix appended to every share blob. */
export const ATTRIBUTION_LINE = "— via Consult The Dead";

const DEFAULT_TITLE = "Consult The Dead";

/** Path prefix for public agon share pages. */
const AGON_PATH_PREFIX = "/agora/a/";

/**
 * Trim the excerpt to EXCERPT_MAX_CHARS characters without cutting mid-word.
 * Appends a Unicode ellipsis when truncated.
 */
function truncateExcerpt(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1);
  // Back up to the last whitespace so we don't split a word.
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max / 2 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}

export interface TranscriptShareInput {
  /** The agon topic / question. Falls back to DEFAULT_TITLE when absent. */
  title?: string | null;
  /**
   * The excerpt of transcript text to share (e.g. a pull-quote from a mind's
   * response). When absent the share blob omits the excerpt line.
   */
  excerpt?: string | null;
  /**
   * The public share_id for the agon (used to build the canonical URL).
   * Pass null / undefined to omit the URL from the share text.
   */
  shareId?: string | null;
  /**
   * Override the production origin — useful for tests and preview deployments.
   * Defaults to SITE_ORIGIN.
   */
  origin?: string;
}

export interface TranscriptShareResult {
  /** The full formatted text ready to paste into a share sheet. */
  text: string;
  /** The canonical URL included in the text (empty string when shareId absent). */
  canonicalUrl: string;
  /** The formatted attribution line included in the text. */
  attribution: string;
  /** The resolved title line (may be the default when title is absent). */
  title: string;
}

/**
 * Build a formatted share blob for a transcript excerpt.
 *
 * @example
 * buildTranscriptShareText({
 *   title: "Should I raise VC or bootstrap?",
 *   excerpt: "Pursue what you love and the money will follow.",
 *   shareId: "k7n3pqx9rt",
 * })
 * // => {
 * //   title: "Consult The Dead — Should I raise VC or bootstrap?",
 * //   canonicalUrl: "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
 * //   attribution: "— via Consult The Dead",
 * //   text: [
 * //     "Consult The Dead — Should I raise VC or bootstrap?",
 * //     "",
 * //     '"Pursue what you love and the money will follow."',
 * //     "",
 * //     "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
 * //     "",
 * //     "— via Consult The Dead",
 * //   ].join("\n"),
 * // }
 */
export function buildTranscriptShareText(
  input: TranscriptShareInput,
): TranscriptShareResult {
  const rawTitle = (input.title ?? "").trim();
  const resolvedTitle = rawTitle
    ? `${DEFAULT_TITLE} — ${rawTitle}`
    : DEFAULT_TITLE;

  const origin = (input.origin ?? SITE_ORIGIN).replace(/\/+$/, "");
  const canonicalUrl =
    input.shareId && input.shareId.trim()
      ? `${origin}${AGON_PATH_PREFIX}${input.shareId.trim()}`
      : "";

  const rawExcerpt = (input.excerpt ?? "").trim();
  const formattedExcerpt = rawExcerpt
    ? `"${truncateExcerpt(rawExcerpt, EXCERPT_MAX_CHARS)}"`
    : "";

  const lines: string[] = [resolvedTitle];

  if (formattedExcerpt) {
    lines.push("", formattedExcerpt);
  }

  if (canonicalUrl) {
    lines.push("", canonicalUrl);
  }

  lines.push("", ATTRIBUTION_LINE);

  return {
    text: lines.join("\n"),
    canonicalUrl,
    attribution: ATTRIBUTION_LINE,
    title: resolvedTitle,
  };
}
