'use client'
import { SignUp } from '@clerk/nextjs'
import { useClerkUtmStamper } from '@/lib/use-clerk-utm-stamper'

export function SignUpClient() {
  useClerkUtmStamper()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'var(--bg)', padding: '24px',
      gap: '24px',
    }}>
      {/* Value proposition header — shown above the Clerk form so users
          understand what they're signing up for before they start typing. */}
      <div
        data-testid="signup-value-header"
        style={{ textAlign: 'center', maxWidth: '400px' }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            margin: '0 0 8px',
          }}
        >
          Consult The Dead
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            fontWeight: 400,
            color: 'var(--fg)',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}
        >
          Run your first agon — free
        </h1>
        <p
          className="font-mono"
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            color: 'var(--fg-dim)',
            margin: 0,
          }}
        >
          3 free debates per day · No credit card required
        </p>
      </div>
      <SignUp />
    </div>
  )
}
