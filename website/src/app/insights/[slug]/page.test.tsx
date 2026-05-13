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
  formatPublishedDate,
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
    expect(html).toContain("/agora");
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

  it("emits a FAQPage JSON-LD block when hookQuestion is present", async () => {
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

    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"Question"');
    expect(html).toContain('"@type":"Answer"');
    // The hookQuestion text should appear as the FAQ question name.
    expect(html).toContain("You&#x27;re three months from running out of runway.");
  });

  it("omits the FAQPage block when hookQuestion is absent", async () => {
    const fw = makeFramework();
    const entryNoHook = { ...makeSingleEntry(), hookQuestion: "" };
    mocks.getInsightEntry.mockReturnValue(entryNoHook);
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({
        slug: "how-newton-would-approach-your-pivot-decision",
      }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain('"@type":"FAQPage"');
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

  it("renders accentForSlug with steve-jobs slug type in a collision", async () => {
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([
      makeFramework("steve-jobs", "Steve Jobs"),
      makeFramework("marcus-aurelius", "Marcus Aurelius"),
    ]);
    mocks.notFound.mockReset();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain("Steve Jobs");
    expect(html).toContain("Marcus Aurelius");
  });

  it("falls back to slug and amber accents when collision framework metadata is sparse", async () => {
    const primaryFw = makeFramework("isaac-newton", "Isaac Newton", {
      slug: "unknown-framework" as FrameworkSlug,
      meta: {
        person: undefined as unknown as string,
        domain: "Physics",
        incident_count: 5,
        construct_count: 3,
      },
    });
    const secondaryFw = makeFramework("marie-curie", "Marie Curie", {
      meta: {
        person: undefined as unknown as string,
        domain: "Chemistry",
        incident_count: 5,
        construct_count: 3,
      },
    });
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);
    mocks.notFound.mockReset();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("niccolo-machiavelli’s framework");
    expect(html).toContain("Collision Article");
  });

  it("renders the agon excerpt section when the collision entry has agonExcerpt", async () => {
    const primaryFw = makeFramework("marcus-aurelius", "Marcus Aurelius");
    const secondaryFw = makeFramework("sun-tzu", "Sun Tzu");
    const entry: CollisionInsightEntry = {
      ...makeCollisionEntry(),
      agonExcerpt: [
        { speaker: "Marcus Aurelius", text: "Audit the purpose, not the metrics." },
        { speaker: "Sun Tzu", text: "Win before the meeting begins." },
      ],
    };
    mocks.getInsightEntry.mockReturnValue(entry);
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("From The Agon");
    expect(html).toContain("Audit the purpose, not the metrics.");
    expect(html).toContain("Win before the meeting begins.");
  });

  it("renders accentForSlug with multiple slug types in a collision", async () => {
    // Exercise the accentForSlug switch across different slug values
    const slugsToTest: Array<[FrameworkSlug, FrameworkSlug, string, string]> = [
      ["isaac-newton", "marie-curie", "Isaac Newton", "Marie Curie"],
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

  it("falls back to the published-at prefix when date formatting throws", async () => {
    const fw = makeFramework("isaac-newton", "Isaac Newton");
    mocks.getInsightEntry.mockReturnValue(makeSingleEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const dateTimeFormatSpy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(() => ({ format: () => { throw new Error("format failed"); } }) as Intl.DateTimeFormat);

    try {
      const element = await InsightPage({
        params: Promise.resolve({
          slug: "how-newton-would-approach-your-pivot-decision",
        }),
      });
      const html = renderToStaticMarkup(element);

      expect(html).toContain("2026-04-18");
    } finally {
      dateTimeFormatSpy.mockRestore();
    }
  });

  it("renders accentForSlug for isaac-newton as the secondary framework", async () => {
    // Covers the 'isaac-newton' case in accentForSlug (previously uncovered)
    const primaryFw = makeFramework("niccolo-machiavelli", "Niccolo Machiavelli");
    const secondaryFw = makeFramework("isaac-newton", "Isaac Newton");
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Isaac Newton");
    expect(html).toContain("var(--color-newton)");
  });

  it("falls back to amber accent for an unrecognised framework slug", async () => {
    // Covers the default branch in accentForSlug (previously uncovered)
    const primaryFw = makeFramework("niccolo-machiavelli", "Niccolo Machiavelli");
    const secondaryFw = makeFramework(
      // Cast a slug not present in the accentForSlug switch to hit the default
      "benjamin-franklin" as FrameworkSlug,
      "Benjamin Franklin",
    );
    mocks.getInsightEntry.mockReturnValue(makeCollisionEntry());
    mocks.isCollisionInsightEntry.mockReturnValue(true);
    mocks.getInsightFrameworks.mockReturnValue([primaryFw, secondaryFw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "machiavelli-vs-curie-on-pruning" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Benjamin Franklin");
    expect(html).toContain("var(--amber)");
  });
});

/* ──────────────────────────────────────────────────────── */
/* 4. SEO listicle pages (task c7400a14)                     */
/* ──────────────────────────────────────────────────────── */

describe("InsightPage — stoics-on-failure listicle", () => {
  it("renders the h1 title and footer CTA for stoics-on-failure", async () => {
    const fw = makeFramework("marcus-aurelius", "Marcus Aurelius");
    const entry: SingleInsightEntry = {
      slug: "stoics-on-failure",
      type: "single",
      frameworkSlug: "marcus-aurelius",
      title: "What Marcus Aurelius, Seneca, and Epictetus Say About Dealing With Failure",
      description:
        "Three Stoic philosophers debate how to handle failure, setbacks, and adversity.",
      targetKeywords: ["stoics on failure"],
      decisionType: "resilience",
      hookQuestion: "You've just failed publicly.",
      publishedAt: "2026-05-11",
    };
    mocks.getInsightEntry.mockReturnValue(entry);
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "stoics-on-failure" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("What Marcus Aurelius, Seneca, and Epictetus Say About Dealing With Failure");
    expect(html).toContain("/agora");
  });
});

describe("InsightPage — steve-jobs-on-product listicle", () => {
  it("renders the h1 title and footer CTA for steve-jobs-on-product", async () => {
    const fw = makeFramework("steve-jobs", "Steve Jobs");
    const entry: SingleInsightEntry = {
      slug: "steve-jobs-on-product",
      type: "single",
      frameworkSlug: "steve-jobs",
      title: "Steve Jobs' Decision Framework: How He Said No to 1,000 Things",
      description:
        "Steve Jobs' framework for product decisions reveals why saying no is the hardest skill in building.",
      targetKeywords: ["steve jobs decision framework"],
      decisionType: "product",
      hookQuestion: "You have ten things on your product roadmap.",
      publishedAt: "2026-05-11",
    };
    mocks.getInsightEntry.mockReturnValue(entry);
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "steve-jobs-on-product" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Steve Jobs&#x27; Decision Framework");
    expect(html).toContain("/agora");
  });
});

describe("InsightPage — founders-on-pricing listicle", () => {
  it("renders the h1 title and footer CTA for founders-on-pricing", async () => {
    const fw = makeFramework("john-d-rockefeller", "John D. Rockefeller, Sr.");
    const entry: SingleInsightEntry = {
      slug: "founders-on-pricing",
      type: "single",
      frameworkSlug: "john-d-rockefeller",
      title: "What History's Greatest Thinkers Say About Pricing Your Product",
      description:
        "Unconventional wisdom on pricing strategy from minds that shaped industrial history.",
      targetKeywords: ["pricing strategy advice"],
      decisionType: "pricing",
      hookQuestion: "You're staring at your pricing page.",
      publishedAt: "2026-05-11",
    };
    mocks.getInsightEntry.mockReturnValue(entry);
    mocks.isCollisionInsightEntry.mockReturnValue(false);
    mocks.getInsightFrameworks.mockReturnValue([fw]);

    const element = await InsightPage({
      params: Promise.resolve({ slug: "founders-on-pricing" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("What History&#x27;s Greatest Thinkers Say About Pricing Your Product");
    expect(html).toContain("/agora");
  });
});

/* ──────────────────────────────────────────────────────── */
/* 4. formatPublishedDate                                    */
/* ──────────────────────────────────────────────────────── */

describe("formatPublishedDate", () => {
  it("formats a valid ISO date string into a human-readable date", () => {
    const result = formatPublishedDate("2026-04-18T00:00:00.000Z");
    // The exact format depends on locale, but it should contain "2026"
    expect(result).toContain("2026");
    expect(result).not.toBe("2026-04-18T00:00:00.000Z");
  });

  it("falls back to slicing the raw string when the date is invalid (catch branch)", () => {
    // Covers the catch branch in formatPublishedDate (previously uncovered)
    const invalidDate = "not-a-date-at-all";
    const result = formatPublishedDate(invalidDate);
    expect(result).toBe("not-a-date"); // date.slice(0, 10)
  });
});
