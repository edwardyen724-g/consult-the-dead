import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { sendWelcomeEmail } from '@/lib/email'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface ClerkUserCreatedEvent {
  type: 'user.created'
  data: {
    id: string
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id: string
    first_name?: string | null
    last_name?: string | null
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
    const { id: clerkUserId, email_addresses, primary_email_address_id } = (event as ClerkUserCreatedEvent).data
    const primaryEmail = email_addresses.find(e => e.id === primary_email_address_id)
    const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address

    const customer = await stripe.customers.create({
      email,
      metadata: { clerk_user_id: clerkUserId },
    })

    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(clerkUserId, {
      privateMetadata: { stripe_customer_id: customer.id },
    })

    if (email) {
      const { first_name } = (event as ClerkUserCreatedEvent).data
      try {
        await sendWelcomeEmail(email, first_name ?? '')
      } catch {
        // Email failure must not block the webhook response
      }
    }
  }

  return NextResponse.json({ received: true })
}
