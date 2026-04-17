import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import { getFramework } from "@/lib/frameworks";
import type { FrameworkSlug } from "@/lib/frameworks";

/* ── Static generation ── */

export function generateStaticParams() {
  return INSIGHT_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;

/* ── Metadata ── */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
  if (!entry) return { title: "Not Found" };
  const fw = getFramework(entry.frameworkSlug);
  const person = fw?.meta.person ?? entry.frameworkSlug;
  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.targetKeywords,
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: `https://www.consultthedead.com/insights/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: entry.title,
      description: entry.description,
    },
    alternates: {
      canonical: `https://www.consultthedead.com/insights/${slug}`,
    },
  };
}

/* ── Page ── */

const COL = "720px";

export default async function InsightPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = INSIGHT_ENTRIES.find((e) => e.slug === slug);
  if (!entry) notFound();

  const fw = getFramework(entry.frameworkSlug);
  if (!fw) notFound();

  const person = fw.meta.person;
  const lens = fw.perceptual_lens;
  const constructs = fw.bipolar_constructs.slice(0, 4);
  const predictions = fw.behavioral_divergence_predictions.slice(0, 3);
  const blindSpots = fw.blind_spots.slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.description,
    author: { "@type": "Organization", name: "Consult The Dead" },
    publisher: { "@type": "Organization", name: "Consult The Dead" },
    url: `https://www.consultthedead.com/insights/${slug}`,
  };

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "80px 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--fg-dim)",
          marginBottom: 24,
        }}
      >
        <Link href="/insights" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>
          INSIGHTS
        </Link>
        {" / "}
        <span style={{ textTransform: "uppercase" }}>{person}</span>
      </p>

      {/* Title */}
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(28px, 4.5vw, 48px)",
          fontWeight: 400,
          lineHeight: 1.12,
          color: "var(--fg)",
          marginBottom: 24,
        }}
      >
        {entry.title}
      </h1>

      {/* Hook */}
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 20,
          lineHeight: 1.6,
          color: "var(--fg)",
          fontStyle: "italic",
          marginBottom: 48,
          borderLeft: "2px solid var(--amber)",
          paddingLeft: 20,
        }}
      >
        {entry.hookQuestion}
      </p>

      {/* Perceptual Lens */}
      <Section label={`HOW ${person.toUpperCase()} SEES THE WORLD`}>
        <p style={prose}>{lens.statement}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div>
            <p style={labelStyle}>WHAT THEY NOTICE FIRST</p>
            <p style={smallProse}>{lens.what_they_notice_first}</p>
          </div>
          <div>
            <p style={labelStyle}>WHAT THEY IGNORE</p>
            <p style={smallProse}>{lens.what_they_ignore}</p>
          </div>
        </div>
      </Section>

      {/* Decision Dimensions */}
      {constructs.length > 0 && (
        <Section label="THE DECISION DIMENSIONS">
          <p style={prose}>
            {person} evaluates decisions along these bipolar dimensions — each one a tension
            between two valid approaches. Where you fall on each dimension shapes the decision.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
            {constructs.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--fg)",
                    marginBottom: 6,
                  }}
                >
                  {c.construct}
                </p>
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

      {/* How They'd Diverge */}
      {predictions.length > 0 && (
        <Section label={`WHERE ${person.toUpperCase()} WOULD DISAGREE WITH CONVENTIONAL WISDOM`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {predictions.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                }}
              >
                <p style={labelStyle}>{p.situation_type}</p>
                {(p.conventional_response || p.ordinary_response) && (
                  <p style={smallProse}>
                    <strong>Conventional:</strong>{" "}
                    {p.conventional_response || p.ordinary_response}
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

      {/* Blind Spots */}
      {blindSpots.length > 0 && (
        <Section label="THE BLIND SPOTS">
          <p style={prose}>
            Every framework has gaps. Knowing where {person}&rsquo;s reasoning breaks down is as
            important as knowing where it excels.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            {blindSpots.map((b, i) => (
              <p key={i} style={prose}>
                {b.description}
              </p>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
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
        <a
          href="/#council"
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
          Submit your decision to the council
        </a>
      </div>
    </main>
  );
}

/* ── Shared styles ── */

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

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <p style={{ ...labelStyle, marginBottom: 16 }}>{label}</p>
      {children}
    </section>
  );
}
