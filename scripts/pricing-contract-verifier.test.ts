import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertPricingContractReport,
  buildPricingContractReport,
  formatPricingContractReport,
  parsePricingCliArgs,
  parsePricingDoc,
  printPricingUsage,
  type PricingContractReport,
} from "./pricing-contract-verifier";

type TestFn = () => void | Promise<void>;
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
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toContain(expected: string) {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string" || !pattern.test(actual)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to match ${pattern}`);
      }
    },
    toBeGreaterThan(min: number) {
      if (typeof actual !== "number" || actual <= min) {
        throw new Error(`Expected ${String(actual)} to be greater than ${min}`);
      }
    },
    toThrow(expected?: RegExp) {
      if (typeof actual !== "function") {
        throw new Error("toThrow requires a function");
      }
      let thrown: unknown = null;
      try {
        (actual as () => unknown)();
      } catch (error) {
        thrown = error;
      }
      if (!thrown) {
        throw new Error("Expected function to throw");
      }
      if (expected && !(thrown instanceof Error && expected.test(thrown.message))) {
        throw new Error(`Expected thrown error to match ${expected}, got ${thrown instanceof Error ? thrown.message : String(thrown)}`);
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

const docsPath = resolve(process.cwd(), "docs/pricing.md");
const pricingDoc = readFileSync(docsPath, "utf8");

function createMockFetch(routes: Record<string, string>) {
  return async (url: string) => {
    const body = routes[url];
    if (typeof body === "undefined") {
      return {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "",
      } as const;
    }
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => body,
    } as const;
  };
}

const happyPricingHtml = `
  <html>
    <head>
      <meta property="og:title" content="Pricing">
      <meta property="og:description" content="Always free to start with 3 agons/day and BYO key unlimited mode. Pro adds PDF export, extended research, 48-hour founder support, and founding-member pricing at $300/year.">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Pricing">
      <meta name="twitter:description" content="Always free to start with 3 agons/day and BYO key unlimited mode. Pro adds PDF export, extended research, 48-hour founder support, and founding-member pricing at $300/year.">
      <link rel="canonical" href="https://www.consultthedead.com/pricing">
    </head>
    <body>
      Free
      BYO key
      Pro
      Always free. 3 agons per day, no signup, Sonnet for the full debate.
      Unlimited debates with your own Anthropic key. Still free tier, still no signup.
      2–3 minds
      100 / month
      Up to 5 minds
      48-hour email response from Edward
      7-day trial, then $25/mo annual or $30/mo monthly. Opus, persistent library, PDF, and deeper research.
      Founding-member pricing. Early subscribers lock in $300/year for life. After Q3 2026, annual plans go to $360. Monthly stays at $30.
    </body>
  </html>
`;

const happyAgoraHtml = `
  <html>
    <body>
      Free tier: 3 agons / day · BYO key for unlimited
      ★ Pro · 100 agons/month remaining
      5 minds · Opus synthesis
      upgrade to Pro
    </body>
  </html>
`;

describe("parsePricingDoc", () => {
  it("extracts the canonical pricing contract from docs/pricing.md", () => {
    const contract = parsePricingDoc(pricingDoc);
    expect(contract.freeDailyAgons).toBe("3 / day");
    expect(contract.freeCouncilSize).toBe("2–3 minds");
    expect(contract.freeModel).toBe("Claude Sonnet");
    expect(contract.byoKey).toContain("unlimited");
    expect(contract.proMonthlyPrice).toBe("$30/month");
    expect(contract.proAnnualPrice).toBe("$300/year");
    expect(contract.proAnnualEquivalent).toBe("$25/month");
    expect(contract.proAgonsPerMonth).toBe("100 / month");
    expect(contract.proCouncilSize).toBe("2–5 minds");
    expect(contract.proModel).toContain("Claude Opus");
    expect(contract.proTrial).toContain("7-day free trial");
    expect(contract.founderSupport).toContain("48-hour email response");
    expect(contract.foundingMemberDeadline).toBe("Q3 2026");
    expect(contract.foundingMemberFuturePrice).toBe("$360/year");
  });
});

describe("cli parsing", () => {
  it("parses the supported flags", () => {
    expect(parsePricingCliArgs(["--base-url", "https://example.com", "--doc-path", "./docs/pricing.md", "--json"])).toEqual({
      baseUrl: "https://example.com",
      docsPath: "./docs/pricing.md",
      json: true,
      help: false,
    });
  });

  it("prints usage text", () => {
    expect(printPricingUsage()).toContain("pricing-contract-verifier.ts");
  });
});

describe("pricing contract verifier", () => {
  it("passes on the canonical happy path", async () => {
    const report = await buildPricingContractReport({
      baseUrl: "https://www.consultthedead.com",
      docsPath,
      fetchImpl: createMockFetch({
        "https://www.consultthedead.com/pricing": happyPricingHtml,
        "https://www.consultthedead.com/agora": happyAgoraHtml,
      }) as unknown as typeof fetch,
      readFileImpl: readFileSync,
    });
    expect(report.checks.every((check) => check.passed)).toBe(true);
    assertPricingContractReport(report);
    expect(formatPricingContractReport(report)).toContain("Checks:");
  });

  it("reports a failure when the live copy drifts", async () => {
    const report = await buildPricingContractReport({
      baseUrl: "https://www.consultthedead.com",
      docsPath,
      fetchImpl: createMockFetch({
        "https://www.consultthedead.com/pricing": happyPricingHtml.replace(
          "founding-member pricing at $300/year",
          "stale pricing copy",
        ),
        "https://www.consultthedead.com/agora": happyAgoraHtml.replace("Opus synthesis", "Synthesis"),
      }) as unknown as typeof fetch,
      readFileImpl: readFileSync,
    });
    const failed = report.checks.filter((check) => !check.passed);
    expect(failed.length).toBeGreaterThan(0);
    expect(() => assertPricingContractReport(report)).toThrow(/pricing metadata: og:description|mentions the Pro synthesis model/);
    expect(formatPricingContractReport(report)).toContain("Failures:");
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  void (async () => {
    let failed = 0;
    for (const suite of suites) {
      for (const t of suite.tests) {
        try {
          await t.fn();
        } catch (error) {
          failed += 1;
          const msg = error instanceof Error ? error.message : String(error);
          console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
        }
      }
    }
    if (failed === 0) {
      console.log(`✓ pricing-contract-verifier: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`);
    } else {
      process.exit(1);
    }
  })();
}
