# Release-State Index

Use this index as the promotion queue for release-state notes that are ready to
move into broader launch docs or changelog coverage once the smoke evidence is
captured.

## Pending Promotion

_(none)_

## Promoted

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

- `2026-05-11` - [Framework Detail Preview-Image Rollout](2026-05-11-framework-detail-preview-image.md)
  - Framework detail pages now have OG/Twitter preview images (PR #110, PR #71)
  - Route-scoped `/frameworks/[slug]` OG/Twitter preview-image behavior
  - Smoke captured 2026-05-11; route pipeline confirmed live
  - CHANGELOG coverage recorded 2026-05-11 (PR #136)
  - All gaps resolved: ~~Seneca portrait asset (404)~~ (task 2d2162d0); ~~framework-page canonical URL drift~~ (PR #232)

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
