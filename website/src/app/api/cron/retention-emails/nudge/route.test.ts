import { afterEach, describe, expect, it, vi } from 'vitest'
import { clerkClient } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'
import { GET } from './route'

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}))

const clerkClientMock = vi.mocked(clerkClient)
const sqlMock = vi.mocked(sql)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('GET /api/cron/retention-emails/nudge', () => {
  it('rejects production dry-run requests without auth', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CRON_SECRET', 'secret')

    const response = await GET(
      new Request(
        'https://consultthedead.com/api/cron/retention-emails/nudge?dryRun=1',
      ) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' })
    expect(clerkClientMock).not.toHaveBeenCalled()
    expect(sqlMock).not.toHaveBeenCalled()
  })
})
