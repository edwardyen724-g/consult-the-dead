# CDM Probe Reconstruction

## Files Changed
- `framework_forge/extraction/cdm_probes.py`
- `tests/test_cdm_probes.py`

## What Changed
- Added a typed `CDMProbes` dataclass that validates required probe fields and still supports mapping-style access for downstream consumers.
- Added `ReconstructedIncident.from_mapping()` so raw incident payloads can be rebuilt with explicit validation.
- Hardened `reconstruct_incident()` to require `cdm_probes` in the LLM payload and to use the typed reconstruction path.
- Added tests for the happy path, missing-field failures, bad type/empty-value failures, and the default-client branch.

## Verification
- `PYTHONPATH=. uv run --with pytest pytest tests/test_cdm_probes.py -q`
  - Result: `6 passed`
- `PYTHONPATH=. uv run --with pytest --with pytest-cov pytest tests/test_cdm_probes.py --cov=framework_forge.extraction.cdm_probes --cov-report=term-missing -q`
  - Result: `6 passed`, `framework_forge/extraction/cdm_probes.py` at `100%` coverage

---

# Live Stats Wiring

## Files Changed
- `website/src/lib/pricing/stats.ts`
- `website/src/app/api/stats/route.ts`
- `website/src/lib/__tests__/pricing-stats-route.test.ts`
- `website/src/app/page.tsx`
- `website/src/app/pricing/page.tsx`

## What Changed
- Added a shared pricing stats loader that canonicalizes live framework counts, active pack counts, agons-run counts, and the static pricing facts used across the public site.
- Added `GET /api/stats` as a public JSON endpoint that returns the shared pricing payload and falls back with a 503 if the loader fails.
- Updated the homepage stat bar to read from the shared stats payload so the live counters stay aligned with the public pricing story.
- Added a live stats band to `/pricing` that fetches `/api/stats` on mount and renders the same canonical counters and pricing proof.
- Added vitest coverage for the stats loader and the route success/failure paths.

## Verification
- `cd website && npx vitest run src/lib/__tests__/pricing-stats-route.test.ts --coverage`
  - Result: `4 passed`
- `cd website && npx eslint src/app/page.tsx src/app/pricing/page.tsx src/app/api/stats/route.ts src/lib/pricing/stats.ts src/lib/__tests__/pricing-stats-route.test.ts`
  - Result: passed with no lint errors
- `cd website && npm run build`
  - Result: passed
- `cd website && npx vitest run --coverage`
  - Result: `15 passed` across `2` files, coverage report generated successfully

---

# PR #40 Review Follow-up

## Files Changed
- None

## What Changed
- Rechecked the rebased `wanman/live-stats-wiring` head for the pricing review note.
- Confirmed the current PR diff is limited to `website/src/app/api/stats/route.ts`, `website/src/lib/pricing/stats.ts`, and `website/src/lib/__tests__/pricing-stats-route.test.ts`.
- Confirmed `website/src/app/pricing/page.tsx` is not part of the current PR diff, and there is no tracked `website/src/lib/pricing/stats.test.ts` file in this branch.
- Left a PR comment summarizing that the stale-import issue appears to be from an older PR state and that the remaining blocker is the external Vercel rate-limit failure.

## Verification
- `gh pr view 40 --json title,body,headRefName,baseRefName,files,comments,reviews`
  - Result: current PR files are the three stats files only.
- `grep -RIn "formatPricingStats\\|PRICING_STATS_DEFAULT\\|minds\\|debatesInLibrary" website/src/app website/src/lib`
  - Result: no matching deleted pricing-stats exports in the current branch.

---

# Ask This Mind Prompt Coverage

## Files Changed
- `website/src/lib/agon/frameworkPrompt.test.ts`

## What Changed
- Added Vitest coverage for `frameworkToSystemPrompt()` that locks down the section order the Ask This Mind API depends on: perceptual lens, cognitive constructs, behavioral divergence predictions, reference decisions, then speaking style.
- Added a regression for the first-eight-incident slice boundary so the ninth calibration incident stays out of the assembled prompt.
- Added a fallback regression for missing framework fields to confirm the prompt still renders safely with `Unknown` and empty sections.

## Verification
- `cd website && pnpm coverage -- src/lib/agon/frameworkPrompt.test.ts`
  - Result: `3 passed`, `18 tests passed` overall, with `src/lib/agon/frameworkPrompt.ts` at `100%` line coverage in the targeted run.

---

# Florence Nightingale Bundle Refresh

## Files Changed
- `frameworks/florence-nightingale/validation/tier2_results.json`

## What Changed
- Brought the Florence Nightingale Tier 2 validation output back in line with the current bundle schema.
- Updated the top-level `traceability_ratio` from `0.86` to `0.87` so it matches the file’s own summary.
- Added the missing top-level `passed: true` field that the current validation serializer writes.

## Verification
- `python3 - <<'PY' ... PY`
  - Result: confirmed `frameworks/florence-nightingale/framework.json` still reports `28` incidents and `12` constructs, and the refreshed validation output parses with `traceability_ratio: 0.87` and `passed: true`.

---

# Library Search and Recency Filters

## Files Changed
- `website/src/app/library/page.tsx`
- `website/src/app/library/LibraryClient.tsx`
- `website/src/lib/library-filter.ts`
- `website/src/lib/__tests__/library-filter.test.ts`

## What Changed
- Added a pure `filterAndSortLibraryAgons()` helper that filters saved agons by topic or mind text and sorts them by recency, with a safe fallback for invalid timestamps.
- Added vitest coverage for topic search, mind search, newest/oldest recency ordering, immutability, and the invalid-date fallback branch.
- Added client-side search and sort controls to the Pro library view, plus empty-state handling for filtered results.
- Kept the server page thin by letting the client own list rendering and filter state.

## Verification
- `cd website && pnpm exec vitest run src/lib/__tests__/library-filter.test.ts`
  - Result: `5 passed`
- `cd website && pnpm exec eslint src/app/library/page.tsx src/app/library/LibraryClient.tsx src/lib/library-filter.ts src/lib/__tests__/library-filter.test.ts`
  - Result: passed with no lint errors
- `cd website && pnpm build`
  - Result: passed
- `cd website && pnpm coverage`
  - Result: `23 passed` across `4` files; `src/lib/library-filter.ts` recorded in `coverage/lcov.info` with `100%` lines and `100%` branches
