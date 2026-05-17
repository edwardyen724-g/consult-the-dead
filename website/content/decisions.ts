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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
    shippedAt: "2026-05-16",
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
  // ──── CLUSTER 01 — shipped 2026-05-18 ────
  {
    slug: "should-i-do-usage-based-pricing",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Usage-Based Pricing?",
    description:
      "Usage-based pricing rewards customers who use your product lightly and punishes the ones who get the most value. It can grow with adoption, but it also makes revenue lumpy and turns every invoice into a surprise. This page helps you decide whether your product is metered enough to bill by the unit.",
    primaryQuery: "Should I do usage-based pricing?",
    secondaryQueries: [
      "usage-based vs subscription pricing",
      "when does usage-based pricing make sense",
      "how to switch to usage-based pricing",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "ada-lovelace",
      "thomas-edison",
    ],
    hookQuestion:
      "Your power users would pay more if you let them, but your light users would churn the moment the bill spikes. Are you about to trade predictable revenue for a pricing model you cannot forecast?",
    targetKeywords: [
      "should I do usage-based pricing",
      "usage-based vs subscription pricing",
      "when does usage-based pricing make sense",
      "how to know if your product fits usage-based pricing",
      "consumption pricing for saas",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-tiered-pricing",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Tiered Pricing?",
    description:
      "Tiered pricing lets different customers pay different amounts for the same product, which is great until the tiers start cannibalizing each other. Too few tiers and you leave money on the table. Too many and prospects freeze on the pricing page.",
    primaryQuery: "Should I do tiered pricing?",
    secondaryQueries: [
      "how many pricing tiers should I have",
      "tiered vs flat pricing",
      "how to design saas pricing tiers",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "cleopatra-vii",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You can feel the spread in your customer list — some would pay triple, some are barely hanging on. Will adding tiers capture both ends, or will it just teach every buyer to pick the cheapest one?",
    targetKeywords: [
      "should I do tiered pricing",
      "how many pricing tiers should I have",
      "tiered vs flat pricing saas",
      "when to add a pricing tier",
      "how to design pricing tiers",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-offer-annual-discounts",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Offer Annual Discounts?",
    description:
      "Annual plans pull cash forward and lower churn, but they also lock you into a price for twelve months you might want to raise in three. The discount is real revenue you give up — the question is what you buy with it.",
    primaryQuery: "Should I offer annual discounts?",
    secondaryQueries: [
      "annual vs monthly pricing",
      "how big should an annual discount be",
      "when to offer yearly plans",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "marie-curie",
    ],
    hookQuestion:
      "A 20% annual discount feels like a small price for the cash and the retention — until you realize you just promised a year of service at a price you might regret by quarter two. Is the upfront money worth the frozen pricing?",
    targetKeywords: [
      "should I offer annual discounts",
      "annual vs monthly pricing",
      "how big should an annual discount be",
      "when to offer yearly plans",
      "is an annual saas discount worth it",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-discount-for-early-customers",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Discount for Early Customers?",
    description:
      "Early customers carry the most risk and give you the most feedback, so a discount can feel like fair trade. But the price you set with your first ten buyers anchors the price every later buyer expects. This page helps you weigh gratitude against precedent.",
    primaryQuery: "Should I discount for early customers?",
    secondaryQueries: [
      "early customer discount strategy",
      "founding customer pricing",
      "should beta users pay less",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "benjamin-franklin",
      "thomas-edison",
    ],
    hookQuestion:
      "The first ten people who say yes are doing you a favor, and you want to thank them. But every discount you hand out becomes the price the market thinks you are worth. Are you rewarding loyalty, or training the market to wait?",
    targetKeywords: [
      "should I discount for early customers",
      "early customer discount strategy",
      "founding member pricing",
      "should beta users pay less",
      "when to offer a launch discount",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-charge-per-seat-or-per-feature",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Charge Per Seat or Per Feature?",
    description:
      "Per-seat pricing scales with the customer's team, which is simple to explain but punishes companies that share logins. Per-feature pricing rewards depth of use but invites endless arguments about which feature belongs in which tier. The right axis depends on what your product actually meters.",
    primaryQuery: "Should I charge per seat or per feature?",
    secondaryQueries: [
      "per seat vs per feature pricing",
      "how to choose a pricing axis",
      "feature-based vs user-based pricing",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "andrew-carnegie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Two customers with identical headcounts get very different value from your product — one team logs in daily, one logs in monthly. If you bill by seat, the heavy users are subsidized. If you bill by feature, your sales calls become hostage negotiations. Which trap do you accept?",
    targetKeywords: [
      "should I charge per seat or per feature",
      "per seat vs per feature pricing",
      "how to choose a pricing axis",
      "feature-based vs user-based pricing",
      "when to switch from per-seat pricing",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-grandfather-existing-customers",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Grandfather Existing Customers?",
    description:
      "Grandfathering protects the customers who trusted you first, but it also creates two products at two prices that you have to support forever. Every upgrade meeting becomes a question of fairness instead of value. This page helps you decide whether the goodwill is worth the operational drag.",
    primaryQuery: "Should I grandfather existing customers?",
    secondaryQueries: [
      "grandfather pricing strategy",
      "should I raise prices on existing customers",
      "legacy pricing tier",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "marcus-aurelius",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "The customers who paid you when you were nobody are now paying half what your new buyers pay. Do you honor the implicit promise that brought them in, or do you accept that every legacy price is a slow tax on the company you want to become?",
    targetKeywords: [
      "should I grandfather existing customers",
      "grandfather pricing strategy",
      "should I raise prices on existing customers",
      "how to handle legacy pricing tiers",
      "when to phase out grandfathered pricing",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-price-discrimination",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Price Discrimination?",
    description:
      "Charging different customers different prices for the same product can double your revenue or destroy your reputation. The trick is making the price difference defensible — by segment, by feature, by region — so it does not feel arbitrary. This page helps you decide if you can pull it off without losing trust.",
    primaryQuery: "Should I do price discrimination?",
    secondaryQueries: [
      "is price discrimination legal for saas",
      "different prices for different customers",
      "how to segment pricing fairly",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "cicero",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You know two customers would pay wildly different prices for the same product, and the data is right there in your CRM. But the moment a buyer finds out their neighbor pays less, you do not have a customer anymore — you have a public relations problem.",
    targetKeywords: [
      "should I do price discrimination",
      "different prices for different customers",
      "how to segment pricing fairly",
      "when is price discrimination acceptable",
      "is price discrimination legal for saas",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-publish-my-prices",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Publish My Prices?",
    description:
      "Public pricing speeds up the sales cycle and filters out tire-kickers, but it also tells your competitors exactly where to undercut you. Hidden pricing buys negotiation room at the cost of trust. The right answer depends on whether your buyer expects a quote or a checkout button.",
    primaryQuery: "Should I publish my prices?",
    secondaryQueries: [
      "public vs hidden pricing",
      "should saas show pricing on website",
      "when to hide enterprise pricing",
    ],
    recommendedCouncil: [
      "cicero",
      "benjamin-franklin",
      "sun-tzu",
    ],
    hookQuestion:
      "Every buyer who lands on your pricing page either commits or bounces in thirty seconds. If you hide the number, you control the conversation but lose the impatient ones. If you publish it, your competitors print it out and price five percent under it by lunch.",
    targetKeywords: [
      "should I publish my prices",
      "public vs hidden pricing",
      "should saas show pricing on website",
      "when to hide enterprise pricing",
      "how to know if your prices should be public",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-offer-money-back-guarantee",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Offer a Money-Back Guarantee?",
    description:
      "A money-back guarantee lowers the friction to buying, but it also gives every unhappy customer a free trial paid in your time. The question is whether the lift in conversion outweighs the refund rate plus the support cost of processing them.",
    primaryQuery: "Should I offer a money-back guarantee?",
    secondaryQueries: [
      "money-back guarantee for saas",
      "does a refund policy increase conversion",
      "how long should a money-back guarantee be",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "thomas-edison",
      "florence-nightingale",
    ],
    hookQuestion:
      "You believe in the product enough to stand behind it, but you also know a small percentage of buyers will use the guarantee as a free month and walk. Are you about to make the right buyers feel safe, or invite the wrong ones to use you?",
    targetKeywords: [
      "should I offer a money-back guarantee",
      "money-back guarantee for saas",
      "does a refund policy increase conversion",
      "how long should a money-back guarantee be",
      "when to offer a satisfaction guarantee",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-bundle-or-unbundle-features",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Bundle or Unbundle Features?",
    description:
      "Bundling raises the average sale and makes the product feel complete, but it also lets weak features hide behind strong ones. Unbundling forces each feature to justify its own price and can multiply your line items overnight. This page helps you decide which direction your product needs.",
    primaryQuery: "Should I bundle or unbundle features?",
    secondaryQueries: [
      "bundle vs unbundle pricing",
      "when to break out a feature into its own plan",
      "feature packaging strategy",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "thomas-edison",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "Half your customers only use two features and half use ten, but they all pay the same price. Do you split the product into pieces and risk a confusing menu, or hold the bundle together and keep subsidizing the heavy users?",
    targetKeywords: [
      "should I bundle or unbundle features",
      "bundle vs unbundle pricing",
      "when to break out a feature into its own plan",
      "saas feature packaging strategy",
      "how to know when to unbundle",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-lifetime-deal",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do a Lifetime Deal?",
    description:
      "A lifetime deal floods you with cash and customers in one weekend, but you are now serving those customers forever for zero recurring revenue. The math works for products that get cheaper to run over time and falls apart for everything else.",
    primaryQuery: "Should I do a lifetime deal?",
    secondaryQueries: [
      "should I sell on appsumo",
      "lifetime deal pros and cons",
      "are lifetime deals worth it for saas",
    ],
    recommendedCouncil: [
      "seneca",
      "sun-tzu",
      "marie-curie",
    ],
    hookQuestion:
      "The deal site is offering to put a thousand new customers on your books this month. Every one of them pays once and stays forever — and you have to keep your servers running for all of them in 2031.",
    targetKeywords: [
      "should I do a lifetime deal",
      "should I sell on appsumo",
      "lifetime deal pros and cons",
      "are lifetime deals worth it for saas",
      "when does a lifetime deal make sense",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-charge-for-onboarding",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Charge for Onboarding?",
    description:
      "Charging for onboarding turns a cost center into revenue and filters out customers who will never put in the work to succeed. But it also adds a hurdle right when the buyer is most fragile. This page helps you decide whether the friction protects you or kills your funnel.",
    primaryQuery: "Should I charge for onboarding?",
    secondaryQueries: [
      "paid vs free onboarding saas",
      "should I charge an implementation fee",
      "when to charge for setup",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "andrew-carnegie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Your CS team spends three weeks getting each new customer live, and half of those customers churn anyway. A setup fee would cover the time and weed out the tourists — but it might also turn the first conversation into a price negotiation you keep losing.",
    targetKeywords: [
      "should I charge for onboarding",
      "paid vs free onboarding saas",
      "should I charge an implementation fee",
      "when to charge for setup",
      "is a setup fee worth it for saas",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-charge-for-support",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Charge for Support?",
    description:
      "Free support feels generous until you realize five percent of your customers consume ninety percent of your team's hours. Charging for it creates a clear contract but risks the perception that you are nickel-and-diming people who already paid. The trick is what you charge for and what you leave free.",
    primaryQuery: "Should I charge for support?",
    secondaryQueries: [
      "paid vs free support saas",
      "should I have a premium support tier",
      "how to monetize customer support",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "john-d-rockefeller",
      "marcus-aurelius",
    ],
    hookQuestion:
      "One enterprise customer files four tickets a day and pays the same as the solo user who never writes in. Do you charge the heavy user for what they actually cost, or accept that support is just the price of keeping them?",
    targetKeywords: [
      "should I charge for support",
      "paid vs free support saas",
      "should I have a premium support tier",
      "how to monetize customer support",
      "when to introduce paid support",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-have-an-enterprise-tier",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Have an Enterprise Tier?",
    description:
      "An enterprise tier unlocks ten-times revenue per logo, but it also drags you into procurement cycles, security questionnaires, and feature requests no self-serve customer asked for. This page helps you decide if you have the patience and the product depth to serve buyers who never use a credit card.",
    primaryQuery: "Should I have an enterprise tier?",
    secondaryQueries: [
      "when to add an enterprise plan",
      "enterprise pricing strategy",
      "should I sell to enterprise customers",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "andrew-carnegie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The big logos in your inbox want SSO, an MSA, and a SOC 2 report, and they will pay six figures for it. Are you about to unlock a new business, or trade the company you have for a sales cycle that owns your roadmap?",
    targetKeywords: [
      "should I have an enterprise tier",
      "when to add an enterprise plan",
      "enterprise pricing strategy",
      "should I sell to enterprise customers",
      "how to know if you are ready for enterprise",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-test-price-increases",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Test Price Increases?",
    description:
      "Most founders underprice and then guess at the right new number. A real price test runs the new price next to the old one and measures conversion and churn for long enough to mean something. The hard part is staying disciplined when the early numbers look scary.",
    primaryQuery: "Should I test price increases?",
    secondaryQueries: [
      "how to test a price increase",
      "ab test pricing saas",
      "is it safe to raise prices",
    ],
    recommendedCouncil: [
      "isaac-newton",
      "marie-curie",
      "thomas-edison",
    ],
    hookQuestion:
      "You suspect you are charging half what you could, and every customer call confirms it. But the moment you raise the number, you cannot tell if the dip in signups is the price or the season or just noise. How do you run the experiment without breaking the funnel?",
    targetKeywords: [
      "should I test price increases",
      "how to test a price increase",
      "ab test pricing saas",
      "is it safe to raise prices",
      "when to know your prices are too low",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-localize-pricing-by-region",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Localize Pricing by Region?",
    description:
      "Charging less in India or Brazil unlocks customers who otherwise would never pay, but it also creates a back door for buyers in richer countries to spoof their location. The decision is half economics and half enforcement.",
    primaryQuery: "Should I localize pricing by region?",
    secondaryQueries: [
      "regional pricing strategy saas",
      "purchasing power parity pricing",
      "should I have different prices by country",
    ],
    recommendedCouncil: [
      "catherine-the-great",
      "alexander-the-great",
      "sun-tzu",
    ],
    hookQuestion:
      "A founder in Lagos cannot afford your US price and writes to tell you so. You can open the market or you can hold the line — but every regional price you publish is a coupon a VPN can claim.",
    targetKeywords: [
      "should I localize pricing by region",
      "regional pricing strategy saas",
      "purchasing power parity pricing",
      "should I have different prices by country",
      "when to introduce country-specific pricing",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-credit-based-pricing",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Credit-Based Pricing?",
    description:
      "Credit-based pricing hides the per-unit cost behind a friendly token, which can soften sticker shock and let you mix multiple usage axes into one bill. But customers also lose track of what they spent, which becomes a problem the day they actually look.",
    primaryQuery: "Should I do credit-based pricing?",
    secondaryQueries: [
      "credit-based pricing vs usage-based",
      "should I use tokens or credits for pricing",
      "when does credit pricing work",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "john-d-rockefeller",
      "thomas-edison",
    ],
    hookQuestion:
      "Your product does five different expensive things, and pricing each one separately would scare every buyer off the page. Credits could unify the bill — until a customer burns through them in a week and realizes what they actually spent.",
    targetKeywords: [
      "should I do credit-based pricing",
      "credit-based pricing vs usage-based",
      "should I use tokens or credits for pricing",
      "when does credit pricing work",
      "how to design a credit pricing system",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-offer-a-startup-discount",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Offer a Startup Discount?",
    description:
      "Startup discounts let you onboard the future buyers of your product cheaply, and the best of them grow into paying logos worth ten times what you forgave. The trap is that most startups die, and the ones that survive often expect the discount to last forever.",
    primaryQuery: "Should I offer a startup discount?",
    secondaryQueries: [
      "startup discount program saas",
      "should I give discounts to early stage companies",
      "yc discount pricing",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "andrew-carnegie",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A two-person seed-stage team asks for 80% off, promising they will be a flagship customer once they raise their Series A. You know one in twenty actually makes it. Are you investing in the future, or just running a charity?",
    targetKeywords: [
      "should I offer a startup discount",
      "startup discount program saas",
      "should I give discounts to early stage companies",
      "how to design a startup pricing tier",
      "when to graduate customers off a startup discount",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-offer-an-academic-discount",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Offer an Academic Discount?",
    description:
      "Academic discounts seed your product into the next generation of professionals and look great in your case studies. But verifying who counts as academic is administrative work, and the discount can leak into commercial use if you do not enforce it.",
    primaryQuery: "Should I offer an academic discount?",
    secondaryQueries: [
      "education discount saas",
      "student pricing strategy",
      "how to verify academic eligibility",
    ],
    recommendedCouncil: [
      "aristotle",
      "benjamin-franklin",
      "cicero",
    ],
    hookQuestion:
      "A professor wants to use your product in a class of two hundred, and they need it free or close to it. You could plant a generation of future buyers — or you could discover next semester that a Fortune 500 team is using the same .edu seat.",
    targetKeywords: [
      "should I offer an academic discount",
      "education discount saas",
      "student pricing strategy",
      "how to verify academic eligibility",
      "when to offer free seats to universities",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-pay-what-you-want",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Pay-What-You-Want?",
    description:
      "Pay-what-you-want is a strong signal that you trust your audience, and it sometimes produces a median price higher than what you would have set. But it also collapses the moment your audience grows past the people who feel personal loyalty to you.",
    primaryQuery: "Should I do pay-what-you-want pricing?",
    secondaryQueries: [
      "pay what you want pricing",
      "name your own price model",
      "does pay what you want actually work",
    ],
    recommendedCouncil: [
      "socrates",
      "seneca",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You believe a small audience will pay you fairly if you just ask. You also know that as soon as the audience grows past a few thousand strangers, the average will drift toward zero. Is this generosity, or is it the start of a slow leak?",
    targetKeywords: [
      "should I do pay-what-you-want pricing",
      "pay what you want pricing",
      "name your own price model",
      "does pay what you want actually work",
      "when does pay what you want make sense",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-launch-pricing",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do Launch Pricing?",
    description:
      "Launch pricing creates urgency and gives your first cohort a story to tell, but the discount has to end without spooking the people who paid early. The mechanics matter: too short and nobody hears about it, too long and it becomes the real price.",
    primaryQuery: "Should I do launch pricing?",
    secondaryQueries: [
      "launch week pricing strategy",
      "should I have an early bird price",
      "how long should launch pricing last",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "thomas-edison",
      "napoleon-bonaparte",
    ],
    hookQuestion:
      "Launch week is the one moment buyers are paying attention, and you have one chance to convert the spike into customers. Discount too steeply and your normal price feels like a tax. Don't discount at all and the curious never become buyers.",
    targetKeywords: [
      "should I do launch pricing",
      "launch week pricing strategy",
      "should I have an early bird price",
      "how long should launch pricing last",
      "when to end a launch discount",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-monetize-with-ads",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Monetize with Ads?",
    description:
      "Ads turn attention into revenue without asking the user to open their wallet, which is powerful when your audience is huge and price-sensitive. But the moment ads run, the user is no longer the customer — and every product decision is now in tension with the advertiser's needs.",
    primaryQuery: "Should I monetize with ads?",
    secondaryQueries: [
      "ads vs subscription monetization",
      "should I run ads in my app",
      "free with ads or paid subscription",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "cleopatra-vii",
      "nikola-tesla",
    ],
    hookQuestion:
      "You have traffic but the conversion rate to paid will not move. An ad network would pay you tomorrow for the same audience — and quietly turn every user into the product instead of the customer.",
    targetKeywords: [
      "should I monetize with ads",
      "ads vs subscription monetization",
      "should I run ads in my app",
      "free with ads or paid subscription",
      "when does ad-supported make sense",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-paid-newsletter",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Do a Paid Newsletter?",
    description:
      "A paid newsletter converts the most loyal readers into recurring revenue, but it also splits your audience into haves and have-nots and forces you to ration your best ideas. The decision is whether you have enough audience and enough to say to make the split worth it.",
    primaryQuery: "Should I do a paid newsletter?",
    secondaryQueries: [
      "paid vs free newsletter",
      "should I put my newsletter behind a paywall",
      "when to monetize a newsletter",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "cicero",
      "frederick-douglass",
    ],
    hookQuestion:
      "Five thousand people read every issue and tell you it is the best thing they get all week. The moment you put a price on it, half of them will say no — and you will spend every Sunday wondering if you should have kept it free.",
    targetKeywords: [
      "should I do a paid newsletter",
      "paid vs free newsletter",
      "should I put my newsletter behind a paywall",
      "when to monetize a newsletter",
      "how to know if your newsletter is ready to charge",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-charge-for-my-api",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Charge for My API?",
    description:
      "Charging for API access converts integrators into a real revenue line, but a paid API also raises the bar on uptime, docs, and support. The risk is that a free API drove adoption and a paid one slows it just as the platform was working.",
    primaryQuery: "Should I charge for my API?",
    secondaryQueries: [
      "free vs paid api strategy",
      "should I monetize my api",
      "when to charge for api access",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "thomas-edison",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Developers are wiring your API into their products for free and traffic is climbing every week. Charge too soon and you cut off the adoption that made the API valuable. Wait too long and you spend a year carrying load you cannot bill for.",
    targetKeywords: [
      "should I charge for my api",
      "free vs paid api strategy",
      "should I monetize my api",
      "when to charge for api access",
      "how to price an api",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-offer-white-labeling",
    status: "shipped",
    shippedAt: "2026-05-18",
    title: "Should I Offer White-Labeling?",
    description:
      "White-labeling lets partners resell your product under their own brand, which can multiply distribution overnight. The cost is that you give up the customer relationship, the brand recognition, and a chunk of every dollar — and you still own the support burden when their customers complain.",
    primaryQuery: "Should I offer white-labeling?",
    secondaryQueries: [
      "white label vs reseller strategy",
      "should I let partners rebrand my product",
      "when to add white-label pricing",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "andrew-carnegie",
      "julius-caesar",
    ],
    hookQuestion:
      "An agency wants to resell your product under their name and sign you a contract for 50 seats today. You get the revenue but lose the logo, and the next time their customer churns, you will not even know it happened. Is the distribution worth the disappearance?",
    targetKeywords: [
      "should I offer white-labeling",
      "white label vs reseller strategy",
      "should I let partners rebrand my product",
      "when to add white-label pricing",
      "how to price a white-label tier",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 02 — shipped 2026-05-21 ────
  {
    slug: "should-i-hire-a-recruiter",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Recruiter?",
    description:
      "A recruiter pays for themselves only when the search is large enough, specialized enough, or urgent enough that your own time has higher value elsewhere. The real question is whether you have lost too many candidates to slow response times — or whether you simply do not want to do the work yourself.",
    primaryQuery: "Should I hire a recruiter?",
    secondaryQueries: [
      "are recruiters worth the fee for startups",
      "when does an external recruiter pay off",
      "should a founder use an agency recruiter",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "florence-nightingale",
      "benjamin-franklin",
    ],
    hookQuestion:
      "The role has been open eleven weeks. You keep telling yourself the next two evenings of sourcing will fix it, and the next two evenings never come. Is paying 25% of a salary the actual answer, or are you outsourcing a hiring problem you have not defined?",
    targetKeywords: [
      "should I hire a recruiter",
      "are recruiters worth it for startups",
      "when to use an external recruiter",
      "agency recruiter vs in-house sourcing",
      "how to know if you need a recruiter",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-cofounder-or-a-coo",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Cofounder or a COO?",
    description:
      "A cofounder shares fate; a COO is an employee with options. The choice changes who owns the downside, who can be replaced, and how the cap table looks the day an investor opens the file. Pick wrong and you either give away half the company to a senior hire or hand a salaried operator authority they have not earned.",
    primaryQuery: "Should I hire a cofounder or a COO?",
    secondaryQueries: [
      "cofounder vs COO startup",
      "do I need a cofounder or an operator",
      "when to bring in a COO instead of a cofounder",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "andrew-carnegie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "You need someone running operations by next quarter. Promising fifteen points of equity feels permanent in a way that a $220k salary does not. Are you about to staple a partner to the founding story for the wrong reason — convenience?",
    targetKeywords: [
      "should I hire a cofounder or a COO",
      "cofounder vs COO decision",
      "when to bring on an operator",
      "how much equity for a COO",
      "late cofounder vs senior hire",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-someone-i-have-not-met-in-person",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Someone I Have Not Met in Person?",
    description:
      "Remote hiring works at scale, but the first ten people you bring on are not statistics. The question is whether your interview process surfaces the things you would have seen over dinner — or whether you are using video to skip a meeting you should have flown for.",
    primaryQuery: "Should I hire someone I have not met in person?",
    secondaryQueries: [
      "is it safe to hire remotely without meeting",
      "should I fly out a candidate before hiring",
      "remote hiring without in-person interview",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The four video calls went well. The references checked out. Something about the silence between answers still bothers you, and you cannot tell if it is signal or your own anxiety about hiring blind.",
    targetKeywords: [
      "should I hire someone I have not met in person",
      "is remote hiring without meeting risky",
      "should I fly out a final candidate",
      "remote interview red flags",
      "hiring without in-person meeting",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-trial-projects-before-hiring",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Trial Projects Before Hiring?",
    description:
      "Paid trial projects produce better signal than any interview loop, but they cost weeks, cost goodwill with strong candidates who have other offers, and require you to scope work a stranger can actually finish. The decision is whether the role is rare enough that signal beats speed.",
    primaryQuery: "Should I do trial projects before hiring?",
    secondaryQueries: [
      "are paid trial projects worth it for hiring",
      "should I run a paid week trial before hiring",
      "trial project vs interview for engineers",
    ],
    recommendedCouncil: [
      "marie-curie",
      "thomas-edison",
      "aristotle",
    ],
    hookQuestion:
      "Your last hire interviewed beautifully and crumbled in the first week of real work. You now want every candidate to do a paid trial. The strongest candidate in your pipeline already turned down the trial — do you bend the rule for her, or hold the line?",
    targetKeywords: [
      "should I do trial projects before hiring",
      "paid trial week startup hiring",
      "trial project vs interview process",
      "how to run a hiring trial project",
      "is a paid trial worth losing candidates",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-take-home-tests",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Take-Home Tests?",
    description:
      "Take-home tests reveal how candidates work without the panic of a whiteboard, but every senior candidate in your funnel has been asked to do unpaid weekends by ten other companies this year. The question is whether your test produces signal that justifies the people you will lose by asking.",
    primaryQuery: "Should I do take-home tests?",
    secondaryQueries: [
      "are take-home tests worth it for hiring",
      "take home test vs live coding",
      "should startups use take home assignments",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "aristotle",
      "frederick-douglass",
    ],
    hookQuestion:
      "You designed a four-hour take-home and the candidate replied with a polite no. She has three offers. Is your assessment doing real work, or is it a ritual that filters out the people who already know their worth?",
    targetKeywords: [
      "should I do take home tests",
      "take home test vs live interview",
      "are take home assignments fair",
      "engineering take home best practices",
      "when to skip take home tests",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-friends-or-family",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Friends or Family?",
    description:
      "Hiring people you already know shortcuts trust and onboarding, but it also imports a relationship you cannot fire from. If the role does not work out, you do not just lose an employee — you lose a Thanksgiving, a friendship, or a marriage. The question is whether you can hold both roles cleanly.",
    primaryQuery: "Should I hire friends or family?",
    secondaryQueries: [
      "is it a bad idea to hire friends",
      "should I bring my brother into my startup",
      "hiring family members startup risks",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Your closest friend is between jobs and would jump at the role. He is qualified, mostly. The version of you that fires people for not delivering is the same version that would have to fire him. Can you live with that, or are you about to set up the conversation that ends the friendship?",
    targetKeywords: [
      "should I hire friends or family",
      "is hiring a friend a bad idea",
      "hiring family in a startup",
      "how to fire a friend you hired",
      "mixing friendship and business hiring",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-poach-from-competitors",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Poach From Competitors?",
    description:
      "Competitor hires arrive trained, market-aware, and motivated by something — sometimes a better mission, sometimes a grudge. The question is whether the institutional knowledge they bring is worth the legal exposure, the reputational ripple, and the risk that they will leave you the same way they left them.",
    primaryQuery: "Should I poach from competitors?",
    secondaryQueries: [
      "is it ethical to poach from competitors",
      "how to recruit from a competitor",
      "legal risks of hiring competitor employees",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "niccolo-machiavelli",
      "abraham-lincoln",
    ],
    hookQuestion:
      "The exact person you need is a senior engineer at your closest competitor. You have a warm intro. You also have a small market where everyone talks, and a fundraise that depends on the same people not deciding you are the kind of founder who plays dirty.",
    targetKeywords: [
      "should I poach from competitors",
      "is it ok to recruit from competitors",
      "competitor hiring ethics",
      "legal risks poaching employees",
      "how to recruit from a rival company",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-give-signing-bonuses",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Give Signing Bonuses?",
    description:
      "Signing bonuses close the offer faster than salary increases, but they also set a precedent and attract candidates optimizing for the front-loaded check. The right move depends on whether you are buying urgency, compensating for a lower salary, or papering over a real problem with the role itself.",
    primaryQuery: "Should I give signing bonuses?",
    secondaryQueries: [
      "when do signing bonuses work for startups",
      "signing bonus vs higher salary",
      "should I match a counter-offer with a signing bonus",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "benjamin-franklin",
      "cleopatra-vii",
    ],
    hookQuestion:
      "The candidate has a counter-offer from her current employer. A $15k signing bonus closes it tonight. You can afford it once. You cannot afford to do it for the next four hires when the team finds out.",
    targetKeywords: [
      "should I give signing bonuses",
      "signing bonus startup hiring",
      "when is a signing bonus worth it",
      "signing bonus vs base salary",
      "how to use signing bonuses effectively",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-experienced-or-junior",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Experienced or Junior?",
    description:
      "Senior hires move faster on day one but cost more, have stronger opinions about how things should be done, and may be unwilling to do the unglamorous early-stage work. Juniors are cheaper and shape to your culture, but they need a manager and a runway you might not have. The decision turns on whether the bottleneck is execution or training capacity.",
    primaryQuery: "Should I hire experienced or junior?",
    secondaryQueries: [
      "senior vs junior hire startup",
      "should startups hire experienced people first",
      "when to hire juniors as a founder",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "thomas-edison",
      "aristotle",
    ],
    hookQuestion:
      "Two finalists. One is a staff engineer who will demand a real process within a month. The other is a sharp two-year engineer who will work nights and learn whatever you teach her. You have eleven months of runway and no one to mentor anyone.",
    targetKeywords: [
      "should I hire experienced or junior",
      "senior vs junior hire startup",
      "first hire seniority level",
      "is a junior hire worth the risk",
      "when to hire a staff engineer",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-designer-or-developer-first",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire a Designer or Developer First?",
    description:
      "If you are a developer, hiring a designer first buys you a product that looks credible; if you are a designer, hiring a developer first buys you a product that actually exists. The deeper question is which side of the gap is killing your conversion right now — and which side you are personally cheating on.",
    primaryQuery: "Should I hire a designer or developer first?",
    secondaryQueries: [
      "first hire designer or developer",
      "should solo founder hire design or engineering",
      "designer vs developer first hire startup",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "nikola-tesla",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "The signup page looks like a 2009 dashboard and your demo loads in four seconds. You can hire one person this quarter. Which embarrassment is costing you more — the way it looks, or the way it works?",
    targetKeywords: [
      "should I hire a designer or developer first",
      "first hire designer vs engineer",
      "early stage hiring order",
      "solo founder first technical hire",
      "design vs engineering first",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-product-or-engineering-first",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Product or Engineering First?",
    description:
      "An early product hire sharpens what gets built and protects the team from a thousand half-decisions; an early engineering hire ships the thing. The choice depends on whether your bottleneck is throughput or judgment — and whether you, as founder, are willing to stop being the product person.",
    primaryQuery: "Should I hire product or engineering first?",
    secondaryQueries: [
      "first PM hire vs engineer",
      "do I need a product manager early",
      "when to hire a product manager startup",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "isaac-newton",
      "ada-lovelace",
    ],
    hookQuestion:
      "You have three engineers building features faster than you can prioritize them. You suspect half of what shipped last sprint is wrong. Do you hire a PM to think for the team, or another engineer because deep down you trust your own taste more than you trust a stranger's?",
    targetKeywords: [
      "should I hire product or engineering first",
      "first product manager hire startup",
      "PM vs engineer hire",
      "when to hire a PM",
      "product vs engineering hiring priority",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-a-distributed-team",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Build a Distributed Team?",
    description:
      "A distributed team unlocks talent you cannot afford in San Francisco and a calendar that runs while you sleep. It also costs you the casual overhearing, the shared cadence, and the camaraderie that early teams use as fuel. The decision is whether the role you are hiring for benefits from async or quietly suffers from it.",
    primaryQuery: "Should I build a distributed team?",
    secondaryQueries: [
      "is a distributed team a good idea for startups",
      "remote first vs in person early stage",
      "when should a startup go remote",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "harriet-tubman",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You have four people in three time zones and the standups already feel like reading minutes from a meeting that happened yesterday. Are you building a real distributed team, or just a slower in-person one?",
    targetKeywords: [
      "should I build a distributed team",
      "distributed team pros and cons",
      "remote first startup decision",
      "when to go fully remote",
      "distributed vs in person startup team",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-internationally",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire Internationally?",
    description:
      "Hiring across borders opens access to strong engineers at compensation that extends your runway by months, but it introduces tax, legal, and timezone overhead that the founder usually absorbs personally. The question is whether the salary delta covers the operational tax — and whether your management still works on a five-hour delay.",
    primaryQuery: "Should I hire internationally?",
    secondaryQueries: [
      "is international hiring worth it for startups",
      "hiring engineers abroad pros and cons",
      "when to hire internationally as a founder",
    ],
    recommendedCouncil: [
      "alexander-the-great",
      "catherine-the-great",
      "cicero",
    ],
    hookQuestion:
      "A senior engineer in Buenos Aires costs less than a mid-level in Austin and is available in two weeks. The team's next standup is at 9am Pacific. By the time she joins, the day has already happened without her.",
    targetKeywords: [
      "should I hire internationally",
      "international hiring startup",
      "hiring engineers abroad",
      "global hiring vs domestic",
      "remote international hire pros and cons",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-use-an-eor-or-incorporate-abroad",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Use an EOR or Incorporate Abroad?",
    description:
      "An employer of record gets you a legally compliant hire in days for a markup; setting up a foreign entity costs months and money up front, but cuts the per-employee cost when the team grows. The tipping point depends on headcount, country, and whether you intend to stay or hedge.",
    primaryQuery: "Should I use an EOR or incorporate abroad?",
    secondaryQueries: [
      "EOR vs foreign entity for hiring",
      "when to set up an entity abroad",
      "employer of record vs incorporation",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "niccolo-machiavelli",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Two hires in Germany feels like an EOR problem. Six hires in Germany feels like a tax problem. You do not yet know which one you are, and the next signed offer makes it real.",
    targetKeywords: [
      "should I use an EOR or incorporate abroad",
      "EOR vs foreign entity startup",
      "when does an EOR stop being cheaper",
      "global expansion entity setup",
      "employer of record decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-have-an-office",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Have an Office?",
    description:
      "An office is a recurring cost and a culture statement at the same time. For some teams it concentrates energy and shortens decisions; for others it becomes a museum the team visits twice a week. The decision turns on whether the work actually benefits from being in the same room — and whether you, the founder, will be there.",
    primaryQuery: "Should I have an office?",
    secondaryQueries: [
      "is an office worth it for startups",
      "office vs remote early stage",
      "when does a startup need an office",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "marcus-aurelius",
      "thomas-edison",
    ],
    hookQuestion:
      "The lease is three years. The team is six people. You can already picture the day the office is half-empty and you are paying for chairs no one sits in. You also remember how much faster the last three problems got solved when everyone was in the same room.",
    targetKeywords: [
      "should I have an office",
      "is an office worth it for a startup",
      "office space vs remote startup",
      "when to lease a startup office",
      "physical office early stage decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-co-working",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Co-Working?",
    description:
      "A co-working desk is a cheap office without the lease, and a noisy distraction without the privacy. It can rescue a founder from a kitchen table or it can become an expensive way to overhear other people's sales calls. The choice depends on whether you need a room of your own or a room with strangers in it.",
    primaryQuery: "Should I do co-working?",
    secondaryQueries: [
      "is co-working worth it for founders",
      "co-working vs home office startup",
      "should a small team use co-working",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "nikola-tesla",
      "socrates",
    ],
    hookQuestion:
      "You have not had a deep-work block in eleven days. The cafe is too loud, the apartment is too quiet, and a $400 hot desk looks like the cheapest version of focus you have ever bought. Or it might just be a slightly nicer place to scroll.",
    targetKeywords: [
      "should I do co-working",
      "is co-working worth it for solo founders",
      "co-working vs home office",
      "co-working space for small team",
      "wework alternatives for founders",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-fire-this-person",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Fire This Person?",
    description:
      "Most firing decisions are made months before they happen. The cost of delay is not just the underperformance — it is the message the rest of the team reads from your tolerance. The question is whether you are still developing this person, or whether you are protecting yourself from a hard conversation.",
    primaryQuery: "Should I fire this person?",
    secondaryQueries: [
      "when should I fire an employee",
      "how to know it is time to fire someone",
      "signs you need to fire an employee",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "The team has been quietly routing around them for weeks. You keep planning the conversation in your head and then choosing a different agenda. Who is the delay actually protecting at this point?",
    targetKeywords: [
      "should I fire this person",
      "when to fire an underperforming employee",
      "signs it is time to fire someone",
      "how to know if firing is the right call",
      "founder firing decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-pip-or-fire-immediately",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do a PIP or Fire Immediately?",
    description:
      "A performance improvement plan gives the employee a real shot and gives you legal cover, but it telegraphs the outcome and demoralizes everyone watching. Immediate termination is cleaner and faster, and may be unfair if you have never given clear feedback before. The right call depends on whether you actually want them to succeed, or just want a clean exit.",
    primaryQuery: "Should I do a PIP or fire immediately?",
    secondaryQueries: [
      "PIP vs immediate termination",
      "is a PIP worth it",
      "when to skip the PIP and fire",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "florence-nightingale",
      "harriet-tubman",
    ],
    hookQuestion:
      "If you ran an honest PIP, what would change in 60 days? If the answer is nothing, the PIP is a ritual. If the answer is real, you owe them one. Which is it?",
    targetKeywords: [
      "should I do a PIP or fire immediately",
      "PIP vs immediate firing",
      "is a performance improvement plan worth it",
      "when to skip the PIP",
      "PIP startup decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-restructure-the-team",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Restructure the Team?",
    description:
      "A reorg can unstick a stuck team or burn six months of momentum, depending on whether the structure was actually the problem. The real question is whether you are redrawing the org chart to fix a specific bottleneck, or to avoid a harder conversation about a specific person.",
    primaryQuery: "Should I restructure the team?",
    secondaryQueries: [
      "when to restructure a startup team",
      "is a reorg worth it",
      "how to know if a reorg is needed",
    ],
    recommendedCouncil: [
      "napoleon-bonaparte",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The new org chart is on your screen and it solves problems you had three months ago. The problems you have now still have the same names attached to them.",
    targetKeywords: [
      "should I restructure the team",
      "when to do a startup reorg",
      "is a reorg worth the disruption",
      "team restructure decision",
      "reorganizing a small company",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-promote-this-person",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Promote This Person?",
    description:
      "A promotion rewards the work of the last twelve months and bets on the work of the next twelve, which are usually different jobs. The question is whether this person can do the new role — or whether you are about to lose your best individual contributor and gain a mediocre manager.",
    primaryQuery: "Should I promote this person?",
    secondaryQueries: [
      "when to promote an employee",
      "is this person ready for management",
      "promoting top performer to manager risks",
    ],
    recommendedCouncil: [
      "aristotle",
      "abraham-lincoln",
      "florence-nightingale",
    ],
    hookQuestion:
      "She is the best engineer on the team. She has asked twice about a lead role. You have watched her give feedback once, and you flinched. Are you about to promote a great builder into a job she has not shown she can do?",
    targetKeywords: [
      "should I promote this person",
      "when to promote an employee",
      "promoting an IC to manager",
      "promotion readiness signals",
      "promote or keep as individual contributor",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-my-first-manager",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Hire My First Manager?",
    description:
      "Your first manager hire is the moment you stop running everything personally. Done well, it buys you the focus to work on the company instead of in it. Done poorly, it inserts a layer between you and the work and you find yourself relitigating decisions in 1:1s instead of making them.",
    primaryQuery: "Should I hire my first manager?",
    secondaryQueries: [
      "when does a startup need its first manager",
      "first manager hire founder",
      "is it too early for a manager",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "marcus-aurelius",
      "socrates",
    ],
    hookQuestion:
      "You have eight direct reports and a calendar that ate Tuesday. Hiring a manager means giving up the chair you sit in during product reviews. Are you ready to let someone else run a meeting and live with how they run it?",
    targetKeywords: [
      "should I hire my first manager",
      "first manager hire startup",
      "when does a founder need a manager",
      "how many reports before hiring a manager",
      "founder to delegator transition",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-pay-above-market",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Pay Above Market?",
    description:
      "Paying above market closes offers faster, signals seriousness, and reduces the pull of recruiter calls. It also locks in a comp band you will have to honor for everyone who comes next — and tells the team something specific about what you value when cash is tight. The question is what story your offer letters are quietly writing.",
    primaryQuery: "Should I pay above market?",
    secondaryQueries: [
      "is it worth paying above market salary",
      "above market comp startup",
      "should startups pay top of band",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "andrew-carnegie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You can afford to pay this hire 15% over the band. You cannot afford to pay the next four 15% over. You also cannot afford for this hire to take the other offer.",
    targetKeywords: [
      "should I pay above market",
      "is above market salary worth it",
      "startup comp band strategy",
      "paying top of market for engineers",
      "above market salary tradeoffs",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-equity-or-cash-comp",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Equity or Cash Comp?",
    description:
      "Heavy equity preserves cash and selects for believers; heavy cash closes offers and selects for professionals. The mix tells candidates what kind of company you think you are building, and quietly tells you whether you believe the equity is actually worth anything.",
    primaryQuery: "Should I do equity or cash comp?",
    secondaryQueries: [
      "equity vs cash compensation startup",
      "how much equity vs salary to offer",
      "cash heavy vs equity heavy offer",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "thomas-edison",
    ],
    hookQuestion:
      "You can offer $140k and 1.5%, or $170k and 0.5%. The candidate is doing the math on a spreadsheet that assumes the equity is worth zero. So, deep down, are you.",
    targetKeywords: [
      "should I do equity or cash comp",
      "equity vs salary startup offer",
      "how much equity to give early employees",
      "cash vs equity hire decision",
      "startup compensation mix",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-host-an-offsite",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Host an Offsite?",
    description:
      "An offsite can compress months of strategic alignment into three days, or it can be a $40k group vacation that produces a Notion doc no one opens. The difference is almost entirely about whether you arrived with a real question that has to be answered before anyone goes home.",
    primaryQuery: "Should I host an offsite?",
    secondaryQueries: [
      "is a company offsite worth it",
      "when to do a startup offsite",
      "how to run an effective offsite",
    ],
    recommendedCouncil: [
      "catherine-the-great",
      "marcus-aurelius",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Three days, eleven people, a rental house and an agenda that says \"alignment.\" If the team came home tomorrow, what decision would have actually been made that could not have been made on a Tuesday?",
    targetKeywords: [
      "should I host an offsite",
      "is a company offsite worth it",
      "startup offsite ROI",
      "how to plan a team offsite",
      "when to do a founder offsite",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-performance-reviews",
    status: "shipped",
    shippedAt: "2026-05-21",
    title: "Should I Do Performance Reviews?",
    description:
      "Formal performance reviews force the feedback conversations founders avoid in the hallway. They also cost real time, can flatten honest signal into safe ratings, and risk becoming a process the team performs rather than learns from. The question is whether the reviews replace something worse, or just add a ritual on top of it.",
    primaryQuery: "Should I do performance reviews?",
    secondaryQueries: [
      "are performance reviews worth it for startups",
      "when to start performance reviews",
      "performance reviews small team",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "aristotle",
      "marcus-aurelius",
    ],
    hookQuestion:
      "You have not given any of the team formal feedback in eight months. A review cycle would force the conversation. It would also force you to defend, on paper, what you have been quietly thinking about each of them.",
    targetKeywords: [
      "should I do performance reviews",
      "are performance reviews worth it",
      "when to introduce performance reviews",
      "performance reviews for small teams",
      "startup performance review cycle",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 03 — shipped 2026-05-22 ────
  {
    slug: "should-i-launch-an-mvp-or-build-fully",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Launch an MVP or Build Fully?",
    description:
      "An MVP gets you in front of real users while the idea is still cheap to change. A full build buys polish but locks in months of assumptions you have not tested. The choice depends on whether your biggest risk is taste or learning speed.",
    primaryQuery: "Should I launch an MVP or build fully?",
    secondaryQueries: [
      "MVP vs full product",
      "when to launch an MVP",
      "is an MVP worth it",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "thomas-edison",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "If you ship the rough version and people hate the rough edges, will they remember? If you spend six more months polishing and the demand never shows, will you?",
    targetKeywords: [
      "should I launch an MVP or build fully",
      "MVP vs full product launch",
      "when to launch an MVP",
      "is an MVP worth building",
      "how minimal should an MVP be",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-rewrite",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Do a Rewrite?",
    description:
      "A rewrite promises a clean codebase and a faster team, but it usually delivers six months of no new features and a fresh set of bugs. The real question is whether the current code is blocking growth or whether you are blocked by something else.",
    primaryQuery: "Should I do a rewrite?",
    secondaryQueries: [
      "is a full rewrite worth it",
      "when to rewrite a codebase",
      "rewrite vs refactor",
    ],
    recommendedCouncil: [
      "isaac-newton",
      "archimedes",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "The current code is ugly and you can feel every shortcut you took, but customers do not see the code. Are you fixing a real bottleneck, or running from your own past?",
    targetKeywords: [
      "should I do a rewrite",
      "is a full rewrite worth it",
      "when to rewrite a codebase",
      "rewrite vs refactor",
      "big rewrite startup mistake",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-deprecate-a-feature",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Deprecate a Feature?",
    description:
      "Every feature you keep adds weight to your roadmap, your support load, and your onboarding. But a small group of users may love this one feature exactly as it is. Deprecation is a question about leverage, not popularity.",
    primaryQuery: "Should I deprecate a feature?",
    secondaryQueries: [
      "when to deprecate a product feature",
      "how to kill a feature",
      "feature deprecation strategy",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "sun-tzu",
      "marie-curie",
    ],
    hookQuestion:
      "A handful of paying users will scream when this feature dies. The other ninety percent never touched it. Whose voice do you listen to, and why?",
    targetKeywords: [
      "should I deprecate a feature",
      "when to deprecate a product feature",
      "how to kill a feature without losing users",
      "feature deprecation strategy",
      "how to sunset a feature gracefully",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sunset-a-product",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Sunset a Product?",
    description:
      "Sunsetting a product is rarely about whether anyone still uses it. It is about whether the attention it eats is worth the revenue it brings in. Keeping a low-traction product alive can quietly starve the one you actually believe in.",
    primaryQuery: "Should I sunset a product?",
    secondaryQueries: [
      "when to shut down a product line",
      "how to sunset a product",
      "kill a product or keep it",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "sun-tzu",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "The product still pays for itself, but it eats a third of your week. Are you running a business or babysitting a thing you no longer believe in?",
    targetKeywords: [
      "should I sunset a product",
      "when to shut down a product line",
      "how to sunset a product",
      "kill a product or keep it",
      "end of life product strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-a-mobile-version",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Build a Mobile Version?",
    description:
      "A mobile app feels like a sign of seriousness, but it doubles your surface area: two codebases, two release cycles, two sets of bugs. The question is whether your users are actually trying to use you on a phone, or whether you are trying to look bigger.",
    primaryQuery: "Should I build a mobile version?",
    secondaryQueries: [
      "do I need a mobile app",
      "web app vs mobile app for startup",
      "when to build a mobile version",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "ada-lovelace",
      "thomas-edison",
    ],
    hookQuestion:
      "Your users say they want a mobile app. They also say they want dark mode and a Slack integration. Which of those requests is the one that actually changes whether they keep paying?",
    targetKeywords: [
      "should I build a mobile version",
      "do I need a mobile app for my SaaS",
      "web app vs mobile app for startup",
      "when to build a mobile version",
      "mobile-first or web-first startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-a-desktop-app",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Build a Desktop App?",
    description:
      "A desktop app gives you OS-level integrations, offline use, and a Dock icon that lives in your user's day. It also costs you the install funnel, code-signing headaches, and a separate update channel. The question is whether the always-on presence is worth the friction.",
    primaryQuery: "Should I build a desktop app?",
    secondaryQueries: [
      "desktop app vs web app",
      "when to build a native desktop app",
      "is a desktop app worth it",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "nikola-tesla",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "On the web you are one of forty tabs. On the desktop you are one icon they see every morning. Is that proximity worth maintaining a whole second product?",
    targetKeywords: [
      "should I build a desktop app",
      "desktop app vs web app",
      "when to build a native desktop app",
      "is a desktop app worth it",
      "electron vs web for SaaS",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-a-chrome-extension",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Build a Chrome Extension?",
    description:
      "A Chrome extension can be the fastest distribution channel you ever build. It can also be a permanent dependency on Google's review queue and policy changes. The decision is part product, part risk tolerance for a platform you do not control.",
    primaryQuery: "Should I build a Chrome extension?",
    secondaryQueries: [
      "is a Chrome extension worth building",
      "Chrome extension vs web app",
      "should my startup build a browser extension",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "benjamin-franklin",
      "ada-lovelace",
    ],
    hookQuestion:
      "An extension puts you one click from your user's intent. It also puts your whole growth path inside a store whose rules can change next quarter. How much of your future are you willing to host on someone else's shelf?",
    targetKeywords: [
      "should I build a Chrome extension",
      "is a Chrome extension worth building",
      "Chrome extension vs web app",
      "should my startup build a browser extension",
      "browser extension distribution strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-collaboration-features",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add Collaboration Features?",
    description:
      "Collaboration features turn a single-player tool into a workspace, which usually means higher retention and bigger contracts. They also mean real-time sync, permissions, invites, and a support load that grows with every team that signs up. The decision is whether you are ready to run multi-user, not whether users would like it.",
    primaryQuery: "Should I add collaboration features?",
    secondaryQueries: [
      "when to add team features",
      "single-player vs multiplayer product",
      "is collaboration worth building",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "aristotle",
      "cleopatra-vii",
    ],
    hookQuestion:
      "Solo users love that your product feels like a private workshop. The moment you add teammates, comments, and roles, you change what the product is. Are you sure that is the product you want to run?",
    targetKeywords: [
      "should I add collaboration features",
      "when to add team features to a SaaS",
      "single-player vs multiplayer product",
      "is collaboration worth building",
      "how to add collaboration to a product",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-ai-features",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add AI Features?",
    description:
      "Bolting AI onto an existing product can lift retention, justify a price increase, and answer the question every investor is asking. It can also burn your margin, introduce hallucinations into a workflow that used to be reliable, and lock you into a vendor whose pricing you cannot control. The question is whether AI changes the core job, or just decorates it.",
    primaryQuery: "Should I add AI features?",
    secondaryQueries: [
      "should my SaaS add AI features",
      "when to add AI to a product",
      "is adding AI worth the cost",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "marie-curie",
      "thomas-edison",
    ],
    hookQuestion:
      "Every competitor is shipping an AI button. Some of them are bluffing. Are you adding a real capability your users will pay more for, or putting a sparkle icon on a feature that already worked?",
    targetKeywords: [
      "should I add AI features",
      "should my SaaS add AI features",
      "when to add AI to a product",
      "is adding AI worth the cost",
      "how to add AI without breaking the product",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-analytics-features",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add Analytics Features?",
    description:
      "Analytics dashboards inside your product can earn you an upsell tier and make your data sticky, but they also expand your scope from doing the job to reporting on the job. The real question is whether your users will pay for the numbers, or just glance at them once.",
    primaryQuery: "Should I add analytics features?",
    secondaryQueries: [
      "should my product have a dashboard",
      "in-app analytics worth building",
      "when to add analytics to SaaS",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "marie-curie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Your users keep asking for a dashboard. They also keep opening yours once, nodding, and never coming back. Are you building a tool they will use, or a feature they will demo to their boss?",
    targetKeywords: [
      "should I add analytics features",
      "should my product have a dashboard",
      "in-app analytics worth building",
      "when to add analytics to SaaS",
      "how to design a useful analytics page",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-api-access",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add API Access?",
    description:
      "An API turns your product into something other developers build on, which can lock in customers in ways the UI never will. It also commits you to versioning, breaking-change discipline, and a support tier that expects you to answer at developer speed. Opening an API is a long-term contract, not a feature.",
    primaryQuery: "Should I add API access?",
    secondaryQueries: [
      "when to launch a public API",
      "is offering an API worth it",
      "public vs private API for SaaS",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "archimedes",
      "thomas-edison",
    ],
    hookQuestion:
      "Once a developer wires your API into their production system, you cannot easily change it without breaking their build. Are you ready for that kind of marriage?",
    targetKeywords: [
      "should I add API access",
      "when to launch a public API",
      "is offering an API worth it",
      "public vs private API for SaaS",
      "how to price an API tier",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-integrations",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add Integrations?",
    description:
      "Integrations are the cheapest way to make your product feel essential — and the cheapest way to scatter your engineering team across other people's APIs. The question is which one or two integrations move purchase decisions, and which are vanity badges on your homepage.",
    primaryQuery: "Should I add integrations?",
    secondaryQueries: [
      "which integrations should my SaaS build",
      "are integrations worth building",
      "how to prioritize integrations",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "sun-tzu",
    ],
    hookQuestion:
      "Every sales call ends with a request for one more integration. Build them all and you will have a logo wall and no time left to ship anything else. Which integration would lose you the deal if you said no?",
    targetKeywords: [
      "should I add integrations",
      "which integrations should my SaaS build",
      "are integrations worth building",
      "how to prioritize integrations",
      "integration roadmap for startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-be-platform-agnostic",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Be Platform Agnostic?",
    description:
      "Being platform agnostic protects you from a single vendor changing the rules. It also costs you the deep integrations and credibility that come from picking a side. The choice is a bet on how exposed you are willing to be to other people's roadmaps.",
    primaryQuery: "Should I be platform agnostic?",
    secondaryQueries: [
      "platform agnostic vs platform native",
      "should my product be cross-platform",
      "is platform agnostic worth it",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "archimedes",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "If you bet on one platform, a single policy change can break your business overnight. If you spread across all of them, you may end up shallow everywhere. Which kind of fragility are you willing to live with?",
    targetKeywords: [
      "should I be platform agnostic",
      "platform agnostic vs platform native",
      "should my product be cross-platform",
      "is platform agnostic worth it",
      "platform risk for startups",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-on-someone-else-s-platform",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Build on Someone Else's Platform?",
    description:
      "Building on top of Shopify, Salesforce, or Notion can hand you a ready-made customer base and a distribution shortcut. It also means your business lives or dies by another company's policy team. This decision is less about technology and more about who owns your future.",
    primaryQuery: "Should I build on someone else's platform?",
    secondaryQueries: [
      "is building on a platform safe",
      "platform risk for startup",
      "should I build on Shopify or Salesforce",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "marcus-aurelius",
    ],
    hookQuestion:
      "The platform gives you a million users on day one. It can also take them away in one update. Are you renting or building?",
    targetKeywords: [
      "should I build on someone else's platform",
      "is building on a platform safe",
      "platform risk for startup",
      "should I build on Shopify or Salesforce",
      "platform dependency strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-on-the-blockchain",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Build on the Blockchain?",
    description:
      "Building on the blockchain can give you settlement, ownership, or coordination properties you cannot get any other way. It also adds latency, fees, regulatory exposure, and a user base whose patience for normal product UX is thin. The question is whether the on-chain part is the product or the marketing.",
    primaryQuery: "Should I build on the blockchain?",
    secondaryQueries: [
      "is blockchain worth using for my startup",
      "when to use blockchain in a product",
      "blockchain vs database",
    ],
    recommendedCouncil: [
      "marie-curie",
      "niccolo-machiavelli",
      "isaac-newton",
    ],
    hookQuestion:
      "If you strip out the token, would the product still make sense? If the answer is no, are you building a company or a casino chip?",
    targetKeywords: [
      "should I build on the blockchain",
      "is blockchain worth using for my startup",
      "when to use blockchain in a product",
      "blockchain vs database",
      "on-chain product decisions",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-fork-an-open-source-project",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Fork an Open Source Project?",
    description:
      "Forking gives you a head start and lets you steer in a direction the maintainers refused to go. It also gives you a long-term maintenance burden, a brand confusion problem, and the political fallout from the community you just split. This is rarely a technical decision.",
    primaryQuery: "Should I fork an open source project?",
    secondaryQueries: [
      "when to fork an open source project",
      "is forking worth it",
      "how to fork open source the right way",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "archimedes",
      "benjamin-franklin",
    ],
    hookQuestion:
      "The day you fork, you inherit every bug, every PR backlog, and every contributor who feels betrayed. Are you forking because the path forward is clearer, or because asking the maintainers felt too hard?",
    targetKeywords: [
      "should I fork an open source project",
      "when to fork an open source project",
      "is forking worth it",
      "how to fork open source the right way",
      "open source fork strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-major-version-update",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Do a Major Version Update?",
    description:
      "A major version is your chance to break what needed breaking and ship a sharper product. It is also a way to confuse loyal users, invite migration pain, and reset every onboarding metric you spent a year tuning. The decision is whether the new version is meaningfully better, or just newer.",
    primaryQuery: "Should I do a major version update?",
    secondaryQueries: [
      "when to ship a v2",
      "is a major version update worth it",
      "how to handle a major release",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "nikola-tesla",
      "isaac-newton",
    ],
    hookQuestion:
      "Half your users will love the new version. The other half will email support asking where their old buttons went. Is the gain on the new side bigger than the noise on the old?",
    targetKeywords: [
      "should I do a major version update",
      "when to ship a v2",
      "is a major version update worth it",
      "how to handle a major release",
      "major version release strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-rebuild-on-new-stack",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Rebuild on a New Stack?",
    description:
      "Moving to a new stack can erase real pain — slow builds, bad hiring pool, performance ceilings. It can also bury six months of shipping while you reinvent every internal tool you had built up. This is the decision that ends more startups than it saves.",
    primaryQuery: "Should I rebuild on a new stack?",
    secondaryQueries: [
      "when to switch tech stacks",
      "is changing tech stack worth it",
      "stack migration startup",
    ],
    recommendedCouncil: [
      "isaac-newton",
      "archimedes",
      "marie-curie",
    ],
    hookQuestion:
      "You can tell yourself the new stack is faster, safer, more hireable. Are those gains worth a quarter of frozen roadmap, or are you escaping a codebase you simply got tired of?",
    targetKeywords: [
      "should I rebuild on a new stack",
      "when to switch tech stacks",
      "is changing tech stack worth it",
      "stack migration startup",
      "rewrite stack risk",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-prioritize-this-feature-request",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Prioritize This Feature Request?",
    description:
      "A loud customer asking for a feature is rarely a roadmap. They are telling you about their problem, dressed up as a solution. The real decision is whether their problem is shared by enough other customers to be worth chasing.",
    primaryQuery: "Should I prioritize this feature request?",
    secondaryQueries: [
      "how to prioritize feature requests",
      "when to say no to a feature request",
      "do customer feature requests matter",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "aristotle",
      "marie-curie",
    ],
    hookQuestion:
      "One customer is shouting, three are quietly waiting for something else. Are you going to build for the loudest voice, or for the pattern under all of them?",
    targetKeywords: [
      "should I prioritize this feature request",
      "how to prioritize feature requests",
      "when to say no to a feature request",
      "do customer feature requests matter",
      "feature request triage",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-an-onboarding-tutorial",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add an Onboarding Tutorial?",
    description:
      "An onboarding tutorial can lift activation by walking new users through the moment that matters. It can also become a wall users click past without reading, while masking real product confusion. The question is whether you are fixing the product or covering for it.",
    primaryQuery: "Should I add an onboarding tutorial?",
    secondaryQueries: [
      "do onboarding tutorials work",
      "when to add product onboarding",
      "is an onboarding flow worth it",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "florence-nightingale",
      "thomas-edison",
    ],
    hookQuestion:
      "If users do not understand your product, a tour will not save you. If they would understand it with one good first action, a tour might be overkill. Which problem are you actually solving?",
    targetKeywords: [
      "should I add an onboarding tutorial",
      "do onboarding tutorials work",
      "when to add product onboarding",
      "is an onboarding flow worth it",
      "how to onboard new users",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-product-led-growth",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Do Product-Led Growth?",
    description:
      "Product-led growth lets the product do the selling, which is cheap and durable when it works. It also assumes your product is good enough to sell itself with no sales team in the room. The decision is honest only when you can name the moment a user becomes a buyer without a human nudge.",
    primaryQuery: "Should I do product-led growth?",
    secondaryQueries: [
      "is product-led growth right for my startup",
      "PLG vs sales-led",
      "when to choose product-led growth",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "john-d-rockefeller",
      "cicero",
    ],
    hookQuestion:
      "If you removed every sales call, every demo, every onboarding email — would your product still convert? If not, you are not doing PLG, you are hoping for it.",
    targetKeywords: [
      "should I do product-led growth",
      "is product-led growth right for my startup",
      "PLG vs sales-led",
      "when to choose product-led growth",
      "how to switch to product-led growth",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-customer-led-development",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Do Customer-Led Development?",
    description:
      "Listening to customers is the cheapest research you will ever get. Letting them write your roadmap is the fastest way to build a product that is everything to ten people and nothing to a thousand. The decision is how much weight a single voice gets in the room where you say no.",
    primaryQuery: "Should I do customer-led development?",
    secondaryQueries: [
      "is customer-led development a good idea",
      "how much to let customers drive product",
      "customer feedback vs product vision",
    ],
    recommendedCouncil: [
      "marie-curie",
      "florence-nightingale",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Your customers know their problems better than you do. They also do not have to live with the product you build in response. Whose judgment finally decides what ships?",
    targetKeywords: [
      "should I do customer-led development",
      "is customer-led development a good idea",
      "how much to let customers drive product",
      "customer feedback vs product vision",
      "customer-led roadmap",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-add-a-roadmap-page",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Add a Roadmap Page?",
    description:
      "A public roadmap can build trust and reduce the same five questions in your inbox every week. It also exposes your priorities to competitors and creates a public expectation you may not be able to keep. The decision turns on whether you would rather manage hope or manage surprise.",
    primaryQuery: "Should I add a roadmap page?",
    secondaryQueries: [
      "is a public roadmap worth it",
      "public roadmap pros and cons",
      "should startups publish their roadmap",
    ],
    recommendedCouncil: [
      "cicero",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The moment you publish a date, every user remembers it. The moment you publish a feature, every competitor sees it. Are you offering transparency, or handing over your hand of cards?",
    targetKeywords: [
      "should I add a roadmap page",
      "is a public roadmap worth it",
      "public roadmap pros and cons",
      "should startups publish their roadmap",
      "how to run a public roadmap",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-launch-a-second-product",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Launch a Second Product?",
    description:
      "A second product can unlock a new audience and reduce your single-product risk. It can also split your team's focus, dilute your brand, and starve the product that is actually paying the bills. The honest question is whether the first product is finished enough to share your attention.",
    primaryQuery: "Should I launch a second product?",
    secondaryQueries: [
      "when to launch a second product",
      "is launching a second product a good idea",
      "second product or focus on first",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "andrew-carnegie",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "The first product still has untouched growth. A second product feels exciting because it is fresh, not because it is right. Are you expanding the empire, or running from a plateau?",
    targetKeywords: [
      "should I launch a second product",
      "when to launch a second product",
      "is launching a second product a good idea",
      "second product or focus on first",
      "multi-product startup strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sunset-version-one",
    status: "shipped",
    shippedAt: "2026-05-22",
    title: "Should I Sunset Version One?",
    description:
      "Keeping v1 alive after v2 ships protects your existing customers and your reputation. It also doubles your maintenance load and slows every future change. The decision is whether v1 has earned a graceful retirement or a permanent room in your codebase.",
    primaryQuery: "Should I sunset version one?",
    secondaryQueries: [
      "when to end of life v1",
      "should I support both versions of my product",
      "sunset v1 after v2 launch",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "marcus-aurelius",
      "sun-tzu",
    ],
    hookQuestion:
      "The customers still on v1 trusted you first. The customers on v2 are paying you now. How do you honor one without holding the other hostage?",
    targetKeywords: [
      "should I sunset version one",
      "when to end of life v1",
      "should I support both versions of my product",
      "sunset v1 after v2 launch",
      "legacy version retirement strategy",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 04 — shipped 2026-05-19 ────
  {
    slug: "should-i-do-a-safe-or-priced-round",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a SAFE or Priced Round?",
    description:
      "A SAFE postpones the valuation argument; a priced round forces it. The cost of postponing is dilution overhang you cannot see until conversion, and the cost of pricing now is locking in a number you may not earn out of for two years.",
    primaryQuery: "Should I do a SAFE or priced round?",
    secondaryQueries: [
      "SAFE vs priced round pros and cons",
      "when does a SAFE become a bad deal",
      "convertible note vs priced equity startup",
      "is a SAFE bad for founders",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "john-d-rockefeller",
      "marie-curie",
    ],
    hookQuestion:
      "Every SAFE you stack is a future cap table you have not seen yet. Are you saving a fight you cannot win today, or hiding a dilution number from yourself until it is too late to negotiate it?",
    targetKeywords: [
      "should I do a SAFE or priced round",
      "SAFE vs priced round pros and cons",
      "when does a SAFE hurt founders",
      "convertible note vs priced equity",
      "SAFE dilution stacking",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-rolling-close",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Rolling Close?",
    description:
      "Rolling closes let you bank capital as it arrives instead of waiting for a single signing. The upside is runway and momentum; the downside is that early investors set terms the lead has no chance to renegotiate, and you signal weakness if the round drags.",
    primaryQuery: "Should I do a rolling close?",
    secondaryQueries: [
      "rolling close vs traditional close",
      "is a rolling close bad for momentum",
      "how to run a rolling close fundraise",
      "rolling close downsides for founders",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "julius-caesar",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A rolling close turns fundraising from a battle into a siege. Are you using the slow drip to compound momentum, or just buying time on a round the market is not actually interested in?",
    targetKeywords: [
      "should I do a rolling close",
      "rolling close vs traditional close",
      "rolling close fundraising strategy",
      "rolling first close startup",
      "rolling close downsides",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-party-round",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Party Round?",
    description:
      "A party round spreads the check across many small investors, which can buy you marketing, network, and zero board friction. It also leaves you with no one whose phone you can call when the next round is hard.",
    primaryQuery: "Should I do a party round?",
    secondaryQueries: [
      "party round pros and cons",
      "is a party round bad for follow-on",
      "many small investors vs one lead",
      "party round signaling risk",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "catherine-the-great",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Thirty cheerleaders feel like an army until you need one of them to actually fight for you. Are you building a coalition that will defend the next round, or a fan club that will disappear when the metrics dip?",
    targetKeywords: [
      "should I do a party round",
      "party round pros and cons",
      "party round vs lead investor",
      "is a party round worth it",
      "many small investors fundraising",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-strategic-investment",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take Strategic Investment?",
    description:
      "Strategic money comes with distribution, customers, or technology you cannot easily buy. It also comes with right-of-first-refusal clauses and a competitor list that just shrunk by one. The real question is whether the partnership compounds before the constraints bind.",
    primaryQuery: "Should I take strategic investment?",
    secondaryQueries: [
      "strategic investor vs financial investor",
      "downsides of strategic investment startup",
      "when to take strategic capital",
      "does strategic money kill optionality",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "andrew-carnegie",
    ],
    hookQuestion:
      "A strategic check buys you a shortcut and a signature on a list of companies that will never acquire you. Is the partnership worth the doors it closes the moment the wire clears?",
    targetKeywords: [
      "should I take strategic investment",
      "strategic investor vs financial investor",
      "downsides of strategic investment",
      "strategic capital startup risks",
      "ROFR strategic investor",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-corporate-vc",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take Corporate VC?",
    description:
      "Corporate VC funds invest from a balance sheet that has a product roadmap attached to it. They can pay premium valuations and open enterprise doors; they can also lose interest the moment their parent company reorganizes, and their data-access clauses sometimes read like an acquisition memo.",
    primaryQuery: "Should I take corporate VC?",
    secondaryQueries: [
      "corporate VC vs traditional VC",
      "is corporate venture capital good or bad",
      "CVC investor risks for startups",
      "when to take corporate VC money",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "catherine-the-great",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "A corporate fund writing your check has a parent company whose strategy may change next quarter. Are you taking smart money, or accepting a permanent observer from a future competitor?",
    targetKeywords: [
      "should I take corporate VC",
      "corporate VC vs traditional VC",
      "corporate venture capital risks",
      "CVC pros and cons startup",
      "when to take corporate venture money",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-impact-investment",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take Impact Investment?",
    description:
      "Impact capital is patient on returns and harsh on mission drift. The reporting overhead is real, the valuation discount can be material, and the covenants may forbid the exact pivot your business needs in year three.",
    primaryQuery: "Should I take impact investment?",
    secondaryQueries: [
      "impact investor vs traditional VC tradeoffs",
      "downsides of impact investment",
      "mission lock impact capital",
      "is impact capital cheaper or more expensive",
    ],
    recommendedCouncil: [
      "harriet-tubman",
      "abraham-lincoln",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Impact capital will fund the mission you wrote down today. Will it fund the company you become if the market forces you to choose between purpose and survival?",
    targetKeywords: [
      "should I take impact investment",
      "impact investor vs traditional VC",
      "impact investment downsides",
      "mission lock startup funding",
      "ESG investor covenants",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-revenue-based-financing",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do Revenue-Based Financing?",
    description:
      "Revenue-based financing trades a slice of monthly revenue for capital with no dilution and no board seat. It works when your gross margin is high and your growth is predictable; it punishes you when margins compress, because the repayment cap does not flex with reality.",
    primaryQuery: "Should I do revenue-based financing?",
    secondaryQueries: [
      "revenue-based financing vs equity",
      "is RBF good for SaaS startups",
      "when to use revenue financing",
      "RBF downsides startup",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "john-d-rockefeller",
      "marie-curie",
    ],
    hookQuestion:
      "Revenue financing keeps your cap table clean and your cash flow tight. Are you choosing the discipline of paying it back monthly, or borrowing against a growth curve you have not actually proven yet?",
    targetKeywords: [
      "should I do revenue-based financing",
      "revenue-based financing vs equity",
      "is RBF good for SaaS",
      "RBF vs venture debt",
      "revenue financing downsides",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-a-loan-vs-equity",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take a Loan vs Equity?",
    description:
      "Debt keeps your ownership intact and your covenants live. Equity keeps your runway intact and your investors aligned. The choice turns on whether the cash funds an asset you can repay from cash flow, or a bet whose downside would crater a debt service schedule.",
    primaryQuery: "Should I take a loan or raise equity?",
    secondaryQueries: [
      "debt vs equity startup financing",
      "when to take a loan instead of equity",
      "venture debt vs equity round",
      "is debt cheaper than equity for startups",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "john-d-rockefeller",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Debt asks if you can repay; equity asks if you can compound. Are you funding an asset that pays back on a schedule, or a bet whose downside would force the bank to take the company before the investor would?",
    targetKeywords: [
      "should I take a loan or equity",
      "debt vs equity for startups",
      "venture debt vs equity round",
      "when to use startup debt",
      "loan vs investor capital",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-bridge-round",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Bridge Round?",
    description:
      "A bridge round buys you the months you need to hit the milestone that justifies the next priced round. The risk is that bridges become piers — every existing investor adds another note, and the next lead reads the stack as a sign the milestone keeps slipping.",
    primaryQuery: "Should I do a bridge round?",
    secondaryQueries: [
      "bridge round vs new round",
      "is a bridge round a bad signal",
      "when to do an insider bridge",
      "bridge to nowhere fundraising",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A bridge round assumes the next round exists. If the milestone you are bridging to does not move the market, you are not buying time — you are buying a more expensive shutdown six months from now.",
    targetKeywords: [
      "should I do a bridge round",
      "bridge round vs new round",
      "is a bridge round a bad signal",
      "insider bridge financing",
      "bridge to nowhere startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-extend-my-runway-with-debt",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Extend My Runway with Debt?",
    description:
      "Venture debt can add six to twelve months without resetting the cap table. The covenants come with material adverse change clauses that can be called at the worst moment, and the warrant coverage is dilution you are not pricing in your head.",
    primaryQuery: "Should I extend my runway with debt?",
    secondaryQueries: [
      "venture debt to extend runway",
      "is venture debt risky for startups",
      "MAC clause venture debt",
      "when to take venture debt",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "benjamin-franklin",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "Venture debt looks free until the covenant trips. Are you adding months you will actually use to win, or financing a slower bleed with a clause that can be called the moment your metrics wobble?",
    targetKeywords: [
      "should I extend runway with debt",
      "venture debt for runway extension",
      "is venture debt safe",
      "MAC clause venture debt",
      "warrant coverage startup debt",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-down-round",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Down Round?",
    description:
      "A down round is the cleanest way to recapitalize a company that overpriced its last round, and the most expensive way to signal that the story has changed. Anti-dilution provisions can wipe out option pools, demoralize employees, and reset the founder equity math you thought was settled.",
    primaryQuery: "Should I do a down round?",
    secondaryQueries: [
      "down round vs shutdown",
      "is a down round survivable",
      "anti-dilution down round impact",
      "how to recover from a down round",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "abraham-lincoln",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A down round is an admission you can live with. The question is whether the company can — once the option pool resets, the team learns the new strike price, and every existing investor recalculates whether you are still worth defending.",
    targetKeywords: [
      "should I do a down round",
      "down round vs shutdown",
      "is a down round survivable",
      "anti-dilution provisions down round",
      "down round employee morale",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-cap-my-safe",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Cap My SAFE?",
    description:
      "An uncapped SAFE lets investors share your upside without bounding it; a capped SAFE bounds it but forces a valuation conversation before you have one to defend. The cap you set today becomes the floor every later investor anchors against.",
    primaryQuery: "Should I cap my SAFE?",
    secondaryQueries: [
      "capped vs uncapped SAFE",
      "what valuation cap to set on a SAFE",
      "post-money SAFE cap mechanics",
      "is an uncapped SAFE founder-friendly",
    ],
    recommendedCouncil: [
      "marie-curie",
      "isaac-newton",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The cap you write on the back of a napkin tonight is the ceiling every future investor will negotiate down from. Are you pricing the round you cannot yet justify, or letting an uncapped note hide the bill until conversion?",
    targetKeywords: [
      "should I cap my SAFE",
      "capped vs uncapped SAFE",
      "valuation cap on SAFE",
      "post-money SAFE mechanics",
      "uncapped SAFE founder dilution",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-the-highest-offer",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take the Highest Offer?",
    description:
      "The highest term sheet usually comes with the worst terms underneath the headline. Liquidation preferences, participation, board control, and pro-rata rights can make a $20M valuation worth less than a clean $14M from a partner who will pick up the phone in year three.",
    primaryQuery: "Should I take the highest offer?",
    secondaryQueries: [
      "highest valuation vs best investor",
      "term sheet beyond valuation",
      "liquidation preference vs valuation tradeoff",
      "when is the highest offer not the best",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "cicero",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "The biggest number on the term sheet is the number everyone screenshots. The terms underneath are the ones you live with for eight years. Are you choosing the headline, or the partner who will still be there when the headline stops working?",
    targetKeywords: [
      "should I take the highest offer",
      "highest valuation vs best investor",
      "term sheet liquidation preference",
      "valuation vs terms tradeoff",
      "choosing the best term sheet",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-syndicate",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Syndicate?",
    description:
      "A syndicate gives you one signature on a term sheet that aggregates many small checks behind a lead you trust. It also concentrates governance in the syndicate lead, whose interests may not match the LPs whose money you are actually taking.",
    primaryQuery: "Should I do a syndicate?",
    secondaryQueries: [
      "AngelList syndicate vs direct angels",
      "is a syndicate good for early rounds",
      "syndicate vs party round",
      "syndicate lead carry economics",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "cicero",
      "catherine-the-great",
    ],
    hookQuestion:
      "A syndicate gives you one phone number for fifty checks. The trade is that one person now speaks for all of them — and the people whose money you actually took may never meet you.",
    targetKeywords: [
      "should I do a syndicate",
      "AngelList syndicate fundraising",
      "syndicate vs direct angels",
      "syndicate lead carry",
      "syndicate vs party round",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-pitch-to-corporate-investors",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Pitch to Corporate Investors?",
    description:
      "Pitching corporate investors means the deck reaches the desk of a future partner — or a future competitor running M&A diligence on you for free. The pipeline value is real, and so is the signaling risk of being passed over by an obvious strategic fit.",
    primaryQuery: "Should I pitch to corporate investors?",
    secondaryQueries: [
      "pitching corporate VC risks",
      "do corporate investors steal ideas",
      "is it worth pitching strategic investors",
      "corporate investor diligence signaling",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "niccolo-machiavelli",
      "cleopatra-vii",
    ],
    hookQuestion:
      "Every pitch to a corporate investor is also a sales call to a future competitor. Are you opening a door, or handing your roadmap to the team that will copy you the moment they pass on the round?",
    targetKeywords: [
      "should I pitch to corporate investors",
      "pitching corporate VC risks",
      "corporate investor diligence",
      "do corporate VCs steal ideas",
      "strategic investor pitch risk",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-use-a-fundraising-platform",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Use a Fundraising Platform?",
    description:
      "Platforms like AngelList, Republic, and Wefunder let you raise from people who would never have made it onto your warm-intro list. The fees and reporting overhead are real, and a public listing makes every later investor know exactly how the round is going.",
    primaryQuery: "Should I use a fundraising platform?",
    secondaryQueries: [
      "AngelList vs Republic vs Wefunder",
      "is crowdfunding good for startups",
      "fundraising platform pros and cons",
      "Reg CF vs Reg A vs Reg D",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "benjamin-franklin",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A fundraising platform broadcasts your round to people who will never make a warm intro. Are you adding distribution, or putting your half-filled round on a billboard every investor will see before they pass?",
    targetKeywords: [
      "should I use a fundraising platform",
      "AngelList vs Republic vs Wefunder",
      "is equity crowdfunding worth it",
      "Reg CF for startups",
      "fundraising platform fees",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-an-investment-banker",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Hire an Investment Banker?",
    description:
      "A banker runs the process, creates competitive tension, and earns three to seven percent of the round for it. Below a certain check size the fee outpaces the value; above it, the banker's network and pacing routinely add more to the final number than they cost.",
    primaryQuery: "Should I hire an investment banker?",
    secondaryQueries: [
      "investment banker vs DIY fundraise",
      "when to hire a banker for fundraising",
      "banker fees startup capital raise",
      "is a placement agent worth it",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "john-d-rockefeller",
      "cicero",
    ],
    hookQuestion:
      "A banker takes a percentage to run a process you could run yourself badly. Are you paying for the network and the pacing, or buying a referee for a fight you are about to lose alone?",
    targetKeywords: [
      "should I hire an investment banker",
      "investment banker vs DIY fundraise",
      "when to hire a placement agent",
      "banker fees on capital raise",
      "is an investment banker worth it",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-include-pro-rata-rights",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Include Pro-Rata Rights?",
    description:
      "Pro-rata rights let early investors defend their ownership through every future round. They also crowd out the new lead's allocation, which can kill a term sheet you actually wanted — or force you into a side-letter dance that signals weakness to the room.",
    primaryQuery: "Should I include pro-rata rights?",
    secondaryQueries: [
      "pro-rata rights for early investors",
      "super pro-rata vs pro-rata",
      "pro-rata rights downside founders",
      "when to grant pro-rata rights",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "marie-curie",
      "cicero",
    ],
    hookQuestion:
      "Pro-rata rights are the investor's way of saying they still believe in you in three years. Are you rewarding loyalty, or pre-allocating the next round to people who may not be the right partners for it?",
    targetKeywords: [
      "should I include pro-rata rights",
      "pro-rata rights for early investors",
      "super pro-rata clause",
      "pro-rata rights cap table impact",
      "when to grant pro-rata",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-negotiate-board-composition",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Negotiate Board Composition?",
    description:
      "Board composition is where governance is actually decided, not on the cap table. Three founder seats and two investor seats is a different company from two and three, and the independent seat that sounds neutral usually breaks toward whoever recruited them.",
    primaryQuery: "Should I negotiate board composition?",
    secondaryQueries: [
      "startup board composition negotiation",
      "founder vs investor board seats",
      "independent board seat startup",
      "how to keep board control as founder",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ],
    hookQuestion:
      "The cap table tells you who owns the company; the board tells you who runs it. Are you fighting for the seats that actually decide whether you survive a bad quarter, or accepting the default because the investor said it was standard?",
    targetKeywords: [
      "should I negotiate board composition",
      "startup board composition",
      "founder vs investor board seats",
      "independent director startup",
      "how to keep board control",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-give-up-board-control",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Give Up Board Control?",
    description:
      "Most founders keep board control through Series A and lose it at Series B without negotiating for it. Losing control is survivable when the board agrees with you on strategy; it is terminal when it does not, because the seat that fires you is the same seat that hired the recruiter to replace you.",
    primaryQuery: "Should I give up board control?",
    secondaryQueries: [
      "when do founders lose board control",
      "Series B board control founders",
      "founder removal board mechanics",
      "keeping board control through Series B",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "napoleon-bonaparte",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Founders who give up board control rarely notice the moment they did. Are you trading governance for a number you can announce, or holding the only line that keeps you from being replaced in your own company?",
    targetKeywords: [
      "should I give up board control",
      "when founders lose board control",
      "Series B board control",
      "founder removal mechanics",
      "keeping control through Series B",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-secondary-liquidity",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take Secondary Liquidity?",
    description:
      "Selling secondary lets you de-risk your life without selling the company. The optics are tricky — investors read founder secondary as conviction loss, employees read it as access they cannot get, and the tax bill on a non-qualified sale can be larger than the cash that lands in your account.",
    primaryQuery: "Should I take secondary liquidity?",
    secondaryQueries: [
      "founder secondary sale signal",
      "how much secondary should a founder take",
      "secondary tax treatment QSBS",
      "is founder secondary a red flag",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "john-d-rockefeller",
      "seneca",
    ],
    hookQuestion:
      "Taking some chips off the table buys you the freedom to make a longer bet. Is the cash worth the signal it sends to the people who notice that you no longer have everything on the line?",
    targetKeywords: [
      "should I take secondary liquidity",
      "founder secondary sale",
      "is founder secondary a red flag",
      "secondary liquidity tax treatment",
      "QSBS founder secondary",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-tender-offer",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do a Tender Offer?",
    description:
      "A tender offer lets employees and early investors sell shares at a structured price without resetting the 409A. It clears the cap table of impatient holders, costs real legal money to organize, and locks in a price the market may have moved past by the time the next round closes.",
    primaryQuery: "Should I do a tender offer?",
    secondaryQueries: [
      "employee tender offer startup",
      "tender offer vs secondary sale",
      "when to run a tender offer",
      "tender offer 409A impact",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "john-d-rockefeller",
      "marcus-aurelius",
    ],
    hookQuestion:
      "A tender offer rewards the people who built the company before the exit they were promised. Are you buying loyalty for the next chapter, or paying out conviction at a price the market will look back on as a discount?",
    targetKeywords: [
      "should I do a tender offer",
      "employee tender offer startup",
      "tender offer vs secondary",
      "tender offer 409A impact",
      "structured liquidity event startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-this-pre-emption-right",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Grant a Pre-Emption Right?",
    description:
      "Pre-emption rights let an investor match any future offer to buy your shares. They look like a courtesy until the day you want to sell secondary and discover that the right has become a veto — and the price discovery you needed never happens.",
    primaryQuery: "Should I grant a pre-emption right?",
    secondaryQueries: [
      "pre-emption rights startup",
      "right of first refusal vs pre-emption",
      "pre-emption right secondary sale",
      "should founders grant pre-emption rights",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "cicero",
      "aristotle",
    ],
    hookQuestion:
      "A pre-emption right reads like a polite ask. The day you want to sell, it becomes the reason no one else will bid — because they know the existing investor can match and take the deal.",
    targetKeywords: [
      "should I grant pre-emption right",
      "pre-emption rights startup",
      "ROFR vs pre-emption",
      "pre-emption right founders",
      "right of first refusal startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-an-ipo",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Do an IPO?",
    description:
      "Going public crystallizes valuation, creates currency for acquisitions, and gives early holders a clean exit. It also subjects every decision to a quarterly review by people who do not know your business, and the cost of compliance dwarfs the cost of staying private if your growth does not justify the multiple.",
    primaryQuery: "Should I do an IPO?",
    secondaryQueries: [
      "IPO vs staying private",
      "when is a startup ready for IPO",
      "IPO downsides for founders",
      "is going public worth it",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "napoleon-bonaparte",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "An IPO is the most expensive way to raise capital and the most visible way to lose strategic optionality. Is the public currency worth the quarterly cycle you will run the rest of your career inside?",
    targetKeywords: [
      "should I do an IPO",
      "IPO vs staying private",
      "when is a startup ready for IPO",
      "IPO downsides for founders",
      "public company compliance cost",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-investment-from-customers",
    status: "shipped",
    shippedAt: "2026-05-19",
    title: "Should I Take Investment from Customers?",
    description:
      "Customer-investors are pre-validated demand with a check attached. They also get advance access to your roadmap, may demand favorable pricing, and turn every renewal conversation into a shareholder dispute when the relationship strains.",
    primaryQuery: "Should I take investment from customers?",
    secondaryQueries: [
      "customer as investor startup",
      "should customers be on the cap table",
      "customer investment conflicts of interest",
      "strategic customer investment risk",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "niccolo-machiavelli",
      "sun-tzu",
    ],
    hookQuestion:
      "A customer who invests is two relationships in one — until the renewal stalls, the contract renegotiates, or the support ticket escalates. Are you buying advocacy, or wiring a conflict of interest into the contract you have to honor?",
    targetKeywords: [
      "should I take investment from customers",
      "customer as investor startup",
      "customer cap table risk",
      "strategic customer investment",
      "customer investor conflicts",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 05 — shipped 2026-05-20 ────
  {
    slug: "should-i-start-a-blog",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Start a Blog?",
    description:
      "A blog is a slow asset. The first six months produce almost no traffic, and the next twelve might still produce none if you write for everyone or no one in particular. The real question is whether you can commit to one narrow topic for a year before the compounding shows up, and whether that topic is close enough to your product that the eventual readers are buyers, not browsers.",
    primaryQuery: "should I start a blog for my startup",
    secondaryQueries: [
      "is a startup blog worth it in 2026",
      "when does a founder blog pay off",
      "blog vs newsletter for early traction",
      "should solo founders write a blog",
    ],
    recommendedCouncil: [
      "cicero",
      "benjamin-franklin",
      "thomas-edison",
    ],
    hookQuestion:
      "You have an empty CMS and a hunch that writing will help. Are you about to build a distribution asset, or invent a second job that pays in vanity metrics?",
    targetKeywords: [
      "should I start a blog",
      "is a startup blog worth it",
      "founder blog vs newsletter",
      "when blogging pays off for startups",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-seo-or-paid-ads-for-saas",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do SEO or Paid Ads for My SaaS?",
    description:
      "Paid ads turn money into customers today and stop the moment your card declines. SEO turns months of unpaid work into an asset that may or may not rank. The honest question is which resource you can afford to spend first — six months of writing time, or a five-figure budget you can light on fire while you learn what converts. The answer usually depends on whether you already know who your buyer is.",
    primaryQuery: "should I do SEO or paid ads for SaaS",
    secondaryQueries: [
      "SEO vs paid ads for early SaaS",
      "is SEO worth it for a new SaaS",
      "Google Ads vs organic for SaaS founders",
      "when to switch from ads to SEO SaaS",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "benjamin-franklin",
      "ada-lovelace",
    ],
    hookQuestion:
      "You have one growth budget and two channels asking for it. Which one is a true investment, and which is a comfortable way to look busy?",
    targetKeywords: [
      "should I do SEO or paid ads for SaaS",
      "SEO vs paid ads early stage",
      "Google Ads vs organic SaaS",
      "is SEO worth it for new SaaS",
      "paid acquisition vs SEO startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-content-writer",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Hire a Content Writer?",
    description:
      "Hiring a writer before you know what your content is supposed to do is how founders end up paying for fifty mediocre blog posts that nobody reads. A good writer can scale a voice that already works. They cannot invent one for you. The decision is whether you have written enough yourself to know the angle, the audience, and what 'good' looks like for your category — or whether you are outsourcing the discovery step that only you can do.",
    primaryQuery: "should I hire a content writer for my startup",
    secondaryQueries: [
      "when to hire a content writer startup",
      "freelance writer vs in-house content founder",
      "should founders write their own content",
      "hiring a content writer ROI early stage",
    ],
    recommendedCouncil: [
      "cicero",
      "frederick-douglass",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You hate writing and a freelancer is one Slack message away. Are you delegating execution, or handing off the one job that only the founder can do well?",
    targetKeywords: [
      "should I hire a content writer",
      "when to hire a content writer startup",
      "freelance content writer for founders",
      "outsource content writing startup",
      "founder-led content vs hired writer",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-influencer-marketing",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do Influencer Marketing?",
    description:
      "Influencer marketing works when the influencer's audience is close enough to your buyer that the recommendation feels like a tip, not an ad. It fails when you pay for reach that has nothing to do with intent. The hard part is that the influencers with the most aligned audiences charge the least obvious prices and rarely run clean campaigns — you trade attribution clarity for the only credibility money can't buy outright.",
    primaryQuery: "should I do influencer marketing for my startup",
    secondaryQueries: [
      "is influencer marketing worth it for B2B",
      "influencer marketing ROI startup",
      "micro-influencer vs paid ads",
      "how to pick an influencer for a SaaS launch",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You found a creator whose audience looks like your buyers. Are you about to buy a trusted recommendation, or rent a stranger's face for a quarter you'll forget?",
    targetKeywords: [
      "should I do influencer marketing",
      "is influencer marketing worth it startup",
      "influencer marketing for SaaS",
      "micro-influencer vs paid ads",
      "creator marketing ROI early stage",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sponsor-a-podcast",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Sponsor a Podcast?",
    description:
      "Podcast sponsorships are one of the few ad placements where the host's voice does the selling, which makes attribution messy and the upside hard to predict. A great fit can drive months of warm signups from a single read. A bad fit produces twenty thousand impressions and three demo requests from people who confused you with a different tool. The decision depends less on download counts and more on whether the host's audience already trusts them on topics adjacent to what you sell.",
    primaryQuery: "should I sponsor a podcast",
    secondaryQueries: [
      "is podcast sponsorship worth it for startups",
      "B2B podcast advertising ROI",
      "how to pick a podcast to sponsor",
      "podcast ads vs paid social",
    ],
    recommendedCouncil: [
      "cicero",
      "andrew-carnegie",
      "ada-lovelace",
    ],
    hookQuestion:
      "A host with the right audience is quoting you a number. Are you buying a warm introduction at scale, or paying for impressions you could have gotten cheaper anywhere else?",
    targetKeywords: [
      "should I sponsor a podcast",
      "is podcast sponsorship worth it",
      "B2B podcast advertising",
      "how to pick a podcast sponsorship",
      "podcast ads ROI startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-attend-trade-shows",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Attend Trade Shows?",
    description:
      "Trade shows are expensive theater. The booth fee is the smallest line item — travel, staff time, and the week of company momentum you lose are the real cost. They can be worth it when your buyer cannot be reached online, when in-person credibility shortens a six-figure sales cycle, or when a specific show is where decisions actually get made. Most other times, they are a tax founders pay to feel like a real company.",
    primaryQuery: "should I attend trade shows as a startup",
    secondaryQueries: [
      "are trade shows worth it for startups",
      "trade show ROI early stage company",
      "booth vs walking the floor at a trade show",
      "B2B conference vs trade show",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "andrew-carnegie",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "The badge, the booth, the flight, the hotel. Are you about to meet your next ten customers, or buy a very expensive week of pretending to be a bigger company?",
    targetKeywords: [
      "should I attend trade shows",
      "are trade shows worth it startup",
      "trade show ROI startup",
      "B2B conference attendance decision",
      "booth or no booth trade show",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-host-webinars",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Host Webinars?",
    description:
      "Webinars work when you have something specific to teach a small, motivated audience and a product that benefits from a thirty-minute consideration window. They fail when they become content theater — a slide deck read aloud to people who will not remember you tomorrow. Done well, a single webinar can produce a quarter of qualified pipeline. Done poorly, it eats a week of preparation for a recording nobody watches.",
    primaryQuery: "should I host webinars for my startup",
    secondaryQueries: [
      "are webinars worth it for B2B startups",
      "webinar vs video content marketing",
      "how often to run webinars startup",
      "webinar ROI early stage SaaS",
    ],
    recommendedCouncil: [
      "cicero",
      "florence-nightingale",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You can teach what you know in forty-five minutes. Will the right people show up, or are you about to perform for an empty room and call it pipeline?",
    targetKeywords: [
      "should I host webinars",
      "are webinars worth it for startups",
      "B2B webinar ROI",
      "webinar vs video marketing",
      "how often to run webinars",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-cold-outreach",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do Cold Outreach?",
    description:
      "Cold outreach is the fastest way to talk to your buyer when you have nothing else — no audience, no inbound, no warm intros. It is also the fastest way to burn through goodwill if your message reads like every other automated sequence in their inbox. The work is in the targeting and the first sentence, not in volume. A hundred carefully chosen prospects with a handwritten reason to email them will beat ten thousand sent through a sequencer almost every time.",
    primaryQuery: "should I do cold outreach for my startup",
    secondaryQueries: [
      "is cold email worth it for founders",
      "cold outreach vs inbound for startups",
      "cold email reply rates B2B",
      "manual vs automated cold outreach",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "benjamin-franklin",
      "sun-tzu",
    ],
    hookQuestion:
      "You have a list and a free afternoon. Will the next hundred emails earn you ten conversations, or burn the only inboxes that matter?",
    targetKeywords: [
      "should I do cold outreach",
      "is cold email worth it",
      "cold outreach vs inbound",
      "cold email for founders",
      "manual vs automated cold outreach",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-an-email-list",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Buy an Email List?",
    description:
      "Buying an email list looks like a shortcut and almost always isn't. The contacts are stale or scraped, the deliverability damage to your domain can take a year to recover from, and in many jurisdictions the practice is illegal under privacy law. There are narrow cases where a purchased list of opted-in industry contacts has real value, but the default outcome is a CAN-SPAM violation, a blocklisted domain, and zero pipeline. Read carefully before opening the wallet.",
    primaryQuery: "should I buy an email list",
    secondaryQueries: [
      "is buying an email list legal",
      "purchased email list deliverability risks",
      "B2B email list buying ROI",
      "alternatives to buying an email list",
    ],
    recommendedCouncil: [
      "frederick-douglass",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "A vendor is offering you ten thousand decision-makers for a thousand dollars. Are you about to skip the line, or torch your sending domain for a list of strangers who never asked to hear from you?",
    targetKeywords: [
      "should I buy an email list",
      "is buying an email list legal",
      "purchased email list risks",
      "B2B email list buying",
      "alternatives to buying email lists",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-start-a-youtube-channel",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Start a YouTube Channel?",
    description:
      "YouTube rewards consistency over years, not weeks. A channel that ships fifty videos in a year with steady improvement will outrun one that ships five 'perfect' videos and then dies in the analytics. The harder question is whether video is where your buyer makes purchase decisions, or whether you are choosing the medium that flatters your skills instead of the one that reaches your customer.",
    primaryQuery: "should I start a YouTube channel for my business",
    secondaryQueries: [
      "is YouTube worth it for founders",
      "YouTube vs blog for startup growth",
      "B2B YouTube channel strategy",
      "how often to post on YouTube founder",
    ],
    recommendedCouncil: [
      "nikola-tesla",
      "thomas-edison",
      "florence-nightingale",
    ],
    hookQuestion:
      "You're picturing your face in a thumbnail and a subscriber count climbing. Is YouTube where your buyer actually decides, or where you'd most enjoy spending the time?",
    targetKeywords: [
      "should I start a YouTube channel",
      "is YouTube worth it for founders",
      "YouTube vs blog startup",
      "B2B YouTube strategy",
      "founder YouTube channel decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-affiliate-marketing",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do Affiliate Marketing?",
    description:
      "An affiliate program turns other people's audiences into a sales force you pay only on results. The catch is that affiliates flock to products with high prices, clear conversion, and recurring revenue — and they ignore everything else. Before you launch a program, look at your conversion rate from cold traffic and your LTV. If those numbers aren't strong enough to pay a meaningful commission and still leave room for margin, you're building a feature affiliates will sign up for and never promote.",
    primaryQuery: "should I do affiliate marketing for my product",
    secondaryQueries: [
      "is affiliate marketing worth it for SaaS",
      "affiliate program vs referral program",
      "affiliate commission rates SaaS",
      "when to launch an affiliate program",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "john-d-rockefeller",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You'd love an army of affiliates pulling in customers while you sleep. Are your unit economics ready to pay them, or are you about to launch a program that signs up creators and converts nothing?",
    targetKeywords: [
      "should I do affiliate marketing",
      "is affiliate marketing worth it SaaS",
      "affiliate program vs referral program",
      "affiliate commission rates startup",
      "when to launch affiliate program",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-launch-a-referral-program",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Launch a Referral Program?",
    description:
      "A referral program only multiplies what already exists. If your current users wouldn't recommend you without a reward, adding a reward produces opportunists, not advocates. The right time to launch is after you can see organic referrals happening in your analytics — when you'd be paying for behavior people are already volunteering. Anything earlier is a marketing tactic dressed up as growth, and it usually shows up in your churn numbers within a quarter.",
    primaryQuery: "should I launch a referral program",
    secondaryQueries: [
      "when to launch a referral program startup",
      "referral program incentive structure",
      "is a referral program worth building",
      "referral vs affiliate program",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "florence-nightingale",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You want users to bring more users. Have you actually earned a recommendation yet, or are you trying to bribe one into existence?",
    targetKeywords: [
      "should I launch a referral program",
      "when to launch referral program",
      "referral program incentive design",
      "is a referral program worth it",
      "referral vs affiliate program",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-spend-on-brand",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Spend on Brand?",
    description:
      "Brand is the credit you draw on when a buyer has never met you and decides to trust you anyway. It compounds, but slowly, and the spend rarely shows up in this quarter's pipeline report. Founders who skip it pay for the absence later in higher CAC and shorter sales calls. Founders who overspend on it too early build beautiful decks and run out of money. The decision is whether brand spend is buying you long-term margin or short-term applause.",
    primaryQuery: "should I spend on brand as a startup",
    secondaryQueries: [
      "brand vs performance marketing startup",
      "when to invest in brand early stage",
      "is brand marketing worth it for startups",
      "brand budget startup percentage",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "thomas-edison",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "A logo refresh, an ad spot, a wordmark refresh. Are you investing in the credit your buyers will draw on in 2027, or buying applause from your peer group right now?",
    targetKeywords: [
      "should I spend on brand",
      "brand vs performance marketing",
      "when to invest in brand startup",
      "is brand worth it for startups",
      "brand budget early stage",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-rebrand-now-or-later",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Rebrand Now or Later?",
    description:
      "A rebrand is justified when your current identity is actively costing you deals — wrong audience signals, mistaken category, embarrassing legacy name. It is not justified because the founders are bored of the logo or a designer pitched a beautiful new wordmark. Rebrands cost three to nine months of distracted product and sales work, and the goodwill you've built around the old name resets to near-zero in search and word-of-mouth. The question is whether the current brand is a tax you keep paying or a quirk you can outgrow.",
    primaryQuery: "should I rebrand now or later",
    secondaryQueries: [
      "when to rebrand a startup",
      "is rebranding worth it for early stage",
      "rebrand impact on SEO",
      "signs your startup needs a rebrand",
    ],
    recommendedCouncil: [
      "catherine-the-great",
      "thomas-edison",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The new name is sitting in a Figma file and the team is excited. Is the old brand actually costing you customers, or are you about to spend nine months solving a problem nobody outside the company sees?",
    targetKeywords: [
      "should I rebrand now or later",
      "when to rebrand a startup",
      "is rebranding worth it",
      "rebrand cost startup",
      "signs of needing a rebrand",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-redesign-my-website",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Redesign My Website?",
    description:
      "Most website redesigns are driven by founder boredom, not user data. The pages that convert tend to look ugly to the team and beautiful to the buyer who just wants the value prop in a single sentence. A redesign is worth it when concrete evidence — heatmaps, session replays, conversion data — shows the current site is actively losing buyers. It is also worth it when the product has changed enough that the old framing no longer describes what you sell. Otherwise, you're paying a designer to confirm what your team already disagrees about.",
    primaryQuery: "should I redesign my website",
    secondaryQueries: [
      "when to redesign a startup website",
      "is a website redesign worth it",
      "website redesign vs landing page test",
      "signs my website needs a redesign",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "ada-lovelace",
      "florence-nightingale",
    ],
    hookQuestion:
      "Your team thinks the homepage is embarrassing. Do your buyers think so too, or is this a redesign for the people already on payroll?",
    targetKeywords: [
      "should I redesign my website",
      "when to redesign startup website",
      "is a website redesign worth it",
      "website redesign vs landing page test",
      "signs of needing a website redesign",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-launch-with-press",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Launch With Press?",
    description:
      "A press launch can compress a year of brand-building into a single news cycle — if the story is genuinely interesting to a reporter and you have a product polished enough to survive new visitors. The risk is launching to a tier-one outlet, getting coverage, and watching the traffic bounce because the product wasn't ready. Press also fades fast: a TechCrunch hit drives a spike of signups, not durable distribution. The question is whether you're trading your one shot at a launch story for short-term attention or long-term positioning.",
    primaryQuery: "should I launch with press",
    secondaryQueries: [
      "launching a startup with press coverage",
      "is press coverage worth it for launch",
      "press launch vs product hunt launch",
      "media launch strategy startup",
    ],
    recommendedCouncil: [
      "cicero",
      "cleopatra-vii",
      "sun-tzu",
    ],
    hookQuestion:
      "A reporter is willing to write about you on launch day. Is your product ready for the visitors who will show up, or are you about to spend your only launch story on a traffic spike that converts nothing?",
    targetKeywords: [
      "should I launch with press",
      "press launch startup",
      "launching with media coverage",
      "press vs product hunt launch",
      "media launch strategy",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-pitch-to-techcrunch",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Pitch to TechCrunch?",
    description:
      "TechCrunch coverage gets you a 24-hour traffic spike, a backlink that still matters, and a clipping you'll put in every investor deck for the next two years. It does not get you customers in any number that matters, and the pitch process eats founder time that could go into a channel with compounding returns. Pitch when the story is genuinely newsworthy — a real raise, a real launch, a real founder angle — and skip it when you're hoping the press will validate a product the market hasn't.",
    primaryQuery: "should I pitch TechCrunch",
    secondaryQueries: [
      "how to get TechCrunch coverage startup",
      "is TechCrunch coverage worth it",
      "TechCrunch traffic conversion startup",
      "pitching tech press as a founder",
    ],
    recommendedCouncil: [
      "cicero",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You've drafted the pitch and the contact form is open. Is this a real story a reporter will care about, or are you hoping a logo on the homepage will fix what the product hasn't?",
    targetKeywords: [
      "should I pitch TechCrunch",
      "how to get TechCrunch coverage",
      "is TechCrunch coverage worth it",
      "TechCrunch traffic value",
      "tech press pitch for founders",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-pay-for-pr",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Pay for PR?",
    description:
      "PR firms sell access to relationships and a process for translating company news into reporter-ready stories. The good ones are worth their retainer when you have real news cycles to feed and a brand position complex enough that you can't pitch yourself. The bad ones charge five figures a month to send the same press release to the same hundred reporters who will ignore it. Before you sign, ask which specific reporters they've placed startups like yours with in the last six months — and check.",
    primaryQuery: "should I pay for PR",
    secondaryQueries: [
      "is hiring a PR firm worth it for startups",
      "PR firm vs in-house PR startup",
      "PR retainer cost early stage",
      "alternatives to hiring a PR firm",
    ],
    recommendedCouncil: [
      "cicero",
      "andrew-carnegie",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "A PR firm is quoting you eight thousand a month and showing logos from companies bigger than yours. Are they about to earn it, or sell you a relationship they only have on their website?",
    targetKeywords: [
      "should I pay for PR",
      "is hiring a PR firm worth it",
      "PR firm retainer startup",
      "PR firm vs in-house",
      "alternatives to PR firm startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-account-based-marketing",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do Account-Based Marketing?",
    description:
      "ABM only makes sense when your deal size justifies treating each target account as its own campaign. If your average contract value is under fifty thousand dollars, the math usually doesn't work — the tooling, the research, and the multi-channel orchestration cost more than the deals return. When ACV is high and the buying committee is large, ABM can compress sales cycles and lift win rates dramatically. The question is whether your business is selling enterprise software or wishing it were.",
    primaryQuery: "should I do account-based marketing",
    secondaryQueries: [
      "is ABM worth it for early-stage B2B",
      "ABM vs demand generation",
      "minimum ACV for ABM to work",
      "account-based marketing for startups",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "julius-caesar",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You've identified fifty dream accounts and want to chase each one personally. Is your average deal size big enough to justify it, or are you about to spend enterprise effort on mid-market math?",
    targetKeywords: [
      "should I do account-based marketing",
      "is ABM worth it for startups",
      "ABM vs demand generation",
      "minimum ACV for ABM",
      "ABM strategy early stage B2B",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-launch-on-app-store",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Launch on the App Store?",
    description:
      "Launching on the App Store gives you discoverability through search, a payment system most users already trust, and a 15-30% tax on every dollar that passes through it. It also gives Apple the power to reject, delist, or rule against your business model with a single policy change. The decision is whether the distribution lift is worth the platform risk, and whether your business depends on iOS users enough to live inside someone else's rules.",
    primaryQuery: "should I launch my app on the App Store",
    secondaryQueries: [
      "App Store vs progressive web app",
      "Apple App Store revenue cut for startups",
      "iOS launch strategy startup",
      "App Store vs Play Store launch order",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "niccolo-machiavelli",
      "thomas-edison",
    ],
    hookQuestion:
      "You're staring at the App Store submission form. Are you about to unlock real distribution, or move your business into a house Apple can lock you out of?",
    targetKeywords: [
      "should I launch on the App Store",
      "App Store vs PWA decision",
      "Apple App Store revenue cut",
      "iOS launch strategy startup",
      "App Store vs Play Store launch",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-international-expansion-for-marketing",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do International Marketing Expansion?",
    description:
      "International marketing means more than translating the homepage. It means time zones you can't cover, ad accounts you can't optimize, payment methods you don't accept, and support tickets in languages you can't read. Done early, it dilutes your focus and produces mediocre results in three markets instead of strong results in one. Done after you have repeatable acquisition in your home market, it can double the size of the company. The question is whether you have actually saturated home, or just want to feel like a global company.",
    primaryQuery: "should I expand my marketing internationally",
    secondaryQueries: [
      "when to expand marketing to new countries",
      "international marketing expansion startup",
      "is international expansion worth it early stage",
      "go-to-market new country B2B",
    ],
    recommendedCouncil: [
      "alexander-the-great",
      "julius-caesar",
      "catherine-the-great",
    ],
    hookQuestion:
      "Europe, LATAM, APAC — pins on a map start looking inevitable. Have you actually exhausted the home market, or are you reaching abroad because growth at home got hard?",
    targetKeywords: [
      "should I expand internationally for marketing",
      "when to enter new countries startup",
      "international marketing expansion",
      "international expansion timing",
      "global go-to-market startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-localize-content",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Localize My Content?",
    description:
      "Localization is more than translation. A native speaker reading a machine-translated page can tell within two sentences, and that judgment colors every other piece of trust they were building with you. Translating ten pages well beats translating a hundred pages badly, but doing it well is expensive and slow. The decision is whether a specific non-English market is showing enough signal — traffic, signups, paying users — to justify the cost, or whether you're spreading thin to chase markets you haven't actually validated.",
    primaryQuery: "should I localize my content",
    secondaryQueries: [
      "when to translate website for international users",
      "is content localization worth it for SaaS",
      "machine translation vs human translation marketing",
      "localization priority country selection",
    ],
    recommendedCouncil: [
      "cicero",
      "ada-lovelace",
      "marcus-aurelius",
    ],
    hookQuestion:
      "A chunk of your signups speak another language. Will localized content win their business, or are you about to spend a quarter translating pages they were going to read in English anyway?",
    targetKeywords: [
      "should I localize my content",
      "when to translate marketing content",
      "content localization for SaaS",
      "machine translation vs human marketing",
      "localization priority startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-launch-event",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do a Launch Event?",
    description:
      "A launch event concentrates attention into a single moment, which is useful when you have a story big enough to fill it and a product ready for the visitors who arrive. It is brutal when the event lands and your homepage converts at one percent, your demo bookings overflow, and your onboarding breaks under the load. The question is whether the readiness is real on all three fronts — story, product, infrastructure — or whether you're scheduling a party and hoping the rest catches up.",
    primaryQuery: "should I do a launch event for my startup",
    secondaryQueries: [
      "is a launch event worth it for startups",
      "virtual vs in-person launch event",
      "startup launch event ROI",
      "launch event vs product hunt launch",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "julius-caesar",
      "thomas-edison",
    ],
    hookQuestion:
      "The save-the-dates are drafted and the venue is booked. Are the product, the story, and the funnel all ready for the crowd, or will the event arrive before the company does?",
    targetKeywords: [
      "should I do a launch event",
      "is a launch event worth it startup",
      "virtual vs in-person launch event",
      "startup launch event ROI",
      "launch event vs product hunt",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-an-email-list-first",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Build an Email List First?",
    description:
      "Building an email list before launch can give you a warm audience on day one — or it can give you ten thousand subscribers who signed up for a free PDF and have no intention of buying anything. The list is only as valuable as the audience-to-buyer overlap. The right pre-launch list is small, narrowly targeted, and actively engaged. The wrong one is a vanity number that looks great in a deck and converts in the low single digits.",
    primaryQuery: "should I build an email list before launching",
    secondaryQueries: [
      "pre-launch email list strategy",
      "is building an email list before launch worth it",
      "audience-first vs product-first launch",
      "email list size vs quality startup",
    ],
    recommendedCouncil: [
      "harriet-tubman",
      "frederick-douglass",
      "benjamin-franklin",
    ],
    hookQuestion:
      "The landing page is up and the subscriber count is climbing. Are you building a launch audience, or collecting names that will never open the day-one email?",
    targetKeywords: [
      "should I build an email list first",
      "pre-launch email list",
      "audience-first launch strategy",
      "email list before product launch",
      "list size vs quality startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-customer-marketing",
    status: "shipped",
    shippedAt: "2026-05-20",
    title: "Should I Do Customer Marketing?",
    description:
      "Customer marketing — case studies, advocacy programs, user conferences — turns existing customers into a distribution channel. It works once you have customers who have actually succeeded with the product and are willing to say so on the record. Done too early, the case studies feel forced and the advocates churn before the asset is published. Done at the right moment, a handful of strong customer stories shortens every future sales cycle and gives content marketing something concrete to point at.",
    primaryQuery: "should I do customer marketing",
    secondaryQueries: [
      "is customer marketing worth it for B2B",
      "case study program startup",
      "customer advocacy program early stage",
      "when to invest in customer marketing",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "andrew-carnegie",
      "cicero",
    ],
    hookQuestion:
      "Your best customers are happy and you want to put them in front of prospects. Do you have results worth telling, or are you about to launch a program in search of a story?",
    targetKeywords: [
      "should I do customer marketing",
      "is customer marketing worth it B2B",
      "case study program startup",
      "customer advocacy program",
      "when to invest in customer marketing",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 06 — shipped 2026-05-23 ────
  {
    slug: "should-i-incorporate-now",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Incorporate Now?",
    description:
      "Incorporating costs a few hundred dollars and a weekend of paperwork. Not incorporating costs you the ability to take a check, sign an enterprise contract, or split equity cleanly with a cofounder later. The question is whether you are far enough along that the upside of a real legal entity outweighs the recurring tax filings and franchise fees.",
    primaryQuery: "Should I incorporate now?",
    secondaryQueries: [
      "when should a startup incorporate",
      "is it too early to incorporate a startup",
      "do I need to incorporate before I have customers",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "niccolo-machiavelli",
      "abraham-lincoln",
    ],
    hookQuestion:
      "You can keep building under your own name and stay invisible to the IRS for another quarter. But the day a customer asks for an invoice from a real company, or a cofounder asks what they actually own, the cost of having waited shows up at once.",
    targetKeywords: [
      "should I incorporate now",
      "when should a startup incorporate",
      "is it too early to incorporate a startup",
      "do I need to incorporate before customers",
      "startup incorporation timing",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-an-s-corp-or-c-corp",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do an S-Corp or C-Corp?",
    description:
      "An S-corp passes profits through to your personal taxes, which is great if you are bootstrapping and want the money. A C-corp lets you raise venture capital, issue preferred stock, and pile up retained earnings inside the company — at the cost of double taxation. Picking the wrong one early forces a painful conversion later.",
    primaryQuery: "Should I do an S-corp or C-corp?",
    secondaryQueries: [
      "S-corp vs C-corp for startup",
      "C-corp or S-corp which is better",
      "do investors require a C-corp",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "benjamin-franklin",
      "andrew-carnegie",
    ],
    hookQuestion:
      "If you stay an S-corp, you keep more of every dollar today. If you flip to a C-corp, you keep the option of someone wiring you seven figures next year. Which future are you willing to bet against?",
    targetKeywords: [
      "should I do an S-corp or C-corp",
      "S-corp vs C-corp startup",
      "C-corp or S-corp for founders",
      "do investors require a C-corp",
      "S-corp to C-corp conversion",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-get-a-trademark",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Get a Trademark?",
    description:
      "A trademark costs about a thousand dollars and a year of waiting, and it gives you legal teeth against copycats using your name. Skip it and a larger competitor with deeper pockets can register your mark first and force you to rebrand. The real question is whether your name is the asset that needs protecting, or whether the product still matters more than what it is called.",
    primaryQuery: "Should I get a trademark?",
    secondaryQueries: [
      "when should a startup trademark its name",
      "is a trademark worth it for a small startup",
      "how early to file a trademark",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "cicero",
      "abraham-lincoln",
    ],
    hookQuestion:
      "Your brand name feels obvious to you, but the moment a competitor with a legal team decides they like it too, the question stops being aesthetic and becomes a deadline. Is the name worth defending, or replaceable?",
    targetKeywords: [
      "should I get a trademark",
      "when should a startup trademark its name",
      "is a trademark worth it for a startup",
      "how early to file a trademark",
      "startup trademark cost",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-privacy-audit",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do a Privacy Audit?",
    description:
      "A privacy audit is the work of mapping every place customer data flows, every vendor that touches it, and every retention rule you are quietly violating. Done right it surfaces leaks before regulators or reporters do. Done as theater it produces a binder no one reads and a false sense of safety.",
    primaryQuery: "Should I do a privacy audit?",
    secondaryQueries: [
      "when does a startup need a privacy audit",
      "is a privacy audit worth the cost",
      "privacy audit before fundraise",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "ada-lovelace",
      "marcus-aurelius",
    ],
    hookQuestion:
      "You probably already know there is data in places it should not be — a customer export sitting in a Slack DM, an old database with no owner. The audit will name what you suspect. Is that something you can act on right now, or only something that will keep you up at night?",
    targetKeywords: [
      "should I do a privacy audit",
      "when does a startup need a privacy audit",
      "is a privacy audit worth it",
      "privacy audit before fundraise",
      "startup data privacy review",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-get-a-cybersecurity-audit",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Get a Cybersecurity Audit?",
    description:
      "A real pen test costs fifteen to fifty thousand dollars and produces a list of vulnerabilities you may not have the engineering bandwidth to fix. Doing it before an enterprise deal can unlock the contract. Doing it without a plan for the findings creates legal exposure you didn't have before.",
    primaryQuery: "Should I get a cybersecurity audit?",
    secondaryQueries: [
      "when should a startup do a security audit",
      "is a pen test worth it for early-stage",
      "cybersecurity audit before enterprise contract",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "ada-lovelace",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Once a third party has documented your vulnerabilities, those findings become discoverable. Are you ready to fix what the report will name, or about to create a paper trail of known risks you ignored?",
    targetKeywords: [
      "should I get a cybersecurity audit",
      "when should a startup do a security audit",
      "is a pen test worth it",
      "cybersecurity audit before enterprise deal",
      "startup security review cost",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-cyber-insurance",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Buy Cyber Insurance?",
    description:
      "Cyber insurance pays out after a breach, ransomware event, or data leak, and most enterprise customers now require proof of it before signing. The premiums climb fast as you grow and the exclusions are wider than the policy summary suggests. The decision is whether you are buying real risk transfer or just a checkbox for the procurement form.",
    primaryQuery: "Should I buy cyber insurance?",
    secondaryQueries: [
      "is cyber insurance worth it for a startup",
      "when to get cyber liability coverage",
      "cyber insurance for SaaS company",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "seneca",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "If a breach hits next month, will the policy you are about to sign actually cover the kind of attack you are most likely to suffer — or has the underwriter written exclusions for exactly that scenario?",
    targetKeywords: [
      "should I buy cyber insurance",
      "is cyber insurance worth it for a startup",
      "when to get cyber liability coverage",
      "cyber insurance for SaaS",
      "cyber insurance exclusions",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-key-person-insurance",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Buy Key Person Insurance?",
    description:
      "Key person insurance pays the company if a founder or critical employee dies or becomes disabled. Investors sometimes require it. The premiums are real money, and most early-stage companies discover the policy was structured for the company, not the family, only after the worst has already happened.",
    primaryQuery: "Should I buy key person insurance?",
    secondaryQueries: [
      "is key person insurance worth it",
      "do startups need key person insurance",
      "key person insurance for founders",
    ],
    recommendedCouncil: [
      "seneca",
      "marcus-aurelius",
      "andrew-carnegie",
    ],
    hookQuestion:
      "You are insuring against the version of the future where you are not here to run the company. Is the payout going to the people who will have to keep it alive, or to investors who will use it to wind it down?",
    targetKeywords: [
      "should I buy key person insurance",
      "is key person insurance worth it",
      "do startups need key person insurance",
      "key person insurance for founders",
      "founder life insurance startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-hire-a-lawyer-or-use-clerky",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Hire a Lawyer or Use Clerky?",
    description:
      "Clerky and similar services handle clean, standard formation paperwork for a few hundred dollars. A startup lawyer charges five to ten times that and gives you judgment when the standard template does not fit your situation. The wrong choice early creates document debt that surfaces during diligence.",
    primaryQuery: "Should I hire a lawyer or use Clerky?",
    secondaryQueries: [
      "Clerky vs startup lawyer",
      "do I need a lawyer to incorporate",
      "when to hire a startup lawyer",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "cicero",
      "thomas-edison",
    ],
    hookQuestion:
      "Templates work until they don't. The day a foreign cofounder, a deferred-comp arrangement, or an unusual investor clause shows up, the question is whether the paperwork you cheaped out on is still defensible — or already a problem.",
    targetKeywords: [
      "should I hire a lawyer or use Clerky",
      "Clerky vs startup lawyer",
      "do I need a lawyer to incorporate",
      "when to hire a startup lawyer",
      "startup formation lawyer cost",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-set-up-a-409a-valuation",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Set Up a 409A Valuation?",
    description:
      "A 409A valuation sets the strike price for employee options and protects you from IRS penalties on under-priced grants. It costs one to five thousand dollars and lasts twelve months or until a material event. Skipping it is fine until the moment you actually grant options — at which point every prior grant is exposed.",
    primaryQuery: "Should I set up a 409A valuation?",
    secondaryQueries: [
      "when does a startup need a 409A valuation",
      "is a 409A valuation required for option grants",
      "409A timing for early-stage startup",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Every option you grant without a defensible 409A is a tax problem waiting for an audit. Are you grant-ing equity often enough that the protection is worth the fee, or still small enough to wait?",
    targetKeywords: [
      "should I set up a 409A valuation",
      "when does a startup need a 409A valuation",
      "is a 409A valuation required",
      "409A timing for startup",
      "409A valuation cost",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-r-and-d-tax-credits",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do R&D Tax Credits?",
    description:
      "R&D tax credits can return up to a quarter of a million dollars a year against payroll taxes for early-stage companies that write software. The paperwork takes weeks, the provider takes a cut, and the IRS audit risk is real if the documentation is sloppy. The question is whether the cash recovered is worth the time and exposure.",
    primaryQuery: "Should I do R&D tax credits?",
    secondaryQueries: [
      "are R&D tax credits worth it for startups",
      "how to claim R&D tax credit",
      "R&D tax credit audit risk",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "thomas-edison",
      "andrew-carnegie",
    ],
    hookQuestion:
      "There is a check from the IRS sitting on the table if you do the paperwork. The same paperwork is the audit trail if someone later decides your engineering work didn't qualify. Is the cash worth the receipts you have to keep for seven years?",
    targetKeywords: [
      "should I do R&D tax credits",
      "are R&D tax credits worth it for startups",
      "how to claim R&D tax credit",
      "R&D tax credit audit risk",
      "startup payroll tax credit",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-self-host-or-use-cloud",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Self-Host or Use Cloud?",
    description:
      "Self-hosting on bare metal can cut your bill by an order of magnitude at scale, and it gives you control over performance, data residency, and vendor risk. It also gives you a pager, a hardware budget, and a second job. Cloud is faster to start and slower to bleed you — until the bill catches up with your margin.",
    primaryQuery: "Should I self-host or use cloud?",
    secondaryQueries: [
      "self-host vs cloud for startup",
      "when does self-hosting pay off",
      "should I move off AWS",
    ],
    recommendedCouncil: [
      "archimedes",
      "isaac-newton",
      "nikola-tesla",
    ],
    hookQuestion:
      "Cloud feels expensive until the on-call rotation starts. Self-hosting feels cheap until the disk dies at 2 a.m. Which kind of pain are you better equipped to absorb right now?",
    targetKeywords: [
      "should I self-host or use cloud",
      "self-host vs cloud for startup",
      "when does self-hosting pay off",
      "should I move off AWS",
      "cloud cost vs self-hosting",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-use-aws-or-vercel",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Use AWS or Vercel?",
    description:
      "Vercel ships a Next.js app to production in minutes and abstracts away most of the operational surface. AWS gives you every primitive you could want and asks you to assemble them. One trades cost and control for speed. The other trades speed for the option to do anything later.",
    primaryQuery: "Should I use AWS or Vercel?",
    secondaryQueries: [
      "AWS vs Vercel for startup",
      "when to move from Vercel to AWS",
      "Vercel pricing at scale",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "thomas-edison",
      "nikola-tesla",
    ],
    hookQuestion:
      "Vercel feels like cheating until the bill hits five figures a month. AWS feels like adulthood until a junior engineer mis-configures an S3 bucket. Which mistake is cheaper for you to make right now?",
    targetKeywords: [
      "should I use AWS or Vercel",
      "AWS vs Vercel for startup",
      "when to move from Vercel to AWS",
      "Vercel pricing at scale",
      "Vercel vs AWS Next.js",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-write-tests",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Write Tests?",
    description:
      "Writing tests slows down the first feature and speeds up every feature after it — but only if the tests catch real regressions instead of locking in implementation details. Skipping them lets a solo founder ship faster early and breaks the moment a second engineer joins. The honest question is what your team will look like in six months.",
    primaryQuery: "Should I write tests?",
    secondaryQueries: [
      "are tests worth it for early-stage startup",
      "when to start writing tests",
      "test coverage for solo founder",
    ],
    recommendedCouncil: [
      "isaac-newton",
      "marie-curie",
      "thomas-edison",
    ],
    hookQuestion:
      "Every test you skip today is fine until the second engineer ships a fix that quietly breaks a feature you forgot existed. Are you really moving faster, or just deferring the debugging session?",
    targetKeywords: [
      "should I write tests",
      "are tests worth it for early-stage startup",
      "when to start writing tests",
      "test coverage for solo founder",
      "TDD for startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-build-internal-tools",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Build Internal Tools?",
    description:
      "Custom admin dashboards, ops scripts, and back-office tools make the team faster, and they also become unmaintained code that only one person can fix. Retool and similar platforms cover most use cases at a real monthly cost. The decision is whether your internal workflow is unique enough to justify the engineering, or generic enough that a vendor can run it.",
    primaryQuery: "Should I build internal tools?",
    secondaryQueries: [
      "build vs buy internal tools",
      "is Retool worth it for startup",
      "when to build a custom admin panel",
    ],
    recommendedCouncil: [
      "leonardo-da-vinci",
      "archimedes",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Every internal tool you build is a side product your team has to maintain forever. Will the time it saves your ops person outpace the time it costs your engineers, or is this a side project disguised as productivity?",
    targetKeywords: [
      "should I build internal tools",
      "build vs buy internal tools",
      "is Retool worth it for startup",
      "when to build a custom admin panel",
      "internal tooling startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-a-saas-or-build-it",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Buy a SaaS or Build It?",
    description:
      "Buying a SaaS gets you ninety percent of what you need on day one. Building it gets you a hundred percent of what you need in six months, plus a codebase to maintain. The trap is using the build-vs-buy framing to justify a decision you already made for ego reasons.",
    primaryQuery: "Should I buy a SaaS or build it?",
    secondaryQueries: [
      "build vs buy SaaS",
      "when to build instead of subscribe",
      "is it cheaper to build my own tool",
    ],
    recommendedCouncil: [
      "andrew-carnegie",
      "thomas-edison",
      "isaac-newton",
    ],
    hookQuestion:
      "The subscription feels expensive because it shows up every month on the credit card. The cost of building the equivalent is invisible because it shows up as engineering time you would have spent anyway. Which cost are you actually counting?",
    targetKeywords: [
      "should I buy a SaaS or build it",
      "build vs buy SaaS",
      "when to build instead of subscribe",
      "is it cheaper to build my own tool",
      "SaaS subscription vs in-house",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-set-up-monitoring",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Set Up Monitoring?",
    description:
      "Monitoring catches outages before customers tweet about them, and it adds a recurring bill, a learning curve, and a stream of false alarms that desensitize the team. Skipping it works until the first silent failure costs a customer. The real question is whether you will actually act on the alerts you set up.",
    primaryQuery: "Should I set up monitoring?",
    secondaryQueries: [
      "when to set up monitoring for a startup",
      "is Datadog worth it for small startup",
      "startup observability stack",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "marie-curie",
      "archimedes",
    ],
    hookQuestion:
      "An alert at three in the morning is only useful if you wake up and fix something. Are you setting up monitoring because you will act on it, or because the dashboard makes you feel like a real engineering team?",
    targetKeywords: [
      "should I set up monitoring",
      "when to set up monitoring for a startup",
      "is Datadog worth it for small startup",
      "startup observability stack",
      "monitoring vs uptime checks",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-soc2-compliance",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do SOC2 Compliance?",
    description:
      "SOC2 takes three to six months of engineering and policy work and costs twenty to fifty thousand dollars once you add auditors and tooling. It unlocks enterprise contracts you cannot win without it. It also burns runway you may not have, and the audit findings will demand engineering changes that have nothing to do with shipping product.",
    primaryQuery: "Should I do SOC2 compliance?",
    secondaryQueries: [
      "is SOC2 worth it for early-stage startup",
      "when to pursue SOC2 Type II",
      "SOC2 timeline and cost",
    ],
    recommendedCouncil: [
      "aristotle",
      "john-d-rockefeller",
      "sun-tzu",
    ],
    hookQuestion:
      "Three enterprise prospects are asking for your SOC2 report. The work to get one will pull your two engineers off product for a quarter. Do you have a signed letter of intent that justifies the trade, or only the hope of one?",
    targetKeywords: [
      "should I do SOC2 compliance",
      "is SOC2 worth it for early-stage startup",
      "when to pursue SOC2 Type II",
      "SOC2 timeline and cost",
      "SOC2 for SaaS startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-gdpr-compliance",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do GDPR Compliance?",
    description:
      "GDPR fines top out at four percent of global revenue, and the regulators have started enforcing against companies your size. Compliance means data maps, processor agreements, deletion endpoints, and a posted privacy policy that matches what your code actually does. Ignoring it works until a single user files a complaint from Germany.",
    primaryQuery: "Should I do GDPR compliance?",
    secondaryQueries: [
      "do US startups need GDPR compliance",
      "GDPR minimum for early-stage",
      "is GDPR worth the effort",
    ],
    recommendedCouncil: [
      "cicero",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Your privacy policy says one thing. Your database probably does another. The day a user in the EU files a data-access request, the gap between the two becomes the lawyer's first question.",
    targetKeywords: [
      "should I do GDPR compliance",
      "do US startups need GDPR compliance",
      "GDPR minimum for early-stage",
      "is GDPR worth the effort",
      "GDPR for SaaS startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-hipaa-compliance",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Do HIPAA Compliance?",
    description:
      "HIPAA opens the door to healthcare customers and closes the door on cheap infrastructure. BAAs with every vendor, encryption at rest and in transit, audit logs, and incident-response procedures are the minimum. Take on the burden too early and you cripple iteration. Avoid it and you cannot sell to anyone who touches patient data.",
    primaryQuery: "Should I do HIPAA compliance?",
    secondaryQueries: [
      "is HIPAA worth it for early-stage healthcare startup",
      "when to pursue HIPAA compliance",
      "HIPAA minimum viable compliance",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "aristotle",
      "cicero",
    ],
    hookQuestion:
      "A healthcare buyer is interested but they need a BAA before the pilot starts. Are you ready to operate every system with audit logs and encryption from now on, or only willing to say yes and hope no one checks?",
    targetKeywords: [
      "should I do HIPAA compliance",
      "is HIPAA worth it for healthcare startup",
      "when to pursue HIPAA compliance",
      "HIPAA minimum viable compliance",
      "HIPAA BAA requirements",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-have-a-data-retention-policy",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Have a Data Retention Policy?",
    description:
      "A retention policy says how long you keep customer data and when you delete it. The shorter the window, the less exposure during a breach, a subpoena, or a churned customer's deletion request. The longer the window, the more analytics, ML training data, and customer-support history you keep. The two goals fight each other.",
    primaryQuery: "Should I have a data retention policy?",
    secondaryQueries: [
      "startup data retention policy",
      "how long to keep customer data",
      "is a retention policy required",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "niccolo-machiavelli",
      "ada-lovelace",
    ],
    hookQuestion:
      "Every byte you keep is a byte a regulator, a hacker, or a litigant could ask about. Every byte you delete is a customer-support conversation you cannot reconstruct. Which mistake do you want to make on purpose?",
    targetKeywords: [
      "should I have a data retention policy",
      "startup data retention policy",
      "how long to keep customer data",
      "is a retention policy required",
      "data deletion policy SaaS",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-document-this-process",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Document This Process?",
    description:
      "Documenting a process steals time from doing it and pays off the next time someone else has to run it. At a team of one, the document is a sticky note. At a team of five, the absence of one is a bottleneck. The trap is documenting things that change weekly — the doc rots faster than anyone reads it.",
    primaryQuery: "Should I document this process?",
    secondaryQueries: [
      "when to document a process startup",
      "is process documentation worth the time",
      "how to know what to document",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "julius-caesar",
      "isaac-newton",
    ],
    hookQuestion:
      "If you got hit by a bus tomorrow, the question is not whether someone could do this job — it is how many hours of pain it would cost them. Is the pain bad enough that an hour of writing today saves a day of confusion later?",
    targetKeywords: [
      "should I document this process",
      "when to document a process startup",
      "is process documentation worth the time",
      "how to know what to document",
      "startup SOP documentation",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-write-an-employee-handbook",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Write an Employee Handbook?",
    description:
      "An employee handbook codifies how the company actually treats people — pay, time off, conduct, termination. Written well it protects you in a wrongful-termination suit and sets expectations for new hires. Written as a copy-paste of someone else's template, it commits you to policies you do not actually follow.",
    primaryQuery: "Should I write an employee handbook?",
    secondaryQueries: [
      "when does a startup need an employee handbook",
      "is an employee handbook required",
      "small company employee handbook",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "aristotle",
      "catherine-the-great",
    ],
    hookQuestion:
      "Whatever the handbook says becomes the standard you will be held to when someone is unhappy. Are you ready to enforce the policies you are about to write down, or only to publish them?",
    targetKeywords: [
      "should I write an employee handbook",
      "when does a startup need an employee handbook",
      "is an employee handbook required",
      "small company employee handbook",
      "startup HR policies",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-create-a-style-guide",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Create a Style Guide?",
    description:
      "A style guide gives the team a shared answer for how the product looks, sounds, and behaves. Done well it makes design decisions faster and the product feel coherent. Done early it ossifies aesthetics you will outgrow in three months, and nobody on a four-person team reads the doc anyway.",
    primaryQuery: "Should I create a style guide?",
    secondaryQueries: [
      "when does a startup need a style guide",
      "is a brand style guide worth it early",
      "design system vs style guide",
    ],
    recommendedCouncil: [
      "leonardo-da-vinci",
      "thomas-edison",
      "aristotle",
    ],
    hookQuestion:
      "If your designer leaves tomorrow, the next person has to reverse-engineer your taste from the live site. Is the guide a tool that saves them a week, or a document you are writing to feel like a real brand?",
    targetKeywords: [
      "should I create a style guide",
      "when does a startup need a style guide",
      "is a brand style guide worth it",
      "design system vs style guide",
      "startup brand guidelines",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-implement-ci-cd",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Implement CI/CD?",
    description:
      "Continuous integration runs your tests on every push. Continuous deployment ships every green build to production. The first stops you from merging broken code, the second makes broken code reach users faster. The right setup depends on whether your tests are real or your team is small enough that one person can hold the whole system in their head.",
    primaryQuery: "Should I implement CI/CD?",
    secondaryQueries: [
      "when to set up CI/CD for startup",
      "is continuous deployment safe for small team",
      "CI vs CD for early-stage",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "isaac-newton",
      "nikola-tesla",
    ],
    hookQuestion:
      "Auto-deploy is faster than humans and dumber than them. Are your tests good enough that a green build deserves to reach production unattended, or are you about to automate a way to break things at scale?",
    targetKeywords: [
      "should I implement CI/CD",
      "when to set up CI/CD for startup",
      "is continuous deployment safe for small team",
      "CI vs CD for early-stage",
      "startup deployment pipeline",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-a-domain-name-secondhand",
    status: "shipped",
    shippedAt: "2026-05-23",
    title: "Should I Buy a Domain Name Secondhand?",
    description:
      "A premium domain costs anywhere from a few thousand to seven figures and saves you the rebrand later. The cheaper alternative names are available right now and force you to live with a slightly worse identity forever. The decision turns on whether the dot-com is the asset or the product is.",
    primaryQuery: "Should I buy a domain name secondhand?",
    secondaryQueries: [
      "is a premium domain worth it for a startup",
      "should I pay for the .com",
      "buy domain on aftermarket",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "sun-tzu",
      "cleopatra-vii",
    ],
    hookQuestion:
      "The cheap domain works until the day a customer types in the dot-com out of habit and lands on someone else's site. Is the premium name a vanity purchase, or the cost of not bleeding traffic to a squatter for the next five years?",
    targetKeywords: [
      "should I buy a domain name secondhand",
      "is a premium domain worth it for a startup",
      "should I pay for the .com",
      "buy domain on aftermarket",
      "premium domain cost startup",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 07 — shipped 2026-05-24 ────
  {
    slug: "should-i-take-a-vacation",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Take a Vacation?",
    description:
      "A founder skipping vacation usually thinks they are protecting the company. They are often just protecting a feeling of indispensability. The real question is whether the business can survive a week without you — and what that answer says about how you have built it.",
    primaryQuery: "Should I take a vacation as a founder?",
    secondaryQueries: [
      "can a startup founder take time off",
      "is vacation worth it when running a startup",
      "how long can a founder be away from the company",
    ],
    recommendedCouncil: [
      "seneca",
      "marie-curie",
      "benjamin-franklin",
    ],
    hookQuestion:
      "If you cannot leave for seven days without the company wobbling, the problem is not the calendar. The problem is that nothing under you is actually load-bearing yet.",
    targetKeywords: [
      "should I take a vacation as a founder",
      "founder vacation guilt",
      "can a startup founder take time off",
      "how long can a founder be away",
      "founder burnout prevention",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-see-a-therapist",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I See a Therapist?",
    description:
      "Therapy is not a sign that something is broken. For founders, it is closer to having an outside engineer review the system you live inside every day. The question is whether the cost and time fit what you are actually carrying right now.",
    primaryQuery: "Should I see a therapist as a founder?",
    secondaryQueries: [
      "do founders need therapy",
      "is therapy worth it for entrepreneurs",
      "when should a founder see a therapist",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "aristotle",
      "frederick-douglass",
    ],
    hookQuestion:
      "You spend hours debugging your product. When was the last time anyone helped you debug the operator?",
    targetKeywords: [
      "should I see a therapist as a founder",
      "do founders need therapy",
      "is therapy worth it for entrepreneurs",
      "when should a founder see a therapist",
      "founder mental health support",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-get-an-executive-coach",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Get an Executive Coach?",
    description:
      "A good coach is not a cheerleader and not a therapist. They are a paid mirror with strong opinions about how you spend your hours. The question is whether you are at a stage where outside friction would change your behavior faster than another quarter alone.",
    primaryQuery: "Should I hire an executive coach?",
    secondaryQueries: [
      "is an executive coach worth it for founders",
      "when should a startup founder get a coach",
      "executive coach vs therapist",
    ],
    recommendedCouncil: [
      "cicero",
      "abraham-lincoln",
      "thomas-edison",
    ],
    hookQuestion:
      "If the bottleneck is your own decision-making, can you really afford to keep being the only person checking your work?",
    targetKeywords: [
      "should I hire an executive coach",
      "is an executive coach worth it for founders",
      "when to get a startup coach",
      "executive coach vs therapist",
      "founder coaching ROI",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-join-a-founder-community",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Join a Founder Community?",
    description:
      "Founder groups can shorten years of lonely guessing. They can also turn into an expensive way to talk about your company instead of running it. The trade is real, and the value depends entirely on who else is in the room.",
    primaryQuery: "Should I join a founder community?",
    secondaryQueries: [
      "are founder communities worth it",
      "should I pay for a founder mastermind",
      "best founder peer groups",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "aristotle",
      "harriet-tubman",
    ],
    hookQuestion:
      "Will the room sharpen your thinking each month, or will it turn into another meeting you start to dread?",
    targetKeywords: [
      "should I join a founder community",
      "are founder communities worth it",
      "should I pay for a founder mastermind",
      "best founder peer groups",
      "founder isolation solutions",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-tell-my-team-i-am-burned-out",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Tell My Team I'm Burned Out?",
    description:
      "Telling the team buys honesty and may rebuild trust. It can also rattle people who depend on you to be steady. The right answer depends on how close the team already is to the truth, and what they can actually do with the information.",
    primaryQuery: "Should I tell my team I am burned out?",
    secondaryQueries: [
      "should a founder admit burnout to the team",
      "how to tell your team you are exhausted",
      "is it okay for a CEO to show weakness",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "marcus-aurelius",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The team is already reading your face every morning. Are you protecting them by staying silent, or just letting them guess wrong?",
    targetKeywords: [
      "should I tell my team I am burned out",
      "should a founder admit burnout",
      "how to tell your team you are exhausted",
      "is it okay for a CEO to show weakness",
      "founder transparency burnout",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-be-public-about-my-mental-health",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Be Public About My Mental Health?",
    description:
      "Going public can normalize the conversation and reach founders who feel alone. It can also follow you into every fundraise, hire, and press cycle for the rest of your career. The choice is about what you want on the permanent record.",
    primaryQuery: "Should I be public about my mental health as a founder?",
    secondaryQueries: [
      "should founders share mental health struggles publicly",
      "is it career suicide to talk about depression as a CEO",
      "how to talk about mental health as a founder",
    ],
    recommendedCouncil: [
      "frederick-douglass",
      "seneca",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "Once you write it down in public, it never comes back. Are you sharing for the people who need to hear it, or for the relief of finally saying it out loud?",
    targetKeywords: [
      "should I be public about my mental health",
      "should founders share mental health struggles publicly",
      "is it career suicide to talk about depression as a CEO",
      "how to talk about mental health as a founder",
      "founder mental health disclosure",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-prioritize-health-over-the-startup",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Prioritize Health Over the Startup?",
    description:
      "Founders treat health as a luxury until the body sends a bill they cannot ignore. The honest framing is not health vs. company, but which version of you is still around in three years to run it.",
    primaryQuery: "Should I prioritize my health over my startup?",
    secondaryQueries: [
      "can you run a startup and stay healthy",
      "founder health vs company growth",
      "is it okay to slow down for health",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "epictetus",
      "napoleon-bonaparte",
    ],
    hookQuestion:
      "The startup will not thank you for skipping sleep. The doctor, eventually, will not be polite about it either.",
    targetKeywords: [
      "should I prioritize health over startup",
      "can you run a startup and stay healthy",
      "founder health vs company growth",
      "is it okay to slow down for health",
      "founder physical health discipline",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-have-a-side-project",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Have a Side Project?",
    description:
      "A side project can keep you curious and remind you why you build things. It can also become the place you escape to when the main company gets hard. The question is whether the second thing feeds the first or quietly drains it.",
    primaryQuery: "Should I have a side project as a founder?",
    secondaryQueries: [
      "can a founder have a side project",
      "is it okay to work on a side hustle while running a startup",
      "founder side project benefits",
    ],
    recommendedCouncil: [
      "leonardo-da-vinci",
      "benjamin-franklin",
      "marie-curie",
    ],
    hookQuestion:
      "When the main company gets ugly, you reach for the side thing because it still feels clean. Is that recovery, or avoidance with better branding?",
    targetKeywords: [
      "should I have a side project as a founder",
      "can a founder have a side project",
      "side hustle while running a startup",
      "founder side project benefits",
      "side project vs main startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-angel-investing-on-the-side",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Do Angel Investing on the Side?",
    description:
      "Angel checks can sharpen your judgment and widen your network. They can also pull attention into 20 other companies when yours still needs every hour you have. The trade depends on stage, capital, and how much of your operator-brain you can actually spare.",
    primaryQuery: "Should I angel invest while running my startup?",
    secondaryQueries: [
      "can founders angel invest",
      "is angel investing a distraction for CEOs",
      "should I write angel checks as a founder",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "marcus-aurelius",
      "andrew-carnegie",
    ],
    hookQuestion:
      "Every Zoom you take with another founder is a Zoom you do not take with your own team. Is that trade still net positive at your stage?",
    targetKeywords: [
      "should I angel invest while running my startup",
      "can founders angel invest",
      "is angel investing a distraction for CEOs",
      "should I write angel checks as a founder",
      "operator angel investor tradeoffs",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-on-board-roles",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Take On Board Roles?",
    description:
      "Sitting on another company's board signals seriousness and can teach you governance from the other side. It also adds quarterly obligations, legal exposure, and a recurring meeting that always lands the wrong week. Decide before the offer arrives, not after.",
    primaryQuery: "Should I accept a board role while running my startup?",
    secondaryQueries: [
      "can a CEO sit on another company's board",
      "is taking a board seat worth it for founders",
      "founder board role pros and cons",
    ],
    recommendedCouncil: [
      "cicero",
      "andrew-carnegie",
      "marcus-aurelius",
    ],
    hookQuestion:
      "The seat looks good on the page. The question is whether you can give it real judgment in the four hours a quarter it will actually demand.",
    targetKeywords: [
      "should I accept a board role as a founder",
      "can a CEO sit on another company's board",
      "is taking a board seat worth it",
      "founder board role pros and cons",
      "external board commitments founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-write-a-book-about-my-startup",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Write a Book About My Startup?",
    description:
      "A book can lock in your authority and outlive the company. It can also eat a year of your operator time and freeze your story before you know how it ends. The decision is about timing, not vanity.",
    primaryQuery: "Should I write a book about my startup?",
    secondaryQueries: [
      "is writing a founder book worth it",
      "when should a CEO write a book",
      "founder memoir vs running the company",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "benjamin-franklin",
      "cicero",
    ],
    hookQuestion:
      "Books outlast companies. The risk is that yours arrives years before you actually have the ending.",
    targetKeywords: [
      "should I write a book about my startup",
      "is writing a founder book worth it",
      "when should a CEO write a book",
      "founder memoir vs running the company",
      "startup book deal decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-start-a-founder-podcast",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Start a Founder Podcast?",
    description:
      "A podcast can build a moat of reputation, distribution, and access you cannot buy with ads. It is also a weekly job that quietly competes with running the company. The honest question is whether the show is for the audience or for your own loneliness.",
    primaryQuery: "Should I start a podcast as a founder?",
    secondaryQueries: [
      "is a founder podcast worth it",
      "should CEOs host podcasts",
      "podcast as a marketing channel for founders",
    ],
    recommendedCouncil: [
      "cleopatra-vii",
      "thomas-edison",
      "benjamin-franklin",
    ],
    hookQuestion:
      "Can you really commit to 100 episodes? Because that is roughly where most podcasts start to matter, and most founders stop returning the calls.",
    targetKeywords: [
      "should I start a podcast as a founder",
      "is a founder podcast worth it",
      "should CEOs host podcasts",
      "podcast as a marketing channel for founders",
      "founder media platform building",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-public-speaking",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Do Public Speaking?",
    description:
      "Conferences trade your time and energy for reach, credibility, and recruiting pull. The good ones compound. The bad ones eat a week for a green-room photo. Decide based on the audience in the room, not the logo on the lanyard.",
    primaryQuery: "Should I do public speaking as a founder?",
    secondaryQueries: [
      "is conference speaking worth it for CEOs",
      "should founders accept speaking invitations",
      "founder public speaking ROI",
    ],
    recommendedCouncil: [
      "cicero",
      "frederick-douglass",
      "abraham-lincoln",
    ],
    hookQuestion:
      "The talk is 30 minutes. The prep, travel, and post-event swirl is closer to a full week. Is the room going to give you that week back?",
    targetKeywords: [
      "should I do public speaking as a founder",
      "is conference speaking worth it for CEOs",
      "should founders accept speaking invitations",
      "founder public speaking ROI",
      "keynote vs panel founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-share-my-revenue-publicly",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Share My Revenue Publicly?",
    description:
      "Open numbers can earn trust, recruit talent, and create a marketing flywheel you cannot fake. They also hand competitors a map, anchor investors to the wrong number, and pin your team to a public scoreboard. The choice is irreversible in either direction.",
    primaryQuery: "Should I share my startup revenue publicly?",
    secondaryQueries: [
      "should founders build in public",
      "is sharing MRR a good idea",
      "open startup pros and cons",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "niccolo-machiavelli",
      "andrew-carnegie",
    ],
    hookQuestion:
      "Once your MRR is on a public page, every bad month becomes a public month. Can you live with that, and can your team?",
    targetKeywords: [
      "should I share my revenue publicly",
      "should founders build in public",
      "is sharing MRR a good idea",
      "open startup pros and cons",
      "transparent revenue founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-talk-about-my-failure",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Talk About My Failure?",
    description:
      "A failure post can help others, free you up internally, and turn a dead company into a credible second-act story. It can also re-open wounds in public and define how the next hiring manager reads your name. Decide what you want the record to say.",
    primaryQuery: "Should I publicly talk about my startup failure?",
    secondaryQueries: [
      "should I write a failure post mortem",
      "is it bad to talk about a failed startup",
      "founder failure essay pros and cons",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "seneca",
      "thomas-edison",
    ],
    hookQuestion:
      "If you say it out loud now, it becomes a story you have to keep telling. Is that the version of the past you want to carry forward?",
    targetKeywords: [
      "should I talk about my startup failure",
      "should I write a failure post mortem",
      "is it bad to talk about a failed startup",
      "founder failure essay pros and cons",
      "how to share startup shutdown publicly",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-pay-myself-more",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Pay Myself More?",
    description:
      "Underpaying yourself is not virtue. It is often poor planning that shows up later as resentment, bad health, or a panicked raise. The right number is the one that keeps you steady without putting the company on edge.",
    primaryQuery: "Should I raise my founder salary?",
    secondaryQueries: [
      "how much should a founder pay themselves",
      "is a low founder salary smart",
      "when should a founder increase their pay",
    ],
    recommendedCouncil: [
      "aristotle",
      "benjamin-franklin",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "A founder who cannot pay rent without anxiety is not a lean operator. They are a brittle one, one bad month from making panic-shaped decisions.",
    targetKeywords: [
      "should I pay myself more as a founder",
      "how much should a founder pay themselves",
      "is a low founder salary smart",
      "when should a founder increase their pay",
      "founder compensation decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-a-house-as-a-founder",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Buy a House as a Founder?",
    description:
      "A house anchors you, lowers monthly stress, and gives the family a stable base. It also locks up capital, ties you to one city, and turns variable life into a fixed mortgage. The math is real, but so is the psychology.",
    primaryQuery: "Should I buy a house while running a startup?",
    secondaryQueries: [
      "is it smart to buy a house as a founder",
      "founder rent vs buy decision",
      "buying a home before exit",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "marcus-aurelius",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "A mortgage does not care that the company missed plan. Are you buying stability for your life, or quietly raising the stakes on the next bad quarter?",
    targetKeywords: [
      "should I buy a house as a founder",
      "is it smart to buy a house running a startup",
      "founder rent vs buy decision",
      "buying a home before exit",
      "founder personal finance house",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-relocate-for-my-startup",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Relocate for My Startup?",
    description:
      "Geography still matters. The right city can change your hiring pool, your investor access, and the people you bump into on a Tuesday. Moving also uproots a partner, a network, and a daily life you may not realize you depended on.",
    primaryQuery: "Should I relocate for my startup?",
    secondaryQueries: [
      "should founders move to SF or New York",
      "does location matter for startups",
      "is it worth relocating to start a company",
    ],
    recommendedCouncil: [
      "harriet-tubman",
      "napoleon-bonaparte",
      "marcus-aurelius",
    ],
    hookQuestion:
      "You can build a startup almost anywhere. The question is whether staying where you are is actually a choice — or just gravity dressed up as principle.",
    targetKeywords: [
      "should I relocate for my startup",
      "should founders move to SF or New York",
      "does location matter for startups",
      "is it worth relocating to start a company",
      "founder city choice decision",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-move-back-with-my-parents",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Move Back in With My Parents?",
    description:
      "Moving back home can buy you a year of runway no investor would give you. It can also restart old family roles, hurt your relationship with a partner, and quietly reshape how you see yourself. The runway is real. The cost is not just rent.",
    primaryQuery: "Should I move back in with my parents to start a company?",
    secondaryQueries: [
      "is it okay to live with parents while bootstrapping",
      "founder living with parents pros and cons",
      "moving home to build a startup",
    ],
    recommendedCouncil: [
      "seneca",
      "epictetus",
      "harriet-tubman",
    ],
    hookQuestion:
      "Twelve months of zero rent could change everything for the company. It might also change everything about the dinner table. Both are real.",
    targetKeywords: [
      "should I move back in with my parents",
      "is it okay to live with parents while bootstrapping",
      "founder living with parents pros and cons",
      "moving home to build a startup",
      "founder runway extension family",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-tell-my-partner-i-want-to-start-a-company",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Tell My Partner I Want to Start a Company?",
    description:
      "This is not a pitch. It is a planning conversation between two people who share rent, calendars, and risk. The version where you 'just go do it' and explain later is the version that quietly ends relationships. Have the talk early.",
    primaryQuery: "How do I tell my partner I want to start a company?",
    secondaryQueries: [
      "talking to your spouse about quitting to start a startup",
      "how to get partner buy in for a startup",
      "should I tell my girlfriend I want to be a founder",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "aristotle",
      "harriet-tubman",
    ],
    hookQuestion:
      "You are about to ask another person to share the risk without sharing the upside in the same shape. Do they actually know what you are asking?",
    targetKeywords: [
      "how to tell my partner I want to start a company",
      "talking to your spouse about quitting to start a startup",
      "how to get partner buy in for a startup",
      "founder relationship startup conversation",
      "partner approval to start a business",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-have-kids-while-running-a-startup",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Have Kids While Running a Startup?",
    description:
      "There is no clean season for either. Plenty of founders have done both well and plenty have torched one or both trying. The honest version of this question is about support, finances, and the kind of parent you can be inside a hard schedule — not 'is it possible.'",
    primaryQuery: "Should I have kids while running a startup?",
    secondaryQueries: [
      "can you have kids and run a startup",
      "is it bad timing to have a baby as a founder",
      "founder parenthood decision",
    ],
    recommendedCouncil: [
      "florence-nightingale",
      "marie-curie",
      "aristotle",
    ],
    hookQuestion:
      "There is no good time. The real question is what kind of support you have around you, and what kind of parent the company will let you be at 7 p.m. on a Wednesday.",
    targetKeywords: [
      "should I have kids while running a startup",
      "can you have kids and run a startup",
      "is it bad timing to have a baby as a founder",
      "founder parenthood decision",
      "starting a family as a CEO",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-paternity-leave",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Take Paternity Leave?",
    description:
      "Skipping leave to 'be there for the company' often costs the family more than the company gains. Real leave is also a forcing function that exposes which parts of your business actually depend on you. Both effects are useful, and both are uncomfortable.",
    primaryQuery: "Should I take paternity leave as a founder?",
    secondaryQueries: [
      "can a founder take paternity leave",
      "how long should a CEO take off for a new baby",
      "founder parental leave decision",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "abraham-lincoln",
      "benjamin-franklin",
    ],
    hookQuestion:
      "The first month with a newborn does not come back. The company will still be there. Will you regret which one you chose to be present for?",
    targetKeywords: [
      "should I take paternity leave as a founder",
      "can a founder take paternity leave",
      "how long should a CEO take off for a new baby",
      "founder parental leave decision",
      "CEO new parent time off",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-fire-myself-from-a-role",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Fire Myself From a Role?",
    description:
      "Founders quietly outstay their usefulness in a role long after they should hand it off. The work still gets done, but worse, and the team learns to route around the bottleneck. The hardest hire is sometimes the person who replaces you in one part of the org.",
    primaryQuery: "Should I fire myself from a role at my own startup?",
    secondaryQueries: [
      "when should a founder hand off a function",
      "founder replacing themselves",
      "should I hire someone to do my job",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "aristotle",
      "thomas-edison",
    ],
    hookQuestion:
      "Are you still in this role because the company needs you there, or because nobody — including you — has the heart to say you have become the bottleneck?",
    targetKeywords: [
      "should I fire myself from a role",
      "when should a founder hand off a function",
      "founder replacing themselves",
      "should I hire someone to do my job",
      "founder self awareness role exit",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-step-down-as-ceo",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Step Down as CEO?",
    description:
      "Stepping down can be the most generous thing a founder ever does for the company. It can also be a regret you carry into every quarterly board meeting afterwards. The choice is not about ego. It is about who the company needs in the chair for the next chapter.",
    primaryQuery: "Should I step down as CEO of my startup?",
    secondaryQueries: [
      "when should a founder step down as CEO",
      "is it bad to replace yourself as CEO",
      "founder to chairman transition",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "abraham-lincoln",
      "marcus-aurelius",
    ],
    hookQuestion:
      "If a better operator walked in the door tomorrow, would the company be in stronger hands a year from now? Sit with that one honestly.",
    targetKeywords: [
      "should I step down as CEO",
      "when should a founder step down as CEO",
      "is it bad to replace yourself as CEO",
      "founder to chairman transition",
      "founder CEO succession",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-leave-my-own-company",
    status: "shipped",
    shippedAt: "2026-05-24",
    title: "Should I Leave My Own Company?",
    description:
      "Leaving the company you built is different from being pushed out. Done well, it preserves the team, the mission, and your own next chapter. Done late or angrily, it costs you all three. The decision is rarely about the day you announce, and almost always about the months before.",
    primaryQuery: "Should I leave the company I founded?",
    secondaryQueries: [
      "when should a founder leave their own startup",
      "how to know when to quit your own company",
      "founder exit from their own business",
    ],
    recommendedCouncil: [
      "napoleon-bonaparte",
      "seneca",
      "frederick-douglass",
    ],
    hookQuestion:
      "If you imagine yourself a year from now, still in this chair, is that the version of your life you wanted — or the one you got used to?",
    targetKeywords: [
      "should I leave my own company",
      "when should a founder leave their own startup",
      "how to know when to quit your own company",
      "founder exit from their own business",
      "leaving the company you founded",
      "start your own agon",
    ],
  },

  // ──── CLUSTER 08 — shipped 2026-05-25 ────
  {
    slug: "should-i-accept-this-acquisition-offer",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Accept This Acquisition Offer?",
    description:
      "An acquisition offer ends one company and starts a different life. Once you sign, the cap table, the team, and your daily work are no longer yours to steer. This page helps you separate a number you can live with from a number that just feels large in the room.",
    primaryQuery: "Should I accept this acquisition offer?",
    secondaryQueries: [
      "is this acquisition offer good",
      "how to evaluate an acquisition offer",
      "when to sell my startup",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "marcus-aurelius",
      "napoleon-bonaparte",
    ],
    hookQuestion:
      "The offer is in front of you and the email thread has gone quiet. Is this the price that pays off the last five years, or the price that you will resent the morning after the wire clears?",
    targetKeywords: [
      "should I accept this acquisition offer",
      "how to evaluate an acquisition offer",
      "is this acquisition offer good",
      "when to sell my startup",
      "founder accepting acquisition",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-counter-this-acquisition-offer",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Counter This Acquisition Offer?",
    description:
      "A counter is not a tantrum; it is a test of who actually needs the deal. Push too hard and the buyer walks. Accept too quickly and you leave money and terms on the table that you cannot recover later.",
    primaryQuery: "Should I counter this acquisition offer?",
    secondaryQueries: [
      "how to counter an acquisition offer",
      "should I negotiate my acquisition price",
      "is it safe to counter a buyer",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "cleopatra-vii",
    ],
    hookQuestion:
      "The buyer made the first move, and now silence is your most expensive sentence. Do you have the leverage to ask for more, or are you about to teach them you were always willing to settle?",
    targetKeywords: [
      "should I counter this acquisition offer",
      "how to counter an acquisition offer",
      "negotiate acquisition price",
      "counter offer startup buyer",
      "acquisition negotiation tactics",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-an-asset-sale-or-stock-sale",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do an Asset Sale or Stock Sale?",
    description:
      "Asset sales and stock sales look similar on a press release and produce very different outcomes on a tax return. One leaves liabilities with the seller, the other ships them to the buyer. The structure you sign decides who owes what for years after the closing dinner.",
    primaryQuery: "Should I do an asset sale or stock sale?",
    secondaryQueries: [
      "asset sale vs stock sale startup",
      "what is better asset or stock sale",
      "tax difference asset sale vs stock sale",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "cicero",
      "benjamin-franklin",
    ],
    hookQuestion:
      "The headline price is the same in either structure. Are you sure you understand which version sticks you with the old contracts, the old lawsuits, and the old tax bill?",
    targetKeywords: [
      "should I do an asset sale or stock sale",
      "asset sale vs stock sale startup",
      "asset purchase vs stock purchase",
      "tax difference asset sale vs stock sale",
      "deal structure acquisition",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-an-earnout",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Take an Earnout?",
    description:
      "An earnout turns part of your sale price into a job you have to keep. The numbers on the offer letter assume targets you will not fully control once a buyer owns the roadmap, the budget, and your boss. This page helps you decide what fraction of the price is actually money and what fraction is a wish.",
    primaryQuery: "Should I take an earnout?",
    secondaryQueries: [
      "are earnouts worth it",
      "how do earnouts work in acquisitions",
      "earnout vs upfront cash",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "andrew-carnegie",
      "seneca",
    ],
    hookQuestion:
      "Half the price will be paid only if numbers you no longer fully control land in the right zone. Are you signing an exit, or a two-year performance review with a payout attached?",
    targetKeywords: [
      "should I take an earnout",
      "are earnouts worth it",
      "how do earnouts work",
      "earnout vs upfront cash",
      "earnout structure acquisition",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-management-buyout",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Management Buyout?",
    description:
      "Selling the company to the team that already runs it is the cleanest handover and the messiest negotiation. You will be pricing your own legacy against the people you trained to value it. This page maps when an MBO frees you and when it traps both sides in a slower goodbye.",
    primaryQuery: "Should I do a management buyout?",
    secondaryQueries: [
      "what is a management buyout",
      "how to structure a management buyout",
      "MBO vs selling to a third party",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "andrew-carnegie",
      "abraham-lincoln",
    ],
    hookQuestion:
      "The people who know the company best want to buy it from you, and they cannot afford what a strategic buyer would pay. Will this hand the business to the right stewards, or short you on the only exit you get?",
    targetKeywords: [
      "should I do a management buyout",
      "what is a management buyout",
      "how to structure an MBO",
      "management buyout vs strategic sale",
      "selling company to management",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sell-to-a-strategic-or-financial-buyer",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Sell to a Strategic or Financial Buyer?",
    description:
      "Strategic buyers pay for fit and pay you to disappear into a bigger machine. Financial buyers pay for cash flow and ask you to keep running it harder. The right answer depends on what you want to be doing for the next three years, not just on which check is bigger.",
    primaryQuery: "Should I sell to a strategic or financial buyer?",
    secondaryQueries: [
      "strategic vs financial buyer startup",
      "what is the difference between strategic and financial buyer",
      "private equity vs strategic acquirer",
    ],
    recommendedCouncil: [
      "sun-tzu",
      "john-d-rockefeller",
      "thomas-edison",
    ],
    hookQuestion:
      "One buyer wants your product on their roadmap and your team in their org chart. The other wants your EBITDA on their fund report. Which version of the next chapter can you actually live with?",
    targetKeywords: [
      "should I sell to a strategic or financial buyer",
      "strategic vs financial buyer",
      "private equity vs strategic acquirer",
      "best acquirer for startup",
      "PE buyer vs corporate buyer",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sell-to-a-competitor",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Sell to a Competitor?",
    description:
      "A competitor often pays the most because they want the threat off the board. The risk is that the conversation itself leaks your customers, your roadmap, and your team before any deal closes. This page is for founders deciding whether to open the door at all.",
    primaryQuery: "Should I sell to a competitor?",
    secondaryQueries: [
      "selling startup to competitor risks",
      "is it bad to sell to a competitor",
      "how to negotiate with a competing acquirer",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "sun-tzu",
      "aristotle",
    ],
    hookQuestion:
      "The buyer with the deepest pockets is also the rival who would benefit most from your customer list if the deal falls through. How much do you trust them with the keys before the contract is signed?",
    targetKeywords: [
      "should I sell to a competitor",
      "selling startup to competitor",
      "selling to competitor risks",
      "negotiate with competing acquirer",
      "competitor acquisition due diligence",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-merge-with-a-competitor",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Merge With a Competitor?",
    description:
      "A merger is two CEOs telling investors they will fix two problems at once. In practice you inherit the other side's culture, technical debt, and customer mix overnight. This page helps you decide whether the combined company is stronger or just larger.",
    primaryQuery: "Should I merge with a competitor?",
    secondaryQueries: [
      "merging with a competitor startup",
      "is a horizontal merger a good idea",
      "merger of equals startup",
    ],
    recommendedCouncil: [
      "catherine-the-great",
      "niccolo-machiavelli",
      "andrew-carnegie",
    ],
    hookQuestion:
      "On paper, combining forces ends a costly fight. In the room, one founder ends up reporting to the other within eighteen months. Are you ready to find out which one is you?",
    targetKeywords: [
      "should I merge with a competitor",
      "merging with a competitor",
      "merger of equals startup",
      "horizontal merger startup",
      "startup merger pros and cons",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-spin-out",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Spin-Out?",
    description:
      "Spinning out a product, a team, or a business line is a bet that two smaller things can survive cleaner than one tangled one. You gain focus and you also gain twice the overhead. This page helps you decide whether the split is strategy or surrender.",
    primaryQuery: "Should I do a spin-out?",
    secondaryQueries: [
      "what is a corporate spin-out",
      "spin-out vs sell a division",
      "how to structure a spinout from a startup",
    ],
    recommendedCouncil: [
      "archimedes",
      "thomas-edison",
      "leonardo-da-vinci",
    ],
    hookQuestion:
      "One piece of the company is dragging the rest down, or one piece is being held back by the rest. Are you carving it out for clarity, or just hiding a problem inside a new logo?",
    targetKeywords: [
      "should I do a spin-out",
      "what is a corporate spin-out",
      "spin-out vs sell a division",
      "how to structure a spinout",
      "spin off business line",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-buy-back-my-company",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Buy Back My Company?",
    description:
      "Buying back equity from investors lets you reset the cap table and run the company the way you originally wanted. It also costs cash you might need for the work itself. This page helps you decide whether reclaiming control is freedom or just an expensive ego repair.",
    primaryQuery: "Should I buy back my company?",
    secondaryQueries: [
      "how to buy back equity from investors",
      "should founders buy back shares",
      "founder buyback of VC equity",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "niccolo-machiavelli",
      "frederick-douglass",
    ],
    hookQuestion:
      "You can write a check and own your company outright again, but the same check could fund three more years of building. Are you buying back control or buying back a story you tell yourself?",
    targetKeywords: [
      "should I buy back my company",
      "founder buyback equity",
      "buy back shares from investors",
      "how to buy out my investors",
      "reclaim founder control",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-go-public-via-ipo-or-spac",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Go Public Via IPO or SPAC?",
    description:
      "An IPO is a long, expensive parade with bankers calling the tempo. A SPAC merger is faster, looser, and far less forgiving when the public market sours on you in month four. The mechanics matter less than which kind of public company you can actually run.",
    primaryQuery: "Should I go public via IPO or SPAC?",
    secondaryQueries: [
      "IPO vs SPAC for startups",
      "is a SPAC merger worth it",
      "traditional IPO vs SPAC pros and cons",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "napoleon-bonaparte",
      "benjamin-franklin",
    ],
    hookQuestion:
      "An IPO buys you credibility and a year of legal fees. A SPAC buys you speed and a stock chart that judges you every morning. Are you ready to be measured every ninety days for the rest of your tenure?",
    targetKeywords: [
      "should I go public via IPO or SPAC",
      "IPO vs SPAC startup",
      "is a SPAC merger worth it",
      "traditional IPO vs SPAC",
      "going public startup options",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-direct-listing",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Direct Listing?",
    description:
      "A direct listing skips the underwriter and lets existing shareholders sell straight into the public market. You save on banker fees and lose the orderly pop. This page helps you decide whether your company actually has the demand and brand recognition to price itself.",
    primaryQuery: "Should I do a direct listing?",
    secondaryQueries: [
      "direct listing vs IPO",
      "what is a direct listing",
      "is a direct listing right for my company",
    ],
    recommendedCouncil: [
      "ada-lovelace",
      "john-d-rockefeller",
      "benjamin-franklin",
    ],
    hookQuestion:
      "You can list your company without a bank book-building the price for you. Do enough buyers already know who you are to set a fair number on day one, or are you about to find out in public?",
    targetKeywords: [
      "should I do a direct listing",
      "direct listing vs IPO",
      "what is a direct listing",
      "direct listing requirements",
      "going public without underwriter",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-secondary-sale",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Secondary Sale?",
    description:
      "A secondary lets you take chips off the table without selling the company. It also signals to the cap table that you are willing to trade upside for certainty. This page helps you decide what fraction of liquidity now is worth giving up later.",
    primaryQuery: "Should I do a secondary sale?",
    secondaryQueries: [
      "what is a founder secondary sale",
      "how much equity should I sell in a secondary",
      "secondary sale vs full exit",
    ],
    recommendedCouncil: [
      "niccolo-machiavelli",
      "seneca",
      "john-d-rockefeller",
    ],
    hookQuestion:
      "You can pay off the mortgage and keep building, or stay all-in and find out what the company is really worth in five years. Which version of yourself shows up to work the next morning after you decide?",
    targetKeywords: [
      "should I do a secondary sale",
      "founder secondary sale",
      "secondary sale startup equity",
      "how much to sell in a secondary",
      "partial liquidity founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-sell-on-microacquire",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Sell on MicroAcquire?",
    description:
      "Listing on a marketplace like MicroAcquire (now Acquire.com) is the fastest route to liquidity for a small profitable product. It also exposes your metrics, your stack, and your churn to every browsing buyer. This page helps you decide whether the speed is worth the openness.",
    primaryQuery: "Should I sell on MicroAcquire?",
    secondaryQueries: [
      "is MicroAcquire worth it for sellers",
      "how to sell my SaaS on Acquire.com",
      "MicroAcquire vs broker",
    ],
    recommendedCouncil: [
      "benjamin-franklin",
      "thomas-edison",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You could be in escrow in six weeks if the listing performs. You could also tip off your churned customers and your two real competitors in the same week. Which risk shapes your year more?",
    targetKeywords: [
      "should I sell on MicroAcquire",
      "MicroAcquire seller guide",
      "selling SaaS on Acquire.com",
      "MicroAcquire vs broker",
      "list startup for sale online",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-list-on-an-acquisition-marketplace",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I List on an Acquisition Marketplace?",
    description:
      "Acquisition marketplaces compress the buyer search from years to weeks. The tradeoff is volume of unqualified interest and a public listing your team and competitors can find. This page helps you decide whether to go wide or work a private process.",
    primaryQuery: "Should I list on an acquisition marketplace?",
    secondaryQueries: [
      "best startup acquisition marketplaces",
      "should I list my SaaS for sale publicly",
      "private sale vs marketplace listing",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "niccolo-machiavelli",
      "sun-tzu",
    ],
    hookQuestion:
      "A marketplace can put forty buyers in your inbox in a week. Most of them are tire-kickers and one of them is your toughest competitor in disguise. Are you ready to sort that pile in public?",
    targetKeywords: [
      "should I list on an acquisition marketplace",
      "startup acquisition marketplaces",
      "list my SaaS for sale",
      "marketplace vs private sale",
      "where to sell a startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-shut-down-vs-sell-for-parts",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Shut Down vs Sell for Parts?",
    description:
      "When the business will not survive in one piece, the choice is whether to wind it down cleanly or sell the pieces — code, customers, domain, brand — to whoever wants them. One option ends faster. The other gets your team and investors a partial recovery, but takes months of work you no longer believe in.",
    primaryQuery: "Should I shut down vs sell for parts?",
    secondaryQueries: [
      "shut down startup vs asset sale",
      "selling startup assets after failure",
      "how to wind down a startup",
    ],
    recommendedCouncil: [
      "marcus-aurelius",
      "niccolo-machiavelli",
      "seneca",
    ],
    hookQuestion:
      "The company is not coming back. You can close the doors next month, or spend another six months selling the furniture for thirty cents on the dollar. Which ending serves the people who trusted you?",
    targetKeywords: [
      "should I shut down vs sell for parts",
      "shut down startup vs asset sale",
      "selling startup assets",
      "how to wind down a startup",
      "asset sale failing company",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-handover",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Handover?",
    description:
      "Handing the company to a successor — internal hire, family member, or new owner — is different from selling it. You stay legally tied for months and emotionally tied for years. This page is for founders deciding whether to transition control rather than transact it.",
    primaryQuery: "Should I do a handover?",
    secondaryQueries: [
      "how to hand over my company",
      "succession planning for founder",
      "transitioning leadership of a startup",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "marcus-aurelius",
      "harriet-tubman",
    ],
    hookQuestion:
      "You are choosing the person who decides what the company becomes after you. Are you giving them room to actually run it, or holding the wheel while pretending to let go?",
    targetKeywords: [
      "should I do a handover",
      "how to hand over my company",
      "founder succession planning",
      "transitioning leadership startup",
      "leadership handover founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-stay-on-as-an-employee-after-sale",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Stay On as an Employee After Sale?",
    description:
      "Staying on protects the team, vests the rest of your earnout, and slowly grinds away the autonomy you sold the company to keep. Leaving cleanly preserves your sanity and risks the deal you just signed. The contract is one document. The decision is another.",
    primaryQuery: "Should I stay on as an employee after sale?",
    secondaryQueries: [
      "should I stay after my startup is acquired",
      "post-acquisition founder role",
      "leaving after an acquisition",
    ],
    recommendedCouncil: [
      "epictetus",
      "niccolo-machiavelli",
      "thomas-edison",
    ],
    hookQuestion:
      "Yesterday you ran the company. Today you have a manager, a quarterly review, and a Slack workspace you no longer control. How long can you do this work without becoming someone you do not want to be?",
    targetKeywords: [
      "should I stay on as an employee after sale",
      "stay after startup acquisition",
      "post-acquisition founder role",
      "leaving after acquisition",
      "founder integration period",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-an-esop",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do an ESOP?",
    description:
      "An ESOP sells the company to its employees over time, with significant tax advantages and significant administrative weight. You give up the headline price a strategic buyer would pay, in exchange for the place keeping its name. This page is for founders weighing legacy against liquidity.",
    primaryQuery: "Should I do an ESOP?",
    secondaryQueries: [
      "what is an ESOP exit",
      "ESOP vs selling to a buyer",
      "is an ESOP right for my company",
    ],
    recommendedCouncil: [
      "abraham-lincoln",
      "andrew-carnegie",
      "frederick-douglass",
    ],
    hookQuestion:
      "An ESOP usually pays less than a strategic sale and keeps the company in the hands of the people who built it. Are you the kind of seller who can take less money to protect what the place actually is?",
    targetKeywords: [
      "should I do an ESOP",
      "what is an ESOP exit",
      "ESOP vs strategic sale",
      "is an ESOP right for my company",
      "employee stock ownership plan exit",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-do-a-leveraged-buyout",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Do a Leveraged Buyout?",
    description:
      "An LBO funds the purchase mostly with debt that the company itself has to service. The math works when cash flow is steady and breaks when revenue dips. This page helps you decide whether the structure rewards a healthy business or strangles a fragile one.",
    primaryQuery: "Should I do a leveraged buyout?",
    secondaryQueries: [
      "how does a leveraged buyout work",
      "LBO vs traditional acquisition",
      "is an LBO right for my startup",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "niccolo-machiavelli",
      "archimedes",
    ],
    hookQuestion:
      "You can use the company's own future cash to pay for itself, but every covenant you sign tightens a noose around a bad quarter. How confident are you that the next two years look like the last two?",
    targetKeywords: [
      "should I do a leveraged buyout",
      "how does a leveraged buyout work",
      "LBO vs acquisition",
      "is an LBO right for my company",
      "leveraged buyout structure",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-private-equity-investment",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Take Private Equity Investment?",
    description:
      "Private equity is not venture capital with a different logo. PE firms buy control, run the playbook, and have a five-to-seven year clock on returning the fund. This page is for founders deciding whether to trade founder mode for the operating partner's spreadsheet.",
    primaryQuery: "Should I take private equity investment?",
    secondaryQueries: [
      "private equity vs venture capital for startups",
      "is PE investment right for my company",
      "what changes when PE buys you",
    ],
    recommendedCouncil: [
      "john-d-rockefeller",
      "sun-tzu",
      "marcus-aurelius",
    ],
    hookQuestion:
      "PE money is patient about quarters and impatient about the exit clock you cannot see in the term sheet. Are you ready to optimize a business for sale to the next owner instead of for the work itself?",
    targetKeywords: [
      "should I take private equity investment",
      "private equity vs venture capital",
      "is PE investment right for my company",
      "PE buyout founder",
      "private equity for startups",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-take-this-final-offer",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Take This Final Offer?",
    description:
      "Once a buyer calls it final, every counter risks blowing up months of work. The price on the table is real, the price you imagine is theoretical, and the cost of restarting the process is brutal. This page is for founders standing on the edge of a yes or a no.",
    primaryQuery: "Should I take this final offer?",
    secondaryQueries: [
      "is this really a final offer",
      "how to know when to accept a final offer",
      "final offer acquisition negotiation",
    ],
    recommendedCouncil: [
      "julius-caesar",
      "seneca",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "The buyer used the word final, and now every minute of silence costs more than the last. Is this the moment to sign, or the moment they find out you would have signed an hour ago?",
    targetKeywords: [
      "should I take this final offer",
      "is this really a final offer",
      "how to know when to accept a final offer",
      "final offer acquisition",
      "best and final offer startup",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-disclose-this-information-in-due-diligence",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Disclose This Information in Due Diligence?",
    description:
      "Due diligence rewards what you volunteer and punishes what they find later. Buyers walk over withheld churn, hidden lawsuits, and quietly-resigned engineers far more often than over the same facts disclosed upfront. This page is for founders deciding what to put on the page before someone else does.",
    primaryQuery: "Should I disclose this information in due diligence?",
    secondaryQueries: [
      "what do I have to disclose in due diligence",
      "hiding information in due diligence risks",
      "due diligence disclosure obligations",
    ],
    recommendedCouncil: [
      "cicero",
      "aristotle",
      "niccolo-machiavelli",
    ],
    hookQuestion:
      "You can volunteer the bad news now and watch the price soften, or stay quiet and hope the data room never gets that far. Which version of this conversation can you defend if it becomes a lawsuit?",
    targetKeywords: [
      "should I disclose this information in due diligence",
      "due diligence disclosure obligations",
      "hiding information in due diligence",
      "what to disclose to acquirer",
      "diligence representations warranties",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-walk-away-from-this-deal",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Walk Away From This Deal?",
    description:
      "Walking away after months of diligence costs lawyer fees, momentum, and sometimes the team's belief that anything will ever close. Signing a bad deal costs more, for longer, and is much harder to reverse. This page is for founders trying to tell sunk cost from real risk.",
    primaryQuery: "Should I walk away from this deal?",
    secondaryQueries: [
      "when to walk away from an acquisition",
      "killing a deal in due diligence",
      "should I cancel my acquisition",
    ],
    recommendedCouncil: [
      "napoleon-bonaparte",
      "sun-tzu",
      "seneca",
    ],
    hookQuestion:
      "Six months of work, three lawyers, and one term you cannot stomach. Are you about to honor the sunk cost, or about to sign a contract that will define every Sunday night for the next two years?",
    targetKeywords: [
      "should I walk away from this deal",
      "when to walk away from an acquisition",
      "killing a deal in due diligence",
      "cancel acquisition founder",
      "deal fatigue founder",
      "start your own agon",
    ],
  },
  {
    slug: "should-i-restart-after-an-exit",
    status: "shipped",
    shippedAt: "2026-05-25",
    title: "Should I Restart After an Exit?",
    description:
      "The check has cleared and the non-compete has thawed. Starting again means returning to a problem that does not care about your past wins and a team that may not have your last team's chemistry. This page is for founders weighing the second-time itch against the rare freedom of stopping.",
    primaryQuery: "Should I restart after an exit?",
    secondaryQueries: [
      "should I start another company after exit",
      "second time founder restart",
      "what to do after selling a startup",
    ],
    recommendedCouncil: [
      "thomas-edison",
      "leonardo-da-vinci",
      "joan-of-arc",
    ],
    hookQuestion:
      "You have the money to never do this again and the restlessness to start tomorrow. Are you going back because the next idea is real, or because the silence after the exit is louder than you expected?",
    targetKeywords: [
      "should I restart after an exit",
      "start another company after exit",
      "second time founder",
      "what to do after selling a startup",
      "post-exit founder reset",
      "start your own agon",
    ],
  },
];

// Optional kill-switch / cap: if DECISION_PUBLISH_THROUGH=YYYY-MM-DD is set,
// no entry past that date is published even when its shippedAt has passed.
// Lets us pause a drip without redeploying — set the env var in Vercel and
// trigger a redeploy (or wait for ISR revalidation).
const PUBLISH_THROUGH_RAW = process.env.DECISION_PUBLISH_THROUGH?.trim();

function publishCutoff(now: Date): Date {
  if (!PUBLISH_THROUGH_RAW) return now;
  const override = new Date(`${PUBLISH_THROUGH_RAW}T23:59:59Z`);
  if (Number.isNaN(override.getTime())) return now;
  return override < now ? override : now;
}

export function isDecisionPublished(entry: DecisionEntry, now: Date = new Date()): boolean {
  return getDecisionPublishedAt(entry) <= publishCutoff(now);
}

export function getActiveDecisions(now: Date = new Date()): DecisionEntry[] {
  return DECISION_ENTRIES.filter((entry) => isDecisionPublished(entry, now));
}

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
