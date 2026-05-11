/**
 * FIRST-AGON RECAP — fired T+1h after the user's first agon completes.
 *
 * Per docs/retention-email-sequence.md §"Email 2: FIRST-AGON RECAP":
 *   - Variant B subject when council names are present (higher CTR)
 *   - Variant A fallback ("Here's what your council decided")
 *   - Body summarises topic + council + verdict and offers two CTAs
 *     (read-full-debate, run-another-agon) plus a viral share CTA
 *
 * Pure renderer. The wiring layer (queue / setTimeout / Resend
 * scheduledAt) is OUT OF THIS CAPSULE — see capsule output notes.
 */

import { buildUtmUrl } from '../utm'
import type { RecapVariables, RenderedEmail } from '../types'

export const RECAP_EMAIL_ID = 'recap_v1'

const SITE_URL = 'https://www.consultthedead.com'
const AGORA_URL = `${SITE_URL}/agora`
const TOPIC_EXCERPT_MAX = 120
const CONSENSUS_EXCERPT_MAX = 160

export function renderRecap(vars: RecapVariables): RenderedEmail {
  const greeting = greet(vars.firstName)
  const topic = truncate(vars.agonTopic, TOPIC_EXCERPT_MAX)
  const consensus = truncate(vars.consensusExcerpt, CONSENSUS_EXCERPT_MAX)
  const council = vars.councilNames.join(', ')

  const debateUrl = buildUtmUrl({
    baseUrl: `${SITE_URL}/agora/a/${encodeURIComponent(vars.agonShareId)}`,
    campaign: 'recap',
    emailId: RECAP_EMAIL_ID,
  })
  const newAgonUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: 'recap',
    emailId: RECAP_EMAIL_ID,
  })

  const subject = council
    ? `${vars.councilNames.join(', ')} just argued your question — read the verdict`
    : "Here's what your council decided"

  const remainingLine = remainingLineFor(vars.agonsRemaining)

  const text = [
    `${greeting},`,
    '',
    'Your council reached a verdict.',
    '',
    `Your question: ${topic}`,
    '',
    `Council: ${council}`,
    '',
    `Verdict: ${consensus}`,
    '',
    `Read the full debate: ${debateUrl}`,
    '',
    'If you found this useful, share it — public debates are readable by anyone with the link.',
    '',
    remainingLine,
    '',
    `Run another agon: ${newAgonUrl}`,
    '',
    '— Edward',
  ]
    .filter(Boolean)
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${escapeHtml(greeting)},</p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">Your council reached a verdict.</p>
    <p style="font-size:1rem;line-height:1.7;margin:0 0 12px;"><strong>Your question:</strong> ${escapeHtml(topic)}</p>
    <p style="font-size:1rem;line-height:1.7;margin:0 0 12px;"><strong>Council:</strong> ${escapeHtml(council)}</p>
    <p style="font-size:1rem;line-height:1.7;margin:0 0 24px;"><strong>Verdict:</strong> ${escapeHtml(consensus)}</p>
    <p style="margin:0 0 24px;"><a href="${debateUrl}" style="color:#D4A574;">Read the full debate →</a></p>
    <p style="font-size:1rem;line-height:1.7;margin:0 0 24px;">${escapeHtml(remainingLine)}</p>
    <a href="${newAgonUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Run another agon
    </a>
    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">
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

function remainingLineFor(r: RecapVariables['agonsRemaining']): string {
  if (r === 'unlimited') return 'You have unlimited debates today (BYO key). What\'s your next question?'
  if (typeof r === 'number') {
    if (r <= 0) return 'You\'ve used today\'s free debates. They reset tomorrow — what\'s your next question?'
    return `You have ${r} free debate${r === 1 ? '' : 's'} left today. What's your next question?`
  }
  return 'What\'s your next question?'
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
