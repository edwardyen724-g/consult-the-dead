# CTR & Engagement Research Notes (2026-05-10)

## Shipped State Snapshot

- The homepage already ships the curiosity-gap hero framing, the dual CTA path (`/agora` and `/quiz`), the pack browser, the FAQ block, and the live `StreamingDemo` section.
- The shared routing contract already exists in `website/src/lib/ctr-experiment.ts`: hero variants, `buildQuizEntryHref()`, `QUIZ_ROUTE_GROUPS`, `getQuizRouteGroup()`, `buildQuizCouncilHref()`, and `getQuizDestination()`.
- The quiz surface already uses the same decision matrix and turns a selection into `/agora?minds=...`, and `website/src/app/agora/page.tsx` already consumes that `minds` query string.
- The pricing page already ships a scenario-based proof strip plus a stats row; treat that as the shipped baseline and avoid re-queuing "add proof" as though nothing exists yet.
- Freemium quota reminders, the free first-debate path, and the basic upsell surfaces are already live elsewhere in the app. Treat those as shipped baseline, not new ideas to re-add to the memo.

## What Is Still Experimental

- The homepage still uses static hero copy instead of consuming `getCuriosityGapHeroCopy()` and `buildQuizEntryHref()` directly.
- The pricing proof strip is still page-local; what is missing is a reusable proof component that can pull real signals first and founder fallback second across homepage and pricing.
- The consultation-progress / collection-loop idea exists in spirit, but the product still lacks a visible "you've consulted N minds" surface and a shareable post-debate brag card.
- The hero, quiz, and pricing pages still read like adjacent screens instead of one editorial system.

## Ranked Next Batch

1. Wire the homepage hero to the shared CTR helpers.
   - Surface: `website/src/app/page.tsx`, `website/src/lib/ctr-experiment.ts`
   - Change: pick a hero variant from `getCuriosityGapHeroCopy()`, use `buildQuizEntryHref()` for the quiz CTA, and keep the direct `/agora` path as the fast lane for users who already know what they want.
   - Why now: this converts the routing helper from dead abstraction into a measurable funnel surface without inventing new product behavior.

2. Extract a reusable proof strip.
   - Surface: `website/src/app/page.tsx`, `website/src/app/pricing/page.tsx`, `website/src/components/ProofStrip.tsx`, `website/src/lib/analytics.ts`
   - Change: lift the pricing-page scenario strip into a shared component that can render real signals first and founder fallback second.
   - Why now: the proof concept already exists on pricing, but it is still page-local instead of reusable across the funnel.

3. Add the consultation progress / collection loop.
   - Surface: `website/src/app/agora/AgoraApp.tsx`, `website/src/app/quiz/page.tsx`, `website/src/components/ConsultationProgress.tsx`, `website/src/components/ShareTranscriptButton.tsx`
   - Change: show how many minds a user has consulted and give them a clean share action after a completed debate.
   - Why now: this is the cleanest retention and virality lever that does not require a redesign.

4. Finish the Reading Room visual consolidation.
   - Surface: `website/src/app/page.tsx`, `website/src/app/quiz/page.tsx`, `website/src/app/pricing/page.tsx`, `website/src/components/MindCard.tsx`, `website/src/app/globals.css`
   - Change: tighten typography, spacing, card treatment, and demo placement so the homepage, quiz, and pricing pages feel like one system.
   - Why now: this is the remaining design gap after the routing and funnel pieces are already in place.

## What Not To Re-Queue

- Do not re-open "basic quiz personalization" as a fresh initiative; the route matrix and destination resolver already exist.
- Do not re-propose "interactive demo above fold" as though it were unaddressed; the demo is already shipped and the next question is proof and placement, not existence.
- Do not re-add "signup friction" or "quota gating" as new quick wins unless the scope is a concrete bug or copy drift in a specific surface.
