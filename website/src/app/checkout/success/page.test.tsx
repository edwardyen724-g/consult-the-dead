import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// --- hoisted mocks (must precede all imports of mocked modules) ---

const currentUserMock = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: currentUserMock,
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

// Import after mocks
import CheckoutSuccessPage, { metadata, ONBOARDING_STEPS } from './page'

// ---- helpers ----

function makeUser(overrides: {
  firstName?: string | null
  primaryEmailAddressId?: string
  emailAddresses?: { id: string; emailAddress: string }[]
  publicMetadata?: Record<string, unknown>
} = {}) {
  const emailAddresses = overrides.emailAddresses ?? [
    { id: 'em_1', emailAddress: 'alice@example.com' },
  ]
  return {
    id: 'user-abc',
    // Use 'in' check so explicit null is not replaced by the default 'Alice'
    firstName: 'firstName' in overrides ? overrides.firstName : 'Alice',
    lastName: 'Smith',
    primaryEmailAddressId: overrides.primaryEmailAddressId ?? 'em_1',
    emailAddresses,
    publicMetadata: overrides.publicMetadata ?? { subscription_tier: 'pro' },
    privateMetadata: {},
  }
}

beforeEach(() => {
  currentUserMock.mockReset()
})

// ---- metadata ----

describe('CheckoutSuccessPage metadata', () => {
  it('sets title to Welcome to Pro', () => {
    expect(metadata.title).toBe('Welcome to Pro')
  })

  it('disables indexing so the page does not appear in search results', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})

// ---- ONBOARDING_STEPS constant ----

describe('ONBOARDING_STEPS', () => {
  it('has exactly 3 steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(3)
  })

  it('step 0 links to /agora', () => {
    expect(ONBOARDING_STEPS[0].href).toBe('/agora')
  })

  it('step 1 links to /frameworks', () => {
    expect(ONBOARDING_STEPS[1].href).toBe('/frameworks')
  })

  it('step 2 links to /library', () => {
    expect(ONBOARDING_STEPS[2].href).toBe('/library')
  })

  it('every step has a non-empty label, detail, href, and cta', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(step.label.length).toBeGreaterThan(0)
      expect(step.detail.length).toBeGreaterThan(0)
      expect(step.href.length).toBeGreaterThan(0)
      expect(step.cta.length).toBeGreaterThan(0)
    }
  })
})

// ---- page rendering ----

describe('CheckoutSuccessPage', () => {
  it('redirects to /sign-in when no user is authenticated', async () => {
    currentUserMock.mockResolvedValue(null)

    await expect(CheckoutSuccessPage()).rejects.toThrow('REDIRECT:/sign-in')
  })

  it('renders the Pro confirmation banner with the user first name', async () => {
    currentUserMock.mockResolvedValue(makeUser({ firstName: 'Bob' }))

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('data-testid="pro-confirmation"')
    expect(html).toContain('Welcome to Pro, Bob.')
    expect(html).toContain('★ Pro — Active')
    expect(html).toContain('Your subscription is active')
  })

  it('uses generic copy when first name is absent', async () => {
    currentUserMock.mockResolvedValue(makeUser({ firstName: null }))

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain("You&#x27;re now Pro.")
    expect(html).not.toContain('Welcome to Pro, ')
  })

  it('includes the primary email address in the confirmation text', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({ emailAddresses: [{ id: 'em_1', emailAddress: 'founder@test.com' }] }),
    )

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('founder@test.com')
  })

  it('falls back to the first email when primaryEmailAddressId has no match', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({
        primaryEmailAddressId: 'em_MISSING',
        emailAddresses: [{ id: 'em_1', emailAddress: 'fallback@test.com' }],
      }),
    )

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('fallback@test.com')
  })

  it('renders all three onboarding steps', async () => {
    currentUserMock.mockResolvedValue(makeUser())

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    for (const step of ONBOARDING_STEPS) {
      expect(html).toContain(step.label)
      expect(html).toContain(step.detail)
      expect(html).toContain(step.cta)
    }
    expect(html).toContain('data-testid="onboarding-step-0"')
    expect(html).toContain('data-testid="onboarding-step-1"')
    expect(html).toContain('data-testid="onboarding-step-2"')
  })

  it('renders the first-agon CTA linking to /agora', async () => {
    currentUserMock.mockResolvedValue(makeUser())

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('href="/agora"')
    expect(html).toContain('Start your first Pro agon')
  })

  it('renders the account-page fallback link', async () => {
    currentUserMock.mockResolvedValue(makeUser())

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('href="/account"')
    expect(html).toContain('visit your account page')
  })

  it('renders the Get started section header', async () => {
    currentUserMock.mockResolvedValue(makeUser())

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('Get started')
  })

  it('mentions all Pro feature callouts in the confirmation banner', async () => {
    currentUserMock.mockResolvedValue(makeUser())

    const html = renderToStaticMarkup(await CheckoutSuccessPage())

    expect(html).toContain('Opus synthesis')
    expect(html).toContain('100 agons/month')
    expect(html).toContain('5-mind council')
    expect(html).toContain('persistent')
    expect(html).toContain('PDF export')
  })
})
