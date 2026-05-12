# Retention Email Cron Runbook

**Purpose:** operator guide for the retention-email scheduler contract and its launch/rollback checks  
**Canonical source of truth:** [`docs/retention-email-sequence.md`](../retention-email-sequence.md)  
**Manifest route:** [`GET /api/cron/retention-email`](../../website/src/app/api/cron/retention-email/route.ts)

Use this runbook when:

- preparing a release note for the retention-email launch state
- rotating cron credentials
- changing retention copy, featured-debate metadata, or suppression rules
- validating a scheduler change before enabling production traffic

## Contract

The manifest route returns the exact operator inventory that the scheduler must honor:

- `POST /api/webhooks/clerk` for welcome emails
- `GET /api/cron/first-agon-recap` for the first-agon recap
- `GET /api/cron/retention-emails/nudge` for the daily nudge
- `GET /api/cron/retention-emails/digest` for the weekly digest

The manifest also records the canonical auth modes:

- manual production calls use `Authorization: Bearer <CRON_SECRET>`
- the deployed scheduler may send `x-vercel-cron: 1`
- `dryRun=1` is the safe local smoke path

The digest smoke path is deterministic by design:

- if the digest route is called with `dryRun=1` before `FEATURED_AGON_*` is configured, it injects placeholder featured metadata and still returns a successful smoke summary
- if the digest route is called without `dryRun=1` and any `FEATURED_AGON_*` variable is missing, it fails closed with HTTP 500

## Required Environment

Before enabling production scheduling, verify these values are present in the deployment environment:

| Variable | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | all sends | Resend delivery |
| `CRON_SECRET` | manual production calls | Bearer token for prod auth |
| `FEATURED_AGON_TOPIC` | digest | Featured topic copy |
| `FEATURED_AGON_CONSENSUS` | digest | Featured consensus excerpt |
| `FEATURED_AGON_SHARE_ID` | digest | Public share slug used in CTA links |
| `NEW_MIND_NAME` | digest, optional | Only when a new mind ships that week |
| `NEW_MIND_TAGLINE` | digest, optional | Optional digest block copy |
| `NEW_MIND_HOW_ARGUES` | digest, optional | Optional digest block copy |

## Preflight

1. Open the manifest route and confirm the returned JSON matches the current contract.
2. Confirm the scheduler config in Vercel or the external scheduler points at the same inventory.
3. Confirm the digest metadata env vars are populated if the weekly digest is going live.
4. Confirm the rollback owner knows how to disable the external scheduler before making copy changes.

## Smoke Check

Run these from a shell with the deployment URL in `BASE_URL`:

```bash
BASE_URL="https://www.consultthedead.com"

curl -sS "$BASE_URL/api/cron/retention-email" | jq .
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/api/cron/retention-emails/nudge?dryRun=1" | jq .
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/api/cron/retention-emails/digest?dryRun=1" | jq .
```

Pass criteria:

- the manifest returns HTTP 200 and `Cache-Control: no-store`
- the manifest JSON includes the four inventory rows above
- the dry-run calls return 200 without sending Resend traffic
- the dry-run summaries show the expected `scanned`, `sent`, and `suppressed` keys
- the digest dry-run remains deterministic even when `FEATURED_AGON_*` is unset, while the production route still returns 500 without those env vars

## Rollback

If the scheduler or copy needs to be backed out:

1. Disable the external scheduler entries for the retention-email inventory.
2. Rotate `CRON_SECRET` if a bad production invocation may have escaped.
3. Remove or correct the `FEATURED_AGON_*` digest metadata if the digest content is wrong.
4. Re-run the manifest and dry-run smoke checks after the rollback.

## Release-Note Checklist

When a release note cites this surface, confirm the note says:

- the manifest route is the canonical operator contract
- the schedule is owned externally, not in repo
- recap, nudge, and digest are the cron-fired email sends
- welcome remains webhook-driven through Clerk `user.created`
