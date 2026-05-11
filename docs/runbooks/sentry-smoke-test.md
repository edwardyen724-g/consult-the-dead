# Sentry Smoke-Test Runbook

**Purpose**: Verify Sentry error monitoring is wired up correctly after a production deploy.

**Frequency**: Run once after the initial Sentry project setup, and again after any changes to `sentry.client.config.ts` or `sentry.server.config.ts`.

---

## Prerequisites

- Sentry project created at [sentry.io](https://sentry.io)
- `NEXT_PUBLIC_SENTRY_DSN` set in Vercel project settings (Production environment)
- `SENTRY_AUTH_TOKEN` set in Vercel project settings (for sourcemap uploads — optional for smoke test)
- App deployed to production (`consultthedead.com` or a preview URL)

---

## Step 1 — Verify /api/health returns 200

```bash
# Replace with your actual domain or preview URL
BASE_URL=https://consultthedead.com

curl -sf "$BASE_URL/api/health" | jq .
```

Expected response (shape — exact values will vary):

```json
{
  "status": "ok",
  "commit": "f615aeac...",
  "uptime": 12.345,
  "env": "production"
}
```

**Pass criteria**: HTTP 200, `status` field equals `"ok"`, `commit` is a non-empty string.

---

## Step 2 — Verify build does not require DSN

The Sentry SDK is configured to gracefully no-op when `NEXT_PUBLIC_SENTRY_DSN` is absent.
To confirm:

```bash
cd website
# Build without the DSN set
NEXT_PUBLIC_SENTRY_DSN= npm run build
```

**Pass criteria**: `next build` exits 0 with no errors referencing Sentry.

---

## Step 3 — Trigger a test error (production only)

> ⚠️ Run this against production only if you have the DSN wired up and want to confirm end-to-end delivery. Skip in staging if Sentry project isn't linked.

Send a test error via the Sentry verify endpoint (available in the Sentry dashboard under **Settings → Projects → \<project\> → Client Keys**). Alternatively, add a temporary throw in a server action and revert after confirming receipt.

Check the Sentry dashboard at [sentry.io](https://sentry.io) → Issues — the error should appear within 30 seconds.

---

## Step 4 — Check Sentry dashboard

1. Go to [sentry.io](https://sentry.io) → your project
2. Navigate to **Issues** — no spurious errors should appear from normal page loads
3. Navigate to **Performance** — if `tracesSampleRate` is configured, transaction traces appear here

---

## Environment Variable Reference

| Variable | Where to set | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel → Environment Variables (Production) | Public — safe to expose in browser bundle |
| `SENTRY_AUTH_TOKEN` | Vercel → Environment Variables (Production, CI) | Secret — never commit to git |

See `.env.example` at the repo root for placeholder values.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `/api/health` returns 500 | Runtime error in the handler | Check Vercel Function logs |
| No errors in Sentry after trigger | DSN not set or wrong environment | Verify `NEXT_PUBLIC_SENTRY_DSN` in Vercel |
| Sourcemaps missing in Sentry | `SENTRY_AUTH_TOKEN` not set | Add token to Vercel env vars |
| Build fails with Sentry import | Version mismatch | Run `npm install @sentry/nextjs@latest` in `website/` |
