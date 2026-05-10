import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import * as frameworkModule from "@/lib/frameworks";
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

const loadFrameworkImageHandlers = async () =>
  Promise.all([import("./opengraph-image"), import("./twitter-image")]);

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

  it("returns null when the framework record cannot be resolved", () => {
    const spy = vi.spyOn(frameworkModule, "getFramework").mockReturnValue(null);

    expect(getFrameworkPreviewData("isaac-newton")).toBeNull();

    spy.mockRestore();
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

  it("truncates long statement copy in the rendered preview card", () => {
    const data = getFrameworkPreviewData("isaac-newton");
    expect(data).not.toBeNull();

    const html = renderToStaticMarkup(
      FrameworkPreviewCard({
        data: {
          ...data!,
          statement:
            "A".repeat(220) +
            " This intentionally exceeds the card copy limit so the truncation branch runs.",
        },
        mode: "twitter",
      }),
    );

    expect(html).toContain("Twitter card image");
    expect(html).toContain("A".repeat(220).slice(0, 150));
    expect(html).toContain("…");
  });

  it("renders short statement copy without truncation and falls back for empty text", () => {
    const data = getFrameworkPreviewData("isaac-newton");
    expect(data).not.toBeNull();

    const shortHtml = renderToStaticMarkup(
      FrameworkPreviewCard({
        data: {
          ...data!,
          statement: "Brief",
        },
        mode: "opengraph",
      }),
    );
    const fallbackHtml = renderToStaticMarkup(
      FrameworkPreviewCard({
        data: {
          ...data!,
          statement: "",
        },
        mode: "opengraph",
      }),
    );

    expect(shortHtml).toContain("Brief");
    expect(shortHtml).not.toContain("…");
    expect(fallbackHtml).toContain(
      "Decision framework extracted from documented historical incidents, not a persona clone.",
    );
  });

  it("returns an ImageResponse for both route handlers", async () => {
    const [{ default: OpenGraphImage }, { default: TwitterImage }] =
      await loadFrameworkImageHandlers();

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
    const [{ default: OpenGraphImage }, { default: TwitterImage }] =
      await loadFrameworkImageHandlers();

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
