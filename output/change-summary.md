# Change Summary

## Task
- Add `/feed.xml` RSS feed for debates and insights.

## Files Changed
- `website/src/lib/feed.ts`
- `website/src/lib/feed.test.ts`
- `website/src/app/feed.xml/route.ts`
- `website/src/app/feed.xml/route.test.ts`
- `website/vitest.config.ts`

## What Changed
- Added a pure RSS helper that:
  - builds feed metadata
  - collects debates + insights into a deterministic order
  - escapes XML safely
  - serializes a valid RSS 2.0 document
- Added a `/feed.xml` route that returns RSS XML with public debate and insight links.
- Aligned the helper filenames with the approved `feed.ts` capsule scope.
- Updated coverage config so the targeted route handler is included in coverage output.
- Added vitest coverage for:
  - metadata normalization
  - canonical site URL fallback
  - ordering
  - date fallback
  - XML escaping/serialization
  - route smoke response

## Verification
- `wcx npm test -- src/lib/feed.test.ts src/app/feed.xml/route.test.ts`
- `wcx npm run coverage -- src/lib/feed.test.ts src/app/feed.xml/route.test.ts`
- `wcx npm run lint -- src/lib/feed.ts src/lib/feed.test.ts src/app/feed.xml/route.ts src/app/feed.xml/route.test.ts`
- `wcx npm run build`

## Results
- Vitest: passed
- Coverage: `website/src/lib/feed.ts` reached 100% line/branch coverage; `website/src/app/feed.xml/route.ts` appeared in the report at 100% line coverage
- Lint: passed
- Build: passed
