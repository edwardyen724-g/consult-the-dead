"use client";

import Link from "next/link";
import { useEffect } from "react";

type FrameworkDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FrameworkDetailError({
  error,
  reset,
}: FrameworkDetailErrorProps) {
  useEffect(() => {
    console.error("Framework detail route failed to load", error);
  }, [error]);

  return (
    <main
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "64px 24px 128px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          The council hit a snag
        </div>

        <div
          style={{
            marginTop: "48px",
            border: "1px solid var(--hairline)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02), transparent), var(--surface)",
            padding: "clamp(24px, 3.5vw, 36px)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "12ch",
            }}
          >
            This framework detail page could not finish loading.
          </p>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(1rem, 1.8vw, 1.12rem)",
              lineHeight: 1.68,
              color: "var(--fg-dim)",
              margin: "18px 0 0",
              maxWidth: "58ch",
            }}
          >
            Try again to recover the page. If the issue persists, return to the atlas and open the mind from there.
          </p>

          {error.digest ? (
            <div
              style={{
                marginTop: "20px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--fg-faint)",
              }}
            >
              Digest: {error.digest}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "28px",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                border: "1px solid var(--fg)",
                background: "var(--fg)",
                color: "var(--bg)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <Link
              href="/frameworks"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "0 18px",
                border: "1px solid var(--hairline)",
                textDecoration: "none",
                color: "inherit",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Back to the atlas
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
