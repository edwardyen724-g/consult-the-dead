import { describe, expect, it } from "vitest";
import { filterAndSortLibraryAgons } from "@/lib/library-filter";

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
});
