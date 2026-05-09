import type { AgonRecord } from "@/lib/db/client";

export type LibrarySortOrder = "newest" | "oldest";

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

