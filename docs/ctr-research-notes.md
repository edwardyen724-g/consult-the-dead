# CTR & Engagement Research Brief

**Date:** 2026-05-10

This brief turns the engagement notes into a ranked experiment plan for the next homepage and pricing iteration. The key constraint is that the live product already ships:

- a curiosity-led homepage hero
- a streaming demo below the fold
- a quiz entry path
- six themed pack cards
- a simple Free vs Pro pricing page
- **LibraryProofStrip** on `/library` — shows "X minds consulted · Y saved debates" as a compact stat bar (PR #184); the cumulative collection-feedback signal is already live for Pro users
- **Transcript share helper** (`share-transcript.ts`, PR #180) — formats a pull-quote excerpt with the canonical `/agora/a/[id]` URL into a clipboard-ready share blob (≤280 chars)

The next batch should sharpen those shipped surfaces instead of starting a redesign.

## Current Shipped Baseline

- Homepage CTA path: `/` → `/agora` or `/quiz`
- Pack browsing path: `/` and `/frameworks`
- Pricing path: `/pricing`
- Demo path: the homepage `StreamingDemo`
- Free pricing state: 3 agons/day, anonymous, no signup
- Pro pricing state: $30/month or $300/year, 7-day trial, Opus consensus, persistent library, PDF export, extended research, optional BYO key

### Live-Proof Pricing Contract

The `/pricing` page ships a live-proof strip on the conversion surface to establish
capability credibility before the tier CTA. The contract as of 2026-05-11:

- **Stats counter row** (`data-testid="pricing-stats"`) — rendered via
  `formatPricingStats(PRICING_STATS_DEFAULT)` from
  `website/src/lib/pricing/stats.ts`. Displays three monospaced labels:
  `"18 minds"`, `"30 debates in the library"`, `"Free to start"`.
  Source of truth for the numbers: `ALLOWED_SLUGS` length in
  `website/src/lib/frameworks.ts` (minds count) and `docs/outreach-debates/*.md`
  count (debates count). Update both `PRICING_STATS_DEFAULT` and the source files
  when the roster or debate library grows.

- **Social-proof debate scenario strip** (`SOCIAL_PROOF` constant in
  `website/src/app/pricing/page.tsx`) — three anonymised debate topics with council
  composition harvested from `docs/outreach-debates/`. No attribution; only the
  decision and the council are shown. These are static and updated manually when
  better real-use examples are available.

The proof strip is intentionally static for v1 (marketing brief 22ee79de §Part 4
Variant A). Task `55af6ebe` tracks switching the minds/debatesInLibrary counters to
live Vercel Analytics event counts when that source is ready; the `formatPricingStats`
API is designed to accept a live `PricingStats` object without touching the page JSX.

## Prioritized Experiments

| Priority | Experiment | Surface | Why now | Expected lift | Effort |
|---|---|---|---|---|---|
| 1 | Curiosity-gap hero rewrite | Homepage hero | This is the highest-exposure surface and already exists; the fastest win is tighter copy, not a new layout. | Lower bounce, higher CTA clickthrough | Small |
| 2 | Quiz-driven personalization | Homepage + `/quiz` | The quiz route already exists, so we can route users into a relevant pack or featured mind instead of sending everyone to the same generic entry point. | Higher CTR and better first-session relevance | Small to medium |
| 3 | Move the streaming demo earlier | Homepage | The demo is already shipped; the work is to make it more visually dominant and faster to start so it earns attention before the first scroll. | Better engagement and more time on page | Small |
| 4 | Pricing-page proof without fake testimonials | `/pricing` | The pricing copy still needs real social proof discipline. Until there are approved customer quotes, the page should rely on shipped-product proof and concrete feature framing. | Higher trust, fewer credibility leaks | Small |
| 5 | Loss-aversion / quota reminders | `/pricing` and `/agora` | The free cap and Pro trial already exist. A careful reminder system can make the upgrade trigger feel obvious without inventing new pricing complexity. | Better free-to-paid conversion | Medium |
| 6 | Collection feedback — **implemented (monitoring)** | `/library` | Shipped as `LibraryProofStrip` (PR #184): renders "X minds consulted · Y saved debates" below the `/library` title as a compact monospaced stat bar. The hypothesis that showing cumulative progress increases return visits and shareability is now live; watch library return-visit rate and save-to-share conversion. | Higher return visits and shareability | Shipped |

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
- Library return-visit rate (Pro users with ≥1 saved debate)
- Share-blob click rate on the `/agora/a/[id]` share CTA

## Guardrails

- Do not add fake testimonials to compensate for missing social proof.
- Do not introduce pack-based pricing before there is evidence that users buy by pack instead of by tier.
- Do not widen the homepage before the current hero, demo, and quiz path have been tested.
- Do not re-queue LibraryProofStrip or the transcript share helper as open design gaps — both contracts are shipped (PRs #184 and #180); the remaining open work is the homepage hook and adoption measurement.

## Shipped Features Not Originally Tracked as Experiments

**Transcript share helper (PR #180) — implemented (monitoring)**

`buildTranscriptShareText` in `website/src/lib/share-transcript.ts` formats a pull-quote excerpt from a mind's response into a clipboard-ready share blob: title line, quoted excerpt (capped at 280 chars), canonical `/agora/a/[id]` URL, and attribution line. This directly supports the shareability hypothesis from the Collection feedback research. The implementation is live; watch public agon page traffic from share referrals as the leading indicator.
