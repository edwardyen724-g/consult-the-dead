import { beforeEach, describe, expect, it, vi } from "vitest";

type ClerkUser = {
  id: string;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId: string;
  firstName: string;
};

const mocks = vi.hoisted(() => ({
  clerkClientMock: vi.fn(),
  sendWeeklyDigestMock: vi.fn(async () => undefined),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: mocks.clerkClientMock,
}));

vi.mock("@/lib/email", () => ({
  sendWeeklyDigest: mocks.sendWeeklyDigestMock,
}));

import {
  getDigestConfig,
  isAuthorizedCronRequest,
  runWeeklyDigestCron,
} from "./weekly-digest";

function makeRequest(authHeader?: string) {
  return new Request("https://example.com/api/cron/weekly-digest", {
    method: "POST",
    headers: authHeader ? { authorization: authHeader } : undefined,
  });
}

function makeUser(id: string, overrides: Partial<ClerkUser> = {}): ClerkUser {
  return {
    id,
    emailAddresses: [{ id: `${id}_email`, emailAddress: `${id}@example.com` }],
    primaryEmailAddressId: `${id}_email`,
    firstName: "Ada",
    ...overrides,
  };
}

beforeEach(() => {
  mocks.clerkClientMock.mockReset();
  mocks.sendWeeklyDigestMock.mockClear();
  process.env.CRON_SECRET = "cron_test_secret";
  process.env.FEATURED_AGON_TOPIC = "Should we pivot to B2B?";
  process.env.FEATURED_AGON_CONSENSUS = "The council is divided: Machiavelli says yes, Newton says stay the course.";
  process.env.FEATURED_AGON_SHARE_ID = "abc123";
  delete process.env.NEW_MIND_NAME;
  delete process.env.NEW_MIND_TAGLINE;
  delete process.env.NEW_MIND_HOW_ARGUES;
});

describe("weekly-digest cron helper", () => {
  describe("getDigestConfig", () => {
    it("returns the config when all required env vars are set", () => {
      const config = getDigestConfig();
      expect(config).toEqual({
        featuredTopic: "Should we pivot to B2B?",
        featuredConsensus: "The council is divided: Machiavelli says yes, Newton says stay the course.",
        featuredShareId: "abc123",
        newMindName: null,
        newMindTagline: null,
        newMindHowArgues: null,
      });
    });

    it("includes new mind fields when env vars are set", () => {
      process.env.NEW_MIND_NAME = "Marcus Aurelius";
      process.env.NEW_MIND_TAGLINE = "Stoic emperor";
      process.env.NEW_MIND_HOW_ARGUES = "Argues from virtue, duty, and endurance.";

      const config = getDigestConfig();
      expect(config).toMatchObject({
        newMindName: "Marcus Aurelius",
        newMindTagline: "Stoic emperor",
        newMindHowArgues: "Argues from virtue, duty, and endurance.",
      });
    });

    it("returns null when FEATURED_AGON_TOPIC is missing", () => {
      delete process.env.FEATURED_AGON_TOPIC;
      expect(getDigestConfig()).toBeNull();
    });

    it("returns null when FEATURED_AGON_CONSENSUS is missing", () => {
      delete process.env.FEATURED_AGON_CONSENSUS;
      expect(getDigestConfig()).toBeNull();
    });

    it("returns null when FEATURED_AGON_SHARE_ID is missing", () => {
      delete process.env.FEATURED_AGON_SHARE_ID;
      expect(getDigestConfig()).toBeNull();
    });
  });

  it("rejects requests when CRON_SECRET env var is missing", async () => {
    delete process.env.CRON_SECRET;

    const request = makeRequest("Bearer cron_test_secret");
    const response = await runWeeklyDigestCron(request);

    expect(isAuthorizedCronRequest(request)).toBe(false);
    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with a wrong bearer token", async () => {
    const response = await runWeeklyDigestCron(makeRequest("Bearer wrong_secret"));

    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
  });

  it("returns 500 when required digest env vars are missing", async () => {
    delete process.env.FEATURED_AGON_TOPIC;

    const response = await runWeeklyDigestCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(500);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.error).toMatch(/FEATURED_AGON_TOPIC/);
  });

  it("sends digest to all users with an email address", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runWeeklyDigestCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledTimes(2);
    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_1" }),
      expect.objectContaining({ featuredTopic: "Should we pivot to B2B?" })
    );
    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" }),
      expect.objectContaining({ featuredShareId: "abc123" })
    );
    await expect(response.json()).resolves.toEqual({ sent: 2, skipped: 0 });
  });

  it("skips users who have no email address", async () => {
    const users: ClerkUser[] = [
      makeUser("user_1"),
      {
        id: "user_2",
        emailAddresses: [],
        primaryEmailAddressId: "",
        firstName: "Anon",
      },
    ];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runWeeklyDigestCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_1" }),
      expect.anything()
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
  });

  it("returns sent=0 skipped=0 when no users exist", async () => {
    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: [] })),
      },
    });

    const response = await runWeeklyDigestCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ sent: 0, skipped: 0 });
    expect(mocks.sendWeeklyDigestMock).not.toHaveBeenCalled();
  });

  it("passes new mind details to sendWeeklyDigest when env vars are set", async () => {
    process.env.NEW_MIND_NAME = "Marcus Aurelius";
    process.env.NEW_MIND_TAGLINE = "Stoic emperor";

    const users = [makeUser("user_1")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    await runWeeklyDigestCron(makeRequest("Bearer cron_test_secret"));

    expect(mocks.sendWeeklyDigestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        newMindName: "Marcus Aurelius",
        newMindTagline: "Stoic emperor",
      })
    );
  });
});
