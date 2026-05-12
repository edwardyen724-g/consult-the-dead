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
  /** Optional synthetic agon transcript excerpt for SEO listicle articles. */
  agonExcerpt?: Array<{ speaker: string; text: string }>;
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
      "Art of War tariff strategy",
      "startup trade war strategy",
      "Sun Tzu economics",
      "tariff supply chain strategy",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Tariff shocks are hitting your margins and your competitors are panicking. Do you read the market as terrain, or as a price war you have to win head-on?",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The general who knows the terrain does not curse the weather. He maneuvers inside it. A tariff is not an attack on your product — it is a change in the ground beneath your competitor's feet and yours. The question is not how to survive it. The question is which of you is better positioned to move.",
      },
      {
        speaker: "Sun Tzu",
        text: "He who panics first concedes the repositioning advantage to those who did not. Your supply chain is not a liability — it is a concealed flank. Map it now, before your opponent does.",
      },
    ],
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
      "Machiavelli leadership advice",
      "how to fire someone you respect",
      "founder leadership conflict",
      "how would Machiavelli handle conflict",
    ],
    decisionType: "leadership",
    hookQuestion:
      "You respect the person, but the team is losing confidence. Do you preserve the relationship, or make the hard call before trust erodes further?",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Machiavelli",
        text: "A prince who delays the necessary wound out of affection inflicts a deeper one in the end. The team watching you hesitate learns that sentiment governs the institution — and that lesson spreads faster than any policy.",
      },
      {
        speaker: "Machiavelli",
        text: "Respect the person privately. Act on the power problem publicly, cleanly, and without theater. The cruelty of half-measures — a demotion, a narrowed scope, a private warning — is that it signals weakness while solving nothing.",
      },
    ],
  },
  {
    slug: "what-would-marcus-aurelius-say-about-imposter-syndrome",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title: "What Would Marcus Aurelius Say About Imposter Syndrome?",
    description:
      "Marcus Aurelius ruled an empire while privately doubting his own adequacy — and left a record of how he handled it. His Stoic framework reframes imposter syndrome not as a defect to cure, but as a signal that duty is still alive.",
    targetKeywords: [
      "Marcus Aurelius imposter syndrome",
      "stoic advice for self-doubt",
      "stoicism for founders",
      "Marcus Aurelius founder advice",
      "overcoming imposter syndrome",
    ],
    decisionType: "identity",
    hookQuestion:
      "You feel like a fraud in the room — like the moment someone looks closely enough, the gap between your confidence and your actual capability will collapse. Marcus Aurelius felt this too. His answer wasn't reassurance.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "Ask yourself whether the discomfort you feel is the voice of inadequacy or the voice of duty. A man who has stopped caring whether he is adequate has also stopped caring whether he performs his role well. The two are not separable. The unease is not your enemy — it is the guard that keeps you honest.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "You were not appointed to this role because you had conquered all doubt. You were appointed to this role because the work requires you. Do the work. The question of whether you deserve to do it is a distraction — and the Stoic notices distractions.",
      },
    ],
  },
  {
    slug: "marcus-aurelius-vs-sun-tzu-on-product-decisions",
    type: "collision",
    frameworkSlug: "marcus-aurelius",
    collisionFrameworkSlugs: ["marcus-aurelius", "sun-tzu"],
    title: "Marcus Aurelius vs. Sun Tzu on Product Decisions",
    description:
      "Two masters of strategic discipline with opposite approaches to the same question: when to hold the line and when to shift terrain. One builds from virtue, the other from positioning.",
    targetKeywords: [
      "product decision framework",
      "strategic product thinking",
      "stoic product management",
    ],
    decisionType: "product strategy",
    hookQuestion:
      "Your roadmap is at a fork: double down on what is working or shift toward an emerging opportunity. Marcus Aurelius and Sun Tzu have opposite answers — and both are right.",
    publishedAt: "2026-05-11",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "The emperor who would serve products well must first serve the user well. Every feature you ship either builds something worth sustaining or adds weight that will eventually sink the ship. Audit the purpose, not the metrics.",
      },
      {
        speaker: "Sun Tzu",
        text: "You are measuring the engagement of a campaign after the battle has already begun. The wise product leader wins before the roadmap meeting — by understanding the terrain of user behavior before a single ticket is written.",
      },
    ],
  },
  {
    slug: "seneca-and-epictetus-on-dealing-with-failure",
    type: "collision",
    frameworkSlug: "seneca",
    collisionFrameworkSlugs: ["seneca", "epictetus"],
    title: "What Seneca and Epictetus Say About Dealing with Failure",
    description:
      "Two Stoic philosophers who lived radically different lives have radically different prescriptions for failure. One sees it as Fortune's tax on ambition. The other says you were already broken before it happened.",
    targetKeywords: [
      "how to deal with failure",
      "stoic philosophy failure",
      "learning from failure framework",
    ],
    decisionType: "resilience",
    hookQuestion:
      "You shipped something that didn't work. The post-mortem is done. Now what? Seneca and Epictetus agree failure is inevitable — and disagree on everything else.",
    publishedAt: "2026-05-11",
    agonExcerpt: [
      {
        speaker: "Seneca",
        text: "Failure is the tax Fortune levies on all who dare to build. The question is not how to avoid the payment — it is whether you spent the proceeds on something worth the cost.",
      },
      {
        speaker: "Epictetus",
        text: "You were not a slave to the outcome before you shipped it. You became one when you decided your peace of mind depended on whether it succeeded. The lesson is not about the failure — it is about what you were surrendering before you even began.",
      },
    ],
  },
  {
    slug: "tesla-and-ada-lovelace-on-the-future-of-computing",
    type: "collision",
    frameworkSlug: "nikola-tesla",
    collisionFrameworkSlugs: ["nikola-tesla", "ada-lovelace"],
    title: "Tesla vs. Lovelace on the Future of Computing",
    description:
      "Two visionaries who imagined technologies decades before they existed are forced to debate the AI question. Their frameworks are not compatible — and that is the point.",
    targetKeywords: [
      "AI future debate",
      "artificial intelligence technology future",
      "computing visionary debate",
    ],
    decisionType: "technology",
    hookQuestion:
      "One obsessed with energy transmission, one with universal computation — Tesla and Lovelace both saw the future before it arrived. Their frameworks collide on what AI actually is.",
    publishedAt: "2026-05-11",
    agonExcerpt: [
      {
        speaker: "Nikola Tesla",
        text: "Every intelligence — artificial or otherwise — requires energy to think. The question your researchers keep avoiding is not whether the model will be intelligent. It is whether the infrastructure can sustain it at the scale you are imagining.",
      },
      {
        speaker: "Ada Lovelace",
        text: "Tesla is asking the wrong question. The constraint is not energy — it is representation. Can the machine be given a notation for things it has never directly observed? That is the bottleneck. I was writing algorithms for a machine that did not yet exist. The question now is what operations to encode.",
      },
    ],
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
  // SEO listicle expansion 2026-05 (task c7400a14) — 3 long-tail organic pages
  {
    slug: "stoics-on-failure",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title:
      "What Marcus Aurelius, Seneca, and Epictetus Say About Dealing With Failure",
    description:
      "Three Stoic philosophers — an emperor, an advisor, and a freed slave — debate how to handle failure, setbacks, and adversity. Their answers disagree in ways that matter.",
    targetKeywords: [
      "stoics on failure",
      "how stoics deal with failure",
      "marcus aurelius failure",
      "seneca adversity",
      "epictetus setback",
      "stoic philosophy failure",
    ],
    decisionType: "resilience",
    hookQuestion:
      "You've just failed publicly. The post-mortem is done. Three Stoics — an emperor, a senator, a slave — each hand you a different prescription. Only one of them is actually useful right now.",
    publishedAt: "2026-05-11",
  },
  {
    slug: "steve-jobs-on-product",
    type: "single",
    frameworkSlug: "steve-jobs",
    title:
      "Steve Jobs' Decision Framework: How He Said No to 1,000 Things",
    description:
      "Steve Jobs' most counterintuitive insight wasn't about design — it was about elimination. His framework reveals why adding features is almost always the wrong answer.",
    targetKeywords: [
      "steve jobs decision framework",
      "steve jobs product strategy",
      "how steve jobs made decisions",
      "steve jobs say no",
      "product prioritization framework",
      "simplicity product strategy",
    ],
    decisionType: "product",
    hookQuestion:
      "You have ten things on your product roadmap. Your team wants to ship eight of them. Steve Jobs would ship one — and he'd be right. The framework behind that choice is not what you think.",
    publishedAt: "2026-05-11",
  },
  {
    slug: "founders-on-pricing",
    type: "single",
    frameworkSlug: "john-d-rockefeller",
    title:
      "What History's Greatest Thinkers Say About Pricing Your Product",
    description:
      "From Rockefeller's cost-architecture discipline to Carnegie's value-capture logic, history's sharpest strategic minds reveal why most founders price backwards.",
    targetKeywords: [
      "pricing strategy advice",
      "how to price your product",
      "startup pricing framework",
      "value based pricing",
      "rockefeller pricing strategy",
      "founder pricing mistakes",
    ],
    decisionType: "pricing",
    hookQuestion:
      "You're staring at your pricing page wondering if you're leaving money on the table — or about to lose every deal. History's most successful builders had a precise answer. It's not what most pricing guides tell you.",
    publishedAt: "2026-05-11",
  },
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
  "what-would-marcus-aurelius-say-about-imposter-syndrome": [
    {
      label: "Duty vs. doubt",
      source: (entry) => entry.hookQuestion,
      excerpt: "like a fraud",
      constructIndex: 0,
    },
    {
      label: "Stoic framing",
      source: (entry) => entry.description,
      excerpt: "duty is still alive",
      constructIndex: 1,
    },
  ],
  "stoics-on-failure": [
    {
      label: "Moral system under stress",
      source: (entry) => entry.hookQuestion,
      excerpt: "failed publicly",
      constructIndex: 0,
    },
    {
      label: "Self-governance",
      source: (entry) => entry.description,
      excerpt: "adversity",
      constructIndex: 1,
    },
  ],
  "steve-jobs-on-product": [
    {
      label: "Paradigm creation",
      source: (entry) => entry.hookQuestion,
      excerpt: "product roadmap",
      constructIndex: 0,
    },
    {
      label: "Ecosystem orchestration",
      source: (entry) => entry.description,
      excerpt: "elimination",
      constructIndex: 1,
    },
  ],
  "founders-on-pricing": [
    {
      label: "Structural position",
      source: (entry) => entry.hookQuestion,
      excerpt: "pricing page",
      constructIndex: 0,
    },
    {
      label: "Architectural form",
      source: (entry) => entry.description,
      excerpt: "cost-architecture",
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
