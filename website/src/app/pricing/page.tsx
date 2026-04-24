'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

const FEATURES = [
  { label: 'Agons per period',   free: '3 / day',       pro: '100 / month' },
  { label: 'Council size',       free: '2–3 minds',     pro: 'Up to 5 minds' },
  { label: 'Synthesis quality',  free: 'Sonnet',        pro: 'Opus ★' },
  { label: 'Debate library',     free: 'Device only',   pro: 'Persistent + searchable' },
  { label: 'PDF export',         free: '—',             pro: '✓' },
  { label: 'Extended research',  free: '—',             pro: '✓' },
  { label: 'Founder support',    free: '—',             pro: '48h email' },
  { label: 'Account',            free: 'Anonymous',     pro: 'Private, synced' },
]

const FAQ = [
  {
    q: 'What happens when I hit the free limit?',
    a: "You'll see a prompt to upgrade. Nothing gets deleted — your work stays. Upgrade anytime, or come back tomorrow for 3 more.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Monthly and yearly plans cancel at end of billing period. No refund for partial months, no hidden charges. Manage everything from your account page.',
  },
  {
    q: 'What model powers the debates?',
    a: 'Free uses Claude Sonnet for all turns. Pro uses Sonnet for debate rounds and Opus for the consensus synthesis — the final recommendation gets the strongest model.',
  },
  {
    q: 'Do I need an Anthropic account?',
    a: "No. We handle all AI calls. You don't manage API keys or pay Anthropic directly. Free users don't even need an account with us.",
  },
  {
    q: "What's \"founder support\"?",
    a: 'Direct email to Edward (the founder). 48-hour response. Real answers about the product, feature requests, decision-framing help. Not a template bot.',
  },
  {
    q: 'Is my data private?',
    a: "Free debates are anonymous — we don't store them. Pro debates live in your private library indefinitely. We don't train on your debates and don't sell data.",
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleProCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod: billing }),
      })
      if (res.status === 401) {
        router.push('/sign-in')
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  const monthlyDisplay = billing === 'annual' ? '$25' : '$30'
  const annualSavings = billing === 'annual'

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Get Better Counsel
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            color: 'var(--fg-dim)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Think through your hardest decisions with historical minds. Unbiased, rigorous, immediate.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', gap: '0' }}>
          <button
            onClick={() => setBilling('monthly')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '8px 20px',
              border: '1px solid var(--hairline)',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              background: billing === 'monthly' ? 'var(--fg)' : 'transparent',
              color: billing === 'monthly' ? 'var(--bg)' : 'var(--fg-dim)',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '8px 20px',
              border: '1px solid var(--hairline)',
              borderRadius: '0 4px 4px 0',
              background: billing === 'annual' ? 'var(--fg)' : 'transparent',
              color: billing === 'annual' ? 'var(--bg)' : 'var(--fg-dim)',
              cursor: 'pointer',
              transition: 'all 150ms',
              position: 'relative',
            }}
          >
            Annual
            {annualSavings && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-4px',
                background: 'var(--amber)',
                color: 'var(--bg)',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                padding: '2px 5px',
                borderRadius: '3px',
                textTransform: 'uppercase',
              }}>
                −2 mo
              </span>
            )}
          </button>
        </div>

        {/* Comparison table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '48px',
        }}>
          {/* Header row */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', background: 'rgba(255,255,255,0.02)' }} />
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            borderLeft: '1px solid var(--hairline)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: '6px' }}>
              Agora Free
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--fg)' }}>
              $0
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--fg-dim)', marginTop: '2px' }}>
              always free
            </div>
          </div>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            borderLeft: '1px solid var(--hairline)',
            background: 'var(--amber-wash)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'var(--amber)', color: 'var(--bg)',
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 6px', borderRadius: '3px',
            }}>
              ★ Pro
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>
              Agora Pro
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--fg)' }}>
              {monthlyDisplay}<span style={{ fontSize: '0.9rem', color: 'var(--fg-dim)' }}>/mo</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--fg-dim)', marginTop: '2px' }}>
              {billing === 'annual' ? 'billed $300/year' : 'billed monthly'}
            </div>
          </div>

          {/* Feature rows */}
          {FEATURES.map((f, i) => (
            <>
              <div key={`label-${i}`} style={{
                padding: '14px 24px',
                borderBottom: i < FEATURES.length - 1 ? '1px solid var(--hairline)' : undefined,
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--fg-dim)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {f.label}
              </div>
              <div key={`free-${i}`} style={{
                padding: '14px 24px',
                borderBottom: i < FEATURES.length - 1 ? '1px solid var(--hairline)' : undefined,
                borderLeft: '1px solid var(--hairline)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
                color: f.free === '—' ? 'var(--fg-dim)' : 'var(--fg)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {f.free}
              </div>
              <div key={`pro-${i}`} style={{
                padding: '14px 24px',
                borderBottom: i < FEATURES.length - 1 ? '1px solid var(--hairline)' : undefined,
                borderLeft: '1px solid var(--hairline)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
                color: 'var(--fg)',
                fontWeight: f.free === '—' ? 500 : 400,
                background: 'var(--amber-mist)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {f.pro}
              </div>
            </>
          ))}

          {/* CTA row */}
          <div style={{ padding: '24px', borderTop: '1px solid var(--hairline)', background: 'rgba(255,255,255,0.02)' }} />
          <div style={{ padding: '24px', borderTop: '1px solid var(--hairline)', borderLeft: '1px solid var(--hairline)', background: 'rgba(255,255,255,0.02)' }}>
            <a
              href="/agora"
              style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 16px',
                border: '1px solid var(--hairline)',
                borderRadius: '4px',
                color: 'var(--fg)',
                textDecoration: 'none',
                transition: 'border-color 150ms',
              }}
            >
              Start thinking — no signup
            </a>
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid var(--hairline)', borderLeft: '1px solid var(--hairline)', background: 'var(--amber-wash)' }}>
            <button
              onClick={handleProCheckout}
              disabled={loading}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 16px',
                borderRadius: '4px',
                background: 'var(--amber)',
                color: 'var(--bg)',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {loading ? 'Redirecting…' : 'Try Pro free for 7 days'}
            </button>
          </div>
        </div>

        {/* Founding member callout */}
        <div style={{
          border: '1px solid var(--amber)',
          borderRadius: '6px',
          padding: '20px 28px',
          marginBottom: '72px',
          background: 'var(--amber-mist)',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.95rem',
            color: 'var(--fg)',
            margin: 0,
            lineHeight: 1.65,
          }}>
            <strong style={{ color: 'var(--amber)' }}>Founding-member pricing.</strong>{' '}
            Early subscribers lock in <strong>$300/year for life</strong>. After Q3 2026, annual plans go to $360.
            Monthly stays at $30.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            marginBottom: '32px',
          }}>
            Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {FAQ.map((item, i) => (
              <div key={i}>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--fg)',
                  marginBottom: '8px',
                }}>
                  {item.q}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.95rem',
                  color: 'var(--fg-dim)',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1rem',
          fontStyle: 'italic',
          color: 'var(--fg-dim)',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          Good decisions are harder with unlimited options and no outside view. Agora is your sparring
          partner — not a therapist, not a calculator, not a consensus machine. Historical minds who've
          already thought through the problem you're facing, arguing it out on your behalf.
        </p>

      </div>
    </main>
  )
}
