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

## 2026-05-12 batch 5 promo pack council correction

- Task: Reconcile the batch 5 promo pack with the corrected build-in-public council
- Updated: `output/content-bundles/decisions-batch5-promo-pack.md`
- Change:
  - replaced the stale Franklin references in the build-in-public section with Seneca-aligned copy
  - updated the launch/positioning snippets that quote the live council so they match `/decisions/should-i-build-in-public`
  - left the charge-from-day-one section intact because its Franklin references are still correct

## Verification

- `rg -n "Franklin|Seneca|Aurelius, Machiavelli, Franklin" output/content-bundles/decisions-batch5-promo-pack.md`
- Result: the build-in-public section now uses Seneca consistently; Franklin remains only where the charge-from-day-one copy is supposed to reference him.

## 2026-05-12 decisions release note correction

- Task: Refresh the 2026-05-12 decisions release note for the latest council correction
- Updated: `docs/release-notes/2026-05-12-decisions-expansion-wave2.md`
- Change:
  - added a post-wave correction section for PR #329 and PR #330
  - updated the build-in-public council row to reflect the live Seneca correction
  - revised impact stats, inventory totals, post-wave status, and the status footer to match the current shipped state

## Verification

- `git diff --check -- docs/release-notes/2026-05-12-decisions-expansion-wave2.md`
- Result: passed

---

- Task: Embed debate preview in `/decisions/[slug]` pages
- Updated: `website/src/app/decisions/[slug]/page.test.tsx`
- Change: added a route test that renders a shipped decision with a matching debate file and asserts the Round 1 preview content appears in the HTML.

## Verification

- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website coverage -- --coverage.include 'src/app/decisions/[slug]/page.tsx' 'src/app/decisions/[slug]/page.test.tsx'`
- Result: passed, with `src/app/decisions/[slug]/page.tsx` at 100% coverage under the focused include scope.

## 2026-05-12 branch-coverage registry restore

- Task: Restore the branch-coverage exception registry and reconcile coverage-gate references
- Updated:
  - `docs/coverage-gate-policy.md`
  - `docs/branch-coverage-exceptions.md`
  - `output/feedback-report.md`
- Change:
  - restored the missing registry artifact as the canonical record for approved branch-coverage exceptions
  - updated the policy to point at the registry instead of duplicating the exception table inline
  - corrected the internal feedback note to reference the real policy and registry paths

## Verification

- `git diff --check`
- `rg -n "docs/runbooks/coverage-gate-policy\\.md|docs/branch-coverage-exceptions\\.md" /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/output /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/CHANGELOG.md`
- Result: passed; no whitespace issues, the stale runbook reference is gone, and the registry path resolves in the policy, changelog, and feedback note.
