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
  failUpdate: false,
}));

const mocks = vi.hoisted(() => ({
  sqlMock: vi.fn(async (strings: TemplateStringsArray) => {
    const query = strings.join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (query.startsWith("with first_agons as")) {
      return { rows: state.candidateRows };
    }

    if (query.startsWith("update agons")) {
      if (state.failUpdate) {
        throw new Error("missing recap_sent_at column");
      }
      return { rows: [] };
    }

    throw new Error(`unexpected query: ${query}`);
  }),
  clerkClientMock: vi.fn(),
  sendFirstAgonRecapMock: vi.fn(async () => undefined),
  resendSendMock: vi.fn(async () => undefined),
  resendCtorMock: vi.fn(),
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

import { getCronSecret, getUtcDayWindow, isAuthorizedCronRequest, runFirstAgonRecapCron } from "./first-agon-recap";

beforeEach(() => {
  state.candidateRows = [];
  state.failUpdate = false;
  mocks.sqlMock.mockClear();
  mocks.clerkClientMock.mockReset();
  mocks.sendFirstAgonRecapMock.mockClear();
  process.env.CRON_SECRET = "cron_test_secret";
});

describe("first-agon recap cron helper", () => {
  it("computes the UTC day window for yesterday and today", () => {
    const window = getUtcDayWindow(new Date("2026-05-09T14:23:00.000Z"));

    expect(window.yesterdayStart.toISOString()).toBe("2026-05-08T00:00:00.000Z");
    expect(window.todayStart.toISOString()).toBe("2026-05-09T00:00:00.000Z");
  });

  it("rejects requests when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;

    const request = new Request("https://example.com/api/cron/first-agon-recap", {
      method: "POST",
      headers: { authorization: "Bearer cron_test_secret" },
    });

    const response = await runFirstAgonRecapCron(request);

    expect(getCronSecret()).toBeNull();
    expect(isAuthorizedCronRequest(request)).toBe(false);
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

    const request = new Request("https://example.com/api/cron/first-agon-recap", {
      method: "POST",
      headers: { authorization: "Bearer cron_test_secret" },
    });

    const response = await runFirstAgonRecapCron(request);

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

    const request = new Request("https://example.com/api/cron/first-agon-recap", {
      method: "POST",
      headers: { authorization: "Bearer cron_test_secret" },
    });

    const response = await runFirstAgonRecapCron(request);

    expect(response.status).toBe(200);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" }),
      expect.objectContaining({ id: "agon_2", recap_sent_at: null }),
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("skips agons that do not have a clerk user id", async () => {
    state.candidateRows = [
      {
        id: "agon_1",
        clerk_user_id: null,
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

    const request = new Request("https://example.com/api/cron/first-agon-recap", {
      method: "POST",
      headers: { authorization: "Bearer cron_test_secret" },
    });

    const response = await runFirstAgonRecapCron(request);

    expect(response.status).toBe(200);
    expect(mocks.sendFirstAgonRecapMock).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ sent: 0, skipped: 1 });
  });

  it("continues when marking recap sent fails because the migration has not landed yet", async () => {
    state.failUpdate = true;
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

    const request = new Request("https://example.com/api/cron/first-agon-recap", {
      method: "POST",
      headers: { authorization: "Bearer cron_test_secret" },
    });

    const response = await runFirstAgonRecapCron(request);

    expect(response.status).toBe(200);
    expect(mocks.sendFirstAgonRecapMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 0 });
  });
});
