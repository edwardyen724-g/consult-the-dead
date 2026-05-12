import { describe, expect, it, vi } from "vitest";
import {
  ASK_THIS_MIND_TOPIC_LIMIT,
  ASK_THIS_MIND_MAX_TOPIC_LENGTH,
  AskThisMindRequestError,
  createAskThisMindSubmitHandler,
  extractRateLimitHint,
  formatResetCountdown,
  getAskThisMindLimitState,
  normalizeAskThisMindError,
  streamAskThisMindAnalysis,
} from "./ask-this-mind";

function makeSseResponse(chunks: string[], init?: ResponseInit) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      ...init?.headers,
    },
    ...init,
  });
}

describe("getAskThisMindLimitState", () => {
  it("reports the remaining budget before the limit is reached", () => {
    expect(getAskThisMindLimitState([])).toEqual({
      remaining: 3,
      canSubmit: true,
      message: "3 of 3 topics remain on this page.",
    });

    expect(getAskThisMindLimitState(["a", "b"])).toEqual({
      remaining: 1,
      canSubmit: true,
      message: "1 of 3 topics remain on this page.",
    });
  });

  it("locks the panel once the 3-topic limit is exhausted", () => {
    expect(getAskThisMindLimitState(["a", "b", "c"])).toEqual({
      remaining: 0,
      canSubmit: false,
      message: "You have used all 3 topics on this page.",
    });
  });

  it("pins the shared topic limit constant", () => {
    expect(ASK_THIS_MIND_TOPIC_LIMIT).toBe(3);
  });
});

describe("normalizeAskThisMindError", () => {
  it("preserves request errors and plain Error messages", () => {
    expect(
      normalizeAskThisMindError(new AskThisMindRequestError("Rate limited", 429, true))
    ).toBe("Rate limited");
    expect(normalizeAskThisMindError(new Error("Network down"))).toBe("Network down");
    expect(normalizeAskThisMindError(new Error(""))).toBe("Ask This Mind failed. Try again.");
  });

  it("falls back to a generic message for unknown values", () => {
    expect(normalizeAskThisMindError(null)).toBe("Ask This Mind failed. Try again.");
    expect(normalizeAskThisMindError("   ")).toBe("Ask This Mind failed. Try again.");
    expect(normalizeAskThisMindError("  direct error  ")).toBe("direct error");
  });
});

describe("formatResetCountdown", () => {
  it("returns null when resetAt is in the past", () => {
    const past = Date.now() - 60_000;
    expect(formatResetCountdown(past)).toBeNull();
  });

  it("returns null when resetAt equals now", () => {
    const now = Date.now();
    expect(formatResetCountdown(now, now)).toBeNull();
  });

  it("returns '1 minute' for a remaining window of 1 ms to 60 s", () => {
    const now = 1_000_000;
    expect(formatResetCountdown(now + 1, now)).toBe("1 minute");
    expect(formatResetCountdown(now + 60_000, now)).toBe("1 minute");
  });

  it("returns minutes for windows between 1 and 60 minutes", () => {
    const now = 1_000_000;
    expect(formatResetCountdown(now + 2 * 60_000, now)).toBe("2 minutes");
    expect(formatResetCountdown(now + 42 * 60_000, now)).toBe("42 minutes");
    expect(formatResetCountdown(now + 59 * 60_000, now)).toBe("59 minutes");
  });

  it("returns hours for windows between 1 and 23 hours", () => {
    const now = 1_000_000;
    expect(formatResetCountdown(now + 1 * 3_600_000, now)).toBe("1 hour");
    expect(formatResetCountdown(now + 3 * 3_600_000, now)).toBe("3 hours");
    // 22h 1ms → ceil(22.0000.../1) = 23 hours (still < 24 h threshold)
    expect(formatResetCountdown(now + 22 * 3_600_000 + 1, now)).toBe("23 hours");
    // exactly 23h 59m 59s 999ms → ceil rounds to 24h, which hits the "days" branch
    // (not tested here to avoid boundary ambiguity)
  });

  it("returns days for windows of 24 hours or more", () => {
    const now = 1_000_000;
    expect(formatResetCountdown(now + 24 * 3_600_000, now)).toBe("1 day");
    expect(formatResetCountdown(now + 3 * 86_400_000, now)).toBe("3 days");
  });
});

describe("extractRateLimitHint", () => {
  it("returns null for non-rate-limit errors", () => {
    expect(extractRateLimitHint(new Error("generic error"))).toBeNull();
    expect(extractRateLimitHint(null)).toBeNull();
    expect(extractRateLimitHint(new AskThisMindRequestError("timeout", 503, false))).toBeNull();
  });

  it("returns a hint with countdown when resetAt is present and in the future", () => {
    const futureMs = Date.now() + 42 * 60_000;
    const error = new AskThisMindRequestError("Rate limited", 429, true, futureMs);
    const hint = extractRateLimitHint(error);
    expect(hint).not.toBeNull();
    expect(hint!.showUpgradeLink).toBe(true);
    // countdown should be "42 minutes" (exact value depends on formatResetCountdown)
    expect(hint!.countdown).toMatch(/\d+ minutes?/);
  });

  it("returns a hint with null countdown when resetAt is absent", () => {
    const error = new AskThisMindRequestError("Rate limited", 429, true);
    const hint = extractRateLimitHint(error);
    expect(hint).not.toBeNull();
    expect(hint!.countdown).toBeNull();
    expect(hint!.showUpgradeLink).toBe(true);
  });

  it("returns a hint with null countdown when resetAt is in the past", () => {
    const pastMs = Date.now() - 1000;
    const error = new AskThisMindRequestError("Rate limited", 429, true, pastMs);
    const hint = extractRateLimitHint(error);
    expect(hint!.countdown).toBeNull();
  });
});

describe("streamAskThisMindAnalysis", () => {
  it("streams chunks, preserves the final analysis, and forwards the API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeSseResponse([
        "data: {\"type\":\"analysis_started\",\"frameworkSlug\":\"isaac-newton\",\"frameworkName\":\"Isaac Newton\"}\n\n",
        "data: {\"type\":\"analysis_chunk\",\"frameworkSlug\":\"isaac-newton\",\"text\":\"Start. \"}\n\n",
        "data: {\"type\":\"analysis_chunk\",\"frameworkSlug\":\"isaac-newton\",\"text\":\"Finish.\"}\n\n",
        "data: {\"type\":\"analysis_done\",\"frameworkSlug\":\"isaac-newton\",\"frameworkName\":\"Isaac Newton\",\"analysis\":\"Start. Finish.\",\"remaining\":2}\n\n",
      ])
    );
    const chunks: string[] = [];

    const result = await streamAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      apiKey: "sk-ant-client-key",
      fetchImpl: fetchMock as typeof fetch,
      onChunk: (chunk) => chunks.push(chunk),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/generate-analysis",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "sk-ant-client-key",
        },
        body: JSON.stringify({
          frameworkSlug: "isaac-newton",
          topic: "Should I ship the redesign this week?",
        }),
      })
    );
    expect(chunks).toEqual(["Start. ", "Finish."]);
    expect(result).toEqual({
      analysis: "Start. Finish.",
      remaining: 2,
    });
  });

  it("returns the buffered analysis when the stream ends without a done event", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeSseResponse([
        "data: {\"type\":\"analysis_chunk\",\"frameworkSlug\":\"isaac-newton\",\"text\":\"Buffered answer.\"}\n\n",
      ])
    );

    const result = await streamAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toEqual({
      analysis: "Buffered answer.",
      remaining: undefined,
    });
  });

  it("skips malformed events and still returns the later analysis", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeSseResponse([
        "event: ping\n\n",
        "\n\n",
        "data: not-json\n\n",
        "data: {\"type\":\"analysis_done\",\"frameworkSlug\":\"isaac-newton\",\"frameworkName\":\"Isaac Newton\",\"analysis\":\"Recovered analysis.\",\"remaining\":1}\n\n",
      ])
    );

    const result = await streamAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toEqual({
      analysis: "Recovered analysis.",
      remaining: 1,
    });
  });

  it("returns analysis_done results even when the remaining count is omitted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeSseResponse([
        "data: {\"type\":\"analysis_done\",\"frameworkSlug\":\"isaac-newton\",\"frameworkName\":\"Isaac Newton\",\"analysis\":\"Recovered analysis.\"}\n\n",
      ])
    );

    const result = await streamAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toEqual({
      analysis: "Recovered analysis.",
      remaining: undefined,
    });
  });

  it("raises request errors with the server message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "You've used all 3 free analyses for today." }), {
        status: 429,
        headers: { "content-type": "application/json" },
      })
    );

    await expect(
      streamAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week?",
        fetchImpl: fetchMock as typeof fetch,
      })
    ).rejects.toMatchObject({
      name: "AskThisMindRequestError",
      status: 429,
      rateLimited: true,
      message: "You've used all 3 free analyses for today.",
    });
  });

  it("populates resetAt from the X-RateLimit-Reset header on a 429 response", async () => {
    // Simulate a future Unix-second timestamp (next UTC midnight).
    const resetAtSec = Math.floor(Date.now() / 1000) + 3600;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limited", rateLimited: true }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "X-RateLimit-Reset": String(resetAtSec),
        },
      })
    );

    let thrown: unknown;
    try {
      await streamAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week?",
        fetchImpl: fetchMock as typeof fetch,
      });
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(AskThisMindRequestError);
    const error = thrown as AskThisMindRequestError;
    expect(error.rateLimited).toBe(true);
    // resetAt should be X-RateLimit-Reset in ms
    expect(error.resetAt).toBe(resetAtSec * 1000);
  });

  it("leaves resetAt undefined when X-RateLimit-Reset header is absent on 429", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limited", rateLimited: true }), {
        status: 429,
        headers: { "content-type": "application/json" },
      })
    );

    let thrown: unknown;
    try {
      await streamAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week?",
        fetchImpl: fetchMock as typeof fetch,
      });
    } catch (err) {
      thrown = err;
    }

    const error = thrown as AskThisMindRequestError;
    expect(error.rateLimited).toBe(true);
    expect(error.resetAt).toBeUndefined();
  });

  it("raises a generic request error when the response body is empty", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));

    await expect(
      streamAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week?",
        fetchImpl: fetchMock as typeof fetch,
      })
    ).rejects.toMatchObject({
      name: "AskThisMindRequestError",
      status: 503,
      message: "Ask This Mind request failed with status 503.",
    });
  });

  it("uses plain text error bodies when the server does not return JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Rate limit exceeded", {
        status: 429,
        headers: { "content-type": "text/plain" },
      })
    );

    await expect(
      streamAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week?",
        fetchImpl: fetchMock as typeof fetch,
      })
    ).rejects.toMatchObject({
      name: "AskThisMindRequestError",
      status: 429,
      message: "Rate limit exceeded",
    });
  });

  it("rejects a response without a stream body", async () => {
    const response = new Response(null, { status: 200 });

    await expect(
      (async () => {
        // Directly exercise the low-level stream reader via a real response.
        // The helper is responsible for surfacing this as a typed request error.
        const result = await streamAskThisMindAnalysis({
          frameworkSlug: "isaac-newton",
          topic: "Should I ship the redesign this week?",
          fetchImpl: vi.fn().mockResolvedValue(response) as typeof fetch,
        });
        return result;
      })()
    ).rejects.toMatchObject({
      name: "AskThisMindRequestError",
      message: "Analysis response did not include a stream.",
    });
  });
});

describe("createAskThisMindSubmitHandler", () => {
  it("rejects an empty topic before calling the API", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "   ",
      submittedTopics: [],
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(setStatus).toHaveBeenCalledWith("error");
    expect(setError).toHaveBeenCalledWith("Add a topic before asking this mind.");
  });

  it("rejects a topic that is too short before calling the API", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "Too short",
      submittedTopics: [],
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(setStatus).toHaveBeenCalledWith("error");
    expect(setError).toHaveBeenCalledWith("Topic must be at least 10 characters.");
  });

  it("rejects a topic that is too long before calling the API", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "a".repeat(ASK_THIS_MIND_MAX_TOPIC_LENGTH + 1),
      submittedTopics: [],
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(setStatus).toHaveBeenCalledWith("error");
    expect(setError).toHaveBeenCalledWith(
      `Topic must be ${ASK_THIS_MIND_MAX_TOPIC_LENGTH} characters or fewer.`
    );
  });

  it("short-circuits when the 3-topic limit is already exhausted", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();
    const fetchMock = vi.fn();

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      submittedTopics: ["one", "two", "three"],
      fetchImpl: fetchMock as typeof fetch,
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith("error");
    expect(setError).toHaveBeenCalledWith("You have used all 3 topics on this page.");
  });

  it("updates the stream state as chunks arrive and clears the topic on success", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(
      makeSseResponse([
        "data: {\"type\":\"analysis_chunk\",\"frameworkSlug\":\"isaac-newton\",\"text\":\"Start. \"}\n\n",
        "data: {\"type\":\"analysis_chunk\",\"frameworkSlug\":\"isaac-newton\",\"text\":\"Finish.\"}\n\n",
        "data: {\"type\":\"analysis_done\",\"frameworkSlug\":\"isaac-newton\",\"frameworkName\":\"Isaac Newton\",\"analysis\":\"Start. Finish.\",\"remaining\":2}\n\n",
      ])
    );

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      submittedTopics: [],
      fetchImpl: fetchMock as typeof fetch,
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(setStatus.mock.calls.map(([value]) => value)).toContain("submitting");
    expect(setStatus.mock.calls.map(([value]) => value)).toContain("streaming");
    expect(setStatus).toHaveBeenLastCalledWith("done");
    expect(setError).toHaveBeenCalledWith(null);
    expect(setAnalysis).toHaveBeenCalledWith("");
    expect(setAnalysis).toHaveBeenCalledWith("Start. Finish.");
    expect(setAnalysis.mock.calls.some(([value]) => typeof value === "function")).toBe(true);
    expect(setSubmittedTopics.mock.calls.some(([value]) => typeof value === "function")).toBe(true);
    expect(setTopic).toHaveBeenCalledWith("");
  });

  it("reports server errors through the panel error state", async () => {
    const setTopic = vi.fn();
    const setAnalysis = vi.fn();
    const setSubmittedTopics = vi.fn();
    const setStatus = vi.fn();
    const setError = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "The free tier is at capacity for today." }), {
        status: 429,
        headers: { "content-type": "application/json" },
      })
    );

    const handler = createAskThisMindSubmitHandler({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week?",
      submittedTopics: [],
      fetchImpl: fetchMock as typeof fetch,
      setTopic,
      setAnalysis,
      setSubmittedTopics,
      setStatus,
      setError,
    });

    await handler({ preventDefault: vi.fn() });

    expect(setStatus).toHaveBeenLastCalledWith("error");
    expect(setError).toHaveBeenLastCalledWith("The free tier is at capacity for today.");
  });
});
