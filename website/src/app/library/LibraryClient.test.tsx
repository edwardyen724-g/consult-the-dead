import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConsensusSection,
  LibraryClient,
  createClearSearchHandler,
  createDeleteButtonClickHandler,
  createQueryChangeHandler,
  createResetFiltersHandler,
  createSortChangeHandler,
  createToggleExpandedHandler,
  deleteLibraryAgon,
} from "./LibraryClient";
import type { AgonRecord } from "@/lib/db/client";
import type { ConsensusResult } from "@/lib/agon/types";

const useStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

function makeAgon(overrides: Partial<AgonRecord>): AgonRecord {
  return {
    id: "agon-1",
    clerk_user_id: "user-1",
    share_id: "share-1",
    topic: "Default topic",
    mind_slugs: ["sun-tzu"],
    rounds: 2,
    turns: [],
    consensus: null,
    research: null,
    created_at: "2026-05-09T12:00:00.000Z",
    updated_at: "2026-05-09T12:00:00.000Z",
    ...overrides,
  };
}

function setStateSequence(...values: unknown[]) {
  useStateMock.mockReset();
  for (const value of values) {
    useStateMock.mockImplementationOnce(() => [value, vi.fn()]);
  }
}

function flattenText(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  if (typeof node === "object" && node !== null && "props" in node) {
    return flattenText((node as { props?: { children?: unknown } }).props?.children);
  }

  return "";
}

function findElementWithProp(
  node: unknown,
  propName: string,
  propValue: unknown,
): { props?: Record<string, unknown> } | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementWithProp(child, propName, propValue);
      if (found) return found;
    }
    return null;
  }

  if (typeof node !== "object" || node === null || !("props" in node)) return null;

  const element = node as { props?: Record<string, unknown> };
  if (element.props?.[propName] === propValue) {
    return element;
  }

  return findElementWithProp(element.props?.children, propName, propValue);
}

beforeEach(() => {
  useStateMock.mockReset();
});

describe("LibraryClient", () => {
  it("renders the empty saved-agons state", () => {
    setStateSequence([], "", "newest", null, null);

    const tree = LibraryClient({ agons: [] });

    const text = flattenText(tree);
    expect(text).toContain("Saved library");
    expect(text).toContain("Start your first consultation.");
    expect(text).toContain("Start your first consultation →");
    expect(findElementWithProp(tree, "href", "/agora")).not.toBeNull();
  });

  it("renders filters, counts, and saved agons", () => {
    const agons = [
      makeAgon({
        id: "1",
        share_id: "share-1",
        topic: "How to scale a team",
        mind_slugs: ["sun-tzu", "simon-sinek"],
        created_at: "2026-05-08T12:00:00.000Z",
      }),
      makeAgon({
        id: "2",
        share_id: "share-2",
        topic: "Choosing a product strategy",
        mind_slugs: ["marie-curie"],
        created_at: "2026-05-09T12:00:00.000Z",
      }),
    ];

    setStateSequence(agons, "", "newest", null, null);

    const tree = LibraryClient({ agons });

    const text = flattenText(tree);
    expect(text).toContain("Search saved agons");
    expect(text).toContain("Sort by recency");
    expect(text).toContain("2 saved");
    expect(text).toContain("Choosing a product strategy");
    expect(text).toContain("How to scale a team");
    expect(text).toContain("Delete");
  });

  it("renders the empty filtered state when the query excludes all agons", () => {
    const agons = [
      makeAgon({
        id: "1",
        share_id: "share-1",
        topic: "How to scale a team",
        mind_slugs: ["sun-tzu", "simon-sinek"],
      }),
    ];

    setStateSequence(agons, "zebra", "newest", null, null);

    const tree = LibraryClient({ agons });

    const text = flattenText(tree);
    expect(text).toContain("Filtered results");
    expect(text).toContain('No saved agons match "zebra".');
    expect(text).toContain("Clear search");
    expect(text).toContain("Reset filters");
    expect(text).toContain("0 of 1 saved");
  });

  it("renders expanded consensus details and the in-progress delete state", () => {
    const agons = [
      makeAgon({
        id: "1",
        share_id: "share-1",
        topic: "How to scale a team",
        mind_slugs: ["sun-tzu", "simon-sinek"],
        consensus: {
          action: "Reframe the decision as a commitment test.",
          points: "The team needs a crisp plan.",
          tensions: "Short-term speed conflicts with long-term leverage.",
          steps: ["Pick one owner", "Set a deadline"],
          risks: "The plan could stall if accountability blurs.",
        } as ConsensusResult,
      }),
    ];

    setStateSequence(agons, "", "newest", "1", "1");

    const tree = LibraryClient({ agons });
    const text = flattenText(tree);

    expect(text).toContain("Next Steps");
    expect(text).toContain("…");
  });

  it("renders the expanded no-consensus state", () => {
    const agons = [
      makeAgon({
        id: "1",
        share_id: "share-1",
        topic: "How to scale a team",
        mind_slugs: ["sun-tzu", "simon-sinek"],
        consensus: null,
      }),
    ];

    setStateSequence(agons, "", "newest", "1", null);

    const tree = LibraryClient({ agons });
    const text = flattenText(tree);

    expect(text).toContain("No consensus recorded for this agon.");
  });

  it("renders a consensus section directly", () => {
    const tree = ConsensusSection({
      title: "Recommended Action",
      body: "Reframe the decision as a commitment test.",
    });

    const text = flattenText(tree);
    expect(text).toContain("Recommended Action");
    expect(text).toContain("Reframe the decision as a commitment test.");
  });
});

describe("deleteLibraryAgon", () => {
  it("removes a deleted agon and collapses the expanded row", async () => {
    const setAgons = vi.fn();
    const setExpanded = vi.fn();
    const setDeleting = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await deleteLibraryAgon({
      id: "agon-1",
      expandedId: "agon-1",
      setAgons,
      setExpanded,
      setDeleting,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith("/api/library/agon-1", {
      method: "DELETE",
    });
    expect(setDeleting).toHaveBeenNthCalledWith(1, "agon-1");
    expect(setAgons).toHaveBeenCalledTimes(1);
    const updater = setAgons.mock.calls[0]?.[0] as (agons: AgonRecord[]) => AgonRecord[];
    expect(
      updater([
        makeAgon({ id: "agon-1", share_id: "share-1" }),
        makeAgon({ id: "agon-2", share_id: "share-2" }),
      ]).map((agon) => agon.id),
    ).toEqual(["agon-2"]);
    expect(setExpanded).toHaveBeenCalledWith(null);
    expect(setDeleting).toHaveBeenLastCalledWith(null);
  });

  it("still clears the loading state when the delete request fails", async () => {
    const setAgons = vi.fn();
    const setExpanded = vi.fn();
    const setDeleting = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });

    await deleteLibraryAgon({
      id: "agon-2",
      expandedId: "agon-1",
      setAgons,
      setExpanded,
      setDeleting,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith("/api/library/agon-2", {
      method: "DELETE",
    });
    expect(setAgons).not.toHaveBeenCalled();
    expect(setExpanded).not.toHaveBeenCalled();
    expect(setDeleting).toHaveBeenLastCalledWith(null);
  });

  it("keeps the expanded row open when deleting a different agon", async () => {
    const setAgons = vi.fn();
    const setExpanded = vi.fn();
    const setDeleting = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await deleteLibraryAgon({
      id: "agon-2",
      expandedId: "agon-1",
      setAgons,
      setExpanded,
      setDeleting,
      fetchImpl,
    });

    expect(setAgons).toHaveBeenCalledTimes(1);
    expect(setExpanded).not.toHaveBeenCalled();
    expect(setDeleting).toHaveBeenLastCalledWith(null);
  });
});

describe("library handler factories", () => {
  it("maps query, sort, reset, clear, expand, and delete events", async () => {
    const setQuery = vi.fn();
    const setSortOrder = vi.fn();
    const setExpanded = vi.fn();
    const stopPropagation = vi.fn();
    const setAgons = vi.fn();
    const setDeleting = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    createQueryChangeHandler(setQuery)({ target: { value: "apollo" } });
    createSortChangeHandler(setSortOrder)({ target: { value: "oldest" } });
    createResetFiltersHandler(setQuery, setSortOrder)();
    createClearSearchHandler(setQuery)();
    createToggleExpandedHandler(setExpanded, "agon-1", "agon-1")();
    createToggleExpandedHandler(setExpanded, "agon-1", "agon-2")();
    createDeleteButtonClickHandler({
      id: "agon-1",
      expandedId: "agon-1",
      setAgons,
      setExpanded,
      setDeleting,
      fetchImpl,
    })({ stopPropagation });

    await Promise.resolve();

    expect(setQuery).toHaveBeenNthCalledWith(1, "apollo");
    expect(setQuery).toHaveBeenNthCalledWith(2, "");
    expect(setQuery).toHaveBeenNthCalledWith(3, "");
    expect(setSortOrder).toHaveBeenNthCalledWith(1, "oldest");
    expect(setSortOrder).toHaveBeenNthCalledWith(2, "newest");
    expect(setExpanded).toHaveBeenNthCalledWith(1, null);
    expect(setExpanded).toHaveBeenNthCalledWith(2, "agon-2");
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/api/library/agon-1", {
      method: "DELETE",
    });
    expect(setDeleting).toHaveBeenCalledWith("agon-1");
    expect(setAgons).toHaveBeenCalledTimes(1);
  });
});
