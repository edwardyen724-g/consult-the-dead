/**
 * Static Open Graph image for /essay.
 *
 * Branded card for the "Consulting the Dead, Not Distilling the Living"
 * essay page. Uses the dark parchment palette shared across the site's
 * social-share surfaces so all links look intentional in social feeds.
 */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Consulting the Dead, Not Distilling the Living — Consult The Dead";
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

function EssayBody() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at top left, ${BG_PANEL} 0%, ${BG} 40%, ${BG_DEEP} 100%)`,
        padding: "64px 72px",
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
          Essay
        </span>
      </div>

      {/* Centre content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
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
            The Operation We Are Doing Instead
          </div>

          <h1
            style={{
              fontFamily:
                '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
              fontStyle: "italic",
              fontSize: "60px",
              lineHeight: 1.1,
              margin: 0,
              color: FG,
            }}
          >
            Consulting the Dead,
            <br />
            Not Distilling the Living.
          </h1>

          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.5,
              color: FG_DIM,
              margin: 0,
              maxWidth: "680px",
            }}
          >
            Why we extract decision frameworks from documented history rather
            than imitate style or paraphrase quotes.
          </p>

          {/* Accent rule */}
          <div
            style={{
              width: "64px",
              height: "3px",
              background: ACCENT,
              borderRadius: "2px",
              marginTop: "4px",
            }}
          />
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
        <span>consultthedead.com/essay</span>
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(<EssayBody />, size);
}
