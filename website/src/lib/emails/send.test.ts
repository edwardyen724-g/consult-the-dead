import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Resend is imported by ./send; mock it before importing the SUT.
const mocks = vi.hoisted(() => ({
  emailsSend: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.emailsSend }
  },
}))

// Now import SUT.
import {
  recapScheduledAt,
  sendDigest,
  sendNudge,
  sendRecap,
  sendRendered,
  sendWelcome,
} from './send'

const FRESH_RESEND_RESPONSE = { data: { id: 'msg_abc' }, error: null }

describe('sendRendered', () => {
  beforeEach(() => {
    mocks.emailsSend.mockReset()
    mocks.emailsSend.mockResolvedValue(FRESH_RESEND_RESPONSE)
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not call Resend when dryRun is true', async () => {
    const r = await sendRendered(
      'to@example.com',
      { subject: 's', html: '<p/>', text: 's' },
      { dryRun: true },
    )
    expect(mocks.emailsSend).not.toHaveBeenCalled()
    expect(r.dryRun).toBe(true)
    expect(r.messageId).toBeNull()
    expect(r.ok).toBe(true)
  })

  it('calls Resend with subject + html + text + EMAIL_FROM env when present', async () => {
    process.env.EMAIL_FROM = 'Custom From <hi@consultthedead.com>'
    await sendRendered('to@example.com', {
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    })
    expect(mocks.emailsSend).toHaveBeenCalledTimes(1)
    const arg = mocks.emailsSend.mock.calls[0][0]
    expect(arg.to).toBe('to@example.com')
    expect(arg.from).toBe('Custom From <hi@consultthedead.com>')
    expect(arg.subject).toBe('Hello')
    expect(arg.html).toBe('<p>Hi</p>')
    expect(arg.text).toBe('Hi')
  })

  it('falls back to onboarding@resend.dev when EMAIL_FROM unset', async () => {
    await sendRendered('to@example.com', {
      subject: 's',
      html: 'h',
      text: 't',
    })
    expect(mocks.emailsSend.mock.calls[0][0].from).toContain('onboarding@resend.dev')
  })

  it('forwards scheduledAt to Resend when provided', async () => {
    await sendRendered(
      'to@example.com',
      { subject: 's', html: 'h', text: 't' },
      { scheduledAt: '2026-05-09T12:00:00.000Z' },
    )
    expect(mocks.emailsSend.mock.calls[0][0].scheduledAt).toBe(
      '2026-05-09T12:00:00.000Z',
    )
  })

  it('throws when Resend returns an error', async () => {
    mocks.emailsSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'rate limit' },
    })
    await expect(
      sendRendered('to@example.com', { subject: 's', html: 'h', text: 't' }),
    ).rejects.toThrow(/Resend send failed: rate limit/)
  })

  it('returns the Resend message id on success', async () => {
    const r = await sendRendered('to@example.com', {
      subject: 's',
      html: 'h',
      text: 't',
    })
    expect(r.messageId).toBe('msg_abc')
    expect(r.dryRun).toBe(false)
  })
})

describe('campaign send wrappers', () => {
  beforeEach(() => {
    mocks.emailsSend.mockReset()
    mocks.emailsSend.mockResolvedValue(FRESH_RESEND_RESPONSE)
  })

  it('sendWelcome composes the welcome template', async () => {
    const r = await sendWelcome('to@example.com', { firstName: 'Ada' }, { dryRun: true })
    expect(r.rendered.subject).toBe('Your council is assembled.')
    expect(r.rendered.text).toContain('Hi Ada,')
  })

  it('sendNudge composes the nudge template', async () => {
    const r = await sendNudge('to@example.com', { firstName: 'Lin' }, { dryRun: true })
    expect(r.rendered.subject).toBe("You haven't asked them anything yet")
  })

  it('sendRecap composes the recap template', async () => {
    const r = await sendRecap(
      'to@example.com',
      {
        firstName: 'A',
        agonTopic: 't',
        councilNames: ['Machiavelli'],
        consensusExcerpt: 'verdict',
        agonShareId: 'abc',
        agonsRemaining: 1,
      },
      { dryRun: true },
    )
    expect(r.rendered.subject).toContain('Machiavelli')
  })

  it('sendDigest composes the digest template', async () => {
    const r = await sendDigest(
      'to@example.com',
      {
        firstName: 'Z',
        featuredAgonTopic: 't',
        featuredConsensusExcerpt: 'c',
        featuredAgonShareId: 'shr',
        agonsRemaining: 'unlimited',
        unsubscribeUrl: 'https://x/u',
      },
      { dryRun: true },
    )
    expect(r.rendered.subject).toContain("This week's most-debated question")
  })
})

describe('recapScheduledAt', () => {
  it('returns now + 1 hour as ISO string', () => {
    const now = new Date('2026-05-09T10:00:00.000Z')
    expect(recapScheduledAt(now)).toBe('2026-05-09T11:00:00.000Z')
  })

  it('uses live clock when called without arg (smoke)', () => {
    const before = Date.now()
    const iso = recapScheduledAt()
    const t = new Date(iso).getTime()
    expect(t).toBeGreaterThanOrEqual(before + 60 * 60 * 1000 - 50)
    expect(t).toBeLessThanOrEqual(before + 60 * 60 * 1000 + 1000)
  })
})
