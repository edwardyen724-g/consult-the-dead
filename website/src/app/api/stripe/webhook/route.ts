import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { sendSubscriptionConfirmation } from '@/lib/email'
import { trackEvent } from '@/lib/analytics'

export const runtime = 'nodejs'

// Lazy-initialised Stripe client. See checkout/route.ts for rationale —
// `new Stripe(...)` at module scope breaks `next build` when env is unset.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key)
  }
  return _stripe
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not set' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const clerk = await clerkClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string

    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return NextResponse.json({ received: true })

    const clerkUserId = (customer as Stripe.Customer).metadata?.clerk_user_id
    if (!clerkUserId) return NextResponse.json({ received: true })

    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { subscription_tier: 'pro' },
    })

    const sessionMetadata = session.metadata ?? {}
    const utmCampaign = sessionMetadata.utm_campaign
    const utmContent = sessionMetadata.utm_content
    const customerEmail = (customer as Stripe.Customer).email ?? undefined
    const billingInterval = (session.subscription
      ? ((await stripe.subscriptions.retrieve(session.subscription as string))
          .items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly')
      : 'monthly')

    try {
      await trackEvent('paid_subscription', {
        plan: billingInterval,
        ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
        ...(utmContent ? { utm_content: utmContent } : {}),
      })
    } catch {
      // Analytics must not block the webhook response.
    }

    if (customerEmail) {
      try {
        await sendSubscriptionConfirmation(customerEmail, '', billingInterval)
      } catch {
        // Email failure must not block the webhook response
      }
    }

  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return NextResponse.json({ received: true })

    const clerkUserId = (customer as Stripe.Customer).metadata?.clerk_user_id
    if (!clerkUserId) return NextResponse.json({ received: true })

    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { subscription_tier: null },
    })
  }

  return NextResponse.json({ received: true })
}
