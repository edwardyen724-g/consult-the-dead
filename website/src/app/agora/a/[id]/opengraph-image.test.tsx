import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicAgonByShareIdMock } = vi.hoisted(() => ({
  getPublicAgonByShareIdMock: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    getPublicAgonByShareId: getPublicAgonByShareIdMock,
  },
}));

import OpenGraphImage from "./opengraph-image";
import TwitterImage from "./twitter-image";

const sampleAgon = {
  id: "agon-1",
  share_id: "share-123",
  topic: 'Should "truth" or "persuasion" win the council?',
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

async function assertImageRoute(
  handler: typeof OpenGraphImage,
  id = "share-123",
) {
  getPublicAgonByShareIdMock.mockResolvedValue(sampleAgon);

  const response = await handler({
    params: Promise.resolve({ id }),
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("image/png");
  expect(getPublicAgonByShareIdMock).toHaveBeenCalledWith(id);
  const bytes = await response.arrayBuffer();
  expect(bytes.byteLength).toBeGreaterThan(0);
}

describe("/agora/a/[id] share preview images", () => {
  it("renders the opengraph preview for a topic with quoted text", async () => {
    await assertImageRoute(OpenGraphImage);
  });

  it("renders the twitter preview for a topic with quoted text", async () => {
    await assertImageRoute(TwitterImage);
  });

  it("falls back to the generic image when the public share lookup misses", async () => {
    getPublicAgonByShareIdMock.mockResolvedValue(null);

    const response = await OpenGraphImage({
      params: Promise.resolve({ id: "missing-share" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(getPublicAgonByShareIdMock).toHaveBeenCalledWith("missing-share");
    const bytes = await response.arrayBuffer();
    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
