import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, type AgonRecord } from "@/lib/db/client";
import {
  getLibraryProgressStats,
  getLibraryUpsellNudge,
} from "@/lib/library-stats";
import { LibraryClient } from "./LibraryClient";
import { LibraryProofStrip } from "@/components/LibraryProofStrip";

/**
 * Convert slug to title case — split by `-`, capitalize each word, join with space.
 * E.g. "sun-tzu" → "Sun Tzu"
 */
export function formatMindSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Return the sorted unique set of mind slugs across all saved agons.
 * Sorted for stable rendering order.
 */
export function getConsultedMindSlugs(agons: Pick<AgonRecord, "mind_slugs">[]): string[] {
  const seen = new Set<string>();
  for (const agon of agons) {
    for (const slug of agon.mind_slugs ?? []) {
      seen.add(slug);
    }
  }
  return [...seen].sort();
}

export function ConsultedMindsStrip({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;

  return (
    <div
      data-testid="consulted-minds-strip"
      style={{
        marginBottom: "28px",
        paddingBottom: "24px",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: "9px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          margin: "0 0 12px",
        }}
      >
        Minds in your collection
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        {slugs.map((slug) => (
          <div key={slug} data-testid="mind-chip">
            <img
              src={`/portraits/${slug}-portrait.png`}
              alt={formatMindSlug(slug)}
              title={formatMindSlug(slug)}
              width={40}
              height={40}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid var(--amber)",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          color: "var(--fg-dim)",
          margin: 0,
        }}
      >
        {slugs.length} distinct {slugs.length === 1 ? "mind" : "minds"} consulted
      </p>
    </div>
  );
}

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

/* ── Static feature list shown in the free-user upgrade interstitial ── */
export const PRO_FEATURES = [
  { label: "Persistent library", detail: "every debate saved, searchable forever" },
  { label: "Opus consensus", detail: "strongest model for the final recommendation" },
  { label: "5 minds per agon", detail: "free tier stops at 3" },
  { label: "PDF export + extended research", detail: "full transcript and deep-dive mode" },
  { label: "48-hour founder support", detail: "direct email to the builder" },
] as const;

/* ── Two ghost rows that preview what a Pro library looks like ────── */
export const GHOST_ROWS = [
  {
    topic: "Should I expand to a new market?",
    minds: "Newton · Seneca · Machiavelli",
    date: "May 10",
  },
  {
    topic: "How do I know when to pivot vs. persist?",
    minds: "Lincoln · Carnegie · Aurelius",
    date: "May 8",
  },
] as const;

export function UpgradePrompt() {
  return (
    <div
      data-testid="upgrade-prompt"
      style={{
        maxWidth: "620px",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      {/* ── Lock card ── */}
      <div
        style={{
          border: "1px solid var(--hairline)",
          borderRadius: "8px 8px 0 0",
          padding: "28px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <p
          className="font-mono"
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
            fontWeight: 400,
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
            fontSize: "14px",
            lineHeight: 1.65,
            color: "var(--fg-dim)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Free debates disappear after the session. Pro saves every agon to a
          permanent private archive you can search, export, and revisit.
        </p>

        {/* Feature list */}
        <ul
          data-testid="upgrade-feature-list"
          style={{
            listStyle: "none",
            margin: "4px 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "7px",
          }}
        >
          {PRO_FEATURES.map(({ label, detail }) => (
            <li
              key={label}
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "var(--fg-dim)",
                display: "flex",
                gap: "10px",
                alignItems: "baseline",
              }}
            >
              <span style={{ color: "var(--amber)", flexShrink: 0 }}>✓</span>
              <span>
                <span style={{ color: "var(--fg)" }}>{label}</span>
                {" — "}
                {detail}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "6px" }}>
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
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              color: "var(--fg-dim)",
              letterSpacing: "0.06em",
            }}
          >
            $30/mo · $300/yr · 7-day trial
          </span>
        </div>
      </div>

      {/* ── Ghost preview ── */}
      <div
        data-testid="library-ghost-preview"
        style={{
          border: "1px solid var(--hairline)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* "Sample library" label */}
        <div
          className="font-mono"
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid var(--hairline)",
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            background: "color-mix(in srgb, var(--hairline) 30%, transparent)",
          }}
        >
          Sample library
        </div>

        {/* Column headers */}
        <div
          className="font-mono"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "24px",
            padding: "8px 16px",
            fontSize: "9px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            borderBottom: "1px solid var(--hairline)",
            opacity: 0.6,
          }}
        >
          <span>Topic</span>
          <span>Minds</span>
          <span>Date</span>
        </div>

        {/* Ghost rows */}
        {GHOST_ROWS.map(({ topic, minds, date }) => (
          <div
            key={topic}
            data-testid="ghost-row"
            className="font-mono"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: "24px",
              padding: "10px 16px",
              fontSize: "11px",
              color: "var(--fg-dim)",
              borderBottom: "1px solid var(--hairline)",
              opacity: 0.45,
              userSelect: "none",
            }}
          >
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)" }}>
              {topic}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{minds}</span>
            <span>{date}</span>
          </div>
        ))}

        {/* Gradient fade overlay signalling "more below" */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "48px",
            background:
              "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--bg) 80%, transparent))",
            pointerEvents: "none",
          }}
        />
      </div>
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

  const stats = getLibraryProgressStats(agons);
  const upsellNudge = getLibraryUpsellNudge(stats.savedDebates);
  const consultedSlugs = getConsultedMindSlugs(agons);

  return (
    <>
      {/* Live proof strip — below title, above the consultation list */}
      <div
        style={{
          marginBottom: "28px",
          paddingBottom: "18px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <LibraryProofStrip stats={stats} />
      </div>

      <ConsultedMindsStrip slugs={consultedSlugs} />

      {upsellNudge && (
        <div
          style={{
            border: `1px solid ${upsellNudge.kind === "cap-reached" ? "var(--amber)" : "var(--hairline)"}`,
            borderRadius: "6px",
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--amber)",
              margin: 0,
            }}
          >
            {upsellNudge.kind === "cap-reached" ? "Monthly limit reached" : "Running low"}
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              margin: 0,
            }}
          >
            {upsellNudge.message}
          </p>
        </div>
      )}

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
