import type { Metadata } from "next";
import Link from "next/link";
import { getAllFrameworks } from "@/lib/frameworks";
import { INSIGHT_ENTRIES } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Decision Insights — How History's Greatest Minds Would Decide",
  description:
    "Explore how Newton, Machiavelli, Curie, Sun Tzu, and other historical figures would approach your toughest decisions. Real cognitive frameworks, not AI personas.",
};

const COL = "720px";

export default function InsightsPage() {
  const frameworks = getAllFrameworks();
  const fwMap = new Map(frameworks.map((fw) => [fw.slug, fw]));

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "80px 24px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          marginBottom: 12,
        }}
      >
        DECISION INSIGHTS
      </p>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "var(--fg)",
          marginBottom: 24,
        }}
      >
        How would history&rsquo;s greatest minds approach your decision?
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--fg-dim)",
          marginBottom: 56,
        }}
      >
        Each insight applies a real cognitive framework — extracted via the
        Critical Decision Method from documented historical incidents — to a
        common decision founders and leaders face.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {INSIGHT_ENTRIES.map((entry) => {
          const fw = fwMap.get(entry.frameworkSlug);
          if (!fw) return null;
          return (
            <Link
              key={entry.slug}
              href={`/insights/${entry.slug}`}
              style={{
                display: "block",
                padding: "24px 28px",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
                textDecoration: "none",
                transition: "border-color 0.2s",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 8,
                }}
              >
                {fw.meta.person}
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--fg)",
                  marginBottom: 8,
                }}
              >
                {entry.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "var(--fg-dim)",
                }}
              >
                {entry.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
