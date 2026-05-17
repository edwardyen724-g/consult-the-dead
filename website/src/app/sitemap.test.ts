/**
 * Tests for /sitemap.xml route.
 *
 * Verifies that the sitemap emits one URL per listicle slug at
 * changeFrequency=monthly, priority=0.6, and one URL per decision entry
 * at changeFrequency=weekly, priority=0.8. Existing URL sets
 * (frameworks, insights, minds, agons) are preserved alongside them.
 *
 * The DB fetch is stubbed out via vi.mock so this test runs without
 * Postgres and without booting Next.js.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Stub @vercel/postgres before any module imports that reference it.
vi.mock("@vercel/postgres", () => ({
  sql: Object.assign(
    () => Promise.resolve({ rows: [] }),
    { __esModule: true },
  ),
}));

// Stub @/lib/sitemap-data so the DB fetch returns an empty list.
vi.mock("@/lib/sitemap-data", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/sitemap-data")>();
  return {
    ...real,
    fetchPublicAgonRows: vi.fn().mockResolvedValue([]),
  };
});

// Stub static data libs to return minimal deterministic fixtures.
vi.mock("@/lib/frameworks", () => ({
  ALLOWED_SLUGS: ["isaac-newton"],
}));

vi.mock("@/lib/insights", () => ({
  INSIGHT_ENTRIES: [],
}));

vi.mock("@/lib/mind-content", () => ({
  MIND_SLUGS: ["isaac-newton"],
}));

// listicle-content is NOT mocked — we want the real LISTICLE_SLUGS
// and listicleCanonicalUrl so the test proves the production values.

// content/decisions is NOT mocked — we want the real DECISION_ENTRIES /
// getActiveDecisions() so the test proves the production values. The
// sitemap emits one URL per *active* (published) decision, gated by
// shippedAt — see getActiveDecisions() in content/decisions.ts.

import sitemap from "./sitemap";
import { LISTICLE_SLUGS, listicleCanonicalUrl } from "@/lib/listicle-content";
import { getActiveDecisions, getDecisionUrl } from "../../content/decisions";

const SITE_URL = "https://www.consultthedead.com";

describe("sitemap()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits one URL per listicle slug", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const slug of LISTICLE_SLUGS) {
      expect(urls).toContain(listicleCanonicalUrl(slug));
    }
  });

  it("emits exactly 10 listicle URLs (one per LISTICLE_SLUGS entry)", async () => {
    const entries = await sitemap();
    const listicleUrls = entries.filter((e) =>
      typeof e.url === "string" && e.url.includes("/listicles/"),
    );
    expect(listicleUrls).toHaveLength(LISTICLE_SLUGS.length);
    expect(LISTICLE_SLUGS).toHaveLength(10);
  });

  it("uses changeFrequency=monthly and priority=0.6 for every listicle entry", async () => {
    const entries = await sitemap();
    const listicleEntries = entries.filter((e) =>
      typeof e.url === "string" && e.url.includes("/listicles/"),
    );
    for (const entry of listicleEntries) {
      expect(entry.changeFrequency).toBe("monthly");
      expect(entry.priority).toBe(0.6);
    }
  });

  it("preserves all 5 canonical listicle slugs in output URLs", async () => {
    const entries = await sitemap();
    const expectedUrls = [
      `${SITE_URL}/listicles/startup-pivot`,
      `${SITE_URL}/listicles/career-change`,
      `${SITE_URL}/listicles/leadership-crisis`,
      `${SITE_URL}/listicles/investing-risk`,
      `${SITE_URL}/listicles/product-strategy`,
    ];
    const urls = entries.map((e) => e.url);
    for (const expected of expectedUrls) {
      expect(urls).toContain(expected);
    }
  });

  it("still emits framework, mind, and top-level pages alongside listicles", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    // Top-level page
    expect(urls).toContain(SITE_URL);
    // Framework page from the mocked ALLOWED_SLUGS
    expect(urls).toContain(`${SITE_URL}/frameworks/isaac-newton`);
    // Mind page from the mocked MIND_SLUGS
    expect(urls).toContain(`${SITE_URL}/minds/isaac-newton`);
  });

  it("emits one URL per active decision entry", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const entry of getActiveDecisions()) {
      expect(urls).toContain(getDecisionUrl(entry.slug, SITE_URL));
    }
  });

  it("emits exactly one decision URL per active decision entry", async () => {
    const entries = await sitemap();
    const decisionUrls = entries.filter(
      (e) => typeof e.url === "string" && e.url.includes("/decisions/"),
    );
    const active = getActiveDecisions();
    expect(decisionUrls).toHaveLength(active.length);
    expect(active.length).toBeGreaterThanOrEqual(9);
  });

  it("uses changeFrequency=weekly and priority=0.8 for every decision entry", async () => {
    const entries = await sitemap();
    const decisionEntries = entries.filter(
      (e) => typeof e.url === "string" && e.url.includes("/decisions/"),
    );
    for (const entry of decisionEntries) {
      expect(entry.changeFrequency).toBe("weekly");
      expect(entry.priority).toBe(0.8);
    }
  });

  it("preserves first-batch decision slugs in output URLs", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    const expectedSlugs = [
      "should-i-raise-vc-or-bootstrap",
      "should-i-quit-my-job-to-start-a-company",
      "should-i-raise-a-seed-round",
      "should-i-hire-my-first-employee",
      "should-i-fire-my-cofounder",
      "should-i-pivot-or-persist",
      "should-i-take-this-job-offer",
      "should-i-sell-my-startup",
      "should-i-shut-down-my-startup",
    ];
    for (const slug of expectedSlugs) {
      expect(urls).toContain(`${SITE_URL}/decisions/${slug}`);
    }
  });
});
