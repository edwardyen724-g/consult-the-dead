import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Framework, FrameworkSlug } from "@/lib/frameworks";
import { SLUG_COLOR_VAR } from "@/lib/frameworks";
import {
  getInsightEntry,
  getInsightFrameworks,
  getInsightPublishedAt,
  getInsightUrl,
  INSIGHT_ENTRIES,
  isCollisionInsightEntry,
} from "@/lib/insights";

/* ── Reading-time estimate ── */
function readingTime(texts: string[]): string {
  const words = texts.join(" ").trim().split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  return `${mins} min read`;
}

/* ── Static generation ── */

export function generateStaticParams() {
  return INSIGHT_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

/* ── Metadata ── */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getInsightEntry(slug);
  if (!entry) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const url = getInsightUrl(slug);
  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.targetKeywords,
    openGraph: {
      title: entry.title,
      description: entry.description,
      url,
      type: "article",
      siteName: "Consult The Dead",
    },
    twitter: {
      card: "summary",
      title: entry.title,
      description: entry.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

/* ── Page ── */

const COL = "720px";

export default async function InsightPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getInsightEntry(slug);
  if (!entry) notFound();

  const frameworks = getInsightFrameworks(entry);
  if (frameworks.length === 0) notFound();
  if (isCollisionInsightEntry(entry) && frameworks.length < 2) notFound();

  const publishedAt = getInsightPublishedAt(entry).toISOString();
  const person = frameworks[0]?.meta.person ?? entry.frameworkSlug;
  const primary = frameworks[0] as Framework;
  const secondary = frameworks[1] as Framework | undefined;
  const primaryAccent =
    SLUG_COLOR_VAR[primary.slug as FrameworkSlug] ?? "var(--amber)";
  const rt = readingTime([entry.description, entry.hookQuestion]);
  const jsonLd = buildArticleJsonLd(
    entry.title,
    entry.description,
    slug,
    publishedAt,
    entry.updatedAt,
    entry.targetKeywords,
    entry.decisionType,
  );

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "80px 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header style={{ marginBottom: 48 }}>
          {/* Breadcrumb */}
          <p style={eyebrowStyle}>
            <Link href="/insights" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>
              INSIGHTS
            </Link>
            {" / "}
            <span style={{ textTransform: "uppercase" }}>{person}</span>
          </p>

          {/* ── Framework-profile hero panel ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "20px",
              alignItems: "start",
              padding: "20px 24px",
              border: `1px solid ${primaryAccent}`,
              borderRadius: 10,
              background: "var(--surface)",
              marginBottom: 32,
            }}
          >
            {/* Portrait icon */}
            <img
              src={`/portraits/${primary.slug}-portrait.png`}
              alt={primary.meta.person}
              width={56}
              height={56}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${primaryAccent}`,
                flexShrink: 0,
              }}
            />

            {/* Profile info */}
            <div>
              {/* Mind name + domain */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <Link
                  href={`/frameworks/${primary.slug}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: primaryAccent,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  {primary.meta.person}
                </Link>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-faint)",
                    padding: "2px 7px",
                    border: "1px solid var(--hairline)",
                    borderRadius: 99,
                  }}
                >
                  {primary.meta.domain}
                </span>
                {isCollisionInsightEntry(entry) && secondary && (
                  <>
                    <span style={{ color: "var(--fg-faint)", fontSize: 11 }}>vs.</span>
                    <Link
                      href={`/frameworks/${secondary.slug}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: accentForSlug(secondary.slug as FrameworkSlug),
                        fontWeight: 500,
                        textDecoration: "none",
                      }}
                    >
                      {secondary.meta.person}
                    </Link>
                  </>
                )}
              </div>

              {/* 2-sentence excerpt from perceptual lens */}
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--fg-dim)",
                  margin: "0 0 10px",
                }}
              >
                {/* Show first 2 sentences of the perceptual lens statement */}
                {primary.perceptual_lens.statement
                  .split(/(?<=[.!?])\s+/)
                  .slice(0, 2)
                  .join(" ")}
              </p>

              {/* Meta row: decision type + reading time */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={pillStyle}>{entry.decisionType}</span>
                <time dateTime={publishedAt} style={dateStyle}>
                  {formatPublishedDate(publishedAt)}
                </time>
                <span style={{ ...dateStyle, color: "var(--fg-faint)" }}>·</span>
                <span style={dateStyle}>{rt}</span>
              </div>
            </div>
          </div>

          {/* Title — h1 preserved for SEO */}
          <h1 style={titleStyle}>{entry.title}</h1>
          <p style={hookStyle}>{entry.hookQuestion}</p>
          <p style={introStyle}>{entry.description}</p>
        </header>

        {isCollisionInsightEntry(entry) ? (
          <>
            <p style={sectionLabelStyle}>Collision Article</p>
            <p style={introStyle}>
              This piece compares {primary.meta.person} and {secondary?.meta.person ?? person} on
              the same question. The goal is not to flatten the disagreement, but to show where
              each mind treats the cost differently.
            </p>

            <section style={compareGridStyle}>
              <FrameworkPanel framework={primary} accent={accentForSlug(primary.slug)} />
              {secondary && (
                <FrameworkPanel framework={secondary} accent={accentForSlug(secondary.slug)} />
              )}
            </section>

            <Section label="Where They Diverge">
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <DivergenceRow
                  label={`${primary.meta.person} first`}
                  accent={accentForSlug(primary.slug)}
                  text={primary.perceptual_lens.statement}
                />
                {secondary && (
                  <DivergenceRow
                    label={`${secondary.meta.person} first`}
                    accent={accentForSlug(secondary.slug)}
                    text={secondary.perceptual_lens.statement}
                  />
                )}
                <DivergenceRow
                  label="Collision highlight"
                  accent="var(--amber)"
                  text={`One side treats the problem as a governance decision; the other treats it as an evidence problem. That split is the article's core signal.`}
                />
              </div>
            </Section>

            <Section label="What A Reader Should Notice">
              <p style={prose}>
                {primary.meta.person} and {secondary?.meta.person ?? person} are not just
                disagreeing about speed. They are disagreeing about what kind of problem this is.
              </p>
              <ul style={bulletListStyle}>
                <li>{primary.meta.person} pushes toward irreversible action.</li>
                {secondary && <li>{secondary.meta.person} pushes toward empirical calibration.</li>}
                <li>The winning move comes from knowing which framework is seeing the hidden cost.</li>
              </ul>
            </Section>
          </>
        ) : (
          <>
            <Section label={`How ${person.toUpperCase()} Sees The World`}>
              <p style={prose}>{primary.perceptual_lens.statement}</p>
              <div style={twoColStyle}>
                <div>
                  <p style={labelStyle}>What They Notice First</p>
                  <p style={smallProse}>{primary.perceptual_lens.what_they_notice_first}</p>
                </div>
                <div>
                  <p style={labelStyle}>What They Ignore</p>
                  <p style={smallProse}>{primary.perceptual_lens.what_they_ignore}</p>
                </div>
              </div>
            </Section>

            {primary.bipolar_constructs.slice(0, 4).length > 0 && (
              <Section label="The Decision Dimensions">
                <p style={prose}>
                  {person} evaluates decisions along these bipolar dimensions. Where you fall on
                  each axis shapes the answer.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
                  {primary.bipolar_constructs.slice(0, 4).map((c, i) => (
                    <div key={i} style={cardStyle}>
                      <p style={cardTitleStyle}>{c.construct}</p>
                      <p style={{ ...smallProse, marginBottom: 8 }}>
                        <span style={{ color: "var(--amber)" }}>{c.positive_pole}</span>
                        {" vs. "}
                        <span style={{ color: "var(--fg-dim)" }}>{c.negative_pole}</span>
                      </p>
                      <p style={smallProse}>{c.behavioral_implication}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {primary.behavioral_divergence_predictions.slice(0, 3).length > 0 && (
              <Section label={`Where ${person.toUpperCase()} Would Disagree With Conventional Wisdom`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {primary.behavioral_divergence_predictions.slice(0, 3).map((p, i) => (
                    <div key={i} style={cardStyle}>
                      <p style={labelStyle}>{p.situation_type}</p>
                      {(p.conventional_response || p.ordinary_response) && (
                        <p style={smallProse}>
                          <strong>Conventional:</strong> {p.conventional_response || p.ordinary_response}
                        </p>
                      )}
                      <p style={{ ...smallProse, color: "var(--fg)", marginTop: 4 }}>
                        <strong>{person}:</strong> {p.framework_response}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {primary.blind_spots.slice(0, 2).length > 0 && (
              <Section label="The Blind Spots">
                <p style={prose}>
                  Every framework has gaps. Knowing where {person}&rsquo;s reasoning breaks down is
                  as important as knowing where it excels.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                  {primary.blind_spots.slice(0, 2).map((b, i) => (
                    <p key={i} style={prose}>
                      {b.description}
                    </p>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {entry.agonExcerpt && entry.agonExcerpt.length > 0 && (
          <Section label="From The Agon">
            <p style={prose}>
              A sample of how this collision plays out in the Agora — each mind responding to the
              same question in their own voice.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
              {entry.agonExcerpt.map((turn, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: "3px solid var(--amber)",
                    paddingLeft: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--amber)",
                      marginBottom: 8,
                    }}
                  >
                    {turn.speaker}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      lineHeight: 1.65,
                      color: "var(--fg)",
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    {turn.text}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <FooterCta person={person} />
      </article>
    </main>
  );
}

function buildArticleJsonLd(
  headline: string,
  description: string,
  slug: string,
  publishedAt: string,
  updatedAt?: string,
  keywords?: string[],
  articleSection?: string,
) {
  const url = getInsightUrl(slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    articleSection,
    author: { "@type": "Organization", name: "Consult The Dead" },
    publisher: { "@type": "Organization", name: "Consult The Dead" },
    url,
    keywords,
  };
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <p style={{ ...labelStyle, marginBottom: 16 }}>{label}</p>
      {children}
    </section>
  );
}

function FrameworkPanel({
  framework,
  accent,
}: {
  framework: Framework;
  accent: string;
}) {
  const constructs = framework.bipolar_constructs.slice(0, 2);
  const blindSpot = framework.blind_spots[0];
  return (
    <section style={{ ...panelStyle, borderColor: accent }}>
      <p style={{ ...eyebrowStyle, marginBottom: 8, color: accent }}>{framework.meta.person}</p>
      <p style={smallIntroStyle}>{framework.perceptual_lens.statement}</p>
      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        <div>
          <p style={labelStyle}>Notices first</p>
          <p style={smallProse}>{framework.perceptual_lens.what_they_notice_first}</p>
        </div>
        <div>
          <p style={labelStyle}>Ignores</p>
          <p style={smallProse}>{framework.perceptual_lens.what_they_ignore}</p>
        </div>
        {constructs.length > 0 && (
          <div>
            <p style={labelStyle}>Dominant axis</p>
            <p style={smallProse}>{constructs[0]?.construct}</p>
          </div>
        )}
        {blindSpot && (
          <div>
            <p style={labelStyle}>Blind spot</p>
            <p style={smallProse}>{blindSpot.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DivergenceRow({
  label,
  text,
  accent,
}: {
  label: string;
  text: string;
  accent: string;
}) {
  return (
    <div style={{ ...cardStyle, borderLeft: `2px solid ${accent}` }}>
      <p style={{ ...labelStyle, color: accent }}>{label}</p>
      <p style={smallProse}>{text}</p>
    </div>
  );
}

function FooterCta({ person }: { person: string }) {
  return (
    <div
      style={{
        marginTop: 64,
        padding: "32px 28px",
        border: "1px solid var(--amber)",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          color: "var(--fg)",
          marginBottom: 12,
        }}
      >
        Run your own decision through {person}&rsquo;s framework
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          color: "var(--fg-dim)",
          marginBottom: 20,
        }}
      >
        Combine {person} with other historical minds. See where they agree — and where they
        fight.
      </p>
      <Link
        href="/agora?utm_source=insight&utm_campaign=seo"
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "12px 28px",
          background: "var(--amber)",
          color: "var(--bg)",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Start your own agon →
      </Link>
    </div>
  );
}

function accentForSlug(slug: FrameworkSlug): string {
  switch (slug) {
    case "isaac-newton":
      return "var(--color-newton)";
    case "marie-curie":
      return "var(--color-curie)";
    case "niccolo-machiavelli":
      return "var(--color-machiavelli)";
    case "nikola-tesla":
      return "var(--color-tesla)";
    case "leonardo-da-vinci":
      return "var(--color-leonardo)";
    case "sun-tzu":
      return "var(--color-suntzu)";
    case "marcus-aurelius":
      return "var(--color-aurelius)";
    default:
      return "var(--amber)";
  }
}

export function formatPublishedDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date.slice(0, 10);
  }
}

const prose: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  lineHeight: 1.65,
  color: "var(--fg)",
};

const smallProse: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  lineHeight: 1.55,
  color: "var(--fg-dim)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
  marginBottom: 6,
};

const sectionLabelStyle: React.CSSProperties = {
  ...labelStyle,
  marginBottom: 12,
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
  color: "var(--fg-dim)",
  marginBottom: 24,
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: 18,
};

const pillStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "4px 10px",
  border: "1px solid var(--hairline)",
  borderRadius: 999,
  color: "var(--fg)",
};

const dateStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "clamp(28px, 4.5vw, 48px)",
  fontWeight: 400,
  lineHeight: 1.12,
  color: "var(--fg)",
  marginBottom: 24,
};

const hookStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 20,
  lineHeight: 1.6,
  color: "var(--fg)",
  fontStyle: "italic",
  marginBottom: 28,
  borderLeft: "2px solid var(--amber)",
  paddingLeft: 20,
};

const introStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  lineHeight: 1.7,
  color: "var(--fg-dim)",
  marginBottom: 0,
};

const smallIntroStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  lineHeight: 1.6,
  color: "var(--fg)",
  marginBottom: 0,
};

const compareGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginBottom: 32,
};

const panelStyle: React.CSSProperties = {
  padding: 20,
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface)",
};

const cardStyle: React.CSSProperties = {
  padding: "16px 20px",
  border: "1px solid var(--hairline)",
  borderRadius: 6,
  background: "var(--surface)",
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--fg)",
  marginBottom: 6,
};

const twoColStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 24,
  marginTop: 24,
};

const bulletListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  paddingLeft: 20,
  color: "var(--fg-dim)",
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  lineHeight: 1.6,
  margin: "16px 0 0",
};
