# Sprint 4: Polish, SEO, and Content Pipeline

## Objective
Separate the shipped polish from the still-open production gaps. The live app already has broad route metadata and social previews, but RSS, collision articles, and the full error/loading shell are still unfinished.

> **Last refreshed: 2026-05-12.** All major Sprint 4 items have now shipped. This document is updated to reflect current state.

## Features to Implement
1. **SEO** - Per-route `generateMetadata`, Open Graph, Twitter metadata, and JSON-LD are already present on the main shipped routes. ✅ Done.
2. **RSS feed** - `/feed.xml` route is shipped (`website/src/app/feed.xml/route.ts`). ✅ Done.
3. **Collision articles** - `InsightType = "single" | "collision"` is live in `src/lib/insights.ts`; the collision renderer is in `src/app/insights/[slug]/page.tsx`. ✅ Done.
4. **Article engine** - `website/scripts/generate-article.ts` pipeline script is shipped. ✅ Done.
5. **Production polish** - `not-found.tsx` and `loading.tsx` shells are shipped at the app root and on multiple routes; `error.tsx` is shipped for `frameworks/[slug]`. ✅ Done.

## Success Criteria (Evaluator will verify these)
- [x] Key public routes already expose metadata and social preview tags
- [x] Insight pages already include Article JSON-LD
- [x] `/feed.xml` is shipped (`website/src/app/feed.xml/route.ts`)
- [x] Collision article renderer exists (`InsightType = "single" | "collision"` in `src/lib/insights.ts`)
- [x] Article-generation CLI/script is shipped (`website/scripts/generate-article.ts`)
- [x] `not-found.tsx` and `loading.tsx` shells exist at root + key sub-routes
- [x] `error.tsx` exists for `frameworks/[slug]`
- [ ] Accessibility and build checks should remain release gates, but they are not fully encoded as shipped behavior
- [x] The site builds cleanly (CI green on master)

## Technical Requirements
- Keep using Next.js metadata APIs on the live routes
- Add RSS, collision support, and generation tooling only if those features are still desired
- The remaining polish work should be captured as explicit code tasks, not implied by the current docs

## Design Requirements
- The current design language is already on-brand and restrained
- Any remaining polish should preserve the library / council aesthetic
- Use subtle loading and error states if those routes are added later

## Out of Scope
- Interactive construct explorer
- Framework comparison view
- User accounts / authentication (shipped separately via Clerk integration)
- Payment / premium tiers (shipped separately via Stripe + /pricing)
- Analytics integration (shipped separately via Vercel Analytics)

## Remaining Open Items (as of 2026-05-12)
- Accessibility audit and gates not yet automated in CI
- `error.tsx` shell missing on insights and agora routes (only frameworks/[slug] has one)
