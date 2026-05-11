import { NextResponse } from 'next/server'
import { runWeeklyDigestCron } from "@/lib/cron/weekly-digest";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = 'force-dynamic'

export const WEEKLY_DIGEST_CRON_CONTRACT = {
  route: '/api/cron/weekly-digest',
  canonicalDoc: 'docs/retention-email-sequence.md',
  method: 'POST',
  purpose:
    'Canonical operator manifest for the weekly digest cron surface.',
  cadence: 'Weekly on Sundays at 9:00 AM PT',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
  },
} as const

export async function GET() {
  return NextResponse.json(WEEKLY_DIGEST_CRON_CONTRACT, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(request: Request) {
  return runWeeklyDigestCron(request);
}
