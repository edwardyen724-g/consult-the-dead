/**
 * Regression test for the pricing route metadata.
 *
 * Uses the same vitest-compatible shim pattern as the other local tests so it
 * can run under vitest and also directly via `npx tsx` when needed.
 */
import PricingLayout, { metadata } from "./layout";
import {
  getPricingMetadataDescription,
  getPricingMetadataTitle,
  getPricingSharePreviewCard,
} from "@/lib/pricing-copy";

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
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${String(actual)} to be falsy`);
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

describe("pricing metadata", () => {
  it("uses canonical free, BYO key, and Pro copy", () => {
    const description = getPricingMetadataDescription();
    const title = getPricingMetadataTitle();
    const card = getPricingSharePreviewCard();

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBe(description);
    expect(metadata.alternates?.canonical).toBe("https://www.consultthedead.com/pricing");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toEqual({
      title,
      description,
      url: "https://www.consultthedead.com/pricing",
      type: "website",
      siteName: "Consult The Dead",
      images: ["https://www.consultthedead.com/pricing/opengraph-image"],
    });
    expect(metadata.twitter).toEqual({
      card,
      title,
      description,
      images: ["https://www.consultthedead.com/pricing/twitter-image"],
    });
  });

  it("does not regress to the old feature-summary wording", () => {
    const description = metadata.description ?? "";
    expect(description.includes("Three free agons per day")).toBeFalsy();
    expect(description.includes("persistent debate library")).toBeFalsy();
    expect(description.includes("larger councils")).toBeFalsy();
  });

  it("mentions the canonical feature terms required by the brief", () => {
    const description = metadata.description ?? "";
    expect(description.includes("BYO key")).toBeTruthy();
    expect(description.includes("PDF export")).toBeTruthy();
    expect(description.includes("extended research")).toBeTruthy();
    expect(description.includes("48-hour founder support")).toBeTruthy();
    expect(description.includes("founding-member pricing")).toBeTruthy();
  });

  it("returns children unchanged", () => {
    expect(PricingLayout({ children: "Pricing child" })).toBe("Pricing child");
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
    console.log(`✓ pricing metadata: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`);
  } else {
    process.exit(1);
  }
}
