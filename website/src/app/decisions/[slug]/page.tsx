import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getFramework, SLUG_COLOR_VAR, type Framework, type FrameworkSlug } from "@/lib/frameworks";
import {
  buildDecisionAgoraHref,
  DECISION_ENTRIES,
  getDecisionEntry,
  getDecisionPublishedAt,
  getDecisionUrl,
} from "../../../../content/decisions";

type PageProps = { params: Promise<{ slug: string }> };

const COL = "760px";

export function generateStaticParams() {
  return DECISION_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDecisionEntry(slug);
  if (!entry) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const url = getDecisionUrl(slug);
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

export default async function DecisionPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getDecisionEntry(slug);
  if (!entry) notFound();

  const frameworks = entry.recommendedCouncil
    .map((frameworkSlug) => getFramework(frameworkSlug))
    .filter((framework): framework is Framework => framework !== null);
  if (frameworks.length !== entry.recommendedCouncil.length) {
    notFound();
  }

  const publishedAt = getDecisionPublishedAt(entry).toISOString();
  const ctaHref = buildDecisionAgoraHref(entry);
  const jsonLd = buildArticleJsonLd(entry.title, entry.description, slug, publishedAt, entry.targetKeywords);

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "72px 24px 96px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header style={{ marginBottom: 40 }}>
          <p style={eyebrowStyle}>
            Decisions / High-intent surface
          </p>

          <p style={badgeStyle}>Pre-loaded agon</p>

          <h1 style={titleStyle}>{entry.title}</h1>
          <p style={hookStyle}>{entry.hookQuestion}</p>
          <p style={introStyle}>{entry.description}</p>

          <div style={metaRowStyle}>
            <time dateTime={publishedAt} style={dateStyle}>
              {formatPublishedDate(publishedAt)}
            </time>
            <span style={{ ...dateStyle, color: "var(--fg-faint)" }}>·</span>
            <span style={dateStyle}>Phase 1 queue</span>
          </div>
        </header>

        <Section label="What the question is really asking">
          <p style={prose}>
            This is not only a financing or resignation question. It is a decision about
            leverage, timing, and how much uncertainty you can afford to carry.
          </p>
          <ul style={bulletListStyle}>
            <li>{entry.primaryQuery}</li>
            {entry.secondaryQueries.slice(0, 3).map((query) => (
              <li key={query}>{query}</li>
            ))}
          </ul>
        </Section>

        <Section label="Recommended council">
          <div style={{ display: "grid", gap: 16 }}>
            {frameworks.map((framework) => (
              <FrameworkCard
                key={framework.slug}
                framework={framework}
                accent={accentForSlug(framework.slug as FrameworkSlug)}
              />
            ))}
          </div>
        </Section>

        <Section label="Why this page exists">
          <p style={prose}>
            The page is built to rank for the exact query, summarize the tradeoff in plain
            language, and push the reader directly into a pre-selected council inside Agora.
          </p>
        </Section>

        <FooterCta href={ctaHref} />
      </article>
    </main>
  );
}

function buildArticleJsonLd(
  headline: string,
  description: string,
  slug: string,
  publishedAt: string,
  keywords: string[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { "@type": "Organization", name: "Consult The Dead" },
    publisher: { "@type": "Organization", name: "Consult The Dead" },
    url: getDecisionUrl(slug),
    keywords,
  };
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <p style={{ ...labelStyle, marginBottom: 14 }}>{label}</p>
      {children}
    </section>
  );
}

function FrameworkCard({
  framework,
  accent,
}: {
  framework: Framework;
  accent: string;
}) {
  return (
    <section style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}>
      <div style={frameworkHeaderStyle}>
        <p style={{ ...cardTitleStyle, color: accent }}>{framework.meta.person}</p>
        <span style={pillStyle}>{framework.meta.domain}</span>
      </div>
      <p style={smallIntroStyle}>{framework.perceptual_lens.statement}</p>
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <p style={smallProse}>
          <strong>Notices first:</strong> {framework.perceptual_lens.what_they_notice_first}
        </p>
        <p style={smallProse}>
          <strong>Ignores:</strong> {framework.perceptual_lens.what_they_ignore}
        </p>
      </div>
    </section>
  );
}

function FooterCta({ href }: { href: string }) {
  return (
    <div
      style={{
        marginTop: 56,
        padding: "28px 24px",
        border: "1px solid var(--amber)",
        borderRadius: 10,
        textAlign: "center",
      }}
    >
      <p style={footerTitleStyle}>Start your own agon in the Agora</p>
      <p style={footerCopyStyle}>
        The recommended council is already selected. Take the exact question from this page
        and see how the minds disagree when it becomes your own situation.
      </p>
      <Link href={href} style={footerButtonStyle}>
        Start your own agon
      </Link>
    </div>
  );
}

function formatPublishedDate(dateTime: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateTime));
}

function accentForSlug(slug: FrameworkSlug): string {
  return SLUG_COLOR_VAR[slug] ?? "var(--amber)";
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--fg-faint)",
  marginBottom: 12,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--amber)",
  border: "1px solid var(--amber)",
  borderRadius: 99,
  padding: "4px 8px",
  marginBottom: 14,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "clamp(30px, 5vw, 48px)",
  fontWeight: 400,
  lineHeight: 1.08,
  color: "var(--fg)",
  marginBottom: 14,
};

const hookStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  lineHeight: 1.5,
  color: "var(--fg)",
  marginBottom: 12,
};

const introStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  lineHeight: 1.65,
  color: "var(--fg-dim)",
  marginBottom: 16,
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const dateStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-faint)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--fg-faint)",
};

const prose: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  lineHeight: 1.7,
  color: "var(--fg-dim)",
};

const bulletListStyle: React.CSSProperties = {
  ...prose,
  marginTop: 14,
  paddingLeft: 22,
  display: "grid",
  gap: 8,
};

const cardStyle: React.CSSProperties = {
  padding: "18px 18px 18px 16px",
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface)",
};

const frameworkHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 500,
};

const smallIntroStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--fg-dim)",
  margin: 0,
};

const smallProse: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--fg-dim)",
  margin: 0,
};

const pillStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--fg-faint)",
  padding: "2px 7px",
  border: "1px solid var(--hairline)",
  borderRadius: 99,
};

const footerTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 22,
  color: "var(--fg)",
  marginBottom: 10,
};

const footerCopyStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  lineHeight: 1.65,
  color: "var(--fg-dim)",
  marginBottom: 18,
};

const footerButtonStyle: React.CSSProperties = {
  display: "inline-block",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 24px",
  background: "var(--amber)",
  color: "var(--bg)",
  borderRadius: 6,
  textDecoration: "none",
};
