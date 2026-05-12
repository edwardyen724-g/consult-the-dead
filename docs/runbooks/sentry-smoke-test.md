# Sentry Smoke-Test Runbook

**Purpose**: Verify Sentry error monitoring is wired up correctly after a production deploy.

**Frequency**: Run once after the initial Sentry project setup, and again after any changes to
`sentry.client.config.ts`, `sentry.server.config.ts`, or `sentry.edge.config.ts`.

---

## Prerequisites

- Sentry project created at [sentry.io](https://sentry.io)
- `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` set in Vercel project settings (Production environment)
- `SENTRY_AUTH_TOKEN` set in Vercel project settings (for sourcemap uploads — optional for the smoke test itself)
- `SENTRY_ORG` and `SENTRY_PROJECT` set in Vercel project settings (required for sourcemap uploads)
- App deployed to production (`consultthedead.com` or a preview URL)

See `website/.env.example` for the full variable reference with placeholder values.

---

## Environment Setup

Set all five Sentry variables in **Vercel → Project → Settings → Environment Variables** for the
**Production** environment:

| Variable | Where to get the value |
|----------|------------------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Settings → Projects → \<project\> → Client Keys (DSN) |
| `SENTRY_DSN` | Same DSN value — kept separate so it is not embedded in the client bundle |
| `SENTRY_ORG` | Your Sentry organisation slug (visible in the dashboard URL) |
| `SENTRY_PROJECT` | Your Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Account → API → Auth Tokens (scope: `project:releases`) |

Both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` point to the same DSN value. The distinction
matters at runtime: the public variable is embedded in the browser bundle (client SDK), while the
secret variable is used server-side and at the edge without being exposed to the client.

**Rollback**: If the DSN is wrong or Sentry is capturing too many events, set `SENTRY_DSN=""`
and `NEXT_PUBLIC_SENTRY_DSN=""` in Vercel env to disable ingestion without redeploying. The SDK
no-ops cleanly when the DSN is absent.

---

## Step 1 — Verify /api/health returns 200

```bash
BASE_URL=https://consultthedead.com   # replace with a preview URL if needed

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

**Pass criteria**: HTTP 200, `status` equals `"ok"`, `commit` is a non-empty string.

---

## Step 2 — Trigger a test error and verify capture

There is no dedicated `/api/sentry-test` endpoint. Use one of these two methods:

### Option A — Browser console (client-side error)

1. Open `https://consultthedead.com/agora` in a browser.
2. Open DevTools → Console.
3. Paste and run:

   ```js
   throw new Error("Sentry smoke test — client");
   ```

4. In the Sentry dashboard, go to **Issues**. The error titled
   `"Sentry smoke test — client"` should appear within 60 seconds, tagged with
   `environment: production`.

### Option B — Server-side error via /api/agon (edge runtime)

Send a malformed request to trigger an unhandled error in the edge-runtime handler:

```bash
curl -s -X POST "$BASE_URL/api/agon" \
  -H "Content-Type: application/json" \
  -H "Origin: https://consultthedead.com" \
  -d '{"broken": true}'
```

The route returns a 400 for validation errors and a structured `data: {"type":"error",...}` event
for engine-level failures. An unhandled exception (e.g., a deployment misconfiguration) should
surface in Sentry within 60 seconds.

---

## Step 3 — Check Sentry dashboard

1. Go to [sentry.io](https://sentry.io) → your project.
2. Navigate to **Issues**:
   - The smoke-test error should appear under `environment: production`.
   - Normal page loads should produce **no spurious errors**.
3. Click the issue and verify:
   - **Error title and stack trace** are present and point to recognisable source locations (not
     minified gibberish — sourcemaps are working if line numbers are readable).
   - **User context** is attached if the user was signed in when the error occurred (Clerk user ID,
     not email or full name — see PII section below).
   - **Environment tag** reads `production`.
4. Navigate to **Performance** — transaction traces should appear if `tracesSampleRate` is non-zero
   (currently 0.1 = 10% sampling across all three runtimes).

---

## Expected events in production

| Surface | Typical error | Sentry runtime |
|---------|--------------|----------------|
| `/agora` | Unhandled promise rejection in the Agora UI | Client (browser) |
| `/api/agon` | Engine-level throw, rate-limit misconfiguration | Edge |
| `/api/generate-analysis` | Framework Forge pipeline failure | Server (Node.js) |
| Any page | Unhandled client navigation error | Client (browser) |

---

## PII guardrails — what must NOT be captured

Sentry should **never** capture the following:

- User email addresses (do not pass `user.email` to `Sentry.setUser`)
- User display names or full names
- Pro subscription tier details (e.g., do not tag events with `subscription_tier: pro`)
- Raw request bodies that may contain user-authored content

If you add custom `Sentry.setUser(...)` calls in future, limit them to the opaque Clerk user ID:

```ts
Sentry.setUser({ id: userId });   // OK
Sentry.setUser({ email: email }); // NOT OK — scrub this
```

Verify in the Sentry dashboard that the **User** section on captured events shows only an ID, not
an email or name.

---

## Step 4 — Verify build-time sourcemap upload (optional)

After `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are set, trigger a new Vercel
production deployment. Then:

1. Open a captured error in Sentry.
2. In the stack trace, check that file names and line numbers resolve to the original TypeScript
   source (not `_app-xxx.js:1:234567`).

If sourcemaps are missing, confirm the three variables are set and that the Vercel build log does
not show a `@sentry/nextjs` upload failure.

---

## Step 5 — Verify graceful no-op without DSN (CI check)

The SDK must not break the build or throw at runtime when the DSN is absent:

```bash
cd website
NEXT_PUBLIC_SENTRY_DSN= SENTRY_DSN= npm run build
```

**Pass criteria**: `next build` exits 0 with no errors referencing Sentry. This is also validated
automatically by the unit tests in `website/src/sentry-config.test.ts`.

---

## Environment Variable Reference

| Variable | Where to set | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel → Env Vars (Production) | Embedded in browser bundle — safe to expose |
| `SENTRY_DSN` | Vercel → Env Vars (Production) | Server/edge only — never in client bundle |
| `SENTRY_ORG` | Vercel → Env Vars (Production, CI) | Org slug for sourcemap uploads |
| `SENTRY_PROJECT` | Vercel → Env Vars (Production, CI) | Project slug for sourcemap uploads |
| `SENTRY_AUTH_TOKEN` | Vercel → Env Vars (Production, CI) | Secret — never commit to git |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| No errors in Sentry after trigger | DSN not set or wrong environment | Verify both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel |
| `environment` tag missing or wrong | `NODE_ENV` not `production` | Confirm the Vercel deployment target is Production |
| Sourcemaps missing in Sentry | Auth token or org/project not set | Add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` to Vercel env vars |
| `/api/health` returns 500 | Runtime error in the handler | Check Vercel Function logs |
| Build fails with Sentry import | Version mismatch | Run `npm install @sentry/nextjs@latest` in `website/` |
| Too many events / quota burn | High error rate or overly broad capture | Set `SENTRY_DSN=""` to disable; investigate source; re-enable |
| PII appearing in Sentry events | `setUser` called with email or name | Audit all `Sentry.setUser` calls — pass only `{ id: userId }` |
