# Change Summary

- Task: `725d21a6-fba4-4d6e-9d4b-82dcd8466739`
- Branch: `wanman/api-agon-contract-tests`
- Commit: `pending`
- PR: `https://github.com/edwardyen724-g/consult-the-dead/pull/85`

## Files Changed

- `website/vitest.config.ts`
- `website/src/app/api/agon/route.test.ts`

## What Changed

- Removed the blanket `src/app/**` Vitest coverage exclusion so route handlers can be measured.
- Added route coverage cases for:
  - allowed Vercel preview origins
  - free-tier mind-count validation copy
  - pro-tier mind-count validation copy

## Verification

- `pnpm --dir website coverage`
  - Passed: 25 test files, 282 tests.
  - `src/app/api/agon/route.ts` now reports `100%` line coverage and `89.47%` branch coverage.
- `pnpm --dir website lint`
  - Passed with existing repository warnings only.
- `pnpm --dir website build`
  - Failed in pre-existing dirty-tree code at `website/src/lib/sitemap-data.ts:201` with a TypeScript `changeFrequency` type mismatch.
