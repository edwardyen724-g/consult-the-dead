import { describe, expect, it } from 'vitest'
import {
  evaluateSuppression,
  isUserEligible,
  resolveSuppressionMetadata,
} from './suppression'

describe('evaluateSuppression', () => {
  it('returns null for WELCOME regardless of state (welcome is never suppressed)', () => {
    expect(
      evaluateSuppression('welcome', {
        subscriptionTier: 'pro',
        emailUnsubscribed: true,
        emailBounceCount: 99,
      }),
    ).toBeNull()
  })

  it('suppresses Pro subscribers from nudge', () => {
    expect(evaluateSuppression('nudge', { subscriptionTier: 'pro' })).toBe(
      'pro_subscriber',
    )
  })

  it('suppresses Pro subscribers from digest', () => {
    expect(evaluateSuppression('digest', { subscriptionTier: 'pro' })).toBe(
      'pro_subscriber',
    )
  })

  it('suppresses Pro subscribers from recap', () => {
    expect(evaluateSuppression('recap', { subscriptionTier: 'pro' })).toBe(
      'pro_subscriber',
    )
  })

  it('suppresses unsubscribed users from nudge', () => {
    expect(evaluateSuppression('nudge', { emailUnsubscribed: true })).toBe(
      'unsubscribed',
    )
  })

  it('does not suppress when emailUnsubscribed is false / undefined', () => {
    expect(evaluateSuppression('digest', { emailUnsubscribed: false })).toBeNull()
    expect(evaluateSuppression('digest', {})).toBeNull()
  })

  it('suppresses users with hard bounce count >= 2', () => {
    expect(evaluateSuppression('digest', { emailBounceCount: 2 })).toBe(
      'hard_bounced',
    )
    expect(evaluateSuppression('digest', { emailBounceCount: 7 })).toBe(
      'hard_bounced',
    )
  })

  it('does not suppress on a single bounce', () => {
    expect(evaluateSuppression('digest', { emailBounceCount: 1 })).toBeNull()
  })

  it('returns the first matching reason in priority order (pro > unsub > bounce)', () => {
    // All three would individually trigger; pro wins.
    expect(
      evaluateSuppression('nudge', {
        subscriptionTier: 'pro',
        emailUnsubscribed: true,
        emailBounceCount: 5,
      }),
    ).toBe('pro_subscriber')

    // Without pro, unsubscribed wins over bounce.
    expect(
      evaluateSuppression('nudge', {
        emailUnsubscribed: true,
        emailBounceCount: 5,
      }),
    ).toBe('unsubscribed')
  })

  it('treats non-pro tiers (free, etc.) as eligible', () => {
    expect(
      evaluateSuppression('digest', { subscriptionTier: 'free' }),
    ).toBeNull()
    expect(evaluateSuppression('digest', { subscriptionTier: null })).toBeNull()
  })
})

describe('isUserEligible', () => {
  it('inverts evaluateSuppression', () => {
    expect(isUserEligible('digest', { subscriptionTier: 'pro' })).toBe(false)
    expect(isUserEligible('digest', { subscriptionTier: 'free' })).toBe(true)
    expect(isUserEligible('welcome', { subscriptionTier: 'pro' })).toBe(true)
  })
})

describe('resolveSuppressionMetadata', () => {
  it('reads subscription_tier from publicMetadata', () => {
    const meta = resolveSuppressionMetadata(
      { subscription_tier: 'pro' },
      undefined,
    )
    expect(meta.subscriptionTier).toBe('pro')
  })

  it('reads email_unsubscribed from privateMetadata (canonical key)', () => {
    const meta = resolveSuppressionMetadata({}, { email_unsubscribed: true })
    expect(meta.emailUnsubscribed).toBe(true)
  })

  it('honours legacy publicMetadata.email_opted_out alias', () => {
    const meta = resolveSuppressionMetadata({ email_opted_out: true }, {})
    expect(meta.emailUnsubscribed).toBe(true)
  })

  it('reads email_bounce_count from privateMetadata', () => {
    const meta = resolveSuppressionMetadata({}, { email_bounce_count: 3 })
    expect(meta.emailBounceCount).toBe(3)
  })

  it('returns safe defaults on null / undefined / array inputs', () => {
    const a = resolveSuppressionMetadata(null, null)
    expect(a.subscriptionTier).toBeNull()
    expect(a.emailUnsubscribed).toBe(false)
    expect(a.emailBounceCount).toBeUndefined()

    const b = resolveSuppressionMetadata(undefined, undefined)
    expect(b.subscriptionTier).toBeNull()

    const c = resolveSuppressionMetadata(['arrays', 'are', 'rejected'], [])
    expect(c.subscriptionTier).toBeNull()
  })

  it('drops non-string subscription_tier without throwing', () => {
    const meta = resolveSuppressionMetadata({ subscription_tier: 42 }, {})
    expect(meta.subscriptionTier).toBeNull()
  })

  it('drops non-numeric email_bounce_count without throwing', () => {
    const meta = resolveSuppressionMetadata({}, { email_bounce_count: 'x' })
    expect(meta.emailBounceCount).toBeUndefined()
  })
})
