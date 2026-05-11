# Change Summary

## Task
- Add dynamic OG/Twitter images for `/listicles/[slug]` share cards.

## Files Changed
- `website/src/lib/listicle-content.ts`
- `website/src/lib/__tests__/listicle-content.test.ts`
- `website/src/app/listicles/[slug]/page.tsx`
- `website/src/app/listicles/[slug]/page.test.tsx`
- `website/src/app/listicles/[slug]/opengraph-image.tsx`
- `website/src/app/listicles/[slug]/twitter-image.tsx`
- `website/src/app/listicles/[slug]/opengraph-image.test.tsx`

## What Changed
- Added shared listicle share-card helpers for image URLs, card copy, and fallback behavior.
- Updated `/listicles/[slug]` metadata to use `summary_large_image` and explicit OG/Twitter image URLs.
- Added a dynamic Open Graph image route and a matching Twitter route that reuses the same visual composition.
- Added tests for helper copy, image URL generation, page metadata, and the image route rendering contract.

## Verification
- `npm run test -- src/lib/__tests__/listicle-content.test.ts 'src/app/listicles/[slug]/page.test.tsx' 'src/app/listicles/[slug]/opengraph-image.test.tsx'`
- `npm run coverage -- src/lib/__tests__/listicle-content.test.ts 'src/app/listicles/[slug]/page.test.tsx' 'src/app/listicles/[slug]/opengraph-image.test.tsx'`
- `npx eslint src/lib/listicle-content.ts src/lib/__tests__/listicle-content.test.ts 'src/app/listicles/[slug]/page.tsx' 'src/app/listicles/[slug]/page.test.tsx' 'src/app/listicles/[slug]/opengraph-image.tsx' 'src/app/listicles/[slug]/opengraph-image.test.tsx' 'src/app/listicles/[slug]/twitter-image.tsx'`
- `npx next build --webpack`

## Notes
- `npm run lint` fails on a pre-existing repo issue in `website/src/app/worked-example.tsx`.
- `npm run build` with the default Turbopack path hits an environment-level symlink panic; the webpack build path succeeds.
