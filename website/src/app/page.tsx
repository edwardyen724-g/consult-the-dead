import Link from "next/link";
import { getAllFrameworks, SLUG_COLOR_VAR, type FrameworkSlug } from "@/lib/frameworks";
import { MindCard } from "@/components/MindCard";
import { StreamingDemo } from "./worked-example";

const AGON_STEPS = [
  {
    n: "01",
    label: "Pose",
    body: "Describe the decision in plain language. No special framing required.",
  },
  {
    n: "02",
    label: "Research",
    body: "We pull current data from the web and surface the facts that bear on your question.",
  },
  {
    n: "03",
    label: "Agon",
    body: "The council debates across three rounds. Each mind challenges the others from its own framework.",
  },
  {
    n: "04",
    label: "Synthesis",
    body: "Consensus distilled into a concrete recommendation — with the dissent preserved.",
  },
] as const;

export default function HomePage() {
  const frameworks = getAllFrameworks();

  // Pull 4 minds for the hero cards
  const heroMinds = frameworks.slice(0, 4).map(f => ({
    name: f.meta.person,
    dates: f.era,
    lens: f.perceptual_lens.statement,
    colorVar: SLUG_COLOR_VAR[f.slug as FrameworkSlug],
    invocations: f.incidents.length * 47, // approximate from incident depth
  }));

  const totalMinds = frameworks.length;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '88px 24px 80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '64px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>

            {/* Left column */}
            <div style={{ flex: '1.4 1 340px', minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                marginBottom: '28px',
              }}>
                Consult The Dead
              </p>

              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                margin: 0,
              }}>
                Every AI gives<br />
                the same advice.{' '}
                <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>History doesn't.</em>
              </h1>

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                lineHeight: 1.6,
                color: 'var(--fg-dim)',
                marginTop: '28px',
                maxWidth: '52ch',
              }}>
                Machiavelli on the politics. Curie on the evidence. Sun Tzu on the terrain.
                Each mind argues from its own framework — where they disagree is where
                your blind spots live.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '40px' }}>
                <Link href="/agora" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  textDecoration: 'none',
                }}>
                  Enter The Agora — free
                </Link>
                <Link href="/essay" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: '1px solid var(--hairline)',
                  color: 'var(--fg-dim)',
                  textDecoration: 'none',
                }}>
                  Read the essay
                </Link>
              </div>
            </div>

            {/* Right column — mind card grid */}
            <div style={{
              flex: '1 1 260px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              minWidth: 0,
            }}>
              {heroMinds.map(m => (
                <MindCard key={m.name} {...m} size="sm" />
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            marginTop: '56px',
            paddingTop: '32px',
            borderTop: '1px solid var(--hairline)',
          }}>
            {[
              `${totalMinds} historical minds`,
              'Free to start — no signup',
              'Private by default',
              'Pro: Opus synthesis',
            ].map(stat => (
              <span key={stat} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
              }}>
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW AN AGON UNFOLDS ── */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '16px',
          }}>
            Method
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '56px',
          }}>
            How an Agon unfolds
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1px',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            {AGON_STEPS.map((step, i) => (
              <div key={step.n} style={{
                padding: '32px 28px',
                background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                borderRight: i < AGON_STEPS.length - 1 ? '1px solid var(--hairline)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: 'var(--amber)',
                  marginBottom: '16px',
                }}>
                  {step.n}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.1rem',
                  color: 'var(--fg)',
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--fg-dim)',
                }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ── */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '16px',
          }}>
            Worked example
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '48px',
          }}>
            See it run
          </h2>
          <StreamingDemo />
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        padding: '80px 24px 120px',
        borderTop: '1px solid var(--hairline)',
      }}>
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            What decision are you carrying?
          </h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            lineHeight: 1.65,
            color: 'var(--fg-dim)',
            marginBottom: '36px',
          }}>
            The council convenes immediately. No signup required. The first three agons are free.
          </p>
          <Link href="/agora" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '14px 32px',
            borderRadius: '4px',
            background: 'var(--amber)',
            color: 'var(--bg)',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Enter The Agora
          </Link>
        </div>
      </section>

    </div>
  )
}
