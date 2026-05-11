import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  FrameworkTransparencyPanel,
  buildAskThisMindPayload,
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
    expect(onError).toHaveBeenCalledWith("Unknown framework");
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
    expect(onError).toHaveBeenCalledWith("Rate limit reached");
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
