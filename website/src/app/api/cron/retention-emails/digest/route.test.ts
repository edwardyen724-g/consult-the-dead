import { afterEach, describe, expect, it, vi } from 'vitest'
import { clerkClient } from '@clerk/nextjs/server'
import { runDigestCron } from '@/lib/emails/cron'
import { GET } from './route'

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
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
  it('rejects production dry-run requests without bearer auth, even with x-vercel-cron', async () => {
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
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/digest?dryRun=1',
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
      sent: 1,
      suppressed: {},
      details: [{ action: 'sent' }],
    })
    expect(body.details[0].clerkUserId).toBeUndefined()
    expect(body.details[0].email).toBeUndefined()
    expect(clerkClientMock).toHaveBeenCalledTimes(1)
    expect(runDigestCronMock).toHaveBeenCalledTimes(1)
    expect(runDigestCronMock.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        clerkUserId: 'user_123',
        email: 'secret@example.com',
      }),
    ])
  })
})
