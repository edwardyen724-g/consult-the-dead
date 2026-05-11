import { describe, expect, it } from 'vitest'

import {
  GET as GETRetentionEmailManifest,
  RETENTION_EMAIL_CRON_CONTRACT,
} from './route'
import {
  GET as GETFirstAgonRecap,
  FIRST_AGON_RECAP_CRON_CONTRACT,
} from '../first-agon-recap/route'

// Note: /api/cron/retention-emails/nudge and /api/cron/retention-emails/digest
// are full implementations (not manifest stubs); they are covered by their own
// test files (nudge/route.test.ts, digest/route.test.ts).
describe.each([
  ['retention-email manifest', GETRetentionEmailManifest, RETENTION_EMAIL_CRON_CONTRACT],
  ['first-agon recap manifest', GETFirstAgonRecap, FIRST_AGON_RECAP_CRON_CONTRACT],
] as const)('%s', (_, get, contract) => {
  it('returns the canonical JSON contract with no-store caching', async () => {
    const response = await get()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual(contract)
  })
})
