import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as frameworksModule from "@/lib/frameworks";
import * as packsModule from "@/lib/packs";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/FrameworkConstructExplorer", () => ({
  FrameworkConstructExplorer: ({
    person,
    constructs,
    predictions,
  }: {
    person: string;
    constructs: Array<{ construct: string }>;
    predictions: Array<{ situation_type: string }>;
  }) => (
    <div data-testid="construct-explorer">
      {person}:{constructs.length}:{predictions.length}
    </div>
  ),
}));

vi.mock("@/components/framework-transparency-panel", () => ({
  FrameworkTransparencyPanel: ({
    blindSpotCount,
    validationLine,
  }: {
    blindSpotCount: number;
    validationLine: string | null;
  }) => (
    <div data-testid="transparency-panel">
      {blindSpotCount}:{validationLine ?? "no-validation"}
    </div>
  ),
}));

import {
  ALLOWED_SLUGS,
  type Framework,
  type ValidationResult,
} from "@/lib/frameworks";
import {
  default as FrameworkDetailPage,
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "./page";

function createFramework(overrides: Partial<Framework> = {}): Framework {
  const base: Framework = {
    slug: "isaac-newton",
    meta: {
      person: "Isaac Newton",
      domain: "Physics",
      incident_count: 3,
      construct_count: 2,
    },
    era: "1643-1727",
    perceptual_lens: {
      statement: "A law-seeking mind.",
      what_they_notice_first: "Patterns",
      what_they_ignore: "Noise",
    },
    bipolar_constructs: [
      {
        construct: "Order versus chaos",
        positive_pole: "Order",
        negative_pole: "Chaos",
        behavioral_implication: "He favors structures that simplify motion.",
      },
    ],
    blind_spots: [
      {
        description: "Can underweight social context.",
      },
    ],
    behavioral_divergence_predictions: [
      {
        situation_type: "Public dispute",
        framework_response: "Reduce the conflict to first principles.",
      },
    ],
    incidents: [],
  };

  return {
    ...base,
    ...overrides,
    meta: { ...base.meta, ...overrides.meta },
    perceptual_lens: { ...base.perceptual_lens, ...overrides.perceptual_lens },
    bipolar_constructs: overrides.bipolar_constructs ?? base.bipolar_constructs,
    blind_spots: overrides.blind_spots ?? base.blind_spots,
    behavioral_divergence_predictions:
      overrides.behavioral_divergence_predictions ??
      base.behavioral_divergence_predictions,
    incidents: overrides.incidents ?? base.incidents,
  };
}

function createValidation(passed: boolean): ValidationResult {
  return {
    divergent_count: passed ? 3 : 1,
    total_scenarios: 4,
    passed,
    scenario_results: [
      {
        divergence_score: passed ? 0.9 : 0.2,
        specificity_score: 0.8,
        traceability_score: 0.9,
        divergent: passed,
      },
      {
        divergence_score: passed ? 0.7 : 0.3,
        specificity_score: 0.7,
        traceability_score: 0.8,
        divergent: false,
      },
    ],
  };
}

async function renderPage(slug: string) {
  return renderToStaticMarkup(
    await FrameworkDetailPage({ params: Promise.resolve({ slug }) }),
  );
}

describe("framework detail route config", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pre-renders all allowed slugs and keeps dynamicParams disabled", () => {
    expect(generateStaticParams()).toEqual(
      ALLOWED_SLUGS.map((slug) => ({ slug })),
    );
    expect(dynamicParams).toBe(false);
  });
});

describe("generateMetadata", () => {
  it("returns not found metadata when the framework lookup misses", async () => {
    const frameworkSpy = vi
      .spyOn(frameworksModule, "getFramework")
      .mockReturnValueOnce(null);

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.toEqual({ title: "Not Found" });
    expect(frameworkSpy).toHaveBeenCalledWith("isaac-newton");
  });

  it("emits social metadata for a shipped framework", async () => {
    vi.spyOn(frameworksModule, "getFramework").mockReturnValueOnce(
      createFramework(),
    );

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "isaac-newton" }) }),
    ).resolves.toMatchObject({
      title: "Isaac Newton — Physics Decision Framework",
      description:
        "How Isaac Newton would approach your decision. Cognitive framework extracted via the Critical Decision Method from 3 documented historical incidents.",
      openGraph: {
        title: "Isaac Newton — Physics | Consult The Dead",
        url: "https://www.consultthedead.com/frameworks/isaac-newton",
      },
      twitter: {
        card: "summary",
        title: "Isaac Newton — Physics",
      },
    });
  });
});

describe("FrameworkDetailPage", () => {
  it("throws notFound for a slug outside the allowed roster", async () => {
    await expect(
      FrameworkDetailPage({
        params: Promise.resolve({ slug: "not-a-framework" }),
      }),
    ).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("throws notFound when the allowed slug has no framework data", async () => {
    vi.spyOn(frameworksModule, "getFramework").mockReturnValueOnce(null);

    await expect(
      FrameworkDetailPage({
        params: Promise.resolve({ slug: "isaac-newton" }),
      }),
    ).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders the pack, blind-spot, and passed-validation branches", async () => {
    vi.spyOn(frameworksModule, "getFramework").mockReturnValueOnce(
      createFramework(),
    );
    vi.spyOn(frameworksModule, "getValidation").mockReturnValueOnce(
      createValidation(true),
    );
    vi.spyOn(packsModule, "getPacksForMind").mockReturnValueOnce([
      {
        id: "republic",
        name: "The Republic",
        description: "A pack for statecraft.",
        tagline: "Power and governance.",
        colorVar: "var(--pack-republic)",
        members: ["isaac-newton"],
      },
    ]);

    const html = await renderPage("isaac-newton");

    expect(html).toContain("The Republic");
    expect(html).toContain("Blind Spots Mapped");
    expect(html).toContain("Tier 1 validated");
    expect(html).toContain("Consult Isaac →");
    expect(html).toContain("Isaac Newton:1:1");
  });

  it("renders the empty-pack, empty-blind-spot, and failed-validation branches", async () => {
    vi.spyOn(frameworksModule, "getFramework").mockReturnValueOnce(
      createFramework({
        blind_spots: [],
      }),
    );
    vi.spyOn(frameworksModule, "getValidation").mockReturnValueOnce(
      createValidation(false),
    );
    vi.spyOn(packsModule, "getPacksForMind").mockReturnValueOnce([]);

    const html = await renderPage("isaac-newton");

    expect(html).not.toContain("Blind Spots Mapped");
    expect(html).toContain("Tier 1: Methodologically sound");
    expect(html).toContain("0:Tier 1: Methodologically sound");
    expect(html).toContain("Isaac Newton:1:1");
  });

  it("renders a valid framework page when validation is absent", async () => {
    vi.spyOn(frameworksModule, "getFramework").mockReturnValueOnce(
      createFramework({
        meta: { construct_count: undefined } as Partial<Framework["meta"]>,
        bipolar_constructs: [
          {
            construct: "Order versus chaos",
            positive_pole: "Order",
            negative_pole: "Chaos",
            behavioral_implication: "He favors structures that simplify motion.",
          },
          {
            construct: "Gravity versus impulse",
            positive_pole: "Gravity",
            negative_pole: "Impulse",
            behavioral_implication: "He prefers settled frameworks over guesses.",
          },
        ],
        blind_spots: [],
      }),
    );
    vi.spyOn(frameworksModule, "getValidation").mockReturnValueOnce(null);
    vi.spyOn(packsModule, "getPacksForMind").mockReturnValueOnce([]);

    const html = await renderPage("isaac-newton");

    expect(html).toContain("no-validation");
    expect(html).not.toContain("Blind Spots Mapped");
    expect(html).toContain("Isaac Newton:2:1");
    expect(html).toContain(
      '>2</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-dim)">Constructs</div>',
    );
  });
});
