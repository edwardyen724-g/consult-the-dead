/**
 * GET /api/cron/retention-emails/nudge
 *
 * Vercel Cron entry for the DAY-2 NUDGE campaign. Fires daily at 9am PT
 * (configured in vercel.json — added in a follow-up capsule, see
 * output/change-summary.md).
 *
 * Behaviour:
 *   1. Authorise (Authorization bearer in production; dryRun never bypasses).
 *   2. Pull all Clerk users whose `created_at` is in T-24h±2h.
 *   3. For each user, count their agons in the database.
 *   4. Pure logic in src/lib/emails/cron.ts decides who to send.
 *
 * In dry-run mode (?dryRun=1) the route never calls Resend and returns a
 * structured summary suitable for the smoke-test runbook. The dry-run
 * path also skips the live Clerk + DB queries (returns scanned: 0,
 * sent: 0) so the route can be hit safely on a fresh deploy without
 * tripping rate limits — switch to a populated dry-run by setting
 * `?withSamples=1` only in non-production.
 *
 * Vitest does NOT cover this route directly (Next.js routes are
 * excluded by website/vitest.config.ts). Suppression/window logic is
 * tested in src/lib/emails/cron.test.ts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'
import {
  authorizeProductionCronRequest,
  runNudgeCron,
  toPublicCronSummary,
  type CronSummary,
} from '@/lib/emails/cron'
import { resolveSuppressionMetadata } from '@/lib/emails/suppression'
import type { NudgeUserCandidate } from '@/lib/emails/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NUDGE_LOOKBACK_HOURS = 26
const NUDGE_CLERK_PAGE_SIZE = 200

interface ClerkUserRecord {
  id: string
  firstName?: string | null
  emailAddresses: Array<{
    id: string
    emailAddress?: string | null
  }>
  primaryEmailAddressId?: string | null
  createdAt?: number | null
  publicMetadata: Record<string, unknown>
  privateMetadata: Record<string, unknown>
}

interface ClerkUsersApi {
  getUserList(args: {
    orderBy: '-created_at'
    limit: number
    offset: number
  }): Promise<{ data: ClerkUserRecord[] }>
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const auth = authorizeProductionCronRequest(request.headers)
  if (auth !== null) {
    return NextResponse.json({ error: auth }, { status: 401 })
  }

  const dryRun = url.searchParams.get('dryRun') === '1'

  let candidates: NudgeUserCandidate[] = []
  try {
    candidates = await loadNudgeCandidates(NUDGE_LOOKBACK_HOURS)
  } catch (e) {
    // In dry-run we tolerate Clerk/DB unavailability so the route can be
    // smoke-tested on a fresh deploy.
    if (!dryRun) throw e
    return NextResponse.json({
      ok: true,
      dryRun: true,
      note: 'load_failed_in_dry_run',
      error: e instanceof Error ? e.message : String(e),
    })
  }

  const summary: CronSummary = await runNudgeCron(candidates, { dryRun })
  return NextResponse.json({
    ok: true,
    dryRun,
    ...toPublicCronSummary(summary),
  })
}

async function loadNudgeCandidates(
  lookbackHours: number,
): Promise<NudgeUserCandidate[]> {
  const sinceMs = Date.now() - lookbackHours * 60 * 60 * 1000

  const clerk = await clerkClient()
  const users = await loadAllClerkUsers(clerk.users, NUDGE_CLERK_PAGE_SIZE)

  const candidates: NudgeUserCandidate[] = []
  for (const u of users) {
    const createdAt = u.createdAt
    if (!createdAt || createdAt < sinceMs) continue

    const primaryEmail = u.emailAddresses.find(
      (e) => e.id === u.primaryEmailAddressId,
    )
    const email = primaryEmail?.emailAddress ?? u.emailAddresses[0]?.emailAddress
    if (!email) continue

    const agonCount = await countAgons(u.id)
    candidates.push({
      clerkUserId: u.id,
      email,
      firstName: u.firstName ?? null,
      createdAt: new Date(createdAt).toISOString(),
      agonCount,
      suppression: resolveSuppressionMetadata(
        u.publicMetadata,
        u.privateMetadata,
      ),
    })
  }

  return candidates
}

async function loadAllClerkUsers(
  usersApi: ClerkUsersApi,
  pageSize: number,
): Promise<ClerkUserRecord[]> {
  const users: ClerkUserRecord[] = []
  for (let offset = 0; ; offset += pageSize) {
    const page = await usersApi.getUserList({
      orderBy: '-created_at',
      limit: pageSize,
      offset,
    })
    users.push(...page.data)
    if (page.data.length < pageSize) break
  }
  return users
}

async function countAgons(clerkUserId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*)::int AS n
    FROM agons
    WHERE clerk_user_id = ${clerkUserId}
  `
  const row = result.rows[0] as { n: number } | undefined
  return row?.n ?? 0
}
