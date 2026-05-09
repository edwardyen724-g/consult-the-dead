import type { Framework } from "@/lib/frameworks"

export type QuizDecisionType = "strategy" | "people" | "building" | "money" | "personal"

export interface QuizTension {
  label: string
  description: string
  slugs: string[]
  tagline: string
}

export interface QuizDecision {
  id: QuizDecisionType
  label: string
  description: string
  tensions: QuizTension[]
}

export interface QuizMindCard {
  slug: string
  name: string
  domain: string
}

export interface QuizModel {
  decisionTypes: QuizDecision[]
  mindsBySlug: Record<string, QuizMindCard>
}

interface TensionRule {
  label: string
  description: string
  tagline: string
  keywords: string[]
}

interface DecisionRule {
  id: QuizDecisionType
  label: string
  description: string
  tensions: TensionRule[]
}

const DECISION_RULES: DecisionRule[] = [
  {
    id: "strategy",
    label: "Strategy & Competition",
    description: "Market positioning, timing, competitive moves",
    tensions: [
      {
        label: "Attack or defend?",
        description: "Should I compete head-on or protect what I have?",
        keywords: ["strategy", "warfare", "power", "statecraft", "conquest", "military"],
        tagline: "The strategists who knew when to strike and when to wait.",
      },
      {
        label: "Move fast or move carefully?",
        description: "Timing is everything — but which direction?",
        keywords: ["timing", "discipline", "adaptation", "persistence", "prudence", "leadership"],
        tagline: "Three minds who mastered the art of timing.",
      },
      {
        label: "Compete or find a different game?",
        description: "Fight in the existing market or create a new one?",
        keywords: ["innovation", "systems", "engineering", "invention", "first principles", "imagination"],
        tagline: "The visionary, the strategist, and the empire builder.",
      },
    ],
  },
  {
    id: "people",
    label: "People & Power",
    description: "Leadership, negotiation, influence, team dynamics",
    tensions: [
      {
        label: "Getting buy-in from skeptics",
        description: "I need people to follow a decision they disagree with.",
        keywords: ["rhetoric", "persuasion", "diplomacy", "governance", "negotiation", "influence"],
        tagline: "The persuader, the diplomat, and the realist.",
      },
      {
        label: "Managing someone difficult",
        description: "A key person is underperforming, sabotaging, or checked out.",
        keywords: ["power", "leadership", "discipline", "governance", "ethics", "architecture"],
        tagline: "Power, governance, and the wisdom to know the difference.",
      },
      {
        label: "Leading through a crisis",
        description: "Everything is going wrong and people are looking at me.",
        keywords: ["crisis", "leadership", "adaptation", "risk", "command", "resilience"],
        tagline: "Three leaders who held steady when the stakes were highest.",
      },
    ],
  },
  {
    id: "building",
    label: "Building & Creating",
    description: "Product, invention, design, technical decisions",
    tensions: [
      {
        label: "Stuck between approaches",
        description: "Multiple paths forward but I can only pick one.",
        keywords: ["mathematics", "physics", "invention", "design", "systems", "analysis"],
        tagline: "The polymath, the problem-solver, and the first-principles thinker.",
      },
      {
        label: "Pivot or persist?",
        description: "It's not working yet — but is that a signal to change or push through?",
        keywords: ["persistence", "innovation", "laboratory", "engineering", "experimentation", "research"],
        tagline: "Three minds who knew the difference between failure and progress.",
      },
      {
        label: "How to build the system right",
        description: "I need to design something that scales and doesn't break.",
        keywords: ["systems", "architecture", "method", "reasoning", "computation", "engineering"],
        tagline: "Systems thinking from the people who invented it.",
      },
    ],
  },
  {
    id: "money",
    label: "Money & Growth",
    description: "Investment, scaling, pricing, resource allocation",
    tensions: [
      {
        label: "Reinvest everything or take profit?",
        description: "Growth vs. security — where's the line?",
        keywords: ["growth", "entrepreneurship", "commercial", "philanthropy", "efficiency", "consolidation"],
        tagline: "The empire builder, the pragmatist, and the modernizer.",
      },
      {
        label: "A risky bet with big upside",
        description: "The opportunity is real but so is the downside.",
        keywords: ["risk", "diplomacy", "innovation", "strategy", "leverage", "expansion"],
        tagline: "Three minds who calculated risk differently than everyone else.",
      },
      {
        label: "Pricing and positioning",
        description: "How do I capture value without losing the market?",
        keywords: ["monopoly", "power", "persuasion", "commercial", "growth", "strategy"],
        tagline: "Monopoly thinking, power dynamics, and persuasion.",
      },
    ],
  },
  {
    id: "personal",
    label: "Personal & Values",
    description: "Career, ethics, resilience, identity decisions",
    tensions: [
      {
        label: "What's actually in my control?",
        description: "I'm overwhelmed and need to separate noise from signal.",
        keywords: ["stoic", "ethics", "freedom", "endurance", "discipline", "resilience"],
        tagline: "The stoics and the woman who walked through impossible odds.",
      },
      {
        label: "Loyalty vs. self-interest",
        description: "Staying feels safe but leaving might be right.",
        keywords: ["duty", "power", "pragmatism", "ethics", "leadership", "strategy"],
        tagline: "Duty, power, and pragmatism walk into a room.",
      },
      {
        label: "I need to reinvent myself",
        description: "Career shift, identity change, starting over.",
        keywords: ["reform", "imagination", "synthesis", "discipline", "pioneer", "reinvention"],
        tagline: "The modernizer, the polymath, and the pioneer.",
      },
    ],
  },
]

function normalizeText(value: string): string {
  return value.toLowerCase()
}

function scoreFramework(framework: Framework, keywords: string[]): number {
  const searchableText = normalizeText(`${framework.meta.person} ${framework.meta.domain}`)
  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword)

    if (searchableText.includes(normalizedKeyword)) {
      return score + 1 + Math.min(normalizedKeyword.split(/\s+/).length - 1, 2)
    }

    return score
  }, 0)
}

function rankFrameworks(frameworks: Framework[], keywords: string[]): Framework[] {
  return [...frameworks]
    .sort((left, right) => {
      const scoreDelta = scoreFramework(right, keywords) - scoreFramework(left, keywords)
      if (scoreDelta !== 0) return scoreDelta

      const incidentDelta = right.incidents.length - left.incidents.length
      if (incidentDelta !== 0) return incidentDelta

      return left.meta.person.localeCompare(right.meta.person)
    })
}

function selectFrameworkSlugs(frameworks: Framework[], keywords: string[], limit = 3): string[] {
  return rankFrameworks(frameworks, keywords)
    .slice(0, limit)
    .map((framework) => framework.slug)
}

function buildMindCatalog(frameworks: Framework[]): Record<string, QuizMindCard> {
  return frameworks.reduce<Record<string, QuizMindCard>>((catalog, framework) => {
    catalog[framework.slug] = {
      slug: framework.slug,
      name: framework.meta.person,
      domain: framework.meta.domain,
    }
    return catalog
  }, {})
}

export function buildQuizModel(frameworks: Framework[]): QuizModel {
  return {
    mindsBySlug: buildMindCatalog(frameworks),
    decisionTypes: DECISION_RULES.map((rule) => ({
      id: rule.id,
      label: rule.label,
      description: rule.description,
      tensions: rule.tensions.map((tension) => ({
        label: tension.label,
        description: tension.description,
        tagline: tension.tagline,
        slugs: selectFrameworkSlugs(frameworks, tension.keywords),
      })),
    })),
  }
}
