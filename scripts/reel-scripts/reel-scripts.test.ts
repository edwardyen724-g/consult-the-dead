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

describe("insight article slug — first-mover-vs-fast-follower-what-sun-tzu-says", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "first-mover-vs-fast-follower-what-sun-tzu-says",
    );
    expect(script.slug).toBe("first-mover-vs-fast-follower-what-sun-tzu-says");
    expect(script.frameworkSlug).toBe("sun-tzu");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    // "Google wasn't the first search engine" is within first 180 chars
    expect(script.hook.voiceover).toContain(
      "Google wasn't the first search engine",
    );
    expect(script.cta).toContain(
      "/insights/first-mover-vs-fast-follower-what-sun-tzu-says",
    );
  });
});

describe("method article slug — toulmin-argument-model-explained", () => {
  it("generates a valid reel script with the reasoning court", () => {
    const script = buildVerdictReelScript("toulmin-argument-model-explained");
    expect(script.slug).toBe("toulmin-argument-model-explained");
    expect(script.frameworkSlug).toBe("isaac-newton");
    expect(script.decisionType).toBe("reasoning");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Reasoning council: Newton (main), Curie (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Isaac Newton");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    // "Toulmin model was built in 1958" is within first 180 chars of hookQuestion
    expect(script.hook.voiceover).toContain("Toulmin model was built in 1958");
    expect(script.cta).toContain("/insights/toulmin-argument-model-explained");
  });
});

describe("insight article slug — what-would-florence-nightingale-say-about-data-driven-decisions", () => {
  it("generates a valid reel script with the evidence court", () => {
    const script = buildVerdictReelScript(
      "what-would-florence-nightingale-say-about-data-driven-decisions",
    );
    expect(script.slug).toBe(
      "what-would-florence-nightingale-say-about-data-driven-decisions",
    );
    expect(script.frameworkSlug).toBe("florence-nightingale");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    // "Nightingale faced" appears within first 180 chars of hookQuestion
    expect(script.hook.voiceover).toContain("Nightingale faced");
    expect(script.cta).toContain(
      "/insights/what-would-florence-nightingale-say-about-data-driven-decisions",
    );
  });
});

describe("insight article slug — what-would-julius-caesar-say-about-moving-into-new-markets", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "what-would-julius-caesar-say-about-moving-into-new-markets",
    );
    expect(script.slug).toBe(
      "what-would-julius-caesar-say-about-moving-into-new-markets",
    );
    expect(script.frameworkSlug).toBe("julius-caesar");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    // hookQuestion truncates at 180 chars — assert on text within first 180
    expect(script.hook.voiceover).toContain("Caesar crossed the Rubicon");
    expect(script.cta).toContain(
      "/insights/what-would-julius-caesar-say-about-moving-into-new-markets",
    );
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

// ── Wave 4 insight batch integration tests ───────────────────────────────────

describe("insight article slug — what-would-cicero-say-about-pitching-to-investors", () => {
  it("generates a valid reel script with the persuasion court", () => {
    const script = buildVerdictReelScript(
      "what-would-cicero-say-about-pitching-to-investors",
    );
    expect(script.slug).toBe("what-would-cicero-say-about-pitching-to-investors");
    expect(script.frameworkSlug).toBe("cicero");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("12 minutes");
    expect(script.cta).toContain(
      "/insights/what-would-cicero-say-about-pitching-to-investors",
    );
  });
});

describe("insight article slug — what-would-epictetus-say-about-what-you-can-control", () => {
  it("generates a valid reel script with the control court", () => {
    const script = buildVerdictReelScript(
      "what-would-epictetus-say-about-what-you-can-control",
    );
    expect(script.slug).toBe("what-would-epictetus-say-about-what-you-can-control");
    expect(script.frameworkSlug).toBe("epictetus");
    expect(script.decisionType).toBe("control");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Epictetus");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Seneca");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("not in your control");
    expect(script.cta).toContain(
      "/insights/what-would-epictetus-say-about-what-you-can-control",
    );
  });
});

describe("insight article slug — what-would-ada-lovelace-say-about-building-with-ai", () => {
  it("generates a valid reel script with the technology court", () => {
    const script = buildVerdictReelScript(
      "what-would-ada-lovelace-say-about-building-with-ai",
    );
    expect(script.slug).toBe("what-would-ada-lovelace-say-about-building-with-ai");
    expect(script.frameworkSlug).toBe("ada-lovelace");
    expect(script.decisionType).toBe("technology");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("wait for something better");
    expect(script.cta).toContain(
      "/insights/what-would-ada-lovelace-say-about-building-with-ai",
    );
  });
});

describe("insight article slug — what-would-harriet-tubman-say-about-leading-a-mission", () => {
  it("generates a valid reel script with the leadership court", () => {
    const script = buildVerdictReelScript(
      "what-would-harriet-tubman-say-about-leading-a-mission",
    );
    expect(script.slug).toBe(
      "what-would-harriet-tubman-say-about-leading-a-mission",
    );
    expect(script.frameworkSlug).toBe("harriet-tubman");
    expect(script.decisionType).toBe("leadership");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("never lost a single one");
    expect(script.cta).toContain(
      "/insights/what-would-harriet-tubman-say-about-leading-a-mission",
    );
  });
});

describe("insight article slug — what-would-frederick-douglass-say-about-finding-your-voice", () => {
  it("generates a valid reel script with the persuasion court", () => {
    const script = buildVerdictReelScript(
      "what-would-frederick-douglass-say-about-finding-your-voice",
    );
    expect(script.slug).toBe(
      "what-would-frederick-douglass-say-about-finding-your-voice",
    );
    expect(script.frameworkSlug).toBe("frederick-douglass");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("softening the message");
    expect(script.cta).toContain(
      "/insights/what-would-frederick-douglass-say-about-finding-your-voice",
    );
  });
});

describe("insight article slug — what-would-archimedes-say-about-leverage", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "what-would-archimedes-say-about-leverage",
    );
    expect(script.slug).toBe("what-would-archimedes-say-about-leverage");
    expect(script.frameworkSlug).toBe("archimedes");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("long enough lever");
    expect(script.cta).toContain(
      "/insights/what-would-archimedes-say-about-leverage",
    );
  });
});

describe("insight article slug — inversion-thinking-explained", () => {
  it("generates a valid reel script with the reasoning court", () => {
    const script = buildVerdictReelScript(
      "inversion-thinking-explained",
    );
    expect(script.slug).toBe("inversion-thinking-explained");
    expect(script.frameworkSlug).toBe("niccolo-machiavelli");
    expect(script.decisionType).toBe("reasoning");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    expect(script.councilPass[0].mind).toBe("Isaac Newton");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("what would guarantee failure");
    expect(script.cta).toContain(
      "/insights/inversion-thinking-explained",
    );
  });
});

// ── Wave 3 insight batch integration tests ───────────────────────────────────

describe("insight article slug — what-would-steve-jobs-say-about-product-focus", () => {
  it("generates a valid reel script with the focus court", () => {
    const script = buildVerdictReelScript(
      "what-would-steve-jobs-say-about-product-focus",
    );
    expect(script.slug).toBe("what-would-steve-jobs-say-about-product-focus");
    expect(script.frameworkSlug).toBe("steve-jobs");
    expect(script.decisionType).toBe("focus");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Focus council: Jobs (main), da Vinci (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Steve Jobs");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("thirty features on it");
    expect(script.cta).toContain(
      "/insights/what-would-steve-jobs-say-about-product-focus",
    );
  });
});

describe("insight article slug — what-would-lincoln-say-about-leading-through-crisis", () => {
  it("generates a valid reel script with the crisis court", () => {
    const script = buildVerdictReelScript(
      "what-would-lincoln-say-about-leading-through-crisis",
    );
    expect(script.slug).toBe(
      "what-would-lincoln-say-about-leading-through-crisis",
    );
    expect(script.frameworkSlug).toBe("abraham-lincoln");
    expect(script.decisionType).toBe("crisis");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Crisis council: Lincoln (main), Aurelius (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Abraham Lincoln");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("three months into your hardest stretch");
    expect(script.cta).toContain(
      "/insights/what-would-lincoln-say-about-leading-through-crisis",
    );
  });
});

describe("insight article slug — what-would-benjamin-franklin-say-about-time-management", () => {
  it("generates a valid reel script with the time-management court", () => {
    const script = buildVerdictReelScript(
      "what-would-benjamin-franklin-say-about-time-management",
    );
    expect(script.slug).toBe(
      "what-would-benjamin-franklin-say-about-time-management",
    );
    expect(script.frameworkSlug).toBe("benjamin-franklin");
    expect(script.decisionType).toBe("time-management");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Time-management council: Franklin (main), Aurelius (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("working long hours");
    expect(script.cta).toContain(
      "/insights/what-would-benjamin-franklin-say-about-time-management",
    );
  });
});

describe("insight article slug — what-would-edison-say-about-failure-and-iteration", () => {
  it("generates a valid reel script with the iteration court", () => {
    const script = buildVerdictReelScript(
      "what-would-edison-say-about-failure-and-iteration",
    );
    expect(script.slug).toBe(
      "what-would-edison-say-about-failure-and-iteration",
    );
    expect(script.frameworkSlug).toBe("thomas-edison");
    expect(script.decisionType).toBe("iteration");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Iteration council: Edison (main), Curie (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Thomas Edison");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("ten thousand experiments");
    expect(script.cta).toContain(
      "/insights/what-would-edison-say-about-failure-and-iteration",
    );
  });
});

describe("insight article slug — what-would-carnegie-say-about-hiring-and-delegating", () => {
  it("generates a valid reel script with the hiring court", () => {
    const script = buildVerdictReelScript(
      "what-would-carnegie-say-about-hiring-and-delegating",
    );
    expect(script.slug).toBe(
      "what-would-carnegie-say-about-hiring-and-delegating",
    );
    expect(script.frameworkSlug).toBe("andrew-carnegie");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("doing too much yourself");
    expect(script.cta).toContain(
      "/insights/what-would-carnegie-say-about-hiring-and-delegating",
    );
  });
});

describe("insight article slug — what-would-seneca-say-about-procrastination", () => {
  it("generates a valid reel script with the procrastination court", () => {
    const script = buildVerdictReelScript(
      "what-would-seneca-say-about-procrastination",
    );
    expect(script.slug).toBe(
      "what-would-seneca-say-about-procrastination",
    );
    expect(script.frameworkSlug).toBe("seneca");
    expect(script.decisionType).toBe("procrastination");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Procrastination council: Seneca (main), Aurelius (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Seneca");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("putting off the same conversation");
    expect(script.cta).toContain(
      "/insights/what-would-seneca-say-about-procrastination",
    );
  });
});

describe("insight article slug — second-order-thinking-explained", () => {
  it("generates a valid reel script with the reasoning court", () => {
    const script = buildVerdictReelScript(
      "second-order-thinking-explained",
    );
    expect(script.slug).toBe("second-order-thinking-explained");
    expect(script.frameworkSlug).toBe("marcus-aurelius");
    expect(script.decisionType).toBe("reasoning");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Reasoning council: Newton (main), Curie (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Isaac Newton");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("The obvious move seems clear");
    expect(script.cta).toContain(
      "/insights/second-order-thinking-explained",
    );
  });
});

describe("collision article — newton-vs-da-vinci-on-build-vs-design-first", () => {
  it("generates a valid reel script with the product court", () => {
    const script = buildVerdictReelScript(
      "newton-vs-da-vinci-on-build-vs-design-first",
    );
    expect(script.slug).toBe("newton-vs-da-vinci-on-build-vs-design-first");
    expect(script.frameworkSlug).toBe("isaac-newton");
    expect(script.decisionType).toBe("product");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Product council: da Vinci (main), Curie (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.hook.voiceover).toContain("Build first or design first");
    expect(script.cta).toContain("/insights/newton-vs-da-vinci-on-build-vs-design-first");
  });
});

describe("collision article — sun-tzu-vs-napoleon-on-competitive-strategy", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "sun-tzu-vs-napoleon-on-competitive-strategy",
    );
    expect(script.slug).toBe("sun-tzu-vs-napoleon-on-competitive-strategy");
    expect(script.frameworkSlug).toBe("sun-tzu");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.hook.voiceover).toContain("well-funded competitor entering your market");
    expect(script.cta).toContain("/insights/sun-tzu-vs-napoleon-on-competitive-strategy");
  });
});

describe("collision article — carnegie-vs-machiavelli-on-winning-through-people", () => {
  it("generates a valid reel script with the hiring court", () => {
    const script = buildVerdictReelScript(
      "carnegie-vs-machiavelli-on-winning-through-people",
    );
    expect(script.slug).toBe("carnegie-vs-machiavelli-on-winning-through-people");
    expect(script.frameworkSlug).toBe("andrew-carnegie");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    expect(script.hook.voiceover).toContain("Carnegie built an empire by hiring people smarter");
    expect(script.cta).toContain("/insights/carnegie-vs-machiavelli-on-winning-through-people");
  });
});

describe("collision article — lincoln-vs-marcus-aurelius-on-leading-in-crisis", () => {
  it("generates a valid reel script with the crisis court", () => {
    const script = buildVerdictReelScript(
      "lincoln-vs-marcus-aurelius-on-leading-in-crisis",
    );
    expect(script.slug).toBe("lincoln-vs-marcus-aurelius-on-leading-in-crisis");
    expect(script.frameworkSlug).toBe("abraham-lincoln");
    expect(script.decisionType).toBe("crisis");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Crisis council: Lincoln (main), Aurelius (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Abraham Lincoln");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.hook.voiceover).toContain("Your startup is in crisis");
    expect(script.cta).toContain("/insights/lincoln-vs-marcus-aurelius-on-leading-in-crisis");
  });
});

describe("collision article — edison-vs-tesla-on-the-right-way-to-innovate", () => {
  it("generates a valid reel script with the innovation court", () => {
    const script = buildVerdictReelScript(
      "edison-vs-tesla-on-the-right-way-to-innovate",
    );
    expect(script.slug).toBe("edison-vs-tesla-on-the-right-way-to-innovate");
    expect(script.frameworkSlug).toBe("thomas-edison");
    expect(script.decisionType).toBe("innovation");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Innovation council: Tesla (main), da Vinci (support), Newton (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Isaac Newton");
    expect(script.hook.voiceover).toContain("Edison failed 10,000 times");
    expect(script.cta).toContain("/insights/edison-vs-tesla-on-the-right-way-to-innovate");
  });
});

describe("insight article slug — what-would-catherine-the-great-say-about-managing-a-scaling-organization", () => {
  it("generates a valid reel script with the leadership court", () => {
    const script = buildVerdictReelScript(
      "what-would-catherine-the-great-say-about-managing-a-scaling-organization",
    );
    expect(script.slug).toBe("what-would-catherine-the-great-say-about-managing-a-scaling-organization");
    expect(script.frameworkSlug).toBe("catherine-the-great");
    expect(script.decisionType).toBe("leadership");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Leadership council: Machiavelli (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("governing your company");
    expect(script.cta).toContain(
      "/insights/what-would-catherine-the-great-say-about-managing-a-scaling-organization",
    );
  });
});

describe("insight article slug — what-would-alexander-the-great-say-about-entering-new-markets", () => {
  it("generates a valid reel script with the strategy court", () => {
    const script = buildVerdictReelScript(
      "what-would-alexander-the-great-say-about-entering-new-markets",
    );
    expect(script.slug).toBe("what-would-alexander-the-great-say-about-entering-new-markets");
    expect(script.frameworkSlug).toBe("alexander-the-great");
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
    expect(script.hook.voiceover).toContain("speed of learning and local adaptation");
    expect(script.cta).toContain(
      "/insights/what-would-alexander-the-great-say-about-entering-new-markets",
    );
  });
});

describe("insight article slug — what-would-cleopatra-vii-say-about-strategic-alliances", () => {
  it("generates a valid reel script with the resilience court", () => {
    const script = buildVerdictReelScript(
      "what-would-cleopatra-vii-say-about-strategic-alliances",
    );
    expect(script.slug).toBe("what-would-cleopatra-vii-say-about-strategic-alliances");
    expect(script.frameworkSlug).toBe("cleopatra-vii");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("What leverage do you actually hold");
    expect(script.cta).toContain(
      "/insights/what-would-cleopatra-vii-say-about-strategic-alliances",
    );
  });
});

describe("insight article slug — what-would-john-d-rockefeller-say-about-building-systems-that-scale", () => {
  it("generates a valid reel script with the systems court", () => {
    const script = buildVerdictReelScript(
      "what-would-john-d-rockefeller-say-about-building-systems-that-scale",
    );
    expect(script.slug).toBe("what-would-john-d-rockefeller-say-about-building-systems-that-scale");
    expect(script.frameworkSlug).toBe("john-d-rockefeller");
    expect(script.decisionType).toBe("systems");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Systems council: da Vinci (main), Sun Tzu (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Sun Tzu");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("relentless systematization");
    expect(script.cta).toContain(
      "/insights/what-would-john-d-rockefeller-say-about-building-systems-that-scale",
    );
  });
});

describe("insight article slug — what-would-julius-caesar-say-about-winning-team-loyalty", () => {
  it("generates a valid reel script with the hiring court", () => {
    const script = buildVerdictReelScript(
      "what-would-julius-caesar-say-about-winning-team-loyalty",
    );
    expect(script.slug).toBe("what-would-julius-caesar-say-about-winning-team-loyalty");
    expect(script.frameworkSlug).toBe("julius-caesar");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("crossed the Rubicon knowing it might cost them everything");
    expect(script.cta).toContain(
      "/insights/what-would-julius-caesar-say-about-winning-team-loyalty",
    );
  });
});

describe("insight article slug — what-would-florence-nightingale-say-about-operational-excellence", () => {
  it("generates a valid reel script with the product court", () => {
    const script = buildVerdictReelScript(
      "what-would-florence-nightingale-say-about-operational-excellence",
    );
    expect(script.slug).toBe("what-would-florence-nightingale-say-about-operational-excellence");
    expect(script.frameworkSlug).toBe("florence-nightingale");
    expect(script.decisionType).toBe("product");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Product council: da Vinci (main), Curie (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("silent killer in its operations right now — you just haven");
    expect(script.cta).toContain(
      "/insights/what-would-florence-nightingale-say-about-operational-excellence",
    );
  });
});

describe("insight article slug — first-principles-thinking-explained", () => {
  it("generates a valid reel script with the reasoning court", () => {
    const script = buildVerdictReelScript(
      "first-principles-thinking-explained",
    );
    expect(script.slug).toBe("first-principles-thinking-explained");
    expect(script.frameworkSlug).toBe("isaac-newton");
    expect(script.decisionType).toBe("reasoning");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Reasoning council: Newton (main), Curie (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Isaac Newton");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("refusing to accept assumptions");
    expect(script.cta).toContain(
      "/insights/first-principles-thinking-explained",
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
