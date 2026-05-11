/**
 * Regression tests for the framework detail page (task 1972b33d).
 *
 * Locks down:
 *   1. generateStaticParams – must return { slug } for every ALLOWED_SLUG.
 *   2. generateMetadata – correct title/description/OG/Twitter for a known
 *      slug; graceful "Not Found" fallback for an unknown slug.
 *   3. FrameworkDetailPage – resolves without throwing for a valid framework;
 *      calls notFound() for an unknown slug.
 *
 * All heavy I/O (framework JSON reads, packs filtering, Next.js routing
 * primitives) is mocked so the test runs in-process without the data layer.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Framework, FrameworkSlug, ValidationResult } from "@/lib/frameworks";
import type { Pack } from "@/lib/packs";

/* ── hoisted mock handles ── */
const mocks = vi.hoisted(() => ({
  getFramework: vi.fn(),
  getValidation: vi.fn(),
  getPacksForMind: vi.fn(),
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));

/* ── module mocks ── */

vi.mock("@/lib/frameworks", () => ({
  ALLOWED_SLUGS: ["isaac-newton", "marie-curie", "sun-tzu"] as const,
  SLUG_COLOR_VAR: {
    "isaac-newton": "var(--color-newton)",
    "marie-curie": "var(--color-curie)",
    "sun-tzu": "var(--color-suntzu)",
  },
  getFramework: mocks.getFramework,
  getValidation: mocks.getValidation,
}));

vi.mock("@/lib/packs", () => ({
  getPacksForMind: mocks.getPacksForMind,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

// Stub out heavy client components — the page renders server-side JSX which
// vitest does not hydrate, so we only need to make sure the imports resolve.
vi.mock("@/components/framework-transparency-panel", () => ({
  FrameworkTransparencyPanel: () => null,
}));

vi.mock("@/components/FrameworkConstructExplorer", () => ({
  FrameworkConstructExplorer: () => null,
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: unknown }) => children,
}));

/* ── subject under test (imported after mocks are registered) ── */
import {
  generateStaticParams,
  generateMetadata,
  default as FrameworkDetailPage,
} from "./page";

/* ── fixtures ── */

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    slug: "isaac-newton" as FrameworkSlug,
    meta: {
      person: "Isaac Newton",
      domain: "Physics",
      incident_count: 12,
      construct_count: 7,
      ...overrides.meta,
    },
    era: "1643–1727",
    perceptual_lens: {
      statement: "Sees underlying forces before results manifest.",
      what_they_notice_first: "patterns",
      what_they_ignore: "noise",
      ...overrides.perceptual_lens,
    },
    bipolar_constructs: overrides.bipolar_constructs ?? [
      {
        construct: "Observation vs speculation",
        positive_pole: "rigorous evidence",
        negative_pole: "unsupported conjecture",
        behavioral_implication: "Grounds claims in data.",
      },
    ],
    blind_spots: overrides.blind_spots ?? [],
    behavioral_divergence_predictions: overrides.behavioral_divergence_predictions ?? [],
    incidents: overrides.incidents ?? [],
    ...overrides,
  };
}

function makeValidation(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    passed: true,
    divergent_count: 3,
    total_scenarios: 5,
    scenario_results: [
      { divergence_score: 7, specificity_score: 8, traceability_score: 9, divergent: true },
      { divergence_score: 6, specificity_score: 7, traceability_score: 8, divergent: true },
      { divergence_score: 5, specificity_score: 6, traceability_score: 7, divergent: true },
      { divergence_score: 4, specificity_score: 5, traceability_score: 6, divergent: false },
      { divergence_score: 3, specificity_score: 4, traceability_score: 5, divergent: false },
    ],
    ...overrides,
  };
}

const NO_PACKS: Pack[] = [];

/* ── test suites ── */

beforeEach(() => {
  mocks.getFramework.mockReset();
  mocks.getValidation.mockReset();
  mocks.getPacksForMind.mockReset();
  mocks.notFound.mockReset();
  // notFound must always throw so page logic aborts correctly
  mocks.notFound.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
});

/* ──────────────────────────────────────────────────────── */
/* 1. generateStaticParams                                   */
/* ──────────────────────────────────────────────────────── */

describe("generateStaticParams", () => {
  it("returns a { slug } entry for every entry in ALLOWED_SLUGS", () => {
    const params = generateStaticParams();
    expect(params).toEqual([
      { slug: "isaac-newton" },
      { slug: "marie-curie" },
      { slug: "sun-tzu" },
    ]);
  });

  it("returns an array (never null / undefined)", () => {
    expect(Array.isArray(generateStaticParams())).toBe(true);
  });

  it("length matches the mocked ALLOWED_SLUGS count", () => {
    expect(generateStaticParams()).toHaveLength(3);
  });
});

/* ──────────────────────────────────────────────────────── */
/* 2. generateMetadata                                       */
/* ──────────────────────────────────────────────────────── */

describe("generateMetadata — known slug", () => {
  it("produces the expected title with person and domain", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    expect(meta.title).toBe("Isaac Newton — Physics Decision Framework");
  });

  it("produces a description mentioning the person and incident count", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const desc = meta.description ?? "";
    expect(desc).toContain("Isaac Newton");
    expect(desc).toContain("12");
  });

  it("sets openGraph url to the canonical framework page URL", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    expect((meta.openGraph as { url?: string })?.url).toBe(
      "https://www.consultthedead.com/frameworks/isaac-newton",
    );
  });

  it("sets openGraph title including person name and site name", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const ogTitle = (meta.openGraph as { title?: string })?.title ?? "";
    expect(ogTitle).toContain("Isaac Newton");
    expect(ogTitle).toContain("Consult The Dead");
  });

  it("sets twitter card to 'summary'", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    expect((meta.twitter as { card?: string })?.card).toBe("summary");
  });

  it("sets twitter title including person name and domain", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const twitterTitle = (meta.twitter as { title?: string })?.title ?? "";
    expect(twitterTitle).toContain("Isaac Newton");
    expect(twitterTitle).toContain("Physics");
  });

  it("returns consistent description across openGraph and twitter", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    expect((meta.openGraph as { description?: string })?.description).toBe(
      meta.description,
    );
    expect((meta.twitter as { description?: string })?.description).toBe(
      meta.description,
    );
  });
});

describe("generateMetadata — unknown / missing slug", () => {
  it("returns { title: 'Not Found' } when getFramework returns null", async () => {
    mocks.getFramework.mockReturnValue(null);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "nobody-real" }),
    });
    expect(meta).toEqual({ title: "Not Found" });
  });

  it("does not include openGraph or twitter on 404 metadata", async () => {
    mocks.getFramework.mockReturnValue(null);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "fake-person" }),
    });
    expect(meta.openGraph).toBeUndefined();
    expect(meta.twitter).toBeUndefined();
  });
});

/* ──────────────────────────────────────────────────────── */
/* 3. FrameworkDetailPage — render behavior                  */
/* ──────────────────────────────────────────────────────── */

describe("FrameworkDetailPage — valid slug", () => {
  it("resolves without throwing for a valid framework", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(makeValidation());
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });

  it("invokes getFramework with the resolved slug", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) });

    expect(mocks.getFramework).toHaveBeenCalledWith("isaac-newton");
  });

  it("invokes getValidation with the slug", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) });

    expect(mocks.getValidation).toHaveBeenCalledWith("isaac-newton");
  });

  it("invokes getPacksForMind with the slug string", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) });

    expect(mocks.getPacksForMind).toHaveBeenCalledWith("isaac-newton");
  });

  it("uses bipolar_constructs.length as constructCount when meta.construct_count is absent", async () => {
    mocks.getFramework.mockReturnValue(
      makeFramework({
        meta: {
          person: "Isaac Newton",
          domain: "Physics",
          incident_count: 5,
          construct_count: undefined as unknown as number,
        },
        bipolar_constructs: [
          {
            construct: "A vs B",
            positive_pole: "A",
            negative_pole: "B",
            behavioral_implication: "test",
          },
          {
            construct: "C vs D",
            positive_pole: "C",
            negative_pole: "D",
            behavioral_implication: "test2",
          },
        ],
      }),
    );
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    // Should not throw — the page falls back to bipolar_constructs.length
    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });

  it("handles non-null validation (passed branch)", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(makeValidation({ passed: true }));
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });

  it("handles non-null validation (failed branch)", async () => {
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(makeValidation({ passed: false }));
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });

  it("handles a framework with blind_spots populated", async () => {
    mocks.getFramework.mockReturnValue(
      makeFramework({
        blind_spots: [
          { description: "Overconfidence in first principles" },
          { description: "Neglects social dynamics" },
        ],
      }),
    );
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });

  it("renders without error when packs are present", async () => {
    const fakePack: Pack = {
      id: "inventors-workshop",
      name: "Inventors' Workshop",
      tagline: "Systematic invention.",
      description: "Great inventors.",
      colorVar: "var(--pack-inventors-workshop)",
      members: ["isaac-newton"],
    };
    mocks.getFramework.mockReturnValue(makeFramework());
    mocks.getValidation.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue([fakePack]);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.not.toThrow();
  });
});

describe("FrameworkDetailPage — invalid slug", () => {
  it("calls notFound() when the slug is not in ALLOWED_SLUGS", async () => {
    // getFramework won't even be reached for an out-of-roster slug
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "nobody-real" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("calls notFound() when getFramework returns null for an in-roster slug", async () => {
    // Simulate a slug that passes the ALLOWED_SLUGS check but whose JSON is missing
    mocks.getFramework.mockReturnValue(null);
    mocks.getPacksForMind.mockReturnValue(NO_PACKS);

    await expect(
      FrameworkDetailPage({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });
});
