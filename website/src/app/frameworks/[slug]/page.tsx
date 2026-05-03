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
import { getPacksForMind } from "@/lib/packs";

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
  const title = `${fw.meta.person} — ${fw.meta.domain} Decision Framework`;
  const description = `How ${fw.meta.person} would approach your decision. Cognitive framework extracted via the Critical Decision Method from ${fw.meta.incident_count} documented historical incidents.`;
  return {
    title,
    description,
    openGraph: {
      title: `${fw.meta.person} — ${fw.meta.domain} | Consult The Dead`,
      description,
      url: `https://www.consultthedead.com/frameworks/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${fw.meta.person} — ${fw.meta.domain}`,
      description,
    },
  };
}

/* ── Helpers ── */

const COL = "720px";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
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
  const packs = getPacksForMind(slug);

  const constructCount = fw.meta.construct_count ?? fw.bipolar_constructs.length;
  const incidentCount = fw.meta.incident_count;

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
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
          }}
        >
          &larr; The Council
        </Link>

        {/* Portrait + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "48px" }}>
          <img
            src={`/portraits/${slug}.webp`}
            alt={fw.meta.person}
            width={80}
            height={80}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${color}`,
            }}
          />
          <div>
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(24px, 4vw, 36px)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: color,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              {fw.meta.person}
            </h1>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--fg-dim)",
                marginTop: "6px",
              }}
            >
              {fw.meta.domain} &middot; {fw.era}
            </div>
          </div>
        </div>

        {/* Pack memberships */}
        {packs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
            {packs.map((p) => (
              <span
                key={p.id}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  border: `1px solid ${p.colorVar}`,
                  borderRadius: "3px",
                  color: p.colorVar,
                }}
              >
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* ──────── PERCEPTUAL LENS ──────── */}
        <section style={{ marginTop: "72px" }}>
          <SectionLabel>How They See the World</SectionLabel>
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
        </section>

        {/* ──────── DEPTH INDICATORS ──────── */}
        <section style={{ marginTop: "72px" }}>
          <SectionLabel>Framework Depth</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2rem",
                  color: color,
                  marginBottom: "4px",
                }}
              >
                {constructCount}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                Constructs
              </div>
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2rem",
                  color: color,
                  marginBottom: "4px",
                }}
              >
                {incidentCount}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                Incidents Analyzed
              </div>
            </div>
            {fw.blind_spots.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "2rem",
                    color: color,
                    marginBottom: "4px",
                  }}
                >
                  {fw.blind_spots.length}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                  }}
                >
                  Blind Spots Mapped
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ──────── WHAT MAKES THEM DIFFERENT ──────── */}
        <section style={{ marginTop: "72px" }}>
          <SectionLabel>What Makes This Mind Different</SectionLabel>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              maxWidth: "62ch",
            }}
          >
            This framework was extracted from {incidentCount} documented critical
            decisions in {fw.meta.person}&rsquo;s life using the Critical Decision
            Method. It captures the {constructCount} cognitive dimensions they
            actually used to navigate high-stakes choices &mdash; the patterns
            invisible to people who only read their biography.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              marginTop: "16px",
              maxWidth: "62ch",
            }}
          >
            When you bring a question to {fw.meta.person.split(" ")[0]}, they
            don&rsquo;t give generic advice. They apply these constructs to your
            specific situation &mdash; noticing what others miss, ignoring what
            others fixate on.
          </p>
        </section>

        {/* ──────── VALIDATION ──────── */}
        {validationLine && (
          <section style={{ marginTop: "72px" }}>
            <SectionLabel>Validation</SectionLabel>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "var(--fg-dim)",
                maxWidth: "62ch",
              }}
            >
              {validationLine}
            </p>
          </section>
        )}

        {/* ──────── CTA ──────── */}
        <div
          style={{
            marginTop: "96px",
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
              fontSize: "1.05rem",
              fontStyle: "italic",
              color: "var(--fg-dim)",
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            The best way to understand a framework is to use it.
            Bring your decision &mdash; {fw.meta.person.split(" ")[0]} argues differently every time.
          </p>
          <Link
            href={`/agora?mind=${slug}`}
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
            Consult {fw.meta.person.split(" ")[0]} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Utility functions ── */

function formatValidation(
  v: ReturnType<typeof getValidation>
): string | null {
  if (!v) return null;

  const scores = v.scenario_results.map((r) => r.divergence_score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  if (v.passed) {
    return `Tier 1 validated — ${v.divergent_count}/${v.total_scenarios} holdout scenarios produced divergent responses (scores ${minScore}–${maxScore}). This framework demonstrably thinks differently from a generic advisor.`;
  }

  return `Tier 1: Methodologically sound — framework content is well-extracted but baseline expertise overlaps with this figure's documented thinking in some scenarios.`;
}
