/**
 * Regression tests for /essay/twitter-image.
 *
 * Verifies that the Twitter card re-exports the same Image component as the
 * Open Graph image and that all route-metadata exports stay byte-for-byte
 * aligned with the canonical OG image route.
 */
import { describe, expect, it, vi } from "vitest";

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
  runtime as ogRuntime,
  size as ogSize,
} from "./opengraph-image";

import TwitterImage, {
  alt,
  contentType,
  runtime,
  size,
} from "./twitter-image";

describe("essay twitter-image", () => {
  it("re-exports the same default Image function as opengraph-image", () => {
    expect(TwitterImage).toBe(OGImage);
  });

  it("exports the canonical route metadata", () => {
    expect(runtime).toBe("nodejs");
    expect(alt).toBe(
      "Consulting the Dead, Not Distilling the Living — Consult The Dead",
    );
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  it("keeps all metadata aligned with the OG image route", () => {
    expect(runtime).toBe(ogRuntime);
    expect(alt).toBe(ogAlt);
    expect(size).toEqual(ogSize);
    expect(contentType).toBe(ogContentType);
  });
});
