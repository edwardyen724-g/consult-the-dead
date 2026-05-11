/**
 * Data helper for the ProofStrip component.
 *
 * Provides the shared interface, fallback constants, and a formatting
 * helper that converts raw counts into display-ready label/value pairs.
 * Consumed by ProofStrip.tsx on any conversion surface (homepage, pricing).
 */

export interface ProofStripData {
  subscriberCount?: number;
  agoraSessions?: number;
  tagline?: string;
}

/**
 * Fallback values rendered when no live data is available.
 * Update when the real counters grow meaningfully.
 */
export const PROOF_STRIP_FALLBACK: ProofStripData = {
  subscriberCount: 500,
  agoraSessions: 1000,
  tagline: "Join founders using historical minds to make better decisions",
};

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
