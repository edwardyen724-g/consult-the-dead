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

Smoke run completed 2026-05-11 against production commit
`4857d03b4c568c4dd841c6f09bc91d9bac119585`. Full evidence artifact:

- `.wanman/agents/devops/output/framework-detail-preview-image-smoke-2026-05-10.md`

Runbook used: [`docs/runbooks/framework-detail-preview-image-smoke.md`](../runbooks/framework-detail-preview-image-smoke.md)

### Smoke Results

| Check | Slug | Result |
| --- | --- | --- |
| Framework page responds | `isaac-newton` | PASS |
| `opengraph-image` route returns `image/png` | `isaac-newton` | PASS |
| `twitter-image` route returns `image/png` | `isaac-newton` | PASS |
| Card renders branded composition | `isaac-newton` | PASS |
| Framework page responds | `seneca` | PASS |
| `opengraph-image` route returns `image/png` | `seneca` | PASS |
| `twitter-image` route returns `image/png` | `seneca` | PASS |
| Card renders portrait-led composition | `seneca` | PASS |

### Known Gaps

1. ~~**Missing Seneca portrait asset**~~ — **Resolved.** `/portraits/seneca-portrait.png`
   was restored (task 2d2162d0). The Seneca card now renders the portrait-led
   composition correctly.
2. **Homepage canonical URL on framework detail pages** — the detail-page HTML
   still emits `https://www.consultthedead.com/` as the canonical URL instead of
   the route-scoped URL. The social metadata (OG/Twitter) is correctly
   route-scoped; the canonical drift is a separate SEO-hygiene gap.

## Status

Smoke captured. Route pipeline is live and functional for the shipped roster.
One known gap remains (framework-page canonical URL) and is tracked as a
follow-up item — not a rollback trigger for the preview-image contract itself.
Seneca portrait asset gap resolved (task 2d2162d0).

Promoted to release-state index on 2026-05-11. CHANGELOG entry recorded
2026-05-11 (PR #136). Shipped via PR #110 and PR #71.

