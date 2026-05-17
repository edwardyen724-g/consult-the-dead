/**
 * Post-signup drip email templates — days 1, 3, and 7.
 *
 * Day 0 (immediate welcome) is handled by templates/welcome.ts and fired
 * from the Clerk user.created webhook.
 *
 * Campaign: drip | UTM: utm_source=email&utm_campaign=drip&utm_content=day{N}
 *
 * Pure renderers: no I/O, no env reads. All three share the same design
 * language as welcome.ts (dark background, Georgia serif, amber CTA).
 */

import { buildUtmUrl } from '../utm'
import {
  PRO_AGONS_PER_MONTH,
  PRO_ANNUAL_PRICE,
  PRO_MONTHLY_PRICE,
  PRO_TRIAL_DAYS,
} from '../../pricing/pricing-constants'
import type { RenderedEmail } from '../types'

const SITE_URL = 'https://www.consultthedead.com'
const AGORA_URL = `${SITE_URL}/agora`
const PRICING_URL = `${SITE_URL}/pricing`

export const DRIP_CAMPAIGN = 'drip' as const

export const DRIP_DAY1_EMAIL_ID = 'day1'
export const DRIP_DAY3_EMAIL_ID = 'day3'
export const DRIP_DAY7_EMAIL_ID = 'day7'

export interface DripVariables {
  /** First name from Clerk. Omit or null → "there". */
  firstName?: string | null
}

// ---------------------------------------------------------------------------
// Day 1 — council selection tip
// ---------------------------------------------------------------------------

/**
 * Advice on picking the right council composition for different decision
 * types. Drives users back to the Agora to run their first (or next) debate.
 */
export function renderDripDay1(vars: DripVariables = {}): RenderedEmail {
  const greeting = greet(vars.firstName)
  const ctaUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: DRIP_CAMPAIGN,
    emailId: DRIP_DAY1_EMAIL_ID,
  })

  const subject = 'Which council should advise your decision?'

  const text = [
    `${greeting},`,
    '',
    'One thing that makes a Consult The Dead debate useful: picking the right council for what you\'re deciding.',
    '',
    'Quick guide:',
    '',
    '  • Strategy / competitive moves → Machiavelli, Sun Tzu, Steve Jobs',
    '  • Risk and uncertainty → Marie Curie, Marcus Aurelius, Galileo Galilei',
    '  • Innovation or product → Leonardo da Vinci, Nikola Tesla, Steve Jobs',
    '  • People and leadership → Marcus Aurelius, Seneca, Machiavelli',
    '',
    'The debate is richer when the council disagrees with each other — which they reliably do.',
    '',
    `Open the Agora and try a question: ${ctaUrl}`,
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
      One thing that makes a debate genuinely useful: picking the right council for what you're deciding.
    </p>
    <div style="border:1px solid #1F1F22;border-radius:6px;padding:20px 24px;margin:0 0 24px;background:#111114;">
      <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#8A8A88;margin:0 0 14px;">Quick guide</p>
      <p style="font-size:0.95rem;line-height:1.75;margin:0;color:#EDEDEC;">
        <strong style="color:#D4A574;">Strategy / competitive moves</strong> → Machiavelli, Sun Tzu, Steve Jobs<br>
        <strong style="color:#D4A574;">Risk and uncertainty</strong> → Marie Curie, Marcus Aurelius, Galileo Galilei<br>
        <strong style="color:#D4A574;">Innovation or product</strong> → da Vinci, Tesla, Steve Jobs<br>
        <strong style="color:#D4A574;">People and leadership</strong> → Marcus Aurelius, Seneca, Machiavelli
      </p>
    </div>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 28px;">
      The debate sharpens when the council disagrees with each other — which they reliably do.
    </p>
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

// ---------------------------------------------------------------------------
// Day 3 — free debate reminder + Pro upsell
// ---------------------------------------------------------------------------

/**
 * Reminds free users that their 3 daily debates reset each day, and makes
 * the case for Pro (100/month, Opus synthesis, persistent library).
 */
export function renderDripDay3(vars: DripVariables = {}): RenderedEmail {
  const greeting = greet(vars.firstName)
  const ctaUrl = buildUtmUrl({
    baseUrl: AGORA_URL,
    campaign: DRIP_CAMPAIGN,
    emailId: DRIP_DAY3_EMAIL_ID,
  })
  const proUrl = buildUtmUrl({
    baseUrl: PRICING_URL,
    campaign: DRIP_CAMPAIGN,
    emailId: DRIP_DAY3_EMAIL_ID,
  })

  const subject = 'Your 3 free debates refresh every day.'

  const text = [
    `${greeting},`,
    '',
    'Quick reminder: your 3 free debates reset at midnight UTC every day. If you haven\'t used them, they don\'t roll over — but there\'s always tomorrow.',
    '',
    'If you find yourself wanting more debates per day, or you want Opus (the strongest Claude model) synthesizing your council\'s verdict, Pro gives you:',
    '',
    '  • 100 agons per month',
    '  • Claude Opus for the final synthesis',
    '  • Persistent, searchable library of every debate',
    '  • PDF export',
    '',
    `${PRO_TRIAL_DAYS}-day free trial, then $${PRO_MONTHLY_PRICE}/mo monthly or $${PRO_ANNUAL_PRICE}/yr annual: ${proUrl}`,
    '',
    `Or use your free debates today: ${ctaUrl}`,
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
      Quick reminder: your 3 free debates reset at midnight UTC every day. If you haven't used them, they don't roll over — but there's always tomorrow.
    </p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      If you're hitting the limit, Pro gives you more headroom:
    </p>
    <div style="border:1px solid #2A2218;border-radius:6px;padding:20px 24px;margin:0 0 28px;background:#1A1410;">
      <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#D4A574;margin:0 0 12px;">★ Agora Pro</p>
      <p style="font-size:0.95rem;line-height:1.8;margin:0;color:#EDEDEC;">
        ${PRO_AGONS_PER_MONTH} debates / month<br>
        Claude Opus for the final synthesis<br>
        Persistent, searchable library<br>
        PDF export
      </p>
    </div>
    <a href="${proUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;margin-bottom:16px;">
      Start ${PRO_TRIAL_DAYS}-day free trial →
    </a>
    <br>
    <a href="${ctaUrl}" style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8A8A88;text-decoration:underline;">
      Use today's free debates
    </a>
    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">
    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">— Edward</p>
  </div>
</body>
</html>`

  return { subject, html, text }
}

// ---------------------------------------------------------------------------
// Day 7 — social proof + trial offer
// ---------------------------------------------------------------------------

/**
 * Shows examples of real decisions Pro users bring to the Agora, then
 * makes one more offer on the 7-day trial.
 */
export function renderDripDay7(vars: DripVariables = {}): RenderedEmail {
  const greeting = greet(vars.firstName)
  const proUrl = buildUtmUrl({
    baseUrl: PRICING_URL,
    campaign: DRIP_CAMPAIGN,
    emailId: DRIP_DAY7_EMAIL_ID,
  })

  const subject = 'What Pro members debate.'

  const text = [
    `${greeting},`,
    '',
    'You\'ve had Consult The Dead for a week. Here\'s what the people who use it every day bring to the council:',
    '',
    '  "Should I raise prices at $18K MRR or reposition as premium before the market locks me in?"',
    '   → Machiavelli · Curie · Sun Tzu',
    '',
    '  "I built a product in a half-day hackathon. It\'s at $20K MRR. Rebuild the fragile codebase or keep shipping?"',
    '   → da Vinci · Curie · Sun Tzu',
    '',
    '  "Open-source project at 13K stars. Just launched a paid tier. Community feels betrayed."',
    '   → Aurelius · Machiavelli · Curie',
    '',
    'These are real debates from the library — anonymized, but unedited. The councils genuinely disagree.',
    '',
    `Pro gives you ${PRO_AGONS_PER_MONTH} debates a month, Opus for synthesis, and a permanent library so nothing is lost.`,
    '',
    `7-day trial, then $${PRO_MONTHLY_PRICE}/mo monthly or $${PRO_ANNUAL_PRICE}/yr annual: ${proUrl}`,
    '',
    'If free is working for you, no action needed. The 3 debates/day will always be there.',
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
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 24px;">
      You've had Consult The Dead for a week. Here's what the people who use it every day bring to the council:
    </p>
    <div style="border:1px solid #1F1F22;border-radius:6px;padding:20px 24px;margin:0 0 24px;background:#111114;">
      <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8A88;margin:0 0 14px;">From the library</p>
      <div style="border-left:2px solid #1F1F22;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:0.92rem;line-height:1.6;color:#EDEDEC;margin:0 0 6px;">"Should I raise prices at $18K MRR or reposition as premium before the market locks me in?"</p>
        <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8A88;margin:0;">Machiavelli · Curie · Sun Tzu</p>
      </div>
      <div style="border-left:2px solid #1F1F22;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:0.92rem;line-height:1.6;color:#EDEDEC;margin:0 0 6px;">"Built in a half-day hackathon, now at $20K MRR. Rebuild the fragile codebase or keep shipping?"</p>
        <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8A88;margin:0;">da Vinci · Curie · Sun Tzu</p>
      </div>
      <div style="border-left:2px solid #1F1F22;padding-left:16px;">
        <p style="font-size:0.92rem;line-height:1.6;color:#EDEDEC;margin:0 0 6px;">"Open-source project at 13K stars. Just launched a paid tier. Community feels betrayed."</p>
        <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8A88;margin:0;">Aurelius · Machiavelli · Curie</p>
      </div>
    </div>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 28px;">
      Pro gives you ${PRO_AGONS_PER_MONTH} debates a month, Opus for the synthesis, and a permanent library so nothing is lost.
    </p>
    <a href="${proUrl}" style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Start ${PRO_TRIAL_DAYS}-day trial — $${PRO_MONTHLY_PRICE}/mo after
    </a>
    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">
    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">— Edward · If free is working for you, no action needed.</p>
  </div>
</body>
</html>`

  return { subject, html, text }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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
