import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LISTICLE_SLUGS,
  buildCtaUrl,
  buildListicleShareImageUrls,
  isListicleSlug,
  listicleCanonicalUrl,
  loadListicleContent,
} from "@/lib/listicle-content";

/* ── Static generation ──
 * Pre-render all 5 listicle pages at build time. dynamicParams=false means
 * any other slug 404s without ever hitting the route handler. */

export function generateStaticParams() {
  return LISTICLE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

/* ── Metadata ── */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isListicleSlug(slug)) return { title: "Not Found" };
  const content = loadListicleContent(slug);
  if (!content) return { title: "Not Found" };

  const canonical = listicleCanonicalUrl(content.slug);
  const shareImageUrls = buildListicleShareImageUrls(content.slug);
  return {
    title: content.h1,
    description: content.metaDescription,
    openGraph: {
      title: content.h1,
      description: content.metaDescription,
      url: canonical,
      type: "article",
      images: [shareImageUrls.openGraph],
    },
    twitter: {
      card: "summary_large_image",
      title: content.h1,
      description: content.metaDescription,
      images: [shareImageUrls.twitter],
    },
    alternates: { canonical },
  };
}

/* ── Page ── */

const COL = "720px";

export default async function ListiclePage({ params }: PageProps) {
  const { slug } = await params;
  if (!isListicleSlug(slug)) notFound();
  const content = loadListicleContent(slug);
  if (!content) notFound();

  const ctaHref = buildCtaUrl(content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.h1,
    description: content.metaDescription,
    author: { "@type": "Organization", name: "Consult The Dead" },
    publisher: { "@type": "Organization", name: "Consult The Dead" },
    url: listicleCanonicalUrl(content.slug),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: content.h1,
        acceptedAnswer: {
          "@type": "Answer",
          text: content.metaDescription,
        },
      },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.consultthedead.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Listicles",
        item: "https://www.consultthedead.com/listicles",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.h1,
        item: listicleCanonicalUrl(content.slug),
      },
    ],
  };

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "80px 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
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
        <Link href="/" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>
          CONSULT THE DEAD
        </Link>
        {" / "}
        <span style={{ textTransform: "uppercase" }}>LISTICLE</span>
      </p>

      {/* H1 */}
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(28px, 4.5vw, 48px)",
          fontWeight: 400,
          lineHeight: 1.12,
          color: "var(--fg)",
          marginBottom: 32,
        }}
      >
        {content.h1}
      </h1>

      {/* Intro */}
      <section style={{ marginBottom: 48 }}>
        {content.intro.map((para, i) => (
          <p
            key={i}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.65,
              color: "var(--fg)",
              marginBottom: 20,
            }}
          >
            {para}
          </p>
        ))}
      </section>

      {/* Recommended council */}
      <section style={{ marginBottom: 48 }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 16,
          }}
        >
          THE RECOMMENDED COUNCIL
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {content.minds.map((mind) => (
            <div
              key={mind.slug}
              style={{
                padding: "16px 20px",
                border: "1px solid var(--hairline)",
                borderRadius: 6,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--fg)",
                  marginBottom: 6,
                }}
              >
                {mind.name}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "var(--fg-dim)",
                }}
              >
                {mind.rationale}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div
        style={{
          marginTop: 56,
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
            marginBottom: 16,
          }}
        >
          {content.ctaHeadline}
        </p>
        <Link
          href={ctaHref}
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
          {content.ctaButtonLabel}
        </Link>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "var(--fg-dim)",
            marginTop: 16,
            fontStyle: "italic",
          }}
        >
          {content.ctaSubtext}
        </p>
      </div>
    </main>
  );
}
