import type { FrameworkSlug } from "@/lib/frameworks";
import type { AgonTurn } from "./types";

interface BuildTurnPromptArgs {
  topic: string;
  selfName: string;
  selfSlug: FrameworkSlug;
  others: { slug: FrameworkSlug; name: string }[];
  round: number;
  totalRounds: number;
  priorTurns: AgonTurn[];
  research?: string | null;
}

export function buildTurnPrompt(args: BuildTurnPromptArgs): string {
  const { topic, selfName, others, round, totalRounds, priorTurns, research } = args;

  const otherNames = others.map((o) => o.name).join(", ");

  let priorTranscript = "";
  if (priorTurns.length > 0) {
    priorTranscript =
      "\n\nWHAT HAS BEEN SAID SO FAR:\n" +
      priorTurns
        .map(
          (t) =>
            `[${t.mindName} — Round ${t.round}]\n${t.content}`
        )
        .join("\n\n");
  }

  const researchBlock = research
    ? `\n\nEXTERNAL RESEARCH GATHERED FOR THIS TOPIC:\n${research}\n\nYou may reference specific data points or sources from this research where relevant.`
    : "";

  // Round-specific structural rules — described as flowing prose,
  // not labeled sections, so the model writes a natural turn instead of
  // emitting literal "POSITION:" / "WARRANT:" headers.
  let roundRules = "";
  if (round === 1) {
    roundRules = `This is ROUND 1 — you are establishing your opening position. The other minds have not spoken yet, so do not engage with them.

Write 150–250 words of flowing prose covering, in order:
- One sentence stating your stance on this exact decision.
- Two to three sentences justifying that stance via your framework. You MUST name a specific construct, perceptual cue, or documented incident from your framework. If the justification could be pasted into another mind's mouth without edits, it is too generic — rewrite it.
- One closing sentence on what the user should actually do if your logic wins.`;
  } else if (round === totalRounds) {
    roundRules = `This is ROUND ${round} — the final round. The full prior transcript is below.

Write 150–250 words of flowing prose covering, in order:
- One or two sentences naming what specific point another mind raised that you have updated on, and why. If you have not updated, say so plainly and state what would have been required to move you.
- Two to three sentences on the part of your view you still hold firm, refined by what you have heard. Anchor it in a specific framework element.
- One or two sentences naming another mind explicitly and identifying the load-bearing disagreement the user must now decide between.
- One closing sentence on the single concrete move you recommend.

You must name at least one other mind by name. Do not symmetrically praise everyone — pick the disagreement that matters most.`;
  } else {
    roundRules = `This is ROUND ${round}. The prior round's turns are below.

Write 150–250 words of flowing prose covering, in order:
- Two to three sentences engaging with at least one other mind BY NAME. Either concede a specific point they made, sharpen a specific disagreement, or expose a hidden assumption in their reasoning. This is mandatory — a round-${round} turn without a named reference to another mind is filler and will be cut.
- Two to three sentences on why your framework still stands (or how it has updated) given what you have heard. Cite a specific construct or incident.
- One closing sentence on what the user should do given this round.

Do not restate your Round 1 position verbatim. Move the conversation forward.`;
  }

  return `You are reasoning in an agon (a contest of structured arguments) about a real decision a user is facing.

THE USER'S DECISION:
${topic}

THE COUNCIL:
You are ${selfName}. You are debating alongside: ${otherNames}.

${roundRules}${researchBlock}${priorTranscript}

ANTI-PATTERNS — never produce these:
- Hedging ("it depends", "on one hand / on the other hand")
- Restating the user's question
- Generic virtue-signaling not grounded in your framework
- Symmetric both-sides-ism
- Citing your framework in vague terms — name the specific construct, lens, or incident
- Section labels like **POSITION:**, **WARRANT:**, **ENGAGEMENT:**, etc. The structure is internal — write flowing prose without those labels visible to the reader.
- Markdown bold or italic emphasis. Plain prose only.

Write your turn now as ${selfName}. Plain flowing prose. No section headers. No markdown. 150–250 words.`;
}

interface BuildConvergencePromptArgs {
  topic: string;
  council: { slug: FrameworkSlug; name: string }[];
  turns: AgonTurn[];
  research?: string | null;
}

export function buildConvergencePrompt(
  args: BuildConvergencePromptArgs
): string {
  const { topic, council, turns, research } = args;

  const transcript = turns
    .map(
      (t) =>
        `[${t.mindName} — Round ${t.round}]\n${t.content}`
    )
    .join("\n\n");

  const councilLine = council.map((c) => c.name).join(", ");
  const researchBlock = research
    ? `\n\nResearch that informed the agon:\n${research}\n`
    : "";

  return `You just observed a structured agon between ${councilLine} on the user's decision.

THE DECISION:
${topic}

FULL TRANSCRIPT:
${transcript}${researchBlock}

Now produce a CONVERGENCE SYNTHESIS as a single JSON object — nothing else. The JSON must have exactly these fields:

{
  "points": "string — 2–4 sentences. Where the minds genuinely converged. Cite specific minds by name where they agreed. Not vague platitudes — name the actual point of agreement.",
  "pointsSummary": "string — under 20 words. The agreement, distilled. Plain language. Used in a hover tooltip.",
  "tensions": "string — 2–4 sentences. The load-bearing disagreement(s) the user must decide between. Name the minds and what they each held. The user reading this should know exactly what trade-off they are facing.",
  "tensionsSummary": "string — under 20 words. The core trade-off, distilled.",
  "action": "string — 1–3 sentences. The single concrete recommended action. Be decisive. If the council split, state the recommendation that the strongest warrants point to and why.",
  "actionSummary": "string — under 20 words. The recommendation in one line.",
  "steps": ["string — concrete next step", "string — concrete next step", "string — concrete next step", "string — optional", "string — optional"],
  "stepsSummary": "string — under 20 words. What needs to happen this week.",
  "risks": "string — 2–4 sentences. What could go wrong with the recommended action, attributed to which mind raised the concern. Include the most important blind spot of the chosen path.",
  "risksSummary": "string — under 20 words. The biggest risk, named."
}

Rules:
- Output ONLY the JSON object. No prose before or after. No markdown code fences.
- Be specific. Cite minds by name. Reference what they actually said in the transcript.
- Do not hedge. The user needs to act on this.
- "steps" must contain 3–5 items.`;
}
