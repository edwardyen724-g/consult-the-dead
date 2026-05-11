import { renderToStaticMarkup } from "react-dom/server";
import {
  buildShareAgonRequestBody,
  getShareAgonButtonLabel,
  ShareAgonPanel,
  type ShareAgonPanelProps,
} from "./ShareAgonPanel";

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
    toContain(substring: string) {
      if (typeof actual !== "string" || !actual.includes(substring)) {
        throw new Error(
          `Expected ${String(actual)} to contain ${JSON.stringify(substring)}`,
        );
      }
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string" || !pattern.test(actual)) {
        throw new Error(`Expected ${String(actual)} to match ${pattern}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
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

const BASE_PROPS: ShareAgonPanelProps = {
  agon: {
    topic: "Should I raise VC or bootstrap?",
    mindSlugs: ["marie-curie", "sun-tzu", "niccolo-machiavelli"],
    rounds: 3,
    turns: [],
    consensus: null,
    research: null,
  },
};

function renderPanel(overrides: Partial<ShareAgonPanelProps> = {}) {
  const props: ShareAgonPanelProps = {
    ...BASE_PROPS,
    ...overrides,
    agon: {
      ...BASE_PROPS.agon,
      ...overrides.agon,
    },
  };
  return renderToStaticMarkup(<ShareAgonPanel {...props} />);
}

describe("buildShareAgonRequestBody", () => {
  it("serializes the agon payload for /api/library", () => {
    expect(buildShareAgonRequestBody(BASE_PROPS.agon)).toEqual({
      topic: "Should I raise VC or bootstrap?",
      mindSlugs: ["marie-curie", "sun-tzu", "niccolo-machiavelli"],
      rounds: 3,
      turns: [],
      consensus: null,
      research: null,
    });
  });

  it("preserves research text when present", () => {
    expect(
      buildShareAgonRequestBody({
        ...BASE_PROPS.agon,
        research: "Use the library path.",
      }),
    ).toEqual({
      topic: "Should I raise VC or bootstrap?",
      mindSlugs: ["marie-curie", "sun-tzu", "niccolo-machiavelli"],
      rounds: 3,
      turns: [],
      consensus: null,
      research: "Use the library path.",
    });
  });
});

describe("getShareAgonButtonLabel", () => {
  it("keeps the button copy stable across share states", () => {
    expect(
      getShareAgonButtonLabel({
        disabled: false,
        saveState: "idle",
        shareId: null,
      }),
    ).toBe("Share this agon");
    expect(
      getShareAgonButtonLabel({
        disabled: false,
        saveState: "saving",
        shareId: null,
      }),
    ).toBe("Sharing…");
    expect(
      getShareAgonButtonLabel({
        disabled: false,
        saveState: "error",
        shareId: null,
      }),
    ).toBe("Share failed — retry");
    expect(
      getShareAgonButtonLabel({
        disabled: false,
        saveState: "saved",
        shareId: "k7n3pqx9rt",
      }),
    ).toBe("Share");
  });
});

describe("ShareAgonPanel", () => {
  it("renders the idle share prompt before an agon has been saved", () => {
    const html = renderPanel();
    expect(html).toContain("Share this agon");
    expect(html).toContain("Saves the agon and copies the public link");
    expect(html).toContain("aria-label=\"Share this agon\"");
    expect(html).toContain("system share sheet");
    expect(html).toMatch(/<button[^>]+aria-label=\"Share this agon\"/);
    expect(html).toMatch(/<p[^>]*>.*system share sheet.*<\/p>/s);
    expect(html).toContain("data-testid=\"share-agon-panel\"");
    expect(html.includes("Copy link")).toBe(false);
  });

  it("renders the saved state with the resolved share URL and copy control", () => {
    const html = renderPanel({ existingShareId: "k7n3pqx9rt" });
    expect(html).toContain("aria-label=\"Share\"");
    expect(html).toContain("Copy link");
    expect(html).toContain("https://www.consultthedead.com/agora/a/k7n3pqx9rt");
    expect(html).toContain("Public share URL");
  });

  it("marks the share action as disabled when the parent says the agon is incomplete", () => {
    const html = renderPanel({ disabled: true });
    expect(html).toContain("disabled");
    expect(html).toContain("aria-label=\"Share this agon\"");
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
      `✓ ShareAgonPanel: ${suites.reduce((n, s) => n + s.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
