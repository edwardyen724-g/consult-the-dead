/**
 * Tests for /minds/[id]/opengraph-image and /minds/[id]/twitter-image routes.
 *
 * Mirrors the test conventions used by /frameworks/[slug]/opengraph-image.test.ts:
 * - Mocks next/og ImageResponse so no Satori binary is needed in tests.
 * - Mocks the mind-content loader to exercise branches without disk reads.
 * - Validates the route contract (exports) and that both routes stay aligned.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MindContent, MindSlug } from "@/lib/mind-content";

const mocks = vi.hoisted(() => ({
  getMindContent: vi.fn(),
  isMindSlug: vi.fn(),
}));

vi.mock("@/lib/mind-content", () => ({
  MIND_SLUGS: ["isaac-newton", "marie-curie"],
  SITE_URL: "https://www.consultthedead.com",
  getMindContent: mocks.getMindContent,
  isMindSlug: mocks.isMindSlug,
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

function makeMind(overrides: Partial<MindContent> = {}): MindContent {
  return {
    slug: "isaac-newton" as MindSlug,
    h1: "Isaac Newton — The Mind That Demands Proof",
    metaDescription: "Add Isaac Newton to your Council.",
    famousFor: "First-principles demolition of every untested strategic assumption",
    howTheyArgue:
      "Newton argues by demolishing the foundation first. Before engaging with any strategic position, he identifies the inconsistency or missing derivation.",
    sampleQuotes: ["You have described a pattern, not a proof."],
    ctaVariants: ["Add Newton to Your Council →"],
    ...overrides,
  };
}

beforeEach(() => {
  mocks.getMindContent.mockReset();
  mocks.isMindSlug.mockReset();
});

describe("minds share-image routes", () => {
  it("keeps OG and Twitter route metadata aligned", () => {
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(dynamicParams).toBe(false);
    expect(alt).toBe("A mind profile card from Consult The Dead");
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
      { id: "isaac-newton" },
      { id: "marie-curie" },
    ]);
    expect(twitterGenerateStaticParams()).toEqual([
      { id: "isaac-newton" },
      { id: "marie-curie" },
    ]);
  });

  it("renders a generic fallback card when the slug is not recognised", async () => {
    mocks.isMindSlug.mockReturnValue(false);

    const response = await Image({
      params: Promise.resolve({ id: "unknown-mind" }),
    });

    expect(response).toMatchObject({ options: size });
    expect(mocks.getMindContent).not.toHaveBeenCalled();
  });

  it("renders a generic fallback card when getMindContent returns null", async () => {
    mocks.isMindSlug.mockReturnValue(true);
    mocks.getMindContent.mockReturnValue(null);

    const response = await Image({
      params: Promise.resolve({ id: "isaac-newton" }),
    });

    expect(response).toMatchObject({ options: size });
    expect(mocks.getMindContent).toHaveBeenCalledWith("isaac-newton");
  });

  it("renders the mind-specific card for a known slug with a portrait", async () => {
    mocks.isMindSlug.mockReturnValue(true);
    mocks.getMindContent.mockReturnValue(makeMind());

    const response = await Image({
      params: Promise.resolve({ id: "isaac-newton" }),
    });

    expect(response).toMatchObject({ options: size });
    expect(mocks.getMindContent).toHaveBeenCalledWith("isaac-newton");
  });

  it("renders the mind card without portrait for a slug that has no portrait PNG", async () => {
    mocks.isMindSlug.mockReturnValue(true);
    mocks.getMindContent.mockReturnValue(
      makeMind({
        slug: "abraham-lincoln" as MindSlug,
        h1: "Abraham Lincoln — The Great Emancipator",
        famousFor: "Moral clarity under existential pressure",
      }),
    );

    const response = await Image({
      params: Promise.resolve({ id: "abraham-lincoln" }),
    });

    expect(response).toMatchObject({ options: size });
  });

  it("handles long name and long howTheyArgue with truncation", async () => {
    mocks.isMindSlug.mockReturnValue(true);
    mocks.getMindContent.mockReturnValue(
      makeMind({
        h1: "A Very Very Very Long Historical Mind Name That Exceeds Twenty Two Characters — tagline",
        howTheyArgue: "A".repeat(300) + " — strategic insight paragraph.",
      }),
    );

    const response = await Image({
      params: Promise.resolve({ id: "isaac-newton" }),
    });

    expect(response).toMatchObject({ options: size });
  });
});
