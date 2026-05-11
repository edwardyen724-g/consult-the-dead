import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const customerCreate = vi.fn()
  const checkoutCreate = vi.fn()
  const getUser = vi.fn()
  const updateUserMetadata = vi.fn()
  const clerkClient = vi.fn()
  const auth = vi.fn()
  const stripeInstance = {
    customers: { create: customerCreate },
    checkout: { sessions: { create: checkoutCreate } },
  }

  return {
    auth,
    clerkClient,
    checkoutCreate,
    customerCreate,
    getUser,
    stripeInstance,
    updateUserMetadata,
  }
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: mocks.auth,
  clerkClient: mocks.clerkClient,
}))

vi.mock('stripe', () => ({
  default: vi.fn(function StripeMock() {
    return mocks.stripeInstance as never
  }),
}))

function buildRequest(url: string, body: Record<string, unknown>) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    process.env.NEXT_PUBLIC_SITE_URL = 'https://site.test'
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_PRICE_MONTHLY = 'price_monthly'
    process.env.STRIPE_PRICE_ANNUAL = 'price_annual'

    mocks.auth.mockResolvedValue({ userId: 'user_1' })
    mocks.clerkClient.mockResolvedValue({
      users: {
        getUser: mocks.getUser,
        updateUserMetadata: mocks.updateUserMetadata,
      },
    })
    mocks.getUser.mockResolvedValue({
      privateMetadata: {},
      emailAddresses: [{ emailAddress: 'ada@example.com' }],
    })
    mocks.customerCreate.mockResolvedValue({ id: 'cus_123' })
    mocks.checkoutCreate.mockResolvedValue({ url: 'https://stripe.test/session' })
  })

  it('rejects unauthenticated checkout attempts', async () => {
    mocks.auth.mockResolvedValue({ userId: null })

    const { POST } = await import('./route')
    const response = await POST(
      buildRequest('https://site.test/api/stripe/checkout', {
        billingPeriod: 'monthly',
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mocks.checkoutCreate).not.toHaveBeenCalled()
  })

  it('stores body UTM params in Stripe session metadata', async () => {
    const { POST } = await import('./route')

    const response = await POST(
      buildRequest(
        'https://site.test/api/stripe/checkout?utm_campaign=query-campaign&utm_content=query-content',
        {
          billingPeriod: 'annual',
          utm_campaign: 'body-campaign',
          utm_content: 'body-content',
        },
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ url: 'https://stripe.test/session' })
    expect(mocks.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_123',
      mode: 'subscription',
      line_items: [{ price: 'price_annual', quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      metadata: {
        clerk_user_id: 'user_1',
        plan: 'annual',
        utm_campaign: 'body-campaign',
        utm_content: 'body-content',
      },
      success_url: 'https://site.test/account?checkout=success',
      cancel_url: 'https://site.test/pricing',
    }))
    expect(mocks.updateUserMetadata).toHaveBeenCalledWith('user_1', {
      privateMetadata: { stripe_customer_id: 'cus_123' },
    })
  })

  it('throws when the Stripe secret is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY

    const { POST } = await import('./route')

    await expect(
      POST(
        buildRequest('https://site.test/api/stripe/checkout', {
          billingPeriod: 'monthly',
        }),
      ),
    ).rejects.toThrow('STRIPE_SECRET_KEY is not set')
  })

  it('reuses an existing Stripe customer and trims UTM values', async () => {
    mocks.getUser.mockResolvedValue({
      privateMetadata: { stripe_customer_id: 'cus_existing' },
      emailAddresses: [{ emailAddress: 'ada@example.com' }],
    })

    const { POST } = await import('./route')

    const response = await POST(
      buildRequest(
        'https://site.test/api/stripe/checkout',
        {
          billingPeriod: 'monthly',
          utm_campaign: '   ',
          utm_content: `${'x'.repeat(501)}   `,
        },
      ),
    )

    expect(response.status).toBe(200)
    expect(mocks.customerCreate).not.toHaveBeenCalled()
    expect(mocks.updateUserMetadata).not.toHaveBeenCalled()
    expect(mocks.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_existing',
      metadata: {
        clerk_user_id: 'user_1',
        plan: 'monthly',
        utm_content: 'x'.repeat(500),
      },
    }))
  })

  it('falls back to query UTMs when the body omits them', async () => {
    const { POST } = await import('./route')

    const response = await POST(
      buildRequest(
        'https://site.test/api/stripe/checkout?utm_campaign=query-campaign&utm_content=query-content',
        {
          billingPeriod: 'monthly',
        },
      ),
    )

    expect(response.status).toBe(200)
    expect(mocks.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      line_items: [{ price: 'price_monthly', quantity: 1 }],
      metadata: {
        clerk_user_id: 'user_1',
        plan: 'monthly',
        utm_campaign: 'query-campaign',
        utm_content: 'query-content',
      },
      subscription_data: { trial_period_days: 7 },
    }))
  })
})
