export type CuriosityGapHeroVariantId =
  | "decision-first"
  | "quiz-first"
  | "direct-first";

export interface CuriosityGapHeroCopy {
  variantId: CuriosityGapHeroVariantId;
  eyebrow: string;
  headline: string;
  body: string;
  proofLine: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export const CURIOSITY_GAP_HERO_COPY_VARIANTS = [
  {
    variantId: "decision-first",
    eyebrow: "Clarity before commitment",
    headline: "Bring the decision into focus.",
    body: "Open the first-scroll demo below, then bring the question that still feels foggy.",
    proofLine: "First-scroll proof for founders, operators, and anyone stuck between two moves.",
    primaryCtaLabel: "Ask the council",
    secondaryCtaLabel: "See the demo",
  },
  {
    variantId: "quiz-first",
    eyebrow: "Unsure who belongs in the room?",
    headline: "Stop choosing minds at random.",
    body: "A short quiz can route you to a council built for strategy, people, building, money, or personal decisions.",
    proofLine: "The shortest path to a relevant first council.",
    primaryCtaLabel: "Find my council",
    secondaryCtaLabel: "Ask directly",
  },
  {
    variantId: "direct-first",
    eyebrow: "More signal, less blank page",
    headline: "The right debate starts before the first question.",
    body: "Use the quiz when the shape of the decision is unclear; skip straight to the Agora when it already is.",
    proofLine: "Curiosity gap, then council.",
    primaryCtaLabel: "Start with the quiz",
    secondaryCtaLabel: "Ask directly",
  },
] as const satisfies readonly CuriosityGapHeroCopy[];

function normalizeLookupKey(value: string | null | undefined) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Return the configured curiosity-gap hero copy variant.
 *
 * Unknown or missing variant ids fall back to the first-ranked copy so the
 * consumer always gets a usable surface.
 */
export function getCuriosityGapHeroCopy(
  variantId?: string | null,
): CuriosityGapHeroCopy {
  const normalizedVariantId = normalizeLookupKey(variantId);
  return (
    CURIOSITY_GAP_HERO_COPY_VARIANTS.find(
      (variant) => normalizeLookupKey(variant.variantId) === normalizedVariantId,
    ) ?? CURIOSITY_GAP_HERO_COPY_VARIANTS[0]
  );
}

export type QuizDecisionType =
  | "strategy"
  | "people"
  | "building"
  | "money"
  | "personal";

export interface QuizDestination {
  decisionType: QuizDecisionType;
  label: string;
  description: string;
  tagline: string;
  mindSlugs: readonly string[];
  href: string;
}

export interface QuizRouteGroup {
  decisionType: QuizDecisionType;
  label: string;
  description: string;
  /**
   * The best-fit pack for this decision type.  When present the quiz page
   * surfaces a "jump straight to this council" shortcut above the
   * individual tension choices so users can reach a relevant pre-built
   * council in a single click instead of two.
   */
  featuredPack: {
    /** Pack id used to build the Agora query string: /agora?pack=<id> */
    packId: string;
    /** Display name shown on the featured-council card. */
    name: string;
    /** Short pitch line shown below the name. */
    tagline: string;
  };
  routes: readonly Omit<QuizDestination, "decisionType" | "href">[];
}

export const QUIZ_ROUTE_GROUPS = [
  {
    decisionType: "strategy",
    label: "Strategy & Competition",
    description: "Market positioning, timing, competitive moves",
    featuredPack: {
      packId: "war-room",
      name: "War Room",
      tagline: "Generals, conquerors, and covert operators who think in terrain, timing, and asymmetric advantage.",
    },
    routes: [
      {
        label: "Attack or defend?",
        description: "Should I compete head-on or protect what I have?",
        mindSlugs: ["sun-tzu", "alexander-the-great", "niccolo-machiavelli"],
        tagline: "The strategists who knew when to strike and when to wait.",
      },
      {
        label: "Move fast or move carefully?",
        description: "Timing is everything - but which direction?",
        mindSlugs: ["sun-tzu", "cleopatra-vii", "benjamin-franklin"],
        tagline: "Three minds who mastered the art of timing.",
      },
      {
        label: "Compete or find a different game?",
        description: "Fight in the existing market or create a new one?",
        mindSlugs: ["nikola-tesla", "sun-tzu", "john-d-rockefeller"],
        tagline: "The visionary, the strategist, and the empire builder.",
      },
    ],
  },
  {
    decisionType: "people",
    label: "People & Power",
    description: "Leadership, negotiation, influence, team dynamics",
    featuredPack: {
      packId: "republic",
      name: "The Republic",
      tagline: "The architects of states: statesmen, philosophers, and operators who understood that power is always a negotiation.",
    },
    routes: [
      {
        label: "Getting buy-in from skeptics",
        description: "I need people to follow a decision they disagree with.",
        mindSlugs: ["cicero", "benjamin-franklin", "niccolo-machiavelli"],
        tagline: "The persuader, the diplomat, and the realist.",
      },
      {
        label: "Managing someone difficult",
        description: "A key person is underperforming, sabotaging, or checked out.",
        mindSlugs: ["niccolo-machiavelli", "catherine-the-great", "marcus-aurelius"],
        tagline: "Power, governance, and the wisdom to know the difference.",
      },
      {
        label: "Leading through a crisis",
        description: "Everything is going wrong and people are looking at me.",
        mindSlugs: ["harriet-tubman", "marcus-aurelius", "alexander-the-great"],
        tagline: "Three leaders who held steady when the stakes were highest.",
      },
    ],
  },
  {
    decisionType: "building",
    label: "Building & Creating",
    description: "Product, invention, design, technical decisions",
    featuredPack: {
      packId: "inventors-workshop",
      name: "Inventors' Workshop",
      tagline: "Makers and tinkerers who turned curiosity into machines and proved a single workshop can move the world.",
    },
    routes: [
      {
        label: "Stuck between approaches",
        description: "Multiple paths forward but I can only pick one.",
        mindSlugs: ["leonardo-da-vinci", "archimedes", "isaac-newton"],
        tagline: "The polymath, the problem-solver, and the first-principles thinker.",
      },
      {
        label: "Pivot or persist?",
        description: "It's not working yet - but is that a signal to change or push through?",
        mindSlugs: ["thomas-edison", "marie-curie", "nikola-tesla"],
        tagline: "Three minds who knew the difference between failure and progress.",
      },
      {
        label: "How to build the system right",
        description: "I need to design something that scales and doesn't break.",
        mindSlugs: ["ada-lovelace", "archimedes", "isaac-newton"],
        tagline: "Systems thinking from the people who invented it.",
      },
    ],
  },
  {
    decisionType: "money",
    label: "Money & Growth",
    description: "Investment, scaling, pricing, resource allocation",
    featuredPack: {
      packId: "moguls",
      name: "The Moguls",
      tagline: "Empire builders and compounders who saw how a small advantage, ruthlessly reinvested, becomes a fortune.",
    },
    routes: [
      {
        label: "Reinvest everything or take profit?",
        description: "Growth vs. security - where's the line?",
        mindSlugs: ["john-d-rockefeller", "benjamin-franklin", "catherine-the-great"],
        tagline: "The empire builder, the pragmatist, and the modernizer.",
      },
      {
        label: "A risky bet with big upside",
        description: "The opportunity is real but so is the downside.",
        mindSlugs: ["cleopatra-vii", "nikola-tesla", "sun-tzu"],
        tagline: "Three minds who calculated risk differently than everyone else.",
      },
      {
        label: "Pricing and positioning",
        description: "How do I capture value without losing the market?",
        mindSlugs: ["john-d-rockefeller", "niccolo-machiavelli", "cicero"],
        tagline: "Monopoly thinking, power dynamics, and persuasion.",
      },
    ],
  },
  {
    decisionType: "personal",
    label: "Personal & Values",
    description: "Career, ethics, resilience, identity decisions",
    featuredPack: {
      packId: "stoic-council",
      name: "Stoic Council",
      tagline: "Emperors and philosophers who taught the West how to carry a hard decision without flinching.",
    },
    routes: [
      {
        label: "What's actually in my control?",
        description: "I'm overwhelmed and need to separate noise from signal.",
        mindSlugs: ["epictetus", "marcus-aurelius", "harriet-tubman"],
        tagline: "The stoics and the woman who walked through impossible odds.",
      },
      {
        label: "Loyalty vs. self-interest",
        description: "Staying feels safe but leaving might be right.",
        mindSlugs: ["marcus-aurelius", "niccolo-machiavelli", "benjamin-franklin"],
        tagline: "Duty, power, and pragmatism walk into a room.",
      },
      {
        label: "I need to reinvent myself",
        description: "Career shift, identity change, starting over.",
        mindSlugs: ["catherine-the-great", "leonardo-da-vinci", "marie-curie"],
        tagline: "The modernizer, the polymath, and the pioneer.",
      },
    ],
  },
] as const satisfies readonly QuizRouteGroup[];

/**
 * Build the quiz entry URL used by homepage CTAs.
 *
 * The guided entry keeps the current behavior explicit instead of hard-coding
 * the query string in multiple pages.
 */
export type QuizEntryHrefSurface = "guided" | "direct" | "header" | "footer";

const QUIZ_ENTRY_HREF_BY_SURFACE: Record<QuizEntryHrefSurface, string> = {
  guided: "/quiz?entry=guided",
  direct: "/quiz",
  header: "/quiz?utm_source=header&utm_medium=nav&utm_campaign=guided_entry",
  footer: "/quiz?utm_source=footer&utm_medium=cta&utm_campaign=guided_entry",
};

export function buildQuizEntryHref(mode: QuizEntryHrefSurface = "guided"): string {
  return QUIZ_ENTRY_HREF_BY_SURFACE[mode];
}

/**
 * Build the Agora destination for a selected council.
 *
 * Slugs are trimmed, blank entries are removed, and each slug is encoded
 * individually so the resulting query string is safe to interpolate directly.
 */
export function buildQuizCouncilHref(mindSlugs: readonly string[]): string {
  const safeSlugs = mindSlugs.map((slug) => slug.trim()).filter(Boolean);
  if (safeSlugs.length === 0) return "/agora";
  return `/agora?minds=${safeSlugs.map((slug) => encodeURIComponent(slug)).join(",")}`;
}

/**
 * Build the Agora destination for a pre-configured pack.
 *
 * Routes the user to the Agora with the full pack pre-loaded, so they
 * skip manual mind selection and land directly in the best-fit council.
 */
export function buildQuizPackHref(packId: string): string {
  return `/agora?pack=${encodeURIComponent(packId.trim())}`;
}

/**
 * Return the featured pack for a given decision type, or null if none is configured.
 */
export function getQuizFeaturedPack(
  decisionType: string | null | undefined,
): QuizRouteGroup["featuredPack"] | null {
  const group = getQuizRouteGroup(decisionType);
  return group?.featuredPack ?? null;
}

export function getQuizRouteGroup(
  decisionType: string | null | undefined,
): QuizRouteGroup | null {
  const normalizedDecisionType = normalizeLookupKey(decisionType);
  const group = QUIZ_ROUTE_GROUPS.find(
    (candidate) => normalizeLookupKey(candidate.decisionType) === normalizedDecisionType,
  );
  return group ?? null;
}

/**
 * Resolve a quiz answer into the selected council and its Agora destination.
 */
export function getQuizDestination(
  decisionType: string | null | undefined,
  routeLabel: string | null | undefined,
): QuizDestination | null {
  const group = getQuizRouteGroup(decisionType);
  if (!group) return null;

  const normalizedLabel = normalizeLookupKey(routeLabel);
  const route = group.routes.find(
    (candidate) => normalizeLookupKey(candidate.label) === normalizedLabel,
  );
  if (!route) return null;

  return {
    decisionType: group.decisionType,
    label: route.label,
    description: route.description,
    tagline: route.tagline,
    mindSlugs: route.mindSlugs,
    href: buildQuizCouncilHref(route.mindSlugs),
  };
}
