import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  FrameworkTransparencyPanel,
  buildAskThisMindPayload,
  formatRetryCountdown,
  parseAskThisMindEventStream,
  submitAskThisMindAnalysis,
  validateAskThisMindTopic,
} from "./framework-transparency-panel";

describe("buildAskThisMindPayload", () => {
  it("trims the topic before sending it to the analysis route", () => {
    expect(buildAskThisMindPayload("isaac-newton", "  Should I wait?  ")).toEqual({
      frameworkSlug: "isaac-newton",
      topic: "Should I wait?",
    });
  });
});

describe("validateAskThisMindTopic", () => {
  it("accepts a realistic decision topic", () => {
    expect(validateAskThisMindTopic("Should I ship this redesign or wait for review?")).toBeNull();
  });

  it("rejects too-short topics", () => {
    expect(validateAskThisMindTopic("Too short")).toBe("Topic must be at least 10 characters");
  });

  it("rejects too-long topics", () => {
    expect(validateAskThisMindTopic("x".repeat(2001))).toBe("Topic must be 2000 characters or fewer");
  });
});

describe("parseAskThisMindEventStream", () => {
  it("reconstructs the final analysis from streamed chunk events", () => {
    const text = [
      "data: {\"type\":\"analysis_started\"}",
      "",
      "data: {\"type\":\"analysis_chunk\",\"text\":\"Start. \"}",
      "",
      "data: {\"type\":\"analysis_chunk\",\"text\":\"Finish.\"}",
      "",
      "data: {\"type\":\"analysis_done\",\"analysis\":\"Start. Finish.\"}",
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(text)).toBe("Start. Finish.");
  });

  it("falls back to concatenated chunks when there is no terminal analysis payload", () => {
    const text = [
      "data: {\"type\":\"analysis_chunk\",\"text\":\"One \"}",
      "",
      "data: {\"type\":\"analysis_chunk\",\"text\":\"two\"}",
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(text)).toBe("One two");
  });

  it("ignores malformed chunks and lines without data payloads", () => {
    const text = [
      "event: ping",
      "",
      "data: {not-json",
      "",
      "data: {\"type\":\"analysis_chunk\",\"text\":\"Kept.\"}",
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(text)).toBe("Kept.");
  });
});

describe("submitAskThisMindAnalysis", () => {
  it("posts the payload, parses the stream, and surfaces the final analysis", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        [
          "data: {\"type\":\"analysis_started\"}",
          "",
          "data: {\"type\":\"analysis_chunk\",\"text\":\"The framework says \"}",
          "",
          "data: {\"type\":\"analysis_done\",\"analysis\":\"The framework says ship.\"}",
          "",
        ].join("\n"),
        {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        }
      )
    );

    const onStatusChange = vi.fn();
    const onAnalysis = vi.fn();
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onAnalysis,
        onError,
      })
    ).resolves.toBe("The framework says ship.");

    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/generate-analysis",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          frameworkSlug: "isaac-newton",
          topic: "Should I ship the redesign this week or wait for another review cycle?",
        }),
      })
    );
    expect(onStatusChange).toHaveBeenNthCalledWith(1, "loading");
    expect(onStatusChange).toHaveBeenLastCalledWith("success");
    expect(onAnalysis).toHaveBeenCalledWith("The framework says ship.");
    expect(onError).not.toHaveBeenCalled();
  });

  it("surfaces API errors from the route", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unknown framework" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    );

    const onStatusChange = vi.fn();
    const onAnalysis = vi.fn();
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onAnalysis,
        onError,
      })
    ).rejects.toThrow("Unknown framework");

    expect(onStatusChange).toHaveBeenLastCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Unknown framework", undefined);
    expect(onAnalysis).not.toHaveBeenCalled();
  });

  it("uses the response text as a fallback when the API error body is not JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("Rate limit reached", {
        status: 429,
        headers: { "content-type": "text/plain" },
      })
    );

    const onStatusChange = vi.fn();
    const onAnalysis = vi.fn();
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onAnalysis,
        onError,
      })
    ).rejects.toThrow("Rate limit reached");

    expect(onStatusChange).toHaveBeenLastCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Rate limit reached", undefined);
    expect(onAnalysis).not.toHaveBeenCalled();
  });

  it("rejects invalid topics before making a request", async () => {
    const fetchImpl = vi.fn();
    const onStatusChange = vi.fn();
    const onAnalysis = vi.fn();
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Too short",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onAnalysis,
        onError,
      })
    ).rejects.toThrow("Topic must be at least 10 characters");

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenLastCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Topic must be at least 10 characters");
  });
});

describe("FrameworkTransparencyPanel", () => {
  it("renders the transparency toggle and Ask This Mind form", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine="Tier 1 validated — 4/5 holdout scenarios produced divergent responses."
      />
    );

    expect(html).toContain("Framework transparency");
    expect(html).toContain("Show transparency");
    expect(html).toContain("Ask this mind");
    expect(html).toContain("Tier 1 validated");
    expect(html).toContain("Constructs");
    expect(html).toContain("Incidents");
    expect(html).toContain("Blind spots");
  });

  it("renders the open state with analysis and a busy submit button when seeded", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialTopic="Should I build the launch in-house or outsource it?"
        initialAnalysis="The framework says build it in-house."
        initialStatus="loading"
        initialError=""
      />
    );

    expect(html).toContain("Hide transparency");
    expect(html).toContain("Thinking…");
    expect(html).toContain("The framework says build it in-house.");
    expect(html).not.toContain("Tier 1 validated");
  });

  it("renders an error state when seeded with a failure message", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine="Tier 1 validated — 4/5 holdout scenarios produced divergent responses."
        defaultOpen
        initialTopic="Should I build the launch in-house or outsource it?"
        initialAnalysis=""
        initialStatus="error"
        initialError="Topic must be at least 10 characters"
      />
    );

    expect(html).toContain("Hide transparency");
    expect(html).toContain("role=\"alert\"");
    expect(html).toContain("Topic must be at least 10 characters");
  });
});

// ---------------------------------------------------------------------------
// formatRetryCountdown
// ---------------------------------------------------------------------------

describe("formatRetryCountdown", () => {
  it("returns null when resetAt is in the past or equals now", () => {
    const now = Date.now();
    expect(formatRetryCountdown(now - 1, now)).toBeNull();
    expect(formatRetryCountdown(now, now)).toBeNull();
  });

  it("returns '1 minute' for a remaining window of up to 60 seconds", () => {
    const now = 1_000_000;
    expect(formatRetryCountdown(now + 1, now)).toBe("1 minute");
    expect(formatRetryCountdown(now + 60_000, now)).toBe("1 minute");
  });

  it("returns minutes for windows between 2 and 59 minutes", () => {
    const now = 1_000_000;
    expect(formatRetryCountdown(now + 2 * 60_000, now)).toBe("2 minutes");
    expect(formatRetryCountdown(now + 59 * 60_000, now)).toBe("59 minutes");
  });

  it("returns hours for windows of 1–23 hours", () => {
    const now = 1_000_000;
    expect(formatRetryCountdown(now + 1 * 3_600_000, now)).toBe("1 hour");
    expect(formatRetryCountdown(now + 5 * 3_600_000, now)).toBe("5 hours");
  });

  it("returns days for windows of 24+ hours", () => {
    const now = 1_000_000;
    expect(formatRetryCountdown(now + 24 * 3_600_000, now)).toBe("1 day");
    expect(formatRetryCountdown(now + 3 * 86_400_000, now)).toBe("3 days");
  });
});

// ---------------------------------------------------------------------------
// submitAskThisMindAnalysis — 429 retry hints
// ---------------------------------------------------------------------------

describe("submitAskThisMindAnalysis — retry hints", () => {
  it("passes resetAt to onError when the 429 response includes X-RateLimit-Reset", async () => {
    const resetAtSec = Math.floor(Date.now() / 1000) + 3600;
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limit reached", rateLimited: true }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "X-RateLimit-Reset": String(resetAtSec),
        },
      })
    );
    const onError = vi.fn();
    const onStatusChange = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onError,
      })
    ).rejects.toThrow("Rate limit reached");

    expect(onStatusChange).toHaveBeenLastCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Rate limit reached", resetAtSec * 1000);
  });

  it("passes undefined resetAt to onError when X-RateLimit-Reset header is absent", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limit reached", rateLimited: true }), {
        status: 429,
        headers: { "content-type": "application/json" },
      })
    );
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait for another review cycle?",
        fetchImpl: fetchImpl as typeof fetch,
        onError,
      })
    ).rejects.toThrow("Rate limit reached");

    expect(onError).toHaveBeenCalledWith("Rate limit reached", undefined);
  });
});

// ---------------------------------------------------------------------------
// FrameworkTransparencyPanel — retry hint display
// ---------------------------------------------------------------------------

describe("FrameworkTransparencyPanel — retry hints", () => {
  it("shows a countdown and upgrade link when initialResetAt is set in the future", () => {
    const resetAt = Date.now() + 42 * 60_000; // 42 minutes from now
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialStatus="error"
        initialError="Rate limit reached"
        initialResetAt={resetAt}
      />
    );

    expect(html).toContain('role="alert"');
    // renderToStaticMarkup HTML-encodes apostrophes as &#x27;
    expect(html).toContain("reached your free limit.");
    expect(html).toContain("Come back in");
    expect(html).toContain("minutes");
    expect(html).toContain("Upgrade to Pro");
    expect(html).toContain('href="/pricing"');
  });

  it("shows 'Upgrade to Pro' link but omits countdown when resetAt is in the past", () => {
    const resetAt = Date.now() - 1000; // already expired
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialStatus="error"
        initialError="Rate limit reached"
        initialResetAt={resetAt}
      />
    );

    expect(html).toContain('role="alert"');
    // renderToStaticMarkup HTML-encodes apostrophes as &#x27;
    expect(html).toContain("reached your free limit.");
    expect(html).not.toContain("Come back in");
    expect(html).toContain("Upgrade to Pro");
    expect(html).toContain('href="/pricing"');
  });

  it("shows the original error message without upgrade link when initialResetAt is absent", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialStatus="error"
        initialError="Topic must be at least 10 characters"
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Topic must be at least 10 characters");
    expect(html).not.toContain("Upgrade to Pro");
    expect(html).not.toContain('href="/pricing"');
  });
});
