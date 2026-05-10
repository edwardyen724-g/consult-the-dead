import { ImageResponse } from "next/og";

import {
  buildListicleShareCardCopy,
  LISTICLE_SHARE_IMAGE_HEIGHT,
  LISTICLE_SHARE_IMAGE_WIDTH,
  loadListicleContent,
} from "@/lib/listicle-content";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Consult The Dead listicle share card";
export const size = {
  width: LISTICLE_SHARE_IMAGE_WIDTH,
  height: LISTICLE_SHARE_IMAGE_HEIGHT,
};
export const contentType = "image/png";

const BG = "#1f1812";
const BG_DARK = "#120d08";
const FG = "#f0e1cd";
const FG_DIM = "#c0a98f";
const FG_FAINT = "#8b7057";
const HAIRLINE = "#3a2c20";
const AMBER = "#d4a017";

type RouteProps = { params: Promise<{ slug: string }> };

function splitCouncilCue(councilCue: string): string[] {
  return councilCue.split(" · ").filter(Boolean);
}

export default async function Image({ params }: RouteProps) {
  const { slug } = await params;
  const content = loadListicleContent(slug);
  const copy = buildListicleShareCardCopy(content, slug);
  const cueParts = splitCouncilCue(copy.councilCue);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 68px",
          color: FG,
          background: `radial-gradient(circle at 18% 18%, rgba(212,160,23,0.18) 0%, rgba(212,160,23,0) 34%), linear-gradient(135deg, ${BG} 0%, ${BG_DARK} 100%)`,
          fontFamily:
            'Georgia, "Times New Roman", "Iowan Old Style", "Palatino Linotype", serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: `1px solid ${HAIRLINE}`,
            borderRadius: "32px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-120px",
            bottom: "-140px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            border: "1px solid rgba(212,160,23,0.12)",
            opacity: 0.9,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "48px",
            zIndex: 1,
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
                borderRadius: "6px",
                background: AMBER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BG_DARK,
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              ✦
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <div
                style={{
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "12px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: FG_DIM,
                  fontWeight: 600,
                }}
              >
                Consult The Dead
              </div>
              <div
                style={{
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "10px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: FG_FAINT,
                }}
              >
                Listicle share card
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "10px 16px",
              border: `1px solid ${AMBER}`,
              borderRadius: "999px",
              color: AMBER,
              fontFamily:
                '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Long-tail SEO
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "36px",
            flex: 1,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              maxWidth: "760px",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                width: "fit-content",
                borderRadius: "999px",
                border: `1px solid ${HAIRLINE}`,
                color: FG_DIM,
                fontFamily:
                  '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {copy.eyebrow}
            </div>

            <div
              style={{
                fontSize: "68px",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                fontWeight: 500,
                maxWidth: "720px",
                textWrap: "balance",
              }}
            >
              {copy.title}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingLeft: "18px",
                borderLeft: `3px solid ${AMBER}`,
                maxWidth: "680px",
              }}
            >
              <div
                style={{
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: FG_FAINT,
                  fontWeight: 700,
                }}
              >
                {copy.councilCueLabel}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  lineHeight: 1.35,
                  color: FG,
                  fontWeight: 500,
                }}
              >
                {copy.councilCue}
              </div>
              {cueParts.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {cueParts.map((part) => (
                    <span
                      key={part}
                      style={{
                        padding: "6px 10px",
                        border: `1px solid ${HAIRLINE}`,
                        borderRadius: "999px",
                        fontFamily:
                          '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: FG_DIM,
                      }}
                    >
                      {part}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              width: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                padding: "24px 22px",
                background: "rgba(18, 13, 8, 0.72)",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: "24px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: FG_FAINT,
                  fontWeight: 700,
                }}
              >
                CTA
              </div>
              <div
                style={{
                  fontSize: "28px",
                  lineHeight: 1.08,
                  fontWeight: 500,
                  color: FG,
                }}
              >
                {copy.ctaHeadline}
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: AMBER,
                  color: BG_DARK,
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {copy.ctaButtonLabel}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: FG_DIM,
                }}
              >
                {copy.ctaSubtext}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: "34px",
            zIndex: 1,
            color: FG_FAINT,
            fontFamily:
              '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Generated for social sharing</span>
          <span>1200 × 630</span>
        </div>
      </div>
    ),
    size,
  );
}
