import { beforeEach, describe, expect, it, vi } from "vitest";

type AgonRow = {
  id: string;
  clerk_user_id: string | null;
  share_id: string | null;
  topic: string;
  mind_slugs: string[];
  rounds: number;
  turns: unknown;
  consensus: unknown;
  research: string | null;
  created_at: string;
  recap_sent_at: string | null;
};

const state = vi.hoisted(() => ({
  candidateRows: [] as AgonRow[],
}));

const mocks = vi.hoisted(() => ({
  sqlMock: vi.fn(async (strings: TemplateStringsArray) => {
    const query = strings.join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (query.startsWith("with first_agons as")) {
      return { rows: state.candidateRows };
    }

    if (query.startsWith("update agons")) {
      return { rows: [] };
    }

    throw new Error(`unexpected query: ${query}`);
  }),
  clerkClientMock: vi.fn(),
  sendFirstAgonRecapMock: vi.fn(async () => undefined),
}));

vi.mock("@vercel/postgres", () => ({
  sql: mocks.sqlMock,
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: mocks.clerkClientMock,
}));

vi.mock("@/lib/email", () => ({
  sendFirstAgonRecap: mocks.sendFirstAgonRecapMock,
}));

import { POST } from "./route";

function makeRequest(authHeader?: string) {
  return new Request("https://example.com/api/cron/first-agon-recap", {
    method: "POST",
    headers: authHeader ? { authorization: authHeader } : undefined,
  });
}

beforeEach(() => {
  state.candidateRows = [];
  mocks.sqlMock.mockClear();
  mocks.clerkClientMock.mockReset();
  mocks.sendFirstAgonRecapMock.mockClear();
  process.env.CRON_SECRET = "cron_test_secret";
});

describe("/api/cron/first-agon-recap", () => {
  it("rejects requests when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(401);
    expect(mocks.sqlMock).not.toHaveBeenCalled();
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("sends recap emails to eligible users and marks them as sent", async () => {
    state.candidateRows = [
      {
        id: "agon_1",
        clerk_user_id: "user_1",
        share_id: "share_1",
        topic: "Should we launch the product now?",
        mind_slugs: ["steve-jobs"],
        rounds: 3,
        turns: [],
        consensus: null,
        research: null,
        created_at: "2026-05-08T16:00:00.000Z",
        recap_sent_at: null,
      },
      {
        id: "agon_2",
        clerk_user_id: "user_2",
        share_id: "share_2",
        topic: "Should we wait?",
        mind_slugs: ["seneca"],
        rounds: 3,
        turns: [],
        consensus: null,
        research: null,
        created_at: "2026-05-08T18:00:00.000Z",
        recap_sent_at: null,
      },
    ];

    const getUser = vi.fn(async (userId: string) => ({
      id: userId,
      emailAddresses: [{ id: `${userId}_email`, emailAddress: `${userId}@example.com` }],
      primaryEmailAddressId: `${userId}_email`,
      firstName: "Ada",
      lastName: "Lovelace",
      publicMetadata: {},
      privateMetadata: {},
    }));
    mocks.clerkClientMock.mockResolvedValue({
      users: { getUser },
    });

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(getUser).toHaveBeenCalledTimes(2);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledTimes(2);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: "user_1" }),
      expect.objectContaining({ id: "agon_1", recap_sent_at: null }),
    );
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: "user_2" }),
      expect.objectContaining({ id: "agon_2", recap_sent_at: null }),
    );
    await expect(response.json()).resolves.toEqual({ sent: 2, skipped: 0 });
    expect(mocks.sqlMock).toHaveBeenCalledTimes(3);
  });

  it("skips users who have already been recapped", async () => {
    state.candidateRows = [
      {
        id: "agon_1",
        clerk_user_id: "user_1",
        share_id: "share_1",
        topic: "Should we launch the product now?",
        mind_slugs: ["steve-jobs"],
        rounds: 3,
        turns: [],
        consensus: null,
        research: null,
        created_at: "2026-05-08T16:00:00.000Z",
        recap_sent_at: "2026-05-09T08:00:00.000Z",
      },
      {
        id: "agon_2",
        clerk_user_id: "user_2",
        share_id: "share_2",
        topic: "Should we wait?",
        mind_slugs: ["seneca"],
        rounds: 3,
        turns: [],
        consensus: null,
        research: null,
        created_at: "2026-05-08T18:00:00.000Z",
        recap_sent_at: null,
      },
    ];

    const getUser = vi.fn(async (userId: string) => ({
      id: userId,
      emailAddresses: [{ id: `${userId}_email`, emailAddress: `${userId}@example.com` }],
      primaryEmailAddressId: `${userId}_email`,
      firstName: "Ada",
      lastName: "Lovelace",
      publicMetadata: {},
      privateMetadata: {},
    }));
    mocks.clerkClientMock.mockResolvedValue({
      users: { getUser },
    });

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" }),
      expect.objectContaining({ id: "agon_2", recap_sent_at: null }),
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
    expect(getUser).toHaveBeenCalledTimes(1);
  });
});
