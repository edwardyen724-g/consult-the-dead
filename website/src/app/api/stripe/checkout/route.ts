import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.consultthedead.com'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const billingPeriod: 'monthly' | 'annual' = body.billingPeriod === 'annual' ? 'annual' : 'monthly'
  const priceId = billingPeriod === 'annual'
    ? process.env.STRIPE_PRICE_ANNUAL!
    : process.env.STRIPE_PRICE_MONTHLY!

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)

  let customerId = user.privateMetadata?.stripe_customer_id as string | undefined

  if (!customerId) {
    const email = user.emailAddresses[0]?.emailAddress
    const customer = await stripe.customers.create({
      email,
      metadata: { clerk_user_id: userId },
    })
    customerId = customer.id
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: { stripe_customer_id: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${SITE_URL}/account?checkout=success`,
    cancel_url: `${SITE_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
