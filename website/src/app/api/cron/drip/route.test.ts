/**
 * Tests for POST /api/cron/drip — post-signup email drip cron route.
 *
 * Route handlers are excluded from the vitest coverage gate
 * (route files are in the exclude list in vitest.config.ts).
 * These tests are regression guards for the auth, validation, and
 * dispatch logic.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---- hoisted mocks ----

const getUserListMock = vi.hoisted(() => vi.fn())
const updateUserMetadataMock = vi.hoisted(() => vi.fn())
const clerkClientMock = vi.hoisted(() => vi.fn())
const sendRenderedMock = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: clerkClientMock,
}))

vi.mock('@/lib/emails/send', () => ({
  sendRendered: sendRenderedMock,
}))

// Import after mocks
import {
  DRIP_CRON_CONTRACT,
  getDripWindow,
  dripSentMetaKey,
  isAuthorizedCronRequest,
  type DripDay,
} from './route'

// ---- helpers ----

function makeRequest(opts: {
  day?: number | string
  dryRun?: boolean
  auth?: string | null
  vercelCron?: boolean
} = {}): Request {
  const url = new URL('https://app.test/api/cron/drip')
  if (opts.day !== undefined) url.searchParams.set('day', String(opts.day))
  if (opts.dryRun) url.searchParams.set('dry_run', '1')

  const headers: Record<string, string> = {}
  if (opts.auth !== undefined && opts.auth !== null)
    headers['authorization'] = opts.auth
  if (opts.vercelCron) headers['x-vercel-cron'] = '1'

  return new Request(url.toString(), { method: 'POST', headers })
}

function makeClerkUser(overrides: {
  id?: string
  createdAt?: number
  firstName?: string | null
  emailAddresses?: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string
  publicMetadata?: Record<string, unknown>
  privateMetadata?: Record<string, unknown>
} = {}) {
  const emailAddresses = overrides.emailAddresses ?? [
    { id: 'em_1', emailAddress: 'user@test.com' },
  ]
  return {
    id: overrides.id ?? 'user_abc',
    createdAt: overrides.createdAt ?? Date.now(),
    firstName: overrides.firstName ?? 'Test',
    emailAddresses,
    primaryEmailAddressId: overrides.primaryEmailAddressId ?? 'em_1',
    publicMetadata: overrides.publicMetadata ?? {},
    privateMetadata: overrides.privateMetadata ?? {},
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env.CRON_SECRET = 'test-secret'

  clerkClientMock.mockResolvedValue({
    users: {
      getUserList: getUserListMock,
      updateUserMetadata: updateUserMetadataMock,
    },
  })
  getUserListMock.mockResolvedValue({ data: [] })
  updateUserMetadataMock.mockResolvedValue({})
  sendRenderedMock.mockResolvedValue({ ok: true, messageId: 'msg_1', dryRun: false })
})

// ---- GET manifest ----

describe('GET /api/cron/drip', () => {
  it('returns the canonical contract manifest', async () => {
    const { GET } = await import('./route')
    const res = await GET()
    const body = await res.json()
    expect(body).toEqual(DRIP_CRON_CONTRACT)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})

// ---- DRIP_CRON_CONTRACT ----

describe('DRIP_CRON_CONTRACT', () => {
  it('references the correct route', () => {
    expect(DRIP_CRON_CONTRACT.route).toBe('/api/cron/drip')
  })

  it('documents day as a required query param', () => {
    expect(DRIP_CRON_CONTRACT.queryParams.day).toContain('1')
    expect(DRIP_CRON_CONTRACT.queryParams.day).toContain('7')
  })
})

// ---- getDripWindow ----

describe('getDripWindow', () => {
  it('returns a window 1 day before now for day=1', () => {
    const now = new Date('2026-05-12T12:00:00Z')
    const { windowStart, windowEnd } = getDripWindow(1, now)
    // 1 day ago start = 2026-05-11T00:00:00Z, minus 2h grace = 2026-05-10T22:00:00Z
    expect(windowStart.getUTCDate()).toBe(10)
    expect(windowStart.getUTCHours()).toBe(22)
    // 1 day ago end = 2026-05-12T00:00:00Z, plus 2h grace = 2026-05-12T02:00:00Z
    expect(windowEnd.getUTCDate()).toBe(12)
    expect(windowEnd.getUTCHours()).toBe(2)
  })

  it('returns a window 3 days before now for day=3', () => {
    const now = new Date('2026-05-12T12:00:00Z')
    const { windowStart, windowEnd } = getDripWindow(3, now)
    // 3 days ago UTC midnight = 2026-05-09
    expect(windowStart.getUTCDate()).toBe(8) // with 2h grace
    expect(windowEnd.getUTCDate()).toBe(10)
  })

  it('returns a window 7 days before now for day=7', () => {
    const now = new Date('2026-05-12T12:00:00Z')
    const { windowStart, windowEnd } = getDripWindow(7, now)
    // 7 days ago UTC midnight = 2026-05-05
    expect(windowStart.getUTCDate()).toBe(4)
    expect(windowEnd.getUTCDate()).toBe(6)
  })

  it('windowEnd is always after windowStart', () => {
    for (const day of [1, 3, 7] as DripDay[]) {
      const { windowStart, windowEnd } = getDripWindow(day)
      expect(windowEnd.getTime()).toBeGreaterThan(windowStart.getTime())
    }
  })
})

// ---- dripSentMetaKey ----

describe('dripSentMetaKey', () => {
  it('returns drip_day1_sent_at for day 1', () => {
    expect(dripSentMetaKey(1)).toBe('drip_day1_sent_at')
  })

  it('returns drip_day3_sent_at for day 3', () => {
    expect(dripSentMetaKey(3)).toBe('drip_day3_sent_at')
  })

  it('returns drip_day7_sent_at for day 7', () => {
    expect(dripSentMetaKey(7)).toBe('drip_day7_sent_at')
  })
})

// ---- isAuthorizedCronRequest ----

describe('isAuthorizedCronRequest', () => {
  it('returns true for matching Bearer token', () => {
    const req = makeRequest({ auth: 'Bearer test-secret' })
    expect(isAuthorizedCronRequest(req)).toBe(true)
  })

  it('returns true for x-vercel-cron header', () => {
    const req = makeRequest({ vercelCron: true })
    expect(isAuthorizedCronRequest(req)).toBe(true)
  })

  it('returns false for wrong Bearer token', () => {
    const req = makeRequest({ auth: 'Bearer wrong' })
    expect(isAuthorizedCronRequest(req)).toBe(false)
  })

  it('returns false when no auth provided', () => {
    const req = makeRequest({})
    expect(isAuthorizedCronRequest(req)).toBe(false)
  })

  it('returns false when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET
    const req = makeRequest({ auth: 'Bearer test-secret' })
    expect(isAuthorizedCronRequest(req)).toBe(false)
  })
})

// ---- POST handler ----

describe('POST /api/cron/drip', () => {
  it('returns 401 when request is unauthorized', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ day: 1 }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when day param is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('day must be 1, 3, or 7')
  })

  it('returns 400 when day param is invalid (e.g. 2)', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 2 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when day param is 0', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 0 }))
    expect(res.status).toBe(400)
  })

  it('scans zero users when Clerk returns empty list', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.scanned).toBe(0)
    expect(body.sent).toBe(0)
  })

  it('skips users outside the drip window', async () => {
    // createdAt = now (not 1 day ago), so should not be in window
    const user = makeClerkUser({ createdAt: Date.now() })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()
    expect(body.scanned).toBe(0)
    expect(sendRenderedMock).not.toHaveBeenCalled()
  })

  it('skips users with drip_day1_sent_at already set (idempotency)', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000 // clearly in day-1 window
    const user = makeClerkUser({
      createdAt: oneDayAgo,
      publicMetadata: { drip_day1_sent_at: '2026-05-11T00:00:00Z' },
    })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()
    expect(body.scanned).toBe(1)
    expect(body.skipped).toBe(1)
    expect(sendRenderedMock).not.toHaveBeenCalled()
  })

  it('suppresses Pro subscribers and increments suppressed count', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user = makeClerkUser({
      createdAt: oneDayAgo,
      publicMetadata: { subscription_tier: 'pro' },
    })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()
    expect(body.scanned).toBe(1)
    expect(body.suppressed).toBe(1)
    expect(body.sent).toBe(0)
    expect(sendRenderedMock).not.toHaveBeenCalled()
  })

  it('suppresses unsubscribed users', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user = makeClerkUser({
      createdAt: oneDayAgo,
      privateMetadata: { email_unsubscribed: true },
    })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()
    expect(body.suppressed).toBe(1)
    expect(sendRenderedMock).not.toHaveBeenCalled()
  })

  it('sends day-1 email to an eligible user in the window', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user = makeClerkUser({ createdAt: oneDayAgo })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()

    expect(body.scanned).toBe(1)
    expect(body.sent).toBe(1)
    expect(body.suppressed).toBe(0)
    expect(sendRenderedMock).toHaveBeenCalledOnce()
    const [toArg, renderedArg] = sendRenderedMock.mock.calls[0] as [string, { subject: string }]
    expect(toArg).toBe('user@test.com')
    expect(renderedArg.subject).toBeTruthy()
    // should mark sent in Clerk
    expect(updateUserMetadataMock).toHaveBeenCalledWith('user_abc', {
      publicMetadata: { drip_day1_sent_at: expect.any(String) },
    })
  })

  it('sends day-3 email to an eligible user in the day-3 window', async () => {
    const threeDaysAgo = Date.now() - 73 * 60 * 60 * 1000
    const user = makeClerkUser({ createdAt: threeDaysAgo })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    await POST(makeRequest({ auth: 'Bearer test-secret', day: 3 }))

    expect(sendRenderedMock).toHaveBeenCalledOnce()
    expect(updateUserMetadataMock).toHaveBeenCalledWith('user_abc', {
      publicMetadata: { drip_day3_sent_at: expect.any(String) },
    })
  })

  it('sends day-7 email to an eligible user in the day-7 window', async () => {
    const sevenDaysAgo = Date.now() - 169 * 60 * 60 * 1000
    const user = makeClerkUser({ createdAt: sevenDaysAgo })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    await POST(makeRequest({ auth: 'Bearer test-secret', day: 7 }))

    expect(sendRenderedMock).toHaveBeenCalledOnce()
    expect(updateUserMetadataMock).toHaveBeenCalledWith('user_abc', {
      publicMetadata: { drip_day7_sent_at: expect.any(String) },
    })
  })

  it('does not call Resend in dry-run mode', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user = makeClerkUser({ createdAt: oneDayAgo })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1, dryRun: true }))
    const body = await res.json()

    expect(body.dryRun).toBe(true)
    expect(body.sent).toBe(1)
    expect(sendRenderedMock).not.toHaveBeenCalled()
    expect(updateUserMetadataMock).not.toHaveBeenCalled()
  })

  it('skips users with no email address', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user = makeClerkUser({ createdAt: oneDayAgo, emailAddresses: [] })
    getUserListMock.mockResolvedValue({ data: [user] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()
    expect(body.scanned).toBe(1)
    expect(body.skipped).toBe(1)
    expect(sendRenderedMock).not.toHaveBeenCalled()
  })

  it('continues batch when one send fails', async () => {
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000
    const user1 = makeClerkUser({ id: 'u1', createdAt: oneDayAgo, emailAddresses: [{ id: 'e1', emailAddress: 'a@test.com' }], primaryEmailAddressId: 'e1' })
    const user2 = makeClerkUser({ id: 'u2', createdAt: oneDayAgo, emailAddresses: [{ id: 'e2', emailAddress: 'b@test.com' }], primaryEmailAddressId: 'e2' })
    getUserListMock.mockResolvedValue({ data: [user1, user2] })

    sendRenderedMock
      .mockRejectedValueOnce(new Error('Resend error'))
      .mockResolvedValueOnce({ ok: true })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 1 }))
    const body = await res.json()

    expect(body.scanned).toBe(2)
    expect(body.sent).toBe(1)
    expect(body.skipped).toBe(1)
  })

  it('accepts Vercel cron header as authorization', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ vercelCron: true, day: 1 }))
    // Should not be 401
    expect(res.status).toBe(200)
  })

  it('summary includes day and dryRun fields', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ auth: 'Bearer test-secret', day: 3 }))
    const body = await res.json()
    expect(body.day).toBe(3)
    expect(body.dryRun).toBe(false)
  })
})
