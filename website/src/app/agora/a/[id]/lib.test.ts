/**
 * Unit tests for the public /agora/a/[id] page helpers.
 *
 * Mirrors the vitest-compatible shim pattern from src/lib/share-id.test.ts
 * so this file runs both under vitest (once the runner is wired up) and
 * directly via `npx tsx`. Run directly:
 *
 *     npx tsx website/src/app/agora/a/\[id\]/lib.test.ts
 */
import {
  buildAgoraCtaHref,
  buildShareDescription,
  groupTurnsByRound,
  hasUsableConsensus,
  normalizeResearch,
  normalizeTurns,
  toRoman,
} from "./lib";
import type { ConsensusResult } from "@/lib/agon/types";

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
    toBeNull() {
      if (actual !== null)
        throw new Error(`Expected ${String(actual)} to be null`);
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

/* ── buildAgoraCtaHref ───────────────────────────────────────── */

describe("buildAgoraCtaHref", () => {
  it("returns plain /agora when no UTMs are present", () => {
    expect(buildAgoraCtaHref(undefined, undefined)).toBe("/agora");
    expect(buildAgoraCtaHref(null, null)).toBe("/agora");
    expect(buildAgoraCtaHref("", "")).toBe("/agora");
    expect(buildAgoraCtaHref("   ", "   ")).toBe("/agora");
  });

  it("forwards utm_campaign alone", () => {
    expect(buildAgoraCtaHref("outreach-may", undefined)).toBe(
      "/agora?utm_campaign=outreach-may",
    );
  });

  it("forwards utm_content alone", () => {
    expect(buildAgoraCtaHref(undefined, "abhishek")).toBe(
      "/agora?utm_content=abhishek",
    );
  });

  it("forwards both UTM keys, campaign first", () => {
    const href = buildAgoraCtaHref("outreach-may", "abhishek");
    expect(href).toBe("/agora?utm_campaign=outreach-may&utm_content=abhishek");
  });

  it("URL-encodes values that contain reserved characters", () => {
    const href = buildAgoraCtaHref("foo bar&baz", "x/y?z");
    // URLSearchParams encodes spaces as '+' and reserved chars correctly.
    expect(href.startsWith("/agora?utm_campaign=")).toBeTruthy();
    expect(href.includes("%2F")).toBeTruthy();
    expect(href.includes("%26")).toBeTruthy();
  });

  it("treats Next searchParam arrays by taking the first entry", () => {
    expect(buildAgoraCtaHref(["camp-a", "camp-b"], ["alpha", "beta"])).toBe(
      "/agora?utm_campaign=camp-a&utm_content=alpha",
    );
  });

  it("ignores arrays whose first entry is not a string", () => {
    // We can only construct a malformed array via `unknown` casting in TS.
    const malformed = [42 as unknown as string];
    expect(buildAgoraCtaHref(malformed, undefined)).toBe("/agora");
  });

  it("trims whitespace around campaign/content", () => {
    expect(buildAgoraCtaHref("  out  ", "  abh  ")).toBe(
      "/agora?utm_campaign=out&utm_content=abh",
    );
  });
});

/* ── normalizeTurns ──────────────────────────────────────────── */

describe("normalizeTurns", () => {
  it("returns [] for non-array input", () => {
    expect(normalizeTurns(null)).toEqual([]);
    expect(normalizeTurns(undefined)).toEqual([]);
    expect(normalizeTurns("not an array")).toEqual([]);
    expect(normalizeTurns({ foo: 1 })).toEqual([]);
  });

  it("accepts the live AgoraApp shape (text + done)", () => {
    const raw = [
      { mindSlug: "sun-tzu", mindName: "Sun Tzu", round: 1, text: "Win first.", done: true },
    ];
    expect(normalizeTurns(raw)).toEqual([
      { mindSlug: "sun-tzu", mindName: "Sun Tzu", round: 1, text: "Win first." },
    ]);
  });

  it("accepts the seed-script shape (content instead of text)", () => {
    const raw = [
      { mindSlug: "marie-curie", mindName: "Marie Curie", round: 2, content: "Measure." },
    ];
    expect(normalizeTurns(raw)).toEqual([
      { mindSlug: "marie-curie", mindName: "Marie Curie", round: 2, text: "Measure." },
    ]);
  });

  it("falls back to mindSlug when mindName is missing", () => {
    const raw = [{ mindSlug: "newton", round: 1, text: "F=ma." }];
    expect(normalizeTurns(raw)).toEqual([
      { mindSlug: "newton", mindName: "newton", round: 1, text: "F=ma." },
    ]);
  });

  it("drops items missing slug or text", () => {
    const raw = [
      { mindSlug: "", mindName: "X", round: 1, text: "no slug" },
      { mindSlug: "a", mindName: "A", round: 1, text: "" },
      { mindSlug: "b", mindName: "B", round: 1, text: "kept" },
      null,
      "not an object",
    ];
    expect(normalizeTurns(raw)).toEqual([
      { mindSlug: "b", mindName: "B", round: 1, text: "kept" },
    ]);
  });

  it("coerces non-finite or fractional rounds to 0 / truncated", () => {
    const raw = [
      { mindSlug: "a", mindName: "A", round: Number.NaN, text: "x" },
      { mindSlug: "b", mindName: "B", round: 2.7, text: "y" },
      { mindSlug: "c", mindName: "C", round: "3" as unknown as number, text: "z" },
    ];
    expect(normalizeTurns(raw)).toEqual([
      { mindSlug: "a", mindName: "A", round: 0, text: "x" },
      { mindSlug: "b", mindName: "B", round: 2, text: "y" },
      { mindSlug: "c", mindName: "C", round: 0, text: "z" },
    ]);
  });
});

/* ── groupTurnsByRound ───────────────────────────────────────── */

describe("groupTurnsByRound", () => {
  it("groups by round and sorts ascending", () => {
    const turns = [
      { mindSlug: "a", mindName: "A", round: 2, text: "r2-a" },
      { mindSlug: "b", mindName: "B", round: 1, text: "r1-b" },
      { mindSlug: "c", mindName: "C", round: 2, text: "r2-c" },
      { mindSlug: "d", mindName: "D", round: 1, text: "r1-d" },
    ];
    const grouped = groupTurnsByRound(turns);
    expect(grouped.length).toBe(2);
    expect(grouped[0].round).toBe(1);
    expect(grouped[0].turns.length).toBe(2);
    expect(grouped[1].round).toBe(2);
    expect(grouped[1].turns[0].text).toBe("r2-a");
  });

  it("handles empty input", () => {
    expect(groupTurnsByRound([])).toEqual([]);
  });
});

/* ── toRoman ─────────────────────────────────────────────────── */

describe("toRoman", () => {
  it("converts 1..10 correctly", () => {
    const expected = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    for (let i = 0; i < expected.length; i++) {
      expect(toRoman(i + 1)).toBe(expected[i]);
    }
  });

  it("returns the input for non-positive / non-finite numbers", () => {
    expect(toRoman(0)).toBe("0");
    expect(toRoman(-3)).toBe("-3");
    expect(toRoman(Number.NaN)).toBe("NaN");
  });

  it("truncates fractional inputs", () => {
    expect(toRoman(3.9)).toBe("III");
  });
});

/* ── normalizeResearch ───────────────────────────────────────── */

describe("normalizeResearch", () => {
  it("returns null for empty / null input", () => {
    expect(normalizeResearch(null)).toBeNull();
    expect(normalizeResearch(undefined)).toBeNull();
    expect(normalizeResearch("")).toBeNull();
    expect(normalizeResearch("   ")).toBeNull();
  });

  it("parses a JSON {summary, sources[]} payload", () => {
    const json = JSON.stringify({
      summary: "Brief.",
      sources: [
        { title: "TechCrunch", url: "https://tc.example/1" },
        { title: "Bad", url: "" },
        "not an object",
      ],
    });
    const out = normalizeResearch(json);
    expect(out !== null).toBeTruthy();
    if (!out) throw new Error("unreachable");
    expect(out.summary).toBe("Brief.");
    expect(out.sources.length).toBe(1);
    expect(out.sources[0].title).toBe("TechCrunch");
  });

  it("falls back to a plain summary string when not JSON", () => {
    const out = normalizeResearch("just a paragraph");
    if (!out) throw new Error("expected non-null");
    expect(out.summary).toBe("just a paragraph");
    expect(out.sources.length).toBe(0);
  });

  it("returns null when JSON has no usable summary or sources", () => {
    expect(normalizeResearch(JSON.stringify({ summary: "", sources: [] }))).toBeNull();
    expect(
      normalizeResearch(JSON.stringify({ summary: "", sources: "not-an-array" })),
    ).toBeNull();
  });

  it("skips sources with non-string title or url fields", () => {
    const out = normalizeResearch(
      JSON.stringify({
        summary: "Research summary.",
        sources: [
          { title: 123, url: "https://example.com/title" },
          { title: "No URL", url: 456 },
          { title: "Valid", url: "https://example.com/valid" },
        ],
      }),
    );

    expect(out).not.toBeNull();
    if (!out) throw new Error("expected non-null");
    expect(out.sources).toEqual([
      { title: "Valid", url: "https://example.com/valid" },
    ]);
  });
});

/* ── hasUsableConsensus ──────────────────────────────────────── */

describe("hasUsableConsensus", () => {
  const valid: ConsensusResult = {
    points: "p", pointsSummary: "ps",
    tensions: "t", tensionsSummary: "ts",
    action: "a", actionSummary: "as",
    steps: ["s1"], stepsSummary: "ss",
    risks: "r", risksSummary: "rs",
  };

  it("accepts a fully populated ConsensusResult", () => {
    expect(hasUsableConsensus(valid)).toBe(true);
  });

  it("rejects null / undefined / non-object", () => {
    expect(hasUsableConsensus(null)).toBe(false);
    expect(hasUsableConsensus(undefined)).toBe(false);
    expect(hasUsableConsensus("not an object" as unknown as ConsensusResult)).toBe(false);
  });

  it("rejects when steps is not an array", () => {
    expect(
      hasUsableConsensus({ ...valid, steps: "nope" as unknown as string[] }),
    ).toBe(false);
  });

  it("rejects when key fields are missing", () => {
    expect(
      hasUsableConsensus({ ...valid, points: undefined as unknown as string }),
    ).toBe(false);
    expect(
      hasUsableConsensus({ ...valid, action: undefined as unknown as string }),
    ).toBe(false);
  });
});

/* ── buildShareDescription ───────────────────────────────────── */

describe("buildShareDescription", () => {
  it("returns a default when topic is empty", () => {
    expect(buildShareDescription("")).toBe(
      "A debate from Consult The Dead — The Agora.",
    );
    expect(buildShareDescription("   ")).toBe(
      "A debate from Consult The Dead — The Agora.",
    );
  });

  it("collapses whitespace", () => {
    expect(buildShareDescription("foo   bar\n\nbaz")).toBe("foo bar baz");
  });

  it("trims to maxLen with ellipsis", () => {
    const long = "x".repeat(300);
    const out = buildShareDescription(long, 50);
    expect(out.length).toBe(50);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns the topic verbatim when below the limit", () => {
    expect(buildShareDescription("short topic", 100)).toBe("short topic");
  });

  it("handles a nullish topic input when cast through the public boundary", () => {
    expect(buildShareDescription(null as unknown as string)).toBe(
      "A debate from Consult The Dead — The Agora.",
    );
  });
});

/* ── Direct-run harness ──────────────────────────────────────── */

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
    console.log(`✓ agora/a/[id] lib: ${passed} tests passed`);
  } else {
    console.error(`${failed} test(s) failed (${passed} passed)`);
    process.exit(1);
  }
}
