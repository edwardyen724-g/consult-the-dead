# Change Summary

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
