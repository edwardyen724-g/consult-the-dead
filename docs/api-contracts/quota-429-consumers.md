# API 429 Consumers — `resetAt` Quota Contract

This document maps every API route that returns HTTP 429 and describes how each route
participates in the shared quota/rate-limit system.  It is the reference for client
developers who need to handle `429 Too Many Requests` responses and for contributors
adding new routes that share the same quota infrastructure.

---

## Shared quota infrastructure

Two subsystems provide the rate-limit primitives consumed by the routes below.

### Agon / Generate-analysis quota (Redis-backed)

Implemented in `website/src/lib/agon/rateLimit.ts`.  All limits count **requests
that use the server-supplied Anthropic key** (`usingServerKey === true`).  Requests
that supply a client-provided `X-Api-Key` bypass this system entirely.

| Bucket | Key pattern | Limit | Window | Redis TTL |
|--------|-------------|-------|--------|-----------|
| Free per-IP | `agon:rl:ip:<ip>:<YYYY-MM-DD>` | 3 req | UTC day | 36 h |
| Free per-user | `agon:rl:user:<userId>:<YYYY-MM-DD>` | 3 req | UTC day | 36 h |
| Pro per-user | `agon:rl:pro:<userId>:<YYYY-MM>` | 100 req | Calendar month | 35 days |
| Global free | `agon:rl:global:<YYYY-MM-DD>` | 60 req | UTC day | 36 h |

**`resetAt` semantics for agon/analysis routes**

The quota windows are keyed on the UTC calendar date (daily) or UTC calendar month
(monthly).  The window end — i.e., the implicit `resetAt` — is therefore:

- **Daily buckets** (free IP, free user, global): midnight UTC of the *next* calendar
  day.  Redis keys carry a 36-hour TTL as a safety margin beyond midnight.
- **Monthly bucket** (pro): 00:00 UTC on the first day of the *next* calendar month.
  Redis keys carry a 35-day TTL.

The `resetAt` value is **not surfaced as a response header** on 429 responses from
these routes today.  The remaining count is conveyed in two other places when the
request is *allowed*:

- `X-RateLimit-Remaining` response header (generate-analysis route only, on 200
  responses).
- `remaining` field inside the `agon_done` / `analysis_done` SSE event.

When Redis is unavailable the system falls back to an in-process `Map`; that fallback
resets on cold start (i.e., the `resetAt` in the fallback path is effectively
undefined from the client's perspective).

### Contact throttle (dual-layer: DB + in-process)

Implemented in `website/src/app/api/contact/route.ts`.

Primary layer: PostgreSQL advisory locks + `contact_submissions` row counts.  The
`resetAt` field lives on an in-process `ThrottleBucket` struct and is used by the
in-memory fallback layer; the DB layer derives its window from SQL `interval`
expressions and does not expose a `resetAt` timestamp to callers.

| Bucket | Key | Limit | Window |
|--------|-----|-------|--------|
| IP (DB primary) | `ip_address` column + `now() - interval '1 hour'` | 5 req | Rolling 1-hour |
| Email (DB primary) | `email` column + `now() - interval '1 day'` | 3 req | Rolling 24-hour |
| IP (in-memory fallback) | `contact:ip:<ip>` | 5 req | 1-hour sliding from first req |
| Email (in-memory fallback) | `contact:email:<email>` | 3 req | 24-hour sliding from first req |

**`resetAt` semantics for contact route**

The in-memory `ThrottleBucket.resetAt` is a Unix-millisecond timestamp equal to
`Date.now() + windowMs` at the time the bucket is created.  For IP buckets that is
`now + 3_600_000 ms`; for email buckets that is `now + 86_400_000 ms`.  It is used
internally to decide when to start a fresh bucket; it is **not returned in the 429
response body or headers** — the response body contains only a human-readable message.

---

## Route-by-route table

| Route | Method | Trigger | 429 Body | Headers on 429 | `resetAt` / cadence |
|-------|--------|---------|----------|----------------|---------------------|
| `POST /api/agon` | POST | Free-tier (server key) quota exceeded | `{ error: "<message>", rateLimited: true }` | `Content-Type: application/json` only | Daily (UTC midnight) for free; monthly for pro — not in headers |
| `POST /api/generate-analysis` | POST | Free-tier (server key) quota exceeded | `{ error: "<message>", rateLimited: true }` | `Content-Type: application/json` only | Daily (UTC midnight) for free; monthly for pro — not in headers |
| `POST /api/contact` | POST | IP or email submission rate exceeded | `{ ok: false, error: "<message>" }` | none beyond default | Rolling 1 h (IP) / rolling 24 h (email) — not in headers |

---

## Per-route details

### `POST /api/agon`

**Source**: `website/src/app/api/agon/route.ts`

Applies only when the server's Anthropic key is used (no client `X-Api-Key` header).
`checkRateLimit()` is called with `{ userId, isPro, ip }`.

**429 response reasons and messages**

| `reason` | Metric key | Message |
|----------|-----------|---------|
| `global` | `rate_limited_global` | "You've used all 3 free debates for today" |
| `pro` | `rate_limited_pro` | "You've reached your 100 agon monthly limit. Manage your subscription from your account page." |
| `user` | `rate_limited_user` | "You've used all 3 free agons for today. Add your own Anthropic API key for unlimited use." |
| `ip` | `rate_limited_ip` | "You've used all 3 free agons for today. Add your own Anthropic API key for unlimited use." |

**No `resetAt` in response.**  When the request is allowed, the remaining count is
injected into the `agon_done` SSE event as `remaining`.

---

### `POST /api/generate-analysis`

**Source**: `website/src/app/api/generate-analysis/route.ts`

Identical quota check (`checkRateLimit`) and bucket structure as `/api/agon`.

**429 response reasons and messages**

| `reason` | Message |
|----------|---------|
| `global` | "The free tier is at capacity for today. Add your own Anthropic API key for unlimited use, or check back tomorrow." |
| `pro` | "You've reached your 100 analysis monthly limit. Manage your subscription from your account page." |
| `user` | "You've used all 3 free analyses for today. Add your own Anthropic API key for unlimited use." |

**`X-RateLimit-Remaining` header** is included on **200** responses only:
```
X-RateLimit-Remaining: <integer>
```
The header is absent on 429 responses and on any response where the client supplies
its own API key.

---

### `POST /api/contact`

**Source**: `website/src/app/api/contact/route.ts`

Dual-layer throttle.  The primary layer uses PostgreSQL row counts inside a
serializable transaction with advisory locks.  If the DB is unavailable the route
falls back to the in-process `localThrottle` map, which uses the `ThrottleBucket`
struct with a `resetAt` Unix-millisecond field.

**429 response examples**

```json
{ "ok": false, "error": "That email has already been used for several recent contact requests. Please wait before trying again." }
{ "ok": false, "error": "You're sending contact requests too quickly. Please wait a bit and try again." }
```

**No `resetAt`, no `X-RateLimit-*` headers** in the response.  The throttle window
is conveyed only in the human-readable error string.

---

## What `resetAt` is and is not today

The field named `resetAt` currently lives only inside the in-process
`ThrottleBucket` struct in the contact route.  It is a Unix-millisecond epoch
marking when the current bucket expires.  It is used for internal bucket management
(not returned to callers).

Neither the agon/analysis routes nor the contact route expose a machine-readable
reset timestamp to API consumers at this time.  If a client needs to know when to
retry, it must infer the cadence from the error message or apply a fixed back-off:

- Free daily quotas reset at **00:00 UTC** each day.
- Pro monthly quotas reset at **00:00 UTC on the 1st** of each month.
- Contact IP throttle resets **1 hour** after the first request in the window.
- Contact email throttle resets **24 hours** after the first request in the window.

Adding a `Retry-After` or `X-RateLimit-Reset` header to 429 responses is tracked
separately and would be the natural place to surface the `resetAt` value.
