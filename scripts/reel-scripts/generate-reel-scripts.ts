#!/usr/bin/env tsx
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import {
  INSIGHT_ENTRIES,
  type InsightEntry,
} from "../../website/src/lib/insights";

export type CouncilBeat = {
  mind: string;
  line: string;
};

export type VerdictReelScript = {
  slug: string;
  articleTitle: string;
  frameworkSlug: string;
  decisionType: string;
  estimatedDurationSeconds: number;
  hook: {
    voiceover: string;
    caption: string;
  };
  councilPass: CouncilBeat[];
  consensus: string;
  cta: string;
  captions: string[];
};

type CliInput = {
  stdout?: (chunk: string) => void;
  stderr?: (chunk: string) => void;
};

const DECISION_COURT: Record<
  string,
  { minds: [string, string, string]; consensus: string; caption: string }
> = {
  pivot: {
    minds: ["Isaac Newton", "Marie Curie", "Niccolò Machiavelli"],
    consensus:
      "Pivot only when evidence breaks the model. Anxiety is not evidence.",
    caption: "Stop guessing. Start measuring.",
  },
  leadership: {
    minds: ["Niccolò Machiavelli", "Marcus Aurelius", "Marie Curie"],
    consensus:
      "This is a power-and-boundaries decision first. Cut the drag cleanly, then make sure the company keeps compounding after the decision.",
    caption: "Power problem. Clean decision.",
  },
  strategy: {
    minds: ["Sun Tzu", "Niccolò Machiavelli", "Leonardo da Vinci"],
    consensus:
      "Win by choosing terrain. Shape the market until the incumbent's strength stops mattering.",
    caption: "Do not fight the wrong battle.",
  },
  evidence: {
    minds: ["Marie Curie", "Isaac Newton", "Marcus Aurelius"],
    consensus:
      "Collect enough signal to decide honestly, then move. Do not pretend the data is clear when it is not.",
    caption: "Signal before speed.",
  },
  innovation: {
    minds: ["Nikola Tesla", "Leonardo da Vinci", "Isaac Newton"],
    consensus:
      "Build the future only when the new version changes the frame, not just the polish.",
    caption: "Build the version that changes the frame.",
  },
  systems: {
    minds: ["Leonardo da Vinci", "Sun Tzu", "Marcus Aurelius"],
    consensus:
      "The answer lives in the system connecting the parts, not in any single problem.",
    caption: "Read the pattern between the parts.",
  },
  // ── Extended court entries — added for full reel coverage (task ae4fab8d) ──
  burnout: {
    minds: ["Marcus Aurelius", "Marie Curie", "Niccolò Machiavelli"],
    consensus:
      "Name whether the duty is broken or just the pace. If the duty is wrong, rest will not fix it.",
    caption: "Duty first. Then rest.",
  },
  resilience: {
    minds: ["Marcus Aurelius", "Nikola Tesla", "Marie Curie"],
    consensus:
      "Failure is the cost of honest experimentation. Extract the right lesson before moving on.",
    caption: "Extract the lesson. Keep moving.",
  },
  "self-doubt": {
    minds: ["Marcus Aurelius", "Marie Curie", "Isaac Newton"],
    consensus:
      "Self-doubt pointing to a real gap is signal. Pointing to fear of judgment, it is noise. Separate them.",
    caption: "Signal or noise? Decide first.",
  },
  shipping: {
    minds: ["Nikola Tesla", "Niccolò Machiavelli", "Marie Curie"],
    consensus:
      "Ship when the core is honest. Do not ship when the gap will cost you trust you cannot rebuild.",
    caption: "Ship the honest version.",
  },
  creativity: {
    minds: ["Leonardo da Vinci", "Nikola Tesla", "Marcus Aurelius"],
    consensus:
      "Creative block means you stopped making. Return to the smallest version of the work and let momentum rebuild.",
    caption: "Make something small. Then continue.",
  },
  rebuild: {
    minds: ["Isaac Newton", "Leonardo da Vinci", "Marcus Aurelius"],
    consensus:
      "Start from the axioms, not the assumptions. Only beliefs that survive first-principles scrutiny belong in the rebuild.",
    caption: "Axioms first. Then build.",
  },
  reasoning: {
    minds: ["Isaac Newton", "Marie Curie", "Marcus Aurelius"],
    consensus:
      "Strip back to what you can actually prove. Rebuild the argument only as far as the evidence supports.",
    caption: "Prove it. Then extend it.",
  },
  portfolio: {
    minds: ["Niccolò Machiavelli", "Marie Curie", "Marcus Aurelius"],
    consensus:
      "Cut what no longer aligns with where leverage is going, not what you have the most history with.",
    caption: "Prune toward leverage.",
  },
  "product strategy": {
    minds: ["Sun Tzu", "Niccolò Machiavelli", "Marie Curie"],
    consensus:
      "Pick the ground where evidence says you can win. Let the product follow the terrain, not the other way around.",
    caption: "Terrain first. Product second.",
  },
  technology: {
    minds: ["Nikola Tesla", "Isaac Newton", "Leonardo da Vinci"],
    consensus:
      "Technology bets are right or wrong based on physics, not hype. Build what is still right in ten years.",
    caption: "What is still true in ten years?",
  },
  product: {
    minds: ["Leonardo da Vinci", "Marie Curie", "Niccolò Machiavelli"],
    consensus:
      "Align user need, data, and cost to change. The disagreement between those three is the real decision.",
    caption: "Need, data, cost. Align all three.",
  },
  pricing: {
    minds: ["Niccolò Machiavelli", "Marcus Aurelius", "Marie Curie"],
    consensus:
      "Pricing is a claim about value. Charge what the value actually is, not what feels safe.",
    caption: "Charge what the value actually is.",
  },
  // ── Wave 2 court entries ─────────────────────────────────────────────
  scaling: {
    minds: ["Napoleon Bonaparte", "Marcus Aurelius", "Marie Curie"],
    consensus:
      "Growth rate is not a strategy. Close the gap between tempo and logistics before you add the next division.",
    caption: "Tempo follows logistics, not the other way around.",
  },
  // ── Wave 4 court entries ─────────────────────────────────────────────
  persuasion: {
    minds: ["Cicero", "Benjamin Franklin", "Marcus Aurelius"],
    consensus:
      "Know your audience's interest before you speak. Argue only what cannot be refuted, in the fewest words truth allows.",
    caption: "Argue only what cannot be refuted.",
  },
  control: {
    minds: ["Epictetus", "Marcus Aurelius", "Seneca"],
    consensus:
      "You cannot control outcomes or judgments. Control only your own response and effort. Ignore everything else.",
    caption: "Control your response. Nothing else.",
  },
  // ── Wave 3 court entries ─────────────────────────────────────────────
  focus: {
    minds: ["Steve Jobs", "Leonardo da Vinci", "Marcus Aurelius"],
    consensus:
      "Focus is a discipline decision. The question is not what to add — it is what to remove.",
    caption: "Say no. That is the whole strategy.",
  },
  crisis: {
    minds: ["Abraham Lincoln", "Marcus Aurelius", "Niccolò Machiavelli"],
    consensus:
      "The crisis failure mode is pretending certainty you do not have. Decide honestly and build in capacity to update.",
    caption: "Decide clearly. Update honestly.",
  },
  "time-management": {
    minds: ["Benjamin Franklin", "Marcus Aurelius", "Leonardo da Vinci"],
    consensus:
      "You cannot save time. The only question is whether your hours are deliberate choice or accumulated drift.",
    caption: "What did you choose today? Or did it choose you?",
  },
  iteration: {
    minds: ["Thomas Edison", "Marie Curie", "Leonardo da Vinci"],
    consensus:
      "Iteration is the mechanism of discovery. Are you failing fast enough and extracting the right lesson each time?",
    caption: "Each failure narrows the field.",
  },
  hiring: {
    minds: ["Andrew Carnegie", "Niccolò Machiavelli", "Benjamin Franklin"],
    consensus:
      "Hiring is a leverage decision. Hire for trajectory, and design the role so the right person cannot help but succeed.",
    caption: "Hire for trajectory. Design the role for success.",
  },
  procrastination: {
    minds: ["Seneca", "Marcus Aurelius", "Benjamin Franklin"],
    consensus:
      "Procrastination is rarely about the task. Find the actual obstacle — not the excuse — and it usually ends.",
    caption: "Name the real reason. Then start.",
  },
  // ── Wave 7 court entries ─────────────────────────────────────────────
  finance: {
    minds: ["John D. Rockefeller", "Marie Curie", "Sun Tzu"],
    consensus:
      "Unit economics are a product problem. Early margin structure constrains every strategic option you will have later.",
    caption: "Know what each unit costs. Build from there.",
  },
  relationship: {
    minds: ["Cleopatra VII", "Niccolò Machiavelli", "Sun Tzu"],
    consensus:
      "Give them a win that costs you little. Keep the relationship productive. Never let dependence become real.",
    caption: "Alignment, not dependence.",
  },
  // ── Wave 8 court entries ─────────────────────────────────────────────
  meta: {
    minds: ["Marie Curie", "Isaac Newton", "Niccolò Machiavelli"],
    consensus:
      "Generic advice regresses to the mean. A framework built from real decisions under real constraints does not.",
    caption: "Specific beats generic. Always.",
  },
  // ── Wave 23 court entries ─────────────────────────────────────────────
  "people-vs-terrain": {
    minds: ["Andrew Carnegie", "Sun Tzu", "Niccolò Machiavelli"],
    consensus:
      "Identify your primary constraint first. Solve the terrain problem or the people problem — not both at once.",
    caption: "Constraint first. Then invest.",
  },
  reform: {
    minds: ["Catherine the Great", "Niccolò Machiavelli", "Marcus Aurelius"],
    consensus:
      "Run the concentration diagnostic first. Name the few people whose changed behavior shifts the dysfunction most, then act.",
    caption: "Diagnose first. Then reform.",
  },
  ownership: {
    minds: ["Thomas Edison", "Nikola Tesla", "Isaac Newton"],
    consensus:
      "Incremental decisions warrant platform ownership. Paradigm decisions require validating the foundation before building on it.",
    caption: "Incremental or paradigm? Decide first.",
  },
  // ── Wave 23 Joan of Arc addition ─────────────────────────────────────
  conviction: {
    minds: ["Joan of Arc", "Harriet Tubman", "Marcus Aurelius"],
    consensus:
      "Name what you are willing to risk for this conviction. Move before the permission arrives.",
    caption: "Conviction is movement. Not agreement.",
  },
};

const MAIN_BEATS: Record<string, string> = {
  pivot:
    "Do not pivot on vibes. Wait until evidence falsifies the model, then move.",
  leadership:
    "This is a power problem, not a personality problem. Name the imbalance.",
  strategy:
    "Do not attack strength head-on. Reframe the terrain until the fight changes.",
  evidence:
    "Keep collecting signal until the dataset stands alone. Impatience is not clarity.",
  innovation:
    "Ship the future only when the upside justifies the runway it consumes.",
  systems:
    "Look for the pattern connecting the domains. The answer lives between the parts.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "Inspect the duty before you inspect the energy. Check the duty first.",
  resilience:
    "Do not treat failure as proof you are wrong. Treat it as data.",
  "self-doubt":
    "Name whether the doubt points at a real gap or fear of judgment.",
  shipping:
    "Ship when the core is honest and the gap will not cost you trust.",
  creativity:
    "The block is not a shortage of ideas. Return to making something now.",
  rebuild:
    "Start from what you can actually prove. First principles is a discipline.",
  reasoning:
    "Strip the argument to its axioms. Rebuild only as far as evidence allows.",
  portfolio:
    "Prune toward where the leverage is going, not your emotional history.",
  "product strategy":
    "Strategy is terrain selection before feature selection. Pick ground you can win.",
  technology:
    "Technology bets must be justified by physics, not the current hype cycle.",
  product:
    "Align user need, data, and cost to change. Disagreement is the real decision.",
  pricing:
    "Pricing is a claim about value. Charge what the value actually is.",
  // ── Wave 2 beats ──────────────────────────────────────────────────────
  scaling:
    "Logistical architecture must precede operational tempo. Verify the supply line first.",
  // ── Wave 4 beats ──────────────────────────────────────────────────────
  persuasion:
    "Know your audience's strongest interest first. Argue only what cannot be refuted.",
  control:
    "Divide the world into what you control and what you do not. Choose accordingly.",
  // ── Wave 3 beats ──────────────────────────────────────────────────────
  focus:
    "Focus is a subtraction problem. Choose what to cut, not just what to build.",
  crisis:
    "A crisis requires decisions honest about uncertainty and built to be revised.",
  "time-management":
    "Every hour not deliberately chosen is an hour not spent on what matters.",
  iteration:
    "You are not stuck — you are eliminating. Every failure narrows the space.",
  hiring:
    "The hire you regret is always the one where you settled. Hold the bar.",
  procrastination:
    "Name the actual obstacle — not the excuse, the real one — then address it.",
  // ── Wave 7 beats ──────────────────────────────────────────────────────
  finance:
    "Name the unit before you optimize anything. Revenue without margin burns faster.",
  relationship:
    "Find the interest behind the position. Their stated concern is rarely the real one.",
  // ── Wave 8 beats ──────────────────────────────────────────────────────
  meta:
    "Generic advice regresses to the mean. A framework from real decisions does not.",
  // ── Wave 23 beats ─────────────────────────────────────────────────────
  "people-vs-terrain":
    "Identify your primary constraint before investing. Name what is actually blocking progress.",
  reform:
    "Name the few people whose changed behavior shifts the dysfunction most. Start there.",
  ownership:
    "Ask whether this is incremental or paradigm. Validate the foundation before building on it.",
  // ── Wave 23 Joan of Arc addition ─────────────────────────────────────
  conviction:
    "Name whether the conviction is verified by results, not just felt. Move before the conditions are perfect.",
};

const SUPPORT_BEATS: Record<string, string> = {
  pivot:
    "If the model no longer predicts reality, the old strategy has already failed.",
  leadership:
    "A clean boundary protects the company better than an emotional debate does.",
  strategy:
    "Incumbents defend positions, not possibilities. Make them defend the wrong terrain.",
  evidence:
    "The goal is not more data forever. Get enough data to stop lying to yourself.",
  innovation:
    "Build the version that changes the frame — only if the evidence says it is worth it.",
  systems:
    "Cross-domain pattern recognition beats narrow expertise when the issue is structural.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "Extraordinary output requires sacrifice — but only in service of the right duty.",
  resilience:
    "The experiment only fails completely if you stop before extracting the lesson.",
  "self-doubt":
    "Productive doubt asks what to learn. Corrosive doubt asks what they will think.",
  shipping:
    "Ship when the core is honest and the gap between promise and product is survivable.",
  creativity:
    "Creativity is not inspiration followed by execution. Execution generates its own momentum.",
  rebuild:
    "Most rebuilds fail because the team rebuilt from assumption instead of axiom.",
  reasoning:
    "The strength of a conclusion is limited by the honesty of its premises.",
  portfolio:
    "The portfolio that looks diversified often is not. Find the common failure mode.",
  "product strategy":
    "Incumbents protect positions, not possibilities. Move into terrain they are not defending.",
  technology:
    "The question is not whether the technology is impressive — it is whether it changes the frame.",
  product:
    "When user desire and usage data conflict, trust the data and investigate the gap.",
  pricing:
    "Underpricing is not generosity. It claims your work is worth less than it is.",
  // ── Wave 2 beats ──────────────────────────────────────────────────────
  scaling:
    "Overextension looks like momentum until it does not. Is your infrastructure ready?",
  // ── Wave 4 beats ──────────────────────────────────────────────────────
  persuasion:
    "The softened argument weakens you. Say the precise thing and stop hedging.",
  control:
    "Nothing external can take your focus from what you can actually do about it.",
  // ── Wave 3 beats ──────────────────────────────────────────────────────
  focus:
    "Jobs succeeded by cutting everything that did not belong. Removal is harder than addition.",
  crisis:
    "Lincoln's strength was willingness to revise decisions without losing strategic direction.",
  "time-management":
    "Franklin designed his day before the day designed him. That is the entire system.",
  iteration:
    "Edison proved ten thousand things that did not work. That is still progress.",
  hiring:
    "Hire people smarter than you, give them room, hold them accountable for outcomes.",
  procrastination:
    "Procrastination is self-deception about what the task actually requires. Name it.",
  // ── Wave 7 beats ──────────────────────────────────────────────────────
  finance:
    "Early cost structure becomes the ceiling on every option you will have later.",
  relationship:
    "Give the win that costs you least while giving them what they value most.",
  // ── Wave 8 beats ──────────────────────────────────────────────────────
  meta:
    "Curie published precise measurements, not generalities. Real frameworks encode real constraints.",
  // ── Wave 23 beats ─────────────────────────────────────────────────────
  "people-vs-terrain":
    "Great people on wrong terrain execute the wrong strategy impressively. Fix terrain first.",
  reform:
    "Compliance without commitment is a ceiling. Build belief before announcing everything is broken.",
  ownership:
    "The DC system was commercially viable — until AC physics made it a liability.",
  // ── Wave 23 Joan of Arc addition ─────────────────────────────────────
  conviction:
    "The institution will validate the conviction after the results are in — not before.",
};

const CLOSE_BEATS: Record<string, string> = {
  pivot:
    "If the metrics say the model is broken, cut the path keeping the burn alive.",
  leadership:
    "Make the cut clean, protect the team, and do not let resentment write the script.",
  strategy:
    "Choose the move that changes the market's geometry, not the one that feels boldest.",
  evidence:
    "When the signal is strong enough, decide once and move without apology.",
  innovation:
    "If the future is worth the delay, commit. If not, ship the pragmatic version.",
  systems:
    "Align the move with the system, not the mood of the moment.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "If the duty is real, recover to return. If it is not, no vacation fixes it.",
  resilience:
    "Do not just survive the failure. Extract the insight that justifies the cost.",
  "self-doubt":
    "Act on the best evidence of your ability. Revise when data warrants — not feeling.",
  shipping:
    "Do not wait for perfect. Ship the version honest about what it does and does not.",
  creativity:
    "Start with the smallest thing you can make today. The rest follows.",
  rebuild:
    "Build from axioms to conclusions. The reverse produces confidence without accuracy.",
  reasoning:
    "When the argument holds at the axiom level, commit. If not, rebuild first.",
  portfolio:
    "Cut what no longer aligns with leverage. Hold what is irreplaceable. Know the difference.",
  "product strategy":
    "Choose terrain where the incumbent's strength stops mattering. Build for that terrain.",
  technology:
    "The right bet changes the frame. The wrong one adds complexity to a complicated situation.",
  product:
    "When need, data, and cost align, ship. If they do not, the disagreement is the signal.",
  pricing:
    "Set the price that reflects the value you are delivering. Then defend it.",
  // ── Wave 2 beats ──────────────────────────────────────────────────────
  scaling:
    "Close the gap between growth rate and operational capacity before the gap closes you.",
  // ── Wave 4 beats ──────────────────────────────────────────────────────
  persuasion:
    "What three things about your position cannot be refuted? Argue those and only those.",
  control:
    "What are you trying to change that is not in your control? Stop. Do what is.",
  // ── Wave 3 beats ──────────────────────────────────────────────────────
  focus:
    "What is on your roadmap that does not belong? Cut that first. Then build.",
  crisis:
    "What does your decision look like if the next news is bad? Build for that.",
  "time-management":
    "At day's end: did you spend your hours, or did they spend you?",
  iteration:
    "What did the last failure tell you? Extract that, then run the next experiment.",
  hiring:
    "Are you designing roles that great people want? That is the real recruitment strategy.",
  procrastination:
    "What is the smallest step you could take right now? Take it. The rest follows.",
  // ── Wave 7 beats ──────────────────────────────────────────────────────
  finance:
    "Gross margin is the architecture of survival. Know it down to variable cost per transaction.",
  relationship:
    "Dependence invites control. Maintain leverage so the relationship stays mutual.",
  // ── Wave 8 beats ──────────────────────────────────────────────────────
  meta:
    "Stop asking for advice. Specify the framework and the decision. The output will be better.",
  // ── Wave 23 beats ─────────────────────────────────────────────────────
  "people-vs-terrain":
    "What is the primary constraint — terrain clarity or execution capability? Invest in what is blocking.",
  reform:
    "Would the reform look different if the three most resistant people left? If yes, the dysfunction is concentrated.",
  ownership:
    "Name the technical approach most likely to make your architecture obsolete. Solve that first.",
  // ── Wave 23 Joan of Arc addition ─────────────────────────────────────
  conviction:
    "The act of holding the conviction in the face of the institution is the proof the conviction is real.",
};

function titleCase(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function looksLikeInsight(entry: InsightEntry | undefined): entry is InsightEntry {
  return Boolean(entry);
}

export function getInsightEntry(slug: string): InsightEntry | null {
  return INSIGHT_ENTRIES.find((entry) => entry.slug === slug) ?? null;
}

export function getSupportedSlugs(): string[] {
  return INSIGHT_ENTRIES.map((entry) => entry.slug);
}

function getCouncil(entry: InsightEntry): { minds: [string, string, string]; consensus: string; caption: string } {
  return DECISION_COURT[entry.decisionType] ?? {
    minds: [entry.frameworkSlug, "Marcus Aurelius", "Marie Curie"],
    consensus: "Read the problem through the framework first, then use the supporting minds to pressure-test the move.",
    caption: "Three minds. One verdict.",
  };
}

export function buildVerdictReelScript(slug: string): VerdictReelScript {
  const entry = getInsightEntry(slug);
  if (!looksLikeInsight(entry)) {
    throw new Error(`Unknown insight slug: ${slug}. Known slugs: ${getSupportedSlugs().join(", ")}`);
  }

  const council = getCouncil(entry);
  const title = titleCase(entry.title);
  const voiceover = truncate(entry.hookQuestion, 180);
  const main = MAIN_BEATS[entry.decisionType] ?? `Frame the issue through ${titleCase(entry.decisionType)} before you decide.`;
  const support = SUPPORT_BEATS[entry.decisionType] ?? "Use the council to separate signal from noise.";
  const close = CLOSE_BEATS[entry.decisionType] ?? "Choose the move that keeps the system honest.";
  const duration = estimateDurationSeconds(entry, council);

  return {
    slug: entry.slug,
    articleTitle: title,
    frameworkSlug: entry.frameworkSlug,
    decisionType: entry.decisionType,
    estimatedDurationSeconds: duration,
    hook: {
      voiceover,
      caption: truncate(title, 44),
    },
    councilPass: [
      { mind: council.minds[0], line: main },
      { mind: council.minds[1], line: support },
      { mind: council.minds[2], line: close },
    ],
    consensus: council.consensus,
    cta: `Read the full article at /insights/${entry.slug} and bring your own decision.`,
    captions: [
      truncate(`Verdict Reel: ${title}`, 96),
      council.caption,
      truncate(`Watch the full council verdict on /insights/${entry.slug}`, 96),
    ],
  };
}

const _WORDS_PER_SECOND = 2.5;
const _PAUSE_SECONDS = 2.2; // ~0.4 hook pause + 3×0.5 council pauses + 0.3 consensus pause

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateDurationSeconds(entry: InsightEntry, council: { consensus: string }): number {
  const hook = truncate(entry.hookQuestion, 180);
  const main = MAIN_BEATS[entry.decisionType] ?? `Frame the issue through ${entry.decisionType} before you decide.`;
  const support = SUPPORT_BEATS[entry.decisionType] ?? "Use the council to separate signal from noise.";
  const close = CLOSE_BEATS[entry.decisionType] ?? "Choose the move that keeps the system honest.";
  const cta = `Read the full article at /insights/${entry.slug} and bring your own decision.`;

  const words = wordCount(hook) + wordCount(main) + wordCount(support) + wordCount(close) + wordCount(council.consensus) + wordCount(cta);
  const spoken = words / _WORDS_PER_SECOND;
  return Math.round(spoken + _PAUSE_SECONDS);
}

export function renderVerdictReelScript(script: VerdictReelScript): string {
  return JSON.stringify(script, null, 2);
}

export function parseCliArgs(argv: string[]): { slug: string | null; dryRun: boolean; help: boolean } {
  let slug: string | null = null;
  let dryRun = false;
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--slug") {
      slug = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg.startsWith("--slug=")) {
      slug = arg.slice("--slug=".length) || null;
    }
  }

  return { slug, dryRun, help };
}

function usage(): string {
  return [
    "Usage: tsx scripts/reel-scripts/generate-reel-scripts.ts --slug <insight-slug> --dry-run",
    "",
    "The dry-run path emits a deterministic JSON verdict-reel artifact to stdout.",
    "Supported slugs:",
    ...getSupportedSlugs().map((slug) => `  - ${slug}`),
  ].join("\n");
}

export function runCli(argv: string[], io: CliInput = {}): number {
  const stdout = io.stdout ?? ((chunk: string) => process.stdout.write(chunk));
  const stderr = io.stderr ?? ((chunk: string) => process.stderr.write(chunk));
  const { slug, dryRun, help } = parseCliArgs(argv);

  if (help) {
    stdout(`${usage()}\n`);
    return 0;
  }

  if (!slug) {
    stderr("Missing required --slug <insight-slug> argument.\n");
    stderr(`${usage()}\n`);
    return 1;
  }

  if (!dryRun) {
    stderr("Only --dry-run is supported in this capsule.\n");
    stderr(`${usage()}\n`);
    return 1;
  }

  try {
    const script = buildVerdictReelScript(slug);
    stdout(`${renderVerdictReelScript(script)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr(`${message}\n`);
    return 1;
  }
}

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) return false;
  return resolve(entryPath) === fileURLToPath(import.meta.url);
})();

if (isMainModule) {
  process.exitCode = runCli(process.argv.slice(2));
}
