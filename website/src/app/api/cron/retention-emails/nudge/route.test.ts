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

vi.mock('@/lib/emails/send', () => ({
  sendNudge: vi.fn(),
  sendDigest: vi.fn(),
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
  it('rejects production dry-run requests without bearer auth, even with x-vercel-cron', async () => {
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

  it('redacts Clerk identity fields from the returned dry-run summary', async () => {
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

  it('skips users without emails or ineligible windows and falls back to the first email address', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'no_email',
              firstName: 'Skip',
              emailAddresses: [],
              createdAt: Date.now() - 25 * 60 * 60 * 1000,
              publicMetadata: {},
              privateMetadata: {},
            },
            {
              id: 'old_user',
              firstName: 'Old',
              emailAddresses: [
                {
                  id: 'email_old',
                  emailAddress: 'old@example.com',
                },
              ],
              primaryEmailAddressId: 'email_old',
              createdAt: Date.now() - 30 * 60 * 60 * 1000,
              publicMetadata: {},
              privateMetadata: {},
            },
            {
              id: 'missing_timestamp',
              firstName: 'Null',
              emailAddresses: [
                {
                  id: 'email_null',
                  emailAddress: 'null@example.com',
                },
              ],
              primaryEmailAddressId: 'email_null',
              publicMetadata: {},
              privateMetadata: {},
            },
            {
              id: 'user_456',
              firstName: 'Ben',
              emailAddresses: [
                {
                  id: 'email_2',
                  emailAddress: 'ben@example.com',
                },
              ],
              primaryEmailAddressId: 'missing_primary',
              createdAt: Date.now() - 25 * 60 * 60 * 1000,
              publicMetadata: {},
              privateMetadata: {},
            },
          ],
        }),
      },
    } as never)

    sqlMock.mockRejectedValueOnce(new Error('db unavailable'))

    runNudgeCronMock.mockResolvedValue({
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
      new Request('https://consultthedead.com/api/cron/retention-emails/nudge', {
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
    expect(runNudgeCronMock).toHaveBeenCalledTimes(1)
    expect(runNudgeCronMock.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        clerkUserId: 'user_456',
        email: 'ben@example.com',
        firstName: 'Ben',
        createdAt: expect.any(String),
        agonCount: 0,
      }),
    ])
    expect(runNudgeCronMock.mock.calls[0][1]).toEqual({ dryRun: false })
    expect(sqlMock).toHaveBeenCalledTimes(1)
  })

  it('stores a null firstName and zero agon count when Clerk omits the name and Postgres returns no rows', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'user_null_name',
              emailAddresses: [
                {
                  id: 'email_null_name',
                  emailAddress: 'nullname@example.com',
                },
              ],
              primaryEmailAddressId: 'missing_primary',
              createdAt: Date.now() - 25 * 60 * 60 * 1000,
              publicMetadata: {},
              privateMetadata: {},
            },
          ],
        }),
      },
    } as never)

    sqlMock.mockResolvedValue({
      rows: [],
    } as never)

    runNudgeCronMock.mockResolvedValue({
      scanned: 1,
      sent: 1,
      suppressed: {},
      details: [
        {
          clerkUserId: 'user_null_name',
          email: 'nullname@example.com',
          action: 'sent',
        },
      ],
    } as never)

    const response = await GET(
      new Request('https://consultthedead.com/api/cron/retention-emails/nudge', {
        headers: { authorization: 'Bearer secret' },
      }) as never,
    )

    expect(response.status).toBe(200)
    expect(runNudgeCronMock).toHaveBeenCalledTimes(1)
    expect(runNudgeCronMock.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        clerkUserId: 'user_null_name',
        email: 'nullname@example.com',
        firstName: null,
        createdAt: expect.any(String),
        agonCount: 0,
      }),
    ])
    expect(sqlMock).toHaveBeenCalledTimes(1)
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

  it('returns the dry-run smoke-test fallback when candidate loading fails with a non-Error reason', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    clerkClientMock.mockRejectedValue('clerk unavailable' as never)

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
