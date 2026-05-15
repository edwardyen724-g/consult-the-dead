/**
 * Tests for /sitemap.xml route.
 *
 * Verifies that the sitemap emits the current published inventory:
 * one URL per framework, insight, mind, listicle, and decision entry,
 * with the expected changeFrequency/priority values for listicles and
 * decisions. Existing top-level pages and public agons are preserved
 * alongside them.
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

import sitemap from "./sitemap";
import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { INSIGHT_ENTRIES } from "@/lib/insights";
import { LISTICLE_SLUGS, listicleCanonicalUrl } from "@/lib/listicle-content";
import { MIND_SLUGS } from "@/lib/mind-content";
import { DECISION_ENTRIES, getDecisionUrl } from "../../content/decisions";

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

  it("preserves the current 10-listicle inventory in output URLs", async () => {
    const entries = await sitemap();
    const listicleUrls = entries
      .filter((e) => typeof e.url === "string" && e.url.includes("/listicles/"))
      .map((e) => e.url);
    expect(listicleUrls).toEqual(
      LISTICLE_SLUGS.map((slug) => listicleCanonicalUrl(slug)),
    );
  });

  it("still emits framework, mind, and top-level pages alongside listicles", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    // Top-level page
    expect(urls).toContain(SITE_URL);
    // Framework page from the current ALLOWED_SLUGS inventory
    expect(urls).toContain(`${SITE_URL}/frameworks/isaac-newton`);
    // Mind page from the current MIND_SLUGS inventory
    expect(urls).toContain(`${SITE_URL}/minds/isaac-newton`);
  });

  it("matches the current framework, insight, and mind inventories", async () => {
    const entries = await sitemap();

    const frameworkUrls = entries.filter(
      (e) => typeof e.url === "string" && e.url.startsWith(`${SITE_URL}/frameworks/`),
    );
    const insightUrls = entries.filter(
      (e) => typeof e.url === "string" && e.url.startsWith(`${SITE_URL}/insights/`),
    );
    const mindUrls = entries.filter(
      (e) => typeof e.url === "string" && e.url.startsWith(`${SITE_URL}/minds/`),
    );

    expect(frameworkUrls).toHaveLength(ALLOWED_SLUGS.length);
    expect(insightUrls).toHaveLength(INSIGHT_ENTRIES.length);
    expect(mindUrls).toHaveLength(MIND_SLUGS.length);
  });

  it("matches the current published route inventory count", async () => {
    const entries = await sitemap();

    expect(entries).toHaveLength(
      4 +
        ALLOWED_SLUGS.length +
        INSIGHT_ENTRIES.length +
        MIND_SLUGS.length +
        LISTICLE_SLUGS.length +
        DECISION_ENTRIES.length,
    );
  });

  it("emits one URL per decision entry", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const entry of DECISION_ENTRIES) {
      expect(urls).toContain(getDecisionUrl(entry.slug, SITE_URL));
    }
  });

  it("emits exactly one decision URL per DECISION_ENTRIES entry", async () => {
    const entries = await sitemap();
    const decisionUrls = entries.filter(
      (e) => typeof e.url === "string" && e.url.includes("/decisions/"),
    );
    expect(decisionUrls).toHaveLength(DECISION_ENTRIES.length);
    expect(DECISION_ENTRIES.length).toBeGreaterThanOrEqual(9);
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
