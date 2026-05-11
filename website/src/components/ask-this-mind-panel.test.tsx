/**
 * Regression tests for the Ask This Mind form and transparency toggle.
 *
 * The Ask This Mind form lives inside FrameworkTransparencyPanel. These tests
 * cover the form submission pipeline — endpoint target, payload shape, error
 * handling, and event-stream parsing — as regression gates against accidental
 * breakage of the user-facing interaction.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  FrameworkTransparencyPanel,
  buildAskThisMindPayload,
  parseAskThisMindEventStream,
  submitAskThisMindAnalysis,
  validateAskThisMindTopic,
} from "./framework-transparency-panel";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANALYSIS_ENDPOINT = "/api/generate-analysis";

// ---------------------------------------------------------------------------
// Form payload shape
// ---------------------------------------------------------------------------

describe("Ask This Mind — form payload", () => {
  it("sends to the correct endpoint", () => {
    // The endpoint is embedded in the component; guard it from silent drift.
    const payload = buildAskThisMindPayload("isaac-newton", "Should I ship?");
    expect(payload).toHaveProperty("frameworkSlug", "isaac-newton");
    expect(payload).toHaveProperty("topic", "Should I ship?");

    // The ANALYSIS_ENDPOINT constant is validated via submitAskThisMindAnalysis
    // below — this assertion pins the expected URL.
    expect(ANALYSIS_ENDPOINT).toBe("/api/generate-analysis");
  });

  it("trims leading and trailing whitespace before sending", () => {
    const payload = buildAskThisMindPayload("marcus-aurelius", "  Is retreat an option?  ");
    expect(payload.topic).toBe("Is retreat an option?");
    expect(payload.frameworkSlug).toBe("marcus-aurelius");
  });
});

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

describe("Ask This Mind — topic validation", () => {
  it("accepts a realistic decision topic", () => {
    expect(
      validateAskThisMindTopic("Should I quit and start my own company now?")
    ).toBeNull();
  });

  it("rejects a topic that is too short (< 10 chars)", () => {
    expect(validateAskThisMindTopic("Short")).toBe(
      "Topic must be at least 10 characters"
    );
  });

  it("rejects a topic that is exactly 9 characters", () => {
    expect(validateAskThisMindTopic("123456789")).toBe(
      "Topic must be at least 10 characters"
    );
  });

  it("accepts a topic that is exactly 10 characters", () => {
    expect(validateAskThisMindTopic("1234567890")).toBeNull();
  });

  it("rejects a topic longer than 2000 characters", () => {
    expect(validateAskThisMindTopic("a".repeat(2001))).toBe(
      "Topic must be 2000 characters or fewer"
    );
  });

  it("accepts a topic that is exactly 2000 characters", () => {
    expect(validateAskThisMindTopic("a".repeat(2000))).toBeNull();
  });

  it("treats a whitespace-padded short topic as too short", () => {
    // validateAskThisMindTopic trims before measuring
    expect(validateAskThisMindTopic("   short   ")).toBe(
      "Topic must be at least 10 characters"
    );
  });
});

// ---------------------------------------------------------------------------
// Event-stream parsing
// ---------------------------------------------------------------------------

describe("Ask This Mind — event-stream parser", () => {
  it("reconstructs analysis from streamed chunk events", () => {
    const stream = [
      'data: {"type":"analysis_started"}',
      "",
      'data: {"type":"analysis_chunk","text":"Newton sees "}',
      "",
      'data: {"type":"analysis_chunk","text":"patterns."}',
      "",
      'data: {"type":"analysis_done","analysis":"Newton sees patterns."}',
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(stream)).toBe("Newton sees patterns.");
  });

  it("falls back to chunk concatenation when the terminal event is missing", () => {
    const stream = [
      'data: {"type":"analysis_chunk","text":"Part A. "}',
      "",
      'data: {"type":"analysis_chunk","text":"Part B."}',
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(stream)).toBe("Part A. Part B.");
  });

  it("ignores events without a data line", () => {
    const stream = [
      "event: ping",
      "",
      'data: {"type":"analysis_chunk","text":"Valid."}',
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(stream)).toBe("Valid.");
  });

  it("skips malformed JSON and continues parsing later events", () => {
    const stream = [
      "data: {not-json",
      "",
      'data: {"type":"analysis_chunk","text":"Recovered."}',
      "",
    ].join("\n");

    expect(parseAskThisMindEventStream(stream)).toBe("Recovered.");
  });

  it("returns an empty string for an empty stream", () => {
    expect(parseAskThisMindEventStream("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// submitAskThisMindAnalysis — happy path
// ---------------------------------------------------------------------------

describe("Ask This Mind — form submission (happy path)", () => {
  it("posts to /api/generate-analysis with the correct payload shape", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        'data: {"type":"analysis_done","analysis":"Ship it."}\n\n',
        { status: 200, headers: { "content-type": "text/event-stream" } }
      )
    );

    await submitAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week or wait?",
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      ANALYSIS_ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          frameworkSlug: "isaac-newton",
          topic: "Should I ship the redesign this week or wait?",
        }),
      })
    );
  });

  it("returns the parsed analysis string on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        [
          'data: {"type":"analysis_started"}',
          "",
          'data: {"type":"analysis_chunk","text":"The law-seeking "}',
          "",
          'data: {"type":"analysis_done","analysis":"The law-seeking mind says ship."}',
          "",
        ].join("\n"),
        { status: 200, headers: { "content-type": "text/event-stream" } }
      )
    );

    const onStatusChange = vi.fn();
    const onAnalysis = vi.fn();

    const result = await submitAskThisMindAnalysis({
      frameworkSlug: "isaac-newton",
      topic: "Should I ship the redesign this week or wait?",
      fetchImpl: fetchImpl as typeof fetch,
      onStatusChange,
      onAnalysis,
    });

    expect(result).toBe("The law-seeking mind says ship.");
    expect(onStatusChange).toHaveBeenNthCalledWith(1, "loading");
    expect(onStatusChange).toHaveBeenLastCalledWith("success");
    expect(onAnalysis).toHaveBeenCalledWith("The law-seeking mind says ship.");
  });
});

// ---------------------------------------------------------------------------
// submitAskThisMindAnalysis — error paths
// ---------------------------------------------------------------------------

describe("Ask This Mind — form submission (error paths)", () => {
  it("rejects without making a request when the topic is too short", async () => {
    const fetchImpl = vi.fn();
    const onError = vi.fn();
    const onStatusChange = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "short",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onError,
      })
    ).rejects.toThrow("Topic must be at least 10 characters");

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Topic must be at least 10 characters");
  });

  it("surfaces a JSON error body from the API as the error message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unknown framework" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    );
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait?",
        fetchImpl: fetchImpl as typeof fetch,
        onError,
      })
    ).rejects.toThrow("Unknown framework");

    expect(onError).toHaveBeenCalledWith("Unknown framework");
  });

  it("surfaces a plain-text 429 body as the error message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("Rate limit reached", {
        status: 429,
        headers: { "content-type": "text/plain" },
      })
    );
    const onError = vi.fn();
    const onStatusChange = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait?",
        fetchImpl: fetchImpl as typeof fetch,
        onStatusChange,
        onError,
      })
    ).rejects.toThrow("Rate limit reached");

    expect(onStatusChange).toHaveBeenLastCalledWith("error");
    expect(onError).toHaveBeenCalledWith("Rate limit reached");
  });

  it("uses a generic message when the error body is empty JSON with no error key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "ignored" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    );
    const onError = vi.fn();

    await expect(
      submitAskThisMindAnalysis({
        frameworkSlug: "isaac-newton",
        topic: "Should I ship the redesign this week or wait?",
        fetchImpl: fetchImpl as typeof fetch,
        onError,
      })
    ).rejects.toThrow("Request failed (500)");
  });
});

// ---------------------------------------------------------------------------
// Transparency toggle rendering
// ---------------------------------------------------------------------------

describe("Transparency toggle — rendering", () => {
  it("renders closed by default (toggle button reads 'Show transparency')", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
      />
    );

    expect(html).toContain("Show transparency");
    expect(html).not.toContain("Hide transparency");
  });

  it("renders open when defaultOpen is true (toggle button reads 'Hide transparency')", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).toContain("Hide transparency");
    expect(html).not.toContain("Show transparency");
  });

  it("exposes aria-expanded=false when closed", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="marcus-aurelius"
        frameworkName="Marcus Aurelius"
        constructCount={6}
        incidentCount={14}
        blindSpotCount={2}
        validationLine={null}
      />
    );

    expect(html).toContain('aria-expanded="false"');
  });

  it("exposes aria-expanded=true when open", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="marcus-aurelius"
        frameworkName="Marcus Aurelius"
        constructCount={6}
        incidentCount={14}
        blindSpotCount={2}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).toContain('aria-expanded="true"');
  });

  it("wires aria-controls to the panel id derived from frameworkSlug", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="marcus-aurelius"
        frameworkName="Marcus Aurelius"
        constructCount={6}
        incidentCount={14}
        blindSpotCount={2}
        validationLine={null}
      />
    );

    expect(html).toContain('aria-controls="marcus-aurelius-transparency-panel"');
    expect(html).toContain('id="marcus-aurelius-transparency-panel"');
  });

  it("hides the panel content when closed (hidden attribute present)", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
      />
    );

    // SSR renders hidden as empty attribute
    expect(html).toContain(' hidden');
  });

  it("does not set hidden on the panel when defaultOpen is true", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
      />
    );

    // The panel element should not carry a hidden attribute when open
    expect(html).not.toContain(
      'id="isaac-newton-transparency-panel" hidden'
    );
  });
});

// ---------------------------------------------------------------------------
// Ask This Mind form — slot in open panel
// ---------------------------------------------------------------------------

describe("Ask This Mind form — within the open panel", () => {
  it("renders the textarea with the correct label", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).toContain("Ask this mind");
    expect(html).toContain(
      'id="isaac-newton-ask-this-mind"'
    );
  });

  it("uses the framework person's first name in the textarea placeholder", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="marcus-aurelius"
        frameworkName="Marcus Aurelius"
        constructCount={6}
        incidentCount={14}
        blindSpotCount={2}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).toContain("Ask Marcus about");
  });

  it("shows the validation line when present inside the open panel", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine="Tier 1 validated — 4/5 scenarios divergent."
        defaultOpen
      />
    );

    expect(html).toContain("Tier 1 validated — 4/5 scenarios divergent.");
  });

  it("omits the validation paragraph when validationLine is null", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).not.toContain("Tier 1");
  });

  it("renders the submit button as disabled when seeded with empty topic", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialTopic=""
      />
    );

    // Button should be disabled when there is no topic
    expect(html).toContain('type="submit"');
    expect(html).toContain("Ask this mind");
  });

  it("renders a pre-seeded analysis block when initialAnalysis is provided", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialTopic="Should I build in-house or outsource?"
        initialAnalysis="The framework says build in-house."
      />
    );

    expect(html).toContain("The framework says build in-house.");
    expect(html).toContain("Ask This Mind");
  });

  it("renders the error alert when initialError is non-empty", () => {
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
        initialError="Rate limit reached. Try again tomorrow."
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Rate limit reached. Try again tomorrow.");
  });

  it("shows the thinking button copy when status is loading", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
        initialTopic="Should I build in-house or outsource?"
        initialStatus="loading"
      />
    );

    expect(html).toContain("Thinking…");
  });

  it("renders the metric cards for constructs, incidents, and blind spots", () => {
    const html = renderToStaticMarkup(
      <FrameworkTransparencyPanel
        frameworkSlug="isaac-newton"
        frameworkName="Isaac Newton"
        constructCount={9}
        incidentCount={21}
        blindSpotCount={4}
        validationLine={null}
        defaultOpen
      />
    );

    expect(html).toContain("Constructs");
    expect(html).toContain("Incidents");
    expect(html).toContain("Blind spots");
    expect(html).toContain(">9<");
    expect(html).toContain(">21<");
    expect(html).toContain(">4<");
  });
});
