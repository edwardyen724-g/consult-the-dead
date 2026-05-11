/**
 * Dynamic Open Graph image for /agora/a/[id].
 *
 * Renders a 1200×630 PNG via `next/og`'s `ImageResponse` so every
 * shared agon URL gets a topic-rich preview on Twitter, LinkedIn,
 * iMessage, Slack, etc. Twitter's `summary_large_image` card
 * specification expects this exact size.
 *
 * Design:
 *   - Dark brown / parchment palette matching the live site
 *     (`globals.css` dark-theme values, with literal hex codes here
 *     because ImageResponse cannot resolve CSS custom properties).
 *   - System fonts only (`-apple-system, ...`) — no external font
 *     fetch so the route is fast and never blocks on a 3rd-party CDN.
 *   - Topic centered in large serif italic; up to three Council mind
 *     names below in color-accented chips; a "Council Consensus"
 *     pill badge top-right; brand strip at the bottom.
 *
 * If the share id does not resolve (db error, unknown id), we still
 * return a valid 1200×630 image with a generic "Consult The Dead —
 * The Agora" tagline so social embeds never display a broken image.
 *
 * Capsule: bdcb79ca · Task: fd349805 · Initiative: 16799287.
 */
import { ImageResponse } from "next/og";

import { db, type PublicAgonRecord } from "@/lib/db/client";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og-image-url";

export const runtime = "nodejs";
// Re-render on demand. The PublicAgonRecord is small so the work is
// dominated by Satori (text → SVG → PNG); aggressive caching at the
// CDN layer is fine.
export const revalidate = 3600;
export const alt = "An agon from Consult The Dead — The Agora";
export const size = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
export const contentType = "image/png";

/* ── Palette (hex literals — ImageResponse cannot read CSS vars) ── */

const BG = "#1f1812";
const BG_DEEP = "#171108";
const FG = "#e8d8c0";
const FG_DIM = "#b09080";
const FG_FAINT = "#80604a";
const HAIRLINE = "#3a2c20";
const AMBER = "#d4a017";

/**
 * Slug → accent hex used by the dark-theme `globals.css`. Kept inline
 * because ImageResponse evaluates styles at render time and can only
 * accept literal color values, not `var(--color-...)`.
 */
const SLUG_HEX: Record<string, string> = {
  "isaac-newton": "#6a7abf",
  "marie-curie": "#8a9a4a",
  "niccolo-machiavelli": "#c9664e",
  "nikola-tesla": "#4aadbd",
  "leonardo-da-vinci": "#b09040",
  "sun-tzu": "#5a8a5a",
  "marcus-aurelius": "#b08050",
  "benjamin-franklin": "#d4a017",
  cicero: "#b03a3a",
  epictetus: "#c8a878",
  "thomas-edison": "#e0a020",
  archimedes: "#3a8ab0",
  "john-d-rockefeller": "#2f6b4a",
  "harriet-tubman": "#7a4aa0",
  "ada-lovelace": "#a888d0",
  "catherine-the-great": "#d4a830",
  "alexander-the-great": "#b07840",
  "cleopatra-vii": "#2f8085",
};

/* ── Helpers ─────────────────────────────────────────────────────── */

function colorFor(slug: string): string {
  return SLUG_HEX[slug] ?? FG;
}

function nameFor(slug: string): string {
  // Title-case the slug as a fallback display name. The DB row
  // doesn't ship a denormalized mind name and pulling the full
  // framework JSON for the OG image is wasted work — the slug-cased
  // name is what every share preview already shows.
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function truncate(input: string, maxLen: number): string {
  const t = (input ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trimEnd() + "…";
}

/**
 * Pick a display-friendly font size (px) for the topic. Long topics
 * shrink so the layout never overflows the 1200×630 canvas.
 */
function topicFontSize(topic: string): number {
  const len = topic.length;
  if (len <= 60) return 64;
  if (len <= 120) return 50;
  if (len <= 200) return 40;
  return 34;
}

async function loadAgon(id: string): Promise<PublicAgonRecord | null> {
  if (!id || typeof id !== "string") return null;
  try {
    return await db.getPublicAgonByShareId(id);
  } catch {
    return null;
  }
}

/* ── Route handler ───────────────────────────────────────────────── */

type RouteProps = { params: Promise<{ id: string }> };

export default async function Image({ params }: RouteProps) {
  const { id } = await params;
  const agon = await loadAgon(id);

  const topic = agon
    ? truncate(agon.topic ?? "", 240)
    : "An agon from Consult The Dead";
  const slugs = (agon?.mind_slugs ?? []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${BG} 0%, ${BG_DEEP} 100%)`,
          padding: "64px 72px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: FG,
          position: "relative",
        }}
      >
        {/* Top row: brand mark + Consensus pill */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                background: AMBER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.7 8.3L21 11L14.7 13.7L12 20L9.3 13.7L3 11L9.3 8.3L12 2Z"
                  fill={BG_DEEP}
                />
              </svg>
            </div>
            <div
              style={{
                fontSize: "16px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: FG_DIM,
                fontWeight: 600,
              }}
            >
              The Agora
            </div>
          </div>

          {agon && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                border: `1px solid ${AMBER}`,
                borderRadius: "999px",
                color: AMBER,
                fontSize: "14px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Council Consensus
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flexGrow: 1 }} />

        {/* Topic */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxWidth: "1056px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: FG_FAINT,
              fontWeight: 600,
            }}
          >
            The Question
          </div>
          <div
            style={{
              fontFamily:
                '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
              fontStyle: "italic",
              fontSize: `${topicFontSize(topic)}px`,
              lineHeight: 1.2,
              color: FG,
            }}
          >
            {`“${topic}”`}
          </div>
        </div>

        {/* Council chips */}
        {slugs.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "40px",
            }}
          >
            {slugs.map((slug) => {
              const accent = colorFor(slug);
              return (
                <div
                  key={slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 18px",
                    background: `${BG_DEEP}`,
                    border: `1px solid ${HAIRLINE}`,
                    borderLeft: `4px solid ${accent}`,
                    borderRadius: "4px",
                    color: accent,
                    fontSize: "20px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {nameFor(slug)}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer / brand strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "44px",
            paddingTop: "20px",
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: FG_DIM,
              fontWeight: 600,
            }}
          >
            Consult The Dead
          </div>
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: FG_FAINT,
              fontWeight: 600,
            }}
          >
            consultthedead.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
