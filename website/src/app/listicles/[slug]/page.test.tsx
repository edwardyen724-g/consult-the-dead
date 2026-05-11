import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LISTICLE_SLUGS,
  buildCtaUrl,
  buildListicleShareImageUrl,
  listicleCanonicalUrl,
  loadListicleContent,
} from "@/lib/listicle-content";
import * as listicleContentModule from "@/lib/listicle-content";

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

import {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
  default as ListiclePage,
} from "./page";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

describe("generateStaticParams", () => {
  it("pre-renders all 5 listicle slugs", () => {
    expect(generateStaticParams()).toEqual(
      LISTICLE_SLUGS.map((slug) => ({ slug })),
    );
  });
});

describe("generateMetadata", () => {
  it("emits title, description, canonical, open graph, and twitter metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "startup-pivot" }),
    });

      expect(metadata).toMatchObject({
        title: "Machiavelli vs. Sun Tzu: Should You Pivot Your Startup?",
        description:
          "Two strategic minds with radically different views on when to move, when to hold, and what a pivot actually costs. Run the debate on your startup decision.",
      alternates: {
        canonical: listicleCanonicalUrl("startup-pivot"),
      },
        openGraph: {
          title: "Machiavelli vs. Sun Tzu: Should You Pivot Your Startup?",
          description:
            "Two strategic minds with radically different views on when to move, when to hold, and what a pivot actually costs. Run the debate on your startup decision.",
          url: listicleCanonicalUrl("startup-pivot"),
          type: "article",
          images: [
            buildListicleShareImageUrl("startup-pivot", "opengraph"),
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Machiavelli vs. Sun Tzu: Should You Pivot Your Startup?",
          description:
            "Two strategic minds with radically different views on when to move, when to hold, and what a pivot actually costs. Run the debate on your startup decision.",
          images: [
            buildListicleShareImageUrl("startup-pivot", "twitter"),
          ],
        },
      });
  });

  it("returns a Not Found title for unknown slugs", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
    });

    expect(metadata).toEqual({ title: "Not Found" });
  });

  it("returns a Not Found title when the content loader yields null", async () => {
    const spy = vi
      .spyOn(listicleContentModule, "loadListicleContent")
      .mockReturnValueOnce(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "startup-pivot" }),
    });

    expect(metadata).toEqual({ title: "Not Found" });
    expect(spy).toHaveBeenCalledWith("startup-pivot");
    spy.mockRestore();
  });
});

describe("ListiclePage", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders each shipped listicle with its loaded content and CTA contract", async () => {
    for (const slug of LISTICLE_SLUGS) {
      const content = loadListicleContent(slug);
      expect(content).not.toBeNull();

      const html = renderToStaticMarkup(
        await ListiclePage({ params: Promise.resolve({ slug }) }),
      );

      expect(html).toContain(content!.h1);
      expect(html).toContain("THE RECOMMENDED COUNCIL");
      expect(html).toContain(content!.ctaHeadline);
      expect(html).toContain(content!.ctaButtonLabel);
      expect(html).toContain(escapeText(content!.ctaSubtext));
      for (const paragraph of content!.intro) {
        expect(html).toContain(escapeText(paragraph));
      }
      expect(html).toContain(content!.minds[0].name);
      expect(html).toContain(content!.minds[1].name);
      expect(html).toContain(content!.minds[2].name);
      const expectedHref = escapeHtml(buildCtaUrl(content!));
      expect(html).toContain(`href="${expectedHref}"`);
      expect(html).toContain(listicleCanonicalUrl(slug));
      expect(html).toContain(`"headline":"${content!.h1}"`);
      expect(html).toContain(`"url":"${listicleCanonicalUrl(slug)}"`);
    }
  });

  it("throws the route notFound signal for unknown slugs", async () => {
    await expect(
      ListiclePage({ params: Promise.resolve({ slug: "not-a-real-topic" }) }),
    ).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("throws the route notFound signal when the loader yields null", async () => {
    const spy = vi
      .spyOn(listicleContentModule, "loadListicleContent")
      .mockReturnValueOnce(null);

    await expect(
      ListiclePage({ params: Promise.resolve({ slug: "startup-pivot" }) }),
    ).rejects.toThrow("NOT_FOUND");
    expect(spy).toHaveBeenCalledWith("startup-pivot");
    expect(notFoundMock).toHaveBeenCalled();
  });
});

describe("route contract", () => {
  it("keeps dynamicParams disabled so unknown slugs 404", () => {
    expect(dynamicParams).toBe(false);
  });
});
