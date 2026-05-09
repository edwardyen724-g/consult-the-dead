import { NextResponse } from 'next/server'
import {
  buildNewsletterSignupPayload,
  createBeehiivSubscription,
  isNewsletterEmail,
} from '@/lib/newsletter'

export const runtime = 'nodejs'

type NewsletterRequestBody = {
  email?: string
  source?: string
  medium?: string
  campaign?: string
  content?: string
  referringSite?: string
  newsletterListIds?: string[]
  reactivateExisting?: boolean
  sendWelcomeEmail?: boolean
  redirectTo?: string
}

async function parseNewsletterRequest(request: Request): Promise<{
  body: NewsletterRequestBody
  format: 'json' | 'form'
}> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return {
      body: (await request.json()) as NewsletterRequestBody,
      format: 'json',
    }
  }

  const formData = await request.formData()
  return {
    body: {
      email: formData.get('email')?.toString() ?? undefined,
      source: formData.get('source')?.toString() ?? undefined,
      medium: formData.get('medium')?.toString() ?? undefined,
      campaign: formData.get('campaign')?.toString() ?? undefined,
      content: formData.get('content')?.toString() ?? undefined,
      referringSite: formData.get('referringSite')?.toString() ?? undefined,
      redirectTo: formData.get('redirectTo')?.toString() ?? undefined,
      newsletterListIds: formData
        .getAll('newsletterListIds')
        .map((value) => value.toString())
        .filter(Boolean),
    },
    format: 'form',
  }
}

function buildNewsletterRedirect(request: Request, redirectTo?: string) {
  const fallbackUrl = new URL('/', request.url)
  fallbackUrl.searchParams.set('newsletter', 'subscribed')
  const target = redirectTo?.trim() || '/'
  const resolved = new URL(target, request.url)

  if (resolved.origin !== new URL(request.url).origin) {
    return fallbackUrl
  }

  resolved.searchParams.set('newsletter', 'subscribed')
  return resolved
}

export async function POST(request: Request) {
  let parsed: Awaited<ReturnType<typeof parseNewsletterRequest>>

  try {
    parsed = await parseNewsletterRequest(request)
  } catch {
    const contentType = request.headers.get('content-type') ?? ''
    return NextResponse.json(
      {
        ok: false,
        error: contentType.includes('application/json') ? 'Invalid JSON' : 'Invalid request',
      },
      { status: 400 },
    )
  }

  const { body, format } = parsed

  const email = body.email?.trim() ?? ''
  if (!isNewsletterEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 })
  }

  try {
    const subscription = await createBeehiivSubscription(
      buildNewsletterSignupPayload({
        email,
        source: body.source,
        medium: body.medium,
        campaign: body.campaign,
        content: body.content,
        referringSite: body.referringSite,
        newsletterListIds: body.newsletterListIds,
        reactivateExisting: body.reactivateExisting,
        sendWelcomeEmail: body.sendWelcomeEmail,
      }),
    )

    if (format === 'form') {
      return NextResponse.redirect(
        buildNewsletterRedirect(request, body.redirectTo),
        303,
      )
    }

    return NextResponse.json({ ok: true, subscription }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Newsletter signup failed'
    const status = message === 'Missing Beehiiv configuration' ? 503 : 502
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
