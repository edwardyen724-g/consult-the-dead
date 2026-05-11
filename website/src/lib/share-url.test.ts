/**
 * Unit tests for share-url helper.
 *
 * Mirrors the dual-runner pattern used by share-id.test.ts: the tests run
 * under vitest once PR #5 lands the framework, and run today via
 * `npx tsx website/src/lib/share-url.test.ts` thanks to the local shim.
 *
 * Coverage target (per capsule cce55163 acceptance #5):
 *   - shareId → URL transform (path + absolute)
 *   - title/text payload for navigator.share, including topic truncation
 *   - rejection of malformed share ids
 */
import {
  SITE_ORIGIN,
  buildShareUrl,
  buildShareUrlPath,
  buildSharePayload,
} from "./share-url";

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
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string" || !pattern.test(actual)) {
        throw new Error(`Expected ${String(actual)} to match ${pattern}`);
      }
    },
    toContain(substring: string) {
      if (typeof actual !== "string" || !actual.includes(substring)) {
        throw new Error(
          `Expected ${String(actual)} to contain ${JSON.stringify(substring)}`,
        );
      }
    },
    toThrow() {
      if (typeof actual !== "function") {
        throw new Error("toThrow() expects a function");
      }
      let threw = false;
      try {
        (actual as () => unknown)();
      } catch {
        threw = true;
      }
      if (!threw) {
        throw new Error("Expected function to throw, but it did not");
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual > expected) {
        throw new Error(
          `Expected ${String(actual)} to be <= ${expected}`,
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

const VALID_ID = "k7n3pqx9rt";
const VALID_ID_2 = "abc23fghjk";

describe("buildShareUrlPath", () => {
  it("produces /agora/a/<shareId>", () => {
    expect(buildShareUrlPath(VALID_ID)).toBe(`/agora/a/${VALID_ID}`);
  });

  it("rejects malformed share ids (UUID with hyphens)", () => {
    expect(() =>
      buildShareUrlPath("550e8400-e29b-41d4-a716-446655440000"),
    ).toThrow();
  });

  it("rejects share ids containing forbidden glyphs", () => {
    // Contains 0 and 1 — outside the safe alphabet.
    expect(() => buildShareUrlPath("abc0def123")).toThrow();
  });

  it("rejects empty input", () => {
    expect(() => buildShareUrlPath("")).toThrow();
  });
});

describe("buildShareUrl", () => {
  it("defaults to the canonical production origin", () => {
    expect(buildShareUrl(VALID_ID)).toBe(
      `${SITE_ORIGIN}/agora/a/${VALID_ID}`,
    );
  });

  it("hard-codes the canonical production origin to www.consultthedead.com", () => {
    // Locks the production origin in case someone refactors SITE_ORIGIN.
    expect(SITE_ORIGIN).toBe("https://www.consultthedead.com");
  });

  it("accepts a custom origin override (for previews / dev)", () => {
    const url = buildShareUrl(VALID_ID, {
      origin: "https://preview.consultthedead.com",
    });
    expect(url).toBe(
      `https://preview.consultthedead.com/agora/a/${VALID_ID}`,
    );
  });

  it("strips trailing slashes from custom origins to avoid // in the URL", () => {
    const url = buildShareUrl(VALID_ID, {
      origin: "https://preview.consultthedead.com/",
    });
    expect(url).toBe(
      `https://preview.consultthedead.com/agora/a/${VALID_ID}`,
    );
  });

  it("propagates malformed-id errors from buildShareUrlPath", () => {
    expect(() => buildShareUrl("BAD-ID")).toThrow();
  });
});

describe("buildSharePayload", () => {
  it("includes title, text, and the absolute URL", () => {
    const payload = buildSharePayload({
      shareId: VALID_ID,
      topic: "Should I raise VC or bootstrap?",
    });
    expect(payload.title).toBe("Consult The Dead — The Agora");
    expect(payload.url).toBe(`${SITE_ORIGIN}/agora/a/${VALID_ID}`);
    expect(payload.text).toContain("Should I raise VC or bootstrap?");
  });

  it("falls back to a generic body when topic is empty/whitespace", () => {
    const payload = buildSharePayload({ shareId: VALID_ID, topic: "   " });
    expect(payload.title).toBe("Consult The Dead — The Agora");
    expect(payload.text).toContain("council of dead minds");
    expect(payload.url).toBe(`${SITE_ORIGIN}/agora/a/${VALID_ID}`);
  });

  it("trims the topic before embedding it in the text", () => {
    const payload = buildSharePayload({
      shareId: VALID_ID,
      topic: "   Pivot now or wait?   ",
    });
    expect(payload.text).toContain("Pivot now or wait?");
    // No leading/trailing whitespace bleeding into the share text.
    expect(payload.text).toMatch(/"Pivot now or wait\?"/);
  });

  it("truncates very long topics so previews don't blow up", () => {
    const huge = "word ".repeat(200).trim();
    const payload = buildSharePayload({ shareId: VALID_ID_2, topic: huge });
    // Hard cap is 200 chars on the text body.
    expect(payload.text.length).toBeLessThanOrEqual(200);
    // Truncated bodies end in an ellipsis so users know it was clipped.
    expect(payload.text).toContain("…");
  });

  it("respects a custom origin for the URL field", () => {
    const payload = buildSharePayload({
      shareId: VALID_ID,
      topic: "x",
      origin: "https://staging.example.com",
    });
    expect(payload.url).toBe(
      `https://staging.example.com/agora/a/${VALID_ID}`,
    );
  });

  it("rejects malformed share ids via the underlying helpers", () => {
    expect(() =>
      buildSharePayload({ shareId: "BAD!ID", topic: "x" }),
    ).toThrow();
  });
});

// Run-directly fallback (mirrors share-id.test.ts).
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
      `✓ share-url: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
