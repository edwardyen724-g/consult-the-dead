/**
 * Launch-deal configuration — Show HN launch, 2026-05-19.
 *
 * One-time, time-bound discount: $99/year for the first 30 customers, expires
 * 2026-05-31 23:59 UTC. After cap is hit or expiry passes, only the regular
 * $30/mo Pro tier (monthly or $300/year) is offered.
 *
 * Cap mechanism: at checkout-time and at status-read time, we list active
 * Stripe subscriptions on STRIPE_PRICE_LAUNCH_ANNUAL and reject when the count
 * is >= LAUNCH_DEAL_CAP. Stripe is the source of truth — no separate counter
 * to drift. The 30-customer scale fits well under one paginated list call.
 */
import type Stripe from 'stripe'

export const LAUNCH_DEAL_CAP = 30
export const LAUNCH_DEAL_PRICE_USD = 99
export const LAUNCH_DEAL_EXPIRES_AT_ISO = '2026-05-31T23:59:59Z'

export type LaunchDealStatus = {
  cap: number
  claimed: number
  expired: boolean
  available: boolean
  priceUsd: number
  expiresAt: string
}

/** Statuses that consume a slot. Trialing and incomplete count — a $0 trial
 * still occupies one of the 30 seats until it lapses, and incomplete payment
 * intents will resolve into active subscriptions or be cleaned up by Stripe. */
const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  'trialing',
  'active',
  'past_due',
  'unpaid',
  'incomplete',
]

export function isLaunchDealExpired(now: Date = new Date()): boolean {
  return now.getTime() > Date.parse(LAUNCH_DEAL_EXPIRES_AT_ISO)
}

export async function countLaunchDealClaims(
  stripe: Stripe,
  priceId: string,
): Promise<number> {
  let total = 0
  for await (const sub of stripe.subscriptions.list({ price: priceId, status: 'all', limit: 100 })) {
    if (ACTIVE_STATUSES.includes(sub.status)) total += 1
  }
  return total
}

export async function getLaunchDealStatus(
  stripe: Stripe,
  priceId: string,
  now: Date = new Date(),
): Promise<LaunchDealStatus> {
  const expired = isLaunchDealExpired(now)
  const claimed = await countLaunchDealClaims(stripe, priceId)
  const available = !expired && claimed < LAUNCH_DEAL_CAP
  return {
    cap: LAUNCH_DEAL_CAP,
    claimed,
    expired,
    available,
    priceUsd: LAUNCH_DEAL_PRICE_USD,
    expiresAt: LAUNCH_DEAL_EXPIRES_AT_ISO,
  }
}
