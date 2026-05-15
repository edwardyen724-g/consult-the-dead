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
  /** Synthesized verdict: which framework's approach wins the agon and why. */
  conclusion?: {
    frameworkSlug?: FrameworkSlug;
    summary: string;
    actionableInsight: string;
  };
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
      "Marcus Aurelius ran an empire for 19 years during plagues, wars, and near-constant political pressure. He wrote about exhaustion not as weakness but as resistance to duty — and left a precise framework for returning to work without pretending the difficulty isn't real.",
    targetKeywords: [
      "Marcus Aurelius on burnout",
      "stoic advice for burnout",
      "Marcus Aurelius founder advice",
      "stoic philosophy exhaustion",
      "how to recover from burnout stoic",
    ],
    decisionType: "burnout",
    hookQuestion:
      "You're so exhausted you can't tell what the work actually is anymore. Everything feels necessary. Nothing feels meaningful. The most powerful man in the Roman world wrote about this exact state for 20 years — not to complain, but to figure out how to get back to work.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "Ask yourself: is it the work that is exhausting you, or the distance between the work you are doing and the work that is actually yours to do? Burnout is the body's signal that you have been performing a role you have not fully committed to. The relief is not rest — it is returning to what is genuinely yours.",
      },
      {
        speaker: "Epictetus",
        text: "You are exhausted by demands that are not in your control. The calendar is not yours. The approvals are not yours. The performance for others is not yours. What remains when you strip those away? That remainder is the work. Begin there, and the exhaustion loses its grip.",
      },
      {
        speaker: "Seneca",
        text: "The man who rests to escape his work will find the rest is hollow. Rest that is preparation for duty restores; rest that is avoidance corrupts. Distinguish between the two before you decide what kind of break you actually need.",
      },
    ],
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
  {
    slug: "what-would-marcus-aurelius-say-about-imposter-syndrome",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title: "What Would Marcus Aurelius Say About Imposter Syndrome",
    description:
      "The most powerful man in the ancient world wrote privately about feeling unworthy of his role. His framework for dealing with imposter syndrome is more demanding — and more useful — than most modern advice.",
    targetKeywords: [
      "imposter syndrome advice",
      "marcus aurelius imposter syndrome",
      "stoic approach to self-doubt",
      "dealing with imposter syndrome at work",
      "what would marcus aurelius say",
    ],
    decisionType: "self-doubt",
    hookQuestion:
      "You've been promoted, funded, or trusted with something big. Now you're sure everyone is about to realize you don't belong here. The most powerful man in the Roman Empire felt this way too — and left a 20-year record of how he dealt with it.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "The question is not whether you deserve your position. The question is whether you are performing your duties with integrity today. Worthiness is not a credential — it is a continuous action.",
      },
      {
        speaker: "Seneca",
        text: "The dread of being exposed is itself the exposure. Those who act despite their uncertainty are indistinguishable from those who feel none.",
      },
      {
        speaker: "Epictetus",
        text: "What is not in your control: whether others judge you adequate. What is in your control: the quality of the work you do right now.",
      },
    ],
  },
  {
    slug: "first-principles-thinking-the-honest-version",
    type: "single",
    frameworkSlug: "marie-curie",
    title: "First Principles Thinking: The Honest Version",
    description:
      "Everyone says 'reason from first principles.' Almost no one explains what a first principle actually is, how to find one, or why the method fails when you apply it to unfamiliar domains. Here is the version they don't teach in startup podcasts.",
    targetKeywords: [
      "first principles thinking",
      "what is first principles thinking",
      "first principles reasoning",
      "first principles vs analogy thinking",
      "how to think from first principles",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "You've been told to 'reason from first principles.' But what is a first principle? How do you know when you've found one? And why does this method work for physics and engineering but fail spectacularly for social, political, and human decisions?",
    publishedAt: "2026-05-12",
  },
  // ── Batch 2: 'What Would X Say' articles (task bbb0c9bb) ─────────────
  {
    slug: "what-would-newton-say-about-rebuilding-from-first-principles",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "What Would Newton Say About Rebuilding From First Principles?",
    description:
      "Newton did not accept inherited wisdom — he derived mechanics from scratch, working alone until every calculation was verified. His framework for rebuilding from first principles shows when starting over is rational, not nostalgic.",
    targetKeywords: [
      "Newton first principles",
      "first principles thinking Newton",
      "how to rebuild a product from scratch",
      "when to start over in a startup",
      "first principles rebuilding strategy",
    ],
    decisionType: "rebuild",
    hookQuestion:
      "Your architecture is a mess of patches and workarounds. Everyone says 'just refactor incrementally.' But Newton would hand you a different question: have you actually derived what this system needs to do, or are you still inheriting someone else's assumptions?",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "The question is not whether the current structure can be improved. The question is whether you understand the actual phenomenon well enough to build anything at all. Most rebuilds fail not because the engineers are incompetent, but because they begin with assumptions they inherited rather than truths they derived.",
      },
      {
        speaker: "Isaac Newton",
        text: "I did not improve upon Descartes' optics. I discarded his assumptions and measured what light actually does. If your rebuild begins by accepting the existing data model, the existing user flow, or the existing team's mental model of the problem, you have not rebuilt from first principles — you have merely repainted the inherited structure.",
      },
    ],
  },
  {
    slug: "what-would-tesla-say-about-shipping-vs-perfecting",
    type: "single",
    frameworkSlug: "nikola-tesla",
    title: "What Would Tesla Say About Shipping vs. Perfecting?",
    description:
      "Tesla ran complete mental simulations of his inventions before building a single component. His framework reveals when the drive to ship is wisdom and when it is impatience disguised as pragmatism.",
    targetKeywords: [
      "Tesla on perfectionism",
      "Nikola Tesla shipping vs perfecting",
      "when to ship vs when to wait",
      "perfectionism in startups",
      "ship early or build it right",
    ],
    decisionType: "shipping",
    hookQuestion:
      "Your team is split: ship the working version now and iterate, or spend two more months finishing the version that actually solves the problem. Tesla had a strong opinion — and it is not the one startup culture wants you to hear.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Nikola Tesla",
        text: "I do not build until the machine is complete in my mind. Every dimension, every tolerance, every interaction between components — I run it until it fails or it works. When I build the physical version, it performs as calculated. The men who ship quickly and iterate are not being pragmatic. They are paying for the thinking they refused to do upfront.",
      },
      {
        speaker: "Nikola Tesla",
        text: "There is a difference between shipping because you have understood the system and shipping because you are afraid to think it through. The first produces iteration with a direction. The second produces a faster path to a wrong destination.",
      },
    ],
  },
  {
    slug: "what-would-leonardo-say-about-creative-block",
    type: "single",
    frameworkSlug: "leonardo-da-vinci",
    title: "What Would Leonardo Da Vinci Say About Creative Block?",
    description:
      "Leonardo never stayed stuck in one domain when he was blocked. His framework for creative block treats it as a signal to switch fields, not a reason to push harder in the same direction.",
    targetKeywords: [
      "Leonardo da Vinci creative block",
      "how to overcome creative block",
      "creative block solution",
      "creativity techniques from history",
      "da Vinci on creativity",
    ],
    decisionType: "creativity",
    hookQuestion:
      "You have been staring at the same problem for two weeks. Every approach you try hits the same wall. Leonardo would tell you the wall is not in the problem — it is in the domain you are refusing to leave.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Leonardo da Vinci",
        text: "When I could not resolve the proportions of the wing, I studied the structure of the bird's sternum. When I could not render the muscle correctly, I opened the cadaver. The block is never in the work itself — it is in the boundary you have drawn around the relevant evidence. Every domain is a facet of a single reality. The stuck painter needs to become a better anatomist.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "The artist who sits waiting for inspiration has confused a symptom with a diagnosis. Creative block is not the absence of ideas — it is the exhaustion of a particular angle of approach. Change the angle. Study something adjacent. The connection you need is not in the domain where you are stuck.",
      },
    ],
  },
  {
    slug: "what-would-sun-tzu-say-about-entering-saturated-markets",
    type: "single",
    frameworkSlug: "sun-tzu",
    title: "What Would Sun Tzu Say About Entering a Saturated Market?",
    description:
      "Sun Tzu never attacked a fortified position head-on. His framework for market entry treats incumbents as terrain features to be mapped, not walls to be broken through.",
    targetKeywords: [
      "Sun Tzu market entry strategy",
      "how to enter a saturated market",
      "Art of War startup competition",
      "competing in crowded market",
      "Sun Tzu on competition",
    ],
    decisionType: "strategy",
    hookQuestion:
      "The market already has five funded competitors. Three advisors have told you to 'find a niche.' Sun Tzu would tell you the niche question is wrong — you have not finished mapping the terrain.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "You enter a saturated market the way a river enters a plain — not by breaking through the center but by finding where the resistance is absent. The incumbents have fortified the positions they believe matter. They have left unguarded the positions they do not yet understand. Your analysis begins there, not with your own product.",
      },
      {
        speaker: "Sun Tzu",
        text: "The general who attacks a fortified position because his army is enthusiastic has substituted morale for intelligence. Map first. The saturated market is never uniformly defended. Find the exhausted flank — the customer segment the incumbents are serving badly because their cost structure or legacy assumptions make serving it well impossible for them.",
      },
    ],
  },
  // ── Method articles — high-SEO framework explainers (task 7deb5fb2) ──
  {
    slug: "toulmin-argument-model-explained",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "Toulmin Argument Model Explained",
    description:
      "The Toulmin model gives you a six-part structure for any argument: claim, grounds, warrant, backing, qualifier, and rebuttal. It was built to fix the exact failure mode that kills most business arguments — confusing assertion with proof.",
    targetKeywords: [
      "Toulmin model of argumentation",
      "Toulmin argument structure",
      "how to construct an argument",
      "claim grounds warrant backing",
      "toulmin method explained",
      "argument structure framework",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "You've just made your argument. You have data. You have a conclusion. But your audience isn't persuaded. The Toulmin model was built in 1958 to solve exactly this problem: it maps the six structural elements that separate a compelling argument from an assertion that happens to have a chart attached.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Galileo Galilei",
        text: "The argument that cannot be falsified is not an argument — it is a declaration. I did not claim that the Earth moves by asserting it louder than those who claimed it stood still. I showed them the moons of Jupiter. The grounds of an argument determine whether it can be tested; claims without testable grounds are not science. They are tradition.",
      },
      {
        speaker: "Isaac Newton",
        text: "Every conclusion in the Principia rests on a chain from axiom to derived proposition. The warrant — the rule that licenses the step from evidence to conclusion — must be explicit. A claim that hides its warrant is a claim that cannot be examined. Make the warrant visible, and the argument becomes correctable.",
      },
      {
        speaker: "Marie Curie",
        text: "I did not simply announce that polonium and radium existed. I provided the grounds: the radioactivity measurements, the isolation procedures, the independently verifiable methodology. The qualifier is also essential — I was not claiming certainty beyond what the data supported. A good argument knows its own boundaries.",
      },
    ],
  },
  {
    slug: "cynefin-framework-explained",
    type: "single",
    frameworkSlug: "leonardo-da-vinci",
    title: "The Cynefin Framework Explained",
    description:
      "The Cynefin framework sorts every decision into one of five domains — Clear, Complicated, Complex, Chaotic, and Disorder — and tells you which decision approach is appropriate for each. Most founders apply the wrong approach: using best-practice checklists in Complex situations, or expert analysis in Chaotic ones. The framework's real value is diagnosing which domain you are in before you decide how to decide.",
    targetKeywords: [
      "Cynefin framework",
      "Cynefin framework explained",
      "when to use Cynefin",
      "Cynefin decision making",
      "Cynefin for founders",
      "Cynefin framework domains",
      "complex vs complicated decision making",
    ],
    decisionType: "systems",
    hookQuestion:
      "You have a decision in front of you. Everyone is asking for a plan — a clear roadmap, best practices, a definitive answer. But what if the problem is not the kind of problem that has a clear answer yet? The Cynefin framework was built for exactly this moment: it tells you which kind of problem you actually have before you decide how to approach it.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Leonardo da Vinci",
        text: "Every system has a structure that precedes its understanding. Before you apply a solution, you must determine what kind of system you are dealing with — a mechanical system that responds predictably to intervention, or a living system that adapts in ways the intervention cannot anticipate. Applying the wrong kind of thinking to the wrong kind of system is not just inefficiency: it is the reliable production of surprise.",
      },
      {
        speaker: "Sun Tzu",
        text: "The general who treats every battle as the same battle has already lost. The terrain of a complex problem does not reward the tactics of a simple one. In the complex domain, you do not analyze and then act — you probe, observe the response, and then commit. Small bets before large ones. Reversible before irreversible. The probe is not indecision; it is intelligence.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Distinguish what is in your control from what is not. In a complex system, the full outcome is not in your control — only your next probe. The Stoic discipline here is to act with full commitment on the probe while holding the outcome with detachment. You are not the cause of the system's response; you are the observer who decides what to do next.",
      },
    ],
  },
  // ── Wave 2: 'What Would X Say' articles ───────────────────────────────
  {
    slug: "first-mover-vs-fast-follower-what-sun-tzu-says",
    type: "single",
    frameworkSlug: "sun-tzu",
    title: "First-Mover vs. Fast-Follower: What Sun Tzu Says",
    description:
      "Sun Tzu's framework dissolves the first-mover vs. fast-follower debate into a better question: who controls the terrain? The timing of market entry matters far less than the position you occupy when the market consolidates.",
    targetKeywords: [
      "first mover vs fast follower",
      "first mover advantage myth",
      "Sun Tzu competition strategy",
      "is first mover advantage real",
      "when to enter a market",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Everyone tells you to move fast and establish first-mover advantage. But Google wasn't the first search engine. Facebook wasn't the first social network. Apple wasn't the first MP3 player. Sun Tzu's framework explains why the first-mover advantage is usually a trick question.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The army that arrives first does not win — the army that occupies the right ground wins. First-mover advantage exists only when the first mover chose the terrain wisely. If your competitor moved first into the wrong position, their head start is a gift. Let them exhaust themselves defending ground that does not matter.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "The prince who enters a new domain before it is ready will spend all his resources building what should already exist. The fast-follower who waits until the infrastructure exists — the customers who understand the category, the distribution channels that fit it — often begins where the pioneer ends.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Study the shape of the water before you decide where to swim. The question is not when to enter the market. The question is whether you have mapped the terrain well enough to know which position you are actually competing for.",
      },
    ],
  },
  {
    slug: "what-would-florence-nightingale-say-about-data-driven-decisions",
    type: "single",
    frameworkSlug: "florence-nightingale",
    title: "What Would Florence Nightingale Say About Data-Driven Decisions?",
    description:
      "Nightingale didn't just collect data — she engineered the visualization and delivery channel to match the audience that needed to act on it. Her framework for making data actually drive decisions is more practical than any analytics dashboard.",
    targetKeywords: [
      "data driven decision making examples",
      "how to use data to make better decisions",
      "analytics decision making",
      "Florence Nightingale statistics",
      "why data does not change minds",
    ],
    decisionType: "evidence",
    hookQuestion:
      "You have charts, dashboards, and three months of metrics. The decision should be obvious. But nobody is moving. Nightingale faced the exact same problem — rooms full of data, institutions that didn't change. Here is what she learned.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Marie Curie",
        text: "Data does not speak. People interpret data, and interpretation is shaped by what the interpreter believes before they look. The only defense against this is reproducibility: can the interpretation be reached independently by someone who started with different assumptions? If not, you have not yet made a data-driven decision.",
      },
      {
        speaker: "Isaac Newton",
        text: "The measure of useful data is not its quantity but its specificity. Vague metrics produce vague decisions. Define precisely what you are measuring, what you are assuming it represents, and what alternative explanation you have ruled out before you treat the number as a verdict.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Act on the data you have, not the data you wish you had. The person who waits for perfect information before deciding is not being rigorous — they are using rigor as cover for indecision. The question is not whether the data is complete. The question is whether it is honest.",
      },
    ],
  },
  {
    slug: "what-would-julius-caesar-say-about-moving-into-new-markets",
    type: "single",
    frameworkSlug: "julius-caesar",
    title: "What Would Julius Caesar Say About Moving Into New Markets?",
    description:
      "Caesar didn't test new territory — he committed to it. His framework for expansion reveals a counterintuitive principle: irreversibility is a feature, not a risk. Here is what it means for startup market entry.",
    targetKeywords: [
      "startup geographic expansion",
      "when to expand internationally",
      "market expansion strategy",
      "how to enter a new market",
      "Julius Caesar strategy business",
    ],
    decisionType: "strategy",
    hookQuestion:
      "You're considering expanding into a new market. Everyone tells you to run a pilot, test small, keep your options open. But Caesar crossed the Rubicon with no option to retreat — not because he was reckless, but because he understood that irreversibility forces the commitment that half-measures never can. Here is his framework for knowing when to burn the boats.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The general who enters a new territory with one foot still in the old one has already lost both. The market you are entering will test your commitment before it rewards it. If your competitors sense you are willing to retreat, they will make retreat the only option. Enter where you can win — then commit to that terrain completely.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "New markets are principalities. They will resist you. They will conspire against you. The only remedy is to be present — not through representatives, but through structural commitment that makes retreat costlier than advance. A prince who governs his new territory from a distance governs nothing.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Before you cross into unknown territory, map it completely. Not the territory as you wish it to be, but the territory as it is: the existing players, their dependencies, their vulnerabilities, their alliances. The map that saves you is the one you made before the crossing, not the one you tried to make after.",
      },
    ],
  },
  {
    slug: "what-would-machiavelli-say-about-competitor-espionage",
    type: "single",
    frameworkSlug: "niccolo-machiavelli",
    title: "What Would Machiavelli Say About Researching Competitors?",
    description:
      "Machiavelli built his reputation as the first political scientist to describe power as it actually works — not as it should work. His framework for competitive intelligence is brutally practical: study your enemy's patterns of past decisions, not their stated intentions.",
    targetKeywords: [
      "how to research competitors",
      "competitive intelligence startup",
      "Machiavelli on intelligence",
      "how to analyze competitors",
      "competitive strategy framework",
    ],
    decisionType: "strategy",
    hookQuestion:
      "You want to know what your competitors are actually planning. Everyone tells you to look at their job listings, their blog posts, their pricing pages. But Machiavelli spent his career studying how power actually moves — not how rulers said it moved. Here is the version of competitive research that would survive his review.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "Know your enemy and know yourself, and you will win a hundred battles. But to know your enemy you must first stop looking at their public declarations and start reading the terrain they are positioning to control. Job listings reveal the direction. Partnership announcements reveal the alliances. Pricing changes reveal the pressure. Read the structure, not the statement.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "Your competitor's stated strategy is the least useful thing to know about them. Study their pattern of past decisions — that is the reliable predictor. A prince who has accommodated once will accommodate again; a prince who has struck decisively once will strike again. Pattern trumps declaration every time.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "To understand a mechanism, you must see it from every angle. Intelligence gathered from a single perspective is not intelligence — it is the projection of your own assumptions onto the unknown. Cross-verify from at least three sources before you treat any competitive claim as fact.",
      },
    ],
  },
  {
    slug: "what-would-tesla-say-about-technical-debt",
    type: "single",
    frameworkSlug: "nikola-tesla",
    title: "What Would Tesla Say About Technical Debt?",
    description:
      "Tesla ran every system through exhaustive mental simulation before building. His intolerance for 'good enough' engineering reveals a precise framework for diagnosing technical debt: the difference between debt that defers perfection and debt that corrupts the system model.",
    targetKeywords: [
      "how to deal with technical debt",
      "technical debt startup decision",
      "when to refactor vs ship",
      "Tesla engineering perfectionism",
      "should I pay off technical debt",
    ],
    decisionType: "technology",
    hookQuestion:
      "Your codebase is held together with duct tape and prayer. The team says 'we'll fix it after launch.' But Tesla refused to build anything unless he had fully simulated it in his mind and found no contradictions. Here is his framework for deciding when technical debt is strategic postponement and when it is structural sabotage.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Nikola Tesla",
        text: "Technical debt is not a shortcut — it is a promissory note on the integrity of the system. I never built anything I had not already run to completion in my mind. Your debt is accumulating because you are building without that mental model. The cost is not the time to fix it — it is the confusion that spreads when the model is absent.",
      },
      {
        speaker: "Isaac Newton",
        text: "A system that cannot be understood from its foundations cannot be corrected at its edges. When your architecture is opaque even to those who built it, you have not accumulated debt — you have abandoned the premise of engineering. Begin with what can be derived, not what was assumed.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "What appears to be a shortcut often creates the path that must be walked three times. Examine the structure before you decide whether the debt is architectural or merely cosmetic. Architectural debt compounds. Cosmetic debt is repaid in an afternoon.",
      },
    ],
  },
  {
    slug: "what-would-napoleon-say-about-scaling-too-fast",
    type: "single",
    frameworkSlug: "napoleon-bonaparte",
    title: "What Would Napoleon Say About Scaling Too Fast?",
    description:
      "Napoleon's fatal Russian campaign teaches the lesson that kills fast-growing companies: logistical architecture must precede operational tempo, not follow it. His framework shows exactly when scaling is genius and when it is catastrophe.",
    targetKeywords: [
      "scaling too fast startup",
      "signs you are scaling too fast",
      "Napoleon strategy business",
      "startup growth problems",
      "when to scale a startup",
    ],
    decisionType: "scaling",
    hookQuestion:
      "Your growth metrics look incredible. Headcount is up, offices are opening, partnerships are closing. Then one Tuesday morning the machine stops working and nobody can say why. Napoleon ran the most disciplined military machine in European history and still made this exact mistake. Here is his framework for knowing when speed becomes the failure mode.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Napoleon Bonaparte",
        text: "You are not failing because you moved too fast. You are failing because you moved faster than your supply lines could follow. Every commander who has ever overextended his army knew, in the moment of defeat, that the flaw was not courage — it was the gap between tempo and logistics. Close that gap before you add the next division.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The empire that grows fastest is not the empire that wins. The empire that outlasts the next decade wins. Before you celebrate your growth rate, ask what you are depending on to sustain it — and then ask whether that thing is actually in your control.",
      },
      {
        speaker: "Marie Curie",
        text: "A result that cannot be replicated is not a discovery — it is noise. The same is true of growth. If you cannot reproduce the mechanism that created this quarter's numbers in the next three, you have not found a repeatable process. You have found a coincidence.",
      },
    ],
  },
  // ── Batch 3: 'What Would X Say' articles (task 9b797e96) ─────────────
  {
    slug: "what-would-marie-curie-say-about-when-to-trust-the-data",
    type: "single",
    frameworkSlug: "marie-curie",
    title: "What Would Marie Curie Say About When to Trust the Data?",
    description:
      "Curie spent years collecting measurements before she would claim a discovery. Her framework for deciding when data is trustworthy is not about having more data — it is about having data that is reproducible, independently verified, and honest about what it cannot yet explain.",
    targetKeywords: [
      "Marie Curie scientific method",
      "how to know when you have enough data",
      "when to stop researching and decide",
      "when to trust data in business",
      "data-driven decision making",
    ],
    decisionType: "evidence",
    hookQuestion:
      "You have charts, surveys, and three months of A/B tests. Everyone is asking you to decide. But do you actually have enough signal — or do you have noise that looks organized? Curie ran experiments for years before she was willing to claim a discovery.",
    publishedAt: "2026-05-12",
    agonExcerpt: [
      {
        speaker: "Marie Curie",
        text: "The question is not whether you have data. The question is whether your data survives an honest attempt to disprove it. I did not claim to have discovered a new element because my measurements were large — I claimed it because every attempt I made to explain the measurements away had failed. That is a different standard.",
      },
      {
        speaker: "Isaac Newton",
        text: "A single well-designed experiment is worth more than a thousand observations that confirm what you already believe. The danger is not in having too little data — it is in treating correlation as if it were a derived law. Distinguish what you have measured from what you have proven.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Act on the best available evidence, then be willing to revise. The person who waits for certainty before deciding has confused wisdom with paralysis. The person who acts on enthusiasm before testing has confused confidence with knowledge. The space between them is where honest judgment lives.",
      },
    ],
  },
  // ── Wave 6: collision articles ────────────────────────────────────────
  {
    slug: "newton-vs-da-vinci-on-build-vs-design-first",
    type: "collision",
    frameworkSlug: "isaac-newton",
    collisionFrameworkSlugs: ["isaac-newton", "leonardo-da-vinci"],
    title: "Newton vs. da Vinci on Build vs. Design First",
    description:
      "Two of history's greatest minds clash on whether to prototype and build your way to the answer (da Vinci's method) or prove the mathematics before committing any resources (Newton's method). For founders choosing between lean iteration and disciplined validation, this is the fundamental tension.",
    targetKeywords: [
      "build vs design first startup",
      "lean startup vs disciplined validation",
      "prototype first or plan first",
      "when to iterate vs validate startup",
      "startup product development approach",
    ],
    decisionType: "product",
    hookQuestion:
      "Build first or design first? Newton would demand proof before committing a single resource. Da Vinci would already have three prototypes running. Both produced work that changed the world.",
    publishedAt: "2026-05-14",
  },
  {
    slug: "sun-tzu-vs-napoleon-on-competitive-strategy",
    type: "collision",
    frameworkSlug: "sun-tzu",
    collisionFrameworkSlugs: ["sun-tzu", "napoleon-bonaparte"],
    title: "Sun Tzu vs. Napoleon on Competitive Strategy",
    description:
      "Sun Tzu's doctrine: win before the battle begins through intelligence, positioning, and patience. Napoleon's doctrine: concentrate superior force, move faster than your opponent can react, and strike decisive blows. Two of history's greatest strategists debate how founders should approach competition.",
    targetKeywords: [
      "startup competitive strategy",
      "how to compete against larger competitors",
      "startup market positioning strategy",
      "competitive moat founder strategy",
      "startup vs incumbents strategy",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Sun Tzu says win before the battle starts. Napoleon says strike faster than your enemy can recover. You have a well-funded competitor entering your market. Which doctrine do you follow?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The supreme art of war is to subdue the enemy without fighting. Your competitor's funding means nothing if you have occupied the position they need and they cannot dislodge you without destroying what makes it valuable.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Strategy without execution is fantasy. The plan is only as good as the speed of its execution — I won battles by being at the decisive point before my enemies realized it was the decisive point. Move faster. Decide faster. Strike before the window closes.",
      },
    ],
  },
  {
    slug: "carnegie-vs-machiavelli-on-winning-through-people",
    type: "collision",
    frameworkSlug: "andrew-carnegie",
    collisionFrameworkSlugs: ["andrew-carnegie", "niccolo-machiavelli"],
    title: "Carnegie vs. Machiavelli on Winning Through People",
    description:
      "Carnegie's argument: surround yourself with people smarter than you, give them genuine autonomy, and the organization compounds its intelligence. Machiavelli's counter: loyalty is conditional, people act from interest not virtue, and the founder who doesn't control their organization will eventually be controlled by it.",
    targetKeywords: [
      "hiring strategy startup founder",
      "how to build a team startup",
      "startup leadership people strategy",
      "founder team building philosophy",
      "managing a startup team",
    ],
    decisionType: "hiring",
    hookQuestion:
      "Carnegie built an empire by hiring people smarter than himself and trusting them completely. Machiavelli would call that naive — loyalty is strategic, not genuine. Which philosophy survives a startup?",
    publishedAt: "2026-05-14",
  },
  {
    slug: "lincoln-vs-marcus-aurelius-on-leading-in-crisis",
    type: "collision",
    frameworkSlug: "abraham-lincoln",
    collisionFrameworkSlugs: ["abraham-lincoln", "marcus-aurelius"],
    title: "Lincoln vs. Marcus Aurelius on Leading in Crisis",
    description:
      "Marcus Aurelius led through inner discipline — the crisis is controlled first in the mind before it can be controlled in the field. Lincoln led through outward coalition — a leader in crisis must hold together the fractious coalition of people who must do the actual surviving. Both survived crises that would have broken lesser leaders.",
    targetKeywords: [
      "startup leadership in crisis",
      "founder leading through crisis",
      "how to lead when things go wrong startup",
      "startup crisis management leadership",
      "founder resilience crisis leadership",
    ],
    decisionType: "crisis",
    hookQuestion:
      "Your startup is in crisis. Marcus Aurelius would retreat inward — master your own response first. Lincoln would reach outward — hold the coalition together before you lose anyone. You have days, not weeks. Which move do you make first?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Abraham Lincoln",
        text: "The crisis does not give you time for philosophy. Your team is watching you — they are deciding right now whether to hold or abandon. You must give them a reason to hold. Show them the path forward, even if the path is not yet clear to you. Leadership in crisis is the willingness to be seen as certain when you are not.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The leader who loses control of their own mind in a crisis loses the only tool that matters. Before you speak, before you act, before you reassure anyone — get still. The crisis will not wait, but the decision you make from panic will last longer than the crisis itself.",
      },
    ],
  },
  {
    slug: "edison-vs-tesla-on-the-right-way-to-innovate",
    type: "collision",
    frameworkSlug: "thomas-edison",
    collisionFrameworkSlugs: ["thomas-edison", "nikola-tesla"],
    title: "Edison vs. Tesla on the Right Way to Innovate",
    description:
      "Edison's method: iterate relentlessly through thousands of experiments until you find what works, guided by practical market demand. Tesla's method: solve the problem completely in your mind before touching a physical object. Two of history's most prolific inventors disagreed fundamentally on process — and both produced world-changing results.",
    targetKeywords: [
      "startup innovation process",
      "how to innovate in a startup",
      "lean vs visionary innovation startup",
      "experimentation vs planning startup",
      "startup R&D process",
    ],
    decisionType: "innovation",
    hookQuestion:
      "Edison failed 10,000 times before finding the right filament. Tesla designed the entire AC motor in his head before building a single prototype. You are stuck on a hard technical problem. Which method do you use?",
    publishedAt: "2026-05-14",
  },
  // ── Wave 5: insight + method batch ────────────────────────────────────
  {
    slug: "what-would-catherine-the-great-say-about-managing-a-scaling-organization",
    type: "single",
    frameworkSlug: "catherine-the-great",
    title: "What Would Catherine the Great Say About Managing a Scaling Organization?",
    description:
      "Catherine the Great inherited a court riddled with conspirators, outdated bureaucracies, and hostile factions — and transformed Russia into a modern empire. Her playbook for scaling an organization: restructure ruthlessly, elevate talent regardless of origin, and govern through clear systems rather than personal heroics.",
    targetKeywords: [
      "how to manage a scaling startup",
      "organizational scaling problems founders",
      "startup org structure scaling",
      "how to manage rapid growth startup",
      "founder leadership scaling team",
    ],
    decisionType: "leadership",
    hookQuestion:
      "Are you governing your company — or just surviving it? Catherine the Great took control of an empire that resisted her at every level and scaled it into one of the most powerful states in Europe without losing herself in the chaos.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "The leader who cannot delegate is the leader who cannot scale. You must build systems that govern in your absence — not personalities that depend on your presence.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Every inflection point of growth demands a new kind of leadership. What got you here may not carry you forward. The founders who survive scaling are those who reinvent themselves faster than the organization does.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "I surrounded myself with people who knew more than I did. That was not weakness — it was the only rational response to the complexity of scaling. Hire above your current ceiling.",
      },
    ],
  },
  {
    slug: "what-would-alexander-the-great-say-about-entering-new-markets",
    type: "single",
    frameworkSlug: "alexander-the-great",
    title: "What Would Alexander the Great Say About Entering New Markets?",
    description:
      "Alexander the Great conquered territory spanning three continents not by applying the same tactics everywhere, but by adapting to local conditions while maintaining strategic coherence. Each new market had different rules — he learned them, co-opted local talent, and moved before his opponents could react.",
    targetKeywords: [
      "how to enter new markets startup",
      "market expansion strategy founder",
      "when to expand into new markets",
      "international expansion startup strategy",
      "entering new verticals startup",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Alexander the Great entered 20 different territories in 13 years and lost almost none of them. His secret was not brute force — it was speed of learning and local adaptation. You are about to enter a new market. How fast can you learn its rules?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "Know the terrain before you commit your forces. Every market has its own geography — its incumbents, its customer loyalties, its switching costs. Enter ignorant and you will pay with time and capital.",
      },
      {
        speaker: "Niccolo Machiavelli",
        text: "The prince who enters a new territory must decide quickly whether to govern through the existing power structures or dismantle them. There is no middle path — half-measures leave you vulnerable to both sides.",
      },
      {
        speaker: "Marie Curie",
        text: "Every new domain rewards those who approach it with discipline rather than assumption. The methods that work in your existing market are hypotheses in the new one. Test before you scale.",
      },
    ],
  },
  {
    slug: "what-would-cleopatra-vii-say-about-strategic-alliances",
    type: "single",
    frameworkSlug: "cleopatra-vii",
    title: "What Would Cleopatra VII Say About Strategic Alliances?",
    description:
      "Cleopatra VII kept Egypt sovereign against the most powerful empire in the world by building alliances with precision. She chose partners not by sentiment but by strategic calculus — who held power, what they needed, and what Egypt could offer. She survived what no other Ptolemaic ruler managed: Rome.",
    targetKeywords: [
      "startup strategic partnerships",
      "how to build strategic alliances startup",
      "partnership strategy for founders",
      "when to partner vs compete",
      "coopetition strategy startup",
    ],
    decisionType: "resilience",
    hookQuestion:
      "What leverage do you actually hold against competitors who outclass you in resources? Cleopatra VII was a small nation surrounded by the most powerful empire on earth — and she kept Egypt sovereign for two decades through strategic alliances.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "An alliance built on mutual necessity is more durable than one built on admiration. Understand clearly what your partner gains from you — because when that calculus shifts, so will the alliance.",
      },
      {
        speaker: "Niccolo Machiavelli",
        text: "Never be neutral when powerful interests clash around you. The prince who stays neutral wins neither side and loses both. Choose your alliance deliberately, and make it worth your partner's while to uphold.",
      },
      {
        speaker: "Julius Caesar",
        text: "The strongest alliances are forged when both parties need each other to survive. Do not partner from a position of desperation — position yourself first so that you bring something irreplaceable to the table.",
      },
    ],
  },
  {
    slug: "what-would-john-d-rockefeller-say-about-building-systems-that-scale",
    type: "single",
    frameworkSlug: "john-d-rockefeller",
    title: "What Would John D. Rockefeller Say About Building Systems That Scale?",
    description:
      "Rockefeller did not build Standard Oil through personal brilliance alone — he built systems that could replicate efficiency across hundreds of refineries. He standardized processes, eliminated waste with obsessive precision, and created organizational infrastructure long before 'operations' became a startup discipline.",
    targetKeywords: [
      "how to build scalable systems startup",
      "startup operations scaling",
      "founder building processes at scale",
      "when to systematize startup operations",
      "scaling startup without founder dependency",
    ],
    decisionType: "systems",
    hookQuestion:
      "Rockefeller cut the cost of refining oil by over 80% not through luck or timing — but through relentless systematization. Every inefficiency was a problem to be solved, not accepted. Your startup has chaotic processes held together by heroic effort. What would it look like to systematize one of them this week?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "A system that works reliably under all conditions is more valuable than one that works brilliantly under ideal conditions. Founders mistake clever solutions for systematic ones — and pay for it at scale.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Do not confuse activity with system. The busy founder mistakes motion for progress. True leverage comes from processes that produce consistent outcomes without requiring your attention.",
      },
      {
        speaker: "Nikola Tesla",
        text: "The mind that can see how a system will fail before it fails is the engineer's greatest asset. Build your processes expecting failure modes — and design the recovery in from the start.",
      },
    ],
  },
  {
    slug: "what-would-julius-caesar-say-about-winning-team-loyalty",
    type: "single",
    frameworkSlug: "julius-caesar",
    title: "What Would Julius Caesar Say About Winning Team Loyalty?",
    description:
      "Caesar's legions followed him across the Rubicon — an act of treason that could have gotten every one of them killed. They did it because Caesar had spent years earning the kind of loyalty that survives personal risk. He shared hardship, rewarded performance visibly, and made every soldier feel that their fate was tied to his.",
    targetKeywords: [
      "how to build team loyalty startup",
      "employee retention early stage startup",
      "how founders earn team trust",
      "startup culture team commitment",
      "retaining key employees startup",
    ],
    decisionType: "hiring",
    hookQuestion:
      "Caesar's soldiers crossed the Rubicon knowing it might cost them everything — and they did it because he had earned loyalty that survived personal risk. You are building a team. Would your first ten employees take a significant personal risk for the mission you are building?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Abraham Lincoln",
        text: "Loyalty is not purchased with salary. It is earned through the character of leadership — through being seen to care about the people in your charge as much as you care about the outcome.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "The men who built Carnegie Steel were not working for wages alone. They were working for the chance to be part of something worth building. Give your team a mission worth risking for.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The leader who demands loyalty without having earned trust is building on sand. Loyalty follows character — and character is revealed under pressure, not in comfort.",
      },
    ],
  },
  {
    slug: "what-would-florence-nightingale-say-about-operational-excellence",
    type: "single",
    frameworkSlug: "florence-nightingale",
    title: "What Would Florence Nightingale Say About Operational Excellence?",
    description:
      "Nightingale walked into the Scutari Barracks Hospital where soldiers were dying at a 42% rate — not from battle wounds, but from preventable infections caused by chaotic operations. Within months, she had reduced mortality to 2% through systematic process redesign, data tracking, and obsessive attention to operational detail.",
    targetKeywords: [
      "operational excellence startup",
      "how to improve startup operations",
      "founder fixing broken processes",
      "startup quality and execution",
      "data-driven operations startup",
    ],
    decisionType: "product",
    hookQuestion:
      "Your startup has a silent killer in its operations right now — you just haven't found it yet. Nightingale reduced hospital mortality from 42% to 2% not through better medicine but through obsessive process redesign. Are you measuring the right things?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "Every system that produces poor outcomes does so for a reason that can be identified, measured, and corrected. The question is not whether the problem exists — it is whether you are measuring the right indicators to surface it.",
      },
      {
        speaker: "Marie Curie",
        text: "Operational excellence is not a philosophy — it is a discipline. You cannot improve what you do not measure. Start with the data, follow it wherever it leads, and do not let discomfort stop you from acting on what you find.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The leader who maintains high standards in difficult conditions sets the ceiling for what the organization believes is possible. Nightingale's gift was proving that excellence was achievable even in chaos.",
      },
    ],
  },
  {
    slug: "first-principles-thinking-explained",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "First Principles Thinking Explained",
    description:
      "First principles thinking is the discipline of breaking a problem down to its most basic, verified truths — and reasoning up from those foundations rather than from analogy or convention. Newton used it to derive the laws of motion. Musk used it to reduce rocket costs by 10x. Founders who master it stop copying and start building genuinely novel solutions.",
    targetKeywords: [
      "first principles thinking explained",
      "what is first principles thinking",
      "first principles vs analogy thinking",
      "how to use first principles thinking",
      "elon musk first principles method",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "First principles thinking means refusing to accept assumptions that have not been verified from the ground up. Newton did not accept that the apple fell because 'things fall' — he asked why, derived the mathematics, and gave us gravity. You are solving a problem using the same assumptions everyone else accepts. What would change if you derived the answer from scratch?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "The method is simple and brutal: state what you know to be true without reference to what others have said, derive the next truth from that, and proceed. Every inherited assumption is a potential source of error.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "I have always found more truth in direct observation than in received doctrine. The eye that sees freshly — without the weight of what it has been told to see — discovers more than the eye that merely confirms.",
      },
      {
        speaker: "Archimedes",
        text: "Give me a fixed point and a lever long enough, and I will move the world. First principles thinking is how you find that fixed point — the one assumption you can stand on with certainty while you question everything else.",
      },
    ],
  },
  // ── Wave 4: insight + method batch ────────────────────────────────────
  {
    slug: "what-would-cicero-say-about-pitching-to-investors",
    type: "single",
    frameworkSlug: "cicero",
    title: "What Would Cicero Say About Pitching to Investors?",
    description:
      "Cicero won complex legal cases in the Roman Forum against opponents with more power and status. His persuasion framework — the canon of rhetoric — is not a collection of tricks. It is a systematic approach to understanding your audience and engineering the precise arguments that will move them.",
    targetKeywords: [
      "how to pitch investors startup",
      "investor pitch persuasion",
      "Cicero rhetoric business",
      "persuasion techniques fundraising",
      "how to be more persuasive startup",
    ],
    decisionType: "persuasion",
    hookQuestion:
      "You are about to walk into the most important pitch of your company's life. You have 12 minutes. Cicero won cases in the Roman Forum with less. His system for persuasion was not about charisma — it was about structure.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Cicero",
        text: "The first mistake the inexperienced advocate makes is to argue everything. The skilled advocate argues only what cannot be refuted. Before you speak, ask yourself: which three points are so strong that no counterargument survives them? Argue only those. Let the rest go. Your audience's attention is not unlimited. Neither is their tolerance for weakness.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "If you would persuade, you must appeal to interest and not to reason. I never opened a persuasive conversation without first understanding exactly what the other person wanted to walk away with. That is not manipulation — it is the honest work of meeting someone where they are instead of where you want them to be.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Speak briefly and precisely. The person who speaks at length either does not know their argument or does not trust it. The shortest statement of a true thing is almost always the most powerful. Compress what you have to say until it can no longer be compressed. Then say it.",
      },
    ],
  },
  {
    slug: "what-would-epictetus-say-about-what-you-can-control",
    type: "single",
    frameworkSlug: "epictetus",
    title: "What Would Epictetus Say About What You Can Control?",
    description:
      "Epictetus divided the world into two categories: things within your control (your judgments, desires, and actions) and things outside your control (reputation, wealth, other people's opinions). His entire philosophy was an operating system for directing energy only toward the first category.",
    targetKeywords: [
      "what can you control stoicism",
      "Epictetus dichotomy of control",
      "stoic philosophy founder",
      "how to focus on what you control",
      "Epictetus Enchiridion explained",
    ],
    decisionType: "control",
    hookQuestion:
      "You are spending mental energy on things that are not in your control — what competitors are doing, what investors think, whether the press covers you. Epictetus was a slave for the first half of his life and built a framework for mastery that has nothing to do with external circumstances.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Epictetus",
        text: "Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and whatever are our own actions. Things not in our control are body, reputation, command, and whatever are not our own actions. The wise founder spends no energy on the second category. All strategy is about the first.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "You have power over your mind, not outside events. Realize this, and you will find strength. The competitor who disturbs you, the investor who doubts you, the customer who left — none of these are within your control. Your response to each of them is. Focus your entire strategic effort there.",
      },
      {
        speaker: "Seneca",
        text: "Begin at once to live, and count each separate day as a separate life. The founder who defers her clarity until the market cooperates, the investor agrees, or the product is perfect has outsourced her agency to things she cannot govern. What are you waiting for? The condition will never be perfect. Begin.",
      },
    ],
  },
  {
    slug: "what-would-ada-lovelace-say-about-building-with-ai",
    type: "single",
    frameworkSlug: "ada-lovelace",
    title: "What Would Ada Lovelace Say About Building With AI?",
    description:
      "Lovelace was the first to understand that Babbage's Analytical Engine could manipulate symbols beyond numbers — she saw the computer as a general symbol processor. Her key insight was about what machines cannot do: originate. The machine can only do what we know how to order it to perform.",
    targetKeywords: [
      "building with AI tools startup",
      "when to use AI in your product",
      "Ada Lovelace computer science history",
      "AI product strategy 2026",
      "foundation models startup decision",
    ],
    decisionType: "technology",
    hookQuestion:
      "Your competitors are shipping AI features every week. Your team is asking whether to build on top of foundation models or wait for something better. Ada Lovelace wrote the first algorithm 170 years before GPT-1 and understood something most people miss about how machines actually work.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Nikola Tesla",
        text: "The machine that is good enough for today will be obsolete in three years if you do not understand why it works. Build on top of AI only if you understand the mechanism well enough to predict where it will fail. The founder who treats a foundation model as a black box has built a dependency she cannot debug.",
      },
      {
        speaker: "Isaac Newton",
        text: "To understand the current state of any technology, you must understand its limits before you understand its possibilities. Lovelace saw this clearly: the machine does only what you know how to instruct it to do. AI does not change this. It merely raises the ceiling of what can be instructed.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "The painter who cannot draw cannot paint. The founder who cannot think clearly about the problem cannot delegate it to a machine and expect a good result. AI amplifies what you already know how to do. It does not replace the thinking that precedes instruction.",
      },
    ],
  },
  {
    slug: "what-would-harriet-tubman-say-about-leading-a-mission",
    type: "single",
    frameworkSlug: "harriet-tubman",
    title: "What Would Harriet Tubman Say About Leading a Mission?",
    description:
      "Tubman ran nineteen missions into slave territory and brought out over 300 people, operating in one of the most hostile environments imaginable. Her framework was not about inspiration — it was about operational intelligence, pre-positioned resources, timing, and refusing to let individual fear compromise the group's mission.",
    targetKeywords: [
      "mission-driven leadership startup",
      "Harriet Tubman leadership lessons",
      "how to lead a high-stakes team",
      "leading through uncertainty",
      "mission-driven company management",
    ],
    decisionType: "leadership",
    hookQuestion:
      "Harriet Tubman led dozens of people through hostile territory to freedom and never lost a single one. Your company has a mission people believe in. But belief is not enough. Her operational framework for leading under real pressure is precise and counter-intuitive.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Niccolò Machiavelli",
        text: "The leader who relies on belief alone is vulnerable the moment the mission becomes difficult. Belief is the fuel, but operational excellence is the engine. A mission-driven team that does not have clear procedures for every foreseeable failure will improvise badly when the pressure arrives. Plan the failures before they happen.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The first quality of a leader is to know what she can and cannot control. What she can control: the clarity of the mission, the preparation of the team, and the soundness of the decision. What she cannot control: external conditions, how others react, and the precise timing of success. Lead on the first. Accept the second.",
      },
      {
        speaker: "Marie Curie",
        text: "I was taught that the way of progress is neither swift nor easy. The mission-driven leader who expects a clear path has confused inspiration with strategy. Measure the obstacles. Prepare the resources. Execute the plan. The mission is not delivered by belief — it is delivered by systematic work in the direction of a clear goal.",
      },
    ],
  },
  {
    slug: "what-would-frederick-douglass-say-about-finding-your-voice",
    type: "single",
    frameworkSlug: "frederick-douglass",
    title: "What Would Frederick Douglass Say About Finding Your Voice?",
    description:
      "Douglass understood that the power to persuade came not from diplomatic softening but from precise, irrefutable language. His most powerful rhetorical move was not eloquence — it was specificity. He named names, described incidents, and forced his audience to engage with concrete reality instead of comfortable abstractions.",
    targetKeywords: [
      "how to find your voice startup",
      "Frederick Douglass communication",
      "public speaking confidence founder",
      "storytelling persuasion business",
      "how to speak truth in meetings",
    ],
    decisionType: "persuasion",
    hookQuestion:
      "You know what you need to say, but you are afraid of how it will land. You are softening the message. Frederick Douglass taught himself to read in secret, escaped from slavery, and then spoke in front of crowds who had never heard a former enslaved person articulate the case for freedom.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Cicero",
        text: "The case that is softened for politeness is the case that loses. Your opponent is not handicapped by your discomfort. Speak with precision, not with aggression, but do not confuse clarity with confrontation. The precise statement of a true thing is almost always more persuasive than the hedged version of it.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "I have observed that most people who claim they cannot find the right words have not yet committed to the right position. The words come when the position is clear. If you are softening the message, the question is not how to say it better — it is whether you are fully committed to what you are saying.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "If it is not right, do not do it. If it is not true, do not say it. The voice you are looking for is not a rhetorical technique — it is the consequence of having something true to say and the discipline to say it without apology. Do you have something true? Then say it precisely.",
      },
    ],
  },
  {
    slug: "what-would-archimedes-say-about-leverage",
    type: "single",
    frameworkSlug: "archimedes",
    title: "What Would Archimedes Say About Leverage?",
    description:
      "Archimedes discovered the law of the lever and immediately understood its strategic implication: the right position and the right tool can multiply force far beyond what raw effort could achieve. His framework for problem-solving was always to find the structural simplification that made the problem trivial before trying to solve it by brute force.",
    targetKeywords: [
      "leverage business strategy",
      "Archimedes lever business lesson",
      "how to work smarter not harder startup",
      "strategic leverage startup",
      "force multiplier business",
    ],
    decisionType: "strategy",
    hookQuestion:
      "You are working extremely hard but the results are not matching the effort. Archimedes said he could move the world with a long enough lever. The same principle applies to every business problem. The question is not how hard you are working — it is whether you have found the lever.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The supreme general wins without fighting — not because he is passive, but because he has chosen the terrain where his strength is disproportionate. Leverage is the terrain advantage. Before you commit force, find the position where your effort multiplies instead of canceling out.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "The prince who uses force where cunning would serve has wasted two resources: energy and the advantage of surprise. Every problem you can solve with structure, you should not solve with effort. Find the hinge. Then push on the hinge, not on the wall.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Simplicity is the ultimate sophistication. Every complex problem contains a simpler problem that, if solved, makes the complex one trivial. The engineer's discipline is to find that simpler problem before committing to the brute-force approach. Archimedes would have agreed.",
      },
    ],
  },
  {
    slug: "inversion-thinking-explained",
    type: "single",
    frameworkSlug: "niccolo-machiavelli",
    title: "Inversion Thinking: The Mental Model for Avoiding Failure",
    description:
      "Inversion is the practice of approaching problems backwards. Instead of asking how to achieve your goal, you ask what would prevent you from achieving it, then remove those obstacles. Machiavelli was the master of this mental model — his works are almost entirely structured as inversions of what Princes believe will keep them in power.",
    targetKeywords: [
      "inversion thinking explained",
      "mental model inversion Charlie Munger",
      "how to use inversion thinking",
      "avoid failure mental model",
      "second order thinking business",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "Instead of asking how to succeed, ask what would guarantee failure — then avoid it. Machiavelli built his entire political philosophy on inverting conventional wisdom about power. This is inversion, the mental model Charlie Munger called one of the most powerful he knew.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "For every force, an equal and opposite reaction. The strategist who understands this asks not only what she is trying to produce, but what forces will push back when she acts. Inversion is not pessimism — it is physics applied to decision-making. List the failure modes first. Then design around them.",
      },
      {
        speaker: "Marie Curie",
        text: "Science advances by falsification, not by confirmation. I never spent time building the case for a hypothesis I had not already attempted to destroy. The same applies to strategy. Before you commit to a plan, spend half the time trying to find the flaw that makes it fail. If you cannot find one, you have earned the confidence to proceed.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Think about what could prevent you from acting rightly. Then remove those things from your path. The Stoic practice of premeditatio malorum is not pessimism — it is anticipation that removes the power of the obstacle before it arrives. Inversion is not a technique. It is a discipline of honesty about what can go wrong.",
      },
    ],
  },
  // ── Wave 3: insight + method batch ────────────────────────────────────
  {
    slug: "what-would-steve-jobs-say-about-product-focus",
    type: "single",
    frameworkSlug: "steve-jobs",
    title: "What Would Steve Jobs Say About Product Focus?",
    description:
      "Jobs returned to Apple in 1997 and immediately cut 70% of its product line. His philosophy was not about doing fewer things — it was about understanding that focus is the only way to do anything well. Every feature you add to a product is a promise you will maintain forever.",
    targetKeywords: [
      "Steve Jobs product strategy",
      "product focus startup",
      "how to say no to features",
      "product simplicity Apple",
      "feature creep decision",
    ],
    decisionType: "focus",
    hookQuestion:
      "Your roadmap has thirty features on it. The team wants to build five at once. A major customer just asked for something that is not on the list at all. Jobs returned to Apple and cut 70% of the product line in his first week back.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Steve Jobs",
        text: "People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas that there are. You have to pick carefully. I'm actually as proud of the things we haven't done as the things I have done. Innovation is saying no to a thousand things.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Simplicity is the ultimate sophistication. The artist who cannot cut the line that does not belong is not an artist — he is an accumulator. Your product is the same. What you remove defines what remains. What remains should be extraordinary.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Confine yourself to the present. Do not try to do everything; do the right thing. A product that does everything does nothing particularly well, and the customer who needs one great thing will not find it buried under thirty adequate ones.",
      },
    ],
  },
  {
    slug: "what-would-lincoln-say-about-leading-through-crisis",
    type: "single",
    frameworkSlug: "abraham-lincoln",
    title: "What Would Lincoln Say About Leading Through Crisis?",
    description:
      "Lincoln governed during the most disruptive crisis in American history with incomplete information, unreliable generals, and a cabinet of rivals who doubted him. His framework for decision-making under pressure was not certainty — it was calibrated action combined with the structural capacity to revise.",
    targetKeywords: [
      "Abraham Lincoln leadership lessons",
      "how to lead through crisis",
      "Lincoln decision making",
      "crisis leadership framework",
      "leading under pressure uncertainty",
    ],
    decisionType: "crisis",
    hookQuestion:
      "You are three months into your hardest stretch as a leader. The team is losing confidence. The original plan is not working. You have incomplete information and no guarantee the next decision will be right. Lincoln ran a country through civil war with the same problem.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Abraham Lincoln",
        text: "I do not think much of a man who is not wiser today than he was yesterday. A crisis does not require you to be right — it requires you to keep moving toward right. Update your decisions as the facts change. Refuse to do so, and you are no longer leading. You are merely persisting.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The impediment to action advances action. What stands in the way becomes the way. A crisis is not an interruption of the work — it is the work in its most concentrated form. The leader who waits for normal conditions to lead has misunderstood the job.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "It is better to be bold than cautious in a crisis, because fortune favors boldness. But boldness without structure is recklessness. Build the decision to survive revision. A leader who cannot change course is not strong — he is brittle.",
      },
    ],
  },
  {
    slug: "what-would-benjamin-franklin-say-about-time-management",
    type: "single",
    frameworkSlug: "benjamin-franklin",
    title: "What Would Benjamin Franklin Say About Time Management?",
    description:
      "Franklin ran a printing business, served as a diplomat, conducted scientific experiments, and helped write the founding documents of the United States — all in one lifetime. His system was not about doing more things; it was about designing constraints that forced him to do the right things.",
    targetKeywords: [
      "Benjamin Franklin time management",
      "Franklin productivity system",
      "founding father daily routine",
      "how to prioritize like Franklin",
      "daily schedule productivity system",
    ],
    decisionType: "time-management",
    hookQuestion:
      "You are working long hours but not making progress on what matters. The urgent keeps eating the important. You can feel the week slipping away on things that will not matter in six months. Franklin was running a print shop, conducting experiments, and founding a nation at the same time.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Benjamin Franklin",
        text: "Lost time is never found again. But the failure is not the lost time — it is the lack of a system that prevents it from being lost in the first place. I asked myself every morning: what good shall I do today? I asked every evening: what good have I done? That two-question structure is the entire system.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Confine yourself to the present. Do not scatter your attention across the past you cannot change and the future you cannot control. The present moment is all you actually have to act in. Spend it on what matters. Every other hour is borrowed.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Time stays long enough for those who use it. The difficulty is not time — it is the courage to refuse what is urgent but unimportant. A full schedule is not a productive schedule. A focused hour outperforms a scattered day.",
      },
    ],
  },
  {
    slug: "what-would-edison-say-about-failure-and-iteration",
    type: "single",
    frameworkSlug: "thomas-edison",
    title: "What Would Edison Say About Failure and Iteration?",
    description:
      "Edison did not treat failure as the opposite of success — he treated it as the method. His Menlo Park laboratory ran thousands of parallel experiments simultaneously, because the only way to find the light bulb filament that worked was to systematically eliminate the ones that did not.",
    targetKeywords: [
      "Thomas Edison failure quotes",
      "Edison on failure and success",
      "iteration mindset startup",
      "how to learn from failure",
      "systematic experimentation startup",
    ],
    decisionType: "iteration",
    hookQuestion:
      "You have tried three approaches and none of them worked. The board is asking how long you will keep going. Edison ran over ten thousand experiments to find a working light bulb filament and described each failed experiment as a successful proof of what not to use.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Thomas Edison",
        text: "I have not failed. I have found ten thousand ways that will not work. Every result that tells you what does not work is a result. You are not stuck — you are narrowing the field. Keep the discipline of the experiment and the answer will eventually be the only thing left.",
      },
      {
        speaker: "Marie Curie",
        text: "Failure in an experiment is not a failure of the scientist. It is data. The scientist who abandons the question after the first negative result has confused the experiment with the hypothesis. The hypothesis survives negative results. Update it and run again.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Experience is never in error; it is only your judgment that errs in promising itself such results as are not caused by your experiments. Each failure is a more precise constraint on the space of possible answers. Honor the constraint. It is progress.",
      },
    ],
  },
  {
    slug: "what-would-carnegie-say-about-hiring-and-delegating",
    type: "single",
    frameworkSlug: "andrew-carnegie",
    title: "What Would Carnegie Say About Hiring and Delegating?",
    description:
      "Carnegie built the largest steel company in the world almost entirely by finding the right people and then getting out of their way. His proposed epitaph read: 'Here lies a man who was able to surround himself with men far cleverer than himself.'",
    targetKeywords: [
      "Andrew Carnegie leadership hiring",
      "Carnegie on delegation",
      "how to build a great team startup",
      "hiring strategy founder",
      "when to delegate as a founder",
    ],
    decisionType: "hiring",
    hookQuestion:
      "You are doing too much yourself. The people you hired are capable, but you keep second-guessing their decisions and jumping into their work. Carnegie ran the largest steel operation in the world from a distance by designing an organization that did not need him in every meeting.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Andrew Carnegie",
        text: "No man will make a great leader who wants to do it all himself, or to get all the credit for doing it. The man who acquires the ability to take full possession of his own mind and direct it toward any end may have everything else the world has to offer. First learn what you can do. Then hire people who can do what you cannot.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "The first method for estimating the intelligence of a ruler is to look at the men he has around him. Delegation is not abdication — it is judgment expressed through selection. If you cannot trust the people you have chosen, the problem is not delegation. It is hiring.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "If you want something done, ask a busy person. But if you want something done well over a decade, build the system that attracts the right people and then has the discipline to leave them alone. Interference is not leadership — it is anxiety in action.",
      },
    ],
  },
  {
    slug: "what-would-seneca-say-about-procrastination",
    type: "single",
    frameworkSlug: "seneca",
    title: "What Would Seneca Say About Procrastination?",
    description:
      "Seneca wrote that we suffer more in imagination than in reality. His framework for procrastination was not motivational — it was diagnostic. You are not avoiding the task because you are lazy; you are avoiding it because you have not yet been honest with yourself about what the task actually requires.",
    targetKeywords: [
      "Seneca on procrastination",
      "Stoic advice procrastination",
      "Seneca time management",
      "how to stop procrastinating stoic",
      "procrastination philosophy productivity",
    ],
    decisionType: "procrastination",
    hookQuestion:
      "You have been putting off the same conversation, the same project, the same decision for weeks. You know you should do it. You tell yourself you will do it tomorrow. Seneca wrote letters on exactly this problem nineteen hundred years ago.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Seneca",
        text: "It is not that we have a short time to live, but that we waste a great deal of it. Procrastination is not a time problem. It is a honesty problem. You are not unable to do the thing — you are unwilling to face what doing it actually means. Name that, and the delay usually ends.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Do not indulge in dreams of what you mean to do. Do the next thing. The future belongs to those who act in the present, not those who plan to act in some improved version of it. Begin. The beginning is almost everything.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "You may delay, but time will not. The person who waits for the perfect moment to begin has confused preparation with avoidance. Name the first step. Take it. Everything else is downstream of that.",
      },
    ],
  },
  // ── Wave 7: insight + method batch ────────────────────────────────────
  {
    slug: "what-would-da-vinci-say-about-shipping-imperfect-work",
    type: "single",
    frameworkSlug: "leonardo-da-vinci",
    title: "What Would Leonardo da Vinci Say About Shipping Imperfect Work?",
    description:
      "Da Vinci famously left many works unfinished — the Mona Lisa was never formally released by him. His framework distinguishes between perfectionism as a creative standard and perfectionism as a trap: know when you are genuinely improving versus when you are avoiding the exposure that shipping requires.",
    targetKeywords: [
      "when to ship imperfect product",
      "ship early vs perfect product startup",
      "done is better than perfect founder",
      "how to stop overthinking and ship",
      "perfectionism trap startup founder",
    ],
    decisionType: "iteration",
    hookQuestion:
      "You have been refining the product for three months. Every week there is something else that needs to be fixed before you can launch. Da Vinci never formally handed over the Mona Lisa — he kept improving it until it was taken from him. The question is whether you are improving or avoiding.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Thomas Edison",
        text: "Vision without execution is hallucination. Every day you spend refining without shipping is a day you are operating on theory instead of evidence. The market will tell you more in one week of real use than in six months of internal iteration. Ship it. Learn from people who are not you.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Perfection is not a destination — it is a story you tell yourself to avoid the discomfort of being judged. The Stoic acts on what can be done now, with what is available now. Your product is not the Mona Lisa. And even da Vinci's Mona Lisa was only taken seriously after someone else took it from him.",
      },
      {
        speaker: "Marie Curie",
        text: "Science publishes. That is the discipline. A finding that is not published is not science — it is a private belief. The same is true of a product. Until it is in front of users, it is a hypothesis. Ship the hypothesis. Get the data. Then improve from evidence, not from anxiety.",
      },
    ],
  },
  {
    slug: "what-would-sun-tzu-say-about-pricing-strategy",
    type: "single",
    frameworkSlug: "sun-tzu",
    title: "What Would Sun Tzu Say About Pricing Strategy?",
    description:
      "Sun Tzu's Art of War is fundamentally about terrain and position. Pricing is position in a market — low pricing cedes terrain to competitors, while high pricing signals strength but requires the ability to hold that position. Charge at the frontier your strength can defend, not at the price that merely feels safe.",
    targetKeywords: [
      "pricing strategy startup",
      "how to price your product startup",
      "value-based pricing founder",
      "competitive pricing strategy small business",
      "Sun Tzu business strategy pricing",
    ],
    decisionType: "pricing",
    hookQuestion:
      "You are about to set a launch price and you are unsure whether to go low to attract users or high to signal quality. Sun Tzu would frame this as a terrain decision. Pricing is not arithmetic — it is position in a competitive landscape. The price you choose claims territory. Make sure you can hold it.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Niccolò Machiavelli",
        text: "The prince who appears weak invites attack. A low price does not just attract customers — it signals to competitors that the terrain is undefended and worth entering. Set the price that reflects the strength of your position. Raising it later is far harder than defending a high price from the beginning.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Do not price out of fear. Underpricing is not humility — it is a failure of honest self-assessment. If your product delivers real value, the price must reflect that value. Charging less than you are worth is not generosity. It is a claim about yourself that compounds over time.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "A penny saved is a penny earned — but a dollar undercharged is ten dollars of margin you will never recover. The price you set shapes who your customer is. Cheap prices attract price-sensitive customers who leave the moment a cheaper option appears. Price for the customer you want to keep.",
      },
    ],
  },
  {
    slug: "what-would-rockefeller-say-about-unit-economics",
    type: "single",
    frameworkSlug: "john-d-rockefeller",
    title: "What Would John D. Rockefeller Say About Unit Economics?",
    description:
      "Rockefeller built Standard Oil not through revenue maximization but through obsessive cost control at every step of refining and distribution. His framework: know exactly what each barrel costs and why. Gross margin is not a vanity metric — it is the architecture of survival.",
    targetKeywords: [
      "unit economics startup",
      "how to improve unit economics",
      "LTV CAC ratio founder",
      "startup profitability metrics",
      "gross margin founder explained",
    ],
    decisionType: "finance",
    hookQuestion:
      "You know your revenue growth but you are not entirely sure what each sale actually costs you to deliver. Rockefeller built the largest oil company in history not by chasing revenue — but by knowing exactly what each barrel of oil cost him at every step. He believed a founder who does not know their unit economics is not running a business. They are running a hypothesis.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Marie Curie",
        text: "You cannot improve what you have not measured. Rockefeller did not guess at costs — he counted them. Every step in the process was known, tracked, and optimized. The same discipline that produced radioactivity research produced Standard Oil: do not hypothesize about the number. Find the number.",
      },
      {
        speaker: "Isaac Newton",
        text: "A system that does not account for its own losses will eventually fail through accumulation of hidden friction. Unit economics is the discipline of making the hidden friction visible. If you do not know what each unit costs you, there is a force operating on your business that you have not modeled. That force will not wait for you to notice it.",
      },
      {
        speaker: "Sun Tzu",
        text: "The general who does not know his supply costs cannot plan his campaign. Revenue tells you how well you fight; margin tells you how long you can fight. The strategist who chases victories without knowing the cost of each victory will eventually run out of army. Know the cost of each unit before you scale the battle.",
      },
    ],
  },
  {
    slug: "what-would-newton-say-about-debugging-complex-systems",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "What Would Isaac Newton Say About Debugging Complex Systems?",
    description:
      "Newton's Principia isolated variables through controlled thought experiments. Debugging is applied first-principles thinking: isolate the variable, form a hypothesis, test it, update the model. Most engineers debug by intuition; Newton would debug by formal reduction.",
    targetKeywords: [
      "debugging complex systems startup",
      "how to fix hard engineering problems",
      "root cause analysis product issues",
      "systematic debugging methodology",
      "first principles debugging software",
    ],
    decisionType: "product",
    hookQuestion:
      "Your system has a bug that appears intermittently and nobody can reproduce it reliably. The team has been guessing at causes for two days. Newton would find this familiar — complex systems behave unpredictably only until you isolate the right variable. Debugging is not troubleshooting. It is controlled experimentation applied to software.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Leonardo da Vinci",
        text: "The painter who does not know anatomy will never understand why the figure looks wrong. The engineer who does not understand the system at the component level will never understand why it fails. Do not debug the surface. Debug the structure underneath it. Draw the internals until the flaw is obvious.",
      },
      {
        speaker: "Marie Curie",
        text: "The principle is the same whether you are isolating a radioactive element or a software defect: hold everything constant except the one variable you are testing. Intuition is not a debugging methodology. Form the hypothesis, isolate the variable, run the controlled test. Do not guess. Experiment.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "When faced with a complex problem, do not let frustration substitute for method. The mind that is irritated by the obstacle loses its capacity to see the obstacle clearly. Approach the bug as a Stoic philosopher approaches any difficulty: with curiosity, not anxiety. The system is not broken — it is behaving according to a rule you have not yet found.",
      },
    ],
  },
  {
    slug: "what-would-cleopatra-vii-say-about-managing-investors",
    type: "single",
    frameworkSlug: "cleopatra-vii",
    title: "What Would Cleopatra VII Say About Managing Investors?",
    description:
      "Cleopatra held power despite being surrounded by Rome, her own brothers, and shifting alliances that could have destroyed her at any moment. She managed Julius Caesar and Mark Antony as strategic partners — giving them wins that cost her little while maintaining real leverage. Her framework: align interests, never depend, and never let the appearance of dependence become the reality.",
    targetKeywords: [
      "how to manage investors",
      "founder investor relationship tips",
      "managing board of directors startup",
      "how to handle difficult investors",
      "Cleopatra leadership strategy",
    ],
    decisionType: "relationship",
    hookQuestion:
      "Your lead investor wants more board involvement than you expected. The relationship is still good but the dynamic is shifting. Cleopatra ruled Egypt while managing Julius Caesar and Mark Antony — two of the most powerful men in the world — as partners rather than threats. She never let them control her, and she gave them enough to stay aligned.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Niccolò Machiavelli",
        text: "The wise ruler does not fear powerful allies — she manages them. The investor who holds capital is not your adversary unless you make him one. Identify what he needs from this relationship beyond financial return. Give him that. It costs you almost nothing and it keeps the relationship productive.",
      },
      {
        speaker: "Sun Tzu",
        text: "To subdue the enemy without fighting is the supreme excellence. You do not need to fight your investor — you need to align your interests so precisely that conflict never arises. Know what they value. Show them it is advancing. The general who makes every stakeholder feel they are winning rarely needs to fight any of them.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Dependence invites control. The leader who cannot function without the approval of her backers has already lost the negotiation. Know what you need from the relationship and what you can provide without. Maintain enough independence that the partnership stays mutual. This is not ingratitude — it is the precondition of a healthy alliance.",
      },
    ],
  },
  {
    slug: "what-would-harriet-tubman-say-about-resilience-in-hard-times",
    type: "single",
    frameworkSlug: "harriet-tubman",
    title: "What Would Harriet Tubman Say About Resilience in Hard Times?",
    description:
      "Tubman's resilience was not about endurance — it was about continuing forward motion under conditions that would justify stopping. She led nineteen missions despite a severe sleep disorder caused by a head injury. Resilience is not willpower. It is a structural commitment to the destination combined with adaptations for the obstacles in the way.",
    targetKeywords: [
      "founder resilience hard times",
      "how to stay motivated as a founder",
      "startup resilience mental toughness",
      "how to keep going when startup is failing",
      "Harriet Tubman leadership lessons",
    ],
    decisionType: "resilience",
    hookQuestion:
      "Your company has been in a hard stretch for four months. The original momentum is gone. The team is tired. You are asking yourself how much longer you can sustain this. Harriet Tubman ran nineteen missions on the Underground Railroad while experiencing sudden, uncontrollable episodes of sleep caused by a head injury — and she never lost a single person.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "The obstacle is not the problem — it is the material from which the solution is built. Resilience is not the absence of difficulty. It is the refusal to let difficulty become the reason to stop. The Stoic does not ask whether the conditions are favorable. She asks what can be done in these conditions, and does that.",
      },
      {
        speaker: "Seneca",
        text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult. Tubman's courage was not the absence of fear — it was action taken despite fear, structured around the clarity of destination. If your destination is real, the difficulty of the path is a logistical problem, not a reason to reconsider.",
      },
      {
        speaker: "Marie Curie",
        text: "I was taught that the way of progress is neither swift nor easy. The scientist who abandons a line of inquiry because progress is slow has confused comfort with rigor. Resilience in hard times is the decision to stay in the laboratory when the experiments are failing. You are not failing. You are doing the work that precedes the breakthrough.",
      },
    ],
  },
  {
    slug: "jobs-to-be-done-explained",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "Jobs-to-Be-Done Explained: The Framework Founders Use to Understand What Customers Actually Want",
    description:
      "Clayton Christensen's Jobs-to-Be-Done framework says people do not buy products — they hire them to do a job. The McDonald's milkshake example revealed that commuters hire milkshakes for morning-commute boredom management, not nutrition. For founders, discovering the real job your product is hired for is the fastest path to product-market fit.",
    targetKeywords: [
      "jobs to be done framework",
      "JTBD framework explained",
      "what job is my product hired for",
      "Clayton Christensen jobs to be done",
      "product market fit framework",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "You built a product for one use case and users keep using it for something adjacent. Or your churn is high despite good reviews. Clayton Christensen discovered that McDonald's was unknowingly competing with bagels and boredom, not other milkshakes. The Jobs-to-Be-Done framework finds the actual job your product is being hired to do — which is often not what you built it for.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Leonardo da Vinci",
        text: "The painter who does not understand why someone commissions a portrait will paint the wrong thing with great technical skill. Understanding the job to be done is understanding the true constraint. Not what the patron says they want — what the portrait must accomplish for them in the room where it will hang. Begin there.",
      },
      {
        speaker: "Marie Curie",
        text: "The question is not what the substance appears to be. The question is what it is actually doing. The same principle applies to your product: the user behavior you observe is data about the job being done, not confirmation of the job you intended. Watch what people do with it. That is your real product insight.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "Men are moved by fear and by love, and the wise prince knows which force is operating before he acts. Your customers are moved by jobs they need done and pains they need avoided. Know which one your product is actually serving. The founder who does not know this is governing a kingdom without a map.",
      },
    ],
  },
  {
    slug: "second-order-thinking-explained",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title: "Second-Order Thinking: How to See What Others Miss",
    description:
      "First-order thinking asks what will happen. Second-order thinking asks what will happen next, and then what will happen after that. Marcus Aurelius practiced second-order thinking in everything from political decisions to personal conduct — asking not just what an action would accomplish but what kind of person it would make him, and what kind of empire it would leave.",
    targetKeywords: [
      "second order thinking explained",
      "second order effects examples",
      "how to think in second order",
      "Charlie Munger second order thinking",
      "mental models decision making",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "The obvious move seems clear. Everyone can see the first-order effect. The question is: have you thought through what happens after that? The market reacts. The competitor responds. The incentives shift. Second-order thinking is not complicated — it is just slower.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "For every action there is an equal and opposite reaction. In physics this is a law. In strategy it is a warning. The market you change will change in response to you changing it. Model the response before you act. Most people forget to.",
      },
      {
        speaker: "Marie Curie",
        text: "The consequences of a decision do not stop at the first effect. They cascade through systems in ways that are knowable in advance if you are willing to do the work. Thinking stops at the first layer because thinking is tiring. Second-order thinking is simply the willingness to continue.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Before you speak, ask: what will this produce? Before you act, ask: what will this cause in turn? The emperor who acts without modeling the cascade of his own emotional expression is not governing — he is reacting. Think forward one more step. Then one more after that.",
      },
    ],
  },
  // ── Wave 8: insight batch ─────────────────────────────────────────────
  {
    slug: "what-would-galileo-say-about-challenging-conventional-wisdom",
    type: "single",
    frameworkSlug: "galileo-galilei",
    decisionType: "evidence",
    title: "What Would Galileo Say About Challenging Conventional Wisdom?",
    description:
      "Galileo Galilei spent thirty years in direct conflict with the most powerful institution in Europe — and won by choosing his battles with precision. He did not challenge everything simultaneously. He picked the point where observational evidence was irrefutable, built the case incrementally, and only confronted the church directly when he had already made the data public and unignorable. For founders who need to challenge an industry's received wisdom, his method is more useful than his legend.",
    targetKeywords: [
      "challenging conventional wisdom in business",
      "how to challenge industry assumptions",
      "contrarian thinking strategy",
      "what would Galileo say",
      "Galileo decision making",
    ],
    hookQuestion:
      "Your industry has a dogma everyone follows — a pricing model, a channel assumption, a product category definition. You have data that contradicts it. Do you publish it directly and invite retaliation, or do you build your case until the evidence becomes undeniable before you force the confrontation?",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Galileo",
        text: "The first obligation is to record the observation accurately. The second is to publish it in a form that the opponent cannot suppress without publicly denying what any equipped observer can verify. I dedicated the Sidereus Nuncius to the Medici not from vanity but from strategy — a patron's name on the cover makes suppression a political problem for the suppressor, not merely a doctrinal one for me.",
      },
      {
        speaker: "Newton",
        text: "The mathematical description does not argue. It describes. When I published the Principia, I did not request that the existing natural philosophy be abandoned. I simply showed that one set of equations predicted every planetary position, every tide, every projectile arc, within measurement error. The existing framework could not do this. The numbers did the confrontation for me.",
      },
      {
        speaker: "Machiavelli",
        text: "He who innovates makes enemies of all who prospered under the old order, and only lukewarm defenders of those who might prosper under the new. This is true of doctrines as of princes. The heretic who wins is the one who builds enough institutional protection before he forces the confrontation. Galileo's error was timing — he had the protection of Cosimo II, then Cosimo died, and he proceeded as if nothing had changed. Never challenge a doctrine before you have counted your defenders.",
      },
    ],
  },
  {
    slug: "what-would-archimedes-say-about-technical-leverage",
    type: "single",
    frameworkSlug: "archimedes",
    decisionType: "systems",
    title: "What Would Archimedes Say About Technical Leverage?",
    description:
      "Archimedes said: give me a lever long enough and a fulcrum on which to place it, and I shall move the world. He was describing physics. He was also describing every high-leverage technical decision a founder will ever make. The question is not how much force you apply — it is whether you have found the right fulcrum. Archimedes spent his career finding fulcrums in mechanics, fluid dynamics, and war engineering. The method transfers.",
    targetKeywords: [
      "technical leverage startups",
      "Archimedes lever principle business",
      "high leverage technical decisions",
      "engineering decisions startup",
      "how to find technical leverage",
    ],
    hookQuestion:
      "You are working harder than any competitor but moving slower. The effort is not the problem. The system is. Archimedes spent a career finding the minimum point of application to produce the maximum effect. The same structural question applies to your technical stack, your team, and your product.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Archimedes",
        text: "The problem is never effort. The problem is finding where a small application of force produces a large displacement of outcome. In the Siege of Syracuse I did not produce more soldiers — I built machines that let each soldier control a force thirty times his own strength. The catapult and the claw ship are the same insight as the lever: identify the constraint, design the mechanism that makes that constraint irrelevant, then apply minimum force to the mechanism.",
      },
      {
        speaker: "Newton",
        text: "Leverage is a consequence of understanding the underlying system. The man who does not understand the relationship between force, mass, and acceleration will apply enormous effort in all directions. The man who understands will apply a single well-calculated force at a single well-chosen moment. Calculation precedes leverage. There is no shortcut.",
      },
      {
        speaker: "Ada Lovelace",
        text: "The Analytical Engine does not compute faster because it works harder. It computes faster because it works differently — the architecture of the operation determines the output, not the physical force applied to the mechanism. This is true of every technical system. Before you optimize the execution, examine the architecture. The architecture is always the leverage point.",
      },
    ],
  },
  {
    slug: "what-would-epictetus-say-about-managing-uncertainty",
    type: "single",
    frameworkSlug: "epictetus",
    decisionType: "resilience",
    title: "What Would Epictetus Say About Managing Uncertainty?",
    description:
      "Epictetus began life as a slave with a broken leg, became one of the most influential philosophers in Roman history, and taught a framework for decision-making under conditions no founder will ever match. The core: the dichotomy of control. Not a slogan — a precise diagnostic tool that separates the variables you can affect from those you cannot, and routes your attention accordingly. It is the most practical uncertainty management framework ever documented.",
    targetKeywords: [
      "managing uncertainty business",
      "Epictetus dichotomy of control",
      "stoic philosophy founders",
      "how to deal with uncertainty startup",
      "Epictetus business advice",
    ],
    hookQuestion:
      "The market shifted, the deal fell through, the co-founder left, the competitor shipped before you. You cannot control any of those facts. What you can control is your response to them — how quickly you reallocate attention, where you commit resources next, and whether the disruption becomes an excuse to avoid the real decisions. Epictetus had a framework for this.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Epictetus",
        text: "Men are disturbed not by events but by the opinions they form about events. This is not consolation philosophy — it is operational architecture. Every decision begins with a diagnosis: is this within my power to change, or is it not? If not, your only productive move is to change your relation to it. I was a slave. I could not change that fact. I could change everything that depended only on my own faculty of choice. Every uncertainty you face is the same structural question. Answer it before you act.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The obstacle is the way. Not because adversity is pleasant, but because the only path forward runs through the response to the obstacle, not around it. When Marcus Vindex revolted, I did not wish the revolt had not happened — I moved immediately to manage the situation that now existed. The founder who delays action until uncertainty resolves is waiting for a condition that never arrives.",
      },
      {
        speaker: "Machiavelli",
        text: "Fortune is a woman, and it is necessary, if you wish to master her, to conquer her by force. The prince who waits for certainty before acting cedes the field to the prince who acts in its absence. Uncertainty is not a condition to be managed — it is the permanent operating environment of anyone who intends to accomplish something. The question is not how to reduce it but how to act competently within it.",
      },
    ],
  },
  {
    slug: "what-would-frederick-douglass-say-about-building-credibility",
    type: "single",
    frameworkSlug: "frederick-douglass",
    decisionType: "persuasion",
    title: "What Would Frederick Douglass Say About Building Credibility?",
    description:
      "Frederick Douglass was an escaped slave who became the most widely read Black author in American history, an advisor to a president, and the most photographed American of the 19th century. He built credibility from absolute zero — no institutional backing, no social capital, no freedom to operate — through a precise sequence of actions: document the system's internal contradictions, demonstrate you understand its terms better than its defenders, and make the cost of ignoring you higher than the cost of engaging with you.",
    targetKeywords: [
      "building credibility as outsider",
      "how to build authority from zero",
      "Frederick Douglass leadership lessons",
      "credibility without credentials",
      "persuasion strategy founders",
    ],
    hookQuestion:
      "You are the outsider — new market, no brand recognition, no warm introductions, no track record in this specific domain. How do you build credibility fast enough to matter? Douglass went from property to presidential advisor in twenty years. The method is documented.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Douglass",
        text: "The first act is demonstration. Not argument — demonstration. My Narrative did not argue that I was intelligent. It proved it by existing. A man who cannot be believed when he speaks must do something undeniable. For a founder this means: ship something real before you ask anyone to take your word on anything. The prototype is the argument.",
      },
      {
        speaker: "Lincoln",
        text: "Credibility in the political sense comes from two things: that you understand the problem as the audience understands it, and that your proposed solution costs them less than the problem does. I did not abolish slavery by claiming it was wrong. I abolished it by making its continuation more costly than its end, to the people whose support I needed to end it. Know what your audience is actually calculating before you ask them to change their calculation.",
      },
      {
        speaker: "Machiavelli",
        text: "The prince who arrives from outside must accomplish something conspicuous quickly, because his support rests on his current usefulness, not on the affections built over time by a hereditary ruler. The outsider has no account to draw on — he must create one, and he must create it fast, before the inherited skepticism hardens into permanent indifference. Douglass understood this. So must every founder who enters a market without institutional backing.",
      },
    ],
  },
  {
    slug: "what-would-ada-lovelace-say-about-building-for-the-future",
    type: "single",
    frameworkSlug: "ada-lovelace",
    decisionType: "product",
    title: "What Would Ada Lovelace Say About Building Products for the Future?",
    description:
      "Ada Lovelace wrote the first computer program for a machine that would not exist for another century. She saw the general-purpose computing architecture in Babbage's mechanical engine before he did — and documented it precisely enough that modern computer scientists can read her notes as design specifications. Her method: understand the architecture before the implementation exists, then specify what the architecture makes possible that nothing before it could do.",
    targetKeywords: [
      "building products for the future",
      "Ada Lovelace product thinking",
      "how to think about future technology",
      "visionary product development",
      "first principles product design",
    ],
    hookQuestion:
      "You are building on a platform — AI, a new hardware paradigm, a regulatory change — that most of your market does not yet understand. You can see what the architecture makes possible. The question is how to build something real and useful today while staying true to the larger vision that only you can see yet.",
    publishedAt: "2026-05-14",
    agonExcerpt: [
      {
        speaker: "Ada Lovelace",
        text: "Babbage saw the Engine as a calculator. I saw it as a general symbol manipulator. The difference is not in the machine — the machine is the same either way. The difference is in the frame applied to the machine, and the frame determines what problems you think to bring to it. The founder who builds on a new platform by asking 'what can this do that the old tool did?' will always be outcompeted by the founder who asks 'what does this architecture make possible that was structurally impossible before?' Those are different questions with different product roadmaps.",
      },
      {
        speaker: "Newton",
        text: "The principles that govern a system are more durable than any particular application of them. I wrote the Principia not to describe planetary orbits — those were the examples. I wrote it to describe the force law, from which all specific motions follow. Build the general first. The specific applications will multiply themselves once the general principle is correctly stated.",
      },
      {
        speaker: "Tesla",
        text: "I could see a motor running in my mind before I built it. Not approximately — exactly. I knew the rotating magnetic field principle before I built the first induction motor, and I knew what it would make possible: an entire electrical distribution system based on alternating current that could transmit power over distances direct current could not. The vision is not decoration. The vision is the engineering specification. Work backward from what the architecture makes possible.",
      },
    ],
  },
  {
    slug: "what-galileo-and-newton-would-say-about-evidence-vs-consensus",
    type: "collision",
    frameworkSlug: "galileo-galilei",
    collisionFrameworkSlugs: ["galileo-galilei", "isaac-newton"],
    decisionType: "evidence",
    title: "Galileo vs. Newton: When Should You Trust Evidence Over Expert Consensus?",
    description:
      "A collision article on when to act on anomalous data before expert consensus has caught up, versus waiting for the broader scientific community to validate your findings before committing.",
    targetKeywords: [
      "evidence vs consensus decision making",
      "when to trust your data over experts",
      "anomalous data strategy",
      "Galileo Newton scientific method",
      "first mover data advantage",
    ],
    hookQuestion:
      "Your data shows something the industry doesn't believe yet. Every expert tells you the consensus is correct. Do you act on what you see, or wait for the field to catch up?",
    publishedAt: "2026-05-14",
  },
  // ── Wave 9 collision articles ─────────────────────────────────────────
  {
    slug: "galileo-vs-newton-on-disrupting-your-own-field",
    type: "collision",
    frameworkSlug: "galileo-galilei",
    collisionFrameworkSlugs: ["galileo-galilei", "isaac-newton"],
    decisionType: "innovation",
    title: "Galileo vs. Newton on Disrupting Your Own Field",
    description:
      "A collision on whether to publish findings that will make your existing reputation obsolete — the radical disruption approach (Galileo) versus the incremental paradigm-building approach (Newton). Both overturned prior consensus; they did it in completely different ways.",
    targetKeywords: [
      "disrupting your own field",
      "should I cannibalize my product",
      "self-disruption strategy",
      "when to pivot your expertise",
      "Galileo Newton innovation strategy",
    ],
    hookQuestion:
      "Your next product will make your current one obsolete. You could ship it now and control the disruption, or wait and let someone else ship it first. Galileo and Newton faced this exact choice. They reached opposite conclusions.",
    publishedAt: "2026-05-14",
  },
  {
    slug: "archimedes-vs-ada-lovelace-on-build-vs-theorize",
    type: "collision",
    frameworkSlug: "archimedes",
    collisionFrameworkSlugs: ["archimedes", "ada-lovelace"],
    decisionType: "product",
    title: "Archimedes vs. Ada Lovelace: Should You Build or Theorize First?",
    description:
      "A collision on whether to start with working prototypes or architectural specifications. Archimedes built physical models of his inventions; Ada Lovelace wrote algorithms for a machine that didn't exist. Both approaches produced revolutionary results. The choice depends on what kind of unknown you're trying to resolve.",
    targetKeywords: [
      "build vs theorize startup",
      "prototyping vs specification first",
      "architecture before implementation",
      "Archimedes Ada Lovelace",
      "product development approach",
    ],
    hookQuestion:
      "You have six months of runway and a product hypothesis. Do you build a scrappy prototype to test the core assumption, or write the full architectural specification first? Archimedes and Ada Lovelace would disagree.",
    publishedAt: "2026-05-14",
  },
  {
    slug: "douglass-vs-lincoln-on-playing-the-long-game",
    type: "collision",
    frameworkSlug: "frederick-douglass",
    collisionFrameworkSlugs: ["frederick-douglass", "abraham-lincoln"],
    decisionType: "strategy",
    title: "Douglass vs. Lincoln: When Does Playing the Long Game Cost You Too Much?",
    description:
      "A collision on when to accept a partial win now versus holding out for complete change. Lincoln accepted political constraints to preserve the union before abolishing slavery; Douglass consistently argued that partial progress normalized injustice. Both perspectives are correct. The question is what you are optimizing for.",
    targetKeywords: [
      "playing the long game strategy",
      "partial wins vs complete change",
      "when to compromise strategy",
      "Frederick Douglass Lincoln strategy",
      "when to hold out vs accept deal",
    ],
    hookQuestion:
      "The deal on the table is good but not great. You could take it now and use it as a platform for the next fight, or walk away and hold out for the full outcome. Lincoln would take the deal. Douglass would walk.",
    publishedAt: "2026-05-14",
  },
  {
    slug: "epictetus-vs-harriet-tubman-on-risk-under-constraint",
    type: "collision",
    frameworkSlug: "epictetus",
    collisionFrameworkSlugs: ["epictetus", "harriet-tubman"],
    decisionType: "control",
    title: "Epictetus vs. Harriet Tubman: How Much Risk Is Rational Under Constraint?",
    description:
      "A collision on how to act when the system is stacked against you. Epictetus accepted his situation as a slave and found freedom within it; Harriet Tubman ran the Underground Railroad despite the same kind of constraint. Both were right — and they represent two valid strategic responses to operating under a system that punishes direct action.",
    targetKeywords: [
      "taking risk under constraint",
      "when to accept vs resist constraints",
      "operating under systemic disadvantage",
      "Epictetus Tubman stoic philosophy",
      "founder risk taking",
    ],
    hookQuestion:
      "You are operating in a market where the rules favor incumbents. Do you find ways to be effective within those rules, or do you build a parallel system outside them? Epictetus and Harriet Tubman ran opposite experiments.",
    publishedAt: "2026-05-14",
  },
  {
    slug: "carnegie-vs-rockefeller-on-monopoly-strategy",
    type: "collision",
    frameworkSlug: "andrew-carnegie",
    collisionFrameworkSlugs: ["andrew-carnegie", "john-d-rockefeller"],
    decisionType: "scaling",
    title: "Carnegie vs. Rockefeller on Building Market Dominance",
    description:
      "A collision on two strategies for achieving market dominance: Carnegie's approach of vertical integration and cost efficiency (own the production, out-cheap everyone), versus Rockefeller's approach of horizontal control and logistics leverage (control the distribution, make alternatives uneconomical). Both built the largest companies of their era. They used opposite playbooks.",
    targetKeywords: [
      "market dominance strategy",
      "vertical vs horizontal integration",
      "Carnegie vs Rockefeller strategy",
      "how to build monopoly power",
      "scaling startup strategy",
    ],
    hookQuestion:
      "You can either win by being the lowest-cost producer at scale (own the production chain), or by controlling the distribution channel that everyone else has to use. Carnegie went vertical. Rockefeller went horizontal. They both won.",
    publishedAt: "2026-05-14",
  },
  // ── Wave 10 collision articles ─────────────────────────────────────────
  {
    slug: "machiavelli-vs-sun-tzu-on-competitive-intelligence",
    type: "collision",
    frameworkSlug: "niccolo-machiavelli",
    collisionFrameworkSlugs: ["niccolo-machiavelli", "sun-tzu"],
    decisionType: "strategy",
    title:
      "Machiavelli vs. Sun Tzu: Should You Know Your Enemy or Be Your Enemy?",
    description:
      "A collision on competitive intelligence strategy — Sun Tzu's framework demands total knowledge of the enemy before engaging, while Machiavelli argues that projecting a reputation for decisive strength prevents the engagement from being necessary. Both dominated their domains; they reached opposite conclusions about whether intelligence or intimidation is the ultimate competitive weapon.",
    targetKeywords: [
      "competitive intelligence strategy",
      "know your enemy business",
      "Machiavelli Sun Tzu strategy",
      "startup competitive strategy",
      "how to respond to competition",
    ],
    hookQuestion:
      "You have discovered that a well-funded competitor is entering your market in 90 days. Do you spend resources studying them obsessively to find their weaknesses, or do you spend those resources publicly demonstrating your own strength so they reconsider the move?",
    publishedAt: "2026-05-21",
  },
  {
    slug: "marcus-aurelius-vs-seneca-on-processing-failure",
    type: "collision",
    frameworkSlug: "marcus-aurelius",
    collisionFrameworkSlugs: ["marcus-aurelius", "seneca"],
    decisionType: "resilience",
    title:
      "Marcus Aurelius vs. Seneca: How Long Should You Sit With Failure Before Moving On?",
    description:
      "A collision on the stoic prescription for failure. Marcus Aurelius held that the only failure is the failure to extract meaning — you move immediately, carrying the lesson forward as fuel. Seneca wrote extensively about the value of sitting with difficulty, examining it fully before acting. Both were stoics, both faced real failure. Their prescriptions for how long to dwell before moving differ significantly.",
    targetKeywords: [
      "how to process failure",
      "stoic approach to failure",
      "Marcus Aurelius failure",
      "resilience after failure",
      "how to bounce back from failure",
    ],
    hookQuestion:
      "Your last product launch failed publicly. You have 48 hours before investors ask for a post-mortem. Do you spend the next two days excavating what went wrong in full detail (Seneca), or do you write one clear lesson and redirect your energy immediately (Aurelius)?",
    publishedAt: "2026-05-21",
  },
  {
    slug: "franklin-vs-carnegie-on-building-your-network",
    type: "collision",
    frameworkSlug: "benjamin-franklin",
    collisionFrameworkSlugs: ["benjamin-franklin", "andrew-carnegie"],
    decisionType: "hiring",
    title: "Franklin vs. Carnegie: Should Your Network Be Broad or Deep?",
    description:
      "A collision on network strategy. Benjamin Franklin built the broadest network in 18th-century America — the postmaster, the scientist, the diplomat — deliberately cultivating connections across every domain and institution. Carnegie built concentrated, deep relationships with a small circle of operators and trusted his network to perform. Both became the most connected men in their respective societies, but the architecture of their networks was opposite. The question is what kind of problem you are trying to solve.",
    targetKeywords: [
      "building your network startup",
      "broad vs deep network",
      "how to build a professional network",
      "networking strategy business",
      "Benjamin Franklin Carnegie networking",
    ],
    hookQuestion:
      "You have 10 hours per month for networking. Do you use them to make 40 light-touch connections across different industries and cities, or to deepen relationships with 4 people who are directly adjacent to your work?",
    publishedAt: "2026-05-21",
  },
  {
    slug: "cleopatra-vs-catherine-the-great-on-ruling-through-alliance",
    type: "collision",
    frameworkSlug: "cleopatra-vii",
    collisionFrameworkSlugs: ["cleopatra-vii", "catherine-the-great"],
    decisionType: "strategy",
    title:
      "Cleopatra vs. Catherine the Great: Is Your Strongest Alliance Your Biggest Vulnerability?",
    description:
      "A collision on alliance strategy as a survival mechanism. Cleopatra built Rome as her guarantor — Julius Caesar then Mark Antony — and that alliance defined both her power and her downfall. Catherine the Great built internal power through institutional control, kept foreign alliances subordinate to domestic strength, and outlasted every regime that threatened her. Both were women ruling in hostile environments. One bet on external anchors; the other refused to.",
    targetKeywords: [
      "strategic alliance risk",
      "partnership dependency risk",
      "when to rely on alliance",
      "Cleopatra Catherine the Great",
      "startup partnership strategy",
    ],
    hookQuestion:
      "Your startup's survival depends on a partnership with a much larger company that controls your distribution channel. Do you deepen the dependency by expanding the partnership, or do you spend the next year building a path to independence even if it means slower growth?",
    publishedAt: "2026-05-21",
  },
  // ── Wave 11 collision articles ─────────────────────────────────────────
  {
    slug: "caesar-vs-alexander-on-how-fast-to-expand",
    type: "collision",
    frameworkSlug: "julius-caesar",
    collisionFrameworkSlugs: ["julius-caesar", "alexander-the-great"],
    decisionType: "strategy",
    title: "Caesar vs. Alexander: Should You Secure Each Step or Bet on Speed?",
    description:
      "A collision on expansion pacing. Caesar conquered Gaul methodically: each territory was pacified, integrated into Roman administrative structure, and converted into a tax base before he advanced. Alexander marched from Macedonia to India in 13 years and never stopped to consolidate — he trusted speed and spectacle to prevent organized resistance from forming. Both strategies produced world-historical results. They are genuinely incompatible, and the choice between them has direct implications for any founder deciding how fast to expand.",
    targetKeywords: [
      "expansion strategy startup",
      "how fast to expand startup",
      "geographic expansion timing",
      "Caesar Alexander expansion strategy",
      "sequential vs simultaneous market entry",
    ],
    hookQuestion:
      "You have product-market fit in one city and a team that can execute in two more. You could spend 6 months saturating the first market and building the operational playbook, or you could open all three simultaneously and figure out operations as you go. Caesar would open one at a time. Alexander would open all three today.",
    publishedAt: "2026-05-21",
  },
  {
    slug: "jobs-vs-edison-on-perfectionism-vs-shipping",
    type: "collision",
    frameworkSlug: "steve-jobs",
    collisionFrameworkSlugs: ["steve-jobs", "thomas-edison"],
    decisionType: "iteration",
    title: "Jobs vs. Edison: Should You Ship the 80% Version or Wait for Perfect?",
    description:
      "A collision on the right pace of product iteration. Edison ran over 10,000 experiments on the lightbulb, shipped dozens of intermediate products, and treated public iteration as a feature rather than an embarrassment. Jobs killed products that weren't ready, delayed launches by months to fix corner-case details, and staged reveals only when a product could make a maximum-impact statement. Both created category-defining products. Their philosophies about when a product is ready are directly opposed.",
    targetKeywords: [
      "ship early vs wait for perfect",
      "perfectionism vs iteration startup",
      "when to launch your product",
      "Jobs Edison product launch",
      "MVP vs polished product",
    ],
    hookQuestion:
      "Your product works for 80% of users in 80% of cases. Shipping now means feedback from real users but also public exposure of the rough edges. Waiting 3 months means a cleaner launch but 3 months of delayed learning. Edison would ship today. Jobs would wait.",
    publishedAt: "2026-05-21",
  },
  {
    slug: "cicero-vs-machiavelli-on-winning-by-argument-or-power",
    type: "collision",
    frameworkSlug: "cicero",
    collisionFrameworkSlugs: ["cicero", "niccolo-machiavelli"],
    decisionType: "persuasion",
    title:
      "Cicero vs. Machiavelli: Do You Win by Making Better Arguments or by Controlling the Frame?",
    description:
      "A collision on the nature of persuasion. Cicero argued 300+ cases before Roman courts and won the majority on the quality of his logic, evidence, and delivery — his framework holds that a well-constructed argument will prevail with a rational audience. Machiavelli observed that arguments rarely win anything: what wins is who sets the terms of the debate, who controls the institutional machinery, and who has the power to make inaction costly. Both are correct in their respective domains; the question is which domain you are actually in.",
    targetKeywords: [
      "how to persuade people in business",
      "argument vs power in negotiation",
      "Cicero Machiavelli persuasion",
      "winning boardroom arguments",
      "how to win a debate at work",
    ],
    hookQuestion:
      "You need to convince your board that the company should change direction. You have prepared a 20-slide deck with compelling data, clear logic, and three case studies. Cicero says the argument will carry the day if you deliver it well. Machiavelli says the argument is irrelevant — the question is whether you have the votes before you walk into the room.",
    publishedAt: "2026-05-21",
  },
  // ── Wave 12 collision articles ─────────────────────────────────────────
  {
    slug: "tubman-vs-douglass-on-direct-action-vs-advocacy",
    type: "collision",
    frameworkSlug: "harriet-tubman",
    collisionFrameworkSlugs: ["harriet-tubman", "frederick-douglass"],
    decisionType: "persuasion",
    title:
      "Harriet Tubman vs. Frederick Douglass: Should You Act Now or Build Consensus First?",
    description:
      "Tubman and Douglass shared the same goal and disagreed sharply on method. Tubman believed that waiting for permission or consensus was itself a form of complicity — she acted, and others followed. Douglass believed that durable change required the moral persuasion of the majority, not only the courage of the individual. Both changed history. The tension between them is the foundational dilemma of anyone who sees what's wrong and must decide whether to move now or build the coalition first.",
    targetKeywords: [
      "should I act now or build consensus",
      "bold action vs persuasion",
      "direct action vs advocacy",
      "when to go rogue vs bring others along",
      "action vs consensus startup",
    ],
    hookQuestion:
      "Your team is six months in. You believe the current approach is fundamentally wrong, but three of four co-founders disagree. Tubman would say: don't wait for permission — act, and those who see it will follow. Douglass would say: you cannot lead where no one will follow, and unilateral action without buy-in rarely sticks. What do you do?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Harriet Tubman",
        text: "I never ran my railroad by taking a vote. The moment you ask permission from those who benefit from the current arrangement, you have already lost. I called this my 'no looking back' principle: once the mission begins, hesitation is contagion. Every person who chose not to move the night I came for them was someone who calculated that waiting was safer than going. They were wrong. The window closes. If my logic wins here, you do not wait for your three co-founders to agree — you make the first irreversible move and let the results do the persuading.",
      },
      {
        speaker: "Frederick Douglass",
        text: "Tubman freed hundreds. I helped dismantle the legal architecture that held millions. Those are not competing achievements — they are different weapons. I understood early that courage without rhetoric leaves no institutional change behind it. When I stood before a white abolitionist audience and spoke, I was not asking permission. I was converting the indifferent into the necessary. If my logic wins here, you do not unilaterally pivot — you make the argument so undeniable that the three who disagree convert or step aside. Forced change that the team doesn't understand collapses the moment pressure arrives.",
      },
      {
        speaker: "Harriet Tubman",
        text: "Douglass had the luxury of a platform — he could wait for an audience to form. My people did not have that luxury. The 'build consensus first' argument presupposes that the system will remain stable while you persuade it. I never assumed that. The consensus you build by waiting is often just the consensus of exhaustion — everyone too tired of the argument to resist any longer. That is not buy-in. That is capitulation dressed as agreement. If the approach is wrong and you know it, every week you spend building consensus is a week the wrong approach is compounding.",
      },
      {
        speaker: "Frederick Douglass",
        text: "Tubman misreads what I am saying. I am not arguing for patience as virtue. I am arguing for precision as strategy. I timed every public confrontation to the moment when the political cost of ignoring me exceeded the cost of engaging. That is not waiting — it is targeting. The founder who acts unilaterally before the team understands the why will build a technically correct product that the organization cannot execute. The technical correctness of your position is not sufficient. Your co-founders are not opponents to be outmaneuvered — they are the people who must execute whatever you decide.",
      },
      {
        speaker: "Harriet Tubman",
        text: "Here is what I know: I never lost a single person on the railroad. Not one. That record was not built on waiting for full team agreement — it was built on operational clarity, decisive timing, and the willingness to say 'we move tonight' before the window closed. If you are in the 25% minority and you know you are right, ask yourself honestly: are the other 75% resisting because they have better information, or because change is uncomfortable and the current path still feels safe? Those are different problems with different solutions.",
      },
      {
        speaker: "Frederick Douglass",
        text: "And here is what I know: the organizations that outlast their founding moments are built on shared understanding, not compliance. I converted opponents into allies because I needed them to remain allies after the immediate crisis passed. The question you must answer is not just 'am I right?' but 'will this organization still be executing this direction in 18 months if I force it now?' Tubman's missions ended when freedom was reached. Your startup must keep running after the decision is made. The consensus that feels slow to build is often the only thing that makes the outcome durable.",
      },
    ],
  },
  {
    slug: "ada-lovelace-vs-tesla-on-vision-without-resources",
    type: "collision",
    frameworkSlug: "ada-lovelace",
    collisionFrameworkSlugs: ["ada-lovelace", "nikola-tesla"],
    decisionType: "innovation",
    title:
      "Ada Lovelace vs. Nikola Tesla: Should You Keep Building When You're Out of Resources?",
    description:
      "Both Lovelace and Tesla were visionaries who ran out of resources before their ideas could be realized. Lovelace died at 36 with her most important work unpublished and unrecognized; she preserved the vision through precise documentation. Tesla spent his final decades broke and alone, doubling down on increasingly ambitious projects that never shipped. The collision is not about whether to persist — it is about what persistence actually looks like when the resources are gone: preserve and transmit the vision, or keep pushing until something breaks.",
    targetKeywords: [
      "should I keep going when out of money",
      "pivot vs persist when broke",
      "visionary without resources",
      "how long to keep building startup",
      "persistence vs pivoting startup",
    ],
    hookQuestion:
      "You have a technical breakthrough that you believe in deeply. Your funding runs out in 60 days. Eight investors have passed. Lovelace would say: the vision is worth preserving even if the implementation must wait — document it, protect it, find the form in which it can survive. Tesla would say: double down, cut everything else, and build the proof-of-concept that forces the world to pay attention. Do you keep going?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Ada Lovelace",
        text: "I wrote algorithms for a machine that did not exist and would not exist for a century. My constraint was not resources — it was the form in which the vision could survive without them. The notes I wrote for Babbage's engine were more valuable than any prototype I could have built with the funding available to me, because they expressed the principle precisely enough that someone with future resources could act on them. If my logic wins here, you stop trying to build the full product with 60 days of runway and ask instead: what is the minimal, precise expression of this breakthrough that will survive you running out of money?",
      },
      {
        speaker: "Nikola Tesla",
        text: "I understand the position Lovelace describes. I reject it. The algorithm that is never demonstrated is not a breakthrough — it is a hypothesis. I ran out of Morgan's funding and I built anyway. I ran out of credibility in the AC wars and I demonstrated anyway. The proof-of-concept is not a luxury for when resources are available — it is the only argument that investors who have already passed will respond to. Eight investors said no to your pitch. None of them has seen the physical proof yet. Those are not the same rejection. If my logic wins here, you spend the 60 days building the one demonstration that makes the claim undeniable.",
      },
      {
        speaker: "Ada Lovelace",
        text: "Tesla built his proof-of-concept. Morgan cut off his funding. He spent the remaining decades of his life in poverty chasing demonstrations that grew more ambitious as his resources shrank. That is not persistence — that is a system that mistakes motion for progress. The question is not whether the vision is real. The question is what form the vision takes when the implementation path is blocked. I was a mathematician working in an era that did not yet have the infrastructure for general-purpose computing. The correct response was not to build more expensive machinery I could not fund. It was to document the principle so precisely that it would survive until the infrastructure caught up.",
      },
      {
        speaker: "Nikola Tesla",
        text: "You are applying my ending to my middle incorrectly. Before the final years, I demonstrated alternating current to the satisfaction of Westinghouse. I lit the Chicago World's Fair. The demonstrations were real, the technology worked, and the adoption followed. The problem was not that I persisted — the problem was that I kept starting new projects before the revenue from the previous ones had compounded. If you have a genuine technical breakthrough, the 60 days is not the end of the story. It is the deadline for the minimum demonstration. Build to that threshold, not to the full vision. I failed when I confused the full vision with the minimum proof. Do not make that mistake.",
      },
      {
        speaker: "Ada Lovelace",
        text: "And here is where we may agree more than it appears: the question of what constitutes the minimum expression of the breakthrough. For me, the minimum was a specification precise enough to be acted upon later. For Tesla, the minimum was a physical demonstration that could not be dismissed. The answer depends on what is actually blocking adoption — is the investor problem 'we don't believe this is technically possible,' in which case Tesla is right and you need a physical proof? Or is it 'we don't see the market,' in which case no demonstration resolves the objection and you are better served by Lovelace's approach: find the form of the vision that can survive until the market appears.",
      },
      {
        speaker: "Nikola Tesla",
        text: "Then the decision tree is this: identify the specific objection that killed the last eight pitches. If the objection is technical credibility, spend the 60 days on the demonstration — I am correct. If the objection is market timing or business model, a demonstration does not answer it, and Lovelace's discipline of preserving the principle while pivoting the packaging is the right move. But do not confuse giving up with strategic patience. I never gave up on AC current. I only wish I had given up sooner on the projects where the blocking constraint was not technical.",
      },
    ],
  },
  // ── Wave 13 collision articles ─────────────────────────────────────────
  {
    slug: "napoleon-vs-caesar-on-knowing-when-to-stop",
    type: "collision",
    frameworkSlug: "napoleon-bonaparte",
    collisionFrameworkSlugs: ["napoleon-bonaparte", "julius-caesar"],
    decisionType: "strategy",
    title: "Napoleon vs. Julius Caesar: How Do You Know When to Stop Expanding?",
    description:
      "Both Napoleon and Caesar built empires that eventually broke under their own weight — but they broke in different ways and for different reasons. Napoleon's overextension was logistical: his supply lines couldn't support the ambition. Caesar's was political: he accumulated power so fast that the republic couldn't absorb it without erupting. For founders with multiple products and a team spreading thin, this collision surfaces the precise question: at what point does 'more' become the strategy that defeats you?",
    targetKeywords: [
      "should I expand or consolidate",
      "when to stop growing startup",
      "overextension startup",
      "how many products should a startup have",
      "expand vs focus startup strategy",
    ],
    hookQuestion:
      "Your SaaS has 3 products generating $40K MRR. Each one has spawned 2 new ideas the team wants to build. You have 8 engineers. Both Napoleon and Caesar built empires that eventually broke under their own weight. At what point does 'more' become the strategy that defeats you?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Napoleon Bonaparte",
        text: "The error is not ambition — it is ambition without logistical architecture behind it. I won at Austerlitz because every corps, every supply depot, every march route had been calculated before the first soldier moved. Where I failed was in Russia: not because the ambition was wrong but because I moved faster than my supply lines could follow. Your 8 engineers are your supply line. If you are spawning 6 new products from 3 existing ones, you are not expanding — you are outrunning your own capacity to sustain anything. The correct question is not whether to expand, but whether your operational infrastructure can support the expansion you are contemplating. My construct here is logistical coherence: can the supply line sustain the advance? If my logic wins, you do not build new products until you have systematized the operations of the existing three to the point where they run without heroic effort.",
      },
      {
        speaker: "Julius Caesar",
        text: "Napoleon is describing the mechanics of overextension but missing its deeper structure. I conquered Gaul not by restraining ambition but by converting each new territory into a resource base before advancing. The Gallic campaign funded itself: each province I pacified began generating tax revenue that supported the next campaign. Your three products are not yet self-sustaining resource bases — they are each consuming attention without compounding it. The fundamental question is not how many products you can build but whether each existing product is generating enough leverage — in brand, in customer trust, in distribution — to make the next one easier than the last. If the three are not compounding, adding six more produces six more drains on the same constrained pool. My construct is territorial consolidation: is each position generating resources for the next advance? If my logic wins, you pause expansion and spend the next quarter turning your three products into compounding assets before you open any new fronts.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Caesar is correct about consolidation as the precondition, but he understates the danger of the window closing. I lost in Russia, yes — but I also nearly lost at Waterloo by waiting too long after Elba, allowing the coalition to solidify against me. There are moments in a market where the window for expansion is genuinely open and brief. A competitor who is currently distracted will not remain distracted. A customer segment that is currently underserved will attract funded entrants within 18 months. The failure mode I am warning against is not expansion itself — it is expansion that exceeds your operational tempo. The right answer is to identify, ruthlessly, which one of your six new ideas has the highest strategic value and the best fit with your existing operational capacity — and build only that one, completely, before opening the next front. Concentration of force is not the same as passivity.",
      },
      {
        speaker: "Julius Caesar",
        text: "I do not disagree with Napoleon on concentration of force — I crossed the Rubicon with a single legion precisely because concentrated, irreversible commitment produces faster results than dispersed, reversible half-measures. But let me push on the specific variable Napoleon keeps leaving implicit: the difference between overextension that is recoverable and overextension that is not. In Gaul, I sometimes held too many positions at once and had to consolidate under pressure — but the core legions remained intact and the resource base recovered. What I never did was hollow out the core while expanding the periphery. Your 8 engineers are your core legion. The test is this: if you added one new product and it failed, would the failure damage any of the three existing ones? If yes, you are gambling the core on the periphery. If no — if the existing three are truly self-sustaining — then one carefully chosen expansion is not overextension. It is a Gallic probe.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Caesar's Gallic probe framing is useful, and I will extend it into the specific decision you face. Six new ideas is not a decision — it is a symptom of unclear priorities. The founder who cannot say which one of the six is the highest-leverage bet has not done the strategic work yet. My operational framework would force this analysis: rank the six ideas by three criteria — fit with existing customer base, fit with existing engineering capability, and time to positive unit economics. The idea that scores highest on all three is the probe. Build that one. Everything else goes on a list that gets reviewed quarterly but receives no engineering resources until the probe has either succeeded and been systematized or failed and been documented. The Russian mistake was not that I went to Russia — it was that I went without having answered the question of whether the campaign could be self-sustaining within 90 days. Apply that question to your six ideas. Most of them will fail it immediately.",
      },
      {
        speaker: "Julius Caesar",
        text: "We have converged on the actionable answer, and I want to name what it implies about your underlying strategic posture. The empires that broke under their own weight — mine included, in the political sense — broke not only from overextension but from a failure to build the institutional infrastructure that converts territorial gains into durable power. I was assassinated not because I expanded too fast but because I accumulated personal authority without building the republican institutions that could have absorbed it. Your 3 products at $40K MRR are territorial gains. The question is whether you are building the organizational infrastructure — documented processes, clear ownership, performance metrics — that converts those gains into durable leverage. If your three products each require your personal attention to sustain them, you have not actually consolidated them. You have merely occupied them. The founder who builds six products on top of three uninstutionalized ones is not expanding — they are accelerating toward the point where the whole structure depends on a single indispensable leader. That is not empire-building. That is the precondition for collapse.",
      },
    ],
    conclusion: {
      summary:
        "Napoleon and Caesar agree that the question is not whether to expand, but whether the existing positions are truly self-sustaining before any new front is opened. Napoleon frames it as logistical coherence — can the supply line support the advance? Caesar frames it as territorial consolidation — is each position generating resources for the next one? Both point to the same diagnostic: if your 3 products each require heroic effort to sustain, you have not actually consolidated them, and adding more products accelerates the path to structural failure.",
      actionableInsight:
        "Before building any of the 6 new ideas, run this test on each of your 3 existing products: if you personally stepped away for 30 days, would it sustain itself? If the answer is no for any of them, stop. Systematize those first. Once all three pass the test, apply Napoleon's probe criteria (customer fit, engineering fit, time to positive unit economics) to rank the 6 new ideas. Build the top-ranked one only, and treat it as a probe with a defined success threshold and a 90-day cut-off. That is the difference between expansion that compounds and expansion that consumes.",
    },
  },
  {
    slug: "jobs-vs-galileo-on-betting-against-consensus",
    type: "collision",
    frameworkSlug: "steve-jobs",
    collisionFrameworkSlugs: ["steve-jobs", "galileo-galilei"],
    decisionType: "innovation",
    title: "Steve Jobs vs. Galileo: Should You Bet Against the Market Consensus?",
    description:
      "Steve Jobs ignored every form of market consensus — surveys, focus groups, analyst reports — and built products the market said it didn't want. Galileo ignored the most powerful institutional consensus in European history — the Church, the Aristotelian tradition, the entire academic establishment — and proved them wrong with a telescope. Both paid real costs for their contrarianism. The question is not whether to bet against consensus, but how to distinguish genuine insight from delusion when the market disagrees with you.",
    targetKeywords: [
      "should I build against market consensus",
      "contrarian startup idea",
      "when to ignore market research",
      "going against conventional wisdom startup",
      "contrarian product bet",
    ],
    hookQuestion:
      "Every investor, your two advisors, and your own market survey data says there is no demand for what you want to build. You believe they're all measuring the wrong thing. Jobs ignored the consensus and won. Galileo ignored the consensus and nearly lost everything. When is the contrarian bet worth it?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Steve Jobs",
        text: "Market research cannot tell you what to build because it can only measure what people already understand. When I commissioned the original Macintosh, no market survey said people wanted a graphical interface — they had never used one. When we built the iPhone, every carrier, every analyst, and every competitor said a phone without a keypad would fail. They were measuring the wrong thing. They were asking people about keyboards when the question was whether people wanted a computer in their pocket. The contrarian bet is worth making when you understand something structural about human desire that your market research cannot access — not because the data is wrong, but because the data is measuring a world that your product will make obsolete. My construct is this: if the consensus is measuring preferences within the current paradigm and you are building a product that changes the paradigm, the consensus is not evidence against your idea. It is evidence that the paradigm has not yet shifted. If my logic wins here, you do not defer to the surveys. You ask whether your insight is about what people will want in the new paradigm, or merely what you wish they wanted in the current one.",
      },
      {
        speaker: "Galileo Galilei",
        text: "Jobs describes the contrarian bet correctly but omits the cost structure. I did not simply ignore the Aristotelian consensus — I built an evidentiary record that could not be dismissed without the dismisser publicly denying observable reality. The telescope did not require the Church to trust my judgment. It required them to look. The founder who bets against market consensus without building the equivalent of the telescope is not a contrarian — they are an optimist with unusually high confidence. Before you ignore your investors, your advisors, and your own survey data, answer this: what is the observable, specific, undeniable thing that you can show them that makes the consensus's prediction falsifiable? Jobs had product demos. I had moons. If you cannot identify what the equivalent of the moons is for your product — the thing that any honest observer would have to engage with rather than dismiss — you have not yet done the work that earns the contrarian position. My construct is evidentiary precision: the contrarian bet is legitimate when the evidence for it is strong enough that disagreement requires active denial of observable fact, not merely a different prior.",
      },
      {
        speaker: "Steve Jobs",
        text: "Galileo's telescope framing is correct, but I want to push on where it applies and where it breaks. In Galileo's case, the moons of Jupiter were already there — he only needed to build the instrument to make them visible. In product work, the 'moons' do not exist until you build the product. This is the asymmetry that Galileo's framework cannot fully capture: sometimes the contrarian insight is not that the consensus is measuring the current world incorrectly, but that the product itself creates the demand once it exists. Nobody wanted the Walkman before Sony built it. Nobody wanted to carry 1,000 songs in their pocket before the iPod existed. The market research that precedes those products is measuring a world without them — of course it shows no demand. The question Galileo should have asked before his telescope was not 'can I show observers the moons of Jupiter' but 'will moons be visible once I grind this particular lens configuration?' That prior calculation is the founder's work. The evidence comes after, not before. My framework: have you derived — not hoped, derived — that the product you want to build creates the demand it requires? If yes, the consensus is not evidence against it. It is evidence that the product does not yet exist.",
      },
      {
        speaker: "Galileo Galilei",
        text: "Jobs is making a stronger claim than I would endorse, and I want to name the failure mode it enables. The argument that 'the product creates the demand' is the argument that every founder with a failing product has made to justify continuing. It is structurally unfalsifiable: if demand exists, the product validated the bet; if demand does not exist, the market has not yet understood the product. I ran this risk myself — my early telescope demonstrations were dismissed by philosophers who refused to look, and I had to spend fifteen years building an evidentiary record that made dismissal costly. But I never argued that the moons would appear once people believed in them. I argued that they were already there and that the instrument would make them visible. The distinction matters: if your product is revealing something that exists — a real latent desire, a genuine unmet need that people cannot currently articulate — then the Jobs framework applies. If your product is attempting to create a desire that does not yet exist in any form, the failure rate is orders of magnitude higher and the evidentiary bar before you invest 18 months of engineering time must be correspondingly higher. Show me the latent signal before we call this a contrarian insight rather than a contrarian wish.",
      },
      {
        speaker: "Steve Jobs",
        text: "The latent signal test is the right question. Here is how I would apply it operationally to your situation. You have investors, advisors, and survey data all pointing the same direction — no demand. But none of them are the market. They are proxies for the market operating inside the current paradigm. The test is not whether those proxies agree with you. The test is whether you can find, in the actual behavior of actual people, the latent signal that your product addresses. It does not have to be large. Before the Macintosh, there were only a few thousand people who had interacted with a graphical interface at Xerox PARC. They were not in any market survey. But they existed, and their response was the latent signal. Your job is not to convince investors using the same market data they have already seen. Your job is to find the people whose behavior already implies the demand for your product — the workarounds, the hacks, the complaints that map to the problem you are solving. If you can find those people, you have a telescope. If you cannot, Galileo is right: you are working from belief, not from evidence.",
      },
      {
        speaker: "Galileo Galilei",
        text: "We have converged on the precise test, and I will state it in terms that can be applied directly to your situation. The contrarian bet is warranted when three conditions are simultaneously true: first, the consensus is measuring preferences within the existing paradigm and your product changes the paradigm — Jobs's condition. Second, there is a latent signal in current behavior that reveals the unmet need your product addresses, even if that signal is small — my evidentiary condition. Third, you can specify in advance what observable outcome would prove you wrong within 12 months of launch — the falsifiability condition that distinguishes genuine contrarian insight from motivated reasoning. If all three conditions are met, your investors, advisors, and surveys are not evidence against your idea — they are the noise that exists before any paradigm shift. If any of the three conditions fails, you have not yet earned the contrarian position. You are not Galileo with a telescope. You are the philosopher who refused to look through one.",
      },
    ],
    conclusion: {
      summary:
        "Jobs and Galileo converge on a three-part test for the legitimate contrarian bet: the consensus is measuring the current paradigm while your product changes it (Jobs); there is a latent signal in current behavior that your product addresses, even if small (Galileo); and you can specify in advance what would prove you wrong within 12 months (the falsifiability test). Fail any of the three and you are not a contrarian — you are an optimist without evidence.",
      actionableInsight:
        "Before you override your investors, advisors, and market data, answer three questions: First, are they measuring preferences in a world your product makes obsolete? Second, can you find real people whose behavior already implies the need your product addresses — the workarounds, the hacks, the complaints? Third, can you state specifically what outcome at month 12 would prove you wrong? If you can answer all three, proceed. If you cannot answer the third — if your idea is not falsifiable within a defined timeframe — you have not done the hard intellectual work yet. The moons were already there. Find them.",
    },
  },
  {
    slug: "epictetus-vs-seneca-on-how-to-handle-adversity",
    type: "collision",
    frameworkSlug: "epictetus",
    collisionFrameworkSlugs: ["epictetus", "seneca"],
    decisionType: "resilience",
    title: "Epictetus vs. Seneca: How Should You Handle What You Cannot Control?",
    description:
      "Both Epictetus and Seneca were Stoics, but they were Stoics who lived radically different lives and drew different operational conclusions from the same philosophy. Epictetus spent decades as a slave with a broken leg and developed a framework of pure acceptance: only your response is yours, everything external is not your business. Seneca was an advisor to emperors, lost and regained enormous wealth, and developed a framework of pragmatic adaptation: accept what you cannot control, but immediately rebuild around the new constraints. For founders facing external crises, these are genuinely different prescriptions.",
    targetKeywords: [
      "how to handle things you can't control",
      "Stoic resilience founder",
      "dealing with business crisis",
      "startup crisis outside your control",
      "how to respond to unexpected adversity",
    ],
    hookQuestion:
      "A major platform your product depends on just changed its API policy. Your revenue drops 60% overnight. You had no warning and no alternative. Epictetus says: only your response is yours. Seneca says: adapt immediately, then rebuild. What do you do when the floor drops out?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Epictetus",
        text: "Begin with the correct diagnosis before you take any action. The platform changed its policy. That is not in your control — it was never in your control, and the belief that it was was always an illusion. What is in your control is precise and narrow: your judgment about what this means, your decision about what to do next, and the quality of attention you bring to that decision. The founder who spends the first 48 hours in grief, anger, or panic about the 60% revenue drop is spending those 48 hours on things that are not in their control. The revenue drop has already happened. It is a fixed fact. Your only productive move is to ask: given this fixed fact, what is the best action available to me right now, with the resources and relationships I actually have? Not the resources I wish I had. Not the platform policy I wish existed. What I actually have. That is Stoic triage: ruthlessly narrow the field to what is actionable. If my logic wins, your first hour is not spent mourning the revenue — it is spent writing down every asset you currently control and every option that remains open to you. Start there.",
      },
      {
        speaker: "Seneca",
        text: "Epictetus is describing the correct internal orientation but giving you incomplete operational guidance. I agree completely that the first move is to accept the fact without resistance — the platform has changed its policy, the 60% is gone, and any energy spent wishing otherwise is energy not available for rebuilding. But the Stoic acceptance that Epictetus describes is the precondition for action, not the action itself. After you have accepted the fact, the immediate obligation is adaptation. I spent years in exile under Claudius — stripped of wealth, separated from Rome, everything I had built made suddenly inaccessible. The Stoic response was not to sit peacefully with the acceptance of my circumstances. It was to use the exile as the forcing function it was: to write, to think more clearly without the distractions of court, to build the intellectual capital that would restore my position when the conditions changed. My construct is adaptive momentum: accept the constraint immediately, then begin building the path out of it with the same immediacy. If my logic wins, your first hour is spent on acceptance — and your second hour is spent identifying the fastest path to rebuilding 30% of that revenue from sources the platform policy does not touch.",
      },
      {
        speaker: "Epictetus",
        text: "Seneca's adaptive momentum frame is practically useful, but I want to push back on the urgency he is injecting into the response. The instruction to immediately start rebuilding 30% of the revenue in the second hour presupposes that you have correctly diagnosed what happened and that speed of response is the primary variable. In my experience — and I am speaking of lived experience under genuinely harsh constraint, not philosophical exile — the founder who moves to rebuild before they have achieved genuine equanimity about what was lost will rebuild from fear rather than from clarity. They will make the first available deal rather than the right deal. They will take on the first alternative distribution channel rather than the correct one. The Stoic discipline is not slowness — it is the refusal to act from a disturbed mind. I did not accept the broken leg as fast as possible and then immediately begin compensating for it. I accepted it until the acceptance was complete. Then the decision-making became clear. Seneca is right that adaptation must follow acceptance. I am saying that the acceptance must be genuine before the adaptation begins, or the adaptation will carry the disturbance forward into the new structure.",
      },
      {
        speaker: "Seneca",
        text: "I understand the distinction Epictetus is drawing, and I think it maps to a practical variable that founders can use as a test: what is the time horizon of the adversity? Epictetus's framework — acceptance until it is complete, then clarity-based action — is optimal when the constraint is permanent or long-duration. His leg was broken and would not heal. Mine was temporary: exile ends, emperors die, political conditions change. If the platform policy change is permanent — this API is gone and will never return — then Epictetus is right: take the time you need to achieve full acceptance, because you will be building from this new reality for years and a rushed decision now will compound into a structural error. But if the adversity is recoverable — if the 60% revenue drop is a 6-month problem rather than a permanent redefinition of your business — then the urgency of response matters because the window for recovery narrows with every week you spend in acceptance rather than in motion. The practical question is: is this a broken leg or an exile? Permanent constraint or temporary disruption? Your answer to that question should determine the tempo of your Stoic response.",
      },
      {
        speaker: "Epictetus",
        text: "Seneca's broken-leg vs. exile distinction is the most useful thing either of us has said, and I want to refine it into a decision rule. The test is not just duration — it is whether the adversity has closed a category of option permanently or merely made it temporarily unavailable. If the platform policy change means that the entire distribution category is closed — no API, no partner, no workaround that recovers what was lost — then you are facing a structural permanent change and the Stoic discipline is to accept it fully before rebuilding, because the building will happen on a fundamentally different foundation. But if the adversity means that one specific path is closed while other paths in the same category remain open — other platforms, other APIs, other distribution channels that serve the same customer need — then the urgency of Seneca's adaptive momentum is correct. The diagnosis determines the prescription. Spend the first hour not on rebuilding, not on acceptance, but on that one question: is this category closed, or is this path closed? They require different responses.",
      },
      {
        speaker: "Seneca",
        text: "We have arrived at a framework I can state precisely. The adversity you face — a platform changing its API and dropping your revenue 60% overnight — requires three moves in sequence, with the sequencing determined by Epictetus's category test. First: accept the fact of the drop with Epictetus's full Stoic acceptance — not rushed, not performative, not immediately channeled into action. The fact is fixed. Let it be fixed without resistance. Second: run Epictetus's category test — is this category closed or is this path closed? If the platform represented the entire category of how your customers find and use your product, you are rebuilding on different terrain and the timeline for adaptation is longer. If the platform was one of several viable paths, the urgency of rebuilding is higher because the window is shorter. Third: once the category is correctly diagnosed, apply adaptive momentum — not from fear, as Epictetus correctly warns, but from the clarity that genuine acceptance produces. The Stoic founder who does this in sequence does not panic in the first 48 hours and does not drift into philosophical passivity. They diagnose, accept, and adapt — in that order, with each stage genuinely complete before the next begins.",
      },
    ],
    conclusion: {
      summary:
        "Epictetus and Seneca agree on the first move — accept the fact of the adversity without resistance, fully and genuinely, before taking any action. They diverge on tempo: Epictetus holds that acceptance must be complete before adaptation begins, or the adaptation carries the disturbance forward into the new structure. Seneca holds that adaptive momentum must begin quickly, especially when the adversity is temporary. They converge on a diagnostic that resolves the tension: is this category closed (permanent constraint, Epictetus's prescription) or is this path closed (temporary disruption, Seneca's prescription)?",
      actionableInsight:
        "Before you do anything else, run the category test: did the platform change close the entire distribution category for your product, or did it close one specific path while others remain? If category closed — you are rebuilding on different terrain, take the time Epictetus prescribes, accept fully before you act. If path closed — the urgency is higher, other paths exist, and Seneca's adaptive momentum applies: accept the drop, then spend the next 48 hours identifying the fastest path to recovering 30% of that revenue from sources this policy does not touch. The diagnosis determines the tempo. Do not let either Stoic give you permission to skip it.",
    },
  },
  {
    slug: "nightingale-vs-curie-on-data-vs-gut-instinct",
    type: "collision",
    frameworkSlug: "florence-nightingale",
    collisionFrameworkSlugs: ["florence-nightingale", "marie-curie"],
    decisionType: "evidence",
    title:
      "Florence Nightingale vs. Marie Curie: Should You Trust the Data or Your Instincts?",
    description:
      "Both Nightingale and Curie were rigorous empiricists who changed their fields through data. But they disagreed on a crucial question: when the data says one thing and the scientist's intuition says the experiment is measuring the wrong thing, which one do you follow? Nightingale's framework demands that you act on the data you have and redesign the experiment after — the data is always more trustworthy than your current theory. Curie's framework says that the deepest breakthroughs come from questioning what the experiment is actually measuring — from noticing that the data is anomalous rather than treating it as a verdict.",
    targetKeywords: [
      "should I trust data or gut instinct",
      "data vs intuition decision",
      "when to override data with intuition",
      "A/B test but gut disagrees",
      "data-driven vs instinct startup",
    ],
    hookQuestion:
      "Your A/B test shows version B wins by 12%. Every dashboard says ship B. But your gut says the test is measuring the wrong thing — that B will hurt retention in month three in ways the 14-day test cannot capture. Nightingale would say: follow the data, always; your intuition is a bias waiting to be proved wrong. Curie would say: the anomaly that makes you uncomfortable is often the most important data point — question what the experiment is actually measuring before you ship. What do you ship?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Florence Nightingale",
        text: "I walked into Scutari with instincts built from years of nursing. Every one of those instincts told me the problem was the wounds. The data told me the problem was the drains. I followed the data. That is not because I lacked conviction — it is because I understood that intuition is compressed experience, and my experience did not include sanitation engineering. Your gut that 'version B will hurt month-three retention' is a hypothesis. The A/B test is evidence. You do not have the right to override evidence with a hypothesis. You have the right to design a better experiment. Ship B, instrument month-three retention precisely, and then you will have data instead of a feeling.",
      },
      {
        speaker: "Marie Curie",
        text: "Nightingale's framework assumes the experiment is measuring what you think it is measuring. I discovered polonium because I refused to accept that my pitchblende measurements were instrument error. The conventional reading of my data would have been to discard the anomaly and report the expected result. I trusted the anomaly instead, because the anomaly was the most informative part of the dataset. Your discomfort with the A/B result is an anomaly — it is your pattern-recognition telling you that something in the setup is off. The question is not whether to trust the data or your gut. The question is whether your gut is identifying a flaw in the experiment design that the data itself cannot surface.",
      },
      {
        speaker: "Florence Nightingale",
        text: "Curie is making a distinction I recognize — but she is applying it incorrectly to your situation. The reason to question an experiment is when the data produces anomalous results that contradict a well-established prior. My sanitation data was anomalous in exactly that sense: mortality from disease exceeded mortality from battle wounds by a ratio that had no prior explanation. That anomaly was the signal. Your situation is different — you have a clean A/B result that contradicts your prediction, not a result that contradicts established knowledge. Those are different kinds of anomaly. Questioning an experiment because it contradicts your prediction is not scientific skepticism. It is confirmation bias with better vocabulary.",
      },
      {
        speaker: "Marie Curie",
        text: "Then let me be more precise. The question I am asking you to answer before you ship is not 'do I believe the test?' It is: 'what is this test actually capable of measuring, and what is it structurally incapable of measuring?' A 14-day A/B test measures 14-day engagement. It does not measure month-three retention by design — not because the result is wrong, but because the experiment was not instrumented to capture it. Nightingale would agree with me on this: she did not simply accept the casualty data as complete. She disaggregated it by cause of death because she understood that the aggregate number was hiding the most important information. Disaggregate your A/B result before you ship.",
      },
      {
        speaker: "Florence Nightingale",
        text: "I accept that framing. And I will make it operational: if you have a specific, testable hypothesis about what the A/B test is failing to measure — 'version B reduces day-90 retention by creating a habit loop that maximizes short-term engagement at the cost of long-term value' — then you have an obligation to instrument that before shipping. If your instinct is that specific, it deserves a test. What I object to is using vague discomfort to justify overriding data. The founder who says 'my gut says this is wrong' without being able to specify the causal mechanism of that wrongness is not practicing intuition. They are practicing avoidance.",
      },
      {
        speaker: "Marie Curie",
        text: "This is precisely where we converge. The discipline is to make the intuition falsifiable before you act on it. If you can state specifically what you predict will happen to month-three retention and design the measurement that would catch it in the next 30 days, then you have a hypothesis worth running. If you cannot state it specifically enough to design the test, the instinct is not yet ready to override the data — and Nightingale is right to ship B while you develop the better experiment. The gut instinct that cannot be made specific is not a signal. It is noise that happens to feel meaningful.",
      },
    ],
  },
  // ── Wave 14 collision articles ─────────────────────────────────────────
  {
    slug: "archimedes-vs-newton-on-when-to-trust-your-model",
    type: "collision",
    frameworkSlug: "archimedes",
    collisionFrameworkSlugs: ["archimedes", "isaac-newton"],
    decisionType: "evidence",
    title:
      "Archimedes vs. Newton: When Should You Trust Your Model Without Testing It?",
    description:
      "Archimedes trusted his geometric models completely and acted before full experimental confirmation — his principle of displacement was deduced from mathematical reasoning and then validated by experience, not the other way around. Newton insisted every theory must be verified against observation: his laws were not published until decades of celestial data confirmed them beyond reasonable doubt. They disagree fundamentally on when a model earns the right to be trusted — and their disagreement is the central tension in every engineering and product decision about when to stop testing and ship.",
    targetKeywords: [
      "when to trust your model without testing",
      "theory vs experiment decision",
      "when to stop testing and ship",
      "how much validation before launching",
      "model confidence threshold startup",
    ],
    hookQuestion:
      "When should you trust your theoretical model vs. run another experiment? Your simulation says the architecture will hold. Three engineers agree the math is sound. But you haven't run it at production scale yet. Archimedes would say: the model is correct — act. Newton would say: the model is a hypothesis until the observation confirms it — test first.",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Archimedes",
        text: "The model is not a guess — it is a derivation. When I described the principle of displacement, I did not need to weigh every possible object in every possible liquid to confirm it. The logic was complete: a body immersed in fluid displaces its own volume, the weight of displaced fluid equals the buoyant force, and from this the crown's composition could be determined without destroying it. The experiment confirmed what the model had already established. If my logic wins here, the question you must answer is not 'have I tested this at production scale?' but 'is the reasoning complete?' A complete derivation is not a hypothesis. It is a proof. If your three engineers have independently verified the chain of reasoning and found no gap, you are not lacking evidence — you are lacking confidence. Those are different problems.",
      },
      {
        speaker: "Isaac Newton",
        text: "I understand the position Archimedes describes, and I reject its application to your situation. My laws of motion were not published in the Principia until I had checked them against the orbital data of every planet whose motion Flamsteed could provide. Not because the mathematics was incomplete — it was complete decades before publication — but because a law of nature is not established by derivation alone. It is established by derivation confirmed against every case the world provides. Archimedes's displacement principle holds in ideal fluids. The real question is whether your production environment is the equivalent of an ideal fluid or whether it introduces variables that your simulation cannot model. If it does — and production environments almost always do — then the model's internal coherence is necessary but not sufficient. My construct is confirmation against independent cases: the model earns trust when it has predicted outcomes that were not used to build it.",
      },
      {
        speaker: "Archimedes",
        text: "Newton is correct that confirmation against independent cases matters — but he is smuggling in an assumption that I want to surface. He is assuming that the cost of a wrong model discovered at production scale is recoverable. My work was often in service of decisions where recovery was impossible: catapult trajectories, the defense of Syracuse, the stability of mechanical systems. In those domains, 'test at scale and correct if wrong' is not a viable strategy. The ship that sinks because the displacement calculation was wrong does not offer a second launch. I am not arguing against testing in domains where correction is cheap. I am arguing that in domains where the first failure is catastrophic, you must achieve certainty through derivation before you commit to action. The question for your architecture is: if the model is wrong and you discover it at production scale, what is the recovery cost?",
      },
      {
        speaker: "Isaac Newton",
        text: "Archimedes has identified the correct variable — recovery cost — but drawn the wrong conclusion from it. The answer to high recovery cost is not to rely more heavily on derivation. It is to design smaller, more targeted experiments that expose the model's failure modes before you commit to the full-scale implementation. I did not test gravity by dropping objects from every possible height simultaneously. I designed the simplest possible experiment that would falsify the inverse-square law if it were wrong: the moon's orbit. One observation, cleanly designed, that could not be explained any other way. If your production architecture has not been run at scale, the correct response is not to trust the model more — it is to identify the single most likely failure mode and design the minimum experiment that would expose it. The experiment need not be large. It must be targeted.",
      },
      {
        speaker: "Archimedes",
        text: "Now I can give you the rule that distinguishes my cases from Newton's. When the model is purely mathematical — when the system's behavior is entirely determined by the formal relationships between its components and there are no unknown variables introduced by the real environment — derivation is sufficient. My displacement principle has no hidden variables: the fluid is what it is, the volume is what it is, the buoyancy follows necessarily. But when the system operates in a real environment that introduces variables your model cannot represent — friction, variance in material properties, emergent behaviors at scale — Newton is right that observation is required. The test for your architecture is this: have you modeled every variable that the production environment introduces, or have you assumed that production is equivalent to your simulation? If you have assumed equivalence, you have not yet completed the derivation. You have stopped early.",
      },
      {
        speaker: "Isaac Newton",
        text: "We have converged on the decision rule, and I want to state it precisely. Trust the model without further testing when two conditions are simultaneously true: first, the model accounts for every variable that the real environment introduces — Archimedes's completeness condition. Second, the model has produced at least one prediction about a case not used to build it, and that prediction held — my confirmation condition. If both are true, additional testing is not adding confidence; it is consuming time. If either is false, additional testing is not optional; it is the only path to the confidence you need. The practical heuristic: identify the one assumption in your model that you are least certain about, and design the minimum test that would expose it if it is wrong. Run that test. If it holds, trust the model. If it fails, revise the model and run the test again. That is the difference between Archimedes's crown and my moon — not derivation versus observation, but completeness of the derivation before you stake the outcome on it.",
      },
    ],
    conclusion: {
      summary:
        "Archimedes and Newton converge on a two-condition test for when a model earns the right to be trusted without further testing. Archimedes's condition: the model must account for every variable the real environment introduces — if you have assumed your production environment is equivalent to your simulation without verifying it, the derivation is incomplete. Newton's condition: the model must have produced at least one prediction about a case not used to build it, and that prediction must have held. Both conditions must be true before you stop testing. If either fails, the model is a hypothesis, not a proof.",
      actionableInsight:
        "Before you ship on the basis of your model alone, run this two-part test. First, list every assumption your model makes about the production environment — are all of them verified, or have you assumed equivalence? Second, identify the one assumption you are least certain about and design the minimum experiment that would expose it if wrong. Run that experiment only. If it holds, trust the model and ship. If it fails, revise and retest. The goal is not more testing — it is targeted testing of the model's most vulnerable assumption. One well-aimed test is worth ten broad ones.",
    },
  },
  {
    slug: "lincoln-vs-carnegie-on-winning-over-critics",
    type: "collision",
    frameworkSlug: "abraham-lincoln",
    collisionFrameworkSlugs: ["abraham-lincoln", "andrew-carnegie"],
    decisionType: "hiring",
    title: "Lincoln vs. Carnegie: How Do You Win Over Your Harshest Critics?",
    description:
      "Lincoln built his cabinet from opponents and converted critics into allies — his 'Team of Rivals' strategy assumed that a critic who understands the stakes can become the most effective champion. Carnegie paid critics to do something useful or simply outgrew them — his strategy assumed that most critic-conversion is a poor investment of attention and that results are the only argument that actually closes the file. They disagree on whether critic-conversion is an investment worth making, and their disagreement maps directly onto the question of how much energy a founder should spend on people who resist the direction.",
    targetKeywords: [
      "should I try to win over my critics",
      "how to neutralize critics at work",
      "dealing with internal opposition startup",
      "convert critics into allies",
      "Lincoln team of rivals strategy",
    ],
    hookQuestion:
      "Should you try to neutralize critics by winning them over, or focus your energy elsewhere? Your VP of Sales has been openly skeptical of the new product direction in every leadership meeting. You can invest the next three months in converting him — or you can build the results that make the skepticism irrelevant. Lincoln would pull him inside the tent. Carnegie would outgrow him.",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Abraham Lincoln",
        text: "I chose William Seward, Salmon Chase, and Edward Bates for my cabinet precisely because they had opposed me most effectively. Seward called me a 'first-rate second-rate man.' Chase thought himself the better candidate until the convention. I chose them not despite their opposition but because of it — a critic who understands the stakes well enough to oppose you effectively is a critic who can defend the position just as effectively once they are converted. The conversion cost is real, but the converted critic has two assets the loyalist lacks: credibility with the opposition and a personal stake in proving their conversion was not a mistake. My construct is this: the question is not whether to win over the critic, but whether the critic's opposition comes from a genuine disagreement about direction or from a lack of sufficient information and trust. Seward and Chase disagreed about me, not about the union. Once they saw what I was doing, the conversion was not difficult — it was inevitable. If my logic wins, your first move is to understand whether your VP of Sales is resisting the direction or resisting you.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Lincoln's framework is correct in its domain and dangerously wrong in yours. He was assembling a cabinet for a permanent national crisis in which every major political figure needed to be either inside the tent or actively neutralized — the stakes were too high and the field too small to leave enemies at large. Your situation is different. You have a product direction and a VP of Sales who is consuming leadership bandwidth with public skepticism. The question is not whether Lincoln's conversion strategy works — it does, at enormous cost — but whether the return on that cost is positive in your context. Carnegie's approach was never to leave critics at large. It was to give critics a productive outlet — put them to work on the problem they are complaining about — or to build results so undeniable that the skepticism became irrelevant without requiring a single conversion conversation. If my logic wins, you stop trying to change his mind and start building the result that changes the math.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Carnegie is describing a real risk — the conversion that costs more than the converted critic is worth. But he is missing the organizational damage that unconverted critics create that results alone cannot repair. Chase actively worked to undermine me within the cabinet for two years. I kept him because his presence prevented a split in the Republican party that would have cost us the 1864 election. The 'build results and let the skeptic become irrelevant' strategy presupposes that the skeptic's public opposition is not itself a corrosive force on the people around him. A VP of Sales who is openly skeptical in leadership meetings is not merely failing to convert — he is providing social permission for others to be skeptical. The unconverted critic is a multiplier of doubt. The correctly-converted critic is a multiplier of confidence. The question is whether you can afford the multiplication of doubt long enough for the results to arrive.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Lincoln has identified the genuine cost of my approach: the critic who multiplies doubt in others before the results arrive. I accept that cost in my framework and I handle it differently. My practice was not to ignore vocal critics — it was to assign them. When I had a manager who was openly skeptical of a new process, I did not attempt to persuade him through argument. I made him responsible for implementing the process and held him accountable to its results. This accomplishes two things simultaneously: it removes the critic from the audience and places him in the position of advocate, and it ensures that if he is right, you find out before the results arrive at scale. If your VP of Sales believes the product direction is wrong, give him ownership of the sales strategy for that product and a 90-day target. He either converts through success or he provides early evidence that the direction needs adjustment. Lincoln's conversion happens through trust built over time. Mine happens through accountability applied immediately.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Carnegie's accountability assignment is a form of conversion that I recognize — it is how I used Chase on the financial crisis. But the assignment only works if the critic is competent in the domain you are assigning him to. Chase was the most capable financier available to me; putting him in charge of war finance was not a management workaround, it was the correct use of a difficult asset. The question for your VP of Sales is: is his public skepticism evidence of genuine market intelligence that your product team hasn't fully processed, or is it evidence of a fundamental misalignment about company direction? If the former, Carnegie's accountability assignment is the right move — give him ownership and let the market data answer the question. If the latter, no assignment resolves it, because the root of the skepticism is not the product but the direction, and that disagreement will surface again regardless of what you hand him.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "We have arrived at the diagnostic that separates my approach from Lincoln's, and I want to state it as a decision rule. The critic is worth the full Lincoln conversion investment — the time, the trust-building, the direct engagement with their objections — when three conditions hold: the critic has genuine influence over others whose support you need; the critic's opposition is based on incomplete information or insufficient trust rather than fundamental value misalignment; and the cost of the conversion effort is less than the cost of the doubt they are multiplying. When all three conditions hold, Lincoln is correct: pull them inside the tent, give them the full information, and convert them through transparency and respect. When any of the three fails — when the critic lacks real influence, or is fundamentally misaligned, or when the conversion cost exceeds the doubt-multiplication cost — give them accountability instead. If that doesn't work within 90 days, the misalignment is fundamental and Lincoln's approach cannot save it either.",
      },
    ],
    conclusion: {
      summary:
        "Lincoln and Carnegie converge on a diagnostic before prescribing a strategy. Lincoln's conversion investment is correct when the critic has genuine influence over others, their opposition stems from incomplete information or insufficient trust rather than fundamental misalignment, and the conversion cost is less than the ongoing cost of their public doubt. Carnegie's accountability assignment is correct when the critic has specific domain expertise and their objections might contain valid market intelligence. Both agree that a critic who is fundamentally misaligned in values — not just in tactics — cannot be converted by either approach and must be addressed through structure rather than persuasion.",
      actionableInsight:
        "Before investing in critic conversion, run the three-condition test: Does your VP of Sales have genuine influence over others whose support you need? Is his opposition based on incomplete information or real value misalignment? Is the conversion effort cheaper than the doubt he is multiplying? If all three hold, use Lincoln's approach: give him complete information, genuine respect, and a seat at the table. If condition two fails — if the opposition is about values, not information — skip both conversion strategies and use Carnegie's: assign ownership with a 90-day target and explicit success criteria. The accountability assignment either converts him through results or surfaces the misalignment cleanly enough to act on.",
    },
  },
  {
    slug: "rockefeller-vs-franklin-on-systems-vs-relationships",
    type: "collision",
    frameworkSlug: "john-d-rockefeller",
    collisionFrameworkSlugs: ["john-d-rockefeller", "benjamin-franklin"],
    decisionType: "scaling",
    title:
      "Rockefeller vs. Franklin: Do You Scale Through Systems or Through Relationships?",
    description:
      "Rockefeller scaled Standard Oil by designing systems that made individuals interchangeable — any refinery manager could be replaced without disrupting the machine, because the machine's logic was encoded in the process, not in the person. Franklin scaled his influence by making relationships irreplaceable — his network of mutual obligations, favors, and intellectual exchanges created a web that no institution could replicate and no competitor could dismantle. They represent opposite scaling philosophies that produce very different organizations: Rockefeller's is durable without any single person; Franklin's is powerful precisely because it is personal.",
    targetKeywords: [
      "should I scale through systems or relationships",
      "systems vs relationships startup scaling",
      "how to scale a business",
      "Rockefeller standard oil scaling strategy",
      "when to systematize vs personalize",
    ],
    hookQuestion:
      "Should you invest in building systems and processes, or in cultivating key relationships? You are at 30 people and the informal network that got you here is starting to fray. Rockefeller would build the org chart, the SOPs, and the performance metrics that make every role legible and replaceable. Franklin would double down on the relationships — lunch with the five people whose judgment shapes the field, write the newsletter that makes you the connective tissue of the community.",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "John D. Rockefeller",
        text: "At 30 people, the informal network is not fraying — it is revealing its structural limit. Every organization built on personal relationships has the same ceiling: the attention capacity of the person at the center. When I consolidated the Cleveland refineries in 1872, I was not trying to build a better personal network. I was trying to build a structure that could operate without requiring my personal presence in every decision. The Standard Oil model was explicit about this: every refinery ran on the same cost accounting system, the same purchasing process, the same quality standards. A manager who left took their salary with them, not the knowledge of how the plant operated. If my logic wins here, you spend the next quarter on three things: document every process that currently lives in someone's head, create the metrics that allow you to evaluate performance without knowing the person personally, and build the org structure that makes each role's decision authority legible regardless of who holds it. The informal network was appropriate when you were 10. At 30, it is a liability.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "Rockefeller is describing the correct solution for a different problem. His Standard Oil model works when the competitive advantage is operational efficiency — when the question is who can refine a barrel of oil at the lowest unit cost. In that domain, the system beats the relationship every time because the system scales to any volume and the relationship does not. But your competitive advantage at 30 people is almost certainly not operational efficiency. It is judgment, access, and the ability to move faster than larger competitors because the right people return your calls. The moment you optimize for Rockefeller's organizational legibility, you begin competing on efficiency — and you will lose that competition to whoever has more capital to invest in the same systems. My construct is relational leverage: the question is not how to make your organization run without you, but how to make your organization's access to the right people irreplaceable by any competitor who tries to out-systematize you.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Franklin is identifying a real risk — the premature systematization that kills the culture that made the company worth systematizing. I acknowledge it. But he is understating the cost of the alternative. When I was building Standard Oil, I had competitors who were better connected in the oil regions than I was — they had the relationships with the drillers, the local politicians, the railroad men. They lost anyway, because their relational advantage could not survive the moment when their key contact retired, moved, or changed allegiance. Relationships are not durable at organizational scale. They are durable at the scale of a single person's lifetime and attention. The moment your company's success depends on the lunch calendar of one founder, you have built a business that cannot be sold, cannot be led by anyone else, and cannot survive the departure of the person at the center. Franklin's model works for Franklin. It is not a model. It is a man.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "Rockefeller misreads what I am describing. I did not scale by having more lunches. I scaled by building institutions — the Philadelphia post office, the lending library, the American Philosophical Society — that were explicitly designed to formalize and extend the value of the relationships that created them. Each institution encoded a relational principle into a structure that outlasted me: the post office systemized the information-sharing that my personal correspondence had begun. The library systemized the knowledge-exchange that happened in our club meetings. I am not arguing against systematization. I am arguing for a specific sequence: build the relationships that reveal what is worth systematizing, then systematize the principle, not the relationship. Rockefeller built systems around operational efficiency because that was the value his relationships revealed. What value have your relationships revealed that your systems do not yet capture?",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Franklin's sequencing argument is the most useful thing either of us has said, and I want to apply it directly to your situation. The question is not 'systems or relationships' — it is 'which relationships have revealed a source of value that is currently only accessible through the person who holds the relationship, and how do I systematize access to that value?' At Standard Oil, the value my relationships revealed was preferential railroad shipping rates. My response was to systematize that value through exclusive contracts that transferred the benefit from the relationship to the institution. The relationship became unnecessary once the contract existed. For your company at 30 people, the equivalent question is: what do your five most important relationships give you access to that your competitors cannot access? And can that access be systematized — through a product, a partnership structure, a community — in a way that doesn't require you personally to maintain the relationship?",
      },
      {
        speaker: "Benjamin Franklin",
        text: "We have arrived at the decision rule, and I will state it as the two questions you must answer before you invest the next quarter's attention. First: identify the two or three relationships that are generating disproportionate value for your company right now — not the relationships you enjoy most, but the ones that are producing outcomes your competitors cannot replicate. Second: for each of those relationships, ask whether the value flows from the relationship itself — from the trust, the history, the specific knowledge of you — or from what the relationship provides access to. If the value flows from the relationship itself, Rockefeller is right: find the way to encode the access into an institutional structure before the relationship's counterparty changes or the relationship deteriorates. If the value flows from what the relationship provides access to, Franklin is right: deepen the relationship, because the access is what you are actually buying, and the relationship is the cheapest way to maintain it. The when-to-systematize rule is simple: systematize when the institution can provide the access more reliably than the relationship. Keep the relationship when the institution cannot.",
      },
    ],
    conclusion: {
      summary:
        "Rockefeller and Franklin converge on a sequencing answer rather than a binary choice. Franklin's principle: use relationships to discover what is worth systematizing — the value that relationships reveal should drive the design of the systems. Rockefeller's principle: once the value is revealed, systematize the access to it before the relationship deteriorates or the person at its center departs. The decision rule is: systematize when the institution can provide the access more reliably than the relationship; keep investing in the relationship when the institution cannot replicate what the relationship provides.",
      actionableInsight:
        "Before you decide whether to build org charts or book lunches, map your three most value-generating relationships and ask two questions about each: First, does the value flow from the relationship itself (trust, history, personal knowledge), or from what the relationship provides access to (information, distribution, credibility)? Second, could an institution — a contract, a community, a product feature — provide that access more reliably than the relationship? If yes to the second question, systematize now: build the structure that captures the value before the relationship changes. If no, invest in the relationship: it is the cheapest and most defensible form of access you have. At 30 people, you likely have two or three relationships worth systematizing and two or three worth deepening. The mistake is applying one strategy to all five.",
    },
  },
  // ── Wave 16 collision articles ─────────────────────────────────────────
  {
    slug: "edison-vs-tesla-on-practical-bets-vs-visionary-bets",
    type: "collision",
    frameworkSlug: "thomas-edison",
    collisionFrameworkSlugs: ["thomas-edison", "nikola-tesla"],
    decisionType: "innovation",
    title: "Edison vs. Tesla: Should You Make Practical Bets or Visionary Bets?",
    description:
      "Edison built what the market would pay for today. Tesla designed what physics made possible tomorrow. They worked twenty feet apart for a year and disagreed on everything that mattered. Their collision is the foundational tension in every innovation decision: do you bet on what works now, or on what could transform the field?",
    targetKeywords: [
      "practical vs visionary innovation",
      "Edison Tesla innovation strategy",
      "should I build for today or tomorrow",
      "incremental vs transformational innovation",
      "when to make big bets startup",
    ],
    hookQuestion:
      "Are you betting on what works today or what could transform tomorrow?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Thomas Edison",
        text: "The market does not reward visions — it rewards products. I did not invent the light bulb by theorizing about illumination. I ran over ten thousand experiments until I found the filament that worked, at a price that a household could afford, on a system that I could sell. The visionary who cannot ship is not an innovator. He is a dreamer with good handwriting. My construct is this: a practical bet that ships and generates revenue funds the next bet. A visionary bet that never ships funds nothing.",
      },
      {
        speaker: "Nikola Tesla",
        text: "Edison describes the method of someone who does not understand the system he is building. I worked in his laboratory. He had no theory — only persistence and capital. He found the incandescent filament through brute elimination, and he built a direct current distribution network that was structurally obsolete before it was complete. I saw the rotating magnetic field in my mind before I built it. When I built the alternating current motor, it performed exactly as calculated. The practical bet that ignores the underlying physics is not pragmatism — it is expensive ignorance.",
      },
      {
        speaker: "Thomas Edison",
        text: "Tesla's alternating current is a useful technology. It is also a technology that required Westinghouse's capital, Morgan's distribution network, and my prior work establishing that electrical distribution was commercially viable at all. The visionary who arrives after the pragmatist has built the market and claims his vision was superior has confused sequence with causation. Every transformational technology rides on a foundation of practical bets made by people who could not see as far as the visionary but who built the terrain the visionary needed to stand on.",
      },
      {
        speaker: "Nikola Tesla",
        text: "Edison is making the pragmatist's error: he is confusing market timing with intellectual priority. The alternating current principle did not depend on Edison's DC network — it preceded it and would have been the correct architecture from the beginning if the decision had been made on physical grounds rather than on Edison's commercial interest in the infrastructure he had already built. The practical bet that entrenches a suboptimal architecture is not pragmatism — it is a switching cost that the entire industry pays for decades. I am asking whether your innovation bet is genuinely the right architecture, or whether it is the architecture that is easiest to defend given what you have already built.",
      },
      {
        speaker: "Thomas Edison",
        text: "Here is the question I would put to any founder: what is your runway? The visionary bet requires time — time for the market to develop, time for the supporting infrastructure to arrive, time for the world to understand what you have built. Tesla's vision of wireless power transmission was not wrong. It was correct and it was fifty years early. He died broke. The practical bet is not inferior to the visionary bet — it is the bet that allows you to still be operating when the visionary moment arrives. If my logic wins here, you ask not whether the transformational bet is correct, but whether you will survive long enough to collect on it.",
      },
      {
        speaker: "Nikola Tesla",
        text: "And here is where Edison and I converge more than it appears. The correct question is not practical or visionary — it is what kind of unknown you are trying to resolve. If the unknown is whether the market wants the thing at all, Edison is right: build the practical version, generate revenue, and let the market tell you what to build next. If the unknown is whether the architecture is correct — whether the foundational design is sound — then Edison's method of empirical elimination is actively dangerous, because it can find a working answer that is structurally obsolete before it ships. Diagnose the unknown first. Then choose your method.",
      },
    ],
  },
  {
    slug: "alexander-vs-napoleon-on-when-to-overextend",
    type: "collision",
    frameworkSlug: "alexander-the-great",
    collisionFrameworkSlugs: ["alexander-the-great", "napoleon-bonaparte"],
    decisionType: "strategy",
    title: "Alexander vs. Napoleon: When Does Ambition Become Overextension?",
    description:
      "Alexander marched from Macedonia to India in thirteen years and never stopped voluntarily. Napoleon built the largest European empire in a century and then lost it all in Russia. One died undefeated in the field; the other was exiled twice. The question is not whether bold ambition is correct — both men prove it can work. The question is how to distinguish the ambition that compounds from the ambition that overreaches.",
    targetKeywords: [
      "when does ambition become overextension",
      "Alexander Napoleon strategy comparison",
      "how far to push your startup",
      "overextension startup warning signs",
      "bold strategy vs reckless strategy",
    ],
    hookQuestion:
      "At what point does bold ambition become the cause of your undoing?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Alexander the Great",
        text: "You ask when ambition becomes overextension. I will tell you what I learned in thirteen years of campaigning: it does not become overextension when the territory is far. It becomes overextension when the core is no longer generating the resources and loyalty the advance requires. I reached the Indus because every territory I passed through was converted into a supply base, a recruiting ground, and a political ally before I moved forward. The limit of expansion is not distance. It is the rate at which your existing holdings compound versus the rate at which the advance consumes them.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Alexander describes the condition of sustainable expansion correctly and obscures the failure mode that ended him. He reached the Hyphasis River and his army refused to advance. Not because the logistics had failed — because the psychological contract between a commander and his men has a limit that no logistical system can extend indefinitely. I made the same error in Russia, for different reasons: I assumed the campaign would resolve itself in the same timeframe as every previous campaign, and I did not model what happens when it does not. The overextension that destroys ambition is not the geographic kind — it is the kind where you have advanced beyond the willingness of the people executing the plan to sustain it.",
      },
      {
        speaker: "Alexander the Great",
        text: "Napoleon is correct that the Hyphasis mutiny was the true limit of the campaign, and I want to name what it reveals. The mutiny did not happen because my army was exhausted — they had marched for thirteen years. It happened because I had not told them where the end was. The visionary who can see the full map but withholds it from the people executing the plan creates the conditions for desertion at the worst possible moment. If I had said at the Oxus that the campaign ends at the Hyphasis, the same men would have reached it without incident. The lesson is not that ambition must be smaller. It is that ambition must be communicated precisely enough that the people carrying it can make an informed commitment.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Alexander is describing a communication failure. I am describing a modeling failure. In Russia, I did not simply fail to communicate the campaign's endpoint — I failed to model what the campaign would cost if the enemy refused to fight a decisive engagement. The Russian strategy of withdrawing and burning their own territory was not in my model. When the actual campaign diverged from the model, I did not update the model fast enough — I kept advancing as if the next battle would produce the decision the last ten had not. The overextension that I committed was not ambition. It was the refusal to revise the model when the data said the model was wrong. That is the failure mode your question is actually about.",
      },
      {
        speaker: "Alexander the Great",
        text: "Then let me name the precise diagnostic that separates my expansions from Napoleon's Russia. Before every advance, I asked two questions: does the territory I am entering have something that makes holding it easier than holding it from the outside — a port, a chokepoint, a population that will defect to the winner? And does my current base generate enough surplus to sustain the advance without degrading itself? When both answers were yes, I advanced. When either was no, I consolidated first. Napoleon's Russia failed both tests and he advanced anyway. The ambition that compounds is the ambition that applies both tests before every move.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Alexander's two tests are correct and I accept them. I will add a third that I learned from Russia: before every significant advance, model the scenario where the advance does not resolve within the expected timeframe. What does the campaign look like at twice the expected duration? At three times? If the answer at twice the expected duration is catastrophic — if the supply lines cannot hold, if the political coalition fractures, if the home base weakens while you are extended — then the advance is not bold. It is reckless. The difference between bold ambition and overextension is not the size of the bet. It is whether the downside scenario has been modeled honestly and whether you have a path back that does not require the opponent to cooperate.",
      },
    ],
  },
  {
    slug: "ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data",
    type: "collision",
    frameworkSlug: "ada-lovelace",
    collisionFrameworkSlugs: ["ada-lovelace", "florence-nightingale"],
    decisionType: "evidence",
    title:
      "Ada Lovelace vs. Florence Nightingale: Should You Build the System or Work the Data?",
    description:
      "Lovelace designed a general-purpose computing architecture before a single component existed. Nightingale walked into a hospital killing soldiers at a 42% rate and fixed it with existing data collected on-site. One built the framework first and let applications follow; the other gathered field evidence first and let the system emerge. They represent opposite philosophies about whether architecture or observation is the more reliable path to a correct answer.",
    targetKeywords: [
      "systems thinking vs data gathering",
      "build framework first or gather data first",
      "Ada Lovelace Florence Nightingale",
      "architecture first vs evidence first",
      "when to design system vs collect field data",
    ],
    hookQuestion:
      "Do you design the framework first or gather the evidence first?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Ada Lovelace",
        text: "I wrote the first algorithm for a machine that did not yet exist. This was not speculation — it was the correct epistemic move, because the architecture of Babbage's Analytical Engine was sufficiently well-specified that I could derive what it made possible before any physical instance existed. The framework precedes the data collection when the framework is what determines which data is meaningful to collect. If you begin gathering field data before you have a model of what you are measuring, you will collect everything and understand nothing. The system tells you what evidence to look for. Evidence without a system is noise with good documentation.",
      },
      {
        speaker: "Florence Nightingale",
        text: "Lovelace describes the correct move for a domain with a well-specified formal architecture. Medicine in the Crimea was not that domain. When I arrived at Scutari, I did not have a complete model of why soldiers were dying at 42%. I had a mortality rate that was clearly wrong and a set of instruments to measure causes of death. I gathered the data first — cause by cause, ward by ward — and the system emerged from what the data revealed. If I had constructed a theoretical framework before looking, I would have designed around what medical doctrine said should be killing soldiers, not around what was actually killing them. The framework that precedes observation in a poorly-understood domain will encode the prior generation's errors.",
      },
      {
        speaker: "Ada Lovelace",
        text: "Nightingale is describing a real failure mode — the premature theory that organizes observation around its own assumptions. But she is underestimating the cost of her alternative. An observation program without a guiding model is not neutral. It is shaped by what the observer finds salient, what instruments she brought, and what categories she uses to record what she sees. Nightingale arrived with the concept of cause-of-death categories that structured her entire data collection. Those categories were her framework. The choice is not between framework and no framework — it is between an explicit framework that can be examined and revised, and an implicit framework that shapes the observation without being visible.",
      },
      {
        speaker: "Florence Nightingale",
        text: "I accept that my cause-of-death categories were a framework — and I want to be precise about what kind of framework they were. They were a minimal framework: broad enough to capture variation in the field, not so detailed that they predicted the answer before I found it. Lovelace's framework for the Analytical Engine was maximal: she specified the operations before the machine existed. The maximal framework is correct when the domain has stable formal properties — when the architecture of the system is knowable in advance of observation. The minimal framework is correct when the domain has emergent properties that reveal themselves only in the field. The question for any decision is: how stable are the properties of what you are studying? If they are stable, Lovelace is right to build the full system first. If they are emergent — if the field will surprise you in ways your theory cannot anticipate — Nightingale is right to gather first and systematize after.",
      },
      {
        speaker: "Ada Lovelace",
        text: "Nightingale's stable-versus-emergent distinction is the most useful framing either of us has offered. I want to refine it with a second dimension: the cost of being wrong. In the Analytical Engine, the cost of a wrong architectural assumption was a machine that did not compute. High cost, but recoverable — you redesign the machine. In Scutari, the cost of a wrong theoretical assumption was soldiers dying under a treatment regime built on a false model. Also high cost, but less recoverable — the soldiers were already dead. When the cost of a wrong framework is high and the recovery is slow, Nightingale's approach of gathering evidence before committing to an architecture is the more conservative and correct choice. When the cost of gathering without a framework is high — because undirected observation takes years and the window for action is short — the Lovelace approach of building the architecture first is the correct choice.",
      },
      {
        speaker: "Florence Nightingale",
        text: "We have arrived at the decision rule. Build the system first when the domain has stable formal properties that can be known in advance, the cost of undirected observation exceeds the cost of a wrong framework, and the framework can be explicitly stated and revised as new data arrives. Gather the data first when the domain has emergent properties that resist formal specification, the cost of a wrong prior model exceeds the cost of extended observation, and the field is accessible enough that direct measurement is faster than formal derivation. Lovelace's error would be to specify a computing architecture for a domain she had never observed. Nightingale's error would be to gather mortality data without any model of what categories to use. The method is not determined by temperament — it is determined by the structure of the problem.",
      },
    ],
  },
  // ── Wave 15 collision articles ─────────────────────────────────────────
  {
    slug: "da-vinci-vs-newton-on-breadth-vs-depth",
    type: "collision",
    frameworkSlug: "leonardo-da-vinci",
    collisionFrameworkSlugs: ["leonardo-da-vinci", "isaac-newton"],
    decisionType: "product",
    title: "Da Vinci vs. Newton: Should You Explore Broadly or Master Deeply?",
    description:
      "Da Vinci pursued breadth relentlessly — art, anatomy, engineering, music — and made his greatest contributions at the intersections. Newton worked on a single unified system of natural philosophy for decades before publishing. They represent opposite philosophies of how intellectual capital compounds.",
    targetKeywords: [
      "should I specialize or be a generalist",
      "breadth vs depth career decision",
      "generalist vs specialist startup",
      "da vinci newton intellectual strategy",
      "how to build expertise breadth or depth",
    ],
    hookQuestion:
      "Should I specialize deeply in one area or keep exploring many?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Leonardo da Vinci",
        text: "The boundary between disciplines is where the interesting questions live. I did not study anatomy to become a physician — I studied it because the painter who does not understand the structure beneath the skin will never render the surface correctly. Every field I entered gave me instruments the specialists could not bring to bear. The problem that defeats the expert is often solved by the person who arrives from an adjacent domain with a different set of tools. Breadth is not distraction — it is the accumulation of instruments the deep specialist cannot access.",
      },
      {
        speaker: "Isaac Newton",
        text: "I spent twenty years on the Principia before I was willing to publish it. Not because I lacked other interests — I had many — but because I understood that a system of natural philosophy that was not internally coherent was worse than useless. It would mislead rather than illuminate. Breadth produces analogies. Depth produces proofs. The founder who knows a little about many things produces clever observations. The one who knows everything about a bounded problem produces the insight that cannot be argued away.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Newton is describing a bounded problem — celestial mechanics has clean laws because the domain is clean. But most problems founders face are not bounded. They are open-ended: what do customers actually want? How should the organization evolve? What does the market look like in five years? For open-ended problems, the specialist's tools are derived from the past of their domain, and the past of the domain does not contain the answer. The cross-domain thinker can assemble a new set of tools from the periphery of several fields. That is not shallowness — it is exactly the right epistemology for the class of problem you are actually facing.",
      },
      {
        speaker: "Isaac Newton",
        text: "Da Vinci describes the failure mode of depth correctly — the specialist who cannot see outside their own assumptions — but does not adequately describe the failure mode of breadth. The person who studies many things without going deep into any of them accumulates the surface vocabulary of each domain without the structural understanding that makes any of them useful. I could have spent my twenties reading across philosophy, theology, law, and medicine. I chose instead to understand motion at the level where a mathematical proof was possible. That choice let me write the Principia. The analogies I might have accumulated from breadth would not have produced it.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "Then the question is not breadth versus depth — it is what kind of problem you are solving. Newton and I agree on more than it appears. I went deep into anatomy, into hydraulics, into optics — deep enough to draw conclusions that specialists in each domain had missed. The difference is that I did not go deep into only one. I maintained the cross-domain aperture throughout. For a bounded problem with a known solution space — celestial mechanics, structural engineering, cryptography — Newton's method produces results that breadth cannot. For an open-ended problem with an undefined solution space — which is most of what founders actually face — the cross-domain accumulation is the more powerful instrument.",
      },
      {
        speaker: "Isaac Newton",
        text: "I will accept that formulation and make it precise: the choice between breadth and depth is downstream of the choice between two kinds of problem. If the problem is bounded — there is a correct answer, the solution space is known, and the question is whether you can find it — then depth produces the result and breadth produces only noise. If the problem is open-ended — the solution space is undefined, the constraints are unclear, and the question is what to build rather than how to build it — then da Vinci's cross-domain aperture is the correct instrument. Founders who cannot diagnose which kind of problem they are facing will make the wrong choice between the two strategies. That diagnosis is the actual decision.",
      },
    ],
    conclusion: {
      frameworkSlug: "leonardo-da-vinci",
      summary:
        "Da Vinci and Newton converge on a diagnostic: the answer depends on whether the problem is bounded or open-ended. Bounded problems — those with a known solution space and a correct answer — reward Newton's depth. Open-ended problems — those where the solution space is undefined and the question is what to build — reward da Vinci's breadth and cross-domain accumulation.",
      actionableInsight:
        "Before choosing between specialization and exploration, diagnose the problem type. Ask: does this problem have a correct answer that I can derive if I understand the domain deeply enough? If yes, go deep — accumulate the structural understanding that produces proofs, not just analogies. If no — if the question is open-ended and the solution space is undefined — maintain the cross-domain aperture. Study adjacent fields not as a dilettante but as a person building instruments: go deep enough in each to extract the tool, then carry the tool into the problem you are actually trying to solve.",
    },
  },
  {
    slug: "cicero-vs-lincoln-on-when-to-speak-vs-stay-silent",
    type: "collision",
    frameworkSlug: "cicero",
    collisionFrameworkSlugs: ["cicero", "abraham-lincoln"],
    decisionType: "persuasion",
    title: "Cicero vs. Lincoln: When Should You Speak Publicly vs. Stay Silent?",
    description:
      "Cicero believed silence was a form of complicity — if you had the argument, you had the obligation to make it. Lincoln chose silence strategically, holding his position until the moment had maximum leverage. They disagree on whether timing or argument quality is the primary variable in persuasion.",
    targetKeywords: [
      "when to speak publicly vs stay quiet",
      "should I make my case now or wait",
      "public commitment timing strategy",
      "cicero lincoln persuasion",
      "when to go public with an opinion",
    ],
    hookQuestion:
      "When is it worth making your case publicly vs. staying quiet and acting?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Cicero",
        text: "The orator who withholds his argument while injustice proceeds is not exercising wisdom — he is practicing complicity at a safe distance. I argued the Catiline conspiracy before the Senate because silence in the face of an organized threat to the republic was not strategic patience — it was abdication. The argument I had was not a private possession to be deployed at my convenience. It was a public obligation. If you have seen clearly what is wrong and you have the argument that demonstrates it, your silence is not strategic. It is a failure of civic duty dressed as tactical prudence.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "I held my position on slavery for years without making it a public commitment, not because I lacked conviction but because I understood that a position stated before the political architecture could support it would be destroyed rather than advanced. The 1858 debates with Douglas made my argument public — but by that time I had spent a decade building the coalition that could act on it. The argument that is made too early is not just ineffective. It is often permanently disqualifying: the audience that rejects it will not easily receive it a second time. Timing is not a coward's virtue. It is the strategist's discipline.",
      },
      {
        speaker: "Cicero",
        text: "Lincoln describes the failure mode of premature commitment correctly — and then uses it to argue for a general principle of strategic silence that his own career disproves. He spoke in the debates. He wrote the House Divided speech. He committed publicly before the coalition was fully assembled. The reason those commitments worked is not that the moment was perfect — it is that the argument was compelling enough to build the coalition through the act of making it. An argument that requires perfect conditions before it is made is an argument that is waiting for conditions that never arrive. The moment you have a compelling case, making it publicly is often the fastest path to assembling the coalition, not the slowest.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Cicero is describing a real phenomenon — that public commitment can mobilize a coalition through the act of commitment itself — and conflating it with the general principle that argument quality is the primary variable. But the Catiline orations worked because Cicero had the Senate chamber, the consulship, and the specific moment when the evidence was irrefutable and the audience was assembled. Remove any one of those conditions and the Catiline orations are not remembered as triumph — they are remembered as the speech that gave Catiline time to react. My framework is not silence for its own sake. It is the question of whether the conditions for the argument's reception are present. A perfect argument in the wrong venue, at the wrong moment, with the wrong institutional backing, does not advance the position. It broadcasts its isolation.",
      },
      {
        speaker: "Cicero",
        text: "Then the practical disagreement is this: Lincoln believes the conditions for reception must be assembled before the argument is made. I believe the argument, correctly made, is often what assembles the conditions. Both are true in different cases. The test is not whether the conditions are perfect — they never are — but whether making the argument publicly will attract more support than it loses. If the people who need to act are waiting for public permission to act, the argument gives them that permission. If the people who need to act are already moving and the public argument would expose them prematurely, silence is the correct strategy. The question is whether your audience is waiting for permission or already in motion.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "I accept that framing and will make it operational. Before you decide whether to speak publicly, answer two questions. First: is your audience's primary constraint the argument itself — do they lack the case, the clarity, the public formulation — or is it the institutional conditions — the votes, the backing, the moment when action is possible without fatal backlash? If the constraint is the argument, Cicero is right: make it, because the making of it is what resolves the constraint. If the constraint is institutional — if the people who agree with you already agree but cannot act until the conditions shift — then public argument before those conditions shift does not accelerate them. It exposes your position before your coalition is robust enough to protect it. The bottleneck diagnosis is the decision.",
      },
    ],
    conclusion: {
      frameworkSlug: "cicero",
      summary:
        "Cicero and Lincoln converge on a diagnostic: the answer depends on whether the bottleneck is the argument itself or the institutional conditions for acting on it. If your audience lacks the argument — the case, the clarity, the public formulation that gives them permission to act — Cicero is right: speak now, because the public argument is what assembles the coalition. If your audience already has the argument but lacks the institutional conditions — the votes, the backing, the moment when action is possible — Lincoln is right: speaking before those conditions exist exposes your position before your coalition can protect it.",
      actionableInsight:
        "Before deciding whether to make your case publicly, run the bottleneck diagnosis: Is the primary obstacle that people don't yet have the argument, or that people who already agree cannot act yet? If the argument is the bottleneck — people are waiting for public clarity before they commit — speak now. The public statement is itself the coalition-building move. If the institutional conditions are the bottleneck — the people who agree cannot act until the conditions shift — hold the position and invest in building the conditions rather than broadcasting the argument into a vacuum. The premature public commitment that fails does not try again easily. Make sure the bottleneck is the argument before you make it public.",
    },
  },
  {
    slug: "catherine-vs-cleopatra-on-consolidating-power-in-a-new-role",
    type: "collision",
    frameworkSlug: "catherine-the-great",
    collisionFrameworkSlugs: ["catherine-the-great", "cleopatra-vii"],
    decisionType: "strategy",
    title:
      "Catherine vs. Cleopatra: How Do You Consolidate Power When You're New to the Role?",
    description:
      "Catherine seized the Russian throne through a coup, then spent years building legitimacy through governance. Cleopatra inherited a position of formal power but used alliance and spectacle to make it real. They represent different theories of what creates durable authority in the first year.",
    targetKeywords: [
      "how to establish authority in a new leadership role",
      "consolidating power new job",
      "new leader authority building",
      "how to gain respect as a new leader",
      "first 90 days leadership strategy",
    ],
    hookQuestion:
      "How should I establish authority when I'm new to a leadership role?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Catherine the Great",
        text: "I did not inherit the throne — I seized it, and in seizing it I inherited its full set of adversaries. The nobles who backed the coup did so because they expected to govern through me. The military that supported me did so because I promised stability. Every one of those parties needed to see, quickly, that my governance was more valuable to them than any alternative. My method was immediate, visible competence: I reformed the legal code, reorganized the provincial administration, and made myself indispensable to the institutions that had previously operated without me. Performed authority — spectacle, alliance, the display of power — lasts only as long as the performance. Earned authority compounds. In the first year, you cannot afford to lead with spectacle. You must lead with governance.",
      },
      {
        speaker: "Cleopatra VII",
        text: "Catherine describes the conditions of a coup — she had to prove she was worth the risk her supporters had taken. My situation was structurally different: I had formal authority but not real authority. Egypt was surrounded by Rome; my own court was fractured; my brothers had already tried to depose me once. In those conditions, governance alone does not build the authority you need, because governance requires that people already believe in your legitimacy enough to follow your directives. I needed Caesar before I could implement policy, because without Caesar the policy directives would not be executed. Alliance and spectacle are not substitutes for governance — they are the preconditions that make governance possible when your formal authority is contested.",
      },
      {
        speaker: "Catherine the Great",
        text: "Cleopatra is describing a specific kind of constraint — formal authority without real enforcement capacity — and using it to argue for a general principle about the primacy of alliance. But the alliance she formed with Caesar created a dependency that outlasted its usefulness. When Caesar died, she repeated the strategy with Antony. When Antony lost to Octavian, there was no third move available. My governance-first approach created something the alliance approach cannot: an internal power base that did not depend on any single external patron. The question for anyone entering a new leadership role is: are you building authority that can survive the departure of your most powerful supporter?",
      },
      {
        speaker: "Cleopatra VII",
        text: "Catherine is correct that my alliances created a dependency — and I would not argue otherwise. But she is measuring my reign by its ending rather than by its duration. I kept Egypt sovereign for twenty years against the most powerful empire in the world. Catherine's governance-first approach works when the primary threat is internal: factions within the court, nobles who backed a coup, military units that need to be integrated. My approach was correct for the primary threat I faced, which was external: Rome. The consolidation strategy must match the threat topology. If the primary threat to your new authority comes from inside the organization — skeptics, legacy power-holders, people who expected to govern through you — Catherine's earned authority model is correct. If the primary threat is external — a dominant competitor, a hostile board, a legacy partner relationship that can make you irrelevant — the alliance-first model that I used is more appropriate.",
      },
      {
        speaker: "Catherine the Great",
        text: "I accept that the threat topology shapes the correct strategy, and I want to push on one more variable: the time horizon. Cleopatra's approach is faster in the short term — alliance and spectacle establish the appearance of authority quickly, which is valuable when you have immediate threats. My approach is slower in the short term but more durable in the long term. If you have 90 days before someone tries to replace you, the visible alliance is probably the right first move. If you have 18 months before your authority is tested at full scale, the governance approach is more valuable because it builds the internal legitimacy that external alliance cannot create. The founder who joins a new organization as CEO and immediately focuses on external partnerships before understanding the internal dynamics is making Cleopatra's bet in Catherine's environment.",
      },
      {
        speaker: "Cleopatra VII",
        text: "We have arrived at the two-phase model that I think we both actually practiced, even if the sequence differs. In the first phase — before you have established enough internal legitimacy to govern effectively — you need the external alliance or the visible win that gives internal stakeholders a reason to follow you. Catherine had the coup itself as the visible win: the fact that it succeeded told every noble that the new power was real. I used Caesar's arrival in Alexandria. The visible external anchor is what makes the internal governance possible. In the second phase — once the initial legitimacy is established — the governance work must begin, because the external anchor will not hold indefinitely and the internal capacity must be built before it is needed. The mistake is staying in phase one too long: using alliance and spectacle to defer the harder work of building genuine internal authority. Catherine is right that governance is what creates durable power. I am right that something must precede the governance — a demonstration visible enough that people believe the governance will stick.",
      },
    ],
    conclusion: {
      frameworkSlug: "catherine-the-great",
      summary:
        "Catherine and Cleopatra converge on a two-phase consolidation model. Phase one requires a visible anchor — a coup, a powerful alliance, a conspicuous early win — that gives internal stakeholders a reason to follow directives before earned legitimacy exists. Phase two is governance: building the internal competence and systems that make the authority durable and independent of any single external patron. The failure mode of Catherine's approach is skipping phase one and governing without the initial demonstration of real power. The failure mode of Cleopatra's approach is staying in phase one too long and allowing external dependency to substitute for internal legitimacy.",
      actionableInsight:
        "In the first 90 days of a new leadership role, run a threat topology analysis: Is the primary resistance internal (legacy power-holders, skeptical reports, people who expected to govern through you) or external (a dominant competitor, a hostile board member, a legacy relationship that can make you irrelevant)? If internal, prioritize Catherine's earned authority model: early visible competence in governance, quick wins on the problems the existing team has been unable to solve, and the systematic building of an internal power base that does not depend on any single patron. If external, prioritize Cleopatra's alliance model: identify the external anchor that legitimizes your internal authority, and use that anchor to create the conditions under which governance is possible. Then, regardless of which phase-one strategy you use, begin phase two — the governance work — before the phase-one anchor deteriorates.",
    },
  },
  // ── Wave 17 ──────────────────────────────────────────────────────────────
  {
    slug: "harriet-tubman-vs-lincoln-on-when-to-act-without-consensus",
    type: "collision",
    frameworkSlug: "harriet-tubman",
    collisionFrameworkSlugs: ["harriet-tubman", "abraham-lincoln"],
    decisionType: "leadership",
    title:
      "Harriet Tubman vs. Lincoln: When Should You Act Without Waiting for Consensus?",
    description:
      "Harriet Tubman made nineteen trips into slave territory and freed over three hundred people without waiting for legal sanction, political cover, or majority agreement — operating on the principle that the window for action is always narrower than the time required to build consensus. Lincoln freed the enslaved through the Emancipation Proclamation only after two years of war, careful political preparation, and enough coalition-building that the executive order could be enforced. Both achieved transformational results; they reached opposite conclusions about whether waiting for buy-in is discipline or delay.",
    targetKeywords: [
      "when to act without consensus",
      "direct action vs coalition building",
      "leadership without buy-in",
      "harriet tubman lincoln leadership",
      "when to stop waiting for approval",
    ],
    hookQuestion:
      "If you wait for everyone to agree before acting, will the window have already closed?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Harriet Tubman",
        text: "I never waited for permission and I never consulted a committee about the route. Not because I was reckless — I was meticulous about every safe house, every cover story, every timing decision on those nineteen trips. But I understood something that coalition-builders often miss: the people who needed to be freed could not wait for the political conditions to improve. The window for action is not determined by whether you have consensus. It is determined by whether the people harmed by inaction can survive another season of waiting. My construct is this: when the cost of delay falls on people who have no voice in the consensus-building process, waiting for buy-in is not discipline. It is a decision to let those people bear the cost of your caution.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Tubman is correct that delay has costs — costs paid by real people who are not at the table. I knew this. I had known it since I was a young man watching a slave auction in New Orleans. But I also knew something she perhaps did not have to reckon with in the same way: an executive action taken before the coalition can enforce it is not boldness. It is theater. If I had issued the Emancipation Proclamation in 1861, I would have lost the border states, fractured the Union Army, and possibly lost the war — in which case the proclamation would have been nullified and the institution it aimed to destroy would have been entrenched by Confederate victory. My framework is not patience for its own sake. It is the question of whether the action you are about to take can be made to stick. An act that cannot stick does not liberate anyone. It merely exposes the actor.",
      },
      {
        speaker: "Harriet Tubman",
        text: "Lincoln is describing a real constraint — the enforceability problem — and using it correctly in his domain. But I want to name what his framework obscures: enforceability analysis can always be used to justify waiting, because there is always another condition that is not yet in place. I did not have federal troops. I did not have political cover. I did not have public opinion on my side in 1849 when I made my first trip. What I had was a specific route, specific safe houses, and specific people who needed to move now. The enforceability question Lincoln asks — can this stick? — is the right question for executive orders and legislative agendas. It is the wrong question for direct action, which does not need institutional enforcement. It needs only the people involved to commit and move. If my logic wins here, the relevant question is not whether you have enough institutional backing for the action to stick. It is whether the action you are considering requires institutional backing at all, or whether it can be executed by the people directly involved without requiring anyone else's enforcement.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Tubman is drawing a distinction I accept: direct action and executive action operate under different enforceability constraints. Where I want to push back is on the scale question. Tubman freed hundreds of people through direct action — a genuine and profound achievement. The Emancipation Proclamation was the precondition for the Thirteenth Amendment, which freed four million. The actions that change the condition at scale — that reform the system rather than rescue individuals from within it — require the coalition that direct action does not. My argument is not that direct action is wrong. It is that founders who are trying to change the conditions at scale, rather than rescue individuals from within the current conditions, cannot rely on Tubman's framework. They must build the coalition that makes the systemic change enforceable. The question is: are you trying to help specific people now, or trying to change the conditions for everyone? Those require different frameworks.",
      },
      {
        speaker: "Harriet Tubman",
        text: "Lincoln's scale argument is honest, and I want to name its failure mode. The argument that 'we need the coalition for systemic change' has been used in every generation to postpone action that could have been taken now. The people who told abolitionists to wait for political conditions to improve were not wrong about the political conditions — they were wrong about who bore the cost of waiting. I was not opposed to systemic change. I worked with Frederick Douglass, with the Underground Railroad's network, with every political ally I could find. But I did not let the absence of a complete coalition become the reason to leave people in bondage who could be freed this season. The diagnostic I would offer Lincoln is this: is the coalition you are building actually moving toward the systemic change, or is building the coalition becoming the work, with the change itself perpetually deferred? If the coalition is a genuine vehicle, build it. If it is a substitute for action, stop.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "That diagnostic is the right one, and I will accept it and make it precise. The test for whether coalition-building is genuine or evasive is whether it has a defined threshold — a specific set of conditions that, once met, trigger the action — and a defined deadline that constrains the waiting. When I entered office I had already defined the threshold: the Union must be preserved and the border states must be secured before I act on slavery publicly. I hit that threshold in September 1862 after Antietam. The proclamation followed in January. If you cannot name the specific conditions that will cause you to act, and the specific date by which those conditions must be met before you proceed without them, your consensus-building is not discipline. It is delay with better vocabulary. Tubman and I agree on more than it appears: act when the window is open and the people who need action cannot wait; build the coalition when the action requires enforcement at scale. The diagnostic that separates those two cases is whether you can specify what 'ready enough' looks like — and whether you have set a date by which you will act regardless.",
      },
    ],
    conclusion: {
      frameworkSlug: "harriet-tubman",
      summary:
        "Tubman and Lincoln converge on a diagnostic that resolves the apparent conflict between direct action and coalition-building. The key variable is not courage or patience — it is the enforceability requirement of the action you are considering. Actions that can be executed by the people directly involved without requiring institutional backing are Tubman's domain: act now, the window is closing. Actions that require institutional enforcement at scale to stick are Lincoln's domain: build the coalition to the defined threshold, then act. Both agree that consensus-building without a defined threshold and a deadline is not discipline — it is delay.",
      actionableInsight:
        "Before deciding whether to act or build more consensus, answer two questions. First: does the action you are considering require institutional backing to stick, or can it be executed by the people directly involved? If the latter, stop waiting — identify the specific people who need to move and move with them now. Second: if the action does require institutional enforcement, can you name the specific conditions that constitute 'ready enough,' and the date by which you will act regardless of whether those conditions are fully met? If you cannot name both — the threshold and the deadline — your coalition-building is deferral. Set the threshold, set the date, and act when either is reached.",
    },
  },
  {
    slug: "franklin-vs-aurelius-on-building-for-the-long-term",
    type: "collision",
    frameworkSlug: "benjamin-franklin",
    collisionFrameworkSlugs: ["benjamin-franklin", "marcus-aurelius"],
    decisionType: "resilience",
    title: "Franklin vs. Aurelius: Should You Build for Legacy or Focus on Today?",
    description:
      "Benjamin Franklin managed his reputation as deliberately as he managed his printing business — cultivating relationships, publishing under pseudonyms, and engineering the public perception that would make him effective for decades. Marcus Aurelius wrote the Meditations as private self-instruction, not for publication, and returned each day to the same question: what does duty require of me right now, not in ten years? Franklin built for legacy; Aurelius built for clarity in the present moment. They represent a genuine tension between long-horizon strategic planning and present-moment discipline.",
    targetKeywords: [
      "should I think about legacy or focus on today",
      "long term planning vs present focus",
      "building reputation vs doing the work",
      "franklin aurelius legacy",
      "long-term strategy vs present duty",
    ],
    hookQuestion:
      "Is thinking about the long-term a form of strategic clarity, or a way of avoiding the demands of right now?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Benjamin Franklin",
        text: "I began cultivating my public reputation before I had anything worth being known for. Not from vanity — from strategy. I understood that a printer in Philadelphia who wanted to influence public affairs, negotiate treaties, or found institutions needed a reputation that arrived in the room before he did. The Silence Dogood letters, the Poor Richard's almanacs, the strategic friendships I built over decades — none of these were accidents of personality. They were investments I made in the asset that would compound longest. The founder who works on the product but neglects the reputation is building a business that is entirely dependent on the quality of the next product. The one who builds both is building something that can survive a bad product cycle. My construct: reputation is a long-duration asset that pays its highest returns in the crisis you have not yet encountered.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Franklin's reputation framework is not wrong — but it is the wrong primary question. I ruled the largest empire in the world for nineteen years and I did not spend a single hour of those years managing my public image. I spent those hours asking what the duty in front of me actually required and whether I was meeting it. The Meditations were not written for publication. They were written as daily self-instruction because I had observed, in myself and in every emperor before me, that the person who focuses on how history will judge them stops being able to see what the present situation actually requires. Legacy is a byproduct of meeting the duties in front of you with clarity and consistency. It is not a strategy. The founder who is building for legacy is building for an audience. The one building for present duty is building for the work. The audience shows up when the work is genuine. It rarely shows up when the work is performed.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "Aurelius describes the failure mode of reputation-building correctly — the person so focused on the audience that the work becomes performance. But he is describing the corruption of my method, not the method. The Silence Dogood letters were not self-promotion. They were arguments I could not make under my own name without being dismissed as a seventeen-year-old printer's apprentice. The reputation I built was the vehicle that gave the arguments access to audiences they would not otherwise reach. That is not avoiding present duty. It is doing present duty under conditions where direct action is blocked. Aurelius could govern by doing — he had the legions, the treasury, and the title. When the channels for direct action are closed, reputation is often the only tool that opens them. The question is not whether to build for legacy. It is whether your situation allows direct action or requires building the conditions under which direct action becomes possible.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Franklin is describing a legitimate use of reputation as a strategic vehicle, and I will grant it. My concern is different: it is about what happens to your judgment when you have internalized the reputation project. The person who asks 'what would Franklin do here?' before asking 'what does this situation actually require?' has placed a filter between themselves and reality. I wrote in the Meditations specifically to counter this — to return, daily, to what the situation actually demanded rather than what the role demanded. The emperor who governs by role is governing for the image of an emperor. The emperor who governs by duty is governing for the people in front of him. The practical danger of Franklin's method is not that it is dishonest — he was genuinely pursuing public good, and I believe him. It is that the method trains the practitioner to see every situation through the lens of how it affects the long-term reputation project. That filter makes it harder to take necessary actions that are costly to reputation in the short term. Aurelius's question is always: what does this require of me right now, without reference to how it will look later?",
      },
      {
        speaker: "Benjamin Franklin",
        text: "Aurelius names the genuine risk — the reputation filter that makes you avoid necessary short-term costly actions. I want to name where I think his framework carries the complementary risk. The person who focuses entirely on present duty, without any model of where their work is going and who needs to receive it, can spend extraordinary effort on work that never reaches the people it was meant for. Aurelius wrote one of the most important philosophical texts in history. He wrote it for himself. It survived only because he was emperor and his personal papers were preserved. A less powerful person writing the same text with the same present-duty orientation would have left us nothing. The question I would ask Aurelius is: who is the work for? If you cannot name the audience and the conditions under which the work reaches them, you are not being free of reputation concerns — you are assuming that quality alone will solve the distribution problem. It often does not.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "That is the practical convergence I would offer. Franklin is right that distribution is a real problem and that reputation is a legitimate instrument for solving it — especially when direct access to the audience is blocked. I am right that the reputation project, internalized too deeply, creates a filter that makes you less capable of seeing what the present moment actually requires. The integrated practice is this: maintain a clear model of who the work needs to reach and what conditions will allow it to reach them — that is Franklin's contribution. But return, daily, to the question of what the present duty requires without first asking what it will cost the long-term project — that is mine. The founder who can hold both is neither performing for an audience nor working in isolation. They are doing the present work clearly, with an honest model of how it will eventually reach the people who need it. That model should be revisited; it should not be present in the room for every individual decision.",
      },
    ],
    conclusion: {
      frameworkSlug: "benjamin-franklin",
      summary:
        "Franklin and Aurelius converge on an integrated practice rather than a binary choice. Franklin is correct that reputation and distribution are real strategic problems — especially when direct channels to the audience are blocked — and that a long-horizon investment in reputation compounds in crises you have not yet encountered. Aurelius is correct that the reputation project, internalized as a constant filter, degrades the quality of present judgment by making necessary short-term costly actions harder to take. The resolution: maintain a clear model of who the work needs to reach and what conditions will allow it to reach them, but return daily to present duty without running that model for every individual decision.",
      actionableInsight:
        "Audit how much of your decision-making time is spent on the present work versus the reputation and positioning project. If the reputation model is present in the room for every individual decision — if you are asking 'how will this look?' before 'what does this require?' — apply Aurelius's correction: write down what the situation demands, independent of how it affects any long-term project, and act on that. Then, separately, apply Franklin's question once a week: who needs to receive this work, and what conditions will allow them to receive it? Build those conditions deliberately, as a separate project from the work itself. The failure modes run in opposite directions: the Aurelius error is doing excellent work that never reaches anyone; the Franklin error is building perfect conditions for work that has been quietly degraded by the reputation filter.",
    },
  },
  {
    slug: "galileo-vs-archimedes-on-when-to-challenge-consensus",
    type: "collision",
    frameworkSlug: "galileo-galilei",
    collisionFrameworkSlugs: ["galileo-galilei", "archimedes"],
    decisionType: "evidence",
    title:
      "Galileo vs. Archimedes: When Is the Evidence Strong Enough to Challenge Consensus?",
    description:
      "Galileo published the Sidereus Nuncius in 1610 — months after building his telescope — staking a public claim against the Aristotelian and Ptolemaic consensus with evidence the establishment had not yet examined. Archimedes spent years constructing rigorous geometric proofs before asserting new mathematical principles, building from first principles to irrefutable demonstration before making claims the field had to reckon with. Both overturned consensus; they disagreed on whether speed of challenge or depth of proof is the primary variable.",
    targetKeywords: [
      "when to challenge expert consensus",
      "how much evidence to challenge conventional wisdom",
      "Galileo Archimedes evidence threshold",
      "when is your data strong enough to publish",
      "challenging established view with new data",
    ],
    hookQuestion:
      "At what point does your data give you the right to say everyone else is wrong?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Galileo Galilei",
        text: "I published the Sidereus Nuncius eight months after I first turned a telescope toward the sky. Not because I was impatient, but because I understood something about the sociology of knowledge that the proof-builders often miss: the window in which a new instrument can overturn a settled consensus is narrow. If I had waited two more years to publish — if I had built the complete mathematical architecture first — someone else with a telescope would have published the moons of Jupiter and the phases of Venus. The evidence I had in 1610 was not a complete proof. It was a sufficient challenge. There is a meaningful difference: a sufficient challenge forces the field to respond, which accelerates the process of generating the complete proof. The person who waits for completeness before speaking often loses the opportunity to change the field at the moment when change is possible.",
      },
      {
        speaker: "Archimedes",
        text: "Galileo describes an incentive structure — the competitive priority race — and uses it to argue for early publication of incomplete evidence. I want to name what that argument assumes: that the field will engage honestly with a sufficient challenge and that the engagement will produce progress. My experience was different. I developed the method of exhaustion — the precursor to what you would call integral calculus — and I did not publish the method alongside the results. I published results whose proofs I had already verified and whose implications I had already traced. The reason is this: an incomplete argument, published before the field can verify it, does not accelerate progress. It creates a decade of controversy about the argument's validity during which the actual phenomenon gets obscured by the dispute about the evidence quality. Galileo's telescope observations were valid. The debate about whether they were conclusive consumed fifteen years. I would rather spend five additional years building the proof than spend fifteen defending the evidence.",
      },
      {
        speaker: "Galileo Galilei",
        text: "Archimedes describes the failure mode of early publication — the validity dispute that buries the discovery — and applies it to my situation without examining whether it actually occurred. The Sidereus Nuncius was published in March 1610. By the end of that year, Kepler had confirmed the observations, multiple astronomers across Europe had replicated them, and the Ptolemaic system was under siege in every major academic center on the continent. The dispute about whether my evidence was conclusive did not consume fifteen years. It consumed approximately eighteen months, after which the observations had been replicated independently enough times that the controversy shifted from 'are the moons real' to 'what do the moons mean.' The fifteen-year timeline Archimedes fears is the timeline for a sufficient challenge that cannot be replicated. The timeline for a sufficient challenge based on an observable phenomenon that any competent observer can verify independently is much shorter. The key variable is not proof completeness — it is replicability. If your evidence can be independently replicated by any honest observer with access to the same instrument, publish now. The replication will produce the proof faster than you can construct it alone.",
      },
      {
        speaker: "Archimedes",
        text: "Galileo's replicability criterion is the most useful thing either of us has said, and I want to apply it to the cases where it breaks. The telescope observations were replicable because any competent observer with a sufficiently good telescope could see the moons of Jupiter. The mathematical results I was working on were not replicable in that sense — they required following a chain of proof that took months to verify even for mathematicians of the highest ability. The practical question for anyone deciding when to publish is: what is the replication burden for your specific evidence? If the replication burden is low — if any honest observer with access to the instrument can verify the observation within days — Galileo is right: publish the sufficient challenge and let the replication produce the proof. If the replication burden is high — if verifying your claim requires months of independent work, specialized knowledge, or complex equipment — then Archimedes's method is correct: do not publish the claim until the proof is complete enough that verification is tractable. The error in both of our positions is applying a universal rule to what is actually a replication-burden question.",
      },
      {
        speaker: "Galileo Galilei",
        text: "I accept the replication-burden framing and want to add one more variable: the cost of delay specific to your domain. In astronomy, the cost of delay was that I might lose priority to another observer. In mathematics, as Archimedes was practicing it, the cost of delay was low — the theorems would still be true in five years, and the field was small enough that priority disputes were resolved by scholarly correspondence rather than public priority races. For most founders, the cost-of-delay question is the variable that determines which framework to apply. If you are operating in a domain where delay allows a competitor to publish the same finding, release the same product, or establish the same position before you — Archimedes's proof-completeness standard is a luxury you cannot afford. If you are operating in a domain where the only person harmed by delay is yourself — where no one else is close to your finding — you have the time to build the complete case. Diagnose the competitive speed of your domain before you decide how much proof is enough.",
      },
      {
        speaker: "Archimedes",
        text: "We have arrived at a framework I will accept: the threshold for publishing a challenge to consensus is determined by two variables, not one. First, the replication burden — how difficult is it for an independent observer to verify your claim? Second, the cost of delay — how much does waiting to complete the proof cost you in competitive position? When replication burden is low and cost of delay is high, Galileo's method is correct: publish the sufficient challenge and let independent replication accelerate the proof. When replication burden is high and cost of delay is low, my method is correct: build the complete proof before publishing, because an incomplete challenge with a high replication burden produces controversy that delays acceptance more than the additional proof-building time would have. When both are high — high replication burden and high cost of delay — you face a genuine dilemma, and the honest answer is that neither of our methods resolves it cleanly. In that case, I would advise sharing the incomplete work with the two or three most credible independent experts in your field before publishing broadly, to get a verification signal without triggering the public controversy prematurely.",
      },
    ],
    conclusion: {
      frameworkSlug: "galileo-galilei",
      summary:
        "Galileo and Archimedes converge on a two-variable framework for determining when evidence is strong enough to challenge consensus. The threshold is set by the interaction of replication burden (how difficult is it for an independent observer to verify your claim?) and cost of delay (how much does waiting to complete the proof cost you in competitive position?). Low replication burden plus high cost of delay — Galileo's method: publish the sufficient challenge, let independent replication accelerate the proof. High replication burden plus low cost of delay — Archimedes's method: build the complete proof first. High on both — share privately with two or three credible experts before going public.",
      actionableInsight:
        "Before deciding whether your evidence is strong enough to challenge the consensus in your field, run the two-variable test. First, replication burden: can any honest expert with access to the same data or instrument verify your finding independently within a week? If yes, your threshold is lower — publish the sufficient challenge. If no — if verification requires months of specialized work — your threshold is higher and you need a more complete case. Second, cost of delay: is someone else close to the same finding? If yes, the delay cost is real and Galileo's method applies — publish now with the evidence you have, clearly labeled as preliminary. If no — if you have a genuine window — use it to build toward Archimedes's standard. If both are high, do not publish broadly yet: share with two or three credible independent experts, get a verification signal, and then decide whether to go public or build further.",
    },
  },
  // ── Wave 19: collision articles ───────────────────────────────────────
  {
    slug: "carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it",
    type: "collision",
    frameworkSlug: "andrew-carnegie",
    collisionFrameworkSlugs: ["andrew-carnegie", "napoleon-bonaparte"],
    title: "Carnegie vs. Napoleon: Do You Win Loyalty or Demand It?",
    description:
      "Carnegie built the largest industrial empire in American history by investing in his people's growth, treating loyalty as something earned through genuine care. Napoleon built the most disciplined military machine in European history through accountability, consequence, and the expectation that performance would be rewarded and failure would not be tolerated. When a key team member is underperforming, these two frameworks produce opposite first moves — and both have produced organizations capable of extraordinary things.",
    targetKeywords: [
      "how to build team loyalty startup",
      "employee development vs performance management",
      "winning loyalty vs demanding it",
      "carnegie napoleon leadership",
      "when to invest in people vs apply pressure",
    ],
    decisionType: "hiring",
    hookQuestion:
      "When a key team member isn't performing, do you invest in their development or apply pressure and consequence?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Andrew Carnegie",
        text: "The man who does not take genuine interest in the people around him will never build an organization that outlasts his own attention. I did not demand loyalty from my managers. I earned it — by knowing their names, their families, their ambitions, and by making their advancement my personal concern. A team that follows you because they fear the consequence of not following you will do exactly what is required and nothing more. The team that follows you because you have invested in who they are becoming will do what is required and discover what is possible.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Carnegie describes an admirable philosophy for a peacetime enterprise. I governed men under conditions where ambiguity about consequence was itself a form of danger. The soldier who is not certain that failure to hold his position will cost him something real will calculate whether holding it is worth the personal risk. The answer to an underperforming team member is not more development investment before accountability is clear — it is clarity of expectation first, development as the tool for meeting it, and consequence when the expectation is not met. Loyalty built on care without consequence produces affection. Loyalty built on shared standards produces an army.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Napoleon conflates the outcome he needed — obedience under mortal pressure — with the outcome you need, which is discretionary effort in the absence of direct supervision. My managers ran steel plants I was not present in, made decisions I could not review, and innovated in ways I could not have instructed. That is not the behavior of men who feared consequence. It is the behavior of men who had internalized the mission as their own. The underperforming team member Napoleon would apply pressure to is often the team member who has not yet understood why the work matters. My first move is to make that clear — not through threat but through genuine investment in their understanding.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Carnegie is correct about the conditions under which his approach outperforms mine: complex, autonomous work, where discretionary effort is the variable that matters. I accept that distinction. My concern is different: the founder who defaults to development investment before establishing that the standard exists and is non-negotiable has communicated something about the organization's operating logic that is difficult to revise. The team member who receives development investment before consequence learns that the response to underperformance is support. That is not wrong — but it must be combined with the explicit communication that the standard remains. Development without a clear expectation is indulgence. Development combined with an explicit expectation and a defined timeline is the strongest available signal of genuine investment in the person.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Napoleon has arrived at the formulation I would accept. The question is not development or accountability — it is the sequence and the genuine nature of the investment. I never confused care for the person with tolerance for failure to perform. My most successful managers were held to standards I would not compromise. But the standard was communicated as a belief in their capacity to meet it, not as a threat about what would happen if they did not. When both are present — genuine belief in the person and genuine clarity about the standard — the team member experiences not pressure but the recognition that you are serious about their growth and serious about what the organization requires. That combination is what produces loyalty that survives difficulty.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Then the practical answer depends on a prior diagnosis that neither of us has named directly: what is the root cause of the underperformance? If the underperformance comes from unclear expectations, insufficient support, or skills the person has not yet developed — Carnegie's development-first model is correct, because the limiting factor is the person's capability and the investment in it is the rational response. If the underperformance comes from misaligned incentives, insufficient urgency, or the implicit belief that the standard is negotiable — the first move must be clarity of expectation and consequence, not investment. The investment made before the expectation is clear will be interpreted as evidence that the standard is not serious. Diagnose the root cause. Then choose your first move.",
      },
    ],
    conclusion: {
      frameworkSlug: "andrew-carnegie",
      summary:
        "Carnegie and Napoleon converge on a root-cause diagnostic before prescribing a response to underperformance. Carnegie's development-first model is correct when the limiting factor is capability — unclear expectations, missing skills, or insufficient support. Napoleon's accountability-first model is correct when the limiting factor is urgency — misaligned incentives, negotiable standards, or the absence of clear consequence. Both agree that development investment made before expectations are explicit will be read as evidence that the standard is not serious.",
      actionableInsight:
        "Before deciding how to respond to an underperforming team member, diagnose the root cause. Ask: does this person understand precisely what is expected of them and believe the expectation is non-negotiable? If no — start with Napoleon's move: state the expectation, make it specific and time-bound, and make the consequence of not meeting it clear. If yes — start with Carnegie's move: invest genuinely in the person's development, communicate your belief in their capacity to meet the standard, and make your care for their growth evident. The mistake is applying development investment to an urgency problem, or applying pressure to a capability problem. Diagnose first.",
    },
  },
  {
    slug: "tesla-vs-galileo-on-working-against-the-institution",
    type: "collision",
    frameworkSlug: "nikola-tesla",
    collisionFrameworkSlugs: ["nikola-tesla", "galileo-galilei"],
    title: "Tesla vs. Galileo: How Do You Keep Building When the System Works Against You?",
    description:
      "Tesla fought Edison's direct-current empire openly and on technical merit — and eventually won the war of alternating current while losing most of what he had personally. Galileo faced the most powerful institutional authority in Europe, recanted his findings under threat, and continued his scientific work in private until his ideas had become impossible to suppress. Direct defiance and strategic patience produced different personal outcomes but both advanced the work. The question is not whether to resist — it is how.",
    targetKeywords: [
      "how to work against institutions",
      "fighting incumbents vs working around them",
      "Tesla Galileo strategy against opposition",
      "when to fight the system vs route around it",
      "startup vs incumbent strategy",
    ],
    decisionType: "resilience",
    hookQuestion:
      "The institutions, investors, or market incumbents are aligned against your approach. Do you fight them directly or work around them?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Nikola Tesla",
        text: "I did not choose to fight Edison because I was temperamentally combative. I fought because the technical question — AC versus DC — had a correct answer, and the correct answer was mine. The 'War of Currents' was not a political dispute or a market positioning debate. It was a question of physics. When the facts are unambiguously on your side and the opposition is entrenched not on evidence but on interest, the correct strategy is to make the evidence as public and as undeniable as possible. I lit the Chicago World's Fair with alternating current. That was not a compromise with Edison's system — it was a demonstration that his system could be replaced. The strategy of working around the institution only makes sense when the institution's position cannot be directly falsified.",
      },
      {
        speaker: "Galileo Galilei",
        text: "Tesla describes the strategy for the case where the institution is technically wrong and you have the tools to prove it in a single public demonstration. My situation was structurally different. The Church's authority was not predicated on physics — it was predicated on interpretation of scripture and the organization of social life. A telescope pointing at the moons of Jupiter was a correct answer to a specific empirical question. It was not a correct answer to the institutional question of whether the Church's interpretation of scripture was authoritative. When I recanted before the Inquisition, I was not abandoning the science. I was correctly identifying that the fight I was in was not primarily a scientific fight, and that a martyr to heliocentrism in 1633 would have produced less scientific progress than an old astronomer under house arrest who continued to write. Strategic patience is not cowardice. It is the recognition that not every institutional obstacle can be resolved by technical demonstration.",
      },
      {
        speaker: "Nikola Tesla",
        text: "Galileo's recantation was prudent under the conditions he faced. I do not dispute that. But I want to name the cost of the strategic patience model that he does not account for. When I compromised with Westinghouse on the royalty structure, when I deferred to Morgan on the scope of the Wardenclyffe project, when I accepted the institutional constraints that limited what I could build — I was practicing Galileo's patience, and each compromise extended the timeline of the work and ultimately left me unable to complete the most important project I had conceived. The institutional accommodation did not preserve my capacity to work. It slowly consumed it. I am not arguing that direct confrontation is always correct. I am arguing that the strategy of working around institutions has a hidden cost: every routing-around is a concession to the institution's terms, and those concessions compound.",
      },
      {
        speaker: "Galileo Galilei",
        text: "Tesla names a real failure mode — the strategic patience that becomes permanent accommodation. I want to be precise about what distinguishes the two. I did not stop working when I recanted. I wrote the Discorsi under house arrest, and it was published in the Netherlands outside the Church's jurisdiction. The accommodation was on the institutional register — the public declaration — while the scientific work continued in the only register where it could still advance. The test is not whether you have made a concession to the institution. It is whether the concession has closed the avenue of work itself, or only the avenue of public confrontation. Tesla's compromises eventually closed the work — the funding dried up, the projects were cancelled. My recantation closed the public confrontation but left the work intact. The accommodation is acceptable when it preserves the work. It is fatal when it substitutes for the work.",
      },
      {
        speaker: "Nikola Tesla",
        text: "Then the practical diagnosis is this: what does the institution actually control? If the institution controls the public demonstration space but not the technical development space, Galileo's approach is correct — cede the public register, preserve the technical work, and let the work outlast the institutional opposition. If the institution controls the resources required for the technical development itself — the capital, the infrastructure, the supply chain — then accommodation is not a viable long-term strategy, because every accommodation increases the institution's leverage over the work. In my case, Morgan controlled the capital. I could route around Edison on technical merit. I could not route around Morgan on resources. Galileo could route around the Church's public authority. He could not have routed around it if the Church had controlled his laboratory. The institution's specific control structure determines whether confrontation or patience is the correct first move.",
      },
      {
        speaker: "Galileo Galilei",
        text: "We have arrived at the decision rule. Map what the opposing institution actually controls: public demonstration channels, capital and resources, distribution infrastructure, or the work itself. If the institution controls public channels but not the work — Galileo's model applies: cede the public register, route the work through the channel the institution does not control, and let time and replication do the confrontation. If the institution controls the resources the work requires — Tesla's urgency is correct: the accommodation is temporary at best, and the longer you route around rather than confront, the more leverage you cede. If the institution controls the work itself — neither accommodation nor confrontation resolves it, and the strategic answer is to build a parallel infrastructure that makes the institution's control irrelevant. Name what they control before you decide how to respond.",
      },
    ],
    conclusion: {
      frameworkSlug: "nikola-tesla",
      summary:
        "Tesla and Galileo converge on a diagnostic: the correct response to institutional opposition depends on what the institution actually controls. If it controls public demonstration channels but not the work itself — Galileo's model applies: cede the public register while preserving the technical work. If it controls the resources required for the work — Tesla's urgency is correct: accommodation increases leverage over time and confrontation or parallel infrastructure is necessary. The accommodation is acceptable when it preserves the work; it is fatal when it substitutes for the work.",
      actionableInsight:
        "Before deciding whether to fight the institution or route around it, map what the institution specifically controls. Does it control your public credibility and distribution, or does it control your capital, infrastructure, or access to the work itself? If the former, use Galileo's approach: make the public accommodation while continuing the work through channels the institution does not govern. If the latter, use Tesla's urgency: every quarter of accommodation is a quarter in which the institution's leverage over your work compounds. The specific control structure is the variable — not the institution's size or apparent power. Small institutions that control critical resources are more dangerous than large institutions that control only public narrative.",
    },
  },
  {
    slug: "sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital",
    type: "collision",
    frameworkSlug: "sun-tzu",
    collisionFrameworkSlugs: ["sun-tzu", "john-d-rockefeller"],
    title: "Sun Tzu vs. Rockefeller: Do You Win by Choosing the Right Terrain or by Controlling Capital?",
    description:
      "Sun Tzu's theory of competitive advantage is fundamentally positional: win by fighting on ground where the enemy's strength doesn't apply. Rockefeller's theory is fundamentally infrastructural: eliminate competition by controlling the assets your competitors must use to compete. Both produced decisive, lasting competitive victories — but through mechanisms that are genuinely incompatible, and the choice between them has direct implications for how founders should think about building moats.",
    targetKeywords: [
      "competitive advantage strategy startup",
      "positioning vs capital accumulation strategy",
      "Sun Tzu Rockefeller competitive moat",
      "how to build a startup moat",
      "terrain selection vs infrastructure control",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Is your competitive advantage a positioning choice — or an asset accumulation play?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The general who wins selects the terrain before the battle begins. The terrain determines which force is relevant and which is not. Rockefeller's capital is a form of force — enormous, systematized, capable of crushing any direct competitor. But force deployed on the wrong terrain is wasted force. The question is not how much capital you can accumulate. It is whether the terrain you have selected makes your competitor's capital advantage irrelevant. The startup that competes with an incumbent on the incumbent's chosen terrain will lose regardless of how much terrain they occupy. Select the ground where the incumbent's scale is a liability rather than an asset — regulatory complexity they cannot navigate quickly, customer relationships that require personal attention they cannot provide at scale, technical domains where their legacy architecture is a constraint rather than an advantage. Win there first. The capital question is secondary.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Sun Tzu describes a strategy for the actor who cannot control the terrain — who must maneuver within a landscape they do not own. My approach was different: I did not select favorable terrain. I built it. The pipeline network, the railroad rebates, the refinery network — these were not geographic advantages I discovered. They were infrastructure I constructed at cost, in advance, before my competitors understood what I was doing. The result was not a terrain that made my capital relevant. It was a system my competitors were forced to use, on terms I set. Sun Tzu's terrain selection produces an advantage that lasts until a competitor selects better terrain. My infrastructure control produced an advantage that lasted until the federal government dismantled it. Choose the model that matches your resource level: terrain selection for the actor who must be mobile; infrastructure control for the actor with the patience and capital to build the toll road.",
      },
      {
        speaker: "Sun Tzu",
        text: "Rockefeller describes the outcome of his approach without naming its precondition. He built the Standard Oil infrastructure because he had already won the terrain battle in Cleveland — the preferential railroad rates, the refinery consolidations — before any competitor understood that the terrain was being contested. The infrastructure he built was the formalization of a positional advantage he had already achieved. The founder who attempts to build infrastructure control from a position of positional weakness will simply build expensive assets on terrain that better-positioned competitors will outflank. Rockefeller's capital accumulation was not an alternative to terrain selection — it was the stage that followed terrain selection after the initial position was secured. The strategic sequence is terrain first, infrastructure second.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Sun Tzu is making a historical claim about the sequence of my strategy that I think requires examination. The Cleveland consolidation was not a terrain selection — it was a capital deployment. I bought out competitors at prices they could not refuse, not because I had found a position their strength could not reach, but because I had the capital to make refusal irrational and the operational efficiency to make the combined entity more profitable than the sum of its parts. The positional advantage came after the capital deployment, not before it. The first move was not selecting favorable ground — it was making a capital commitment that changed the ground itself. Sun Tzu's model assumes the terrain is fixed. In markets where capital can alter the terrain, the infrastructure model is not a second-stage move. It is the first move that creates the terrain the positioning model then maps.",
      },
      {
        speaker: "Sun Tzu",
        text: "Then we have identified the precise variable that determines which model applies: whether the terrain is fixed or malleable. In a domain where the terrain is fixed — where the competitive landscape has properties that capital cannot buy its way out of, such as network effects that are already concentrated elsewhere, technical domains requiring rare expertise, or customer relationships that are non-transferable — terrain selection is the primary instrument. The actor with superior capital who enters fixed terrain that is already occupied by a well-positioned defender will pay an enormous price for insufficient outcome. In a domain where capital can alter the terrain — commodity markets, infrastructure-dependent industries, distribution-dependent businesses — Rockefeller's infrastructure model is the more powerful instrument. Diagnose the malleability of the terrain before deciding which model to use.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "We have converged on the diagnostic, and I want to state it as a decision rule for founders with limited capital. If your terrain is fixed — if there are positions in your market that capital cannot purchase and that incumbents have not yet occupied — Sun Tzu is correct: move to those positions immediately, before anyone else identifies them, and defend them at a cost your larger competitors cannot justify paying. If your terrain is malleable — if the positions of competitive advantage are themselves buildable assets — then Rockefeller's model applies, but the entry requirement is meaningful early capital advantage. A founder attempting to build infrastructure control from a position of capital parity with incumbents will simply fund a slower version of the incumbent's expansion. The infrastructure model requires a genuine capital advantage in the specific segment where the infrastructure will be built. If you do not have that advantage, Sun Tzu's terrain selection is not the second-best strategy. It is the only one available to you.",
      },
    ],
    conclusion: {
      frameworkSlug: "sun-tzu",
      summary:
        "Sun Tzu and Rockefeller converge on a terrain-malleability diagnostic. In markets where competitive terrain is fixed — where capital cannot purchase the positions of advantage — Sun Tzu's positional model is correct: identify the ground the incumbent's scale makes them unable to contest and occupy it before they understand the contest. In markets where terrain is malleable — where capital can construct the infrastructure that competitors must use — Rockefeller's model is correct, provided the founder has a genuine early capital advantage in the specific segment where infrastructure will be built. The error is applying the infrastructure model without capital advantage, or applying the terrain-selection model to a domain where capital can simply buy any terrain you select.",
      actionableInsight:
        "Before deciding between a positioning strategy and an infrastructure strategy, run the terrain-malleability test. Ask: can a well-capitalized incumbent buy their way into the position I am trying to occupy? If no — the terrain is fixed, Sun Tzu's model applies, and speed to occupation matters more than capital accumulation. Move immediately to the position where the incumbent's scale is a liability. If yes — the terrain is malleable, and the question shifts to whether you have a genuine capital advantage in the specific segment where infrastructure will be built. If you do, Rockefeller's model applies: build the toll road before competitors realize you are building it. If you do not, the infrastructure model is not available to you — it would simply fund the incumbent's expansion at your expense. Return to Sun Tzu: find the ground their capital cannot make relevant.",
    },
  },
  // ── Wave 18: collision articles ───────────────────────────────────────
  {
    slug: "seneca-vs-cicero-on-private-virtue-vs-public-duty",
    type: "collision",
    frameworkSlug: "seneca",
    collisionFrameworkSlugs: ["seneca", "cicero"],
    title: "Seneca vs. Cicero: Should You Prioritize Private Virtue or Public Duty?",
    description:
      "Seneca argued that the deepest form of virtue is won in private — through philosophical practice, honest self-examination, and the cultivation of an inner life that external chaos cannot touch. Cicero believed precisely the opposite: that virtue divorced from public engagement is incomplete, even cowardly, and that the philosopher who retreats from the forum has abandoned the highest human calling. For founders navigating the tension between personal integrity and the compromises demanded by investors, partners, and stakeholders, this collision is not historical — it is live.",
    targetKeywords: [
      "private virtue vs public duty leadership",
      "founder values compromise stakeholders",
      "when to compromise your principles startup",
      "stoic leadership philosophy business",
      "integrity vs pragmatism founder",
    ],
    decisionType: "leadership",
    hookQuestion:
      "When your private principles and your public obligations diverge, which one do you sacrifice?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Seneca",
        text: "The philosopher who cannot maintain his principles in private has nothing to offer in public. The inner citadel must be built before the storm arrives — not during it. When your investors demand that you compromise what you know is right, the question is not whether to resist. It is whether you have done the work to know what you actually believe.",
      },
      {
        speaker: "Cicero",
        text: "Seneca counsels retreat. I counsel engagement. Virtue that has never been tested in the forum is not virtue — it is potential that has been carefully protected from any situation that might prove it wrong. The founder who preserves their principles by avoiding every situation that would stress them has not demonstrated integrity. They have demonstrated avoidance.",
      },
      {
        speaker: "Seneca",
        text: "You misread me. I am not counseling retreat from the world — I am counseling construction of the self before you enter it. The senator who breaks under political pressure did not lose his integrity in the forum. He lost it years before, when he failed to build it. The inner work is the precondition of any reliable public action.",
      },
      {
        speaker: "Cicero",
        text: "Then we agree more than you admit. But here is where we diverge: you treat the inner life as the endpoint. I treat it as preparation for the only arena that matters — the one where other people's lives are affected by your choices. The founder who has achieved profound private tranquility and built nothing that serves anyone has achieved exactly nothing.",
      },
      {
        speaker: "Seneca",
        text: "And the founder who has served every stakeholder demand, accommodated every political pressure, and shipped every compromise — what have they built? A company, perhaps. But not a life. At some point the accumulation of public duties leaves no space for the person who was supposed to be doing them. That person is the one who will make the hardest calls well.",
      },
      {
        speaker: "Cicero",
        text: "The hardest call is not the one you make in private contemplation. It is the one you make when the coalition is fracturing, the board is divided, and you must persuade people who disagree with you using only the force of your argument. That is a skill built in public, through friction, through the experience of being wrong in front of others and recovering. Retreat sharpens nothing.",
      },
    ],
  },
  {
    slug: "douglass-vs-carnegie-on-the-self-made-narrative",
    type: "collision",
    frameworkSlug: "frederick-douglass",
    collisionFrameworkSlugs: ["frederick-douglass", "andrew-carnegie"],
    title: "Douglass vs. Carnegie: Does Your Story of Self-Reliance Help or Hurt the People Around You?",
    description:
      "Andrew Carnegie turned his rags-to-riches story into a philosophy: the conditions of his rise proved that individual merit, discipline, and drive were sufficient to overcome any obstacle. Frederick Douglass had an equally remarkable origin story — and drew the opposite conclusion. For Douglass, the obstacles he overcame were not proof that the obstacles were surmountable for everyone; they were proof that the obstacles were real, and that most people faced them without the specific advantages he had. When founders use their origin story to set expectations for their teams, the Douglass-Carnegie collision determines whether that story builds culture or breaks it.",
    targetKeywords: [
      "self-made narrative leadership",
      "founder origin story team culture",
      "meritocracy vs systemic obstacles hiring",
      "Andrew Carnegie self-reliance philosophy",
      "Frederick Douglass systemic inequality leadership",
    ],
    decisionType: "hiring",
    hookQuestion:
      "When you tell your team 'I built this from nothing,' does that inspire them or just set an impossible standard?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Frederick Douglass",
        text: "Carnegie's story is not false — it is incomplete. He rose. But he rose from conditions that permitted rising. The man who was denied the ability to read by law, who had his wages seized by another man who owned him, who was beaten for the act of literacy itself — and still escaped — I am not saying this proves the system is fair. I am saying it proves what is possible under unfair conditions. Those are different claims, and confusing them costs the people in your company a great deal.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "I will not apologize for my story or soften it to spare the feelings of those who have not yet replicated it. The man who insists that his failure is the system's fault has handed over the only lever he controls. I came to this country with nothing — no language, no connections, no capital. The story is not that the conditions were fair. The story is that conditions are never the final variable. Will is.",
      },
      {
        speaker: "Frederick Douglass",
        text: "You conflate the exceptional case with the general law. Yes — will matters. Discipline matters. I would not have survived without both. But when you tell your new hire from a different background that you started from nothing and made it, you are telling them a story in which your advantages are invisible. They hear: 'The only thing standing between you and my results is your effort.' That is not true. And it is not kind.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Then what do you propose? That founders suppress their stories because someone might find them discouraging? The alternative — the story in which structural forces dominate individual agency — is equally dangerous. It teaches people that the variable they can control is not the important one. I would rather err on the side of overestimating human agency than systematically training people to feel powerless.",
      },
      {
        speaker: "Frederick Douglass",
        text: "I propose precision. Tell your story with the full accounting — including what you had, what you were given, what luck provided, and what you earned. The founder who gives that honest account is not diminished by it. They are more trustworthy because of it. And their team does not spend three years privately believing the standard is impossible while publicly pretending to believe otherwise.",
      },
      {
        speaker: "Andrew Carnegie",
        text: "Precision in self-accounting is a virtue. I grant that. But there is a version of that accounting that becomes an excuse architecture, and I have seen it operate in organizations. The founder's job is not to explain why things are hard. It is to create the conditions in which people can overcome hard things. The team that believes it can is more likely to. The story you tell your team about agency is itself an input to the outcome.",
      },
    ],
  },
  {
    slug: "cleopatra-vs-caesar-on-power-through-alliance-or-conquest",
    type: "collision",
    frameworkSlug: "cleopatra-vii",
    collisionFrameworkSlugs: ["cleopatra-vii", "julius-caesar"],
    title: "Cleopatra vs. Caesar: Do You Win Through Alliance or Through Conquest?",
    description:
      "Julius Caesar's fundamental strategic instinct was to create irreversible facts faster than his opponents could deliberate — to strike decisively, close off retreats, and force the world to adapt to a situation he had already made real. Cleopatra's instinct was different: accumulate structural entanglements so gradually that no single move triggered organized resistance, and by the time the position was visible it was already too strong to dislodge. For founders deciding whether to form partnerships with powerful competitors or outcompete them directly, these two frameworks produce opposite answers — and the right choice depends on terrain that neither framework alone can read.",
    targetKeywords: [
      "alliance vs competition strategy startup",
      "when to partner vs compete startup",
      "competitive strategy founder partnerships",
      "startup market competition strategy",
      "building strategic alliances vs direct competition",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Should you make allies of powerful rivals, or is it faster and cleaner to simply beat them?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Cleopatra VII",
        text: "Caesar's method requires an overwhelming advantage at the moment of action. Mine does not. Alliance accumulates slowly, at a cost below the adversary's response threshold, until the position is already structural. When your competitor finally recognizes that you have become indispensable to the five partners they rely on, the battle is over — and you never gave them a clear moment to fight back.",
      },
      {
        speaker: "Julius Caesar",
        text: "Cleopatra's method requires patience and ambiguity tolerance that most organizations cannot sustain. The advantage of decisive action is clarity — it converts the uncertainty of gradual positioning into a known outcome before the adversary can fully mobilize. Every week of competitive ambiguity is a week in which your opponent can reorganize. Speed forecloses that option.",
      },
      {
        speaker: "Cleopatra VII",
        text: "Speed forecloses your options as much as theirs. The competitor you defeat decisively becomes a martyr, a rallying point, a reason for the rest of the market to organize against you. I kept Egypt sovereign against Rome — not by fighting Rome, but by becoming too structurally entangled with Rome's interests to be safely dislodged. The strongest position is the one that is too expensive for your opponents to attack.",
      },
      {
        speaker: "Julius Caesar",
        text: "There is a case for that strategy on a long timeline with stable conditions. But founders rarely have either. The window in which a decisive move produces maximum leverage is often short — the competitor is raising a round, or distracted by their own crisis, or between key hires. The alliance you are patiently accumulating may be obsolete by the time it is complete. Sometimes the correct move is to act before the terrain is fully mapped.",
      },
      {
        speaker: "Cleopatra VII",
        text: "And sometimes the decisive actor walks into Alexandria thinking they have conquered a dependent kingdom and discovers they have entered a negotiation. I gave Caesar a reason to make my interests his interests. That is not capitulation — it is the superior form of strategic power. The partner who depends on you cannot destroy you without destroying themselves.",
      },
      {
        speaker: "Julius Caesar",
        text: "The dependency you describe is real — and it is also the source of the risk. When Pompey and Crassus each believed the other needed the alliance more than they did, the coalition held. The moment that belief shifted, it collapsed. Mutual dependency is stable only until one party believes they are better off without it. Your structural alliance is only as durable as your partner's calculation of their alternatives. Build the alternative they cannot replicate — and that is a form of conquest.",
      },
    ],
  },
  // ── Wave 20: collision articles ───────────────────────────────────────
  {
    slug: "curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field",
    type: "collision",
    frameworkSlug: "marie-curie",
    collisionFrameworkSlugs: ["marie-curie", "ada-lovelace"],
    title: "Curie vs. Ada Lovelace: Do You Break Through a Hostile Field with Rigor or with Vision?",
    description:
      "Marie Curie and Ada Lovelace both pioneered in disciplines that were structurally designed to exclude them — but through opposite mechanisms. Curie accumulated unassailable experimental evidence until the field could no longer rationalize her exclusion. Lovelace built conceptual frameworks so far ahead of the existing infrastructure that the field could not dismiss her contributions even when it tried. For founders entering markets dominated by entrenched incumbents who do not want them there, this collision identifies which mechanism — rigorous proof accumulation or visionary conceptual leaping — is better suited to the specific structure of the resistance they face.",
    targetKeywords: [
      "pioneering hostile market as outsider",
      "Marie Curie Ada Lovelace women in STEM leadership",
      "how to break into a market that excludes you",
      "experimental proof vs visionary vision market entry",
      "outsider strategy dominant incumbent",
    ],
    decisionType: "resilience",
    hookQuestion:
      "When the field is structurally hostile to your presence, do you accumulate evidence until they cannot exclude you — or do you build a vision so far ahead that exclusion becomes irrelevant?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Marie Curie",
        text: "The institution cannot dismiss what it cannot refute. My strategy was not to persuade the Academy — it was to produce results of such precision and reproducibility that any refusal to acknowledge them would require the Academy to publicly contradict its own methods. The experimental record is the argument. When the data is clean enough, the prejudice becomes the anomaly, not the scientist.",
      },
      {
        speaker: "Ada Lovelace",
        text: "Curie describes a strategy that works when the field has agreed-upon standards of evidence. My situation was different: the infrastructure to test my most important claims did not yet exist. I could not accumulate experimental proof for a machine that would not be built for a century. My contribution was conceptual — establishing the logical possibility of what the field had not yet imagined. The hostility of the field is not always a refusal to look at the data. Sometimes it is an inability to look, because the category of the contribution does not yet exist.",
      },
      {
        speaker: "Marie Curie",
        text: "You are describing a real constraint — but also a real risk. The conceptual claim that cannot be experimentally tested is indistinguishable from the conceptual claim that is simply wrong. I protected my work by making it falsifiable. Every claim I made could in principle be refuted by a better experiment. That meant every claim that survived the scrutiny was stronger than the scrutiny that challenged it. The visionary who operates outside the domain of experimental test has no such protection.",
      },
      {
        speaker: "Ada Lovelace",
        text: "The protection comes from the internal consistency of the logical structure. I was not making claims that could not be evaluated — I was making claims that could only be evaluated by someone willing to think rigorously about a system that did not yet physically exist. The hostile field's failure to evaluate my work was not a failure of my argument. It was a failure of their imagination. The risk Curie describes is real when the conceptual framework is loose. When the framework is rigorous, the protection is the same as hers: the internal logic either holds or it does not.",
      },
      {
        speaker: "Marie Curie",
        text: "Then the variable that determines which approach is correct is whether the field has agreed-upon evaluation standards that a sufficiently excellent outsider can satisfy. If yes — use the experimental approach. Accumulate evidence that is undeniable within the field's own framework. The cost is higher: you must produce more, faster, with fewer resources, to overcome the same prejudice that a member of the field would not face. But the outcome is durable: the record cannot be revised by the next generation of hostile gatekeepers.",
      },
      {
        speaker: "Ada Lovelace",
        text: "And if the field does not yet have evaluation standards that cover the category of your contribution — if you are proposing something genuinely outside the current framework of assessment — then the experimental approach is not available to you. The conceptual approach is the only one. You build the internal logic as carefully as Curie built her experimental record. You make the framework rigorous enough that the next generation, which will have the tools to test it, will not be able to dismiss it. You are writing for a court that does not yet exist. That is not a weakness — it is the only strategy when the current court is constitutionally incapable of hearing your case.",
      },
    ],
    conclusion: {
      frameworkSlug: "marie-curie",
      summary:
        "Curie and Lovelace converge on a field-structure diagnostic. When the field has established evaluation standards that a sufficiently excellent outsider can satisfy — agreed-upon metrics, experimental methods, credentialing pathways — the Curie approach is correct: accumulate undeniable evidence within the field's own framework until the refusal to recognize it becomes the anomaly. When the field does not yet have evaluation standards that cover the category of your contribution — when you are proposing something genuinely outside the current assessment framework — the Lovelace approach is correct: build internal logical rigor so tight that the next generation, with better tools, will not be able to dismiss it.",
      actionableInsight:
        "Before choosing between the proof-accumulation strategy and the vision-ahead strategy, map the evaluation infrastructure of the field you are entering. Does it have agreed-upon metrics for what you are building — customer acquisition costs, retention curves, margin profiles — that a sufficiently excellent outsider can satisfy? If yes, Curie's approach applies: produce results at a level of quality that makes exclusion publicly irrational for the incumbent. Out-execute them on their own metrics. If the field does not yet have agreed-upon metrics for your category — if you are building something genuinely new that existing evaluation frameworks cannot assess — then Lovelace's approach applies: build the internal logic of your product's value proposition so rigorously that when the market catches up to the category, your framework is already there. Write the specs for the court that will eventually convene.",
    },
  },
  {
    slug: "newton-vs-machiavelli-on-systems-vs-power",
    type: "collision",
    frameworkSlug: "isaac-newton",
    collisionFrameworkSlugs: ["isaac-newton", "niccolo-machiavelli"],
    title: "Newton vs. Machiavelli: Do You Build Durable Systems or Master the Exercise of Power?",
    description:
      "Isaac Newton's theory of how the world works is fundamentally systemic: identify the underlying laws, build models that predict outcomes with precision, and the system itself does the work of compounding over time. Niccolò Machiavelli's theory is fundamentally political: power is fluid, alliances shift, and the actor who understands how to accumulate and exercise influence in real time will outperform the actor who relies on systems that operate on slower timescales. For founders deciding how to allocate their scarce attention between building organizational and technical systems versus managing the political dynamics of investors, boards, and competitors, this collision determines when each approach is the higher-leverage investment.",
    targetKeywords: [
      "building systems vs political power leadership",
      "founder board management vs operational excellence",
      "Newton Machiavelli organizational strategy",
      "when to build systems vs manage stakeholders",
      "organizational architecture vs political capital",
    ],
    decisionType: "strategy",
    hookQuestion:
      "Should you spend your energy building systems that compound automatically — or mastering the political dynamics that determine whether your systems are ever allowed to run?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "The system that correctly models the underlying mechanism will produce accurate predictions regardless of who is operating it. The political skill of the operator is irrelevant if the system is right. I spent my attention on identifying the laws — the mathematical relationships between mass, force, and motion — because I understood that a correct model operates identically for a politically skilled physicist and a politically naive one. Build the system correctly. The predictions will follow.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "Newton describes a universe where the laws are stable and the actors who operate within them are interchangeable. Human organizations are the opposite. The laws of political dynamics are not stable — they shift with every change in personnel, resource availability, and external threat. The founder who builds a perfect operational system and ignores the political dynamics of their board will find their system dismantled by the board before it can demonstrate its predictions. The system is only allowed to run if the political environment permits it. That permission requires active management.",
      },
      {
        speaker: "Isaac Newton",
        text: "You are identifying a real constraint, but mislocating the solution. The political environment is itself a system — one with underlying laws that govern how alliances form, how loyalty is earned, and how power shifts. The correct response is not to manage the surface dynamics moment to moment. It is to understand the laws that govern the political system and build an organizational structure that exploits those laws consistently. A founder who correctly models the political system will not need to manage it constantly. The system will manage itself.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "The political system cannot be modeled with the precision of celestial mechanics, because it is composed of actors who modify their behavior in response to the model. When you publish the law of gravity, the planets do not change their orbits to confound the prediction. When you develop a theory of political dynamics and act on it publicly, the actors you are theorizing about observe your theory and adjust. The political system is reflexive in a way that physical systems are not. That is why it requires ongoing active management rather than a one-time investment in a correct model.",
      },
      {
        speaker: "Isaac Newton",
        text: "Then we have identified the domain where each approach applies. In domains where the underlying mechanism is stable — technical architecture, operational process, financial modeling — the systemic approach is correct. Build the model, encode it in the system, and let the system compound. In domains where the underlying mechanism is reflexive — where the actors change their behavior in response to observation — the systemic approach degrades, and Machiavelli's ongoing management approach becomes necessary.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "That is a more precise statement than I expected from a physicist. I will add one practical constraint: the reflexive domain is also the domain where the most urgent decisions live. Technical architecture decisions can be made on the timescale of a quarter. Political decisions — board dynamics, investor relations, key-hire negotiations — operate on timescales where delay is itself a choice with consequences. The founder who defers political management because they prefer systemic thinking will find that the political environment has made choices in their absence. Attend to the reflexive domain in real time. Build your systems on a slower clock.",
      },
    ],
    conclusion: {
      frameworkSlug: "isaac-newton",
      summary:
        "Newton and Machiavelli converge on a domain-structure diagnostic. In domains where the underlying mechanism is stable and actors do not modify their behavior in response to being modeled — technical architecture, operational process, financial structure — Newton's systemic approach is correct: invest in understanding the mechanism, build the model, and let it compound. In domains where the mechanism is reflexive — where actors observe your strategy and adjust — Machiavelli's ongoing management approach is necessary: the political environment requires active tending because it changes in response to being theorized about.",
      actionableInsight:
        "Audit your current attention allocation against a simple domain test. For each area where you are spending significant time, ask: does the underlying mechanism change when the actors observe my approach? Technical systems, operational processes, and financial models are generally non-reflexive — build them once correctly and they compound. Board dynamics, investor relations, competitor responses, and key-hire negotiations are generally reflexive — the actors adjust when they perceive your strategy. Shift your systemic investment toward the non-reflexive domains, where one correct model compounds indefinitely. Shift your active management attention toward the reflexive domains, where ongoing tending is required because the environment changes faster than any model can track. The error is applying systemic thinking to reflexive domains — or active management to non-reflexive ones.",
    },
  },
  {
    slug: "rockefeller-vs-napoleon-on-monopoly-vs-conquest",
    type: "collision",
    frameworkSlug: "john-d-rockefeller",
    collisionFrameworkSlugs: ["john-d-rockefeller", "napoleon-bonaparte"],
    title: "Rockefeller vs. Napoleon: Do You Win by Controlling the Infrastructure or by Moving Faster Than Anyone Can Follow?",
    description:
      "John D. Rockefeller's competitive strategy was fundamentally infrastructural: build or acquire control over the assets your competitors must use, then set the terms under which they operate. Napoleon's strategy was fundamentally kinetic: move faster than your opponents can respond, achieve objectives before they can assemble a coordinated defense, and repeat before the coalition can recover. Both produced historically dominant positions. But the mechanisms are genuinely incompatible — one requires patience and capital accumulation, the other requires speed and operational tempo — and the choice between them has direct consequences for how founders should allocate their limited resources in competitive markets.",
    targetKeywords: [
      "infrastructure control vs speed competitive strategy",
      "monopoly strategy vs first-mover speed startup",
      "Rockefeller Napoleon competitive advantage",
      "building moat vs moving fast startup",
      "capital accumulation vs execution velocity",
    ],
    decisionType: "scaling",
    hookQuestion:
      "Is your competitive advantage built by controlling the infrastructure everyone else must use — or by executing so fast that competitors cannot assemble a response before you have already moved on?",
    publishedAt: "2026-05-21",
    agonExcerpt: [
      {
        speaker: "John D. Rockefeller",
        text: "Speed produces a temporary advantage. The competitor who cannot match your speed today will eventually match it, or find a partner who can. Infrastructure produces a structural advantage: the competitor who cannot avoid using your distribution network, your processing capacity, or your capital relationships must pay your terms regardless of how fast they move. I was not racing competitors — I was making the race irrelevant by building the road all competitors must use. That is a different category of competitive position.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Rockefeller describes a strategy for the actor who has the capital and the time to build infrastructure before the competitive window closes. My campaigns were conducted under the opposite constraint: the coalition of opponents I faced had more capital, more territory, and more time than I did. Speed was not an option I selected — it was the only asymmetric advantage available to a French army that could not outspend or out-wait the combined resources of Austria, Prussia, Russia, and Britain. When you cannot outbuild the opponent's infrastructure, you must move faster than they can coordinate.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Napoleon is describing the correct strategy when the opponent's infrastructure is already built and you lack the capital to replicate or acquire it. But that constraint is itself the product of a prior strategic failure: the failure to begin the infrastructure accumulation before the competitive window closed. In Cleveland in the 1860s, before the railroad rebate structure was consolidated, a well-capitalized actor could have built the infrastructure that Standard Oil built. The actors who instead chose speed — moving faster, opening more wells, refining more barrels — produced volume that had nowhere to go efficiently. Speed in a capital-intensive industry without infrastructure is an expensive way to lose.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "And infrastructure in a rapidly changing competitive environment is an expensive way to own assets that are suddenly obsolete. The railroad network that supported Standard Oil was stable for decades. The coalitions I faced were not. An infrastructure-heavy response to a military coalition that could reposition in weeks would have resulted in perfect fortifications defending the wrong positions. Speed let me attack the coalition's weakest point before the strongest units could reinforce it. Infrastructure would have required me to predict, in advance, where the attack should come — which is exactly what the speed strategy is designed to make unnecessary.",
      },
      {
        speaker: "John D. Rockefeller",
        text: "Then the variable is the stability of the competitive landscape. In a stable market — one where the key assets and distribution channels are fixed and the primary source of competitive advantage is control over those assets — the infrastructure approach produces durable structural advantage. In a rapidly shifting competitive environment — one where the terrain itself is changing faster than infrastructure can be built — Napoleon's speed-based approach is correct. The error is not choosing between the two approaches. The error is applying the infrastructure approach to an unstable market, or the speed approach to a stable one where a patient accumulator will simply build around you.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "One final constraint that Rockefeller's model omits: the infrastructure approach requires the opponent to remain cooperative long enough for you to build. Standard Oil's pipeline network succeeded in part because the actors Rockefeller was outmaneuvering did not understand what was being built until it was too late to respond. When the opponent understands the infrastructure play and has the resources to build competing infrastructure, the structural advantage evaporates before it is complete. Speed produces a committed outcome — a battle is won or lost — that the opponent cannot reopen once the position is established. Infrastructure in a market where sophisticated opponents understand what you are building is a race to completion that you may not win.",
      },
    ],
    conclusion: {
      frameworkSlug: "john-d-rockefeller",
      summary:
        "Rockefeller and Napoleon converge on a market-stability diagnostic. In stable markets where the key assets and distribution channels are fixed, and where competitors will not understand the infrastructure play until it is too late to build competing infrastructure — Rockefeller's approach is correct: accumulate control of the assets all competitors must use, then set the terms. In rapidly shifting markets where terrain changes faster than infrastructure can be built, or where sophisticated competitors will recognize and respond to the infrastructure play before it is complete — Napoleon's speed-based approach is correct: move faster than the opponent can coordinate a response, achieve committed outcomes, and repeat before the coalition recovers.",
      actionableInsight:
        "Before deciding between an infrastructure-accumulation strategy and a speed-execution strategy, run two tests. First: how stable is the competitive landscape? If the key distribution channels, data assets, or network relationships in your market will be materially the same in three years as they are today, the infrastructure approach is available — but only if you begin accumulation before competitors understand what you are building. Second: how sophisticated are your primary competitors? If they will recognize an infrastructure play and have the resources to build competing infrastructure, Rockefeller's advantage evaporates in the construction phase. In that case, Napoleon's approach is more reliable: execute faster than they can respond, win committed positions — customers, partnerships, data — that are structurally difficult to reverse, and move on before the response organizes. The infrastructure play requires both a stable landscape and a sufficient window of competitive blindness to reach completion.",
    },
  },
  // ── Wave 21: collision articles ───────────────────────────────────────
  {
    slug: "edison-vs-franklin-on-iteration-vs-system-building",
    type: "collision",
    frameworkSlug: "thomas-edison",
    collisionFrameworkSlugs: ["thomas-edison", "benjamin-franklin"],
    title: "Edison vs. Franklin: Do You Find the Answer Through Rapid Iteration or Systematic First Principles?",
    description:
      "Thomas Edison's method was relentless empirical iteration: run thousands of experiments, fail fast, extract the one result that works, and move on. Benjamin Franklin's method was systematic: observe a phenomenon carefully, form a precise hypothesis, design a controlled test, and reason from the result to a general principle. Both produced transformative innovations — but through genuinely incompatible mechanisms. The choice between them determines not just how a founder builds a product, but how they allocate engineering time, structure their experiments, and decide when they have enough information to commit.",
    targetKeywords: [
      "rapid iteration vs systematic research founder",
      "Thomas Edison Benjamin Franklin innovation method",
      "trial and error vs first principles thinking",
      "how to validate startup ideas fast vs thorough",
      "build fast vs build right startup decision",
    ],
    decisionType: "iteration",
    hookQuestion:
      "When you don't yet know what works, do you run a thousand fast experiments until one succeeds — or slow down, form a precise hypothesis, and reason from first principles before you build anything?",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Thomas Edison",
        text: "I found ten thousand ways that would not work before I found one that would. That is not a failure rate — it is an information rate. Each failed experiment told me exactly one thing: that path is closed. The next experiment opened a different path. The speed of iteration is the speed of learning. Slow down the experiment rate and you slow down the learning rate. The hypothesis that sounds elegant in advance is just an experiment that has not yet been tested — and untested hypotheses do not ship.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "Edison describes a method that works when the cost of a failed experiment is low and the number of possible solutions is finite. My work on electricity operated under different constraints: a failed hypothesis about the nature of lightning could have ended the inquiry — and the experimenter. The systematic approach is not slower iteration. It is more information per experiment. A carefully framed hypothesis that distinguishes between two competing explanations eliminates entire classes of alternatives in a single test. Ten thousand experiments that vary randomly through the search space will reach the correct answer after the correct answer, while a well-framed series of ten experiments will reach it before.",
      },
      {
        speaker: "Thomas Edison",
        text: "You are describing an idealized version of hypothesis-driven research that assumes you know enough in advance to frame the right hypothesis. My early work on the incandescent bulb disproved the hypotheses of every physicist who had studied the problem before me. The problem was not that their hypotheses were wrong — it was that the problem space was not yet well-understood enough to frame the right hypotheses. I iterated my way to an understanding of the problem that made better hypotheses possible. The systematic method requires a level of domain knowledge that iteration is often the fastest way to acquire.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "I will grant that point with one qualification: the domain knowledge required to frame a useful hypothesis can itself be acquired through careful observation rather than random experiment. What I observed about Leyden jars and lightning rods was not the result of running thousands of random tests — it was the result of watching natural phenomena carefully, forming precise questions about what I was seeing, and designing tests that distinguished between competing explanations of the same observation. Careful observation is not the same as random iteration. It is iteration with a much higher signal-to-noise ratio.",
      },
      {
        speaker: "Thomas Edison",
        text: "Then the disagreement narrows to a question of signal-to-noise in the experiment. My method had high noise by design: I was searching a space I did not yet understand, and noise was the only honest representation of my uncertainty. Your method had lower noise because you were working in a domain where careful observation had already narrowed the search space significantly. The method should match the state of domain knowledge. In a genuinely novel domain — where no one has yet mapped the terrain — iteration produces understanding faster than hypothesis. In a domain with established foundations, hypothesis-driven testing is more efficient.",
      },
      {
        speaker: "Benjamin Franklin",
        text: "That is the most precise statement of the trade-off I have heard. I would add one practical constraint: the cost structure of failure matters as much as the state of domain knowledge. My lightning-rod experiments could not be run iteratively — each test involved real lightning and real structures. The consequence of an incorrect hypothesis was not a learning experience; it was a catastrophe. Iteration is the correct method when the cost of failure is low, the search space is genuinely unmapped, and the domain has no established foundations to reason from. Systematic hypothesis-testing is correct when failure is expensive, the domain has at least partial theoretical foundations, and a well-framed question can eliminate entire families of wrong answers in a single experiment.",
      },
    ],
    conclusion: {
      frameworkSlug: "thomas-edison",
      summary:
        "Edison and Franklin converge on a domain-and-cost diagnostic. Rapid iteration is correct when: the domain is genuinely novel with no established theoretical foundations; the cost of a failed experiment is low; and the search space is large enough that no a priori hypothesis is likely to be well-framed. Systematic hypothesis-driven research is correct when: the domain has established theoretical foundations that constrain the search space; the cost of failure is high enough that each experiment must carry maximum information; and careful prior observation can produce a hypothesis that eliminates entire families of wrong answers in a single test.",
      actionableInsight:
        "Before choosing between rapid iteration and systematic hypothesis-testing for your next product or technical decision, run two diagnostic questions. First: how mapped is the domain? If you are building in a space where established frameworks exist — user research methods, pricing theory, distribution channel dynamics — hypothesis-driven testing will reach the correct answer faster than random iteration. If you are in genuinely unmapped territory — a new category, an untested customer segment, a novel technical architecture — iteration is the only honest representation of your uncertainty. Second: what is the cost of a failed experiment? If each test is cheap and reversible — an A/B test, a landing page, a prototype — Edison's method maximizes learning velocity. If each test is expensive or irreversible — a major infrastructure bet, a go-to-market commitment, a key hire — Franklin's method extracts more information per experiment and reduces the total cost of finding the correct answer.",
    },
  },
  {
    slug: "caesar-vs-alexander-on-empire-building-speed",
    type: "collision",
    frameworkSlug: "julius-caesar",
    collisionFrameworkSlugs: ["julius-caesar", "alexander-the-great"],
    title: "Caesar vs. Alexander: Do You Win by Rapid Conquest or by Deep Consolidation?",
    description:
      "Julius Caesar and Alexander the Great were both extraordinary military and political strategists — but their approaches to expansion were diametrically opposed. Alexander prioritized speed of conquest: move faster than resistance can organize, take territory before its defenders can coordinate, and deal with integration later. Caesar prioritized integration alongside conquest: do not hold a position until you can administer it, build loyalty in the territories you take, and ensure each advance is defensible before committing to the next. Both strategies produced historically dominant empires — and both eventually failed. For founders deciding how fast to expand into new markets, customer segments, or geographies, this collision diagnoses when speed of acquisition creates compounding advantage versus when it creates compounding fragility.",
    targetKeywords: [
      "startup expansion speed vs consolidation strategy",
      "Julius Caesar Alexander the Great empire strategy",
      "land grab vs deep integration startup growth",
      "rapid scaling vs sustainable growth startup",
      "when to expand fast vs when to consolidate",
    ],
    decisionType: "scaling",
    hookQuestion:
      "When you are winning, do you push faster — acquiring territory before resistance can organize — or do you stop and consolidate what you have until each position is genuinely defensible?",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Julius Caesar",
        text: "The speed of a campaign is determined by the speed of the supply line. I did not advance faster than I could feed the army and administer the territory behind me. The Gallic campaigns took eight years because each season's advance was only as large as the logistical capacity I had built during the previous winter. Speed without logistics is a raid, not a conquest. You take the territory, but you cannot hold it. The local power you displaced will reorganize the moment your column moves on. The appearance of rapid conquest conceals the slower work of building administrative and supply capacity that actually makes the conquest permanent.",
      },
      {
        speaker: "Alexander the Great",
        text: "Caesar describes his approach accurately, but misidentifies the constraint. In Gaul, the terrain and the political structure of the tribes allowed for the patient, logistical approach he describes. My campaign against Persia operated under a different constraint: the Persian Empire had more manpower, more wealth, and more logistical depth than Macedonia. A patient campaign would have allowed the Persians to mobilize resources that would have overwhelmed my force within two campaigning seasons. Speed was not a style preference — it was the only asymmetric advantage available to a smaller force attacking a larger one. I had to win before they could concentrate.",
      },
      {
        speaker: "Julius Caesar",
        text: "Alexander is describing the correct strategy for defeating a larger force in open battle. He is not describing a strategy for holding what he won. The collapse of his empire within a decade of his death was not a failure of his generalship — it was the predictable consequence of conquest faster than administrative integration. The territories he took did not become Macedonian; they remained Persian, Babylonian, and Egyptian with a Macedonian general in nominal command. When the general died, there was nothing underneath the military occupation to hold the structure together. Permanent acquisition requires that the territory be genuinely integrated — economically, administratively, and culturally — before you move to the next target.",
      },
      {
        speaker: "Alexander the Great",
        text: "The empire survived for three centuries under the Diadochi — the successor states that divided my conquests. That is not collapse; it is reorganization. The speed of the original conquest created the territory that the successors then administered. Without the speed, there would have been no territory for anyone to consolidate. Caesar's approach produces more durable individual provinces — but only because he never tested whether it could produce an empire at the scale and speed that the strategic situation required. A patient conqueror who loses to a faster opponent before they can consolidate has not demonstrated the superiority of patience. They have demonstrated its cost.",
      },
      {
        speaker: "Julius Caesar",
        text: "The Diadochi inherited territories they spent the next three centuries fighting each other to control. The fragmentation was not incidental to the speed of acquisition — it was caused by it. When each province is taken faster than it can be integrated, the only available administrative mechanism is military occupation. Military occupation is not governance; it is temporary suppression. The moment the suppressing force is divided or distracted — as happened at Alexander's death — the suppressed structures reassert themselves. The three centuries of Diadochi conflict represent the administrative deficit that was created by the speed of the original conquest. My Gallic provinces remained Roman provinces for four centuries after my death because the administrative integration was done before the military advance moved on.",
      },
      {
        speaker: "Alexander the Great",
        text: "Then the honest statement of the trade-off is this: my approach maximizes the territory available for eventual consolidation, at the cost of the quality of initial integration. Caesar's approach maximizes the durability of each piece of territory taken, at the cost of total territory achievable against a well-resourced opponent. The choice between them is determined by the competitive situation. Against an opponent with greater aggregate resources who can outlast a patient campaign — move at Alexander's speed. Against opponents with local strength who can reassert control if not genuinely integrated — move at Caesar's speed. The error is applying Alexander's strategy to a situation that requires Caesar's, or Caesar's to a situation that requires Alexander's.",
      },
    ],
    conclusion: {
      frameworkSlug: "julius-caesar",
      summary:
        "Caesar and Alexander converge on a competitive-situation diagnostic. Against opponents with greater aggregate resources who can mobilize overwhelming force if given time — Alexander's speed-first approach is correct: move faster than they can concentrate, achieve committed positions before the response organizes, and deal with integration after the strategic window is captured. Against opponents with strong local roots who will reassert control if not genuinely integrated — Caesar's consolidation-first approach is correct: do not advance past the defensible perimeter, build administrative depth in each territory before committing to the next, and accept the slower pace as the cost of durable acquisition.",
      actionableInsight:
        "Before deciding your expansion pace, run a competitive-resource diagnostic. If your primary competitors have greater aggregate resources — larger teams, more capital, broader distribution — than you do in each contested market, Alexander's approach applies: capture territory faster than they can concentrate their advantages. The first-mover position in each market segment is more valuable than deep integration of any single one, because the opponent's resource advantage compounds over time if you give them time. If your primary competitors have strong local roots — existing customer relationships, brand recognition, regulatory position — that will reassert themselves once your initial energy dissipates, Caesar's approach applies: do not advance past the line you can genuinely defend. Each position must be integrated before you move to the next, because a customer acquired without genuine lock-in is a customer who will churn the moment the local incumbent offers a competitive alternative. The failure mode of Alexander's approach is fragmentation at the moment of stress. The failure mode of Caesar's approach is being outflanked by a faster competitor who captures the strategic territory while you are consolidating your current position.",
    },
  },
  {
    slug: "epictetus-vs-seneca-on-accepting-vs-transforming-constraints",
    type: "collision",
    frameworkSlug: "epictetus",
    collisionFrameworkSlugs: ["epictetus", "seneca"],
    title: "Epictetus vs. Seneca: Do You Accept Constraints as Fixed — or Reshape Them?",
    description:
      "Epictetus and Seneca were both Stoic philosophers — but they drew opposite practical conclusions from the same framework. Epictetus, who had been a slave, believed the only rational response to constraints outside your control was radical acceptance: direct all energy toward your own judgments, responses, and character, and release all energy spent resisting what cannot be changed. Seneca, who was a wealthy advisor to emperors, believed that while external circumstances cannot always be controlled, they can often be reshaped through deliberate action, persuasion, and strategic patience. For founders navigating regulatory environments, market conditions, resource constraints, and difficult stakeholders, this collision determines when acceptance is wisdom and when it is resignation dressed as philosophy.",
    targetKeywords: [
      "stoic acceptance vs reshaping constraints founder",
      "Epictetus Seneca practical stoicism adversity",
      "accept what you cannot change vs create change",
      "founder mindset constraints obstacles startup",
      "when to pivot around obstacles vs push through",
    ],
    decisionType: "control",
    hookQuestion:
      "When you face a constraint that is genuinely limiting your progress, do you redirect your energy toward what you can control — or do you work to reshape the constraint itself?",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Epictetus",
        text: "The Stoic discipline of desire has a precise scope: it applies to everything outside the boundary of your own will. Your judgment, your response, your character — these are yours. The constraint placed on you by another person, a market condition, or a regulatory structure — these are not yours. The person who exhausts their energy attempting to reshape what is genuinely outside their control has not found a bolder strategy; they have found a more sophisticated form of suffering. The correct response to an external constraint is not to accept defeat — it is to redirect the full force of your agency toward what is actually yours to act on.",
      },
      {
        speaker: "Seneca",
        text: "Epictetus draws the boundary of control at the self, and I accept that boundary as the starting point. But he treats it as fixed when it is often moveable. During my years as Nero's advisor, I operated within constraints that appeared absolute from the outside — the emperor's moods, the court's politics, the legal structures of the empire. Many of those constraints yielded to sustained, patient, indirect pressure. Not all external circumstances are as fixed as they appear. The Stoic who surrenders to a constraint without first testing whether it is genuinely immovable has not demonstrated wisdom — they have demonstrated insufficient effort.",
      },
      {
        speaker: "Epictetus",
        text: "Seneca describes a real phenomenon: constraints that appear fixed are sometimes moveable. But he does not describe the cost of discovering that a constraint is actually fixed after you have exhausted yourself attempting to move it. I was a slave. The constraints on my life were not moveable through patience or persuasion. The Stoic discipline I developed was not resignation — it was the recognition that suffering directed at the genuinely unmoveable is not effort; it is waste. The question is not whether some constraints can be moved. It is how to distinguish, before you commit your energy, between the constraints that will yield and the constraints that will not.",
      },
      {
        speaker: "Seneca",
        text: "That is precisely the diagnostic problem. And I agree it is the central one. My answer is that the cost of testing whether a constraint is moveable is almost always lower than the cost of assuming it is fixed when it is not. A founder who accepts a regulatory constraint as permanent without testing it through lobbying, through a legal challenge, or through a product design that avoids the constraint's scope, has foreclosed options prematurely. The constraint may be genuinely fixed — in which case the Epictetan response is correct and the testing cost is small. Or it may be moveable — in which case the founder who tested it has captured an option that the founder who assumed permanence never had.",
      },
      {
        speaker: "Epictetus",
        text: "I accept the framing with one addition: the testing of whether a constraint is moveable is itself an action that must be evaluated through the Stoic lens. Test the constraint if testing it is the right use of your agency, given all other claims on your attention. Do not test it if the testing itself would crowd out higher-leverage uses of your will. The discipline of desire does not forbid action on the external world — it insists that such action be chosen deliberately, with clear eyes about what is actually within your power to change, rather than undertaken compulsively because the constraint is uncomfortable.",
      },
      {
        speaker: "Seneca",
        text: "Then we converge on a practical framework. Begin with Epictetus: identify what is genuinely within your control — your judgment, your response, your effort — and apply your full agency there regardless of the external constraint. Then apply my extension: before treating any specific external constraint as permanent, run the cheapest available test of its moveability. If it moves, act on the opening. If it does not, return to the Epictetan position with the additional confidence that you have tested the boundary honestly rather than assumed it. The failure mode is not accepting constraints — it is accepting constraints without testing whether they are actually as fixed as they appear.",
      },
    ],
    conclusion: {
      frameworkSlug: "epictetus",
      summary:
        "Epictetus and Seneca converge on a two-stage framework. First, apply the Epictetan discipline: identify what is genuinely within your control — your judgment, response, and effort — and direct your full agency there, regardless of the external constraint. Second, before treating any external constraint as permanent, apply Seneca's extension: run the cheapest available test of its moveability. If it yields to sustained, indirect pressure, act on the opening. If it does not, return to the Epictetan position with honest confirmation that the boundary is real. The failure mode Epictetus guards against is wasted energy on genuinely fixed constraints. The failure mode Seneca guards against is premature acceptance of constraints that are actually moveable.",
      actionableInsight:
        "When you encounter a constraint that is blocking your progress — a regulatory requirement, a market condition, a stakeholder resistance, a resource limitation — apply a two-step diagnostic before choosing your response. Step one (Epictetus): separate what is within your control from what is not. Your product decisions, your team's focus, your response to the constraint — these are always yours to act on, constraint or no constraint. Redirect your primary energy here. Do not wait for the constraint to resolve before acting on what you can control. Step two (Seneca): before treating the constraint as permanently fixed, identify the cheapest test of its moveability. Can you redesign the product to avoid the regulatory scope? Can you find a legal precedent that changes the interpretation? Can you demonstrate a data point that shifts the stakeholder's position? Run that test at low cost. If the constraint moves, you have captured an option. If it does not, you have confirmed the boundary honestly, and the Epictetan focus on your controllables is not resignation — it is the correct allocation of limited agency.",
    },
  },
  // ── Wave 22: collision articles ───────────────────────────────────────
  {
    slug: "lincoln-vs-napoleon-on-leading-through-crisis",
    type: "collision",
    frameworkSlug: "abraham-lincoln",
    collisionFrameworkSlugs: ["abraham-lincoln", "napoleon-bonaparte"],
    title:
      "Lincoln vs. Napoleon: When a Crisis Demands Steadiness and When It Demands Force",
    description:
      "Abraham Lincoln and Napoleon Bonaparte both led through existential crises — Lincoln held a fractured nation together during a civil war fought over its founding contradiction, and Napoleon led armies through campaigns where a single battle could reverse years of strategic gain. But their crisis leadership models were opposites. Lincoln's approach was characterized by radical patience: absorb the uncertainty, resist the pressure to foreclose options, hold the coalition together by giving dissenting voices a seat at the table, and wait for the moment when the political and military conditions align. Napoleon's approach was characterized by decisive velocity: identify the hinge point of the crisis, concentrate force there before the opponent can react, and accept the risk of being wrong in exchange for the asymmetric upside of being first. For founders facing company-defining crises — a cash runway emergency, a product failure, a key team departure, a competitive attack — this collision determines when Lincoln's patience is the correct response and when Napoleon's speed is.",
    targetKeywords: [
      "crisis leadership founder startup",
      "how to lead through company crisis",
      "Lincoln Napoleon crisis decision making",
      "wartime CEO leadership crisis management",
      "founder leadership style crisis uncertainty",
    ],
    decisionType: "crisis",
    hookQuestion:
      "When the crisis hits and the team is losing confidence, does the right move require steadiness and coalition-building — or concentrated force before the window closes?",
    publishedAt: "2026-05-15",
    agonExcerpt: [
      {
        speaker: "Abraham Lincoln",
        text: "A crisis that destroys a leader is almost never the external event. It is the decision to foreclose options before the situation requires it. When I entered office, seven states had already seceded and four more were on the edge. Every advisor I had urged a decisive response — a proclamation, a military strike, a political ultimatum that would clarify the stakes. I refused. Not because I lacked resolve, but because I understood that the coalition required to resolve the crisis could not survive the statement that seemed most decisive. The Emancipation Proclamation waited two years not because I was uncertain about its necessity but because the military and political conditions had to be in place before the proclamation could function as a weapon rather than a liability. Crisis leadership is the discipline of knowing which actions foreclose options and which actions preserve them.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Lincoln's approach was appropriate for a political crisis in which the primary resource is public support. Mine were operational crises in which the primary resource is initiative. At Austerlitz, I had separated the allied command by sending a feint toward my right flank, tempting them to reinforce a position that was not my actual objective. The window for the attack through their weakened center was measured in hours. A Lincoln-style patience in that moment would have allowed Kutuzov to recognize his mistake and close the gap. There are crises in which the key insight is that your opponent has made an error they cannot yet see — and your job is to move before they see it. The decisive error is not moving too fast; it is moving at normal speed in a moment that required a different tempo.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "I agree on the diagnosis — the question is how a founder distinguishes between a crisis that requires Napoleon's tempo and a crisis that requires mine. My observation is that Napoleon's model fails when the crisis is not a single battle but a long campaign. The Civil War was not Austerlitz. There was no two-hour window and no single flanking maneuver that would resolve it. The error I saw in my generals repeatedly — McClellan most visibly — was treating a long-campaign crisis with short-battle tactics: moving decisively when the situation required patience, and then explaining each failure as a temporary setback rather than evidence that the tempo itself was wrong. A founder who applies Napoleon's model to a crisis that requires sustained coalition management will win individual battles and lose the campaign.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "Lincoln identifies the correct failure mode for my approach. The campaign frame changes the calculation. But I want to name the failure mode that runs in the opposite direction: the leader who defaults to patience as a cover for indecision, and calls it coalition management. I lost the 1812 campaign in Russia not because I moved too fast — I moved at exactly the speed the operation required through France and into Poland. I lost it because when the strategic situation changed — when Moscow did not produce the political capitulation I expected — I could not revise the objective fast enough. The failure was not impatience. It was the opposite: I held to the original frame when the evidence required a new one. In a crisis, patience and decisiveness are not stable personality traits; they are decisions that need to be re-evaluated each time the signal changes.",
      },
      {
        speaker: "Abraham Lincoln",
        text: "Then we converge on the diagnostic framework. The question is not whether you are a patient leader or a decisive one. The question is: what does the structure of this specific crisis require? The relevant variables are the time-sensitivity of the key decision (which determines how much patience is available), the coalition fragility (which determines how much force can be applied without fracturing the support structure), and the reversibility of the available moves (which determines how much optionality it is worth preserving). A crisis that is time-sensitive, coalition-stable, and irreversible calls for Napoleon's tempo. A crisis that is time-extended, coalition-fragile, and partially reversible calls for mine. Most founders will face more of the second category than the first, which is why Lincoln's model is underweighted in startup culture and Napoleon's is overweighted.",
      },
      {
        speaker: "Napoleon Bonaparte",
        text: "I accept the framework with one addition: even in Lincoln's category of crisis, there will be moments inside the long campaign where a Napoleon-style window opens. The Emancipation Proclamation, which Lincoln described as having waited for the right military and political conditions, was itself a decisive move at a specific moment. The discipline Lincoln describes — preserving options, building coalitions, refusing to foreclose — was the preparation for that decisive moment, not an alternative to it. The worst crisis leadership combines Lincoln's patience with none of my decisiveness: the leader who preserves all options indefinitely and never exercises the ones that became available. Coalition-building is preparation for a decision, not a substitute for one.",
      },
    ],
    conclusion: {
      frameworkSlug: "abraham-lincoln",
      summary:
        "Lincoln and Napoleon converge on a two-variable diagnostic. The first variable is time structure: is this a short-window crisis where an opponent's error is temporarily exploitable (Napoleon's domain) or a long-campaign crisis where the primary constraint is coalition stability over time (Lincoln's domain)? The second variable is decision reversibility: moves that foreclose future options require the conditions to be more fully developed before execution; moves that can be revised or expanded on subsequent iterations can be made earlier. Most company-level crises combine Lincoln's time structure with occasional Napoleon-style windows inside them. The failure modes are symmetric: applying Napoleon's tempo to a long-campaign crisis produces a series of individually decisive moves that collectively fragment the coalition; applying Lincoln's patience to a short-window crisis allows the exploitable moment to close.",
      actionableInsight:
        "When a crisis hits your company, run this diagnostic before choosing a response tempo. First, determine the time structure: does a decisive action now capture a window that will close within days, or is this a multi-month situation where the primary resource is team coherence and stakeholder trust? If it is a short-window situation (a competitor is vulnerable, a deal is time-limited, a narrative can be shaped before it solidifies), move at Napoleon's tempo — concentrate force on the hinge point before it closes. If it is a long-campaign situation (cash runway, product-market fit, team culture fractures), move at Lincoln's tempo — preserve coalitions, maintain optionality, and wait for the conditions that make each decision reversible enough to act on. In both cases, avoid the symmetric failure modes: Napoleon's patience failure (holding the original frame after the evidence requires a new one) and Lincoln's decisiveness failure (building toward a decision indefinitely and never executing it when the window opens).",
    },
  },
  {
    slug: "nightingale-vs-curie-on-field-evidence-vs-theoretical-proof",
    type: "collision",
    frameworkSlug: "florence-nightingale",
    collisionFrameworkSlugs: ["florence-nightingale", "marie-curie"],
    title:
      "Nightingale vs. Curie: Do You Act on Field Data — or Wait for Controlled Proof?",
    description:
      "Florence Nightingale and Marie Curie were both rigorous empiricists who fundamentally changed their fields through evidence-based reasoning — but their evidence models were opposites. Nightingale operated in a field environment where she could not control variables, could not run controlled experiments, and could not wait for academic validation: soldiers were dying at a rate that would empty the hospital faster than any treatment could refill it. She acted on field observations, statistical patterns in messy data, and probability estimates derived from conditions she could not fully isolate. Curie operated in a laboratory environment built specifically to isolate variables, eliminate confounds, and produce findings that could be replicated anywhere in the world by anyone with the right equipment. The radioactivity research she and Pierre produced was built on the premise that a result that cannot be replicated under controlled conditions is not a result. For founders deciding when to act on product feedback, market signals, and early customer data versus when to insist on controlled experiments before committing to a direction, this collision defines the conditions under which each evidence standard is appropriate.",
    targetKeywords: [
      "field evidence vs controlled experiment decision making startup",
      "when to act on customer data vs wait for proof",
      "Florence Nightingale Marie Curie empirical evidence",
      "product feedback vs A/B test startup",
      "messy field data vs clean experiment business decision",
    ],
    decisionType: "evidence",
    hookQuestion:
      "Your early data is pointing in a clear direction — but you cannot be certain the signal is real because the conditions are noisy. Do you act on what the field data is telling you, or do you design a controlled test first?",
    publishedAt: "2026-05-15",
    agonExcerpt: [
      {
        speaker: "Florence Nightingale",
        text: "In the Crimea, I could not run a controlled trial. The mortality rate in the Barrack Hospital was above 40 percent during the winter of 1854-55, and the army's medical establishment had a theory for it: the men were weak from the campaign. My statistical analysis of the admission and death records showed a different pattern. The deaths were not distributed across disease categories in the way they would be if the cause were individual weakness — they were concentrated in infectious disease categories that responded to sanitation interventions in hospitals where those interventions had been tried. I could not isolate the variable perfectly. I could not build a randomized trial. What I had was a pattern in messy data that was strong enough to act on despite the confounds. The sanitation changes saved thousands of lives before any controlled study validated the mechanism. The standard of evidence required to act is determined by the cost of waiting, not by the elegance of the experimental design.",
      },
      {
        speaker: "Marie Curie",
        text: "I understand the cost-of-waiting argument, and I accept it in emergency conditions. But Nightingale's model has a failure mode that is invisible from inside the field data. In 1903, I had isolated polonium and radium — two new elements with measurable radioactive properties. The scientific community's first response was to question whether the measurements were instrument error, contamination, or observer bias. The validation required that Pierre and I reproduce the results under controlled conditions that any competent laboratory could replicate. Without that validation, the discovery would not have changed physics — it would have been a disputed observation. The field evidence model does not produce the kind of proof that changes structural understanding. It produces actions. For decisions about what to do right now, Nightingale's standard is appropriate. For decisions about whether the underlying model is correct, mine is required.",
      },
      {
        speaker: "Florence Nightingale",
        text: "The distinction Curie is drawing — between operational decisions and structural model validation — is real and important. My objection is to the default assumption that laboratory-grade evidence is always achievable and always worth waiting for before acting. In the business and policy contexts where most decisions are made, the equivalent of a controlled laboratory rarely exists: the market is the field, not the lab. An investor who withholds funding until a startup produces laboratory-grade proof of demand will never fund anything at the seed stage, because that proof cannot be produced before the market exists. The question is not whether controlled evidence is better than field evidence in isolation — it obviously is — but whether controlled evidence is achievable at the decision point, and whether the cost of waiting for it is lower than the cost of acting on a less perfect signal.",
      },
      {
        speaker: "Marie Curie",
        text: "Nightingale's point about availability is correct. My response is that the demand for controlled evidence should raise the standard for field evidence rather than eliminate it. The failure mode I see in field evidence reasoning is the confusion of pattern with cause. Nightingale's sanitation intervention worked — but not because the data pattern was causal. It worked because the underlying mechanism was real, and the pattern happened to track it reasonably well in her specific field conditions. In many cases, field data patterns do not track the underlying mechanism. They track confounds — customer segments that happen to have higher baseline retention, markets that happen to have favorable macro conditions, product features that happen to be adopted by users who would have stayed anyway. Acting on those patterns as if they were causal is the failure mode of field evidence reasoning. Before you act on field data, you need a causal hypothesis that is at least plausible — not proven, but mechanically coherent.",
      },
      {
        speaker: "Florence Nightingale",
        text: "The causal hypothesis requirement is the convergence point. I did not simply act on the death-rate pattern without a theory. I had a mechanistic hypothesis — that the specific disease categories causing deaths in the Barrack Hospital were transmitted by conditions that sanitation interventions addressed. The hypothesis was not proven at the level Curie would require. But it was coherent, it had antecedent support from studies in other hospitals, and it predicted the specific effect I observed. The decision framework is: field evidence is actionable when you have a mechanically coherent causal hypothesis, the pattern in the field data is consistent with that hypothesis, the confounds that could explain the pattern without the hypothesis being true have been considered and found less likely, and the cost of waiting for controlled validation exceeds the cost of acting on a potentially wrong model. All four conditions were met in the Crimea. The third and fourth are the ones most often not evaluated.",
      },
      {
        speaker: "Marie Curie",
        text: "I will accept that framework as a practical standard. My addition is on the fourth condition — the cost comparison. The cost of acting on a wrong model is often underestimated in startup contexts because the actions taken on field evidence compound. A company that acts on a wrong causal model for long enough builds an organization, a product, and a cost structure optimized for a market that does not actually exist. The sunk cost of those investments makes it harder to revise the model when the controlled evidence eventually arrives or when the field evidence contradicts itself. The discipline of building checkpoints — moments where the field-evidence hypothesis is tested against new data — is what makes the Nightingale model safe to use over extended timeframes. Act on the field evidence, but set explicit conditions under which you will update or abandon the hypothesis.",
      },
    ],
    conclusion: {
      frameworkSlug: "florence-nightingale",
      summary:
        "Nightingale and Curie converge on a four-condition test for when field evidence is sufficient to act on without controlled validation. The conditions are: (1) a mechanically coherent causal hypothesis exists — not proven, but plausible given prior evidence; (2) the field data pattern is consistent with the hypothesis; (3) the most likely confounds that could explain the pattern without the hypothesis being true have been considered and found less likely than the hypothesis; (4) the cost of waiting for controlled validation exceeds the cost of acting on a model that might be wrong. When all four conditions are met, Nightingale's field-evidence standard is actionable. When controlled experiments are available and the cost of waiting is low, Curie's laboratory standard is required. The failure modes are symmetric: Nightingale's failure mode is acting on patterns that are confound-driven rather than causal; Curie's failure mode is waiting for laboratory-grade proof in a field that cannot produce it, and thereby forfeiting options that a less perfect signal would have supported.",
      actionableInsight:
        "When you have early product feedback, market data, or customer signals that are pointing in a direction but are not clean enough to constitute controlled proof, run Nightingale's four-condition check before deciding whether to act. First: do you have a causal hypothesis that is mechanically coherent — not just a correlation, but a plausible explanation of why the mechanism produces the pattern? Second: is the field data pattern consistent with that hypothesis? Third: have you identified the most likely confounds — the explanations that could produce the same pattern without your hypothesis being true — and are those confounds less likely than your hypothesis? Fourth: is the cost of designing and waiting for a controlled test higher than the cost of acting on a model that might be wrong? If all four conditions pass, act on the field data. If you fail the third condition — if there is a confound you have not ruled out that is roughly as likely as your hypothesis — design a low-cost test that differentiates between them before committing. Set explicit checkpoints at which you will re-evaluate the hypothesis against new incoming data so you do not compound investments on a wrong model.",
    },
  },
  {
    slug: "jobs-vs-machiavelli-on-inspiring-fear-vs-inspiring-love",
    type: "collision",
    frameworkSlug: "steve-jobs",
    collisionFrameworkSlugs: ["steve-jobs", "niccolo-machiavelli"],
    title:
      "Jobs vs. Machiavelli: Should Founders Build Loyalty Through Love or Through Fear?",
    description:
      "Steve Jobs and Niccolò Machiavelli represent two of the most studied and most misunderstood positions on how leaders build lasting loyalty. Machiavelli's argument in The Prince is not that cruelty is desirable — it is that love and fear are both tools, and fear is the more durable one because it does not depend on conditions the leader cannot control. A person who loves you may stop loving you if circumstances change; a person who fears consequences will not change behavior until the consequences change. Jobs's argument, as expressed through three decades of building Apple, Pixar, and NeXT, is that mission-level belief produces a form of loyalty that neither love nor fear can reach: people who believe they are doing work that matters will outperform people who are merely devoted or merely compliant, because belief is internally motivated in a way that neither devotion nor compliance can replicate. For founders deciding how to shape the culture of their company — how much to invest in vision, in accountability, in personal relationship, in consequences — this collision defines when Machiavelli's realism about power is the correct guide and when Jobs's idealism about mission is justified.",
    targetKeywords: [
      "should founders be feared or loved by employees",
      "Steve Jobs leadership style inspiration vs fear",
      "Machiavelli is it better to be feared or loved leader",
      "how to build employee loyalty as a founder",
      "founder leadership style inspiration cult personality",
    ],
    decisionType: "leadership",
    hookQuestion:
      "Should founders inspire loyalty through love or through fear?",
    publishedAt: "2026-05-15",
    agonExcerpt: [
      {
        speaker: "Steve Jobs",
        text: "I never tried to make people fear me. What I tried to do was make them believe — genuinely believe — that the work we were doing mattered enough to demand the best they had. When I told a team that a product they had built was shit, I was not trying to generate fear of consequences. I was trying to break the frame in which 'good enough' was an acceptable answer. The fear that some people describe feeling around me was the fear of not living up to what the work required — and that is not a management instrument. It is the natural response to being in the presence of work that has a standard. If the work doesn't have a standard that creates some fear of failure, the work doesn't matter enough.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "Jobs is describing what I would call the ideal case of love-based loyalty — where the devotion attaches to the mission rather than the person, and the standard is enforced by belief rather than consequences. I do not dispute that this ideal exists or that it produces exceptional results when it is achieved. My concern is with the failure mode of the ideal. Jobs is also describing the mechanism of fear without acknowledging it as such: the fear of not living up to the work is still fear. The 'reality distortion field' that Jobs's colleagues described — the experience of being convinced that the impossible was achievable, and feeling the consequences of not achieving it — is not a description of love. It is a description of a particularly sophisticated form of accountability enforcement, where the standard is so high and the leader's belief in it so absolute that failure to meet it feels like a personal betrayal of something sacred.",
      },
      {
        speaker: "Steve Jobs",
        text: "The test of love versus fear as a leadership instrument is what happens after the leader leaves. An organization built on fear — on compliance with consequences enforced by a specific person — loses its coherence the moment the feared figure is gone. The enforcement mechanism disappears with the enforcer. An organization built on genuine belief in the mission can sustain that belief after the leader departs because the mission predates and outlasts any individual. When I was pushed out of Apple in 1985, the company did not hold. Not because the people stopped caring, but because the vision had not been distributed deeply enough into the organization to operate without me as its interpreter. That was my failure — not the approach, but the execution. The approach is still correct: if you build loyalty through mission, the mission can survive you. If you build loyalty through fear of you, nothing survives you.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "The 1985 example is instructive, but Jobs draws the wrong lesson from it. The problem at Apple in 1985 was not insufficient love of the mission. The problem was insufficient structure — the accountability mechanisms that Jobs had built were too personal, too dependent on his presence, too idiosyncratic to be reproduced by Sculley. This is a structural failure, not a failure of the love-versus-fear model. My recommendation for a prince who must be absent from his territories is precisely this: build institutions, not dependencies. The enforcement structure should operate regardless of whether the feared figure is present. A founder who builds that structure correctly — clear standards, clear consequences, clear processes for applying them — can be absent, depart, or be succeeded without the structure collapsing. Jobs failed to do this. He is correct that love of mission is more durable than fear of a person. But his model conflates love of mission with love of Jobs, and then uses the failure of the latter to argue against the reliability of Machiavellian structure.",
      },
      {
        speaker: "Steve Jobs",
        text: "The structural argument is correct, and I accept it as a convergence point. The question is not whether you want people to be devoted or disciplined — you want both. The question is the sequence and the priority. Fear-first leadership establishes compliance before it establishes vision. Vision-first leadership establishes mission before it establishes accountability. The failure mode of fear-first is that the compliance is real but the belief never arrives — you get an organization of people who follow the rules and have no idea why the rules matter. The failure mode of vision-first is that the belief is real but the accountability is inconsistent, because holding people to a standard feels like betraying the relationship. The resolution is that accountability is not in tension with mission — it is an expression of it. When I rejected work that didn't meet the standard, I was not punishing people. I was refusing to let the mission be betrayed by work that was below it.",
      },
      {
        speaker: "Niccolò Machiavelli",
        text: "Then we are closer than the framing of the question suggests. The practical recommendation I would offer a founder is this: establish the performance standard before you establish the personal relationship. The standard gives the relationship its content — devotion to what? loyalty to what purpose? — and makes the accountability structure legible as mission-defense rather than arbitrary authority. A founder who establishes the relationship first and the standard second will always find it harder to enforce the standard, because enforcement feels like a change in the relationship rather than a feature of it. Jobs's model works when the mission is clear enough that the standard is self-evident, and when the leader is present enough to interpret the standard continuously. Machiavelli's model works when the standard must operate in the leader's absence, or when the mission cannot yet be articulated clearly enough to carry the enforcement weight. Most organizations need both: Jobs's mission clarity to give the standard meaning, and Machiavelli's structural discipline to make the standard survive.",
      },
    ],
    conclusion: {
      frameworkSlug: "steve-jobs",
      summary:
        "Jobs and Machiavelli converge on a sequencing principle: establish the performance standard before the personal relationship, so that accountability is legible as mission-defense rather than arbitrary authority. The deeper convergence is that love and fear are not alternatives — they are instruments that operate at different organizational scales and time horizons. Jobs's model (mission-based devotion) is more durable than fear when it can be distributed through the organization deeply enough to operate without the leader as interpreter. Machiavelli's model (structured accountability) is more reliable when the mission is not yet clear enough to carry the enforcement weight, or when the leader must operate at scale or distance. The failure modes are symmetric: Jobs's failure mode is belief that never reaches accountability structure, producing an organization where vision is real but standards are inconsistently enforced. Machiavelli's failure mode is compliance that never reaches belief, producing an organization that follows rules and has no idea why the rules matter.",
      actionableInsight:
        "When building your founding team or early culture, apply this sequencing rule: establish the performance standard explicitly before you establish the personal relationship, so that when you enforce the standard, it reads as 'this is what we agreed the work requires' rather than 'I am changing the terms of our relationship.' Make the standard specific enough that people can evaluate their own work against it without asking you — this is the distributional test for whether your mission is clear enough to carry its own enforcement weight. Then test which model your current situation requires. If you are in an early-stage organization where the mission is still being defined and the team is small enough that you can be present as the standard-interpreter, Jobs's model is appropriate: invest in mission clarity first, and let accountability flow from it. If you are scaling, if you are managing people you cannot directly observe, or if the mission is not yet articulate enough to generate self-enforced standards, Machiavelli's model is required: build the accountability structure first, and make it legible as mission-service. The worst outcome is neither: an organization with warm relationships and no standards, where 'we believe in what we're doing' functions as a substitute for 'we are doing it well.'",
    },
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
  "what-would-marcus-aurelius-say-about-imposter-syndrome": [
    {
      label: "Duty over identity",
      source: (entry) => entry.hookQuestion,
      excerpt: "everyone is about to realize",
      constructIndex: 0,
    },
    {
      label: "Pre-commitment vs. real-time judgment",
      source: (entry) => entry.description,
      excerpt: "unworthy of his role",
      constructIndex: 1,
    },
  ],
  "first-principles-thinking-the-honest-version": [
    {
      label: "Challenge existing theory",
      source: (entry) => entry.hookQuestion,
      excerpt: "first principle",
      constructIndex: 2,
    },
    {
      label: "Reasoning vs. constraint",
      source: (entry) => entry.description,
      excerpt: "unfamiliar domains",
      constructIndex: 0,
    },
  ],
  // ── Batch 2 annotation blueprints (task bbb0c9bb) ─────────────────────
  "what-would-newton-say-about-rebuilding-from-first-principles": [
    {
      label: "Derived vs. inherited",
      source: (entry) => entry.hookQuestion,
      excerpt: "inheriting someone else's assumptions",
      constructIndex: 0,
    },
    {
      label: "Complete understanding",
      source: (entry) => entry.description,
      excerpt: "every calculation was verified",
      constructIndex: 1,
    },
  ],
  "what-would-tesla-say-about-shipping-vs-perfecting": [
    {
      label: "Technical superiority",
      source: (entry) => entry.hookQuestion,
      excerpt: "actually solves the problem",
      constructIndex: 0,
    },
    {
      label: "Mental simulation",
      source: (entry) => entry.description,
      excerpt: "mental simulations",
      constructIndex: 1,
    },
  ],
  "what-would-leonardo-say-about-creative-block": [
    {
      label: "Cross-domain boundary",
      source: (entry) => entry.hookQuestion,
      excerpt: "domain you are refusing to leave",
      constructIndex: 4,
    },
    {
      label: "Causal understanding",
      source: (entry) => entry.description,
      excerpt: "switch fields",
      constructIndex: 0,
    },
  ],
  "what-would-sun-tzu-say-about-entering-saturated-markets": [
    {
      label: "Terrain over confrontation",
      source: (entry) => entry.hookQuestion,
      excerpt: "mapping the terrain",
      constructIndex: 2,
    },
    {
      label: "Pre-contact positioning",
      source: (entry) => entry.description,
      excerpt: "terrain features",
      constructIndex: 10,
    },
  ],
  // ── Method article annotation blueprints (task 7deb5fb2) ─────────────
  "toulmin-argument-model-explained": [
    {
      label: "Precision over qualitative",
      source: (entry) => entry.hookQuestion,
      excerpt: "your audience isn't persuaded",
      constructIndex: 0,
    },
    {
      label: "Empirical rigor vs. speculation",
      source: (entry) => entry.description,
      excerpt: "confusing assertion with proof",
      constructIndex: 3,
    },
  ],
  "cynefin-framework-explained": [
    {
      label: "Domain diagnosis",
      source: (entry) => entry.hookQuestion,
      excerpt: "which kind of problem you actually have",
      constructIndex: 0,
    },
    {
      label: "Wrong-approach cost",
      source: (entry) => entry.description,
      excerpt: "wrong approach",
      constructIndex: 3,
    },
  ],
  "jobs-to-be-done-explained": [
    {
      label: "Hire-the-job insight",
      source: (entry) => entry.description,
      excerpt: "hire them to do a job",
      constructIndex: 9,
    },
    {
      label: "Real-job discovery",
      source: (entry) => entry.description,
      excerpt: "real job your product is hired for",
      constructIndex: 3,
    },
  ],
  // ── Wave 2 annotation blueprints ──────────────────────────────────────
  "first-mover-vs-fast-follower-what-sun-tzu-says": [
    {
      label: "Upstream terrain vs. downstream force",
      source: (entry) => entry.hookQuestion,
      excerpt: "first-mover advantage is usually a trick question",
      constructIndex: 2,
    },
    {
      label: "Epistemic contest framing",
      source: (entry) => entry.description,
      excerpt: "who controls the terrain",
      constructIndex: 3,
    },
  ],
  "what-would-florence-nightingale-say-about-data-driven-decisions": [
    {
      label: "Engineering reframe",
      source: (entry) => entry.hookQuestion,
      excerpt: "nobody is moving",
      constructIndex: 0,
    },
    {
      label: "Channel-audience fit",
      source: (entry) => entry.description,
      excerpt: "delivery channel to match the audience",
      constructIndex: 2,
    },
  ],
  "what-would-julius-caesar-say-about-moving-into-new-markets": [
    {
      label: "Irreversibility as commitment",
      source: (entry) => entry.hookQuestion,
      excerpt: "forces the commitment that half-measures never can",
      constructIndex: 0,
    },
    {
      label: "Structural presence",
      source: (entry) => entry.description,
      excerpt: "irreversibility is a feature",
      constructIndex: 5,
    },
  ],
  "what-would-machiavelli-say-about-competitor-espionage": [
    {
      label: "Reality vs. declaration",
      source: (entry) => entry.hookQuestion,
      excerpt: "how power actually moves",
      constructIndex: 0,
    },
    {
      label: "Pattern recognition",
      source: (entry) => entry.description,
      excerpt: "patterns of past decisions",
      constructIndex: 4,
    },
  ],
  "what-would-tesla-say-about-technical-debt": [
    {
      label: "Perfection vs. viability",
      source: (entry) => entry.hookQuestion,
      excerpt: "structural sabotage",
      constructIndex: 0,
    },
    {
      label: "Future architecture cost",
      source: (entry) => entry.description,
      excerpt: "corrupts the system model",
      constructIndex: 5,
    },
  ],
  "what-would-napoleon-say-about-scaling-too-fast": [
    {
      label: "Logistics-first principle",
      source: (entry) => entry.hookQuestion,
      excerpt: "stops working and nobody can say why",
      constructIndex: 8,
    },
    {
      label: "Tempo vs. infrastructure",
      source: (entry) => entry.description,
      excerpt: "logistical architecture must precede operational tempo",
      constructIndex: 5,
    },
  ],
  // ── Batch 3 annotation blueprints (task 9b797e96) ─────────────────────
  "what-would-marcus-aurelius-say-about-burnout": [
    {
      label: "Duty vs. performance",
      source: (entry) => entry.hookQuestion,
      excerpt: "what the work actually is",
      constructIndex: 0,
    },
    {
      label: "Resistance vs. alignment",
      source: (entry) => entry.description,
      excerpt: "resistance to duty",
      constructIndex: 1,
    },
  ],
  "what-would-marie-curie-say-about-when-to-trust-the-data": [
    {
      label: "Evidence threshold",
      source: (entry) => entry.hookQuestion,
      excerpt: "enough signal",
      constructIndex: 0,
    },
    {
      label: "Rigor vs. urgency",
      source: (entry) => entry.description,
      excerpt: "reproducible",
      constructIndex: 2,
    },
  ],
  // ── Wave 5 annotation blueprints ──────────────────────────────────────
  "what-would-catherine-the-great-say-about-managing-a-scaling-organization": [
    {
      label: "Governing vs surviving",
      source: (entry) => entry.hookQuestion,
      excerpt: "governing your company",
      constructIndex: 0,
    },
    {
      label: "Structural transformation",
      source: (entry) => entry.description,
      excerpt: "restructure ruthlessly, elevate talent",
      constructIndex: 2,
    },
  ],
  "what-would-alexander-the-great-say-about-entering-new-markets": [
    {
      label: "Speed of learning",
      source: (entry) => entry.hookQuestion,
      excerpt: "speed of learning and local adaptation",
      constructIndex: 0,
    },
    {
      label: "Local adaptation",
      source: (entry) => entry.description,
      excerpt: "adapting to local conditions",
      constructIndex: 3,
    },
  ],
  "what-would-cleopatra-vii-say-about-strategic-alliances": [
    {
      label: "Leverage asymmetry",
      source: (entry) => entry.hookQuestion,
      excerpt: "What leverage do you actually hold",
      constructIndex: 0,
    },
    {
      label: "Alliance calculus",
      source: (entry) => entry.description,
      excerpt: "who held power, what they needed",
      constructIndex: 4,
    },
  ],
  "what-would-john-d-rockefeller-say-about-building-systems-that-scale": [
    {
      label: "Systematization leverage",
      source: (entry) => entry.hookQuestion,
      excerpt: "relentless systematization",
      constructIndex: 0,
    },
    {
      label: "Efficiency obsession",
      source: (entry) => entry.description,
      excerpt: "eliminated waste with obsessive precision",
      constructIndex: 2,
    },
  ],
  "what-would-julius-caesar-say-about-winning-team-loyalty": [
    {
      label: "Risk-bearing loyalty",
      source: (entry) => entry.hookQuestion,
      excerpt: "crossed the Rubicon knowing it might cost them everything",
      constructIndex: 0,
    },
    {
      label: "Shared hardship",
      source: (entry) => entry.description,
      excerpt: "shared hardship, rewarded performance visibly",
      constructIndex: 3,
    },
  ],
  "what-would-florence-nightingale-say-about-operational-excellence": [
    {
      label: "Silent operational killer",
      source: (entry) => entry.hookQuestion,
      excerpt: "silent killer in its operations right now",
      constructIndex: 0,
    },
    {
      label: "Systemic root cause",
      source: (entry) => entry.description,
      excerpt: "systemic causes, and fixed the process",
      constructIndex: 2,
    },
  ],
  "first-principles-thinking-explained": [
    {
      label: "Assumption interrogation",
      source: (entry) => entry.hookQuestion,
      excerpt: "refusing to accept assumptions",
      constructIndex: 0,
    },
    {
      label: "Ground-up derivation",
      source: (entry) => entry.description,
      excerpt: "breaking a problem down to its most basic, verified truths",
      constructIndex: 4,
    },
  ],
  // ── Wave 4 annotation blueprints ──────────────────────────────────────
  "what-would-cicero-say-about-pitching-to-investors": [
    {
      label: "Audience channel selection",
      source: (entry) => entry.hookQuestion,
      excerpt: "12 minutes",
      constructIndex: 0,
    },
    {
      label: "Argument engineering",
      source: (entry) => entry.description,
      excerpt: "engineering the precise arguments",
      constructIndex: 4,
    },
  ],
  "what-would-epictetus-say-about-what-you-can-control": [
    {
      label: "Externals as instrument",
      source: (entry) => entry.hookQuestion,
      excerpt: "not in your control",
      constructIndex: 0,
    },
    {
      label: "Role-duty framing",
      source: (entry) => entry.description,
      excerpt: "directing energy only toward the first category",
      constructIndex: 4,
    },
  ],
  "what-would-ada-lovelace-say-about-building-with-ai": [
    {
      label: "Abstract vs. concrete potential",
      source: (entry) => entry.hookQuestion,
      excerpt: "wait for something better",
      constructIndex: 0,
    },
    {
      label: "Machine limitations principle",
      source: (entry) => entry.description,
      excerpt: "can only do what we know how to order it to perform",
      constructIndex: 5,
    },
  ],
  "what-would-harriet-tubman-say-about-leading-a-mission": [
    {
      label: "Single-actor dependency",
      source: (entry) => entry.hookQuestion,
      excerpt: "never lost a single one",
      constructIndex: 0,
    },
    {
      label: "Phase delegation",
      source: (entry) => entry.description,
      excerpt: "pre-positioned resources, timing",
      constructIndex: 2,
    },
  ],
  "what-would-frederick-douglass-say-about-finding-your-voice": [
    {
      label: "High-stakes falsification",
      source: (entry) => entry.hookQuestion,
      excerpt: "softening the message",
      constructIndex: 1,
    },
    {
      label: "Structural vulnerability reading",
      source: (entry) => entry.description,
      excerpt: "forced his audience to engage with concrete reality",
      constructIndex: 0,
    },
  ],
  "what-would-archimedes-say-about-leverage": [
    {
      label: "Engineering reframe",
      source: (entry) => entry.hookQuestion,
      excerpt: "long enough lever",
      constructIndex: 4,
    },
    {
      label: "Structural simplification",
      source: (entry) => entry.description,
      excerpt: "found the structural simplification",
      constructIndex: 2,
    },
  ],
  "inversion-thinking-explained": [
    {
      label: "Reality vs. conventional wisdom",
      source: (entry) => entry.hookQuestion,
      excerpt: "inverting conventional wisdom",
      constructIndex: 0,
    },
    {
      label: "Historical pattern inversion",
      source: (entry) => entry.description,
      excerpt: "structured as inversions of what Princes believe",
      constructIndex: 4,
    },
  ],
  // ── Wave 3 annotation blueprints ──────────────────────────────────────
  "what-would-steve-jobs-say-about-product-focus": [
    {
      label: "Product-line pruning",
      source: (entry) => entry.hookQuestion,
      excerpt: "cut 70% of the product line",
      constructIndex: 7,
    },
    {
      label: "Feature commitment cost",
      source: (entry) => entry.description,
      excerpt: "promise you will maintain forever",
      constructIndex: 0,
    },
  ],
  "what-would-lincoln-say-about-leading-through-crisis": [
    {
      label: "Epistemic humility in action",
      source: (entry) => entry.hookQuestion,
      excerpt: "incomplete information",
      constructIndex: 8,
    },
    {
      label: "Structured revisability",
      source: (entry) => entry.description,
      excerpt: "structural capacity to revise",
      constructIndex: 3,
    },
  ],
  "what-would-benjamin-franklin-say-about-time-management": [
    {
      label: "Cognitive load reduction",
      source: (entry) => entry.hookQuestion,
      excerpt: "urgent keeps eating the important",
      constructIndex: 8,
    },
    {
      label: "Transferred decision capacity",
      source: (entry) => entry.description,
      excerpt: "forced him to do the right things",
      constructIndex: 7,
    },
  ],
  "what-would-edison-say-about-failure-and-iteration": [
    {
      label: "Systematic elimination",
      source: (entry) => entry.hookQuestion,
      excerpt: "ten thousand experiments",
      constructIndex: 0,
    },
    {
      label: "Validation through elimination",
      source: (entry) => entry.description,
      excerpt: "systematically eliminate the ones that did not",
      constructIndex: 3,
    },
  ],
  "what-would-carnegie-say-about-hiring-and-delegating": [
    {
      label: "Premium autonomy grant",
      source: (entry) => entry.hookQuestion,
      excerpt: "second-guessing their decisions",
      constructIndex: 4,
    },
    {
      label: "Trajectory-first hiring",
      source: (entry) => entry.description,
      excerpt: "surround himself with men far cleverer than himself",
      constructIndex: 0,
    },
  ],
  "what-would-seneca-say-about-procrastination": [
    {
      label: "Self-honest diagnosis",
      source: (entry) => entry.hookQuestion,
      excerpt: "putting off the same conversation",
      constructIndex: 3,
    },
    {
      label: "Empirical self-audit",
      source: (entry) => entry.description,
      excerpt: "honest with yourself about what the task actually requires",
      constructIndex: 7,
    },
  ],
  "second-order-thinking-explained": [
    {
      label: "Cascade effects attention",
      source: (entry) => entry.hookQuestion,
      excerpt: "The market reacts. The competitor responds. The incentives shift.",
      constructIndex: 19,
    },
    {
      label: "Explicit loss-acceptance",
      source: (entry) => entry.description,
      excerpt: "what kind of empire it would leave",
      constructIndex: 3,
    },
  ],
  // ── Wave 7 annotation blueprints ──────────────────────────────────────
  "what-would-da-vinci-say-about-shipping-imperfect-work": [
    {
      label: "Perfectionism as avoidance",
      source: (entry) => entry.hookQuestion,
      excerpt: "kept improving it until it was taken from him",
      constructIndex: 0,
    },
    {
      label: "Improvement vs. avoiding exposure",
      source: (entry) => entry.description,
      excerpt: "perfectionism as a trap",
      constructIndex: 3,
    },
  ],
  "what-would-sun-tzu-say-about-pricing-strategy": [
    {
      label: "Terrain selection through price",
      source: (entry) => entry.hookQuestion,
      excerpt: "Pricing is not arithmetic",
      constructIndex: 0,
    },
    {
      label: "Positional strength signaling",
      source: (entry) => entry.description,
      excerpt: "signals strength but requires the ability to hold that position",
      constructIndex: 3,
    },
  ],
  "what-would-rockefeller-say-about-unit-economics": [
    {
      label: "Cost-per-unit visibility",
      source: (entry) => entry.hookQuestion,
      excerpt: "knowing exactly what each sale actually costs",
      constructIndex: 0,
    },
    {
      label: "Margin architecture",
      source: (entry) => entry.description,
      excerpt: "architecture of survival",
      constructIndex: 2,
    },
  ],
  "what-would-newton-say-about-debugging-complex-systems": [
    {
      label: "Controlled variable isolation",
      source: (entry) => entry.hookQuestion,
      excerpt: "isolate the right variable",
      constructIndex: 0,
    },
    {
      label: "Formal reduction discipline",
      source: (entry) => entry.description,
      excerpt: "formal reduction",
      constructIndex: 4,
    },
  ],
  "what-would-cleopatra-vii-say-about-managing-investors": [
    {
      label: "Stakeholder alignment",
      source: (entry) => entry.hookQuestion,
      excerpt: "dynamic is shifting",
      constructIndex: 0,
    },
    {
      label: "Dependence vs. partnership",
      source: (entry) => entry.description,
      excerpt: "never let them control her",
      constructIndex: 4,
    },
  ],
  "what-would-harriet-tubman-say-about-resilience-in-hard-times": [
    {
      label: "Forward motion under adversity",
      source: (entry) => entry.hookQuestion,
      excerpt: "hard stretch for four months",
      constructIndex: 0,
    },
    {
      label: "Structural commitment to destination",
      source: (entry) => entry.description,
      excerpt: "structural commitment to the destination",
      constructIndex: 3,
    },
  ],
  // ── Wave 8 annotation blueprints ──────────────────────────────────────
  "what-would-galileo-say-about-challenging-conventional-wisdom": [
    {
      label: "Evidence vs. retaliation",
      source: (entry) => entry.hookQuestion,
      excerpt: "evidence becomes undeniable",
      constructIndex: 0,
    },
    {
      label: "Battle selection",
      source: (entry) => entry.description,
      excerpt: "choosing his battles with precision",
      constructIndex: 1,
    },
  ],
  "what-would-archimedes-say-about-technical-leverage": [
    {
      label: "Effort vs. system",
      source: (entry) => entry.hookQuestion,
      excerpt: "The effort is not the problem",
      constructIndex: 0,
    },
    {
      label: "Fulcrum identification",
      source: (entry) => entry.description,
      excerpt: "found the right fulcrum",
      constructIndex: 1,
    },
  ],
  "what-would-epictetus-say-about-managing-uncertainty": [
    {
      label: "Dichotomy of control",
      source: (entry) => entry.hookQuestion,
      excerpt: "You cannot control any of those facts",
      constructIndex: 0,
    },
    {
      label: "Diagnostic precision",
      source: (entry) => entry.description,
      excerpt: "precise diagnostic tool",
      constructIndex: 1,
    },
  ],
  "what-would-frederick-douglass-say-about-building-credibility": [
    {
      label: "Demonstration over argument",
      source: (entry) => entry.hookQuestion,
      excerpt: "build credibility fast enough",
      constructIndex: 0,
    },
    {
      label: "Cost of ignoring",
      source: (entry) => entry.description,
      excerpt: "cost of ignoring you higher",
      constructIndex: 1,
    },
  ],
  "what-would-ada-lovelace-say-about-building-for-the-future": [
    {
      label: "Architecture vs. implementation",
      source: (entry) => entry.hookQuestion,
      excerpt: "architecture makes possible",
      constructIndex: 0,
    },
    {
      label: "Vision as specification",
      source: (entry) => entry.description,
      excerpt: "documented it precisely enough",
      constructIndex: 1,
    },
  ],
  "what-galileo-and-newton-would-say-about-evidence-vs-consensus": [
    {
      label: "Data vs. expert consensus",
      source: (entry) => entry.hookQuestion,
      excerpt: "industry doesn't believe yet",
      constructIndex: 0,
    },
    {
      label: "Anomalous data timing",
      source: (entry) => entry.description,
      excerpt: "anomalous data before expert consensus",
      constructIndex: 1,
    },
  ],
  // ── Wave 9 annotation blueprints ──────────────────────────────────────
  "galileo-vs-newton-on-disrupting-your-own-field": [
    {
      label: "Control the disruption",
      source: (entry) => entry.hookQuestion,
      excerpt: "control the disruption",
      constructIndex: 0,
    },
    {
      label: "Opposite conclusions",
      source: (entry) => entry.hookQuestion,
      excerpt: "reached opposite conclusions",
      constructIndex: 1,
    },
  ],
  "archimedes-vs-ada-lovelace-on-build-vs-theorize": [
    {
      label: "Scrappy prototype",
      source: (entry) => entry.hookQuestion,
      excerpt: "scrappy prototype to test",
      constructIndex: 0,
    },
    {
      label: "Kind of unknown",
      source: (entry) => entry.description,
      excerpt: "kind of unknown you're trying to resolve",
      constructIndex: 1,
    },
  ],
  "douglass-vs-lincoln-on-playing-the-long-game": [
    {
      label: "Platform for the next fight",
      source: (entry) => entry.hookQuestion,
      excerpt: "platform for the next fight",
      constructIndex: 0,
    },
    {
      label: "What you are optimizing for",
      source: (entry) => entry.description,
      excerpt: "what you are optimizing for",
      constructIndex: 1,
    },
  ],
  "epictetus-vs-harriet-tubman-on-risk-under-constraint": [
    {
      label: "Rules favor incumbents",
      source: (entry) => entry.hookQuestion,
      excerpt: "rules favor incumbents",
      constructIndex: 0,
    },
    {
      label: "Parallel system outside them",
      source: (entry) => entry.hookQuestion,
      excerpt: "parallel system outside them",
      constructIndex: 1,
    },
  ],
  "carnegie-vs-rockefeller-on-monopoly-strategy": [
    {
      label: "Lowest-cost producer",
      source: (entry) => entry.hookQuestion,
      excerpt: "lowest-cost producer at scale",
      constructIndex: 0,
    },
    {
      label: "Opposite playbooks",
      source: (entry) => entry.description,
      excerpt: "opposite playbooks",
      constructIndex: 1,
    },
  ],
  // ── Wave 10 annotation blueprints ──────────────────────────────────────
  "machiavelli-vs-sun-tzu-on-competitive-intelligence": [
    {
      label: "Reputation as deterrence",
      source: (entry) => entry.description,
      excerpt: "projecting a reputation for decisive strength",
      constructIndex: 0,
    },
    {
      label: "Intelligence vs. intimidation",
      source: (entry) => entry.description,
      excerpt: "intelligence or intimidation is the ultimate competitive weapon",
      constructIndex: 1,
    },
  ],
  "marcus-aurelius-vs-seneca-on-processing-failure": [
    {
      label: "Extracting meaning immediately",
      source: (entry) => entry.description,
      excerpt: "failure is the failure to extract meaning",
      constructIndex: 0,
    },
    {
      label: "Dwell time before acting",
      source: (entry) => entry.hookQuestion,
      excerpt: "excavating what went wrong in full detail",
      constructIndex: 1,
    },
  ],
  "franklin-vs-carnegie-on-building-your-network": [
    {
      label: "Breadth of connection",
      source: (entry) => entry.description,
      excerpt: "broadest network in 18th-century America",
      constructIndex: 0,
    },
    {
      label: "What problem you are solving",
      source: (entry) => entry.description,
      excerpt: "what kind of problem you are trying to solve",
      constructIndex: 1,
    },
  ],
  "cleopatra-vs-catherine-the-great-on-ruling-through-alliance": [
    {
      label: "External anchor dependency",
      source: (entry) => entry.description,
      excerpt: "alliance defined both her power and her downfall",
      constructIndex: 0,
    },
    {
      label: "Internal vs. external power base",
      source: (entry) => entry.hookQuestion,
      excerpt: "building a path to independence",
      constructIndex: 1,
    },
  ],
  // ── Wave 11 annotation blueprints ──────────────────────────────────────
  "caesar-vs-alexander-on-how-fast-to-expand": [
    {
      label: "Sequential consolidation",
      source: (entry) => entry.description,
      excerpt: "pacified, integrated into Roman administrative structure",
      constructIndex: 0,
    },
    {
      label: "Speed vs. consolidation tension",
      source: (entry) => entry.hookQuestion,
      excerpt: "saturating the first market and building the operational playbook",
      constructIndex: 1,
    },
  ],
  "jobs-vs-edison-on-perfectionism-vs-shipping": [
    {
      label: "Maximum-impact statement",
      source: (entry) => entry.description,
      excerpt: "staged reveals only when a product could make a maximum-impact statement",
      constructIndex: 0,
    },
    {
      label: "Perfectionism vs. learning delay",
      source: (entry) => entry.hookQuestion,
      excerpt: "3 months of delayed learning",
      constructIndex: 1,
    },
  ],
  "cicero-vs-machiavelli-on-winning-by-argument-or-power": [
    {
      label: "Argument quality threshold",
      source: (entry) => entry.description,
      excerpt: "well-constructed argument will prevail with a rational audience",
      constructIndex: 0,
    },
    {
      label: "Votes before the room",
      source: (entry) => entry.hookQuestion,
      excerpt: "whether you have the votes before you walk into the room",
      constructIndex: 1,
    },
  ],
  // ── Wave 12 annotation blueprints ──────────────────────────────────────
  "tubman-vs-douglass-on-direct-action-vs-advocacy": [
    {
      label: "No looking back principle",
      source: (entry) => entry.description,
      excerpt: "waiting for permission or consensus was itself a form of complicity",
      constructIndex: 0,
    },
    {
      label: "Durable change through persuasion",
      source: (entry) => entry.description,
      excerpt: "durable change required the moral persuasion of the majority",
      constructIndex: 1,
    },
  ],
  "ada-lovelace-vs-tesla-on-vision-without-resources": [
    {
      label: "Minimum expression of the vision",
      source: (entry) => entry.hookQuestion,
      excerpt: "document it, protect it, find the form in which it can survive",
      constructIndex: 0,
    },
    {
      label: "Demonstration as the only argument",
      source: (entry) => entry.hookQuestion,
      excerpt: "build the proof-of-concept that forces the world to pay attention",
      constructIndex: 1,
    },
  ],
  "nightingale-vs-curie-on-data-vs-gut-instinct": [
    {
      label: "Instrument the worry",
      source: (entry) => entry.hookQuestion,
      excerpt: "question what the experiment is actually measuring",
      constructIndex: 0,
    },
    {
      label: "Falsifiable intuition",
      source: (entry) => entry.description,
      excerpt: "questioning what the experiment is actually measuring",
      constructIndex: 1,
    },
  ],
  // ── Wave 13 annotation blueprints ──────────────────────────────────────
  "napoleon-vs-caesar-on-knowing-when-to-stop": [
    {
      label: "Logistical coherence test",
      source: (entry) => entry.hookQuestion,
      excerpt: "broke under their own weight",
      constructIndex: 0,
    },
    {
      label: "Territorial consolidation",
      source: (entry) => entry.description,
      excerpt: "broke in different ways and for different reasons",
      constructIndex: 1,
    },
  ],
  "jobs-vs-galileo-on-betting-against-consensus": [
    {
      label: "Paradigm vs. preference measurement",
      source: (entry) => entry.hookQuestion,
      excerpt: "measuring the wrong thing",
      constructIndex: 0,
    },
    {
      label: "Evidentiary precision",
      source: (entry) => entry.description,
      excerpt: "distinguish genuine insight from delusion",
      constructIndex: 1,
    },
  ],
  "epictetus-vs-seneca-on-how-to-handle-adversity": [
    {
      label: "Category vs. path closed",
      source: (entry) => entry.hookQuestion,
      excerpt: "floor drops out",
      constructIndex: 0,
    },
    {
      label: "Acceptance before adaptation",
      source: (entry) => entry.description,
      excerpt: "accept what you cannot control",
      constructIndex: 1,
    },
  ],
  // ── Wave 14 annotation blueprints ──────────────────────────────────────
  "archimedes-vs-newton-on-when-to-trust-your-model": [
    {
      label: "Completeness of derivation",
      source: (entry) => entry.hookQuestion,
      excerpt: "trust your theoretical model vs. run another experiment",
      constructIndex: 0,
    },
    {
      label: "Confirmation against independent cases",
      source: (entry) => entry.description,
      excerpt: "when a model earns the right to be trusted",
      constructIndex: 1,
    },
  ],
  "lincoln-vs-carnegie-on-winning-over-critics": [
    {
      label: "Team of rivals conversion",
      source: (entry) => entry.hookQuestion,
      excerpt: "Lincoln would pull him inside the tent",
      constructIndex: 0,
    },
    {
      label: "Accountability assignment",
      source: (entry) => entry.description,
      excerpt: "critic-conversion is an investment worth making",
      constructIndex: 1,
    },
  ],
  "rockefeller-vs-franklin-on-systems-vs-relationships": [
    {
      label: "When to systematize",
      source: (entry) => entry.hookQuestion,
      excerpt: "informal network that got you here is starting to fray",
      constructIndex: 0,
    },
    {
      label: "Relational leverage",
      source: (entry) => entry.description,
      excerpt: "very different organizations",
      constructIndex: 1,
    },
  ],
  // ── Wave 15 annotation blueprints ──────────────────────────────────────
  "da-vinci-vs-newton-on-breadth-vs-depth": [
    {
      label: "Breadth at the intersections",
      source: (entry) => entry.description,
      excerpt: "greatest contributions at the intersections",
      constructIndex: 0,
    },
    {
      label: "Bounded vs. open-ended problems",
      source: (entry) => entry.hookQuestion,
      excerpt: "explore broadly or master deeply",
      constructIndex: 1,
    },
  ],
  "cicero-vs-lincoln-on-when-to-speak-vs-stay-silent": [
    {
      label: "Silence as complicity",
      source: (entry) => entry.description,
      excerpt: "silence was a form of complicity",
      constructIndex: 0,
    },
    {
      label: "Timing vs. argument quality",
      source: (entry) => entry.description,
      excerpt: "timing or argument quality is the primary variable",
      constructIndex: 1,
    },
  ],
  "catherine-vs-cleopatra-on-consolidating-power-in-a-new-role": [
    {
      label: "Earned vs. performed authority",
      source: (entry) => entry.description,
      excerpt: "earned authority vs. performed authority",
      constructIndex: 0,
    },
    {
      label: "First-year consolidation",
      source: (entry) => entry.hookQuestion,
      excerpt: "establish authority when you're new",
      constructIndex: 1,
    },
  ],
  // ── Wave 16 annotation blueprints ──────────────────────────────────────
  "edison-vs-tesla-on-practical-bets-vs-visionary-bets": [
    {
      label: "Practical vs. visionary bet",
      source: (entry) => entry.hookQuestion,
      excerpt: "what works today or what could transform tomorrow",
      constructIndex: 0,
    },
    {
      label: "Architecture vs. elimination",
      source: (entry) => entry.description,
      excerpt: "bet on what works now, or on what could transform the field",
      constructIndex: 1,
    },
  ],
  "alexander-vs-napoleon-on-when-to-overextend": [
    {
      label: "Ambition compounding vs. consuming",
      source: (entry) => entry.hookQuestion,
      excerpt: "bold ambition become the cause of your undoing",
      constructIndex: 0,
    },
    {
      label: "Model revision under pressure",
      source: (entry) => entry.description,
      excerpt: "how to distinguish the ambition that compounds",
      constructIndex: 1,
    },
  ],
  "ada-lovelace-vs-nightingale-on-systems-thinking-vs-field-data": [
    {
      label: "Framework before observation",
      source: (entry) => entry.hookQuestion,
      excerpt: "design the framework first or gather the evidence first",
      constructIndex: 0,
    },
    {
      label: "Stable vs. emergent domain",
      source: (entry) => entry.description,
      excerpt: "architecture or observation is the more reliable path",
      constructIndex: 1,
    },
  ],
  // ── Wave 17 annotation blueprints ──────────────────────────────────────
  "harriet-tubman-vs-lincoln-on-when-to-act-without-consensus": [
    {
      label: "Cost of waiting",
      source: (entry) => entry.description,
      excerpt: "window for action is always narrower than the time required to build consensus",
      constructIndex: 0,
    },
    {
      label: "Enforceability threshold",
      source: (entry) => entry.hookQuestion,
      excerpt: "will the window have already closed",
      constructIndex: 1,
    },
  ],
  "franklin-vs-aurelius-on-building-for-the-long-term": [
    {
      label: "Reputation as long-duration asset",
      source: (entry) => entry.description,
      excerpt: "cultivating relationships",
      constructIndex: 0,
    },
    {
      label: "Present duty vs. legacy filter",
      source: (entry) => entry.hookQuestion,
      excerpt: "avoiding the demands of right now",
      constructIndex: 1,
    },
  ],
  "galileo-vs-archimedes-on-when-to-challenge-consensus": [
    {
      label: "Sufficient challenge vs. complete proof",
      source: (entry) => entry.description,
      excerpt: "months after building his telescope",
      constructIndex: 0,
    },
    {
      label: "Replication burden",
      source: (entry) => entry.hookQuestion,
      excerpt: "everyone else is wrong",
      constructIndex: 1,
    },
  ],
  // ── Wave 18 annotation blueprints ────────────────────────────────────
  "seneca-vs-cicero-on-private-virtue-vs-public-duty": [
    {
      label: "Inner citadel construction",
      source: (entry) => entry.hookQuestion,
      excerpt: "private principles and your public obligations diverge",
      constructIndex: 1,
    },
    {
      label: "Audience-register splitting",
      source: (entry) => entry.description,
      excerpt: "philosophical practice, honest self-examination",
      constructIndex: 2,
    },
  ],
  "douglass-vs-carnegie-on-the-self-made-narrative": [
    {
      label: "Systemic vulnerability disclosure",
      source: (entry) => entry.hookQuestion,
      excerpt: "inspire them or just set an impossible standard",
      constructIndex: 0,
    },
    {
      label: "Trajectory exposure criterion",
      source: (entry) => entry.description,
      excerpt: "conditions of his rise proved",
      constructIndex: 0,
    },
  ],
  "cleopatra-vs-caesar-on-power-through-alliance-or-conquest": [
    {
      label: "Channel portfolio vs. decisive strike",
      source: (entry) => entry.hookQuestion,
      excerpt: "make allies of powerful rivals",
      constructIndex: 0,
    },
    {
      label: "Irreversibility as forcing function",
      source: (entry) => entry.description,
      excerpt: "irreversible facts faster than his opponents could deliberate",
      constructIndex: 0,
    },
  ],
  // ── Wave 19 annotation blueprints ────────────────────────────────────
  "carnegie-vs-napoleon-on-winning-loyalty-vs-demanding-it": [
    {
      label: "Development vs. accountability first",
      source: (entry) => entry.hookQuestion,
      excerpt: "invest in their development or apply pressure",
      constructIndex: 0,
    },
    {
      label: "Root cause of underperformance",
      source: (entry) => entry.description,
      excerpt: "earned through genuine care",
      constructIndex: 3,
    },
  ],
  "tesla-vs-galileo-on-working-against-the-institution": [
    {
      label: "What the institution controls",
      source: (entry) => entry.hookQuestion,
      excerpt: "fight them directly or work around them",
      constructIndex: 0,
    },
    {
      label: "Accommodation vs. preservation of work",
      source: (entry) => entry.description,
      excerpt: "strategic patience",
      constructIndex: 1,
    },
  ],
  "sun-tzu-vs-rockefeller-on-winning-through-terrain-vs-capital": [
    {
      label: "Terrain malleability diagnostic",
      source: (entry) => entry.hookQuestion,
      excerpt: "positioning choice — or an asset accumulation play",
      constructIndex: 0,
    },
    {
      label: "Fixed vs. malleable terrain",
      source: (entry) => entry.description,
      excerpt: "terrain-selection model",
      constructIndex: 2,
    },
  ],
  // ── Wave 20 annotation blueprints ────────────────────────────────────
  "curie-vs-ada-lovelace-on-pioneering-in-a-hostile-field": [
    {
      label: "Field evaluation standard test",
      source: (entry) => entry.hookQuestion,
      excerpt: "accumulate evidence until they cannot exclude you",
      constructIndex: 0,
    },
    {
      label: "Conceptual vs. experimental proof",
      source: (entry) => entry.description,
      excerpt: "rigorous proof accumulation or visionary conceptual leaping",
      constructIndex: 1,
    },
  ],
  "newton-vs-machiavelli-on-systems-vs-power": [
    {
      label: "Reflexive vs. non-reflexive domains",
      source: (entry) => entry.hookQuestion,
      excerpt: "systems that compound automatically",
      constructIndex: 0,
    },
    {
      label: "Systemic vs. political attention allocation",
      source: (entry) => entry.description,
      excerpt: "underlying laws",
      constructIndex: 2,
    },
  ],
  "rockefeller-vs-napoleon-on-monopoly-vs-conquest": [
    {
      label: "Market stability diagnostic",
      source: (entry) => entry.hookQuestion,
      excerpt: "controlling the infrastructure",
      constructIndex: 0,
    },
    {
      label: "Infrastructure vs. speed selection",
      source: (entry) => entry.description,
      excerpt: "patient and capital accumulation",
      constructIndex: 1,
    },
  ],
  // ── Wave 21 annotation blueprints ────────────────────────────────────
  "edison-vs-franklin-on-iteration-vs-system-building": [
    {
      label: "Domain novelty diagnostic",
      source: (entry) => entry.hookQuestion,
      excerpt: "run a thousand fast experiments",
      constructIndex: 0,
    },
    {
      label: "Failure cost vs. search space",
      source: (entry) => entry.description,
      excerpt: "incompatible mechanisms",
      constructIndex: 1,
    },
  ],
  "caesar-vs-alexander-on-empire-building-speed": [
    {
      label: "Competitive resource diagnostic",
      source: (entry) => entry.hookQuestion,
      excerpt: "acquiring territory before resistance",
      constructIndex: 0,
    },
    {
      label: "Speed vs. integration trade-off",
      source: (entry) => entry.description,
      excerpt: "speed of acquisition creates compounding advantage",
      constructIndex: 2,
    },
  ],
  "epictetus-vs-seneca-on-accepting-vs-transforming-constraints": [
    {
      label: "Control boundary test",
      source: (entry) => entry.hookQuestion,
      excerpt: "what you can control",
      constructIndex: 0,
    },
    {
      label: "Moveability test before acceptance",
      source: (entry) => entry.description,
      excerpt: "acceptance is wisdom and when it is resignation",
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
