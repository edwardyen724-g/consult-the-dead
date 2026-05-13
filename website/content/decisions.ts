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
    slug: "should-i-raise-a-series-a",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Raise a Series A?",
    description:
      "A Series A round means committing to a venture-scale growth trajectory with institutional oversight, board seats, and performance expectations that cannot be walked back. The decision is not just about whether you can raise the money — it is about whether the venture-scale path is the right path for what you are building, and whether you want to live inside the institutional structure that comes with it.",
    primaryQuery: "should I raise a Series A",
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
      "should I raise Series A",
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
    slug: "should-i-expand-internationally",
    status: "shipped",
    shippedAt: "2026-05-14",
    title: "Should I Expand My Business Internationally?",
    description:
      "International expansion is one of the highest-variance strategic decisions a founder makes. It can 3-5x your addressable market in 12 months or consume two years of engineering and sales attention with minimal return. The decision depends entirely on where your current growth is coming from, whether the new market will respond to your existing product and positioning, and whether your team is operationally capable of managing the added complexity.",
    primaryQuery: "should I expand my business internationally",
    secondaryQueries: [
      "when to go international startup",
      "international expansion strategy",
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
      "should I expand internationally",
      "international expansion startup",
      "when to go global startup",
      "international market entry strategy",
      "should I expand to Europe",
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
