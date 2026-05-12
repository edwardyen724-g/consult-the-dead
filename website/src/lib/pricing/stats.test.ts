import { describe, expect, it } from 'vitest';

import {
  formatPricingStats,
  PRICING_STATS_DEFAULT,
  type PricingStats,
} from './stats';

describe('formatPricingStats', () => {
  it('formats the default static stats row (no agonsRun)', () => {
    expect(formatPricingStats(PRICING_STATS_DEFAULT)).toEqual([
      '18 minds',
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

  // agonsRun live-stat label
  describe('agonsRun', () => {
    it('inserts the agon count label before "Free to start" when agonsRun is provided', () => {
      expect(
        formatPricingStats({ minds: 18, debatesInLibrary: 30, agonsRun: 42 }),
      ).toEqual([
        '18 minds',
        '30 debates in the library',
        '42 agons run',
        'Free to start',
      ]);
    });

    it('omits the agon label entirely when agonsRun is undefined', () => {
      const labels = formatPricingStats({ minds: 18, debatesInLibrary: 30 });
      expect(labels).not.toContain(expect.stringContaining('agon'));
      expect(labels).toEqual([
        '18 minds',
        '30 debates in the library',
        'Free to start',
      ]);
    });

    it('singularizes "agon run" when agonsRun is exactly 1', () => {
      expect(
        formatPricingStats({ minds: 2, debatesInLibrary: 5, agonsRun: 1 }),
      ).toEqual([
        '2 minds',
        '5 debates in the library',
        '1 agon run',
        'Free to start',
      ]);
    });

    it('uses plural "agons run" when agonsRun is 0', () => {
      expect(
        formatPricingStats({ minds: 2, debatesInLibrary: 5, agonsRun: 0 }),
      ).toEqual([
        '2 minds',
        '5 debates in the library',
        '0 agons run',
        'Free to start',
      ]);
    });

    it('uses plural "agons run" for counts > 1', () => {
      const labels = formatPricingStats({ minds: 18, debatesInLibrary: 30, agonsRun: 1234 });
      expect(labels[2]).toBe('1234 agons run');
    });

    it('throws when agonsRun is negative', () => {
      expect(() =>
        formatPricingStats({ minds: 18, debatesInLibrary: 30, agonsRun: -1 }),
      ).toThrow(/non-negative/);
    });

    it('throws when agonsRun is NaN', () => {
      expect(() =>
        formatPricingStats({ minds: 18, debatesInLibrary: 30, agonsRun: Number.NaN }),
      ).toThrow(/finite/);
    });

    it('throws when agonsRun is Infinity', () => {
      expect(() =>
        formatPricingStats({
          minds: 18,
          debatesInLibrary: 30,
          agonsRun: Number.POSITIVE_INFINITY,
        }),
      ).toThrow(/finite/);
    });
  });
});

describe('PRICING_STATS_DEFAULT', () => {
  it('matches the live roster (18 minds) and seeded library (30 debates)', () => {
    // If this assertion ever fails, update both PRICING_STATS_DEFAULT and the
    // source noted in its docstring (frameworks ALLOWED_SLUGS / outreach-debates dir).
    expect(PRICING_STATS_DEFAULT).toEqual({ minds: 18, debatesInLibrary: 30 });
  });

  it('does not include agonsRun so the static fallback never shows a stale zero', () => {
    expect('agonsRun' in PRICING_STATS_DEFAULT).toBe(false);
  });
});
