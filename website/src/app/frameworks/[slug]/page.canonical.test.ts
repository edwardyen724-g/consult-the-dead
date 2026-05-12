/**
 * Regression tests for the framework detail page canonical URL (task cd236b93).
 *
 * These tests lock down that `generateMetadata()` emits a slug-scoped
 * `<link rel="canonical">` (e.g. https://www.consultthedead.com/frameworks/isaac-newton)
 * instead of the root URL (https://www.consultthedead.com/).
 *
 * The bug: the canonical tag was emitting the root URL instead of the
 * per-framework URL. The fix uses `buildFrameworkCanonicalUrl(slug)` in
 * `generateMetadata()` with a hardcoded fallback for safety.
 */
import { describe, expect, it, vi } from "vitest";

import * as canonicalUrlModule from "@/lib/framework-canonical-url";

/* ── module stubs ── */
const mocks = vi.hoisted(() => ({
  getFramework: vi.fn(),
}));

vi.mock("@/lib/frameworks", () => ({
  ALLOWED_SLUGS: ["isaac-newton", "marie-curie", "sun-tzu"] as const,
  SLUG_COLOR_VAR: {
    "isaac-newton": "var(--color-newton)",
    "marie-curie": "var(--color-curie)",
    "sun-tzu": "var(--color-suntzu)",
  },
  getFramework: mocks.getFramework,
  getValidation: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/packs", () => ({
  getPacksForMind: vi.fn().mockReturnValue([]),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));

vi.mock("@/components/framework-transparency-panel", () => ({
  FrameworkTransparencyPanel: () => null,
}));

vi.mock("@/components/FrameworkConstructExplorer", () => ({
  FrameworkConstructExplorer: () => null,
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: unknown }) => children,
}));

import { generateMetadata } from "./page";

const ROOT_URL = "https://www.consultthedead.com";

function makeFramework(slug: string, person: string, domain: string) {
  return {
    slug,
    meta: { person, domain, incident_count: 10, construct_count: 5 },
    era: "1643–1727",
    perceptual_lens: {
      statement: "Test lens statement.",
      what_they_notice_first: "patterns",
      what_they_ignore: "noise",
    },
    bipolar_constructs: [
      { construct: "A vs B", positive_pole: "A", negative_pole: "B", behavioral_implication: "Test." },
    ],
    blind_spots: [],
    behavioral_divergence_predictions: [],
    incidents: [],
  };
}

describe("generateMetadata — canonical URL regression (task cd236b93)", () => {
  it("emits the slug-scoped canonical URL, not the root URL", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("isaac-newton", "Isaac Newton", "Physics"));

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    const canonical = meta.alternates?.canonical;
    expect(canonical).toBe(`${ROOT_URL}/frameworks/isaac-newton`);
    // Explicitly assert it is NOT the root domain
    expect(canonical).not.toBe(ROOT_URL);
    expect(canonical).not.toBe(`${ROOT_URL}/`);
  });

  it("includes the slug path segment in the canonical URL, not just the origin", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("marie-curie", "Marie Curie", "Science"));

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "marie-curie" }),
    });

    const canonical = meta.alternates?.canonical as string | undefined;
    expect(canonical).toContain("/frameworks/marie-curie");
  });

  it("canonical URL ends with the slug, not with a trailing slash or generic path", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("sun-tzu", "Sun Tzu", "Strategy"));

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "sun-tzu" }),
    });

    const canonical = meta.alternates?.canonical as string | undefined;
    expect(canonical).toBe(`${ROOT_URL}/frameworks/sun-tzu`);
    // Ensure it does not end with just "/"
    expect(canonical?.endsWith("/")).toBe(false);
  });

  it("canonical URL is different from the OG url — both point to the slug page", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("isaac-newton", "Isaac Newton", "Physics"));

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    const canonical = meta.alternates?.canonical;
    const ogUrl = (meta.openGraph as { url?: string } | undefined)?.url;

    // Both should be the same slug-scoped URL
    expect(canonical).toBe(ogUrl);
    expect(canonical).toBe(`${ROOT_URL}/frameworks/isaac-newton`);
  });

  it("uses buildFrameworkCanonicalUrl for the happy path (not hardcoded fallback)", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("isaac-newton", "Isaac Newton", "Physics"));
    // Spy to confirm the helper is invoked — the canonical URL comes FROM it
    const spy = vi.spyOn(canonicalUrlModule, "buildFrameworkCanonicalUrl");

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    expect(spy).toHaveBeenCalledWith("isaac-newton");
    expect(meta.alternates?.canonical).toBe(`${ROOT_URL}/frameworks/isaac-newton`);
    spy.mockRestore();
  });

  it("falls back to hardcoded canonical URL when buildFrameworkCanonicalUrl returns null", async () => {
    mocks.getFramework.mockReturnValue(makeFramework("isaac-newton", "Isaac Newton", "Physics"));
    const spy = vi
      .spyOn(canonicalUrlModule, "buildFrameworkCanonicalUrl")
      .mockReturnValue(null);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    // The fallback must also be slug-scoped, not the root
    expect(meta.alternates?.canonical).toBe(`${ROOT_URL}/frameworks/isaac-newton`);
    expect(meta.alternates?.canonical).not.toBe(ROOT_URL);
    spy.mockRestore();
  });

  it("returns no alternates for an unknown slug (404 path)", async () => {
    mocks.getFramework.mockReturnValue(null);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "not-a-real-framework" }),
    });

    expect(meta).toEqual({ title: "Not Found" });
    expect(meta.alternates).toBeUndefined();
  });
});
