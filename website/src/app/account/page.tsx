import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import { getUsage } from '@/lib/agon/rateLimit'

export const metadata = { title: 'Account' }

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

  const usage = await getUsage({ userId: user.id, isPro, ip: '0.0.0.0' })

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || email

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '72px 24px 120px' }}>

        {checkoutSuccess && (
          <div style={{
            border: '1px solid var(--amber)',
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '40px',
            background: 'var(--amber-wash)',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.95rem',
            color: 'var(--fg)',
          }}>
            Welcome to Pro. Your subscription is active.
          </div>
        )}

        <div style={{ marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            marginBottom: '12px',
          }}>
            Account
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            {displayName}
          </h1>
          {email && displayName !== email && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--fg-dim)',
              marginTop: '6px',
            }}>
              {email}
            </p>
          )}
        </div>

        {/* Subscription status */}
        <div style={{
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '48px',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
            }}>
              Plan
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: '3px',
              background: isPro ? 'var(--amber-wash)' : 'var(--surface)',
              color: isPro ? 'var(--amber)' : 'var(--fg-dim)',
            }}>
              {isPro ? '★ Pro' : 'Free'}
            </span>
          </div>

          <div style={{ padding: '24px' }}>
            {isPro ? (
              <>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.95rem',
                  color: 'var(--fg-dim)',
                  margin: '0 0 20px',
                  lineHeight: 1.6,
                }}>
                  You have full access to Agora Pro — 100 agons/month, up to 5 minds, Opus synthesis,
                  persistent library, and PDF export.
                </p>
                <ManageSubscriptionButton />
              </>
            ) : (
              <>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.95rem',
                  color: 'var(--fg-dim)',
                  margin: '0 0 20px',
                  lineHeight: 1.6,
                }}>
                  You're on the free plan — 3 agons per day, 2–3 minds, anonymous.
                </p>
                <Link
                  href="/pricing"
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    background: 'var(--amber)',
                    color: 'var(--bg)',
                    textDecoration: 'none',
                  }}
                >
                  Upgrade to Pro
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Usage meter */}
        <div style={{
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '48px',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
            }}>
              Usage
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: 'var(--fg-dim)',
            }}>
              {usage.used} / {usage.limit} this {usage.period}
            </span>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Progress bar */}
            <div style={{
              height: '6px',
              background: 'var(--surface)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                background: usage.remaining <= 0 ? 'var(--red)' : 'var(--amber)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.95rem',
              color: 'var(--fg-dim)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {usage.remaining > 0
                ? `${usage.remaining} debate${usage.remaining === 1 ? '' : 's'} remaining this ${usage.period}.`
                : isPro
                  ? 'You’ve used all 100 debates this month. Your quota resets at the start of next month.'
                  : 'You’ve used all 3 free debates today. Add your own API key for unlimited use, or check back tomorrow.'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/agora"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '10px 20px',
              border: '1px solid var(--hairline)',
              borderRadius: '4px',
              color: 'var(--fg)',
              textDecoration: 'none',
            }}
          >
            Enter The Agora
          </Link>
        </div>

      </div>
    </main>
  )
}

