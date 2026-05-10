import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import OpenGraphImage from "./opengraph-image";
import TwitterImage from "./twitter-image";
import {
  FrameworkPreviewCard,
  getFrameworkPreviewData,
} from "./preview-image";

const ImageResponseMock = vi.hoisted(() => {
  class MockImageResponse {
    element: unknown;
    options: unknown;

    constructor(element: unknown, options: unknown) {
      this.element = element;
      this.options = options;
    }
  }

  return { MockImageResponse };
});

vi.mock("next/og", () => ({
  ImageResponse: ImageResponseMock.MockImageResponse,
}));

describe("framework preview image helpers", () => {
  it("returns preview data for a live slug and null for an invalid one", () => {
    const data = getFrameworkPreviewData("isaac-newton");

    expect(data).not.toBeNull();
    expect(data?.slug).toBe("isaac-newton");
    expect(data?.person).toContain("Isaac");
    expect(data?.domain.length).toBeGreaterThan(0);
    expect(data?.constructCount).toBeGreaterThan(0);
    expect(getFrameworkPreviewData("not-a-framework")).toBeNull();
  });

  it("renders the preview card with the framework stats and mode label", () => {
    const data = getFrameworkPreviewData("isaac-newton");
    expect(data).not.toBeNull();

    const html = renderToStaticMarkup(
      FrameworkPreviewCard({ data: data!, mode: "opengraph" }),
    );

    expect(html).toContain("Consult The Dead");
    expect(html).toContain("Open Graph image");
    expect(html).toContain(data!.person);
    expect(html).toContain(data!.domain);
    expect(html).toContain(String(data!.constructCount));
    expect(html).toContain(String(data!.incidentCount));
  });

  it("returns an ImageResponse for both route handlers", async () => {
    const og = await OpenGraphImage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });
    const twitter = await TwitterImage({
      params: Promise.resolve({ slug: "isaac-newton" }),
    });

    expect(og).toBeInstanceOf(ImageResponseMock.MockImageResponse);
    expect(twitter).toBeInstanceOf(ImageResponseMock.MockImageResponse);
    expect((og as InstanceType<typeof ImageResponseMock.MockImageResponse>).options).toEqual({
      width: 1200,
      height: 630,
    });
    expect((twitter as InstanceType<typeof ImageResponseMock.MockImageResponse>).options).toEqual({
      width: 1200,
      height: 630,
    });
    expect(
      renderToStaticMarkup(
        (og as InstanceType<typeof ImageResponseMock.MockImageResponse>).element as ReactElement,
      ),
    ).toContain("Open Graph image");
    expect(
      renderToStaticMarkup(
        (twitter as InstanceType<typeof ImageResponseMock.MockImageResponse>).element as ReactElement,
      ),
    ).toContain("Twitter card image");
  });

  it("returns 404 responses for unknown slugs", async () => {
    const og = await OpenGraphImage({
      params: Promise.resolve({ slug: "not-a-framework" }),
    });
    const twitter = await TwitterImage({
      params: Promise.resolve({ slug: "not-a-framework" }),
    });

    expect(og).toBeInstanceOf(Response);
    expect(twitter).toBeInstanceOf(Response);
    expect((og as Response).status).toBe(404);
    expect((twitter as Response).status).toBe(404);
  });
});
