import type { BipolarConstruct, Framework, FrameworkSlug } from "./frameworks";
import { getFramework } from "./frameworks";

export const INSIGHT_SITE_URL = "https://www.consultthedead.com";

export type InsightType = "single" | "collision";

interface InsightBaseEntry {
  slug: string;
  type: InsightType;
  frameworkSlug: FrameworkSlug;
  title: string;
  description: string;
  targetKeywords: string[];
  decisionType: string;
  hookQuestion: string;
  publishedAt: string;
  updatedAt?: string;
}

export interface SingleInsightEntry extends InsightBaseEntry {
  type: "single";
}

export interface CollisionInsightEntry extends InsightBaseEntry {
  type: "collision";
  collisionFrameworkSlugs: [FrameworkSlug, FrameworkSlug];
}

export type InsightEntry = SingleInsightEntry | CollisionInsightEntry;

export const INSIGHT_ENTRIES: InsightEntry[] = [
  {
    slug: "how-newton-would-approach-your-pivot-decision",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "How Newton Would Approach Your Pivot Decision",
    description:
      "Newton didn't pivot — he waited for proof. His framework demands mathematical certainty before abandoning a position. Here's what that means for your startup.",
    targetKeywords: [
      "should I pivot my startup",
      "first principles thinking pivot",
      "how to decide to pivot",
    ],
    decisionType: "pivot",
    hookQuestion:
      "You're three months from running out of runway and the metrics aren't moving. Every advisor says pivot. But do you have enough evidence to know what's actually broken?",
    publishedAt: "2026-04-18",
  },
  {
    slug: "machiavelli-on-when-to-fire-your-cofounder",
    type: "single",
    frameworkSlug: "niccolo-machiavelli",
    title: "Machiavelli on When to Fire Your Cofounder",
    description:
      "Machiavelli saw every relationship through the lens of power dynamics. His framework reveals what most founder breakup advice misses entirely.",
    targetKeywords: [
      "cofounder conflict",
      "when to fire cofounder",
      "founder disagreement",
    ],
    decisionType: "leadership",
    hookQuestion:
      "Your cofounder isn't pulling their weight, but they hold 40% equity and key relationships. This isn't a performance review — it's a power calculation.",
    publishedAt: "2026-04-19",
  },
  {
    slug: "sun-tzu-on-entering-a-market-with-incumbents",
    type: "single",
    frameworkSlug: "sun-tzu",
    title: "Sun Tzu on Entering a Market with Incumbents",
    description:
      "Sun Tzu never attacked strength directly. His framework for market entry prioritizes terrain analysis and indirect approach over brute competition.",
    targetKeywords: [
      "how to enter competitive market",
      "startup market entry strategy",
      "competing with incumbents",
    ],
    decisionType: "strategy",
    hookQuestion:
      "The market has three well-funded incumbents. Everyone says 'find a niche.' But Sun Tzu would tell you the niche is the wrong question — the terrain is.",
    publishedAt: "2026-04-20",
  },
  {
    slug: "curie-on-whether-you-have-enough-data-to-decide",
    type: "single",
    frameworkSlug: "marie-curie",
    title: "Curie on Whether You Have Enough Data to Decide",
    description:
      "Curie spent four years isolating radium from eight tons of ore. Her framework for evidence gathering reveals when 'move fast' is actually 'move blind.'",
    targetKeywords: [
      "data driven decision making",
      "when to make a decision",
      "analysis paralysis vs moving fast",
    ],
    decisionType: "evidence",
    hookQuestion:
      "Everyone tells you to 'just ship it.' But you've seen what happens when you ship without understanding the problem. How much evidence is enough?",
    publishedAt: "2026-04-21",
  },
  {
    slug: "tesla-on-whether-to-build-the-future-or-ship-today",
    type: "single",
    frameworkSlug: "nikola-tesla",
    title: "Tesla on Whether to Build the Future or Ship Today",
    description:
      "Tesla chose AC over DC when everyone backed Edison. His framework for innovation timing reveals when betting on the future is rational, not reckless.",
    targetKeywords: [
      "build vs ship decision",
      "innovation timing",
      "when to invest in R&D",
    ],
    decisionType: "innovation",
    hookQuestion:
      "You could ship the pragmatic version now, or spend six more months building the version that changes everything. Tesla faced this exact dilemma — and the answer isn't what you'd expect.",
    publishedAt: "2026-04-22",
  },
  {
    slug: "da-vinci-on-what-youre-not-seeing-in-your-business",
    type: "single",
    frameworkSlug: "leonardo-da-vinci",
    title: "Da Vinci on What You're Not Seeing in Your Business",
    description:
      "Leonardo saw connections invisible to specialists. His framework for cross-domain pattern recognition reveals the blind spots that domain experts always miss.",
    targetKeywords: [
      "business blind spots",
      "cross domain thinking",
      "systems thinking business",
    ],
    decisionType: "systems",
    hookQuestion:
      "You've talked to customers, read the data, consulted advisors. But Leonardo would tell you the answer isn't in your domain — it's in the pattern between domains.",
    publishedAt: "2026-04-23",
  },
  {
    slug: "machiavelli-vs-curie-on-pruning-a-portfolio",
    type: "collision",
    frameworkSlug: "niccolo-machiavelli",
    collisionFrameworkSlugs: ["niccolo-machiavelli", "marie-curie"],
    title: "Machiavelli vs. Curie on Pruning a Portfolio",
    description:
      "A collision article on whether a founder should prune underperforming products aggressively or measure first before cutting anything that still generates signal.",
    targetKeywords: [
      "portfolio pruning",
      "should I cut underperforming products",
      "decision between strategy and evidence",
    ],
    decisionType: "portfolio",
    hookQuestion:
      "Your portfolio is profitable, but the weakest products are absorbing attention. Is this a power problem or a measurement problem?",
    publishedAt: "2026-05-10",
  },
  {
    slug: "what-would-marcus-aurelius-say-about-burnout",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title: "What Would Marcus Aurelius Say About Burnout?",
    description:
      "Marcus Aurelius treated exhaustion as a cue to inspect duty, not a reason to chase comfort. His Stoic framework shows when burnout is a signal to reset and when it is just a season of strain.",
    targetKeywords: [
      "Marcus Aurelius on burnout",
      "stoic advice for burnout",
      "burnout recovery for founders",
    ],
    decisionType: "identity",
    hookQuestion:
      "You feel burned out, but is the fatigue exposing a broken duty cycle or just a temporary season of strain?",
    publishedAt: "2026-05-12",
  },
  {
    slug: "what-would-sun-tzu-say-about-tariffs-and-trade-wars",
    type: "single",
    frameworkSlug: "sun-tzu",
    title: "What Would Sun Tzu Say About Tariffs and Trade Wars?",
    description:
      "Sun Tzu treats tariff shocks as terrain, not theater. His framework clarifies when to reposition supply lines, when to wait, and when to strike through the flank.",
    targetKeywords: [
      "Sun Tzu on trade war",
      "tariff strategy",
      "startup trade war strategy",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Tariff shocks are hitting your margins and your competitors are panicking. Do you read the market as terrain, or as a price war you have to win head-on?",
    publishedAt: "2026-05-12",
  },
  {
    slug: "what-would-machiavelli-say-about-firing-someone-you-respect",
    type: "single",
    frameworkSlug: "niccolo-machiavelli",
    title: "What Would Machiavelli Say About Firing Someone You Respect?",
    description:
      "Machiavelli separates personal respect from institutional necessity. His framework helps founders act when loyalty is real, but the power balance has already shifted.",
    targetKeywords: [
      "Machiavelli on firing employees",
      "how to fire someone you respect",
      "founder leadership conflict",
    ],
    decisionType: "leadership",
    hookQuestion:
      "You respect the person, but the team is losing confidence. Do you preserve the relationship, or make the hard call before trust erodes further?",
    publishedAt: "2026-05-12",
  },
  // HIDDEN 2026-04-16 pending legal review — see docs/roster-expansion.md
  // Einstein insight article re-enable when albert-einstein is restored to FrameworkSlug.
  // {
  //   slug: "why-chatgpt-gives-generic-advice-and-what-to-do-instead",
  //   frameworkSlug: "albert-einstein",
  //   title: "Why ChatGPT Gives Generic Advice (And What to Do Instead)",
  //   description:
  //     "HBR found all major LLMs cluster around the same strategic advice. Einstein's framework for paradigm-breaking thought explains why — and offers the antidote.",
  //   targetKeywords: [
  //     "ChatGPT gives generic advice",
  //     "AI advice quality",
  //     "AI trendslop",
  //     "better AI for strategic thinking",
  //   ],
  //   decisionType: "meta",
  //   hookQuestion:
  //     "You asked ChatGPT for strategic advice and got the same answer your competitor got. A 2026 HBR study proved this isn't a bug — it's how LLMs work. So what's the alternative?",
  // },
];

export function getInsightEntry(slug: string): InsightEntry | undefined {
  return INSIGHT_ENTRIES.find((entry) => entry.slug === slug);
}

export function isCollisionInsightEntry(
  entry: InsightEntry,
): entry is CollisionInsightEntry {
  return entry.type === "collision";
}

export function getInsightFrameworks(entry: InsightEntry): Framework[] {
  if (isCollisionInsightEntry(entry)) {
    return entry.collisionFrameworkSlugs
      .map((slug) => getFramework(slug))
      .filter((framework): framework is Framework => framework !== null);
  }
  const framework = getFramework(entry.frameworkSlug);
  return framework ? [framework] : [];
}

export function getInsightUrl(slug: string, siteUrl = INSIGHT_SITE_URL): string {
  return `${siteUrl}/insights/${slug}`;
}

export function getInsightPublishedAt(entry: InsightEntry): Date {
  return new Date(`${entry.publishedAt}T00:00:00Z`);
}

/* ── Annotation layer (passage highlighting) ── */

export interface InsightPassageSegment {
  text: string;
  highlighted: boolean;
}

export interface InsightAnnotatedPassage {
  label: string;
  text: string;
  excerpt: string;
  construct: BipolarConstruct;
  detail: string;
}

interface InsightAnnotationBlueprint {
  label: string;
  source: (entry: InsightEntry, framework: Framework) => string;
  excerpt: string;
  constructIndex: number;
}

const INSIGHT_ANNOTATION_BLUEPRINTS: Record<
  string,
  InsightAnnotationBlueprint[]
> = {
  "how-newton-would-approach-your-pivot-decision": [
    {
      label: "Runway pressure",
      source: (entry) => entry.hookQuestion,
      excerpt: "running out of runway",
      constructIndex: 0,
    },
    {
      label: "Proof threshold",
      source: (entry) => entry.description,
      excerpt: "mathematical certainty",
      constructIndex: 1,
    },
  ],
  "machiavelli-on-when-to-fire-your-cofounder": [
    {
      label: "Equity leverage",
      source: (entry) => entry.hookQuestion,
      excerpt: "40% equity",
      constructIndex: 0,
    },
    {
      label: "Power calculation",
      source: (entry) => entry.description,
      excerpt: "power dynamics",
      constructIndex: 1,
    },
  ],
  "sun-tzu-on-entering-a-market-with-incumbents": [
    {
      label: "Wrong question",
      source: (entry) => entry.hookQuestion,
      excerpt: "wrong question",
      constructIndex: 0,
    },
    {
      label: "Terrain analysis",
      source: (entry) => entry.description,
      excerpt: "terrain analysis",
      constructIndex: 1,
    },
  ],
  "curie-on-whether-you-have-enough-data-to-decide": [
    {
      label: "Evidence budget",
      source: (entry) => entry.hookQuestion,
      excerpt: "move fast",
      constructIndex: 0,
    },
    {
      label: "Time to isolate",
      source: (entry) => entry.description,
      excerpt: "four years isolating radium",
      constructIndex: 1,
    },
  ],
  "tesla-on-whether-to-build-the-future-or-ship-today": [
    {
      label: "Future bet",
      source: (entry) => entry.hookQuestion,
      excerpt: "build the future",
      constructIndex: 0,
    },
    {
      label: "Innovation timing",
      source: (entry) => entry.description,
      excerpt: "betting on the future",
      constructIndex: 1,
    },
  ],
  "da-vinci-on-what-youre-not-seeing-in-your-business": [
    {
      label: "Blind spots",
      source: (entry) => entry.hookQuestion,
      excerpt: "answer isn't in your domain",
      constructIndex: 0,
    },
    {
      label: "Cross-domain pattern",
      source: (entry) => entry.description,
      excerpt: "cross-domain pattern recognition",
      constructIndex: 1,
    },
  ],
  "what-would-marcus-aurelius-say-about-burnout": [
    {
      label: "Duty check",
      source: (entry) => entry.hookQuestion,
      excerpt: "burned out",
      constructIndex: 0,
    },
    {
      label: "Stoic reset",
      source: (entry) => entry.description,
      excerpt: "inspect duty",
      constructIndex: 1,
    },
  ],
  "what-would-sun-tzu-say-about-tariffs-and-trade-wars": [
    {
      label: "Tariff shock",
      source: (entry) => entry.hookQuestion,
      excerpt: "Tariff shocks",
      constructIndex: 0,
    },
    {
      label: "Terrain read",
      source: (entry) => entry.description,
      excerpt: "terrain",
      constructIndex: 1,
    },
  ],
  "what-would-machiavelli-say-about-firing-someone-you-respect": [
    {
      label: "Relationship pressure",
      source: (entry) => entry.hookQuestion,
      excerpt: "respect the person",
      constructIndex: 0,
    },
    {
      label: "Institutional necessity",
      source: (entry) => entry.description,
      excerpt: "power balance",
      constructIndex: 1,
    },
  ],
};

function buildConstructDetail(construct: BipolarConstruct): string {
  return `${construct.positive_pole} vs. ${construct.negative_pole}. ${construct.behavioral_implication}`;
}

export function splitPassageByExcerpt(
  text: string,
  excerpt: string,
): InsightPassageSegment[] {
  const source = text.trim();
  const needle = excerpt.trim();

  if (!source || !needle) {
    return [{ text: source, highlighted: false }];
  }

  const lowerSource = source.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const index = lowerSource.indexOf(lowerNeedle);

  if (index < 0) {
    return [{ text: source, highlighted: false }];
  }

  const end = index + needle.length;
  const segments: InsightPassageSegment[] = [];

  if (index > 0) {
    segments.push({ text: source.slice(0, index), highlighted: false });
  }

  segments.push({
    text: source.slice(index, end),
    highlighted: true,
  });

  if (end < source.length) {
    segments.push({ text: source.slice(end), highlighted: false });
  }

  return segments;
}

export function getInsightAnnotatedPassages(
  entry: InsightEntry,
  framework: Framework,
): InsightAnnotatedPassage[] {
  const blueprints = INSIGHT_ANNOTATION_BLUEPRINTS[entry.slug] ?? [];

  return blueprints.flatMap((blueprint) => {
    const construct = framework.bipolar_constructs[blueprint.constructIndex];
    if (!construct) return [];

    const text = blueprint.source(entry, framework).trim();
    if (!text) return [];

    return [
      {
        label: blueprint.label,
        text,
        excerpt: blueprint.excerpt,
        construct,
        detail: buildConstructDetail(construct),
      },
    ];
  });
}
