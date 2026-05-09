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
