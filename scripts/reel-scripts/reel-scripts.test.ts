import {
  buildVerdictReelScript,
  getInsightEntry,
  parseCliArgs,
  renderVerdictReelScript,
  runCli,
  getSupportedSlugs,
} from "./generate-reel-scripts";
import { generateAllReels } from "./generate-all-reels";

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

// ── Wave 7 insight batch integration tests ───────────────────────────────────

describe("insight article slug — what-would-da-vinci-say-about-shipping-imperfect-work", () => {
  it("generates a valid reel script with the iteration court", () => {
    const script = buildVerdictReelScript(
      "what-would-da-vinci-say-about-shipping-imperfect-work",
    );
    expect(script.slug).toBe("what-would-da-vinci-say-about-shipping-imperfect-work");
    expect(script.frameworkSlug).toBe("leonardo-da-vinci");
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
    expect(script.hook.voiceover).toContain("refining the product");
    expect(script.cta).toContain(
      "/insights/what-would-da-vinci-say-about-shipping-imperfect-work",
    );
  });
});

describe("insight article slug — what-would-sun-tzu-say-about-pricing-strategy", () => {
  it("generates a valid reel script with the pricing court", () => {
    const script = buildVerdictReelScript(
      "what-would-sun-tzu-say-about-pricing-strategy",
    );
    expect(script.slug).toBe("what-would-sun-tzu-say-about-pricing-strategy");
    expect(script.frameworkSlug).toBe("sun-tzu");
    expect(script.decisionType).toBe("pricing");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Pricing council: Machiavelli (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("launch price");
    expect(script.cta).toContain(
      "/insights/what-would-sun-tzu-say-about-pricing-strategy",
    );
  });
});

describe("insight article slug — what-would-rockefeller-say-about-unit-economics", () => {
  it("generates a valid reel script with the finance court", () => {
    const script = buildVerdictReelScript(
      "what-would-rockefeller-say-about-unit-economics",
    );
    expect(script.slug).toBe("what-would-rockefeller-say-about-unit-economics");
    expect(script.frameworkSlug).toBe("john-d-rockefeller");
    expect(script.decisionType).toBe("finance");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Finance council: Rockefeller (main), Curie (support), Sun Tzu (close)
    expect(script.councilPass[0].mind).toBe("John D. Rockefeller");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Sun Tzu");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("revenue growth");
    expect(script.cta).toContain(
      "/insights/what-would-rockefeller-say-about-unit-economics",
    );
  });
});

describe("insight article slug — what-would-newton-say-about-debugging-complex-systems", () => {
  it("generates a valid reel script with the product court", () => {
    const script = buildVerdictReelScript(
      "what-would-newton-say-about-debugging-complex-systems",
    );
    expect(script.slug).toBe("what-would-newton-say-about-debugging-complex-systems");
    expect(script.frameworkSlug).toBe("isaac-newton");
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
    expect(script.hook.voiceover).toContain("bug that appears intermittently");
    expect(script.cta).toContain(
      "/insights/what-would-newton-say-about-debugging-complex-systems",
    );
  });
});

describe("insight article slug — what-would-cleopatra-vii-say-about-managing-investors", () => {
  it("generates a valid reel script with the relationship court", () => {
    const script = buildVerdictReelScript(
      "what-would-cleopatra-vii-say-about-managing-investors",
    );
    expect(script.slug).toBe("what-would-cleopatra-vii-say-about-managing-investors");
    expect(script.frameworkSlug).toBe("cleopatra-vii");
    expect(script.decisionType).toBe("relationship");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Relationship council: Cleopatra (main), Machiavelli (support), Sun Tzu (close)
    expect(script.councilPass[0].mind).toBe("Cleopatra VII");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Sun Tzu");
    for (const beat of script.councilPass) {
      expect(beat.mind).toMatch(/^[A-Z]/);
    }
    expect(script.hook.voiceover).toContain("lead investor");
    expect(script.cta).toContain(
      "/insights/what-would-cleopatra-vii-say-about-managing-investors",
    );
  });
});

describe("insight article slug — what-would-harriet-tubman-say-about-resilience-in-hard-times", () => {
  it("generates a valid reel script with the resilience court", () => {
    const script = buildVerdictReelScript(
      "what-would-harriet-tubman-say-about-resilience-in-hard-times",
    );
    expect(script.slug).toBe("what-would-harriet-tubman-say-about-resilience-in-hard-times");
    expect(script.frameworkSlug).toBe("harriet-tubman");
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
    expect(script.hook.voiceover).toContain("hard stretch for four months");
    expect(script.cta).toContain(
      "/insights/what-would-harriet-tubman-say-about-resilience-in-hard-times",
    );
  });
});

describe("method article slug — jobs-to-be-done-explained", () => {
  it("generates a valid reel script with the reasoning court", () => {
    const script = buildVerdictReelScript(
      "jobs-to-be-done-explained",
    );
    expect(script.slug).toBe("jobs-to-be-done-explained");
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
    expect(script.hook.voiceover).toContain("product for one use case");
    expect(script.cta).toContain(
      "/insights/jobs-to-be-done-explained",
    );
  });
});

// ── Wave 8 insight batch integration tests ──
describe("Wave 8 insight batch", () => {
  it("generates a reel script for what-would-galileo-say-about-challenging-conventional-wisdom", () => {
    const script = buildVerdictReelScript(
      "what-would-galileo-say-about-challenging-conventional-wisdom",
    );
    expect(script.slug).toBe("what-would-galileo-say-about-challenging-conventional-wisdom");
    expect(script.frameworkSlug).toBe("galileo-galilei");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-would-galileo-say-about-challenging-conventional-wisdom",
    );
  });

  it("generates a reel script for what-would-archimedes-say-about-technical-leverage", () => {
    const script = buildVerdictReelScript(
      "what-would-archimedes-say-about-technical-leverage",
    );
    expect(script.slug).toBe("what-would-archimedes-say-about-technical-leverage");
    expect(script.frameworkSlug).toBe("archimedes");
    expect(script.decisionType).toBe("systems");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Systems council: da Vinci (main), Sun Tzu (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Sun Tzu");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-would-archimedes-say-about-technical-leverage",
    );
  });

  it("generates a reel script for what-would-epictetus-say-about-managing-uncertainty", () => {
    const script = buildVerdictReelScript(
      "what-would-epictetus-say-about-managing-uncertainty",
    );
    expect(script.slug).toBe("what-would-epictetus-say-about-managing-uncertainty");
    expect(script.frameworkSlug).toBe("epictetus");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-would-epictetus-say-about-managing-uncertainty",
    );
  });

  it("generates a reel script for what-would-frederick-douglass-say-about-building-credibility", () => {
    const script = buildVerdictReelScript(
      "what-would-frederick-douglass-say-about-building-credibility",
    );
    expect(script.slug).toBe("what-would-frederick-douglass-say-about-building-credibility");
    expect(script.frameworkSlug).toBe("frederick-douglass");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Persuasion council: Cicero (main), Franklin (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-would-frederick-douglass-say-about-building-credibility",
    );
  });

  it("generates a reel script for what-would-ada-lovelace-say-about-building-for-the-future", () => {
    const script = buildVerdictReelScript(
      "what-would-ada-lovelace-say-about-building-for-the-future",
    );
    expect(script.slug).toBe("what-would-ada-lovelace-say-about-building-for-the-future");
    expect(script.frameworkSlug).toBe("ada-lovelace");
    expect(script.decisionType).toBe("product");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Product council: da Vinci (main), Curie (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-would-ada-lovelace-say-about-building-for-the-future",
    );
  });

  it("generates a reel script for what-galileo-and-newton-would-say-about-evidence-vs-consensus", () => {
    const script = buildVerdictReelScript(
      "what-galileo-and-newton-would-say-about-evidence-vs-consensus",
    );
    expect(script.slug).toBe("what-galileo-and-newton-would-say-about-evidence-vs-consensus");
    expect(script.frameworkSlug).toBe("galileo-galilei");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/what-galileo-and-newton-would-say-about-evidence-vs-consensus",
    );
  });
});

describe("Wave 9 collision batch", () => {
  it("generates a reel script for galileo-vs-newton-on-disrupting-your-own-field", () => {
    const script = buildVerdictReelScript(
      "galileo-vs-newton-on-disrupting-your-own-field",
    );
    expect(script.slug).toBe("galileo-vs-newton-on-disrupting-your-own-field");
    expect(script.frameworkSlug).toBe("galileo-galilei");
    expect(script.decisionType).toBe("innovation");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Innovation council: Tesla (main), da Vinci (support), Newton (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Isaac Newton");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/galileo-vs-newton-on-disrupting-your-own-field",
    );
  });

  it("generates a reel script for archimedes-vs-ada-lovelace-on-build-vs-theorize", () => {
    const script = buildVerdictReelScript(
      "archimedes-vs-ada-lovelace-on-build-vs-theorize",
    );
    expect(script.slug).toBe("archimedes-vs-ada-lovelace-on-build-vs-theorize");
    expect(script.frameworkSlug).toBe("archimedes");
    expect(script.decisionType).toBe("product");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Product council: da Vinci (main), Curie (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/archimedes-vs-ada-lovelace-on-build-vs-theorize",
    );
  });

  it("generates a reel script for douglass-vs-lincoln-on-playing-the-long-game", () => {
    const script = buildVerdictReelScript(
      "douglass-vs-lincoln-on-playing-the-long-game",
    );
    expect(script.slug).toBe("douglass-vs-lincoln-on-playing-the-long-game");
    expect(script.frameworkSlug).toBe("frederick-douglass");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/douglass-vs-lincoln-on-playing-the-long-game",
    );
  });

  it("generates a reel script for epictetus-vs-harriet-tubman-on-risk-under-constraint", () => {
    const script = buildVerdictReelScript(
      "epictetus-vs-harriet-tubman-on-risk-under-constraint",
    );
    expect(script.slug).toBe("epictetus-vs-harriet-tubman-on-risk-under-constraint");
    expect(script.frameworkSlug).toBe("epictetus");
    expect(script.decisionType).toBe("control");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Control council: Epictetus (main), Aurelius (support), Seneca (close)
    expect(script.councilPass[0].mind).toBe("Epictetus");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Seneca");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/epictetus-vs-harriet-tubman-on-risk-under-constraint",
    );
  });

  it("generates a reel script for carnegie-vs-rockefeller-on-monopoly-strategy", () => {
    const script = buildVerdictReelScript(
      "carnegie-vs-rockefeller-on-monopoly-strategy",
    );
    expect(script.slug).toBe("carnegie-vs-rockefeller-on-monopoly-strategy");
    expect(script.frameworkSlug).toBe("andrew-carnegie");
    expect(script.decisionType).toBe("scaling");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Scaling council: Napoleon (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Napoleon Bonaparte");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/carnegie-vs-rockefeller-on-monopoly-strategy",
    );
  });
});

describe("Wave 10 collision batch", () => {
  it("generates a reel script for machiavelli-vs-sun-tzu-on-competitive-intelligence", () => {
    const script = buildVerdictReelScript(
      "machiavelli-vs-sun-tzu-on-competitive-intelligence",
    );
    expect(script.slug).toBe("machiavelli-vs-sun-tzu-on-competitive-intelligence");
    expect(script.frameworkSlug).toBe("niccolo-machiavelli");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/machiavelli-vs-sun-tzu-on-competitive-intelligence",
    );
  });

  it("generates a reel script for marcus-aurelius-vs-seneca-on-processing-failure", () => {
    const script = buildVerdictReelScript(
      "marcus-aurelius-vs-seneca-on-processing-failure",
    );
    expect(script.slug).toBe("marcus-aurelius-vs-seneca-on-processing-failure");
    expect(script.frameworkSlug).toBe("marcus-aurelius");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/marcus-aurelius-vs-seneca-on-processing-failure",
    );
  });

  it("generates a reel script for franklin-vs-carnegie-on-building-your-network", () => {
    const script = buildVerdictReelScript(
      "franklin-vs-carnegie-on-building-your-network",
    );
    expect(script.slug).toBe("franklin-vs-carnegie-on-building-your-network");
    expect(script.frameworkSlug).toBe("benjamin-franklin");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/franklin-vs-carnegie-on-building-your-network",
    );
  });

  it("generates a reel script for cleopatra-vs-catherine-the-great-on-ruling-through-alliance", () => {
    const script = buildVerdictReelScript(
      "cleopatra-vs-catherine-the-great-on-ruling-through-alliance",
    );
    expect(script.slug).toBe("cleopatra-vs-catherine-the-great-on-ruling-through-alliance");
    expect(script.frameworkSlug).toBe("cleopatra-vii");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/cleopatra-vs-catherine-the-great-on-ruling-through-alliance",
    );
  });
});

describe("Wave 11 collision batch", () => {
  it("generates a reel script for caesar-vs-alexander-on-how-fast-to-expand", () => {
    const script = buildVerdictReelScript(
      "caesar-vs-alexander-on-how-fast-to-expand",
    );
    expect(script.slug).toBe("caesar-vs-alexander-on-how-fast-to-expand");
    expect(script.frameworkSlug).toBe("julius-caesar");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/caesar-vs-alexander-on-how-fast-to-expand",
    );
  });

  it("generates a reel script for jobs-vs-edison-on-perfectionism-vs-shipping", () => {
    const script = buildVerdictReelScript(
      "jobs-vs-edison-on-perfectionism-vs-shipping",
    );
    expect(script.slug).toBe("jobs-vs-edison-on-perfectionism-vs-shipping");
    expect(script.frameworkSlug).toBe("steve-jobs");
    expect(script.decisionType).toBe("iteration");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Iteration council: Edison (main), Curie (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Thomas Edison");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/jobs-vs-edison-on-perfectionism-vs-shipping",
    );
  });

  it("generates a reel script for cicero-vs-machiavelli-on-winning-by-argument-or-power", () => {
    const script = buildVerdictReelScript(
      "cicero-vs-machiavelli-on-winning-by-argument-or-power",
    );
    expect(script.slug).toBe("cicero-vs-machiavelli-on-winning-by-argument-or-power");
    expect(script.frameworkSlug).toBe("cicero");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Persuasion council: Cicero (main), Franklin (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/cicero-vs-machiavelli-on-winning-by-argument-or-power",
    );
  });
});

describe("Wave 12 collision batch", () => {
  it("generates a reel script for tubman-vs-douglass-on-direct-action-vs-advocacy", () => {
    const script = buildVerdictReelScript(
      "tubman-vs-douglass-on-direct-action-vs-advocacy",
    );
    expect(script.slug).toBe("tubman-vs-douglass-on-direct-action-vs-advocacy");
    expect(script.frameworkSlug).toBe("harriet-tubman");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Persuasion council: Cicero (main), Franklin (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/tubman-vs-douglass-on-direct-action-vs-advocacy",
    );
  });

  it("generates a reel script for ada-lovelace-vs-tesla-on-vision-without-resources", () => {
    const script = buildVerdictReelScript(
      "ada-lovelace-vs-tesla-on-vision-without-resources",
    );
    expect(script.slug).toBe("ada-lovelace-vs-tesla-on-vision-without-resources");
    expect(script.frameworkSlug).toBe("ada-lovelace");
    expect(script.decisionType).toBe("innovation");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Innovation council: Tesla (main), da Vinci (support), Newton (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Isaac Newton");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/ada-lovelace-vs-tesla-on-vision-without-resources",
    );
  });

  it("generates a reel script for nightingale-vs-curie-on-data-vs-gut-instinct", () => {
    const script = buildVerdictReelScript(
      "nightingale-vs-curie-on-data-vs-gut-instinct",
    );
    expect(script.slug).toBe("nightingale-vs-curie-on-data-vs-gut-instinct");
    expect(script.frameworkSlug).toBe("florence-nightingale");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/nightingale-vs-curie-on-data-vs-gut-instinct",
    );
  });
});

describe("Wave 13 collision batch", () => {
  it("generates a reel script for napoleon-vs-caesar-on-knowing-when-to-stop", () => {
    const script = buildVerdictReelScript(
      "napoleon-vs-caesar-on-knowing-when-to-stop",
    );
    expect(script.slug).toBe("napoleon-vs-caesar-on-knowing-when-to-stop");
    expect(script.frameworkSlug).toBe("napoleon-bonaparte");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/napoleon-vs-caesar-on-knowing-when-to-stop",
    );
  });

  it("generates a reel script for jobs-vs-galileo-on-betting-against-consensus", () => {
    const script = buildVerdictReelScript(
      "jobs-vs-galileo-on-betting-against-consensus",
    );
    expect(script.slug).toBe("jobs-vs-galileo-on-betting-against-consensus");
    expect(script.frameworkSlug).toBe("steve-jobs");
    expect(script.decisionType).toBe("innovation");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Innovation council: Tesla (main), da Vinci (support), Newton (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Isaac Newton");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/jobs-vs-galileo-on-betting-against-consensus",
    );
  });

  it("generates a reel script for epictetus-vs-seneca-on-how-to-handle-adversity", () => {
    const script = buildVerdictReelScript(
      "epictetus-vs-seneca-on-how-to-handle-adversity",
    );
    expect(script.slug).toBe("epictetus-vs-seneca-on-how-to-handle-adversity");
    expect(script.frameworkSlug).toBe("epictetus");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/epictetus-vs-seneca-on-how-to-handle-adversity",
    );
  });
});

describe("Wave 14 collision batch", () => {
  it("generates a reel script for archimedes-vs-newton-on-when-to-trust-your-model", () => {
    const script = buildVerdictReelScript(
      "archimedes-vs-newton-on-when-to-trust-your-model",
    );
    expect(script.slug).toBe("archimedes-vs-newton-on-when-to-trust-your-model");
    expect(script.frameworkSlug).toBe("archimedes");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/archimedes-vs-newton-on-when-to-trust-your-model",
    );
  });

  it("generates a reel script for lincoln-vs-carnegie-on-winning-over-critics", () => {
    const script = buildVerdictReelScript(
      "lincoln-vs-carnegie-on-winning-over-critics",
    );
    expect(script.slug).toBe("lincoln-vs-carnegie-on-winning-over-critics");
    expect(script.frameworkSlug).toBe("abraham-lincoln");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/lincoln-vs-carnegie-on-winning-over-critics",
    );
  });

  it("generates a reel script for rockefeller-vs-franklin-on-systems-vs-relationships", () => {
    const script = buildVerdictReelScript(
      "rockefeller-vs-franklin-on-systems-vs-relationships",
    );
    expect(script.slug).toBe(
      "rockefeller-vs-franklin-on-systems-vs-relationships",
    );
    expect(script.frameworkSlug).toBe("john-d-rockefeller");
    expect(script.decisionType).toBe("scaling");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Scaling council: Napoleon (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Napoleon Bonaparte");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/rockefeller-vs-franklin-on-systems-vs-relationships",
    );
  });
});

describe("Wave 15 collision batch", () => {
  it("generates a reel script for da-vinci-vs-newton-on-breadth-vs-depth", () => {
    const script = buildVerdictReelScript(
      "da-vinci-vs-newton-on-breadth-vs-depth",
    );
    expect(script.slug).toBe("da-vinci-vs-newton-on-breadth-vs-depth");
    expect(script.frameworkSlug).toBe("leonardo-da-vinci");
    expect(script.decisionType).toBe("product");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Product council: da Vinci (main), Curie (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/da-vinci-vs-newton-on-breadth-vs-depth",
    );
  });

  it("generates a reel script for cicero-vs-lincoln-on-when-to-speak-vs-stay-silent", () => {
    const script = buildVerdictReelScript(
      "cicero-vs-lincoln-on-when-to-speak-vs-stay-silent",
    );
    expect(script.slug).toBe(
      "cicero-vs-lincoln-on-when-to-speak-vs-stay-silent",
    );
    expect(script.frameworkSlug).toBe("cicero");
    expect(script.decisionType).toBe("persuasion");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Persuasion council: Cicero (main), Franklin (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Cicero");
    expect(script.councilPass[1].mind).toBe("Benjamin Franklin");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/cicero-vs-lincoln-on-when-to-speak-vs-stay-silent",
    );
  });

  it("generates a reel script for catherine-vs-cleopatra-on-consolidating-power-in-a-new-role", () => {
    const script = buildVerdictReelScript(
      "catherine-vs-cleopatra-on-consolidating-power-in-a-new-role",
    );
    expect(script.slug).toBe(
      "catherine-vs-cleopatra-on-consolidating-power-in-a-new-role",
    );
    expect(script.frameworkSlug).toBe("catherine-the-great");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/catherine-vs-cleopatra-on-consolidating-power-in-a-new-role",
    );
  });
});

describe("Wave 16 collision batch", () => {
  it("generates a reel script for edison-vs-tesla-on-practical-bets-vs-visionary-bets", () => {
    const script = buildVerdictReelScript(
      "edison-vs-tesla-on-practical-bets-vs-visionary-bets",
    );
    expect(script.slug).toBe(
      "edison-vs-tesla-on-practical-bets-vs-visionary-bets",
    );
    expect(script.frameworkSlug).toBe("thomas-edison");
    expect(script.decisionType).toBe("innovation");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Innovation council: Tesla (main), da Vinci (support), Newton (close)
    expect(script.councilPass[0].mind).toBe("Nikola Tesla");
    expect(script.councilPass[1].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass[2].mind).toBe("Isaac Newton");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/edison-vs-tesla-on-practical-bets-vs-visionary-bets",
    );
  });

  it("generates a reel script for alexander-vs-napoleon-on-when-to-overextend", () => {
    const script = buildVerdictReelScript(
      "alexander-vs-napoleon-on-when-to-overextend",
    );
    expect(script.slug).toBe("alexander-vs-napoleon-on-when-to-overextend");
    expect(script.frameworkSlug).toBe("alexander-the-great");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/alexander-vs-napoleon-on-when-to-overextend",
    );
  });

  it("generates a reel script for ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data", () => {
    const script = buildVerdictReelScript(
      "ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data",
    );
    expect(script.slug).toBe(
      "ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data",
    );
    expect(script.frameworkSlug).toBe("ada-lovelace");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data",
    );
  });
});

describe("Wave 17 collision batch", () => {
  it("generates a reel script for harriet-tubman-vs-lincoln-on-when-to-act-without-consensus", () => {
    const script = buildVerdictReelScript(
      "harriet-tubman-vs-lincoln-on-when-to-act-without-consensus",
    );
    expect(script.slug).toBe(
      "harriet-tubman-vs-lincoln-on-when-to-act-without-consensus",
    );
    expect(script.frameworkSlug).toBe("harriet-tubman");
    expect(script.decisionType).toBe("leadership");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Leadership council: Machiavelli (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/harriet-tubman-vs-lincoln-on-when-to-act-without-consensus",
    );
  });

  it("generates a reel script for franklin-vs-aurelius-on-building-for-the-long-term", () => {
    const script = buildVerdictReelScript(
      "franklin-vs-aurelius-on-building-for-the-long-term",
    );
    expect(script.slug).toBe(
      "franklin-vs-aurelius-on-building-for-the-long-term",
    );
    expect(script.frameworkSlug).toBe("benjamin-franklin");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/franklin-vs-aurelius-on-building-for-the-long-term",
    );
  });

  it("generates a reel script for galileo-vs-archimedes-on-when-to-challenge-consensus", () => {
    const script = buildVerdictReelScript(
      "galileo-vs-archimedes-on-when-to-challenge-consensus",
    );
    expect(script.slug).toBe(
      "galileo-vs-archimedes-on-when-to-challenge-consensus",
    );
    expect(script.frameworkSlug).toBe("galileo-galilei");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/galileo-vs-archimedes-on-when-to-challenge-consensus",
    );
  });
});

describe("Wave 18 collision batch", () => {
  it("generates a reel script for seneca-vs-cicero-on-private-virtue-vs-public-duty", () => {
    const script = buildVerdictReelScript(
      "seneca-vs-cicero-on-private-virtue-vs-public-duty",
    );
    expect(script.slug).toBe(
      "seneca-vs-cicero-on-private-virtue-vs-public-duty",
    );
    expect(script.frameworkSlug).toBe("seneca");
    expect(script.decisionType).toBe("leadership");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Leadership council: Machiavelli (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/seneca-vs-cicero-on-private-virtue-vs-public-duty",
    );
  });

  it("generates a reel script for douglass-vs-carnegie-on-the-self-made-narrative", () => {
    const script = buildVerdictReelScript(
      "douglass-vs-carnegie-on-the-self-made-narrative",
    );
    expect(script.slug).toBe(
      "douglass-vs-carnegie-on-the-self-made-narrative",
    );
    expect(script.frameworkSlug).toBe("frederick-douglass");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/douglass-vs-carnegie-on-the-self-made-narrative",
    );
  });

  it("generates a reel script for cleopatra-vs-caesar-on-power-through-alliance-or-conquest", () => {
    const script = buildVerdictReelScript(
      "cleopatra-vs-caesar-on-power-through-alliance-or-conquest",
    );
    expect(script.slug).toBe(
      "cleopatra-vs-caesar-on-power-through-alliance-or-conquest",
    );
    expect(script.frameworkSlug).toBe("cleopatra-vii");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/cleopatra-vs-caesar-on-power-through-alliance-or-conquest",
    );
  });
});

describe("Wave 19 collision batch", () => {
  it("generates a reel script for carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it", () => {
    const script = buildVerdictReelScript(
      "carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it",
    );
    expect(script.slug).toBe(
      "carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it",
    );
    expect(script.frameworkSlug).toBe("andrew-carnegie");
    expect(script.decisionType).toBe("hiring");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Hiring council: Carnegie (main), Machiavelli (support), Franklin (close)
    expect(script.councilPass[0].mind).toBe("Andrew Carnegie");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Benjamin Franklin");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it",
    );
  });

  it("generates a reel script for tesla-vs-galileo-on-working-against-the-institution", () => {
    const script = buildVerdictReelScript(
      "tesla-vs-galileo-on-working-against-the-institution",
    );
    expect(script.slug).toBe(
      "tesla-vs-galileo-on-working-against-the-institution",
    );
    expect(script.frameworkSlug).toBe("nikola-tesla");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/tesla-vs-galileo-on-working-against-the-institution",
    );
  });

  it("generates a reel script for sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital", () => {
    const script = buildVerdictReelScript(
      "sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital",
    );
    expect(script.slug).toBe(
      "sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital",
    );
    expect(script.frameworkSlug).toBe("sun-tzu");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital",
    );
  });
});

describe("Wave 20 — 3 collision articles", () => {
  it("generates a reel script for curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field", () => {
    const script = buildVerdictReelScript(
      "curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field",
    );
    expect(script.slug).toBe(
      "curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field",
    );
    expect(script.frameworkSlug).toBe("marie-curie");
    expect(script.decisionType).toBe("resilience");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Resilience council: Aurelius (main), Tesla (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[1].mind).toBe("Nikola Tesla");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field",
    );
  });

  it("generates a reel script for newton-vs-machiavelli-on-systems-vs-power", () => {
    const script = buildVerdictReelScript(
      "newton-vs-machiavelli-on-systems-vs-power",
    );
    expect(script.slug).toBe("newton-vs-machiavelli-on-systems-vs-power");
    expect(script.frameworkSlug).toBe("isaac-newton");
    expect(script.decisionType).toBe("strategy");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Strategy council: Sun Tzu (main), Machiavelli (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Sun Tzu");
    expect(script.councilPass[1].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/newton-vs-machiavelli-on-systems-vs-power",
    );
  });

  it("generates a reel script for rockefeller-vs-napoleon-on-monopoly-vs-conquest", () => {
    const script = buildVerdictReelScript(
      "rockefeller-vs-napoleon-on-monopoly-vs-conquest",
    );
    expect(script.slug).toBe(
      "rockefeller-vs-napoleon-on-monopoly-vs-conquest",
    );
    expect(script.frameworkSlug).toBe("john-d-rockefeller");
    expect(script.decisionType).toBe("scaling");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Scaling council: Napoleon (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Napoleon Bonaparte");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/rockefeller-vs-napoleon-on-monopoly-vs-conquest",
    );
  });
});

describe("Wave 21 — 3 collision articles", () => {
  it("generates a reel script for edison-vs-franklin-on-iteration-vs-system-building", () => {
    const script = buildVerdictReelScript(
      "edison-vs-franklin-on-iteration-vs-system-building",
    );
    expect(script.slug).toBe(
      "edison-vs-franklin-on-iteration-vs-system-building",
    );
    expect(script.frameworkSlug).toBe("thomas-edison");
    expect(script.decisionType).toBe("iteration");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Iteration council: Edison (main), Curie (support), da Vinci (close)
    expect(script.councilPass[0].mind).toBe("Thomas Edison");
    expect(script.councilPass[1].mind).toBe("Marie Curie");
    expect(script.councilPass[2].mind).toBe("Leonardo da Vinci");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/edison-vs-franklin-on-iteration-vs-system-building",
    );
  });

  it("generates a reel script for caesar-vs-alexander-on-empire-building-speed", () => {
    const script = buildVerdictReelScript(
      "caesar-vs-alexander-on-empire-building-speed",
    );
    expect(script.slug).toBe("caesar-vs-alexander-on-empire-building-speed");
    expect(script.frameworkSlug).toBe("julius-caesar");
    expect(script.decisionType).toBe("scaling");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Scaling council: Napoleon (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Napoleon Bonaparte");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/caesar-vs-alexander-on-empire-building-speed",
    );
  });

  it("generates a reel script for epictetus-vs-seneca-on-accepting-vs-transforming-constraints", () => {
    const script = buildVerdictReelScript(
      "epictetus-vs-seneca-on-accepting-vs-transforming-constraints",
    );
    expect(script.slug).toBe(
      "epictetus-vs-seneca-on-accepting-vs-transforming-constraints",
    );
    expect(script.frameworkSlug).toBe("epictetus");
    expect(script.decisionType).toBe("control");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Control council: Epictetus (main), Aurelius (support), Seneca (close)
    expect(script.councilPass[0].mind).toBe("Epictetus");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Seneca");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/epictetus-vs-seneca-on-accepting-vs-transforming-constraints",
    );
  });

  // ── Wave 22 reel tests ──────────────────────────────────────────────────

  it("generates a reel script for lincoln-vs-napoleon-on-leading-through-crisis", () => {
    const script = buildVerdictReelScript(
      "lincoln-vs-napoleon-on-leading-through-crisis",
    );
    expect(script.slug).toBe("lincoln-vs-napoleon-on-leading-through-crisis");
    expect(script.frameworkSlug).toBe("abraham-lincoln");
    expect(script.decisionType).toBe("crisis");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Crisis council: Lincoln (main), Aurelius (support), Machiavelli (close)
    expect(script.councilPass[0].mind).toBe("Abraham Lincoln");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/lincoln-vs-napoleon-on-leading-through-crisis",
    );
  });

  it("generates a reel script for nightingale-vs-curie-on-field-evidence-vs-theoretical-proof", () => {
    const script = buildVerdictReelScript(
      "nightingale-vs-curie-on-field-evidence-vs-theoretical-proof",
    );
    expect(script.slug).toBe(
      "nightingale-vs-curie-on-field-evidence-vs-theoretical-proof",
    );
    expect(script.frameworkSlug).toBe("florence-nightingale");
    expect(script.decisionType).toBe("evidence");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Evidence council: Curie (main), Newton (support), Aurelius (close)
    expect(script.councilPass[0].mind).toBe("Marie Curie");
    expect(script.councilPass[1].mind).toBe("Isaac Newton");
    expect(script.councilPass[2].mind).toBe("Marcus Aurelius");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/nightingale-vs-curie-on-field-evidence-vs-theoretical-proof",
    );
  });

  it("generates a reel script for jobs-vs-machiavelli-on-inspiring-fear-vs-inspiring-love", () => {
    const script = buildVerdictReelScript(
      "jobs-vs-machiavelli-on-inspiring-fear-vs-inspiring-love",
    );
    expect(script.slug).toBe(
      "jobs-vs-machiavelli-on-inspiring-fear-vs-inspiring-love",
    );
    expect(script.frameworkSlug).toBe("steve-jobs");
    expect(script.decisionType).toBe("leadership");
    expect(script.estimatedDurationSeconds).toBeGreaterThanOrEqual(25);
    expect(script.estimatedDurationSeconds).toBeLessThanOrEqual(40);
    // Leadership council: Machiavelli (main), Aurelius (support), Curie (close)
    expect(script.councilPass[0].mind).toBe("Niccolò Machiavelli");
    expect(script.councilPass[1].mind).toBe("Marcus Aurelius");
    expect(script.councilPass[2].mind).toBe("Marie Curie");
    expect(script.councilPass.length).toBeGreaterThanOrEqual(3);
    expect(script.hook.voiceover.length).toBeGreaterThanOrEqual(1);
    expect(script.cta).toContain(
      "/insights/jobs-vs-machiavelli-on-inspiring-fear-vs-inspiring-love",
    );
  });
});

// ── generate-all-reels smoke tests ─────────────────────────────────────────

describe("generateAllReels", () => {
  it("generates reel scripts for all registered insight entries without errors", () => {
    const { generated, errors } = generateAllReels({ dryRun: true });
    expect(errors.length).toBe(0);
    expect(generated.length).toBeGreaterThanOrEqual(getSupportedSlugs().length);
  });

  it("generated slug list matches the supported-slugs catalog exactly", () => {
    const { generated } = generateAllReels({ dryRun: true });
    const supported = getSupportedSlugs();
    for (const slug of supported) {
      expect(generated).toContain(slug);
    }
  });
});

// ── Note: "meta" decisionType DECISION_COURT entry is ready for when the
// Einstein article (why-chatgpt-gives-generic-advice-and-what-to-do-instead)
// is un-hidden pending legal review. No reel test yet since the slug is commented
// out. Restore the test when albert-einstein is restored to ALLOWED_SLUGS.

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
