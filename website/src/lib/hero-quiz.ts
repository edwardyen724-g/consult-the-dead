import type { PackId } from "@/lib/packs";

export type HeroQuizCategory =
  | "strategy"
  | "people"
  | "building"
  | "money"
  | "personal";

export interface HeroQuizOption {
  id: string;
  label: string;
  description: string;
  weights: Partial<Record<HeroQuizCategory, number>>;
}

export interface HeroQuizQuestion {
  id: string;
  prompt: string;
  description: string;
  options: HeroQuizOption[];
}

export interface HeroQuizRecommendation {
  category: HeroQuizCategory;
  packId: PackId;
  packName: string;
  headline: string;
  supportingCopy: string;
  ctaLabel: string;
  ctaHref: string;
}

export const HERO_QUIZ_STORAGE_KEY = "consult-the-dead.hero-quiz.v1";

const CATEGORY_PRIORITY: HeroQuizCategory[] = [
  "strategy",
  "people",
  "building",
  "money",
  "personal",
];

const PACK_BY_CATEGORY: Record<
  HeroQuizCategory,
  {
    packId: PackId;
    packName: string;
    headline: string;
    supportingCopy: string;
    ctaLabel: string;
  }
> = {
  strategy: {
    packId: "war-room",
    packName: "War Room",
    headline: "Start with the War Room",
    supportingCopy:
      "Use the strategists when the real question is timing, leverage, or which move changes the board fastest.",
    ctaLabel: "Open the War Room council",
  },
  people: {
    packId: "republic",
    packName: "The Republic",
    headline: "Bring in The Republic",
    supportingCopy:
      "Choose the statesmen when the bottleneck is buy-in, leadership, negotiation, or a room full of skeptics.",
    ctaLabel: "Open The Republic council",
  },
  building: {
    packId: "inventors-workshop",
    packName: "Inventors' Workshop",
    headline: "Seat the Inventors' Workshop",
    supportingCopy:
      "Use the builders when you need a first-principles answer for product, systems, or a thing that has to work.",
    ctaLabel: "Open the Inventors' Workshop",
  },
  money: {
    packId: "moguls",
    packName: "The Moguls",
    headline: "Let the Moguls weigh it",
    supportingCopy:
      "Pick the compounders when the problem is pricing, capital, scale, or how much upside you should actually chase.",
    ctaLabel: "Open The Moguls",
  },
  personal: {
    packId: "stoic-council",
    packName: "Stoic Council",
    headline: "Lead with the Stoic Council",
    supportingCopy:
      "Call on the Stoics when the decision is about values, resilience, identity, or what stays in your control.",
    ctaLabel: "Open the Stoic Council",
  },
};

export const HERO_QUIZ_QUESTIONS: HeroQuizQuestion[] = [
  {
    id: "challenge-type",
    prompt: "What kind of challenge are you facing?",
    description: "Pick the frame that feels closest to the real bottleneck.",
    options: [
      {
        id: "challenge-strategy",
        label: "Strategy or competition",
        description: "Timing, leverage, or beating the field.",
        weights: { strategy: 3 },
      },
      {
        id: "challenge-people",
        label: "People or politics",
        description: "Alignment, persuasion, leadership, or power dynamics.",
        weights: { people: 3 },
      },
      {
        id: "challenge-building",
        label: "Building something",
        description: "Product, systems, or a thing that has to work.",
        weights: { building: 3 },
      },
      {
        id: "challenge-money",
        label: "Money or growth",
        description: "Pricing, capital, or scaling the economics.",
        weights: { money: 3 },
      },
      {
        id: "challenge-personal",
        label: "Personal or values",
        description: "Career, identity, resilience, or a hard life call.",
        weights: { personal: 3 },
      },
    ],
  },
  {
    id: "pressure-point",
    prompt: "What pressure is loudest right now?",
    description: "This tells us which council will feel most useful first.",
    options: [
      {
        id: "pressure-timing",
        label: "I need the fastest winning move",
        description: "Speed and leverage matter more than consensus.",
        weights: { strategy: 2, money: 1 },
      },
      {
        id: "pressure-buyin",
        label: "I need other people to come with me",
        description: "The answer only works if people actually follow it.",
        weights: { people: 2, personal: 1 },
      },
      {
        id: "pressure-shape",
        label: "I need to shape the thing correctly",
        description: "The architecture matters more than the first move.",
        weights: { building: 2 },
      },
      {
        id: "pressure-upside",
        label: "I need to protect upside without overreaching",
        description: "There is a real economic tradeoff to manage.",
        weights: { money: 2, strategy: 1 },
      },
      {
        id: "pressure-clarity",
        label: "I need clarity before I act",
        description: "The hard part is staying steady while deciding.",
        weights: { personal: 2, building: 1 },
      },
    ],
  },
  {
    id: "desired-outcome",
    prompt: "What do you want from the council?",
    description: "Choose the kind of guidance you would actually use.",
    options: [
      {
        id: "outcome-directive",
        label: "A decisive plan",
        description: "Tell me what move changes the outcome.",
        weights: { strategy: 2, money: 1 },
      },
      {
        id: "outcome-persuasion",
        label: "A way to get buy-in",
        description: "I need words, posture, and sequencing that work on people.",
        weights: { people: 2 },
      },
      {
        id: "outcome-blueprint",
        label: "A practical blueprint",
        description: "Show me how to build it or repair it.",
        weights: { building: 2 },
      },
      {
        id: "outcome-economics",
        label: "A sharper economic read",
        description: "I want the pricing, risk, or scaling math.",
        weights: { money: 2 },
      },
      {
        id: "outcome-grounding",
        label: "A grounded recommendation",
        description: "I need the answer that keeps my judgment clear.",
        weights: { personal: 2 },
      },
    ],
  },
] as const;

const QUESTION_BY_OPTION_ID = new Map(
  HERO_QUIZ_QUESTIONS.flatMap((question) =>
    question.options.map((option) => [option.id, option] as const),
  ),
);

function buildAgoraQuizHref(packId: PackId): string {
  return `/agora?pack=${packId}&utm_source=home&utm_campaign=hero_quiz&utm_content=${packId}`;
}

function emptyScores(): Record<HeroQuizCategory, number> {
  return {
    strategy: 0,
    people: 0,
    building: 0,
    money: 0,
    personal: 0,
  };
}

export function applyHeroQuizWeights(
  scores: Record<HeroQuizCategory, number>,
  weights: Partial<Record<HeroQuizCategory, number>>,
) {
  for (const [category, weight] of Object.entries(weights)) {
    scores[category as HeroQuizCategory] += weight ?? 0;
  }
}

function chooseBestCategory(scores: Record<HeroQuizCategory, number>): HeroQuizCategory {
  return CATEGORY_PRIORITY.reduce((best, category) => {
    if (scores[category] > scores[best]) return category;
    return best;
  }, CATEGORY_PRIORITY[0]);
}

export function buildHeroQuizRecommendation(
  answerIds: readonly string[],
): HeroQuizRecommendation {
  const scores = emptyScores();
  for (const answerId of answerIds) {
    const option = QUESTION_BY_OPTION_ID.get(answerId);
    if (!option) continue;
    applyHeroQuizWeights(scores, option.weights);
  }

  const category = chooseBestCategory(scores);
  const recommendation = PACK_BY_CATEGORY[category];

  return {
    category,
    packId: recommendation.packId,
    packName: recommendation.packName,
    headline: recommendation.headline,
    supportingCopy: recommendation.supportingCopy,
    ctaLabel: recommendation.ctaLabel,
    ctaHref: buildAgoraQuizHref(recommendation.packId),
  };
}
