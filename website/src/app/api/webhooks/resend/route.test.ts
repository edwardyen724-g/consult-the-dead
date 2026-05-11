import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  clerkClientMock: vi.fn(),
  getUserListMock: vi.fn(),
  updateUserMetadataMock: vi.fn(),
}))

vi.mock('svix', () => ({
  Webhook: vi.fn(function MockWebhook(this: unknown, secret: string) {
    void secret
    return {
      verify: mocks.verifyMock,
    }
  }),
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: mocks.clerkClientMock,
}))

import { POST } from './route'

function makeRequest(event: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/webhooks/resend', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'svix-id': 'msg_123',
      'svix-timestamp': '1715256000',
      'svix-signature': 'v1.signature',
    },
    body: JSON.stringify(event),
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-09T12:00:00.000Z'))
  vi.clearAllMocks()
  process.env.RESEND_WEBHOOK_SECRET = 'test-resend-webhook-secret'

  mocks.clerkClientMock.mockResolvedValue({
    users: {
      getUserList: mocks.getUserListMock,
      updateUserMetadata: mocks.updateUserMetadataMock,
    },
  })
})

afterEach(() => {
  vi.useRealTimers()
  delete process.env.RESEND_WEBHOOK_SECRET
})

describe('POST /api/webhooks/resend', () => {
  it('marks the matching Clerk user suppressed on bounce events', async () => {
    mocks.verifyMock.mockReturnValue({
      type: 'email.bounced',
      data: { to: ['bounce@example.com'] },
    })
    mocks.getUserListMock.mockResolvedValue({
      data: [{ id: 'user_123' }],
    })

    const response = await POST(makeRequest({ type: 'email.bounced' }) as never)

    expect(response.status).toBe(200)
    expect(mocks.getUserListMock).toHaveBeenCalledWith({
      emailAddress: ['bounce@example.com'],
      limit: 1,
    })
    expect(mocks.updateUserMetadataMock).toHaveBeenCalledWith('user_123', {
      privateMetadata: {
        email_suppressed: true,
        email_suppressed_at: '2026-05-09T12:00:00.000Z',
        email_suppressed_reason: 'email.bounced',
      },
    })
  })

  it('marks the matching Clerk user suppressed on complaint events', async () => {
    mocks.verifyMock.mockReturnValue({
      type: 'email.complained',
      data: { to: ['complaint@example.com'] },
    })
    mocks.getUserListMock.mockResolvedValue({
      data: [{ id: 'user_456' }],
    })

    const response = await POST(makeRequest({ type: 'email.complained' }) as never)

    expect(response.status).toBe(200)
    expect(mocks.getUserListMock).toHaveBeenCalledWith({
      emailAddress: ['complaint@example.com'],
      limit: 1,
    })
    expect(mocks.updateUserMetadataMock).toHaveBeenCalledWith('user_456', {
      privateMetadata: {
        email_suppressed: true,
        email_suppressed_at: '2026-05-09T12:00:00.000Z',
        email_suppressed_reason: 'email.complained',
      },
    })
  })

  it('ignores unrelated webhook events', async () => {
    mocks.verifyMock.mockReturnValue({
      type: 'email.delivered',
      data: { to: ['skip@example.com'] },
    })

    const response = await POST(makeRequest({ type: 'email.delivered' }) as never)

    expect(response.status).toBe(200)
    expect(mocks.getUserListMock).not.toHaveBeenCalled()
    expect(mocks.updateUserMetadataMock).not.toHaveBeenCalled()
  })
})
