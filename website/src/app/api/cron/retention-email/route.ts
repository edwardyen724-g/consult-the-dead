import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const RETENTION_EMAIL_CRON_CONTRACT = {
  route: '/api/cron/retention-email',
  canonicalDoc: 'docs/retention-email-sequence.md',
  method: 'GET',
  purpose:
    'Canonical operator manifest for the retention-email sequence and its cron inventory.',
  auth: {
    manual: 'Authorization: Bearer <CRON_SECRET>',
    vercelCron: 'x-vercel-cron: 1',
    dryRun: 'dryRun=1',
  },
  inventory: [
    {
      name: 'welcome',
      kind: 'webhook',
      method: 'POST',
      path: '/api/webhooks/clerk',
      trigger: 'Clerk user.created',
    },
    {
      name: 'recap',
      kind: 'cron',
      method: 'GET',
      path: '/api/cron/first-agon-recap',
      trigger: 'day-1 recap',
    },
    {
      name: 'nudge',
      kind: 'cron',
      method: 'GET',
      path: '/api/cron/retention-emails/nudge',
      trigger: 'day-2 nudge',
    },
    {
      name: 'digest',
      kind: 'cron',
      method: 'GET',
      path: '/api/cron/retention-emails/digest',
      trigger: 'weekly digest',
    },
  ],
} as const

export async function GET() {
  return NextResponse.json(RETENTION_EMAIL_CRON_CONTRACT, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
