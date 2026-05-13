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
      "Do not pivot because the room is anxious. Pivot only when the evidence has broken the current model and the old path is clearly burning runway.",
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
      "Win by choosing terrain, not by forcing a frontal clash. Shape the market so the incumbent's strength stops mattering as much.",
    caption: "Do not fight the wrong battle.",
  },
  evidence: {
    minds: ["Marie Curie", "Isaac Newton", "Marcus Aurelius"],
    consensus:
      "Collect enough signal to decide honestly, then move. The danger is not waiting too long; it is pretending the data is already clear when it is not.",
    caption: "Signal before speed.",
  },
  innovation: {
    minds: ["Nikola Tesla", "Leonardo da Vinci", "Isaac Newton"],
    consensus:
      "Build the future if the upside is genuinely strategic, not cosmetic. The bet is justified when the new version changes the frame, not just the polish.",
    caption: "Build the version that changes the frame.",
  },
  systems: {
    minds: ["Leonardo da Vinci", "Sun Tzu", "Marcus Aurelius"],
    consensus:
      "Look at the pattern between domains before you choose the move. The answer is usually in the system that connects the problem, not the problem itself.",
    caption: "Read the pattern between the parts.",
  },
  // ── Extended court entries — added for full reel coverage (task ae4fab8d) ──
  burnout: {
    minds: ["Marcus Aurelius", "Marie Curie", "Niccolò Machiavelli"],
    consensus:
      "Before you rest, name whether the duty itself is broken or just the pace. If the duty is sound, the strain is a season. If the duty is wrong, no amount of rest will fix it.",
    caption: "Duty first. Then rest.",
  },
  resilience: {
    minds: ["Marcus Aurelius", "Nikola Tesla", "Marie Curie"],
    consensus:
      "Failure is not the opposite of progress — it is the cost of honest experimentation. The question is not whether you failed but whether you extracted the right lesson before moving on.",
    caption: "Extract the lesson. Keep moving.",
  },
  "self-doubt": {
    minds: ["Marcus Aurelius", "Marie Curie", "Isaac Newton"],
    consensus:
      "Self-doubt is only useful when it points to a real gap. When it points to fear of judgment, it is noise. Separate the two before you let it change your direction.",
    caption: "Signal or noise? Decide first.",
  },
  shipping: {
    minds: ["Nikola Tesla", "Niccolò Machiavelli", "Marie Curie"],
    consensus:
      "Ship when the core function is honest. Do not ship when the gap between the promise and the product will cost you the trust you cannot rebuild in the next version.",
    caption: "Ship the honest version.",
  },
  creativity: {
    minds: ["Leonardo da Vinci", "Nikola Tesla", "Marcus Aurelius"],
    consensus:
      "Creative block is not a shortage of ideas — it is a signal that you have stopped making things with your hands. Return to the smallest version of the work and let momentum rebuild itself.",
    caption: "Make something small. Then continue.",
  },
  rebuild: {
    minds: ["Isaac Newton", "Leonardo da Vinci", "Marcus Aurelius"],
    consensus:
      "Start from the axioms, not the assumptions. Rebuilding from first principles is slower at the start and faster at the end — but only if you are honest about which beliefs actually survive first-principles scrutiny.",
    caption: "Axioms first. Then build.",
  },
  reasoning: {
    minds: ["Isaac Newton", "Marie Curie", "Marcus Aurelius"],
    consensus:
      "The goal of first-principles thinking is not novelty — it is honesty. Strip back to what you can actually prove, then rebuild the argument only as far as the evidence supports.",
    caption: "Prove it. Then extend it.",
  },
  portfolio: {
    minds: ["Niccolò Machiavelli", "Marie Curie", "Marcus Aurelius"],
    consensus:
      "Pruning a portfolio is a resource-allocation problem, not an identity crisis. Cut what is no longer aligned with where the leverage is going, not what you have the most emotional history with.",
    caption: "Prune toward leverage.",
  },
  "product strategy": {
    minds: ["Sun Tzu", "Niccolò Machiavelli", "Marie Curie"],
    consensus:
      "Product strategy is terrain selection before it is feature selection. Pick the ground where the evidence says you can win, then let the product follow the terrain — not the other way around.",
    caption: "Terrain first. Product second.",
  },
  technology: {
    minds: ["Nikola Tesla", "Isaac Newton", "Leonardo da Vinci"],
    consensus:
      "Technology bets are right or wrong based on physics and first principles, not the current hype cycle. Build the version that would still be right in ten years, not the version that fits the current narrative.",
    caption: "What is still true in ten years?",
  },
  product: {
    minds: ["Leonardo da Vinci", "Marie Curie", "Niccolò Machiavelli"],
    consensus:
      "A good product decision requires knowing what the user actually needs, what the data says they do, and what it costs to change. Disagreement among those three is where the real decision lives.",
    caption: "Need, data, cost. Align all three.",
  },
  pricing: {
    minds: ["Niccolò Machiavelli", "Marcus Aurelius", "Marie Curie"],
    consensus:
      "Pricing is a claim about value. Get the claim wrong and you either underprice what you built or overprice what you have not yet earned. Charge what the value actually is, not what feels safe.",
    caption: "Charge what the value actually is.",
  },
};

const MAIN_BEATS: Record<string, string> = {
  pivot:
    "Do not pivot on vibes. Wait until the evidence falsifies the current model, then move decisively.",
  leadership:
    "This is a power problem, not a personality problem. Name the imbalance before it names the decision.",
  strategy:
    "Do not attack strength head-on. Reframe the terrain until the fight changes shape.",
  evidence:
    "Keep collecting signal until the dataset can stand on its own. Do not confuse impatience with clarity.",
  innovation:
    "Ship the future only when the upside is strategic enough to justify the runway it consumes.",
  systems:
    "Look for the pattern that connects the domains. The real answer usually lives between the parts.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "Inspect the duty before you inspect the energy. Fatigue that follows meaningful work is different from fatigue that follows the wrong work.",
  resilience:
    "Do not treat failure as evidence you are wrong. Treat it as data on where the model needs updating.",
  "self-doubt":
    "Name whether the doubt is pointing at a real gap or a fear of judgment. Only one of those is worth acting on.",
  shipping:
    "Ship when the core function is honest and the gap between the promise and the product will not cost you trust you cannot rebuild.",
  creativity:
    "The block is not a shortage of ideas. Return to making something with your hands — momentum follows action, not intention.",
  rebuild:
    "Start from what you can actually prove, not from what you have always assumed. First principles is a discipline, not a slogan.",
  reasoning:
    "Strip the argument to its axioms. Then rebuild only as far as the evidence can carry the weight.",
  portfolio:
    "Prune toward where the leverage is going, not where your emotional history is concentrated.",
  "product strategy":
    "Strategy is terrain selection before it is feature selection. Pick the ground where you can win, then let the product follow.",
  technology:
    "Technology bets should be justified by physics and first principles, not by the current hype cycle.",
  product:
    "A good product decision aligns what the user needs, what the data shows, and what it costs to change. Disagreement between those three is where the real decision lives.",
  pricing:
    "Pricing is a claim about value. Charge what the value actually is — not what feels safe, not what the competition charges.",
};

const SUPPORT_BEATS: Record<string, string> = {
  pivot:
    "Treat the business like a model under test: if it no longer predicts reality, the old strategy has failed.",
  leadership:
    "A clean boundary protects the company better than an emotional debate that keeps dragging on.",
  strategy:
    "Incumbents defend positions, not possibilities. Make them defend the wrong terrain.",
  evidence:
    "The goal is not more data forever. The goal is enough data to stop lying to yourself.",
  innovation:
    "Build the version that changes the frame, but only if the evidence says the frame is worth changing.",
  systems:
    "Cross-domain pattern recognition beats narrow expertise when the issue is really structural.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "Extraordinary output requires extraordinary sacrifice — but only when the sacrifice is in service of the right duty. Check the duty first.",
  resilience:
    "The experiment only fails completely if you stop before the lesson is extracted.",
  "self-doubt":
    "Productive doubt asks 'what do I need to learn?' Corrosive doubt asks 'what will they think?' Know which one is running.",
  shipping:
    "The right time to ship is when the core is honest and the gap between promise and product is survivable.",
  creativity:
    "Creativity is not inspiration followed by execution. It is execution that generates its own momentum.",
  rebuild:
    "Most rebuilds fail not because the new idea was wrong but because the team rebuilt from assumption instead of axiom.",
  reasoning:
    "The strength of a conclusion is limited by the honesty of its premises. Make the premises explicit before you argue the conclusion.",
  portfolio:
    "The portfolio that looks diversified often is not. Identify the common failure mode before you call it balanced.",
  "product strategy":
    "Incumbents protect positions, not possibilities. Move into the terrain they are not defending yet.",
  technology:
    "The question is not whether the technology is impressive. The question is whether it changes the frame in a way that matters.",
  product:
    "Users tell you what they want, but the data shows you what they do. When those two conflict, trust the data and investigate the gap.",
  pricing:
    "Underpricing is not generosity — it is a claim that your work is worth less than it is. That claim compounds over time.",
};

const CLOSE_BEATS: Record<string, string> = {
  pivot:
    "If the metrics say the model is broken, cut the path that keeps the burn alive.",
  leadership:
    "Make the cut clean, protect the team, and do not let resentment write the script.",
  strategy:
    "Choose the move that changes the geometry of the market, not the one that feels boldest.",
  evidence:
    "When the signal is finally strong enough, decide once and move without apology.",
  innovation:
    "If the future is worth the delay, commit. If not, ship the pragmatic version and keep learning.",
  systems:
    "Align the move with the system, not the mood of the moment.",
  // ── Extended beats (task ae4fab8d) ──
  burnout:
    "If the duty is real, recover enough to return to it. If it is not, no vacation will make it worth having.",
  resilience:
    "Do not just survive the failure. Extract the insight that justifies the cost.",
  "self-doubt":
    "Act on the best available evidence of your own ability. Revise only when the data warrants revision — not when the feeling does.",
  shipping:
    "Do not wait for perfect. Ship the version that is honest about what it does and what it does not.",
  creativity:
    "Start with the smallest thing you can make today. The rest of the work follows from there.",
  rebuild:
    "Build from axioms to conclusions, not from conclusions backward. The second way produces confidence without accuracy.",
  reasoning:
    "When the argument holds at the axiom level, commit. When it does not, rebuild before you extend.",
  portfolio:
    "Cut what is no longer aligned with where the leverage is going. Hold what is irreplaceable. Do not confuse the two.",
  "product strategy":
    "Choose the terrain where the incumbent's strength stops mattering. Then build specifically for that terrain.",
  technology:
    "The right technology bet changes the frame. The wrong one just adds complexity to an already complicated situation.",
  product:
    "When need, data, and cost align, ship. When they do not, the disagreement is the most important signal you have.",
  pricing:
    "Set the price that reflects the value you are actually delivering. Then have the integrity to defend it.",
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
  const duration = estimateDurationSeconds(entry);

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

function estimateDurationSeconds(entry: InsightEntry): number {
  const base = 26 + Math.round((entry.hookQuestion.length + entry.description.length) / 140);
  return Math.max(25, Math.min(40, base));
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
