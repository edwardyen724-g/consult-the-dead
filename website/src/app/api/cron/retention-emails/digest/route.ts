/**
 * GET /api/cron/retention-emails/digest
 *
 * Vercel Cron entry for the WEEKLY DIGEST campaign. Fires Sundays 9am PT
 * (configured in vercel.json — see capsule output for the follow-up).
 *
 * Pulls all Clerk users (paginated client-side; v1 fits on one page),
 * suppresses Pro / unsubscribed / bounced users in src/lib/emails/cron.ts,
 * and sends the weekly digest with a featured agon + (optional)
 * new-mind block.
 *
 * The featured-agon and new-mind metadata is populated from environment
 * variables for v1 (FEATURED_AGON_TOPIC, FEATURED_AGON_SHARE_ID, etc.)
 * — moves to a config row / algorithmic selection in v2 per the
 * marketing brief.
 *
 * In dry-run mode (?dryRun=1) the route never calls Resend and tolerates
 * Clerk/DB unavailability, returning a smoke-test-friendly summary.
 */

import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import {
  authorizeProductionCronRequest,
  runDigestCron,
  toPublicCronSummary,
  type CronSummary,
} from '@/lib/emails/cron'
import { resolveSuppressionMetadata } from '@/lib/emails/suppression'
import type { DigestUserCandidate } from '@/lib/emails/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.consultthedead.com'
const DIGEST_CLERK_PAGE_SIZE = 200
const DETERMINISTIC_DRY_RUN_SHARED = {
  featuredAgonTopic: '(dry-run placeholder topic)',
  featuredConsensusExcerpt: '(dry-run placeholder consensus)',
  featuredAgonShareId: 'dry-run',
  newMindName: null,
  newMindTagline: null,
  newMindHowArguesBlurb: null,
}

interface ClerkUserRecord {
  id: string
  firstName?: string | null
  emailAddresses: Array<{
    id: string
    emailAddress?: string | null
  }>
  primaryEmailAddressId?: string | null
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

  let candidates: DigestUserCandidate[] = []
  try {
    candidates = await loadDigestCandidates()
  } catch (e) {
    if (!dryRun) throw e
    return NextResponse.json({
      ok: true,
      dryRun: true,
      note: 'load_failed_in_dry_run',
      error: e instanceof Error ? e.message : String(e),
    })
  }

  const shared = readFeaturedFromEnv()
  if (!shared && !dryRun) {
    return NextResponse.json(
      { error: 'FEATURED_AGON_* env vars not configured' },
      { status: 500 },
    )
  }

  // Smoke checks need a stable featured block even before the env is wired.
  const sharedSafe = shared ?? DETERMINISTIC_DRY_RUN_SHARED

  const summary: CronSummary = await runDigestCron(candidates, {
    shared: sharedSafe,
    buildUnsubscribeUrl: (id) =>
      `${SITE_URL}/account/email-unsubscribe?u=${encodeURIComponent(id)}`,
    dryRun,
  })

  return NextResponse.json({
    ok: true,
    dryRun,
    ...toPublicCronSummary(summary),
  })
}

async function loadDigestCandidates(): Promise<DigestUserCandidate[]> {
  const clerk = await clerkClient()
  const users = await loadAllClerkUsers(clerk.users, DIGEST_CLERK_PAGE_SIZE)

  const candidates: DigestUserCandidate[] = []
  for (const u of users) {
    const primaryEmail = u.emailAddresses.find(
      (e) => e.id === u.primaryEmailAddressId,
    )
    const email = primaryEmail?.emailAddress ?? u.emailAddresses[0]?.emailAddress
    if (!email) continue

    candidates.push({
      clerkUserId: u.id,
      email,
      firstName: u.firstName ?? null,
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

function readFeaturedFromEnv() {
  const topic = process.env.FEATURED_AGON_TOPIC
  const consensus = process.env.FEATURED_AGON_CONSENSUS
  const shareId = process.env.FEATURED_AGON_SHARE_ID
  if (!topic || !consensus || !shareId) return null

  return {
    featuredAgonTopic: topic,
    featuredConsensusExcerpt: consensus,
    featuredAgonShareId: shareId,
    newMindName: process.env.NEW_MIND_NAME ?? null,
    newMindTagline: process.env.NEW_MIND_TAGLINE ?? null,
    newMindHowArguesBlurb: process.env.NEW_MIND_HOW_ARGS ?? null,
  }
}
