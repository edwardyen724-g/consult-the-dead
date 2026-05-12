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

**`resetAt` helper**

`quotaResetAt(reason: RateRejectReason): number` in `rateLimit.ts` returns the Unix
epoch (seconds, integer) when the quota window for that `reason` resets:

- `"ip"`, `"user"`, `"global"` → 00:00 UTC the *next* calendar day
- `"pro"` → 00:00 UTC on the *first day of the next calendar month*

The function is used by the agon and generate-analysis routes to populate the
`Retry-After` and `X-RateLimit-Reset` headers on 429 responses.

**Machine-readable headers on 429 responses** (agon and generate-analysis only)

```
Retry-After: <seconds>            # integer seconds until quota window resets
X-RateLimit-Reset: <unix-seconds> # UTC epoch when the window resets
```

`Retry-After` is `max(0, resetAt - floor(Date.now() / 1000))`.  On 200 (allowed)
responses the remaining count is conveyed in two other places:

- `X-RateLimit-Remaining: <integer>` response header (generate-analysis route only).
- `remaining` field inside the `agon_done` / `analysis_done` SSE event.

When Redis is unavailable the system falls back to an in-process `Map`; the
`quotaResetAt()` calculation is still correct (calendar arithmetic, not Redis state),
so `Retry-After` and `X-RateLimit-Reset` remain accurate in the fallback path.

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
| `POST /api/agon` | POST | Free-tier (server key) quota exceeded | `{ error: "<message>", rateLimited: true }` | `Content-Type`, `Retry-After`, `X-RateLimit-Reset` | Daily (UTC midnight) for free; monthly for pro |
| `POST /api/generate-analysis` | POST | Free-tier (server key) quota exceeded | `{ error: "<message>", rateLimited: true }` | `Content-Type`, `Retry-After`, `X-RateLimit-Reset` | Daily (UTC midnight) for free; monthly for pro |
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

**429 response headers**

```
Content-Type: application/json
Retry-After: <seconds>
X-RateLimit-Reset: <unix-seconds>
```

When the request is *allowed*, the remaining count is injected into the `agon_done`
SSE event as `remaining`.

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

**429 response headers**

```
Content-Type: application/json
Retry-After: <seconds>
X-RateLimit-Reset: <unix-seconds>
```

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

## Reset cadences for client back-off

| Route / bucket | Reset cadence |
|----------------|---------------|
| `/api/agon` and `/api/generate-analysis` — free daily (IP, user, global) | **00:00 UTC** each day |
| `/api/agon` and `/api/generate-analysis` — pro monthly | **00:00 UTC on the 1st** of each month |
| `/api/contact` — IP throttle | **1 hour** after first request in window |
| `/api/contact` — email throttle | **24 hours** after first request in window |

For the agon and generate-analysis routes use the `Retry-After` header value
(seconds) for precise back-off.  For the contact route, apply a fixed back-off based
on the cadence table above (no machine-readable reset timestamp is returned).
