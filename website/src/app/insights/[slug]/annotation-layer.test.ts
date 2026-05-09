import { INSIGHT_ENTRIES, getInsightAnnotatedPassages, splitPassageByExcerpt } from "@/lib/insights";
import { getFramework } from "@/lib/frameworks";

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
    toContain(expected: string) {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected ${String(actual)} to contain ${expected}`);
      }
    },
    toHaveLength(expected: number) {
      if (!actual || typeof (actual as { length?: number }).length !== "number") {
        throw new Error("toHaveLength expects an array-like value");
      }
      if ((actual as { length: number }).length !== expected) {
        throw new Error(
          `Expected length ${(actual as { length: number }).length} to be ${expected}`,
        );
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== "number" || actual <= expected) {
        throw new Error(`Expected ${String(actual)} to be greater than ${expected}`);
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

describe("splitPassageByExcerpt", () => {
  it("highlights the matching excerpt while preserving surrounding text", () => {
    const segments = splitPassageByExcerpt(
      "You are three months from running out of runway and the metrics aren't moving.",
      "running out of runway",
    );

    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ text: "You are three months from ", highlighted: false });
    expect(segments[1]).toEqual({ text: "running out of runway", highlighted: true });
    expect(segments[2]).toEqual({
      text: " and the metrics aren't moving.",
      highlighted: false,
    });
  });

  it("falls back to the full passage when the excerpt is missing", () => {
    const segments = splitPassageByExcerpt("Plain text passage", "missing excerpt");
    expect(segments).toEqual([{ text: "Plain text passage", highlighted: false }]);
  });

  it("handles blank input safely", () => {
    const segments = splitPassageByExcerpt("   ", "anything");
    expect(segments).toEqual([{ text: "", highlighted: false }]);
  });

  it("handles excerpts at the beginning and end of a passage", () => {
    const prefixSegments = splitPassageByExcerpt(
      "Running out of runway forces a pivot.",
      "Running out of runway",
    );
    expect(prefixSegments).toEqual([
      { text: "Running out of runway", highlighted: true },
      { text: " forces a pivot.", highlighted: false },
    ]);

    const suffixSegments = splitPassageByExcerpt(
      "The answer is mathematical certainty",
      "mathematical certainty",
    );
    expect(suffixSegments).toEqual([
      { text: "The answer is ", highlighted: false },
      { text: "mathematical certainty", highlighted: true },
    ]);
  });
});

describe("getInsightAnnotatedPassages", () => {
  it("returns construct-linked passages for a real insight entry", () => {
    const entry = INSIGHT_ENTRIES.find(
      (candidate) => candidate.slug === "how-newton-would-approach-your-pivot-decision",
    );

    if (!entry) {
      throw new Error("Newton insight entry not found");
    }

    const framework = getFramework(entry.frameworkSlug);
    if (!framework) {
      throw new Error("Newton framework not found");
    }

    const passages = getInsightAnnotatedPassages(entry, framework);

    expect(passages).toHaveLength(2);
    expect(passages[0].label).toBe("Runway pressure");
    expect(passages[0].text).toContain("running out of runway");
    expect(passages[0].construct.construct).toBe(
      framework.bipolar_constructs[0].construct,
    );
    expect(passages[0].detail).toContain(framework.bipolar_constructs[0].positive_pole);
    expect(passages[1].label).toBe("Proof threshold");
    expect(passages[1].text).toContain("mathematical certainty");
    expect(passages[1].construct.construct).toBe(
      framework.bipolar_constructs[1].construct,
    );
  });

  it("returns an empty list for insight slugs without annotation blueprints", () => {
    const entry = INSIGHT_ENTRIES.find(
      (candidate) => candidate.slug === "how-newton-would-approach-your-pivot-decision",
    );

    if (!entry) {
      throw new Error("Newton insight entry not found");
    }

    const framework = getFramework(entry.frameworkSlug);
    if (!framework) {
      throw new Error("Newton framework not found");
    }

    const passages = getInsightAnnotatedPassages(
      { ...entry, slug: "unmapped-slug" },
      framework,
    );

    expect(passages).toEqual([]);
  });

  it("builds annotated passages for every published insight slug", () => {
    for (const entry of INSIGHT_ENTRIES) {
      const framework = getFramework(entry.frameworkSlug);
      if (!framework) {
        throw new Error(`Framework not found for ${entry.slug}`);
      }

      const passages = getInsightAnnotatedPassages(entry, framework);
      expect(passages.length).toBeGreaterThan(0);
      expect(passages[0].detail).toContain(passages[0].construct.positive_pole);
    }
  });

  it("drops blueprints whose construct index is unavailable", () => {
    const entry = INSIGHT_ENTRIES.find(
      (candidate) => candidate.slug === "how-newton-would-approach-your-pivot-decision",
    );

    if (!entry) {
      throw new Error("Newton insight entry not found");
    }

    const passages = getInsightAnnotatedPassages(entry, {
      ...getFramework(entry.frameworkSlug)!,
      bipolar_constructs: [],
    });

    expect(passages).toEqual([]);
  });

  it("skips blueprints that resolve to blank passage text", () => {
    const entry = INSIGHT_ENTRIES.find(
      (candidate) => candidate.slug === "how-newton-would-approach-your-pivot-decision",
    );

    if (!entry) {
      throw new Error("Newton insight entry not found");
    }

    const framework = getFramework(entry.frameworkSlug);
    if (!framework) {
      throw new Error("Newton framework not found");
    }

    const passages = getInsightAnnotatedPassages(
      { ...entry, hookQuestion: "   " },
      framework,
    );

    expect(passages).toHaveLength(1);
    expect(passages[0].label).toBe("Proof threshold");
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  for (const suite of suites) {
    for (const test of suite.tests) {
      try {
        test.fn();
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`✗ ${suite.name} > ${test.name}: ${message}`);
      }
    }
  }

  if (failed === 0) {
    console.log(
      `✓ insight-annotations: ${suites.reduce((count, suite) => count + suite.tests.length, 0)} tests passed`,
    );
  } else {
    process.exit(1);
  }
}
