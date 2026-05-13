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
  // ── Method articles — high-SEO framework explainers (task 7deb5fb2 / ad9b2580 / ea2ab1d9) ──
  {
    slug: "trendslop-why-all-llms-give-the-same-strategic-advice",
    type: "single",
    frameworkSlug: "isaac-newton",
    title: "Trendslop: Why All LLMs Give the Same Strategic Advice",
    description:
      "In 2026, Harvard Business Review tested 7 major LLMs across 15,000 strategic scenarios and found they all cluster on the same generic, buzzword-heavy advice. The word they coined for it was trendslop. The structural reason is that language models optimize for predicting consensus text — they cannot generate advice that contradicts the center of mass of their training data. Here is what non-trendslop strategic advice actually looks like.",
    targetKeywords: [
      "AI trendslop",
      "why does ChatGPT give generic advice",
      "HBR trendslop study",
      "AI strategic advice quality",
      "trendslop definition",
      "ChatGPT gives same advice",
    ],
    decisionType: "reasoning",
    hookQuestion:
      "A 2026 HBR study tested 7 major AI models across 15,000 strategic scenarios. Every model gave essentially the same advice. Move fast, be agile, leverage synergies. The researchers called it trendslop. The structural reason is not that the models are bad — it is that they optimize for predicting text that looks like consensus. They cannot give advice that contradicts the averaged wisdom of their training data. Newton would tell you: if you want an answer different from the consensus, you need a method that verifies from first principles rather than pattern-matching from the center of mass.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Isaac Newton",
        text: "The problem with consulting the crowd is not that the crowd is wrong. The problem is that the crowd cannot tell you anything the crowd does not already believe. Every question I asked about light, gravity, and motion, I asked against the grain of received wisdom — not because I was contrarian, but because received wisdom had never been forced to survive contact with a precisely designed experiment. An AI that trained on received wisdom will reproduce received wisdom. This is not a flaw in the AI. It is a structural consequence of what the AI was built to do.",
      },
      {
        speaker: "Marie Curie",
        text: "The generic advice is not false. It is unhelpful in the specific way that average measurements are unhelpful — they tell you where the distribution is centered but not whether you are in the tail. The founders who need advice are almost always in the tail: a specific situation, a specific resource constraint, a specific competitive position. An answer built from averaging 15,000 training scenarios cannot tell you what is true about your particular situation. It can only tell you what was statistically true about the aggregate.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "The emperor who consulted only consensus always governed for the median situation rather than the actual one. Every governance challenge I faced was specific. The plague was not a generic plague. The Germanic incursion was not a generic military problem. The advice I needed was rooted in the actual constructs of the actual situation — not the average of previous situations. That is the value of a framework: it forces you to locate your situation within a structure before generating a recommendation.",
      },
    ],
  },
  {
    slug: "critical-decision-method-explained",
    type: "single",
    frameworkSlug: "marcus-aurelius",
    title: "The Critical Decision Method Explained",
    description:
      "Gary Klein's Critical Decision Method (CDM) reveals how experts actually make decisions: not by generating options and comparing them, but by pattern-matching the situation to experience and mentally simulating the first viable option before committing. Most decision advice teaches the wrong model. CDM is the corrective — built from real research on firefighters, nurses, and military commanders making high-stakes decisions under time pressure.",
    targetKeywords: [
      "critical decision method",
      "CDM cognitive task analysis",
      "Klein critical decision method",
      "naturalistic decision making",
      "recognition-primed decision making",
      "expert decision making under pressure",
    ],
    decisionType: "leadership",
    hookQuestion:
      "You have seconds to decide and no time to list your options. Most decision frameworks collapse here — they assume you have time to deliberate. Klein's research on firefighters, nurses, and military commanders found that experts almost never weigh options against each other. They pattern-match the situation to experience, simulate the first viable option in their mind, and commit if it clears the threshold. This is not intuition. It is compressed methodology.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Marcus Aurelius",
        text: "The deliberating mind is the slower mind. When the situation is clear — when you have seen this pattern before and know what the trust placed in you demands — hesitation is not prudence. It is the failure to have done the work in advance that would make the right action obvious. The expert's fast decision is not careless. It is the product of every slow decision they made in training.",
      },
      {
        speaker: "Marie Curie",
        text: "What looks like intuition is compressed methodology. The firefighter who walks into a burning building and immediately knows the ceiling will collapse in four minutes is not guessing. They have seen this ceiling configuration before, processed its signals, and stored the pattern. The Critical Decision Method is simply the discipline of making that stored experience visible and auditable — so you can learn from it and transfer it.",
      },
      {
        speaker: "Sun Tzu",
        text: "The expert wins before the decision point. Their pattern recognition is built through retrospection — after every encounter, they examine what they saw, what they inferred, and whether the inference was correct. The general who only learns from the battle he is currently in will always be one cycle behind. The CDM practitioner is two battles ahead.",
      },
    ],
  },
  {
    slug: "the-ooda-loop-vs-the-cynefin-framework",
    type: "collision",
    frameworkSlug: "sun-tzu",
    collisionFrameworkSlugs: ["sun-tzu", "leonardo-da-vinci"],
    title: "The OODA Loop vs. the Cynefin Framework",
    description:
      "The OODA loop (Observe, Orient, Decide, Act) tells you to move faster than your opponent can think. The Cynefin framework tells you to first understand what kind of problem you have. They give opposite advice — because applying the wrong method in the wrong domain produces results worse than no framework at all. Here is how to know which one fits your situation.",
    targetKeywords: [
      "OODA loop vs Cynefin",
      "OODA loop explained",
      "Cynefin framework vs OODA",
      "decision frameworks compared",
      "when to use OODA loop",
      "OODA loop decision making",
    ],
    decisionType: "strategy",
    hookQuestion:
      "You have a decision to make and two frameworks sitting on your desk. One says: speed is the master variable — get inside the opponent's decision cycle before they can adapt. The other says: first figure out what kind of problem you have, because the wrong method in the wrong domain produces results worse than no framework at all. Both frameworks are right. The question is which one fits your situation right now.",
    publishedAt: "2026-05-13",
    agonExcerpt: [
      {
        speaker: "Sun Tzu",
        text: "The OODA loop answers the right question for competitive terrain: whoever processes information and acts faster controls the encounter. The enemy who cannot respond to your last move before you have already made your next one is not fighting you — they are reacting to a situation you have already left. Speed is not a luxury in a fast-moving environment. It is the terrain itself.",
      },
      {
        speaker: "Leonardo da Vinci",
        text: "The OODA loop is a marvelous instrument — for the domain where the enemy's response is the relevant constraint. But when the problem itself is the constraint, acting fast in the wrong direction is not speed: it is waste at velocity. Cynefin asks the prior question: is this a problem where rapid iteration produces information, or is it a problem where premature commitment destroys the options you need? You must answer that question before you choose your instrument.",
      },
      {
        speaker: "Marcus Aurelius",
        text: "Both frameworks are correct about the errors they were designed to prevent. OODA prevents paralysis in fast-moving environments. Cynefin prevents the application of simple solutions to complex systems. The discipline is not choosing between them in theory — it is recognizing, in the specific situation in front of you, which error is more likely.",
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
  // ── Method article annotation blueprints (task 7deb5fb2 / ad9b2580 / ea2ab1d9) ─────────────
  "trendslop-why-all-llms-give-the-same-strategic-advice": [
    {
      label: "First-principles antidote",
      source: (entry) => entry.hookQuestion,
      excerpt: "verifies from first principles",
      constructIndex: 1,
    },
    {
      label: "Consensus averaging problem",
      source: (entry) => entry.description,
      excerpt: "consensus text",
      constructIndex: 4,
    },
  ],
  "critical-decision-method-explained": [
    {
      label: "Pattern-match before deliberation",
      source: (entry) => entry.hookQuestion,
      excerpt: "pattern-match the situation to experience",
      constructIndex: 3,
    },
    {
      label: "Adversity as compressed learning",
      source: (entry) => entry.description,
      excerpt: "time pressure",
      constructIndex: 13,
    },
  ],
  "the-ooda-loop-vs-the-cynefin-framework": [
    {
      label: "Decision tempo",
      source: (entry) => entry.hookQuestion,
      excerpt: "inside the opponent's decision cycle",
      constructIndex: 2,
    },
    {
      label: "Method domain fit",
      source: (entry) => entry.description,
      excerpt: "wrong method in the wrong domain",
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
