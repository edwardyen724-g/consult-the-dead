import { describe, expect, it } from 'vitest';

import {
  formatPricingStats,
  PRICING_STATS_DEFAULT,
  type PricingStats,
} from './stats';

describe('formatPricingStats', () => {
  it('formats the default static stats row', () => {
    expect(formatPricingStats(PRICING_STATS_DEFAULT)).toEqual([
      '26 minds',
      '30 debates in the library',
      'Free to start',
    ]);
  });

  it('singularizes "mind" when there is exactly one', () => {
    const stats: PricingStats = { minds: 1, debatesInLibrary: 5 };
    expect(formatPricingStats(stats)).toEqual([
      '1 mind',
      '5 debates in the library',
      'Free to start',
    ]);
  });

  it('singularizes "debate" when there is exactly one', () => {
    const stats: PricingStats = { minds: 4, debatesInLibrary: 1 };
    expect(formatPricingStats(stats)).toEqual([
      '4 minds',
      '1 debate in the library',
      'Free to start',
    ]);
  });

  it('handles zero counts (e.g., empty library at boot)', () => {
    expect(formatPricingStats({ minds: 0, debatesInLibrary: 0 })).toEqual([
      '0 minds',
      '0 debates in the library',
      'Free to start',
    ]);
  });

  it('throws on negative mind count', () => {
    expect(() =>
      formatPricingStats({ minds: -1, debatesInLibrary: 30 }),
    ).toThrow(/non-negative/);
  });

  it('throws on negative debate count', () => {
    expect(() =>
      formatPricingStats({ minds: 26, debatesInLibrary: -3 }),
    ).toThrow(/non-negative/);
  });

  it('throws on non-finite values', () => {
    expect(() =>
      formatPricingStats({ minds: Number.NaN, debatesInLibrary: 30 }),
    ).toThrow(/finite/);
    expect(() =>
      formatPricingStats({ minds: 26, debatesInLibrary: Number.POSITIVE_INFINITY }),
    ).toThrow(/finite/);
  });
});

describe('PRICING_STATS_DEFAULT', () => {
  it('matches the live roster (26 minds) and seeded library (30 debates)', () => {
    // If this assertion ever fails, update both PRICING_STATS_DEFAULT and the
    // source noted in its docstring (frameworks ALLOWED_SLUGS / outreach-debates dir).
    expect(PRICING_STATS_DEFAULT).toEqual({ minds: 26, debatesInLibrary: 30 });
  });
});
