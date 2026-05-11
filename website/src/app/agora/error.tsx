"use client";

import Link from "next/link";

import { NoticePanel } from "@/components/NoticePanel";

export default function AgoraError({
  reset,
  error: _error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "48px 24px 96px",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <NoticePanel
          eyebrow="The Agora"
          title="The council could not load just now."
          accentVar="var(--red)"
          actions={
            <>
              <button
                type="button"
                onClick={reset}
                className="font-mono"
                style={{
                  background: "var(--red)",
                  color: "var(--bg)",
                  border: "1px solid var(--red)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "14px 20px",
                  cursor: "pointer",
                }}
              >
                Retry loading the Agora
              </button>
              <Link
                href="/"
                className="font-mono"
                style={{
                  display: "inline-block",
                  border: "1px solid var(--hairline)",
                  borderRadius: "4px",
                  color: "var(--fg-dim)",
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "14px 20px",
                  textDecoration: "none",
                }}
              >
                Return to the landing page
              </Link>
            </>
          }
        >
          This is usually a transient network or server problem. Retry the
          page; if it keeps failing, start over from the landing page.
        </NoticePanel>
      </div>
    </main>
  );
}
