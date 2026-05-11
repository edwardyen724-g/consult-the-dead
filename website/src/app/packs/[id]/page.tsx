/**
 * Programmatic /packs/[id] long-tail SEO landing pages.
 *
 * One SSG-rendered page per PACK in @/lib/packs (currently 6: stoic-council,
 * inventors-workshop, war-room, republic, trailblazers, moguls). Each page
 * lists the live members with their portraits + lens, three sample agon
 * prompts themed to the pack, and a UTM-stamped "Convene this Council"
 * CTA that pre-loads /agora with the pack's minds.
 *
 * Capsule scope: this page + @/lib/pack-seo-content. Out of scope:
 * sitemap.ts (sequenced follow-up), AgoraApp.tsx, packs.ts, home page.tsx.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllFrameworks,
  SLUG_COLOR_VAR,
  type Framework,
  type FrameworkSlug,
} from "@/lib/frameworks";
import { type PackId } from "@/lib/packs";
import {
  agoraUrlForPack,
  getPackOrThrow,
  getPackPrompts,
  getPackSeoMeta,
  listPackIds,
  packCanonicalUrl,
  resolvePackMembers,
} from "@/lib/pack-seo-content";

/* ── Static generation ── */

export function generateStaticParams() {
  return listPackIds().map((id) => ({ id }));
}

// 404 anything that isn't a pre-generated pack id.
export const dynamicParams = false;

type PageProps = { params: Promise<{ id: string }> };

/* ── Metadata ── */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!listPackIds().includes(id as PackId)) {
    return { title: "Not Found" };
  }
  const seo = getPackSeoMeta(id as PackId);
  const url = packCanonicalUrl(id as PackId);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

/* ── Page ── */

const COL = "880px";

export default async function PackLandingPage({ params }: PageProps) {
  const { id } = await params;
  if (!listPackIds().includes(id as PackId)) {
    notFound();
  }
  const packId = id as PackId;

  const pack = getPackOrThrow(packId);
  const seo = getPackSeoMeta(packId);
  const prompts = getPackPrompts(packId);

  const frameworks = getAllFrameworks();
  const liveSlugs = new Set<string>(frameworks.map((f) => f.slug));
  const memberSlugs = resolvePackMembers(packId, liveSlugs);

  // If a pack has no live members yet (e.g. data was rolled back), 404
  // rather than render a CTA that prefills no minds.
  if (memberSlugs.length === 0) {
    notFound();
  }

  const fwBySlug = new Map<string, Framework>(
    frameworks.map((f) => [f.slug, f]),
  );
  const ctaUrl = agoraUrlForPack(packId, memberSlugs);

  // JSON-LD: CollectionPage with hasPart Person entries for each member.
  const memberPersons = memberSlugs
    .map((slug) => fwBySlug.get(slug))
    .filter((fw): fw is Framework => Boolean(fw))
    .map((fw) => ({
      "@type": "Person",
      name: fw.meta.person,
      url: `${packCanonicalUrl(packId).replace(`/packs/${packId}`, "")}/frameworks/${fw.slug}`,
      jobTitle: fw.meta.domain,
    }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.title,
    description: seo.description,
    url: packCanonicalUrl(packId),
    hasPart: memberPersons,
  };

  return (
    <main style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}>
      {/* JSON-LD CollectionPage */}
      <script
        type="application/ld+json"
        // The JSON object is built in this server component from a known
        // schema, so dangerouslySetInnerHTML is safe here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          maxWidth: COL,
          margin: "0 auto",
          padding: "64px 24px 120px",
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "48px",
          }}
        >
          &larr; The Council
        </Link>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: pack.colorVar,
            marginBottom: "16px",
          }}
        >
          Pack &middot; {memberSlugs.length} minds
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          {seo.heading}
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.04em",
            color: "var(--fg-dim)",
            marginBottom: "28px",
          }}
        >
          {pack.tagline}
        </p>

        {/* Intro */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            margin: "0 0 32px",
            maxWidth: "62ch",
          }}
        >
          {seo.intro}
        </p>

        {/* Above-the-fold CTA */}
        <Link
          href={ctaUrl}
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 32px",
            background: "var(--amber)",
            color: "var(--bg)",
            textDecoration: "none",
            borderRadius: "4px",
            marginBottom: "72px",
          }}
        >
          Convene this Council &rarr;
        </Link>

        {/* Member cards */}
        <section style={{ marginBottom: "72px" }}>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              fontWeight: 400,
              marginBottom: "20px",
            }}
          >
            The members
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {memberSlugs.map((slug) => {
              const fw = fwBySlug.get(slug);
              if (!fw) return null;
              const color = SLUG_COLOR_VAR[slug as FrameworkSlug];
              return (
                <Link
                  key={slug}
                  href={`/frameworks/${slug}`}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    minHeight: "200px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                      color: "var(--fg-dim)",
                      margin: 0,
                    }}
                  >
                    {fw.perceptual_lens.statement.slice(0, 120)}
                    {fw.perceptual_lens.statement.length > 120 ? "…" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Sample prompts */}
        <section style={{ marginBottom: "72px" }}>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              fontWeight: 400,
              marginBottom: "20px",
            }}
          >
            What to ask them
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {prompts.map((prompt) => (
              <li
                key={prompt}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  padding: "16px 20px",
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  color: "var(--fg)",
                }}
              >
                &ldquo;{prompt}&rdquo;
              </li>
            ))}
          </ul>
        </section>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "20px",
            }}
          >
            Bring your own decision &mdash; let them argue it through.
          </p>
          <Link
            href={ctaUrl}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 32px",
              background: "var(--amber)",
              color: "var(--bg)",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Convene this Council &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
