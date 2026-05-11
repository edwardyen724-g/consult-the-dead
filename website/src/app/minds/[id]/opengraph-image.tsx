/**
 * Dynamic Open Graph image for /minds/[id].
 *
 * Shows the mind's portrait (when a portrait PNG exists in /public/portraits/),
 * name, "famous-for" tagline, and how-they-argue excerpt on a dark parchment
 * card — giving social shares a specific, intentional preview.
 *
 * Mirrors the palette and composition conventions used by
 * /frameworks/[slug]/opengraph-image.tsx. All flex containers use
 * `display: "flex"` (never "inline-flex") as required by ImageResponse.
 */
import { ImageResponse } from "next/og";

import { getMindContent, isMindSlug, MIND_SLUGS, SITE_URL } from "@/lib/mind-content";

export const runtime = "nodejs";
export function generateStaticParams() {
  return MIND_SLUGS.map((id) => ({ id }));
}
export const dynamicParams = false;
export const revalidate = 3600;
export const alt = "A mind profile card from Consult The Dead";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

/* ── Palette (dark parchment) ── */
const BG = "#191410";
const BG_DEEP = "#120d0a";
const BG_PANEL = "#241b15";
const FG = "#f0e2cf";
const FG_DIM = "#c2ab95";
const FG_FAINT = "#8e7362";
const HAIRLINE = "#3b2d23";
const ACCENT = "#d4a017";

/** Slugs that have a matching portrait PNG in /public/portraits/. */
const PORTRAIT_SLUGS = new Set([
  "ada-lovelace",
  "alexander-the-great",
  "archimedes",
  "benjamin-franklin",
  "catherine-the-great",
  "cicero",
  "cleopatra-vii",
  "epictetus",
  "harriet-tubman",
  "isaac-newton",
  "john-d-rockefeller",
  "leonardo-da-vinci",
  "marcus-aurelius",
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "seneca",
  "sun-tzu",
  "thomas-edison",
]);

function hasPortrait(slug: string): boolean {
  return PORTRAIT_SLUGS.has(slug);
}

function truncate(input: string, maxLen: number): string {
  const trimmed = (input ?? "").trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1).trimEnd() + "…";
}

type RouteProps = { params: Promise<{ id: string }> };

export default async function Image({ params }: RouteProps) {
  const { id } = await params;

  if (!isMindSlug(id)) {
    /* Generic fallback for any unexpected slug that sneaks through. */
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: FG,
            fontSize: "48px",
          }}
        >
          Consult The Dead
        </div>
      ),
      size,
    );
  }

  const mind = getMindContent(id);

  if (!mind) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: FG,
            fontSize: "48px",
          }}
        >
          Consult The Dead
        </div>
      ),
      size,
    );
  }

  const portraitUrl = hasPortrait(id)
    ? `${SITE_URL}/portraits/${id}-portrait.png`
    : null;

  /* Extract name from h1 (format: "Name — tagline"). */
  const nameFromH1 = mind.h1.split("—")[0].split("–")[0].trim();
  const howTheyArgueExcerpt = truncate(mind.howTheyArgue, 180);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${BG} 0%, ${BG_DEEP} 100%)`,
          padding: "56px 64px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: FG,
        }}
      >
        {/* Header row */}
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
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BG_DEEP,
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              CTD
            </div>
            <p
              style={{
                fontSize: "16px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: FG_DIM,
                fontWeight: 600,
                margin: 0,
              }}
            >
              The Council
            </p>
          </div>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderRadius: "999px",
              border: `1px solid ${ACCENT}`,
              color: ACCENT,
              fontSize: "13px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Mind Profile
          </span>
        </div>

        {/* Main content row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
            flex: 1,
            paddingTop: "36px",
          }}
        >
          {/* Portrait */}
          {portraitUrl && (
            <div
              style={{
                width: "282px",
                height: "282px",
                flex: "0 0 auto",
                padding: "10px",
                borderRadius: "28px",
                background: BG_PANEL,
                border: `1px solid ${HAIRLINE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={portraitUrl}
                alt={nameFromH1}
                width={262}
                height={262}
                style={{
                  width: "262px",
                  height: "262px",
                  borderRadius: "22px",
                  objectFit: "cover",
                  display: "block",
                  border: `2px solid ${ACCENT}`,
                }}
              />
            </div>
          )}

          {/* Text column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              flex: 1,
              maxWidth: portraitUrl ? "780px" : "100%",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: FG_FAINT,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Historical Mind
            </p>

            <h1
              style={{
                fontFamily:
                  '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
                fontStyle: "italic",
                fontSize: `${nameFromH1.length > 22 ? 52 : 66}px`,
                lineHeight: 1.08,
                color: ACCENT,
                margin: 0,
              }}
            >
              {nameFromH1}
            </h1>

            <p
              style={{
                fontSize: "20px",
                lineHeight: 1.4,
                color: FG_DIM,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {truncate(mind.famousFor, 90)}
            </p>

            <p
              style={{
                fontSize: "19px",
                lineHeight: 1.45,
                color: FG,
                maxWidth: "760px",
                margin: 0,
              }}
            >
              {howTheyArgueExcerpt}
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: "18px",
            color: FG_FAINT,
            fontSize: "14px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span>Consult The Dead</span>
          <span>{`consultthedead.com/minds/${id}`}</span>
        </div>
      </div>
    ),
    size,
  );
}
