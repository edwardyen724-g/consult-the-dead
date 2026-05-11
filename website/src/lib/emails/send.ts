/**
 * Send wrappers — the only file in this subsystem that touches Resend.
 *
 * Lazy Resend init pattern (matches website/src/lib/email.ts) so missing
 * RESEND_API_KEY at build time doesn't break `next build` page-data
 * collection. EMAIL_FROM is read at first send and falls back to the
 * Resend onboarding sender so dev/preview environments work without
 * extra config.
 *
 * Public API:
 *   sendWelcome(to, vars)
 *   sendRecap(to, vars)
 *   sendNudge(to, vars)
 *   sendDigest(to, vars)
 *   sendRendered(to, rendered)   // for cron/dry-run/testing
 *
 * The four campaign-specific wrappers compose template + send, returning
 * the Resend response or throwing.
 */

import { Resend } from 'resend'
import { renderWelcome, type WelcomeVariables } from './templates/welcome'
import { renderRecap } from './templates/recap'
import { renderNudge, type NudgeVariables } from './templates/nudge'
import { renderDigest } from './templates/digest'
import type { DigestVariables, RecapVariables, RenderedEmail } from './types'

const FALLBACK_FROM = 'Consult The Dead <onboarding@resend.dev>'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export interface SendOptions {
  /** ISO timestamp; passed to Resend as scheduledAt for delayed sends. */
  scheduledAt?: string
  /** Override the From line (mostly for testing). */
  from?: string
  /** When true, do not call Resend; just return the rendered payload. */
  dryRun?: boolean
}

export interface SendResult {
  ok: boolean
  /** Resend message id when sent; null in dry-run. */
  messageId: string | null
  rendered: RenderedEmail
  dryRun: boolean
}

/**
 * Low-level send. Other helpers compose template renderers on top of
 * this and re-use the same payload shape.
 */
export async function sendRendered(
  to: string,
  rendered: RenderedEmail,
  opts: SendOptions = {},
): Promise<SendResult> {
  if (opts.dryRun) {
    return { ok: true, messageId: null, rendered, dryRun: true }
  }

  const from = opts.from ?? process.env.EMAIL_FROM ?? FALLBACK_FROM

  const payload: {
    from: string
    to: string
    subject: string
    html: string
    text: string
    scheduledAt?: string
  } = {
    from,
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  }
  if (opts.scheduledAt) {
    payload.scheduledAt = opts.scheduledAt
  }

  // Resend SDK accepts scheduledAt; the field is permitted on the API.
  // Cast through Record so the SDK's narrower public type doesn't reject it.
  const result = await getResend().emails.send(
    payload as unknown as Parameters<Resend['emails']['send']>[0],
  )

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`)
  }

  return {
    ok: true,
    messageId: result.data?.id ?? null,
    rendered,
    dryRun: false,
  }
}

export function sendWelcome(
  to: string,
  vars: WelcomeVariables = {},
  opts: SendOptions = {},
): Promise<SendResult> {
  return sendRendered(to, renderWelcome(vars), opts)
}

export function sendRecap(
  to: string,
  vars: RecapVariables,
  opts: SendOptions = {},
): Promise<SendResult> {
  return sendRendered(to, renderRecap(vars), opts)
}

export function sendNudge(
  to: string,
  vars: NudgeVariables = {},
  opts: SendOptions = {},
): Promise<SendResult> {
  return sendRendered(to, renderNudge(vars), opts)
}

export function sendDigest(
  to: string,
  vars: DigestVariables,
  opts: SendOptions = {},
): Promise<SendResult> {
  return sendRendered(to, renderDigest(vars), opts)
}

/**
 * Compute the Resend `scheduledAt` ISO string for the FIRST-AGON RECAP
 * campaign (T+1h after agon completion). Exposed so the eventual /api/agon
 * wiring follow-up can pass this to sendRecap with the same offset rule
 * everywhere.
 */
export function recapScheduledAt(now: Date = new Date()): string {
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
}
