"use client";

/**
 * Client-side renderer for /explore.
 *
 * Owns: chip-strip selection, topic search input, card grid render,
 * and the bottom CTA (sticky on mobile, inline panel on desktop).
 *
 * All filter logic is delegated to src/lib/explore-filter.ts so the
 * heavy contract (intersection semantics, UTM URL shape) is unit-
 * tested without booting React.
 */
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  buildBottomCtaHref,
  buildShareCardHref,
  filterCards,
  type ExploreCard,
} from "@/lib/explore-filter";

export interface MindChip {
  slug: string;
  name: string;
  /** CSS custom-property reference, e.g. `var(--color-newton)`. */
  colorVar: string;
}

export interface ExploreClientProps {
  cards: ExploreCard[];
  chips: MindChip[];
  mindMetaBySlug: Record<string, { name: string; colorVar: string }>;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ExploreClient({
  cards,
  chips,
  mindMetaBySlug,
}: ExploreClientProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterCards(cards, selectedSlugs, query),
    [cards, selectedSlugs, query],
  );

  function toggleChip(slug: string) {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function clearFilters() {
    setSelectedSlugs([]);
    setQuery("");
  }

  const isFiltering = selectedSlugs.length > 0 || query.trim().length > 0;
  const hasNoSeed = cards.length === 0;
  const hasNoMatches = cards.length > 0 && filtered.length === 0;
  const bottomCtaHref = buildBottomCtaHref();

  return (
    <>
      {/* ── Filter bar ───────────────────────────────────────── */}
      <section
        aria-label="Filters"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          margin: "0 0 32px",
        }}
      >
        <div>
          <label
            htmlFor="explore-search"
            className="font-mono"
            style={{
              display: "block",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              margin: "0 0 8px",
            }}
          >
            Search topics
          </label>
          <input
            id="explore-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. pivot, capital, competitor"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "10px 14px",
              fontSize: "15px",
              fontFamily: "inherit",
              color: "var(--fg)",
              background: "var(--bg)",
              border: "1px solid var(--fg-dim)",
              borderRadius: "4px",
              outline: "none",
            }}
          />
        </div>

        <div>
          <p
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              margin: "0 0 8px",
            }}
          >
            Filter by mind {selectedSlugs.length > 0 && `(${selectedSlugs.length})`}
          </p>
          <div
            role="group"
            aria-label="Mind filter chips"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {chips.map((chip) => {
              const active = selectedSlugs.includes(chip.slug);
              return (
                <button
                  key={chip.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleChip(chip.slug)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    color: active ? "var(--bg)" : chip.colorVar,
                    background: active ? chip.colorVar : "transparent",
                    border: `1px solid ${chip.colorVar}`,
                    borderRadius: "999px",
                    cursor: "pointer",
                    transition: "background 120ms ease, color 120ms ease",
                  }}
                >
                  {chip.name}
                </button>
              );
            })}
          </div>
        </div>

        {isFiltering && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              alignSelf: "flex-start",
              fontSize: "12px",
              fontFamily: "inherit",
              color: "var(--fg-dim)",
              background: "transparent",
              border: "none",
              padding: "4px 0",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear filters
          </button>
        )}
      </section>

      {/* ── Result count ───────────────────────────────────── */}
      <p
        aria-live="polite"
        className="font-mono"
        style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          margin: "0 0 16px",
        }}
      >
        {hasNoSeed
          ? "0 agons"
          : `${filtered.length} ${filtered.length === 1 ? "agon" : "agons"}`}
      </p>

      {/* ── Cards / empty states ───────────────────────────── */}
      {hasNoSeed ? (
        <EmptyState variant="no-seed" />
      ) : hasNoMatches ? (
        <EmptyState variant="no-matches" onClear={clearFilters} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            margin: "0 0 64px",
          }}
        >
          {filtered.map((card) => (
            <CardItem
              key={card.shareId}
              card={card}
              mindMetaBySlug={mindMetaBySlug}
            />
          ))}
        </div>
      )}

      {/* ── Inline desktop CTA panel ───────────────────────── */}
      <aside
        aria-label="Begin your own agon"
        style={{
          display: "block",
          padding: "24px",
          margin: "32px 0 96px",
          border: "1px solid var(--fg-dim)",
          borderRadius: "8px",
          background: "var(--bg-elevated, var(--bg))",
        }}
        data-print="hide"
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "1.3rem",
            margin: "0 0 8px",
          }}
        >
          Begin your own agon
        </h2>
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--fg-dim)",
            margin: "0 0 16px",
            maxWidth: "60ch",
          }}
        >
          3 free agons today. Pick three minds, ask one question, watch
          the council think.
        </p>
        <Link
          href={bottomCtaHref}
          style={{
            display: "inline-block",
            padding: "10px 18px",
            fontSize: "14px",
            color: "var(--bg)",
            background: "var(--fg)",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          Begin your own agon →
        </Link>
      </aside>

      {/* ── Sticky mobile CTA bar ──────────────────────────── */}
      <div
        className="explore-sticky-cta"
        data-print="hide"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "var(--bg)",
          borderTop: "1px solid var(--fg-dim)",
          zIndex: 50,
          display: "none",
        }}
      >
        <Link
          href={bottomCtaHref}
          style={{
            display: "block",
            textAlign: "center",
            padding: "12px 16px",
            fontSize: "14px",
            color: "var(--bg)",
            background: "var(--fg)",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          Begin your own agon — 3 free today
        </Link>
      </div>

      {/* Show the sticky bar on mobile only. */}
      <style>{`
        @media (max-width: 640px) {
          .explore-sticky-cta { display: block !important; }
        }
        @media print {
          .explore-sticky-cta { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ── CardItem ───────────────────────────────────────────────── */

function CardItem({
  card,
  mindMetaBySlug,
}: {
  card: ExploreCard;
  mindMetaBySlug: Record<string, { name: string; colorVar: string }>;
}) {
  const href = buildShareCardHref(card.shareId);
  // Up to 3 council members shown on the card. Anything beyond gets
  // collapsed into a "+N" badge so the card height stays consistent.
  const visibleMinds = card.mindSlugs.slice(0, 3);
  const overflow = Math.max(0, card.mindSlugs.length - visibleMinds.length);
  const created = formatDate(card.createdAt);

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
        border: "1px solid var(--fg-dim)",
        borderRadius: "8px",
        background: "var(--bg)",
        color: "var(--fg)",
        textDecoration: "none",
        minHeight: "180px",
        transition: "border-color 120ms ease",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.05rem",
          lineHeight: 1.4,
          margin: 0,
          // Clamp at 4 lines so cards align in the grid.
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {card.topic}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "auto",
        }}
      >
        {visibleMinds.map((slug) => {
          const meta = mindMetaBySlug[slug] ?? {
            name: slug,
            colorVar: "var(--fg)",
          };
          return (
            <span
              key={slug}
              title={meta.name}
              aria-label={meta.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--bg)",
                background: meta.colorVar,
                borderRadius: "50%",
              }}
            >
              {initialsOf(meta.name)}
            </span>
          );
        })}
        {overflow > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--fg-dim)",
            }}
          >
            +{overflow}
          </span>
        )}
        {created && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: "var(--fg-dim)",
            }}
          >
            {created}
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * Two-letter initials from a person's display name. Falls back to a
 * single uppercase character on single-token input.
 */
function initialsOf(name: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return (
    (parts[0]![0] ?? "").toUpperCase() +
    (parts[parts.length - 1]![0] ?? "").toUpperCase()
  );
}

/* ── EmptyState ─────────────────────────────────────────────── */

function EmptyState({
  variant,
  onClear,
}: {
  variant: "no-seed" | "no-matches";
  onClear?: () => void;
}) {
  if (variant === "no-seed") {
    return (
      <div
        style={{
          padding: "48px 24px",
          border: "1px dashed var(--fg-dim)",
          borderRadius: "8px",
          textAlign: "center",
          color: "var(--fg-dim)",
          margin: "0 0 64px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            margin: "0 0 12px",
            color: "var(--fg)",
          }}
        >
          No public agons yet
        </p>
        <p
          style={{
            fontSize: "14px",
            margin: 0,
            maxWidth: "48ch",
            marginInline: "auto",
          }}
        >
          The gallery will fill in as outreach conversations and shared
          agons land. Check back soon — or run your own.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px 24px",
        border: "1px dashed var(--fg-dim)",
        borderRadius: "8px",
        textAlign: "center",
        color: "var(--fg-dim)",
        margin: "0 0 64px",
      }}
    >
      <p style={{ margin: "0 0 12px", color: "var(--fg)" }}>
        No agons match those filters.
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            fontSize: "13px",
            fontFamily: "inherit",
            color: "var(--fg)",
            background: "transparent",
            border: "1px solid var(--fg-dim)",
            borderRadius: "4px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
