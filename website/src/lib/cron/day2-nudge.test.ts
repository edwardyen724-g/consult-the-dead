import { beforeEach, describe, expect, it, vi } from "vitest";

type ClerkUser = {
  id: string;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId: string;
  firstName: string;
  createdAt: number;
};

const state = vi.hoisted(() => ({
  clerkUsers: [] as ClerkUser[],
  emailSendRows: [] as string[], // clerk_user_ids that already received nudge
  agonUserIds: [] as string[], // clerk_user_ids that have agons
  failInsert: false,
  failEmailSendsSelect: false,
}));

const mocks = vi.hoisted(() => ({
  sqlMock: vi.fn(async (strings: TemplateStringsArray | string) => {
    // Handle tagged template calls (sql`...`)
    const query =
      typeof strings === "string"
        ? strings
        : (strings as TemplateStringsArray).join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (query.includes("insert into email_sends")) {
      if (state.failInsert) throw new Error("table email_sends does not exist");
      return { rows: [] };
    }

    return { rows: [] };
  }),
  // sql.query is a regular function call
  sqlQueryMock: vi.fn(async (query: string) => {
    const q = query.toLowerCase();
    if (q.includes("from agons")) {
      return {
        rows: state.agonUserIds.map((id) => ({ clerk_user_id: id })),
      };
    }
    if (q.includes("from email_sends")) {
      if (state.failEmailSendsSelect) {
        throw new Error("relation email_sends does not exist");
      }
      if (state.failInsert) return { rows: [] }; // table not ready
      return {
        rows: state.emailSendRows.map((id) => ({ clerk_user_id: id })),
      };
    }
    return { rows: [] };
  }),
  clerkClientMock: vi.fn(),
  sendDay2NudgeMock: vi.fn(async () => undefined),
}));

vi.mock("@vercel/postgres", () => {
  const sql = Object.assign(
    async (strings: TemplateStringsArray, ...values: unknown[]) =>
      mocks.sqlMock(strings, ...values),
    { query: mocks.sqlQueryMock }
  );
  return { sql };
});

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: mocks.clerkClientMock,
}));

vi.mock("@/lib/email", () => ({
  sendDay2Nudge: mocks.sendDay2NudgeMock,
}));

import { getDay2Window, isAuthorizedCronRequest, runDay2NudgeCron } from "./day2-nudge";

function makeRequest(authHeader?: string) {
  return new Request("https://example.com/api/cron/day2-nudge", {
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
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    ...overrides,
  };
}

beforeEach(() => {
  state.clerkUsers = [];
  state.emailSendRows = [];
  state.agonUserIds = [];
  state.failInsert = false;
  state.failEmailSendsSelect = false;
  mocks.sqlMock.mockClear();
  mocks.sqlQueryMock.mockClear();
  mocks.clerkClientMock.mockReset();
  mocks.sendDay2NudgeMock.mockClear();
  process.env.CRON_SECRET = "cron_test_secret";
});

describe("day2-nudge cron helper", () => {
  it("computes a window that is exactly 48–72 hours before the current UTC midnight", () => {
    const now = new Date("2026-05-11T14:00:00.000Z");
    const { windowStart, windowEnd } = getDay2Window(now);

    expect(windowStart.toISOString()).toBe("2026-05-08T00:00:00.000Z");
    expect(windowEnd.toISOString()).toBe("2026-05-09T00:00:00.000Z");
  });

  it("rejects requests when CRON_SECRET env var is missing", async () => {
    delete process.env.CRON_SECRET;

    const request = makeRequest("Bearer cron_test_secret");
    const response = await runDay2NudgeCron(request);

    expect(isAuthorizedCronRequest(request)).toBe(false);
    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with a wrong bearer token", async () => {
    const response = await runDay2NudgeCron(makeRequest("Bearer wrong_secret"));

    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
  });

  it("returns sent=0 skipped=0 when no users signed up in the day-2 window", async () => {
    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: [] })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ sent: 0, skipped: 0 });
    expect(mocks.sendDay2NudgeMock).not.toHaveBeenCalled();
  });

  it("sends nudge to eligible users who have no agons and have not been nudged", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(2);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_1" })
    );
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" })
    );
    await expect(response.json()).resolves.toEqual({ sent: 2, skipped: 0 });
  });

  it("skips users who already have an agon (active users)", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];
    state.agonUserIds = ["user_1"]; // user_1 already ran a debate

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" })
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
  });

  it("is idempotent: skips users who already received the nudge", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];
    state.emailSendRows = ["user_1"]; // user_1 already got the nudge

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_2" })
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
  });

  it("continues sending when the email_sends insert fails (migration not yet applied)", async () => {
    state.failInsert = true;
    const users = [makeUser("user_1")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 0 });
  });

  it("treats the idempotency check as empty when email_sends table does not exist yet", async () => {
    state.failEmailSendsSelect = true;
    const users = [makeUser("user_1")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await runDay2NudgeCron(makeRequest("Bearer cron_test_secret"));

    // Should still send — missing table is treated as "no prior sends".
    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 0 });
  });
});
