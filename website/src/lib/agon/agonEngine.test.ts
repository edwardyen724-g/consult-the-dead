/**
 * Unit tests for agonEngine.ts — canonical mock reference for future dev agents.
 *
 * ## Mock pattern overview
 *
 * agonEngine.ts depends on two external SDKs:
 *   - @anthropic-ai/sdk  — used for messages.create() and messages.stream()
 *   - @tavily/core       — used for client.search() and client.extract()
 *
 * Both are mocked at the module level with vi.hoisted() + vi.mock() so that:
 *   1. Mock function references are available both inside the factory AND in
 *      test bodies (vi.hoisted runs before imports are resolved).
 *   2. Each test can configure its own behavior via mockReturnValue /
 *      mockResolvedValue without changing the factory.
 *
 * Key patterns to copy when writing future tests:
 *   - messages.stream() must return an AsyncIterable — use an async generator.
 *   - messages.create() returns a plain Promise<{ content: ContentBlock[] }>.
 *   - tavily() is a factory function; mock it to return a client-shaped object.
 *   - Unset TAVILY_API_KEY in process.env to skip the Tavily branch cleanly.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AgonEvent } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Hoisted mock setup
// vi.hoisted() runs BEFORE any import is resolved, giving us refs we can use
// both in the vi.mock() factory and in test bodies.
// ──────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => {
  /** Async-generator helper — simulates anthropic.messages.stream() events. */
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

  /**
   * MockAnthropic class — mirrors the shape used by agonEngine.
   *
   * messages.stream(params)  → AsyncIterable of stream events
   * messages.create(params)  → Promise<{ content: ContentBlock[] }>
   *
   * IMPORTANT: must use a regular function (not an arrow function) as the
   * constructor implementation. Arrow functions cannot be called with `new`,
   * so vi.fn().mockImplementation(() => ...) would throw
   * "is not a constructor" at runtime.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockAnthropic = vi.fn(function MockAnthropicCtor(this: any) {
    this.messages = {
      stream: mockStream,
      create: mockCreate,
    };
  });

  const mockTavilySearch = vi.fn();
  const mockTavilyExtract = vi.fn();

  /**
   * mockTavilyFactory — returned when the code calls tavily({ apiKey }).
   * Mirrors client.search() and client.extract() shapes.
   */
  const mockTavilyFactory = vi.fn().mockReturnValue({
    search: mockTavilySearch,
    extract: mockTavilyExtract,
  });

  return {
    makeTextStream,
    mockStream,
    mockCreate,
    MockAnthropic,
    mockTavilySearch,
    mockTavilyExtract,
    mockTavilyFactory,
  };
});

// Module-level mocks — vi.mock() calls are hoisted by vitest automatically.
vi.mock("@anthropic-ai/sdk", () => ({ default: mocks.MockAnthropic }));
vi.mock("@tavily/core", () => ({ tavily: mocks.mockTavilyFactory }));

// Import the subject AFTER the mocks are registered.
import { runAgon } from "./agonEngine";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Drain a runAgon async generator into an array of events. */
async function collectEvents(
  gen: ReturnType<typeof runAgon>
): Promise<AgonEvent[]> {
  const events: AgonEvent[] = [];
  for await (const e of gen) {
    events.push(e);
  }
  return events;
}

/** Minimal valid consensus JSON that parseConsensusJson accepts. */
const VALID_CONSENSUS_JSON = JSON.stringify({
  points: "Both frameworks agree on pragmatism.",
  pointsSummary: "Pragmatism wins.",
  tensions: "Newton prefers math; Tesla prefers electricity.",
  tensionsSummary: "Science vs engineering.",
  action: "Build a prototype.",
  actionSummary: "Prototype first.",
  steps: ["Step 1: Research", "Step 2: Build"],
  stepsSummary: "Two steps.",
  risks: "Over-engineering.",
  risksSummary: "Keep it simple.",
});

/** A turn stream that emits a single text chunk then ends. */
function makeSingleChunkStream(text: string) {
  return mocks.makeTextStream([text]);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("agonEngine — mock-SDK reference tests", () => {
  const FAKE_API_KEY = "sk-ant-test-key";

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Tavily env var is NOT set — fetchTavilyContext will no-op.
    delete process.env.TAVILY_API_KEY;

    // Default stream: single turn chunk "Test response."
    mocks.mockStream.mockReturnValue(makeSingleChunkStream("Test response."));

    // Default convergence create: returns valid consensus JSON.
    mocks.mockCreate.mockResolvedValue({
      content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
    });
  });

  afterEach(() => {
    delete process.env.TAVILY_API_KEY;
  });

  // ── Event sequence ──────────────────────────────────────────────────────────

  it("emits expected event sequence for a single-mind, single-round agon (no research)", async () => {
    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Should AI be regulated?",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        research: false,
      })
    );

    const types = events.map((e) => e.type);

    // No research events when research: false
    expect(types).not.toContain("research_started");
    expect(types).not.toContain("research_done");

    // Round structure
    expect(types).toContain("round_start");
    expect(types).toContain("turn_start");
    expect(types).toContain("turn_chunk");
    expect(types).toContain("turn_done");

    // Consensus
    expect(types).toContain("consensus_started");
    expect(types).toContain("consensus_done");
    expect(types).toContain("agon_done");

    // Ordering: round before turns, consensus after turns
    const roundIdx = types.indexOf("round_start");
    const turnIdx = types.indexOf("turn_start");
    const consensusIdx = types.indexOf("consensus_started");
    const doneIdx = types.indexOf("agon_done");

    expect(roundIdx).toBeLessThan(turnIdx);
    expect(turnIdx).toBeLessThan(consensusIdx);
    expect(consensusIdx).toBeLessThan(doneIdx);
  });

  it("streams turn chunks correctly — text from stream lands in turn_done.content", async () => {
    // Override stream to emit two chunks that form a complete thought.
    mocks.mockStream.mockReturnValue(mocks.makeTextStream(["Hello, ", "world."]));

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Multi-chunk streaming test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
      })
    );

    const chunks = events.filter((e) => e.type === "turn_chunk");
    expect(chunks).toHaveLength(2);

    const done = events.find((e) => e.type === "turn_done");
    expect(done).toBeDefined();
    expect((done as Extract<AgonEvent, { type: "turn_done" }>).content).toBe(
      "Hello, world."
    );
  });

  it("uses the API key when constructing the Anthropic client", async () => {
    await collectEvents(
      runAgon({
        apiKey: "sk-ant-specific-key",
        topic: "API key test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
      })
    );

    expect(mocks.MockAnthropic).toHaveBeenCalledWith({
      apiKey: "sk-ant-specific-key",
    });
  });

  // ── Multiple minds ──────────────────────────────────────────────────────────

  it("calls stream once per mind per round for two minds, two rounds", async () => {
    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Two minds, two rounds",
        mindSlugs: ["isaac-newton", "marie-curie"],
        rounds: 2,
      })
    );

    // 2 minds × 2 rounds = 4 turn_start events
    const starts = events.filter((e) => e.type === "turn_start");
    expect(starts).toHaveLength(4);

    // stream called 4 times (once per turn)
    expect(mocks.mockStream).toHaveBeenCalledTimes(4);

    // messages.create called once for convergence only (research: false default)
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
  });

  // ── Consensus JSON parsing ──────────────────────────────────────────────────

  it("parses consensus JSON from messages.create and surfaces it in consensus_done", async () => {
    mocks.mockCreate.mockResolvedValue({
      content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
    });

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Consensus parsing test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
      })
    );

    const done = events.find((e) => e.type === "consensus_done") as
      | Extract<AgonEvent, { type: "consensus_done" }>
      | undefined;

    expect(done).toBeDefined();
    expect(done!.consensus.points).toBe("Both frameworks agree on pragmatism.");
    expect(done!.consensus.steps).toEqual([
      "Step 1: Research",
      "Step 2: Build",
    ]);
    expect(done!.consensus.action).toBe("Build a prototype.");
  });

  it("handles consensus JSON wrapped in code fences (model sometimes adds them)", async () => {
    const fenced = "```json\n" + VALID_CONSENSUS_JSON + "\n```";
    mocks.mockCreate.mockResolvedValue({
      content: [{ type: "text", text: fenced }],
    });

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Fenced JSON test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
      })
    );

    const done = events.find((e) => e.type === "consensus_done") as
      | Extract<AgonEvent, { type: "consensus_done" }>
      | undefined;

    expect(done).toBeDefined();
    expect(done!.consensus.points).toBe("Both frameworks agree on pragmatism.");
  });

  it("uses claude-opus-4-6 for convergence when isPro is true", async () => {
    await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Pro model test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        isPro: true,
      })
    );

    const createCall = mocks.mockCreate.mock.calls[0]?.[0] as
      | { model: string }
      | undefined;
    expect(createCall?.model).toBe("claude-opus-4-6");
  });

  it("uses claude-sonnet-4-6 for convergence when isPro is false (default)", async () => {
    await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Standard model test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        isPro: false,
      })
    );

    const createCall = mocks.mockCreate.mock.calls[0]?.[0] as
      | { model: string }
      | undefined;
    expect(createCall?.model).toBe("claude-sonnet-4-6");
  });

  // ── Research phase ──────────────────────────────────────────────────────────

  it("emits research_started and research_done when research: true", async () => {
    // The research phase calls messages.create (for web_search) then
    // messages.create again for convergence. Set up two resolved values.
    mocks.mockCreate
      .mockResolvedValueOnce({
        // Research response — no web_search_tool_result blocks in this minimal mock
        content: [
          {
            type: "text",
            text: "Research summary: AI regulation is complex.",
          },
        ],
      })
      .mockResolvedValueOnce({
        // Convergence response
        content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
      });

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "AI regulation research test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        research: true,
      })
    );

    const types = events.map((e) => e.type);
    expect(types).toContain("research_started");
    expect(types).toContain("research_done");

    // Research must precede the first round
    expect(types.indexOf("research_done")).toBeLessThan(
      types.indexOf("round_start")
    );
  });

  it("skips Tavily API call when TAVILY_API_KEY is not set", async () => {
    delete process.env.TAVILY_API_KEY;

    mocks.mockCreate
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "Research brief." }],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
      });

    await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "No Tavily test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        research: true,
      })
    );

    // mockTavilyFactory should not be called when TAVILY_API_KEY is unset
    expect(mocks.mockTavilyFactory).not.toHaveBeenCalled();
  });

  it("calls Tavily search + extract when TAVILY_API_KEY is set (mocked Tavily pattern)", async () => {
    process.env.TAVILY_API_KEY = "tvly-test-key";

    // Mock Tavily responses
    mocks.mockTavilyExtract.mockResolvedValue({ results: [] });
    mocks.mockTavilySearch.mockResolvedValue({
      results: [
        {
          title: "AI Regulation News",
          url: "https://example.com/ai-regulation",
          content: "AI regulation is advancing rapidly.",
        },
      ],
    });

    mocks.mockCreate
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "Research brief with Tavily." }],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
      });

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        // Bare URL in the topic triggers Tavily extract
        topic: "https://example.com/ai-regulation — should AI be regulated?",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        research: true,
      })
    );

    // Tavily client factory was called with the API key
    expect(mocks.mockTavilyFactory).toHaveBeenCalledWith({
      apiKey: "tvly-test-key",
    });

    // Tavily search was called
    expect(mocks.mockTavilySearch).toHaveBeenCalled();

    // research_done should surface (research ran)
    const types = events.map((e) => e.type);
    expect(types).toContain("research_done");
  });

  // ── Graceful degradation ────────────────────────────────────────────────────

  it("continues without research if research phase throws", async () => {
    mocks.mockCreate
      .mockRejectedValueOnce(new Error("Simulated research API failure"))
      .mockResolvedValueOnce({
        content: [{ type: "text", text: VALID_CONSENSUS_JSON }],
      });

    const events = await collectEvents(
      runAgon({
        apiKey: FAKE_API_KEY,
        topic: "Graceful degradation test",
        mindSlugs: ["isaac-newton"],
        rounds: 1,
        research: true,
      })
    );

    // research_done still emitted (with empty summary/sources)
    const researchDone = events.find((e) => e.type === "research_done") as
      | Extract<AgonEvent, { type: "research_done" }>
      | undefined;
    expect(researchDone).toBeDefined();
    expect(researchDone!.summary).toBe("");
    expect(researchDone!.sources).toEqual([]);

    // agon_done should still arrive — the agon continues despite research failure
    expect(events.map((e) => e.type)).toContain("agon_done");
  });
});
