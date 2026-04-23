import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/account`,
  })

  return NextResponse.json({ url: session.url })
}
