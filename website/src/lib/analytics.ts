/**
 * Conversion-funnel analytics helper.
 *
 * Forwards events to Vercel Web Analytics (`@vercel/analytics/server`) when
 * running in a production runtime. In test/dev runs, the helper is a no-op
 * so unit tests do not emit synthetic traffic to the analytics backend, and
 * local `next dev` sessions stay quiet.
 *
 * Usage:
 *
 *     import { trackEvent } from '@/lib/analytics'
 *     await trackEvent('paid_subscription', { plan: 'annual', utm_campaign: 'launch' })
 *
 * Behaviour contract (covered by unit tests):
 *   1. Returns `false` and does nothing when `process.env.NODE_ENV !== 'production'`.
 *   2. Returns `false` when the Vercel analytics module cannot be loaded
 *      (e.g. dep accidentally missing in a build environment) — never
 *      throws into the caller. The Stripe webhook in particular MUST NOT
 *      surface analytics failures to Stripe.
 *   3. Returns `true` when the event was forwarded to `@vercel/analytics`.
 *   4. Drops `undefined` props before forwarding so they do not become
 *      string `"undefined"` in Vercel dashboards.
 *
 * The helper is intentionally written to load `@vercel/analytics/server`
 * via dynamic `import()` so a missing dep at build time does not break
 * `next build` page-data collection (matches the Stripe lazy-init pattern
 * used elsewhere in this codebase).
 */

export type AnalyticsPropValue = string | number | boolean | null | undefined;
export type AnalyticsProps = Record<string, AnalyticsPropValue>;

type VercelTrack = (
  event: string,
  props?: Record<string, AnalyticsPropValue>,
) => Promise<void> | void;

type Loader = () => Promise<VercelTrack | null>;

/**
 * Default loader: dynamic import keeps this module loadable even when
 * `@vercel/analytics` is not installed in the build environment.
 */
const defaultLoader: Loader = async () => {
  try {
    const mod = (await import('@vercel/analytics/server')) as {
      track?: VercelTrack;
    };
    return typeof mod.track === 'function' ? mod.track : null;
  } catch {
    return null;
  }
};

let activeLoader: Loader = defaultLoader;

/**
 * Test seam: swap the @vercel/analytics loader. Tests pass a fake that
 * returns either `null` (simulate missing dep) or a stub track() to assert
 * what got forwarded. Restored via the no-arg call.
 *
 * Not part of the public API — intentionally name-spaced with a leading
 * underscore so it is obviously an internal hook.
 */
export function _setVercelTrackLoaderForTests(loader: Loader | null): void {
  activeLoader = loader ?? defaultLoader;
}

function isProduction(): boolean {
  // Trust NODE_ENV. Vercel sets NODE_ENV=production for production deploys
  // and NODE_ENV=development for `next dev`. CI/test runs set NODE_ENV=test.
  return process.env.NODE_ENV === 'production';
}

function stripUndefined(props?: AnalyticsProps): Record<string, AnalyticsPropValue> | undefined {
  if (!props) return undefined;
  const out: Record<string, AnalyticsPropValue> = {};
  let any = false;
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    out[k] = v;
    any = true;
  }
  return any ? out : undefined;
}

/**
 * Forward a conversion-funnel event to Vercel Web Analytics.
 *
 * Resolves to `true` on successful forward, `false` when the event was
 * suppressed (non-production, missing dep, or runtime error). Never throws.
 */
export async function trackEvent(
  name: string,
  props?: AnalyticsProps,
): Promise<boolean> {
  if (typeof name !== 'string' || name.length === 0) return false;
  if (!isProduction()) return false;

  const track = await activeLoader();
  if (!track) return false;

  try {
    const cleaned = stripUndefined(props);
    if (cleaned) {
      await track(name, cleaned);
    } else {
      await track(name);
    }
    return true;
  } catch {
    // Analytics failures must never surface to callers (Stripe webhook in
    // particular: a thrown error here would fail the webhook and trigger
    // Stripe retries for a non-business-critical telemetry call).
    return false;
  }
}
