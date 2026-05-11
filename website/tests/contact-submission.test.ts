/**
 * Integration-style regression tests for the contact submission flow.
 *
 * These complement the unit tests in src/app/api/contact/route.test.ts by
 * exercising the route through a minimal end-to-end lens: HTTP-level
 * validation, Discord delivery, and the DB-unavailable fallback path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  dbDown: false,
  ipCount: 0,
  emailCount: 0,
  insertedRows: 0,
  fetchJsonOk: true,
  fetchStatus: 200,
  fetchBody: "",
}));

const mocks = vi.hoisted(() => {
  const queryHandler = async (strings: TemplateStringsArray) => {
    const query = strings.join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (state.dbDown) {
      throw new Error("database unavailable");
    }

    if (
      query.startsWith("begin") ||
      query.startsWith("commit") ||
      query.startsWith("rollback") ||
      query.startsWith("select pg_advisory_xact_lock")
    ) {
      return { rows: [] };
    }

    if (query.startsWith("create table if not exists contact_submissions")) {
      return { rows: [] };
    }

    if (query.startsWith("select count(*)::int as count")) {
      if (query.includes("where ip_address =")) {
        return { rows: [{ count: state.ipCount }] };
      }
      if (query.includes("where email =")) {
        return { rows: [{ count: state.emailCount }] };
      }
    }

    if (query.startsWith("insert into contact_submissions")) {
      state.insertedRows += 1;
      return { rows: [{ id: `contact_${state.insertedRows}` }] };
    }

    if (query.startsWith("update contact_submissions")) {
      return { rows: [] };
    }

    throw new Error(`unexpected query: ${query}`);
  };
  const clientSqlMock = vi.fn(queryHandler);
  const connectMock = vi.fn(async () => ({
    sql: clientSqlMock,
    release: vi.fn(),
  }));

  const sqlMock = vi.fn(queryHandler);
  Object.assign(sqlMock, { connect: connectMock });

  return {
    sqlMock,
    clientSqlMock,
    connectMock,
    fetchMock: vi.fn(async () => ({
      ok: state.fetchJsonOk,
      status: state.fetchStatus,
      text: async () => state.fetchBody,
    })),
  };
});

vi.mock("@vercel/postgres", () => ({
  sql: mocks.sqlMock,
}));

import { __resetContactThrottleForTests, POST } from "@/app/api/contact/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.4",
      "user-agent": "vitest",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", mocks.fetchMock);
  process.env.DISCORD_WEBHOOK_URL = "https://discord.example/webhook";

  state.dbDown = false;
  state.ipCount = 0;
  state.emailCount = 0;
  state.insertedRows = 0;
  state.fetchJsonOk = true;
  state.fetchStatus = 200;
  state.fetchBody = "";

  mocks.sqlMock.mockClear();
  mocks.clientSqlMock.mockClear();
  mocks.connectMock.mockClear();
  mocks.fetchMock.mockClear();
  __resetContactThrottleForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/contact – regression", () => {
  it("rejects malformed JSON and missing fields", async () => {
    const invalidJson = await POST(
      new Request("https://example.com/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{ not valid json",
      }),
    );
    expect(invalidJson.status).toBe(400);
    await expect(invalidJson.json()).resolves.toMatchObject({
      ok: false,
      error: "Invalid request",
    });

    const noFields = await POST(makeRequest({}));
    expect(noFields.status).toBe(400);
    await expect(noFields.json()).resolves.toMatchObject({
      ok: false,
      error: "Missing fields",
    });
  });

  it("persists the submission and delivers to Discord when both are healthy", async () => {
    const response = await POST(
      makeRequest({
        name: "Ada Lovelace",
        email: "ada@example.com",
        decision: "Ship the analytical engine.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(mocks.fetchMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      stored: true,
      delivered: true,
    });
  });

  it("falls back to in-memory throttle and delivers to Discord when the DB is down", async () => {
    state.dbDown = true;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "The DB is down but Discord should still receive this.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(0);
    expect(mocks.fetchMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      stored: false,
      delivered: true,
    });
  });

  it("returns 503 when both DB and Discord are unavailable", async () => {
    state.dbDown = true;
    delete process.env.DISCORD_WEBHOOK_URL;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "Nothing should work here.",
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
  });
});
