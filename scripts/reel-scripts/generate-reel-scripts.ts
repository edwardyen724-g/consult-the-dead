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
  identity: {
    minds: ["Marcus Aurelius", "Marie Curie", "Nikola Tesla"],
    consensus:
      "Before you act on the fatigue, name whether the duty itself is broken or just the pace. If the duty is sound, the strain is a season. If the duty is wrong, no amount of rest will fix it.",
    caption: "Duty first. Then rest.",
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
  identity:
    "Inspect the duty before you inspect the energy. Fatigue that follows meaningful work is different from fatigue that follows the wrong work.",
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
  identity:
    "Extraordinary output requires extraordinary sacrifice. That is not a flaw in the mission — it is the cost of a mission worth having.",
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
  identity:
    "If the duty is real, recover enough to return to it. If it is not, no vacation will make it worth having.",
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
