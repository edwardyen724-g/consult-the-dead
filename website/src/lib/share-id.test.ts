/**
 * Unit tests for share-id helper.
 *
 * Written in vitest-compatible syntax. The codebase does not yet have a
 * test runner wired up (devops task in flight to install vitest). Once the
 * test runner is installed, `pnpm test website/src/lib/share-id.test.ts`
 * (or the equivalent npm script) should pick this file up.
 *
 * Until then, the file is type-checked by `next build` because it lives
 * under `src/`. To run the assertions directly today:
 *
 *   npx tsx website/src/lib/share-id.test.ts
 *
 * The runtime guard at the bottom invokes the suite when no `expect` global
 * is present (i.e. running outside vitest).
 */
import {
  generateShareId,
  isPublicShareId,
  looksLikeShareId,
  PUBLIC_SHARE_ID_MAX_LENGTH,
  PUBLIC_SHARE_ID_MIN_LENGTH,
  PUBLIC_SHARE_ID_PATTERN,
} from "./share-id";

type TestFn = () => void;
type Suite = { name: string; tests: { name: string; fn: TestFn }[] };
const suites: Suite[] = [];
let currentSuite: Suite | null = null;

// Minimal describe/it/expect shim used when running the file directly.
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
    toThrow() {
      if (typeof actual !== "function") {
        throw new Error("toThrow expects a function");
      }
      let threw = false;
      try {
        (actual as unknown as () => void)();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error("Expected function to throw");
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string") {
        throw new Error("toMatch expects a string");
      }
      if (!pattern.test(actual)) {
        throw new Error(`Expected ${actual} to match ${pattern}`);
      }
    },
  };
}

// vitest globals if running under it; otherwise our shim.
const g = globalThis as unknown as {
  describe?: typeof describeFallback;
  it?: typeof itFallback;
  expect?: typeof expectFallback;
};
const describe = g.describe ?? describeFallback;
const it = g.it ?? itFallback;
const expect = g.expect ?? expectFallback;

describe("generateShareId", () => {
  it("returns a string of the requested length", () => {
    const id = generateShareId(10);
    expect(id.length).toBe(10);
  });

  it("only uses the safe alphabet (no 0/o/1/l/i)", () => {
    for (let i = 0; i < 50; i++) {
      const id = generateShareId(12);
      expect(id).toMatch(/^[a-z2-9]+$/);
    }
  });

  it("rejects sub-4 length", () => {
    expect(() => generateShareId(3)).toThrow();
  });

  it("rejects non-integer length", () => {
    expect(() => generateShareId(7.5)).toThrow();
  });

  it("produces distinct ids on repeated calls", () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i++) set.add(generateShareId(10));
    // 200 random 10-char base32 ids should never collide in a single test run.
    expect(set.size).toBe(200);
  });

  it("respects custom length", () => {
    expect(generateShareId(6).length).toBe(6);
    expect(generateShareId(20).length).toBe(20);
  });
});

describe("looksLikeShareId", () => {
  it("accepts well-formed lowercase share ids", () => {
    expect(looksLikeShareId("abcdef2345")).toBe(true);
    expect(looksLikeShareId("k7n3pqx9rt")).toBe(true);
  });

  it("accepts hyphenated public share slugs used by outreach and seeded rows", () => {
    expect(looksLikeShareId("abhishek-chakravarty")).toBe(true);
    expect(looksLikeShareId("alex-van-le")).toBe(true);
  });

  it("rejects UUIDs (contain hyphens)", () => {
    expect(looksLikeShareId("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
  });

  it("rejects ids containing forbidden glyphs", () => {
    expect(looksLikeShareId("abc0def123")).toBe(false); // contains 0 and 1
    expect(looksLikeShareId("share-1")).toBe(false); // contains 1
    expect(looksLikeShareId("abcOdefIJK")).toBe(false); // uppercase
  });

  it("rejects empty / too-short / too-long", () => {
    expect(looksLikeShareId("")).toBe(false);
    expect(looksLikeShareId("abc")).toBe(false);
    expect(looksLikeShareId("a".repeat(65))).toBe(false);
  });

  it("rejects malformed path segments", () => {
    expect(looksLikeShareId("-abc")).toBe(false);
    expect(looksLikeShareId("abc-")).toBe(false);
    expect(looksLikeShareId("abc--def")).toBe(false);
    expect(looksLikeShareId("abc_def")).toBe(false);
    expect(looksLikeShareId("abc/def")).toBe(false);
    expect(looksLikeShareId(" abc-def ")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(looksLikeShareId(123)).toBe(false);
    expect(looksLikeShareId(null)).toBe(false);
  });

  it("exports the explicit public-share contract alias and pattern", () => {
    expect(isPublicShareId("abhishek-chakravarty")).toBe(true);
    expect(PUBLIC_SHARE_ID_PATTERN.test("abhishek-chakravarty")).toBe(true);
    expect(PUBLIC_SHARE_ID_PATTERN.test("abc--def")).toBe(false);
    expect(PUBLIC_SHARE_ID_MIN_LENGTH).toBe(4);
    expect(PUBLIC_SHARE_ID_MAX_LENGTH).toBe(64);
  });
});

// When run directly (no vitest), execute all suites and exit with a status
// code reflecting pass/fail. This block is a no-op under vitest because
// vitest collects the registered suites itself.
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
    console.log(`✓ share-id: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`);
  } else {
    process.exit(1);
  }
}
