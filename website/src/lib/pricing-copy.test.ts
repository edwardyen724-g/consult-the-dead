import { describe, expect, it } from 'vitest';

import {
  getPricingFreeTierSummary,
  getPricingFreeLimitResetSummary,
  getPricingFoundingMemberSummary,
  getPricingMetadataDescription,
  PRICING_BYO_KEY_COPY,
  PRICING_CANONICAL_COPY,
  PRICING_FOUNDING_MEMBER_COPY,
  PRICING_FREE_LIMIT_COPY,
  PRICING_FREE_LIMIT_RESET_COPY,
} from './pricing-copy';

describe('pricing-copy', () => {
  it('exports the canonical pricing fragments verbatim', () => {
    expect(PRICING_FREE_LIMIT_COPY).toBe('Always free to start with 3 agons/day');
    expect(PRICING_FREE_LIMIT_RESET_COPY).toBe(
      'Free-tier limits reset each day at UTC midnight',
    );
    expect(PRICING_BYO_KEY_COPY).toBe('BYO key unlimited mode');
    expect(PRICING_FOUNDING_MEMBER_COPY).toBe('founding-member pricing at $300/year');
    expect(PRICING_CANONICAL_COPY).toEqual({
      freeLimit: 'Always free to start with 3 agons/day',
      freeLimitReset: 'Free-tier limits reset each day at UTC midnight',
      byoKey: 'BYO key unlimited mode',
      foundingMember: 'founding-member pricing at $300/year',
    });
  });

  it('assembles the metadata description from the canonical fragments', () => {
    expect(getPricingMetadataDescription()).toBe(
      'Always free to start with 3 agons/day and BYO key unlimited mode. Pro adds PDF export, extended research, 48-hour founder support, and founding-member pricing at $300/year.',
    );
  });

  it('keeps the short free-tier and founding-member summaries stable', () => {
    expect(getPricingFreeTierSummary()).toBe(
      'Always free to start with 3 agons/day and BYO key unlimited mode.',
    );
    expect(getPricingFreeLimitResetSummary()).toBe(
      'Free-tier limits reset each day at UTC midnight',
    );
    expect(getPricingFoundingMemberSummary()).toBe(
      'founding-member pricing at $300/year',
    );
  });
});
