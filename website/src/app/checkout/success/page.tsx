import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Welcome to Pro',
  robots: { index: false, follow: false },
}

export const ONBOARDING_STEPS: {
  label: string
  detail: string
  href: string
  cta: string
}[] = [
  {
    label: 'Start your first unlimited agon',
    detail:
      'As a Pro member you have 100 agons/month, a full 5-mind council, and Opus for the final synthesis.',
    href: '/agora',
    cta: 'Open the Agora →',
  },
  {
    label: 'Explore Pro-only frameworks',
    detail:
      'Steve Jobs, Nassim Taleb, and advanced council configurations are unlocked for your account.',
    href: '/frameworks',
    cta: 'Browse frameworks →',
  },
  {
    label: 'Check your persistent library',
    detail:
      'Every agon you run is now saved privately to your library — searchable and exportable to PDF.',
    href: '/library',
    cta: 'View your library →',
  },
]

export default async function CheckoutSuccessPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const firstName = user.firstName ?? null
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Pro confirmation banner */}
        <div
          data-testid="pro-confirmation"
          style={{
            border: '1px solid var(--amber)',
            borderRadius: '8px',
            padding: '28px 32px',
            marginBottom: '48px',
            background: 'var(--amber-wash)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            margin: '0 0 12px',
          }}>
            ★ Pro — Active
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--fg)',
            margin: '0 0 16px',
          }}>
            {firstName ? `Welcome to Pro, ${firstName}.` : 'You\'re now Pro.'}
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            color: 'var(--fg-dim)',
            lineHeight: 1.65,
            margin: 0,
          }}>
            Your subscription is active
            {email ? ` and linked to ${email}` : ''}.{' '}
            Opus synthesis, 100 agons/month, a full 5-mind council, persistent
            library, and PDF export are all unlocked.
          </p>
        </div>

        {/* Onboarding checklist */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '24px',
          }}>
            Get started
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ONBOARDING_STEPS.map((step, i) => (
              <div
                key={step.label}
                data-testid={`onboarding-step-${i}`}
                style={{
                  border: '1px solid var(--hairline)',
                  borderRadius: '6px',
                  padding: '20px 24px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--fg-faint)',
                      paddingTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'var(--fg)',
                      margin: '0 0 6px',
                      lineHeight: 1.4,
                    }}>
                      {step.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.9rem',
                      color: 'var(--fg-dim)',
                      lineHeight: 1.6,
                      margin: '0 0 10px',
                    }}>
                      {step.detail}
                    </p>
                    <Link
                      href={step.href}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--amber)',
                        textDecoration: 'none',
                      }}
                    >
                      {step.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary first-agon CTA */}
        <div style={{
          textAlign: 'center',
          padding: '40px 0 0',
          borderTop: '1px solid var(--hairline)',
        }}>
          <Link
            href="/agora"
            data-testid="first-agon-cta"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '14px 32px',
              borderRadius: '4px',
              background: 'var(--amber)',
              color: 'var(--bg)',
              textDecoration: 'none',
            }}
          >
            Start your first Pro agon →
          </Link>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginTop: '16px',
          }}>
            Or{' '}
            <Link
              href="/account"
              style={{ color: 'var(--fg-dim)', textDecoration: 'underline' }}
            >
              visit your account page
            </Link>{' '}
            to manage your subscription.
          </p>
        </div>

      </div>
    </main>
  )
}
