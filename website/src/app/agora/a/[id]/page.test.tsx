import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const getPublicAgonByShareIdMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NOT_FOUND");
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

vi.mock("@/lib/db/client", () => ({
  db: {
    getPublicAgonByShareId: getPublicAgonByShareIdMock,
  },
}));

vi.mock("@/components/ShareCtaStrip", () => ({
  ShareCtaStyles: () => null,
  ShareCtaStrip: ({ variant }: { variant: string }) => (
    <div data-testid={`cta-${variant}`} />
  ),
}));

import {
  default as PublicAgonPage,
  generateMetadata,
} from "./page";
import { buildShareDescription } from "./lib";

describe("Agora public share metadata", () => {
  it("emits canonical social metadata and explicit indexability for a live share", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-1",
      topic: "Should a founder ship faster or research longer?",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "share-1" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toMatchObject({
      title: "Agon: Should a founder ship faster or research longer?",
      description: buildShareDescription(
        "Should a founder ship faster or research longer?",
      ),
      alternates: {
        canonical: "https://www.consultthedead.com/agora/a/share-1",
      },
      robots: { index: true, follow: true },
      openGraph: {
        title: "Agon: Should a founder ship faster or research longer?",
        description: buildShareDescription(
          "Should a founder ship faster or research longer?",
        ),
        url: "https://www.consultthedead.com/agora/a/share-1",
        type: "article",
        siteName: "Consult The Dead",
        images: [
          "https://www.consultthedead.com/agora/a/share-1/opengraph-image",
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Agon: Should a founder ship faster or research longer?",
        description: buildShareDescription(
          "Should a founder ship faster or research longer?",
        ),
        images: [
          "https://www.consultthedead.com/agora/a/share-1/opengraph-image",
        ],
      },
    });
  });

  it("falls back to a noindex not-found contract when the share cannot be resolved", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing-share" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({
      title: "Agon not found · Consult The Dead",
      robots: { index: false, follow: false },
    });
  });

  it("truncates long topics and preserves the canonical preview contract", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-2",
      topic:
        "This is a deliberately long topic string that pushes the title past the truncation boundary so the ellipsis branch stays covered in CI.",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "share-2" }),
      searchParams: Promise.resolve({}),
    });

    expect(String(metadata.title)).toContain("Agon: This is a deliberately long topic string");
    expect(String(metadata.title)).toContain("…");
  });

  it("falls back to noindex metadata when the agon lookup throws", async () => {
    getPublicAgonByShareIdMock.mockRejectedValueOnce(new Error("boom"));

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "boom-share" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({
      title: "Agon not found · Consult The Dead",
      robots: { index: false, follow: false },
    });
  });
});

describe("Agora public share page", () => {
  it("renders the full public share surface for a resolved agon", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-1",
      topic: "Should a founder ship faster or research longer?",
      mind_slugs: ["isaac-newton", "marie-curie"],
      rounds: 2,
      turns: [
        {
          mindSlug: "isaac-newton",
          mindName: "Isaac Newton",
          round: 1,
          text: "Measure the tradeoff.",
        },
        {
          mindSlug: "marie-curie",
          mindName: "Marie Curie",
          round: 1,
          text: "Collect more evidence.",
        },
      ],
      consensus: {
        points: "Research helps if the decision is irreversible.",
        tensions: "Speed still matters.",
        action: "Set a short decision deadline.",
        steps: ["List the missing facts.", "Decide by Friday."],
        risks: "Analysis paralysis.",
      },
      research: JSON.stringify({
        summary: "Brief research summary.",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      }),
    });

    const html = renderToStaticMarkup(
      await PublicAgonPage({
        params: Promise.resolve({ id: "share-1" }),
        searchParams: Promise.resolve({
          utm_campaign: "launch",
          utm_content: "hero",
        }),
      }),
    );

    expect(html).toContain("The Agora · Public Transcript");
    expect(html).toContain("The Question");
    expect(html).toContain("Council");
    expect(html).toContain("Research Brief");
    expect(html).toContain("Source A");
    expect(html).toContain("Council Consensus");
    expect(html).toContain("Generated by");
    expect(html).toContain(
      'href="/agora?utm_campaign=launch&amp;utm_content=hero"',
    );
    expect(html).toContain("Run your own agon →");
    expect(html).toContain("Consult The Dead — The Agora");
    expect(html).toContain("Measure the tradeoff.");
    expect(html).toContain("Set a short decision deadline.");
  });

  it("renders fallback mind metadata for stale slugs without crashing", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-3",
      topic: "Should a founder ship faster or research longer?",
      mind_slugs: ["unknown-mind"],
      turns: [],
      rounds: 0,
      consensus: null,
      research: null,
    });

    const html = renderToStaticMarkup(
      await PublicAgonPage({
        params: Promise.resolve({ id: "share-3" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(html).toContain("Unknown Mind");
  });

  it("raises the route notFound signal when the share is missing", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce(null);

    await expect(
      PublicAgonPage({
        params: Promise.resolve({ id: "missing-share" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
