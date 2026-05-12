// @vitest-environment jsdom
/**
 * Unit tests for useClerkUtmStamper.
 *
 * Mocks:
 *   - @clerk/nextjs  → exposes useSignUp as a controllable vi.fn()
 *   - @/lib/utm      → exposes getUtmOrNull / serializeUtmForClerkMetadata
 *                       as controllable vi.fn()s
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSignUp } from '@clerk/nextjs'
import { getUtmOrNull, serializeUtmForClerkMetadata } from '@/lib/utm'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@clerk/nextjs', () => ({
  useSignUp: vi.fn(),
  SignUp: () => null,
}))

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

// Import after mocks are registered.
import { useClerkUtmStamper } from '@/lib/use-clerk-utm-stamper'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockUpdate = vi.fn()

function makeSignUp(overrides: Record<string, unknown> = {}) {
  return {
    unsafeMetadata: {},
    update: mockUpdate,
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useClerkUtmStamper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue({})
    // Default: no UTMs in search string.
    vi.mocked(getUtmOrNull).mockReturnValue(null)
  })

  it('is a function (hook)', () => {
    expect(typeof useClerkUtmStamper).toBe('function')
  })

  it('returns void (undefined)', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp(),
    } as unknown as ReturnType<typeof useSignUp>)

    let result: unknown
    await act(async () => {
      ;({ result } = renderHook(() => useClerkUtmStamper()))
    })
    expect((result as { current: unknown }).current).toBeUndefined()
  })

  it('does NOT call signUp.update when no UTMs are present in the search string', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp(),
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(null)

    await act(async () => {
      renderHook(() => useClerkUtmStamper())
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls signUp.update with the serialised UTM payload when UTMs are present', async () => {
    const fakeUtm = { utm_source: 'hn', utm_campaign: 'launch', utm_content: null }
    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp(),
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(fakeUtm)

    await act(async () => {
      renderHook(() => useClerkUtmStamper())
    })

    expect(mockUpdate).toHaveBeenCalledOnce()
    const arg = mockUpdate.mock.calls[0][0] as { unsafeMetadata: Record<string, unknown> }
    expect(arg.unsafeMetadata).toMatchObject({ utm_source: 'hn', utm_campaign: 'launch' })
    expect(arg.unsafeMetadata).not.toHaveProperty('utm_content')
  })

  it('passes utm_content when it is non-null', async () => {
    const fakeUtm = { utm_source: 'twitter', utm_campaign: null, utm_content: 'hero-cta' }
    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp(),
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(fakeUtm)

    await act(async () => {
      renderHook(() => useClerkUtmStamper())
    })

    expect(mockUpdate).toHaveBeenCalledOnce()
    const arg = mockUpdate.mock.calls[0][0] as { unsafeMetadata: Record<string, unknown> }
    expect(arg.unsafeMetadata).toMatchObject({ utm_source: 'twitter', utm_content: 'hero-cta' })
  })

  it('swallows errors thrown by signUp.update (fail open)', async () => {
    const failingUpdate = vi.fn().mockRejectedValue(new Error('Clerk network error'))
    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp({ update: failingUpdate }),
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue({
      utm_source: 'hn',
      utm_campaign: null,
      utm_content: null,
    })

    await expect(
      act(async () => {
        renderHook(() => useClerkUtmStamper())
      })
    ).resolves.toBeUndefined()
  })

  it('is a no-op when useSignUp returns undefined for signUp', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      signUp: undefined,
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue({
      utm_source: 'hn',
      utm_campaign: null,
      utm_content: null,
    })

    await expect(
      act(async () => {
        renderHook(() => useClerkUtmStamper())
      })
    ).resolves.toBeUndefined()

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('is a no-op when useSignUp returns null for signUp', async () => {
    vi.mocked(useSignUp).mockReturnValue({
      signUp: null,
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue({
      utm_source: 'hn',
      utm_campaign: 'launch',
      utm_content: null,
    })

    await expect(
      act(async () => {
        renderHook(() => useClerkUtmStamper())
      })
    ).resolves.toBeUndefined()

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('reads window.location.search and passes it to getUtmOrNull', async () => {
    // Set up a fake search string on window.location.
    Object.defineProperty(window, 'location', {
      value: { search: '?utm_source=test&utm_campaign=ci' },
      writable: true,
      configurable: true,
    })

    vi.mocked(useSignUp).mockReturnValue({
      signUp: makeSignUp(),
    } as unknown as ReturnType<typeof useSignUp>)
    vi.mocked(getUtmOrNull).mockReturnValue(null)

    await act(async () => {
      renderHook(() => useClerkUtmStamper())
    })

    expect(getUtmOrNull).toHaveBeenCalledWith('?utm_source=test&utm_campaign=ci')

    // Restore default.
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
      configurable: true,
    })
  })
})
