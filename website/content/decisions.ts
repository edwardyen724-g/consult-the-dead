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
