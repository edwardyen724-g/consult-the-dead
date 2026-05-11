import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

const { imageResponseMock } = vi.hoisted(() => ({
  imageResponseMock: vi.fn(function ImageResponse(
    this: unknown,
    element: unknown,
    init: unknown,
  ) {
    return { element, init };
  }),
}));

vi.mock("next/og", () => ({
  ImageResponse: imageResponseMock,
}));

import Image, {
  alt,
  contentType,
  revalidate,
  runtime,
  size,
} from "./opengraph-image";
import * as twitterImage from "./twitter-image";

describe("opengraph-image route", () => {
  it("renders the title, council cue, and CTA composition for a shipped listicle", async () => {
    const response = await Image({
      params: Promise.resolve({ slug: "startup-pivot" }),
    });
    const html = renderToStaticMarkup((response as { element: ReactElement }).element);

    expect(imageResponseMock).toHaveBeenCalled();
    expect(html).toContain(
      "Machiavelli vs. Sun Tzu: Should You Pivot Your Startup?",
    );
    expect(html).toContain("Council cue");
    expect(html).toContain("Niccolò Machiavelli · Sun Tzu · Isaac Newton");
    expect(html).toContain("Continue this debate on your actual startup decision");
    expect(html).toContain("Run this debate in the Agora");
    expect(html).toContain("Free. No signup required for your first 3 debates.");
  });

  it("falls back to slug-derived copy when the content file is missing", async () => {
    const response = await Image({
      params: Promise.resolve({ slug: "mystery-topic" }),
    });
    const html = renderToStaticMarkup((response as { element: ReactElement }).element);

    expect(html).toContain("Mystery Topic");
    expect(html).toContain("Recommended council");
    expect(html).toContain("Open in Agora →");
  });

  it("exports the expected route contract", () => {
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(contentType).toBe("image/png");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(alt).toContain("listicle share card");
  });
});

describe("twitter-image route", () => {
  it("reuses the Open Graph image implementation and static config", () => {
    expect(twitterImage.runtime).toBe("nodejs");
    expect(twitterImage.revalidate).toBe(3600);
    expect(twitterImage.contentType).toBe("image/png");
    expect(twitterImage.size).toEqual({ width: 1200, height: 630 });
    expect(twitterImage.alt).toContain("listicle share card");
  });
});
