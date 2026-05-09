/**
 * Pure cron handler logic for the retention email sequence.
 *
 * The Next.js route handlers in src/app/api/cron/retention-emails/* are
 * intentionally thin: they parse query params, fetch users via the
 * injected `userSource`, and delegate to `runNudgeCron` / `runDigestCron`
 * here. That keeps suppression + dry-run + summary logic in unit-testable
 * pure functions while the route handlers stay outside coverage scope
 * (Next.js routes are excluded by website/vitest.config.ts).
 *
 * Both cron functions return a structured summary suitable for logging
 * and for the dry-run smoke test the runbook will reference.
 */

import { evaluateSuppression } from './suppression'
import {
  type SendOptions,
  sendDigest,
  sendNudge,
} from './send'
import type {
  DigestUserCandidate,
  DigestVariables,
  NudgeUserCandidate,
} from './types'

export interface CronSummary {
  scanned: number
  sent: number
  suppressed: Record<string, number>
  /**
   * Internal per-user diagnostic rows.
   *
   * Route handlers must redact this before returning JSON to the caller,
   * because these rows include Clerk user IDs and email addresses.
   */
  details: Array<{
    clerkUserId: string
    email: string
    action: 'sent' | 'suppressed' | 'skipped'
    reason?: string
  }>
}

export interface PublicCronSummary {
  scanned: number
  sent: number
  suppressed: Record<string, number>
  details: Array<{
    action: 'sent' | 'suppressed' | 'skipped'
    reason?: string
  }>
}

export function toPublicCronSummary(summary: CronSummary): PublicCronSummary {
  return {
    scanned: summary.scanned,
    sent: summary.sent,
    suppressed: summary.suppressed,
    details: summary.details.map(({ action, reason }) => ({ action, reason })),
  }
}

/** ms-window around T-24h that the nudge cron considers eligible. */
const NUDGE_WINDOW_MS = 2 * 60 * 60 * 1000

interface RunNudgeOpts {
  now?: Date
  /** When true, no Resend calls are made. */
  dryRun?: boolean
  /** Inject a Resend send function for tests. Defaults to ./send.sendNudge. */
  send?: (
    to: string,
    vars: { firstName?: string | null },
    opts?: SendOptions,
  ) => Promise<unknown>
}

/**
 * Decide whether a user is in the T-24h±2h window for the day-2 nudge.
 * Pure function, exported for unit tests.
 */
export function isInNudgeWindow(
  createdAtIso: string,
  now: Date = new Date(),
  windowMs: number = NUDGE_WINDOW_MS,
): boolean {
  const created = Date.parse(createdAtIso)
  if (Number.isNaN(created)) return false
  const targetSinceCreate = 24 * 60 * 60 * 1000
  const elapsed = now.getTime() - created
  return Math.abs(elapsed - targetSinceCreate) <= windowMs
}

/**
 * Run the day-2 nudge campaign over the supplied user candidates.
 *
 * Pre-condition: the caller (route handler) has already filtered down to
 * "users created in the last ~26 hours" — but we re-check the window here
 * defensively. Suppression (Pro / unsubscribed / bounced) is also re-checked.
 */
export async function runNudgeCron(
  candidates: NudgeUserCandidate[],
  opts: RunNudgeOpts = {},
): Promise<CronSummary> {
  const send = opts.send ?? sendNudge
  const now = opts.now ?? new Date()
  const summary: CronSummary = {
    scanned: candidates.length,
    sent: 0,
    suppressed: {},
    details: [],
  }

  for (const u of candidates) {
    if (u.agonCount > 0) {
      summary.details.push({
        clerkUserId: u.clerkUserId,
        email: u.email,
        action: 'skipped',
        reason: 'has_agons',
      })
      continue
    }
    if (!isInNudgeWindow(u.createdAt, now)) {
      summary.details.push({
        clerkUserId: u.clerkUserId,
        email: u.email,
        action: 'skipped',
        reason: 'out_of_window',
      })
      continue
    }
    const reason = evaluateSuppression('nudge', u.suppression)
    if (reason !== null) {
      summary.suppressed[reason] = (summary.suppressed[reason] ?? 0) + 1
      summary.details.push({
        clerkUserId: u.clerkUserId,
        email: u.email,
        action: 'suppressed',
        reason,
      })
      continue
    }

    await send(
      u.email,
      { firstName: u.firstName },
      { dryRun: opts.dryRun },
    )
    summary.sent += 1
    summary.details.push({
      clerkUserId: u.clerkUserId,
      email: u.email,
      action: 'sent',
    })
  }

  return summary
}

interface RunDigestOpts {
  dryRun?: boolean
  /** Inject a Resend send function for tests. Defaults to ./send.sendDigest. */
  send?: (
    to: string,
    vars: DigestVariables,
    opts?: SendOptions,
  ) => Promise<unknown>
  /** Featured agon + new-mind variables shared across the batch. */
  shared: Omit<DigestVariables, 'firstName' | 'unsubscribeUrl' | 'agonsRemaining'>
  /** Builder for the per-user unsubscribe link. */
  buildUnsubscribeUrl: (clerkUserId: string) => string
  /**
   * Lookup for per-user agons remaining. If omitted, all users get null
   * (renderer falls through to the generic "resets daily" line).
   */
  agonsRemainingFor?: (
    clerkUserId: string,
  ) => Promise<number | 'unlimited' | null> | number | 'unlimited' | null
}

export async function runDigestCron(
  candidates: DigestUserCandidate[],
  opts: RunDigestOpts,
): Promise<CronSummary> {
  const send = opts.send ?? sendDigest
  const summary: CronSummary = {
    scanned: candidates.length,
    sent: 0,
    suppressed: {},
    details: [],
  }

  for (const u of candidates) {
    const reason = evaluateSuppression('digest', u.suppression)
    if (reason !== null) {
      summary.suppressed[reason] = (summary.suppressed[reason] ?? 0) + 1
      summary.details.push({
        clerkUserId: u.clerkUserId,
        email: u.email,
        action: 'suppressed',
        reason,
      })
      continue
    }

    const remaining = opts.agonsRemainingFor
      ? await opts.agonsRemainingFor(u.clerkUserId)
      : null

    const vars: DigestVariables = {
      ...opts.shared,
      firstName: u.firstName,
      unsubscribeUrl: opts.buildUnsubscribeUrl(u.clerkUserId),
      agonsRemaining: remaining,
    }
    await send(u.email, vars, { dryRun: opts.dryRun })
    summary.sent += 1
    summary.details.push({
      clerkUserId: u.clerkUserId,
      email: u.email,
      action: 'sent',
    })
  }

  return summary
}

/**
 * Validate a Vercel Cron / manual invocation. Returns null when the
 * request is authorised; otherwise returns the failure reason.
 *
 * In production, only `Authorization: Bearer <CRON_SECRET>` is trusted.
 * `dryRun=1` and `x-vercel-cron` do not bypass the gate.
 */
export function authorizeCronRequest(headers: Headers, url: URL): string | null {
  void url
  if (process.env.NODE_ENV !== 'production') return null

  const auth = headers.get('authorization') ?? ''
  const expected = process.env.CRON_SECRET
  if (expected && auth === `Bearer ${expected}`) return null

  return 'unauthorized'
}

/**
 * Production route auth helper.
 *
 * Only a matching Bearer secret is accepted in production; dryRun and
 * x-vercel-cron do not bypass the gate.
 */
export function authorizeProductionCronRequest(
  headers: Headers,
): string | null {
  if (process.env.NODE_ENV !== 'production') return null

  const auth = headers.get('authorization') ?? ''
  const expected = process.env.CRON_SECRET
  if (expected && auth === `Bearer ${expected}`) return null

  return 'unauthorized'
}
