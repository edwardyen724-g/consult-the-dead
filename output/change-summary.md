# Change Summary

## Task
- Add a Loom/demo slot to the pricing page and onboarding copy.

## Files Changed
- `website/src/app/pricing/PricingClient.tsx`
- `website/src/app/pricing/page.test.tsx`
- `docs/phase0-pricing-page-copy.md`

## What Changed
- Added a dedicated pricing-page demo/case-study slot with embed-ready placeholder copy for a short Loom or first customer callout.
- Updated the Pro CTA subtext to mention the demo slot as part of the checkout/onboarding message.
- Added regression tests for the new slot and its placement between the trust badge and social-proof strip.
- Documented the pricing-page demo/case-study slot in the phase-0 pricing copy brief.

## Verification
- `npm run test -- src/app/pricing/page.test.tsx src/lib/pricing-copy.test.ts`
- `npm run lint -- src/app/pricing/PricingClient.tsx src/app/pricing/page.test.tsx`
- `npx vitest run --pool=threads --coverage --coverage.include src/app/pricing/PricingClient.tsx src/app/pricing/page.test.tsx`

## Result
- Focused pricing tests passed: 30 passed, 0 failed.
- ESLint passed on the touched pricing files with no warnings.
- Scoped coverage passed for `website/src/app/pricing/PricingClient.tsx`: 100% statements, 100% lines, 100% functions, 98.07% branches.

## Task
- Add a docs-inventory drift test for shipped decision counts.

## Files Changed
- `website/src/app/decisions/page.tsx`
- `website/src/app/decisions/page.test.tsx`
- `website/src/app/decisions/docs-inventory.test.ts`

## What Changed
- Derived the decisions page metadata copy from `DECISION_ENTRIES.length` so the public roster text stays aligned with the shipped registry.
- Updated the existing decisions page test expectations to assert against the live registry count instead of a hard-coded number.
- Added a regression test that reads `README.md` and the public page metadata, then fails if either copy drifts from the shipped decision count.

## Verification
- `wcx npm --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website test -- src/app/decisions/page.test.tsx src/app/decisions/docs-inventory.test.ts`
- `wcx npm --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website run coverage -- src/app/decisions/page.test.tsx src/app/decisions/docs-inventory.test.ts`

## Result
- Targeted tests passed: 14 passed, 0 failed.
- The scoped coverage run hit the repository-wide 95% gate and failed as expected when only the decision slice was executed.

## Task
- Refresh decisions index metadata and tests to match the current shipped decision registry.

## Files Changed
- `website/src/app/decisions/page.tsx`
- `website/src/app/decisions/page.test.tsx`

## What Changed
- Kept the decisions landing page metadata copy aligned with the current `DECISION_ENTRIES` count.
- Updated the page tests to assert the current 24-entry registry and the rendered item count.

## Verification
- `wcx ./website/node_modules/.bin/vitest run website/src/app/decisions/page.test.tsx --pool=threads`

## Result
- Decisions page tests pass: 13 passed, 0 failed.

---

## Task
- Trim obsolete phase-language in Monetization Playbook and connect Phase 3 to current shipped assets.

## Files Changed
- `MONETIZATION_PLAYBOOK.md`

## What Changed
- Added the shipped `docs/release-notes/index.md` queue to the playbook's current-state inventory.
- Reframed Phase 3 as outbound motion on the live Agora, pricing, and release-note surfaces instead of a generic future sales phase.
- Updated the changelog entry to describe the outbound focus in current terms.

## Verification
- `git diff --check -- MONETIZATION_PLAYBOOK.md`

## Result
- No whitespace or patch-format issues in the edited playbook.
