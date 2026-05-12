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
