"use client";

import Link from "next/link";
import { useState } from "react";

import { getPack } from "@/lib/packs";
import {
  buildHeroQuizRecommendation,
  HERO_QUIZ_QUESTIONS,
  type HeroQuizQuestion,
} from "@/lib/hero-quiz";

interface QuizChoiceProps {
  question: HeroQuizQuestion;
  onChoose: (optionId: string) => void;
}

function QuizChoices({ question, onChoose }: QuizChoiceProps) {
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {question.options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChoose(option.id)}
          style={{
            textAlign: "left",
            padding: "14px 16px",
            border: "1px solid var(--hairline)",
            borderRadius: "6px",
            background: "var(--surface)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {option.label}
          </div>
          <div
            style={{
              marginTop: "4px",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "0.92rem",
              color: "var(--fg-dim)",
              lineHeight: 1.5,
            }}
          >
            {option.description}
          </div>
        </button>
      ))}
    </div>
  );
}

export function HeroQuiz() {
  const [answerIds, setAnswerIds] = useState<string[]>([]);

  const recommendation =
    answerIds.length >= HERO_QUIZ_QUESTIONS.length
      ? buildHeroQuizRecommendation(answerIds)
      : null;

  const question =
    HERO_QUIZ_QUESTIONS[answerIds.length] ?? HERO_QUIZ_QUESTIONS[0];
  const pack = recommendation ? getPack(recommendation.packId) : null;
  const accent = pack?.colorVar ?? "var(--amber)";

  const onChoose = (optionId: string) => {
    const nextAnswerIds = [...answerIds, optionId].slice(
      0,
      HERO_QUIZ_QUESTIONS.length,
    );
    setAnswerIds(nextAnswerIds);
  };

  const reset = () => {
    setAnswerIds([]);
  };

  return (
    <aside
      aria-label="Quick council finder"
      style={{
        marginTop: "40px",
        border: "1px solid var(--hairline)",
        borderLeft: `3px solid ${accent}`,
        background: "var(--surface)",
        padding: "22px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              margin: 0,
            }}
          >
            Quick council finder
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(1.35rem, 3vw, 1.8rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "8px 0 0",
            }}
          >
            Not sure which council to start with?
          </h2>
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            color: "var(--fg-dim)",
            maxWidth: "42ch",
            margin: 0,
          }}
        >
          Answer three questions and we’ll suggest the council and opening CTA
          most likely to fit the problem.
        </p>
      </div>

      {!recommendation ? (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  height: "2px",
                  flex: 1,
                  background:
                    index <= answerIds.length ? "var(--amber)" : "var(--hairline)",
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              marginBottom: "10px",
            }}
          >
            Question {answerIds.length + 1} of {HERO_QUIZ_QUESTIONS.length}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "1.1rem",
              lineHeight: 1.35,
              margin: "0 0 8px",
            }}
          >
            {question.prompt}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--fg-dim)",
              margin: "0 0 16px",
            }}
          >
            {question.description}
          </p>
          <QuizChoices question={question} onChoose={onChoose} />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              margin: 0,
            }}
          >
            Suggested council
          </p>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "1.3rem",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {recommendation.headline}
            </h3>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "0.98rem",
                lineHeight: 1.55,
                color: "var(--fg-dim)",
              }}
            >
              {recommendation.supportingCopy}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <Link
              href={recommendation.ctaHref}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "12px 18px",
                background: accent,
                color: "var(--bg)",
                textDecoration: "none",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {recommendation.ctaLabel} →
            </Link>
            <button
              type="button"
              onClick={reset}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "11px 16px",
                border: "1px solid var(--hairline)",
                color: "var(--fg)",
                background: "transparent",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retake quiz
            </button>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              margin: 0,
            }}
          >
            {pack
              ? `${pack.name} · ${recommendation.category}`
              : recommendation.category}
          </p>
        </div>
      )}

    </aside>
  );
}
