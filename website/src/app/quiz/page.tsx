'use client'

import Link from "next/link"
import { useState } from "react"
import {
  QUIZ_ROUTE_GROUPS,
  buildQuizCouncilHref,
  type QuizDecisionType,
  type QuizRouteGroup,
} from "@/lib/ctr-experiment"

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

type QuizRoute = QuizRouteGroup["routes"][number]

type QuizPageRoute = QuizRoute & {
  href: string
}

type QuizPageRouteGroup = Omit<QuizRouteGroup, "routes"> & {
  routes: readonly QuizPageRoute[]
}

const buildQuizPageRouteGroup = (group: QuizRouteGroup): QuizPageRouteGroup => ({
  decisionType: group.decisionType,
  label: group.label,
  description: group.description,
  routes: group.routes.map((route) => ({
    label: route.label,
    description: route.description,
    tagline: route.tagline,
    mindSlugs: route.mindSlugs,
    href: buildQuizCouncilHref(route.mindSlugs),
  })),
})

export const QUIZ_PAGE_ROUTE_GROUPS = QUIZ_ROUTE_GROUPS.map(buildQuizPageRouteGroup) as readonly QuizPageRouteGroup[]

export default function QuizPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [decisionType, setDecisionType] = useState<QuizDecisionType | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<QuizPageRoute | null>(null)

  const activeGroup = decisionType
    ? QUIZ_PAGE_ROUTE_GROUPS.find((group) => group.decisionType === decisionType) ?? null
    : null

  const handleDecisionType = (dt: QuizDecisionType) => {
    setDecisionType(dt)
    setSelectedRoute(null)
    setStep(1)
  }

  const handleRoute = (route: QuizPageRoute) => {
    setSelectedRoute(route)
    setStep(2)
  }

  const reset = () => {
    setStep(0)
    setDecisionType(null)
    setSelectedRoute(null)
  }

  return (
    <main style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "64px 24px 120px",
        }}
      >
        {/* Progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "48px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "2px",
                flex: 1,
                background: i <= step ? "var(--amber)" : "var(--hairline)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step 0: Decision type */}
        {step === 0 && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
                marginBottom: "16px",
              }}
            >
              Step 1 of 2
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "12px",
              }}
            >
              What kind of decision are you facing?
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "var(--fg-dim)",
                marginBottom: "40px",
                maxWidth: "50ch",
              }}
            >
              We&rsquo;ll match you with the minds who think most differently about this type of problem.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {QUIZ_PAGE_ROUTE_GROUPS.map((dt) => (
                <button
                  key={dt.decisionType}
                  onClick={() => handleDecisionType(dt.decisionType)}
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
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                    }}
                  >
                    {dt.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9rem",
                      color: "var(--fg-dim)",
                    }}
                  >
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
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
                marginBottom: "16px",
              }}
            >
              Step 2 of 2
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "12px",
              }}
            >
              What&rsquo;s the core tension?
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "var(--fg-dim)",
                marginBottom: "40px",
                maxWidth: "50ch",
              }}
            >
              Where you feel the most pull between two directions &mdash; that&rsquo;s where the right minds will disagree most usefully.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeGroup?.routes.map((route, i) => (
                <button
                  key={`${route.label}-${i}`}
                  onClick={() => handleRoute(route)}
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
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                    }}
                  >
                    {route.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9rem",
                      color: "var(--fg-dim)",
                    }}
                  >
                    {route.description}
                  </span>
                </button>
              ))}
            </div>

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
                marginTop: "24px",
                padding: "8px 0",
              }}
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* Step 2: Result */}
        {step === 2 && selectedRoute && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: "16px",
              }}
            >
              Your Council
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "8px",
              }}
            >
              We found your minds.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "var(--fg-dim)",
                marginBottom: "48px",
                maxWidth: "50ch",
              }}
            >
              {selectedRoute.tagline}
            </p>

            {/* Mind cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
              {selectedRoute.mindSlugs.map((slug) => (
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
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--fg)",
                        marginBottom: "2px",
                      }}
                    >
                      {MIND_NAMES[slug] ?? slug}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--fg-dim)",
                      }}
                    >
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
            <div
              style={{
                border: "1px solid var(--hairline)",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
                background: "var(--surface)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1.05rem",
                  color: "var(--fg-dim)",
                  margin: "0 0 20px",
                  lineHeight: 1.6,
                }}
              >
                Bring your question. These three will argue it from every angle &mdash; where they disagree is where your blind spots live.
              </p>
              <Link
                href={selectedRoute.href}
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
