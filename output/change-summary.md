# Change Summary

## Task
Restore `/pricing` OG/Twitter preview image routes and regression coverage.

## Changed Files
- `website/src/app/pricing/opengraph-image.tsx`
- `website/src/app/pricing/twitter-image.tsx`
- `website/src/app/pricing/opengraph-image.test.tsx`
- `website/src/app/pricing/twitter-image.test.tsx`

## What Changed
- Restored explicit `/pricing/opengraph-image.tsx` and `/pricing/twitter-image.tsx` route files.
- Added a dedicated pricing share-card composition that mirrors the canonical pricing copy and renders a 1200x630 social preview.
- Locked the routes with regression tests for route metadata, OG/Twitter alignment, and rendered pricing copy.

## Verification
- `./node_modules/.bin/vitest run src/app/pricing/opengraph-image.test.tsx src/app/pricing/twitter-image.test.tsx src/app/pricing/layout.test.ts`
  - Passed: 3 files, 7 tests.
- `./node_modules/.bin/vitest run --coverage`
  - Passed: 72 files, 795 tests, 100% coverage across the configured include set.
- `./node_modules/.bin/eslint .`
  - Passed with existing repository warnings only; no errors.
