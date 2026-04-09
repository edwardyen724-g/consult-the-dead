import type { Metadata } from "next";
import Link from "next/link";
import { getAllFrameworks, SLUG_COLOR_VAR } from "@/lib/frameworks";
import type { FrameworkSlug } from "@/lib/frameworks";

export const metadata: Metadata = {
  title: "The Frameworks \u2014 Consult The Dead",
  description:
    "Decision-making frameworks extracted from documented historical incidents using the Critical Decision Method. Not style imitations \u2014 cognitive architectures.",
};

const COL = "720px";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "\u2026";
}

export default function FrameworksPage() {
  const frameworks = getAllFrameworks();

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
          href="/"
          className="font-mono uppercase"
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            textDecoration: "none",
          }}
        >
          &larr; Consult The Dead
        </Link>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginTop: "48px",
          }}
        >
          The Frameworks
        </h1>

        {/* Intro */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "19px",
            lineHeight: 1.6,
            color: "var(--fg)",
            marginTop: "40px",
            maxWidth: "62ch",
          }}
        >
          Each framework is extracted from documented critical incidents in the
          figure&rsquo;s life using the Critical Decision Method. They capture
          how a mind actually decided under pressure&nbsp;&mdash; not what they
          said in speeches, not a style imitation. Some are fully extracted with
          validated incident databases. Others are in progress.
        </p>

        {/* Framework list */}
        <div style={{ marginTop: "80px" }}>
          {frameworks.map((fw) => {
            const color = SLUG_COLOR_VAR[fw.slug as FrameworkSlug];
            const constructCount = fw.meta.construct_count ?? fw.bipolar_constructs.length;
            const incidentCount = fw.meta.incident_count;
            const lens = truncate(fw.perceptual_lens.statement, 120);

            return (
              <Link
                key={fw.slug}
                href={`/frameworks/${fw.slug}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  padding: "28px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: "14px",
                      letterSpacing: "0.06em",
                      color: color,
                      transition: "filter 200ms ease-out",
                    }}
                  >
                    {fw.meta.person}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "11px",
                      color: "var(--fg-dim)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {constructCount} constructs &middot; {incidentCount}{" "}
                    incidents
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "var(--fg-dim)",
                    marginTop: "8px",
                    maxWidth: "58ch",
                  }}
                >
                  {lens}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
