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
## Results
- The focused account test file passed: `5 tests passed`.
- The scoped coverage run passed at `100%` statements, `100%` branches, `100%` functions, and `100%` lines for `src/app/account/page.tsx`.
- The broader repo-wide coverage run still hits a pre-existing unrelated failure in `src/components/__tests__/Header.test.tsx` (`quiz CTA link has a descriptive aria-label`), so I used the scoped coverage run to verify the changed page itself.

## Task
- `d965fc65-808a-40ba-8c67-72d4c83f8865` - Update capsule cross-reference hygiene guidance

## Capsule
- `ac364596-089d-4ccd-8e06-295c4dabcfc3` - `wanman/d965fc65-cross-reference-hygiene`

## Changed Files
- `company-skills/shared/capsule-cross-reference-hygiene/SKILL.md`
- `output/change-summary.md`

## What Changed
- Tightened the shared cross-reference guidance so future capsule prose anchors carve-outs on `capsule:<id>` only and explicitly avoids `ownerAgent` wording in goal text.
- Reworded the parent-task guidance to make split acceptance a first-class dependency problem: record it with `blockedBy` on the capsule and surface it on the task with `dependsOn` and/or a note.

## Verification
- `wanman skill:check /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/company-skills/shared/capsule-cross-reference-hygiene`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- company-skills/shared/capsule-cross-reference-hygiene/SKILL.md`

## Results
- `wanman skill:check` completed without reporting any skill failures for the directory.
- `git diff --check` reported no whitespace or patch-format issues in the edited skill file.

## Task
- `a49fe580-3bcd-4a5e-89c8-949fa23840c8` - Tighten public Agora share CTA strip for publication-surface rhythm

## Capsule
- `52b3a5fc-f9da-4f75-838c-315b81bf5a95` - `wanman/share-cta-strip-rhythm`

## Changed Files
- `website/src/components/ShareCtaStrip.tsx`
- `website/src/components/__tests__/ShareCtaStrip.test.tsx`
- `output/change-summary.md`

## What Changed
- Refined the public Agora share strip copy into a more editorial, publication-style rhythm with a short eyebrow, a stronger headline, tighter supporting text, and a clearer CTA label.
- Tightened the inline and sticky spacing, shadow, and responsive layout so the desktop panel and mobile bar feel like one coherent publication surface without changing the share-link helper contract.
- Increased the sticky-bar bottom buffer on mobile so the bar no longer crowds the footer CTA area.
- Extended the regression tests to pin the updated copy, layout styling, and responsive CSS contract, while keeping the share URL UTM parameters unchanged.

## Verification
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && npm test -- --run src/components/__tests__/ShareCtaStrip.test.tsx`
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && npx vitest run --coverage --coverage.include=src/components/ShareCtaStrip.tsx --coverage.thresholds.lines=95 --coverage.thresholds.functions=95 --coverage.thresholds.branches=95 --coverage.thresholds.statements=95 src/components/__tests__/ShareCtaStrip.test.tsx`

## Results
- The focused share-strip test file passed: `11 tests passed`.
- The scoped coverage run passed with `100%` statements, branches, functions, and lines for `src/components/ShareCtaStrip.tsx`.

## Task
- `28052544-0e23-4c35-b992-90fbf0650194` - Reconcile branch-coverage exception registry with completed follow-ups

## Changed Files
- `docs/branch-coverage-exceptions.md`
- `docs/coverage-gate-policy.md`
- `output/change-summary.md`

## What Changed
- Moved the `219eebec-f47b-469b-83d2-60eadb19552c` and `c2eb93e7-255e-4a84-b371-1bd74cf4e233` exception rows out of the active registry table and into the resolved table.
- Updated the coverage gate policy so both follow-up records now read `RESOLVED`, matching the completed work state.

## Verification
- `rg -n "219eebec|c2eb93e7|RESOLVED|IN PROGRESS|\\bOPEN\\b" docs/branch-coverage-exceptions.md docs/coverage-gate-policy.md`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check`

## Results
- The registry and policy docs now agree on the resolved state for both follow-up tasks.
- `git diff --check` reported an unrelated pre-existing trailing-whitespace issue in `docs/runbooks/database-backup-restore.md`, but the edited files themselves are clean.
Task: `6ca8147e-e40b-4a37-b505-38db98f83885`
Capsule: `506b090c-d063-4f8d-af5d-2737bf724633`

## Files Changed

- `website/src/app/layout.tsx`
- `website/src/components/ThemeToggle.tsx`
- `website/src/app/footer-toggle.tsx`
- `website/src/components/ThemeProvider.test.tsx`
- `website/src/components/ThemeToggle.test.tsx`
- `website/src/app/footer-toggle.test.tsx`

## What Changed

- Switched the public app shell to the local `ThemeProvider` wrapper so the shell inherits the shared system-following theme defaults.
- Kept the theme toggles aligned with the resolved OS theme by reading `resolvedTheme` with a fallback to `theme`.
- Added focused tests for the provider defaults and for both toggles' dark/light label and icon states.

## Verification

- `npm run test -- src/components/ThemeProvider.test.tsx src/components/ThemeToggle.test.tsx src/app/footer-toggle.test.tsx`
- `npm run build`

## Notes

- `pnpm` was unavailable in this environment because the local shim requires `corepack`, which is not installed here.
- `next build` completed successfully with existing project warnings unrelated to this change.
