# Change Summary

## Task

`bef1928e-a79a-4c1f-b22d-24094a31befd` - Refactor the /quiz page to consume the canonical CTR quiz contract

## Files Changed

- `website/src/app/quiz/page.tsx`
- `website/src/app/quiz/page.test.ts`
- `website/src/app/page.tsx`
- `website/src/components/Header.tsx`

## What Changed

- Replaced the quiz page's local decision/tension matrix with the shared `ctr-experiment` route contract and derived page-facing route groups from that canonical source.
- Switched the quiz result CTA to the shared council href builder so the selected council URL is generated the same way as the rest of the app.
- Routed the homepage quiz CTA and the header "Find Your Mind" link through `buildQuizEntryHref()` so guided and direct entry behavior stay aligned with the shared helper.
- Added regression coverage that compares the page-facing quiz matrix against the canonical helper contract and checks the homepage/header quiz entry href constants against the shared entry builder.

## Verification

- `pnpm vitest run src/app/quiz/page.test.ts src/lib/__tests__/ctr-experiment.test.ts` in `website/` - passed
- `pnpm lint` in `website/` - passed with pre-existing warnings only
- `pnpm build` in `website/` - passed
- `pnpm coverage` in `website/` - passed (25 test files, 290 tests)

## Notes

- I left the unrelated pre-existing edits in the worktree untouched.

## Task

`81d75095-56dc-46d1-98a8-f41e4a78fd71` - Lock the transcript share helper contract

## Files Changed

- `website/src/lib/share-transcript.ts`
- `website/src/lib/__tests__/share-transcript.test.ts`

## What Changed

- Added a new transcript-share helper that centralizes the canonical public URL, the generated share text, and the attribution line used by future share-sheet and clipboard surfaces.
- Locked the helper contract to the current public transcript branding with regression coverage for:
  - canonical URL generation from `share_id`
  - site-origin trimming and URL encoding behavior
  - exact share text formatting and attribution string stability
  - fallback handling for blank topics

## Verification

- `pnpm test -- src/lib/__tests__/share-transcript.test.ts` in `website/` - passed
- `pnpm exec eslint src/lib/share-transcript.ts src/lib/__tests__/share-transcript.test.ts` in `website/` - passed

## Notes

- I left the unrelated pre-existing edits in the worktree untouched.

---

## Task

`d829f79c-3a3f-418a-908c-da90d3c04beb` - Make Tier 3 review packet generation deterministic under test

## Files Changed

- `framework_forge/validation/tier3_prep.py`
- `tests/test_validation.py`

## What Changed

- Added optional `rng` and `seed` parameters to `prepare_tier3_materials()` so A/B ordering can be reproduced without changing the packet shape.
- Default behavior remains randomized when neither parameter is provided.
- Added regression coverage for two cases:
  - identical seeds produce identical packet ordering
  - an injected random source controls the A/B assignment sequence directly

## Verification

- `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/.venv/bin/python -m pytest tests/test_validation.py -v` - passed
- `/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/.venv/bin/python -m pytest tests/test_validation.py --cov=framework_forge.validation.tier3_prep --cov-report=term-missing` - passed with 100% coverage for `framework_forge/validation/tier3_prep.py`

## Notes

- I left the unrelated pre-existing edits in `docs/phase0-pricing-page-copy.md`, `framework_forge/encoding/framework.py`, `frameworks/steve-jobs/framework.json`, `tests/test_encoding.py`, `website/src/app/agora/page.tsx`, and the new untracked Agora metadata/page files untouched.

---

## Task

`387bd81b-cb23-4f6e-84c1-9b2e8f47a917` - Fix sitemap-data changeFrequency typing so website build passes

## Files Changed

- `website/src/lib/sitemap-data.ts`
- `website/src/lib/sitemap-data.test.ts`

## What Changed

- Tightened the sitemap helper's mapped entry types so `changeFrequency` stays as the literal union Next expects instead of widening to `string`.
- Applied the same explicit sitemap entry typing to framework, insight, and public agon rows for consistency.
- Added a regression assertion that every emitted public agon sitemap entry keeps `changeFrequency === "weekly"`.

## Verification

- `npm ci` in `website/` - passed
- `npx vitest run src/lib/sitemap-data.test.ts` - passed
- `npm run build` in `website/` - passed

## Notes

- Build emitted an expected runtime warning while fetching public agon rows without `POSTGRES_URL`; the sitemap route caught it and completed successfully.

---

## Task

`cd7c77c1-5c29-4f9c-9902-35742436c8c2` - Add regression coverage for share-id-shaped public library requests

## Files Changed

- `website/src/app/api/library/[id]/route.test.ts`

## What Changed

- Added regression coverage proving share-id-shaped `/api/library/[id]` requests hit `db.getPublicAgonByShareId()` before any Clerk auth fallback.
- Added coverage for the production-visible missing-share case so a public `share_id` miss still returns `404 Not found` instead of silently falling through.
- Added authenticated UUID fallback coverage plus the route’s invalid-id, not-found, and error branches so the contract stays locked down end to end.

## Verification

- `pnpm vitest run 'src/app/api/library/[id]/route.test.ts'` in `website/` - passed
- `pnpm vitest run --coverage --coverage.include='src/app/api/library/[id]/route.ts' 'src/app/api/library/[id]/route.test.ts'` in `website/` - passed with 100% statements, branches, functions, and lines for `website/src/app/api/library/[id]/route.ts`

## Notes

- I left the unrelated pre-existing edits in the worktree untouched.
