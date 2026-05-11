import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { sendWelcome } from '@/lib/emails'
import { trackEvent } from '@/lib/analytics'
import { extractUtmFromClerkMetadata } from '@/lib/utm'

export const runtime = 'nodejs'

// Lazy-initialised Stripe client. Constructing `new Stripe(...)` at module
// top-level forces `next build` page-data collection to fail when
// STRIPE_SECRET_KEY is unset. We instantiate inside the request handler so
// the build can still tree-walk this route.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key)
  }
  return _stripe
}

interface ClerkUserCreatedEvent {
  type: 'user.created'
  data: {
    id: string
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id: string
    first_name?: string | null
    last_name?: string | null
    public_metadata?: Record<string, unknown>
    unsafe_metadata?: Record<string, unknown>
  }
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | { type: string; data: Record<string, unknown> }

export async function POST(request: NextRequest) {
  const body = await request.text()

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET!)
  let event: ClerkWebhookEvent
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created') {
    const data = (event as ClerkUserCreatedEvent).data
    const { id: clerkUserId, email_addresses, primary_email_address_id } = data
    const primaryEmail = email_addresses.find(e => e.id === primary_email_address_id)
    const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address

    const stripe = getStripe()
    const customer = await stripe.customers.create({
      email,
      metadata: { clerk_user_id: clerkUserId },
    })

    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(clerkUserId, {
      privateMetadata: { stripe_customer_id: customer.id },
    })

    // Funnel attribution. UTMs come from publicMetadata first (durable across
    // sessions, set post-signup) and fall back to unsafeMetadata (set
    // pre-signup via Clerk's signup flow). Either layout is honoured by the
    // helper. trackEvent is best-effort: it returns false on any failure and
    // never throws — see src/lib/analytics.ts.
    const utm = extractUtmFromClerkMetadata(
      data.public_metadata ?? data.unsafe_metadata,
    )
    try {
      await trackEvent('free_signup', {
        plan: 'free',
        clerk_user_id: clerkUserId,
        utm_source: utm.utm_source,
        utm_campaign: utm.utm_campaign,
      })
    } catch {
      // trackEvent already swallows internally, but defend against future
      // changes to the helper. Telemetry must never fail the webhook.
    }

    if (email) {
      const { first_name } = data
      try {
        await sendWelcome(email, { firstName: first_name })
      } catch {
        // Email failure must not block the webhook response
      }
    }
  }

  return NextResponse.json({ received: true })
}
