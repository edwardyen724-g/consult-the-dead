import {
  buildBeehiivSubscribePayload,
  subscribeToBeehiiv,
} from "./beehiiv";

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
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${String(actual)} to be falsy`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${String(actual)} to be truthy`);
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

describe("buildBeehiivSubscribePayload", () => {
  it("normalizes email (trim + lowercase) and defaults utmSource to 'agora'", () => {
    const result = buildBeehiivSubscribePayload({ email: "  User@Example.COM  " });
    expect(result).toEqual({
      email: "user@example.com",
      utm_source: "agora",
      reactivate: true,
      send_welcome_email: true,
    });
  });

  it("sets send_welcome_email to true always", () => {
    const result = buildBeehiivSubscribePayload({ email: "a@b.com" });
    expect(result.send_welcome_email).toBe(true);
  });

  it("respects explicit utmSource override", () => {
    const result = buildBeehiivSubscribePayload({
      email: "a@b.com",
      utmSource: "newsletter",
    });
    expect(result.utm_source).toBe("newsletter");
  });

  it("respects explicit reactivate override", () => {
    const result = buildBeehiivSubscribePayload({
      email: "a@b.com",
      reactivate: false,
    });
    expect(result.reactivate).toBe(false);
  });
});

describe("subscribeToBeehiiv", () => {
  it("returns not-configured error when env vars are unset", async () => {
    // Ensure env vars are not set for this test
    const savedKey = process.env.BEEHIIV_API_KEY;
    const savedPub = process.env.BEEHIIV_PUBLICATION_ID;
    delete process.env.BEEHIIV_API_KEY;
    delete process.env.BEEHIIV_PUBLICATION_ID;

    const result = await subscribeToBeehiiv({ email: "test@example.com" });

    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      "BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID not configured",
    );
    expect(result.subscriberId).toBe(null);
    expect(result.alreadySubscribed).toBe(false);

    // Restore
    if (savedKey !== undefined) process.env.BEEHIIV_API_KEY = savedKey;
    if (savedPub !== undefined) process.env.BEEHIIV_PUBLICATION_ID = savedPub;
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  void (async () => {
    let failed = 0;
    for (const suite of suites) {
      for (const t of suite.tests) {
        try {
          await t.fn();
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
        }
      }
    }
    if (failed === 0) {
      const total = suites.reduce((n, s) => n + s.tests.length, 0);
      console.log(`✓ beehiiv: ${total} tests passed`);
    } else {
      process.exit(1);
    }
  })();
}
