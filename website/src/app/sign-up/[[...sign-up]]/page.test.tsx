// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockUpdate = vi.fn()

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-sign-up" />,
  useSignUp: vi.fn(),
}))

// utm module: fully mocked so utm.ts is not instrumented in sign-up coverage.
// utm.ts coverage is measured separately by utm.test.ts.
vi.mock('@/lib/utm', () => ({
  getUtmOrNull: vi.fn(),
  serializeUtmForClerkMetadata: vi.fn((utm: Record<string, string | null>) => {
    const out: Record<string, string> = {}
    if (utm.utm_source) out.utm_source = utm.utm_source
    if (utm.utm_campaign) out.utm_campaign = utm.utm_campaign
    if (utm.utm_content) out.utm_content = utm.utm_content
    return out
  }),
}))

// use-clerk-utm-stamper: mock so SignUpClient tests can verify it is invoked.
vi.mock('@/lib/use-clerk-utm-stamper', () => ({
  useClerkUtmStamper: vi.fn(),
}))

import { useSignUp } from '@clerk/nextjs'
import { getUtmOrNull } from '@/lib/utm'
import { useClerkUtmStamper } from '@/lib/use-clerk-utm-stamper'
import SignUpPage, { metadata } from './page'
import { SignUpClient } from './SignUpClient'
import { UtmStamper } from './UtmStamper'
import { renderToStaticMarkup } from 'react-dom/server'
import { render, act } from '@testing-library/react'

// ── metadata ──────────────────────────────────────────────────────────────

describe('SignUpPage metadata', () => {
  it('exports a metadata object', () => {
    expect(metadata).toBeDefined()
  })

  it('sets title to "Sign Up — Consult The Dead"', () => {
    expect(metadata.title).toBe('Sign Up — Consult The Dead')
  })

  it('sets robots.index to false', () => {
    const robots = metadata.robots as { index: boolean; follow: boolean }
    expect(robots.index).toBe(false)
  })

  it('sets robots.follow to false', () => {
    const robots = metadata.robots as { index: boolean; follow: boolean }
    expect(robots.follow).toBe(false)
  })
})

// ── SignUpPage rendering ──────────────────────────────────────────────────

describe('SignUpPage', () => {
  it('renders without throwing', () => {
    const el = SignUpPage() as React.ReactElement
    expect(el).toBeDefined()
  })
})

// ── SignUpClient ───────────────────────────────────────────────────────────

describe('SignUpClient', () => {
  it('renders the Clerk SignUp widget inside a centred wrapper', () => {
    const html = renderToStaticMarkup(<SignUpClient />)
    expect(html).toContain('data-testid="clerk-sign-up"')
  })

  it('applies centering styles to the wrapper div', () => {
    const html = renderToStaticMarkup(<SignUpClient />)
    expect(html).toContain('display:flex')
    expect(html).toContain('min-height:100vh')
  })

  it('invokes useClerkUtmStamper when rendered (hook is wired into component)', () => {
    vi.clearAllMocks()
    render(<SignUpClient />)
    expect(vi.mocked(useClerkUtmStamper)).toHaveBeenCalled()
  })

  it('shows a value proposition header above the sign-up form', () => {
    const html = renderToStaticMarkup(<SignUpClient />)
    expect(html).toContain('data-testid="signup-value-header"')
    expect(html).toContain('Run your first agon')
    expect(html).toContain('3 free debates per day')
    expect(html).toContain('No credit card required')
  })
})

// ── UtmStamper ────────────────────────────────────────────────────────────
// The Clerk v7 useSignUp() hook returns { signUp, fetchStatus, errors }.
// fetchStatus is 'fetching' while loading, 'idle' when ready.

describe('UtmStamper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue({ error: null })
  })

  it('is a React component (function)', () => {
    expect(typeof UtmStamper).toBe('function')
  })

  it('renders nothing — returns null (empty markup)', () => {
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'fetching',
      signUp: { unsafeMetadata: {}, update: mockUpdate },
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(null)

    const { container } = render(<UtmStamper />)
    expect(container.innerHTML).toBe('')
  })

  it('is a no-op when fetchStatus is "fetching" (Clerk not yet ready)', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'fetching',
      signUp: { unsafeMetadata: {}, update: mockUpdate },
    } as unknown as ReturnType<typeof useSignUp>)

    await act(async () => {
      render(<UtmStamper />)
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('is a no-op when getUtmOrNull returns null (no UTMs in URL)', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'idle',
      signUp: { unsafeMetadata: {}, update: mockUpdate },
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(null)

    await act(async () => {
      render(<UtmStamper />)
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls signUp.update with serialised UTMs when fetchStatus is idle and UTMs are present', async () => {
    const fakeUtm = { utm_source: 'hn', utm_campaign: 'launch', utm_content: null }
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'idle',
      signUp: { unsafeMetadata: {}, update: mockUpdate },
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(fakeUtm)

    await act(async () => {
      render(<UtmStamper />)
    })

    expect(mockUpdate).toHaveBeenCalledOnce()
    const arg = mockUpdate.mock.calls[0][0] as { unsafeMetadata: Record<string, unknown> }
    expect(arg.unsafeMetadata).toMatchObject({ utm_source: 'hn', utm_campaign: 'launch' })
  })

  it('preserves pre-existing unsafeMetadata fields when merging UTMs', async () => {
    const existingMeta = { referral_code: 'ref42' }
    const fakeUtm = { utm_source: 'twitter', utm_campaign: null, utm_content: 'hero' }
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'idle',
      signUp: { unsafeMetadata: existingMeta, update: mockUpdate },
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(fakeUtm)

    await act(async () => {
      render(<UtmStamper />)
    })

    const arg = mockUpdate.mock.calls[0][0] as { unsafeMetadata: Record<string, unknown> }
    expect(arg.unsafeMetadata).toMatchObject({
      referral_code: 'ref42',
      utm_source: 'twitter',
      utm_content: 'hero',
    })
  })

  it('swallows errors from signUp.update without propagating', async () => {
    const failingUpdate = vi.fn().mockRejectedValue(new Error('Clerk network error'))
    vi.mocked(useSignUp).mockReturnValue({
      fetchStatus: 'idle',
      signUp: { unsafeMetadata: {}, update: failingUpdate },
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue({
      utm_source: 'hn',
      utm_campaign: null,
      utm_content: null,
    })

    await expect(
      act(async () => {
        render(<UtmStamper />)
      })
    ).resolves.toBeUndefined()
  })
})
