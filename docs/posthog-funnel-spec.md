# PostHog Funnel: Email-Capture → Free Signup → Pro Upgrade

This document specifies the three-step conversion funnel that is tracked via
**Vercel Web Analytics** (`@vercel/analytics`) and queryable in any PostHog
project that ingests those events. All three events are already wired in
production; no code changes are needed to start collecting data.

---

## Funnel Steps and Event Names

### Step 1 — Email Capture

| Property | Value |
|---|---|
| Event name | `email_capture_shown` |
| Fired by | `AgoraApp.tsx` `EmailCaptureModal` (`useEffect` on mount) |
| Trigger | Free user reaches the consensus stage (no BYO API key) |

A submitted email fires a second event:

| Property | Value |
|---|---|
| Event name | `email_capture_submitted` |
| Fired by | `AgoraApp.tsx` `EmailCaptureModal.handleSubmit` |
| Trigger | User submits the email-capture form |

A dismissed modal fires:

| Property | Value |
|---|---|
| Event name | `email_capture_dismissed` |
| Fired by | `AgoraApp.tsx` `EmailCaptureModal.handleDismiss` |
| Trigger | User clicks "No thanks" or the × button |

The upstream warm-up event that puts users into this step:

| Property | Value |
|---|---|
| Event name | `consensus_stage_reached` |
| Fired by | `AgoraApp.tsx` `handleAgonEvent` on `consensus_started` SSE |
| Trigger | SSE stream emits `consensus_started` |

### Step 2 — Free Signup

| Property | Value |
|---|---|
| Event name | `free_signup` |
| Fired by | `/api/webhooks/clerk/route.ts` on `user.created` |
| Trigger | Clerk webhook fires when a new user account is created |
| Props | `plan: 'free'`, `clerk_user_id`, `utm_source`, `utm_campaign` |

This event is server-side and fires via `trackEvent` from `@/lib/analytics`,
which delegates to `@vercel/analytics/server`. It is best-effort and never
blocks the webhook response.

### Step 3 — Pro Upgrade

| Property | Value |
|---|---|
| Event name | `paid_subscription` |
| Fired by | `/api/stripe/webhook/route.ts` on `checkout.session.completed` |
| Trigger | Stripe webhook fires after a successful Stripe Checkout session |
| Props | `plan: 'monthly' \| 'annual'`, `utm_campaign`, `utm_content` |

This is also server-side and best-effort. The webhook always returns 200
regardless of analytics outcome.

---

## Canonical Funnel for Conversion Analysis

For a strict linear funnel, use these three steps in order:

1. `email_capture_shown` — top of funnel (first point of capture intent)
2. `free_signup` — mid-funnel conversion
3. `paid_subscription` — bottom-of-funnel revenue conversion

An alternative tighter top-of-funnel uses `email_capture_submitted` as step 1
to measure only users who expressed explicit intent (submitted an email address).

---

## How to Build the Funnel in PostHog

PostHog ingests Vercel Web Analytics events automatically when the Vercel
integration is connected. To build the funnel:

1. In PostHog, go to **Insights → + New insight → Funnel**.
2. Add steps in this order:
   - Step 1: Event = `email_capture_shown`
   - Step 2: Event = `free_signup`
   - Step 3: Event = `paid_subscription`
3. Set the **conversion window** to 7 days (users often sign up and upgrade
   within a week of first seeing the email capture).
4. Set **breakdown** by `utm_campaign` to measure which traffic sources
   convert best end-to-end.
5. Click **Save** and pin the funnel to your main product dashboard.

### Useful Derivative Queries

- **Email-capture submit rate**: `email_capture_submitted` ÷ `email_capture_shown`
  — measures modal effectiveness
- **Dismiss rate**: `email_capture_dismissed` ÷ `email_capture_shown`
  — if high, consider simplifying the modal copy
- **Signup-to-upgrade rate**: `paid_subscription` ÷ `free_signup`
  — primary revenue-efficiency metric

---

## Expected Conversion Rates (Baseline Targets)

These are starting benchmarks to tune against as data accumulates:

| Step | Target conversion |
|---|---|
| Email capture shown → submitted | ≥ 15% |
| Email capture shown → free signup | ≥ 8% |
| Free signup → pro upgrade (7-day window) | ≥ 5% |
| Full funnel (email shown → paid) | ≥ 0.5% |

Review actuals weekly once 200+ `email_capture_shown` events have been
collected. Adjust the 7-day conversion window to 14 days if the data shows
many upgrades arriving in the second week.

---

## Event Implementation References

| File | Event(s) |
|---|---|
| `website/src/app/agora/AgoraApp.tsx` | `email_capture_shown`, `email_capture_submitted`, `email_capture_dismissed`, `consensus_stage_reached` |
| `website/src/app/api/webhooks/clerk/route.ts` | `free_signup` |
| `website/src/app/api/stripe/webhook/route.ts` | `paid_subscription` |
| `website/src/lib/analytics.ts` | `trackEvent` helper (Vercel Web Analytics adapter) |

Test coverage for all server-side events lives in:

- `website/src/app/api/webhooks/clerk/route.test.ts`
- `website/src/app/api/stripe/webhook/route.test.ts`
- `website/src/app/agora/AgoraApp.funnel-telemetry.test.tsx`
