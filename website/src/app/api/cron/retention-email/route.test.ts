import { describe, expect, it } from 'vitest'

import {
  GET as GETRetentionEmailManifest,
  RETENTION_EMAIL_CRON_CONTRACT,
} from './route'
import {
  GET as GETFirstAgonRecap,
  FIRST_AGON_RECAP_CRON_CONTRACT,
} from '../first-agon-recap/route'
import {
  GET as GETRetentionEmailNudge,
  RETENTION_EMAIL_NUDGE_CRON_CONTRACT,
} from '../retention-emails/nudge/route'
import {
  GET as GETRetentionEmailDigest,
  RETENTION_EMAIL_DIGEST_CRON_CONTRACT,
} from '../retention-emails/digest/route'

describe.each([
  ['retention-email manifest', GETRetentionEmailManifest, RETENTION_EMAIL_CRON_CONTRACT],
  ['first-agon recap manifest', GETFirstAgonRecap, FIRST_AGON_RECAP_CRON_CONTRACT],
  ['retention-email nudge manifest', GETRetentionEmailNudge, RETENTION_EMAIL_NUDGE_CRON_CONTRACT],
  ['retention-email digest manifest', GETRetentionEmailDigest, RETENTION_EMAIL_DIGEST_CRON_CONTRACT],
] as const)('%s', (_, get, contract) => {
  it('returns the canonical JSON contract with no-store caching', async () => {
    const response = await get()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual(contract)
  })
})
