import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, type AgonRecord } from "@/lib/db/client";
import {
  formatLibraryProgressStats,
  getLibraryProgressStats,
  getLibraryUpsellNudge,
} from "@/lib/library-stats";
import {
  PublicationSection,
  PublicationShell,
} from "./publication-surface";
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

  return await LibraryPublicationSurface({ isPro, userId });
}

async function LibraryPublicationSurface({
  isPro,
  userId,
}: {
  isPro: boolean;
  userId: string;
}) {
  return (
    <PublicationShell
      eyebrow="Library"
      title="Library"
      lead={
        isPro
          ? "Your saved debates live here in the same publication rhythm as the account and pricing surfaces."
          : "Upgrade to save debates, search the archive, and keep a permanent record of the decisions you already paid to reach."
      }
      stats={
        isPro
          ? [
              { label: "Archive", value: "Persistent and searchable" },
              { label: "Access", value: "Pro library unlocked" },
              { label: "Next step", value: "Return to the Agora" },
            ]
          : [
              { label: "Archive", value: "Upgrade to save debates" },
              { label: "Access", value: "Free users do not persist" },
              { label: "Next step", value: "Upgrade or keep debating" },
            ]
      }
      footerLinks={
        isPro
          ? [
              { href: "/agora", label: "Enter The Agora" },
              { href: "/account", label: "Manage Account" },
            ]
          : [
              { href: "/agora", label: "Enter The Agora" },
              { href: "/pricing", label: "View Pricing" },
            ]
      }
    >
      {!isPro ? (
        <UpgradePrompt />
      ) : (
        await ProLibrary({ userId })
      )}
    </PublicationShell>
  );
}

export const PRO_FEATURES = [
  { label: "Unlimited saved debates", detail: "No cap on your personal archive" },
  { label: "Access to all 25+ minds", detail: "Every historical figure in the council" },
  { label: "Opus-powered synthesis", detail: "Deepest reasoning, sharpest consensus" },
  { label: "100 agons/month", detail: "Enough for the decisions that matter" },
] as const;

export const GHOST_ROWS = [
  { topic: "Should we enter the European market now?", minds: "Sun Tzu · Machiavelli", date: "May 8, 2026" },
  { topic: "How to structure our Series A fundraise", minds: "Benjamin Franklin · Warren Buffett", date: "May 5, 2026" },
  { topic: "Build vs. buy: our data infrastructure", minds: "Leonardo da Vinci · Nikola Tesla", date: "Apr 29, 2026" },
] as const;

export function GhostLibraryRows() {
  const rows = GHOST_ROWS;

  return (
    <div
      data-testid="library-ghost-preview"
      style={{
        position: "relative",
        marginTop: "32px",
        borderTop: "1px solid var(--hairline)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: "9px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          margin: "16px 0 12px",
        }}
      >
        Sample library
      </p>
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
    <div data-testid="upgrade-prompt">
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
          data-testid="upgrade-feature-list"
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
              key={feature.label}
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
              <span>{feature.label}</span>
              <span style={{ opacity: 0.6 }}>{feature.detail}</span>
            </li>
          ))}
        </ul>

        {/* Pricing copy */}
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.08em",
            color: "var(--fg-dim)",
            margin: 0,
          }}
        >
          $30/mo · $300/yr · 7-day trial
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
  const progressLabels = formatLibraryProgressStats(stats);
  const upsellNudge = getLibraryUpsellNudge(stats.savedDebates);
  const consultedSlugs = getConsultedMindSlugs(agons);

  return (
    <>
      <PublicationSection
        eyebrow="Archive status"
        title="Saved debates"
        body={`You have ${stats.savedDebates} saved debate${stats.savedDebates === 1 ? "" : "s"} and ${stats.consultedMinds} consulted mind${stats.consultedMinds === 1 ? "" : "s"} in the archive.`}
      >
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
            gap: "12px",
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
      </PublicationSection>

      {upsellNudge && (
        <PublicationSection
          eyebrow={upsellNudge.kind === "cap-reached" ? "Monthly limit reached" : "Running low"}
          title="Keep the archive current"
          body={upsellNudge.message}
          accent={upsellNudge.kind === "cap-reached" ? "highlight" : "default"}
        >
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
        </PublicationSection>
      )}

      <PublicationSection
        eyebrow="Saved debates"
        title="Browse the archive"
        body="Search, sort, and open saved agons from the same publication system that introduced them."
      >
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
      </PublicationSection>
    </>
  );
}
