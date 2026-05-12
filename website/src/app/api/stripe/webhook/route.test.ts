import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const constructEvent = vi.fn()
  const customerRetrieve = vi.fn()
  const subscriptionRetrieve = vi.fn()
  const sendSubscriptionConfirmation = vi.fn()
  const trackEvent = vi.fn()
  const clerkClient = vi.fn()
  const updateUserMetadata = vi.fn()
  const getUser = vi.fn()
  const stripeInstance = {
    webhooks: {
      constructEvent,
    },
    customers: {
      retrieve: customerRetrieve,
    },
    subscriptions: {
      retrieve: subscriptionRetrieve,
    },
  }

  return {
    clerkClient,
    constructEvent,
    customerRetrieve,
    getUser,
    sendSubscriptionConfirmation,
    stripeInstance,
    subscriptionRetrieve,
    trackEvent,
    updateUserMetadata,
  }
})

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: mocks.clerkClient,
}))

vi.mock('@/lib/email', () => ({
  sendSubscriptionConfirmation: mocks.sendSubscriptionConfirmation,
}))

vi.mock('@/lib/analytics', () => ({
  trackEvent: mocks.trackEvent,
}))

vi.mock('stripe', () => ({
  default: vi.fn(function StripeMock() {
    return mocks.stripeInstance as never
  }),
}))

function buildRequest() {
  return new NextRequest('https://site.test/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'stripe-signature': 'sig_test',
    },
    body: 'raw-webhook-body',
  })
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    mocks.getUser.mockResolvedValue({ firstName: 'Ada' })
    mocks.clerkClient.mockResolvedValue({
      users: {
        updateUserMetadata: mocks.updateUserMetadata,
        getUser: mocks.getUser,
      },
    })
    mocks.sendSubscriptionConfirmation.mockResolvedValue(undefined)
    mocks.trackEvent.mockResolvedValue(true)
  })

  it('rejects requests without a stripe-signature header', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('https://site.test/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-webhook-body',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Missing stripe-signature header',
    })
  })

  it('rejects requests when the webhook secret is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'STRIPE_WEBHOOK_SECRET is not set',
    })
  })

  it('rejects requests when the Stripe secret is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY

    const { POST } = await import('./route')

    await expect(POST(buildRequest())).rejects.toThrow('STRIPE_SECRET_KEY is not set')
  })

  it('rejects invalid webhook signatures', async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error('bad signature')
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid signature' })
  })

  it('emits paid_subscription analytics with plan and UTM props', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {
            utm_campaign: 'pricing',
            utm_content: 'hero',
          },
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_1' },
      email: 'ada@example.com',
    })
    mocks.subscriptionRetrieve.mockResolvedValue({
      items: {
        data: [
          {
            price: {
              recurring: {
                interval: 'year',
              },
            },
          },
        ],
      },
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).toHaveBeenCalledWith('user_1', {
      publicMetadata: { subscription_tier: 'pro' },
    })
    expect(mocks.sendSubscriptionConfirmation).toHaveBeenCalledWith(
      'ada@example.com',
      'Ada',
      'annual',
    )
    expect(mocks.trackEvent).toHaveBeenCalledTimes(1)
    expect(mocks.trackEvent).toHaveBeenCalledWith('paid_subscription', {
      plan: 'annual',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })
  })

  it('returns early when Stripe already reports a deleted customer', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {
            utm_campaign: 'pricing',
            utm_content: 'hero',
          },
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: true,
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).not.toHaveBeenCalled()
    expect(mocks.sendSubscriptionConfirmation).not.toHaveBeenCalled()
    expect(mocks.trackEvent).not.toHaveBeenCalled()
  })

  it('returns early when the Stripe customer lacks Clerk metadata', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {
            utm_campaign: 'pricing',
            utm_content: 'hero',
          },
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: {},
      email: 'ada@example.com',
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).not.toHaveBeenCalled()
    expect(mocks.sendSubscriptionConfirmation).not.toHaveBeenCalled()
    expect(mocks.trackEvent).not.toHaveBeenCalled()
  })

  it('keeps webhook delivery non-blocking when analytics fails', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {
            utm_campaign: 'pricing',
            utm_content: 'hero',
          },
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_1' },
      email: 'ada@example.com',
    })
    mocks.subscriptionRetrieve.mockResolvedValue({
      items: {
        data: [
          {
            price: {
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
      },
    })
    mocks.trackEvent.mockRejectedValue(new Error('analytics down'))

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    expect(mocks.sendSubscriptionConfirmation).toHaveBeenCalledWith(
      'ada@example.com',
      'Ada',
      'monthly',
    )
    expect(mocks.trackEvent).toHaveBeenCalledTimes(1)
    expect(mocks.trackEvent).toHaveBeenCalledWith('paid_subscription', {
      plan: 'monthly',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })
  })

  it('keeps webhook delivery non-blocking when confirmation email fails', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {
            utm_campaign: 'pricing',
            utm_content: 'hero',
          },
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_1' },
      email: 'ada@example.com',
    })
    mocks.subscriptionRetrieve.mockResolvedValue({
      items: {
        data: [
          {
            price: {
              recurring: {
                interval: 'year',
              },
            },
          },
        ],
      },
    })
    mocks.sendSubscriptionConfirmation.mockRejectedValue(new Error('smtp down'))

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    expect(mocks.updateUserMetadata).toHaveBeenCalledWith('user_1', {
      publicMetadata: { subscription_tier: 'pro' },
    })
    expect(mocks.trackEvent).toHaveBeenCalledTimes(1)
    expect(mocks.sendSubscriptionConfirmation).toHaveBeenCalledWith(
      'ada@example.com',
      'Ada',
      'annual',
    )
  })

  it('clears subscription metadata when a subscription is deleted', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_1' },
      email: 'ada@example.com',
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).toHaveBeenCalledWith('user_1', {
      publicMetadata: { subscription_tier: null },
    })
  })

  it('returns early when a deleted subscription customer is mirrored from Stripe', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: true,
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).not.toHaveBeenCalled()
  })

  it('returns early when a deleted subscription customer has no Clerk metadata', async () => {
    mocks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: {},
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(mocks.updateUserMetadata).not.toHaveBeenCalled()
  })

  it('sends personalised welcome email with first name from Clerk', async () => {
    mocks.getUser.mockResolvedValue({ firstName: 'Grace' })
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_456',
          subscription: 'sub_456',
          metadata: {},
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_grace' },
      email: 'grace@example.com',
    })
    mocks.subscriptionRetrieve.mockResolvedValue({
      items: { data: [{ price: { recurring: { interval: 'month' } } }] },
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    expect(response.status).toBe(200)
    expect(mocks.getUser).toHaveBeenCalledWith('user_grace')
    expect(mocks.sendSubscriptionConfirmation).toHaveBeenCalledWith(
      'grace@example.com',
      'Grace',
      'monthly',
    )
  })

  it('falls back to anonymous greeting when Clerk getUser fails', async () => {
    mocks.getUser.mockRejectedValue(new Error('Clerk API down'))
    mocks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          metadata: {},
        },
      },
    })
    mocks.customerRetrieve.mockResolvedValue({
      deleted: false,
      metadata: { clerk_user_id: 'user_1' },
      email: 'ada@example.com',
    })
    mocks.subscriptionRetrieve.mockResolvedValue({
      items: { data: [{ price: { recurring: { interval: 'month' } } }] },
    })

    const { POST } = await import('./route')
    const response = await POST(buildRequest())

    // Must still return 200 and send email with empty name fallback
    expect(response.status).toBe(200)
    expect(mocks.sendSubscriptionConfirmation).toHaveBeenCalledWith(
      'ada@example.com',
      '',
      'monthly',
    )
  })
})
