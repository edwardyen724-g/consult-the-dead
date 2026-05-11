/**
 * Dynamic Open Graph image for /frameworks/[slug].
 *
 * The composition mirrors the Council card structure used throughout
 * the framework surfaces: a portrait-led tile, a strong nameplate, a
 * concise perceptual lens excerpt, and a few evidence chips so social
 * shares stay specific to the selected mind.
 */
import { ImageResponse } from "next/og";

import { ALLOWED_SLUGS, getFramework, getValidation } from "@/lib/frameworks";
import type { FrameworkSlug } from "@/lib/frameworks";
import {
  DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN,
  FRAMEWORK_OG_IMAGE_SIZE,
} from "@/lib/framework-og-image";

export const runtime = "nodejs";
export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;
export const revalidate = 3600;
export const alt = "A framework detail card from Consult The Dead";
export const size = FRAMEWORK_OG_IMAGE_SIZE;
export const contentType = "image/png";

const BG = "#191410";
const BG_DEEP = "#120d0a";
const BG_PANEL = "#241b15";
const FG = "#f0e2cf";
const FG_DIM = "#c2ab95";
const FG_FAINT = "#8e7362";
const HAIRLINE = "#3b2d23";
const ACCENT = "#d4a017";

const HIGHLIGHT_BY_SLUG: Record<string, string> = {
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
  seneca: "#8b7355",
};

type RouteProps = { params: Promise<{ slug: string }> };

function truncate(input: string, maxLen: number): string {
  const trimmed = (input ?? "").trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1).trimEnd() + "…";
}

function accentFor(slug: string): string {
  return HIGHLIGHT_BY_SLUG[slug] ?? ACCENT;
}

function validationCopy(slug: FrameworkSlug): string | null {
  const validation = getValidation(slug);
  if (!validation) return null;
  if (validation.passed) {
    return `Tier 1 validated · ${validation.divergent_count}/${validation.total_scenarios} divergent scenarios`;
  }
  return `Tier 1 reviewed · ${validation.divergent_count}/${validation.total_scenarios} divergent scenarios`;
}

function genericBody() {
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
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p
            style={{
              fontSize: "16px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: FG_FAINT,
              fontWeight: 600,
              margin: 0,
            }}
          >
            The Council
          </p>
          <h1
            style={{
              fontSize: "44px",
              lineHeight: 1,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Consult The Dead
          </h1>
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
          Framework detail
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: "840px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: FG_FAINT,
            }}
          >
            Public framework shares
          </div>
          <h2
            style={{
              fontFamily:
                '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
              fontStyle: "italic",
              fontSize: "58px",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Bring a hard decision to the Council.
          </h2>
          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.5,
              color: FG_DIM,
              margin: 0,
            }}
          >
            Historical minds, extracted from documented incidents and rendered
            into shareable decision frameworks.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
        <span>consultthedead.com/frameworks</span>
      </div>
    </div>
  );
}

function frameworkBody(slug: FrameworkSlug) {
  const fw = getFramework(slug);
  if (!fw) return genericBody();

  const color = accentFor(slug);
  const validation = validationCopy(slug);
  const constructCount = fw.meta.construct_count ?? fw.bipolar_constructs.length;
  const incidentCount = fw.meta.incident_count;
  const constructs = fw.bipolar_constructs.slice(0, 3);
  const lens = truncate(fw.perceptual_lens.statement, 200);
  const portraitUrl = new URL(
    `/portraits/${slug}-portrait.png`,
    DEFAULT_FRAMEWORK_OG_IMAGE_ORIGIN,
  ).toString();

  return (
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
              fontSize: "16px",
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
            gap: "8px",
            padding: "8px 16px",
            border: `1px solid ${color}`,
            borderRadius: "999px",
            color,
            fontSize: "13px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {validation ?? "Tier 1 validated"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flex: 1,
          paddingTop: "36px",
        }}
      >
        <div
          style={{
            width: "282px",
            height: "282px",
            flex: "0 0 auto",
            padding: "10px",
            borderRadius: "28px",
            background: BG_PANEL,
            border: `1px solid ${HAIRLINE}`,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={portraitUrl}
            alt={fw.meta.person}
            width={262}
            height={262}
            style={{
              width: "262px",
              height: "262px",
              borderRadius: "22px",
              objectFit: "cover",
              display: "block",
              border: `2px solid ${color}`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            flex: 1,
            maxWidth: "780px",
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
            Decision Framework
          </p>
          <h1
            style={{
              fontFamily:
                '"Iowan Old Style", "Hoefler Text", "Times New Roman", Times, serif',
              fontStyle: "italic",
              fontSize: `${fw.meta.person.length > 20 ? 52 : 66}px`,
              lineHeight: 1.08,
              color,
              margin: 0,
            }}
          >
            {fw.meta.person}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              color: FG_DIM,
              fontSize: "18px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>{fw.meta.domain}</span>
            <span>•</span>
            <span>{fw.era}</span>
            <span>•</span>
            <span>{constructCount} constructs</span>
            <span>•</span>
            <span>{incidentCount} incidents</span>
          </div>
          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.45,
              color: FG,
              maxWidth: "760px",
              margin: 0,
            }}
          >
            {lens}
          </p>

          {constructs.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "6px",
              }}
            >
              {constructs.map((construct) => (
                <span
                  key={construct.construct}
                  style={{
                    display: "flex",
                    padding: "10px 14px",
                    background: BG_PANEL,
                    border: `1px solid ${HAIRLINE}`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: "8px",
                    color: color,
                    fontSize: "16px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {truncate(construct.construct, 34)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

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
        <span>{`consultthedead.com/frameworks/${slug}`}</span>
      </div>
    </div>
  );
}

export default async function Image({ params }: RouteProps) {
  const { slug } = await params;
  const normalizedSlug = slug as FrameworkSlug;

  return new ImageResponse(
    frameworkBody(normalizedSlug),
    FRAMEWORK_OG_IMAGE_SIZE,
  );
}
