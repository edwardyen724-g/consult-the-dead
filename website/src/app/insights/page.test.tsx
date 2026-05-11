/**
 * Regression tests for the insights index page (task cc82a929).
 *
 * Locks down:
 *   1. Static metadata export — title and description fields.
 *   2. InsightsPage render — renders all insight entries that have a matching
 *      framework; skips entries whose framework is absent.
 *
 * Both getAllFrameworks() and INSIGHT_ENTRIES are mocked so the test runs
 * in-process without touching the real data layer.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Framework, FrameworkSlug } from "@/lib/frameworks";
import type { InsightEntry } from "@/lib/insights";

/* ── hoisted mock handles ── */
const mocks = vi.hoisted(() => ({
  getAllFrameworks: vi.fn(),
  INSIGHT_ENTRIES: [] as InsightEntry[],
}));

vi.mock("@/lib/frameworks", () => ({
  getAllFrameworks: mocks.getAllFrameworks,
}));

vi.mock("@/lib/insights", () => ({
  get INSIGHT_ENTRIES() {
    return mocks.INSIGHT_ENTRIES;
  },
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

import InsightsPage, { metadata } from "./page";

/* ── fixtures ── */

function makeFramework(slug: FrameworkSlug, person: string): Framework {
  return {
    slug,
    meta: { person, domain: "Strategy", incident_count: 5, construct_count: 3 },
    era: "500 BC",
    perceptual_lens: {
      statement: "Sees patterns.",
      what_they_notice_first: "structure",
      what_they_ignore: "noise",
    },
    bipolar_constructs: [],
    blind_spots: [],
    behavioral_divergence_predictions: [],
    incidents: [],
  };
}

function makeEntry(
  slug: string,
  frameworkSlug: FrameworkSlug,
  title: string,
): InsightEntry {
  return {
    slug,
    type: "single",
    frameworkSlug,
    title,
    description: `Description for ${title}`,
    targetKeywords: [],
    decisionType: "pivot",
    hookQuestion: "How should you decide?",
    publishedAt: "2026-04-18",
  };
}

/* ── tests ── */

describe("insights index metadata", () => {
  it("has the expected title", () => {
    expect(metadata.title).toBe(
      "Decision Insights — How History's Greatest Minds Would Decide",
    );
  });

  it("has a non-empty description", () => {
    expect(typeof metadata.description).toBe("string");
    expect((metadata.description as string).length).toBeGreaterThan(0);
  });

  it("description mentions historical figures", () => {
    expect(metadata.description).toMatch(/Newton|Machiavelli|Curie|Sun Tzu/i);
  });
});

describe("InsightsPage — render", () => {
  beforeEach(() => {
    mocks.getAllFrameworks.mockReset();
    mocks.INSIGHT_ENTRIES = [];
  });

  it("renders the page heading", () => {
    mocks.getAllFrameworks.mockReturnValue([]);
    mocks.INSIGHT_ENTRIES = [];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("DECISION INSIGHTS");
  });

  it("renders an entry card for each insight that has a matching framework", () => {
    const newtonFw = makeFramework("isaac-newton", "Isaac Newton");
    const curieFw = makeFramework("marie-curie", "Marie Curie");
    mocks.getAllFrameworks.mockReturnValue([newtonFw, curieFw]);
    mocks.INSIGHT_ENTRIES = [
      makeEntry(
        "how-newton-would-pivot",
        "isaac-newton",
        "How Newton Would Pivot",
      ),
      makeEntry(
        "curie-on-evidence",
        "marie-curie",
        "Curie on Evidence",
      ),
    ];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How Newton Would Pivot");
    expect(html).toContain("Curie on Evidence");
  });

  it("skips entries whose framework is not in the framework map", () => {
    mocks.getAllFrameworks.mockReturnValue([
      makeFramework("isaac-newton", "Isaac Newton"),
    ]);
    mocks.INSIGHT_ENTRIES = [
      makeEntry(
        "how-newton-would-pivot",
        "isaac-newton",
        "How Newton Would Pivot",
      ),
      makeEntry(
        "sun-tzu-strategy",
        "sun-tzu",
        "Sun Tzu on Market Entry",
      ),
    ];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("How Newton Would Pivot");
    expect(html).not.toContain("Sun Tzu on Market Entry");
  });

  it("renders the framework person name as an eyebrow label", () => {
    mocks.getAllFrameworks.mockReturnValue([
      makeFramework("isaac-newton", "Isaac Newton"),
    ]);
    mocks.INSIGHT_ENTRIES = [
      makeEntry("newton-pivot", "isaac-newton", "Newton Pivot Test"),
    ];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Isaac Newton");
  });

  it("renders a link to each insight's detail page", () => {
    mocks.getAllFrameworks.mockReturnValue([
      makeFramework("marie-curie", "Marie Curie"),
    ]);
    mocks.INSIGHT_ENTRIES = [
      makeEntry("curie-data-decision", "marie-curie", "Curie on Data"),
    ];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("/insights/curie-data-decision");
  });

  it("renders each entry description in the card", () => {
    mocks.getAllFrameworks.mockReturnValue([
      makeFramework("niccolo-machiavelli", "Niccolo Machiavelli"),
    ]);
    mocks.INSIGHT_ENTRIES = [
      makeEntry(
        "machiavelli-cofounder",
        "niccolo-machiavelli",
        "Machiavelli on Cofounders",
      ),
    ];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Description for Machiavelli on Cofounders");
  });

  it("renders an empty list when INSIGHT_ENTRIES is empty", () => {
    mocks.getAllFrameworks.mockReturnValue([
      makeFramework("isaac-newton", "Isaac Newton"),
    ]);
    mocks.INSIGHT_ENTRIES = [];

    const element = InsightsPage();
    const html = renderToStaticMarkup(element);

    // Page heading still present, but no entry cards
    expect(html).toContain("DECISION INSIGHTS");
    expect(html).not.toContain("/insights/");
  });

  it("calls getAllFrameworks exactly once per render", () => {
    mocks.getAllFrameworks.mockReturnValue([]);
    mocks.INSIGHT_ENTRIES = [];

    InsightsPage();

    expect(mocks.getAllFrameworks).toHaveBeenCalledTimes(1);
  });
});
