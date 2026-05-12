/**
 * /collection/summary — authenticated user collection overview.
 *
 * Renders a summary of the authenticated user's agon history: total agons,
 * most recent topics, and quick navigation back to the Agora. This is the
 * post-session retention surface for logged-in users who want a bird's-eye
 * view of their consultation history without scrolling through the full
 * /library list.
 *
 * Behavior:
 *   - Clerk-authenticated server component — redirects to /sign-in when
 *     the session is absent.
 *   - Fetches the 5 most recent agons from the DB client directly (avoids
 *     the HTTP round-trip of going through /api/library).
 *   - Dynamic at request time because it reads the Clerk session cookie;
 *     `export const dynamic = "force-dynamic"` makes the intent explicit and
 *     prevents Next.js from statically rendering the page at build time.
 *   - No `runtime` override — runs on the Node.js runtime (default) which
 *     supports the full @vercel/postgres client.
 */
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { db } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Collection Summary",
  description: "An overview of your Consult The Dead consultation history.",
  robots: { index: false, follow: false },
};

/**
 * Force dynamic rendering — this page reads the Clerk session and user-scoped
 * DB rows, both of which change per-request. Static generation would produce a
 * stale, potentially wrong snapshot.
 *
 * Valid values for `dynamic`: "auto" | "force-dynamic" | "error" | "force-static"
 * We intentionally do NOT combine this with `revalidate` (which is invalid when
 * `dynamic` is "force-dynamic") or with `runtime = "edge"` (which would break
 * the Node.js-only @vercel/postgres client).
 */
export const dynamic = "force-dynamic";

const RECENT_AGON_LIMIT = 5;

export default async function CollectionSummaryPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const recentAgons = await db.getUserAgons(user.id, RECENT_AGON_LIMIT, 0);

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ||
    "Consultant";

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
          maxWidth: "640px",
          margin: "0 auto",
          padding: "72px 24px 120px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: "12px",
            }}
          >
            Collection Summary
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "0 0 8px",
            }}
          >
            {displayName}&rsquo;s Consultations
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              color: "var(--fg-dim)",
              margin: 0,
            }}
          >
            {recentAgons.length === 0
              ? "No consultations yet. Start your first agon below."
              : `Your ${recentAgons.length === 1 ? "most recent consultation" : `${recentAgons.length} most recent consultations`}.`}
          </p>
        </div>

        {/* Recent agons list */}
        {recentAgons.length > 0 && (
          <div
            style={{
              border: "1px solid var(--hairline)",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "48px",
            }}
          >
            {recentAgons.map((agon, index) => (
              <div
                key={agon.id}
                style={{
                  padding: "20px 24px",
                  borderBottom:
                    index < recentAgons.length - 1
                      ? "1px solid var(--hairline)"
                      : "none",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.95rem",
                    margin: "0 0 8px",
                    lineHeight: 1.5,
                  }}
                >
                  {agon.topic}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--fg-dim)",
                    }}
                  >
                    {new Date(agon.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/agora/a/${agon.share_id}`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--amber)",
                      textDecoration: "none",
                    }}
                  >
                    View agon
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link
            href="/agora"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 20px",
              borderRadius: "4px",
              background: "var(--amber)",
              color: "var(--bg)",
              textDecoration: "none",
            }}
          >
            Start a new consultation
          </Link>
          <Link
            href="/account"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 20px",
              borderRadius: "4px",
              border: "1px solid var(--hairline)",
              color: "var(--fg)",
              textDecoration: "none",
            }}
          >
            Account
          </Link>
        </div>
      </div>
    </main>
  );
}
