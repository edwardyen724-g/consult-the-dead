import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  currentUserMock,
  checkRateLimitMock,
  getClientIpMock,
  runAgonMock,
  bumpCounterMock,
  bumpMindMock,
  logTopicMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  currentUserMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
  getClientIpMock: vi.fn(),
  runAgonMock: vi.fn(),
  bumpCounterMock: vi.fn(),
  bumpMindMock: vi.fn(),
  logTopicMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  currentUser: currentUserMock,
}));

vi.mock("@/lib/agon/rateLimit", () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: getClientIpMock,
}));

vi.mock("@/lib/agon/agonEngine", () => ({
  runAgon: runAgonMock,
}));

vi.mock("@/lib/agon/metrics", () => ({
  bumpCounter: bumpCounterMock,
  bumpMind: bumpMindMock,
  logTopic: logTopicMock,
}));

import { POST } from "./route";

function makeRequest(
  body: unknown,
  init: {
    origin?: string;
    apiKey?: string;
    contentType?: string;
  } = {},
) {
  const headers: Record<string, string> = {
    origin: init.origin ?? "https://consultthedead.com",
    "content-type": init.contentType ?? "application/json",
  };
  if (init.apiKey) {
    headers["x-api-key"] = init.apiKey;
  }

  return new Request("https://example.com/api/agon", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function makeValidBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    topic: "Should we launch now?",
    mindSlugs: ["cicero", "marie-curie"],
    rounds: 3,
    research: false,
    ...overrides,
  };
}

async function readText(response: Response): Promise<string> {
  return await response.text();
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";

  authMock.mockReset().mockResolvedValue({ userId: "user_123" });
  currentUserMock.mockReset().mockResolvedValue({ publicMetadata: {} });
  checkRateLimitMock.mockReset();
  getClientIpMock.mockReset().mockReturnValue("127.0.0.1");
  runAgonMock.mockReset();
  bumpCounterMock.mockReset();
  bumpMindMock.mockReset();
  logTopicMock.mockReset();
});

describe("/api/agon", () => {
  it("returns 403 for disallowed origins", async () => {
    const response = await POST(makeRequest(makeValidBody(), {
      origin: "https://evil.example",
    }) as never);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error:
        "This API is only available from consultthedead.com. If you'd like to integrate with the Agora directly, please reach out.",
    });
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    const response = await POST(
      new Request("https://example.com/api/agon", {
        method: "POST",
        headers: {
          origin: "https://consultthedead.com",
          "content-type": "application/json",
        },
        body: "{",
      }) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("returns 400 for short topics", async () => {
    const response = await POST(
      makeRequest(
        {
          ...makeValidBody(),
          topic: "Too short",
        },
      ) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Topic must be at least 10 characters",
    });
  });

  it("returns 400 for overlong topics", async () => {
    const response = await POST(
      makeRequest(
        {
          ...makeValidBody(),
          topic: "x".repeat(2001),
        },
      ) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Topic must be 2000 characters or fewer",
    });
  });

  it("accepts allowed Vercel preview origins", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: true,
      remaining: 1,
    });
    runAgonMock.mockImplementation(() =>
      (async function* () {
        yield { type: "agon_done", summary: "done" };
      })(),
    );

    const response = await POST(
      makeRequest(makeValidBody(), {
        origin: "https://website-abc123-edwardyen724-gs-projects.vercel.app",
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(readText(response)).resolves.toContain(
      'data: {"type":"agon_done","summary":"done","remaining":1}',
    );
  });

  it("returns 401 when no API key is available", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "No API key available. Add your Anthropic API key in settings, or contact the site owner.",
    });
  });

  it("returns the free-tier mind-count copy when fewer than two minds are selected", async () => {
    const response = await POST(
      makeRequest(
        {
          ...makeValidBody({ mindSlugs: ["cicero"] }),
        },
      ) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Pick 2 to 3 minds",
    });
  });

  it("returns the pro-tier mind-count copy when fewer than two minds are selected", async () => {
    currentUserMock.mockResolvedValue({
      publicMetadata: { subscription_tier: "pro" },
    });

    const response = await POST(
      makeRequest(
        {
          ...makeValidBody({ mindSlugs: ["cicero"] }),
        },
      ) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Pick 2 to 5 minds",
    });
  });

  it("uses the finalized free-debate exhaustion copy for global 429 responses", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      reason: "global",
      remaining: 0,
    });

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(429);
    expect(checkRateLimitMock).toHaveBeenCalledWith({
      userId: "user_123",
      isPro: false,
      ip: "127.0.0.1",
    });
    await expect(response.json()).resolves.toEqual({
      error: "You've used all 3 free debates for today",
      rateLimited: true,
    });
  });

  it("keeps the pro exhaustion copy intact", async () => {
    currentUserMock.mockResolvedValue({
      publicMetadata: { subscription_tier: "pro" },
    });
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      reason: "pro",
      remaining: 0,
    });

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "You've reached your 100 agon monthly limit. Manage your subscription from your account page.",
      rateLimited: true,
    });
  });

  it("keeps the free-user exhaustion copy intact", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      reason: "user",
      remaining: 0,
    });

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "You've used all 3 free agons for today. Add your own Anthropic API key for unlimited use.",
      rateLimited: true,
    });
  });

  it("falls back to the IP metric when rate-limit reasons are unexpected", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      reason: "ip" as never,
      remaining: 0,
    });

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(429);
    expect(bumpCounterMock).toHaveBeenCalledWith("rate_limited_ip");
  });

  it("streams the agon result with remaining quota when the server key is allowed", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: true,
      remaining: 2,
    });
    runAgonMock.mockImplementation(() =>
      (async function* () {
        yield { type: "round_start", round: 1, mindSlug: "cicero" };
        yield { type: "agon_done", summary: "done" };
      })(),
    );

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
    await expect(readText(response)).resolves.toContain(
      'data: {"type":"agon_done","summary":"done","remaining":2}',
    );
    expect(bumpCounterMock).toHaveBeenCalledWith("agons_started");
    expect(bumpCounterMock).toHaveBeenCalledWith("agons_completed");
    expect(bumpMindMock).toHaveBeenCalledWith("cicero");
    expect(bumpMindMock).toHaveBeenCalledWith("marie-curie");
    expect(logTopicMock).toHaveBeenCalledWith({
      topic: "Should we launch now?",
      minds: ["cicero", "marie-curie"],
      byo: false,
      ts: expect.any(Number),
    });
  });

  it("skips the server rate limit when a client API key is supplied", async () => {
    runAgonMock.mockImplementation(() =>
      (async function* () {
        yield { type: "agon_done", summary: "done" };
      })(),
    );

    const response = await POST(
      makeRequest(makeValidBody(), { apiKey: "sk-ant-test" }) as never,
    );

    expect(response.status).toBe(200);
    expect(checkRateLimitMock).not.toHaveBeenCalled();
    await expect(readText(response)).resolves.toContain(
      'data: {"type":"agon_done","summary":"done"}',
    );
    expect(bumpCounterMock).toHaveBeenCalledWith("byo_key_used");
  });

  it("emits an error event when the agon engine throws", async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: true,
      remaining: 2,
    });
    runAgonMock.mockImplementation(
      () =>
        (async function* () {
          throw new Error("boom");
        })(),
    );

    const response = await POST(makeRequest(makeValidBody()) as never);

    expect(response.status).toBe(200);
    await expect(readText(response)).resolves.toContain(
      'data: {"type":"error","message":"boom"}',
    );
    expect(bumpCounterMock).toHaveBeenCalledWith("agons_errored");
  });
});
