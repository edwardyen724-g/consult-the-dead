import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  async function* makeTextStream(chunks: string[]) {
    for (const text of chunks) {
      yield {
        type: "content_block_delta" as const,
        delta: { type: "text_delta" as const, text },
      };
    }
  }

  const mockStream = vi.fn();
  const mockCreate = vi.fn();
  interface MockAnthropicInstance {
    messages: {
      stream: typeof mockStream;
      create: typeof mockCreate;
    };
  }

  const MockAnthropic = vi.fn(function MockAnthropicCtor(this: MockAnthropicInstance) {
    this.messages = {
      stream: mockStream,
      create: mockCreate,
    };
  });

  const authMock = vi.fn();
  const currentUserMock = vi.fn();
  const checkRateLimitMock = vi.fn();
  const getClientIpMock = vi.fn();
  const loadFrameworkRawMock = vi.fn();
  const bumpCounterMock = vi.fn();
  const bumpMindMock = vi.fn();
  const logTopicMock = vi.fn();

  return {
    makeTextStream,
    mockStream,
    mockCreate,
    MockAnthropic,
    authMock,
    currentUserMock,
    checkRateLimitMock,
    getClientIpMock,
    loadFrameworkRawMock,
    bumpCounterMock,
    bumpMindMock,
    logTopicMock,
  };
});

let POST: typeof import("./route").POST;

vi.mock("@anthropic-ai/sdk", () => ({ default: mocks.MockAnthropic }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.authMock,
  currentUser: mocks.currentUserMock,
}));
vi.mock("@/lib/agon/rateLimit", () => ({
  checkRateLimit: mocks.checkRateLimitMock,
  getClientIp: mocks.getClientIpMock,
}));
vi.mock("@/lib/agon/loadFramework", () => ({
  loadFrameworkRaw: mocks.loadFrameworkRawMock,
}));
vi.mock("@/lib/agon/metrics", () => ({
  bumpCounter: mocks.bumpCounterMock,
  bumpMind: mocks.bumpMindMock,
  logTopic: mocks.logTopicMock,
}));

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
  origin: string | null = "https://www.consultthedead.com"
): Request {
  const requestHeaders: Record<string, string> = {
    "content-type": "application/json",
    ...headers,
  };
  if (origin) {
    requestHeaders.origin = origin;
  }

  return new Request("https://example.com/api/generate-analysis", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(body),
  });
}

function parseEvents(text: string): unknown[] {
  return text
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const dataLine = chunk
        .split("\n")
        .find((line) => line.startsWith("data: "));
      if (!dataLine) throw new Error(`Missing data line in chunk: ${chunk}`);
      return JSON.parse(dataLine.slice(6));
    });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = "sk-ant-server-key";
  mocks.authMock.mockResolvedValue({ userId: "user_123" });
  mocks.currentUserMock.mockResolvedValue({ publicMetadata: {} });
  mocks.checkRateLimitMock.mockResolvedValue({ allowed: true, remaining: 2 });
  mocks.getClientIpMock.mockReturnValue("127.0.0.1");
  mocks.loadFrameworkRawMock.mockReturnValue({
    meta: { person: "Isaac Newton" },
    perceptual_lens: {
      statement: "Newton sees decisions as systems with hidden forces.",
      what_they_notice_first: "The governing law or constraint",
      what_they_ignore: "Surface-level noise",
    },
    bipolar_constructs: [],
    behavioral_divergence_predictions: [],
    critical_incident_database: [],
  });
  mocks.mockStream.mockReturnValue(
    (async function* () {
      yield {
        type: "content_block_delta" as const,
        delta: { type: "text_delta" as const, text: "Start of analysis. " },
      };
      yield { type: "message_stop" as const } as never;
      yield {
        type: "content_block_delta" as const,
        delta: { type: "text_delta" as const, text: "Final recommendation." },
      };
    })()
  );
});

describe("POST /api/generate-analysis", () => {
  it("rejects requests without an allowed origin", async () => {
    const response = await POST(
      makeRequest(
        {
          topic: "Should I ship the redesign this week or wait for another review cycle?",
          frameworkSlug: "isaac-newton",
        },
        {},
        null
      ) as never
    );

    expect(response.status).toBe(403);
    expect(mocks.authMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error:
        "This API is only available from consultthedead.com. If you'd like to integrate with Ask This Mind directly, please reach out.",
    });
  });

  it("rejects an explicitly disallowed origin", async () => {
    const response = await POST(
      makeRequest(
        {
          topic: "Should I ship the redesign this week or wait for another review cycle?",
          frameworkSlug: "isaac-newton",
        },
        {},
        "https://malicious.example.com"
      ) as never
    );

    expect(response.status).toBe(403);
    expect(mocks.authMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error:
        "This API is only available from consultthedead.com. If you'd like to integrate with Ask This Mind directly, please reach out.",
    });
  });

  it("rejects invalid JSON bodies", async () => {
    const response = await POST(
      new Request("https://example.com/api/generate-analysis", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://www.consultthedead.com",
        },
        body: "{not-json",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("streams a single-framework analysis for a valid topic", async () => {
    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(200);
    expect(mocks.authMock).toHaveBeenCalled();
    expect(mocks.checkRateLimitMock).toHaveBeenCalledWith({
      userId: "user_123",
      isPro: false,
      ip: "127.0.0.1",
    });
    expect(mocks.bumpMindMock).toHaveBeenCalledWith("isaac-newton");
    expect(mocks.logTopicMock).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        minds: ["isaac-newton"],
        byo: false,
      })
    );

    const events = parseEvents(await response.text()) as Array<{ type: string; [key: string]: unknown }>;
    expect(events.map((event) => event.type)).toEqual([
      "analysis_started",
      "analysis_chunk",
      "analysis_chunk",
      "analysis_done",
    ]);
    expect(events[3]).toMatchObject({
      type: "analysis_done",
      frameworkSlug: "isaac-newton",
      frameworkName: "Isaac Newton",
      analysis: "Start of analysis. Final recommendation.",
      remaining: 2,
    });
  });

  it("allows the preview origin via the Vercel regex and skips the shared rate-limit contract when a client key is supplied", async () => {
    const response = await POST(
      makeRequest(
        {
          topic: "Should I ship the redesign this week or wait for another review cycle?",
          frameworkSlug: "isaac-newton",
        },
        { "x-api-key": "sk-ant-client-key" },
        "https://website-preview-edwardyen724-gs-projects.vercel.app"
      ) as never
    );

    expect(response.status).toBe(200);
    expect(mocks.checkRateLimitMock).not.toHaveBeenCalled();
    expect(response.headers.has("X-RateLimit-Remaining")).toBe(false);
    const events = parseEvents(await response.text()) as Array<{ type: string }>;
    expect(events[0]).toMatchObject({ type: "analysis_started" });
  });

  it("rejects a topic that is too short", async () => {
    const response = await POST(
      makeRequest({
        topic: "Too short",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.checkRateLimitMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Topic must be at least 10 characters",
    });
  });

  it("rejects a topic that is too long", async () => {
    const response = await POST(
      makeRequest({
        topic: "x".repeat(2001),
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.checkRateLimitMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Topic must be 2000 characters or fewer",
    });
  });

  it("rejects a non-string topic before streaming", async () => {
    const response = await POST(
      makeRequest({
        topic: 123,
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Topic must be at least 10 characters",
    });
  });

  it("rejects a missing framework slug before loading framework JSON", async () => {
    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.loadFrameworkRawMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "frameworkSlug is required",
    });
  });

  it("rejects unknown framework slugs", async () => {
    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "not-a-framework",
      }) as never
    );

    expect(response.status).toBe(400);
    expect(mocks.checkRateLimitMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Unknown framework",
    });
  });

  it("returns 404 when the framework JSON is missing for a supported slug", async () => {
    mocks.loadFrameworkRawMock.mockReturnValueOnce(null);

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(404);
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Framework not found",
    });
  });

  it("falls back to the slug when the framework metadata has no person name", async () => {
    mocks.loadFrameworkRawMock.mockReturnValueOnce({
      meta: {},
      perceptual_lens: {
        statement: "A framework without a person still has a lens.",
        what_they_notice_first: "The constraints",
        what_they_ignore: "The branding",
      },
      bipolar_constructs: [],
      behavioral_divergence_predictions: [],
      critical_incident_database: [],
    });

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    const events = parseEvents(await response.text()) as Array<{
      type: string;
      frameworkName?: string;
      analysis?: string;
    }>;

    expect(response.status).toBe(200);
    expect(events[0]).toMatchObject({
      type: "analysis_started",
      frameworkName: "isaac-newton",
    });
    expect(events[events.length - 1]).toMatchObject({
      type: "analysis_done",
      frameworkName: "isaac-newton",
      analysis: "Start of analysis. Final recommendation.",
    });
  });

  it("returns 401 when no Anthropic key is available", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(401);
    expect(mocks.authMock).not.toHaveBeenCalled();
    expect(mocks.currentUserMock).not.toHaveBeenCalled();
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error:
        "No API key available. Add your Anthropic API key in settings, or contact the site owner.",
    });
  });

  it("returns a rate-limit error when the server-key quota is exhausted", async () => {
    mocks.checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reason: "user",
    });

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(429);
    expect(mocks.MockAnthropic).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "You've used all 3 free analyses for today. Add your own Anthropic API key for unlimited use.",
      rateLimited: true,
    });
  });

  it("uses the global free-tier rate-limit message when that bucket is exhausted", async () => {
    mocks.checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reason: "global",
    });

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error:
        "The free tier is at capacity for today. Add your own Anthropic API key for unlimited use, or check back tomorrow.",
      rateLimited: true,
    });
  });

  it("uses the pro monthly rate-limit message when that bucket is exhausted", async () => {
    mocks.checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reason: "pro",
    });

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error:
        "You've reached your 100 analysis monthly limit. Manage your subscription from your account page.",
      rateLimited: true,
    });
  });

  it("surfaces streamed Anthropic failures as a rejected event stream", async () => {
    mocks.mockStream.mockReturnValueOnce(
      (async function* () {
        yield {
          type: "content_block_delta" as const,
          delta: { type: "text_delta" as const, text: "Start of analysis. " },
        };
        throw new Error("stream exploded");
      })()
    );

    const response = await POST(
      makeRequest({
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        frameworkSlug: "isaac-newton",
      }) as never
    );

    await expect(response.text()).rejects.toThrow("stream exploded");
  });
});
