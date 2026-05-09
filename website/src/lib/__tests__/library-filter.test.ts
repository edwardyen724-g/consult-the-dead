import { describe, expect, it } from "vitest";
import {
  filterAndSortLibraryAgons,
  getLibraryEmptyState,
} from "@/lib/library-filter";

describe("filterAndSortLibraryAgons", () => {
  const agons = [
    {
      id: "1",
      clerk_user_id: "user",
      share_id: "aaa111",
      topic: "How to scale a team",
      mind_slugs: ["sun-tzu", "simon-sinek"],
      rounds: 3,
      turns: [],
      consensus: null,
      research: null,
      created_at: "2026-05-08T12:00:00.000Z",
      updated_at: "2026-05-08T12:00:00.000Z",
    },
    {
      id: "2",
      clerk_user_id: "user",
      share_id: "bbb222",
      topic: "Choosing a product strategy",
      mind_slugs: ["marie-curie"],
      rounds: 4,
      turns: [],
      consensus: null,
      research: null,
      created_at: "2026-05-09T12:00:00.000Z",
      updated_at: "2026-05-09T12:00:00.000Z",
    },
    {
      id: "3",
      clerk_user_id: "user",
      share_id: "ccc333",
      topic: "A short note",
      mind_slugs: ["alexander-the-great"],
      rounds: 2,
      turns: [],
      consensus: null,
      research: null,
      created_at: "2026-05-09T12:00:00.000Z",
      updated_at: "2026-05-09T12:00:00.000Z",
    },
    {
      id: "4",
      clerk_user_id: "user",
      share_id: "ddd444",
      topic: "A short note",
      mind_slugs: ["plato"],
      rounds: 2,
      turns: [],
      consensus: null,
      research: null,
      created_at: "2026-05-09T12:00:00.000Z",
      updated_at: "2026-05-09T12:00:00.000Z",
    },
  ];

  it("filters by topic or mind and returns newest first by default", () => {
    const result = filterAndSortLibraryAgons(agons, "strategy", "newest");
    expect(result.map((agon) => agon.id)).toEqual(["2"]);

    const mindResult = filterAndSortLibraryAgons(agons, "Sun Tzu", "newest");
    expect(mindResult.map((agon) => agon.id)).toEqual(["1"]);
  });

  it("matches against mind slugs and title-cased mind names", () => {
    const result = filterAndSortLibraryAgons(agons, "alexander great", "newest");
    expect(result.map((agon) => agon.id)).toEqual(["3"]);
  });

  it("sorts by recency in either direction when the query is blank", () => {
    expect(filterAndSortLibraryAgons(agons, "", "newest").map((agon) => agon.id)).toEqual([
      "3",
      "4",
      "2",
      "1",
    ]);

    expect(filterAndSortLibraryAgons(agons, "   ", "oldest").map((agon) => agon.id)).toEqual([
      "1",
      "3",
      "4",
      "2",
    ]);
  });

  it("keeps the original array untouched", () => {
    const copy = [...agons];
    filterAndSortLibraryAgons(agons, "team", "newest");

    expect(agons).toEqual(copy);
  });

  it("treats invalid timestamps as the oldest possible value", () => {
    const result = filterAndSortLibraryAgons(
      [
        ...agons,
        {
          id: "5",
          clerk_user_id: "user",
          share_id: "eee555",
          topic: "Timestamp fallback",
          mind_slugs: ["plato"],
          rounds: 1,
          turns: [],
          consensus: null,
          research: null,
          created_at: "not-a-date",
          updated_at: "not-a-date",
        },
      ],
      "",
      "newest",
    );

    expect(result[result.length - 1]?.id).toBe("5");
  });

  it("describes the empty saved-library state", () => {
    expect(getLibraryEmptyState(0, 0, "")).toEqual({
      kind: "saved-empty",
      title: "No saved agons yet.",
      body: "Run your first agon in the Agora and the library will keep it here for later review.",
      primaryActionLabel: "Run your first one →",
      primaryActionHref: "/agora",
    });
  });

  it("describes the filtered-empty recovery state", () => {
    expect(getLibraryEmptyState(3, 0, "strategy")).toEqual({
      kind: "filtered-empty",
      title: 'No saved agons match "strategy".',
      body: "Try clearing the search or resetting filters to bring the full archive back.",
      primaryActionLabel: "Clear search",
      secondaryActionLabel: "Reset filters",
    });
  });

  it("returns null when there are results to show", () => {
    expect(getLibraryEmptyState(4, 2, "team")).toBeNull();
    expect(getLibraryEmptyState(4, 4, "   ")).toBeNull();
  });
});
