import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const RETENTION_EMAIL_DIGEST_CRON_CONTRACT = {
  route: '/api/cron/retention-emails/digest',
  canonicalDoc: 'docs/retention-email-sequence.md',
  method: 'GET',
  purpose:
    'Canonical operator manifest for the weekly retention-email digest surface.',
  cadence: 'Weekly on Sundays at 9:00 AM PT',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
    dryRun: 'dryRun=1',
  },
} as const

export async function GET() {
  return NextResponse.json(RETENTION_EMAIL_DIGEST_CRON_CONTRACT, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
