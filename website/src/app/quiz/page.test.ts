import { describe, expect, it } from "vitest"
import { HEADER_QUIZ_ENTRY_HREF } from "@/components/Header"
import { HOME_QUIZ_ENTRY_HREF } from "@/app/page"
import {
  QUIZ_PAGE_ROUTE_GROUPS,
} from "./page"
import {
  QUIZ_ROUTE_GROUPS,
  buildQuizCouncilHref,
  buildQuizEntryHref,
  buildQuizPackHref,
} from "@/lib/ctr-experiment"

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
