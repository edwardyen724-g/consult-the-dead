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

    mocks.clerkClient.mockResolvedValue({
      users: {
        updateUserMetadata: mocks.updateUserMetadata,
      },
    })
    mocks.sendSubscriptionConfirmation.mockResolvedValue(undefined)
    mocks.trackEvent.mockResolvedValue(true)
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
      '',
      'annual',
    )
    expect(mocks.trackEvent).toHaveBeenCalledTimes(1)
    expect(mocks.trackEvent).toHaveBeenCalledWith('paid_subscription', {
      plan: 'annual',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })
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
      '',
      'monthly',
    )
    expect(mocks.trackEvent).toHaveBeenCalledTimes(1)
    expect(mocks.trackEvent).toHaveBeenCalledWith('paid_subscription', {
      plan: 'monthly',
      utm_campaign: 'pricing',
      utm_content: 'hero',
    })
  })
})
