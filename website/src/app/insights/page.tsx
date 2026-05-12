import type { Metadata } from "next";
import Link from "next/link";
import { getAllFrameworks, SLUG_COLOR_VAR } from "@/lib/frameworks";
import type { FrameworkSlug } from "@/lib/frameworks";
import { INSIGHT_ENTRIES } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Decision Insights — How History's Greatest Minds Would Decide",
  description:
    "Explore how Newton, Machiavelli, Curie, Sun Tzu, and other historical figures would approach your toughest decisions. Real cognitive frameworks, not AI personas.",
};

const COL = "800px";

/* Readable word-count estimate: ~200 wpm, minimum 2 min */
function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  return `${mins} min read`;
}

export default function InsightsPage() {
  const frameworks = getAllFrameworks();
  const fwMap = new Map(frameworks.map((fw) => [fw.slug, fw]));

  return (
    <main style={{ maxWidth: COL, margin: "0 auto", padding: "64px 24px 96px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-faint)",
          marginBottom: 10,
        }}
      >
        Decision Insights
      </p>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(24px, 3.5vw, 38px)",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "var(--fg)",
          marginBottom: 16,
        }}
      >
        How would history&rsquo;s greatest minds approach your decision?
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          lineHeight: 1.6,
          color: "var(--fg-dim)",
          marginBottom: 40,
          maxWidth: "58ch",
        }}
      >
        Each insight applies a real cognitive framework — extracted via the Critical Decision Method
        from documented historical incidents — to a common decision founders and leaders face.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {INSIGHT_ENTRIES.map((entry, idx) => {
          const fw = fwMap.get(entry.frameworkSlug);
          if (!fw) return null;
          const accentColor =
            SLUG_COLOR_VAR[entry.frameworkSlug as FrameworkSlug] ?? "var(--amber)";
          const rt = readingTime(entry.description + " " + entry.hookQuestion);

          return (
            <Link
              key={entry.slug}
              href={`/insights/${entry.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "3px 1fr",
                textDecoration: "none",
                borderBottom: idx < INSIGHT_ENTRIES.length - 1 ? "1px solid var(--hairline)" : "none",
                transition: "background 0.15s",
              }}
              className="gm-insight-card"
            >
              {/* Left accent bar */}
              <div
                style={{
                  background: accentColor,
                  opacity: 0.6,
                  borderRadius: "2px 0 0 2px",
                  minHeight: "100%",
                }}
                aria-hidden
              />

              {/* Card body */}
              <div style={{ padding: "14px 18px 14px 16px" }}>
                {/* Top row: mind + tags + reading time */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: accentColor,
                      fontWeight: 500,
                    }}
                  >
                    {fw.meta.person}
                  </span>
                  <span style={{ color: "var(--hairline)" }}>·</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg-faint)",
                      padding: "1px 6px",
                      border: "1px solid var(--hairline)",
                      borderRadius: 99,
                    }}
                  >
                    {entry.decisionType}
                  </span>
                  {entry.type === "collision" && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--amber)",
                        padding: "1px 6px",
                        border: "1px solid var(--amber)",
                        borderRadius: 99,
                      }}
                    >
                      Collision
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--fg-faint)",
                    }}
                  >
                    {rt}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: "var(--fg)",
                    marginBottom: 5,
                  }}
                >
                  {entry.title}
                </h2>

                {/* 1-line excerpt */}
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--fg-dim)",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {entry.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
