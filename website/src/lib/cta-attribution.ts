/**
 * CTA attribution helpers for funnel events.
 *
 * The home/pricing wiring tasks use this helper to turn a CTA surface and
 * optional campaign/content labels into a canonical analytics props object.
 * It keeps the `utm_*` naming consistent with the existing funnel contract
 * while allowing call sites to attach any extra event-specific metadata.
 *
 * Everything here is pure and safe to reuse from server or client code.
 */

import type { AnalyticsProps } from './analytics'
import { sanitiseUtmValue } from './utm'

export interface CtaEventAttributionInput {
  /**
   * The source surface that owns the CTA, e.g. `home`, `pricing`, or `share`.
   * This is serialized to `utm_source`.
   */
  source: string
  /**
   * Optional campaign label for the CTA, serialized to `utm_campaign`.
   * Examples: `hero_primary`, `pricing_upgrade`, `tier_exhaustion`.
   */
  campaign?: string | null | undefined
  /**
   * Optional content label for the CTA, serialized to `utm_content`.
   * Examples: `primary_button`, `sticky_footer`, `card_cta`.
   */
  content?: string | null | undefined
  /**
   * Event-specific props that should travel with the analytics payload.
   * Canonical UTM keys always win over same-named extras.
   */
  extra?: AnalyticsProps
}

/**
 * Build analytics props for a CTA event.
 *
 * The helper trims and sanitises each UTM field, drops empty values, and
 * preserves any extra metadata passed by the caller. Canonical `utm_*`
 * fields are always written after extras so they cannot be overridden by
 * stale wiring.
 */
export function buildCtaEventProps(
  input: CtaEventAttributionInput,
): AnalyticsProps {
  const out: AnalyticsProps = {}

  for (const [key, value] of Object.entries(input.extra ?? {})) {
    if (value !== undefined) {
      out[key] = value
    }
  }

  const source = sanitiseUtmValue(input.source)
  if (source) out.utm_source = source

  const campaign = sanitiseUtmValue(input.campaign)
  if (campaign) out.utm_campaign = campaign

  const content = sanitiseUtmValue(input.content)
  if (content) out.utm_content = content

  return out
}
