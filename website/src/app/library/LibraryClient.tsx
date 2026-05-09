"use client";

import Link from "next/link";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { AgonRecord } from "@/lib/db/client";
import type { ConsensusResult } from "@/lib/agon/types";
import {
  filterAndSortLibraryAgons,
  type LibrarySortOrder,
} from "@/lib/library-filter";

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

export function createDeleteButtonClickHandler(
  args: DeleteLibraryAgonArgs,
) {
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

  if (agons.length === 0) {
    return (
      <div
        style={{
          padding: "64px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            color: "var(--fg-dim)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          No agons saved yet.
        </p>
        <Link
          href="/agora"
          style={{
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
          Run your first one →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "end",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: "1 1 260px",
          }}
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
              border: "1px solid var(--hairline)",
              borderRadius: "6px",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              padding: "12px 14px",
              outline: "none",
            }}
          />
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: "0 1 220px",
          }}
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
              border: "1px solid var(--hairline)",
              borderRadius: "6px",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "13px 14px",
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
            height: "fit-content",
            flex: "0 0 auto",
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
        }}
      >
        <span>{query.trim() ? `${filteredAgons.length} of ${agons.length}` : agons.length} saved</span>
        <span />
      </div>

      {filteredAgons.length === 0 ? (
        <div
          style={{
            padding: "48px 0 8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              color: "var(--fg-dim)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            No saved agons match this filter.
          </p>
          <button
            type="button"
            onClick={createClearSearchHandler(setQuery)}
            style={{
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
            Clear search
          </button>
        </div>
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
                        <ConsensusSection
                          title="Recommended Action"
                          body={consensus.action}
                        />
                      )}
                      {consensus.points && (
                        <ConsensusSection
                          title="Consensus Points"
                          body={consensus.points}
                        />
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
                            {consensus.steps.map((step, index) => (
                              <li key={index} style={{ marginBottom: "4px" }}>
                                {step}
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
