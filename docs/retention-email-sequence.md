# Retention Email Sequence

**Status:** Canonical source of truth  
**Last updated:** 2026-05-10  
**Canonical operator manifest:** [`GET /api/cron/retention-email`](../website/src/app/api/cron/retention-email/route.ts)

This document defines the retention-email lifecycle, the scheduler inventory, and the suppression rules that the cron runbook and release-note workflow must follow.

## Sequence Overview

The retention system is split into one operator manifest and four send surfaces:

| Surface | Route / trigger | Cadence | Purpose |
|---|---|---|---|
| Welcome | `POST /api/webhooks/clerk` on Clerk `user.created` | Immediate | Welcome new users after signup |
| Recap | `GET /api/cron/first-agon-recap` | T+1h after the first agon completes | Re-engage users after their first debate |
| Nudge | `GET /api/cron/retention-emails/nudge` | Daily at 9:00 AM PT | Recover users who signed up but never ran a debate |
| Digest | `GET /api/cron/retention-emails/digest` | Weekly on Sundays at 9:00 AM PT | Re-engage eligible subscribers with a featured debate |

The manifest route returns this inventory as JSON so operators can verify the launch contract without reading implementation files.

## Scheduler Metadata

| Field | Value |
|---|---|
| Operator manifest route | `GET /api/cron/retention-email` |
| Manifest method | `GET` |
| Canonical doc | `docs/retention-email-sequence.md` |
| Production auth | `Authorization: Bearer <CRON_SECRET>` |
| Vercel Cron auth | `x-vercel-cron: 1` |
| Local smoke mode | `dryRun=1` |
| External scheduler ownership | Vercel Cron or equivalent scheduler configured outside the repository |

The scheduler is intentionally external. This repo owns the contract and the code paths, but the deployment schedule lives in the scheduler config, not in source.

## Trigger Semantics

### Welcome

- Fires on Clerk `user.created`.
- Sends immediately after signup.
- Never suppressed.

### Recap

- Fires after the user completes their first agon.
- The send is delayed by one hour from `completed_at`.
- Suppress if the user already upgraded, unsubscribed, or hard-bounced before the send executes.

### Nudge

- Fires daily for users whose signup time is in the T-24h +/- 2h window.
- Sends only when the user has run zero agons.
- Suppress Pro subscribers, unsubscribed users, and hard-bounced users.

### Digest

- Fires weekly on Sundays at 9:00 AM PT.
- Sends to all eligible users regardless of agon count.
- Requires featured debate metadata to be populated before a non-dry-run invocation.
- Suppress Pro subscribers, unsubscribed users, and hard-bounced users.

## Suppression Rules

The suppression layer treats these states as blocking for recap, nudge, and digest:

- `subscription_tier === "pro"`
- `email_unsubscribed === true`
- `email_bounce_count >= 2`

Welcome is exempt from suppression because it fires immediately at signup.

## UTM Contract

All retention-email links must preserve the email tracking convention:

- `utm_source=email`
- `utm_campaign=<welcome|recap|nudge|digest>`
- `utm_content=<email_id>`

`email_id` should stay versioned per campaign copy, for example `welcome_v1` or `digest_v1`.

