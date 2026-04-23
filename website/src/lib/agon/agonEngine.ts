import Anthropic from "@anthropic-ai/sdk";
import type { FrameworkSlug } from "@/lib/frameworks";
import { loadFrameworkRaw, getMindName } from "./loadFramework";
import { frameworkToSystemPrompt } from "./frameworkPrompt";
import { buildTurnPrompt, buildConvergencePrompt } from "./prompts";
import type { AgonEvent, AgonTurn, ConsensusResult } from "./types";

const TURN_MODEL = "claude-sonnet-4-6";
const CONVERGENCE_MODEL = "claude-sonnet-4-6";
const TURN_MAX_TOKENS = 600;
const CONVERGENCE_MAX_TOKENS = 2000;

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
  const { apiKey, topic, mindSlugs, rounds, research, isPro } = args;

  const anthropic = new Anthropic({ apiKey });

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
