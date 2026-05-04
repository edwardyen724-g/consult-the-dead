import type { Metadata } from "next";
import Link from "next/link";
import { getAllFrameworks, SLUG_COLOR_VAR } from "@/lib/frameworks";
import type { FrameworkSlug, Framework } from "@/lib/frameworks";
import { PACKS, getActivePackMembers } from "@/lib/packs";

export const metadata: Metadata = {
  title: "The Council — Consult The Dead",
  description:
    "Meet the minds. 18 decision-making frameworks extracted from documented historical incidents. Organized by theme — choose who argues your next decision.",
  robots: { index: false, follow: false },
};

/* ── Sample questions per mind (for "Try asking..." teasers) ── */
const SAMPLE_QUESTIONS: Record<string, string> = {
  "isaac-newton":
    "I have three product ideas — how do I eliminate two without testing all three?",
  "marie-curie":
    "How do I design an experiment to validate my riskiest assumption first?",
  "niccolo-machiavelli":
    "My co-founder wants to bring on a third partner — what's the power dynamic?",
  "nikola-tesla":
    "Should I patent my invention or open-source it for adoption?",
  "leonardo-da-vinci":
    "I'm stuck between two creative directions — how do I prototype both cheaply?",
  "sun-tzu":
    "Should I compete head-on with the market leader or find an uncontested niche?",
  "marcus-aurelius":
    "My business partner is underperforming — when does loyalty become a liability?",
  "benjamin-franklin":
    "I need buy-in from three skeptical stakeholders — what's my sequence?",
  "cicero":
    "How do I frame an unpopular decision so my team actually follows through?",
  "epictetus":
    "Everything is going wrong this quarter — what's actually within my control?",
  "thomas-edison":
    "I've failed at this 12 times — how do I know if I should pivot or persist?",
  "archimedes":
    "This problem feels impossible — am I framing it wrong?",
  "john-d-rockefeller":
    "I'm profitable but small — should I reinvest everything or take profit?",
  "harriet-tubman":
    "I need to execute a risky plan with unreliable people — how do I structure it?",
  "ada-lovelace":
    "I see a pattern across our failures — how do I turn that into a system?",
  "catherine-the-great":
    "I inherited a broken organization — what do I modernize first?",
  "alexander-the-great":
    "We need to move faster than our resources allow — where do I concentrate force?",
  "cleopatra-vii":
    "I'm negotiating from a weak position — how do I make them need me?",
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}

export default function FrameworksPage() {
  const frameworks = getAllFrameworks();
  const liveSlugs = new Set(frameworks.map((f) => f.slug));
  const fwMap = new Map<string, Framework>(frameworks.map((f) => [f.slug, f]));

  return (
    <main style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "64px 24px 120px",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "48px",
          }}
        >
          &larr; Consult The Dead
        </Link>

        {/* Eyebrow */}
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
          The Council
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          {frameworks.length} minds, extracted and validated.
        </h1>

        {/* Intro */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            margin: "0 0 72px",
            maxWidth: "55ch",
          }}
        >
          Each framework is built from documented critical decisions &mdash; not
          quotes, not style imitations. Choose a mind, bring your question, and
          see how they&rsquo;d actually think through it.
        </p>

        {/* Pack sections */}
        {PACKS.map((pack) => {
          const activeMembers = getActivePackMembers(pack, liveSlugs);
          if (activeMembers.length === 0) return null;

          return (
            <section key={pack.id} style={{ marginBottom: "72px" }}>
              {/* Pack header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "12px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: pack.colorVar,
                    fontWeight: 400,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pack.name}
                </h2>
                <div style={{ flex: 1, height: "1px", background: "var(--hairline)" }} />
              </div>

              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  color: "var(--fg-dim)",
                  margin: "0 0 24px",
                  maxWidth: "60ch",
                }}
              >
                {pack.description}
              </p>

              {/* Mind cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                {activeMembers.map((slug) => {
                  const fw = fwMap.get(slug);
                  if (!fw) return null;
                  const color = SLUG_COLOR_VAR[slug as FrameworkSlug];
                  const constructCount = fw.meta.construct_count ?? fw.bipolar_constructs.length;
                  const incidentCount = fw.meta.incident_count;
                  const lens = truncate(fw.perceptual_lens.statement, 100);
                  const sampleQ = SAMPLE_QUESTIONS[slug] ?? null;

                  return (
                    <div
                      key={slug}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--hairline)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        minHeight: "240px",
                      }}
                    >
                      {/* Portrait + name row (links to profile) */}
                      <Link
                        href={`/frameworks/${slug}`}
                        style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
                      >
                        <img
                          src={`/portraits/${slug}-portrait.png`}
                          alt={fw.meta.person}
                          width={44}
                          height={44}
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `1.5px solid ${color}`,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "11px",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: color,
                              fontWeight: 500,
                            }}
                          >
                            {fw.meta.person}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "9px",
                              color: "var(--fg-dim)",
                              marginTop: "2px",
                            }}
                          >
                            {fw.era}
                          </div>
                        </div>
                      </Link>

                      {/* Domain */}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--amber)",
                        }}
                      >
                        {fw.meta.domain}
                      </div>

                      {/* Lens statement */}
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.88rem",
                          lineHeight: 1.5,
                          color: "var(--fg-dim)",
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        {lens}
                      </p>

                      {/* Stats + profile link */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        <span style={{ color: "var(--fg-faint)" }}>
                          {constructCount} constructs &middot; {incidentCount} incidents
                        </span>
                        <Link
                          href={`/frameworks/${slug}`}
                          style={{
                            color: "var(--fg-dim)",
                            textDecoration: "none",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                        >
                          Profile &rarr;
                        </Link>
                      </div>

                      {/* Try asking teaser */}
                      {sampleQ && (
                        <Link
                          href={`/agora?mind=${slug}`}
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontStyle: "italic",
                            fontSize: "0.82rem",
                            lineHeight: 1.4,
                            color: "var(--fg)",
                            textDecoration: "none",
                            borderTop: "1px solid var(--hairline)",
                            paddingTop: "10px",
                            marginTop: "auto",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "8px",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "var(--fg-faint)",
                              fontStyle: "normal",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Try asking
                          </span>
                          &ldquo;{sampleQ}&rdquo; &rarr;
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "24px",
            }}
          >
            Ready to bring your own decision to the council?
          </p>
          <Link
            href="/agora"
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
            Enter The Agora &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
