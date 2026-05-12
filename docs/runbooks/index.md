# Runbooks Index

Operational smoke-test and rollout runbooks for Consult The Dead. Run these
after deployments touching the relevant feature areas.

## Agora

- [Agora First-Agon Smoke](agora-first-agon-smoke.md) — PR #115 (onboarding friction fixes)
  - Verifies the free-tier end-to-end path, 4th-mind cap upsell banner, and
    multi-pack accordion on `/agora`
  - Run after any deployment touching `website/src/app/agora/`,
    `website/src/lib/agon/councilHelpers.ts`, or `website/src/components/agora/`

- [Public Agora Share Page Smoke](public-agora-share-page-smoke.md) — PRs #105, #8, #36
  - Verifies loading state, share-result flow, and public transcript page (`/agora/a/<id>`)

## Email

- [Email Send Smoke Test](email-smoke-test.md)
  - Verifies Resend delivers email for the Clerk welcome path and any manual
    trigger via `POST /api/webhooks/clerk`
  - Run after any deployment touching the email or webhook layer

- [Retention Email Cron](retention-email-cron.md)
  - Operator guide for the retention-email scheduler contract
  - Covers launch/rollback checks for `GET /api/cron/retention-email`

## Frameworks

- [Framework Detail Preview-Image Smoke](framework-detail-preview-image-smoke.md)
  - Verifies the `/frameworks/[slug]` OG/Twitter preview-image contract before
    promoting the release-state note

- [Framework Forge Pipeline Smoke](framework-forge-pipeline-smoke.md)
  - Verifies the live `python -m framework_forge.pipeline` end-to-end flow:
    source discovery, source-text materialization, reconstruction, validation,
    and optional floor-check persistence

## Funnel

- [Funnel Surface Rollout](funnel-surface-rollout.md) — PRs #121, #125
  - Covers the quiz CTA (header) and footer CTA rollout verification

## Infrastructure

- [Sentry Smoke Test](sentry-smoke-test.md)
  - Verifies Sentry error monitoring is wired correctly after a production deploy
  - Run once after initial Sentry setup, and after any changes to
    `sentry.client.config.ts` or `sentry.server.config.ts`
