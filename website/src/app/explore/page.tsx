/**
 * /explore — public gallery of agons.
 *
 * SEO + engagement surface that complements the per-agon /agora/a/<id>
 * landing pages: every public agon is one card, the gallery is one
 * crawlable page, and every outbound link carries the documented UTM
 * tags so attribution survives.
 *
 * Layout:
 *   - Server component fetches up to 200 public-safe AgonRecords via
 *     db.getPublicAgons({ limit: 200 }) and maps them to the lighter
 *     ExploreCard shape the client component consumes.
 *   - ExploreClient renders the chip strip + search box + card grid +
 *     bottom CTA. All filter logic is client-side because the seed is
 *     small and the chip strip needs to feel snappy.
 *   - 0-row case shows a friendly "No public agons yet" message.
 *   - DB errors degrade to the empty state rather than 500-ing.
 *
 * Generates metadata for social previews + sets robots index:true so
 * Google can crawl. Sitemap entry is added by the follow-up capsule
 * once 9ce6ed47 (sitemap-public-agons) merges and unlocks sitemap.ts.
 */
import type { Metadata } from "next";

import { db, type PublicAgonRecord } from "@/lib/db/client";
import {
  ALLOWED_SLUGS,
  SLUG_COLOR_VAR,
  getFramework,
  type FrameworkSlug,
} from "@/lib/frameworks";

import { ExploreClient, type MindChip } from "./ExploreClient";
import type { ExploreCard } from "@/lib/explore-filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_ORIGIN = "https://www.consultthedead.com";

export const metadata: Metadata = {
  title: "Explore agons · Consult The Dead",
  description:
    "Browse public agons — debates between historical minds on real questions. Filter by mind, search by topic, and start your own.",
  alternates: { canonical: `${SITE_ORIGIN}/explore` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Explore agons · Consult The Dead",
    description:
      "Public debates between historical minds on real questions. Browse, filter, and start your own.",
    url: `${SITE_ORIGIN}/explore`,
    type: "website",
    siteName: "Consult The Dead",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore agons · Consult The Dead",
    description:
      "Public debates between historical minds. Browse, filter, and start your own.",
  },
};

/* ── Server-side data prep ─────────────────────────────────────── */

interface MindMeta {
  slug: string;
  name: string;
  colorVar: string;
}

let mindMetaCache: Map<string, MindMeta> | null = null;

function getMindMetaMap(): Map<string, MindMeta> {
  if (mindMetaCache) return mindMetaCache;
  const map = new Map<string, MindMeta>();
  for (const slug of ALLOWED_SLUGS) {
    const fw = getFramework(slug);
    if (!fw) continue;
    map.set(slug, {
      slug,
      name: fw.meta.person ?? slug,
      colorVar: SLUG_COLOR_VAR[slug as FrameworkSlug] ?? "var(--fg)",
    });
  }
  mindMetaCache = map;
  return map;
}

function slugToFallbackName(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function lookupMind(slug: string): MindMeta {
  return (
    getMindMetaMap().get(slug) ?? {
      slug,
      name: slugToFallbackName(slug),
      colorVar: "var(--fg)",
    }
  );
}

/**
 * Map the DB row shape to the client-side ExploreCard shape. Strips
 * fields the gallery never reads (turns, consensus, research) so the
 * client bundle stays small.
 */
function toExploreCard(row: PublicAgonRecord): ExploreCard {
  return {
    shareId: row.share_id,
    topic: row.topic,
    mindSlugs: Array.isArray(row.mind_slugs) ? row.mind_slugs : [],
    createdAt: row.created_at,
  };
}

/**
 * Build the chip strip from the live framework roster so the chip
 * set stays in sync with ALLOWED_SLUGS and never references a hidden
 * mind (e.g. albert-einstein during legal review).
 */
function buildChips(): MindChip[] {
  return ALLOWED_SLUGS.map((slug) => {
    const meta = lookupMind(slug);
    return {
      slug,
      name: meta.name,
      colorVar: meta.colorVar,
    };
  });
}

async function loadCards(): Promise<ExploreCard[]> {
  try {
    const rows = await db.getPublicAgons({ limit: 200 });
    return rows.map(toExploreCard);
  } catch (err) {
    // Surface the error to the server log; degrade the page to the
    // empty-state message rather than throwing a 500.
    console.error("[/explore] failed to load public agons:", err);
    return [];
  }
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function ExplorePage() {
  const cards = await loadCards();
  const chips = buildChips();

  // Hydrate display metadata (mind names + colors) on the server so
  // the client component does not re-import the framework loader.
  const mindMetaBySlug: Record<string, { name: string; colorVar: string }> = {};
  for (const card of cards) {
    for (const slug of card.mindSlugs) {
      if (mindMetaBySlug[slug]) continue;
      const meta = lookupMind(slug);
      mindMetaBySlug[slug] = { name: meta.name, colorVar: meta.colorVar };
    }
  }
  for (const chip of chips) {
    if (mindMetaBySlug[chip.slug]) continue;
    mindMetaBySlug[chip.slug] = { name: chip.name, colorVar: chip.colorVar };
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "48px 24px 96px",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ margin: "0 0 32px" }}>
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
              fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              margin: "0 0 16px",
            }}
          >
            Explore agons
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              maxWidth: "60ch",
              margin: 0,
            }}
          >
            Public debates between historical minds on real questions.
            Filter by mind, search by topic, then start your own.
          </p>
        </header>

        <ExploreClient
          cards={cards}
          chips={chips}
          mindMetaBySlug={mindMetaBySlug}
        />
      </div>
    </main>
  );
}
