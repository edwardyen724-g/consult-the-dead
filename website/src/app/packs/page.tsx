/**
 * /packs — themed pack catalog landing page.
 *
 * Lists all available mind packs with a guided-quiz CTA and a social-proof
 * strip near the top. Each pack card links to its dedicated SEO landing page.
 *
 * Added: guided quiz CTA (amber pill) + ProofStrip (task 70e4f545, capsule a11bd130).
 */

import Link from "next/link";
import type { Metadata } from "next";
import { getAllFrameworks } from "@/lib/frameworks";
import { PACKS, getActivePackMembers } from "@/lib/packs";
import { ProofStrip } from "@/components/ProofStrip";

export const metadata: Metadata = {
  title: "Mind Packs — Themed Councils for Every Decision",
  description:
    "Browse curated packs of historical minds grouped by domain — stoics, inventors, strategists, and more. Each pack is tuned to a specific class of hard decision.",
  alternates: { canonical: "https://www.consultthedead.com/packs" },
};

/** UTM-stamped quiz entry for the packs page CTA. */
export const PACKS_QUIZ_CTA_HREF =
  "/quiz?utm_source=packs&utm_medium=page_cta&utm_campaign=guided_entry";

const MAX_COL = "1100px";

export default function PacksPage() {
  const frameworks = getAllFrameworks();
  const liveSlugs = new Set(frameworks.map((f) => f.slug));

  const packCards = PACKS.map((pack) => {
    const liveMembers = getActivePackMembers(pack, liveSlugs);
    return { ...pack, liveCount: liveMembers.length };
  }).filter((p) => p.liveCount > 0);

  return (
    <main
      style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}
    >
      <div
        style={{
          maxWidth: MAX_COL,
          margin: "0 auto",
          padding: "64px 24px 120px",
        }}
      >
        {/* ── Hero ── */}
        <header style={{ marginBottom: "48px" }}>
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
            Mind Packs
          </p>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Curated councils for every class of decision
          </h1>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              maxWidth: "56ch",
              marginBottom: "32px",
            }}
          >
            Each pack is a pre-assembled council of historical minds tuned to a
            specific domain. Browse by theme, or let the quiz match you to the
            right one.
          </p>

          {/* Quiz CTA */}
          <Link
            href={PACKS_QUIZ_CTA_HREF}
            data-testid="packs-quiz-cta"
            aria-label="Take the guided quiz to find your council"
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
              marginBottom: "40px",
            }}
          >
            Take the Guided Quiz &rarr;
          </Link>

          {/* Social-proof strip */}
          <ProofStrip />
        </header>

        {/* ── Pack grid ── */}
        <section aria-label="Available mind packs">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {packCards.map((pack) => (
              <Link
                key={pack.id}
                href={`/packs/${pack.id}`}
                data-testid={`pack-card-${pack.id}`}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: "4px",
                }}
              >
                {/* Pack name */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: pack.colorVar,
                    fontWeight: 500,
                  }}
                >
                  {pack.name}
                </div>

                {/* Tagline */}
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    color: "var(--fg-dim)",
                    margin: 0,
                  }}
                >
                  {pack.tagline}
                </p>

                {/* Member count badge */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--fg-faint)",
                    marginTop: "auto",
                  }}
                >
                  {pack.liveCount} minds
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div style={{ textAlign: "center", marginTop: "72px" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "var(--fg-dim)",
              marginBottom: "20px",
            }}
          >
            Not sure which pack fits your question? Let the quiz decide.
          </p>
          <Link
            href={PACKS_QUIZ_CTA_HREF}
            data-testid="packs-quiz-cta-bottom"
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
            Take the Guided Quiz &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
