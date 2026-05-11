/**
 * Unit tests for the landing demo opening copy and pacing.
 *
 * Mirrors the repo's vitest-compatible shim pattern so the file can run
 * under vitest and directly via `npx tsx` if needed.
 */
import {
  STREAMING_DEMO_PACING,
  STREAMING_DEMO_PROOF_POINTS,
  STREAMING_DEMO_QUESTION,
} from "./worked-example";

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
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${String(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${String(actual)} to be falsy`);
    },
    toBeGreaterThan(expected: number) {
      if (!(Number(actual) > expected)) {
        throw new Error(`Expected ${String(actual)} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (!(Number(actual) < expected)) {
        throw new Error(`Expected ${String(actual)} to be less than ${expected}`);
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

describe("STREAMING_DEMO_QUESTION", () => {
  it("opens with a sharper, curiosity-gap-driven prompt", () => {
    expect(STREAMING_DEMO_QUESTION).toBe(
      "If you had 90 days to become harder to replace, would you pivot into AI skills, deepen your domain moat, or redesign the work itself?",
    );
    expect(STREAMING_DEMO_QUESTION.includes("harder to replace")).toBeTruthy();
    expect(STREAMING_DEMO_QUESTION.includes("90 days")).toBeTruthy();
  });
});

describe("STREAMING_DEMO_PROOF_POINTS", () => {
  it("surfaces immediate proof of the product story", () => {
    expect(STREAMING_DEMO_PROOF_POINTS.length).toBe(3);
    expect(STREAMING_DEMO_PROOF_POINTS[0]).toEqual({
      title: "Research first",
      detail: "The council opens with live signals, not hot takes.",
    });
    expect(STREAMING_DEMO_PROOF_POINTS[1].title).toBe("Three minds");
    expect(STREAMING_DEMO_PROOF_POINTS[2].detail).toBe(
      "Every run ends with a concrete recommendation.",
    );
  });
});

describe("STREAMING_DEMO_PACING", () => {
  it("starts visibly faster than the old demo loop", () => {
    expect(STREAMING_DEMO_PACING.initialResearchDelayMs).toBeLessThan(200);
    expect(STREAMING_DEMO_PACING.researchLineDelayMs).toBeLessThan(1000);
    expect(STREAMING_DEMO_PACING.researchToDebateDelayMs).toBeLessThan(400);
    expect(STREAMING_DEMO_PACING.debateEntryDelayMs).toBeLessThan(200);
    expect(STREAMING_DEMO_PACING.roundLabelHoldMs).toBeLessThan(600);
    expect(STREAMING_DEMO_PACING.consensusLeadInMs).toBeLessThan(400);
    expect(STREAMING_DEMO_PACING.consensusRenderDelayMs).toBeLessThan(300);
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  for (const suite of suites) {
    for (const t of suite.tests) {
      try {
        t.fn();
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
      }
    }
  }
  if (failed === 0) {
    console.log(
      `✓ worked-example: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
