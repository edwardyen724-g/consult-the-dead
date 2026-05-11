import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'

export const runtime = 'nodejs'

interface ResendWebhookEvent {
  type: string
  data?: {
    to?: string[]
  }
}

type SuppressionEventType = 'email.bounced' | 'email.complained'

const SUPPRESSION_EVENT_TYPES = new Set<SuppressionEventType>(['email.bounced', 'email.complained'])

function getRecipients(event: ResendWebhookEvent): string[] {
  return Array.isArray(event.data?.to)
    ? [...new Set(event.data.to.filter((email): email is string => typeof email === 'string' && email.length > 0))]
    : []
}

async function suppressUsersByEmail(email: string, reason: SuppressionEventType, timestamp: string) {
  const clerk = await clerkClient()
  const users = await clerk.users.getUserList({ emailAddress: [email], limit: 1 })

  for (const user of users.data) {
    await clerk.users.updateUserMetadata(user.id, {
      privateMetadata: {
        email_suppressed: true,
        email_suppressed_at: timestamp,
        email_suppressed_reason: reason,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  if (!webhookSecret) {
    return NextResponse.json({ error: 'RESEND_WEBHOOK_SECRET is not set' }, { status: 500 })
  }

  const webhook = new Webhook(webhookSecret)
  let event: ResendWebhookEvent

  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ResendWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (SUPPRESSION_EVENT_TYPES.has(event.type as SuppressionEventType)) {
    const timestamp = new Date().toISOString()
    const reason = event.type as SuppressionEventType

    for (const email of getRecipients(event)) {
      await suppressUsersByEmail(email, reason, timestamp)
    }
  }

  return NextResponse.json({ received: true })
}
