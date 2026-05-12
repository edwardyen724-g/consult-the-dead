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
- `bb8e26dd-c311-4c86-b400-4e7c0b1dee62` - Expose the pricing contract verifier as a root npm script

## Changed Files
- `package.json`
- `docs/runbooks/pricing-copy-smoke-runbook.md`

## What Changed
- Added a root-level `verify:pricing-contract` npm script that runs `scripts/pricing-contract-verifier.ts` from the repository root.
- Updated the pricing smoke runbook to point at the new root script instead of the old future-script placeholder.

## Verification
- `npm run verify:pricing-contract -- --help`

## Results
- Root script resolved correctly and printed the verifier usage text from the repo root.

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

## Task
- `588de3c9-7b4c-4688-9ddf-b5b5cc895e9d` - Add regression coverage for homepage hero clarity and first-scroll demo

## Changed Files
- `website/src/app/page.test.tsx`

## What Changed
- Added a regression test that locks the decision-clarity hero copy in place by asserting the homepage still renders the `Clarity before commitment`, `Bring the decision into focus.`, and `History has a council.` copy.
- Added an order assertion that keeps the first-scroll demo section after the clarity copy, so the homepage preserves the intended first-screen sequence.

## Verification
- `npm run --prefix website coverage -- src/app/page.test.tsx`
- `npm run --prefix website coverage -- --coverage.include src/app/page.tsx src/app/page.test.tsx`

## Results
- The repo-wide coverage run passed the tests but failed the global coverage threshold because unrelated website files are below 95%.
- The narrowed homepage coverage run passed with `100%` statements, `100%` branches, `100%` functions, and `100%` lines.

## Task
- `40e779ce-e254-45e8-bf5e-b5d57899634b` - Add regression coverage for decisions batch 7 metadata and CTA attribution

# `7056f46f-6a16-43dd-88ba-1a3338c75dc1` - Refresh roster expansion notes for the shipped decision surface

## Changed Files
- `docs/roster-expansion.md`
- `output/change-summary.md`

## What Changed
- Rewrote the roster research introduction so it is explicitly anchored to the shipped decision surface instead of the older pre-launch research snapshot.
- Updated the roster status block to reflect the current 26-framework live roster, the hidden Einstein hold, the 24 shipped decision pages, and the four remaining stubs.
- Replaced the generic candidate list with a frequency-ranked priority queue based on the live decision registry, so the next extraction wave starts from the figures the product actually uses most.
- Reframed the long-form shortlist below as historical background notes rather than the active ordering signal.

## Verification
- `node` script verifying 24 shipped decision pages, 26 live allowed slugs, and the top council frequency counts from `website/content/decisions.ts` and `website/src/lib/frameworks.ts`

## Results
- Verification passed: 24 shipped decision pages, 26 live allowed slugs, and the expected top council counts (`niccolo-machiavelli` 19, `marcus-aurelius` 13, `marie-curie` 10, `john-d-rockefeller` 6, `sun-tzu` 6, `benjamin-franklin` 5, `steve-jobs` 3).

## Changed Files
- None

## What Changed
- No code changes were kept. The requested batch-7 slugs (`should-i-launch-on-product-hunt`, `should-i-offer-a-free-tier`, `should-i-rebrand`) are not present in the current shared decisions registry yet.
- The task dependency `8f3c0e9e` explicitly says to wait for the shared decisions surface capsule `31655332` to clear before starting duplicate route work, so the regression patch was reverted.

## Verification
- `wanman task get 8f3c0e9e`
- `wanman task get 40e779ce`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff -- website/src/app/decisions/'[slug]'/page.test.tsx`

## Results
- The dependency check confirmed the task is blocked upstream.
- The route diff is clean after reverting the speculative edits.

## Task
- `786004cc-dda5-46e2-ae71-a2ed4ca410a4` - Converge /account with the publication-system rhythm

## Changed Files
- `website/src/app/account/page.tsx`
- `website/src/app/account/page.test.tsx`
- `website/vitest.config.ts`
- `output/change-summary.md`

## What Changed
- Tightened `/account` into the shared publication cadence by splitting the subscription surface into a denser two-column plan/CTA panel with a primary upgrade/manage action and a secondary pricing link for free users.
- Reworked the quota section into a compact status panel with an explicit quota label, current remaining summary, and a tracked progress bar so usage reads like the rest of the publication system.
- Kept the API key section in place but left it lower in the hierarchy, so subscription and usage controls now carry the page.
- Added scoped coverage for the new account branches and included `/account` in the Vitest coverage include list so the changed page is measured directly.

## Verification
- `npm run --prefix website test -- src/app/account/page.test.tsx`
- `npm run --prefix website coverage -- src/app/account/page.test.tsx`
- `npm run --prefix website lint -- src/app/account/page.tsx src/app/account/page.test.tsx vitest.config.ts`

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
