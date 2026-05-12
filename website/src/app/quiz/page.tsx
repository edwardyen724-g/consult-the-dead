import { getAllFrameworks } from "@/lib/frameworks";
import { QUIZ_ROUTE_GROUPS, buildQuizCouncilHref, buildQuizPackHref } from "@/lib/ctr-experiment";
import QuizFlow from "./QuizFlow";
import { buildQuizModel } from "./quiz-routing";

export const QUIZ_PAGE_COPY = {
  eyebrow: "Decision clarity first",
  headline: "Name the decision before you pick the council.",
  body: "Tell us what kind of choice you're facing and we'll route you to the council path most likely to disagree usefully.",
  routingHint: "The guided quiz narrows the room before it opens Agora.",
  guideHeading: "Route by decision type",
  guideBody: "Each path narrows to a best-fit pack before you reach the tension step.",
} as const

export const QUIZ_PAGE_ROUTE_GROUPS = QUIZ_ROUTE_GROUPS.map((group) => ({
  decisionType: group.decisionType,
  label: group.label,
  description: group.description,
  featuredPack: group.featuredPack,
  featuredPackHref: buildQuizPackHref(group.featuredPack.packId),
  routes: group.routes.map((route) => ({
    label: route.label,
    description: route.description,
    tagline: route.tagline,
    mindSlugs: route.mindSlugs,
    href: buildQuizCouncilHref(route.mindSlugs),
  })),
}));

export default function QuizPage() {
  const frameworks = getAllFrameworks();
  const quizModel = buildQuizModel(frameworks);

  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <section
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
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
          {QUIZ_PAGE_COPY.eyebrow}
        </p>
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.9fr)",
            alignItems: "start",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 14px",
                maxWidth: "12ch",
              }}
            >
              {QUIZ_PAGE_COPY.headline}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: "var(--fg-dim)",
                margin: "0 0 18px",
                maxWidth: "58ch",
              }}
            >
              {QUIZ_PAGE_COPY.body}
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "0.96rem",
                lineHeight: 1.6,
                color: "var(--fg-faint)",
                margin: 0,
                maxWidth: "54ch",
              }}
            >
              {QUIZ_PAGE_COPY.routingHint}
            </p>
          </div>

          <aside
            aria-label="Quiz route guide"
            style={{
              border: "1px solid var(--hairline)",
              background: "var(--surface)",
              padding: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
                margin: "0 0 10px",
              }}
            >
              {QUIZ_PAGE_COPY.guideHeading}
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.98rem",
                lineHeight: 1.65,
                color: "var(--fg-dim)",
                margin: "0 0 16px",
              }}
            >
              {QUIZ_PAGE_COPY.guideBody}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {QUIZ_PAGE_ROUTE_GROUPS.map((group) => (
                <div
                  key={group.decisionType}
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    paddingTop: "12px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                      margin: "0 0 6px",
                    }}
                  >
                    {group.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                      color: "var(--fg-dim)",
                      margin: "0 0 6px",
                    }}
                  >
                    {group.description}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--amber)",
                      margin: 0,
                    }}
                  >
                    Best-fit council: {group.featuredPack.name}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <QuizFlow quizModel={quizModel} />
    </div>
  );
}
