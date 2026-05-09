export const NEWSLETTER_API_PATH = '/api/newsletter'
export const BEEHIIV_API_BASE_URL = 'https://api.beehiiv.com/v2/publications'

export type NewsletterSignupPayload = {
  email: string
  source: string
  medium: string
  campaign?: string
  content?: string
  referringSite?: string
  reactivateExisting?: boolean
  sendWelcomeEmail?: boolean
  newsletterListIds?: string[]
}

export type BeehiivSubscriptionRequest = {
  email: string
  reactivate_existing: boolean
  send_welcome_email: boolean
  utm_source: string
  utm_medium: string
  utm_campaign?: string
  utm_content?: string
  referring_site?: string
  newsletter_list_ids?: string[]
}

export type BeehiivSubscriptionResponse = {
  data?: {
    id?: string
    email?: string
    status?: string
  }
}

export type BeehiivConfig = {
  apiKey: string
  publicationId: string
}

export function normalizeNewsletterEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isNewsletterEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function buildNewsletterSignupPayload(input: {
  email: string
  source?: string
  medium?: string
  campaign?: string
  content?: string
  referringSite?: string
  reactivateExisting?: boolean
  sendWelcomeEmail?: boolean
  newsletterListIds?: string[]
}): NewsletterSignupPayload {
  return {
    email: normalizeNewsletterEmail(input.email),
    source: (input.source ?? 'website').trim() || 'website',
    medium: (input.medium ?? 'web').trim() || 'web',
    campaign: input.campaign?.trim() || undefined,
    content: input.content?.trim() || undefined,
    referringSite: input.referringSite?.trim() || undefined,
    reactivateExisting: input.reactivateExisting ?? false,
    sendWelcomeEmail: input.sendWelcomeEmail ?? false,
    newsletterListIds: input.newsletterListIds?.filter(Boolean),
  }
}

export function getBeehiivConfig(
  env: Pick<NodeJS.ProcessEnv, 'BEEHIIV_API_KEY' | 'BEEHIIV_PUBLICATION_ID'> = process.env,
): BeehiivConfig | null {
  const apiKey = env.BEEHIIV_API_KEY?.trim()
  const publicationId = env.BEEHIIV_PUBLICATION_ID?.trim()

  if (!apiKey || !publicationId) {
    return null
  }

  return { apiKey, publicationId }
}

export function buildBeehiivSubscriptionRequest(
  payload: NewsletterSignupPayload,
): BeehiivSubscriptionRequest {
  const request: BeehiivSubscriptionRequest = {
    email: payload.email,
    reactivate_existing: payload.reactivateExisting ?? false,
    send_welcome_email: payload.sendWelcomeEmail ?? false,
    utm_source: payload.source,
    utm_medium: payload.medium,
  }

  if (payload.campaign) request.utm_campaign = payload.campaign
  if (payload.content) request.utm_content = payload.content
  if (payload.referringSite) request.referring_site = payload.referringSite
  if (payload.newsletterListIds?.length) {
    request.newsletter_list_ids = payload.newsletterListIds
  }

  return request
}

export async function createBeehiivSubscription(
  payload: NewsletterSignupPayload,
  fetchImpl: typeof fetch = fetch,
  env: Pick<NodeJS.ProcessEnv, 'BEEHIIV_API_KEY' | 'BEEHIIV_PUBLICATION_ID'> = process.env,
): Promise<{
  id: string
  email: string
  status: string
}> {
  const config = getBeehiivConfig(env)
  if (!config) {
    throw new Error('Missing Beehiiv configuration')
  }

  if (!isNewsletterEmail(payload.email)) {
    throw new Error('Invalid email')
  }

  const response = await fetchImpl(
    `${BEEHIIV_API_BASE_URL}/${config.publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildBeehiivSubscriptionRequest(payload)),
    },
  )

  const responseText = await response.text()
  let parsed: BeehiivSubscriptionResponse | null = null
  if (responseText) {
    try {
      parsed = JSON.parse(responseText) as BeehiivSubscriptionResponse
    } catch {
      parsed = null
    }
  }

  if (!response.ok) {
    const errorMessage =
      parsed?.data?.status ||
      responseText ||
      `Beehiiv request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  const data = parsed?.data ?? {}
  return {
    id: data.id ?? '',
    email: data.email ?? payload.email,
    status: data.status ?? 'validating',
  }
}

