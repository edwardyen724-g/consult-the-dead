/**
 * Suppression rules for the retention email sequence.
 *
 * Per docs/retention-email-sequence.md §"Suppression Rules" + the dev task
 * spec, a user is excluded from non-WELCOME emails when ANY of the
 * following hold:
 *
 *   - subscription_tier === "pro"     (Pro users skip nudge/recap/digest)
 *   - email_unsubscribed === true     (CAN-SPAM opt-out)
 *   - email_bounce_count >= 2         (hard bounces)
 *
 * The WELCOME email is intentionally exempt — it fires immediately on
 * signup before any state could be set.
 *
 * This module is pure (no I/O, no Clerk SDK dependency) so unit tests
 * exercise every branch in milliseconds. The cron route handlers compose
 * these checks against Clerk-fetched metadata.
 */

import type { SuppressionMetadata } from './types'
import type { RetentionCampaign } from './utm'

const HARD_BOUNCE_THRESHOLD = 2

export type SuppressionReason =
  | 'pro_subscriber'
  | 'unsubscribed'
  | 'hard_bounced'

/** Result tuple. `null` = not suppressed; otherwise the reason. */
export type SuppressionResult = SuppressionReason | null

/**
 * Evaluate suppression for a non-WELCOME campaign. Returns the first
 * reason that matches (deterministic order: pro → unsubscribed → bounce)
 * so analytics can group by primary reason without ambiguity.
 *
 * The WELCOME campaign always returns null (never suppressed) because
 * it fires before any suppression state can exist.
 */
export function evaluateSuppression(
  campaign: RetentionCampaign,
  meta: SuppressionMetadata,
): SuppressionResult {
  if (campaign === 'welcome') {
    return null
  }

  if (meta.subscriptionTier === 'pro') {
    return 'pro_subscriber'
  }

  if (meta.emailUnsubscribed === true) {
    return 'unsubscribed'
  }

  if (
    typeof meta.emailBounceCount === 'number' &&
    meta.emailBounceCount >= HARD_BOUNCE_THRESHOLD
  ) {
    return 'hard_bounced'
  }

  return null
}

/** Convenience: did this user pass the gate for the given campaign? */
export function isUserEligible(
  campaign: RetentionCampaign,
  meta: SuppressionMetadata,
): boolean {
  return evaluateSuppression(campaign, meta) === null
}

/**
 * Adapter: pull a SuppressionMetadata snapshot from the loose
 * publicMetadata + privateMetadata bags Clerk hands us. Defensive — never
 * throws on unexpected shapes; unknown values become undefined.
 *
 * Recognised keys:
 *   public.subscription_tier            → subscriptionTier
 *   private.email_unsubscribed (bool)   → emailUnsubscribed
 *   public.email_opted_out (bool)       → emailUnsubscribed (legacy alias)
 *   private.email_bounce_count (number) → emailBounceCount
 */
export function resolveSuppressionMetadata(
  publicMetadata: unknown,
  privateMetadata: unknown,
): SuppressionMetadata {
  const pub = isPlainObject(publicMetadata) ? publicMetadata : {}
  const priv = isPlainObject(privateMetadata) ? privateMetadata : {}

  const subscriptionTier =
    typeof pub.subscription_tier === 'string' ? pub.subscription_tier : null

  const emailUnsubscribed =
    priv.email_unsubscribed === true || pub.email_opted_out === true

  const emailBounceCount =
    typeof priv.email_bounce_count === 'number'
      ? priv.email_bounce_count
      : undefined

  return {
    subscriptionTier,
    emailUnsubscribed,
    emailBounceCount,
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
