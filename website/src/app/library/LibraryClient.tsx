"use client";

import Link from "next/link";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { AgonRecord } from "@/lib/db/client";
import type { ConsensusResult } from "@/lib/agon/types";
import {
  filterAndSortLibraryAgons,
  getLibraryEmptyState,
  type LibrarySortOrder,
} from "@/lib/library-filter";

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type DeleteLibraryAgonArgs = {
  id: string;
  expandedId: string | null;
  setAgons: Dispatch<SetStateAction<AgonRecord[]>>;
  setExpanded: Dispatch<SetStateAction<string | null>>;
  setDeleting: Dispatch<SetStateAction<string | null>>;
  fetchImpl?: typeof fetch;
};

type ChangeEventLike = {
  target: {
    value: string;
  };
};

type ClickEventLike = {
  stopPropagation: () => void;
};

export function createQueryChangeHandler(
  setQuery: Dispatch<SetStateAction<string>>,
) {
  return (event: ChangeEventLike) => {
    setQuery(event.target.value);
  };
}

export function createSortChangeHandler(
  setSortOrder: Dispatch<SetStateAction<LibrarySortOrder>>,
) {
  return (event: ChangeEventLike) => {
    setSortOrder(event.target.value as LibrarySortOrder);
  };
}

export function createResetFiltersHandler(
  setQuery: Dispatch<SetStateAction<string>>,
  setSortOrder: Dispatch<SetStateAction<LibrarySortOrder>>,
) {
  return () => {
    setQuery("");
    setSortOrder("newest");
  };
}

export function createClearSearchHandler(
  setQuery: Dispatch<SetStateAction<string>>,
) {
  return () => {
    setQuery("");
  };
}

export function createToggleExpandedHandler(
  setExpanded: Dispatch<SetStateAction<string | null>>,
  expandedId: string | null,
  agonId: string,
) {
  return () => {
    setExpanded(expandedId === agonId ? null : agonId);
  };
}

export function createDeleteButtonClickHandler(args: DeleteLibraryAgonArgs) {
  return (event: ClickEventLike) => {
    event.stopPropagation();
    void deleteLibraryAgon(args);
  };
}

export async function deleteLibraryAgon({
  id,
  expandedId,
  setAgons,
  setExpanded,
  setDeleting,
  fetchImpl = fetch,
}: DeleteLibraryAgonArgs) {
  setDeleting(id);
  try {
    const res = await fetchImpl(`/api/library/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAgons((prev) => prev.filter((agon) => agon.id !== id));
      if (expandedId === id) setExpanded(null);
    }
  } finally {
    setDeleting(null);
  }
}

export function LibraryClient({ agons: initial }: { agons: AgonRecord[] }) {
  const [agons, setAgons] = useState(initial);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const filteredAgons = filterAndSortLibraryAgons(agons, query, sortOrder);
  const emptyState = getLibraryEmptyState(agons.length, filteredAgons.length, query);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {emptyState?.kind === "saved-empty" ? (
        <EmptyStateCard>
          <p
            className="font-mono"
            style={{
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--amber)",
              margin: "0 0 8px",
            }}
          >
            Saved library
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              lineHeight: 1.55,
              color: "var(--fg)",
              margin: "0 0 8px",
            }}
          >
            {emptyState.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "15px",
              lineHeight: 1.65,
              color: "var(--fg-dim)",
              margin: 0,
            }}
          >
            {emptyState.body}
          </p>
          <Link
            href={emptyState.primaryActionHref}
            style={{
              alignSelf: "flex-start",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "12px 24px",
              background: "var(--amber)",
              color: "var(--bg)",
              textDecoration: "none",
            }}
          >
            {emptyState.primaryActionLabel}
          </Link>
        </EmptyStateCard>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "14px",
            }}
          >
            <label
              style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                Search saved agons
              </span>
              <input
                type="search"
                value={query}
                onChange={createQueryChangeHandler(setQuery)}
                placeholder="Topic or mind name"
                aria-label="Search saved agons by topic or mind"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid var(--hairline)",
                  borderRadius: "6px",
                  background: "transparent",
                  color: "var(--fg)",
                  fontFamily: "var(--font-serif)",
                  fontSize: "16px",
                  padding: "14px 14px",
                  outline: "none",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                Sort by recency
              </span>
              <select
                value={sortOrder}
                onChange={createSortChangeHandler(setSortOrder)}
                aria-label="Sort saved agons by recency"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid var(--hairline)",
                  borderRadius: "6px",
                  background: "transparent",
                  color: "var(--fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 14px",
                  outline: "none",
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>

            <button
              type="button"
              onClick={createResetFiltersHandler(setQuery, setSortOrder)}
              className="font-mono"
              style={{
                border: "1px solid var(--hairline)",
                borderRadius: "6px",
                background: "transparent",
                color: "var(--fg-dim)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "12px 16px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Reset filters
            </button>
          </div>

          <div
            className="font-mono"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              borderTop: "1px solid var(--hairline)",
              borderBottom: "1px solid var(--hairline)",
              padding: "10px 0",
              flexWrap: "wrap",
            }}
          >
            <span>Topic</span>
            <span>
              {query.trim() ? `${filteredAgons.length} of ${agons.length}` : agons.length} saved
            </span>
          </div>

          {emptyState?.kind === "filtered-empty" ? (
            <EmptyStateCard>
              <p
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  margin: "0 0 8px",
                }}
              >
                Filtered results
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "18px",
                  lineHeight: 1.55,
                  color: "var(--fg)",
                  margin: "0 0 8px",
                }}
              >
                {emptyState.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                {emptyState.body}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={createClearSearchHandler(setQuery)}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    background: "var(--amber)",
                    color: "var(--bg)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {emptyState.primaryActionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSortOrder("newest");
                  }}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    background: "transparent",
                    color: "var(--fg-dim)",
                    border: "1px solid var(--hairline)",
                    cursor: "pointer",
                  }}
                >
                  {emptyState.secondaryActionLabel}
                </button>
              </div>
            </EmptyStateCard>
          ) : (
            filteredAgons.map((agon) => {
              const isExpanded = expanded === agon.id;
              const isDeleting = deleting === agon.id;
              const consensus = agon.consensus as ConsensusResult | null;

              return (
                <div
                  key={agon.id}
                  style={{ borderBottom: "1px solid var(--hairline)" }}
                >
                  {/* Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto auto",
                      gap: "24px",
                      alignItems: "center",
                      padding: "20px 0",
                      cursor: "pointer",
                    }}
                    onClick={createToggleExpandedHandler(setExpanded, expanded, agon.id)}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "16px",
                          lineHeight: 1.4,
                          color: "var(--fg)",
                          margin: "0 0 6px",
                        }}
                      >
                        {agon.topic}
                      </p>
                      <p
                        className="font-mono"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          color: "var(--fg-dim)",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        {agon.mind_slugs.map(slugToName).join(" · ")}
                      </p>
                    </div>

                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        color: "var(--fg-dim)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(agon.created_at)}
                    </span>

                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        color: "var(--fg-dim)",
                      }}
                    >
                      {isExpanded ? "▴" : "▾"}
                    </span>

                    <button
                      onClick={createDeleteButtonClickHandler({
                        id: agon.id,
                        expandedId: expanded,
                        setAgons,
                        setExpanded,
                        setDeleting,
                      })}
                      disabled={isDeleting}
                      className="font-mono"
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: isDeleting ? "var(--fg-dim)" : "var(--red)",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        padding: "4px 0",
                      }}
                    >
                      {isDeleting ? "…" : "Delete"}
                    </button>
                  </div>

                  {/* Expanded consensus */}
                  {isExpanded && (
                    <div
                      style={{
                        paddingBottom: "32px",
                        paddingLeft: "0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      {consensus ? (
                        <>
                          {consensus.action && (
                            <ConsensusSection title="Recommended Action" body={consensus.action} />
                          )}
                          {consensus.points && (
                            <ConsensusSection title="Consensus Points" body={consensus.points} />
                          )}
                          {consensus.tensions && (
                            <ConsensusSection title="Live Tensions" body={consensus.tensions} />
                          )}
                          {consensus.steps && consensus.steps.length > 0 && (
                            <div>
                              <p
                                className="font-mono"
                                style={{
                                  fontSize: "10px",
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: "var(--amber)",
                                  margin: "0 0 8px",
                                }}
                              >
                                Next Steps
                              </p>
                              <ul
                                style={{
                                  paddingLeft: "20px",
                                  margin: 0,
                                  fontFamily: "var(--font-serif)",
                                  fontSize: "15px",
                                  lineHeight: 1.65,
                                  color: "var(--fg)",
                                }}
                              >
                                {consensus.steps.map((s, i) => (
                                  <li key={i} style={{ marginBottom: "4px" }}>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {consensus.risks && (
                            <ConsensusSection title="Risks" body={consensus.risks} />
                          )}
                        </>
                      ) : (
                        <p
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "15px",
                            color: "var(--fg-dim)",
                            fontStyle: "italic",
                            margin: 0,
                          }}
                        >
                          No consensus recorded for this agon.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

function EmptyStateCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "8px",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "560px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function ConsensusSection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--amber)",
          margin: "0 0 8px",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "15px",
          lineHeight: 1.65,
          color: "var(--fg)",
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}
