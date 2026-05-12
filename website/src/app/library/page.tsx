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

const PRO_FEATURES = [
  "Unlimited saved debates",
  "Access to all 25+ minds",
  "Opus-powered synthesis",
  "100 agons/month",
] as const;

export function GhostLibraryRows() {
  const rows = [
    { topic: "Should we enter the European market now?", minds: "Sun Tzu · Machiavelli", date: "May 8, 2026" },
    { topic: "How to structure our Series A fundraise", minds: "Benjamin Franklin · Warren Buffett", date: "May 5, 2026" },
    { topic: "Build vs. buy: our data infrastructure", minds: "Leonardo da Vinci · Nikola Tesla", date: "Apr 29, 2026" },
  ];

  return (
    <div
      data-testid="ghost-library-rows"
      style={{
        position: "relative",
        marginTop: "32px",
        borderTop: "1px solid var(--hairline)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Lock overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "28px",
            opacity: 0.5,
          }}
        >
          🔒
        </span>
      </div>

      {/* Ghost rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          data-testid="ghost-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "24px",
            alignItems: "center",
            padding: "20px 0",
            borderBottom: "1px solid var(--hairline)",
            opacity: 0.3,
            filter: "blur(2px)",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                lineHeight: 1.4,
                color: "var(--fg)",
                margin: "0 0 6px",
              }}
            >
              {row.topic}
            </p>
            <p
              className="font-mono"
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                color: "var(--fg-dim)",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {row.minds}
            </p>
          </div>
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              whiteSpace: "nowrap",
            }}
          >
            {row.date}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UpgradePrompt() {
  return (
    <div>
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

        {/* Feature preview list */}
        <ul
          data-testid="pro-feature-list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: "4px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {PRO_FEATURES.map((feature) => (
            <li
              key={feature}
              data-testid="pro-feature-item"
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--fg-dim)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: "var(--amber)" }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href="/pricing?utm_campaign=library_gate"
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

      <GhostLibraryRows />
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
