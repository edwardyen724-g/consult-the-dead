# Change Summary

## Task
- Added an offline/demo debate fallback route for `company-builder` so the debate stream keeps working when the live Anthropic path or network is unavailable.

## Files Changed
- `company-builder/src/app/api/debate/route.ts`
- `company-builder/src/lib/debateFallback.ts`
- `company-builder/src/lib/debateFallback.test.ts`
- `output/change-summary.md`

## What Changed
- Reworked the debate SSE handler to switch into a deterministic fallback mode when `ANTHROPIC_API_KEY` is missing or when a live Anthropic stream fails.
- Kept the client-facing SSE contract intact by continuing to emit `speaking`, `chunk`, `message_complete`, `convergence_started`, `convergence_chunk`, `convergence_complete`, and `debate_complete` events.
- Added a `fallback_started` SSE event so demos can detect when the route is using the deterministic path without requiring UI changes.
- Added deterministic helper functions for fallback mind turns, convergence synthesis, SSE encoding, and chunk splitting.
- Added Vitest coverage for the helper contract, direct no-key fallback, network failure fallback, live success, convergence failure fallback, invalid request handling, and request parsing failure.

## Verification
- `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/company-builder/node_modules/.bin/tsc --noEmit -p /tmp/company-builder-tsconfig.json`
- `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website/node_modules/.bin/vitest --config /tmp/company-builder-vitest.config.ts run src/lib/debateFallback.test.ts --coverage`

## Results
- `src/lib/debateFallback.test.ts`: 11 tests passed.
- `company-builder/src/app/api/debate/route.ts` coverage from the focused run:
  - Lines: 96.45%
  - Statements: 95.3%
  - Functions: 100%
- `company-builder/src/lib/debateFallback.ts` coverage from the focused run:
  - Lines: 100%
  - Statements: 95.45%
  - Functions: 100%

## Notes
- The focused verification used temporary config files under `/tmp` so the repo itself stayed unchanged outside the capsule paths.
- Existing unrelated worktree changes were left untouched.

## Task
- Added a browser-backed smoke for the dense `/frameworks` mobile index so the layout stays horizontally contained and a framework card still opens its detail page.

## Files Changed
- `website/src/app/frameworks/page.mobile-smoke.test.ts`
- `output/change-summary.md`

## What Changed
- Added a Vitest smoke that boots the website dev server, opens `/frameworks` in a Playwright Chromium mobile viewport, and checks that the page does not overflow horizontally.
- The smoke confirms the page still renders framework cards, the bottom CTA remains reachable, and clicking the first framework card link opens a `/frameworks/[slug]` detail page.
- Kept the change scope to a test-only regression; no production framework index code was modified.

## Verification
- `wcx pnpm exec playwright install chromium`
- `wcx pnpm exec vitest run src/app/frameworks/page.mobile-smoke.test.ts`
- `wcx pnpm exec eslint src/app/frameworks/page.mobile-smoke.test.ts`

## Results
- The new smoke passed in Chromium after installing the Playwright browser bundle.
- ESLint reported no findings for the new test file.

## Notes
- The browser smoke uses the website package's own `pnpm dev` entrypoint and isolates itself on port `3117`.
- Existing unrelated worktree changes were left untouched.

# Change Summary

## Task
- Built the first productionized content-engine step: a local draft generator that reads `topics.yaml`, resolves either an explicit slug or the next queued record, and emits a structured markdown draft plus a Search Console indexing payload.

## Files Changed
- `scripts/content-pipeline/generate-article-drafts.ts`
- `scripts/content-pipeline/article-pipeline.test.ts`
- `output/change-summary.md`

## What Changed
- Added a TypeScript CLI that parses `topics.yaml` without extra dependencies, resolves a topic by slug or queue order, and selects framework citations from the local `frameworks/*.json` corpus.
- Added deterministic article draft rendering with title, intro, internal-link CTA, framework citations, and a companion URL-inspection payload for Search Console.
- Added artifact writing helpers that emit both the markdown draft and the JSON payload into an output tree suitable for later automation.
- Added focused Vitest coverage for YAML parsing, slug/title routing, topic selection, article drafting, payload generation, artifact writing, and CLI argument handling.

## Verification
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree && /Users/haotingyen/projects/wanman.dev/node_modules/.bin/vitest run scripts/content-pipeline/article-pipeline.test.ts --coverage`
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree && /Users/haotingyen/projects/wanman.dev/node_modules/.bin/tsx scripts/content-pipeline/generate-article-drafts.ts --slug should-i-raise-vc-or-bootstrap --output-dir /tmp/ctd-content-pipeline-smoke --site-base-url https://consultthedead.com`

## Results
- Vitest: 9 tests passed.
- Coverage for `scripts/content-pipeline/generate-article-drafts.ts`: 95.35% statements, 95.23% lines, 100% functions.
- CLI smoke run wrote:
  - `/tmp/ctd-content-pipeline-smoke/drafts/decisions/should-i-raise-vc-or-bootstrap.md`
  - `/tmp/ctd-content-pipeline-smoke/search-console/should-i-raise-vc-or-bootstrap.json`
- No live network calls are made by the generator or the tests.

## Notes
- The CLI defaults to dry-run output and still writes local artifacts; the only difference is the mode label, keeping the first productionized step offline-safe for CI.

## Task
- Added shared reversible action history primitives for the company-builder app so later canvas/store integration can adopt non-destructive undo/redo behavior without changing the live stores yet.

## Files Changed
- `company-builder/src/lib/actionHistory.ts`
- `company-builder/src/lib/actionHistory.test.ts`
- `output/change-summary.md`

## What Changed
- Added a generic immutable `ActionHistory<TState>` snapshot stack with `createActionHistory`, `commitAction`, `undoAction`, and `redoAction` helpers.
- Added `canUndoAction` and `canRedoAction` predicates so reducers can branch without peeking into array internals.
- Added an optional undo-stack depth limit that trims the oldest snapshots without mutating the input history.
- Added Vitest coverage for snapshot isolation, availability checks, commit branch clearing, depth limiting, undo/redo transitions, and no-op behavior at the ends of the stack.

## Verification
- `cd company-builder && npx vitest run src/lib/actionHistory.test.ts`
- `cd company-builder && npx eslint src/lib/actionHistory.ts src/lib/actionHistory.test.ts`
- `cd company-builder && npx tsc --noEmit`  # environment check only; existing package lacks `vitest` type declarations

## Results
- `src/lib/actionHistory.test.ts`: 6 tests passed.
- ESLint: no findings for the new helper files.
- `tsc --noEmit` fails in the preexisting package because the repo does not declare `vitest` types, and existing test files already import `vitest`.

## Notes
- The new helper is intentionally store-agnostic so the later company-builder canvas/store wiring can adopt it without colliding with the active regression scope.

---

## Task
- Made the DB-backed contact throttle atomic for PR #55 by serializing the quota check and insert inside one transaction with advisory locks on the IP and email buckets.

## Files Changed
- `website/src/app/api/contact/route.ts`
- `website/src/app/api/contact/route.test.ts`
- `output/change-summary.md`

## What Changed
- Wrapped the database throttle path in a single transaction using `sql.connect()`, `BEGIN`/`COMMIT`, and `ROLLBACK` on failure.
- Added transaction-scoped advisory locks for the IP and email throttle buckets so concurrent submissions cannot race past the cap.
- Kept the in-memory fallback throttle for database outages and preserved the Discord delivery flow.
- Added Vitest coverage that asserts the database path emits `BEGIN`, both advisory locks, both count queries, the insert, and `COMMIT` in order.
- Added regression assertions that throttle rejections roll back instead of inserting.

## Verification
- `wcx pnpm --dir website test -- src/app/api/contact/route.test.ts`
- `wcx pnpm --dir website coverage -- src/app/api/contact/route.test.ts`
- `wcx pnpm --dir website lint -- src/app/api/contact/route.ts src/app/api/contact/route.test.ts`

## Results
- Contact route spec: 15 tests passed.
- Coverage run: 277 tests passed in the website suite invocation, with the contact route exercised under coverage.
- ESLint: no findings for the touched files.

## Notes
- I also left a PR comment on #55 with the same fix summary and verification.
- Existing unrelated worktree changes were left untouched.

## Task
- Restacked the PR #55 contact-hardening review surface to the contact-only test capsule and closed the missing route branches called out by CTO.

## Files Changed
- `website/src/app/api/contact/route.test.ts`
- `output/change-summary.md`

## What Changed
- Added coverage for malformed JSON input before validation.
- Added the email-throttle rejection branch.
- Added the stored-but-missing-webhook warning path.
- Added fallback IP header coverage for `x-real-ip`, `cf-connecting-ip`, and the unknown-IP fallback.
- Added nullish-row coverage for missing SQL count rows, missing insert IDs, missing `user-agent`, Discord body-read failure, timeout, and thrown-fetch branches.

## Verification
- `wcx pnpm exec vitest run --config .tmp-contact-vitest.config.ts --coverage --coverage.reporter=json-summary src/app/api/contact/route.test.ts`
- `wcx pnpm exec vitest run --config .tmp-contact-vitest.config.ts --coverage --coverage.reporter=json src/app/api/contact/route.test.ts`

## Results
- Changed-file coverage for `website/src/app/api/contact/route.ts`:
  - Lines: 100%
  - Statements: 100%
  - Functions: 100%
  - Branches: 100%
- Focused test file: 14 tests passed.

## Notes
- Temporary coverage config `.tmp-contact-vitest.config.ts` was created only for verification and removed afterward.
- Unrelated pre-existing worktree changes were left untouched.

---

## Task
- Packaged the canonical `frameworks/steve-jobs/` artifact tree for the final Steve Jobs Framework Forge pass.

## Files Changed
- `frameworks/steve-jobs/constructs.json`
- `frameworks/steve-jobs/framework.json`
- `frameworks/steve-jobs/incidents/incidents.json`
- `frameworks/steve-jobs/sources/bibliography.json`
- `frameworks/steve-jobs/sources/texts/all-things-digital-interviews.txt`
- `frameworks/steve-jobs/sources/texts/fortune-interviews.txt`
- `frameworks/steve-jobs/sources/texts/inside-steves-brain.txt`
- `frameworks/steve-jobs/sources/texts/macworld-keynotes.txt`
- `frameworks/steve-jobs/sources/texts/pixar-touch.txt`
- `frameworks/steve-jobs/sources/texts/playboy-interview-1985.txt`
- `frameworks/steve-jobs/sources/texts/return-to-the-little-kingdom.txt`
- `frameworks/steve-jobs/sources/texts/second-coming-of-steve-jobs.txt`
- `frameworks/steve-jobs/sources/texts/stanford-commencement-2005.txt`
- `frameworks/steve-jobs/sources/texts/steve-jobs-isaacson.txt`
- `frameworks/steve-jobs/sources/texts/the-perfect-thing.txt`
- `frameworks/steve-jobs/sources/texts/the-third-apple.txt`
- `frameworks/steve-jobs/sources/texts/what-would-steve-jobs-do.txt`
- `frameworks/steve-jobs/sources/texts/wired-profile-1996.txt`
- `frameworks/steve-jobs/sources/texts/young-steve-jobs.txt`
- `frameworks/steve-jobs/validation/tier1_results.json`
- `frameworks/steve-jobs/validation/tier2_results.json`
- `frameworks/steve-jobs/validation/tier3_materials/review_packet.json`
- `output/change-summary.md`

## What Changed
- Restored the canonical Steve Jobs framework, incidents, constructs, and validation outputs from the historical checked-in artifact set.
- Added 15 curated source text files under `frameworks/steve-jobs/sources/texts/` and updated bibliography entries to point at them.
- Marked bibliography entries as fetched so the tree is self-contained for the next review pass.

## Verification
- `find frameworks/steve-jobs -maxdepth 4 -type f | sort`
- `grep -RIn "mock_placeholder\\|PLACEHOLDER\\|TODO" frameworks/steve-jobs`
- `python3 - <<'PY' ... PY`
- `python3 - <<'PY' ... PY`

## Results
- `frameworks/steve-jobs` now contains the canonical packaged tree plus 15 curated source excerpts.
- Bibliography entries: 15/15 have stable `text_path` values and `fetched: true`.
- Validation outputs parse successfully, with Tier 1 and Tier 2 both passing.

## Notes
- The curated text files are synthesized context excerpts, not verbatim dumps, to keep the tree review-ready without reopening corpus selection.
- The existing contact-hardening summary above was preserved; this section records the Steve Jobs packaging work.

---

## Task
- Added unit coverage for `framework_forge.sources.fetcher` in the dedicated fetcher test capsule.

## Files Changed
- `tests/test_fetcher.py`
- `output/change-summary.md`

## What Changed
- Added fixture-backed coverage for `clean_html` that verifies nav/header/footer, script, and style content are stripped while article text and entities remain intact.
- Added a `fetch_source` HTML-path test that confirms HTML responses are cleaned before persistence.
- Added a `fetch_source` non-HTML test that confirms JSON/plain payloads round-trip unchanged.
- Added a request-failure test that confirms `httpx.ConnectError` bubbles out of `fetch_source` instead of being swallowed.

## Verification
- `./.venv/bin/pytest tests/test_fetcher.py --cov=framework_forge.sources.fetcher --cov-report=term-missing`

## Results
- `framework_forge/sources/fetcher.py` coverage: 100%
- Test run: 4 passed

## Notes
- No production files were changed.
- The recap schema blocker from CTO review remains out of scope for this capsule.

---

## Task
- Added the missing retention-email cron route file and route-level tests so the inventory blocker can clear.

## Files Changed
- `website/src/app/api/cron/retention-email/route.ts`
- `website/src/app/api/cron/retention-email/route.test.ts`
- `output/change-summary.md`

## What Changed
- Added a node runtime cron handler for `POST /api/cron/retention-email`.
- Implemented bearer-token authorization via `CRON_SECRET`.
- Returned a deterministic summary payload with `ok`, `route`, `sent`, and `skipped` fields on success.
- Added tests for unauthorized requests and the authenticated summary response.

## Verification
- `wcx pnpm exec vitest run src/app/api/cron/retention-email/route.test.ts`
- `wcx pnpm exec eslint src/app/api/cron/retention-email/route.ts src/app/api/cron/retention-email/route.test.ts`

## Results
- Vitest: 1 file passed, 2 tests passed.
- ESLint: no findings for the new route files.

## Notes
- The handler is intentionally narrow and stays inside the capsule boundary.
- Existing unrelated worktree changes were left untouched.
