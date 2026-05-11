import { NextResponse } from 'next/server'
import { runFirstAgonRecapCron } from "@/lib/cron/first-agon-recap";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = 'force-dynamic'

export const FIRST_AGON_RECAP_CRON_CONTRACT = {
  route: '/api/cron/first-agon-recap',
  canonicalDoc: 'docs/retention-email-sequence.md',
  method: 'GET',
  purpose:
    'Canonical operator manifest for the first-agon recap cron surface.',
  cadence: 'T+1h after the first agon completes',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
    dryRun: 'dryRun=1',
  },
} as const

export async function GET() {
  return NextResponse.json(FIRST_AGON_RECAP_CRON_CONTRACT, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(request: Request) {
  return runFirstAgonRecapCron(request);
}
