import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.consultthedead.com'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const customerId = user.privateMetadata?.stripe_customer_id as string | undefined

  if (!customerId) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/account`,
  })

  return NextResponse.json({ url: session.url })
}
