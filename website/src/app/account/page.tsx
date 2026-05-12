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

const publicationCtaLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '12px 24px',
  borderRadius: '999px',
  background: 'var(--amber)',
  color: 'var(--bg)',
  textDecoration: 'none',
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
  const usageSummary = `${usage.used} / ${usage.limit} this ${usage.period}`

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
          : 'Track your free access, daily usage, and API key settings before you upgrade.'
      }
      stats={[
        { label: 'Plan', value: isPro ? 'Pro' : 'Free' },
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
        title={isPro ? 'Pro access' : 'Free access'}
        body={
          isPro
            ? 'You have full access to Agora Pro: 100 agons per month, up to 5 minds, Opus synthesis, persistent library access, and PDF export.'
            : 'You are on the free plan: 3 agons per day, 2–3 minds, anonymous debates, and a direct upgrade path.'
        }
        accent={isPro ? 'highlight' : 'default'}
      >
        {isPro ? <ManageSubscriptionButton /> : (
          <Link
            href="/pricing"
            style={publicationCtaLinkStyle}
          >
            Upgrade to Pro
          </Link>
        )}
      </PublicationSection>

      <PublicationSection
        eyebrow="Usage"
        title="Debate quota"
        body="Your current quota is tracked here so the free and Pro surfaces present the same decision rhythm."
      >
        <div
          style={{
            height: '6px',
            background: 'var(--surface)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
              background: usage.remaining <= 0 ? 'var(--red)' : 'var(--amber)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.95rem',
            color: 'var(--fg-dim)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {usage.remaining > 0
            ? `${usage.remaining} debate${usage.remaining === 1 ? '' : 's'} remaining this ${usage.period}.`
            : isPro
              ? 'You have used all 100 debates this month. Your quota resets at the start of next month.'
              : 'You have used all 3 free debates today. Add your own API key for unlimited use, or check back tomorrow.'}
        </p>
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
