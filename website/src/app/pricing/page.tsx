'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  formatPricingStats,
  PRICING_STATS_DEFAULT,
} from '@/lib/pricing/stats'

/**
 * Social-proof debate scenario cards (marketing brief 22ee79de §Part 2).
 * Anonymized debate topics + council composition harvested from
 * docs/outreach-debates/. No attribution — only the decision and the council.
 */
const SOCIAL_PROOF: { topic: string; council: string }[] = [
  {
    topic:
      'Should I keep competing on price at $18K MRR, or reposition as premium before the market locks me in?',
    council: 'Machiavelli · Curie · Sun Tzu',
  },
  {
    topic:
      'I built a product in a half-day hackathon. It’s at $20K MRR. Should I rebuild the fragile codebase or keep shipping?',
    council: 'da Vinci · Curie · Sun Tzu',
  },
  {
    topic:
      'Open-source project at 13K stars. Just launched a paid product on top of it. The community feels betrayed. What do I do?',
    council: 'Aurelius · Machiavelli · Curie',
  },
]

const FEATURES: { label: string; free: string; pro: string }[] = [
  { label: 'Agons per period',   free: '3 / day',                 pro: '100 / month' },
  { label: 'Council size',       free: '2–3 minds',               pro: 'Up to 5 minds' },
  { label: 'Synthesis quality',  free: 'Sonnet',                  pro: 'Opus ★' },
  { label: 'Debate library',     free: 'Device only',             pro: 'Persistent + searchable' },
  { label: 'PDF export',         free: '—',                       pro: '✓' },
  { label: 'Extended research',  free: '—',                       pro: '✓' },
  { label: 'Bring your own key', free: 'Unlimited (you pay Anthropic)', pro: 'Optional override' },
  { label: 'Founder support',    free: '—',                       pro: '48h email' },
  { label: 'Account',            free: 'Anonymous',               pro: 'Private, synced' },
]

const FAQ: { q: string; a: string }[] = [
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
    a: "Not for the default flow — we handle the AI calls and billing on Free and Pro, so you don't need an Anthropic account or API key. If you'd rather pay Anthropic directly and skip our limits, you can plug in your own key (see below). Free users don't need an account with us either.",
  },
  {
    q: 'Can I use my own Anthropic API key (BYO key)?',
    a: "Yes, on any tier. Open /agora, expand 'your own anthropic key (optional)' on the topic screen, and paste your sk-ant-… key. The key is stored only in your browser's localStorage and forwarded as the request's x-api-key header — we never write it to server logs or our database. Using your own key bypasses the free-tier daily cap, so you get unlimited debates for as long as your Anthropic account has credit. Pro subscribers can use a BYO key too if they want to spend their own quota on heavy days.",
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

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '20px',
          }}>
            Pricing
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.12,
            marginBottom: '20px',
          }}>
            Run your hardest decision through 26 historical minds.
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>They&apos;ll disagree. You&apos;ll decide.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.1rem',
            color: 'var(--fg-dim)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Three rounds. One consensus. No consultants, no waiting, no calendar invite.
          </p>

          {/* Stats counter row (marketing brief §Part 4 Variant A — static) */}
          <div
            data-testid="pricing-stats"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginTop: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
            }}
          >
            {formatPricingStats(PRICING_STATS_DEFAULT).map((label, i, arr) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
                {label}
                {i < arr.length - 1 && (
                  <span aria-hidden="true" style={{ color: 'var(--hairline)' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Social-proof debate scenario strip (marketing brief §Part 2) */}
        <div
          aria-label="Real debate scenarios from the Agora library"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {SOCIAL_PROOF.map((s) => (
            <div
              key={s.topic}
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: '6px',
                padding: '16px 18px',
                background: 'var(--surface)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.92rem',
                color: 'var(--fg)',
                lineHeight: 1.5,
                margin: 0,
                marginBottom: '10px',
              }}>
                &ldquo;{s.topic}&rdquo;
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                margin: 0,
              }}>
                {s.council}
              </p>
            </div>
          ))}
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', border: '1px solid var(--hairline)', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setBilling('monthly')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '9px 22px',
                border: 'none',
                borderRight: '1px solid var(--hairline)',
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
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '9px 22px',
                border: 'none',
                background: billing === 'annual' ? 'var(--fg)' : 'transparent',
                color: billing === 'annual' ? 'var(--bg)' : 'var(--fg-dim)',
                cursor: 'pointer',
                transition: 'all 150ms',
                position: 'relative',
              }}
            >
              Annual
              {billing === 'annual' && (
                <span style={{
                  position: 'absolute',
                  top: '-9px',
                  right: '-6px',
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  fontSize: '8px',
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
        </div>

        {/* Comparison table */}
        <div style={{
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '40px',
        }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div style={{
              padding: '22px 24px',
              borderBottom: '1px solid var(--hairline)',
              borderRight: '1px solid var(--hairline)',
              background: 'var(--surface)',
            }} />
            <div style={{
              padding: '22px 24px',
              borderBottom: '1px solid var(--hairline)',
              borderRight: '1px solid var(--hairline)',
              background: 'var(--surface)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                marginBottom: '8px',
              }}>
                Agora Free
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                fontWeight: 400,
                color: 'var(--fg)',
                lineHeight: 1,
              }}>
                $0
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: 'var(--fg-faint)',
                marginTop: '4px',
              }}>
                always free
              </div>
            </div>
            <div style={{
              padding: '22px 24px',
              borderBottom: '1px solid var(--hairline)',
              background: 'var(--amber-wash)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'var(--amber)',
                color: 'var(--bg)',
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '3px 7px',
                borderRadius: '3px',
              }}>
                ★ Pro
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--amber)',
                marginBottom: '8px',
              }}>
                Agora Pro
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                fontWeight: 400,
                color: 'var(--fg)',
                lineHeight: 1,
              }}>
                {monthlyDisplay}
                <span style={{ fontSize: '1rem', color: 'var(--fg-dim)', fontWeight: 400 }}>/mo</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: 'var(--fg-faint)',
                marginTop: '4px',
              }}>
                {billing === 'annual' ? 'billed $300/year' : 'billed monthly'}
              </div>
            </div>
          </div>

          {/* Feature rows */}
          {FEATURES.map((f, i) => {
            const isLast = i === FEATURES.length - 1
            return (
              <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div style={{
                  padding: '13px 24px',
                  borderBottom: isLast ? 'none' : '1px solid var(--hairline)',
                  borderRight: '1px solid var(--hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: 'var(--fg-dim)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {f.label}
                </div>
                <div style={{
                  padding: '13px 24px',
                  borderBottom: isLast ? 'none' : '1px solid var(--hairline)',
                  borderRight: '1px solid var(--hairline)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.95rem',
                  color: f.free === '—' ? 'var(--fg-faint)' : 'var(--fg)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {f.free}
                </div>
                <div style={{
                  padding: '13px 24px',
                  borderBottom: isLast ? 'none' : '1px solid var(--hairline)',
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
              </div>
            )
          })}

          {/* CTA row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--hairline)' }}>
            <div style={{
              padding: '20px 24px',
              borderRight: '1px solid var(--hairline)',
              background: 'var(--surface)',
            }} />
            <div style={{
              padding: '20px 24px',
              borderRight: '1px solid var(--hairline)',
              background: 'var(--surface)',
            }}>
              <a
                href="/agora"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '11px 16px',
                  border: '1px solid var(--hairline)',
                  borderRadius: '4px',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                }}
              >
                Start thinking — no signup
              </a>
            </div>
            <div style={{ padding: '20px 24px', background: 'var(--amber-wash)' }}>
              <button
                onClick={handleProCheckout}
                disabled={loading}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '11px 16px',
                  borderRadius: '4px',
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 150ms',
                }}
              >
                {loading ? 'Redirecting…' : 'Start 7-day Pro trial — Opus + Library'}
              </button>
            </div>
          </div>
        </div>

        {/* Founding member callout */}
        <div style={{
          border: '1px solid var(--hairline)',
          borderLeft: '3px solid var(--amber)',
          borderRadius: '0 6px 6px 0',
          padding: '20px 24px',
          marginBottom: '64px',
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
            Early subscribers lock in <strong>$300/year for life</strong>. After Q3 2026,
            annual plans go to $360. Monthly stays at $30.
          </p>
        </div>

        {/* Founder note (marketing brief §Part 1 Variant A) */}
        <figure style={{
          margin: '0 0 64px',
          padding: '24px 28px',
          borderLeft: '2px solid var(--fg-faint)',
          background: 'var(--surface)',
          borderRadius: '0 6px 6px 0',
        }}>
          <blockquote style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            color: 'var(--fg)',
            lineHeight: 1.7,
            margin: 0,
            fontStyle: 'italic',
          }}>
            &ldquo;I built Agora because I kept making decisions alone that should
            have had a better sounding board. Not a chatbot that agrees with me — an
            actual disagreement. Machiavelli telling me the plan is naïve. Curie
            asking what I haven&apos;t measured. I&apos;m offering lifetime pricing
            now because I want the people who find it early to be the founding
            community that shapes where it goes.&rdquo;
          </blockquote>
          <figcaption style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginTop: '14px',
          }}>
            — Edward, founder
          </figcaption>
        </figure>

        {/* FAQ */}
        <div style={{ marginBottom: '80px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '32px',
          }}>
            Questions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                padding: '24px 0',
                borderTop: '1px solid var(--hairline)',
              }}>
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
            <div style={{ borderTop: '1px solid var(--hairline)' }} />
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
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          Good decisions are harder with unlimited options and no outside view.
          Agora is your sparring partner — not a therapist, not a calculator,
          not a consensus machine. Historical minds who&apos;ve already thought
          through the problem you&apos;re facing, arguing it out on your behalf.
        </p>

      </div>
    </main>
  )
}
