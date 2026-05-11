/**
 * Shared pricing constants — single source of truth for all pricing numbers.
 *
 * Imported by:
 *   - ./live-stats.ts  (server-only: builds the /api/stats response payload)
 *   - ../../app/pricing/page.tsx  (client: renders the pricing page UI)
 *
 * Centralising these values here ensures that a price change is a one-line
 * edit rather than a multi-file search-and-replace.
 */

/** Number of free agons (debate runs) allowed per calendar day. */
export const FREE_AGONS_PER_DAY = 3;

/** Number of agons included in a Pro subscription per month. */
export const PRO_AGONS_PER_MONTH = 100;

/** Number of free trial days included with a new Pro subscription. */
export const PRO_TRIAL_DAYS = 7;

/** Pro monthly subscription price in USD. */
export const PRO_MONTHLY_PRICE = 30;

/** Pro annual subscription price in USD (equivalent to ~$25/month). */
export const PRO_ANNUAL_PRICE = 300;

/** Founding-member annual price — locked in for early subscribers. */
export const FOUNDING_MEMBER_ANNUAL_PRICE = 300;
