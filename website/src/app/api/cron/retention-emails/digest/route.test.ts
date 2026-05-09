import { afterEach, describe, expect, it, vi } from 'vitest'
import { clerkClient } from '@clerk/nextjs/server'
import { runDigestCron } from '@/lib/emails/cron'
import { GET } from './route'

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}))

vi.mock('@/lib/emails/cron', async () => {
  const actual = await vi.importActual<typeof import('@/lib/emails/cron')>(
    '@/lib/emails/cron',
  )

  return {
    ...actual,
    runDigestCron: vi.fn(),
  }
})

const clerkClientMock = vi.mocked(clerkClient)
const runDigestCronMock = vi.mocked(runDigestCron)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('GET /api/cron/retention-emails/digest', () => {
  it('rejects production dry-run requests without auth', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/digest?dryRun=1',
      ) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' })
    expect(clerkClientMock).not.toHaveBeenCalled()
    expect(runDigestCronMock).not.toHaveBeenCalled()
  })

  it('rejects spoofed x-vercel-cron requests without bearer auth', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/digest?dryRun=1',
        {
          headers: { 'x-vercel-cron': '1' },
        },
      ) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' })
    expect(clerkClientMock).not.toHaveBeenCalled()
    expect(runDigestCronMock).not.toHaveBeenCalled()
  })

  it('redacts Clerk identity fields from the returned summary', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'user_123',
              firstName: 'Ada',
              emailAddresses: [
                {
                  id: 'email_1',
                  emailAddress: 'secret@example.com',
                },
              ],
              primaryEmailAddressId: 'email_1',
              publicMetadata: {},
              privateMetadata: {},
            },
          ],
        }),
      },
    } as never)

    runDigestCronMock.mockResolvedValue({
      scanned: 1,
      sent: 1,
      suppressed: {},
      details: [
        {
          clerkUserId: 'user_123',
          email: 'secret@example.com',
          action: 'sent',
        },
      ],
    } as never)

    const response = await GET(
      new Request('https://consultthedead.com/api/cron/retention-emails/digest?dryRun=1', {
        headers: { authorization: 'Bearer secret' },
      }) as never,
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      dryRun: true,
      scanned: 1,
      sent: 1,
      suppressed: {},
      details: [{ action: 'sent' }],
    })
    expect(body.details[0].clerkUserId).toBeUndefined()
    expect(body.details[0].email).toBeUndefined()
    expect(runDigestCronMock).toHaveBeenCalledTimes(1)
    expect(runDigestCronMock.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        clerkUserId: 'user_123',
        email: 'secret@example.com',
      }),
    ])
    expect(runDigestCronMock.mock.calls[0][1]).toMatchObject({
      shared: {
        featuredAgonTopic: '(dry-run placeholder topic)',
        featuredConsensusExcerpt: '(dry-run placeholder consensus)',
        featuredAgonShareId: 'dry-run',
      },
    })
    expect(
      runDigestCronMock.mock.calls[0][1].buildUnsubscribeUrl('user_123'),
    ).toBe('https://www.consultthedead.com/account/email-unsubscribe?u=user_123')
    expect(runDigestCronMock.mock.calls[0][1].dryRun).toBe(true)
  })

  it('uses env-sourced featured agon data in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')
    vi.stubEnv('FEATURED_AGON_TOPIC', 'Should I raise prices?')
    vi.stubEnv('FEATURED_AGON_CONSENSUS', 'Stage it, then expand.')
    vi.stubEnv('FEATURED_AGON_SHARE_ID', 'abc123')
    vi.stubEnv('NEW_MIND_NAME', 'Machiavelli')
    vi.stubEnv('NEW_MIND_TAGLINE', 'Power before purity')
    vi.stubEnv('NEW_MIND_HOW_ARGUES', 'Tests leverage and incentives.')

    clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'user_456',
              firstName: 'Ben',
              emailAddresses: [
                {
                  id: 'email_2',
                  emailAddress: 'ben@example.com',
                },
              ],
              primaryEmailAddressId: 'email_2',
              publicMetadata: {},
              privateMetadata: {},
            },
          ],
        }),
      },
    } as never)

    runDigestCronMock.mockResolvedValue({
      scanned: 1,
      sent: 1,
      suppressed: {},
      details: [
        {
          clerkUserId: 'user_456',
          email: 'ben@example.com',
          action: 'sent',
        },
      ],
    } as never)

    const response = await GET(
      new Request('https://consultthedead.com/api/cron/retention-emails/digest', {
        headers: { authorization: 'Bearer secret' },
      }) as never,
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      dryRun: false,
      scanned: 1,
      sent: 1,
      suppressed: {},
      details: [{ action: 'sent' }],
    })
    expect(runDigestCronMock).toHaveBeenCalledTimes(1)
    expect(runDigestCronMock.mock.calls[0][0][0]).toMatchObject({
      clerkUserId: 'user_456',
      email: 'ben@example.com',
    })
    expect(runDigestCronMock.mock.calls[0][1]).toMatchObject({
      shared: {
        featuredAgonTopic: 'Should I raise prices?',
        featuredConsensusExcerpt: 'Stage it, then expand.',
        featuredAgonShareId: 'abc123',
        newMindName: 'Machiavelli',
        newMindTagline: 'Power before purity',
        newMindHowArguesBlurb: 'Tests leverage and incentives.',
      },
      dryRun: false,
    })
  })

  it('returns 500 when production digest env vars are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn().mockResolvedValue({ data: [] }),
      },
    } as never)

    const response = await GET(
      new Request('https://consultthedead.com/api/cron/retention-emails/digest', {
        headers: { authorization: 'Bearer secret' },
      }) as never,
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'FEATURED_AGON_* env vars not configured',
    })
    expect(runDigestCronMock).not.toHaveBeenCalled()
  })

  it('returns the dry-run smoke-test fallback when Clerk loading fails', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockRejectedValue(new Error('clerk unavailable'))

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/digest?dryRun=1',
        {
          headers: { authorization: 'Bearer secret' },
        },
      ) as never,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      dryRun: true,
      note: 'load_failed_in_dry_run',
      error: 'clerk unavailable',
    })
    expect(runDigestCronMock).not.toHaveBeenCalled()
  })
})
