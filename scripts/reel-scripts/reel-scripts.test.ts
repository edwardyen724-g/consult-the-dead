import {
  buildVerdictReelScript,
  getInsightEntry,
  parseCliArgs,
  renderVerdictReelScript,
  runCli,
  getSupportedSlugs,
} from "./generate-reel-scripts";

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
    toContain(expected: string) {
      if (typeof actual === "string" && actual.includes(expected)) {
        return;
      }
      if (Array.isArray(actual) && actual.includes(expected as never)) {
        return;
      }
      if (typeof actual !== "string" && !Array.isArray(actual)) {
        throw new Error(`Expected ${String(actual)} to contain ${expected}`);
      }
      if (typeof actual === "string" && !actual.includes(expected)) {
        throw new Error(`Expected ${String(actual)} to contain ${expected}`);
      }
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string" || !pattern.test(actual)) {
        throw new Error(`Expected ${String(actual)} to match ${pattern}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual < expected) {
        throw new Error(`Expected ${String(actual)} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual > expected) {
        throw new Error(`Expected ${String(actual)} to be <= ${expected}`);
      }
    },
    toThrow(expected?: RegExp) {
      if (typeof actual !== "function") {
        throw new Error("toThrow expects a function");
      }
      let threw = false;
      let message = "";
      try {
        (actual as unknown as () => void)();
      } catch (error) {
        threw = true;
        message = error instanceof Error ? error.message : String(error);
      }
      if (!threw) throw new Error("Expected function to throw");
      if (expected && !expected.test(message)) {
        throw new Error(`Expected thrown message ${message} to match ${expected}`);
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

describe("generate-reel-scripts helpers", () => {
  it("resolves a shipped insight slug", () => {
    const entry = getInsightEntry("machiavelli-on-when-to-fire-your-cofounder");
    expect(entry?.frameworkSlug).toBe("niccolo-machiavelli");
  });

  it("returns all supported slugs from the catalog", () => {
    expect(getSupportedSlugs()).toContain("sun-tzu-on-entering-a-market-with-incumbents");
  });
});

describe("buildVerdictReelScript", () => {
  it("builds a deterministic 25-40 second script artifact", () => {
    const script = buildVerdictReelScript("machiavelli-on-when-to-fire-your-cofounder");

    expect(script.slug).toBe("machiavelli-on-when-to-fire-your-cofounder");
    expect(script.articleTitle).toBe("Machiavelli On When To Fire Your Cofounder");
    expect(script.frameworkSlug).toBe("niccolo-machiavelli");
    expect(script.hook.voiceover).toContain("This isn't a performance review");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass).toEqual([
      {
        mind: "Niccolò Machiavelli",
        line:
          "This is a power problem, not a personality problem. Name the imbalance before it names the decision.",
      },
      {
        mind: "Marcus Aurelius",
        line:
          "A clean boundary protects the company better than an emotional debate that keeps dragging on.",
      },
      {
        mind: "Marie Curie",
        line:
          "Make the cut clean, protect the team, and do not let resentment write the script.",
      },
    ]);
    expect(script.consensus).toContain("power-and-boundaries");
    expect(script.cta).toContain("/insights/machiavelli-on-when-to-fire-your-cofounder");
    expect(script.captions).toEqual([
      "Verdict Reel: Machiavelli On When To Fire Your Cofounder",
      "Power problem. Clean decision.",
      "Watch the full council verdict on /insights/machiavelli-on-when-to-fire-your-cofounder",
    ]);
  });

  it("renders the artifact as stable JSON", () => {
    const script = buildVerdictReelScript("sun-tzu-on-entering-a-market-with-incumbents");
    const rendered = renderVerdictReelScript(script);

    expect(rendered).toContain('"slug": "sun-tzu-on-entering-a-market-with-incumbents"');
    expect(JSON.parse(rendered)).toEqual(script);
  });

  it("throws on an unknown slug", () => {
    expect(() => buildVerdictReelScript("missing-slug")).toThrow(/Unknown insight slug/);
  });
});

describe("CLI behavior", () => {
  it("parses arguments predictably", () => {
    expect(parseCliArgs(["--slug", "sun-tzu-on-entering-a-market-with-incumbents", "--dry-run"])).toEqual({
      slug: "sun-tzu-on-entering-a-market-with-incumbents",
      dryRun: true,
      help: false,
    });
    expect(parseCliArgs(["--slug=sun-tzu-on-entering-a-market-with-incumbents"])).toEqual({
      slug: "sun-tzu-on-entering-a-market-with-incumbents",
      dryRun: false,
      help: false,
    });
  });

  it("emits a JSON artifact on dry-run", () => {
    let stdout = "";
    let stderr = "";
    const code = runCli(
      ["--slug", "sun-tzu-on-entering-a-market-with-incumbents", "--dry-run"],
      {
        stdout: (chunk) => {
          stdout += chunk;
        },
        stderr: (chunk) => {
          stderr += chunk;
        },
      },
    );

    expect(code).toBe(0);
    expect(stderr).toBe("");
    const parsed = JSON.parse(stdout);
    expect(parsed.slug).toBe("sun-tzu-on-entering-a-market-with-incumbents");
    expect(parsed.hook.caption).toBe("Sun Tzu On Entering A Market With Incumbents");
  });

  it("shows usage and exits cleanly for help", () => {
    let stdout = "";
    let stderr = "";
    const code = runCli(["--help"], {
      stdout: (chunk) => {
        stdout += chunk;
      },
      stderr: (chunk) => {
        stderr += chunk;
      },
    });

    expect(code).toBe(0);
    expect(stderr).toBe("");
    expect(stdout).toContain("Usage: tsx scripts/reel-scripts/generate-reel-scripts.ts");
    expect(stdout).toContain("Supported slugs:");
  });

  it("rejects missing slugs before trying to build a script", () => {
    let stdout = "";
    let stderr = "";
    const code = runCli(["--dry-run"], {
      stdout: (chunk) => {
        stdout += chunk;
      },
      stderr: (chunk) => {
        stderr += chunk;
      },
    });

    expect(code).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("Missing required --slug <insight-slug> argument.");
  });

  it("reports unknown slugs through the CLI error path", () => {
    let stdout = "";
    let stderr = "";
    const code = runCli(["--slug", "missing-slug", "--dry-run"], {
      stdout: (chunk) => {
        stdout += chunk;
      },
      stderr: (chunk) => {
        stderr += chunk;
      },
    });

    expect(code).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("Unknown insight slug: missing-slug");
  });

  it("rejects missing dry-run mode", () => {
    let stderr = "";
    const code = runCli(["--slug", "sun-tzu-on-entering-a-market-with-incumbents"], {
      stdout: () => undefined,
      stderr: (chunk) => {
        stderr += chunk;
      },
    });
    expect(code).toBe(1);
    expect(stderr).toContain("Only --dry-run is supported");
  });
});

// ── Batch 3 extended court coverage (task ae4fab8d) ───────────────────────────
// Each test verifies a slug whose decisionType previously had no DECISION_COURT
// entry, causing it to fall back to a broken generic council. The council minds
// must be real names (no raw slug strings) and the duration must be in range.

describe("DECISION_COURT — 12 extended decision types produce real council names", () => {
  const cases: Array<{ slug: string; expectedMinds: [string, string, string] }> = [
    {
      slug: "what-would-marcus-aurelius-say-about-burnout",
      expectedMinds: ["Marcus Aurelius", "Marie Curie", "Niccolò Machiavelli"],
    },
    {
      slug: "machiavelli-vs-curie-on-pruning-a-portfolio",
      expectedMinds: ["Niccolò Machiavelli", "Marie Curie", "Marcus Aurelius"],
    },
    {
      slug: "marcus-aurelius-vs-sun-tzu-on-product-decisions",
      expectedMinds: ["Sun Tzu", "Niccolò Machiavelli", "Marie Curie"],
    },
    {
      slug: "seneca-and-epictetus-on-dealing-with-failure",
      expectedMinds: ["Marcus Aurelius", "Nikola Tesla", "Marie Curie"],
    },
    {
      slug: "tesla-and-ada-lovelace-on-the-future-of-computing",
      expectedMinds: ["Nikola Tesla", "Isaac Newton", "Leonardo da Vinci"],
    },
    {
      slug: "steve-jobs-on-product",
      expectedMinds: ["Leonardo da Vinci", "Marie Curie", "Niccolò Machiavelli"],
    },
    {
      slug: "founders-on-pricing",
      expectedMinds: ["Niccolò Machiavelli", "Marcus Aurelius", "Marie Curie"],
    },
    {
      slug: "what-would-marcus-aurelius-say-about-imposter-syndrome",
      expectedMinds: ["Marcus Aurelius", "Marie Curie", "Isaac Newton"],
    },
    {
      slug: "first-principles-thinking-the-honest-version",
      expectedMinds: ["Isaac Newton", "Marie Curie", "Marcus Aurelius"],
    },
    {
      slug: "what-would-newton-say-about-rebuilding-from-first-principles",
      expectedMinds: ["Isaac Newton", "Leonardo da Vinci", "Marcus Aurelius"],
    },
    {
      slug: "what-would-tesla-say-about-shipping-vs-perfecting",
      expectedMinds: ["Nikola Tesla", "Niccolò Machiavelli", "Marie Curie"],
    },
    {
      slug: "what-would-leonardo-say-about-creative-block",
      expectedMinds: ["Leonardo da Vinci", "Nikola Tesla", "Marcus Aurelius"],
    },
  ];

  for (const { slug, expectedMinds } of cases) {
    it(`${slug}: emits real council names and valid duration`, () => {
      const script = buildVerdictReelScript(slug);
      expect(script.slug).toBe(slug);
      expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
      expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
      expect(script.councilPass[0].mind).toBe(expectedMinds[0]);
      expect(script.councilPass[1].mind).toBe(expectedMinds[1]);
      expect(script.councilPass[2].mind).toBe(expectedMinds[2]);
      // Verify no mind is a raw framework slug (slugs contain hyphens and are lowercase)
      for (const beat of script.councilPass) {
        expect(beat.mind).toMatch(/^[A-Z]/);
      }
      expect(script.cta).toContain(`/insights/${slug}`);
    });
  }
});

// ── Method article slug — cynefin-framework-explained (task 7deb5fb2) ───────
describe("method article slug — cynefin-framework-explained", () => {
  it("generates a valid reel script with the systems council", () => {
    const script = buildVerdictReelScript("cynefin-framework-explained");
    expect(script.slug).toBe("cynefin-framework-explained");
    expect(script.frameworkSlug).toBe("leonardo-da-vinci");
    expect(script.decisionType).toBe("systems");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Systems council: da Vinci (main), Sun Tzu (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Sun Tzu");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    // Each council mind starts with an uppercase letter (not a raw slug)
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("You have a decision in front of you");
    expect(script.cta).toContain("/insights/cynefin-framework-explained");
    expect(script.captions[2]).toContain("/insights/cynefin-framework-explained");
  });
});

describe("insight article slug — what-would-machiavelli-say-about-competitor-espionage", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "what-would-machiavelli-say-about-competitor-espionage",
    );
    expect(script.slug).toBe(
      "what-would-machiavelli-say-about-competitor-espionage",
    );
    expect(script.frameworkSlug).toBe("niccolo-machiavelli");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain(
      "what your competitors are actually planning",
    );
    expect(script.cta).toContain(
      "/insights/what-would-machiavelli-say-about-competitor-espionage",
    );
  });
});

describe("insight article slug — what-would-tesla-say-about-technical-debt", () => {
  it("generates a valid reel script with the technology court", () => {
    const script = buildVerdictReelScript(
      "what-would-tesla-say-about-technical-debt",
    );
    expect(script.slug).toBe("what-would-tesla-say-about-technical-debt");
    expect(script.frameworkSlug).toBe("nikola-tesla");
    expect(script.decisionType).toBe("technology");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Technology council: Tesla (main), Newton (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("duct tape and prayer");
    expect(script.cta).toContain(
      "/insights/what-would-tesla-say-about-technical-debt",
    );
  });
});

describe("insight article slug — what-would-napoleon-say-about-scaling-too-fast", () => {
  it("generates a valid reel script with the scaling court", () => {
    const script = buildVerdictReelScript(
      "what-would-napoleon-say-about-scaling-too-fast",
    );
    expect(script.slug).toBe(
      "what-would-napoleon-say-about-scaling-too-fast",
    );
    expect(script.frameworkSlug).toBe("napoleon-bonaparte");
    expect(script.decisionType).toBe("scaling");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Scaling council: Napoleon (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Napoleon Bonaparte");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("Your growth metrics look incredible");
    expect(script.cta).toContain(
      "/insights/what-would-napoleon-say-about-scaling-too-fast",
    );
  });
});

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  let failed = 0;
  for (const suite of suites) {
    for (const test of suite.tests) {
      try {
        test.fn();
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`✗ ${suite.name} > ${test.name}: ${message}`);
      }
    }
  }

  if (failed === 0) {
    console.log(`✓ reel-scripts: ${suites.reduce((count, suite) => count + suite.tests.length, 0)} tests passed`);
  } else {
    process.exitCode = 1;
  }
}
