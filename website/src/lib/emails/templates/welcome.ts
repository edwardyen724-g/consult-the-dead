/**
 * WELCOME email — fires immediately on Clerk user.created.
 *
 * Per docs/retention-email-sequence.md §"Email 1: WELCOME":
 *   - Subject A: "Your council is assembled."
 *   - Body ≤ 100 words, plain-text leaning, founder-tone (no bulk look)
 *   - Two CTAs to /agora — both UTM-tagged with welcome_v1
 *   - One in-body link to a real public agon (abhishek-chakravarty)
 *
 * Pure renderer: input → {subject, html, text}. No I/O, no env reads.
 */

import { buildUtmUrl } from '../utm'
import { FREE_AGONS_PER_DAY } from '../../pricing/pricing-constants'
import type { RenderedEmail } from '../types'

export const WELCOME_EMAIL_ID = 'welcome_v1'

const SITE_URL = 'https://www.consultthedead.com'
const AGORA_URL = `${SITE_URL}/agora`
const EXAMPLE_AGON_URL = `${SITE_URL}/agora/a/abhishek-chakravarty`

export interface WelcomeVariables {
  /** First name from Clerk; empty string or undefined falls back to "there". */
  firstName?: string | null
}

export function renderWelcome(vars: WelcomeVariables = {}): RenderedEmail {
  const greeting = greet(vars.firstName)

  const ctaUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: 'welcome',
    emailId: WELCOME_EMAIL_ID,
  })
  const exampleUrl = buildUtmUrl({
    baseUrl: EXAMPLE_AGON_URL,
    campaign: 'welcome',
    emailId: WELCOME_EMAIL_ID,
  })

  const subject = 'Your council is assembled.'

  const text = [
    `${greeting},`,
    '',
    `Welcome to Consult The Dead. You have ${FREE_AGONS_PER_DAY} free debates today — each one puts a question in front of a council of history\'s sharpest minds, who argue in real time until they reach a verdict.`,
    '',
    'Here\'s a real example: a founder asked whether to raise prices on his $18K MRR product. Machiavelli said act now. Marie Curie said measure first. Sun Tzu said win the narrative war before changing any number.',
    '',
    `Read the debate: ${exampleUrl}`,
    '',
    'What\'s your question?',
    '',
    `Open the Agora: ${ctaUrl}`,
    '',
    '— Edward',
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead
    </p>
    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${escapeHtml(greeting)},</p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Welcome to Consult The Dead. You have ${FREE_AGONS_PER_DAY} free debates today — each one puts a question in front of a council of history's sharpest minds, who argue in real time until they reach a verdict.
    </p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Here's a real example: a founder asked whether to raise prices on his $18K MRR product. Machiavelli said act now. Marie Curie said measure first. Sun Tzu said win the narrative war before changing any number.
      <a href="${exampleUrl}" style="color:#D4A574;">Read the debate →</a>
    </p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 36px;">What's your question?</p>
    <a href="${ctaUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Open the Agora
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
