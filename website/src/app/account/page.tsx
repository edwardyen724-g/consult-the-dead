import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import { ApiKeySettings } from '@/components/ApiKeySettings'
import { getUsage } from '@/lib/agon/rateLimit'
import { maskApiKey } from '@/lib/api-key-mask'
import {
  PublicationSection,
  PublicationShell,
} from '../library/publication-surface'

export const metadata = { title: 'Account' }

const publicationPrimaryCtaLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '12px 24px',
  borderRadius: '999px',
  background: 'var(--amber)',
  color: 'var(--bg)',
  textDecoration: 'none',
}

const publicationSecondaryCtaLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '11px 20px',
  borderRadius: '999px',
  border: '1px solid var(--hairline)',
  color: 'var(--fg)',
  textDecoration: 'none',
  background: 'transparent',
}

const accountPanelStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.5fr) minmax(220px, 0.9fr)',
  gap: '20px',
  alignItems: 'start',
}

const accountCardStyle = {
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  padding: '18px',
  background: 'var(--surface)',
}

const accountMastheadStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--fg-dim)',
  margin: '0 0 10px',
}

const accountBodyStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem',
  lineHeight: 1.65,
  color: 'var(--fg-dim)',
  margin: 0,
}

const accountListStyle = {
  margin: '18px 0 0',
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gap: '10px',
}

const accountListItemStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--hairline)',
}

const accountListLabelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
  flex: '0 0 auto',
}

const accountListValueStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: 'var(--fg)',
}

const publicationNoticeStyle = {
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  padding: '14px 18px',
  marginBottom: '28px',
  background: 'var(--amber-wash)',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  lineHeight: 1.5,
  color: 'var(--amber)',
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const params = await searchParams
  const checkoutSuccess = params.checkout === 'success'

  const tier = user.publicMetadata?.subscription_tier as string | undefined
  const isPro = tier === 'pro'

  // Read the BYO Anthropic API key from Clerk privateMetadata and mask it
  // server-side. Only the masked string is shipped to the client; the raw
  // key never leaves the server. See /api/user/api-key/route.ts for the
  // write/delete sibling endpoints.
  const storedAnthropicKey =
    typeof user.privateMetadata?.anthropic_api_key === 'string'
      ? (user.privateMetadata.anthropic_api_key as string)
      : null
  const initialMaskedKey = storedAnthropicKey ? maskApiKey(storedAnthropicKey) : null

  const usage = await getUsage({ userId: user.id, isPro, ip: '0.0.0.0' })

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || email
  const usageSummary = `${usage.used}/${usage.limit} this ${usage.period}`
  const remainingSummary = usage.remaining > 0
    ? `${usage.remaining} debate${usage.remaining === 1 ? '' : 's'} remaining`
    : isPro
      ? 'Monthly cap reached'
      : 'Daily cap reached'
  const planHighlights = isPro
    ? [
        '100 agons per month',
        'Persistent library access',
        'Opus synthesis and PDF export',
      ]
    : [
        '3 agons per day',
        'Anonymous debates with no persistence',
        'Direct upgrade path when you need more',
      ]

  return (
    <PublicationShell
      eyebrow="Account"
      title={
        <>
          {displayName}
          {email && displayName !== email && (
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                marginTop: '8px',
              }}
            >
              {email}
            </span>
          )}
        </>
      }
      lead={
        isPro
          ? 'Manage your subscription, usage, and private key from one publication surface.'
          : 'Track free access, usage, and your API key before you upgrade.'
      }
      stats={[
        { label: 'Plan', value: isPro ? 'Pro access' : 'Free access' },
        { label: 'Usage', value: usageSummary },
        {
          label: 'Library',
          value: isPro ? 'Saved debates unlocked' : 'Upgrade to save debates',
        },
      ]}
      footerLinks={[
        { href: '/agora', label: 'Enter The Agora' },
        { href: '/library', label: 'Open Library' },
      ]}
    >
      {checkoutSuccess && (
        <div
          style={publicationNoticeStyle}
        >
          Welcome to Pro. Your subscription is active.
        </div>
      )}

      <PublicationSection
        eyebrow="Subscription"
        title={isPro ? 'Pro access active' : 'Free access active'}
        body={
          isPro
            ? 'Your billing, plan limits, and account handoff stay in one place.'
            : 'Your free plan stays visible here, with a direct path to Pro when the daily cap starts getting in the way.'
        }
        accent={isPro ? 'highlight' : 'default'}
      >
        <div style={accountPanelStyle}>
          <div>
            <p style={accountBodyStyle}>
              {isPro
                ? 'Pro includes the full publication system: 100 agons per month, up to 5 minds, Opus synthesis, persistent library access, and PDF export.'
                : 'Free keeps you moving with 3 agons per day, 2–3 minds, anonymous debates, and a clean upgrade path when you want the library to persist.'}
            </p>

            <ul style={accountListStyle}>
              {planHighlights.map((item) => (
                <li key={item} style={accountListItemStyle}>
                  <span style={accountListLabelStyle}>Included</span>
                  <span style={accountListValueStyle}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={accountCardStyle}>
            <p style={accountMastheadStyle}>Plan control</p>
            <p style={{ ...accountBodyStyle, marginBottom: '16px' }}>
              {isPro
                ? 'Open Stripe to update payment details or cancel.'
                : 'Upgrade to unlock the persistent library, stronger synthesis, and higher limits.'}
            </p>
            {isPro ? (
              <ManageSubscriptionButton />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/pricing"
                  style={publicationPrimaryCtaLinkStyle}
                >
                  Upgrade to Pro
                </Link>
                <Link
                  href="/pricing"
                  style={publicationSecondaryCtaLinkStyle}
                >
                  View pricing
                </Link>
              </div>
            )}
          </div>
        </div>
      </PublicationSection>

      <PublicationSection
        eyebrow="Usage"
        title="Quota window"
        body="Usage stays visible here so the account page follows the same compact decision rhythm as pricing and library."
      >
        <div
          style={{
            border: '1px solid var(--hairline)',
            borderRadius: '8px',
            padding: '16px',
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '12px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                margin: 0,
              }}
            >
              Current quota
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: usage.remaining <= 0 ? 'var(--red)' : 'var(--amber)',
                margin: 0,
              }}
            >
              {remainingSummary}
            </p>
          </div>
          <div
            style={{
              height: '7px',
              borderRadius: '999px',
              overflow: 'hidden',
              background: 'var(--bg)',
              border: '1px solid var(--hairline)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                background: usage.remaining <= 0 ? 'var(--red)' : 'var(--amber)',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p
            style={{
              ...accountBodyStyle,
              marginTop: '14px',
            }}
          >
            {usage.remaining > 0
              ? `${usage.remaining} debate${usage.remaining === 1 ? '' : 's'} remaining this ${usage.period}.`
              : isPro
                ? 'You have used all 100 debates this month. Your quota resets at the start of next month.'
                : 'You have used all 3 free debates today. Add your own API key for unlimited use, or check back tomorrow.'}
          </p>
        </div>
      </PublicationSection>

      <PublicationSection
        eyebrow="API key"
        title="Bring your own Anthropic key"
        body="Use your own Anthropic account for unlimited agons. The masked display lives here so the account and library surfaces share one operational hub."
      >
        <ApiKeySettings initialMaskedKey={initialMaskedKey} />
      </PublicationSection>
    </PublicationShell>
  )
}
