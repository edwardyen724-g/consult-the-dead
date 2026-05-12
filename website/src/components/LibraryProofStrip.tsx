/**
 * LibraryProofStrip — live social-proof signal bar for the Reading Room.
 *
 * Renders per-user library progress stats (consulted minds, saved debates)
 * in the same compact strip style used on the pricing page, reinforcing
 * value at the moment users browse their saved consultations.
 *
 * Three render modes:
 *   loading=true  → skeleton placeholders (no layout shift)
 *   stats prop    → formatted labels from formatLibraryProgressStats
 *   neither       → renders the stats as zeroed labels (0 minds, 0 debates)
 *
 * Pure presentational component — no data fetching, no state, no client
 * hooks. Callers own the data-loading lifecycle.
 */

import {
  formatLibraryProgressStats,
  type LibraryProgressStats,
} from "@/lib/library-stats";

export interface LibraryProofStripProps {
  /** Live library progress stats. Falls back to zero counts when absent. */
  stats?: LibraryProgressStats;
  /** When true, render skeleton placeholders instead of real content. */
  loading?: boolean;
  /** Extra className forwarded to the root container. */
  className?: string;
}

const ZERO_STATS: LibraryProgressStats = {
  consultedMinds: 0,
  savedDebates: 0,
};

/**
 * LibraryProofStrip component.
 *
 * Stat labels are separated by mid-dots (·) to match the pricing-page
 * stats row visual style.
 */
export function LibraryProofStrip({
  stats,
  loading,
  className,
}: LibraryProofStripProps) {
  if (loading) {
    return (
      <div
        data-testid="library-proof-strip-loading"
        className={className}
        aria-busy="true"
        aria-label="Loading library stats"
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {[56, 72, 88].map((w) => (
          <span
            key={w}
            data-testid="library-proof-strip-skeleton"
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

  const source = stats ?? ZERO_STATS;
  const labels = formatLibraryProgressStats(source);

  return (
    <div
      data-testid="library-proof-strip"
      className={className}
      style={{
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--fg-faint)",
      }}
    >
      {labels.map((label, i) => (
        <span
          key={label}
          data-testid="library-proof-strip-item"
          style={{ display: "inline-flex", alignItems: "center", gap: "14px" }}
        >
          {label}
          {i < labels.length - 1 && (
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
