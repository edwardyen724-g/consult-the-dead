# 2026-05-12 quiz decision-type routing

- Task: Route the quiz into a best-fit pack or featured mind by decision type
- Updated:
  - `website/src/app/quiz/QuizFlow.tsx`
  - `website/src/app/quiz/quiz-routing.test.ts`
- Change:
  - added a decision-type recommendation card to the quiz step that now points users to the best-fit pack when one is configured
  - added a deterministic featured-mind fallback so decision types without a pack can still surface a direct route
  - kept the existing tension-based council flow intact and added regression coverage for the new pack-routing branch

## Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm coverage -- website/src/app/quiz/quiz-routing.test.ts`
- Result: passed after creating the generated `coverage/.tmp` directory; 142 test files and 1981 tests passed, with overall coverage above the gate.

# 2026-05-12 homepage hero clarity and first-scroll demo rewrite

- Task: Rewrite the homepage hero copy around decision clarity and the first-scroll demo
- Updated:
  - `website/src/app/page.tsx`
  - `website/src/app/page.test.tsx`
  - `website/src/app/worked-example.tsx`
  - `website/src/app/worked-example.test.ts`
  - `website/src/app/worked-example.regression.test.ts`
  - `website/src/lib/ctr-experiment.ts`
- Change:
  - reframed the homepage hero around clarity-first positioning and added an explicit first-scroll demo anchor so the proof surface is visible immediately
  - rewrote the hero CTA labels and demo intro copy to match the new clarity message
  - reworked the streaming demo question, proof points, research lines, advisor rounds, and consensus text so the demo itself reinforces clarity and proof placement instead of the old AI-career-pivot framing
  - aligned the shared curiosity-gap hero variant with the new homepage language so the default experiment copy stays in sync
  - updated the homepage and demo regression tests to lock the new copy in place

## Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm coverage -- src/app/page.test.tsx src/app/worked-example.test.ts src/app/worked-example.regression.test.ts src/lib/__tests__/ctr-experiment.test.ts`
- Result: passed, with 142 test files and 1981 tests green; coverage remained above the gate on the focused run.
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm lint`
- Result: passed with existing repository warnings only; no errors in the touched files.

# 2026-05-12 pricing proof copy refresh

- Task: Refresh pricing proof copy to rely on live stats and shipped-product evidence only
- Updated:
  - `website/src/lib/pricing-copy.ts`
  - `website/src/lib/pricing-copy.test.ts`
- Change:
  - rewrote the pricing metadata description to frame the page around live stats and shipped-product evidence instead of the old feature-promise phrasing
  - kept the canonical free-tier and founding-member fragments intact so the existing pricing metadata and share image still derive from one source of truth
  - added a regression assertion that blocks the old "Pro adds" wording from reappearing

## Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && ./node_modules/.bin/vitest run src/lib/pricing-copy.test.ts src/app/pricing/layout.test.ts src/app/pricing/opengraph-image.test.tsx`
- Result: passed, with 3 files and 10 tests green.

# Change Summary

## Task
- `4f7a3b27-50a9-4671-a4ea-927193a30280` - Normalize publication-surface rhythm across pricing, account, and library

## Changed Files
- `website/src/app/account/page.tsx`
- `website/src/app/library/LibraryClient.tsx`

## What Changed
- Tightened the account surface by restyling the Pro-success notice, the masked email line, and the upgrade CTA so they match the publication-style rhythm used across the product.
- Refined the library client empty states, filters, list header, row density, and delete/upgrade controls to use more consistent button geometry, spacing, and mono-label treatment.
- Kept the content and route behavior intact while making the account and library surfaces read as a single system rather than two adjacent implementations.

## Verification
- `cd website && npx vitest run --coverage src/app/account/page.test.tsx src/app/library/LibraryClient.test.tsx`
- `cd website && npm run coverage`

## Results
- Filtered Vitest coverage run passed the tests but hit the repo-wide coverage threshold because only the two targeted suites were included.
- Full website coverage passed: `142 test files`, `1983 tests`, `99.56% statements`, `98.29% branches`, `100% functions`, `99.84% lines`.

## Task
- `8f50db8e-7828-4a28-bd8e-1c268185dc5d` - Add regression coverage for pricing live-proof strip fallback and stat formatting

## Changed Files
- `website/src/app/pricing/page.test.tsx`

## What Changed
- Strengthened the pricing page regression coverage so the route-backed `PricingPage` loader is verified against the rendered proof strip, not just the `initialStats` prop.
- Added assertions for the live-stats success path to confirm the rendered strip includes the live mind count, debate count, agon count, and trailing fallback text.
- Added assertions for the loader failure path to confirm the rendered strip still shows the static fallback counts and omits stale agon social proof.

## Verification
- `cd website && ./node_modules/.bin/vitest run src/app/pricing/page.test.tsx`
- `cd website && ./node_modules/.bin/vitest run src/lib/pricing/stats.test.ts src/lib/__tests__/pricing-stats-route.test.ts src/app/pricing/page.test.tsx`

## Results
- `src/app/pricing/page.test.tsx` passed: `26 tests passed`
- Combined pricing suites passed: `49 tests passed`
