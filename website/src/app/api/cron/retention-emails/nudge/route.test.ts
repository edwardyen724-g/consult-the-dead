import { afterEach, describe, expect, it, vi } from 'vitest'
import { clerkClient } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'
import { runNudgeCron } from '@/lib/emails/cron'
import { GET } from './route'

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}))

vi.mock('@/lib/emails/cron', async () => {
  const actual = await vi.importActual<typeof import('@/lib/emails/cron')>(
    '@/lib/emails/cron',
  )

  return {
    ...actual,
    runNudgeCron: vi.fn(),
  }
})

const clerkClientMock = vi.mocked(clerkClient)
const sqlMock = vi.mocked(sql)
const runNudgeCronMock = vi.mocked(runNudgeCron)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('GET /api/cron/retention-emails/nudge', () => {
  it('rejects production dry-run requests without auth', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/nudge?dryRun=1',
      ) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' })
    expect(clerkClientMock).not.toHaveBeenCalled()
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('rejects spoofed x-vercel-cron requests without bearer auth', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/nudge?dryRun=1',
        {
          headers: { 'x-vercel-cron': '1' },
        },
      ) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' })
    expect(clerkClientMock).not.toHaveBeenCalled()
    expect(sqlMock).not.toHaveBeenCalled()
    expect(runNudgeCronMock).not.toHaveBeenCalled()
  })

  it('loads eligible Clerk users, counts agons, and forwards them to the cron runner', async () => {
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
              createdAt: Date.now() - 25 * 60 * 60 * 1000,
              publicMetadata: { subscription_tier: 'pro' },
              privateMetadata: { email_unsubscribed: true },
            },
          ],
        }),
      },
    } as never)

    sqlMock.mockResolvedValue({
      rows: [{ n: 2 }],
    } as never)

    runNudgeCronMock.mockResolvedValue({
      scanned: 1,
      sent: 0,
      suppressed: {},
      details: [
        {
          clerkUserId: 'user_123',
          email: 'secret@example.com',
          action: 'skipped',
          reason: 'has_agons',
        },
      ],
    } as never)

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/nudge?dryRun=1',
        {
          headers: { authorization: 'Bearer secret' },
        },
      ) as never,
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      dryRun: true,
      scanned: 1,
      sent: 0,
      suppressed: {},
      details: [{ action: 'skipped', reason: 'has_agons' }],
    })
    expect(body.details[0].clerkUserId).toBeUndefined()
    expect(body.details[0].email).toBeUndefined()
    expect(clerkClientMock).toHaveBeenCalledTimes(1)
    expect(sqlMock).toHaveBeenCalledTimes(1)
    expect(runNudgeCronMock).toHaveBeenCalledTimes(1)
    expect(runNudgeCronMock.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        clerkUserId: 'user_123',
        email: 'secret@example.com',
        firstName: 'Ada',
        createdAt: expect.any(String),
        agonCount: 2,
        suppression: {
          subscriptionTier: 'pro',
          emailUnsubscribed: true,
          emailBounceCount: undefined,
        },
      }),
    ])
    expect(runNudgeCronMock.mock.calls[0][1]).toEqual({ dryRun: true })
  })

  it('returns the dry-run smoke-test fallback when candidate loading fails', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockRejectedValue(new Error('clerk unavailable'))

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/nudge?dryRun=1',
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
    expect(runNudgeCronMock).not.toHaveBeenCalled()
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('rethrows candidate-loading failures outside dry-run mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockRejectedValue(new Error('clerk unavailable'))

    await expect(
      GET(
        new Request(
          'https://consultthedead.com/api/cron/retention-emails/nudge',
          {
            headers: { authorization: 'Bearer secret' },
          },
        ) as never,
      ),
    ).rejects.toThrow('clerk unavailable')
    expect(runNudgeCronMock).not.toHaveBeenCalled()
    expect(sqlMock).not.toHaveBeenCalled()
  })
})
