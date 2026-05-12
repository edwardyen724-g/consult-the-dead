## Task
- `1867c109-52de-40ee-9648-8add653d4789` - Add merge-simulating CI check to catch TypeScript errors that only appear after merge

## Changed Files
- `.github/workflows/ci.yml`

## What Changed
- Added a PR-only `CI / Merge-Simulation Build` job that starts from the PR head SHA, merges the target base branch with `--no-commit --no-ff`, and then runs the website build in the merged state.
- Renamed the job key to `merge-simulation-build` and kept the existing lint/test/build jobs intact.
- Tightened the merge-conflict error message to use ASCII-only punctuation.

## Verification
- `git diff -- .github/workflows/ci.yml`

## Results
- Workflow diff reviewed successfully. A YAML parser check was attempted, but `python` is not available in this shell; the repo still needs a CI run or a `python3`-based parse check to validate the workflow file syntactically.

## Task
- `b868f468-9656-445c-956e-263d88e9a961` - Align the pricing canonical reference with the live product and proof strip

## Changed Files
- `docs/ctr-research-notes.md`
- `docs/design-research.md`

## What Changed
- Tightened the pricing-proof guardrail in the CTR research notes so the `/pricing` social-proof story is explicitly limited to the live stats row plus the approved anonymized scenario cards.
- Added the same no-testimonial guardrail to the design research notes so future pricing polish work keeps the proof strip grounded in shipped evidence instead of placeholder quotes.

## Verification
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- docs/ctr-research-notes.md docs/design-research.md`

## Results
- Diff check passed with no whitespace or patch-format issues.
- The separate live pricing verifier still reports production-side `/agora` copy drift, but that surface was not modified by this docs-only task.

## Task
- `7e1f8f1b-7a62-4fc0-931f-5613379f6a4b` - Tighten the guided quiz page copy around decision clarity and council routing

## Changed Files
- `website/src/app/quiz/page.tsx`
- `website/src/app/quiz/page.test.ts`
- `website/src/app/quiz/quiz-routing.test.ts`

## What Changed
- Added a decision-clarity intro shell above the quiz flow that explains the guided path in plain language and routes users toward the right council shape before they enter the questionnaire.
- Introduced a compact route-guide panel that surfaces the decision-type clusters and their best-fit council names, so the page now hints at where each guided path leads.
- Exported the page copy constants and locked them in the page contract test so the decision-first messaging and routing hints stay stable.
- Updated the quiz page/flow regression test to account for the new intro shell while still asserting that the live framework catalog reaches the `QuizFlow` child component.

## Verification
- `cd website && ./node_modules/.bin/vitest run src/app/quiz/page.test.ts src/app/quiz/quiz-routing.test.ts`
- `cd website && ./node_modules/.bin/eslint src/app/quiz/page.tsx src/app/quiz/page.test.ts src/app/quiz/quiz-routing.test.ts`
- `cd website && npm run coverage -- --coverage.include=src/app/quiz/page.tsx src/app/quiz/page.test.ts src/app/quiz/quiz-routing.test.ts`

## Results
- Targeted quiz tests passed: `13 tests passed`.
- ESLint passed on the touched quiz files.
- Scoped coverage run passed with `100%` statements, `100%` branches, `100%` functions, and `100%` lines for the included quiz page surface.

## Task
- `29b38765-bf1a-42fa-864b-2fa982019ebd` - Tighten transcript share button affordance on public agon pages

## Changed Files
- `website/src/app/agora/a/[id]/page.tsx`
- `website/src/app/agora/a/[id]/page.test.tsx`
- `website/src/components/agora/PublicTranscriptShareButton.tsx`
- `website/src/components/agora/PublicTranscriptShareButton.test.tsx`
- `docs/runbooks/public-agora-share-page-smoke.md`

## What Changed
- Replaced the public share-page footer link with a client copy button that reads `Copy transcript link`, shows `Copying…` / `Copied ✓`, and includes a short helper line that makes the copy action explicit.
- Kept the page’s share-loop attribution intact by preserving the public transcript URL and the existing `Begin your own agon` CTA flow.
- Updated the public share-page regression test to lock the new button copy, helper text, and CTA wrapper attributes.
- Added a focused component test suite for the new client button, including success, missing-clipboard, missing-navigator, rejection, and in-flight guard branches so the component reaches full scoped coverage.
- Refreshed the public share-page smoke runbook so the documented affordance matches the shipped UI.

## Verification
- `cd website && ./node_modules/.bin/vitest run 'src/components/agora/PublicTranscriptShareButton.test.tsx' 'src/app/agora/a/[id]/page.test.tsx'`
- `cd website && ./node_modules/.bin/eslint src/components/agora/PublicTranscriptShareButton.tsx src/components/agora/PublicTranscriptShareButton.test.tsx 'src/app/agora/a/[id]/page.tsx' 'src/app/agora/a/[id]/page.test.tsx'`
- `cd website && ./node_modules/.bin/vitest run --coverage --config <temporary scoped config> 'src/components/agora/PublicTranscriptShareButton.test.tsx'`

## Results
- Targeted regression specs passed: `17 tests passed`.
- ESLint passed on the touched TSX files.
- Scoped coverage for `src/components/agora/PublicTranscriptShareButton.tsx` passed at `100%` statements, `100%` branches, `100%` functions, and `100%` lines.

## Task
- `f314d601-731b-4970-8c38-358fa350dc02` - Refresh phase-1 framework-forge status to match live validation work

## Changed Files
- `docs/plans/2026-04-01-phase1-framework-forge.md`

## What Changed
- Rewrote the phase-1 status callout to remove the stale "all tasks complete" claim.
- Kept the completed Framework Forge core work and three-tier validation result intact, while explicitly noting that validation-related follow-ups still remain active on the live task board.
- Clarified that the checkboxes reflect the original phase scope, not a closed backlog state, so the plan now matches the current board posture.

## Verification
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff -- docs/plans/2026-04-01-phase1-framework-forge.md`
- `sed -n '1,12p' /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/plans/2026-04-01-phase1-framework-forge.md`

## Results
- The plan header now says core work is complete but validation follow-ups remain active, which aligns with the open validation tasks still on the board.

## Task
- `0e94a68a-b579-4a6e-aaab-a9a85325aa7d` - Add batch 7 decision entries to the canonical registry

## Changed Files
- `website/content/decisions.ts`
- `website/src/app/decisions/[slug]/page.test.tsx`

## What Changed
- Added the batch-7 decision registry entries for Product Hunt, free tier, and rebrand so the shared `/decisions` surface can resolve the new slugs.
- Kept the metadata aligned with the existing shipped-decision pattern: titles, SEO queries, council slugs, hooks, and target keywords now match the new public pages and promo drafts.
- Extended the decisions route test to assert the three new slugs are included in `generateStaticParams`, giving the route a direct regression check for the expanded registry.

## Verification
- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website coverage -- '--coverage.include=content/decisions.ts' '--coverage.include=src/app/decisions/[slug]/page.tsx' 'src/app/decisions/[slug]/page.test.tsx'`

## Results
- Targeted Vitest coverage passed with `100%` statements, `100%` branches, `100%` functions, and `100%` lines for the touched surface.

## Previous Entries

## Task
- Promote guided quiz entry in the global header
- Reconcile the pricing smoke runbook with the shipped verifier CLI
- Refresh the release-note index for the latest shipped wave

## Changed Files
- `website/src/components/Header.tsx`
- `website/src/components/__tests__/Header.test.tsx`
- `docs/runbooks/funnel-surface-rollout.md`
- `docs/runbooks/pricing-copy-smoke-runbook.md`
- `docs/release-notes/index.md`

## What Changed
- Promoted the guided quiz CTA to the primary filled button in the shared header, while keeping an explicit Agora fallback button in the right-hand cluster.
- Updated the header contract tests so they lock the new `/quiz?entry=guided` CTA path and accessibility label instead of the old tracked header URL.
- Rewrote the funnel rollout runbook to describe the current header hierarchy and verify the direct guided quiz path.
- Replaced the stale pricing-runbook note with the shipped `npm run verify:pricing-contract` entrypoint and preserved the manual curl checks as a fallback.
- Added a short release-note index pointer to the latest shipped wave so the promotion queue reads cleanly.

## Verification
- `npm run coverage` in `website`
- `npm run verify:pricing-contract -- --base-url https://www.consultthedead.com`

## Results
- Website coverage passed: `142 test files`, `1986 tests`, `99.58% statements`, `98.48% branches`, `100% functions`, `99.84% lines`.
- Pricing verifier failed against the live site with 9 drift checks, including missing `/pricing` copy and `/agora` upsell strings that the runbook now points operators toward.

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
