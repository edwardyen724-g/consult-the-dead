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
