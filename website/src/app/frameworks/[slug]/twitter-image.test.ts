import { describe, expect, it, vi } from "vitest";

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

import OGImage, {
  alt as ogAlt,
  contentType as ogContentType,
  dynamicParams as ogDynamicParams,
  generateStaticParams as ogGenerateStaticParams,
  revalidate as ogRevalidate,
  runtime as ogRuntime,
  size as ogSize,
} from "./opengraph-image";
import TwitterImage, {
  alt,
  contentType,
  dynamicParams,
  generateStaticParams,
  revalidate,
  runtime,
  size,
} from "./twitter-image";

describe("twitter-image contract", () => {
  describe("metadata exports", () => {
    it("exports runtime as nodejs", () => {
      expect(runtime).toBe("nodejs");
    });

    it("exports revalidate of 3600", () => {
      expect(revalidate).toBe(3600);
    });

    it("exports dynamicParams as false", () => {
      expect(dynamicParams).toBe(false);
    });

    it("exports the canonical alt text", () => {
      expect(alt).toBe("A framework detail card from Consult The Dead");
    });

    it("exports image dimensions 1200×630", () => {
      expect(size).toEqual({ width: 1200, height: 630 });
    });

    it("exports contentType as image/png", () => {
      expect(contentType).toBe("image/png");
    });
  });

  describe("alignment with opengraph-image", () => {
    it("default export is the same function as opengraph-image", () => {
      expect(TwitterImage).toBe(OGImage);
    });

    it("runtime matches OG runtime", () => {
      expect(runtime).toBe(ogRuntime);
    });

    it("revalidate matches OG revalidate", () => {
      expect(revalidate).toBe(ogRevalidate);
    });

    it("dynamicParams matches OG dynamicParams", () => {
      expect(dynamicParams).toBe(ogDynamicParams);
    });

    it("alt matches OG alt", () => {
      expect(alt).toBe(ogAlt);
    });

    it("size matches OG size", () => {
      expect(size).toEqual(ogSize);
    });

    it("contentType matches OG contentType", () => {
      expect(contentType).toBe(ogContentType);
    });

    it("generateStaticParams output matches OG generateStaticParams output", () => {
      expect(generateStaticParams()).toEqual(ogGenerateStaticParams());
    });
  });

  describe("generateStaticParams", () => {
    it("returns one entry per allowed slug", () => {
      expect(generateStaticParams()).toEqual([
        { slug: "isaac-newton" },
        { slug: "marie-curie" },
      ]);
    });

    it("returns plain objects with a slug key", () => {
      for (const entry of generateStaticParams()) {
        expect(entry).toHaveProperty("slug");
        expect(typeof entry.slug).toBe("string");
      }
    });
  });

  describe("image rendering (via OG re-export)", () => {
    it("renders an ImageResponse with the correct dimensions for a known slug", async () => {
      mocks.getFramework.mockReturnValue({
        slug: "isaac-newton",
        meta: { person: "Isaac Newton", domain: "Physics", incident_count: 3, construct_count: 2 },
        era: "1643-1727",
        perceptual_lens: {
          statement: "Sees patterns in motion before the crowd does.",
          what_they_notice_first: "motion",
          what_they_ignore: "social noise",
        },
        bipolar_constructs: [
          {
            construct: "Observation vs theory",
            positive_pole: "careful measurement",
            negative_pole: "speculative patterning",
            behavioral_implication: "Grounds the framework in testable evidence.",
          },
        ],
        blind_spots: [],
        behavioral_divergence_predictions: [],
        incidents: [],
      });
      mocks.getValidation.mockReturnValue({
        passed: true,
        divergent_count: 1,
        total_scenarios: 8,
        scenario_results: [],
      });

      const response = await TwitterImage({
        params: Promise.resolve({ slug: "isaac-newton" }),
      });

      expect(response).toMatchObject({ options: size });
    });

    it("renders an ImageResponse for an unknown slug (generic fallback)", async () => {
      mocks.getFramework.mockReturnValue(null);

      const response = await TwitterImage({
        params: Promise.resolve({ slug: "unknown-mind" }),
      });

      expect(response).toMatchObject({ options: size });
    });

    it("renders when validation is null", async () => {
      mocks.getFramework.mockReturnValue({
        slug: "marie-curie",
        meta: { person: "Marie Curie", domain: "Chemistry", incident_count: 5, construct_count: 3 },
        era: "1867-1934",
        perceptual_lens: {
          statement: "Seeks proof through measurement.",
          what_they_notice_first: "anomalies",
          what_they_ignore: "convention",
        },
        bipolar_constructs: [],
        blind_spots: [],
        behavioral_divergence_predictions: [],
        incidents: [],
      });
      mocks.getValidation.mockReturnValue(null);

      const response = await TwitterImage({
        params: Promise.resolve({ slug: "marie-curie" }),
      });

      expect(response).toMatchObject({ options: size });
    });
  });
});
