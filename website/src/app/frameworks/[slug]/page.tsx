import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ALLOWED_SLUGS,
  SLUG_COLOR_VAR,
  getFramework,
  getValidation,
} from "@/lib/frameworks";
import type { FrameworkSlug } from "@/lib/frameworks";

/* ── Static generation ── */

export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

/* ── Metadata ── */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fw = getFramework(slug as FrameworkSlug);
  if (!fw) return { title: "Not Found" };
  return {
    title: `${fw.meta.person} \u2014 ${fw.meta.domain} \u2014 Consult The Dead`,
    description: fw.perceptual_lens.statement.slice(0, 160),
  };
}

/* ── Helpers ── */

const COL = "720px";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono uppercase"
      style={{
        fontSize: "11px",
        letterSpacing: "0.1em",
        color: "var(--fg-dim)",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

/* ── Page ── */

export default async function FrameworkDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (!ALLOWED_SLUGS.includes(slug as FrameworkSlug)) {
    notFound();
  }

  const fw = getFramework(slug as FrameworkSlug);
  if (!fw) notFound();

  const validation = getValidation(slug as FrameworkSlug);
  const color = SLUG_COLOR_VAR[slug as FrameworkSlug];

  // Pick incident-001
  const firstIncident = fw.incidents.find((i) => i.id === "incident-001") ??
    fw.incidents[0] ?? null;

  // Constructs: show up to 6
  const maxConstructs = 6;
  const shownConstructs = fw.bipolar_constructs.slice(0, maxConstructs);
  const remainingConstructs =
    fw.bipolar_constructs.length - maxConstructs;

  // Synthesize "Best For" from behavioral_divergence_predictions
  const bestForText = synthesizeBestFor(fw);

  // Validation line
  const validationLine = formatValidation(validation);

  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div
        style={{
          maxWidth: COL,
          margin: "0 auto",
          padding: "64px 24px 128px",
        }}
      >
        {/* Back link */}
        <Link
          href="/frameworks"
          className="font-mono uppercase"
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            textDecoration: "none",
          }}
        >
          &larr; The Frameworks
        </Link>

        {/* Name */}
        <h1
          className="font-mono uppercase"
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            letterSpacing: "0.04em",
            color: color,
            marginTop: "48px",
            lineHeight: 1.15,
          }}
        >
          {fw.meta.person}
        </h1>

        {/* Domain + era */}
        <div
          className="font-mono"
          style={{
            fontSize: "13px",
            color: "var(--fg-dim)",
            marginTop: "12px",
          }}
        >
          {fw.meta.domain} &middot; {fw.era}
        </div>

        {/* ──────── PERCEPTUAL LENS ──────── */}
        <section style={{ marginTop: "96px" }}>
          <SectionLabel>Perceptual Lens</SectionLabel>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: 1.6,
              maxWidth: "62ch",
            }}
          >
            {fw.perceptual_lens.statement}
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.55,
              color: "var(--fg-dim)",
              marginTop: "24px",
              maxWidth: "62ch",
            }}
          >
            <strong style={{ color: "var(--fg)", fontWeight: 500 }}>
              What they notice first:
            </strong>{" "}
            {fw.perceptual_lens.what_they_notice_first}
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.55,
              color: "var(--fg-dim)",
              marginTop: "16px",
              maxWidth: "62ch",
            }}
          >
            <strong style={{ color: "var(--fg)", fontWeight: 500 }}>
              What they ignore:
            </strong>{" "}
            {fw.perceptual_lens.what_they_ignore}
          </p>
        </section>

        {/* ──────── BIPOLAR CONSTRUCTS ──────── */}
        <section style={{ marginTop: "96px" }}>
          <SectionLabel>Constructs</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {shownConstructs.map((c, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "17px",
                    fontWeight: 500,
                    marginBottom: "12px",
                    maxWidth: "62ch",
                  }}
                >
                  {c.construct}
                </div>
                {/* Visual scale */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    maxWidth: "62ch",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "10px",
                      color: color,
                      letterSpacing: "0.02em",
                      minWidth: 0,
                      flex: "1 1 0",
                      textAlign: "left",
                    }}
                  >
                    {truncatePole(c.positive_pole, 60)}
                  </span>
                  <div
                    style={{
                      flex: "0 0 120px",
                      height: "1px",
                      background: "var(--hairline)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "-3px",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: color,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "10px",
                      color: "var(--fg-dim)",
                      letterSpacing: "0.02em",
                      minWidth: 0,
                      flex: "1 1 0",
                      textAlign: "right",
                    }}
                  >
                    {truncatePole(c.negative_pole, 60)}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "var(--fg-dim)",
                    marginTop: "10px",
                    maxWidth: "62ch",
                  }}
                >
                  {c.behavioral_implication}
                </p>
              </div>
            ))}
          </div>
          {remainingConstructs > 0 && (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                color: "var(--fg-dim)",
                marginTop: "24px",
                fontStyle: "italic",
              }}
            >
              and {remainingConstructs} more
            </p>
          )}
        </section>

        {/* ──────── ONE CRITICAL INCIDENT ──────── */}
        {firstIncident && (
          <section style={{ marginTop: "96px" }}>
            <SectionLabel>A Documented Incident</SectionLabel>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: "62ch",
              }}
            >
              {firstIncident.decision}
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                lineHeight: 1.55,
                color: "var(--fg-dim)",
                marginTop: "16px",
                maxWidth: "62ch",
              }}
            >
              {firstIncident.context}
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                lineHeight: 1.6,
                marginTop: "20px",
                maxWidth: "62ch",
              }}
            >
              {firstIncident.divergence_explanation}
            </p>
          </section>
        )}

        {/* ──────── BEST FOR ──────── */}
        {bestForText && (
          <section style={{ marginTop: "96px" }}>
            <SectionLabel>Best For</SectionLabel>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "17px",
                lineHeight: 1.6,
                maxWidth: "62ch",
              }}
            >
              {bestForText}
            </p>
          </section>
        )}

        {/* ──────── BLIND SPOTS ──────── */}
        {fw.blind_spots.length > 0 && (
          <section style={{ marginTop: "96px" }}>
            <SectionLabel>Known Limitations</SectionLabel>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {fw.blind_spots.map((bs, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "15px",
                    lineHeight: 1.55,
                    color: "var(--fg-dim)",
                    maxWidth: "62ch",
                    paddingLeft: "16px",
                    borderLeft: "2px solid var(--hairline)",
                  }}
                >
                  {bs.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ──────── VALIDATION ──────── */}
        {validationLine && (
          <section style={{ marginTop: "96px" }}>
            <SectionLabel>Validation</SectionLabel>
            <p
              className="font-mono"
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--fg-dim)",
                maxWidth: "62ch",
              }}
            >
              {validationLine}
            </p>
          </section>
        )}

        {/* ──────── FOOTER ──────── */}
        <div style={{ marginTop: "128px" }}>
          <a
            href={`https://github.com/edwardyen724-g/consult-the-dead/tree/master/frameworks/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: "12px",
              letterSpacing: "0.04em",
              color: "var(--fg-dim)",
              textDecoration: "none",
            }}
          >
            &rarr; View the raw framework on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Utility functions ── */

function truncatePole(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "\u2026";
}

function synthesizeBestFor(
  fw: NonNullable<ReturnType<typeof getFramework>>
): string | null {
  const preds = fw.behavioral_divergence_predictions;
  if (preds.length === 0) return null;

  // Extract situation types and synthesize
  const types = preds
    .slice(0, 5)
    .map((p) => p.situation_type.toLowerCase())
    .join("; ");

  // Build a readable summary by looking at the themes
  const person = fw.meta.person.split(" ").pop(); // Last name
  return `This framework is most useful when facing situations involving ${types}. Use ${person}\u2019s lens when you need to see what a conventional approach would miss in these domains.`;
}

function formatValidation(
  v: ReturnType<typeof getValidation>
): string | null {
  if (!v) return null;

  const scores = v.scenario_results.map((r) => r.divergence_score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  if (v.passed) {
    return `Tier 1: PASSED \u2014 ${v.divergent_count}/${v.total_scenarios} scenarios divergent (scores ${minScore}\u2013${maxScore})`;
  }

  return `Tier 1: Floor reached \u2014 framework content is methodologically sound but baseline expertise overlaps heavily with this figure\u2019s documented thinking.`;
}
