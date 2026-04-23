import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db, type AgonRecord } from "@/lib/db/client";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const { userId, sessionClaims } = await auth();
  const publicMetadata = sessionClaims?.publicMetadata as
    | Record<string, unknown>
    | undefined;
  const isPro = publicMetadata?.subscription_tier === "pro";

  return (
    <main
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <div
        style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 24px 120px" }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            margin: "0 0 12px",
          }}
        >
          Consult The Dead
        </p>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            margin: "0 0 48px",
          }}
        >
          Library
        </h1>

        {!isPro ? (
          <UpgradePrompt />
        ) : (
          <ProLibrary userId={userId!} />
        )}
      </div>
    </main>
  );
}

function UpgradePrompt() {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "6px",
        padding: "40px 32px",
        maxWidth: "480px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "18px",
          lineHeight: 1.55,
          color: "var(--fg)",
          margin: "0 0 8px",
        }}
      >
        Save every debate. Revisit any decision.
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "var(--fg-dim)",
          fontStyle: "italic",
          margin: "0 0 28px",
        }}
      >
        Library is a Pro feature. Upgrade to save agons, export reports, and
        build a personal archive of council decisions.
      </p>
      <Link
        href="/pricing"
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
        }}
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}

async function ProLibrary({ userId }: { userId: string }) {
  let agons: AgonRecord[] = [];
  let dbError: string | null = null;

  try {
    agons = await db.getUserAgons(userId);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database error";
  }

  if (dbError) {
    return (
      <div
        style={{
          border: "1px solid var(--hairline)",
          padding: "24px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--fg-dim)",
          lineHeight: 1.7,
          maxWidth: "560px",
        }}
      >
        <span style={{ color: "#c75a5a", marginRight: "10px" }}>DB ERROR</span>
        {dbError}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          borderTop: "1px solid var(--hairline)",
          marginBottom: "0",
        }}
      >
        {agons.length > 0 && (
          <div
            className="font-mono"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              gap: "24px",
              padding: "10px 0",
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <span>Topic</span>
            <span>Date</span>
            <span />
            <span>Action</span>
          </div>
        )}
        <LibraryClient agons={agons} />
      </div>

      <div
        style={{
          marginTop: "56px",
          paddingTop: "24px",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <Link
          href="/agora"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
          }}
        >
          ← Back to the Agora
        </Link>
      </div>
    </>
  );
}
