import { NextResponse } from 'next/server'
import { runDay2NudgeCron } from "@/lib/cron/day2-nudge";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = 'force-dynamic'

export const DAY2_NUDGE_CRON_CONTRACT = {
  route: '/api/cron/day2-nudge',
  canonicalDoc: 'docs/retention-email-sequence.md',
  method: 'POST',
  purpose:
    'Canonical operator manifest for the day-2 nudge cron surface.',
  cadence: 'Daily at 9:00 AM PT',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
  },
} as const

export async function GET() {
  return NextResponse.json(DAY2_NUDGE_CRON_CONTRACT, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(request: Request) {
  return runDay2NudgeCron(request);
}
