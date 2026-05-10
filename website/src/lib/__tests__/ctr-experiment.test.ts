import { describe, expect, it } from "vitest";
import {
  buildQuizCouncilHref,
  buildQuizEntryHref,
  CURIOSITY_GAP_HERO_VARIANT_IDS,
  getCuriosityGapHeroCopy,
  getQuizDestination,
  getQuizRouteGroup,
  CURIOSITY_GAP_HERO_COPY_VARIANTS,
  QUIZ_ENTRY_HREFS,
  QUIZ_ROUTE_GROUPS,
} from "@/lib/ctr-experiment";

describe("getCuriosityGapHeroCopy", () => {
  it("keeps the hero variants in canonical homepage order", () => {
    expect(CURIOSITY_GAP_HERO_VARIANT_IDS).toEqual([
      "decision-first",
      "quiz-first",
      "direct-first",
    ]);
  });

  it("returns the first-ranked variant when no variant id is provided", () => {
    expect(getCuriosityGapHeroCopy()).toEqual(CURIOSITY_GAP_HERO_COPY_VARIANTS[0]);
  });

  it("matches variants case-insensitively and ignores surrounding whitespace", () => {
    expect(getCuriosityGapHeroCopy("  QUIZ-FIRST  ")).toEqual(
      CURIOSITY_GAP_HERO_COPY_VARIANTS[1],
    );
  });

  it("falls back to the first-ranked variant for unknown ids", () => {
    expect(getCuriosityGapHeroCopy("missing-variant")).toEqual(
      CURIOSITY_GAP_HERO_COPY_VARIANTS[0],
    );
  });
});

describe("quiz routing helpers", () => {
  it("keeps the quiz entry hrefs canonical for the guided and direct surfaces", () => {
    expect(QUIZ_ENTRY_HREFS).toEqual({
      guided: "/quiz?entry=guided",
      direct: "/quiz",
    });
    expect(buildQuizEntryHref("guided")).toBe(QUIZ_ENTRY_HREFS.guided);
    expect(buildQuizEntryHref("direct")).toBe(QUIZ_ENTRY_HREFS.direct);
  });

  it("buildQuizEntryHref exposes both guided and direct entry routes", () => {
    expect(buildQuizEntryHref()).toBe("/quiz?entry=guided");
    expect(buildQuizEntryHref("direct")).toBe("/quiz");
  });

  it("buildQuizCouncilHref preserves order, trims blanks, and falls back when empty", () => {
    expect(
      buildQuizCouncilHref([" sun-tzu ", "", "alexander-the-great", "niccolo-machiavelli"]),
    ).toBe("/agora?minds=sun-tzu,alexander-the-great,niccolo-machiavelli");
    expect(buildQuizCouncilHref([])).toBe("/agora");
    expect(buildQuizCouncilHref(["   "])).toBe("/agora");
  });

  it("buildQuizCouncilHref encodes each slug independently", () => {
    expect(buildQuizCouncilHref(["alpha beta", "cicero/roman?"])).toBe(
      "/agora?minds=alpha%20beta,cicero%2Froman%3F",
    );
  });

  it("exposes the quiz route groups in the same order as the current page matrix", () => {
    expect(QUIZ_ROUTE_GROUPS.map((group) => group.decisionType)).toEqual([
      "strategy",
      "people",
      "building",
      "money",
      "personal",
    ]);
    expect(QUIZ_ROUTE_GROUPS[0]?.routes[0]?.label).toBe("Attack or defend?");
  });

  it("finds a route group by decision type regardless of casing", () => {
    expect(getQuizRouteGroup("  MONEY  ")?.label).toBe("Money & Growth");
    expect(getQuizRouteGroup("unknown")).toBeNull();
  });

  it("maps a quiz selection to the selected council and Agora destination", () => {
    const destination = getQuizDestination("strategy", "Attack or defend?");

    expect(destination).toEqual({
      decisionType: "strategy",
      label: "Attack or defend?",
      description: "Should I compete head-on or protect what I have?",
      tagline: "The strategists who knew when to strike and when to wait.",
      mindSlugs: ["sun-tzu", "alexander-the-great", "niccolo-machiavelli"],
      href: "/agora?minds=sun-tzu,alexander-the-great,niccolo-machiavelli",
    });
  });

  it("returns null for unknown quiz selections", () => {
    expect(getQuizDestination("strategy", "Unknown route")).toBeNull();
    expect(getQuizDestination("not-a-type", "Attack or defend?")).toBeNull();
  });
});
