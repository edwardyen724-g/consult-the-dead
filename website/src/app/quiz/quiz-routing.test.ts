import { describe, expect, it } from "vitest"
import type { Framework } from "@/lib/frameworks"
import { buildQuizModel } from "./quiz-routing"

function framework(
  slug: string,
  person: string,
  domain: string,
  incidents = 12
): Framework {
  return {
    slug: slug as Framework["slug"],
    meta: {
      person,
      domain,
      incident_count: incidents,
      construct_count: 10,
    },
    era: "test-era",
    perceptual_lens: {
      statement: "",
      what_they_notice_first: "",
      what_they_ignore: "",
    },
    bipolar_constructs: [],
    blind_spots: [],
    behavioral_divergence_predictions: [],
    incidents: Array.from({ length: incidents }, (_, index) => ({
      id: `${slug}-${index}`,
      decision: "decision",
      context: "context",
      divergence_explanation: "divergence",
    })),
  }
}

describe("buildQuizModel", () => {
  it("derives the mind catalog from the live framework list", () => {
    const model = buildQuizModel([
      framework("sun-tzu", "Sun Tzu", "Military Strategy / Statecraft", 13),
      framework("marie-curie", "Marie Curie", "Research, Discovery, Persistence", 28),
    ])

    expect(model.mindsBySlug["sun-tzu"]).toEqual({
      slug: "sun-tzu",
      name: "Sun Tzu",
      domain: "Military Strategy / Statecraft",
    })
    expect(model.mindsBySlug["marie-curie"]).toEqual({
      slug: "marie-curie",
      name: "Marie Curie",
      domain: "Research, Discovery, Persistence",
    })
  })

  it("routes tensions to the highest-scoring frameworks in the provided catalog", () => {
    const model = buildQuizModel([
      framework("sun-tzu", "Sun Tzu", "Military Strategy / Statecraft", 13),
      framework("niccolo-machiavelli", "Niccolò Machiavelli", "Political Strategy, Governance, Power Dynamics", 28),
      framework("marcus-aurelius", "Marcus Aurelius", "Philosophy, Governance, Military Leadership", 59),
      framework("benjamin-franklin", "Benjamin Franklin", "Diplomacy, Science, Entrepreneurship", 28),
      framework("archimedes", "Archimedes of Syracuse", "Applied Mathematics, Mechanical Invention, Theoretical Physics, Strategic Engineering", 28),
      framework("ada-lovelace", "Ada Lovelace", "Computational Imagination, Analytical Method, Symbolic Reasoning, Interdisciplinary Synthesis", 28),
    ])

    const strategyRoute = model.decisionTypes.find((decision) => decision.id === "strategy")
    const buildingRoute = model.decisionTypes.find((decision) => decision.id === "building")

    expect(strategyRoute?.tensions[0].slugs).toEqual([
      "sun-tzu",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ])
    expect(buildingRoute?.tensions[2].slugs).toEqual([
      "ada-lovelace",
      "archimedes",
      "marcus-aurelius",
    ])
  })

  it("never emits a slug that is absent from the supplied catalog", () => {
    const catalog = [
      framework("sun-tzu", "Sun Tzu", "Military Strategy / Statecraft", 13),
      framework("epictetus", "Epictetus", "Stoic Philosophy, Practical Ethics, Freedom Through Discipline, Endurance", 28),
      framework("harriet-tubman", "Harriet Tubman", "Covert Operations, Liberation Strategy, Network Leadership, Adaptive Field Command", 28),
      framework("john-d-rockefeller", "John D. Rockefeller, Sr.", "Industrial Consolidation, Systematic Efficiency, Strategic Philanthropy, Organizational Architecture", 28),
    ]

    const knownSlugs = new Set(catalog.map((entry) => entry.slug))
    const model = buildQuizModel(catalog)

    for (const decision of model.decisionTypes) {
      for (const tension of decision.tensions) {
        for (const slug of tension.slugs) {
          expect(knownSlugs.has(slug)).toBe(true)
        }
      }
    }
  })
})
