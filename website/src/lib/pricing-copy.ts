/**
 * Canonical pricing copy fragments.
 *
 * Keep the phrases in this module as the single source of truth for the
 * pricing cleanup work. Consumers can import the fragments directly or use
 * the assembled helpers below instead of re-encoding the strings inline.
 */
export const PRICING_FREE_LIMIT_COPY = "Always free to start with 3 agons/day";
export const PRICING_FREE_LIMIT_RESET_COPY =
  "Free-tier limits reset each day at UTC midnight";
export const PRICING_BYO_KEY_COPY = "BYO key unlimited mode";
export const PRICING_FOUNDING_MEMBER_COPY =
  "founding-member pricing at $300/year";
export const PRICING_METADATA_TITLE = "Pricing";
export const PRICING_SHARE_PREVIEW_CARD = "summary_large_image";

export const PRICING_CANONICAL_COPY = {
  freeLimit: PRICING_FREE_LIMIT_COPY,
  freeLimitReset: PRICING_FREE_LIMIT_RESET_COPY,
  byoKey: PRICING_BYO_KEY_COPY,
  foundingMember: PRICING_FOUNDING_MEMBER_COPY,
} as const;

export function getPricingMetadataDescription(): string {
  return `${PRICING_CANONICAL_COPY.freeLimit} and ${PRICING_CANONICAL_COPY.byoKey}. Pro adds PDF export, extended research, 48-hour founder support, and ${PRICING_CANONICAL_COPY.foundingMember}.`;
}

export function getPricingMetadataTitle(): string {
  return PRICING_METADATA_TITLE;
}

export function getPricingSharePreviewCard():
  typeof PRICING_SHARE_PREVIEW_CARD {
  return PRICING_SHARE_PREVIEW_CARD;
}

export function getPricingFreeTierSummary(): string {
  return `${PRICING_CANONICAL_COPY.freeLimit} and ${PRICING_CANONICAL_COPY.byoKey}.`;
}

export function getPricingFreeLimitResetSummary(): string {
  return PRICING_CANONICAL_COPY.freeLimitReset;
}

export function getPricingFoundingMemberSummary(): string {
  return PRICING_CANONICAL_COPY.foundingMember;
}
