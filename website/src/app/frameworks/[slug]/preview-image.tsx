import { ALLOWED_SLUGS, getFramework, type FrameworkSlug } from "@/lib/frameworks";

export type FrameworkPreviewMode = "opengraph" | "twitter";

const ACCENT_COLORS: Record<FrameworkSlug, string> = {
  "isaac-newton": "#6a7abf",
  "marie-curie": "#8a9a4a",
  "niccolo-machiavelli": "#c9664e",
  "nikola-tesla": "#4aadbd",
  "leonardo-da-vinci": "#b09040",
  "sun-tzu": "#5a8a5a",
  "marcus-aurelius": "#b08050",
  "benjamin-franklin": "#d4a017",
  "cicero": "#b03a3a",
  "epictetus": "#c8a878",
  "thomas-edison": "#e0a020",
  "archimedes": "#3a8ab0",
  "john-d-rockefeller": "#2f6b4a",
  "harriet-tubman": "#7a4aa0",
  "ada-lovelace": "#a888d0",
  "catherine-the-great": "#d4a830",
  "alexander-the-great": "#b07840",
  "cleopatra-vii": "#2f8085",
  // Roster expansion 2026-05 (task 8987b12a)
  "abraham-lincoln": "#4a6dbf",
  "andrew-carnegie": "#5a7080",
  "florence-nightingale": "#cf8a8e",
  "frederick-douglass": "#b86840",
  "julius-caesar": "#8f3a4a",
  "napoleon-bonaparte": "#3a5fa8",
  "seneca": "#7d8c5e",
};

export interface FrameworkPreviewData {
  slug: FrameworkSlug;
  person: string;
  domain: string;
  era: string;
  color: string;
  constructCount: number;
  incidentCount: number;
  statement: string;
}

export function getFrameworkPreviewData(slug: string): FrameworkPreviewData | null {
  if (!ALLOWED_SLUGS.includes(slug as FrameworkSlug)) return null;

  const framework = getFramework(slug as FrameworkSlug);
  if (!framework) return null;

  return {
    slug: slug as FrameworkSlug,
    person: framework.meta.person,
    domain: framework.meta.domain,
    era: framework.era,
    color: ACCENT_COLORS[slug as FrameworkSlug],
    constructCount: framework.meta.construct_count ?? framework.bipolar_constructs.length,
    incidentCount: framework.meta.incident_count,
    statement: framework.perceptual_lens.statement,
  };
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: "180px",
        border: `1px solid rgba(236, 219, 182, 0.18)`,
        background: "rgba(255, 255, 255, 0.03)",
        padding: "18px 18px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(236, 219, 182, 0.68)",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "serif",
          fontSize: "34px",
          lineHeight: 1,
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function FrameworkPreviewCard({
  data,
  mode,
}: {
  data: FrameworkPreviewData;
  mode: FrameworkPreviewMode;
}) {
  const isTwitter = mode === "twitter";
  const titleSize = isTwitter ? "74px" : "80px";
  const subtitleSize = isTwitter ? "28px" : "30px";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background:
          "radial-gradient(circle at 84% 16%, rgba(201, 102, 78, 0.20), transparent 28%), linear-gradient(135deg, #0e0904 0%, #171108 56%, #1f1812 100%)",
        color: "#ecdbb6",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(236, 219, 182, 0.72)",
            }}
          >
            Consult The Dead
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(236, 219, 182, 0.48)",
            }}
          >
            /frameworks/[slug] preview contract
          </div>
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: data.color,
            border: `1px solid ${data.color}`,
            padding: "10px 14px",
          }}
        >
          {isTwitter ? "Twitter card image" : "Open Graph image"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            fontFamily: "serif",
            fontSize: titleSize,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            color: data.color,
            maxWidth: "14ch",
          }}
        >
          {data.person}
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: subtitleSize,
            letterSpacing: "0.03em",
            color: "rgba(236, 219, 182, 0.84)",
          }}
        >
          {data.domain} • {data.era}
        </div>
        <div
          style={{
            maxWidth: "980px",
            fontFamily: "serif",
            fontSize: isTwitter ? "30px" : "32px",
            lineHeight: 1.3,
            color: "#f4e9cf",
          }}
        >
          {truncate(
            data.statement ||
              "Decision framework extracted from documented historical incidents, not a persona clone.",
            isTwitter ? 150 : 180,
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <StatCard label="Constructs" value={String(data.constructCount)} accent={data.color} />
        <StatCard label="Incidents" value={String(data.incidentCount)} accent={data.color} />
      </div>
    </div>
  );
}
