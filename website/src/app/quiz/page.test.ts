import type { ReactElement } from "react"
import { isValidElement } from "react"
import { describe, expect, it } from "vitest"
import { HEADER_QUIZ_ENTRY_HREF } from "@/components/Header"
import { HOME_QUIZ_ENTRY_HREF } from "@/app/page"
import QuizPage, { QUIZ_PAGE_COPY, QUIZ_PAGE_ROUTE_GROUPS } from "./page"
import {
  QUIZ_ROUTE_GROUPS,
  buildQuizCouncilHref,
  buildQuizEntryHref,
  buildQuizPackHref,
} from "@/lib/ctr-experiment"

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

describe("quiz contract", () => {
  it("keeps the page-facing matrix aligned with the canonical helper contract", () => {
    expect(
      QUIZ_PAGE_ROUTE_GROUPS.map((group) => ({
        decisionType: group.decisionType,
        label: group.label,
        description: group.description,
        routes: group.routes.map((route) => ({
          label: route.label,
          description: route.description,
          tagline: route.tagline,
          mindSlugs: route.mindSlugs,
          href: route.href,
        })),
      })),
    ).toEqual(
      QUIZ_ROUTE_GROUPS.map((group) => ({
        decisionType: group.decisionType,
        label: group.label,
        description: group.description,
        routes: group.routes.map((route) => ({
          label: route.label,
          description: route.description,
          tagline: route.tagline,
          mindSlugs: route.mindSlugs,
          href: buildQuizCouncilHref(route.mindSlugs),
        })),
      })),
    )
  })

  it("renders a decision-clarity intro and route guide before the quiz flow", () => {
    const page = QuizPage() as ReactElement

    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.eyebrow)
    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.headline)
    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.body)
    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.routingHint)
    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.guideHeading)
    expect(textContent(page)).toContain(QUIZ_PAGE_COPY.guideBody)

    QUIZ_PAGE_ROUTE_GROUPS.forEach((group) => {
      expect(textContent(page)).toContain(group.label)
      expect(textContent(page)).toContain(group.featuredPack.name)
      expect(group.routes.map((route) => route.href)).toEqual(
        group.routes.map((route) => buildQuizCouncilHref(route.mindSlugs)),
      )
      expect(group.featuredPackHref).toBe(buildQuizPackHref(group.featuredPack.packId))
    })
  })

  it("keeps homepage and header quiz entry URLs in sync with the shared helper", () => {
    expect(HOME_QUIZ_ENTRY_HREF).toBe(buildQuizEntryHref())
    expect(HEADER_QUIZ_ENTRY_HREF).toBe(buildQuizEntryHref("guided"))
  })

  it("carries featuredPack data through to each page route group", () => {
    QUIZ_PAGE_ROUTE_GROUPS.forEach((pageGroup, i) => {
      const sourceGroup = QUIZ_ROUTE_GROUPS[i]
      expect(pageGroup.featuredPack).toEqual(sourceGroup.featuredPack)
    })
  })

  it("builds a correct featuredPackHref for every route group via buildQuizPackHref", () => {
    QUIZ_PAGE_ROUTE_GROUPS.forEach((pageGroup) => {
      const expectedHref = buildQuizPackHref(pageGroup.featuredPack.packId)
      expect(pageGroup.featuredPackHref).toBe(expectedHref)
      expect(pageGroup.featuredPackHref).toMatch(/^\/agora\?pack=/)
    })
  })

  it("every route group has a non-empty featuredPack packId, name, and tagline", () => {
    QUIZ_PAGE_ROUTE_GROUPS.forEach((group) => {
      expect(group.featuredPack.packId.trim().length).toBeGreaterThan(0)
      expect(group.featuredPack.name.trim().length).toBeGreaterThan(0)
      expect(group.featuredPack.tagline.trim().length).toBeGreaterThan(0)
    })
  })
})
