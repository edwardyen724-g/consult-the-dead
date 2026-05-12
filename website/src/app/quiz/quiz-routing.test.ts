import type { ReactElement } from "react"
import { isValidElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Framework } from "@/lib/frameworks"
import QuizFlow from "./QuizFlow"
import QuizPage from "./page"
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

const quizPageFrameworks = vi.hoisted(() => [
  framework("sun-tzu", "Sun Tzu", "Military Strategy / Statecraft", 13),
  framework("niccolo-machiavelli", "Niccolò Machiavelli", "Political Strategy, Governance, Power Dynamics", 28),
  framework("marcus-aurelius", "Marcus Aurelius", "Philosophy, Governance, Military Leadership", 59),
  framework("benjamin-franklin", "Benjamin Franklin", "Diplomacy, Science, Entrepreneurship", 28),
  framework("archimedes", "Archimedes of Syracuse", "Applied Mathematics, Mechanical Invention, Theoretical Physics, Strategic Engineering", 28),
  framework("ada-lovelace", "Ada Lovelace", "Computational Imagination, Analytical Method, Symbolic Reasoning, Interdisciplinary Synthesis", 28),
] as Framework[])

const mockReactState = vi.hoisted(() => ({
  values: [] as unknown[],
  index: 0,
}))

vi.mock("@/lib/frameworks", () => ({
  getAllFrameworks: () => quizPageFrameworks,
}))

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react")

  return {
    ...actual,
    useState: <T,>(initial: T) => {
      const slot = mockReactState.index++

      if (mockReactState.values[slot] === undefined) {
        mockReactState.values[slot] = initial
      }

      const setState = (value: T | ((previous: T) => T)) => {
        mockReactState.values[slot] =
          typeof value === "function"
            ? (value as (previous: T) => T)(mockReactState.values[slot] as T)
            : value
      }

      return [mockReactState.values[slot] as T, setState] as const
    },
  }
})

function renderQuizFlow(quizModel: ReturnType<typeof buildQuizModel>) {
  mockReactState.index = 0
  return QuizFlow({ quizModel }) as ReactElement
}

function textContent(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return ""
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map((child) => textContent(child)).join("")
  }

  if (isValidElement(node)) {
    return textContent(node.props.children)
  }

  return ""
}

function collectElements(
  node: unknown,
  predicate: (element: ReactElement) => boolean,
  out: ReactElement[] = []
): ReactElement[] {
  if (node === null || node === undefined || typeof node === "boolean") {
    return out
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectElements(child, predicate, out))
    return out
  }

  if (typeof node === "string" || typeof node === "number") {
    return out
  }

  if (isValidElement(node)) {
    if (predicate(node)) {
      out.push(node)
    }

    collectElements(node.props.children, predicate, out)
  }

  return out
}

function getButtonByText(tree: ReactElement, label: string) {
  const button = collectElements(tree, (element) => element.type === "button").find((element) =>
    textContent(element.props.children).includes(label)
  )

  expect(button).toBeDefined()
  return button as ReactElement
}

function getLinkByHref(tree: ReactElement, href: string) {
  const link = collectElements(tree, (element) => typeof (element.props as { href?: unknown }).href === "string").find(
    (element) => (element.props as { href: string }).href === href
  )

  expect(link).toBeDefined()
  return link as ReactElement<{ href: string }>
}

beforeEach(() => {
  mockReactState.values.length = 0
  mockReactState.index = 0
})

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

describe("quiz page and flow", () => {
  it("passes the live framework catalog into the quiz flow wrapper", () => {
    const page = QuizPage() as ReactElement<{ quizModel: ReturnType<typeof buildQuizModel> }>

    expect(page.type).toBe(QuizFlow)
    expect(page.props.quizModel.mindsBySlug["sun-tzu"]).toEqual({
      slug: "sun-tzu",
      name: "Sun Tzu",
      domain: "Military Strategy / Statecraft",
    })
    expect(page.props.quizModel.decisionTypes).toHaveLength(5)
  })

  it("walks the quiz through selection, backtracking, and results", () => {
    const model = buildQuizModel(quizPageFrameworks)

    let tree = renderQuizFlow(model)
    expect(textContent(tree)).toContain("What kind of decision are you facing?")

    const strategyButton = getButtonByText(tree, "Strategy & Competition")
    strategyButton.props.onMouseEnter({ currentTarget: { style: {} } })
    strategyButton.props.onMouseLeave({ currentTarget: { style: {} } })
    strategyButton.props.onClick()
    tree = renderQuizFlow(model)
    expect(textContent(tree)).toContain("What’s the core tension?")

    getButtonByText(tree, "Back").props.onClick()
    tree = renderQuizFlow(model)
    expect(textContent(tree)).toContain("What kind of decision are you facing?")

    getButtonByText(tree, "Strategy & Competition").props.onClick()
    tree = renderQuizFlow(model)

    const tensionButton = getButtonByText(tree, "Attack or defend?")
    tensionButton.props.onMouseEnter({ currentTarget: { style: {} } })
    tensionButton.props.onMouseLeave({ currentTarget: { style: {} } })
    tensionButton.props.onClick()
    tree = renderQuizFlow(model)

    expect(textContent(tree)).toContain("We found your minds.")
    expect(textContent(tree)).toContain("The strategists who knew when to strike and when to wait.")

    const chosenTension = model.decisionTypes.find((decision) => decision.id === "strategy")?.tensions[0]

    expect(chosenTension).toBeDefined()
    expect(chosenTension?.slugs).toEqual([
      "sun-tzu",
      "niccolo-machiavelli",
      "marcus-aurelius",
    ])

    for (const slug of chosenTension?.slugs ?? []) {
      const mind = quizPageFrameworks.find((framework) => framework.slug === slug)

      expect(textContent(tree)).toContain(mind?.meta.person ?? slug)
      expect(getLinkByHref(tree, `/frameworks/${slug}`).props.href).toBe(`/frameworks/${slug}`)
    }

    expect(getLinkByHref(tree, `/agora?minds=${chosenTension?.slugs.join(",")}`).props.href).toBe(
      `/agora?minds=${chosenTension?.slugs.join(",")}`
    )

    getButtonByText(tree, "Start Over").props.onClick()
    tree = renderQuizFlow(model)
    expect(textContent(tree)).toContain("What kind of decision are you facing?")
  })

  it("covers the quiz flow fallback branches for unknown selections", () => {
    const model = buildQuizModel(quizPageFrameworks)

    mockReactState.values = [1, "missing-decision", null]
    let tree = renderQuizFlow(model)
    expect(textContent(tree)).not.toContain("What’s the core tension?")

    mockReactState.values = [
      2,
      "strategy",
      {
        label: "Fallback council",
        description: "Synthetic branch coverage",
        slugs: ["ghost-mind"],
        tagline: "A fallback council for branch coverage.",
      },
    ]
    tree = renderQuizFlow(model)

    expect(textContent(tree)).toContain("fallback council")
    expect(textContent(tree)).toContain("ghost-mind")
    expect(textContent(tree)).toContain("A fallback council for branch coverage.")
  })
})
