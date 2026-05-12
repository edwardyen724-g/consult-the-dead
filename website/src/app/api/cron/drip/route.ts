/**
 * POST /api/cron/drip?day=1|3|7
 *
 * Sends the appropriate drip email to free users who signed up N days ago.
 * Day 0 (welcome) is handled separately by the Clerk user.created webhook.
 *
 * Auth: Bearer <CRON_SECRET> or Vercel cron header x-vercel-cron: 1
 * Cadence: Run daily for each day value (1, 3, 7) via vercel.json cron.
 *
 * Suppression: Pro subscribers, unsubscribed, and hard-bounced users are
 * excluded. Already-sent tracking uses Clerk publicMetadata
 * `drip_day{N}_sent_at` so the cron is safe to re-run (idempotent).
 *
 * User window: users whose Clerk `createdAt` falls in the 24-hour UTC day
 * that is exactly N days before today. A 2-hour grace window on both sides
 * accounts for cron scheduling variance.
 */

import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { sendRendered } from '@/lib/emails/send'
import {
  evaluateSuppression,
  resolveSuppressionMetadata,
} from '@/lib/emails/suppression'
import {
  renderDripDay1,
  renderDripDay3,
  renderDripDay7,
} from '@/lib/emails/templates/drip'

export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

export const DRIP_CRON_CONTRACT = {
  route: '/api/cron/drip',
  method: 'POST',
  queryParams: { day: '1 | 3 | 7' },
  purpose: 'Send day-N post-signup drip email to eligible free users.',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
  },
} as const

export type DripDay = 1 | 3 | 7

export interface DripCronSummary {
  day: DripDay
  scanned: number
  sent: number
  skipped: number
  suppressed: number
  dryRun: boolean
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET
  return typeof secret === 'string' && secret.length > 0 ? secret : null
}

export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = getCronSecret()
  if (!secret) return false
  const auth = request.headers.get('authorization')
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  return auth === `Bearer ${secret}` || isVercelCron
}

// ---------------------------------------------------------------------------
// Window helpers
// ---------------------------------------------------------------------------

/**
 * Returns [windowStart, windowEnd) covering the 24-hour UTC day that is
 * exactly `day` days before `now`. A 2-hour grace window expands both edges
 * so cron scheduling jitter doesn't cause users to be missed or doubled.
 */
export function getDripWindow(
  day: DripDay,
  now: Date = new Date(),
): { windowStart: Date; windowEnd: Date } {
  const GRACE_MS = 2 * 60 * 60 * 1000 // 2h
  const todayUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const dayStart = todayUtcMidnight - day * 24 * 60 * 60 * 1000
  const dayEnd = dayStart + 24 * 60 * 60 * 1000

  return {
    windowStart: new Date(dayStart - GRACE_MS),
    windowEnd: new Date(dayEnd + GRACE_MS),
  }
}

// ---------------------------------------------------------------------------
// Metadata key helpers
// ---------------------------------------------------------------------------

export function dripSentMetaKey(day: DripDay): string {
  return `drip_day${day}_sent_at`
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(DRIP_CRON_CONTRACT, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const dayParam = url.searchParams.get('day')
  const dryRun = url.searchParams.get('dry_run') === '1'

  const day = Number(dayParam) as DripDay
  if (day !== 1 && day !== 3 && day !== 7) {
    return NextResponse.json(
      { error: 'Query param day must be 1, 3, or 7' },
      { status: 400 },
    )
  }

  const { windowStart, windowEnd } = getDripWindow(day)

  const clerk = await clerkClient()

  // Fetch users created in the target window. Clerk's API supports
  // orderBy created_at and limit/offset pagination; we cap at 200 per run
  // and expect daily cron to keep up with signups at this stage.
  const userList = await clerk.users.getUserList({
    limit: 200,
    orderBy: '-created_at',
  })

  const summary: DripCronSummary = {
    day,
    scanned: 0,
    sent: 0,
    skipped: 0,
    suppressed: 0,
    dryRun,
  }

  const metaKey = dripSentMetaKey(day)

  for (const user of userList.data) {
    const createdAt = new Date(user.createdAt)
    if (createdAt < windowStart || createdAt >= windowEnd) continue

    summary.scanned++

    // Idempotency: skip if already sent
    const publicMeta = user.publicMetadata as Record<string, unknown>
    if (publicMeta[metaKey]) {
      summary.skipped++
      continue
    }

    // Suppression check
    const suppressionMeta = resolveSuppressionMetadata(
      user.publicMetadata,
      user.privateMetadata,
    )
    const suppressionReason = evaluateSuppression('drip', suppressionMeta)
    if (suppressionReason) {
      summary.suppressed++
      continue
    }

    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )
    const email =
      primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress
    if (!email) {
      summary.skipped++
      continue
    }

    const firstName = user.firstName ?? null

    const rendered =
      day === 1
        ? renderDripDay1({ firstName })
        : day === 3
          ? renderDripDay3({ firstName })
          : renderDripDay7({ firstName })

    try {
      if (!dryRun) {
        await sendRendered(email, rendered)

        // Mark as sent in Clerk publicMetadata (idempotency guard)
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { [metaKey]: new Date().toISOString() },
        })
      }
      summary.sent++
    } catch {
      // Fire-and-forget: one user's email failure must not abort the batch
      summary.skipped++
    }
  }

  return NextResponse.json(summary)
}
