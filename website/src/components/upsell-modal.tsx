'use client'

/**
 * UpsellModal — free-tier exhaustion conversion surface.
 *
 * Surfaced when a free /agora user submits their 4th agon of the day and the
 * server returns the cap-exceeded error. Three concurrent escape hatches:
 *
 *   1. Add your Anthropic API key   → unlimited, free, BYO-key (onAddKey)
 *   2. Upgrade to Pro                → Stripe checkout, utm_campaign=tier_exhaustion
 *      (onUpgrade receives the prebuilt payload so the wiring layer can POST
 *       it as the request body or append it as a query string — all Stripe
 *       sees is utm_campaign=tier_exhaustion in the resulting metadata)
 *   3. Come back tomorrow            → dismiss the modal (onDismiss)
 *
 * This is a presentational component — it does NOT call fetch, navigate, or
 * touch window. All side effects live in the parent (AgoraApp.tsx wiring is
 * shipped in a follow-up capsule sequenced after 33f9a1c1; see task 5fceb115).
 *
 * Layout: vertical stack on mobile (<=640px), horizontal row on desktop.
 * Reuses the codebase's inline-style + CSS-variable convention; no external
 * UI primitive dependencies.
 */

import type { CSSProperties } from 'react'

// ──────────────────────────────────────────────────────────────────────────
//  Public constants & helpers
// ──────────────────────────────────────────────────────────────────────────

/** UTM campaign tag attached to all upsell-modal-originated Stripe sessions. */
export const TIER_EXHAUSTION_UTM_CAMPAIGN = 'tier_exhaustion'

/** Base path of the Stripe checkout API route. */
export const STRIPE_CHECKOUT_BASE_PATH = '/api/stripe/checkout'

/** Headline copy — kept as a constant so tests can assert verbatim. */
export const UPSELL_HEADLINE = "You've used today's 3 free agons"

/** Subhead copy — marketing voice (matches /pricing + GOAL_FOUNDER.md tone). */
export const UPSELL_SUBHEAD =
  'The dead are still here. Pick how you want to keep the council going.'

/**
 * Structured payload handed to the parent's `onUpgrade` callback. The parent
 * can either (a) POST `{ utm_campaign }` as part of the Stripe checkout body
 * so the campaign tag lands in Stripe metadata, or (b) navigate to
 * `checkoutUrl` for redirect-style flows. Either way the campaign tag is
 * present.
 */
export interface UpsellUpgradePayload {
  /** Always `'tier_exhaustion'` for this modal. */
  utm_campaign: typeof TIER_EXHAUSTION_UTM_CAMPAIGN
  /** Pre-built absolute-relative URL: `/api/stripe/checkout?utm_campaign=tier_exhaustion`. */
  checkoutUrl: string
}

/**
 * Build the Stripe-checkout URL with the `tier_exhaustion` UTM tag baked in.
 * Pure helper — exported so the wiring layer and the test suite can both
 * derive the same canonical URL string.
 */
export function buildUpgradeCheckoutUrl(): string {
  return `${STRIPE_CHECKOUT_BASE_PATH}?utm_campaign=${TIER_EXHAUSTION_UTM_CAMPAIGN}`
}

/** Build the structured upgrade payload. */
export function buildUpgradePayload(): UpsellUpgradePayload {
  return {
    utm_campaign: TIER_EXHAUSTION_UTM_CAMPAIGN,
    checkoutUrl: buildUpgradeCheckoutUrl(),
  }
}

// ──────────────────────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────────────────────

export interface UpsellModalProps {
  /** Open the BYO-API-key settings drawer. Wired by the parent. */
  onAddKey: () => void
  /**
   * Begin the Stripe checkout flow. Receives a pre-built payload carrying the
   * `tier_exhaustion` UTM tag so the wiring layer doesn't have to re-derive it.
   */
  onUpgrade: (payload: UpsellUpgradePayload) => void
  /** Dismiss the modal. Wired by the parent. */
  onDismiss: () => void
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 100,
}

const dialogStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: '6px',
  padding: '32px 28px',
  maxWidth: '640px',
  width: '100%',
  color: 'var(--fg)',
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.32)',
}

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
  marginBottom: '12px',
}

const headlineStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.6rem',
  lineHeight: 1.2,
  margin: 0,
  color: 'var(--fg)',
}

const subheadStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: '1rem',
  lineHeight: 1.5,
  marginTop: '12px',
  color: 'var(--fg-dim)',
}

const ctaRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column', // mobile: vertical stack
  gap: '12px',
  marginTop: '28px',
}

/**
 * Per-CTA button style. Variant selects which colour treatment is applied:
 * - `primary`: filled accent, conversion-target (Pro upgrade)
 * - `secondary`: outlined, supportive option (BYO key)
 * - `ghost`: text-only escape hatch (come back tomorrow)
 */
function ctaButtonStyle(variant: 'primary' | 'secondary' | 'ghost'): CSSProperties {
  const base: CSSProperties = {
    flex: 1,
    minHeight: '64px',
    padding: '14px 18px',
    borderRadius: '4px',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    transition: 'opacity 150ms, background 150ms',
  }
  if (variant === 'primary') {
    return {
      ...base,
      background: 'var(--accent, #b8956a)',
      color: 'var(--bg)',
      border: '1px solid var(--accent, #b8956a)',
    }
  }
  if (variant === 'secondary') {
    return {
      ...base,
      background: 'transparent',
      color: 'var(--fg)',
      border: '1px solid var(--hairline)',
    }
  }
  // ghost
  return {
    ...base,
    background: 'transparent',
    color: 'var(--fg-dim)',
    border: '1px solid transparent',
  }
}

const ctaTitleStyle: CSSProperties = {
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1.3,
}

const ctaSubtitleStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.06em',
  opacity: 0.8,
  lineHeight: 1.3,
}

/**
 * Free-tier exhaustion upsell modal. Renders on top of the /agora screen
 * after the 3rd-of-the-day cap is hit. Three CTAs, no internal state.
 */
export function UpsellModal({ onAddKey, onUpgrade, onDismiss }: UpsellModalProps) {
  const handleUpgrade = () => {
    onUpgrade(buildUpgradePayload())
  }

  return (
    <div
      data-testid="upsell-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-modal-headline"
      style={overlayStyle}
    >
      {/* Inline media query for mobile vs desktop CTA layout. Inline-styles
          can't carry @media queries, so we ship a tiny scoped stylesheet that
          only flips the flex-direction on viewports >= 720px. */}
      <style>{`
        @media (min-width: 720px) {
          [data-testid='upsell-modal'] [data-testid='upsell-cta-row'] {
            flex-direction: row !important;
          }
        }
      `}</style>

      <div style={dialogStyle}>
        <div style={eyebrowStyle}>Daily limit reached</div>

        <h2 id="upsell-modal-headline" style={headlineStyle}>
          {UPSELL_HEADLINE}
        </h2>

        <p style={subheadStyle}>{UPSELL_SUBHEAD}</p>

        <div data-testid="upsell-cta-row" style={ctaRowStyle}>
          <button
            type="button"
            data-testid="upsell-add-key"
            data-cta="add-key"
            onClick={onAddKey}
            style={ctaButtonStyle('secondary')}
          >
            <span style={ctaTitleStyle}>Add your Anthropic API key</span>
            <span style={ctaSubtitleStyle}>UNLIMITED · YOU PAY ANTHROPIC</span>
          </button>

          <button
            type="button"
            data-testid="upsell-upgrade"
            data-cta="upgrade"
            data-utm-campaign={TIER_EXHAUSTION_UTM_CAMPAIGN}
            onClick={handleUpgrade}
            style={ctaButtonStyle('primary')}
          >
            <span style={ctaTitleStyle}>Upgrade to Pro</span>
            <span style={ctaSubtitleStyle}>$30/MO · OPUS · 100 / MONTH</span>
          </button>

          <button
            type="button"
            data-testid="upsell-dismiss"
            data-cta="dismiss"
            onClick={onDismiss}
            style={ctaButtonStyle('ghost')}
          >
            <span style={ctaTitleStyle}>Come back tomorrow</span>
            <span style={ctaSubtitleStyle}>RESETS AT MIDNIGHT UTC</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpsellModal
