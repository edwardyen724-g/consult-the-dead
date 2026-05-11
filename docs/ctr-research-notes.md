# CTR & Engagement Research Brief

**Date:** 2026-05-10

This brief turns the engagement notes into a ranked experiment plan for the next homepage and pricing iteration. The key constraint is that the live product already ships:

- a curiosity-led homepage hero
- a streaming demo below the fold
- a quiz entry path
- six themed pack cards
- a simple Free vs Pro pricing page

The next batch should sharpen those shipped surfaces instead of starting a redesign.

## Current Shipped Baseline

- Homepage CTA path: `/` → `/agora` or `/quiz`
- Pack browsing path: `/` and `/frameworks`
- Pricing path: `/pricing`
- Demo path: the homepage `StreamingDemo`
- Free pricing state: 3 agons/day, anonymous, no signup
- Pro pricing state: $30/month or $300/year, 7-day trial, Opus consensus, persistent library, PDF export, extended research, optional BYO key

## Prioritized Experiments

| Priority | Experiment | Surface | Why now | Expected lift | Effort |
|---|---|---|---|---|---|
| 1 | Curiosity-gap hero rewrite | Homepage hero | This is the highest-exposure surface and already exists; the fastest win is tighter copy, not a new layout. | Lower bounce, higher CTA clickthrough | Small |
| 2 | Quiz-driven personalization | Homepage + `/quiz` | The quiz route already exists, so we can route users into a relevant pack or featured mind instead of sending everyone to the same generic entry point. | Higher CTR and better first-session relevance | Small to medium |
| 3 | Move the streaming demo earlier | Homepage | The demo is already shipped; the work is to make it more visually dominant and faster to start so it earns attention before the first scroll. | Better engagement and more time on page | Small |
| 4 | Pricing-page proof without fake testimonials | `/pricing` | The pricing copy still needs real social proof discipline. Until there are approved customer quotes, the page should rely on shipped-product proof and concrete feature framing. | Higher trust, fewer credibility leaks | Small |
| 5 | Loss-aversion / quota reminders | `/pricing` and `/agora` | The free cap and Pro trial already exist. A careful reminder system can make the upgrade trigger feel obvious without inventing new pricing complexity. | Better free-to-paid conversion | Medium |
| 6 | Collection feedback | Homepage + library | The product already has multiple minds and packs; showing progress or "you have consulted X minds" can make the system feel cumulative instead of one-off. | Higher return visits and shareability | Medium |

## Recommended Next Batch

Ship these first:

1. Hero copy variants that are more specific about the decision being solved.
2. Quiz routing that selects a matching pack or featured mind.
3. Demo prominence and start-time work so it is visible within the first screen.
4. Pricing page cleanup that removes any placeholder social proof and keeps the proof story tied to live product behavior.

## Metrics To Watch

- Homepage CTA clickthrough
- Bounce rate on `/`
- Quiz start rate and quiz completion rate
- Pricing page conversion to checkout
- Free-to-Pro upgrade rate after cap hit
- Demo interaction rate

## Guardrails

- Do not add fake testimonials to compensate for missing social proof.
- Do not introduce pack-based pricing before there is evidence that users buy by pack instead of by tier.
- Do not widen the homepage before the current hero, demo, and quiz path have been tested.
