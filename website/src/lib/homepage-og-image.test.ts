/**
 * Unit tests for the homepage OG/Twitter image constants and URL helpers.
 *
 * Run via vitest:
 *   cd website && npm run test
 *
 * Or directly via tsx (uses the same describe/it/expect shim pattern as
 * other tests in this directory):
 *   npx tsx website/src/lib/homepage-og-image.test.ts
 *
 * Coverage note: The route files (app/opengraph-image.tsx,
 * app/twitter-image.tsx) live in src/app/** which is excluded from vitest
 * coverage per the policy in vitest.config.ts — they are integration-tested
 * by Playwright. This file covers the pure lib surface to ≥95%.
 */
import {
  DEFAULT_HOMEPAGE_OG_IMAGE_ORIGIN,
  HOMEPAGE_OG_IMAGE_ALT,
  HOMEPAGE_OG_IMAGE_HEIGHT,
  HOMEPAGE_OG_IMAGE_PATH,
  HOMEPAGE_OG_IMAGE_SIZE,
  HOMEPAGE_OG_IMAGE_WIDTH,
  HOMEPAGE_TWITTER_IMAGE_PATH,
  buildHomepageOgImageUrl,
  buildHomepageTwitterImageUrl,
} from "./homepage-og-image";

/* ── describe/it/expect shim ────────────────────────────────────── */

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
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
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

/* ── constants ───────────────────────────────────────────────────── */

describe("homepage OG image constants", () => {
  it("uses the canonical 1200x630 summary_large_image size", () => {
    expect(HOMEPAGE_OG_IMAGE_WIDTH).toBe(1200);
    expect(HOMEPAGE_OG_IMAGE_HEIGHT).toBe(630);
    expect(HOMEPAGE_OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it("uses the canonical site origin", () => {
    expect(DEFAULT_HOMEPAGE_OG_IMAGE_ORIGIN).toBe(
      "https://www.consultthedead.com",
    );
  });

  it("exports the canonical alt text", () => {
    expect(HOMEPAGE_OG_IMAGE_ALT).toBe(
      "Consult The Dead — Unlock the minds of history's greatest thinkers",
    );
  });

  it("exports the canonical image paths", () => {
    expect(HOMEPAGE_OG_IMAGE_PATH).toBe("/opengraph-image");
    expect(HOMEPAGE_TWITTER_IMAGE_PATH).toBe("/twitter-image");
  });
});

/* ── buildHomepageOgImageUrl ─────────────────────────────────────── */

describe("buildHomepageOgImageUrl", () => {
  it("returns the absolute URL using the default origin", () => {
    expect(buildHomepageOgImageUrl()).toBe(
      "https://www.consultthedead.com/opengraph-image",
    );
  });

  it("respects an explicit origin", () => {
    expect(buildHomepageOgImageUrl("https://staging.example.com")).toBe(
      "https://staging.example.com/opengraph-image",
    );
  });

  it("strips trailing slashes from the supplied origin", () => {
    expect(buildHomepageOgImageUrl("https://example.com/")).toBe(
      "https://example.com/opengraph-image",
    );
    expect(buildHomepageOgImageUrl("https://example.com///")).toBe(
      "https://example.com/opengraph-image",
    );
  });

  it("auto-prepends https:// when the origin has no scheme", () => {
    expect(buildHomepageOgImageUrl("consultthedead.com")).toBe(
      "https://consultthedead.com/opengraph-image",
    );
  });

  it("preserves an http:// origin (local dev)", () => {
    expect(buildHomepageOgImageUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/opengraph-image",
    );
  });

  it("returns null when the origin is empty after normalization", () => {
    expect(buildHomepageOgImageUrl("")).toBeNull();
    expect(buildHomepageOgImageUrl("    ")).toBeNull();
    expect(buildHomepageOgImageUrl("/")).toBeNull();
  });
});

/* ── buildHomepageTwitterImageUrl ────────────────────────────────── */

describe("buildHomepageTwitterImageUrl", () => {
  it("returns the absolute URL using the default origin", () => {
    expect(buildHomepageTwitterImageUrl()).toBe(
      "https://www.consultthedead.com/twitter-image",
    );
  });

  it("respects an explicit origin", () => {
    expect(buildHomepageTwitterImageUrl("https://staging.example.com")).toBe(
      "https://staging.example.com/twitter-image",
    );
  });

  it("strips trailing slashes from the supplied origin", () => {
    expect(buildHomepageTwitterImageUrl("https://example.com/")).toBe(
      "https://example.com/twitter-image",
    );
    expect(buildHomepageTwitterImageUrl("https://example.com//")).toBe(
      "https://example.com/twitter-image",
    );
  });

  it("auto-prepends https:// when the origin has no scheme", () => {
    expect(buildHomepageTwitterImageUrl("consultthedead.com")).toBe(
      "https://consultthedead.com/twitter-image",
    );
  });

  it("preserves an http:// origin (local dev)", () => {
    expect(buildHomepageTwitterImageUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/twitter-image",
    );
  });

  it("returns null when the origin is empty after normalization", () => {
    expect(buildHomepageTwitterImageUrl("")).toBeNull();
    expect(buildHomepageTwitterImageUrl("    ")).toBeNull();
    expect(buildHomepageTwitterImageUrl("/")).toBeNull();
  });
});

/* ── Direct-run harness ──────────────────────────────────────────── */

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  let passed = 0;
  for (const suite of suites) {
    for (const t of suite.tests) {
      try {
        t.fn();
        passed++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
      }
    }
  }
  if (failed === 0) {
    console.log(`✓ homepage-og-image: ${passed} tests passed`);
  } else {
    console.error(`${failed} test(s) failed (${passed} passed)`);
    process.exit(1);
  }
}
