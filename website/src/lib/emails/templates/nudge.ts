/**
 * DAY-2 NUDGE — fired by the daily 9am-PT cron at T+24h post-signup
 * IF the user has run zero agons.
 *
 * Per docs/retention-email-sequence.md §"Email 3: DAY-2 NUDGE":
 *   - Subject A: "You haven't asked them anything yet"
 *   - Body ≤ 80 words + 5 question prompts
 *   - 5 topic links pre-fill the agora question via ?topic= query param,
 *     with utm_source=email&utm_campaign=nudge&utm_content=nudge_v1
 *   - One generic "Pick one and start" CTA at /agora
 */

import { buildUtmUrl } from '../utm'
import type { RenderedEmail } from '../types'

export const NUDGE_EMAIL_ID = 'nudge_v1'

const SITE_URL = 'https://www.consultthedead.com'
const AGORA_URL = `${SITE_URL}/agora`

/**
 * The 5 prompt questions. Lifted directly from
 * docs/retention-email-sequence.md so a copy edit on the brief flows
 * forward via review.
 */
export const NUDGE_PROMPTS: readonly string[] = [
  'Should I raise prices before I have strong retention data?',
  'Is now the right time to hire my first employee?',
  'How do I know if my idea is worth building?',
  "Should I launch before it's ready, or wait until it's polished?",
  "What's the most important thing to do in my first 90 days?",
]

export interface NudgeVariables {
  firstName?: string | null
}

export function renderNudge(vars: NudgeVariables = {}): RenderedEmail {
  const greeting = greet(vars.firstName)

  const promptLines = NUDGE_PROMPTS.map((q, i) => {
    const url = buildUtmUrl({
      baseUrl: AGORA_URL,
      campaign: 'nudge',
      emailId: NUDGE_EMAIL_ID,
      extraParams: { topic: q },
    })
    return { text: `${i + 1}. ${q}\n   ${url}`, url, q }
  })

  const ctaUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: 'nudge',
    emailId: NUDGE_EMAIL_ID,
  })

  const subject = "You haven't asked them anything yet"

  const text = [
    `${greeting},`,
    '',
    "You signed up for Consult The Dead but haven't run a debate yet. Your 3 free agons reset daily — here are 5 questions the council is ready to argue right now:",
    '',
    ...promptLines.map((p) => p.text),
    '',
    `Pick one and start: ${ctaUrl}`,
    '',
    '— Edward',
  ].join('\n')

  const htmlList = promptLines
    .map(
      (p) =>
        `<li style="font-size:1rem;line-height:1.7;margin:0 0 8px;"><a href="${p.url}" style="color:#D4A574;">${escapeHtml(p.q)}</a></li>`,
    )
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${escapeHtml(greeting)},</p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      You signed up for Consult The Dead but haven't run a debate yet. Your 3 free agons reset daily — here are 5 questions the council is ready to argue right now:
    </p>
    <ol style="margin:0 0 28px;padding-left:24px;">${htmlList}</ol>
    <a href="${ctaUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Pick one and start
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
