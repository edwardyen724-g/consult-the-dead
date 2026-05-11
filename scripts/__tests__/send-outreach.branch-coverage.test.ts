import {
  firstName,
  sendOutreach,
  type ResendSender,
} from "../send-outreach";
import { OUTREACH_LIST } from "../outreach-list";

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
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
      }
    },
    toContain(needle: string) {
      if (typeof actual !== "string" || !actual.includes(needle)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(needle)}`,
        );
      }
    },
    toBeGreaterThan(min: number) {
      if (typeof actual !== "number" || actual <= min) {
        throw new Error(`Expected ${String(actual)} > ${min}`);
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

describe("send-outreach branch coverage", () => {
  it("falls back to 'there' when trim() leaves an empty first token", () => {
    const weirdDisplayName = {
      trim() {
        return " ";
      },
    } as unknown as string;

    expect(firstName(weirdDisplayName)).toBe("there");
  });

  it("uses process.env when env is omitted and still sends successfully", async () => {
    const previousKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = "re_branch_cover";

    let observedTo = "";
    const sender: ResendSender = async (input) => {
      observedTo = input.to;
      return { data: { id: "msg_branch" } };
    };

    try {
      const result = await sendOutreach({
        slug: "abhishek-chakravarty",
        to: "branch@example.com",
        dryRun: false,
        resendSender: sender,
      });

      expect(result.status).toBe("sent");
      expect(result.messageId).toBe("msg_branch");
      expect(observedTo).toBe("branch@example.com");
    } finally {
      if (previousKey === undefined) {
        delete process.env.RESEND_API_KEY;
      } else {
        process.env.RESEND_API_KEY = previousKey;
      }
    }
  });

  it("keeps the dry-run placeholder path when roster email is blank or missing", async () => {
    const recipient = OUTREACH_LIST.find((r) => r.slug === "abhishek-chakravarty");
    if (!recipient) {
      throw new Error("Expected abhishek-chakravarty to exist in the roster");
    }

    const originalEmail = recipient.email;
    recipient.email = undefined as unknown as string;

    try {
      const result = await sendOutreach({
        slug: recipient.slug,
        dryRun: true,
      });

      expect(result.status).toBe("dry-run");
      expect(result.to).toContain("pass --to or fill in outreach-list.ts");
    } finally {
      recipient.email = originalEmail;
    }
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  void (async () => {
    let failed = 0;
    let passed = 0;
    for (const suite of suites) {
      for (const test of suite.tests) {
        try {
          await test.fn();
          passed++;
        } catch (error) {
          failed++;
          const message = error instanceof Error ? error.message : String(error);
          console.error(`✗ ${suite.name} > ${test.name}: ${message}`);
        }
      }
    }

    if (failed === 0) {
      console.log(`✓ send-outreach branch coverage: ${passed} tests passed`);
    } else {
      console.error(`✗ send-outreach branch coverage: ${failed} failed, ${passed} passed`);
      process.exit(1);
    }
  })();
}
