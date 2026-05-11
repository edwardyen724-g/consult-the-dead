/**
 * Regression test for the robots metadata route.
 *
 * Uses the same vitest-compatible shim pattern as the local metadata tests so
 * it can run under vitest and directly via `npx tsx` if needed.
 */
import robots from "./robots";

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
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${String(actual)} to be truthy`);
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

describe("robots metadata", () => {
  it("points crawlers at the canonical sitemap and excludes private surfaces", () => {
    const metadata = robots();

    expect(metadata.host).toBe("https://www.consultthedead.com");
    expect(metadata.sitemap).toBe("https://www.consultthedead.com/sitemap.xml");
    expect(metadata.rules).toEqual([
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/api/", "/library", "/sign-in", "/sign-up"],
      },
    ]);
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
    console.log(`✓ robots metadata: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`);
  } else {
    process.exit(1);
  }
}
