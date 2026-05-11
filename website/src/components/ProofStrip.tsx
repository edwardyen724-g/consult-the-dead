/**
 * ProofStrip — reusable social-proof signal strip for conversion surfaces.
 *
 * Renders subscriber count, agon sessions, and a tagline on homepage,
 * pricing page, or any other funnel surface. Three render modes:
 *
 *   loading=true  → skeleton/placeholder divs (no layout shift)
 *   data prop     → formatted stat badges from formatProofStripData
 *   neither       → falls back to PROOF_STRIP_FALLBACK constants
 *
 * This is a pure presentational component — no data fetching, no state,
 * no client-side hooks. Callers own the data-loading lifecycle.
 * Uses the codebase's inline-style + CSS-variable convention.
 */

import {
  formatProofStripData,
  PROOF_STRIP_FALLBACK,
  type ProofStripData,
} from "@/lib/proof-strip";

export interface ProofStripProps {
  /** Live data to render. Falls back to PROOF_STRIP_FALLBACK when absent. */
  data?: ProofStripData;
  /** When true, render skeleton placeholders instead of real content. */
  loading?: boolean;
  /** Extra className forwarded to the root container. */
  className?: string;
}

/**
 * ProofStrip component.
 *
 * Stat entries are separated by mid-dots (·) to match the pricing-page
 * stats row visual style.
 */
export function ProofStrip({ data, loading, className }: ProofStripProps) {
  if (loading) {
    return (
      <div
        data-testid="proof-strip-loading"
        className={className}
        aria-busy="true"
        aria-label="Loading social proof"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {[48, 64, 80].map((w) => (
          <span
            key={w}
            data-testid="proof-strip-skeleton"
            style={{
              display: "inline-block",
              width: `${w}px`,
              height: "10px",
              borderRadius: "4px",
              background: "var(--hairline)",
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  const source = data ?? PROOF_STRIP_FALLBACK;
  const items = formatProofStripData(source);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="proof-strip"
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "14px",
        flexWrap: "wrap",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--fg-faint)",
      }}
    >
      {items.map((item, i) => (
        <span
          key={item.label}
          data-testid="proof-strip-item"
          style={{ display: "inline-flex", alignItems: "center", gap: "14px" }}
        >
          <span>
            <span
              data-testid="proof-strip-value"
              style={{ fontWeight: 500, color: "var(--fg-dim)" }}
            >
              {item.value}
            </span>{" "}
            {item.label}
          </span>
          {i < items.length - 1 && (
            <span
              aria-hidden="true"
              style={{ color: "var(--hairline)" }}
            >
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
