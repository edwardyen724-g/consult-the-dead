# 2026-05-12 CTR quiz helper contract hardening

- Task: Harden the CTR quiz helper contract
- Updated:
  - `website/src/lib/ctr-experiment.ts`
  - `website/src/components/Header.tsx`
  - `website/src/components/Footer.tsx`
  - `website/src/components/__tests__/Header.test.tsx`
  - `website/src/components/Footer.test.tsx`
  - `website/src/lib/__tests__/ctr-experiment.test.ts`
- Change:
  - extended the shared quiz helper so it now owns the homepage guided entry, the header quiz CTA, the footer quiz CTA, and the existing direct quiz route
  - rewired the header and footer quiz CTA constants to derive from the shared helper instead of hard-coded URL strings
  - tightened the helper and component tests so they assert the helper contract for guided, direct, header, and footer surfaces
  - left the homepage and quiz-page routing behavior intact while keeping the shared helper as the source of truth for the quiz entry URLs

## Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm coverage -- website/src/lib/__tests__/ctr-experiment.test.ts website/src/components/__tests__/Header.test.tsx website/src/components/Footer.test.tsx`
- Result: passed; 142 test files and 1983 tests green, with overall coverage at 99.56% statements, 98.29% branches, 100% functions, and 99.84% lines.

# 2026-05-12 Agora share metadata and CTA attribution regression coverage

- Task: Add regression coverage for public Agora share metadata and CTA attribution
- Updated:
  - `website/src/app/agora/a/[id]/page.test.tsx`
- Change:
  - tightened the public share-page regression test so it now asserts the share-loop UTM destination is shared by the attribution-bearing CTA surfaces
  - kept the secondary "Share this agon" link pinned to the canonical `/agora/a/<share_id>` transcript URL
  - preserved the existing metadata contract coverage for the canonical share page and social preview surface

## Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm test -- --coverage 'src/app/agora/a/[id]/page.test.tsx' 'src/lib/__tests__/share-transcript.test.ts' 'src/lib/__tests__/share-cta-link.test.ts'`
- Result: the focused run initially failed under the repo-wide coverage gate because partial coverage is intentionally rejected.
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && pnpm coverage`
- Result: passed with 142 test files and 1981 tests green; overall coverage was 99.56% statements, 98.29% branches, 100% functions, and 99.84% lines.

# 2026-05-12 README quiz route inventory update

- Task: Add `/quiz` to the README route table and document the guided entry path
- Updated:
  - `README.md`
- Change:
  - added `/quiz` to the public route inventory as a live product surface
  - expanded the product overview to describe the guided quiz path into the council-building flow

## Verification

- `rg -n "/quiz|guided quiz path|guided entry path" /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/README.md`
- Result: confirmed the README now mentions the guided quiz entry path and lists `/quiz` in the route table.

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

## 2026-05-12 guided quiz entry notes

- Task: Add guided quiz entry notes to website README and rollout runbook
- Updated:
  - `website/README.md`
  - `docs/runbooks/funnel-surface-rollout.md`
- Change:
  - documented `/quiz?entry=guided` as the guided entry path in the website app surface list
  - noted that the quiz lane is two-stage: decision-type selection first, then best-fit pack or featured mind routing before the final Agora handoff
  - expanded the runbook smoke steps to verify the guided entry selector, the best-fit pack or featured mind recommendation, and the final `/agora?minds=...` handoff

## Verification

- `pnpm --dir website exec vitest run src/app/quiz/page.test.ts`
- Result: passed (1 file, 5 tests)
