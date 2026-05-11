/**
 * UTM URL builder for retention email CTAs.
 *
 * Per docs/retention-email-sequence.md every CTA link emitted from the
 * retention sequence MUST carry:
 *
 *   utm_source=email
 *   utm_campaign=<welcome|recap|nudge|digest>
 *   utm_content=<email_id>   // e.g. welcome_v1
 *
 * `email_id` follows the pattern `<campaign>_v<version>` so Vercel
 * Analytics can distinguish A/B variants and track CTR per body version.
 *
 * This helper is a pure function — easy to unit test, no globals — and is
 * the single place where the UTM convention is encoded. If the convention
 * shifts (e.g. we adopt utm_term someday), it changes here.
 */

export type RetentionCampaign = 'welcome' | 'recap' | 'nudge' | 'digest'

export interface BuildUtmUrlInput {
  /** Absolute base URL (e.g. https://www.consultthedead.com/agora). */
  baseUrl: string
  campaign: RetentionCampaign
  /** email_id shipped in utm_content; e.g. "welcome_v1". */
  emailId: string
  /**
   * Extra query params to merge before UTM tags. Useful for e.g. ?topic=...
   * pre-fill on nudge links. Values are URL-encoded by URLSearchParams.
   */
  extraParams?: Record<string, string>
}

const UTM_SOURCE = 'email'

/**
 * Build a URL with UTM parameters appended. Existing query params are
 * preserved. UTM keys overwrite any pre-existing same-named keys (so a
 * caller cannot accidentally smuggle a different utm_source via baseUrl).
 *
 * Throws if baseUrl is not a valid absolute URL — retention emails should
 * always render absolute links so they work outside the app shell.
 */
export function buildUtmUrl({
  baseUrl,
  campaign,
  emailId,
  extraParams,
}: BuildUtmUrlInput): string {
  const url = new URL(baseUrl)

  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v)
    }
  }

  url.searchParams.set('utm_source', UTM_SOURCE)
  url.searchParams.set('utm_campaign', campaign)
  url.searchParams.set('utm_content', emailId)

  return url.toString()
}
