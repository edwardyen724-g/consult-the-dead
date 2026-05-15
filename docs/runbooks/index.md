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

## Reels

- [Daily Reel/Content Ops Checklist](daily-reel-ops-checklist.md)
  - Morning execution checklist for Edward to review reel, content, and release state before the day starts

- [Reel Analytics Summary Template](reel-analytics-summary-template.md)
  - First-pass review template for Phase 5 Instagram Insights reports and the cadence for checking them

## Pricing

- [Pricing Copy Smoke Runbook](pricing-copy-smoke-runbook.md)
  - Verifies live pricing page copy matches the finalized pricing contract in `docs/pricing.md`
  - Covers tier copy (Free/Pro/BYO), OG/Twitter metadata, canonical URL, and upsell surface copy
  - Run after any deployment touching `website/src/app/pricing/` or upsell components

## Infrastructure & Monitoring

- [External Uptime Monitoring](external-uptime-monitoring.md)
  - Sets up and verifies third-party uptime monitoring for `/api/health`
  - Covers UptimeRobot, Updown.io, or equivalent services
  - Includes alert setup and testing procedures

- [Sentry Smoke Test](sentry-smoke-test.md)
  - Verifies Sentry error monitoring is wired correctly after a production deploy
  - Run once after initial Sentry setup, and after any changes to
    `sentry.client.config.ts` or `sentry.server.config.ts`

- [Database Backup & Restore](database-backup-restore.md)
  - Operational guide for database backup and recovery procedures
  - Covers automated backups, manual snapshots, and restore verification

## Observability

- [Founder Checkpoint Metrics Pull](founder-checkpoint-metrics-pull.md)
  - Retrieves live founder metrics from Stripe subscriptions and Vercel Web Analytics
  - Covers subscriber counts plus acquisition-channel reporting for the founder retro

## Deployment & Release

- [Pre-Deployment Checklist](../pre-deployment-checklist.md)
  - Verification checklist before production release
  - Covers code quality, framework validation, docs, env vars, smoke tests

- [Release & Rollback Playbook](../release-and-rollback-playbook.md)
  - CTO guide for production releases and emergency rollback
  - Vercel one-click rollback and monitoring procedures

## Reference Guides

- [Environment Variables Reference](../environment-variables.md)
  - Complete list of required and optional environment variables
  - Setup instructions for local dev and production
  - Security best practices
