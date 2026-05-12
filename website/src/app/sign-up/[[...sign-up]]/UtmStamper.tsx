'use client'
/**
 * UtmStamper — client-side UTM attribution stamper for the /sign-up page.
 *
 * Reads `utm_source`, `utm_campaign`, and `utm_content` from
 * `window.location.search` on mount, then writes them into the Clerk
 * sign-up `unsafeMetadata` so the `user.created` webhook can attribute
 * the new user to an acquisition channel.
 *
 * Design decisions:
 *   - Fail-open: if UTMs are absent, the params string is malformed, or the
 *     Clerk update throws, the component is a no-op — it never blocks signup.
 *   - Renders nothing: it is a pure side-effect component (returns null).
 *   - Uses `useSignUp` which gives access to `signUp.unsafeMetadata` and the
 *     `signUp.update` method. In Clerk v7 the hook is always available on the
 *     client and `fetchStatus` indicates whether the resource is still loading.
 */

import { useEffect } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { getUtmOrNull, serializeUtmForClerkMetadata } from '@/lib/utm'

export function UtmStamper() {
  const { signUp, fetchStatus } = useSignUp()

  useEffect(() => {
    // Skip until the Clerk resource is ready (not still fetching).
    if (fetchStatus === 'fetching') return

    // Read and validate UTMs from the current URL's query string.
    // getUtmOrNull returns null when no recognised UTM params are present —
    // in that case we skip the Clerk update entirely (fail-open).
    // window is always defined inside a useEffect (client-only execution).
    const utm = getUtmOrNull(window.location.search)
    if (!utm) return

    // Serialise to a flat object (only non-null fields) and merge into the
    // existing unsafeMetadata so we don't clobber any fields already set
    // by other client-side code (e.g. referral tokens).
    const patch = serializeUtmForClerkMetadata(utm)
    signUp
      .update({ unsafeMetadata: { ...signUp.unsafeMetadata, ...patch } })
      .catch(() => {
        // Swallow: attribution is best-effort; never block or log loudly.
      })
  }, [fetchStatus, signUp])

  // Renders nothing — pure side-effect.
  return null
}
