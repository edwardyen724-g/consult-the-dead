import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, type AgonRecord } from "@/lib/db/client";
import {
  formatLibraryProgressStats,
  getLibraryProgressStats,
} from "@/lib/library-stats";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const userId = user.id;
  const isPro = user.publicMetadata?.subscription_tier === "pro";

  return (
    <main
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 16px 96px",
          boxSizing: "border-box",
          width: "100%",
        }}
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
            margin: "0 0 32px",
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

export function UpgradePrompt() {
  return (
    <div
      className="font-mono"
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "8px",
        padding: "32px 24px",
        maxWidth: "520px",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <p
        style={{
          fontSize: "9px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--amber)",
          margin: 0,
        }}
      >
        Pro feature
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "19px",
          lineHeight: 1.55,
          color: "var(--fg)",
          margin: 0,
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
          margin: 0,
        }}
      >
        Library is a Pro feature. Upgrade to save agons, export reports, and
        build a personal archive of council decisions.
      </p>
      <Link
        href="/pricing"
        style={{
          display: "inline-block",
          width: "fit-content",
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

export async function ProLibrary({ userId }: { userId: string }) {
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
        <span style={{ color: "var(--red)", marginRight: "10px" }}>DB ERROR</span>
        {dbError}
      </div>
    );
  }

  const progressLabels = formatLibraryProgressStats(getLibraryProgressStats(agons));

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
          gap: "12px",
          padding: "14px 0 18px",
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
          marginBottom: "28px",
        }}
      >
        {progressLabels.map((label) => (
          <p
            key={label}
            className="font-mono"
            style={{
              margin: 0,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              lineHeight: 1.6,
            }}
          >
            {label}
          </p>
        ))}
      </div>

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
