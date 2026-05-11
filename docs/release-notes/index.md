# Release-State Index

Use this index as the promotion queue for release-state notes that are ready to
move into broader launch docs or changelog coverage once the smoke evidence is
captured.

## Pending Promotion

- `2026-05-11` - [Onboarding Friction Fixes](2026-05-11-onboarding-friction-fixes.md) — PR #115
  - Multi-pack accordion: opens every pack with a smart-suggested mind on first render
  - 4th-mind cap upsell: amber inline banner when a free user taps a 4th mind
  - Council helpers extracted to `councilHelpers.ts` with 20 unit tests
  - Smoke runbook: [`docs/runbooks/agora-first-agon-smoke.md`](../runbooks/agora-first-agon-smoke.md)
  - Status: shipped 2026-05-11; pending smoke-evidence capture before promotion

- `2026-05-11` - [Auth Noindex Metadata](2026-05-11-auth-noindex-metadata.md) — PR #147
  - Sign-in and sign-up routes emit `robots: noindex, nofollow`
  - Both auth pages converted to server components for metadata export
  - Status: shipped 2026-05-11; pending CHANGELOG coverage

- `2026-05-11` - [Frameworks Index OG/Twitter Preview Image](2026-05-11-frameworks-index-og-image.md) — PR #146
  - Static OG and Twitter preview-image routes for the `/frameworks` index page
  - Status: shipped 2026-05-11; pending CHANGELOG coverage

- `2026-05-10` - [Agora Consultation Entry — Loading/Error Boundary](2026-05-10-agora-consultation-entry-loading-error.md) — PR #105
  - Loading and not-found surfaces split for Agora consultation entry
  - Status: shipped 2026-05-10; pending CHANGELOG coverage

- `2026-05-10` - [Agora Guided Progress Cue](2026-05-10-agora-guided-progress-cue.md) — PR #105
  - `AgoraLoading` progress-cue component introduced
  - Status: shipped 2026-05-10; pending CHANGELOG coverage

## Promoted

- `2026-05-11` - [Framework Detail Preview-Image Rollout](2026-05-11-framework-detail-preview-image.md)
  - Framework detail pages now have OG/Twitter preview images (PR #110, PR #71)
  - Route-scoped `/frameworks/[slug]` OG/Twitter preview-image behavior
  - Smoke captured 2026-05-11; route pipeline confirmed live
  - CHANGELOG coverage recorded 2026-05-11 (PR #136)
  - Known gaps: Seneca portrait asset (404); framework-page canonical URL drift
  - Both gaps are follow-up items; preview-image contract is stable

