import type { AgonRecord } from "@/lib/db/client";

export type LibrarySortOrder = "newest" | "oldest";

export type LibraryEmptyState =
  | {
      kind: "saved-empty";
      title: string;
      body: string;
      primaryActionLabel: string;
      primaryActionHref: string;
    }
  | {
      kind: "filtered-empty";
      title: string;
      body: string;
      primaryActionLabel: string;
      secondaryActionLabel: string;
    };

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function toSafeTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesQuery(agon: AgonRecord, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  const haystack = [
    agon.topic,
    ...agon.mind_slugs,
    ...agon.mind_slugs.map(slugToName),
  ]
    .join(" ")
    .toLowerCase();

  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function compareByRecency(
  left: AgonRecord,
  right: AgonRecord,
  sortOrder: LibrarySortOrder,
) {
  const leftTime = toSafeTimestamp(left.created_at);
  const rightTime = toSafeTimestamp(right.created_at);
  const delta = leftTime - rightTime;

  if (delta !== 0) {
    return sortOrder === "newest" ? -delta : delta;
  }

  const topicDelta = left.topic.localeCompare(right.topic);
  if (topicDelta !== 0) return topicDelta;

  return left.share_id.localeCompare(right.share_id);
}

export function filterAndSortLibraryAgons(
  agons: AgonRecord[],
  query: string,
  sortOrder: LibrarySortOrder,
) {
  const normalizedQuery = normalizeQuery(query);

  return agons
    .filter((agon) => matchesQuery(agon, normalizedQuery))
    .slice()
    .sort((left, right) => compareByRecency(left, right, sortOrder));
}

export function getLibraryEmptyState(
  totalCount: number,
  filteredCount: number,
  query: string,
): LibraryEmptyState | null {
  const trimmedQuery = query.trim();

  if (totalCount === 0) {
    return {
      kind: "saved-empty",
      title: "No saved agons yet.",
      body: "Run your first agon in the Agora and the library will keep it here for later review.",
      primaryActionLabel: "Run your first one →",
      primaryActionHref: "/agora",
    };
  }

  if (trimmedQuery && filteredCount === 0) {
    return {
      kind: "filtered-empty",
      title: `No saved agons match \"${trimmedQuery}\".`,
      body: "Try clearing the search or resetting filters to bring the full archive back.",
      primaryActionLabel: "Clear search",
      secondaryActionLabel: "Reset filters",
    };
  }

  return null;
}
