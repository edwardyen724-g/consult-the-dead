'use client'

import { useState } from "react"
import Link from "next/link"

/* ── Routing matrix ──
   Q1 (decision type) → Q2 (tension) → recommended slugs
   Each path leads to 2–3 minds that complement each other.
*/

type DecisionType = "strategy" | "people" | "building" | "money" | "personal"

interface Tension {
  label: string
  description: string
  slugs: string[]
  tagline: string
}

const DECISION_TYPES: { id: DecisionType; label: string; description: string }[] = [
  { id: "strategy",  label: "Strategy & Competition",   description: "Market positioning, timing, competitive moves" },
  { id: "people",    label: "People & Power",           description: "Leadership, negotiation, influence, team dynamics" },
  { id: "building",  label: "Building & Creating",      description: "Product, invention, design, technical decisions" },
  { id: "money",     label: "Money & Growth",           description: "Investment, scaling, pricing, resource allocation" },
  { id: "personal",  label: "Personal & Values",        description: "Career, ethics, resilience, identity decisions" },
]

const TENSIONS: Record<DecisionType, Tension[]> = {
  strategy: [
    {
      label: "Attack or defend?",
      description: "Should I compete head-on or protect what I have?",
      slugs: ["sun-tzu", "alexander-the-great", "niccolo-machiavelli"],
      tagline: "The strategists who knew when to strike and when to wait.",
    },
    {
      label: "Move fast or move carefully?",
      description: "Timing is everything — but which direction?",
      slugs: ["sun-tzu", "cleopatra-vii", "benjamin-franklin"],
      tagline: "Three minds who mastered the art of timing.",
    },
    {
      label: "Compete or find a different game?",
      description: "Fight in the existing market or create a new one?",
      slugs: ["nikola-tesla", "sun-tzu", "john-d-rockefeller"],
      tagline: "The visionary, the strategist, and the empire builder.",
    },
  ],
  people: [
    {
      label: "Getting buy-in from skeptics",
      description: "I need people to follow a decision they disagree with.",
      slugs: ["cicero", "benjamin-franklin", "niccolo-machiavelli"],
      tagline: "The persuader, the diplomat, and the realist.",
    },
    {
      label: "Managing someone difficult",
      description: "A key person is underperforming, sabotaging, or checked out.",
      slugs: ["niccolo-machiavelli", "catherine-the-great", "marcus-aurelius"],
      tagline: "Power, governance, and the wisdom to know the difference.",
    },
    {
      label: "Leading through a crisis",
      description: "Everything is going wrong and people are looking at me.",
      slugs: ["harriet-tubman", "marcus-aurelius", "alexander-the-great"],
      tagline: "Three leaders who held steady when the stakes were highest.",
    },
  ],
  building: [
    {
      label: "Stuck between approaches",
      description: "Multiple paths forward but I can only pick one.",
      slugs: ["leonardo-da-vinci", "archimedes", "isaac-newton"],
      tagline: "The polymath, the problem-solver, and the first-principles thinker.",
    },
    {
      label: "Pivot or persist?",
      description: "It's not working yet — but is that a signal to change or push through?",
      slugs: ["thomas-edison", "marie-curie", "nikola-tesla"],
      tagline: "Three minds who knew the difference between failure and progress.",
    },
    {
      label: "How to build the system right",
      description: "I need to design something that scales and doesn't break.",
      slugs: ["ada-lovelace", "archimedes", "isaac-newton"],
      tagline: "Systems thinking from the people who invented it.",
    },
  ],
  money: [
    {
      label: "Reinvest everything or take profit?",
      description: "Growth vs. security — where's the line?",
      slugs: ["john-d-rockefeller", "benjamin-franklin", "catherine-the-great"],
      tagline: "The empire builder, the pragmatist, and the modernizer.",
    },
    {
      label: "A risky bet with big upside",
      description: "The opportunity is real but so is the downside.",
      slugs: ["cleopatra-vii", "nikola-tesla", "sun-tzu"],
      tagline: "Three minds who calculated risk differently than everyone else.",
    },
    {
      label: "Pricing and positioning",
      description: "How do I capture value without losing the market?",
      slugs: ["john-d-rockefeller", "niccolo-machiavelli", "cicero"],
      tagline: "Monopoly thinking, power dynamics, and persuasion.",
    },
  ],
  personal: [
    {
      label: "What's actually in my control?",
      description: "I'm overwhelmed and need to separate noise from signal.",
      slugs: ["epictetus", "marcus-aurelius", "harriet-tubman"],
      tagline: "The stoics and the woman who walked through impossible odds.",
    },
    {
      label: "Loyalty vs. self-interest",
      description: "Staying feels safe but leaving might be right.",
      slugs: ["marcus-aurelius", "niccolo-machiavelli", "benjamin-franklin"],
      tagline: "Duty, power, and pragmatism walk into a room.",
    },
    {
      label: "I need to reinvent myself",
      description: "Career shift, identity change, starting over.",
      slugs: ["catherine-the-great", "leonardo-da-vinci", "marie-curie"],
      tagline: "The modernizer, the polymath, and the pioneer.",
    },
  ],
}

/* ── Mind display data (minimal, no server dependency) ── */
const MIND_NAMES: Record<string, string> = {
  "isaac-newton": "Isaac Newton",
  "marie-curie": "Marie Curie",
  "niccolo-machiavelli": "Niccolò Machiavelli",
  "nikola-tesla": "Nikola Tesla",
  "leonardo-da-vinci": "Leonardo da Vinci",
  "sun-tzu": "Sun Tzu",
  "marcus-aurelius": "Marcus Aurelius",
  "benjamin-franklin": "Benjamin Franklin",
  "cicero": "Cicero",
  "epictetus": "Epictetus",
  "thomas-edison": "Thomas Edison",
  "archimedes": "Archimedes",
  "john-d-rockefeller": "John D. Rockefeller",
  "harriet-tubman": "Harriet Tubman",
  "ada-lovelace": "Ada Lovelace",
  "catherine-the-great": "Catherine the Great",
  "alexander-the-great": "Alexander the Great",
  "cleopatra-vii": "Cleopatra VII",
}

const MIND_DOMAINS: Record<string, string> = {
  "isaac-newton": "First Principles",
  "marie-curie": "Scientific Method",
  "niccolo-machiavelli": "Power Dynamics",
  "nikola-tesla": "Visionary Innovation",
  "leonardo-da-vinci": "Cross-Domain Design",
  "sun-tzu": "Strategic Warfare",
  "marcus-aurelius": "Stoic Leadership",
  "benjamin-franklin": "Pragmatic Negotiation",
  "cicero": "Rhetoric & Persuasion",
  "epictetus": "Radical Acceptance",
  "thomas-edison": "Iterative Innovation",
  "archimedes": "Problem Decomposition",
  "john-d-rockefeller": "Compound Growth",
  "harriet-tubman": "High-Stakes Risk",
  "ada-lovelace": "Systems Thinking",
  "catherine-the-great": "Institutional Reform",
  "alexander-the-great": "Decisive Action",
  "cleopatra-vii": "Strategic Leverage",
}

/* ── Component ── */

export default function QuizPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null)
  const [tension, setTension] = useState<Tension | null>(null)

  const handleDecisionType = (dt: DecisionType) => {
    setDecisionType(dt)
    setStep(1)
  }

  const handleTension = (t: Tension) => {
    setTension(t)
    setStep(2)
  }

  const reset = () => {
    setStep(0)
    setDecisionType(null)
    setTension(null)
  }

  return (
    <main style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}>
      <div style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "64px 24px 120px",
      }}>

        {/* Progress */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "48px",
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              height: "2px",
              flex: 1,
              background: i <= step ? "var(--amber)" : "var(--hairline)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Step 0: Decision type */}
        {step === 0 && (
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              marginBottom: "16px",
            }}>
              Step 1 of 2
            </p>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}>
              What kind of decision are you facing?
            </h1>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "40px",
              maxWidth: "50ch",
            }}>
              We&rsquo;ll match you with the minds who think most differently about this type of problem.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {DECISION_TYPES.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => handleDecisionType(dt.id)}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    padding: "20px 24px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--hairline)")}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--fg)",
                  }}>
                    {dt.label}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.9rem",
                    color: "var(--fg-dim)",
                  }}>
                    {dt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Tension */}
        {step === 1 && decisionType && (
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              marginBottom: "16px",
            }}>
              Step 2 of 2
            </p>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}>
              What&rsquo;s the core tension?
            </h1>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "40px",
              maxWidth: "50ch",
            }}>
              Where you feel the most pull between two directions &mdash; that&rsquo;s where the right minds will disagree most usefully.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {TENSIONS[decisionType].map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleTension(t)}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    padding: "20px 24px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--hairline)")}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--fg)",
                  }}>
                    {t.label}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.9rem",
                    color: "var(--fg-dim)",
                  }}>
                    {t.description}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(0)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginTop: "24px",
                padding: "8px 0",
              }}
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* Step 2: Result */}
        {step === 2 && tension && (
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--amber)",
              marginBottom: "16px",
            }}>
              Your Council
            </p>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}>
              We found your minds.
            </h1>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "48px",
              maxWidth: "50ch",
            }}>
              {tension.tagline}
            </p>

            {/* Mind cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
              {tension.slugs.map((slug) => (
                <div
                  key={slug}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <img
                    src={`/portraits/${slug}-portrait.png`}
                    alt={MIND_NAMES[slug] ?? slug}
                    width={52}
                    height={52}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid var(--amber)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                      marginBottom: "2px",
                    }}>
                      {MIND_NAMES[slug] ?? slug}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg-dim)",
                    }}>
                      {MIND_DOMAINS[slug] ?? ""}
                    </div>
                  </div>
                  <Link
                    href={`/frameworks/${slug}`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg-faint)",
                      textDecoration: "none",
                      marginLeft: "auto",
                      flexShrink: 0,
                    }}
                  >
                    Profile &rarr;
                  </Link>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{
              border: "1px solid var(--hairline)",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              background: "var(--surface)",
            }}>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "var(--fg-dim)",
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}>
                Bring your question. These three will argue it from every angle &mdash; where they disagree is where your blind spots live.
              </p>
              <Link
                href={`/agora`}
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "12px 28px",
                  background: "var(--amber)",
                  color: "var(--bg)",
                  textDecoration: "none",
                  borderRadius: "4px",
                }}
              >
                Start Your Debate &rarr;
              </Link>
            </div>

            {/* Restart */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={reset}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
