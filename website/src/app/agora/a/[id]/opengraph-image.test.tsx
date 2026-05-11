import { describe, expect, it, vi } from "vitest";

const getPublicAgonByShareIdMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/lib/db/client", () => ({
  db: {
    getPublicAgonByShareId: getPublicAgonByShareIdMock,
  },
}));

import Image, {
  alt,
  contentType,
  revalidate,
  runtime,
  size,
} from "./opengraph-image";

function collectText(node: unknown): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectText);
  if (typeof node === "object" && "props" in node) {
    return collectText((node as { props?: { children?: unknown } }).props?.children);
  }
  return [];
}

describe("Agora opengraph-image", () => {
  it("exports the canonical route metadata", () => {
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(alt).toBe("An agon from Consult The Dead — The Agora");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  it("renders the live share preview copy for a resolved agon", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-1",
      topic: "Should a founder ship faster or research longer?",
      mind_slugs: ["isaac-newton", "marie-curie"],
    });

    const response = await Image({ params: Promise.resolve({ id: "share-1" }) });
    const text = collectText((response as { body: unknown }).body).join(" ");

    expect(response).toMatchObject({ options: size });
    expect(text).toContain("The Agora");
    expect(text).toContain("Council Consensus");
    expect(text).toContain("Should a founder ship faster or research longer?");
    expect(text).toContain("Isaac Newton");
    expect(text).toContain("Marie Curie");
    expect(text).toContain("consultthedead.com");
  });

  it("handles long topics across all font-size tiers", async () => {
    for (const length of [80, 150, 250]) {
      getPublicAgonByShareIdMock.mockResolvedValueOnce({
        share_id: `share-${length}`,
        topic: "x".repeat(length),
        mind_slugs: ["isaac-newton"],
      });

      const response = await Image({
        params: Promise.resolve({ id: `share-${length}` }),
      });
      expect(response).toMatchObject({ options: size });
    }
  });

  it("falls back to the slug-cased mind label when the roster lookup misses", async () => {
    getPublicAgonByShareIdMock.mockResolvedValueOnce({
      share_id: "share-fallback",
      topic: "x".repeat(80),
      mind_slugs: ["mystery-mind"],
    });

    const response = await Image({
      params: Promise.resolve({ id: "share-fallback" }),
    });
    const text = collectText((response as { body: unknown }).body).join(" ");

    expect(text).toContain("Mystery Mind");
  });

  it("falls back to the generic preview when the lookup fails", async () => {
    getPublicAgonByShareIdMock.mockRejectedValueOnce(new Error("boom"));

    const response = await Image({
      params: Promise.resolve({ id: "missing-share" }),
    });
    const text = collectText((response as { body: unknown }).body).join(" ");

    expect(text).toContain("An agon from Consult The Dead");
    expect(text).not.toContain("Council Consensus");
  });
});
