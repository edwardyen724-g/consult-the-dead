import Link from "next/link";
import { getAllFrameworks, SLUG_COLOR_VAR, type FrameworkSlug } from "@/lib/frameworks";
import { getActivePackMembers, getPacksForMind, PACKS } from "@/lib/packs";
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
    label: "Debate",
    body: "The council argues across three rounds. Each mind challenges the others from its own framework.",
  },
  {
    n: "04",
    label: "Synthesis",
    body: "Consensus distilled into a concrete recommendation — with the dissent preserved.",
  },
] as const;
export default function HomePage() {
  const frameworks = getAllFrameworks();
  const frameworkBySlug = new Map(frameworks.map((f) => [f.slug, f] as const));
  const liveSlugs: ReadonlySet<string> = new Set(frameworks.map((f) => f.slug));
  const totalMinds = frameworks.length;

  // Pull 3 featured minds for the hero — Sun Tzu, Machiavelli, Curie
  const FEATURED_SLUGS = ['sun-tzu', 'niccolo-machiavelli', 'marie-curie'];
  const heroMinds = FEATURED_SLUGS
    .map(slug => frameworks.find(f => f.slug === slug))
    .filter((f): f is NonNullable<typeof f> => !!f)
    .map(f => ({
      name: f.meta.person,
      slug: f.slug,
      dates: f.era,
      lens: f.perceptual_lens.statement,
      colorVar: SLUG_COLOR_VAR[f.slug as FrameworkSlug],
      invocations: f.incidents.length,
      packs: getPacksForMind(f.slug).map((p) => ({ name: p.name, colorVar: p.colorVar })),
    }));

  // Build pack cards with the live members of each pack.
  const packCards = PACKS.map((pack) => {
    const liveMembers = getActivePackMembers(pack, liveSlugs)
      .map((slug) => frameworkBySlug.get(slug as FrameworkSlug))
      .filter((f): f is NonNullable<typeof f> => !!f);
    return {      id: pack.id,
      name: pack.name,
      tagline: pack.tagline,
      description: pack.description,
      colorVar: pack.colorVar,
      members: liveMembers,
      totalRoster: pack.members.length,
    };
  }).filter((p) => p.members.length > 0);

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
                fontSize: '10px',                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--fg-faint)',
                marginBottom: '28px',
              }}>
                Established for the carrying of decisions
              </p>

              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                margin: 0,
              }}>
                You have a decision.<br />
                <em style={{ color: 'var(--red)', fontStyle: 'italic' }}>History has a council.</em>
              </h1>

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                lineHeight: 1.65,
                color: 'var(--fg-dim)',
                marginTop: '28px',
                maxWidth: '50ch',
              }}>
                Bring the question keeping you up. We seat {totalMinds} minds —                Machiavelli, Sun Tzu, Curie, and more — and let them argue it out on your behalf.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap', marginTop: '40px' }}>
                <Link href="/agora" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '14px 28px',
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  display: 'inline-block',
                }}>
                  Ask Your Question →
                </Link>
                <Link href="/quiz" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '14px 28px',
                  border: '1px solid var(--hairline)',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  display: 'inline-block',
                }}>
                  Not sure who to ask? →
                </Link>
              </div>
            </div>
            {/* Right column — 3 mind cards in a row */}
            <div style={{
              flex: '1 1 340px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              minWidth: 0,
            }}>
              {heroMinds.map((m) => (
                <MindCard key={m.name} {...m} size="sm" />
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            marginTop: '56px',
            paddingTop: '28px',
            borderTop: '1px solid var(--hairline)',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
            }}>
              No signup for your first debate · {totalMinds} minds in the corpus · {packCards.length} themed packs            </p>
          </div>
        </div>
      </section>

      {/* ── SIX COUNCILS / PACKS ── */}
      <section style={{
        padding: '96px 24px',
        borderTop: '1px solid var(--hairline)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              margin: 0,
            }}>
              The Six Councils
            </p>
            <Link href="/frameworks" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              textDecoration: 'none',
            }}>
              Browse all minds →            </Link>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginTop: '12px',
            marginBottom: '16px',
          }}>
            Pick a council. Or <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>build your own.</em>
          </h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--fg-dim)',
            margin: '0 0 48px',
            maxWidth: '60ch',
          }}>
            Each pack gathers minds with a shared instinct. Open one to seat
            everyone in it — or pick across packs to assemble your own table.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',          }}>
            {packCards.map((pack) => (
              <Link
                key={pack.id}
                href={`/agora?pack=${pack.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderLeft: `3px solid ${pack.colorVar}`,
                  borderRadius: 0,
                  padding: '28px 26px 22px',
                  textDecoration: 'none',
                  color: 'var(--fg)',
                  transition: 'border-color 200ms ease-out, background 200ms ease-out',
                  position: 'relative',
                  minHeight: '230px',
                }}
                className="gm-pack-card"
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: pack.colorVar,
                  marginBottom: '10px',
                }}>
                  {pack.members.length} of {pack.totalRoster} seated                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  marginBottom: '8px',
                  color: 'var(--fg)',
                }}>
                  {pack.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: 'var(--fg-dim)',
                  marginBottom: '20px',
                  flex: 1,
                }}>
                  {pack.tagline}
                </div>

                <div style={{
                  borderTop: '1px solid var(--hairline)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 10px',
                }}>                  {pack.members.map((m) => (
                    <span
                      key={m.slug}
                      className="font-mono uppercase"
                      style={{
                        fontSize: '9px',
                        letterSpacing: '0.1em',
                        color: SLUG_COLOR_VAR[m.slug as FrameworkSlug],
                      }}
                    >
                      {m.meta.person.split('(')[0].trim()}
                    </span>
                  ))}
                </div>

                <div style={{
                  marginTop: '14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: pack.colorVar,
                }}>
                  Enter the pack →
                </div>
              </Link>
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
            How a debate unfolds
          </h2>

          <div className="gm-steps-grid" style={{
            display: 'grid',
            gap: '1px',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
            overflow: 'hidden',          }}>
            <style>{`
              .gm-steps-grid { grid-template-columns: repeat(4, 1fr); }
              @media (max-width: 768px) { .gm-steps-grid { grid-template-columns: 1fr !important; } }
            `}</style>
            {AGON_STEPS.map((step, i) => (
              <div key={step.n} style={{
                padding: '32px 28px',
                background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                borderBottom: i < AGON_STEPS.length - 1 ? '1px solid var(--hairline)' : 'none',
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
                </div>                <div style={{
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
            fontWeight: 400,            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '48px',
          }}>
            See it run
          </h2>
          <StreamingDemo />
        </div>
      </section>

      {/* ── BROWSE SECTION ── */}
      <section style={{
        padding: '72px 24px',
        borderTop: '1px solid var(--hairline)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <Link href="/debates" style={{
            flex: '1 1 280px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            padding: '28px 26px',
            textDecoration: 'none',            color: 'var(--fg)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              marginBottom: '10px',
            }}>
              30 Sample Debates
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              lineHeight: 1.4,
              marginBottom: '8px',
            }}>
              Read how the council argues
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              color: 'var(--fg-dim)',
              flex: 1,
            }}>
              Hypothetical decisions debated across three rounds by historical minds.
            </div>            <div style={{
              marginTop: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
            }}>
              Browse debates →
            </div>
          </Link>

          <Link href="/frameworks" style={{
            flex: '1 1 280px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            padding: '28px 26px',
            textDecoration: 'none',
            color: 'var(--fg)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              marginBottom: '10px',
            }}>
              {totalMinds} Frameworks            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              lineHeight: 1.4,
              marginBottom: '8px',
            }}>
              Meet the council
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              color: 'var(--fg-dim)',
              flex: 1,
            }}>
              Each mind&rsquo;s decision-making framework, extracted from documented historical incidents.
            </div>
            <div style={{
              marginTop: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
            }}>
              Browse the council →
            </div>
          </Link>
        </div>
      </section>
      {/* ── FAQ ── */}
      <section style={{
        padding: '96px 24px',
        borderTop: '1px solid var(--hairline)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: '16px',
          }}>
            Common questions
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '48px',
          }}>
            Before you ask the council
          </h2>

          {([
            {              q: 'Is this just ChatGPT with a costume?',
              a: 'No. Each mind runs on a cognitive framework extracted from documented historical decisions using the Critical Decision Method — the same technique used in military and aviation research. The council doesn\'t generate generic "what would X say" — it applies specific constructs that made each thinker\'s decisions distinctive.',
            },
            {
              q: 'What kinds of questions work best?',
              a: 'Strategic dilemmas where reasonable people disagree. Pricing decisions, market entry timing, whether to pivot, how to handle a difficult negotiation. The more specific and real your situation, the more useful the debate.',
            },
            {
              q: 'How is this different from just reading their books?',
              a: 'Books give you their conclusions. We extracted their decision-making patterns — the cognitive dimensions they actually weighed when the stakes were real. You get their reasoning process applied to your specific situation, not a famous quote.',
            },
            {
              q: 'Is my question private?',
              a: 'Yes. Your debates are stored in your personal library and never shared or used for training. You can export or delete them at any time.',
            },
            {
              q: 'What does free include?',
              a: 'Three full debates with up to three minds each. No signup required for your first debate. Pro unlocks unlimited debates, larger councils, PDF exports, and priority processing.',
            },          ] as const).map((faq, i) => (
            <div key={i} style={{
              borderTop: '1px solid var(--hairline)',
              padding: '24px 0',
            }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.05rem',
                lineHeight: 1.4,
                color: 'var(--fg)',
                marginBottom: '10px',
              }}>
                {faq.q}
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.92rem',
                lineHeight: 1.65,
                color: 'var(--fg-dim)',
              }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        padding: '80px 24px 120px',
        borderTop: '1px solid var(--hairline)',      }}>
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
            The council convenes immediately. No signup required. Your first three debates are free.
          </p>
          <Link href="/agora" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',            textTransform: 'uppercase',
            padding: '14px 32px',
            borderRadius: '4px',
            background: 'var(--amber)',
            color: 'var(--bg)',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Ask Your Question →
          </Link>
        </div>
      </section>

    </div>
  )
}
