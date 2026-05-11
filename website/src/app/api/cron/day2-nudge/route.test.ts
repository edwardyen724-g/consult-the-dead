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
  emailSendRows: [] as string[],
  agonUserIds: [] as string[],
  failInsert: false,
}));

const mocks = vi.hoisted(() => ({
  sqlMock: vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    void values;
    const query = (strings as TemplateStringsArray)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (query.includes("insert into email_sends")) {
      if (state.failInsert) throw new Error("table email_sends does not exist");
      return { rows: [] };
    }

    return { rows: [] };
  }),
  sqlQueryMock: vi.fn(async (query: string) => {
    const q = query.toLowerCase();
    if (q.includes("from agons")) {
      return {
        rows: state.agonUserIds.map((id) => ({ clerk_user_id: id })),
      };
    }
    if (q.includes("from email_sends")) {
      if (state.failInsert) return { rows: [] };
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

import { GET, POST, DAY2_NUDGE_CRON_CONTRACT } from "./route";

function makeRequest(authHeader?: string) {
  return new Request("https://example.com/api/cron/day2-nudge", {
    method: "POST",
    headers: authHeader ? { authorization: authHeader } : undefined,
  });
}

function makeUser(id: string): ClerkUser {
  return {
    id,
    emailAddresses: [{ id: `${id}_email`, emailAddress: `${id}@example.com` }],
    primaryEmailAddressId: `${id}_email`,
    firstName: "Ada",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  };
}

beforeEach(() => {
  state.clerkUsers = [];
  state.emailSendRows = [];
  state.agonUserIds = [];
  state.failInsert = false;
  mocks.sqlMock.mockClear();
  mocks.sqlQueryMock.mockClear();
  mocks.clerkClientMock.mockReset();
  mocks.sendDay2NudgeMock.mockClear();
  process.env.CRON_SECRET = "cron_test_secret";
});

describe("/api/cron/day2-nudge GET", () => {
  it("returns the canonical contract JSON with no-store caching", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual(DAY2_NUDGE_CRON_CONTRACT);
  });
});

describe("/api/cron/day2-nudge POST", () => {
  it("rejects requests when CRON_SECRET is missing (401)", async () => {
    delete process.env.CRON_SECRET;

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with an incorrect bearer token (401)", async () => {
    const response = await POST(makeRequest("Bearer wrong_secret"));

    expect(response.status).toBe(401);
    expect(mocks.clerkClientMock).not.toHaveBeenCalled();
  });

  it("sends nudge emails to eligible users and returns { sent, skipped }", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(2);
    await expect(response.json()).resolves.toEqual({ sent: 2, skipped: 0 });
  });

  it("is idempotent: skips users who already received the nudge", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];
    state.emailSendRows = ["user_1"];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
  });

  it("skips users who already have an agon (active users don't need nudge)", async () => {
    const users = [makeUser("user_1"), makeUser("user_2")];
    state.agonUserIds = ["user_2"];

    mocks.clerkClientMock.mockResolvedValue({
      users: {
        getUserList: vi.fn(async () => ({ data: users })),
      },
    });

    const response = await POST(makeRequest("Bearer cron_test_secret"));

    expect(response.status).toBe(200);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledTimes(1);
    expect(mocks.sendDay2NudgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_1" })
    );
    await expect(response.json()).resolves.toEqual({ sent: 1, skipped: 1 });
  });
});
