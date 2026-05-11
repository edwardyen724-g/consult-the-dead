import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Framework,
  FrameworkSlug,
  ValidationResult,
} from "@/lib/frameworks";

const mocks = vi.hoisted(() => ({
  getFramework: vi.fn(),
  getValidation: vi.fn(),
}));

vi.mock("@/lib/frameworks", () => ({
  ALLOWED_SLUGS: ["isaac-newton", "marie-curie"],
  getFramework: mocks.getFramework,
  getValidation: mocks.getValidation,
}));

vi.mock("next/og", () => {
  class MockImageResponse {
    body: unknown;
    options: unknown;

    constructor(body: unknown, options: unknown) {
      this.body = body;
      this.options = options;
    }
  }

  return { ImageResponse: MockImageResponse };
});

import Image, {
  alt,
  contentType,
  dynamicParams,
  generateStaticParams,
  revalidate,
  runtime,
  size,
} from "./opengraph-image";
import TwitterImage, {
  alt as twitterAlt,
  contentType as twitterContentType,
  dynamicParams as twitterDynamicParams,
  generateStaticParams as twitterGenerateStaticParams,
  revalidate as twitterRevalidate,
  runtime as twitterRuntime,
  size as twitterSize,
} from "./twitter-image";

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    slug: "isaac-newton" as FrameworkSlug,
    meta: {
      person: "Isaac Newton",
      domain: "Physics",
      incident_count: 2,
      construct_count: 3,
      ...overrides.meta,
    },
    era: "1643-1727",
    perceptual_lens: {
      statement: "Sees gravity before the crowd notices apples falling.",
      what_they_notice_first: "motion",
      what_they_ignore: "social noise",
      ...overrides.perceptual_lens,
    },
    bipolar_constructs:
      overrides.bipolar_constructs ?? [
        {
          construct: "Observation vs theory",
          positive_pole: "careful measurement",
          negative_pole: "speculative patterning",
          behavioral_implication: "Grounds the framework in testable evidence.",
        },
      ],
    blind_spots: overrides.blind_spots ?? [],
    behavioral_divergence_predictions:
      overrides.behavioral_divergence_predictions ?? [],
    incidents: overrides.incidents ?? [],
    ...overrides,
  };
}

beforeEach(() => {
  mocks.getFramework.mockReset();
  mocks.getValidation.mockReset();
});

describe("framework share-image routes", () => {
  it("keeps the OG and Twitter route metadata aligned", () => {
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(dynamicParams).toBe(false);
    expect(alt).toBe("A framework detail card from Consult The Dead");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");

    expect(twitterRuntime).toBe(runtime);
    expect(twitterRevalidate).toBe(revalidate);
    expect(twitterDynamicParams).toBe(dynamicParams);
    expect(twitterAlt).toBe(alt);
    expect(twitterSize).toEqual(size);
    expect(twitterContentType).toBe(contentType);
    expect(twitterGenerateStaticParams()).toEqual(generateStaticParams());
    expect(TwitterImage).toBe(Image);
  });

  it("builds static params from the allowed slug list", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "isaac-newton" },
      { slug: "marie-curie" },
    ]);
    expect(twitterGenerateStaticParams()).toEqual([
      { slug: "isaac-newton" },
      { slug: "marie-curie" },
    ]);
  });

  it("renders the generic card when the framework record is missing", async () => {
    mocks.getFramework.mockReturnValue(null);

    const response = await Image({
      params: Promise.resolve({ slug: "made-up-mind" }),
    });

    expect(response).toMatchObject({ options: size });
    expect(mocks.getValidation).not.toHaveBeenCalled();
  });

  it("renders the framework-specific card across the content branches", async () => {
    mocks.getFramework
      .mockReturnValueOnce(
        makeFramework({
          meta: {
            person: "Professor Alistair Q. Montgomery the Third",
            domain: "Physics",
            incident_count: 7,
            construct_count: 5,
          },
          perceptual_lens: {
            statement:
              "A".repeat(240) +
              " precise lens for a long social proof excerpt that triggers truncation.",
            what_they_notice_first: "structure",
            what_they_ignore: "noise",
          },
          bipolar_constructs: [
            {
              construct: "Observation vs theory",
              positive_pole: "careful measurement",
              negative_pole: "speculative patterning",
              behavioral_implication: "Grounds the framework in testable evidence.",
            },
            {
              construct: "Evidence vs ego",
              positive_pole: "proof",
              negative_pole: "prestige",
              behavioral_implication: "Keeps the card focused on validated claims.",
            },
          ],
        }),
      )
      .mockReturnValueOnce(
        makeFramework({
          meta: {
            person: "Short Name",
            domain: "Physics",
            incident_count: 1,
            construct_count: 0,
          },
          perceptual_lens: {
            statement: "Short lens.",
            what_they_notice_first: "signal",
            what_they_ignore: "noise",
          },
          bipolar_constructs: [],
        }),
      );
    mocks.getValidation
      .mockReturnValueOnce({
        passed: false,
        divergent_count: 2,
        total_scenarios: 8,
        scenario_results: [],
      } satisfies ValidationResult)
      .mockReturnValueOnce({
        passed: true,
        divergent_count: 0,
        total_scenarios: 8,
        scenario_results: [],
      } satisfies ValidationResult);

    const first = await Image({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const second = await Image({
      params: Promise.resolve({ slug: "unknown-slug" }),
    });

    expect(first).toMatchObject({ options: size });
    expect(second).toMatchObject({ options: size });
    expect(mocks.getFramework).toHaveBeenCalledTimes(2);
    expect(mocks.getValidation).toHaveBeenCalledTimes(2);
  });

  it("falls back when validation and construct counts are missing", async () => {
    mocks.getFramework.mockReturnValueOnce(
      makeFramework({
        meta: {
          person: "Backup Astronomer",
          domain: "Physics",
          incident_count: 4,
          construct_count: undefined as unknown as number,
        },
        perceptual_lens: {
          statement: undefined as unknown as string,
          what_they_notice_first: "signal",
          what_they_ignore: "noise",
        },
        bipolar_constructs: [
          {
            construct: "Observation vs theory",
            positive_pole: "careful measurement",
            negative_pole: "speculative patterning",
            behavioral_implication: "Grounds the framework in testable evidence.",
          },
          {
            construct: "Evidence vs ego",
            positive_pole: "proof",
            negative_pole: "prestige",
            behavioral_implication: "Keeps the card focused on validated claims.",
          },
        ],
      }),
    );
    mocks.getValidation.mockReturnValueOnce(null);

    const response = await Image({
      params: Promise.resolve({ slug: "unknown-slug" }),
    });

    expect(response).toMatchObject({ options: size });
    expect(mocks.getFramework).toHaveBeenCalledTimes(1);
    expect(mocks.getValidation).toHaveBeenCalledTimes(1);
  });
});
