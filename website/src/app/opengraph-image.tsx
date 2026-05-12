/**
 * Static Open Graph image for the homepage root (/).
 *
 * Uses the Next.js file convention for root OG images. The composition
 * surfaces the core CTD value proposition: a council of historical minds
 * rendering structured disagreement from documented decision frameworks.
 *
 * Follows the same Satori/ImageResponse pattern as /frameworks/ and
 * /frameworks/[slug]/ so all social share surfaces stay visually coherent.
 */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt =
  "Consult The Dead — Unlock the minds of history's greatest thinkers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#191410";
const BG_DEEP = "#120d0a";
const BG_PANEL = "#241b15";
const FG = "#f0e2cf";
const FG_DIM = "#c2ab95";
const FG_FAINT = "#8e7362";
const HAIRLINE = "#3b2d23";
const ACCENT = "#d4a017";

const FEATURED_MINDS = [
  { name: "Sun Tzu", era: "544–496 BC", color: "#5a8a5a" },
  { name: "Machiavelli", era: "1469–1527", color: "#c9664e" },
  { name: "Marie Curie", era: "1867–1934", color: "#8a9a4a" },
  { name: "Isaac Newton", era: "1643–1727", color: "#6a7abf" },
  { name: "Marcus Aurelius", era: "121–180 AD", color: "#b08050" },
];

function HomepageBody() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at top left, ${BG_PANEL} 0%, ${BG} 40%, ${BG_DEEP} 100%)`,
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
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
            Consult The Dead
          </p>
        </div>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: "999px",
            border: `1px solid ${HAIRLINE}`,
            color: FG_DIM,
            fontSize: "13px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          consultthedead.com
        </span>
      </div>

      {/* Centre content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "48px",
          alignItems: "center",
          paddingTop: "32px",
        }}
      >
        {/* Left — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: "1.2 1 0",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: FG_FAINT,
              fontWeight: 600,
            }}
          >
            Multi-framework decision support
          </div>

          <h1
            style={{
              fontFamily:
                '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
              fontStyle: "italic",
              fontSize: "62px",
              lineHeight: 1.06,
              margin: 0,
              color: FG,
            }}
          >
            Unlock the minds of history&apos;s greatest thinkers.
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.55,
              color: FG_DIM,
              margin: 0,
              maxWidth: "560px",
            }}
          >
            Bring your hardest decision. We seat Newton, Machiavelli, Curie, and
            more — and let them argue it out on your behalf.
          </p>

          {/* Accent rule */}
          <div
            style={{
              width: "56px",
              height: "3px",
              background: ACCENT,
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Right — mind chips */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flex: "0.8 1 0",
          }}
        >
          {FEATURED_MINDS.map((mind) => (
            <div
              key={mind.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                background: BG_PANEL,
                border: `1px solid ${HAIRLINE}`,
                borderLeft: `4px solid ${mind.color}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: mind.color,
                    letterSpacing: "0.04em",
                  }}
                >
                  {mind.name}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: FG_FAINT,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {mind.era}
                </span>
              </div>
            </div>
          ))}
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
        <span>27 minds · extracted via Critical Decision Method</span>
        <span>consultthedead.com</span>
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(<HomepageBody />, size);
}
