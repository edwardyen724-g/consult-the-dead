/**
 * Unit tests for the sitemap composition helpers.
 *
 * Covers every branch of `buildSitemapEntries`, `parseLastModified`,
 * and `fetchPublicAgonRows` (via the injected SqlClient) without
 * booting Next.js or hitting Postgres.
 *
 * Run via vitest:
 *   cd website && npm run test
 *
 * Or directly via tsx (uses the same describe/it shim pattern as
 * src/lib/share-id.test.ts):
 *   npx tsx website/src/lib/sitemap-data.test.ts
 */
import type { FrameworkSlug } from "@/lib/frameworks";
import type { InsightEntry } from "@/lib/insights";

import {
  buildSitemapEntries,
  fetchPublicAgonRows,
  isUndefinedColumnError,
  parseLastModified,
  type PublicAgonRow,
  type SqlClient,
} from "./sitemap-data";

/* ── describe/it/expect shim ────────────────────────────────────── */

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
    toContain(needle: unknown) {
      if (!Array.isArray(actual)) {
        throw new Error("toContain expects an array");
      }
      const found = actual.some(
        (item) => JSON.stringify(item) === JSON.stringify(needle),
      );
      if (!found) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(needle)}`,
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

/* ── fixtures ───────────────────────────────────────────────────── */

const FIXED_NOW = new Date("2026-05-08T12:00:00.000Z");
const SITE_URL = "https://www.consultthedead.com";

const TWO_SLUGS: readonly FrameworkSlug[] = [
  "isaac-newton",
  "marie-curie",
] as const;

const TWO_INSIGHTS: readonly InsightEntry[] = [
  {
    slug: "newton-pivot",
    frameworkSlug: "isaac-newton",
    title: "Newton on pivots",
    description: "x",
    targetKeywords: [],
    decisionType: "pivot",
    hookQuestion: "x",
  },
  {
    slug: "machiavelli-cofounder",
    frameworkSlug: "niccolo-machiavelli",
    title: "Machiavelli on cofounders",
    description: "x",
    targetKeywords: [],
    decisionType: "fire",
    hookQuestion: "x",
  },
];

/* ── parseLastModified ───────────────────────────────────────────── */

describe("parseLastModified", () => {
  it("returns the parsed date when raw is a valid ISO string", () => {
    const out = parseLastModified("2026-04-01T08:30:00.000Z", FIXED_NOW);
    expect(out.toISOString()).toBe("2026-04-01T08:30:00.000Z");
  });

  it("falls back to now when raw is null", () => {
    const out = parseLastModified(null, FIXED_NOW);
    expect(out.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it("falls back to now when raw is undefined", () => {
    const out = parseLastModified(undefined, FIXED_NOW);
    expect(out.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it("falls back to now when raw is an empty string", () => {
    const out = parseLastModified("", FIXED_NOW);
    expect(out.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it("falls back to now when raw is unparseable", () => {
    const out = parseLastModified("definitely-not-a-date", FIXED_NOW);
    expect(out.toISOString()).toBe(FIXED_NOW.toISOString());
  });
});

/* ── buildSitemapEntries — base structure ──────────────────────── */

describe("buildSitemapEntries", () => {
  it("emits the six top-level pages first, in canonical order", () => {
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: [],
      publicAgons: [],
      now: FIXED_NOW,
    });
    expect(out.length).toBe(6);
    expect(out[0].url).toBe(SITE_URL);
    expect(out[0].priority).toBe(1);
    expect(out[1].url).toBe(`${SITE_URL}/essay`);
    expect(out[2].url).toBe(`${SITE_URL}/agora`);
    expect(out[3].url).toBe(`${SITE_URL}/pricing`);
    expect(out[4].url).toBe(`${SITE_URL}/frameworks`);
    expect(out[5].url).toBe(`${SITE_URL}/insights`);
  });

  it("emits a framework page per allowed slug at priority 0.7", () => {
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: TWO_SLUGS,
      insightEntries: [],
      publicAgons: [],
      now: FIXED_NOW,
    });
    // 6 top-level + 2 frameworks
    expect(out.length).toBe(8);
    const newton = out.find((e) => e.url === `${SITE_URL}/frameworks/isaac-newton`);
    expect(newton !== undefined).toBeTruthy();
    if (!newton) throw new Error("missing newton entry");
    expect(newton.priority).toBe(0.7);
    expect(newton.changeFrequency).toBe("monthly");
  });

  it("emits an insight page per insight entry at priority 0.8", () => {
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: TWO_INSIGHTS,
      publicAgons: [],
      now: FIXED_NOW,
    });
    expect(out.length).toBe(8);
    const machi = out.find(
      (e) => e.url === `${SITE_URL}/insights/machiavelli-cofounder`,
    );
    expect(machi !== undefined).toBeTruthy();
    if (!machi) throw new Error("missing machiavelli entry");
    expect(machi.priority).toBe(0.8);
    expect(machi.changeFrequency).toBe("monthly");
  });
});

/* ── buildSitemapEntries — public agon URLs ────────────────────── */

describe("buildSitemapEntries · public agon URLs", () => {
  it("emits one /agora/a/<share_id> entry per public agon row", () => {
    const rows: PublicAgonRow[] = [
      { share_id: "abhishek-chakravarty", updated_at: "2026-04-15T10:00:00.000Z" },
      { share_id: "ali-rohde", updated_at: "2026-04-16T11:00:00.000Z" },
    ];
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: [],
      publicAgons: rows,
      now: FIXED_NOW,
    });

    const abhishek = out.find(
      (e) => e.url === `${SITE_URL}/agora/a/abhishek-chakravarty`,
    );
    expect(abhishek !== undefined).toBeTruthy();
    if (!abhishek) throw new Error("missing abhishek entry");

    expect(abhishek.priority).toBe(0.7);
    expect(abhishek.changeFrequency).toBe("weekly");
    // Per-row updated_at flows through into lastModified.
    const lastMod = abhishek.lastModified;
    expect(lastMod instanceof Date).toBeTruthy();
    if (!(lastMod instanceof Date)) throw new Error("not a date");
    expect(lastMod.toISOString()).toBe("2026-04-15T10:00:00.000Z");
  });

  it("falls back to `now` for rows with null updated_at", () => {
    const rows: PublicAgonRow[] = [
      { share_id: "alex-van-le", updated_at: null },
    ];
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: [],
      publicAgons: rows,
      now: FIXED_NOW,
    });
    const alex = out.find((e) => e.url === `${SITE_URL}/agora/a/alex-van-le`);
    if (!alex) throw new Error("missing alex entry");
    const lm = alex.lastModified;
    if (!(lm instanceof Date)) throw new Error("not a date");
    expect(lm.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it("filters out rows with empty/missing share_id", () => {
    const rows = [
      { share_id: "", updated_at: null },
      { share_id: "good-slug", updated_at: null },
      { share_id: undefined as unknown as string, updated_at: null },
    ];
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: [],
      publicAgons: rows,
      now: FIXED_NOW,
    });
    const agonUrls = out
      .map((e) => e.url)
      .filter((u) => typeof u === "string" && u.includes("/agora/a/"));
    expect(agonUrls.length).toBe(1);
    expect(agonUrls[0]).toBe(`${SITE_URL}/agora/a/good-slug`);
  });

  it("emits exactly 30 entries when given 30 outreach slugs (acceptance)", () => {
    // The seed-outreach-agons script (task 69b1c08d) inserts 30 rows.
    // After that runs, the sitemap MUST surface 30 /agora/a/<slug> URLs
    // — this is the GSC submission acceptance criterion.
    const rows: PublicAgonRow[] = Array.from({ length: 30 }, (_, i) => ({
      share_id: `outreach-${String(i + 1).padStart(2, "0")}`,
      updated_at: null,
    }));
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: [],
      insightEntries: [],
      publicAgons: rows,
      now: FIXED_NOW,
    });
    const agonUrls = out
      .map((e) => e.url)
      .filter((u) => typeof u === "string" && u.includes("/agora/a/"));
    expect(agonUrls.length).toBe(30);
    expect(agonUrls[0]).toBe(`${SITE_URL}/agora/a/outreach-01`);
    expect(agonUrls[29]).toBe(`${SITE_URL}/agora/a/outreach-30`);
  });

  it("preserves existing framework + insight entries when public agons are added", () => {
    const rows: PublicAgonRow[] = [
      { share_id: "shared-1", updated_at: null },
    ];
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: TWO_SLUGS,
      insightEntries: TWO_INSIGHTS,
      publicAgons: rows,
      now: FIXED_NOW,
    });
    // 6 top + 2 frameworks + 2 insights + 1 agon
    expect(out.length).toBe(11);
    const urls = out.map((e) => e.url);
    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/frameworks/isaac-newton`);
    expect(urls).toContain(`${SITE_URL}/insights/newton-pivot`);
    expect(urls).toContain(`${SITE_URL}/agora/a/shared-1`);
  });

  it("falls back to relative-rooted URLs when siteUrl is missing (defensive)", () => {
    const out = buildSitemapEntries({
      siteUrl: undefined as unknown as string,
      allowedSlugs: ["isaac-newton" as FrameworkSlug],
      insightEntries: [],
      publicAgons: [{ share_id: "x", updated_at: null }],
      now: FIXED_NOW,
    });
    // Top-level "" + /essay + /agora + /pricing + /frameworks + /insights +
    // /frameworks/isaac-newton + /agora/a/x
    expect(out.length).toBe(8);
    // Home page url defaults to empty string when origin is missing.
    expect(out[0].url).toBe("");
    // Subpaths still root-relative — never an undefined origin literal.
    const newton = out.find((e) =>
      typeof e.url === "string" && e.url.endsWith("/frameworks/isaac-newton"),
    );
    if (!newton) throw new Error("missing newton entry");
    expect(newton.url).toBe("/frameworks/isaac-newton");
  });

  it("returns just the static set when publicAgons is empty (DB error path)", () => {
    const out = buildSitemapEntries({
      siteUrl: SITE_URL,
      allowedSlugs: TWO_SLUGS,
      insightEntries: TWO_INSIGHTS,
      publicAgons: [],
      now: FIXED_NOW,
    });
    // 6 top + 2 frameworks + 2 insights, no agons
    expect(out.length).toBe(10);
    const agonUrls = out
      .map((e) => e.url)
      .filter((u) => typeof u === "string" && u.includes("/agora/a/"));
    expect(agonUrls.length).toBe(0);
  });
});

/* ── fetchPublicAgonRows ─────────────────────────────────────────── */

describe("fetchPublicAgonRows", () => {
  it("calls the injected sqlClient and returns its rows verbatim", async () => {
    const fixtureRows: PublicAgonRow[] = [
      { share_id: "abhishek-chakravarty", updated_at: "2026-04-15T10:00:00.000Z" },
      { share_id: "ali-rohde", updated_at: null },
    ];
    let capturedTemplate: TemplateStringsArray | null = null;
    const stub: SqlClient = (<T>(template: TemplateStringsArray) => {
      capturedTemplate = template;
      return Promise.resolve({ rows: fixtureRows as unknown as T[] });
    }) as SqlClient;

    const out = await fetchPublicAgonRows(stub);
    expect(out.length).toBe(2);
    expect(out[0].share_id).toBe("abhishek-chakravarty");
    expect(out[1].share_id).toBe("ali-rohde");

    // Sanity-check the SQL shape: the WHERE / ORDER clause must match
    // the runtime query so the test catches accidental query drift.
    expect(capturedTemplate !== null).toBeTruthy();
    if (!capturedTemplate) throw new Error("template not captured");
    const sqlText = (capturedTemplate as TemplateStringsArray).join("?");
    expect(sqlText.includes("FROM agons")).toBeTruthy();
    expect(sqlText.includes("clerk_user_id = 'system'")).toBeTruthy();
    expect(sqlText.includes("is_public = TRUE")).toBeTruthy();
    expect(sqlText.includes("ORDER BY share_id")).toBeTruthy();
  });

  it("returns an empty array when the table has no public rows", async () => {
    const stub: SqlClient = (<T>() =>
      Promise.resolve({ rows: [] as T[] })) as SqlClient;
    const out = await fetchPublicAgonRows(stub);
    expect(out.length).toBe(0);
  });

  it("propagates non-undefined-column SQL errors so the caller can fall back gracefully", async () => {
    const boom = new Error("connection lost");
    const stub: SqlClient = (() => Promise.reject(boom)) as SqlClient;
    let caught: unknown = null;
    try {
      await fetchPublicAgonRows(stub);
    } catch (err) {
      caught = err;
    }
    expect(caught === boom).toBeTruthy();
  });

  it("retries with system-only WHERE when is_public column does not exist", async () => {
    const fixtureRows: PublicAgonRow[] = [
      { share_id: "outreach-1", updated_at: null },
      { share_id: "outreach-2", updated_at: null },
    ];
    let callCount = 0;
    const capturedTemplates: TemplateStringsArray[] = [];
    const undefinedColumnErr = Object.assign(
      new Error('column "is_public" does not exist'),
      { code: "42703" },
    );
    const stub: SqlClient = (<T>(template: TemplateStringsArray) => {
      capturedTemplates.push(template);
      callCount++;
      if (callCount === 1) {
        return Promise.reject(undefinedColumnErr);
      }
      return Promise.resolve({ rows: fixtureRows as unknown as T[] });
    }) as SqlClient;

    const out = await fetchPublicAgonRows(stub);
    expect(out.length).toBe(2);
    expect(callCount).toBe(2);

    // Second query must NOT reference is_public.
    const fallbackText = capturedTemplates[1].join("?");
    expect(fallbackText.includes("clerk_user_id = 'system'")).toBeTruthy();
    expect(fallbackText.includes("is_public")).toBeFalsy();
  });
});

/* ── isUndefinedColumnError ──────────────────────────────────────── */

describe("isUndefinedColumnError", () => {
  it("matches errors whose top-level code is 42703", () => {
    expect(isUndefinedColumnError({ code: "42703" })).toBe(true);
  });

  it("matches errors whose cause.code is 42703", () => {
    expect(isUndefinedColumnError({ cause: { code: "42703" } })).toBe(true);
  });

  it("matches messages mentioning column is_public does not exist", () => {
    expect(
      isUndefinedColumnError(
        new Error('column "is_public" does not exist'),
      ),
    ).toBe(true);
  });

  it("does not match non-error values", () => {
    expect(isUndefinedColumnError(null)).toBe(false);
    expect(isUndefinedColumnError(undefined)).toBe(false);
    expect(isUndefinedColumnError("just a string")).toBe(false);
    expect(isUndefinedColumnError(42)).toBe(false);
  });

  it("does not match errors with a different code or unrelated message", () => {
    expect(isUndefinedColumnError({ code: "23505" })).toBe(false);
    expect(isUndefinedColumnError(new Error("connection lost"))).toBe(false);
    expect(isUndefinedColumnError({ cause: { code: "23505" } })).toBe(false);
  });

  it("does not match messages that mention is_public but do not match the column-missing phrasing", () => {
    expect(
      isUndefinedColumnError(new Error("is_public flag toggled")),
    ).toBe(false);
  });
});

/* ── Direct-run harness ──────────────────────────────────────────── */

if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  (async () => {
    let failed = 0;
    let passed = 0;
    for (const suite of suites) {
      for (const t of suite.tests) {
        try {
          await t.fn();
          passed++;
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
        }
      }
    }
    if (failed === 0) {
      console.log(`✓ sitemap-data: ${passed} tests passed`);
    } else {
      console.error(`${failed} test(s) failed (${passed} passed)`);
      process.exit(1);
    }
  })();
}
