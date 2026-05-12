# Change Summary

Task: `7b9cd392-539a-4b39-9a5e-814572ba8adc`
Capsule: `a52f2d0e-148f-4e5c-a53d-1e6ac5d41579`

## Files Changed

- `website/src/app/api/cron/retention-emails/digest/route.ts`
- `website/src/app/api/cron/retention-emails/digest/route.test.ts`
- `docs/runbooks/retention-email-cron.md`

## What Changed

- Promoted the digest dry-run featured metadata into a named deterministic smoke fallback so missing `FEATURED_AGON_*` values still produce a stable dry-run summary.
- Kept production behavior fail-closed: the digest route still returns HTTP 500 when required featured metadata is missing outside dry-run mode.
- Documented the dry-run contract in the retention-email cron runbook, including the smoke fallback behavior and the production failure mode.

## Verification

- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website test -- --run src/app/api/cron/retention-emails/digest/route.test.ts`
- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website lint -- src/app/api/cron/retention-emails/digest/route.ts src/app/api/cron/retention-emails/digest/route.test.ts`


Task: `1ca9f6be-4d89-42c5-a98d-6bab2ae07c7f`
Capsule: `none`

## Files Changed

- `docs/plans/2026-04-01-phase1-framework-forge.md`
- `docs/framework-forge-quickstart.md`

## What Changed

- Trimmed the Phase 1 Framework Forge CLI handoff so it points directly at the quickstart for current package CLI usage.
- Reworded the quickstart drift note so it is the canonical source of truth and no longer describes the phase plan as if it still carries the old single-file command examples.

## Verification

- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- docs/plans/2026-04-01-phase1-framework-forge.md docs/framework-forge-quickstart.md`
- `sed -n '3018,3024p' /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/plans/2026-04-01-phase1-framework-forge.md`
- `sed -n '91,97p' /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/framework-forge-quickstart.md`

## Results

- Markdown whitespace checks passed.
- The phase plan now defers to the quickstart for CLI usage, and the quickstart now clearly states it is the canonical usage reference.

Task: `e94dbc35-b2b1-4664-92d8-31a8a8353cd0`
Capsule: `none`

## Files Changed

- `CONTENT_PIPELINE.md`
- `MARKETING_STRATEGY.md`

## What Changed

- Added explicit references from the content pipeline and GTM strategy docs to the canonical Phase 2 marketing rollout handoff at `docs/plans/2026-05-12-phase2-marketing-rollout.md`.
- Kept the existing content-engine and Instagram phase summaries intact, but made them defer to the canonical handoff for the Wave 1 follow-up timing, Instagram setup, Edward voice reference, and first 5 Verdict Reels.

## Verification

- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- CONTENT_PIPELINE.md MARKETING_STRATEGY.md`
- `rg -n "canonical Phase 2 rollout handoff|operator-facing Phase 2 rollout handoff|docs/plans/2026-05-12-phase2-marketing-rollout.md" CONTENT_PIPELINE.md MARKETING_STRATEGY.md docs/plans/2026-05-12-phase2-marketing-rollout.md`

## Results

- Markdown whitespace checks passed for the touched docs.
- Both strategy docs now point at the same canonical Phase 2 handoff, so future rollout edits can land in one place.

Task: `e265b579-bc5c-4ac2-8cf4-cc44d3dfc0a1` / `51b7103a-46fd-458c-a330-e71c9bd16fba`
Capsule: `none`

## Files Changed

- `docs/plans/2026-05-12-phase2-marketing-rollout.md`
- `docs/pricing.md`

## What Changed

- Added a canonical Phase 2 marketing rollout handoff that consolidates the Wave 1 follow-up timing, Instagram setup, Edward voice reference, and first 5 Verdict Reels into one release-batch plan.
- Reconciled the pricing canonical reference with the live `/pricing` surface by tightening the free-tier account wording, BYO-key header handling, annual billing copy, and external quote guidance.

## Verification

- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- docs/plans/2026-05-12-phase2-marketing-rollout.md docs/pricing.md output/change-summary.md`
- `rg -n "Open, anonymous, no card required|x-api-key|$25/mo annual|Billed $300/year|founding-member pricing at $300/year|Wave 1 follow-up|Verdict Reels" /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/plans/2026-05-12-phase2-marketing-rollout.md /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/pricing.md`

## Results

- The new handoff doc captures the active Phase 2 marketing stream in a single canonical plan.
- The pricing reference now mirrors the current live surface language more closely without changing the implementation.

# Change Summary

Task: `457e7555-c8d8-42d7-80be-60ece7dca53d`
Capsule: `none`

## Files Changed

- `README.md`
- `website/README.md`
- `website/src/app/frameworks/page.tsx`
- `website/src/app/frameworks/opengraph-image.tsx`

## What Changed

- Reconciled the root and website route inventories with the current public surface.
- Added explicit counts for the main collection routes: 26 frameworks, 25 minds, 78 debates, 24 decisions, 22 insights, and 5 listicles.
- Updated the `/frameworks` page metadata and Open Graph copy so the live route description matches the same 26-framework count now documented in the READMEs.

## Verification

- `find /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/data/frameworks -mindepth 1 -maxdepth 1 -type d | wc -l`
- `find /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/data/minds -name '*.json' | wc -l`
- `find /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/content/debates -name '*.md' | wc -l`
- `rg -n '^\\s*slug:\\s*\"' /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/content/decisions.ts | wc -l`
- `rg -n '^\\s*slug:\\s*\"' /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/src/lib/insights.ts | wc -l`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff --check -- README.md website/README.md website/src/app/frameworks/page.tsx website/src/app/frameworks/opengraph-image.tsx`

## Results

- Verified counts: 26 frameworks, 25 minds, 78 debates, 24 decisions, and 22 insights.
- The touched files passed `git diff --check`; the repo-wide `diff --check` still reports unrelated trailing whitespace in pre-existing files outside this task scope.

# Change Summary

Task: `d43cf3c6-b241-4a30-a0e5-da3ea6ff874e`
Capsule: `none`

## Files Changed

- `docs/design-research.md`
- `docs/ctr-research-notes.md`

## What Changed

- Rewrote the homepage hero research notes to treat the first-scroll consensus preview as shipped instead of an open PR.
- Removed stale merge-watch framing from the ranked design and CTR research so both docs now describe the homepage hero as a shipped baseline with measurement and micro-polish remaining.
- Kept the rest of the design system and publication-surface guidance intact.

## Verification

- `rg -n "open PR|open-PR|pending PR|not yet on master|first-scroll demo preview|wanman/homepage-hero-decision-first" /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/design-research.md /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/docs/ctr-research-notes.md`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff -- docs/design-research.md docs/ctr-research-notes.md`

## Results

- The grep returned no remaining stale open-PR phrasing in the two research docs.
- The diff shows only the expected documentation updates.

# Change Summary

Task: `e2cbdf7d-d135-47d6-a16d-478a61f2461b`
Capsule: `c79c635e`

## Files Changed

- `scripts/content-pipeline/article-pipeline.test.ts`
- `topics.yaml`

## What Changed

- Added regression coverage that ties the batch-2 insight registry entries to their shipped metadata and annotation blueprints.
- Locked the shipped insight slugs in `topics.yaml` to `status: shipped` with `shipped_at: 2026-05-12` so the content pipeline cannot drift from the published queue.
- Kept the assertions focused on the four batch-2 insight slugs plus the Marcus Aurelius burnout entry that was already shipped alongside them.

## Verification

- `wcx npm run --prefix website test -- src/lib/__tests__/insight-registry.test.ts src/lib/__tests__/wwx-batch1-articles.test.ts 'src/app/insights/[slug]/annotation-layer.test.ts' 'src/app/insights/[slug]/page.test.tsx' src/app/feed.xml/route.test.ts`
- `wcx npx vitest run --config website/vitest.config.ts scripts/content-pipeline/article-pipeline.test.ts`

## Results

- Website regression suites: 5 files passed, 69 tests passed.
- Content-pipeline regression suite: 1 file passed, 13 tests passed.

Task: `45933cf4-3096-4db7-a526-4e976c5f1941`
Capsule: `53468cb4-e056-4ed4-91f0-83bd5282b332`

## Files Changed

- `website/src/app/api/ingest/pageview/route.test.ts`

## What Changed

- Switched the pageview ingest regression suite to the shared `ALLOWED_AGORA_PRODUCTION_ORIGINS` list so the route test stays aligned with the central allowlist helper.
- Added hostile-origin coverage for a spoofed consultthedead domain, an insecure consultthedead origin, a null origin, and an unrelated malicious origin.

## Verification

- `npm --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website run test -- src/app/api/ingest/pageview/route.test.ts`
- `npm --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website run coverage -- src/app/api/ingest/pageview/route.test.ts`

## Notes

- The focused test file passes.
- The repo-wide coverage gate excludes `*.test.ts` files, so the standard coverage script reports a threshold failure even though the regression suite itself is green.

# Change Summary

Task: `c8fbc235-7478-4be3-8ff8-19545ee5c2d2`
Capsule: `c5dec73e`

## Files Changed

- `website/src/app/worked-example.tsx`
- `website/src/app/worked-example.motion.test.tsx`

## What Changed

- Initialized the worked example from the reduced-motion terminal state before any autoplay wiring can run.
- Skipped the IntersectionObserver autoplay setup and the `run()` path when `prefers-reduced-motion: reduce` is active.
- Added a jsdom regression test that confirms reduced-motion users land directly on the finished consensus surface while motion-allowed users still wire up autoplay.

## Verification

- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website test -- src/app/worked-example.motion.test.tsx src/app/worked-example.test.ts src/app/worked-example.regression.test.ts`
- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website coverage`

# Change Summary

Task: `65ea897c-3bca-4b40-95f2-061579cdde18`
Capsule: `c1381d5c`

## Files Changed

- `scripts/content-pipeline/article-pipeline.test.ts`

## What Changed

- Repointed the batch-2 article-pipeline regression coverage at the current shipped insight priorities.
- Replaced the cwd-sensitive framework lookup with a repo-root fixture loader so the annotation assertions stay stable if the queue is reordered or pruned.
- Kept the shipped-topic assertions focused on the current published slugs and their shipped dates.

## Verification

- `wcx /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/node_modules/.bin/vitest run --config /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/vitest.config.ts scripts/content-pipeline/article-pipeline.test.ts`

## Notes

- A coverage-enabled run of the same focused file hits the repo-wide coverage thresholds because this script test sits outside the website config's include list. The test itself passes; the coverage gate is a config boundary, not a behavior failure.

# Change Summary

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

---

# Change Summary

Task: `ddb92e0c-9fa1-4248-aa17-2d6d5d7d43ae`
Capsule: `7cffad97-a433-4ddf-aedb-c49776c3428f`

## Files Changed

- `docs/release-notes/2026-05-12-vercel-preview-rate-limit.md`
- `docs/environment-variables.md`
- `docs/release-notes/index.md`

## What Changed

- Tightened the Vercel preview blocker guidance in the environment-variable reference so it points to the verified release-state note and keeps the failure classified as a Vercel quota issue, not an application regression.
- Published the release-state note for the verified Vercel preview quota failure and linked it from the release-note index.
- Reworded the promoted release-state index entry to match that same blocker status and unblock path: preview failure, CI passing independently, and the 24-hour reset or plan upgrade as the remedy.

## Verification

- `git diff --check -- docs/environment-variables.md docs/release-notes/index.md`
- `sed -n '165,195p' docs/environment-variables.md`
- `sed -n '10,25p' docs/release-notes/index.md`

## Notes

- No code changes were required; this task only tightened release-state documentation wording.

---

# Change Summary

Task: `9b0dd059-3f39-464f-bb9f-735350316794`
Capsule: `cd7b822e-0e2a-4774-8c77-4a58c12e7cb3`

## Files Changed

- `website/src/app/page.test.tsx`

## What Changed

- Added a regression assertion that locks the exact first-scroll consensus excerpt copy rendered inside the homepage hero preview.
- Kept the existing placement checks that ensure the hero preview stays above the streaming demo and packs section so the first-viewport contract cannot drift.

## Verification

- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website test -- src/app/page.test.tsx`
- `npm run --prefix /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website coverage -- src/app/page.test.tsx` (passes the tests, but fails the repo-wide 95% coverage gate because the run only exercises one focused file)
