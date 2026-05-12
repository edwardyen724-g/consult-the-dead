import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  MIND_SLUGS,
  buildMindCtaUrl,
  getMindContent,
  isMindSlug,
  mindCanonicalUrl,
} from "@/lib/mind-content";
import { db, type AgonRecord } from "@/lib/db/client";

/* ── Consultation-history helpers ── */

export interface ProgressCue {
  labels: string[];
  note: string | null;
}

/**
 * Derive a user's consultation progress summary for a specific mind.
 * Returns null when the user has no saved debates at all.
 */
export function buildMindProgressCue(
  agons: AgonRecord[],
  mindSlug: string,
): ProgressCue | null {
  if (agons.length === 0) return null;

  const uniqueMinds = new Set(agons.flatMap((a) => a.mind_slugs)).size;
  const totalSaved = agons.length;
  const mindCount = agons.filter((a) => a.mind_slugs.includes(mindSlug)).length;

  const mindsLabel =
    uniqueMinds === 1 ? "1 mind consulted so far" : `${uniqueMinds} minds consulted so far`;
  const savedLabel =
    totalSaved === 1 ? "1 saved debate" : `${totalSaved} saved debates`;

  return {
    labels: [mindsLabel, savedLabel, "Growing with every return"],
    note: mindCount > 0 ? `This mind appears in ${mindCount} saved debates.` : null,
  };
}

/**
 * Fetch all agon records for a user by paging through the DB in batches.
 */
export async function loadAllUserAgons(userId: string): Promise<AgonRecord[]> {
  const PAGE = 100;
  const all: AgonRecord[] = [];
  let offset = 0;

  for (;;) {
    const batch = await db.getUserAgons(userId, PAGE, offset);
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  return all;
}

/* ── Static generation ──
 * Pre-render all 25 per-mind pages at build time. dynamicParams=false means
 * any unknown id 404s without ever hitting the route handler. */

export function generateStaticParams() {
  return MIND_SLUGS.map((id) => ({ id }));
}

export const dynamicParams = false;

/* ── Metadata ── */

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isMindSlug(id)) return { title: "Not Found" };
  const mind = getMindContent(id);
  if (!mind) return { title: "Not Found" };

  const canonical = mindCanonicalUrl(mind.slug);
  const ogImageUrl = `${canonical}/opengraph-image`;
  // Extract the person's name from the h1 (pattern: "Name — The Mind That …")
  // so the root layout's title template produces "Name — Consult The Dead".
  const nameTitle = mind.h1.split(" — ")[0];
  return {
    title: nameTitle,
    description: mind.metaDescription,
    robots: { index: true, follow: true },
    openGraph: {
      title: mind.h1,
      description: mind.metaDescription,
      url: canonical,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: mind.h1,
      description: mind.metaDescription,
      images: [ogImageUrl],
    },
    alternates: { canonical },
  };
}

/* ── Page ── */

const COL = "720px";

export default async function MindPage({ params }: PageProps) {
  const { id } = await params;
  if (!isMindSlug(id)) notFound();
  const mind = getMindContent(id);
  if (!mind) notFound();

  const ctaHref = buildMindCtaUrl(mind.slug);

  // Fetch consultation history for signed-in users
  const user = await currentUser();
  const progressCue = user
    ? buildMindProgressCue(await loadAllUserAgons(user.id), mind.slug)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: mind.h1,
    description: mind.metaDescription,
    url: mindCanonicalUrl(mind.slug),
    publisher: { "@type": "Organization", name: "Consult The Dead" },
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
        <Link href="/" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>
          CONSULT THE DEAD
        </Link>
        {" / "}
        <Link href="/frameworks" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>
          MINDS
        </Link>
      </p>

      {/* H1 */}
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(28px, 4.5vw, 48px)",
          fontWeight: 400,
          lineHeight: 1.12,
          color: "var(--fg)",
          marginBottom: 16,
        }}
      >
        {mind.h1}
      </h1>

      {/* Famous-for tagline */}
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          lineHeight: 1.5,
          color: "var(--fg-dim)",
          fontStyle: "italic",
          marginBottom: 40,
        }}
      >
        {mind.famousFor}
      </p>

      {/* How this mind argues */}
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
          HOW THIS MIND ARGUES
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            lineHeight: 1.65,
            color: "var(--fg)",
          }}
        >
          {mind.howTheyArgue}
        </p>
      </section>

      {/* Sample quotes */}
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
          SAMPLE DEBATE QUOTES
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {mind.sampleQuotes.map((quote, i) => (
            <blockquote
              key={i}
              style={{
                borderLeft: "3px solid var(--amber)",
                paddingLeft: 20,
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                lineHeight: 1.65,
                color: "var(--fg)",
                fontStyle: "italic",
              }}
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </section>

      {/* Consultation archive — only for signed-in users with saved debates */}
      {progressCue && (
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
            YOUR CONSULTATION ARCHIVE
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {progressCue.labels.map((label) => (
              <p
                key={label}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                {label}
              </p>
            ))}
            {progressCue.note && (
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  color: "var(--amber)",
                  margin: 0,
                  marginTop: 4,
                }}
              >
                {progressCue.note}
              </p>
            )}
          </div>
        </section>
      )}

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
          {mind.ctaVariants[0]}
        </Link>
      </div>
    </main>
  );
}
