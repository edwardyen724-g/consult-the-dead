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
