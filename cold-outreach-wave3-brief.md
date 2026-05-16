# Cold Outreach Wave 3 — Brief

> **Status:** Draft 2026-05-15. Wave 3 is fundamentally different from Waves 1+2: smaller list, higher leverage per target, calibrated around the Tue 2026-05-19 launch. The point of Wave 3 is not volume — it's converting specific people whose signup would compound (audience, credibility, or both).

## Context — what's already in market

| Wave | Sent | Date | Mode |
|---|---|---|---|
| Wave 1 | 10 founders | 2026-05-12 | Personalized debate page per recipient (`/agora/a/<name>`) |
| Wave 2 | 20 mix (11 founders + 9 VCs) | 2026-05-13 | Personalized debate page per recipient |
| Wave 1 follow-up | (scheduled) | 2026-05-19 | Originally planned 7-day cadence — coincides with launch day |

**Total cold outreach surface:** 30 personalized emails. Per `docs/outreach-debates/WAVE1_SEND_LOG.md` and `WAVE2_SEND_LOG.md`. Response data not visible in repo — Edward owns the reply tracking.

## What Wave 3 should NOT be

- ❌ **Another 20–30 personalized debates.** Marginal return on the same audience. Generating debate pages takes effort that should now go into the launch.
- ❌ **A broadcast email blast.** Wave 3's value is per-target leverage, not list size.
- ❌ **A follow-up to Waves 1+2 that pretends nothing happened.** The launch is the news. Use it.
- ❌ **A "buy now or lose the deal" hard sell.** Burns relationships. The $99/year deal is a soft mention, never the lead.

## What Wave 3 IS

Three parallel motions, sequenced around the launch:

### Motion 1 — Launch-day follow-up to Waves 1+2 (Tue 2026-05-19)

The Wave 1 follow-up is already on the calendar for May 19. Use that slot, but rewrite the message body to leverage launch energy.

**Send target:** Any Wave 1 or Wave 2 recipient who **did not reply** to the initial send. ~25–28 recipients depending on reply rate.

**Send time:** 30–45 minutes AFTER the Show HN post goes live (so ~09:00 ET Tuesday). The HN traffic spike validates the email.

**Subject line A/B:**
- A: `the agon we built for you — going live on HN today`
- B: `re: <original subject> — launching today`

(A is bolder, B is safer. Pick one, send both halves of the list each variant. ~25 emails is enough to tell which subject wins by reply rate.)

**Body template:**

```
Hi [first name],

Quick follow-up on the agon I built for you last week
[link to their personalized debate page].

Consult The Dead is going live on Show HN this morning — the engine
has just learned to do 3-round multi-agent debates with a 30-mind
roster, and the launch-week annual is $99 for the first 30 subscribers.

Two reasons I'm writing again:

1. If the debate I generated for [their specific decision context]
   is still relevant, you can run a fresh one in 90 seconds at
   https://consultthedead.com/agora — no signup, 3 debates free.

2. If your founder community would value seeing the build (multi-agent
   SSE streaming, framework-as-JSON, Opus consensus synthesis), the
   HN post is here: [HN URL — fill in after posting].
   A signal-boost there matters more than buying a subscription.

Either way, glad if it's useful. Not chasing — just closing the loop
on the original send.

— Edward
```

**Why this works:**
- Names the original send (closes the loop honestly)
- Two CTAs at different commitment levels (use the tool / boost the post)
- Soft mention of the launch deal — not the lead
- "Not chasing" defuses sales-y read
- The link to the recipient's specific debate is the social-proof anchor

### Motion 2 — A small new Wave 3 list (5–10 targets, no personalized debates)

The leverage in Wave 3 is **distribution-weighted**, not signup-weighted. The targets:

| Type | Why | How many | When to send |
|---|---|---|---|
| Newsletter founders with 5K+ list focused on founder/indie audience | Each one is a 1→1000 amplification | 3–5 | Wed 2026-05-20 (post-launch validation) |
| Indie Hackers / Show HN regulars with high karma + own products | Social proof if they comment / try it publicly | 2–3 | Tue 2026-05-19 evening (after HN settles) |
| 1–2 specific X accounts in the "founder advice" niche | Public quote-RT of a debate is huge for distribution | 1–2 | Wed 2026-05-20 |

**You name the targets, not me.** I don't have your network graph or who's responsive. Use these criteria:
- They have an audience adjacent to the product (founders, decision-making, productivity)
- They publicly engage with new indie tools (don't ghost senders)
- A paid subscription from them generates social proof, not just $30

**Template (per target, ~80 words):**

```
Hi [name],

I built Consult The Dead — 30 historical minds run a multi-agent debate
on a hard decision. The framework layer (each mind reasons from a
structured JSON, not a persona prompt) is the part I'd love your read on.

Genuinely curious whether this fits anything you're thinking about — I
don't want a tweet, just an honest look. If the framework integrity holds
up, the launch deal ($99/year through May 31) is on the table.

Live: https://consultthedead.com/agora
Example: [share link to strongest debate]

— Edward
```

**Why:**
- No favor asked. "Honest look" is the only ask.
- The framework angle filters for people who'd actually care.
- Soft launch-deal mention — not the hook.
- 80 words. Anyone whose inbox is overflowing will give you 80 words.

### Motion 3 — Reactive warm-in (Tue–Fri post-launch)

The biggest unforced error in Wave 3 is **not following up with people who engage on social and never sign up.**

After the HN post, Twitter thread, and r/SideProject post, you'll get:
- Comments/replies that are positive but didn't convert
- DMs asking questions
- People who upvoted, commented once, then dropped off

These are the warmest leads in the entire funnel — they already passed the "is this BS?" filter. **Reach out within 48 hours** while the conversation is fresh.

**DM/email template (short):**

```
Hey [name],

Saw your [comment / reply / question] on the [HN post / r/SideProject post
/ thread]. Honest answer: [respond to their actual point in 1-2 sentences].

If you want to run a debate on a real decision, the link is here —
3 free, no signup: https://consultthedead.com/agora

If $99/year for the launch annual makes sense for you, that's open
through May 31. No pressure either way; I appreciated the engagement.

— Edward
```

## Send mechanics

- **Send via Resend** (not Gmail) for deliverability + the existing send infra
- **Suppress anyone in the unsubscribe / hard-bounce list** — `lib/emails/suppression.ts` handles this automatically if you wire Wave 3 sends through the same pipeline
- **Track replies in a single spreadsheet** — name, wave, sent date, reply Y/N, converted Y/N. The launch-week conversion data is the most valuable output of this entire effort.
- **Don't auto-CC yourself** on outreach. Skim replies in Resend's inbox, not in your own.

## Conversion math sanity check

Realistic Wave 3 paid signups by 2026-05-31:
- Motion 1 (launch-day follow-up to 25 recipients): 1–3 paid
- Motion 2 (5–10 new targets, distribution-weighted): 0–2 paid (the value is amplification, not direct signup)
- Motion 3 (post-launch warm-in to engagers): 2–5 paid (highest per-touch conversion)
- **Total: 3–10 paid** — meaningful but not the dominant channel

The HN post + r/SideProject + Twitter are still the dominant traffic. Wave 3 is the long-tail conversion lever for people who heard about the product through those channels but didn't convert on first touch.

## What's missing — Edward must fill before sending

1. **The HN post URL** — fill into Motion 1 templates after posting Tuesday morning.
2. **The "strongest debate" share link** — same one used in Show HN / Twitter / Reddit. Single artifact, multiple channels.
3. **The 5–10 Motion 2 names** — your network graph, not mine.
4. **Reply tracking spreadsheet** — even a Google Sheet. The launch-week conversion data is irreplaceable.

## Risk / conflicts

- **The Wave 1 follow-up cadence is already in market expectations** — recipients of Wave 1 may already be expecting a follow-up 7 days after the initial send. Don't skip it; just retool the body to leverage the launch.
- **Don't send Motion 1 BEFORE the HN post is live.** The email references the post; sending before makes the email obsolete on arrival.
- **Don't send Motion 3 from the same address as Resend transactional emails.** Mix transactional retention + outreach in one domain rep and you risk inbox placement on welcome emails. Use `edward@consultthedead.com` for outreach; reserve `notifications@consultthedead.com` for retention/transactional only.
- **Honor unsubscribes immediately.** Anyone who replied "please stop" or unsubscribed from Wave 1 or 2 should be suppressed in Wave 3.
