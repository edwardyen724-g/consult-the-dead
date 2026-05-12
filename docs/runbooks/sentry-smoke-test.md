# Sentry Smoke-Test Runbook

**Purpose**: Verify Sentry error monitoring is wired up correctly after a production deploy.

**Frequency**: Run once after the initial Sentry project setup, and again after any changes to `sentry.client.config.ts`, `sentry.server.config.ts`, or `next.config.ts` (Sentry wrapping options).

---

## Prerequisites

All environment variables below must be set in Vercel project settings under **Settings → Environment Variables → Production**.

| Variable | Where to set | Required for | Notes |
|----------|-------------|-------------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel → Env Vars (Production) | Client error capture | Public — embedded in browser bundle |
| `SENTRY_DSN` | Vercel → Env Vars (Production) | Server error capture | Secret — server-only, never in browser |
| `SENTRY_AUTH_TOKEN` | Vercel → Env Vars (Production, CI) | Sourcemap upload | Secret — get from Sentry → Settings → Auth Tokens |
| `SENTRY_ORG` | Vercel → Env Vars (Production, CI) | Sourcemap upload | Your Sentry org slug |
| `SENTRY_PROJECT` | Vercel → Env Vars (Production, CI) | Sourcemap upload | Your Sentry project slug |

See `.env.example` at the repo root for placeholder values.

> **How the DSN flows**: The server config (`sentry.server.config.ts`) reads `SENTRY_DSN ?? NEXT_PUBLIC_SENTRY_DSN` so a single variable works in a pinch. For production, set both: `NEXT_PUBLIC_SENTRY_DSN` for client, `SENTRY_DSN` for server.

---

## Architecture note: the `/monitoring` tunnel

`next.config.ts` sets `tunnelRoute: "/monitoring"`. This means **all browser Sentry requests** are proxied through your own Next.js server at `/monitoring` rather than going directly to `ingest.sentry.io`. This prevents ad-blockers from silently swallowing client-side errors. You do not need to allow-list `*.sentry.io` in CSP for the browser SDK — allow `/monitoring` on your own domain instead.

---

## Step 1 — Verify /api/health returns 200

```bash
BASE_URL=https://consultthedead.com   # or your Vercel preview URL

curl -sf "$BASE_URL/api/health" | jq .
```

Expected response (shape — exact values vary per deploy):

```json
{
  "status": "ok",
  "commit": "f615aeac...",
  "uptime": 12.345,
  "env": "production"
}
```

**Pass criteria**: HTTP 200, `status` equals `"ok"`, `commit` is a non-empty hex string (not `"dev"`), `env` equals `"production"`.

> If `commit` is `"dev"` the deployment did not pick up `VERCEL_GIT_COMMIT_SHA`. Re-deploy from the Vercel dashboard.

---

## Step 2 — Verify the build is clean without credentials

The Sentry SDK no-ops gracefully when the DSN is absent. Confirm the build never hard-requires credentials:

```bash
cd website

# Build without any Sentry vars — must exit 0
NEXT_PUBLIC_SENTRY_DSN= SENTRY_DSN= SENTRY_AUTH_TOKEN= npm run build
```

**Pass criteria**: `next build` exits 0. No errors mentioning Sentry or missing tokens in the output. (Build-time warnings about missing `authToken` are acceptable and expected — they come from `silent: !process.env.SENTRY_AUTH_TOKEN` in `next.config.ts`.)

---

## Step 3 — Trigger a client-side test error

> ⚠️ Run against production (or a preview URL with `NEXT_PUBLIC_SENTRY_DSN` set). The client SDK only sends events when `NODE_ENV === "production"`.

### Option A — Sentry dashboard "Send test event" (recommended)

1. Go to [sentry.io](https://sentry.io) → your project → **Settings → Client Keys (DSN)**.
2. Click **Send a test event**.
3. Sentry delivers a synthetic `SentryError: This is a test error.` directly to the Issues list.

**Expected result**: A new issue titled `SentryError` appears in **Issues** within 30 seconds. Tags: `platform: javascript`, `environment: production`.

### Option B — Browser console injection

1. Open `https://consultthedead.com` in a browser (not DevTools device emulation).
2. Open the browser DevTools **Console**.
3. Run:

   ```js
   // The SDK is exposed on the window in production builds via @sentry/nextjs
   import('/monitoring').catch(() => {});  // warm the tunnel
   Sentry.captureException(new Error("Smoke test – client " + Date.now()));
   ```

4. Watch the **Network** tab: you should see a `POST` to `https://consultthedead.com/monitoring` (not to `ingest.sentry.io`) return HTTP 200.

**Expected result**: The error appears in Sentry **Issues** within 30 seconds. If the network request goes to `/monitoring` and returns 200, client-to-server tunneling is working.

---

## Step 4 — Trigger a server-side test error

Server errors (API routes, Server Actions, SSR) are captured by `sentry.server.config.ts` and sent **directly from the server** to Sentry using `SENTRY_DSN`.

### Verification flow

Add a temporary `throw` to a low-risk server action or API route, deploy, hit the endpoint, then revert:

```ts
// Temporary — revert immediately after confirming receipt
export async function GET() {
  throw new Error("Sentry server smoke test – " + Date.now());
}
```

Or use `Sentry.captureException` without actually throwing (no user-visible error):

```ts
import * as Sentry from "@sentry/nextjs";
Sentry.captureException(new Error("Sentry server smoke test – " + new Date().toISOString()));
return NextResponse.json({ ok: true });
```

**Expected result**: A new issue tagged `platform: node` (or `platform: edge` for Edge Runtime routes) appears in Sentry **Issues** within 30 seconds. The stack trace should point to your source file, not minified output — this confirms sourcemap upload worked.

> If the stack trace is minified: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, or `SENTRY_PROJECT` is missing or wrong. Check Vercel env vars and redeploy.

---

## Step 5 — Verify the Sentry dashboard sections

After steps 3 and 4, walk through each Sentry section and confirm capture expectations:

### Issues

| What to check | Expected |
|---------------|----------|
| Test error from step 3 or 4 | Appears within 30 seconds |
| Issue tagged `environment: production` | ✅ Required — means the `enabled` flag resolved correctly |
| Stack frame shows original source (not minified) | ✅ Sourcemaps working |
| No spurious issues from normal page loads | ✅ No `TypeError`, `ChunkLoadError`, etc. from healthy navigation |

### Performance

The `tracesSampleRate` is **0.1** (10%) on both client and server. At low traffic volumes you may see **zero** transactions — this is expected.

| What to check | Expected |
|---------------|----------|
| Transactions appear after 10+ page loads | At least 1 transaction visible (probabilistic) |
| Transaction names match Next.js routes (e.g. `GET /agora`, `Page Load /`) | ✅ Auto-instrumented by `@sentry/nextjs` |
| No `tracesSampleRate: 1.0` in production | Keep at 0.1 or lower to avoid quota exhaustion |

> To confirm performance capture is wired up during initial setup, temporarily set `tracesSampleRate: 1.0` in `sentry.client.config.ts`, deploy, hit a few pages, then revert.

### Session Replay

The replay sample rates are:
- `replaysSessionSampleRate: 0.01` — 1% of normal sessions get a replay.
- `replaysOnErrorSampleRate: 1.0` — 100% of sessions that throw an error get a replay.

| What to check | Expected |
|---------------|----------|
| After triggering the step 3 client error | A session replay is captured (100% on error) |
| Normal browsing without errors | Replays appear ~1% of the time — at low volume, you may see none |
| Replay shows the page content and user interactions | ✅ |

> Session replays appear under **Replays** in the Sentry sidebar. Each replay links back to the error issue if one triggered it.

---

## Step 6 — Verify the `/monitoring` tunnel is reachable

```bash
# The tunnel must return 200 for a valid Sentry envelope
curl -sf -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/monitoring" \
  -H "Content-Type: application/x-sentry-envelope" \
  -d $'{"dsn":"'"$NEXT_PUBLIC_SENTRY_DSN"'","sdk":{"name":"sentry.test","version":"0.0.0"}}\n{"type":"session"}\n{"status":"ok"}'
```

**Pass criteria**: Returns `200`. If `404` — the `tunnelRoute: "/monitoring"` in `next.config.ts` is not deployed. If `400` — the tunnel is live but the test payload was malformed (this is fine; it means the route exists).

---

## Environment Variable Reference

| Variable | Where | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel Production | Client DSN — embedded in JS bundle |
| `SENTRY_DSN` | Vercel Production | Server DSN — never in browser |
| `SENTRY_AUTH_TOKEN` | Vercel Production + CI | Sourcemap upload token |
| `SENTRY_ORG` | Vercel Production + CI | Org slug from sentry.io |
| `SENTRY_PROJECT` | Vercel Production + CI | Project slug from sentry.io |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `/api/health` returns 500 | Runtime error in the handler | Check Vercel Function logs |
| `commit` field is `"dev"` | `VERCEL_GIT_COMMIT_SHA` not set | Redeploy via Vercel dashboard (not CLI preview) |
| No errors in Sentry after trigger | DSN not set or `NODE_ENV !== "production"` | Verify `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` in Vercel; confirm env is `production` |
| Client event goes to `ingest.sentry.io` not `/monitoring` | `tunnelRoute` not in deployed `next.config.ts` | Check the deployed `next.config.ts` wraps with `tunnelRoute: "/monitoring"` |
| Stack traces are minified | Sourcemap upload failed | Verify `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` in Vercel; re-deploy |
| No session replays after error | Replay SDK not loaded | Confirm `replaysOnErrorSampleRate: 1.0` in `sentry.client.config.ts`; check browser network for replay XHR to `/monitoring` |
| No performance transactions | `tracesSampleRate: 0.1` — low traffic | Temporarily set to `1.0` for initial validation, then revert |
| Build fails with Sentry import | Version mismatch | Run `npm install @sentry/nextjs@latest` in `website/` |
