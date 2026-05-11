# Change Summary

## Task
Harden Agora/pricing canonical metadata and social-preview coverage.

## Changed Files
- `website/src/app/agora/layout.tsx`
- `website/src/app/agora/layout.test.ts`
- `website/src/app/agora/a/[id]/page.tsx`
- `website/src/app/agora/a/[id]/page.test.tsx`
- `website/src/app/agora/a/[id]/lib.test.ts`
- `website/src/app/agora/a/[id]/opengraph-image.tsx`
- `website/src/app/agora/a/[id]/opengraph-image.test.tsx`
- `website/src/app/agora/a/[id]/twitter-image.tsx`
- `website/src/app/agora/a/[id]/twitter-image.test.tsx`
- `website/src/app/pricing/layout.tsx`
- `website/src/app/pricing/layout.test.ts`

## What Changed
- Added explicit `openGraph` and `twitter` metadata to the Agora app shell so `/agora` no longer relies on root-layout inheritance for title, description, or share-indexing behavior.
- Extended the Agora public share page metadata to emit canonical OG/Twitter `images`, explicit index/follow robots rules, and the live share URL derived from the resolved `share_id`.
- Added regression tests for the Agora app shell, the public share metadata contract, the public share page render path, and the Agora OG/Twitter image handlers.
- Tightened the Agora helper coverage to exercise malformed research payloads, slug fallback rendering, long-topic truncation, and blank-topic share-description fallback branches.
- Added explicit canonical OG/Twitter image URLs and robots metadata to the pricing layout, plus assertions that lock the metadata contract in CI.

## Verification
- `cd website && npm run coverage -- --run 'src/app/agora/layout.test.ts' 'src/app/agora/a/[id]/lib.test.ts' 'src/app/agora/a/[id]/page.test.tsx' 'src/app/agora/a/[id]/opengraph-image.test.tsx' 'src/app/agora/a/[id]/twitter-image.test.tsx' 'src/app/pricing/layout.test.ts' 'src/app/pricing/opengraph-image.test.tsx' 'src/app/pricing/twitter-image.test.tsx' 'src/lib/og-image-url.test.ts' 'src/lib/pricing-copy.test.ts' --coverage.include='src/app/agora/layout.tsx' --coverage.include='src/app/agora/a/[id]/lib.ts' --coverage.include='src/app/pricing/layout.tsx' --coverage.include='src/app/pricing/opengraph-image.tsx' --coverage.include='src/app/pricing/twitter-image.tsx' --coverage.include='src/lib/og-image-url.ts'`
  - Passed: 10 test files, 83 tests, 100% lines, 96.39% branches on the narrowed include set.
- `cd website && npm run lint -- 'src/app/agora/layout.tsx' 'src/app/agora/layout.test.ts' 'src/app/agora/a/[id]/page.tsx' 'src/app/agora/a/[id]/page.test.tsx' 'src/app/agora/a/[id]/opengraph-image.tsx' 'src/app/agora/a/[id]/opengraph-image.test.tsx' 'src/app/agora/a/[id]/twitter-image.tsx' 'src/app/agora/a/[id]/twitter-image.test.tsx' 'src/app/agora/a/[id]/lib.test.ts' 'src/app/pricing/layout.tsx' 'src/app/pricing/layout.test.ts' 'src/app/pricing/opengraph-image.tsx' 'src/app/pricing/opengraph-image.test.tsx' 'src/app/pricing/twitter-image.tsx' 'src/app/pricing/twitter-image.test.tsx'`
  - Passed cleanly after removing one unused import warning.
