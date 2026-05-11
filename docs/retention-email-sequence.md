# Retention Email Sequence — Content Spec

**Status:** Content brief (marketing deliverable)  
**Last updated:** 2026-05-08  
**Owner:** Marketing → consumed by dev implementation task (sequenced after)  
**Funnel:** Free signup → first agon completion → 24h no-return → 7-day no-return  
**Email provider assumption:** Resend (current stack); all send-trigger events sourced from Clerk webhooks + Agon completion events

---

## Overview

Today, zero retention email infrastructure exists. Once a free user exhausts all 3 daily agons and leaves, there is no recovery path. This spec defines 4 transactional/lifecycle email templates and their trigger logic. The dev implementation task will consume this brief to wire up Resend + Clerk webhooks.

**Retention funnel:**
```
Clerk signup (T+0)
  → WELCOME email fires immediately
  → User runs first agon
    → FIRST-AGON RECAP fires T+1h after agon completes
  → If user hasn't run any agon within 24h of signup
    → DAY-2 NUDGE fires
  → Every Sunday (ongoing, for non-Pro non-opted-out users)
    → WEEKLY DIGEST fires
```

---

## UTM Scheme

All email links MUST include UTM params. Convention:

```
utm_source=email
utm_campaign=<welcome|recap|nudge|digest>
utm_content=<email_id>
```

**`email_id` format:** `<campaign>_v<version>` (e.g., `welcome_v1`, `recap_v1`). Increment version when body copy changes significantly (not for variable substitution). This lets Vercel Analytics distinguish A/B variants and track click-through by version.

**Examples:**
- Welcome CTA: `/agora?utm_source=email&utm_campaign=welcome&utm_content=welcome_v1`
- Recap share link: `/agora/a/<slug>?utm_source=email&utm_campaign=recap&utm_content=recap_v1`
- Nudge CTA: `/agora?utm_source=email&utm_campaign=nudge&utm_content=nudge_v1`
- Digest CTA: `/agora?utm_source=email&utm_campaign=digest&utm_content=digest_v1`

---

## Email 1: WELCOME (T+0)

**Trigger:** Clerk `user.created` webhook fires immediately after signup.  
**Send timing:** Immediately (< 2 min of webhook receipt).  
**Condition:** Always send — no suppression at this stage (user just signed up).

### Subject Line (pick one, A/B test):
- **A (curiosity):** "Your council is assembled."
- **B (specificity):** "3 free debates await — here's where to start"
- **C (social proof):** "What Machiavelli, Sun Tzu, and Marie Curie said about a $18K MRR pivot"

*Recommended: Variant A for engaged segments, Variant B for click-through optimization. Variant C is highest-specificity for conversion but requires more personalization infrastructure.*

### Body (≤ 100 words):

---

Hi {{first_name}},

Welcome to Consult The Dead. You have 3 free debates today — each one puts a question in front of a council of history's sharpest minds, who argue in real time until they reach a verdict.

Here's a real example: a founder asked whether to raise prices on his $18K MRR product. Machiavelli said act now. Marie Curie said measure first. Sun Tzu said win the narrative war before changing any number. [Read the debate →](https://consultthedead.com/agora/a/abhishek-chakravarty?utm_source=email&utm_campaign=welcome&utm_content=welcome_v1)

What's your question?

[Open the Agora →](https://consultthedead.com/agora?utm_source=email&utm_campaign=welcome&utm_content=welcome_v1)

— Edward

---

**Variable substitutions required:**
- `{{first_name}}` — Clerk user `firstName` (fallback: "there")

**Notes:**
- The example debate URL (`/agora/a/abhishek-chakravarty`) must resolve publicly. Confirm this is seeded before enabling sends.
- Plain-text formatting preferred for deliverability and founder-tone authenticity (avoids appearing like bulk marketing).
- No HTML images in v1 — plain text only. Add header branding in v2 after click-through baseline is established.

---

## Email 2: FIRST-AGON RECAP (T+1h after first agon completes)

**Trigger:** Agon completion event (stored in DB when `/api/agon` writes result) → fire send job 1 hour after `completed_at` timestamp.  
**Condition:** Send only for the user's **first** agon (agon count = 1 at time of trigger). Do not resend for subsequent agons.  
**Suppression:** Skip if user has already opted out, bounced ≥ 2 times, or upgraded to Pro before the send fires.

### Subject Line:
- **A:** "Here's what your council decided"
- **B:** "{{council_names}} just argued your question — read the verdict"

*Recommended: Variant B when council_names is available (higher specificity → CTR lift per CTR-research-notes heuristics). Variant A as fallback.*

### Body:

---

Hi {{first_name}},

Your council reached a verdict.

**Your question:** {{agon_topic_excerpt}} (≤ 120 chars)

**Council:** {{council_names}}

**Verdict summary:** {{consensus_excerpt}} (≤ 160 chars — first sentence of Council Consensus block)

[Read the full debate →](https://consultthedead.com/agora/a/{{agon_slug}}?utm_source=email&utm_campaign=recap&utm_content=recap_v1)

If you found this useful, share it — public debates are readable by anyone with the link.

[Share this debate →](https://consultthedead.com/agora/a/{{agon_slug}}?utm_source=email&utm_campaign=recap&utm_content=recap_v1)

You have {{agons_remaining}} free debates left today. What's your next question?

[Run another agon →](https://consultthedead.com/agora?utm_source=email&utm_campaign=recap&utm_content=recap_v1)

— Edward

---

**Variable substitutions required:**
- `{{first_name}}` — Clerk user `firstName` (fallback: "there")
- `{{agon_topic_excerpt}}` — First 120 chars of the agon question (truncate with "…")
- `{{council_names}}` — Comma-joined list of mind names selected for this agon (e.g., "Machiavelli, Sun Tzu, Marie Curie")
- `{{consensus_excerpt}}` — First sentence of the Council Consensus block, truncated at 160 chars
- `{{agon_slug}}` — URL-safe slug for the agon (used in `/agora/a/<slug>` share URL)
- `{{agons_remaining}}` — `3 - agons_used_today` for free users; "unlimited" for BYO key users; omit for Pro

**Notes:**
- The share CTA is the primary viral loop. The body should feel personal, not automated — plain text strongly preferred.
- If `agon_slug` is not yet publicly accessible (shareable URL feature in flight), suppress the share CTA entirely and show only "Run another agon."
- The recap fires at T+1h to give the user time to absorb the debate before re-engaging.

---

## Email 3: DAY-2 NUDGE (T+24h, only if 0 agons run)

**Trigger:** 24 hours after Clerk `user.created` event, check agon count for user. Fire only if `agon_count == 0`.  
**Condition:** User signed up but has not run a single agon. (If they ran at least 1, FIRST-AGON RECAP already fired — skip this email.)  
**Suppression:** Skip if user has opted out, bounced ≥ 2 times, or upgraded to Pro.

### Subject Line:
- **A:** "You haven't asked them anything yet"
- **B:** "5 questions your council is ready to argue"
- **C:** "Don't waste your 3 free debates"

*Recommended: Variant A (curiosity gap + mild loss aversion). Variant C most direct but risks feeling pushy — test against a warmer list.*

### Body (≤ 80 words):

---

Hi {{first_name}},

You signed up for Consult The Dead but haven't run a debate yet. Your 3 free agons reset daily — here are 5 questions the council is ready to argue right now:

1. Should I raise prices before I have strong retention data?
2. Is now the right time to hire my first employee?
3. How do I know if my idea is worth building?
4. Should I launch before it's ready, or wait until it's polished?
5. What's the most important thing to do in my first 90 days?

[Pick one and start →](https://consultthedead.com/agora?utm_source=email&utm_campaign=nudge&utm_content=nudge_v1)

— Edward

---

**Variable substitutions required:**
- `{{first_name}}` — Clerk user `firstName` (fallback: "there")

**Topic ideas block rationale:**
These 5 questions are chosen for high search intent and universal founder/creator applicability — they map to the listicle SEO strategy (listicle-content-brief-2026-05-08.md) and avoid domain-specific jargon. They are pre-filled starting points, not forced paths; the user can modify in the Agora.

**Dev note:** The 5 topic strings above can be URL-encoded as `?topic=<encoded>` query params so the links auto-fill the Agora question field:
- `?topic=Should+I+raise+prices+before+I+have+strong+retention+data%3F&utm_source=email&utm_campaign=nudge&utm_content=nudge_v1`
- (etc. for each topic)

---

## Email 4: WEEKLY DIGEST (Every Sunday)

**Trigger:** Cron job fires every Sunday at 9:00 AM PT. Generates and sends to all eligible subscribers (see suppression rules).  
**Condition:** User has a Clerk account (signed up at any point) AND has not opted out AND has not upgraded to Pro AND bounce count < 2.  
**Cadence:** Weekly, recurring. Does not require user to have run any agons (designed to re-engage both active and dormant users).

### Subject Line (rotate weekly, or dynamically generate):
- **Template A (featured debate):** "This week's most-debated question: {{featured_topic_excerpt}}"
- **Template B (mind spotlight):** "New mind added: {{new_mind_name}} is now in your council"
- **Template C (volume):** "{{total_agons_this_week}} debates ran this week — here's the most argued"

*Recommended: Template A as default; use Template B in weeks when a new mind ships; Template C when agon volume metric is available and compelling.*

### Body:

---

Hi {{first_name}},

**This week's most-debated question:**

> {{featured_agon_topic}}

**What the council said:** {{featured_consensus_excerpt}}

[Read the full debate →](https://consultthedead.com/agora/a/{{featured_agon_slug}}?utm_source=email&utm_campaign=digest&utm_content=digest_v1)

---

**New mind this week:** {{new_mind_name}}

{{new_mind_tagline}} — now available to add to your council.

*How {{new_mind_name}} argues: {{new_mind_how_argues_blurb}} (≤ 60 words)*

[Add {{new_mind_name}} to a debate →](https://consultthedead.com/agora?utm_source=email&utm_campaign=digest&utm_content=digest_v1)

---

You have {{agons_remaining}} free debates left today.

[Run an agon →](https://consultthedead.com/agora?utm_source=email&utm_campaign=digest&utm_content=digest_v1) · [Unsubscribe]({{unsubscribe_url}})

— Edward

---

**Variable substitutions required:**
- `{{first_name}}` — Clerk user `firstName` (fallback: "there")
- `{{featured_agon_topic}}` — Topic from the featured public agon (editorially selected weekly by marketing, or algorithmically by most-viewed public agon in the past 7 days)
- `{{featured_consensus_excerpt}}` — First 200 chars of Council Consensus from featured agon
- `{{featured_agon_slug}}` — Slug for featured agon's shareable URL
- `{{new_mind_name}}` — Name of the most recently added mind (if no new mind this week, drop this block entirely)
- `{{new_mind_tagline}}` — "Famous for" tagline from per-mind-landing-content.md (8–12 words)
- `{{new_mind_how_argues_blurb}}` — Per-mind "how this mind argues" blurb ≤ 60 words (from mind-card-copy-and-transcript-publishing.md)
- `{{agons_remaining}}` — As per Recap email rules
- `{{unsubscribe_url}}` — One-click unsubscribe link (Resend-managed, CAN-SPAM required)

**Notes:**
- If no new mind shipped this week, drop the "New mind this week" block entirely and replace with a second featured debate excerpt from a different topic area.
- "Featured agon" selection process (v1): marketing team selects one featured slug per week and stores it in a `featured_agon` config row (or env var) that the digest cron reads. Move to algorithmic selection (most-viewed public agon of the week) in v2 once analytics are wired.
- The Unsubscribe link is mandatory — wire to Resend's built-in unsubscribe management (stores opt-out in Resend contact list) and sync opt-out status back to Clerk `publicMetadata.email_opted_out = true` so suppression logic is consistent across all email sends.

---

## Send-Trigger Logic Spec

### Event Sources

| Event | Source | Trigger |
|---|---|---|
| User signup | Clerk webhook `user.created` | WELCOME email + schedule DAY-2 NUDGE check |
| Agon completion | DB write on `/api/agon` response | FIRST-AGON RECAP (if agon_count = 1, T+1h delayed job) |
| 24h after signup | Scheduled job (check at T+24h) | DAY-2 NUDGE (if agon_count = 0) |
| Weekly cron | Sunday 9:00 AM PT | WEEKLY DIGEST for all eligible users |

### Implementation Pattern (v1)

```
Clerk webhook → /api/webhooks/clerk (Next.js route)
  user.created →
    1. Immediately enqueue WELCOME email via Resend
    2. Schedule a 24h delayed job to check agon_count and fire NUDGE if needed
       (use Vercel Cron or a simple DB-backed job queue)

Agon completion event (in /api/agon/route.ts, after DB write) →
  1. Read user's agon_count from DB
  2. If agon_count === 1:
     a. Enqueue RECAP email with 1h delay via Resend (scheduleAt param)
     b. Pass agon_slug, topic, council_names, consensus_excerpt as template variables

Weekly digest cron (vercel.json cron or Vercel Cron Jobs) →
  Fires Sunday 9:00 AM PT
  1. Query all Clerk users where:
     - subscription_tier != "pro"
     - email_opted_out != true
     - email_bounce_count < 2
  2. For each eligible user:
     a. Fetch featured_agon from config
     b. Fetch new_mind metadata (if any shipped this week)
     c. Enqueue DIGEST email via Resend batch API
```

### Delay Queue Options (v1)

Option A — **Resend `scheduledAt`:** Pass `scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()` for the 1h RECAP delay. Simple, no queue infrastructure needed.  
Option B — **Vercel Cron + DB job table:** Store `{user_id, job_type, fire_at, status}` rows; cron sweeps every 5 min and sends eligible jobs. More reliable for the 24h NUDGE check (avoids race conditions if serverless function times out).

**Recommendation:** Use Resend `scheduledAt` for RECAP (short delay, reliable). Use DB job table for DAY-2 NUDGE (24h delay across serverless function restarts is risky without persistence).

---

## Suppression Rules

Suppression is **additive** — a user who meets ANY of the following criteria is excluded from ALL non-WELCOME emails:

| Condition | Source | When Applied |
|---|---|---|
| User upgrades to Pro | Clerk `publicMetadata.subscription_tier === "pro"` | Applied at send time (check before every send, not at queue time) |
| User opts out | Clerk `publicMetadata.email_opted_out === true` OR Resend opt-out list | Applied at send time; must be synced bidirectionally |
| Hard bounce count ≥ 2 | `publicMetadata.email_bounce_count >= 2` (incremented by Resend webhook `email.bounced`) | Applied at send time |
| Soft bounce count ≥ 5 | `publicMetadata.email_soft_bounce_count >= 5` | Applied at send time |

**Suppression is checked at send time, not at queue time.** A user who upgrades to Pro after the RECAP is enqueued but before the T+1h fires should NOT receive the RECAP.

**Implementation:** Before every Resend API call, fetch Clerk user metadata and evaluate suppression conditions. If suppressed, cancel the send and log the suppression reason.

### Resend → Clerk Sync

Resend webhooks to wire up:
- `email.bounced` → increment `email_bounce_count` in Clerk `publicMetadata`
- `email.complained` (spam report) → set `email_opted_out = true` in Clerk `publicMetadata`
- Resend contact unsubscribe → set `email_opted_out = true` in Clerk `publicMetadata`

This ensures suppression state is authoritative in Clerk, queryable server-side before any send.

### WELCOME Email Suppression Exception

The WELCOME email fires immediately on signup before any suppression state can be set (user was just created). **No suppression is applied to WELCOME.** It always sends once, immediately.

---

## Email Template Summary

| # | Name | Trigger | Timing | Condition | Max Sends |
|---|---|---|---|---|---|
| 1 | WELCOME | Clerk `user.created` | T+0 (immediate) | Always | Once, ever |
| 2 | FIRST-AGON RECAP | First agon completion | T+1h after agon | agon_count = 1 | Once, ever |
| 3 | DAY-2 NUDGE | 24h after signup | T+24h | agon_count = 0 | Once, ever |
| 4 | WEEKLY DIGEST | Sunday 9AM PT cron | Weekly | Not Pro, not opted out, bounce < 2 | Recurring weekly |

---

## Acceptance Criteria (for dev implementation task)

- [ ] All 4 email templates produce sendable output with no `{{unfilled_variable}}` placeholders
- [ ] WELCOME fires within 2 minutes of Clerk `user.created` webhook
- [ ] FIRST-AGON RECAP fires between 55–65 minutes after first agon `completed_at`
- [ ] DAY-2 NUDGE fires only when `agon_count === 0` at the 24h check, never otherwise
- [ ] WEEKLY DIGEST fires Sunday 9:00–9:05 AM PT (±5 min tolerance)
- [ ] Suppression is enforced at send time (not queue time) for all emails except WELCOME
- [ ] Resend bounce/complaint webhooks update Clerk `publicMetadata` within 60 seconds
- [ ] All CTA links include correct UTM params per scheme above
- [ ] Plain-text version of all emails is provided (HTML optional in v1)
- [ ] Unsubscribe link present in all emails except WELCOME (CAN-SPAM)

---

*This is a docs-only marketing deliverable. Dev implementation is a sibling task sequenced after this file is committed.*
