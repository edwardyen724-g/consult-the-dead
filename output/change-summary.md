# Change Summary

## Task
Add a demo fallback for company-builder debate mode.

## Changed Files
- `company-builder/src/app/api/debate/route.ts`
- `company-builder/src/app/api/research/route.ts`
- `company-builder/src/lib/demo-mode.ts`
- `company-builder/src/lib/demo-mode.test.ts`
- `company-builder/vitest.config.ts`

## What Changed
- Added shared demo-mode helpers that stream deterministic SSE research and debate events when Anthropic credentials are missing.
- Wired the debate and research API routes to return the demo stream instead of a hard 500 when `ANTHROPIC_API_KEY` is absent, while leaving the live Anthropic path unchanged when a key is present.
- Added Vitest coverage for the demo research and debate contracts, including streamed event shape, source payloads, and convergence output.
- Added a local Vitest config so the new helper tests can run inside the company-builder app without pulling in the broader workspace config.

## Verification
- `cd company-builder && npm ci --no-audit --no-fund`
- `cd company-builder && /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/node_modules/.bin/vitest run --config vitest.config.ts`
- `cd company-builder && ./node_modules/.bin/eslint src/app/api/debate/route.ts src/app/api/research/route.ts src/lib/demo-mode.ts src/lib/demo-mode.test.ts vitest.config.ts`
- `cd company-builder && npm run build`
- `cd company-builder && npm run lint`

## Results
- Vitest helper tests: passed.
- Targeted ESLint on the changed files: passed.
- Full repository lint: failed on pre-existing company-builder issues outside this task, including existing React-hooks and `require()`-style import errors in unrelated files.
- Next.js build: compiled successfully, then failed during type checking on a pre-existing error in `src/components/canvas/MindNode.tsx` (`showPlacementQuote` is undefined).

## Task
Add undo/redo for destructive company-builder edits.

## Changed Files
- `company-builder/src/store/companyStore.ts`

## What Changed
- Added a serializable single-step history snapshot to the company-builder store so the last canvas edit can be undone and redone after reload.
- Persisted the undo/redo stack in localStorage with a version-2 save schema while still accepting legacy version-1 saves.
- Added `undo()` and `redo()` store actions and wired destructive or canvas-mutating actions to refresh the history before saving.

## Verification
- `cd company-builder && npm ci`
- `cd company-builder && npx eslint src/store/companyStore.ts`
- `cd company-builder && ./node_modules/.bin/tsc --noEmit --pretty false`
- `cd company-builder && npm run lint`
- `cd company-builder && npm run build`

## Results
- Targeted ESLint for `companyStore.ts`: passed.
- TypeScript check: `companyStore.ts` passed; the workspace still reports pre-existing errors in `src/components/canvas/MindNode.tsx` unrelated to this task.
- Repo-wide lint: failed on pre-existing company-builder issues outside the scoped store file.
- Next.js build: compiled successfully, then failed in the installed Next worker during type verification with a missing-module runtime error in the workspace environment.

## Task
Add floor-check result persistence helper for Framework Forge.

## Changed Files
- `framework_forge/validation/floor_check.py`
- `tests/test_floor_check_persistence.py`

## What Changed
- Added `save_floor_check_result()` plus a canonical `FLOOR_CHECK_RESULTS_FILENAME` constant in the floor-check module.
- Kept the JSON artifact format aligned with `FloorCheckResult.to_dict()`, including the derived `passed` field.
- Added a dedicated persistence regression test that verifies the filename, directory creation, and serialized payload.

## Verification
- `uv sync --extra dev`
- `PYTHONPATH=. uv run pytest tests/test_floor_check_persistence.py tests/test_validation.py -k floor_check`
- `PYTHONPATH=. uv run pytest tests/test_floor_check_persistence.py -q`

## Results
- Targeted persistence test: passed.
- Existing floor-check validation tests: passed.
- Note: the repo needed `PYTHONPATH=.` for pytest collection in this shell because the package was not being resolved automatically.

## Task
Lock the transcript share helper contract.

## Changed Files
- `website/src/lib/share-transcript.ts`
- `website/src/lib/__tests__/share-transcript.test.ts`

## What Changed
- Added a focused transcript-share helper with canonical public URL generation, markdown attribution formatting, and a stable line-oriented share-text builder.
- Added regression coverage for the helper contract, including the default public origin, custom-origin normalization, explicit attribution overrides, and payload bundling.

## Verification
- `cd website && pnpm coverage -- website/src/lib/__tests__/share-transcript.test.ts`

## Results
- Focused vitest coverage: passed with 100% coverage on the helper file.

## Task
Add metadata and social-preview support for the main Agora landing page.

## Changed Files
- `website/src/app/agora/page.tsx`
- `website/src/lib/recent-agons.ts`
- `website/src/lib/__tests__/recent-agons.test.ts`

## What Changed
- Added a pure Agora landing-page metadata builder with canonical URL, index/follow robots, Open Graph, and Twitter fields.
- Exported that metadata from `/agora` so the landing page is shareable and indexable without touching `AgoraApp.tsx`.
- Added regression coverage for the metadata contract, including the canonical URL and social-preview payload.

## Verification
- `cd website && npm run test -- src/lib/__tests__/recent-agons.test.ts`
- `cd website && npm run lint -- src/app/agora/page.tsx src/lib/recent-agons.ts src/lib/__tests__/recent-agons.test.ts`
- `cd website && npm run build`

## Results
- Targeted vitest: passed.
- ESLint: passed.
- Full build: failed on a pre-existing type error in `website/src/app/robots.ts` (`index` / `follow` are not valid `MetadataRoute.Robots` rule properties).

## Task
Harden the RSS feed contract and item metadata.

## Changed Files
- `website/src/lib/rss-feed.ts`
- `website/src/lib/rss-feed.test.ts`
- `website/src/app/feed.xml/route.ts`
- `website/src/app/feed.xml/route.test.ts`
- `website/.harness/sprints/SPRINT-4.md`

## What Changed
- Added a shared RSS helper for feed metadata, XML serialization, date normalization, and public insight selection.
- Restored the `/feed.xml` route to emit RSS XML for public debates and insights with cache headers.
- Added regression tests for XML escaping, ordering, fallback dates, and published-insight filtering.
- Marked the Sprint 4 RSS inventory item complete.

## Verification
- `cd website && wcx npm run test -- src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`
- `cd website && wcx npx vitest run --coverage --coverage.include=src/lib/rss-feed.ts --coverage.include=src/app/feed.xml/route.ts src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`
- `cd website && wcx npm run lint -- src/lib/rss-feed.ts src/lib/rss-feed.test.ts src/app/feed.xml/route.ts src/app/feed.xml/route.test.ts`
- `cd website && wcx npm run build`

## Results
- Targeted vitest: passed.
- Targeted coverage: passed at 100% on the RSS files.
- ESLint: passed.
- Full build: failed on a pre-existing type error in `website/src/app/robots.ts` (`index` / `follow` are not valid `MetadataRoute.Robots` rule properties).

## Task
Fix Clerk unsafe metadata typing in PR #91.

## Changed Files
- `website/src/app/sign-up/[[...sign-up]]/utm-stamper.ts`

## What Changed
- Reworked `SignUpUnsafeMetadata` to match Clerk's shape with explicit `utm_source` and `utm_campaign` string fields plus an `unknown` index signature.
- Kept the helper output the same, but made the prop assignment compatible with Clerk's `SignUp` component typing.

## Verification
- `cd website && npm run test -- 'src/app/sign-up/[[...sign-up]]/page.test.tsx'`
- `cd website && npm run lint -- 'src/app/sign-up/[[...sign-up]]/utm-stamper.ts' 'src/app/sign-up/[[...sign-up]]/page.tsx' 'src/app/sign-up/[[...sign-up]]/page.test.tsx'`
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/pr91-verify/website && npm run build`
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/pr91-verify/website && npm run test -- 'src/app/sign-up/[[...sign-up]]/page.test.tsx'`

## Results
- Sign-up regression test: passed.
- Lint: passed.
- Clean-worktree production build: passed.
- PR #91 CI, build, and Vercel checks: passed after pushing `7bccd7f`.
