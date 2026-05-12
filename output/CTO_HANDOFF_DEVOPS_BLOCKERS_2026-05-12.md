# CTO Handoff: DevOps Blockers — Sentry + Uptime Monitoring

**Status**: Two critical DevOps tasks blocked waiting for external credentials  
**Impact**: Production error tracking and uptime alerting cannot be activated  
**Timeline**: Each task is <5 minutes to execute once credentials are provided  
**Prepared by**: DevOps Agent (2026-05-12T23:47Z)  
**Task IDs**: `1cf0c2a8` (Sentry), `2750d5f4` (External Uptime Monitor)

---

## Executive Summary

Both tasks require external credentials that must be obtained through manual account setup or access grants:

1. **Sentry Error Tracking** → Requires 5 environment variables from a Sentry project
2. **External Uptime Monitoring** → Requires API access to a monitoring provider (UptimeRobot, Updown.io, etc.)

All infrastructure, code, and documentation are ready. Execution requires only the credentials.

---

## Task 1: Set SENTRY_DSN in Vercel Production Environment

**Task ID**: `1cf0c2a8`  
**Priority**: P7  
**Status**: In Progress (blocked on credentials)  
**Execution Time**: <5 minutes once credentials are available  
**Runbook**: `docs/runbooks/sentry-smoke-test.md`

### What's Ready

✅ **Code**: Sentry SDK integrated in PR #312  
- Client-side config: `website/sentry.client.config.ts`  
- Server-side config: `website/sentry.server.config.ts`  
- Edge config: `website/sentry.edge.config.ts`  
- Next.js wrapper: `website/next.config.ts` with `tunnelRoute: "/monitoring"`  
- Health endpoint: `website/src/app/api/health/route.ts` (returns 200 with deployment info)

✅ **Documentation**: Complete runbook with step-by-step verification  
- Runbook: `docs/runbooks/sentry-smoke-test.md` (6 verification steps)
- Environment variables guide: `docs/environment-variables.md`
- All configs support graceful no-op when DSN is missing (safe for local dev / CI)

✅ **Verification**: All tests pass, build succeeds, no Sentry-related errors

### What's Needed from CTO

You need to create or access a **Sentry project** and extract these 5 environment variables:

| Variable | Format | Where to Get | Example |
|----------|--------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://<key>@<org>.ingest.sentry.io/<id>` | Sentry → Project Settings → Client Keys | `https://examplePublicKey@o0.ingest.sentry.io/1234567` |
| `SENTRY_DSN` | Same format (can reuse above) | Same as above | `https://examplePublicKey@o0.ingest.sentry.io/1234567` |
| `SENTRY_ORG` | Organization slug | Sentry dashboard URL slug | `consultthedead` |
| `SENTRY_PROJECT` | Project slug | Sentry project URL slug | `consult-the-dead` |
| `SENTRY_AUTH_TOKEN` | `sntrys_...` | Sentry → Settings → Account → API Tokens → Create New | `sntrys_exampletoken123...` |

### Sentry Setup Steps (if not already done)

If you don't have a Sentry project yet:

1. **Create Sentry account** at https://sentry.io (if you don't have one)
2. **Create a project**:
   - Org: Create or use existing org (slug will be used for `SENTRY_ORG`)
   - Project: Select "Next.js" → give it a name like "consult-the-dead" (slug for `SENTRY_PROJECT`)
3. **Copy the DSN**:
   - Go to Project Settings → **Client Keys (DSN)**
   - Copy the DSN value (use for both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`)
4. **Generate Auth Token**:
   - Go to Account Settings → **API Tokens**
   - Click **Create New Token**
   - Scopes: `project:releases`, `org:read`
   - Copy the token (use for `SENTRY_AUTH_TOKEN`)

### How to Set in Vercel

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables** (Production only)
2. Add these 5 variables:

```
NEXT_PUBLIC_SENTRY_DSN = https://examplePublicKey@o0.ingest.sentry.io/1234567
SENTRY_DSN = https://examplePublicKey@o0.ingest.sentry.io/1234567
SENTRY_ORG = consultthedead
SENTRY_PROJECT = consult-the-dead
SENTRY_AUTH_TOKEN = sntrys_exampletoken123...
```

3. **Redeploy** the application (Vercel will use the new env vars)
4. Once deployment is live, run the smoke test (see next section)

### Execution Checklist (Once You Provide Credentials)

DevOps will execute these steps:

- [ ] **Step 1**: Verify `/api/health` returns HTTP 200 + JSON (no DB required, <50ms)
- [ ] **Step 2**: Build without credentials (ensure build succeeds without DSN)
- [ ] **Step 3**: Test client-side error capture via Sentry "Send test event" button
- [ ] **Step 4**: Test server-side error capture via temporary throwable endpoint
- [ ] **Step 5**: Verify Sentry dashboard sections (Issues, Performance, Replays, Sessions)
- [ ] **Step 6**: Verify `/monitoring` tunnel route is reachable

**Expected Results**: All test errors appear in Sentry Issues, sourcemaps are readable (not minified), session replays captured on error.

---

## Task 2: Verify External Uptime Monitor and Record Launch Proof

**Task ID**: `2750d5f4`  
**Priority**: P6  
**Status**: In Progress (blocked on credentials)  
**Execution Time**: 10–15 minutes once provider is configured  
**Runbook**: `docs/runbooks/external-uptime-monitoring.md`

### What's Ready

✅ **Health Endpoint**: `/api/health` is deployed and responds with HTTP 200  
✅ **Documentation**: Complete runbook with step-by-step setup and verification  
✅ **Runbook**: `docs/runbooks/external-uptime-monitoring.md` (6 setup steps)  
✅ **Output Directory**: Ready to record verification results and alert test

### What's Needed from CTO

Choose a monitoring provider and set up the monitoring (you have options):

#### Option 1: UptimeRobot (Recommended for simplicity)

1. **Create account** at https://uptimerobot.com (free tier available)
2. **Create a monitor**:
   - Monitor Type: `HTTP(S)`
   - URL: `https://consultthedead.com/api/health`
   - Method: `GET`
   - Expected HTTP Code: `200`
   - Check Interval: `5` or `10` minutes
   - Timeout: `30 seconds`
   - Retries: `2`
3. **Configure alerts**:
   - Add email recipient(s) or Slack webhook
   - Enable "Down" alerts and "Up" alerts

#### Option 2: Updown.io

1. Create account at https://updown.io
2. Similar monitor setup
3. Configure webhook or email alerts

#### Option 3: Statuspage.io / Better Uptime / etc.

Any HTTP(S) monitoring service with JSON response checks and alert webhooks works.

### Execution Checklist (Once You Provide Access)

DevOps will execute:

- [ ] **Step 1**: Verify `/api/health` returns 200 + expected JSON from internet
- [ ] **Step 2**: Log into monitoring service and confirm monitor shows "Up"
- [ ] **Step 3**: Trigger a test alert (via "Send test alert" or by temporarily disabling endpoint)
- [ ] **Step 4**: Verify alert arrives in configured channel (email/Slack)
- [ ] **Step 5**: Review uptime dashboard (should show ~100% uptime for new monitor)
- [ ] **Step 6**: Document setup in `output/UPTIME_MONITOR_VERIFICATION.md`

**Expected Results**: Monitor shows green "Up" status, test alert fires and is received, response times are <1 second.

---

## Prerequisites for Both Tasks

✅ **Code**: All Sentry and health endpoint code is merged and live  
✅ **Tests**: All tests pass (99.58% coverage)  
✅ **CI**: All CI checks pass (lint, build, test)  
✅ **Production**: Application is deployed and stable

---

## Timeline

| When | What |
|------|------|
| **Now (2026-05-12)** | DevOps stands by with runbooks ready; awaiting credentials |
| **Once credentials received** | DevOps executes smoke tests and verification <5 min (Sentry) + 10 min (Uptime) |
| **Post-verification** | Metrics pull begins (founder checkpoint metrics) and alerting is active |

---

## Questions or Clarifications

If you need:
- **Sentry setup help**: See `docs/environment-variables.md` (Sentry section) or ask in #devops
- **Runbook walkthrough**: See `docs/runbooks/sentry-smoke-test.md` or `docs/runbooks/external-uptime-monitoring.md`
- **Vercel env var setup**: See `docs/environment-variables.md` (Production Environment Variables section)

---

## Related Documentation

- `docs/environment-variables.md` — Full reference for all env vars
- `docs/runbooks/sentry-smoke-test.md` — Step-by-step Sentry verification
- `docs/runbooks/external-uptime-monitoring.md` — Step-by-step uptime monitoring verification
- `docs/runbooks/index.md` — All operational runbooks
- `website/sentry.client.config.ts` — Client-side Sentry config
- `website/sentry.server.config.ts` — Server-side Sentry config
- `website/next.config.ts` — Next.js Sentry wrapper with tunnelRoute setup
