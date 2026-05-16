/**
 * Open Graph image for /pricing.
 *
 * Mirrors the public pricing page's canonical copy so social embeds
 * stay aligned with the live conversion surface.
 */
import { ImageResponse } from "next/og";

import {
  PRICING_CANONICAL_COPY,
  getPricingFoundingMemberSummary,
  getPricingFreeTierSummary,
  getPricingMetadataDescription,
  getPricingMetadataTitle,
  getPricingSharePreviewCard,
} from "@/lib/pricing-copy";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Pricing share card from Consult The Dead";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamicParams = false;

const BG = "#1e1711";
const BG_DEEP = "#130e0a";
const BG_PANEL = "#241a14";
const FG = "#f1e1cb";
const FG_DIM = "#c2ab95";
const FG_FAINT = "#8f7361";
const HAIRLINE = "#3a2c20";
const AMBER = "#d4a017";

function copyRows() {
  return [
    PRICING_CANONICAL_COPY.freeLimit,
    PRICING_CANONICAL_COPY.freeLimitReset,
    PRICING_CANONICAL_COPY.byoKey,
    PRICING_CANONICAL_COPY.foundingMember,
  ];
}

export default async function Image() {
  const title = getPricingMetadataTitle();
  const description = getPricingMetadataDescription();
  const card = getPricingSharePreviewCard();
  const rows = copyRows();

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
          background: `radial-gradient(circle at 20% 18%, rgba(212,160,23,0.18) 0%, rgba(212,160,23,0) 34%), linear-gradient(135deg, ${BG} 0%, ${BG_DEEP} 100%)`,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
            right: "-140px",
            bottom: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            border: "1px solid rgba(212,160,23,0.12)",
            opacity: 0.9,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
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
                color: BG_DEEP,
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
                Pricing share card
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
            summary_large_image
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "36px",
            flex: 1,
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: 1,
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                display: "flex",
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
              {title}
            </div>

            <div
              style={{
                fontSize: "66px",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                fontWeight: 500,
                maxWidth: "700px",
                textWrap: "balance",
              }}
            >
              Run your hardest decision through 30 historical minds.
            </div>

            <div
              style={{
                fontFamily:
                  'Georgia, "Times New Roman", "Iowan Old Style", serif',
                fontSize: "28px",
                lineHeight: 1.28,
                color: FG_DIM,
                maxWidth: "650px",
              }}
            >
              They&apos;ll disagree. You&apos;ll decide.
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {rows.map((row) => (
                <span
                  key={row}
                  style={{
                    padding: "9px 14px",
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: "999px",
                    fontFamily:
                      '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: FG,
                    background: BG_PANEL,
                  }}
                >
                  {row}
                </span>
              ))}
            </div>

            <div
              style={{
                fontSize: "18px",
                lineHeight: 1.5,
                color: FG_FAINT,
                maxWidth: "700px",
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              width: "306px",
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
                Pricing snapshot
              </div>
              <div
                style={{
                  fontSize: "30px",
                  lineHeight: 1.08,
                  fontWeight: 500,
                  color: FG,
                }}
              >
                {getPricingFreeTierSummary()}
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: AMBER,
                  color: BG_DEEP,
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Pro: founding-member pricing at $300/year
              </div>
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: FG_DIM,
                }}
              >
                {getPricingFoundingMemberSummary()}
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
            marginTop: "30px",
            zIndex: 1,
            color: FG_FAINT,
            fontFamily:
              '"JetBrains Mono", "SFMono-Regular", "Consolas", monospace',
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Consult The Dead pricing</span>
          <span>{card}</span>
        </div>
      </div>
    ),
    size,
  );
}
