# Change Summary

## Task
- Add `/feed.xml` RSS feed for debates and insights.

## Files Changed
- `website/src/lib/rss-feed.ts`
- `website/src/lib/rss-feed.test.ts`
- `website/src/app/feed.xml/route.ts`
- `website/src/app/feed.xml/route.test.ts`

## What Changed
- Added a pure RSS helper that:
  - builds feed metadata
  - collects debates + insights into a deterministic order
  - escapes XML safely
  - serializes a valid RSS 2.0 document
- Added a `/feed.xml` route that returns RSS XML with public debate and insight links.
- Added vitest coverage for:
  - metadata normalization
  - ordering
  - date fallback
  - XML escaping/serialization
  - route smoke response

## Verification
- `wcx npm test -- src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`
- `wcx npm run coverage -- src/lib/rss-feed.test.ts src/app/feed.xml/route.test.ts`
- `wcx npm run lint -- src/lib/rss-feed.ts src/lib/rss-feed.test.ts src/app/feed.xml/route.ts src/app/feed.xml/route.test.ts`
- `wcx npm run build`

## Results
- Vitest: passed
- Coverage: `website/src/lib/rss-feed.ts` reached 100% line coverage in the targeted run
- Lint: passed
- Build: passed
