# Sprint 4: Polish, SEO, and Content Pipeline

## Objective
Separate the shipped polish from the still-open production gaps. The live app already has broad route metadata and social previews, but RSS, collision articles, and the full error/loading shell are still unfinished.

## Features to Implement
1. **SEO** - Per-route `generateMetadata`, Open Graph, Twitter metadata, and JSON-LD are already present on the main shipped routes.
2. **RSS feed** - `/feed.xml` is still missing and remains a real follow-up item if feed distribution matters.
3. **Collision articles** - No `type: "collision"` article format is shipped yet.
4. **Article engine** - There is no dedicated `scripts/generate-article.ts` pipeline script in the live contract.
5. **Production polish** - `not-found.tsx`, `loading.tsx`, and `error.tsx` are still absent, so the final shell is incomplete.

## Success Criteria (Evaluator will verify these)
- [x] Key public routes already expose metadata and social preview tags
- [x] Insight pages already include Article JSON-LD
- [ ] `/feed.xml` is not yet shipped
- [ ] No collision article renderer exists yet
- [ ] No article-generation CLI/script is shipped yet
- [ ] No dedicated `not-found.tsx`, `loading.tsx`, or `error.tsx` shell exists yet
- [ ] Accessibility and build checks should remain release gates, but they are not fully encoded as shipped behavior
- [ ] The site should still build cleanly once the remaining polish tasks land

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
- User accounts / authentication
- Payment / premium tiers
- Analytics integration
