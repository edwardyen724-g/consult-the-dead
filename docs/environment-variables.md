# Environment Variables Reference

This document describes all environment variables used in Consult The Dead for development, CI, and production deployments.

## Variable Categories

- **Required for all environments**: Core API keys and secrets
- **Optional for dev/test**: Monitoring and error tracking (app runs without these)
- **Required for production**: All monitoring, error tracking, and observability

---

## Core API Keys (All Environments)

### ANTHROPIC_API_KEY

**Where**: Local `.env.local` (dev), Vercel env vars (CI and production)
**Required for**: Framework validation, LLM calls in Framework Forge
**Format**: `sk-ant-...` (Anthropic API key)
**How to get**: [Anthropic Console → API Keys](https://console.anthropic.com/account/keys)

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

## Monitoring & Observability (Optional for Dev/Test, Required for Production)

### Sentry Error Monitoring

All Sentry variables are optional in development — the SDK no-ops gracefully when missing. For production, set all five variables.

#### NEXT_PUBLIC_SENTRY_DSN

**Where**: Vercel env vars (Production), optional in dev
**Required for**: Client-side error capture in browser
**Format**: `https://<publicKey>@<orgId>.ingest.sentry.io/<projectId>`
**Visibility**: Public (embedded in browser bundle)
**How to get**: 
1. Go to [sentry.io](https://sentry.io) → your project
2. Click **Settings** → **Client Keys (DSN)**
3. Copy the DSN value

```bash
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

#### SENTRY_DSN

**Where**: Vercel env vars (Production), optional in dev
**Required for**: Server-side error capture (API routes, Server Actions, SSR)
**Format**: Same format as `NEXT_PUBLIC_SENTRY_DSN`
**Visibility**: Secret (never in browser)
**Notes**: Can be the same DSN value as `NEXT_PUBLIC_SENTRY_DSN` if using one shared project

```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

#### SENTRY_ORG

**Where**: Vercel env vars (Production, CI), optional in dev
**Required for**: Sourcemap uploads during `next build`
**Format**: Organization slug from Sentry dashboard (e.g., `consultthedead`)
**How to get**: [sentry.io](https://sentry.io) → **Settings** → **Organization** → copy slug from URL

```bash
SENTRY_ORG=consultthedead
```

#### SENTRY_PROJECT

**Where**: Vercel env vars (Production, CI), optional in dev
**Required for**: Sourcemap uploads during `next build`
**Format**: Project slug from Sentry dashboard (e.g., `consult-the-dead`)
**How to get**: [sentry.io](https://sentry.io) → your project → URL slug

```bash
SENTRY_PROJECT=consult-the-dead
```

#### SENTRY_AUTH_TOKEN

**Where**: Vercel env vars (Production, CI), optional in dev
**Required for**: Authenticating sourcemap uploads (CI builds only)
**Format**: `sntrys_...` (Sentry Auth Token)
**Visibility**: Secret (never exposed in client)
**How to get**: 
1. Go to [sentry.io](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **Create New Token**
3. Scopes needed: `project:releases`, `org:read`

```bash
SENTRY_AUTH_TOKEN=sntrys_your-token-here
```

**See also**: [Sentry Smoke Test Runbook](runbooks/sentry-smoke-test.md)

---

## External Uptime Monitoring (Optional)

These variables are used by third-party monitoring services (UptimeRobot, Updown.io) — not directly by the application. They're stored in the monitoring service account, not in Vercel env vars.

**Services supported**:
- UptimeRobot
- Updown.io
- Statuspage
- Any HTTP(S) monitor that supports JSON response checks

**What you'll configure in the monitoring service**:
- **URL**: `https://consultthedead.com/api/health`
- **Method**: `GET`
- **Expected HTTP Code**: `200`
- **Check Interval**: `5` or `10` minutes
- **Timeout**: `30` seconds
- **Retries**: `2`

**See also**: [External Uptime Monitoring Runbook](runbooks/external-uptime-monitoring.md)

---

## Development / Testing Only

### LOCAL_DATABASE_URL (Optional)

Used when running tests or development against a local/staging database.

```bash
LOCAL_DATABASE_URL=postgresql://user:password@localhost:5432/consult_the_dead_dev
```

---

## Environment Variable Validation

### For local development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your local values (at minimum: ANTHROPIC_API_KEY)
```

### For CI (GitHub Actions)

These variables are typically stored as GitHub repository secrets and injected at build time:
- `ANTHROPIC_API_KEY`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

See `.github/workflows/*.yml` for how they're used.

### For production (Vercel)

Go to **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables** and add:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

Vercel automatically provides:
- `VERCEL_GIT_COMMIT_SHA` (deployment git sha)
- `VERCEL_ENV` (production, preview, development)
- And others — see [Vercel System Environment Variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with "Cannot find module '@anthropic-ai/sdk'" | `npm install` missing dependencies; check `website/package.json` |
| Sentry sourcemaps not uploading | Check `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` in Vercel; re-deploy |
| Health endpoint returns 500 | Check API logs; ensure database/external services are accessible |
| Monitoring shows all checks failing | Verify endpoint is publicly accessible; check Vercel Function logs |

---

## Related Documentation

- [Sentry Smoke Test Runbook](runbooks/sentry-smoke-test.md) — Verify error monitoring is working
- [External Uptime Monitoring Runbook](runbooks/external-uptime-monitoring.md) — Set up and verify uptime checks
- [Production Release Playbook](runbooks/production-release-playbook.md) — Pre-release checklist
- [Runbooks Index](runbooks/index.md) — All operational runbooks
