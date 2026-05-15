import type { FrameworkSlug } from "@/lib/frameworks";

export const DECISION_SITE_URL = "https://www.consultthedead.com";

export interface DecisionEntry {
  slug: string;
  status: "shipped";
  shippedAt: string;
  title: string;
  description: string;
  primaryQuery: string;
  secondaryQueries: string[];
  recommendedCouncil: FrameworkSlug[];
  hookQuestion: string;
  targetKeywords: string[];
}

export const DECISION_ENTRIES: DecisionEntry[] = [
  {
    slug: "should-i-raise-vc-or-bootstrap",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Raise VC or Bootstrap?",
    description:
      "Venture capital buys speed, but it also buys a new set of constraints. Bootstrapping keeps control in your hands, but it can slow the timeline. This page helps you decide what tradeoff matters most.",
    primaryQuery: "Should I raise VC or bootstrap?",
    secondaryQueries: [
      "VC vs bootstrap pros and cons",
      "when to raise venture capital",
      "is bootstrapping better than VC",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marie-curie",
      "sun-tzu",
    ],
    hookQuestion:
      "You can buy momentum with outside capital, but the wrong financing choice can lock in a bad operating model. Is this the moment to trade control for speed?",
    targetKeywords: [
      "should I raise VC or bootstrap",
      "VC vs bootstrap pros and cons",
      "when to raise venture capital",
      "is bootstrapping better than VC",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-quit-my-job-to-start-a-company",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Quit My Job to Start a Company?",
    description:
      "Leaving a stable job is not a motivation test. It is a timing, runway, and leverage decision. This page frames the choice in terms of risk you can survive and upside you can actually capture.",
    primaryQuery: "Should I quit my job to start a company?",
    secondaryQueries: [
      "when is the right time to start a company",
      "should I quit my job to be an entrepreneur",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "sun-tzu",
    ],
    hookQuestion:
      "You have a salary, a calendar, and a plan that works in theory. The question is whether the window of opportunity is worth the risk of walking away now.",
    targetKeywords: [
      "should I quit my job to start a company",
      "when is the right time to start a company",
      "should I quit my job to be an entrepreneur",
    ],
  },
  {
    slug: "should-i-raise-a-seed-round",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Raise a Seed Round?",
    description:
      "Raising a seed round is not a milestone in the founding sequence. It is a conditional decision that reshapes control, terrain, and evidence requirements. This page helps you decide whether the capital changes the game — or just the story.",
    primaryQuery: "Should I raise a seed round?",
    secondaryQueries: [
      "seed round vs bootstrap",
      "when to raise seed funding",
      "is it too early to raise a seed round",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "marie-curie",
    ],
    hookQuestion:
      "Outside capital is not validation. It is a relationship that reshapes the next decision. Will this round secure a position that would be harder to reach six months from now, or is it mostly making the narrative sound more serious?",
    targetKeywords: [
      "should I raise a seed round",
      "seed round vs bootstrap",
      "when to raise seed funding",
      "is it too early to raise a seed round",
      "how to know if you are ready to raise",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-my-first-employee",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Hire My First Employee?",
    description:
      "Your first employee shapes your culture more than any later hire. The question is not when you need the help — it's when you're ready to lead, when the work is documented, and when the bottleneck is actually labor, not your own capacity.",
    primaryQuery: "When to hire my first employee?",
    secondaryQueries: [
      "should I hire my first employee",
      "first hire startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "marie-curie",
    ],
    hookQuestion:
      "When you hire your first person, you stop being a solo founder. Are you ready to become a leader?",
    targetKeywords: [
      "should I hire my first employee",
      "first hire startup",
      "when to hire first employee",
      "first employee hiring",
      "startup first hire",
      "how to hire your first employee",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-fire-my-cofounder",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Fire My Cofounder?",
    description:
      "A cofounder conflict is rarely just a personnel problem. It is usually a leverage problem, a trust problem, and a signal that the company's operating model is already breaking.",
    primaryQuery: "Should I fire my cofounder?",
    secondaryQueries: [
      "when should I fire my cofounder",
      "how to remove a cofounder from a startup",
      "cofounder conflict what to do",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "marcus-aurelius",
    ],
    hookQuestion:
      "If you cannot trust the person you built the company with, are you protecting the business by staying patient, or making the damage harder to reverse?",
    targetKeywords: [
      "should I fire my cofounder",
      "when should I fire my cofounder",
      "how to remove a cofounder from a startup",
      "cofounder conflict what to do",
    ],
  },
  {
    slug: "should-i-pivot-or-persist",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Pivot or Persist?",
    description:
      "A pivot is not a surrender and persistence is not virtue by default. The right answer depends on whether you are learning fast enough to justify another round of effort.",
    primaryQuery: "Should I pivot or persist?",
    secondaryQueries: [
      "how to know when to pivot a startup",
      "when should a founder persist",
      "pivot vs persist startup",
    ],
    recommendedCouncil: [
      "isaac-newton",
      "marie-curie",
      "sun-tzu",
    ],
    hookQuestion:
      "If the market keeps refusing the same offer, are you in a temporary valley of bad luck, or already standing in front of a wall that requires a new route?",
    targetKeywords: [
      "should I pivot or persist",
      "how to know when to pivot a startup",
      "when should a founder persist",
      "pivot vs persist startup",
    ],
  },
  {
    slug: "should-i-take-this-job-offer",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Take This Job Offer?",
    description:
      "A job offer is more than salary and title. It is a bet on the manager, the mission, the learning curve, and the opportunity cost of saying yes.",
    primaryQuery: "Should I take this job offer?",
    secondaryQueries: [
      "how to evaluate a job offer",
      "is this job offer worth taking",
      "should I accept this offer",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Does this role actually increase your freedom, leverage, and skill, or is it only a safer version of the path you are already on?",
    targetKeywords: [
      "should I take this job offer",
      "how to evaluate a job offer",
      "is this job offer worth taking",
      "should I accept this offer",
    ],
  },
  {
    slug: "should-i-sell-my-startup",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Sell My Startup?",
    description:
      "Selling a startup can crystallize value, reduce risk, and change your life. It can also hand away upside too early if the business still has room to compound.",
    primaryQuery: "Should I sell my startup?",
    secondaryQueries: [
      "when should I sell my startup",
      "how to decide whether to sell a startup",
      "startup acquisition decision",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "john-d-rockefeller",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "If the buyer is offering certainty today, are you selling the right asset at the right time, or just exiting before the real compounding shows up?",
    targetKeywords: [
      "should I sell my startup",
      "when should I sell my startup",
      "how to decide whether to sell a startup",
      "startup acquisition decision",
    ],
  },
  {
    slug: "should-i-shut-down-my-startup",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Shut Down My Startup?",
    description:
      "Shutting down is not failure if the evidence says the company cannot win on a timeline that matters. The hard part is separating grief from the actual data.",
    primaryQuery: "Should I shut down my startup?",
    secondaryQueries: [
      "when should I shut down my startup",
      "how to know when to close a startup",
      "shutdown versus pivot startup",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "seneca",
      "sun-tzu",
    ],
    hookQuestion:
      "Are you protecting something that still has a real chance to win, or prolonging a company that has already spent its remaining option value?",
    targetKeywords: [
      "should I shut down my startup",
      "when should I shut down my startup",
      "how to know when to close a startup",
      "shutdown versus pivot startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-join-an-accelerator",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Join an Accelerator?",
    description:
      "YC, Techstars, and their peers offer capital, network, and credibility — in exchange for equity and three months of your company's direction. This page helps you decide whether the trade is worth it at your current stage.",
    primaryQuery: "Should I join YC or an accelerator?",
    secondaryQueries: [
      "is YC worth it for founders",
      "accelerator pros and cons startup",
      "should I apply to Techstars",
      "YC vs bootstrapping",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "An accelerator trades equity and autonomy for network, capital, and a forcing function. Is the forcing function what you need right now — or is it a distraction from the one thing that actually matters?",
    targetKeywords: [
      "should I join an accelerator",
      "should I apply to YC",
      "is YC worth it",
      "accelerator pros and cons",
      "YC vs bootstrapping",
      "Techstars worth it",
      "startup accelerator decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-cto-or-find-a-technical-cofounder",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Hire a CTO or Find a Technical Cofounder?",
    description:
      "The difference between a CTO and a technical cofounder is not just equity. It is ownership, alignment, trust, and what happens when the company hits a wall. This page helps you decide which relationship your company actually needs.",
    primaryQuery: "Should I hire a CTO or find a technical cofounder?",
    secondaryQueries: [
      "CTO vs technical cofounder",
      "how to find a technical cofounder",
      "when to hire a CTO",
      "non-technical founder needs CTO",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "niccolo-machiavelli",
      "marie-curie",
    ],
    hookQuestion:
      "A technical cofounder owns the problem with you. A CTO executes your vision. The question is whether you need a partner who will challenge your judgment or a leader who will build what you've decided to build.",
    targetKeywords: [
      "should I hire a CTO or find a technical cofounder",
      "CTO vs technical cofounder",
      "how to find a technical cofounder",
      "when to hire a CTO startup",
      "non-technical founder CTO",
      "technical cofounder equity",
      "finding a cofounder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-launch-now-or-wait-for-perfect",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Launch Now or Wait Until It's Ready?",
    description:
      "Launching too early wastes trust. Launching too late wastes time. This page helps you find the moment when the product is good enough to generate real signal — without optimizing for an imaginary user who never existed.",
    primaryQuery: "Should I launch now or wait until the product is ready?",
    secondaryQueries: [
      "when is a startup ready to launch",
      "launch early vs wait for product to be perfect",
      "MVP launch timing",
      "should I ship an MVP",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "marcus-aurelius",
      "marie-curie",
    ],
    hookQuestion:
      "Every day you wait, you are making a bet that what you will learn from users is worth less than what you will build in isolation. Is that bet right?",
    targetKeywords: [
      "should I launch now or wait",
      "when to launch a startup",
      "launch early vs wait for perfect",
      "MVP launch timing",
      "when is product ready to launch",
      "should I ship an MVP",
      "startup launch decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-form-an-llc-or-delaware-c-corp",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Form an LLC or Delaware C-Corp?",
    description:
      "Your legal structure is not administrative paperwork — it is a power decision that shapes who can invest, how equity works, and what your exit options look like. LLC and C-Corp are not two versions of the same thing with different names.",
    primaryQuery: "Should I form an LLC or Delaware C-Corp?",
    secondaryQueries: [
      "LLC vs Delaware C-Corp for startups",
      "when to incorporate as a C-Corp",
      "LLC vs C-Corp tax differences",
      "can investors invest in an LLC",
      "Delaware C-Corp benefits for startups",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "marie-curie",
    ],
    hookQuestion:
      "Legal structure is not a formality. It is the first decision that determines who can join you, on what terms, and how much of your future you have already given away. Which structure protects your optionality?",
    targetKeywords: [
      "should I form an LLC or Delaware C-Corp",
      "LLC vs C-Corp for startups",
      "Delaware C-Corp benefits",
      "when to incorporate as C-Corp",
      "LLC or C-Corp for funding",
      "startup legal structure decision",
    ],
  },
  {
    slug: "should-i-take-the-money-or-the-equity",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Take the Money or the Equity?",
    description:
      "When you're offered a choice between cash compensation and ownership stake, you're really being asked how much you believe in the upside and how much risk you can absorb today. The right answer depends on conviction, runway, and what kind of bet you're actually making.",
    primaryQuery: "Should I take the money or the equity?",
    secondaryQueries: [
      "cash vs equity compensation startup",
      "should I take lower salary for equity",
      "how to value startup equity offer",
      "is equity worth more than salary",
      "salary vs stock options startup job",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Cash is certain; equity is a bet. The question is not which is worth more on paper — it is whether you have the conviction and the runway to make the bet worthwhile.",
    targetKeywords: [
      "should I take money or equity",
      "cash vs equity startup compensation",
      "how to value equity offer",
      "salary vs equity tradeoff",
      "is startup equity worth it",
      "take lower salary for equity",
    ],
  },
  {
    slug: "should-i-pivot-to-ai-or-double-down-on-domain",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Pivot to AI or Double Down on My Domain?",
    description:
      "When a technology wave arrives, every founder faces pressure to pivot toward it. The question is whether AI is a genuine platform shift that changes what is possible in your domain, or whether chasing the trend means abandoning the competitive advantage you have already built.",
    primaryQuery: "Should I pivot to AI or double down on my domain?",
    secondaryQueries: [
      "should my startup add AI features",
      "when to pivot to AI",
      "is AI a distraction for my business",
      "how to know if AI is relevant to my startup",
      "pivot to AI vs stay focused",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "marie-curie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Every technology wave creates winners who focused and winners who pivoted. The question is not whether AI is real — it is whether it changes the fundamentals of what makes you competitive, or just the language you use to describe it.",
    targetKeywords: [
      "should I pivot to AI",
      "AI pivot startup decision",
      "when to add AI to your product",
      "AI vs domain expertise startup",
      "technology pivot decision",
      "double down or pivot to AI",
    ],
  },
  {
    slug: "should-i-build-in-public",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Build in Public?",
    description:
      "Building in public turns your development process into a distribution channel — but it also exposes your strategy and creates accountability you can't easily escape. The question is whether your stage, product, and competitive context make transparency an asset or a liability.",
    primaryQuery: "Should I build in public?",
    secondaryQueries: [
      "build in public strategy startup",
      "pros and cons building in public",
      "is building in public worth it",
      "indie hacker build in public",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "niccolo-machiavelli",
      "seneca",
    ],
    hookQuestion:
      "Transparency creates accountability and distribution — but it also exposes your thesis, your failures, and your timing to every competitor watching. Is the audience you're building worth the strategy you're revealing?",
    targetKeywords: [
      "should I build in public",
      "build in public strategy",
      "is building in public worth it",
      "indie hacker build in public",
      "transparency vs stealth startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-charge-from-day-one",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Charge for My Product from Day One?",
    description:
      "Charging early validates real demand but can slow adoption. Building free first maximizes users but delays real revenue signal. This page helps you decide whether your current stage, product maturity, and market justify charging now.",
    primaryQuery: "Should I charge for my product from day one?",
    secondaryQueries: [
      "when to start charging customers startup",
      "free vs paid business model",
      "freemium vs paid early stage",
      "charge from day one or wait",
    ],
    recommendedCouncil: [
      "marie-curie",
      "john-d-rockefeller",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Every user who doesn't pay tells you something, but not the same thing as a user who does. Are you optimizing for signal or scale?",
    targetKeywords: [
      "should I charge from day one",
      "when to start charging customers",
      "freemium vs paid early stage",
      "free vs paid business model",
      "pricing strategy early startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-split-equity-50-50-with-my-cofounder",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Split Equity 50/50 with My Cofounder?",
    description:
      "Equal equity seems fair, but equal splits can create governance deadlocks and obscure real contribution differences. Unequal splits signal hierarchy but can breed resentment. This page helps you decide which structure gives your company the best chance to survive disagreement.",
    primaryQuery: "Should I split equity 50/50 with my cofounder?",
    secondaryQueries: [
      "cofounder equity split",
      "how to divide equity between cofounders",
      "equal equity split startup pros cons",
      "vesting schedule cofounders",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "cicero",
    ],
    hookQuestion:
      "A 50/50 split assumes you and your cofounder are equal in value, commitment, and judgment — now and in three years. Is that assumption correct, or is it the comfortable answer that avoids a hard conversation?",
    targetKeywords: [
      "should I split equity 50/50",
      "cofounder equity split",
      "how to split equity cofounders",
      "equal equity split startup",
      "cofounder equity negotiation",
      "vesting schedule cofounders",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-raise-a-series-a",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I raise a Series A?",
    description:
      "Curie, Rockefeller, and Machiavelli debate whether your startup is actually ready for institutional capital — and whether the trade-off is worth it.",
    primaryQuery: "should I raise Series A",
    secondaryQueries: [
      "series a funding readiness",
      "when to raise venture capital",
      "startup growth stage funding",
    ],
    recommendedCouncil: [
      "marie-curie",
      "john-d-rockefeller",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Is your traction real enough to survive the Series A due diligence?",
    targetKeywords: [
      "should I raise Series A",
      "series a readiness",
      "venture capital decision",
      "startup funding stages",
    ],
  },
  {
    slug: "should-i-sign-this-term-sheet",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I sign this term sheet?",
    description:
      "Machiavelli, Cicero, and Marcus Aurelius dissect the power dynamics and obligations hidden in venture term sheets.",
    primaryQuery: "should I sign this term sheet",
    secondaryQueries: [
      "term sheet negotiation",
      "vc term sheet red flags",
      "founder equity protection",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "cicero",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Do you understand every clause, or are you signing under pressure?",
    targetKeywords: [
      "should I sign term sheet",
      "vc term sheet negotiation",
      "startup fundraising terms",
      "founder equity dilution",
    ],
  },
  {
    slug: "should-i-go-remote-or-in-person",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I go remote or in-person?",
    description:
      "Marcus Aurelius, Benjamin Franklin, and Florence Nightingale debate what the research and history actually say about where teams do their best work.",
    primaryQuery: "should I go remote or in-person",
    secondaryQueries: [
      "remote vs in-person work",
      "startup office culture",
      "distributed team productivity",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "benjamin-franklin",
      "florence-nightingale",
    ],
    hookQuestion:
      "Is your remote policy built on evidence or on what worked for someone else's culture?",
    targetKeywords: [
      "remote vs in-person work",
      "startup team structure",
      "distributed team performance",
      "office vs remote productivity",
    ],
  },
  {
    slug: "should-i-launch-on-product-hunt",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Launch on Product Hunt?",
    description:
      "Steve Jobs, Benjamin Franklin, and Julius Caesar debate whether Product Hunt is the right launch venue for your product — and what separates a launch that creates lasting momentum from one that produces a single good day.",
    primaryQuery: "should I launch on Product Hunt",
    secondaryQueries: [
      "product hunt launch strategy",
      "how to launch successfully on Product Hunt",
      "is Product Hunt worth it for startups",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "benjamin-franklin",
      "julius-caesar",
    ],
    hookQuestion:
      "A Product Hunt launch creates a permanent public record. Are you prepared to win — or just prepared to show up?",
    targetKeywords: [
      "should I launch on Product Hunt",
      "product hunt launch strategy",
      "how to win on Product Hunt",
      "is Product Hunt worth it",
      "product hunt tips for founders",
      "startup launch channel",
    ],
  },
  {
    slug: "should-i-offer-a-free-tier",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Offer a Free Tier?",
    description:
      "Steve Jobs, Andrew Carnegie, and Marcus Aurelius debate whether a free tier builds the moat you need — or defers the pricing conviction your business requires.",
    primaryQuery: "should I offer a free tier",
    secondaryQueries: [
      "freemium vs paid pricing strategy",
      "should my startup have a free plan",
      "free tier pros and cons SaaS",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "andrew-carnegie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "A free tier is either a deliberate customer acquisition engine or a way to avoid asking whether anyone will pay. Which one are you building?",
    targetKeywords: [
      "should I offer a free tier",
      "freemium vs paid SaaS",
      "free plan pricing strategy",
      "product led growth free tier",
      "when to offer free plan startup",
      "free tier conversion rate",
    ],
  },
  {
    slug: "should-i-rebrand",
    status: "shipped",
    shippedAt: "2026-05-12",
    title: "Should I Rebrand?",
    description:
      "Steve Jobs, Marcus Aurelius, and Niccolò Machiavelli debate when rebranding closes the gap between your product and its perception — and when it is a distraction from the real work.",
    primaryQuery: "should I rebrand my startup",
    secondaryQueries: [
      "when to rebrand a company",
      "startup rebrand decision",
      "how to know if you need to rebrand",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A rebrand can clarify an identity that has become obscured — or obscure an identity that was never built. Which situation are you in?",
    targetKeywords: [
      "should I rebrand my startup",
      "when to rebrand a company",
      "startup rebranding strategy",
      "how to rebrand a business",
      "brand identity change decision",
      "rebranding pros and cons",
    ],
  },
  {
    slug: "should-i-hire-a-vp-of-sales",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I hire a VP of Sales?",
    description:
      "Carnegie, Machiavelli, and Marcus Aurelius debate whether hiring a VP of Sales actually solves a sales problem — or whether it is a proxy for a product-market fit problem you are not ready to face.",
    primaryQuery: "should I hire a VP of Sales",
    secondaryQueries: [
      "when to hire VP of sales startup",
      "VP of sales too early",
      "sales leadership startup decision",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Are you hiring for a sales problem or a product-market fit problem? The answer changes everything.",
    targetKeywords: [
      "should I hire VP of sales",
      "VP of sales timing startup",
      "when to hire sales leader",
      "startup sales hiring decision",
      "first sales hire startup",
    ],
  },
  {
    slug: "should-i-go-full-time-on-my-startup",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I go full-time on my startup?",
    description:
      "Steve Jobs, Marcus Aurelius, and Marie Curie debate the signal threshold for going all-in on a startup — what evidence is enough, and when the leap is a rational bet rather than wishful thinking.",
    primaryQuery: "should I go full-time on my startup",
    secondaryQueries: [
      "when to quit job and start company",
      "full time startup decision",
      "leaving job for startup risk",
    ],
    recommendedCouncil: [
      "steve-jobs",
      "marcus-aurelius",
      "marie-curie",
    ],
    hookQuestion:
      "Do you have enough evidence to justify the bet, or are you making a leap of faith at the wrong moment?",
    targetKeywords: [
      "should I go full-time startup",
      "when to quit job for startup",
      "full time vs side project startup",
      "leaving job to start a company",
      "startup commitment decision",
    ],
  },
  {
    slug: "should-i-do-a-seed-extension",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I do a seed extension?",
    description:
      "Machiavelli, Marie Curie, and Marcus Aurelius debate the real signal behind the seed extension question — whether it is a bridge to the next milestone or a delay that avoids a harder truth.",
    primaryQuery: "should I do a seed extension",
    secondaryQueries: [
      "seed extension vs Series A",
      "bridge round decision startup",
      "when to extend your seed round",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marie-curie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Is the runway you are buying worth the dilution and the delay in facing what the data is telling you?",
    targetKeywords: [
      "should I do a seed extension",
      "seed extension round",
      "bridge round startup decision",
      "when to extend seed funding",
      "pre-Series A bridge round",
    ],
  },
  {
    slug: "should-i-open-source-my-product",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I open-source my product?",
    description:
      "Alexander the Great, Marie Curie, and Niccolo Machiavelli examine when open-sourcing creates moat versus when it destroys competitive advantage — and the four conditions that determine which outcome you will get.",
    recommendedCouncil: ["alexander-the-great", "marie-curie", "niccolo-machiavelli"],
    hookQuestion:
      "Are you open-sourcing to build distribution, or because you have no other plan to get users?",
    primaryQuery: "should I open source my product",
    secondaryQueries: [
      "open source vs proprietary startup",
      "open source business model",
      "when to open source your startup",
      "open core business model decision",
    ],
    targetKeywords: [
      "should I open source my product",
      "open source vs proprietary startup",
      "open source business model",
      "when to open source your startup",
      "open core business model decision",
    ],
  },
  {
    slug: "should-i-expand-internationally",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I expand internationally?",
    description:
      "Cleopatra VII, Sun Tzu, and Isaac Newton examine whether international expansion is a growth multiplier or a focus destroyer — and the five signals that indicate you are ready versus the three that indicate you are running from a domestic problem.",
    recommendedCouncil: ["cleopatra-vii", "sun-tzu", "isaac-newton"],
    hookQuestion:
      "Is international expansion creating a new front for growth, or is it escaping the hard work of saturating your home market?",
    primaryQuery: "should I expand internationally startup",
    secondaryQueries: [
      "international expansion timing startup",
      "when to go international startup",
      "global expansion startup strategy",
      "startup international market entry",
    ],
    targetKeywords: [
      "should I expand internationally startup",
      "international expansion timing startup",
      "when to go international startup",
      "global expansion startup strategy",
      "startup international market entry",
    ],
  },
  {
    slug: "should-i-use-ai-in-my-business",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Use AI in My Business?",
    description:
      "The question is not whether to use AI — it is which problems AI solves better than your current approach, and which problems it makes worse. This page cuts through the hype to help you identify the right integration point for your business today.",
    primaryQuery: "should I use AI in my business",
    secondaryQueries: [
      "how to use AI in small business",
      "AI tools for startups",
      "is AI worth it for small business",
      "when to adopt AI tools business",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "marie-curie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "AI can automate the wrong things as efficiently as the right ones. Before you integrate, can you name the specific problem AI solves better than your current approach — and what you will do with the time or cost you save?",
    targetKeywords: [
      "should I use AI in my business",
      "how to use AI in small business",
      "AI tools for startups",
      "AI adoption business decision",
      "when to use AI startup",
    ],
  },
  {
    slug: "should-i-raise-pre-seed",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Raise Pre-Seed Funding?",
    description:
      "Pre-seed capital changes the game — or it changes the clock. This page examines what conditions justify taking on investors before you have product-market fit, and what alternatives you should exhaust first.",
    primaryQuery: "should I raise pre-seed funding",
    secondaryQueries: [
      "pre-seed round startup",
      "what is pre-seed funding",
      "should I get pre-seed investment",
      "pre-seed vs bootstrapping",
      "how to raise pre-seed",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "marie-curie",
    ],
    hookQuestion:
      "Pre-seed capital buys you time and signal, but it also locks in expectations before you have real data. Have you exhausted customer-funded options first?",
    targetKeywords: [
      "should I raise pre-seed funding",
      "pre-seed round startup",
      "pre-seed vs bootstrapping",
      "pre-seed funding requirements",
      "raise pre-seed investment",
    ],
  },
  {
    slug: "should-i-launch-in-stealth-mode",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Launch in Stealth Mode?",
    description:
      "Stealth mode protects a fragile idea from premature critique — but it also delays the feedback that would tell you whether the idea is worth protecting. This page examines the real tradeoffs of building in private versus building in public.",
    primaryQuery: "should I launch in stealth mode",
    secondaryQueries: [
      "stealth startup pros cons",
      "stealth vs public launch startup",
      "should I keep my startup secret",
      "build in stealth mode",
      "stealth mode startup strategy",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "niccolo-machiavelli",
      "isaac-newton",
    ],
    hookQuestion:
      "Stealth buys you time to build something you believe in — but it also delays the day you find out if anyone else believes in it. What does the extra time cost you in real feedback?",
    targetKeywords: [
      "should I launch in stealth mode",
      "stealth startup strategy",
      "stealth vs public launch",
      "build in stealth startup",
      "stealth mode advantages startup",
    ],
  },
  {
    slug: "should-i-pivot-my-startup",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Pivot My Startup?",
    description:
      "Pivoting means abandoning what you know is not working and committing to something you believe might work — before you have evidence it will. Every major startup pivot combines two decisions: recognizing that the current trajectory is structurally broken, and choosing which adjacent opportunity to bet on. History's most decisive figures held both of these decisions to very different standards.",
    primaryQuery: "should I pivot my startup",
    secondaryQueries: [
      "when to pivot vs persist",
      "startup pivot decision framework",
      "how to know when to pivot",
      "startup pivot examples lessons",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "thomas-edison",
      "epictetus",
    ],
    hookQuestion:
      "Your current product is generating revenue but not growing. The market is real but smaller than you thought. You have 9 months of runway. The question is whether to double down, pivot to an adjacent opportunity, or shut it down.",
    targetKeywords: [
      "should I pivot my startup",
      "when to pivot a startup",
      "startup pivot decision",
      "how to pivot a startup",
      "pivot vs persist startup",
    ],
  },
  {
    slug: "should-i-take-series-a-investment",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Take Series A Investment?",
    description:
      "A Series A round means committing to a venture-scale growth trajectory with institutional oversight, board seats, and performance expectations that cannot be walked back. The decision is not just about whether you can raise the money — it is about whether the venture-scale path is the right path for what you are building, and whether you want to live inside the institutional structure that comes with it.",
    primaryQuery: "should I take Series A investment",
    secondaryQueries: [
      "Series A fundraising decision",
      "when to raise Series A",
      "Series A vs bootstrapping",
      "is Series A right for my startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You have product-market fit at a small scale, growing 15% month-over-month, $40k MRR. Two top-tier VCs have reached out. Raising $3-5M would let you hire a sales team and a CTO. Not raising means slower growth but you keep control and profitability. The decision is whether to bet on venture-scale or optimize for a smaller, profitable outcome.",
    targetKeywords: [
      "should I take Series A investment",
      "Series A fundraising decision",
      "when to raise Series A round",
      "venture capital Series A timing",
      "should I take VC money Series A",
    ],
  },
  {
    slug: "should-i-fire-a-cofounder",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Fire My Cofounder?",
    description:
      "Firing a cofounder is simultaneously a personal decision, a business decision, and a legal decision. The personal difficulty is that cofounders are often close friends or long-term partners. The business difficulty is that removing a cofounder mid-stage can create instability at the worst possible time. The legal difficulty is that equity, IP assignments, and vesting cliffs are all in play. History's most decisive figures approached this kind of decision with very different weights on each dimension.",
    primaryQuery: "should I fire my cofounder",
    secondaryQueries: [
      "how to remove a cofounder",
      "cofounder conflict resolution",
      "when to fire a cofounder",
      "cofounder breakup startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "abraham-lincoln",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Your cofounder has stopped contributing but still holds 40% of the company. They are not technically a co-founder — they are a liability. Every conversation ends the same way. The investors have noticed. The team has noticed. You have been rationalizing this for six months.",
    targetKeywords: [
      "should I fire my cofounder",
      "how to remove a cofounder",
      "cofounder firing guide",
      "when to let go of cofounder",
      "startup cofounder conflict",
    ],
  },
  {
    slug: "should-i-charge-more-for-my-product",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Charge More for My Product?",
    description:
      "Raising prices is the highest-leverage pricing move a founder can make — and the one most founders are most afraid of. The fear is usually about losing customers. The reality is that underpricing destroys margin, signals low quality, and attracts price-sensitive customers who churn first. History's most successful builders charged what their product was actually worth. The question is not whether to charge more — it is whether you have the nerve to do it.",
    primaryQuery: "should I charge more for my product",
    secondaryQueries: [
      "when to raise prices startup",
      "SaaS pricing strategy",
      "how to raise prices without losing customers",
      "pricing power startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Your NPS is 72. Churn is low. Customers tell you it's essential. You are charging $29/mo and your three largest competitors charge $149-299/mo. Your entire team is paid below market because you 'can't afford it yet.' The question is: why are you still charging $29?",
    targetKeywords: [
      "should I raise my prices",
      "when to charge more for product",
      "SaaS pricing increase",
      "how to raise prices without losing customers",
      "pricing strategy startup",
    ],
  },
  {
    slug: "should-i-enter-international-markets",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Enter International Markets Now?",
    description:
      "International expansion is one of the highest-variance strategic decisions a founder makes. It can 3-5x your addressable market in 12 months or consume two years of engineering and sales attention with minimal return. The decision depends entirely on where your current growth is coming from, whether the new market will respond to your existing product and positioning, and whether your team is operationally capable of managing the added complexity.",
    primaryQuery: "should I enter international markets",
    secondaryQueries: [
      "when to expand to new markets startup",
      "international market entry strategy",
      "how to expand to new markets",
      "global expansion startup timing",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "alexander-the-great",
      "julius-caesar",
    ],
    hookQuestion:
      "You are growing 8% month-over-month in the US. Three customers from Europe found you organically and converted immediately. An investor is willing to fund a European expansion. The question is whether to go now or wait until you have fully captured the domestic market.",
    targetKeywords: [
      "should I enter international markets",
      "international market entry strategy",
      "when to expand to new markets startup",
      "how to enter new markets",
      "global expansion startup timing",
    ],
  },
  {
    slug: "should-i-take-on-a-co-founder",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Take on a Co-Founder?",
    description:
      "The co-founder decision is one of the highest-variance choices in a startup. A well-matched co-founder doubles execution speed, provides cognitive coverage you lack, and creates emotional resilience in the hard periods. A mismatched one creates equity disputes, alignment failures, and eventual legal complexity at the worst possible time. The historical evidence suggests the decision is less about capability and more about values alignment under conditions of extended adversity.",
    primaryQuery: "should I take on a co-founder",
    secondaryQueries: [
      "do I need a co-founder startup",
      "solo founder vs co-founder",
      "should I find a co-founder",
      "benefits of co-founder startup",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "andrew-carnegie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You have been building solo for 8 months and have $3K MRR. A talented person you respect wants to join as a 50/50 co-founder. They bring skills you lack (they are technical; you are sales-focused). You would need to give up half the equity and half the decision-making authority. You have been moving fast solo; adding a partner will require coordination overhead. Do you take them on?",
    targetKeywords: [
      "should I take on a co-founder",
      "solo founder vs co-founder decision",
      "do I need a co-founder",
      "finding a co-founder startup",
      "co-founder equity split decision",
    ],
  },
  {
    slug: "should-i-productize-my-consulting",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Productize My Consulting?",
    description:
      "Productizing a consulting practice means trading the unlimited upside of custom client work for the repeatability of a defined scope and price. The productized service has smaller deal sizes but eliminates proposal cycles, scope creep, and the feast/famine revenue pattern. The transition requires identifying which part of your work is genuinely repeatable — and being honest about whether you are productizing because you want leverage, or because you are avoiding the harder challenge of finding better clients.",
    primaryQuery: "should I productize my consulting",
    secondaryQueries: [
      "consulting to product startup",
      "productized service vs consulting",
      "how to productize consulting",
      "turning consulting into a product",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "archimedes",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You have been doing custom consulting at $8K per engagement. You have noticed that 70% of every project involves the same 5-step process. You could productize it at $2K with a defined scope and 5-day turnaround, or continue custom work at $8K with 4-week timelines. Productizing would let you run 3-4 per month instead of 1-2. But you would lose the high-complexity work that keeps your skills sharp.",
    targetKeywords: [
      "should I productize my consulting",
      "productized consulting service",
      "consulting to product transition",
      "productized service strategy",
      "consulting to SaaS",
    ],
  },
  {
    slug: "should-i-hire-contractors-or-employees",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Contractors or Full-Time Employees?",
    description:
      "The contractor vs. employee decision determines your organizational flexibility, your IP ownership, your management overhead, and your culture-building trajectory. Contractors give you speed and optionality; employees give you depth, loyalty, and institutional knowledge. The right answer depends on whether the work is repeatable and ownable enough to justify the full-time cost structure — and whether you can afford to train someone who will still be there in 18 months.",
    primaryQuery: "should I hire contractors or full-time employees",
    secondaryQueries: [
      "contractors vs employees startup",
      "when to hire full-time vs contractor",
      "freelancers vs employees for startups",
      "should I use contractors for my startup",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You need to ship a new feature in 6 weeks. You can hire a contractor for $12K who is available now, or start the process of hiring a full-time engineer at $150K/year who will take 8 weeks to onboard. The contractor has done this work before. The full-time hire will still be with you in two years. What do you do?",
    targetKeywords: [
      "should I hire contractors or employees",
      "contractors vs employees startup",
      "when to hire full time developer",
      "freelancer vs employee decision",
      "startup hiring strategy contractors",
    ],
  },
  {
    slug: "should-i-add-a-paid-tier",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Add a Paid Tier to My Free Product?",
    description:
      "Adding a paid tier to a free product is a monetization architecture decision. It requires deciding what features belong behind the paywall, how to sequence the free-to-paid conversion moment, and whether your free-tier users are a distribution asset or a cost center. Done well, a freemium model creates a self-funding acquisition machine. Done poorly, it splits your product attention between two audiences whose needs diverge and creates a conversion wall that neither converts nor disappears.",
    primaryQuery: "should I add a paid tier to my free product",
    secondaryQueries: [
      "freemium monetization strategy",
      "how to add paid features",
      "when to charge for free product",
      "freemium vs premium startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "marie-curie",
    ],
    hookQuestion:
      "You have 2,000 active free users. Monthly retention is 65%. You are considering adding a $15/mo paid tier with 3 premium features your power users have been requesting. Your concern is that adding a paywall will reduce activation for new users and create negative sentiment among existing free users. Do you add the paid tier now?",
    targetKeywords: [
      "should I add a paid tier",
      "freemium model decision",
      "when to charge for free product",
      "add monetization to free app",
      "freemium vs free product",
    ],
  },
  {
    slug: "should-i-outsource-development",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Outsource My Product Development?",
    description:
      "Outsourcing development trades speed and cost for control, quality predictability, and institutional knowledge. For a non-technical founder building a first version, outsourcing can be the fastest path to a working prototype. For a technical product with complex requirements and ongoing iteration needs, it often creates a dependency that is expensive and painful to unwind. The decision turns on how much of the product is genuinely commodity work versus proprietary logic that must live inside the company.",
    primaryQuery: "should I outsource product development",
    secondaryQueries: [
      "outsourcing development vs in-house",
      "should I hire a dev agency",
      "offshore development pros cons startup",
      "outsource vs build in-house",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "archimedes",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You are a non-technical founder with $80K in pre-seed funding. You need a working MVP in 4 months. You can hire an offshore agency for $40K that has built similar products, or spend $60K recruiting and onboarding a full-time engineer who won't be productive for 6 weeks. The agency will deliver something working. The engineer will still be there in year 2. What do you do?",
    targetKeywords: [
      "should I outsource product development",
      "outsource development startup",
      "hire dev agency vs in-house",
      "offshore development startup",
      "outsource vs hire engineer",
    ],
  },
  {
    slug: "should-i-get-a-business-mentor",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Get a Business Mentor?",
    description:
      "A great mentor compresses years of hard-won pattern recognition into hours of conversation — but only if the match is right and both parties are genuinely committed. Mismatched mentorship wastes time, creates false confidence, and can anchor you to frameworks that don't fit your context. The decision turns on whether you have specific enough questions to make a senior person's time useful, and whether you can distinguish advice worth taking from advice given reflexively from someone else's experience.",
    primaryQuery: "should I get a business mentor",
    secondaryQueries: [
      "how to find a startup mentor",
      "business mentor worth it",
      "should I hire a coach or find a mentor",
      "mentorship for founders",
      "startup mentor vs advisor",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "andrew-carnegie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "A founder you admire has offered to mentor you — monthly 1-on-1s for a year. Their company is 10x larger than yours and in an adjacent space. The meetings cost you 2 hours each (prep + call). You're at a stage where you're mostly figuring things out by doing, not by asking. Do you take the mentorship?",
    targetKeywords: [
      "should I get a business mentor",
      "startup mentor worth it",
      "how to find a founder mentor",
      "mentorship for early stage founders",
      "business mentor vs coach",
    ],
  },
  {
    slug: "should-i-invest-in-paid-advertising",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Invest in Paid Advertising?",
    description:
      "Paid advertising buys velocity — results in weeks rather than months. Organic channels compound over time but require patience and produce returns that are hard to predict and impossible to instantly scale. The real decision is not which channel is better in the abstract, but whether your unit economics can support paid acquisition at your current conversion rates, and whether you have the operational maturity to iterate on ad creative and landing pages fast enough to make paid profitable.",
    primaryQuery: "should I invest in paid advertising",
    secondaryQueries: [
      "paid ads vs organic marketing",
      "when to start running ads startup",
      "Google ads vs content marketing",
      "paid acquisition vs SEO",
      "should I run Facebook ads startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "florence-nightingale",
    ],
    hookQuestion:
      "You have $20K in marketing budget. Your CAC from SEO and word-of-mouth is $40. You could put $15K into Google and Meta ads and potentially scale 5x — or put $15K into content and community, which takes 6 months to compound. Paid ads would show results in 2 weeks. What do you do?",
    targetKeywords: [
      "should I invest in paid advertising",
      "paid ads vs organic startup",
      "when to start paid ads",
      "Google ads for startups",
      "paid vs organic customer acquisition",
    ],
  },
  {
    slug: "should-i-build-an-advisory-board",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build an Advisory Board?",
    description:
      "An advisory board can open doors, add credibility, and provide pattern recognition you have not yet earned. But advisors cost equity, require time to manage, and rarely deliver proportional value after the first few introductions. The decision hinges on whether you are buying genuine access and insight — or buying the appearance of legitimacy at a price that will compound as the company grows.",
    primaryQuery: "should I build an advisory board",
    secondaryQueries: [
      "startup advisory board worth it",
      "how to build advisory board",
      "advisors vs board of directors",
      "startup advisors equity",
      "should I get startup advisors",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "julius-caesar",
    ],
    hookQuestion:
      "Three well-connected people have offered to be advisors. One is a former VP at Stripe, one is a well-known founder in your space, one is a serial investor. Each wants 0.25% equity with 2-year vesting. Your company is 14 months old and pre-Series A. Do you build this advisory board?",
    targetKeywords: [
      "should I build an advisory board",
      "startup advisors equity worth it",
      "advisory board for startups",
      "startup advisors vs mentors",
      "how much equity for startup advisor",
    ],
  },
  {
    slug: "should-i-build-for-enterprise-or-smb",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build for Enterprise or SMB?",
    description:
      "Enterprise deals carry higher ACV and lower churn, but they come with longer sales cycles, compliance overhead, and a roadmap held hostage to a handful of large customers. SMB lets you ship fast, validate quickly, and build a broad base — but the ceiling is lower and the churn is higher. The decision turns on whether your current product and team can sustain the operational weight of enterprise, and whether your unit economics actually work at the SMB price point at scale.",
    primaryQuery: "should I build for enterprise or SMB",
    secondaryQueries: [
      "enterprise vs SMB startup",
      "target market enterprise vs small business",
      "should I go upmarket",
      "SMB vs enterprise SaaS",
      "startup market segmentation",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "sun-tzu",
    ],
    hookQuestion:
      "Your product has 200 SMB customers paying $99/month and 3 enterprise prospects in a 6-month sales cycle for $30K ARR deals. If you fully optimize for enterprise, you'll need a dedicated sales team, longer roadmap cycles, and custom compliance work. If you stay SMB, you can ship faster but your ceiling is lower. Do you go up-market?",
    targetKeywords: [
      "should I build for enterprise or SMB",
      "enterprise vs SMB SaaS decision",
      "go upmarket startup",
      "SMB vs enterprise target market",
      "startup enterprise sales decision",
    ],
  },
  {
    slug: "should-i-take-on-technical-debt",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Take On Technical Debt?",
    description:
      "Strategic debt is a deliberate resource trade — you borrow time now and pay it back later with interest. The problem is that most technical debt is not strategic; it is entropy that compounds invisibly until it breaks the system at the worst possible moment. The decision turns on whether you are making a conscious tradeoff with a clear repayment plan, or rationalizing shortcuts that will eventually force a rewrite at the cost of your roadmap.",
    primaryQuery: "should I take on technical debt",
    secondaryQueries: [
      "when to take technical debt",
      "technical debt vs moving fast",
      "refactor vs ship new features",
      "startup technical debt decision",
      "build fast vs build right",
    ],
    recommendedCouncil: [
      "archimedes",
      "nikola-tesla",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Your engineering team wants 6 weeks to refactor the auth system before the next major feature. The CEO wants to ship the next feature in 2 weeks using a quick-and-dirty auth approach. The quick approach works for now but creates 3 months of cleanup later. You have a board meeting in 3 months where growth metrics matter more than code quality. What do you decide?",
    targetKeywords: [
      "should I take on technical debt",
      "technical debt startup decision",
      "when to ship vs refactor",
      "build fast vs build right",
      "startup technical debt worth it",
    ],
  },
  {
    slug: "should-i-accept-this-strategic-partnership",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Accept This Strategic Partnership?",
    description:
      "A large-company partnership can give you distribution you cannot afford to build yourself and a credibility signal that shortens every other sales cycle. But it can also create customer concentration risk that puts your entire ARR at the mercy of one relationship, erode your negotiating power as dependency deepens, and obscure whether you actually have product-market fit or just channel fit. The decision turns on whether you can survive year 2 if the deal disappears, and whether the partnership makes you stronger or just larger.",
    primaryQuery: "should I accept a strategic partnership",
    secondaryQueries: [
      "strategic partnership startup decision",
      "should I partner with a larger company",
      "partnership vs staying independent",
      "co-marketing partnership startup",
      "strategic alliance decision",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "julius-caesar",
      "cleopatra-vii",
    ],
    hookQuestion:
      "A company 10x your size wants to resell your product to their 50K customer base. The deal gives you 30% revenue share, but they become your largest customer at 40% of your ARR and have co-branding rights. They'll drive distribution you can't afford, but if they pull the deal in year 2, you're in trouble. Do you take it?",
    targetKeywords: [
      "should I accept a strategic partnership",
      "strategic partnership startup pros cons",
      "should I partner with a larger company",
      "customer concentration risk startup",
      "co-marketing partnership decision",
    ],
  },
  {
    slug: "should-i-focus-on-profitability-or-growth",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Optimize for Profitability or Growth Right Now?",
    description:
      "The profitability-vs-growth tension is really a question about which resource constraint you are betting on: capital availability or market timing. If capital markets are tight and your runway is short, profitability is not a strategic choice — it is a survival requirement. If a competitor is gaining ground in your category and the window to establish market position is closing, burning toward growth may be the only rational bet. The decision turns on your honest read of the competitive landscape, your current burn rate relative to traction, and whether the market will still be there if you arrive profitably but late.",
    primaryQuery: "should I focus on profitability or growth",
    secondaryQueries: [
      "profitability vs growth startup",
      "should I optimize for profit or scale",
      "when to focus on profitability startup",
      "growth at all costs vs sustainable business",
      "burn rate vs profitability decision",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "sun-tzu",
    ],
    hookQuestion:
      "Am I at a stage where I should prioritize being profitable or prioritize growing fast?",
    targetKeywords: [
      "should I focus on profitability or growth",
      "profitability vs growth startup",
      "when to prioritize profit over growth",
      "startup profitability decision",
      "growth vs sustainability startup",
    ],
  },
  {
    slug: "should-i-build-a-community-around-my-product",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build a Community Around My Product?",
    description:
      "Community is one of the most durable moats in software — but it can also be a massive distraction from building the product itself. The question is whether community is your growth mechanism or your avoidance mechanism.",
    primaryQuery: "should I build a community around my product",
    secondaryQueries: [
      "building a community around your product",
      "product community as growth strategy",
      "should startups invest in community building",
      "community-led growth vs product-led growth",
      "when to build a user community startup",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "niccolo-machiavelli",
      "andrew-carnegie",
    ],
    hookQuestion:
      "Is community the right growth strategy for my product right now?",
    targetKeywords: [
      "should I build a community around my product",
      "product community growth strategy",
      "community-led growth startup",
      "building user community startup",
      "community moat software product",
    ],
  },
  {
    slug: "should-i-do-content-marketing-or-paid-ads",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Content Marketing or Paid Ads?",
    description:
      "Content marketing compounds over time but takes months to pay off. Paid ads give immediate signal but die the moment you stop paying. The choice is really a question about which resource you're more scarce on: time or capital.",
    primaryQuery: "should I do content marketing or paid ads",
    secondaryQueries: [
      "content marketing vs paid advertising startup",
      "SEO vs paid ads for growth",
      "should I invest in content or ads",
      "organic vs paid growth strategy",
      "content marketing ROI vs paid ads ROI",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "john-d-rockefeller",
      "florence-nightingale",
    ],
    hookQuestion:
      "Should I invest in content marketing or paid advertising to grow my startup?",
    targetKeywords: [
      "should I do content marketing or paid ads",
      "content marketing vs paid advertising",
      "organic vs paid growth startup",
      "SEO vs ads startup decision",
      "content marketing ROI startup",
    ],
  },
  {
    slug: "should-i-raise-a-series-b",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Raise a Series B?",
    description:
      "Series B is where the narrative shifts from 'proving the model' to 'scaling what works.' The question is whether you actually have something worth scaling at the rate that Series B capital demands.",
    primaryQuery: "should I raise a Series B",
    secondaryQueries: [
      "when to raise Series B funding",
      "Series B readiness checklist",
      "should I raise Series B or stay lean",
      "Series B vs staying bootstrapped after Series A",
      "how to know if you are ready for Series B",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "sun-tzu",
    ],
    hookQuestion:
      "Am I ready to raise a Series B?",
    targetKeywords: [
      "should I raise a Series B",
      "Series B funding decision",
      "when to raise Series B",
      "Series B readiness startup",
      "scaling after Series A decision",
    ],
  },
  {
    slug: "should-i-build-a-mobile-app",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build a Mobile App or Stay Web-Only?",
    description:
      "The mobile-vs-web decision is almost always a distribution question dressed up as a technology question. Mobile apps unlock push notifications, home screen presence, and app store discovery, but they add a costly development surface (two platforms, app store review cycles, forced upgrades) and increase the barrier to first use. Web-only keeps the surface area small and lets you ship faster, but you lose the retention levers that come with native mobile. The decision turns on where your users spend their time, whether your core use case requires offline access or device hardware, and whether your business model depends on low-friction repeat engagement or one-time conversion.",
    primaryQuery: "should I build a mobile app or web app",
    secondaryQueries: [
      "mobile app vs web app startup",
      "should I build a native mobile app",
      "web-only vs mobile first startup",
      "when to build a mobile app startup",
      "mobile app vs progressive web app",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Should I invest in a mobile app now, or will a web experience get me further faster?",
    targetKeywords: [
      "should I build a mobile app",
      "mobile app vs web app startup",
      "native app vs web startup decision",
      "when to build mobile app startup",
      "mobile first vs web first startup",
    ],
  },
  {
    slug: "should-i-file-a-patent",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I File a Patent for My Invention?",
    description:
      "Patents are moats for some businesses and distractions for most. In hardware, biotech, and regulated industries, a strong patent portfolio creates durable barriers and signals credibility to investors. In software and fast-moving consumer markets, the pace of iteration often outstrips the 18-month pendency of patent applications, and enforcement requires the kind of legal budget most early-stage companies cannot afford. Filing provisionals can cheaply preserve priority dates while you validate the market. The decision turns on whether your competitive advantage is a specific invention (defensible) or execution and distribution (where patents add little), and whether you are building a business that will eventually be acquired or licensed.",
    primaryQuery: "should I file a patent for my startup",
    secondaryQueries: [
      "patent vs trade secret startup",
      "should startups apply for patents",
      "when to file a patent early stage company",
      "provisional patent application startup",
      "IP strategy for startups",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "marie-curie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Is filing a patent worth the time and money at my current stage?",
    targetKeywords: [
      "should I file a patent startup",
      "patent strategy early stage company",
      "provisional patent startup",
      "when to patent your invention startup",
      "startup IP protection strategy",
    ],
  },
  {
    slug: "should-i-set-up-a-referral-program",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Set Up a Referral Program?",
    description:
      "Referral programs are one of the few growth channels that compound: each new user becomes a potential acquisition vector. But a referral program only works if your product already has users who are genuinely enthusiastic, and the incentive structure has to reward behavior you actually want — not just signups that churn. The mechanics matter as much as the concept: one-sided incentives attract opportunists, two-sided incentives build loyalty, and the wrong reward can cheapen the recommendation. The decision turns on whether your existing retention is strong enough to make word-of-mouth credible and whether the unit economics of a referred user justify the referral cost.",
    primaryQuery: "should I set up a referral program",
    secondaryQueries: [
      "how to build a referral program for a startup",
      "referral program vs paid acquisition",
      "when to launch a referral program",
      "referral program incentive structure",
      "does a referral program increase growth",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Is my product ready to grow through referrals, or am I building a program before I've earned the recommendation?",
    targetKeywords: [
      "should I set up a referral program",
      "referral program startup growth",
      "how to build a referral program",
      "referral incentive structure startup",
      "word of mouth growth strategy",
    ],
  },
  {
    slug: "should-i-change-my-pricing-model",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Change My Pricing Model?",
    description:
      "Pricing is not just a revenue lever — it encodes what you believe about who your customer is, what value they receive, and how much of that value you can capture. Changing pricing mid-stream is dangerous because it resets expectations for existing customers and can trigger churn spikes that obscure whether the new model is actually better. The signal that a pricing change is warranted is usually found in conversion data (prospects who want your product but stall on price) or in NRR (customers who grow but whose spend doesn't grow with them). The question is whether you are leaving money on the table with current customers, repelling the right new customers, or both.",
    primaryQuery: "should I change my pricing model",
    secondaryQueries: [
      "when to change your startup pricing",
      "subscription vs usage-based pricing",
      "how to reprice a SaaS product",
      "pricing model change impact on churn",
      "freemium vs paid tier pricing decision",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Is my current pricing model costing me customers, revenue, or both?",
    targetKeywords: [
      "should I change my pricing model",
      "startup pricing model decision",
      "subscription vs usage-based pricing startup",
      "when to reprice your product",
      "SaaS pricing strategy change",
    ],
  },
  {
    slug: "should-i-hire-a-head-of-marketing",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Head of Marketing?",
    description:
      "A head of marketing is not a solution to not having a growth strategy — it is an amplifier of one you already have. Hired too early, they spend their first six months building from scratch without enough product, budget, or customer data to be effective, and they leave before the work compounds. Hired too late, you burn growth capital on paid channels without the brand architecture or content infrastructure to make any of it efficient. The right moment is when you have found at least one repeatable acquisition channel, have enough budget to give a marketing leader real leverage, and need someone who can build a team rather than execute tactics.",
    primaryQuery: "should I hire a head of marketing",
    secondaryQueries: [
      "when to hire a VP of marketing startup",
      "head of marketing vs growth lead startup",
      "first marketing hire startup",
      "CMO vs head of marketing early stage",
      "when does a startup need a marketing leader",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Am I ready to hire a head of marketing, or am I trying to buy a strategy I haven't built yet?",
    targetKeywords: [
      "should I hire a head of marketing",
      "when to hire VP marketing startup",
      "first marketing hire startup",
      "head of marketing startup decision",
      "marketing leadership early stage company",
    ],
  },
  {
    slug: "should-i-start-a-newsletter",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Start a Newsletter for My Business?",
    description:
      "A newsletter gives you a direct, owned audience that no algorithm can take away — but it also demands consistent content output at the exact moment your product still needs your full attention. The question is whether a newsletter builds distribution leverage or just adds a content obligation that pulls you away from the core product. Most founders who start newsletters too early end up with a list of 200 readers and a product that still doesn't convert. The ones who time it right have something worth writing about and an audience already paying attention.",
    primaryQuery: "should I start a newsletter for my business",
    secondaryQueries: [
      "business newsletter strategy",
      "newsletter vs social media for founders",
      "is a newsletter worth it for startups",
      "email newsletter vs content marketing",
      "how to build an audience with a newsletter",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "andrew-carnegie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Is a newsletter building you an owned audience asset, or is it a distraction from the product that would have made the audience worth having?",
    targetKeywords: [
      "should I start a newsletter for my business",
      "business newsletter strategy startup",
      "newsletter as distribution channel",
      "owned audience newsletter vs social media",
      "email newsletter for founders",
    ],
  },
  {
    slug: "should-i-move-upmarket",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Move Upmarket to Enterprise Customers?",
    description:
      "Enterprise deals bring larger contracts, lower churn, and stronger expansion revenue — but they also bring longer sales cycles, more customization pressure, compliance requirements, and a product roadmap that starts serving a handful of large customers instead of your broader base. Moving upmarket is not just a sales motion change; it restructures your entire company around a different buyer. The decision turns on whether your current SMB or mid-market traction is proof that you can sell, or proof that you have found the right customer.",
    primaryQuery: "should I move upmarket to enterprise",
    secondaryQueries: [
      "when to go upmarket startup",
      "SMB to enterprise transition SaaS",
      "enterprise sales cycle startup decision",
      "upmarket vs staying SMB",
      "how to sell to enterprise customers",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "andrew-carnegie",
    ],
    hookQuestion:
      "Is your SMB traction a sign that you have found the right market, or is it a stepping stone to the enterprise deals that will define the company's ceiling?",
    targetKeywords: [
      "should I move upmarket to enterprise",
      "SMB to enterprise transition startup",
      "going upmarket SaaS decision",
      "enterprise sales readiness startup",
      "upmarket strategy startup",
    ],
  },
  {
    slug: "should-i-implement-okrs",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Implement OKRs in My Company?",
    description:
      "OKRs are an alignment and focus tool — when the company is large enough to have misalignment and small enough that the overhead doesn't dwarf the benefit. Implemented too early, they add bureaucratic weight to a team that should be moving on instinct and iteration. Implemented too late, they arrive after the misalignment has already cost you a quarter or two. The question is not whether OKRs work; they do, for companies in the right conditions. The question is whether your company is in those conditions right now.",
    primaryQuery: "should I implement OKRs",
    secondaryQueries: [
      "OKRs for startups pros cons",
      "when to implement OKRs in a company",
      "OKRs vs other goal-setting frameworks",
      "are OKRs worth it for small teams",
      "how to introduce OKRs startup",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "marcus-aurelius",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Are OKRs the alignment tool your company actually needs right now, or are they organizational overhead that will slow a team that is still finding its footing?",
    targetKeywords: [
      "should I implement OKRs",
      "OKRs for startups",
      "when to use OKRs company",
      "OKR framework startup decision",
      "goal setting framework startup",
    ],
  },
  {
    slug: "should-i-go-direct-to-consumer-or-use-resellers",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Sell Direct-to-Consumer or Through Resellers?",
    description:
      "DTC gives you full margin, direct customer relationships, and rich first-party data — but it demands that you build distribution from scratch. Resellers give you immediate reach and market validation, but they eat margin and blur the customer relationship you need to iterate on your product. The decision turns on whether your current bottleneck is manufacturing leverage, distribution access, or customer understanding — and how much of your long-term competitive advantage depends on owning the data from every sale.",
    primaryQuery: "should I sell direct to consumer or use resellers",
    secondaryQueries: [
      "DTC vs reseller channel strategy",
      "direct to consumer vs wholesale",
      "when to use resellers vs sell direct",
      "reseller channel pros cons startup",
      "DTC distribution strategy founders",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "andrew-carnegie",
    ],
    hookQuestion:
      "Are you choosing DTC because it is the right channel for your customer, or because it feels like more control than you have actually earned?",
    targetKeywords: [
      "should I sell direct to consumer or use resellers",
      "DTC vs reseller strategy",
      "direct to consumer vs wholesale startup",
      "reseller channel decision",
      "DTC distribution startup",
    ],
  },
  {
    slug: "should-i-run-a-beta-program",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Run a Beta Program Before Full Launch?",
    description:
      "A beta program can generate genuine feedback, build pre-launch social proof, and create a cohort of invested early users — but it can also create false confidence when beta users are too forgiving, or delay a real launch indefinitely while you optimize for an unrepresentative audience. The question is whether you are validating the core product or just postponing the moment when you have to find out if strangers will pay.",
    primaryQuery: "should I run a beta program before launch",
    secondaryQueries: [
      "beta program vs direct launch",
      "how to run a startup beta program",
      "beta testing before launch pros cons",
      "when to skip a beta and launch directly",
      "closed beta vs open launch strategy",
    ],
    recommendedCouncil: [
      "marie-curie",
      "nikola-tesla",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Is your beta program generating signal you could not get any other way, or is it a structured delay that protects you from the discomfort of a real launch?",
    targetKeywords: [
      "should I run a beta program before launch",
      "beta program startup strategy",
      "beta testing vs direct launch",
      "closed beta launch decision",
      "beta program pros cons founders",
    ],
  },
  {
    slug: "should-i-expand-my-product-line",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Expand My Product Line?",
    description:
      "New product lines can unlock adjacent revenue streams and reduce single-product concentration risk — but they also fragment team focus, split engineering attention, and add support load before the original product has fully compounded. The decision turns on whether your core product has reached a genuine local maximum in its market, or whether you are pursuing expansion because growth on the existing product has slowed and you haven't diagnosed why.",
    primaryQuery: "should I expand my product line",
    secondaryQueries: [
      "when to add new products to your lineup",
      "product line expansion startup decision",
      "focus vs diversification product strategy",
      "expanding product portfolio pros cons",
      "should I launch a second product",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Is your existing product at a ceiling that only a new product line can break through, or are you expanding because growth has slowed and you haven't fixed the underlying cause?",
    targetKeywords: [
      "should I expand my product line",
      "product line expansion decision",
      "when to launch a second product",
      "product portfolio strategy startup",
      "focus vs diversification product startup",
    ],
  },
  {
    slug: "should-i-give-equity-to-early-employees",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Give Equity to Early Employees?",
    description:
      "Equity aligns incentives and lets you attract talent when cash is limited — but misaligned vesting schedules and over-dilution create serious problems as the company grows. The question is not whether to offer equity at all, but who genuinely deserves ownership versus who simply needs competitive cash compensation. Getting this wrong early locks in a cap table you will be managing for a decade.",
    primaryQuery: "should I give equity to early employees",
    secondaryQueries: [
      "employee equity startup decision",
      "how much equity to give early employees",
      "vesting schedule early employees startup",
      "equity vs salary early stage startup",
      "employee stock options startup guide",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Are you giving equity because it creates genuine alignment, or because you cannot afford to pay market rates — and do you know the difference?",
    targetKeywords: [
      "should I give equity to early employees",
      "employee equity startup",
      "how much equity to give employees",
      "vesting schedule early employees",
      "startup employee stock options",
    ],
  },
  {
    slug: "should-i-hire-a-sales-team-or-stay-founder-led-sales",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Sales Team or Stay Founder-Led Sales?",
    description:
      "Founder-led sales builds deep customer insight and creates the tight feedback loops that shape the product in the early stages — but it does not scale beyond a certain revenue threshold. Hiring a sales team before you have documented a repeatable process burns cash and produces inconsistent results. The decision turns on whether the sales motion is understood and codified well enough to hand off, and whether the founder's time is now worth more building pipeline or building product.",
    primaryQuery: "should I hire a sales team or stay founder-led sales",
    secondaryQueries: [
      "founder-led sales vs sales team startup",
      "when to hire first salesperson",
      "how to know when to stop doing sales yourself",
      "scaling sales beyond the founder",
      "when to build a sales team startup",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Is your sales process documented and repeatable enough that someone else could run it — or are you still the only one who knows why customers say yes?",
    targetKeywords: [
      "should I hire a sales team or stay founder-led sales",
      "founder-led sales vs hiring sales team",
      "when to hire first salesperson startup",
      "scaling sales beyond founder",
      "repeatable sales process startup",
    ],
  },
  {
    slug: "should-i-build-or-buy-a-technology",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build or Buy a Technology?",
    description:
      "Building gives you control and the potential for competitive differentiation, but it costs time and engineering resources you may not have. Buying gives you speed, but creates vendor dependencies, lock-in risk, and cost structures that can become unmanageable at scale. The decision turns on whether the capability is core to your product and competitive advantage — or peripheral infrastructure that a third-party can reliably provide at a lower total cost than building in-house.",
    primaryQuery: "should I build or buy a technology",
    secondaryQueries: [
      "build vs buy software decision startup",
      "when to build vs purchase technology",
      "make vs buy decision framework",
      "vendor dependency risk startup",
      "in-house vs third-party technology",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "andrew-carnegie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Is this capability core to your product's competitive advantage, or is it infrastructure that will only distract your team from the work that actually differentiates you?",
    targetKeywords: [
      "should I build or buy a technology",
      "build vs buy software decision",
      "make vs buy startup decision",
      "vendor dependency risk",
      "build in-house vs third-party technology",
    ],
  },
  {
    slug: "should-i-apply-to-y-combinator",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Apply to Y Combinator?",
    description:
      "Y Combinator offers funding, a powerful alumni network, and a stamp of credibility that opens doors — but it also imposes significant equity dilution, a demo-day-driven timeline, and a San Francisco gravitational pull that may not align with your product's trajectory. The decision is not simply about money: it is about whether the YC network and program structure will accelerate your specific path to product-market fit, or whether the constraints and dilution cost more than the benefits at your current stage.",
    primaryQuery: "should I apply to Y Combinator",
    secondaryQueries: [
      "YC vs other accelerators for early stage startup",
      "is Y Combinator worth it",
      "Y Combinator equity dilution pros cons",
      "when to apply to YC",
      "startup accelerator decision framework",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "niccolo-machiavelli",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "Will the YC network and program constraints accelerate your specific path to product-market fit — or will the dilution and timeline impose more cost than the credibility provides?",
    targetKeywords: [
      "should I apply to Y Combinator",
      "YC accelerator worth it",
      "Y Combinator equity dilution decision",
      "startup accelerator pros cons",
      "when to apply YC startup",
    ],
  },
  {
    slug: "should-i-set-up-a-vesting-schedule",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Set Up a Vesting Schedule for Founders and Employees?",
    description:
      "A vesting schedule aligns long-term incentives and protects the company if a founder or early employee leaves early — but it also signals distrust in a founding team that may still be in the trust-building phase. The decision is particularly high-stakes for co-founders, where the absence of vesting creates significant risk if the relationship breaks down, and the presence of vesting can itself become a friction point if one co-founder interprets it as a lack of confidence in the partnership.",
    primaryQuery: "should I set up a vesting schedule",
    secondaryQueries: [
      "founder vesting schedule startup",
      "co-founder equity vesting cliff",
      "employee equity vesting startup",
      "when to implement vesting schedule startup",
      "vesting cliff negotiation co-founder",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "marie-curie",
    ],
    hookQuestion:
      "Does the long-term alignment benefit of a vesting schedule outweigh the trust signal it sends to a co-founding team that may still be establishing its relationship?",
    targetKeywords: [
      "should I set up a vesting schedule",
      "founder equity vesting cliff",
      "co-founder vesting startup",
      "employee equity vesting schedule",
      "vesting cliff one year startup",
    ],
  },
  {
    slug: "should-i-hire-a-fractional-cto",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Fractional CTO?",
    description:
      "A fractional CTO gives a non-technical founder access to senior technical judgment at a fraction of the cost of a full-time hire — but fractional attention is not the same as full commitment, and the fractional relationship can become a crutch that delays the harder decision of hiring or developing a full-time technical leader. The decision turns on whether your current technical challenges require ongoing strategic ownership or periodic expert review, and whether your stage and funding allow you to attract the full-time technical leader you ultimately need.",
    primaryQuery: "should I hire a fractional CTO",
    secondaryQueries: [
      "fractional CTO vs full-time CTO startup",
      "non-technical founder technical leadership",
      "when to hire fractional CTO",
      "fractional CTO pros cons startup",
      "technical co-founder alternative",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Does your current technical challenge require ongoing strategic ownership from a committed leader — or periodic expert review that a fractional arrangement can provide without the full-time cost?",
    targetKeywords: [
      "should I hire a fractional CTO",
      "fractional CTO startup decision",
      "non-technical founder technical leader",
      "fractional vs full-time CTO",
      "when to hire fractional technical lead",
    ],
  },
  // ── Wave 21 decision pages ────────────────────────────────────────────
  {
    slug: "should-i-sell-my-company",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I Sell My Company?",
    description:
      "An acquisition offer forces a founder to evaluate whether the certainty of an exit today is worth more than the compounding upside of continued independence — a calculation that depends on your current leverage, the buyer's strategic motives, and whether the business has reached the inflection point where its most valuable growth still lies ahead. The decision is rarely purely financial: it involves assessing whether you have built the organizational durability to capture that future value, whether the acquirer's resources genuinely accelerate or constrain your vision, and whether your own energy and commitment are sufficient to execute the harder chapters that independence would require.",
    primaryQuery: "should I sell my company",
    secondaryQueries: [
      "when to sell a startup",
      "M&A vs staying independent founder decision",
      "should I take an acquisition offer",
      "startup exit vs continue building",
      "how to evaluate an acquisition offer",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Is the buyer offering certainty at the moment your leverage is highest — or are you selling the asset before the compounding that makes it genuinely valuable has had time to run?",
    targetKeywords: [
      "should I sell my company",
      "when to sell a startup",
      "M&A vs staying independent",
      "how to evaluate acquisition offer startup",
      "startup exit timing decision",
    ],
  },
  {
    slug: "should-i-hire-a-contractor-or-full-time",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I Hire a Contractor or Full-Time Employee?",
    description:
      "The contractor vs. full-time decision is a question about whether the work requires ongoing organizational ownership or bounded expert delivery — and the right answer changes significantly based on whether the capability is core to your competitive advantage, whether the work is well-defined enough to be scoped and handed off, and whether your current stage justifies the fixed overhead of a full-time hire. The error is not choosing one model over the other; it is applying the contractor model to work that requires strategic ownership, or the full-time model to work that a well-scoped contractor engagement could deliver faster and cheaper.",
    primaryQuery: "should I hire a contractor or full-time employee",
    secondaryQueries: [
      "contractor vs employee startup hiring decision",
      "when to hire full-time vs freelance developer",
      "startup hiring contractor vs employee pros cons",
      "fractional hire vs full-time employee early stage",
      "cost of full-time hire vs contractor startup",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "Does this work require someone who will build organizational ownership and compound their knowledge of your business over time — or can it be scoped, handed to an expert, and delivered without that continuity?",
    targetKeywords: [
      "should I hire a contractor or full-time employee",
      "contractor vs full-time startup decision",
      "when to hire freelancer vs employee",
      "startup hiring model contractor employee",
      "contractor vs employee cost comparison startup",
    ],
  },
  // ── Wave 22 decisions ────────────────────────────────────────────────────
  {
    slug: "should-i-build-a-saas-or-an-agency",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Build a SaaS or an Agency?",
    description:
      "The SaaS vs. agency decision is fundamentally a question about how you want to trade early cash flow certainty against long-term leverage on your time. An agency generates revenue faster — you sell hours or outcomes at margin, the client pays, and the model is legible from day one. But agency revenue is structurally capped by headcount, and every dollar of revenue requires ongoing service delivery that does not compound. SaaS generates leverage — once the product is built, each additional customer costs less than the last, and the gap between marginal cost and marginal revenue widens over time. But SaaS requires a longer runway before revenue materializes, a product that can be defined and scoped precisely enough to build, and a market where the problem is consistent enough across customers that a single solution works for all of them. The error is not choosing one model over the other; it is choosing the agency model when you have a product, or the SaaS model when you have a service.",
    primaryQuery: "should I build a SaaS or an agency",
    secondaryQueries: [
      "SaaS vs agency business model comparison",
      "should I productize my consulting or build software",
      "agency to SaaS transition when to make the switch",
      "service business vs software product founder decision",
      "sell services or build a product startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Does your solution require customization for every client — or is the problem consistent enough across customers that a single product could solve it for all of them without you being in the loop?",
    targetKeywords: [
      "should I build a SaaS or an agency",
      "SaaS vs agency business model decision",
      "productize consulting vs build software product",
      "agency vs SaaS which is better founder",
      "when to switch from agency to SaaS model",
    ],
  },
  {
    slug: "should-i-launch-with-a-waitlist",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Launch with a Waitlist?",
    description:
      "A waitlist is a pre-launch signal collection mechanism that does two things simultaneously: it generates a list of people who expressed enough interest to register, and it imposes a deliberate delay on your first real-user feedback loop. The case for a waitlist is that it creates artificial scarcity and social proof, builds an audience before the product exists, and allows you to manufacture a launch moment with momentum. The case against it is that waitlist signups are the lowest-friction signal available — registering for a waitlist costs nothing, requires no commitment, and selects for curiosity rather than genuine intent to use or pay. The critical variable is what you are trying to learn: if the question is whether there is any interest in your concept, a waitlist can answer it, but almost any interesting concept will generate waitlist signups, so the signal is weak. If the question is whether users will retain, pay, or refer — which are the questions that actually determine product-market fit — a waitlist delays the feedback you need and generates a false sense of validation that makes it harder to hear the real signal when it arrives.",
    primaryQuery: "should I launch with a waitlist",
    secondaryQueries: [
      "waitlist launch strategy pros cons startup",
      "pre-launch waitlist vs open beta product launch",
      "should I build a waitlist before launching",
      "waitlist hype strategy startup marketing",
      "when to use a waitlist for product launch",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marie-curie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "What question are you trying to answer with the waitlist — is it whether anyone is interested in your concept, or whether users will retain and pay once they try it? Those require different strategies.",
    targetKeywords: [
      "should I launch with a waitlist",
      "waitlist launch strategy startup decision",
      "pre-launch waitlist pros and cons",
      "when to use waitlist product launch",
      "waitlist vs open beta product launch strategy",
    ],
  },
  {
    slug: "should-i-niche-down-or-stay-broad",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Niche Down or Stay Broad?",
    description:
      "The niche-vs.-broad decision is really a question about where your competitive advantage is most defensible and where the friction in your sales process is highest. A narrow niche creates the conditions for domination: you understand the customer's specific context better than any competitor who is serving a broader market, your product can be optimized for their specific workflows, and your word-of-mouth compounds within a defined community. A broad target market creates the conditions for scale: more potential customers, more use cases, more revenue ceiling. The error most founders make is defaulting to broad out of fear that niche is too small — before testing whether they can achieve meaningful penetration in the niche first. The strategic logic is almost always: go narrow enough to win, then expand from a position of strength. The companies that stayed broad from day one and succeeded did so despite the breadth, not because of it, and almost all of them had an unfair advantage in distribution or brand that allowed them to skip the step where niche dominance would otherwise have been required.",
    primaryQuery: "should I niche down or stay broad",
    secondaryQueries: [
      "narrow target market vs broad audience startup decision",
      "should I focus on one customer segment startup",
      "niche vs generalist product strategy comparison",
      "when to niche down your startup target market",
      "product market fit niche first then expand",
    ],
    recommendedCouncil: ["sun-tzu", "niccolo-machiavelli", "marcus-aurelius"],
    hookQuestion:
      "Can you achieve meaningful market penetration in a narrow segment with your current resources — and does winning that segment create a natural expansion path, or does it trap you in a market that is too small to grow from?",
    targetKeywords: [
      "should I niche down or stay broad startup",
      "niche vs broad product strategy decision",
      "narrow market vs total addressable market startup",
      "when to niche down startup target market",
      "niche first then expand product strategy",
    ],
  },
  {
    slug: "should-i-launch-a-paid-beta",
    status: "shipped",
    shippedAt: "2026-05-13",
    title: "Should I Launch a Paid Beta?",
    description:
      "A paid beta simultaneously tests pricing, demand signal, and product quality under real conditions — but charging too early can suppress the user volume you need to find genuine product-market fit, and it signals a level of readiness that may generate churn and negative word-of-mouth if the product is still genuinely incomplete. The decision turns on whether your primary uncertainty is about willingness to pay (which a paid beta resolves efficiently) or about whether the product works well enough for real users (which requires volume that a free beta provides faster).",
    primaryQuery: "should I charge for a beta",
    secondaryQueries: [
      "paid beta vs free beta startup",
      "charging early users startup pros cons",
      "when to start charging customers startup",
      "paid waitlist vs free waitlist strategy",
      "should I launch paid beta or free beta",
    ],
    recommendedCouncil: [
      "marie-curie",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Is your primary uncertainty about whether users will pay — or about whether the product works well enough to retain the users who try it?",
    targetKeywords: [
      "should I launch a paid beta",
      "paid beta vs free beta startup",
      "charging for beta startup decision",
      "when to start charging early users",
      "paid beta strategy product market fit",
    ],
  },
  // ── Wave 23 decision pages ─────────────────────────────────────────────────
  {
    slug: "should-i-offer-a-free-trial",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Offer a Free Trial?",
    description:
      "A free trial is not a pricing decision — it is an evidence decision. The question is whether the friction of requiring payment upfront will eliminate more qualified users than it filters unqualified ones, and whether you trust the product enough to let prospects experience it before they commit.",
    primaryQuery: "Should I offer a free trial for my SaaS?",
    secondaryQueries: [
      "free trial vs freemium vs paid only SaaS",
      "how long should a SaaS free trial be",
      "free trial conversion rate startup",
      "should my product have a trial period",
      "opt-in vs opt-out free trial startup strategy",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "marie-curie",
    ],
    hookQuestion:
      "If you remove the payment barrier, do you get better signal about who actually values the product — or do you get a list of people who will never pay, and a product that has devalued itself by being free?",
    targetKeywords: [
      "should I offer a free trial for my SaaS",
      "free trial vs freemium SaaS decision",
      "how long should a SaaS free trial be",
      "free trial conversion rate startup",
      "opt-in vs opt-out free trial startup strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-chief-of-staff",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Hire a Chief of Staff?",
    description:
      "A chief of staff is a leverage multiplier for a founder whose primary bottleneck is attention, not capability. The question is whether the time you spend managing an additional hire will be recovered by the time they free up — and whether you have enough operating infrastructure for a CoS to actually plug into.",
    primaryQuery: "Should I hire a chief of staff as a startup founder?",
    secondaryQueries: [
      "chief of staff vs EA vs COO startup",
      "when to hire a chief of staff founder",
      "chief of staff role early stage startup",
      "founder leverage operations hire",
      "should I get a chief of staff or COO first",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You are the bottleneck on a dozen things simultaneously. A chief of staff could clear the queue — but only if the queue has enough structure that someone else can manage it. Does it?",
    targetKeywords: [
      "should I hire a chief of staff startup founder",
      "chief of staff vs COO early stage startup",
      "when to hire chief of staff founder",
      "founder leverage operations hire startup",
      "chief of staff role startup decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-angel-investors-or-wait-for-vc",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Take Angel Investors or Wait for VC?",
    description:
      "Angel capital and institutional VC are not the same instrument at different price points. They carry different board structures, different expectation timelines, different signaling implications, and different leverage dynamics. The choice is not just about the check size — it is about which set of relationships and constraints you are willing to operate under for the next three to five years.",
    primaryQuery: "Should I take angel investors or wait for VC?",
    secondaryQueries: [
      "angel investor vs venture capital funding startup",
      "angel round before seed round startup strategy",
      "when to raise angel vs institutional money",
      "angel investors pros cons startup founder",
      "bootstrap vs angel vs VC funding path startup",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Angel money is available now at terms you can accept. VC is six months away and uncertain. Is taking the angel round the smart early move — or does it set signals and structures that make the institutional round harder?",
    targetKeywords: [
      "should I take angel investors or wait for VC",
      "angel investor vs venture capital startup decision",
      "angel round before seed round startup strategy",
      "when to raise angel vs VC startup funding",
      "angel investors pros cons early stage startup",
      "start your own agon",
    ],
  },
  // ── Wave 24 decisions ────────────────────────────────────────────────────
  {
    slug: "should-i-charge-users-or-advertisers",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Charge Users or Advertisers?",
    description:
      "The decision between charging users directly and charging advertisers for access to users is a fundamental business model choice that determines your incentive structure, your growth dynamics, and your competitive defensibility — and the right answer depends on whether you can build an audience large enough for advertising economics to work before you run out of runway, and whether your users will tolerate the advertising model that pays for the product. The advertising model requires scale: you need enough users, with enough attention and enough demographic value, to sell access to that attention at rates that cover your costs and generate returns. Until you reach that scale, you are running a subsidized product that burns cash while building toward a revenue threshold that may be further away than your runway allows. The subscription model requires value density: users must find the product valuable enough to pay for it directly, which is a higher bar than casual usage but a lower bar than the massive scale advertising requires. The critical diagnostic is which question you can answer faster — whether a subset of your users will pay, or whether a large enough audience will form to attract advertiser spend.",
    primaryQuery: "should I charge users or advertisers",
    secondaryQueries: [
      "subscription model vs advertising revenue startup",
      "consumer subscription vs ads business model decision",
      "freemium advertising vs paid subscription choice",
      "monetization model choice early stage startup",
      "when to use advertising vs direct payment startup",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Can your product build an audience at the scale advertising economics require before your runway ends — or is a smaller group of users willing to pay directly for the value you are delivering today?",
    targetKeywords: [
      "should I charge users or advertisers startup",
      "subscription vs advertising business model decision",
      "user-pays vs advertiser-pays monetization choice",
      "when to use ads vs subscription startup",
      "start your own agon on monetization model",
    ],
  },
  {
    slug: "should-i-go-freemium-or-paid-only",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Go Freemium or Paid-Only?",
    description:
      "The freemium vs. paid-only decision turns on two variables that most founders underestimate: the conversion rate from free to paid that your product can realistically achieve, and the cost of serving free users at the scale freemium requires to produce meaningful paid conversion volume. Freemium is a top-of-funnel strategy, not a revenue strategy — the free tier exists to reduce acquisition friction and let users discover product value before committing to payment. The model works when the product has a natural activation moment that creates enough value to motivate conversion, when the cost to serve free users is low enough that you can afford to run a large free tier, and when the free tier creates genuine network effects or word-of-mouth that reduces your paid acquisition cost. Paid-only works when your product serves a professional or commercial context where buyers expect to pay, when the free tier would undermine the perceived value of the product, or when the cost of serving free users would require capital you do not have. The error is choosing freemium because it feels lower-friction without calculating whether the conversion economics actually work at your cost structure and conversion rate.",
    primaryQuery: "should I launch freemium or paid only",
    secondaryQueries: [
      "freemium vs paid model startup decision",
      "when to use freemium product strategy for SaaS",
      "freemium conversion rate calculation startup",
      "free tier vs premium only pricing strategy",
      "PLG product led growth freemium decision",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "marcus-aurelius",
    ],
    hookQuestion:
      "What is the conversion rate from free to paid that your freemium model needs to cover your cost of serving free users — and do you have evidence your product can actually achieve that conversion rate at the scale the model requires?",
    targetKeywords: [
      "should I go freemium or paid only startup",
      "freemium vs paid subscription model decision",
      "when to use freemium strategy for startup",
      "free tier vs paid only pricing startup",
      "start your own agon on freemium strategy",
    ],
  },
  {
    slug: "should-i-go-outbound-or-inbound",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Go Outbound or Inbound?",
    description:
      "Outbound and inbound are not just different sales tactics — they represent opposite theories about where your best customers come from and what the highest-leverage use of your early GTM resources is. Outbound (cold outreach, SDRs, direct sales) gives you control over the pipeline: you can target specific personas, company sizes, and verticals, and you can generate pipeline on a predictable timeline regardless of whether your content or SEO has matured. The cost is that outbound is labor-intensive, scales linearly with headcount, and generates customers who were found by you rather than customers who came because the product solved a problem they were actively searching for. Inbound (content, SEO, PLG, community) gives you customers with higher intent and lower acquisition cost at scale, but requires time to build: your content needs to rank, your community needs to form, your product-led loop needs to activate. The strategic diagnostic is not which is better in the abstract — it is which your current stage, budget, and product context makes viable. Early-stage companies with short runways and no organic flywheel often need outbound to survive the time it takes for inbound to work. Companies with products that solve problems users actively search for should prioritize inbound before the window to build organic authority closes.",
    primaryQuery: "should I focus on outbound or inbound sales startup",
    secondaryQueries: [
      "outbound vs inbound marketing early stage startup",
      "cold outreach vs content marketing startup strategy",
      "when to switch from outbound to inbound GTM",
      "PLG vs SLG go to market strategy decision",
      "outbound sales vs SEO content for startup growth",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Does your product solve a problem users are actively searching for right now — or do you need to reach buyers who do not yet know they have the problem your product solves?",
    targetKeywords: [
      "should I go outbound or inbound sales startup",
      "outbound vs inbound marketing startup decision",
      "when to use outbound vs inbound GTM strategy",
      "cold outreach vs content marketing founder decision",
      "start your own agon on go-to-market strategy",
    ],
  },
  // ── Wave 25 decisions ────────────────────────────────────────────────────
  {
    slug: "should-i-hire-a-head-of-sales-or-keep-founder-led-sales",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Hire a Head of Sales or Keep Founder-Led Sales?",
    description:
      "The VP Sales hire is one of the highest-leverage and most frequently mistimed decisions a B2B founder makes. The case for hiring sooner is straightforward: the founder is the bottleneck, you cannot build a scalable revenue process while also running it, and every month of founder-led sales is a month you are not building the sales infrastructure that will determine your growth trajectory in years two through five. The case for waiting is also straightforward: a sales leader hired before the product-market fit signal is clear enough to give them a repeatable playbook will fail because no playbook exists yet, will cost you six to twelve months of salary and equity, and will leave you back at founder-led sales but with a worse financial position and a demoralized team. The diagnostic variable is not company size or revenue level — it is whether you have a repeatable motion. If you can describe, in a single page, the ICP characteristics that predict a short sales cycle and high lifetime value, the specific pain points that create urgency, and the sequence of discovery-to-close that works more than 60% of the time, you are ready to hire someone to run that motion. If you cannot write that page, you are not ready — you need more founder-led reps to find the pattern, not a sales leader to operationalize a pattern you have not yet found.",
    primaryQuery: "should I hire a VP of sales or stay founder-led sales",
    secondaryQueries: [
      "when to hire head of sales startup founder",
      "founder-led sales vs hiring sales leader timing",
      "VP sales hire timing early stage B2B startup",
      "sales leader vs founder selling company stage",
      "when to build sales team from founder-led motion",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "niccolo-machiavelli",
      "sun-tzu",
    ],
    hookQuestion:
      "You are closing deals but you are also the only one who knows how to close them. Can you write a repeatable sales playbook today — or are you still running enough experiments to find the pattern?",
    targetKeywords: [
      "should I hire VP of sales startup",
      "founder-led sales vs head of sales timing",
      "when to hire first sales leader B2B startup",
      "VP sales hire readiness checklist startup",
      "start your own agon on sales team building",
    ],
  },
  {
    slug: "should-i-raise-prices-or-compete-on-value",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Raise Prices or Compete on Value?",
    description:
      "The pricing decision is deceptively framed as a choice between raising prices and competing on value — but in practice, the real question is whether your current price accurately reflects the value you are already delivering, or whether you are underpricing value you have already built. If you are underpricing, raising prices is not competing on price against value — it is correcting a miscommunication about what the product is worth. The clearest signal that you are underpricing: your best customers, when asked directly, would pay more and are surprised that you charge what you do. The clearest signal that you have a value problem rather than a price problem: the customers most resistant to price increases are also your worst-fit customers — the ones with the highest support burden, the lowest expansion revenue, and the most churn risk. Serving them at a price you cannot afford is not a growth strategy; it is a subsidy program for your worst fits paid for by your best ones. Competing on value means building product differentiation that makes price comparison irrelevant — features, integrations, support, or strategic positioning that the competitor who charges less simply cannot match. This is the correct strategy when the product is genuinely undifferentiated and the primary customer decision criterion is price. When the product is differentiated, the correct strategy is to price the differentiation, not to hide it under a price point that signals equivalence with the undifferentiated alternatives.",
    primaryQuery: "should I raise prices or add more value startup",
    secondaryQueries: [
      "pricing strategy startup raise prices or compete on value",
      "when to raise prices SaaS startup",
      "value-based pricing vs competitive pricing decision",
      "underpricing startup product signs and fix",
      "pricing power vs value creation startup decision",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marcus-aurelius",
      "marie-curie",
    ],
    hookQuestion:
      "Your best customers would pay more and your worst customers would churn at a higher price. Is the price problem a product problem, or is it a communication problem about value you have already built?",
    targetKeywords: [
      "should I raise prices or add more value startup",
      "raise prices vs compete on value startup decision",
      "when to increase SaaS pricing startup",
      "value-based pricing strategy for founders",
      "start your own agon on pricing strategy",
    ],
  },
  {
    slug: "should-i-launch-an-enterprise-tier",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Launch an Enterprise Tier?",
    description:
      "The enterprise tier decision is a product strategy and go-to-market commitment disguised as a packaging question. Adding an enterprise tier is not just creating a higher price point — it requires building the compliance infrastructure (SOC 2, SSO/SAML, audit logs, data residency), the sales motion (outbound, RFP responses, legal review, multi-stakeholder procurement), the support infrastructure (SLAs, dedicated customer success, escalation paths), and the product features (custom permissions, role-based access, API rate limit increases, admin tooling) that enterprise buyers require as table stakes. The question is not whether enterprise revenue would be good to have — of course it would — but whether your current organization can serve enterprise accounts without degrading the product and service quality that your existing customers depend on, and whether the enterprise opportunity is large enough and accessible enough to justify the organizational transformation required to pursue it. The clearest signals that you are ready: you have inbound enterprise interest from accounts large enough to justify the build cost, your core product already solves the problem at the scale those accounts need, and you have at least one person who has run enterprise sales or customer success before. The clearest signals that you are not ready: the interest is aspirational rather than inbound, the core product requires significant architecture work to meet enterprise requirements, and the team asking for the enterprise tier has never closed an enterprise deal.",
    primaryQuery: "should I launch enterprise tier startup",
    secondaryQueries: [
      "SMB vs enterprise product tier decision startup",
      "when to add enterprise pricing tier SaaS",
      "enterprise sales readiness checklist startup",
      "enterprise tier requirements SOC2 SSO startup",
      "moving from SMB to enterprise product strategy",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "sun-tzu",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Enterprise accounts are asking about your product and the deal sizes would transform your revenue. But enterprise means SOC 2, SSO, custom procurement, and a sales motion you have not built. Is the opportunity large enough to justify building the organization that can serve it?",
    targetKeywords: [
      "should I launch enterprise tier startup",
      "enterprise pricing tier readiness startup",
      "when to add enterprise plan SaaS product",
      "enterprise vs SMB strategy startup decision",
      "start your own agon on enterprise tier launch",
    ],
  },
  {
    slug: "should-i-raise-a-seed-extension-or-series-a",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Raise a Seed Extension or Series A?",
    description:
      "The choice between a seed extension and a Series A is not a fundraising decision — it is a milestone honesty decision. A Series A requires you to demonstrate that the core growth engine works: that you have found the customer segment, the pricing, the acquisition channel, and the retention rate that justify institutional capital at the scale a Series A implies. A seed extension means you have not yet demonstrated those things, and you are asking existing or new small-check investors to buy you the time to find them. The strategic error is raising a seed extension because the Series A metrics are close but not quite there — a decision that typically delays the reckoning by six to nine months without changing the fundamental dynamics, and leaves you raising the Series A from a weaker position because the extension capital is nearly gone and the metrics have improved only modestly. The harder but more honest version of the question is: do we have enough evidence that this business works to justify the operating model a Series A implies, or do we need to run a specific set of experiments that would produce that evidence — and if so, how much capital do those experiments require?",
    primaryQuery: "should I raise a seed extension or Series A",
    secondaryQueries: [
      "seed extension vs Series A timing decision",
      "when to raise Series A startup metrics required",
      "bridge round vs next round startup funding decision",
      "pre-Series A readiness assessment startup",
      "how to decide between seed extension and Series A",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marie-curie",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Your metrics are improving but not yet at Series A benchmarks. A seed extension buys you nine more months. Is that enough time to close the gap — or are you delaying a harder conversation about whether the growth engine actually works?",
    targetKeywords: [
      "should I raise a seed extension or Series A",
      "seed extension vs Series A startup decision",
      "when is startup ready for Series A",
      "bridge round vs Series A founder decision",
      "start your own agon on fundraising strategy",
    ],
  },
  {
    slug: "should-i-build-in-public-or-stay-stealth",
    status: "shipped",
    shippedAt: "2026-05-15",
    title: "Should I Build in Public or Stay Stealth?",
    description:
      "Building in public and staying stealth are not just different communication strategies — they reflect different theories about where early competitive advantage comes from and what your most constrained resource is at the current stage. Building in public generates distribution, feedback, and accountability before you have a product to distribute: the audience you build while building is the audience you launch to, and the feedback loop from public building accelerates product decisions by giving you a larger, more diverse set of perspectives than any internal team can generate. The cost is that you signal your direction to competitors before you have a durable advantage, and you create reputational exposure if the public trajectory includes failures, pivots, or false starts that would have been invisible in stealth mode. Staying stealth preserves optionality: you can explore, fail, and redirect without the social cost of public pivots, and you can build a technical or operational moat before competitors know the direction. The cost is that stealth is expensive — you lose the distribution and feedback benefits of public building, and you arrive at launch with no audience, no validated messaging, and no community investment in your success. The diagnostic is not about which approach feels more authentic. It is about whether your primary risk is competitive imitation or distribution scarcity at launch.",
    primaryQuery: "should I build in public or stay in stealth mode",
    secondaryQueries: [
      "build in public vs stealth startup strategy",
      "sharing startup progress publicly pros and cons",
      "when to go stealth vs build in public founder",
      "build in public audience distribution strategy",
      "stealth mode vs open development early stage startup",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "niccolo-machiavelli",
      "marie-curie",
    ],
    hookQuestion:
      "Going public with your build process would grow your audience and sharpen your product thinking — but it would also show competitors exactly what you are building before you have a moat. Is your primary risk that competitors will copy you, or that you will launch to silence?",
    targetKeywords: [
      "should I build in public or stay stealth startup",
      "build in public vs stealth mode founder decision",
      "when to share startup progress publicly",
      "stealth startup vs open building strategy",
      "start your own agon on build in public strategy",
    ],
  },
];

export function getDecisionEntry(slug: string): DecisionEntry | undefined {
  return DECISION_ENTRIES.find((entry) => entry.slug === slug);
}

export function getDecisionPublishedAt(entry: DecisionEntry): Date {
  return new Date(`${entry.shippedAt}T00:00:00Z`);
}

export function getDecisionUrl(slug: string, siteUrl = DECISION_SITE_URL): string {
  return `${siteUrl}/decisions/${slug}`;
}

export function buildDecisionAgoraHref(entry: DecisionEntry): string {
  const params = new URLSearchParams();
  params.set("minds", entry.recommendedCouncil.join(","));
  params.set("utm_source", "decision");
  params.set("utm_campaign", "decision_surface");
  params.set("utm_content", entry.slug);
  return `/agora?${params.toString()}`;
}
