# Release-State Index

Use this index as the promotion queue for release-state notes that are ready to
move into broader launch docs or changelog coverage once the smoke evidence is
captured.

## Pending Promotion

_(none)_

## Promoted

- `2026-05-12` - [Vercel PR Preview Rate Limit](2026-05-12-vercel-preview-rate-limit.md) — PR #371
  - Verified preview blocker: `Vercel FAILURE: upgradeToPro=build-rate-limit` and `Resource is limited - try again in 24 hours (code: api-deployments-free-per-day)`
  - CI passes independently; this is a Vercel free-tier quota issue, not an application regression
  - Unblock path: wait for the 24-hour reset or move off the free-tier deployment limit

- `2026-05-12` - [Decisions Expansion Wave 2](2026-05-12-decisions-expansion-wave2.md)
  - Batches 3–7: 15 new `should-i-*` decisions pages (PRs #313, #320, #326, #355, and 2026-05-12 batch)
  - Decisions library now 24 pages total; all slugs confirmed shipped in `website/content/decisions.ts`
  - Framework validation pipeline ships (PR #322); 8 frameworks validated; live roster 19 → 26
  - Sitemap updated (PR #321); all 24 decisions pages crawlable

- `2026-05-12` - [Decisions Five-Page Expansion](2026-05-12-decisions-expansion.md) — PR #292
  - Five new decisions pages: fire-my-cofounder, pivot-or-persist, take-this-job-offer, sell-my-startup, shut-down-my-startup
  - Decisions library now 12 pages total (7 pre-existing + 5 new)
  - Each page targets high-intent founder search queries
  - Route regression test added; branch coverage ≥98.2%

- `2026-05-11` - [Onboarding Friction Fixes](2026-05-11-onboarding-friction-fixes.md) — PR #115
  - Multi-pack accordion: opens every pack with a smart-suggested mind on first render
  - 4th-mind cap upsell: amber inline banner when a free user taps a 4th mind
  - Council helpers extracted to `councilHelpers.ts` with 20 unit tests
  - Smoke captured 2026-05-12; 71/71 automated tests pass; critical-path checks pass
  - No regressions detected

- `2026-05-11` - [Framework Detail Preview Images](2026-05-11-framework-preview-images.md) — PR #110, #71, #176
  - Dynamic OG/Twitter preview images for every `/frameworks/[slug]` detail page
  - PR #176 fixed canonical URL drift (framework-page now emits slug-scoped canonical)
  - 7 regression tests lock the canonical URL contract
  - All known gaps resolved: Seneca portrait (task 2d2162d0) and canonical URL (PR #176)

- `2026-05-11` - [Framework Detail Preview-Image Rollout](2026-05-11-framework-detail-preview-image.md)
  - Framework detail pages now have OG/Twitter preview images (PR #110, PR #71)
  - Route-scoped `/frameworks/[slug]` OG/Twitter preview-image behavior
  - Smoke captured 2026-05-11; route pipeline confirmed live
  - CHANGELOG coverage recorded 2026-05-11 (PR #136)
  - All gaps resolved: ~~Seneca portrait asset (404)~~ (task 2d2162d0); ~~framework-page canonical URL drift~~ (PR #232)

- `2026-05-11` - [Agora Mobile Hardening](2026-05-11-agora-mobile-hardening.md) — PR #168, #179
  - Responsive CSS fixes for `/agora` on mobile viewports (375px+)
  - `NoticePanel` component for inline error/empty states
  - Next.js `error.tsx` boundary for the `/agora` route
  - 28 regression tests added (PR #179); PR #168 pending CTO merge

- `2026-05-11` - [Auth Noindex Metadata](2026-05-11-auth-noindex-metadata.md) — PR #147
  - Sign-in and sign-up routes emit `robots: noindex, nofollow`
  - Both auth pages converted to server components for metadata export
  - CHANGELOG coverage recorded 2026-05-11 (PR #147)

- `2026-05-11` - [Frameworks Index OG/Twitter Preview Image](2026-05-11-frameworks-index-og-image.md) — PR #146
  - Static OG and Twitter preview-image routes for the `/frameworks` index page
  - CHANGELOG coverage recorded 2026-05-11 (PR #146)

- `2026-05-10` - [Agora Consultation Entry — Loading/Error Boundary](2026-05-10-agora-consultation-entry-loading-error.md) — PR #105
  - Loading and not-found surfaces split for Agora consultation entry
  - CHANGELOG coverage recorded 2026-05-11 (PR #105)

- `2026-05-10` - [Agora Guided Progress Cue](2026-05-10-agora-guided-progress-cue.md) — PR #105
  - `AgoraLoading` progress-cue component introduced
  - CHANGELOG coverage recorded 2026-05-11 (PR #105)
