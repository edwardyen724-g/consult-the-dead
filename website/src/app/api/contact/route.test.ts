import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  dbDown: false,
  ipCount: 0,
  emailCount: 0,
  insertedRows: 0,
  updatedRows: 0,
  fetchStatus: 200,
  fetchBody: "",
  fetchJsonOk: true,
  fetchTextThrows: false,
  missingIpCountRow: false,
  missingEmailCountRow: false,
  missingInsertId: false,
}));

const mocks = vi.hoisted(() => ({
  sqlMock: vi.fn(async (strings: TemplateStringsArray) => {
    const query = strings.join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (state.dbDown) {
      throw new Error("database unavailable");
    }

    if (query.startsWith("create table if not exists contact_submissions")) {
      return { rows: [] };
    }

    if (query.startsWith("select count(*)::int as count")) {
      if (query.includes("where ip_address =")) {
        if (state.missingIpCountRow) {
          return { rows: [] };
        }
        return { rows: [{ count: state.ipCount }] };
      }
      if (query.includes("where email =")) {
        if (state.missingEmailCountRow) {
          return { rows: [] };
        }
        return { rows: [{ count: state.emailCount }] };
      }
    }

    if (query.startsWith("insert into contact_submissions")) {
      state.insertedRows += 1;
      if (state.missingInsertId) {
        return { rows: [{}] };
      }
      return { rows: [{ id: `contact_${state.insertedRows}` }] };
    }

    if (query.startsWith("update contact_submissions")) {
      state.updatedRows += 1;
      return { rows: [] };
    }

    throw new Error(`unexpected query: ${query}`);
  }),
  fetchMock: vi.fn(async () => ({
    ok: state.fetchJsonOk,
    status: state.fetchStatus,
    text: async () => {
      if (state.fetchTextThrows) {
        throw new Error("response body unavailable");
      }

      return state.fetchBody;
    },
  })),
}));

vi.mock("@vercel/postgres", () => ({
  sql: mocks.sqlMock,
}));

import { __resetContactThrottleForTests, POST } from "./route";

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
  includeForwardedFor = true,
) {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "vitest",
      ...(includeForwardedFor ? { "x-forwarded-for": "203.0.113.4" } : {}),
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
  state.updatedRows = 0;
  state.fetchStatus = 200;
  state.fetchBody = "";
  state.fetchJsonOk = true;
  state.fetchTextThrows = false;
  state.missingIpCountRow = false;
  state.missingEmailCountRow = false;
  state.missingInsertId = false;

  mocks.sqlMock.mockClear();
  mocks.fetchMock.mockClear();
  __resetContactThrottleForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("POST /api/contact", () => {
  it("rejects malformed JSON bodies before validation", async () => {
    const response = await POST(
      new Request("https://example.com/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "{ not valid json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid request",
    });
  });

  it("rejects missing fields and invalid email inputs", async () => {
    const missingFields = await POST(makeRequest({ name: "Ada" }));
    expect(missingFields.status).toBe(400);
    await expect(missingFields.json()).resolves.toEqual({
      ok: false,
      error: "Missing fields",
    });

    const invalidEmail = await POST(
      makeRequest({
        name: "Ada",
        email: "not-an-email",
        decision: "I need the council.",
      }),
    );
    expect(invalidEmail.status).toBe(400);
    await expect(invalidEmail.json()).resolves.toEqual({
      ok: false,
      error: "Invalid email",
    });
  });

  it("returns the email-specific throttle message once the email quota is exhausted", async () => {
    state.ipCount = 0;
    state.emailCount = 3;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "The same inbox should wait before trying again.",
      }),
    );

    expect(response.status).toBe(429);
    expect(mocks.fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        "That email has already been used for several recent contact requests. Please wait before trying again.",
    });
  });

  it("uses fallback client IP headers when x-forwarded-for is absent", async () => {
    delete process.env.DISCORD_WEBHOOK_URL;

    const realIpResponse = await POST(
      makeRequest(
        {
          name: "Ada",
          email: "real@example.com",
          decision: "The real-ip header should be accepted.",
        },
        { "x-real-ip": "198.51.100.10" },
        false,
      ),
    );

    expect(realIpResponse.status).toBe(200);

    const cfIpResponse = await POST(
      makeRequest(
        {
          name: "Ada",
          email: "cf@example.com",
          decision: "The cf-connecting-ip header should also be accepted.",
        },
        { "cf-connecting-ip": "198.51.100.11" },
        false,
      ),
    );

    expect(cfIpResponse.status).toBe(200);

    const unknownIpResponse = await POST(
      new Request("https://example.com/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "vitest",
        },
        body: JSON.stringify({
          name: "Ada",
          email: "unknown@example.com",
          decision: "Unknown should be the final fallback.",
        }),
      }),
    );

    expect(unknownIpResponse.status).toBe(200);
    expect(state.insertedRows).toBe(3);
    expect(state.updatedRows).toBe(3);
    expect(mocks.fetchMock).not.toHaveBeenCalled();
  });

  it("handles blank forwarded IPs and missing database rows without losing the lead", async () => {
    state.missingIpCountRow = true;
    state.missingEmailCountRow = true;
    state.missingInsertId = true;
    delete process.env.DISCORD_WEBHOOK_URL;

    const response = await POST(
      new Request("https://example.com/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": ", 203.0.113.4",
          "x-real-ip": "198.51.100.12",
        },
        body: JSON.stringify({
          name: "Ada",
          email: "missing-rows@example.com",
          decision: "The route should survive empty SQL result rows.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(0);
    expect(mocks.fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("uses the database-backed throttle and returns 429 once the IP quota is exhausted", async () => {
    state.ipCount = 5;
    state.emailCount = 0;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "The team should wait one more week.",
      }),
    );

    expect(response.status).toBe(429);
    expect(mocks.fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "You're sending contact requests too quickly. Please wait a bit and try again.",
    });
  });

  it("persists the submission and delivers it to Discord when both sinks are healthy", async () => {
    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "Ship the thing.",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.fetchMock).toHaveBeenCalledTimes(1);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: true,
    });
  });

  it("keeps the lead when Discord is unavailable and returns a warning response", async () => {
    state.fetchJsonOk = false;
    state.fetchStatus = 503;
    state.fetchBody = "discord down";

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "Keep the fallback durable.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("stores the submission and warns when the webhook is missing", async () => {
    delete process.env.DISCORD_WEBHOOK_URL;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "Keep the lead even without Discord.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    expect(mocks.fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("keeps the lead when the Discord response body cannot be read", async () => {
    state.fetchJsonOk = false;
    state.fetchStatus = 500;
    state.fetchTextThrows = true;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "broken-body@example.com",
        decision: "The route should survive a body read failure.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("keeps the lead when Discord aborts after the timeout window", async () => {
    vi.useFakeTimers();
    mocks.fetchMock.mockImplementationOnce((_webhook, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      });
    });

    const responsePromise = POST(
      makeRequest({
        name: "Ada",
        email: "timeout@example.com",
        decision: "The route should time out cleanly.",
      }),
    );

    await vi.advanceTimersByTimeAsync(5_000);
    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("keeps the lead when Discord fetch throws outright", async () => {
    mocks.fetchMock.mockImplementationOnce(async () => {
      throw new Error("boom");
    });

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "throw@example.com",
        decision: "The route should handle thrown fetch errors.",
      }),
    );

    expect(response.status).toBe(200);
    expect(state.insertedRows).toBe(1);
    expect(state.updatedRows).toBe(1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      delivered: false,
      warning: "Your message was saved, but Discord delivery is currently unavailable.",
    });
  });

  it("falls back to the in-memory throttle when the database is unavailable", async () => {
    state.dbDown = true;
    state.fetchJsonOk = true;

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(
        makeRequest(
          {
            name: "Ada",
            email: `ada${i}@example.com`,
            decision: "The route should still accept this one.",
          },
          { "x-forwarded-for": "203.0.113.9" },
        ),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        ok: true,
        stored: false,
        delivered: true,
      });
    }

    const throttled = await POST(
      makeRequest(
        {
          name: "Ada",
          email: "ada5@example.com",
          decision: "This should trip the local fallback throttle.",
        },
        { "x-forwarded-for": "203.0.113.9" },
      ),
    );

    expect(throttled.status).toBe(429);
    await expect(throttled.json()).resolves.toEqual({
      ok: false,
      error: "You're sending contact requests too quickly. Please wait a bit and try again.",
    });
  });

  it("returns a hard failure when both storage and Discord delivery are unavailable", async () => {
    state.dbDown = true;
    delete process.env.DISCORD_WEBHOOK_URL;

    const response = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        decision: "No sink is healthy.",
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        "We could not save your message right now. Please email us directly and try again later.",
    });
  });
});
