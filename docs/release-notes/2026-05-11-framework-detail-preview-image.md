# Framework Detail Preview-Image Rollout - Release State (2026-05-11)

## What shipped

The framework detail route now ships route-scoped social preview images for
`/frameworks/[slug]`:

1. **`website/src/app/frameworks/[slug]/opengraph-image.tsx`** renders a
   dynamic Open Graph card for each allowed framework slug.
2. **`website/src/app/frameworks/[slug]/twitter-image.tsx`** re-exports the
   Open Graph composition so the Twitter/X preview stays byte-for-byte aligned
   with the canonical card.
3. **`website/src/app/frameworks/[slug]/page.tsx`** publishes matching
   `openGraph` and `twitter` metadata for the detail page itself, so the share
   contract is owned by the route instead of inherited from the root layout.

The shipped contract is deliberately route-specific:

- allowed slugs are pre-rendered from `ALLOWED_SLUGS`
- `dynamicParams` stays `false`
- the image handlers run in `nodejs`
- the images revalidate hourly
- the image alt text is `A framework detail card from Consult The Dead`

The Open Graph card uses the framework record to render the selected mind,
its domain, a perceptual-lens excerpt, the construct count, and the incident
count. If the framework record is missing, the image handler falls back to the
generic Consult The Dead card instead of throwing.

## Public Contract

The user-visible behavior is now:

- sharing `/frameworks/[slug]` produces a framework-specific OG/Twitter card
- Twitter/X uses the same rendered composition as Open Graph
- the detail page metadata points at the live framework URL
- the contract is stable for the supported roster and intentionally narrow

That keeps the framework detail pages consistent with the broader publication
system while avoiding a second, drift-prone preview-image implementation.

## Smoke Check

See the new smoke runbook:

- [`docs/runbooks/framework-detail-preview-image-smoke.md`](../runbooks/framework-detail-preview-image-smoke.md)

Use that runbook to confirm the generated image routes return `image/png`,
render the same bytes for Open Graph and Twitter/X, and expose the expected
framework-specific metadata on the detail page.

## Status

Ready for promotion after smoke capture.

