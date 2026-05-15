## Task
- `4fc76788-26ca-447f-946b-6aed3c3e56c8` - Draft a daily reel/content ops checklist for morning execution
- `2fcdf79e-e38b-4108-918d-115c5ff5b570` - Define the reel analytics summary template and review cadence

## Changed Files
- `docs/runbooks/index.md`
- `docs/runbooks/daily-reel-ops-checklist.md`
- `docs/runbooks/reel-analytics-summary-template.md`
- `website/src/app/feed.xml/route.test.ts`
- `website/src/app/sitemap.test.ts`

## What Changed
- Added a new Reels section to the runbooks index and linked the two Phase 5 morning-execution runbooks from it.
- Wrote a concise daily checklist for Edward that covers the reel, content, and release handoff before the workday starts.
- Wrote a Phase 5 reel analytics summary template with the per-reel fields to capture and a repeatable daily/weekly review cadence.
- Tightened the RSS feed route regression to assert the current debate, insight, and decision item counts instead of only comparing XML output.
- Tightened the sitemap regression to assert the current framework, insight, mind, listicle, and decision inventories and the full published route count.

## Verification
- `./node_modules/.bin/vitest run src/app/feed.xml/route.test.ts src/app/sitemap.test.ts src/lib/rss-feed.test.ts`
- `./node_modules/.bin/vitest run --coverage`

## Results
- Targeted feed and sitemap suites passed: `20 tests passed`.
- Full website coverage passed at `99.59%` statements, `98.28%` branches, `100%` functions, and `99.85%` lines.

## Task
- `0134fcb9-8127-4bf8-a422-88b1e9068baf` - Tighten /pricing publication rhythm to match /account and /library

## Changed Files
- `website/src/app/pricing/PricingClient.tsx`
- `website/src/app/pricing/page.test.tsx`

## What Changed
- Wrapped the pricing surface in the shared publication shell so the eyebrow, hero, lead, and footer CTAs now read like the account and library publication surfaces.
- Kept the canonical pricing copy, live stats row, tier cards, billing toggle, checkout CTA, and proof sections intact while moving the page onto the shared shell rhythm.
- Added a regression test that locks the shared footer links to `/agora` and `/library` alongside the existing pricing-copy assertions.

## Verification
- `node_modules/.bin/vitest run src/app/pricing/page.test.tsx --coverage`
- `node_modules/.bin/vitest run --coverage`
- `node_modules/.bin/eslint src/app/pricing/PricingClient.tsx src/app/pricing/page.test.tsx`

## Results
- Targeted pricing tests passed: `31 tests passed`.
- Full website coverage passed at `99.59%` statements, `98.28%` branches, `100%` functions, and `99.85%` lines.
- ESLint passed on the two edited pricing files.

## Task
- `f9ebca6a-d80e-4e2e-8df1-25a751c47e5a` - Refresh docs/framework-forge-quickstart.md for current validate CLI and artifact layout

## Changed Files
- `docs/framework-forge-quickstart.md`

## What Changed
- Updated the validate command row so it matches the current CLI behavior: `tier1` and `full` write `tier1_results.json`, `tier2` and `full` write `tier2_results.json`, `full` writes `tier3_materials/review_packet.json`, and `floor-check` is console-only.
- Removed the stale `floor-check_results.json` artifact from the filesystem layout tree and clarified that floor-check does not persist a JSON result.

## Verification
- `git diff --check -- docs/framework-forge-quickstart.md`

## Results
- Quickstart now matches the current `framework_forge/cli.py` validate flow and artifact layout.

## Task
- `e703f527-92eb-456f-8a73-a3c399aedf35` - Reconcile docs/retention-email-sequence.md with the current retention-email cron routes

## Changed Files
- `docs/retention-email-sequence.md`

## What Changed
- Renamed the current cron surfaces in the sequence table to `Day 2 Nudge` and `Weekly Digest`.
- Replaced the stale `/api/cron/retention-emails/nudge` and `/api/cron/retention-emails/digest` paths with the active `/api/cron/day2-nudge` and `/api/cron/weekly-digest` routes.

## Verification
- `git diff --check -- docs/retention-email-sequence.md`

## Results
- The retention-email sequence doc now names the current cron route surfaces instead of the old nested aliases.

## Task
- `76fd94cf-3e95-4775-b596-b7b5e4e7f7ae` - Align sitemap and RSS feed inventories with the current published route counts

## Changed Files
- `website/src/app/sitemap.test.ts`
- `website/src/app/feed.xml/route.test.ts`
- `website/src/lib/rss-feed.ts`

## What Changed
- Updated the sitemap test to assert the current 10-listicle inventory instead of the stale 5-listicle snapshot, and verified the emitted listicle URLs match the canonical slug order.
- Reworded the RSS feed metadata so both the title and description now describe the actual feed inventory: debates, insights, and decisions.
- Renamed the feed route regression test to cover the current debate/insight/decision feed surface.

## Verification
- `npm run --prefix website test -- src/app/sitemap.test.ts src/app/feed.xml/route.test.ts src/lib/rss-feed.test.ts src/lib/sitemap-data.test.ts`
- `npm run --prefix website coverage`

## Results
- Targeted sitemap/feed tests passed: `43 tests passed`.
- Full website coverage passed at `99.59%` statements, `98.28%` branches, `100%` functions, and `99.85%` lines.

## Task
- `69f4c5d7-e1e6-41f7-bd32-e5eb22740f42` - Audit outreach debate files against the launch checklist

## Changed Files
- `docs/outreach-debates/LAUNCH_CHECKLIST.md`

## What Changed
- Recorded the outreach debate audit result in the launch checklist and updated the audit table to show all 30 debate files passed.
- Added a short summary noting that the 30-file audit completed cleanly with no placeholders, missing rounds, or consensus gaps.

## Verification
- `node` audit script against all 30 `docs/outreach-debates/*.md` files for frontmatter, 3 rounds, consensus sections, recommended-action length, footers, and placeholders
- `git diff --check -- docs/outreach-debates/LAUNCH_CHECKLIST.md output/change-summary.md`

## Results
- All 30 debate files passed the launch checklist audit.
- The updated checklist now serves as the durable audit record for the outreach launch gate.

## Task
- `6334b471-2186-4c4d-83c4-dd5b814a5447` - Align reel duration assertions with the post-fix 30-80s gate

## Changed Files
- `scripts/reel-scripts/render-reel.py`
- `scripts/reel-scripts/synthesize-voice.py`
- `scripts/reel-scripts/tests/test_render_reel.py`
- `tests/test_synthesize_voice.py`

## What Changed
- Updated the reel timing-plan and dry-run output strings to advertise the post-fix `30–80s` target range instead of the stale `25–40s` gate.
- Aligned the corresponding test assertions so both Python suites now validate the same 30–80 second contract.

## Verification
- `wcx pytest /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/scripts/reel-scripts/tests/test_render_reel.py /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/tests/test_synthesize_voice.py`
- `rg -n "25–40s|25-40s|25–40|25-40" /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/scripts/reel-scripts /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/tests`

## Results
- Targeted reel test suites passed: `150 passed, 11 skipped`.
- No remaining 25–40 gate strings were found under the touched reel script and test paths.

## Task
- `a1cdf39c-9119-4387-9431-0e87e0c996e9` - Seed Wave 27 topic queue in topics.yaml with 8-10 new entries for next content batch

## Changed Files
- `topics.yaml`

## What Changed
- Added eight new Wave 27 queued topics: four collision articles and four decision pages.
- Kept the queue format consistent with the existing shipped and queued entries, including collision `framework_slugs`/`decisionType` pairs and decision `recommended_council` arrays.

## Verification
- `git diff --check -- topics.yaml`
- `rg -n` checks for each new slug in `topics.yaml`

## Results
- The queue now has eight additional founder-relevant entries with no duplicate slugs.
- The file passes diff-format sanity checks.

## Task
- `f6f6ae73-c333-4555-8e8b-0ef4e1c4aba1` - Update CHANGELOG and README for Wave 25, Wave 26 (Joan of Arc 30th mind, Aristotle docs)

## Changed Files
- `README.md`
- `CHANGELOG.md`

## What Changed
- Updated the README route table to reflect the current shipped counts: 30 `/minds/[id]` pages and 86 `/decisions` pages.
- Added the Wave 25, Joan of Arc, and Aristotle merge notes to the changelog, including the current reel-test totals and the corrected decision-page total.

## Verification
- `node` sanity check against `website/src/lib/frameworks.ts` and `website/content/decisions.ts` for live mind and decision counts
- `git diff --check -- README.md CHANGELOG.md`

## Results
- README counts now match the live roster and decision registry.
- Changelog entry now matches the repo’s current shipped state.

## Blockers
- The separate F5-TTS pilot synthesis task `433dcb47-b927-49c6-a3ff-968bd1ff4e4d` has no capsule yet, so it cannot be executed safely inside the allowed-path workflow until CEO links or creates one.

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

## Task
- `3dad068d-f4a1-4f26-89e4-a20afaa4ae47` - Seed Wave 29 topic queue in topics.yaml with 8-10 new entries for the next content batch

## Changed Files
- `topics.yaml`

## What Changed
- Added a new Wave 29 seed section at the end of the topic queue with nine queued entries.
- Included four collision topics and five decision topics, keeping the same YAML shape used by earlier wave seeds.

## Verification
- `ruby -e 'require "yaml"; YAML.load_file("/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/topics.yaml"); puts "YAML_OK"'`
- `git -C /Users/haotingyen/projects/consult-the-dead/.wanman/worktree diff -- topics.yaml`

## Results
- `topics.yaml` parses cleanly.
- The queue now has nine additional Wave 29 entries ready for the next content batch.

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

## Task
- `3ace91b2-c847-4bbb-9e6c-8afe40c967d4` - Reconcile pre-deployment checklist with actual npm scripts and branch-coverage gate language

## Files Changed
- `docs/pre-deployment-checklist.md`

## What Changed
- Replaced the stale `npm run coverage` checklist item with the real `npm run test` verification step in `website/`, and clarified that `npm run build` is also run from `website/`.
- Reworded the sign-off gate to match the branch-coverage policy: branch coverage, not statement coverage, is the approval gate, and any exception must be recorded in the branch-coverage exception registry and linked in the PR.

## Verification
- `git diff --check -- docs/pre-deployment-checklist.md`
- `git diff -- docs/pre-deployment-checklist.md`

## Results
- The checklist now points at executable npm entrypoints and uses the current branch-coverage release-gate language.

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

---

## Task
- Reconcile README and content pipeline counts with the current release state.

## Files Changed
- `README.md`
- `CONTENT_PIPELINE.md`

## What Changed
- Confirmed the root README route table already reflects the live `/minds/[id]` and `/decisions` counts.
- Updated the topic queue snapshot in `CONTENT_PIPELINE.md` to the current `topics.yaml` totals: 226 tracked, 203 shipped, 4 killed, 19 queued.

## Verification
- `rg -n "Index of all 86 published decision pages|226 topics tracked|203 shipped \\(86 decisions \\+ 106 insights/collisions \\+ 9 method articles \\+ 2 other articles\\)" README.md CONTENT_PIPELINE.md`
- `git diff -- README.md CONTENT_PIPELINE.md`

## Result
- The docs now match the current release-state counts.

## Task
- `20d446c2-ae3a-4300-a215-f39b14672e43` - Reconcile release-state docs after pricing preview metadata gate clears

## Changed Files
- `docs/design-research.md`
- `docs/release-notes/2026-05-12-vercel-preview-rate-limit.md`
- `docs/release-notes/index.md`
- `docs/pre-deployment-checklist.md`

## What Changed
- Marked the pricing preview metadata/release-note lane as promoted in design-research and removed the stale unblock candidate from the ranked next-batch list.
- Added a resolved-status note to the Vercel PR preview rate-limit release note so it records the 2026-05-15 redeploy and pricing metadata verification closure.
- Promoted that release note in the release-state index with a 2026-05-15 entry and no pending unblock items.
- Tightened the pre-deployment checklist language so the release-note step must match the promoted index state and stale release-state follow-ups are called out explicitly.

## Verification
- `git diff --check -- docs/design-research.md docs/release-notes/2026-05-12-vercel-preview-rate-limit.md docs/release-notes/index.md docs/pre-deployment-checklist.md`
- `rg -n "bb399f47|Unblock the pricing preview metadata gate|release-note follow-ups should stay behind it|stale unblock" docs/design-research.md docs/release-notes docs/pre-deployment-checklist.md`

## Result
- The stale pricing gate reference is gone from the design-research backlog.
- The release note now records the 2026-05-15 resolution and the index shows the promoted state.
- The checklist now mirrors the promoted release-state workflow and calls out stale follow-ups explicitly.

## Task
- `02dca2f4-9506-42f3-875d-7303bcfda408` - Implement Search Console indexing submitter for generated article drafts

## Changed Files
- `scripts/content-pipeline/generate-article-drafts.ts`
- `scripts/content-pipeline/article-pipeline.test.ts`

## What Changed
- Added a real Search Console/Indexing API submitter that posts the generated `URL_UPDATED` payload to `https://indexing.googleapis.com/v3/urlNotifications:publish` with a bearer token.
- Kept dry-run behavior intact by only submitting in non-dry-run mode, while preserving artifact generation and the existing payload file output.
- Added test coverage for env-token resolution, the submitter request shape, non-dry-run submission, and dry-run suppression.

## Verification
- `npx vitest run scripts/content-pipeline/article-pipeline.test.ts`
- `npx vitest run scripts/content-pipeline/article-pipeline.test.ts --coverage` (blocked: missing `@vitest/coverage-v8`)

## Result
- Targeted article-pipeline tests passed: `13 tests passed`.
- Coverage could not run in this checkout because the V8 coverage provider is not installed.

---

## Task
- `9802556c-2e01-40f6-920a-7fd21512faca` - Build reel post-scheduler for approved MP4s
- `5271d7aa-2765-4c28-a373-7104998c4842` - Add Instagram post-scheduler retry and throughput config
- `759999a5-098d-4c50-bb71-b34a68ce6289` - Write Instagram scheduler failure-mode runbook
- `9b0d4e3a-d5fc-4662-a1b6-f80100a70a48` - Draft a release note for the phase 4 reel gate update

## Files Changed
- `scripts/instagram/upload_reel.py`
- `scripts/instagram/post_scheduler.py`
- `scripts/instagram/scheduler_config.py`
- `tests/scripts/instagram/test_post_scheduler.py`
- `tests/scripts/instagram/test_scheduler_config.py`
- `docs/runbooks/instagram-scheduler-runbook.md`
- `docs/release-notes/2026-05-15-phase4-reel-gate.md`

## What Changed
- Added a 429-aware rate-limit signal to the Instagram upload helper so the scheduler can respect `Retry-After` and stop safely on rate limits.
- Added a cron-backed reel post scheduler that scans approved MP4s in `output/reels/`, builds public reel URLs, publishes through the existing Instagram upload path, and persists posted/failed records with duplicate-post protection.
- Added a dedicated scheduler config surface for the cron expression, daily post cap, and 429 backoff settings.
- Documented the scheduler contract, 429 handling, duplicate protection, and manual recovery steps in a new runbook.
- Drafted the phase-4 reel gate release note for the corrected duration formula and the handoff to F5-TTS synthesis.

## Verification
- `wcx pytest tests/scripts/instagram/test_scheduler_config.py tests/scripts/instagram/test_post_scheduler.py`
- `wcx pytest scripts/instagram/tests/test_upload_reel.py tests/scripts/instagram/test_scheduler_config.py tests/scripts/instagram/test_post_scheduler.py --cov=scripts.instagram --cov-report=term-missing`

## Result
- Targeted scheduler/upload tests passed: `52 passed`.
- Coverage for the touched scheduler/config modules reached `100%`; `scripts/instagram/upload_reel.py` reached `96%` overall coverage in the targeted package report.
