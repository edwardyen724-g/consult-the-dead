/**
 * Data helper for the ProofStrip component.
 *
 * Provides the shared interface and a formatting helper that converts raw
 * counts into display-ready label/value pairs.
 * Consumed by ProofStrip.tsx on any conversion surface (homepage, pricing).
 *
 * NOTE: PROOF_STRIP_FALLBACK has been intentionally removed. The component
 * must never silently emit fabricated social-proof numbers. Callers must
 * supply real live data, or the component renders nothing.
 */

export interface ProofStripData {
  subscriberCount?: number;
  agoraSessions?: number;
  tagline?: string;
}

/**
 * Format ProofStripData into an ordered array of label/value pairs
 * suitable for rendering as stat badges.
 *
 * Rules:
 *  - subscriberCount present and >= 0  → { label: "founders subscribed", value: "500+" }
 *  - agoraSessions present and >= 0    → { label: "agon sessions run", value: "1000+" }
 *  - tagline present and non-empty     → { label: "tagline", value: <tagline text> }
 *
 * Negative or non-finite numeric fields are silently omitted (defensive).
 * The tagline entry is omitted when the string is empty/whitespace-only.
 */
export function formatProofStripData(
  data: ProofStripData,
): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];

  if (
    data.subscriberCount !== undefined &&
    Number.isFinite(data.subscriberCount) &&
    data.subscriberCount >= 0
  ) {
    result.push({
      label: "founders subscribed",
      value: `${data.subscriberCount}+`,
    });
  }

  if (
    data.agoraSessions !== undefined &&
    Number.isFinite(data.agoraSessions) &&
    data.agoraSessions >= 0
  ) {
    result.push({
      label: "agon sessions run",
      value: `${data.agoraSessions}+`,
    });
  }

  if (data.tagline !== undefined && data.tagline.trim().length > 0) {
    result.push({
      label: "tagline",
      value: data.tagline,
    });
  }

  return result;
}
