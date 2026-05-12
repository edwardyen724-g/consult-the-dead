import Link from "next/link";
import type { Metadata } from "next";

import { DECISION_ENTRIES } from "../../../content/decisions";

const DECISIONS_OG_IMAGE_URL =
  "https://www.consultthedead.com/opengraph-image";

export const metadata: Metadata = {
  title: "Decisions — Consult The Dead",
  description:
    "24 high-intent decisions for founders, examined by councils of historical minds. Find the exact question you are facing and start your own agon.",
  openGraph: {
    title: "Decisions — Consult The Dead",
    description:
      "24 high-intent decisions for founders, examined by councils of historical minds.",
    url: "https://www.consultthedead.com/decisions",
    images: [
      {
        url: DECISIONS_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Decisions — Consult The Dead",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Decisions — Consult The Dead",
    description:
      "24 high-intent decisions for founders, examined by councils of historical minds.",
    images: [DECISIONS_OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.consultthedead.com/decisions",
  },
};

export default function DecisionsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "80px 24px 128px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "48px",
          }}
        >
          &larr; Consult The Dead
        </Link>

        <header style={{ marginBottom: "56px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              marginBottom: "16px",
            }}
          >
            Decisions / High-intent surface
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
              marginBottom: "20px",
            }}
          >
            Decisions
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--fg-dim)",
              maxWidth: "56ch",
            }}
          >
            {DECISION_ENTRIES.length} high-intent decisions for founders,
            examined by councils of historical minds. Each page frames the
            real question, surfaces the tradeoffs, and opens a pre-loaded agon
            in the Agora.
          </p>
        </header>

        <ol
          data-testid="decisions-list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: "2px",
          }}
        >
          {DECISION_ENTRIES.map((entry) => (
            <li key={entry.slug} data-testid="decision-item">
              <Link
                href={`/decisions/${entry.slug}`}
                data-testid={`decision-link-${entry.slug}`}
                style={{
                  display: "block",
                  padding: "18px 0",
                  borderBottom: "1px solid var(--hairline)",
                  textDecoration: "none",
                  color: "var(--fg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "16px",
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: "var(--fg)",
                        margin: "0 0 6px",
                      }}
                    >
                      {entry.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "var(--fg-dim)",
                        margin: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {entry.description}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--fg-faint)",
                      flexShrink: 0,
                      paddingTop: "2px",
                    }}
                  >
                    &rarr;
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
