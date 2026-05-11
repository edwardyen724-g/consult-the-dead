/**
 * Regression tests for the insights detail page (task cc82a929).
 *
 * Locks down:
 *   1. generateStaticParams — returns one { slug } entry per INSIGHT_ENTRY.
 *   2. generateMetadata — correct metadata for known slug; graceful "Not Found"
 *      stub for an unknown slug.
 *   3. InsightPage — renders without throwing for a valid single-framework
 *      insight; renders a collision insight; calls notFound() for unknown slug,
 *      for a slug whose framework is absent, and for a collision missing a
 *      second framework.
 *
 * All data-layer imports (insights, frameworks, next/navigation) are mocked.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderToStaticMarkup } from "react-dom/server";

import type {
  BehavioralPrediction,
  BipolarConstruct,
  BlindSpot,
  Framework,
  FrameworkSlug,
} from "@/lib/frameworks";
import type { CollisionInsightEntry, InsightEntry, SingleInsightEntry } from "@/lib/insights";

/* ── hoisted mock handles ── */
const mocks = vi.hoisted(() => ({
  INSIGHT_ENTRIES: [] as InsightEntry[],
  getInsightEntry: vi.fn(),
  getInsightFrameworks: vi.fn(),
  getInsightPublishedAt: vi.fn(),
  getInsightUrl: vi.fn(),
  isCollisionInsightEntry: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

/* ── module mocks (must be declared before imports of the SUT) ── */

vi.mock("@/lib/insights", () => ({
  get INSIGHT_ENTRIES() {
    return mocks.INSIGHT_ENTRIES;
  },
  getInsightEntry: mocks.getInsightEntry,
  getInsightFrameworks: mocks.getInsightFrameworks,
  getInsightPublishedAt: mocks.getInsightPublishedAt,
  getInsightUrl: mocks.getInsightUrl,
  isCollisionInsightEntry: mocks.isCollisionInsightEntry,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}));

import {
  default as InsightPage,
  generateMetadata,
  generateStaticParams,
} from "./page";

/* ── fixtures ── */

function makeBipolarConstruct(overrides: Partial<BipolarConstruct> = {}): BipolarConstruct {
  return {
    construct: "Observation vs theory",
    positive_pole: "careful measurement",
    negative_pole: "speculative patterning",
    behavioral_implication: "Grounds claims in tested evidence.",
    ...overrides,
  };
}

function makeBlindSpot(overrides: Partial<BlindSpot> = {}): BlindSpot {
  return {
    description: "Overconfidence in mathematical purity.",
    ...overrides,
  };
}

function makeBehavioralPrediction(
  overrides: Partial<BehavioralPrediction> = {},
): BehavioralPrediction {
  return {
    situation_type: "Crisis under time pressure",
    conventional_response: "Move fast and gather data later.",
    framework_response: "Wait for evidence before committing.",
    ...overrides,
  };
}

function makeFramework(
  slug: FrameworkSlug = "isaac-newton",
  person = "Isaac Newton",
  overrides: Partial<Framework> = {},
): Framework {
  return {
    slug,
    meta: {
      person,
      domain: "Physics",
      incident_count: 5,
      construct_count: 3,
      ...overrides.meta,
    },
    era: "1643–1727",
    perceptual_lens: {
      statement: "Seeks underlying forces before results manifest.",
      what_they_notice_first: "structure",
      what_they_ignore: "noise",
      ...overrides.perceptual_lens,
    },
    bipolar_constructs: overrides.bipolar_constructs ?? [makeBipolarConstruct()],
    blind_spots: overrides.blind_spots ?? [makeBlindSpot()],
    behavioral_divergence_predictions:
      overrides.behavioral_divergence_predictions ?? [],
    incidents: overrides.incidents ?? [],
    ...overrides,
  };
}

function makeSingleEntry(
  slug = "how-newton-would-approach-your-pivot-decision",
): SingleInsightEntry {
  return {
    slug,
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "How Newton Would Approach Your Pivot Decision",
    description:
      "Newton didn't pivot — he waited for proof.",
    targetKeywords: ["pivot", "startup"],
    decisionType: "pivot",
    hookQuestion:
      "You're three months from running out of runway.",
    publishedAt: "2026-04-18",
  };
}

function makeCollisionEntry(slug = "machiavelli-vs-curie-on-pruning"): CollisionInsightEntry {
  return {
    slug,
    type: "collision",
    frameworkSlug: "niccolo-machiavelli",
    collisionFrameworkSlugs: ["niccolo-machiavelli", "marie-curie"],
    title: "Machiavelli vs. Curie on Pruning a Portfolio",
    description: "A collision article on portfolio pruning.",
    targetKeywords: ["portfolio pruning"],
    decisionType: "portfolio",
    hookQuestion:
      "Your portfolio is profitable but the weakest products are absorbing attention.",
    publishedAt: "2026-05-10",
  };
}

/* ── shared setup ── */

beforeEach(() => {
  mocks.INSIGHT_ENTRIES = [];
  mocks.getInsightEntry.mockReset();
  mocks.getInsightFrameworks.mockReset();
  mocks.getInsightPublishedAt.mockReset();
  mocks.getInsightUrl.mockReset();
  mocks.isCollisionInsightEntry.mockReset();
  mocks.notFound.mockReset();
  mocks.notFound.mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  });

  // Sensible defaults for every test
  mocks.getInsightPublishedAt.mockReturnValue(new Date("2026-04-18T00:00:00Z"));
  mocks.getInsightUrl.mockReturnValue(
    "https://www.consultthedead.com/insights/how-newton-would-approach-your-pivot-decision",
  );
  mocks.isCollisionInsightEntry.mockReturnValue(false);
});

/* ──────────────────────────────────────────────────────── */
/* 1. generateStaticParams                                   */
/* ──────────────────────────────────────────────────────── */

describe("generateStaticParams", () => {
  it("returns an empty array when INSIGHT_ENTRIES is empty", () => {
    mocks.INSIGHT_ENTRIES = [];
    expect(generateStaticParams()).toEqual([]);
  });

  it("maps each entry to a { slug } object", () => {
    mocks.INSIGHT_ENTRIES = [
      makeSingleEntry("entry-a"),
      makeSingleEntry("entry-b"),
    ];
    expect(generateStaticParams()).toEqual([
      { slug: "entry-a" },
      { slug: "entry-b" },
    ]);
  });

  it("returns an array, never null or undefined", () => {
    expect(Array.isArray(generateStaticParams())).toBe(true);
  });
});

/* ──────────────────────────────────────────────────────── */
/* 2. generateMetadata                                       */
/* ──────────────────────────────────────────────────────── */

describe("generateMetadata — known slug", () => {
  it("returns the entry title as the page title", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect(meta.title).toBe("How Newton Would Approach Your Pivot Decision");
  });

  it("returns the entry description as the meta description", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect(meta.description).toBe("Newton didn't pivot — he waited for proof.");
  });

  it("sets openGraph url from getInsightUrl", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect((meta.openGraph as { url?: string })?.url).toBe(
      "https://www.consultthedead.com/insights/how-newton-would-approach-your-pivot-decision",
    );
  });

  it("sets openGraph type to article", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect((meta.openGraph as { type?: string })?.type).toBe("article");
  });

  it("sets twitter card to summary", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect((meta.twitter as { card?: string })?.card).toBe("summary");
  });

  it("includes keywords from targetKeywords", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect(meta.keywords).toEqual(["pivot", "startup"]);
  });

  it("sets alternates.canonical using getInsightUrl", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "how-newton-would-approach-your-pivot-decision" }),
    });
    expect((meta.alternates as { canonical?: string })?.canonical).toBe(
      "https://www.consultthedead.com/insights/how-newton-would-approach-your-pivot-decision",
    );
  });
});

describe("generateMetadata — unknown slug", () => {
  it("returns Not Found title for an unknown slug", async () => {
    mocks.getInsightEntry.mockReturnValue(undefined);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
    });
    expect(meta.title).toBe("Not Found");
  });

  it("sets robots.index to false for an unknown slug", async () => {
    mocks.getInsightEntry.mockReturnValue(undefined);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
    });
    expect((meta.robots as { index?: boolean })?.index).toBe(false);
  });

  it("sets robots.follow to false for an unknown slug", async () => {
    mocks.getInsightEntry.mockReturnValue(undefined);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
    });
    expect((meta.robots as { follow?: boolean })?.follow).toBe(false);
  });
});

/* ──────────────────────────────────────────────────────── */
/* 3. InsightPage — render behavior                          */
/* ──────────────────────────────────────────────────────── */

describe("InsightPage — unknown slug", () => {
  it("calls notFound when the entry is not found", async () => {
    mocks.getInsightEntry.mockReturnValue(undefined);

    await expect(
      InsightPage({ params: Promise.resolve({ slug: "does-not-exist" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("calls notFound when getInsightFrameworks returns an empty array", async () => {
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([]);

    await expect(
      InsightPage({
        params: Promise.resolve({
          slug: "how-newton-would-approach-your-pivot-decision",
        }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });
});

describe("InsightPage — single-framework insight", () => {
  it("resolves without throwing for a valid single-framework entry", async () => {
    const fw = makeFramework();
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    await expect(
      InsightPage({
        params: Promise.resolve({
          slug: "how-newton-would-approach-your-pivot-decision",
        }),
      }),
    ).resolves.not.toThrow();
  });

  it("invokes getInsightEntry with the resolved slug", async () => {
    const fw = makeFramework();
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });

    expect(mocks.getInsightEntry).toHaveBeenCalledWith(
      "how-newton-would-approach-your-pivot-decision",
    );
  });

  it("invokes getInsightFrameworks with the entry", async () => {
    const entry = makeSingleEntry();
    const fw = makeFramework();
    mocks.getInsightEntry.mockReturnValue(entry);
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });

    expect(mocks.getInsightFrameworks).toHaveBeenCalledWith(entry);
  });

  it("renders bipolar constructs section when framework has constructs", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      bipolar_constructs: [
        makeBipolarConstruct({ construct: "Speed vs Precision" }),
        makeBipolarConstruct({ construct: "Action vs Caution" }),
      ],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("The Decision Dimensions");
    expect(html).toContain("Speed vs Precision");
  });

  it("skips bipolar constructs section when framework has no constructs", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      bipolar_constructs: [],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("The Decision Dimensions");
  });

  it("renders behavioral divergence predictions when present", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      behavioral_divergence_predictions: [
        makeBehavioralPrediction({
          situation_type: "Pivot decision",
          conventional_response: "Move fast.",
          framework_response: "Wait for proof.",
        }),
      ],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Would Disagree With Conventional Wisdom");
    expect(html).toContain("Pivot decision");
  });

  it("renders behavioral predictions using ordinary_response when conventional_response is absent", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      behavioral_divergence_predictions: [
        makeBehavioralPrediction({
          situation_type: "Evidence gap",
          conventional_response: undefined,
          ordinary_response: "Ship it anyway.",
          framework_response: "Gather more data.",
        }),
      ],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Ship it anyway.");
  });

  it("skips behavioral divergence section when predictions array is empty", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      behavioral_divergence_predictions: [],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("Would Disagree With Conventional Wisdom");
  });

  it("renders blind spots section when framework has blind spots", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      blind_spots: [
        makeBlindSpot({ description: "Overconfidence in mathematical purity." }),
        makeBlindSpot({ description: "Neglects social dynamics entirely." }),
      ],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("The Blind Spots");
    expect(html).toContain("Overconfidence in mathematical purity.");
  });

  it("skips blind spots section when framework has no blind spots", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton", {
      blind_spots: [],
    });
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("The Blind Spots");
  });

  it("renders the footer CTA with the framework person name", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton");
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Run your own decision through Isaac Newton");
    expect(html).toContain("#council");
  });

  it("renders the breadcrumb with framework person eyebrow", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton");
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("/insights");
  });

  it("renders the JSON-LD script tag with article schema", async () => {
    const fw = makeFramework();
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("application/ld+json");
    expect(html).toContain("Article");
  });
});

describe("InsightPage — collision insight", () => {
  it("resolves without throwing for a valid collision entry", async () => {
    const primaryFw = makeFramework("niccolo-machiavelli", "Niccolo Machiavelli");
    const secondaryFw = makeFramework("marie-curie", "Marie Curie");
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);

    await expect(
      InsightPage({
        params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
      }),
    ).resolves.not.toThrow();
  });

  it("renders the collision article section with both framework names", async () => {
    const primaryFw = makeFramework("niccolo-machiavelli", "Niccolo Machiavelli", {
      bipolar_constructs: [
        makeBipolarConstruct({ construct: "Power vs Consensus" }),
      ],
      blind_spots: [makeBlindSpot()],
    });
    const secondaryFw = makeFramework("marie-curie", "Marie Curie", {
      bipolar_constructs: [
        makeBipolarConstruct({ construct: "Evidence vs Speed" }),
      ],
      blind_spots: [],
    });
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Collision Article");
    expect(html).toContain("Niccolo Machiavelli");
    expect(html).toContain("Marie Curie");
    expect(html).toContain("Where They Diverge");
    expect(html).toContain("What A Reader Should Notice");
  });

  it("calls notFound for a collision entry with fewer than two frameworks", async () => {
    const primaryFw = makeFramework("niccolo-machiavelli", "Niccolo Machiavelli");
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    // Only one framework returned — should trigger notFound
    mocks.getInsightFrameworks.mockReturnValue([primaryFw]);

    await expect(
      InsightPage({
        params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("renders accentForSlug with multiple slug types in a collision", async () => {
    // Exercise the accentForSlug switch across different slug values
    const slugsToTest: Array<[FrameworkSlug, FrameworkSlug, string, string]> = [
      ["nikola-tesla", "leonardo-da-vinci", "Nikola Tesla", "Leonardo da Vinci"],
      ["sun-tzu", "marcus-aurelius", "Sun Tzu", "Marcus Aurelius"],
    ];

    for (const [slug1, slug2, name1, name2] of slugsToTest) {
      mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
      mocks.isCollisionInsightEntry.mockReturnValue(true);
      mocks.getInsightFrameworks.mockReturnValue([
        makeFramework(slug1, name1),
        makeFramework(slug2, name2),
      ]);
      mocks.notFound.mockReset();
      mocks.notFound.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      const element = await InsightPage({
        params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
      });
      const html = renderToStaticMarkup(element);
      expect(html).toContain(name1);
      expect(html).toContain(name2);
    }
  });
});
