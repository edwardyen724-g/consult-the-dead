'use client'

import { useState } from "react"
import Link from "next/link"
import type { QuizDecisionType, QuizModel, QuizTension } from "./quiz-routing"

interface QuizFlowProps {
  quizModel: QuizModel
}

export default function QuizFlow({ quizModel }: QuizFlowProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [decisionType, setDecisionType] = useState<QuizDecisionType | null>(null)
  const [tension, setTension] = useState<QuizTension | null>(null)

  const activeDecision = decisionType
    ? quizModel.decisionTypes.find((option) => option.id === decisionType) ?? null
    : null

  const handleDecisionType = (dt: QuizDecisionType) => {
    setDecisionType(dt)
    setTension(null)
    setStep(1)
  }

  const handleTension = (selectedTension: QuizTension) => {
    setTension(selectedTension)
    setStep(2)
  }

  const reset = () => {
    setStep(0)
    setDecisionType(null)
    setTension(null)
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "48px",
          }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                height: "2px",
                flex: 1,
                background: index <= step ? "var(--amber)" : "var(--hairline)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

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
              {quizModel.decisionTypes.map((dt) => (
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "var(--amber)"
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "var(--hairline)"
                  }}
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

        {step === 1 && activeDecision && (
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
              {activeDecision.tensions.map((selectedTension) => (
                <button
                  key={selectedTension.label}
                  onClick={() => handleTension(selectedTension)}
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "var(--amber)"
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "var(--hairline)"
                  }}
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
                    {selectedTension.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9rem",
                      color: "var(--fg-dim)",
                    }}
                  >
                    {selectedTension.description}
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

        {step === 2 && tension && (
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
              {tension.tagline}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
              {tension.slugs.map((slug) => {
                const mind = quizModel.mindsBySlug[slug]

                return (
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
                      alt={mind?.name ?? slug}
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
                        {mind?.name ?? slug}
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
                        {mind?.domain ?? ""}
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
                )
              })}
            </div>

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
                href={`/agora?minds=${tension.slugs.join(",")}`}
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
