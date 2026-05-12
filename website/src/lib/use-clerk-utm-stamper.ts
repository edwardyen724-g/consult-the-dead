/**
 * useClerkUtmStamper — React hook that stamps UTM attribution into the
 * Clerk sign-up `unsafeMetadata` on mount.
 *
 * Design:
 *   - Reads `window.location.search` once, on mount ([] dependency).
 *   - Calls `getUtmOrNull` to parse & validate; silently no-ops when no
 *     recognised UTM params are present (fail-open).
 *   - If UTMs are present, calls `signUp.update({ unsafeMetadata: … })`.
 *     Any error (network, Clerk not ready, etc.) is swallowed so the
 *     hook never blocks or crashes the sign-up flow.
 *   - Returns `void` — callers only care about the side-effect.
 */

import { useEffect } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { getUtmOrNull, serializeUtmForClerkMetadata } from '@/lib/utm'

export function useClerkUtmStamper(): void {
  const { signUp } = useSignUp()

  useEffect(() => {
    // signUp may be undefined if Clerk hasn't initialised yet; bail out silently.
    if (!signUp) return

    // Read UTMs from the current URL's query string once on mount.
    // window is always defined inside useEffect (client-only execution).
    const utm = getUtmOrNull(window.location.search)

    // No recognised UTM params — skip the Clerk update entirely (fail-open).
    if (!utm) return

    // Serialise to a flat object (only non-null fields) and write to
    // unsafeMetadata. Errors are swallowed — attribution is best-effort.
    const patch = serializeUtmForClerkMetadata(utm)
    signUp.update({ unsafeMetadata: patch }).catch(() => {
      // Swallow: attribution is best-effort; never block or log loudly.
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
