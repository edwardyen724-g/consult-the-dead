/**
 * WEEKLY DIGEST — Sunday 9am-PT cron sends to all eligible
 * (non-Pro, non-unsubscribed, low-bounce) users.
 *
 * Per docs/retention-email-sequence.md §"Email 4: WEEKLY DIGEST":
 *   - Subject A is the default ("This week's most-debated question: …")
 *   - Optional "New mind this week" block — drops cleanly if absent
 *   - Includes a CAN-SPAM-mandatory unsubscribe link
 */

import { buildUtmUrl } from '../utm'
import type { DigestVariables, RenderedEmail } from '../types'

export const DIGEST_EMAIL_ID = 'digest_v1'

const SITE_URL = 'https://www.consultthedead.com'
const AGORA_URL = `${SITE_URL}/agora`

const FEATURED_EXCERPT_MAX = 200
const FEATURED_TOPIC_SUBJECT_MAX = 80

export function renderDigest(vars: DigestVariables): RenderedEmail {
  const greeting = greet(vars.firstName)
  const featuredTopicShort = truncate(
    vars.featuredAgonTopic,
    FEATURED_TOPIC_SUBJECT_MAX,
  )
  const consensus = truncate(vars.featuredConsensusExcerpt, FEATURED_EXCERPT_MAX)

  const featuredUrl = buildUtmUrl({
    baseUrl: `${SITE_URL}/agora/a/${encodeURIComponent(vars.featuredAgonShareId)}`,
    campaign: 'digest',
    emailId: DIGEST_EMAIL_ID,
  })
  const newMindUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: 'digest',
    emailId: DIGEST_EMAIL_ID,
  })
  const ctaUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: 'digest',
    emailId: DIGEST_EMAIL_ID,
  })

  const subject = `This week's most-debated question: ${featuredTopicShort}`

  const newMindBlock = vars.newMindName
    ? [
        '',
        `New mind this week: ${vars.newMindName}`,
        vars.newMindTagline ? `${vars.newMindTagline} — now available to add to your council.` : '',
        vars.newMindHowArguesBlurb
          ? `How ${vars.newMindName} argues: ${vars.newMindHowArguesBlurb}`
          : '',
        `Add ${vars.newMindName} to a debate: ${newMindUrl}`,
      ].filter(Boolean)
    : []

  const remainingLine = remainingLineFor(vars.agonsRemaining)

  const text = [
    `${greeting},`,
    '',
    "This week's most-debated question:",
    `> ${vars.featuredAgonTopic}`,
    '',
    `What the council said: ${consensus}`,
    '',
    `Read the full debate: ${featuredUrl}`,
    ...newMindBlock,
    '',
    remainingLine,
    '',
    `Run an agon: ${ctaUrl}`,
    `Unsubscribe: ${vars.unsubscribeUrl}`,
    '',
    '— Edward',
  ]
    .filter((l) => l !== null && l !== undefined)
    .join('\n')

  const newMindHtml = vars.newMindName
    ? `
    <hr style="border:none;border-top:1px solid #1F1F22;margin:32px 0;">
    <p style="font-size:1rem;line-height:1.7;margin:0 0 12px;"><strong>New mind this week:</strong> ${escapeHtml(vars.newMindName)}</p>
    ${vars.newMindTagline ? `<p style="font-size:1rem;line-height:1.7;margin:0 0 12px;">${escapeHtml(vars.newMindTagline)} — now available to add to your council.</p>` : ''}
    ${vars.newMindHowArguesBlurb ? `<p style="font-size:1rem;line-height:1.7;margin:0 0 16px;font-style:italic;color:#8A8A88;">How ${escapeHtml(vars.newMindName)} argues: ${escapeHtml(vars.newMindHowArguesBlurb)}</p>` : ''}
    <p style="margin:0 0 0;"><a href="${newMindUrl}" style="color:#D4A574;">Add ${escapeHtml(vars.newMindName)} to a debate →</a></p>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${escapeHtml(greeting)},</p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 12px;"><strong>This week's most-debated question:</strong></p>
    <blockquote style="margin:0 0 20px;padding:12px 18px;border-left:3px solid #D4A574;color:#EDEDEC;">${escapeHtml(vars.featuredAgonTopic)}</blockquote>
    <p style="font-size:1rem;line-height:1.7;margin:0 0 12px;"><strong>What the council said:</strong> ${escapeHtml(consensus)}</p>
    <p style="margin:0 0 24px;"><a href="${featuredUrl}" style="color:#D4A574;">Read the full debate →</a></p>
    ${newMindHtml}
    <hr style="border:none;border-top:1px solid #1F1F22;margin:32px 0 24px;">
    <p style="font-size:1rem;line-height:1.7;margin:0 0 16px;">${escapeHtml(remainingLine)}</p>
    <a href="${ctaUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Run an agon
    </a>
    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:24px 0 0;">
      <a href="${vars.unsubscribeUrl}" style="color:#8A8A88;">Unsubscribe</a>
    </p>
    <hr style="border:none;border-top:1px solid #1F1F22;margin:24px 0 16px;">
    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">— Edward</p>
  </div>
</body>
</html>`

  return { subject, html, text }
}

function greet(firstName?: string | null): string {
  const trimmed = (firstName ?? '').trim()
  return trimmed ? `Hi ${trimmed}` : 'Hi there'
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + '…'
}

function remainingLineFor(r: DigestVariables['agonsRemaining']): string {
  if (r === 'unlimited') return 'You have unlimited debates today (BYO key).'
  if (typeof r === 'number') {
    if (r <= 0) return "You've used today's free debates — they reset tomorrow."
    return `You have ${r} free debate${r === 1 ? '' : 's'} left today.`
  }
  return 'Your free debates reset daily.'
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
