'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

type TierCard = {
  title: string
  eyebrow: string
  body: string
}

const TIERS: TierCard[] = [
  {
    title: 'Free',
    eyebrow: '3 agons a day',
    body: 'Start with the public Agora flow, quick enough for everyday decisions and zero setup.',
  },
  {
    title: 'BYO key',
    eyebrow: 'Unlimited on your own API key',
    body: 'Connect Anthropic once and keep the same branded experience while you use your own credits.',
  },
  {
    title: 'Pro',
    eyebrow: 'Unlimited with the full library',
    body: 'Unlock persistent history, higher limits, and the complete paid workflow for repeat use.',
  },
]

function TierCardView({ title, eyebrow, body }: TierCard) {
  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: '18px',
        padding: '18px 18px 20px',
        background: 'rgba(255,255,255,0.025)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          margin: '12px 0 8px',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.2rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          color: 'var(--fg-dim)',
          fontFamily: 'var(--font-serif)',
          fontSize: '0.98rem',
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  )
}

export function AuthLanding() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '28px 20px 48px',
        background:
          'radial-gradient(circle at top, rgba(201, 102, 78, 0.16), transparent 42%), linear-gradient(180deg, var(--bg-deep), var(--bg))',
        color: 'var(--fg)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
              }}
            >
              Consult The Dead
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.6rem)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              Sign in to return to the Agora.
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/agora"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '11px 16px',
                borderRadius: '999px',
                border: '1px solid var(--hairline)',
                color: 'var(--fg)',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              Back to Agora
            </Link>
            <Link
              href="/pricing"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '11px 16px',
                borderRadius: '999px',
                background: 'var(--amber)',
                color: 'var(--bg-deep)',
                textDecoration: 'none',
              }}
            >
              Compare tiers
            </Link>
          </div>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '28px',
              padding: '28px',
              background: 'rgba(255,255,255,0.02)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
            }}
          >
            <p
              style={{
                margin: '0 0 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
              }}
            >
              Keep your flow
            </p>
            <p
              style={{
                margin: '0 0 28px',
                maxWidth: '56ch',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'var(--fg-dim)',
              }}
            >
              Free users get 3 agons a day. Bring your own Anthropic key when you want to
              keep moving without a limit. Pro keeps the full library and paid workflow in the
              same visual language you already know.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {TIERS.map((tier) => (
                <TierCardView key={tier.title} {...tier} />
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--hairline)',
                paddingTop: '20px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                }}
              >
                Want to browse first? You can always jump back into the Agora.
              </p>
              <Link
                href="/agora"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--amber)',
                  textDecoration: 'none',
                }}
              >
                Open Agora →
              </Link>
            </div>
          </div>

          <aside
            style={{
              position: 'sticky',
              top: '24px',
              border: '1px solid var(--hairline)',
              borderRadius: '28px',
              padding: '22px',
              background: 'rgba(12, 8, 4, 0.55)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                }}
              >
                Sign in
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.98rem',
                  lineHeight: 1.6,
                  color: 'var(--fg-dim)',
                }}
              >
                Resume your saved debates, access Pro, or keep your BYO-key setup in one place.
              </p>
            </div>

            <div
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: '22px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/agora"
              />
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
