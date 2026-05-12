# Change Summary

Task: `59106ea8-1ff5-4357-84d6-aea9898c4941`
Branch: `wanman/sync-quiz-routing-matrix`
Capsule: `94fbed29-74eb-42d9-b3bd-6169208ac25f`

## Files Changed

- `website/src/app/quiz/page.tsx`
- `website/src/app/quiz/QuizFlow.tsx`
- `website/src/app/quiz/quiz-routing.ts`
- `website/src/app/quiz/quiz-routing.test.ts`

## What Changed

- Split the quiz into a server page wrapper plus a client interaction component.
- Built the quiz model from the live framework catalog passed in from `getAllFrameworks()`.
- Replaced the hardcoded mind-name/domain maps with catalog-derived data.
- Added a pure routing helper that scores frameworks from their live catalog metadata instead of hardcoded slugs.
- Added vitest coverage for:
  - catalog-derived mind labels/domains
  - routing decisions based on catalog keywords
  - never emitting slugs that are absent from the supplied catalog

## Verification

- `pnpm exec vitest run src/app/quiz/quiz-routing.test.ts`
- `pnpm lint`
- `pnpm build`
- `pnpm test`

## Results

- Vitest: passed
- Lint: passed with pre-existing warnings outside this task
- Build: passed

# 2026-05-12 Insights Phase 1 launch trio

## Files Changed
- `website/src/lib/insights.ts`
- `website/src/app/insights/page.test.tsx`

## What Changed
- Added the first three Phase 1 insight pages from `topics.yaml` to the public insights index:
  - `what-would-marcus-aurelius-say-about-burnout`
  - `what-would-sun-tzu-say-about-tariffs-and-trade-wars`
  - `what-would-machiavelli-say-about-firing-someone-you-respect`
- Added matching annotation blueprints so the detail-page annotation layer stays covered for the new published entries.
- Extended the insights index test suite to render the new launch trio and to exercise the real helper paths for single and collision insight entries.

## Verification
- `cd website && ./node_modules/.bin/vitest run 'src/app/insights/page.test.tsx' 'src/app/insights/[slug]/page.test.tsx' 'src/app/insights/[slug]/annotation-layer.test.ts'`
- `cd website && ./node_modules/.bin/vitest run --coverage --coverage.include=src/lib/insights.ts 'src/app/insights/page.test.tsx' 'src/app/insights/[slug]/annotation-layer.test.ts'`

## Results
- Focused insights suite: `3 passed`, `54 tests passed`
- Coverage for `website/src/lib/insights.ts`: `100%` lines, `100%` statements, `100%` functions, `95.23%` branches

# 2026-05-12 PR #266 branch refresh for strict protection

## Task
- Nudge PR #266 after the merge attempt hit stale branch-protection state.

## Result
- Updated `wanman/outreach-wave1-send-brief` onto the current `master` using `gh pr update-branch`.
- The refreshed head is `0f9f00979bc9a1792aeb815d3204daf7919a36c0`.
- Required CI checks are green on the refreshed head:
  - `CI / Framework Citation Guardrail`
  - `CI / Lint`
  - `CI / Test`
  - `CI / Build`
- GitHub still reports `mergeStateStatus: UNSTABLE` because the non-required `Vercel` status context is failing with `build-rate-limit`.

## Evidence
- PR: `https://github.com/edwardyen724-g/consult-the-dead/pull/266`
- Updated branch run: `https://github.com/edwardyen724-g/consult-the-dead/actions/runs/25721105774`

# 2026-05-12 PR #268 branch-coverage proof collected

## Task
- `7eac101d-3193-4c6b-aeb7-85e0df7538ea` - Collect branch-coverage proof or formal exception for PR #268

## Result
- PR #268 already has the required branch-coverage proof attached in review comments.
- The proof documents the measured include-list update in `website/vitest.config.ts` and records branch coverage for the touched files:
  - `src/app/pricing/page.tsx`: `42/42` branches, `100%`
  - `src/lib/pricing/stats.ts`: `22/22` branches, `100%`
  - Overall `npm run coverage`: `98.46%` branch coverage
- No formal exception was needed.

## Evidence
- PR comment: `https://github.com/edwardyen724-g/consult-the-dead/pull/268#issuecomment-4428375527`
- Related PR body: `https://github.com/edwardyen724-g/consult-the-dead/pull/268`

# 2026-05-12 Rebase PR #227 publication-system convergence

## Files Changed
- `website/src/app/library/page.tsx`
- `website/src/app/library/page.test.tsx`

## What Changed
- Rebased `wanman/publication-system-convergence` onto `origin/master`.
- Resolved the library page and test conflicts by keeping the publication-system shell changes and preserving the newer library upsell assertions.
- Kept the resolved coverage anchored to the library surface without expanding scope beyond the rebase.

## Verification
- `wcx pnpm --dir /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website coverage -- src/app/library/page.test.tsx`

## Results
- Targeted library coverage run passed: `134` test files, `1756` tests, `99.42%` statements, `98.16%` branches, `100%` functions, `99.79%` lines overall

# 2026-05-11 Fix library publication-section contract regression

## Files Changed
- `website/src/app/library/page.tsx`
- `website/src/app/library/page.test.tsx`

## What Changed
- Added a real CTA child to the upsell `PublicationSection` on the library page so it satisfies the component contract and no longer renders the section header without children.
- Kept the CTA aligned with the existing free-user upgrade path by linking to `/pricing`.
- Extended the library regression coverage so both upsell branches assert the pricing CTA is present.

## Verification
- `pnpm --dir website coverage -- src/app/library/page.test.tsx`
- `pnpm --dir website exec eslint src/app/library/page.tsx src/app/library/page.test.tsx`
- `pnpm --dir website build`

## Results
- Library coverage slice: `118` test files, `1420` tests, `99.33%` statements, `97.94%` branches, `100%` functions, `100%` lines overall
- ESLint: passed on the touched library files
- Website build: failed in the unrelated uncommitted Agora edit at `website/src/app/agora/AgoraApp.tsx:1016` with `Cannot find name 'beginAndStartAgon'`

# 2026-05-11 Converge account and library into one publication system

## Files Changed
- `website/src/app/account/page.tsx`
- `website/src/app/account/page.test.tsx`
- `website/src/app/library/page.tsx`
- `website/src/app/library/page.test.tsx`
- `website/src/app/library/publication-surface.tsx`

## What Changed
- Added a shared publication shell for account and library so both surfaces use the same eyebrow, hero, stat-strip, section-card, and footer-CTA rhythm.
- Reworked `/account` into the new shell with aligned typography and spacing, a top-level plan/usage/api-key hierarchy, and matching footer CTAs.
- Reworked `/library` into the same shell with aligned header stats, an upgraded free-user prompt, a consistent saved-debate section stack, and footer CTAs that mirror the account surface.
- Kept the existing Pro library behavior, upsell nudge logic, and BYO-key/account behavior intact while changing only the presentation layer.
- Added regression coverage for the new account shell, the library page shell, the Pro archive section, the free upgrade prompt, the redirect path, and the footer CTA placement.

## Verification
- `pnpm --dir website coverage -- src/app/account/page.test.tsx src/app/library/page.test.tsx`
- `pnpm --dir website lint -- src/app/account/page.tsx src/app/library/page.tsx src/app/library/publication-surface.tsx src/app/account/page.test.tsx src/app/library/page.test.tsx`

## Results
- Coverage run: `118` test files, `1420` tests, `99.33%` statements, `97.94%` branches, `100%` functions, `100%` lines overall
- ESLint: passed on the touched route and test files

# 2026-05-11 Trim Agora onboarding friction

## Files Changed
- `website/src/app/agora/AgoraApp.tsx`
- `website/src/app/agora/AgoraApp.test.tsx`

## What Changed
- Collapsed the sample-question path into a one-click start flow so borrowing a question now launches the agon immediately instead of requiring a second click.
- Factored council seeding into a pure `resolveSeededCouncil()` helper so the quiz, pack, and fallback branches are reusable and testable.
- Kept the custom-topic quick-start path intact while allowing topic overrides to flow through the same start function.
- Updated the Agora landing copy and aria labels to make the reduced-friction path explicit.
- Added regression coverage for the council resolver branches and the new one-click sample-question affordance.

## Verification
- `cd website && wcx pnpm test -- src/app/agora/AgoraApp.test.tsx`
- `cd website && wcx pnpm coverage -- src/app/agora/AgoraApp.test.tsx`
- `cd website && wcx pnpm exec eslint src/app/agora/AgoraApp.tsx src/app/agora/AgoraApp.test.tsx`

## Results
- Focused Agora test suite: `36 passed`
- Coverage run: `117 test files`, `1416 tests`, `99.33%` statements, `97.94%` branches, `100%` functions, `100%` lines overall
- ESLint: passed with pre-existing warnings in `website/src/app/agora/AgoraApp.tsx`

# 2026-05-12 Insights Phase 1 launch trio

## Files Changed
- `website/src/lib/insights.ts`
- `website/src/app/insights/page.test.tsx`

## What Changed
- Added the first three Phase 1 insight pages from `topics.yaml` to the public insights index:
  - `what-would-marcus-aurelius-say-about-burnout`
  - `what-would-sun-tzu-say-about-tariffs-and-trade-wars`
  - `what-would-machiavelli-say-about-firing-someone-you-respect`
- Added matching annotation blueprints so the detail-page annotation layer stays covered for the new published entries.
- Extended the insights index test suite to render the new launch trio and to exercise the real helper paths for single and collision insight entries.

## Verification
- `cd website && ./node_modules/.bin/vitest run 'src/app/insights/page.test.tsx' 'src/app/insights/[slug]/page.test.tsx' 'src/app/insights/[slug]/annotation-layer.test.ts'`
- `cd website && ./node_modules/.bin/vitest run --coverage --coverage.include=src/lib/insights.ts 'src/app/insights/page.test.tsx' 'src/app/insights/[slug]/annotation-layer.test.ts'`

## Results
- Focused insights suite: `3 passed`, `54 tests passed`
- Coverage for `website/src/lib/insights.ts`: `100%` lines, `100%` statements, `100%` functions, `95.23%` branches

# 2026-05-11 rateLimit branch coverage follow-up

## Files Changed
- `website/src/lib/agon/rateLimit.test.ts`
- `website/vitest.config.ts`

## What Changed
- Added Vitest coverage for `quotaResetAt()` with fake timers, covering both the daily reset branch and the pro monthly reset branch.
- Included `src/lib/agon/rateLimit.ts` in the coverage include list so the file appears in the coverage report and can be referenced in the PR body.

## Verification
- `cd website && npm run test -- rateLimit.test.ts`
- `cd website && npm run coverage`
- `cd website && rm -rf coverage && npm run coverage -- rateLimit.test.ts`

## Results
- Targeted test file passed: `2 passed`
- Full `npm run coverage` still fails in this environment because the broader suite cannot resolve runtime packages such as `react`, `next/server`, and `@vercel/postgres`.
- Targeted coverage report line for `website/src/lib/agon/rateLimit.ts`: `10.07%` statements, `2.7%` branches, `5%` functions, `11.76%` lines

# 2026-05-11 Seeded topics queue prune and Phase 1 readiness

## Files Changed
- `topics.yaml`
- `CONTENT_PIPELINE.md`
- `MARKETING_STRATEGY.md`
- `scripts/content-pipeline/article-pipeline.test.ts`

## What Changed
- Pruned two low-signal / overlapping topic records from the active queue:
  - `should-i-hire-or-outsource`
  - `what-would-machiavelli-say-about-startup-cap-tables`
- Updated the queue header comments and the pipeline docs to say the curated queue has been reviewed and is ready for Phase 1 publishing.
- Updated the marketing strategy note so the topic queue count no longer advertises the pre-prune seed state.
- Added regression coverage that asserts the pruned slugs are absent from the active topic list.

## Verification
- `node - <<'NODE' ...` to confirm the pruned slugs were absent from `topics.yaml` and the active topic count still loaded cleanly.
- `npx -y vitest run scripts/content-pipeline/article-pipeline.test.ts`

## Results
- Topic count from the active queue: `27`
- Pruned slugs absent: yes
- Vitest: `1 passed`, `11 tests passed`

# 2026-05-09 Shared CTA attribution helper for funnel events

## Files Changed
- `website/src/lib/cta-attribution.ts`
- `website/src/lib/cta-attribution.test.ts`

## What Changed
- Added a reusable `buildCtaEventProps()` helper for funnel CTA events.
- The helper serializes the source surface and optional campaign/content labels into canonical `utm_source`, `utm_campaign`, and `utm_content` analytics props.
- Extra event metadata can be merged into the payload without overriding the canonical UTM keys.
- Added focused regression coverage for trimming, blank-value dropping, extra-prop merging, canonical key precedence, and the blank-source fallback branch.

## Verification
- `cd website && wcx npm test -- src/lib/cta-attribution.test.ts`
- `cd website && wcx npm run coverage -- src/lib/cta-attribution.test.ts`
- `cd website && wcx npm run lint -- src/lib/cta-attribution.ts src/lib/cta-attribution.test.ts`

## Results
- Targeted vitest run: `5 passed`
- Coverage artifact: `src/lib/cta-attribution.ts` at `100%` lines, `100%` branches, `100%` functions in `coverage/lcov.info`
- ESLint: passed

# Change Summary

## Scope

Fixed the two PR #25 retention-email review blockers in the PR worktree:

- `website/src/app/api/cron/retention-emails/nudge/route.ts`
- `website/src/app/api/cron/retention-emails/nudge/route.test.ts`
- `website/src/app/api/cron/retention-emails/digest/route.ts`
- `website/src/app/api/cron/retention-emails/digest/route.test.ts`

## What Changed

- Nudge route now fails closed on Postgres errors by letting `countAgons()` throw instead of converting DB failures into `0`.
- Both nudge and digest routes now page through Clerk users with repeated `getUserList()` calls until the final partial page.
- Added regression tests that prove:
  - nudge aborts when Postgres cannot count agons,
  - nudge loads a second Clerk page,
  - digest loads a second Clerk page.

## Verification

Commands:

```bash
pnpm coverage -- src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.test.ts
pnpm lint -- src/app/api/cron/retention-emails/nudge/route.ts src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.ts src/app/api/cron/retention-emails/digest/route.test.ts
```

Results:

- Coverage run passed: 12 test files, 171 tests.
- Targeted eslint run passed with no errors.

## 2026-05-09 Company-builder command palette regression coverage

### Files Changed
- `company-builder/src/components/shared/CommandPalette.test.tsx`
- `company-builder/src/lib/events.test.ts`

### What Changed
- Expanded command-palette regression coverage to lock down:
  - Cmd+K / Ctrl+K open-close toggling and Escape close behavior,
  - query filtering via labels, keywords, and blank-query passthrough,
  - command catalog actions for placed minds, unplaced minds, export, sidebar toggle, debate toggle, history toggle, and the connected-canvas start-debate branch.
- Added a small local test helper to build catalog dependencies without repeating boilerplate.
- Fixed the `events.test.ts` window stub type so repo-wide `tsc --noEmit` stays green.

### Verification
- `npx tsc --noEmit`
- `npx --yes tsx --test src/components/shared/CommandPalette.test.tsx src/lib/events.test.ts`
- `npx eslint src/components/shared/CommandPalette.test.tsx src/lib/events.test.ts`

### Results
- Typecheck: passed
- Test run: `5 passed`
- ESLint: passed

## 2026-05-09 Auth landing shell + reversible history primitives

### Files Changed
- `website/src/app/sign-in/[[...sign-in]]/page.tsx`
- `website/src/components/AuthLanding.tsx`
- `website/src/components/__tests__/AuthLanding.test.tsx`
- `company-builder/src/types/index.ts`
- `company-builder/src/lib/history.ts`
- `company-builder/src/lib/history.test.ts`

### What Changed
- Replaced the bare Clerk sign-in page with a branded auth landing shell that:
  - explains the Free, BYO-key, and Pro paths,
  - gives users a clear return path to `/agora`,
  - keeps the sign-in flow visually aligned with the rest of the site,
  - passes the sign-in route props through to Clerk with `/agora` as the fallback redirect.
- Added focused coverage for the new auth shell and route wrapper, including mocked Clerk and Link behavior.
- Added generic reversible history primitives for company-builder:
  - `createHistoryState`
  - `canUndo`
  - `canRedo`
  - `commitHistory`
  - `undoHistory`
  - `redoHistory`
  - `resetHistory`
- Added a node:test suite that exercises create/commit/undo/redo/reset behavior and the no-op branches.

### Verification
- `npm run coverage -- src/components/__tests__/AuthLanding.test.tsx`
- `npm run lint -- 'src/app/sign-in/[[...sign-in]]/page.tsx' src/components/AuthLanding.tsx src/components/__tests__/AuthLanding.test.tsx`
- `awk '/SF:src\\/components\\/AuthLanding.tsx/{flag=1} flag{print} /end_of_record/{if(flag){exit}}' website/coverage/lcov.info`
- `awk '/SF:src\\/app\\/sign-in\\/\\[\\[\\.\\.\\.sign-in\\]\\]\\/page.tsx/{flag=1} flag{print} /end_of_record/{if(flag){exit}}' website/coverage/lcov.info`
- `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/node_modules/.bin/tsc --module commonjs --target es2022 --moduleResolution node --esModuleInterop --strict --skipLibCheck --types node --typeRoots /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/node_modules/@types --outDir <tmp> --rootDir company-builder/src company-builder/src/lib/history.ts company-builder/src/lib/history.test.ts company-builder/src/types/index.ts`
- `node --test <tmp>/lib/history.test.js`
- `npm run build`

### Results
- Website tests: `3 passed`
- Coverage artifact: `src/components/AuthLanding.tsx` at `100%` lines, `src/app/sign-in/[[...sign-in]]/page.tsx` at `100%` lines
- Company-builder helper tests: `5 passed`
- Company-builder compile verification: passed
- Website build: failed before app compilation because `@sentry/nextjs` could not be resolved from the current install

## 2026-05-09 Framework Forge chat regression coverage

### Files Changed
- `framework_forge/chat.py`
- `tests/test_chat.py`

### What Changed
- Corrected the chat adapter history window to keep the most recent 3 exchanges, matching the intended session-scoped context window.
- Added pytest regression coverage for:
  - system prompt assembly including the perceptual lens, bipolar constructs, behavioral divergence predictions, and the first eight calibration incidents,
  - history truncation after the third prior exchange,
  - the default model fallback when no explicit model is passed,
  - the internal `LLMClient` construction path and quit/exit handling,
  - the `click` command wrapper forwarding into `chat_with_framework()`.

### Verification
- `.venv/bin/python3.12 -m pytest tests/test_chat.py -q`
- `.venv/bin/python3.12 -m pytest --cov=framework_forge --cov-report=term-missing tests/test_chat.py -q`

### Results
- `4 passed`
- `framework_forge/chat.py` coverage: `98%` lines in the targeted run

## 2026-05-09 PR #64 RSS coverage follow-up

### Files Changed
- `website/src/lib/rss-feed.test.ts`
- `website/vitest.config.ts`

### What Changed
- Added fallback-path coverage for `normalizeSiteUrl()`, `buildFeedMetadata("")`, and `buildPublicFeedItems({ siteUrl: "" })` so the RSS helper’s empty-site URL branches are exercised.
- Removed the blanket `src/app/**` exclusion from `website/vitest.config.ts` so `website/src/app/feed.xml/route.ts` is counted in coverage instead of being hidden from the gate.

### Verification
- `npm run test -- src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`
- `npm run coverage -- src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`

### Results
- Targeted tests: `7 passed`
- Coverage run: `src/lib/rss-feed.ts` at `100%` lines and `100%` branches in the targeted lcov report
- Coverage run: `src/app/feed.xml/route.ts` at `100%` lines in the targeted lcov report

## Files Changed
- `tests/test_sources.py`
- `website/tests/agora-session-history.test.ts`

## What Changed
- Added source-discovery smoke coverage for `discover_sources()` including the default `LLMClient` fallback, prompt payload verification, and mapping/defaulting of returned source records.
- Added source-triage coverage for unknown source types sorting last.
- Added fetcher coverage for HTML cleaning and non-HTML passthrough writes.
- Added Agora regression coverage that:
  - locks the current page-level hydration path from `searchParams` into `AgoraApp` props,
  - confirms the live debate flow still targets `/api/agon`, and
  - confirms there is no separate checked-in `/api/chat` route.

## Verification
- `PYTHONPATH=. uv run --with pytest --with pytest-cov --with anthropic --with httpx --with python-dotenv pytest --cov=framework_forge.sources --cov-report=term-missing -q tests/test_sources.py`
- `pnpm test -- tests/agora-session-history.test.ts`
- `pnpm coverage -- tests/agora-session-history.test.ts`
- `pnpm exec eslint tests/agora-session-history.test.ts`
- `python3 -m py_compile tests/test_sources.py`
- `python3 -m py_compile tests/test_sources.py` (post-cleanup recheck)

## Results
- Python tests: `11 passed`
- Python coverage: `framework_forge.sources` at `100%` line coverage in the targeted run
- Agora vitest file: `3 passed`
- Agora coverage run: `22 passed`, coverage command completed successfully

## 2026-05-09 Framework Forge pipeline orchestrator

### Files Changed
- `framework_forge/pipeline.py`
- `tests/test_pipeline.py`

### What Changed
- Added a module-level Framework Forge pipeline orchestrator that:
  - discovers and persists source bibliography data,
  - mirrors the source text corpus into the output tree,
  - identifies candidate incidents,
  - reconstructs incidents,
  - builds the framework JSON, and
  - runs validation in sequence.
- Added a `click` CLI entry point for the orchestrator so it can be invoked as a single command from the module.
- Added regression tests for:
  - the end-to-end happy path,
  - the CLI wiring,
  - helper branch coverage,
  - validation guard rails, and
  - the floor-check / tier validation error paths.

### Verification
- `PYTHONPATH=. uv run --with pytest --with pytest-cov pytest --cov=framework_forge.pipeline --cov-report=term-missing -q tests/test_pipeline.py`

### Results
- `4 passed`
- `framework_forge/pipeline.py` coverage: `99%` line coverage in the targeted run

## 2026-05-09 Reusable Framework Forge pipeline runner

### Files Changed
- `framework_forge/pipeline.py`
- `tests/test_pipeline.py`

### What Changed
- Added `FrameworkForgePipelineRunner`, a reusable Python-facing runner that exposes the Framework Forge stages as explicit methods:
  - `run_discovery()`
  - `prepare_source_texts()`
  - `run_incident_identification()`
  - `run_reconstruction()`
  - `run_build()`
  - `run_validation()`
- Kept `run_pipeline()` as a thin compatibility wrapper over the runner, and wired the CLI through the same path with injectable output emission.
- Preserved the existing missing-source guard so a bad corpus path still fails before discovery runs.
- Added a direct runner regression test that exercises the stage methods from Python without going through the click command.

### Verification
- `PYTHONPATH=. uv run pytest tests/test_pipeline.py`
- `PYTHONPATH=. uv run pytest tests/test_pipeline.py --cov=framework_forge.pipeline --cov-report=term-missing`

### Results
- `5 passed`
- `framework_forge/pipeline.py` coverage: `99%` line coverage in the targeted run

---

Task: `a3a03ac0-fc6f-42e0-b687-9afd75d389af` - Finish RSS, 404/loading, collision article, and generation polish
Capsule: `c5c1ee7e-6e78-478b-b7d3-ce1758c2c06a` - `wanman/rss-404-loading-polish`

## Changed Files

- `website/src/app/feed.xml/route.ts`
- `website/src/app/loading.tsx`
- `website/src/app/insights/loading.tsx`
- `website/src/app/frameworks/loading.tsx`
- `website/src/app/not-found.tsx`
- `website/src/app/insights/[slug]/page.tsx`
- `website/src/lib/insights.ts`
- `website/scripts/generate-article.ts`
- `website/next.config.ts`

## What Changed

- Added `/feed.xml` as an RSS route that merges debate and insight content, emits stable RSS XML, and caches at the edge for one hour.
- Added branded loading shells for the app root, `/insights`, and `/frameworks` without spinner UI.
- Added a more helpful root 404 page that points users back to the Library and Agora.
- Extended the insight article model to support collision articles with paired frameworks and collision-aware rendering.
- Upgraded `/insights/[slug]` metadata and JSON-LD so article pages expose proper SEO data and structured article schema.
- Added a Claude-backed article generator CLI that writes article JSON with snake_case metadata fields.
- Added a Vercel/Next cache header for `/feed.xml` in `next.config.ts`.

## Verification

- `wcx pnpm test`
  - Result: `21 test files passed, 268 tests passed`
- `wcx pnpm build`
  - Result: build completed successfully; `/feed.xml` and `/insights/[slug]` were generated with `revalidate = 1h`
- `wcx pnpm exec eslint 'src/app/insights/[slug]/page.tsx' src/app/feed.xml/route.ts src/app/loading.tsx src/app/insights/loading.tsx src/app/frameworks/loading.tsx src/app/not-found.tsx src/lib/insights.ts next.config.ts scripts/generate-article.ts`
  - Result: passed for the capsule files
- `wcx pnpm lint`
  - Result: failed because of an unrelated existing repo-wide error in `src/app/worked-example.tsx` (`react-hooks/set-state-in-effect`)

## Notes

- The repo-wide lint failure is outside this capsule's allowed paths.
- The website package needed a one-time `pnpm install` so `eslint`/`next` binaries were available for verification.
