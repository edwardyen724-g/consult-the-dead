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
  authorizeCronRequest,
  runDigestCron,
  type CronSummary,
} from '@/lib/emails/cron'
import { resolveSuppressionMetadata } from '@/lib/emails/suppression'
import type { DigestUserCandidate } from '@/lib/emails/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.consultthedead.com'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const auth = authorizeCronRequest(request.headers, url)
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

  // For dry-run with no env, supply a placeholder.
  const sharedSafe = shared ?? {
    featuredAgonTopic: '(dry-run placeholder topic)',
    featuredConsensusExcerpt: '(dry-run placeholder consensus)',
    featuredAgonShareId: 'dry-run',
    newMindName: null,
    newMindTagline: null,
    newMindHowArguesBlurb: null,
  }

  const summary: CronSummary = await runDigestCron(candidates, {
    shared: sharedSafe,
    buildUnsubscribeUrl: (id) =>
      `${SITE_URL}/account/email-unsubscribe?u=${encodeURIComponent(id)}`,
    dryRun,
  })

  return NextResponse.json({ ok: true, dryRun, ...summary })
}

async function loadDigestCandidates(): Promise<DigestUserCandidate[]> {
  const clerk = await clerkClient()
  const list = await clerk.users.getUserList({
    orderBy: '-created_at',
    limit: 500,
  })

  const candidates: DigestUserCandidate[] = []
  for (const u of list.data) {
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
    newMindHowArguesBlurb: process.env.NEW_MIND_HOW_ARGUES ?? null,
  }
}
