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
