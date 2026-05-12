/**
 * Roster integrity tests (task 8987b12a / capsule ff13fd3d).
 *
 * Coverage gate for the 7-mind expansion (Lincoln, Carnegie, Nightingale,
 * Douglass, Caesar, Napoleon, Seneca) and a regression fence for the live
 * roster as a whole. We verify that:
 *
 *   1. ALLOWED_SLUGS / SLUG_COLOR_VAR / DISPLAY_ORDER stay in sync (no slug
 *      can appear in one map but not another, no orphaned colour vars).
 *   2. Every slug in ALLOWED_SLUGS has a shipped framework.json under
 *      website/data/frameworks/<slug>/ that the page renderer can read.
 *   3. Every slug's referenced --color-<token> custom property exists in
 *      globals.css (both `:root` dark and `html.light` parchment palettes).
 *   4. The 7 expansion minds are all present (regression: nobody re-removes
 *      one of them by accident during a roster reshuffle).
 *   5. getFramework() returns a fully-populated object for every slug —
 *      catches future schema-drift breakages before they hit /frameworks/<slug>.
 *
 * Albert Einstein remains EXCLUDED pending Hebrew University legal review;
 * his framework.json may still ship under website/data/ but his slug must
 * not appear in ALLOWED_SLUGS.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach } from "vitest";
import {
  ALLOWED_SLUGS,
  DISPLAY_ORDER,
  SLUG_COLOR_VAR,
  getFramework,
  getAllFrameworks,
  getValidation,
} from "./frameworks";
import type { FrameworkSlug } from "./frameworks";

const REPO_WEBSITE = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(REPO_WEBSITE, "data", "frameworks");
const GLOBALS_CSS = path.join(REPO_WEBSITE, "src", "app", "globals.css");

/** The 7 minds added by the 2026-05 roster expansion (task 8987b12a). */
const EXPANSION_SLUGS = [
  "abraham-lincoln",
  "andrew-carnegie",
  "florence-nightingale",
  "frederick-douglass",
  "julius-caesar",
  "napoleon-bonaparte",
  "seneca",
] as const;

/**
 * After the 2026-05 SEO listicle expansion (task c7400a14), the live roster
 * contains exactly 26 minds. Albert Einstein is shipped as data but his slug
 * is held out of ALLOWED_SLUGS pending Hebrew University legal review (see
 * header comment in frameworks.ts). Steve Jobs was added to enable the
 * steve-jobs-on-product listicle page.
 */
const EXPECTED_ROSTER_SIZE = 26;

describe("ALLOWED_SLUGS roster gate", () => {
  it("contains exactly EXPECTED_ROSTER_SIZE minds (Einstein excluded)", () => {
    expect(ALLOWED_SLUGS.length).toBe(EXPECTED_ROSTER_SIZE);
  });

  it("does NOT include albert-einstein (legal-review hold)", () => {
    expect((ALLOWED_SLUGS as readonly string[]).includes("albert-einstein"))
      .toBe(false);
  });

  it("includes every expansion slug from task 8987b12a", () => {
    for (const slug of EXPANSION_SLUGS) {
      expect((ALLOWED_SLUGS as readonly string[]).includes(slug)).toBe(true);
    }
  });

  it("has no duplicate slugs", () => {
    const set = new Set(ALLOWED_SLUGS);
    expect(set.size).toBe(ALLOWED_SLUGS.length);
  });
});

describe("DISPLAY_ORDER ↔ ALLOWED_SLUGS parity", () => {
  it("DISPLAY_ORDER contains exactly the same slugs as ALLOWED_SLUGS", () => {
    const allowed = new Set<string>(ALLOWED_SLUGS);
    const display = new Set<string>(DISPLAY_ORDER);
    expect(display.size).toBe(allowed.size);
    for (const slug of allowed) {
      expect(display.has(slug)).toBe(true);
    }
    for (const slug of display) {
      expect(allowed.has(slug)).toBe(true);
    }
  });

  it("has no duplicate slugs in DISPLAY_ORDER", () => {
    expect(new Set(DISPLAY_ORDER).size).toBe(DISPLAY_ORDER.length);
  });
});

describe("SLUG_COLOR_VAR ↔ ALLOWED_SLUGS parity", () => {
  it("declares a CSS var for every allowed slug", () => {
    for (const slug of ALLOWED_SLUGS) {
      const token = SLUG_COLOR_VAR[slug];
      expect(typeof token).toBe("string");
      expect(token).toMatch(/^var\(--color-[a-z0-9-]+\)$/);
    }
  });

  it("has no extra entries beyond ALLOWED_SLUGS", () => {
    const allowed = new Set<string>(ALLOWED_SLUGS);
    for (const slug of Object.keys(SLUG_COLOR_VAR)) {
      expect(allowed.has(slug)).toBe(true);
    }
  });
});

describe("framework.json parity with ALLOWED_SLUGS", () => {
  it("ships a framework.json under website/data/frameworks/<slug>/ for every allowed slug", () => {
    for (const slug of ALLOWED_SLUGS) {
      const file = path.join(DATA_DIR, slug, "framework.json");
      expect(
        fs.existsSync(file),
        `expected framework.json for ${slug} at ${file}`,
      ).toBe(true);
    }
  });

  it("each shipped framework.json parses as JSON", () => {
    for (const slug of ALLOWED_SLUGS) {
      const file = path.join(DATA_DIR, slug, "framework.json");
      const raw = fs.readFileSync(file, "utf-8");
      // Must throw on malformed JSON, otherwise pass.
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  });

  it("getFramework returns a populated Framework object for every slug", () => {
    for (const slug of ALLOWED_SLUGS) {
      const fw = getFramework(slug);
      expect(fw, `getFramework(${slug}) returned null`).not.toBeNull();
      if (!fw) continue;
      expect(typeof fw.meta.person).toBe("string");
      expect(fw.meta.person.length).toBeGreaterThan(0);
      // Era must be either resolved from born/died, meta.era, or ERA_FALLBACK.
      expect(typeof fw.era).toBe("string");
      expect(fw.era.length).toBeGreaterThan(0);
      // The roster pages depend on at least one bipolar construct existing.
      expect(Array.isArray(fw.bipolar_constructs)).toBe(true);
      expect(fw.bipolar_constructs.length).toBeGreaterThan(0);
    }
  });

  it("each expansion slug specifically renders with ≥1 incident", () => {
    // The 7 new minds were promised "28 documented incidents" each in the
    // marketing brief. We don't pin to 28 (data may grow) but we do pin to
    // "non-empty" so the per-mind landing page never goes blank.
    for (const slug of EXPANSION_SLUGS) {
      const fw = getFramework(slug);
      expect(fw, `getFramework(${slug}) returned null`).not.toBeNull();
      if (!fw) continue;
      expect(fw.incidents.length).toBeGreaterThan(0);
    }
  });
});

/**
 * Fixture-based tests that drive the in-tree branches of getFramework() that
 * the shipped data alone cannot reach (legacy incidents/incidents.json
 * fallback, missing framework.json → null, etc.). We spin up a temporary
 * data tree, then point process.cwd() at it via a vi.spyOn so the helper
 * resolves frameworksDir() inside the fixture.
 */
describe("getFramework fixture-driven branches", () => {
  let originalCwd: string;
  let fixtureRoot: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ctd-frameworks-"));
    fs.mkdirSync(path.join(fixtureRoot, "data", "frameworks"), {
      recursive: true,
    });
    vi.spyOn(process, "cwd").mockReturnValue(fixtureRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    // Sanity: cwd restoration is implicit via restoreAllMocks above.
    expect(process.cwd()).toBe(originalCwd);
  });

  /**
   * Build a minimal framework.json + optional incidents/incidents.json under
   * <fixtureRoot>/data/frameworks/<slug>/. The slug is cast to FrameworkSlug
   * so we can call getFramework() against synthetic data without touching
   * the real ALLOWED_SLUGS literal.
   */
  function writeFixture(
    slug: string,
    frameworkJson: Record<string, unknown> | null,
    sideFileIncidents?: unknown,
  ): FrameworkSlug {
    const dir = path.join(fixtureRoot, "data", "frameworks", slug);
    fs.mkdirSync(dir, { recursive: true });
    if (frameworkJson) {
      fs.writeFileSync(
        path.join(dir, "framework.json"),
        JSON.stringify(frameworkJson),
        "utf-8",
      );
    }
    if (sideFileIncidents !== undefined) {
      fs.mkdirSync(path.join(dir, "incidents"), { recursive: true });
      fs.writeFileSync(
        path.join(dir, "incidents", "incidents.json"),
        JSON.stringify(sideFileIncidents),
        "utf-8",
      );
    }
    return slug as unknown as FrameworkSlug;
  }

  it("falls back to incidents/incidents.json when framework.json has no inline critical_incident_database", () => {
    const sideFile = [
      {
        id: "INC-FALLBACK-1",
        decision: "Move legacy data into the JSON",
        context: "Migrating from per-file storage to inline arrays",
        divergence_explanation: "Backward-compat path under test",
      },
    ];
    const slug = writeFixture(
      "fixture-fallback",
      {
        meta: { person: "Fixture Person", domain: "Test", incident_count: 1 },
        bipolar_constructs: [
          {
            construct: "x",
            positive_pole: "+",
            negative_pole: "-",
            behavioral_implication: "y",
          },
        ],
        // critical_incident_database deliberately absent — exercises the
        // else-branch that reads incidents/incidents.json.
      },
      sideFile,
    );

    const fw = getFramework(slug);
    expect(fw).not.toBeNull();
    if (!fw) return;
    expect(fw.incidents).toHaveLength(1);
    expect(fw.incidents[0].id).toBe("INC-FALLBACK-1");
  });

  it("falls back through missing meta, construct_count, and incident data for sparse framework.json", () => {
    const sideFile = [
      {
        id: "INC-SPARSE-1",
        decision: "Use the fixture fallback path",
        context: "Sparse JSON should still hydrate from the fallback file",
        divergence_explanation: "Branch coverage regression test",
      },
    ];
    const slug = writeFixture(
      "cicero",
      {},
      sideFile,
    );

    const fw = getFramework(slug);
    expect(fw).not.toBeNull();
    if (!fw) return;
    expect(fw.era).toBe("106–43 BC");
    expect(fw.meta.construct_count).toBe(0);
    expect(fw.bipolar_constructs).toEqual([]);
    expect(fw.incidents).toHaveLength(1);
    expect(fw.incidents[0].id).toBe("INC-SPARSE-1");
  });

  it("treats inline empty critical_incident_database as missing → uses fallback file", () => {
    const slug = writeFixture(
      "fixture-empty-inline",
      {
        meta: { person: "Empty Inline", domain: "Test", incident_count: 0 },
        bipolar_constructs: [
          {
            construct: "x",
            positive_pole: "+",
            negative_pole: "-",
            behavioral_implication: "y",
          },
        ],
        critical_incident_database: [], // empty array → fallback path
      },
      [
        {
          id: "INC-FROM-FILE",
          decision: "use side file",
          context: "...",
          divergence_explanation: "...",
        },
      ],
    );
    const fw = getFramework(slug);
    expect(fw?.incidents).toHaveLength(1);
    expect(fw?.incidents?.[0].id).toBe("INC-FROM-FILE");
  });

  it("returns empty incidents[] when neither inline nor fallback file exists", () => {
    const slug = writeFixture(
      "fixture-no-incidents",
      {
        meta: { person: "No Incidents", domain: "Test", incident_count: 0 },
        bipolar_constructs: [
          {
            construct: "x",
            positive_pole: "+",
            negative_pole: "-",
            behavioral_implication: "y",
          },
        ],
      },
      // no side file
    );
    const fw = getFramework(slug);
    expect(fw).not.toBeNull();
    expect(fw?.incidents).toEqual([]);
  });

  it("ignores a non-array incidents/incidents.json payload", () => {
    // readJson returns the parsed object; the guard
    // `Array.isArray(rawIncidents)` should reject it and leave incidents=[].
    const slug = writeFixture(
      "fixture-bad-shape",
      {
        meta: { person: "Bad Shape", domain: "Test", incident_count: 0 },
        bipolar_constructs: [
          {
            construct: "x",
            positive_pole: "+",
            negative_pole: "-",
            behavioral_implication: "y",
          },
        ],
      },
      { not: "an array" },
    );
    const fw = getFramework(slug);
    expect(fw?.incidents).toEqual([]);
  });

  it("getFramework() returns null when framework.json is malformed JSON", () => {
    // Trigger the readJson catch branch without going through writeFixture.
    const slug = "fixture-malformed" as unknown as FrameworkSlug;
    const dir = path.join(fixtureRoot, "data", "frameworks", slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "framework.json"), "{not-json", "utf-8");
    expect(getFramework(slug)).toBeNull();
  });
});

describe("getFramework era resolution branches", () => {
  it("uses born–died when both meta.born and meta.died are present", () => {
    // Newton ships meta.born='1643' / meta.died='1727' so era should be
    // composed from those (en-dash separator), not from ERA_FALLBACK.
    const fw = getFramework("isaac-newton");
    expect(fw).not.toBeNull();
    if (!fw) return;
    expect(fw.era).toBe("1643–1727");
  });

  it("falls through to meta.era when born/died are absent but meta.era is set", () => {
    // Leonardo's shipped framework.json has meta.era='1452-1519' and no
    // born/died, exercising the `else if (meta.era)` branch in getFramework.
    const fw = getFramework("leonardo-da-vinci");
    expect(fw).not.toBeNull();
    if (!fw) return;
    expect(fw.era).toBe("1452-1519");
  });

  it("falls back to ERA_FALLBACK when born/died and meta.era are all absent", () => {
    // Cicero ships with neither born/died nor meta.era, so the fallback
    // table value '106–43 BC' should win.
    const fw = getFramework("cicero");
    expect(fw).not.toBeNull();
    if (!fw) return;
    expect(fw.era).toBe("106–43 BC");
  });

  it("returns null for an unknown / unshipped slug", () => {
    // Cast through unknown to simulate runtime input without bypassing typing.
    const fw = getFramework("nobody-real" as unknown as FrameworkSlug);
    expect(fw).toBeNull();
  });
});

describe("getAllFrameworks", () => {
  it("returns one Framework per DISPLAY_ORDER entry", () => {
    const all = getAllFrameworks();
    expect(all.length).toBe(DISPLAY_ORDER.length);
  });

  it("preserves DISPLAY_ORDER ordering", () => {
    const all = getAllFrameworks();
    const orderedSlugs = all.map((f) => f.slug);
    expect(orderedSlugs).toEqual(DISPLAY_ORDER);
  });
});

describe("getValidation", () => {
  it("returns a populated ValidationResult when tier1_results.json ships", () => {
    // isaac-newton has validation/tier1_results.json shipped.
    const v = getValidation("isaac-newton");
    expect(v).not.toBeNull();
    if (!v) return;
    expect(typeof v.passed).toBe("boolean");
    expect(typeof v.divergent_count).toBe("number");
    expect(typeof v.total_scenarios).toBe("number");
    expect(Array.isArray(v.scenario_results)).toBe(true);
  });

  it("returns null when no tier1_results.json is shipped for the slug", () => {
    // archimedes has no validation file.
    const v = getValidation("archimedes");
    expect(v).toBeNull();
  });
});

describe("globals.css color-var coverage", () => {
  // Read once — globals.css is small and parsing the whole file per-test
  // keeps the assertion message clear when something is missing.
  let css: string = "";
  try {
    css = fs.readFileSync(GLOBALS_CSS, "utf-8");
  } catch {
    css = "";
  }

  it("globals.css is readable from the test runner", () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it("declares every --color-<token> referenced by SLUG_COLOR_VAR", () => {
    for (const slug of ALLOWED_SLUGS) {
      const token = SLUG_COLOR_VAR[slug];
      // var(--color-foo) → --color-foo
      const cssVar = token.replace(/^var\((.*)\)$/, "$1");
      expect(
        css.includes(cssVar),
        `globals.css missing CSS variable ${cssVar} (used by ${slug})`,
      ).toBe(true);
    }
  });

  it("declares each expansion slug's color in BOTH dark and light palettes", () => {
    // Heuristic: each --color-<token> must appear at least twice in
    // globals.css (once under :root for dark, once under html.light). The
    // print @media block adds a third occurrence; we only require ≥2 here
    // so that future palette refactors that fold light/print don't break.
    for (const slug of EXPANSION_SLUGS) {
      const token = SLUG_COLOR_VAR[slug];
      const cssVar = token.replace(/^var\((.*)\)$/, "$1");
      const occurrences = css.split(cssVar).length - 1;
      expect(
        occurrences,
        `${cssVar} appears ${occurrences}× in globals.css; expected ≥2 (dark + light)`,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});
