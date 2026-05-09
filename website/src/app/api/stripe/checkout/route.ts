import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

// Lazy-initialised Stripe client. Constructing `new Stripe(...)` at module
// top-level forces `next build` page-data collection to fail when
// STRIPE_SECRET_KEY is unset (e.g. in CI without secrets). We instantiate
// inside the request handler so the build can still tree-walk this route.
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

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const stripe = getStripe()

  const body = await request.json().catch(() => ({}))
  const billingPeriod: 'monthly' | 'annual' = body.billingPeriod === 'annual' ? 'annual' : 'monthly'
  const priceId = billingPeriod === 'annual'
    ? process.env.STRIPE_PRICE_ANNUAL!
    : process.env.STRIPE_PRICE_MONTHLY!

  const url = new URL(request.url)
  const utmCampaign = sanitiseUtm(
    typeof body.utm_campaign === 'string' ? body.utm_campaign : url.searchParams.get('utm_campaign'),
  )
  const utmContent = sanitiseUtm(
    typeof body.utm_content === 'string' ? body.utm_content : url.searchParams.get('utm_content'),
  )

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

  const metadata: Record<string, string> = {
    clerk_user_id: userId,
  }
  if (utmCampaign) metadata.utm_campaign = utmCampaign
  if (utmContent) metadata.utm_content = utmContent

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${SITE_URL}/account?checkout=success`,
    cancel_url: `${SITE_URL}/pricing`,
    metadata,
  })

  return NextResponse.json({ url: session.url })
}

// Stripe metadata values cap at 500 chars per key. Trim and clip defensively
// so a malicious or pathological caller can't blow past the limit.
function sanitiseUtm(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.length > 500 ? trimmed.slice(0, 500) : trimmed
}
