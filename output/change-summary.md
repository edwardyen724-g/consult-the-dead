# Change Summary

## Task
Polish Reading Room card chrome and theme toggle for editorial surfaces, and replace the vague free-tier account copy with exact midnight-UTC reset language.

## Changed Files
- `website/package.json`
- `website/pnpm-lock.yaml`
- `website/src/app/account/page.tsx`
- `website/src/app/account/page.test.tsx`
- `website/src/components/MindCard.tsx`
- `website/src/components/MindCard.test.tsx`
- `website/src/components/ThemeToggle.tsx`
- `website/src/components/ThemeToggle.test.tsx`

## What Changed
- Reframed the free-tier account status copy so it no longer says "check back tomorrow" and instead names the exact reset point: midnight UTC.
- Gave `MindCard` a more editorial Reading Room frame with a chrome bar, subtler surface treatment, and tighter portrait framing on compact cards.
- Restyled the theme toggle into a two-line Reading Room / Late Study pill so the header control feels closer to the rest of the editorial surfaces.
- Added focused regression tests for the account copy, the MindCard chrome across compact and full variants, and the theme toggle's dark/light copy and click behavior.
- Added `jsdom` as a dev dependency so the theme toggle test can run in a DOM-backed Vitest environment.

## Verification
- `cd website && pnpm vitest run src/app/account/page.test.tsx src/components/MindCard.test.tsx src/components/ThemeToggle.test.tsx`
- `cd website && pnpm eslint src/app/account/page.tsx src/app/account/page.test.tsx src/components/MindCard.tsx src/components/MindCard.test.tsx src/components/ThemeToggle.tsx src/components/ThemeToggle.test.tsx`
- `cd website && pnpm coverage`

## Results
- Targeted Vitest: passed.
- Targeted ESLint: passed.
- Full coverage run: passed, with 32 test files and 302 tests green; coverage summary reported 100% statements/branches/functions/lines on the tracked coverage set.

## Task
Refresh the app icon and apple touch icon so the brand mark matches the current visual system.

## Changed Files
- `website/src/app/icon.tsx`
- `website/src/app/apple-icon.tsx`

## What Changed
- Replaced the older skull favicon artwork with a more deliberate bone-and-amber mark that uses the current site palette and a darker parchment background treatment.
- Increased the visual padding and contrast for the 32px favicon and the 180px apple touch icon so the skull stays legible on modern browser tabs and iOS home screens.
- Kept the icon routes self-contained in the existing Next `ImageResponse` files inside the capsule scope.

## Verification
- `cd website && ./node_modules/.bin/eslint src/app/icon.tsx src/app/apple-icon.tsx`
- `cd website && ./node_modules/.bin/tsc --noEmit --pretty false --skipLibCheck --jsx preserve --module esnext --moduleResolution bundler --target es2022 src/app/icon.tsx src/app/apple-icon.tsx`
- `cd website && ./node_modules/.bin/next build`

## Results
- Targeted ESLint: passed.
- Targeted TypeScript compile for the two icon files: passed.
- Full `next build`: compiled successfully, then failed during the repo-wide TypeScript step on a pre-existing unrelated error in `website/src/app/robots.ts` (`index` is not a valid `MetadataRoute.Robots` rule property).

## Task
Make the global not-found page more helpful and on-brand for dead links and stale shares.

## Changed Files
- `website/src/app/not-found.tsx`

## What Changed
- Added a global branded 404 surface with the existing dark parchment treatment, amber CTA styling, and serif headline treatment used elsewhere in the site.
- Reframed the error copy around dead links and stale share URLs, then added direct recovery routes into the product: a fresh agon, the public explorer, and pricing.
- Kept the layout responsive with an auto-fit two-panel grid so the help content stacks cleanly on narrow screens.

## Verification
- `cd website && wcx ./node_modules/.bin/eslint src/app/not-found.tsx`
- `cd website && wcx ./node_modules/.bin/next build`

## Results
- Targeted ESLint on `website/src/app/not-found.tsx`: passed.
- `next build`: compiled successfully, then failed during TypeScript verification on a pre-existing unrelated error in `website/src/app/robots.ts` (`index` / `follow` are not valid `MetadataRoute.Robots` rule properties).

# Change Summary

## Task
Stabilize the company-builder demo fallback PR and make the test path reproducible from a clean checkout.

## Changed Files
- `company-builder/package.json`
- `company-builder/package-lock.json`
- `company-builder/src/app/api/debate/route.test.ts`
- `company-builder/src/app/api/research/route.test.ts`
- `company-builder/src/lib/demo-mode.test.ts`
- `company-builder/src/store/companyStore.ts`
- `company-builder/vitest.config.ts`
- `website/src/app/sign-up/[[...sign-up]]/page.tsx`
- `website/src/app/sign-up/[[...sign-up]]/page.test.tsx`
- `website/src/app/sign-up/[[...sign-up]]/utm-stamper.ts`

## What Changed
- Added local `vitest` and `@vitest/coverage-v8` dev dependencies plus `test` / `test:coverage` scripts to `company-builder/package.json` so the fallback tests run from the package itself instead of borrowing `website/node_modules`.
- Expanded the company-builder Vitest config to cover all `src/**/*.test.ts` files and added the `@/` alias mapping needed for route imports.
- Added route-level fallback tests for the debate and research APIs and broadened the demo-mode helper coverage to exercise the fallback research/source shaping and role-specific debate language.
- Removed the unrelated `companyStore` and `website/sign-up` edits from the PR scope by restoring the branch-base versions of the touched files and deleting the extra sign-up helper files.

## Verification
- `cd company-builder && npm install --save-dev vitest @vitest/coverage-v8`
- `cd company-builder && npm run test:coverage`
- `cd company-builder && ./node_modules/.bin/eslint src/lib/demo-mode.test.ts src/app/api/debate/route.test.ts src/app/api/research/route.test.ts vitest.config.ts`

## Results
- `npm run test:coverage`: passed with all 3 Vitest files green.
- `demo-mode.ts` coverage: 99.24% lines covered in the focused company-builder coverage run.
- Targeted ESLint: passed.
- The branch is now narrowed to the company-builder fallback work plus its local test harness, with the unrelated sign-up/companyStore scope removed from the PR diff.

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
