'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  formatPricingStats,
  type PricingStats,
} from '@/lib/pricing/stats'
import {
  FREE_AGONS_PER_DAY,
  PRO_AGONS_PER_MONTH,
  PRO_MONTHLY_PRICE,
} from '@/lib/pricing/pricing-constants'

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
  { label: 'Agons per period',   free: `${FREE_AGONS_PER_DAY} / day`,           pro: `${PRO_AGONS_PER_MONTH} / month` },
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
    a: "You'll see a prompt to upgrade to Pro or add your own key. Nothing gets deleted — your work stays. Upgrade anytime, add BYO key for unlimited debates, or come back tomorrow for 3 more.",
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
    a: 'Direct email to Edward (the founder). 48-hour email response. Real answers about the product, feature requests, decision-framing help. Not a template bot.',
  },
  {
    q: 'Is my data private?',
    a: "Free debates are anonymous — we don't store them. Pro debates live in your private library indefinitely. We don't train on your debates and don't sell data.",
  },
]

const DEMO_SLOT = {
  label: 'Demo slot',
  headline: 'A short Loom can live here, or this can become the first customer case study.',
  body:
    'Use this space for a 60-90 second walkthrough that shows one real decision in motion, then swap in a proof block once the first customer story is ready.',
  placeholderLabel: 'Embed-ready frame',
  placeholderBody: 'Loom embed or customer callout',
}

function parsePricingStatsPatch(value: unknown): Partial<PricingStats> | null {
  if (typeof value !== 'object' || value === null) return null
  const stats = value as Record<string, unknown>
  const numericKeys: (keyof PricingStats)[] = ['minds', 'debatesInLibrary', 'agonsRun']
  const patch: Partial<PricingStats> = {}

  for (const key of numericKeys) {
    const current = stats[key as string]
    if (current === undefined) continue
    if (typeof current !== 'number' || !Number.isFinite(current)) return null
    patch[key] = current
  }

  return Object.keys(patch).length > 0 ? patch : null
}

export interface PricingClientProps {
  initialStats: PricingStats
}

export default function PricingClient({ initialStats }: PricingClientProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<PricingStats>(initialStats)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const patch = parsePricingStatsPatch(data)
        if (!patch) return
        setStats((prev) => ({ ...prev, ...patch }))
      })
      .catch(() => {
        /* silently degrade — the server-seeded stats remain visible */
      })
  }, [])

  async function handleProCheckout() {
    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const utm_campaign = params.get('utm_campaign') ?? undefined
      const utm_content = params.get('utm_content') ?? undefined

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod: billing, utm_campaign, utm_content }),
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

  const monthlyDisplay = billing === 'annual' ? '$25' : `$${PRO_MONTHLY_PRICE}`
  const proCtaLabel = loading
    ? 'Redirecting to checkout…'
    : 'Start 7-day Pro trial'
  const proCtaSubtext =
    'Checkout unlocks Opus, the persistent library, PDF export, deeper research, and a short demo slot for the first customer story.'

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
            Run your hardest decision through 18 historical minds.
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

          {/* Stats counter row */}
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
            {formatPricingStats(stats).map((label, i, arr) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
                {label}
                {i < arr.length - 1 && (
                  <span aria-hidden="true" style={{ color: 'var(--hairline)' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Tier strip */}
        <div
          aria-label="Pricing tiers overview"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '18px 18px 16px',
              background: 'var(--surface)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
              marginBottom: '10px',
            }}>
              Free
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              color: 'var(--fg)',
              lineHeight: 1.55,
              margin: 0,
              marginBottom: '10px',
            }}>
              Always free. 3 agons per day, no signup, Sonnet for the full debate.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
            }}>
              Open, anonymous, no card required.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '18px 18px 16px',
              background: 'linear-gradient(180deg, var(--surface-2), var(--surface))',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--amber) 25%, transparent)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              margin: 0,
              marginBottom: '10px',
            }}>
              BYO key
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              color: 'var(--fg)',
              lineHeight: 1.55,
              margin: 0,
              marginBottom: '10px',
            }}>
              Unlimited debates with your own Anthropic key. Still free tier, still no signup.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
            }}>
              Useful if you want to keep your own quota and skip our limit.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '18px 18px 16px',
              background: 'var(--surface)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
              marginBottom: '10px',
            }}>
              Pro
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              color: 'var(--fg)',
              lineHeight: 1.55,
              margin: 0,
              marginBottom: '10px',
            }}>
              7-day trial, then {monthlyDisplay}/mo annual or $30/mo monthly. Opus, persistent library, PDF, and deeper research.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
            }}>
              Best for people who are already using the product weekly.
            </p>
          </div>
        </div>

        {/* Pricing controls */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <button
              onClick={() => setBilling('monthly')}
              style={{
                border: '1px solid var(--hairline)',
                background: billing === 'monthly' ? 'var(--ink)' : 'transparent',
                color: billing === 'monthly' ? 'var(--surface)' : 'var(--fg)',
                borderRadius: '999px',
                padding: '8px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              style={{
                border: '1px solid var(--hairline)',
                background: billing === 'annual' ? 'var(--ink)' : 'transparent',
                color: billing === 'annual' ? 'var(--surface)' : 'var(--fg)',
                borderRadius: '999px',
                padding: '8px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Annual
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
              gap: '16px',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                padding: '24px',
                background: 'var(--surface)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                margin: 0,
                marginBottom: '12px',
              }}>
                Pro plan
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.4rem, 7vw, 4rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  {billing === 'annual' ? '$25' : '$30'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                }}>
                  /mo
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                color: 'var(--fg-dim)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {billing === 'annual'
                  ? 'Billed $300/year. Save two months off the monthly rate.'
                  : 'Billed monthly. Cancel anytime at the end of a billing period.'}
              </p>
            </div>

            <div
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                padding: '24px',
                background: 'var(--surface-2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--amber)',
                  margin: 0,
                  marginBottom: '12px',
                }}>
                  One-click upgrade
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  color: 'var(--fg)',
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: '16px',
                }}>
                  {proCtaSubtext}
                </p>
              </div>
              <button
                onClick={handleProCheckout}
                disabled={loading}
                style={{
                  width: '100%',
                  border: '1px solid var(--ink)',
                  background: loading ? 'var(--ink)' : 'var(--amber)',
                  color: loading ? 'var(--surface)' : 'var(--ink)',
                  borderRadius: '999px',
                  padding: '14px 18px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {proCtaLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div
          data-testid="pro-cta-trust-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            marginBottom: '24px',
            border: '1px solid var(--hairline)',
            borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
          }}
        >
          <span aria-hidden="true">★</span>
          Used by indie hackers, founders, and researchers
        </div>

        {/* Founding-member urgency */}
        <div
          data-testid="founding-member-notice"
          style={{
            marginBottom: '56px',
            padding: '16px 20px',
            border: '1px solid var(--hairline)',
            borderRadius: '8px',
            background: 'var(--surface-2)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            margin: 0,
            marginBottom: '8px',
          }}>
            Founding-member pricing
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.98rem',
            lineHeight: 1.6,
            color: 'var(--fg)',
            margin: 0,
          }}>
            Annual subscribers lock in <strong>$300/year for life</strong> — the current rate. After Q3 2026, the annual plan increases to $360/year. Monthly stays at $30/month. Anyone who subscribes on the annual plan before Q3 2026 keeps the founding-member pricing permanently.
          </p>
        </div>

        {/* Demo / case-study slot */}
        <section
          data-testid="pricing-demo-slot"
          aria-label="Product demo slot"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(220px, 0.85fr)',
            gap: '16px',
            alignItems: 'stretch',
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '20px',
              background: 'var(--surface)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--amber)',
                margin: 0,
                marginBottom: '12px',
              }}
            >
              {DEMO_SLOT.label}
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1.35,
                color: 'var(--fg)',
                margin: 0,
                marginBottom: '12px',
              }}
            >
              {DEMO_SLOT.headline}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.98rem',
                lineHeight: 1.65,
                color: 'var(--fg-dim)',
                margin: 0,
              }}
            >
              {DEMO_SLOT.body}
            </p>
          </div>

          <div
            style={{
              border: '1px dashed var(--hairline)',
              borderRadius: '8px',
              padding: '20px',
              background: 'var(--surface-2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '190px',
              gap: '8px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                margin: 0,
              }}
            >
              {DEMO_SLOT.placeholderLabel}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--fg)',
                margin: 0,
              }}
            >
              {DEMO_SLOT.placeholderBody}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                margin: 0,
              }}
            >
              Keep the proof concrete: one decision, one result, one reason to keep reading.
            </p>
          </div>
        </section>

        {/* Social proof strip */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '16px',
          }}>
            Real decisions people are asking Agora to help with
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {SOCIAL_PROOF.map((card) => (
              <div
                key={card.topic}
                style={{
                  border: '1px solid var(--hairline)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--surface)',
                }}
              >
                <p style={{
                  margin: 0,
                  marginBottom: '8px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  lineHeight: 1.55,
                  color: 'var(--fg)',
                }}>
                  {card.topic}
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                }}>
                  {card.council}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.6rem',
            fontWeight: 400,
            marginBottom: '24px',
          }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'grid', gap: '18px' }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{
                paddingBottom: '18px',
                borderBottom: '1px solid var(--hairline)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  margin: 0,
                  marginBottom: '8px',
                  color: 'var(--fg)',
                }}>
                  {q}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  color: 'var(--fg-dim)',
                  margin: 0,
                }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature matrix */}
        <div style={{
          borderTop: '1px solid var(--hairline)',
          paddingTop: '32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.6rem',
            fontWeight: 400,
            marginBottom: '18px',
          }}>
            What&apos;s included
          </h2>
          <div style={{
            border: '1px solid var(--hairline)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: '12px',
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--hairline)',
                  background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.98rem',
                    color: 'var(--fg)',
                  }}>{feature.label}</p>
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-dim)',
                  }}>{feature.free}</p>
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                  }}>{feature.pro}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
