import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildShareDescription } from "./lib";
import { generateMetadata } from "./page";

const { getPublicAgonByShareIdMock } = vi.hoisted(() => ({
  getPublicAgonByShareIdMock: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getPublicAgonByShareId: getPublicAgonByShareIdMock,
  },
}));

const sampleAgon = {
  id: "agon-1",
  share_id: "share-123",
  topic: "Should the council privilege persuasion over truth?",
  mind_slugs: ["cicero", "epictetus"],
  rounds: 2,
  turns: [],
  consensus: null,
  research: null,
  created_at: "2026-05-10T10:00:00.000Z",
};

beforeEach(() => {
  getPublicAgonByShareIdMock.mockReset();
});

describe("/agora/a/[id] metadata", () => {
  it("advertises the canonical share URL and route-scoped preview images", async () => {
    getPublicAgonByShareIdMock.mockResolvedValue(sampleAgon);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "share-123" }),
      searchParams: Promise.resolve({}),
    });

    const title = "Agon: Should the council privilege persuasion over truth?";
    const description = buildShareDescription(sampleAgon.topic);

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBe(description);
    expect(metadata.alternates?.canonical).toBe(
      "https://www.consultthedead.com/agora/a/share-123",
    );
    expect(metadata.openGraph).toEqual({
      title,
      description,
      url: "https://www.consultthedead.com/agora/a/share-123",
      type: "article",
      siteName: "Consult The Dead",
      images: ["/agora/a/share-123/opengraph-image"],
    });
    expect(metadata.twitter).toEqual({
      card: "summary_large_image",
      title,
      description,
      images: ["/agora/a/share-123/twitter-image"],
    });
  });

  it("falls back to the generic metadata contract when lookup returns nothing", async () => {
    getPublicAgonByShareIdMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing-share" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Agon not found · Consult The Dead");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toBeFalsy();
    expect(metadata.twitter).toBeFalsy();
    expect(metadata.alternates).toBeFalsy();
  });

  it("falls back to the generic metadata contract when lookup throws", async () => {
    getPublicAgonByShareIdMock.mockRejectedValueOnce(new Error("db down"));

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "share-123" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Agon not found · Consult The Dead");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toBeFalsy();
    expect(metadata.twitter).toBeFalsy();
    expect(metadata.alternates).toBeFalsy();
  });
});
