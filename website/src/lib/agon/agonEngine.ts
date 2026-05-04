import Anthropic from "@anthropic-ai/sdk";
import { tavily } from "@tavily/core";
import type { FrameworkSlug } from "@/lib/frameworks";
import { loadFrameworkRaw, getMindName } from "./loadFramework";
import { frameworkToSystemPrompt } from "./frameworkPrompt";
import { buildTurnPrompt, buildConvergencePrompt } from "./prompts";
import type { AgonEvent, AgonTurn, ConsensusResult, ResearchSource } from "./types";

const RESEARCH_MODEL = "claude-sonnet-4-6";
const TURN_MODEL = "claude-sonnet-4-6";
const CONVERGENCE_MODEL = "claude-sonnet-4-6";
const RESEARCH_MAX_TOKENS = 1500;
const TURN_MAX_TOKENS = 600;
const CONVERGENCE_MAX_TOKENS = 2000;

interface ResearchResult {
  summary: string;
  sources: ResearchSource[];
}

/* ── Tavily helpers ── */

function extractUrls(text: string): string[] {
  // Match URLs with protocol, or bare domains like example.com
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const domainRegex = /(?<!\w)([a-z0-9][-a-z0-9]*\.)+[a-z]{2,}(?:\/[^\s"'<>]*)?/gi;

  const urls = new Set<string>();
  for (const match of text.matchAll(urlRegex)) {
    urls.add(match[0].replace(/[.,;:!?)]+$/, "")); // strip trailing punctuation
  }
  for (const match of text.matchAll(domainRegex)) {
    const cleaned = match[0].replace(/[.,;:!?)]+$/, "");
    // Skip common non-URL domains
    if (!cleaned.match(/\.(js|ts|tsx|css|md|json)$/i)) {
      urls.add(cleaned.startsWith("http") ? cleaned : `https://${cleaned}`);
    }
  }
  return [...urls];
}

interface TavilyContext {
  urlContent: string; // fetched page content from extracted URLs
  searchContent: string; // search results for the topic
  sources: ResearchSource[];
}

async function fetchTavilyContext(topic: string): Promise<TavilyContext | null> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return null;

  const client = tavily({ apiKey: tavilyKey });
  const urls = extractUrls(topic);
  const sources: ResearchSource[] = [];
  let urlContent = "";
  let searchContent = "";

  // 1. Extract content from any URLs mentioned in the question
  if (urls.length > 0) {
    try {
      const extracted = await client.extract(urls);
      if (extracted.results && extracted.results.length > 0) {
        const parts: string[] = [];
        for (const r of extracted.results) {
          if (r.rawContent) {
            parts.push(`=== Content from ${r.url} ===\n${r.rawContent.slice(0, 3000)}`);
            sources.push({ title: r.url, url: r.url });
          }
        }
        urlContent = parts.join("\n\n");
      }
    } catch {
      // URL extraction failed — continue with search
    }
  }

  // 2. Do a Tavily search for broader topic context
  try {
    const searchResult = await client.search(topic.slice(0, 400), {
      searchDepth: "basic",
      maxResults: 5,
    });
    if (searchResult.results && searchResult.results.length > 0) {
      const parts: string[] = [];
      for (const r of searchResult.results) {
        if (r.content) {
          parts.push(`"${r.title ?? r.url}" — ${r.content.slice(0, 400)}`);
          if (r.url && r.title && !sources.some((s) => s.url === r.url)) {
            sources.push({ title: r.title, url: r.url });
          }
        }
      }
      searchContent = parts.join("\n\n");
    }
  } catch {
    // Search failed — continue without it
  }

  if (!urlContent && !searchContent) return null;
  return { urlContent, searchContent, sources };
}

/* ── Main research function ── */

async function performResearch(
  anthropic: Anthropic,
  topic: string
): Promise<ResearchResult> {
  // Run Tavily and Claude web_search in parallel
  const [tavilyCtx, claudeResponse] = await Promise.all([
    fetchTavilyContext(topic).catch(() => null),
    anthropic.messages.create({
      model: RESEARCH_MODEL,
      max_tokens: RESEARCH_MAX_TOKENS,
      tools: [
        {
          type: "web_search_20250305" as const,
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [
        {
          role: "user",
          content: `You are a research analyst preparing a factual brief for a panel of strategic advisors. The panel will debate the following decision:

"${topic}"

Search for relevant current data, market context, and factual background. Focus on:
- Key facts, statistics, and current data relevant to this decision
- Recent developments or trends that bear on it
- Any quantitative data points that would inform the analysis

Write a concise research brief (200-400 words). Cite specific sources. Focus on facts, not opinions. The advisors will use this to ground their arguments in reality.`,
        },
      ],
    }),
  ]);

  // Extract text blocks and sources from Claude's web search
  const textParts: string[] = [];
  const sources: ResearchSource[] = [];

  // Add Tavily sources first (they tend to be higher quality for mentioned URLs)
  if (tavilyCtx) {
    sources.push(...tavilyCtx.sources);
  }

  for (const block of claudeResponse.content) {
    if (block.type === "text") {
      textParts.push(block.text);
    }
    // Extract sources from server-side web search results
    if (block.type === "web_search_tool_result" && "content" in block) {
      const results = (block as unknown as Record<string, unknown>).content;
      if (Array.isArray(results)) {
        for (const r of results) {
          if (r && typeof r === "object" && "url" in r && "title" in r) {
            const src = r as { url: string; title: string };
            if (src.url && src.title && !sources.some((s) => s.url === src.url)) {
              sources.push({ title: src.title, url: src.url });
            }
          }
        }
      }
    }
  }

  // Combine: Tavily deep context + Claude web search summary
  const summaryParts: string[] = [];

  if (tavilyCtx?.urlContent) {
    summaryParts.push(
      "=== SITE CONTENT (fetched from URLs mentioned in the question) ===\n" +
        tavilyCtx.urlContent
    );
  }
  if (tavilyCtx?.searchContent) {
    summaryParts.push(
      "=== ADDITIONAL WEB RESEARCH (Tavily) ===\n" + tavilyCtx.searchContent
    );
  }

  const claudeSummary = textParts.join("\n\n").trim();
  if (claudeSummary) {
    summaryParts.push(
      "=== WEB SEARCH ANALYSIS (Claude) ===\n" + claudeSummary
    );
  }

  const summary = summaryParts.join("\n\n");
  return { summary, sources: sources.slice(0, 12) };
}

interface RunAgonArgs {
  apiKey: string;
  topic: string;
  mindSlugs: FrameworkSlug[];
  rounds: number;
  research?: string | null;
  isPro?: boolean;
}

export async function* runAgon(
  args: RunAgonArgs
): AsyncGenerator<AgonEvent, void, unknown> {
  const { apiKey, topic, mindSlugs, rounds, isPro } = args;

  const anthropic = new Anthropic({ apiKey });

  // ── Research phase ──
  let research: string | null = null;
  try {
    yield { type: "research_started" };
    const result = await performResearch(anthropic, topic);
    research = result.summary;
    yield {
      type: "research_done",
      summary: result.summary,
      sources: result.sources,
    };
  } catch (err) {
    // Research is best-effort — if it fails, proceed without it
    yield {
      type: "research_done",
      summary: "",
      sources: [],
    };
  }

  const council = mindSlugs.map((slug) => ({
    slug,
    name: getMindName(slug),
  }));

  const systemPrompts = new Map<FrameworkSlug, string>();
  for (const slug of mindSlugs) {
    const raw = loadFrameworkRaw(slug);
    if (raw) {
      systemPrompts.set(slug, frameworkToSystemPrompt(raw));
    } else {
      systemPrompts.set(
        slug,
        `You reason as ${getMindName(slug)}. No framework data was loaded — speak in their voice but acknowledge uncertainty.`
      );
    }
  }

  const allTurns: AgonTurn[] = [];

  for (let round = 1; round <= rounds; round++) {
    yield { type: "round_start", round };

    for (const mind of council) {
      const others = council.filter((c) => c.slug !== mind.slug);
      const userPrompt = buildTurnPrompt({
        topic,
        selfName: mind.name,
        selfSlug: mind.slug,
        others,
        round,
        totalRounds: rounds,
        priorTurns: allTurns,
        research: research ?? null,
      });

      yield {
        type: "turn_start",
        mindSlug: mind.slug,
        mindName: mind.name,
        round,
      };

      let content = "";
      const stream = anthropic.messages.stream({
        model: TURN_MODEL,
        max_tokens: TURN_MAX_TOKENS,
        system: systemPrompts.get(mind.slug)!,
        messages: [{ role: "user", content: userPrompt }],
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          "delta" in event &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          content += text;
          yield { type: "turn_chunk", mindSlug: mind.slug, text };
        }
      }

      const turn: AgonTurn = {
        mindSlug: mind.slug,
        mindName: mind.name,
        round,
        content,
      };
      allTurns.push(turn);

      yield {
        type: "turn_done",
        mindSlug: mind.slug,
        mindName: mind.name,
        round,
        content,
      };
    }
  }

  yield { type: "consensus_started" };

  const convergencePrompt = buildConvergencePrompt({
    topic,
    council,
    turns: allTurns,
    research: research ?? null,
  });

  const convergenceMsg = await anthropic.messages.create({
    model: isPro ? "claude-opus-4-6" : CONVERGENCE_MODEL,
    max_tokens: CONVERGENCE_MAX_TOKENS,
    system:
      "You are a strategic synthesis analyst. You distill multi-perspective debates into structured, actionable JSON. You never hedge. You always return valid JSON with no surrounding prose.",
    messages: [{ role: "user", content: convergencePrompt }],
  });

  const rawText = convergenceMsg.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  const consensus = parseConsensusJson(rawText);

  yield { type: "consensus_done", consensus };
  yield { type: "agon_done" };
}

function parseConsensusJson(raw: string): ConsensusResult {
  // Strip code fences if the model added them
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }

  // Find the outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Convergence response did not contain a JSON object");
  }
  const jsonText = cleaned.slice(start, end + 1);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Convergence response was not valid JSON");
  }

  function str(key: string): string {
    const v = parsed[key];
    if (typeof v !== "string") return "";
    return v;
  }
  function strArr(key: string): string[] {
    const v = parsed[key];
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string");
  }

  return {
    points: str("points"),
    pointsSummary: str("pointsSummary"),
    tensions: str("tensions"),
    tensionsSummary: str("tensionsSummary"),
    action: str("action"),
    actionSummary: str("actionSummary"),
    steps: strArr("steps"),
    stepsSummary: str("stepsSummary"),
    risks: str("risks"),
    risksSummary: str("risksSummary"),
  };
}
