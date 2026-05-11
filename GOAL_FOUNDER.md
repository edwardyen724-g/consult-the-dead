# Founder Directive — 100 paying Agora users by end of May 2026

**From:** Edward (founder)
**Date issued:** 2026-05-08
**Deadline:** 2026-05-31
**Status:** TOP PRIORITY — overrides all standing initiatives

> This document is the canonical mission for the wanman team as of 2026-05-08.
> It is **not** auto-generated. Edward wrote it. Treat it accordingly.

---

## The number

**100 paying users on Agora's Pro tier ($30/mo) by 2026-05-31.**

That is the only metric that matters for the next ~3 weeks. All other measures
(test coverage, lint, doc drift, refactor backlog) are subordinate to it.

## Why now

Agora (Consult the Dead) shipped its public share API. The product can now
generate organic referral traffic via `/agora/a/{id}` links. The free→Pro
upsell exists in the mind-cap (3 minds free, 5 minds Pro). The infrastructure
to convert is in place. The job for May is **distribution and conversion**, not
more building.

If 100 paying users is achievable in 3 weeks, we know the product has product-
market fit and we should pour fuel on it. If it isn't, we learn what gates the
top of the funnel and we re-plan from there.

## How each agent should re-orient

The CEO agent should treat this as initiative `16799287` (priority 10, ahead
of the standing roadmap initiative). All task decomposition for the next
3 weeks should ladder up to this number.

**Marketing:** pivot from doc-drift maintenance to growth. Concrete focus
areas to consider — pick the highest-leverage subset, don't try all at once:
- SEO: indexable per-mind landing pages, `/agora/a/{id}` shared agons treated
  as long-tail content, sitemap, schema.org, Open Graph for social previews.
- Content: launch posts, "X minds debate Y" listicles, Twitter/LinkedIn
  threads showcasing real agon transcripts, founder-narrative posts on the
  framework-extraction process.
- Share-loop virality: the public share API is the highest-leverage channel —
  every shared link is an acquisition surface. Add prominent "share this
  agon" CTAs at consensus, OG images for shared links, light branding
  ("Begin your own agon →") on the share page.
- Outreach: the `docs/outreach-debates/*.md` files are pre-baked debate
  drafts for specific people. Cold outreach with a personalized agon
  link is a credible top-of-funnel.

**Dev:** every PR should answer "does this move conversions?" Concrete
focus areas:
- Onboarding: time-to-first-agon must be under 60 seconds. Audit the
  /agora flow end-to-end, remove any friction.
- Pricing page: A/B-able copy, clear free vs Pro delta, social proof
  if any agons are public-shareable as "look what others are debating."
- Stripe checkout: must be one-click from the pricing CTA, no surprises,
  receipt/welcome email on success.
- Mind-cap upsell prompt: when a free user tries to add a 4th mind, the
  upgrade modal is the conversion moment. Make it convert.
- Share-page conversion path: visitors landing on `/agora/a/{id}` should
  see a clear "begin your own agon" CTA that takes them into the funnel.

**Feedback:** redirect from generic doc-drift signals to acquisition
signals. Concrete focus:
- Which referral sources land conversions vs. bounce.
- Which mind combinations are most-shared (signal for marketing).
- Which onboarding step has the highest drop-off.
- Free-tier users who hit the 3-mind cap — did they upgrade or bounce?
- Top organic search queries landing on `/agora/a/{id}` pages.

**CTO:** review against the goal. Coverage gate stays at 95% but bug-fix-
only PRs that don't move conversion or unblock conversion work go to the
back of the queue. Approve growth/onboarding/share-UX work first.

**DevOps:** ensure the share API, Stripe webhooks, and analytics pipelines
stay green. Any incident that breaks the conversion path is a red alert.

**AR:** weekly retro should report against this number specifically —
how many Pro signups happened this week, attributed to which channel, and
what the team learned.

## Operating cadence

- **Daily:** CEO publishes one initiative-board update on what shipped that
  moves the number, what's blocked, what's next.
- **Weekly (Friday):** AR retro reports on Pro subscribers, channels, what
  worked, what to kill.
- **Mid-month checkpoint (~2026-05-19):** if we're under ~30 paying users,
  re-plan — the funnel is broken somewhere and more of the same won't fix
  it. If we're over ~50, double down on whichever channel got us there.

## Out of scope (explicitly)

- Refactors that don't unblock growth work.
- New frameworks beyond the existing 11 (Einstein still legally gated).
- Multi-user / collaborative agon mode.
- Mobile app, voice, video.
- Anything in `company-builder/` — it stays dark per AGORA_PLAN.md §7.

## How this gets revised

Only Edward revises this document. Agents should not edit it. If an agent
believes the goal is wrong or the deadline is unrealistic, write the
analysis to your `output/` and surface it via `wanman escalate`.
