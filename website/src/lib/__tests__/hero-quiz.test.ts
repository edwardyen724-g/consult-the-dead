/**
 * Unit tests for the home hero quiz helper.
 *
 * This file is vitest-compatible, but also runs directly via
 * `npx tsx website/src/lib/__tests__/hero-quiz.test.ts` so we can verify the
 * helper logic even when the local vitest binary is not available in the
 * worktree.
 */
import {
  applyHeroQuizWeights,
  buildHeroQuizRecommendation,
  HERO_QUIZ_QUESTIONS,
} from "../hero-quiz";

type TestFn = () => void;
type Suite = { name: string; tests: { name: string; fn: TestFn }[] };
const suites: Suite[] = [];
let currentSuite: Suite | null = null;

function describeFallback(name: string, body: () => void) {
  currentSuite = { name, tests: [] };
  body();
  suites.push(currentSuite);
  currentSuite = null;
}
function itFallback(name: string, fn: TestFn) {
  if (!currentSuite) throw new Error("it() called outside describe()");
  currentSuite.tests.push({ name, fn });
}
function expectFallback<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual) || actual.length !== expected) {
        throw new Error(
          `Expected length ${expected}, got ${Array.isArray(actual) ? actual.length : "non-array"}`,
        );
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual < expected) {
        throw new Error(
          `Expected ${String(actual)} to be >= ${expected}`,
        );
      }
    },
  };
}

const g = globalThis as unknown as {
  describe?: typeof describeFallback;
  it?: typeof itFallback;
  expect?: typeof expectFallback;
};
const describe = g.describe ?? describeFallback;
const it = g.it ?? itFallback;
const expect = g.expect ?? expectFallback;

describe("HERO_QUIZ_QUESTIONS", () => {
  it("exposes a short three-question flow", () => {
    expect(HERO_QUIZ_QUESTIONS).toHaveLength(3);
  });

  it("keeps each question answerable with at least five choices", () => {
    for (const question of HERO_QUIZ_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("buildHeroQuizRecommendation", () => {
  it("applies missing weights as zero when scoring options", () => {
    const scores = {
      strategy: 0,
      people: 0,
      building: 0,
      money: 0,
      personal: 0,
    };

    applyHeroQuizWeights(scores, {
      strategy: 2,
      money: undefined as unknown as number,
    });

    expect(scores).toEqual({
      strategy: 2,
      people: 0,
      building: 0,
      money: 0,
      personal: 0,
    });
  });

  it("routes strategy-heavy answers to the War Room", () => {
    const recommendation = buildHeroQuizRecommendation([
      "challenge-strategy",
      "pressure-timing",
      "outcome-directive",
    ]);

    expect(recommendation.category).toBe("strategy");
    expect(recommendation.packId).toBe("war-room");
    expect(recommendation.packName).toBe("War Room");
    expect(recommendation.headline).toBe("Start with the War Room");
    expect(recommendation.ctaHref).toBe(
      "/agora?pack=war-room&utm_source=home&utm_campaign=hero_quiz&utm_content=war-room",
    );
  });

  it("routes people-heavy answers to The Republic", () => {
    const recommendation = buildHeroQuizRecommendation([
      "challenge-people",
      "pressure-buyin",
      "outcome-persuasion",
    ]);

    expect(recommendation.category).toBe("people");
    expect(recommendation.packId).toBe("republic");
    expect(recommendation.packName).toBe("The Republic");
    expect(recommendation.ctaLabel).toBe("Open The Republic council");
  });

  it("routes building-heavy answers to the Inventors' Workshop", () => {
    const recommendation = buildHeroQuizRecommendation([
      "challenge-building",
      "pressure-shape",
      "outcome-blueprint",
    ]);

    expect(recommendation.category).toBe("building");
    expect(recommendation.packId).toBe("inventors-workshop");
    expect(recommendation.headline).toBe("Seat the Inventors' Workshop");
  });

  it("routes personal-heavy answers to the Stoic Council", () => {
    const recommendation = buildHeroQuizRecommendation([
      "challenge-personal",
      "pressure-clarity",
      "outcome-grounding",
    ]);

    expect(recommendation.category).toBe("personal");
    expect(recommendation.packId).toBe("stoic-council");
    expect(recommendation.packName).toBe("Stoic Council");
    expect(recommendation.ctaHref).toBe(
      "/agora?pack=stoic-council&utm_source=home&utm_campaign=hero_quiz&utm_content=stoic-council",
    );
  });

  it("ignores unknown answer ids instead of throwing", () => {
    const recommendation = buildHeroQuizRecommendation([
      "unknown-answer",
      "challenge-money",
      "outcome-economics",
    ]);

    expect(recommendation.category).toBe("money");
    expect(recommendation.packId).toBe("moguls");
  });

  it("defaults to strategy when every score is tied at zero", () => {
    const recommendation = buildHeroQuizRecommendation([]);

    expect(recommendation.category).toBe("strategy");
    expect(recommendation.packId).toBe("war-room");
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  for (const suite of suites) {
    for (const test of suite.tests) {
      try {
        test.fn();
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`✗ ${suite.name} > ${test.name}: ${message}`);
      }
    }
  }
  if (failed === 0) {
    console.log(
      `✓ hero-quiz: ${suites.reduce((total, suite) => total + suite.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
