import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authorizeCronRequest,
  isInNudgeWindow,
  runDigestCron,
  runNudgeCron,
  toPublicCronSummary,
} from './cron'
import type {
  DigestUserCandidate,
  NudgeUserCandidate,
} from './types'

const NOW = new Date('2026-05-09T17:00:00.000Z')
const T_MINUS_24H = new Date(NOW.getTime() - 24 * 60 * 60 * 1000)

const baseCandidate: NudgeUserCandidate = {
  clerkUserId: 'user_a',
  email: 'a@example.com',
  firstName: 'Ada',
  createdAt: T_MINUS_24H.toISOString(),
  agonCount: 0,
  suppression: {},
}

describe('isInNudgeWindow', () => {
  it('returns true at exactly T-24h', () => {
    expect(isInNudgeWindow(T_MINUS_24H.toISOString(), NOW)).toBe(true)
  })

  it('returns true within ±2h of T-24h', () => {
    const earlier = new Date(NOW.getTime() - 25 * 60 * 60 * 1000).toISOString()
    const later = new Date(NOW.getTime() - 23 * 60 * 60 * 1000).toISOString()
    expect(isInNudgeWindow(earlier, NOW)).toBe(true)
    expect(isInNudgeWindow(later, NOW)).toBe(true)
  })

  it('returns false outside ±2h window', () => {
    const tooOld = new Date(NOW.getTime() - 30 * 60 * 60 * 1000).toISOString()
    const tooNew = new Date(NOW.getTime() - 1 * 60 * 60 * 1000).toISOString()
    expect(isInNudgeWindow(tooOld, NOW)).toBe(false)
    expect(isInNudgeWindow(tooNew, NOW)).toBe(false)
  })

  it('returns false on unparseable dates', () => {
    expect(isInNudgeWindow('not-a-date', NOW)).toBe(false)
  })
})

describe('runNudgeCron suppression + windowing', () => {
  let sendSpy: ReturnType<typeof vi.fn>
  beforeEach(() => {
    sendSpy = vi.fn().mockResolvedValue({})
  })
  afterEach(() => vi.restoreAllMocks())

  it('sends to a perfectly-eligible user and reports it in summary', async () => {
    const summary = await runNudgeCron([baseCandidate], {
      now: NOW,
      send: sendSpy,
    })
    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy.mock.calls[0][0]).toBe('a@example.com')
    expect(sendSpy.mock.calls[0][1]).toEqual({ firstName: 'Ada' })
    expect(summary.sent).toBe(1)
    expect(summary.scanned).toBe(1)
    expect(summary.details[0].action).toBe('sent')
  })

  it('skips users who already ran an agon (agonCount > 0)', async () => {
    const summary = await runNudgeCron(
      [{ ...baseCandidate, agonCount: 1 }],
      { now: NOW, send: sendSpy },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.sent).toBe(0)
    expect(summary.details[0].action).toBe('skipped')
    expect(summary.details[0].reason).toBe('has_agons')
  })

  it('suppresses Pro subscribers (Pro skip)', async () => {
    const summary = await runNudgeCron(
      [
        {
          ...baseCandidate,
          suppression: { subscriptionTier: 'pro' },
        },
      ],
      { now: NOW, send: sendSpy },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.sent).toBe(0)
    expect(summary.suppressed['pro_subscriber']).toBe(1)
    expect(summary.details[0].action).toBe('suppressed')
    expect(summary.details[0].reason).toBe('pro_subscriber')
  })

  it('suppresses unsubscribed users (unsubscribe skip)', async () => {
    const summary = await runNudgeCron(
      [
        {
          ...baseCandidate,
          suppression: { emailUnsubscribed: true },
        },
      ],
      { now: NOW, send: sendSpy },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.suppressed['unsubscribed']).toBe(1)
  })

  it('skips users outside the T-24h±2h window', async () => {
    const summary = await runNudgeCron(
      [
        {
          ...baseCandidate,
          createdAt: new Date(
            NOW.getTime() - 40 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ],
      { now: NOW, send: sendSpy },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.details[0].reason).toBe('out_of_window')
  })

  it('forwards dryRun option to the send function', async () => {
    await runNudgeCron([baseCandidate], {
      now: NOW,
      send: sendSpy,
      dryRun: true,
    })
    expect(sendSpy.mock.calls[0][2]).toEqual({ dryRun: true })
  })

  it('counts multiple suppressed users separately', async () => {
    const summary = await runNudgeCron(
      [
        { ...baseCandidate, clerkUserId: 'p1', suppression: { subscriptionTier: 'pro' } },
        { ...baseCandidate, clerkUserId: 'u1', suppression: { emailUnsubscribed: true } },
        { ...baseCandidate, clerkUserId: 'p2', suppression: { subscriptionTier: 'pro' } },
      ],
      { now: NOW, send: sendSpy },
    )
    expect(summary.suppressed['pro_subscriber']).toBe(2)
    expect(summary.suppressed['unsubscribed']).toBe(1)
    expect(summary.sent).toBe(0)
  })
})

describe('runDigestCron suppression', () => {
  let sendSpy: ReturnType<typeof vi.fn>
  const shared = {
    featuredAgonTopic: 'Should I raise prices?',
    featuredConsensusExcerpt: 'Yes, but stage it.',
    featuredAgonShareId: 'abc',
  }
  const buildUnsubscribe = (id: string) =>
    `https://www.consultthedead.com/unsubscribe?u=${id}`

  beforeEach(() => {
    sendSpy = vi.fn().mockResolvedValue({})
  })

  it('sends to non-Pro non-unsubscribed users', async () => {
    const cand: DigestUserCandidate = {
      clerkUserId: 'u1',
      email: 'u1@example.com',
      firstName: 'Aki',
      suppression: {},
    }
    const summary = await runDigestCron([cand], {
      shared,
      buildUnsubscribeUrl: buildUnsubscribe,
      send: sendSpy,
    })
    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy.mock.calls[0][1].unsubscribeUrl).toBe(
      'https://www.consultthedead.com/unsubscribe?u=u1',
    )
    expect(summary.sent).toBe(1)
  })

  it('suppresses Pro subscribers (Pro skip)', async () => {
    const summary = await runDigestCron(
      [
        {
          clerkUserId: 'pro1',
          email: 'pro1@example.com',
          suppression: { subscriptionTier: 'pro' },
        },
      ],
      {
        shared,
        buildUnsubscribeUrl: buildUnsubscribe,
        send: sendSpy,
      },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.suppressed['pro_subscriber']).toBe(1)
  })

  it('suppresses unsubscribed users (unsubscribe skip)', async () => {
    const summary = await runDigestCron(
      [
        {
          clerkUserId: 'opt1',
          email: 'opt1@example.com',
          suppression: { emailUnsubscribed: true },
        },
      ],
      {
        shared,
        buildUnsubscribeUrl: buildUnsubscribe,
        send: sendSpy,
      },
    )
    expect(sendSpy).not.toHaveBeenCalled()
    expect(summary.suppressed['unsubscribed']).toBe(1)
  })

  it('uses agonsRemainingFor when supplied', async () => {
    const cand: DigestUserCandidate = {
      clerkUserId: 'u1',
      email: 'u1@example.com',
      suppression: {},
    }
    const remainingFn = vi.fn().mockResolvedValue(2)
    await runDigestCron([cand], {
      shared,
      buildUnsubscribeUrl: buildUnsubscribe,
      send: sendSpy,
      agonsRemainingFor: remainingFn,
    })
    expect(remainingFn).toHaveBeenCalledWith('u1')
    expect(sendSpy.mock.calls[0][1].agonsRemaining).toBe(2)
  })

  it('defaults agonsRemaining to null when no lookup provided', async () => {
    await runDigestCron(
      [
        {
          clerkUserId: 'u1',
          email: 'u1@example.com',
          suppression: {},
        },
      ],
      {
        shared,
        buildUnsubscribeUrl: buildUnsubscribe,
        send: sendSpy,
      },
    )
    expect(sendSpy.mock.calls[0][1].agonsRemaining).toBeNull()
  })
})

describe('authorizeCronRequest', () => {
  const url = new URL('https://x.com/api/cron/retention-emails/nudge')

  afterEach(() => {
    // vi.stubEnv lets vitest restore process.env across runs without
    // colliding with Node 22's read-only NODE_ENV descriptor.
    vi.unstubAllEnvs()
  })

  function setNodeEnv(v: string) {
    vi.stubEnv('NODE_ENV', v)
  }

  it('allows in non-production by default', () => {
    setNodeEnv('test')
    expect(authorizeCronRequest(new Headers(), url)).toBeNull()
  })

  it('allows when dryRun=1 query param is present in non-production', () => {
    setNodeEnv('test')
    const u = new URL(url + '?dryRun=1')
    expect(authorizeCronRequest(new Headers(), u)).toBeNull()
  })

  it('allows when x-vercel-cron header is present', () => {
    setNodeEnv('production')
    expect(
      authorizeCronRequest(new Headers({ 'x-vercel-cron': '1' }), url),
    ).toBeNull()
  })

  it('allows when Authorization Bearer matches CRON_SECRET', () => {
    setNodeEnv('production')
    vi.stubEnv('CRON_SECRET', 'shh')
    expect(
      authorizeCronRequest(new Headers({ authorization: 'Bearer shh' }), url),
    ).toBeNull()
  })

  it('rejects production calls with dryRun=1 unless authenticated', () => {
    setNodeEnv('production')
    vi.stubEnv('CRON_SECRET', 'shh')
    const u = new URL(url + '?dryRun=1')
    expect(authorizeCronRequest(new Headers(), u)).toBe('unauthorized')
  })

  it('rejects production calls with no auth + no cron header', () => {
    setNodeEnv('production')
    vi.stubEnv('CRON_SECRET', '')
    expect(authorizeCronRequest(new Headers(), url)).toBe('unauthorized')
  })

  it('rejects production calls with wrong bearer', () => {
    setNodeEnv('production')
    vi.stubEnv('CRON_SECRET', 'right')
    expect(
      authorizeCronRequest(
        new Headers({ authorization: 'Bearer wrong' }),
        url,
      ),
    ).toBe('unauthorized')
  })
})

describe('toPublicCronSummary', () => {
  it('redacts Clerk IDs and email addresses from detail rows', () => {
    const publicSummary = toPublicCronSummary({
      scanned: 2,
      sent: 1,
      suppressed: { unsubscribed: 1 },
      details: [
        {
          clerkUserId: 'user_123',
          email: 'secret@example.com',
          action: 'sent',
        },
        {
          clerkUserId: 'user_456',
          email: 'private@example.com',
          action: 'suppressed',
          reason: 'unsubscribed',
        },
      ],
    })

    expect(publicSummary.scanned).toBe(2)
    expect(publicSummary.sent).toBe(1)
    expect(publicSummary.details).toEqual([
      { action: 'sent' },
      { action: 'suppressed', reason: 'unsubscribed' },
    ])
    expect(JSON.stringify(publicSummary)).not.toContain('user_123')
    expect(JSON.stringify(publicSummary)).not.toContain('secret@example.com')
  })
})
