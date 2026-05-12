# CTR & Engagement Research Brief

**Date:** 2026-05-12

This brief turns the engagement notes into a ranked experiment plan for the next homepage and pricing iteration. The key constraint is that the live product already ships:

- a curiosity-led homepage hero
- a streaming demo below the fold
- a quiz entry path
- six themed pack cards
- a public debate archive at `/debates`
- static debate pages at `/debates/[slug]` that mirror published Agora transcripts and link back to `/agora`
- a simple Free vs Pro pricing page
- **LibraryProofStrip** on `/library` — shows "X minds consulted · Y saved debates" as a compact stat bar (PR #184); the cumulative collection-feedback signal is already live for Pro users
- **Transcript share helper** (`share-transcript.ts`, PR #180) — formats a pull-quote excerpt with the canonical `/agora/a/[id]` URL into a clipboard-ready share blob (≤280 chars)
- production email from `notifications@consultthedead.com` for the welcome, subscription confirmation, and recap surfaces

The next batch should sharpen those shipped surfaces instead of starting a redesign.

## Current Shipped Baseline

- Homepage CTA path: `/` → `/agora` or `/quiz`
- Pack browsing path: `/` and `/frameworks`
- Pricing path: `/pricing`
- Public debate path: `/debates` and `/debates/[slug]`
- Email path: `notifications@consultthedead.com` for the shipped account and recap mail surfaces
- Demo path: the homepage `StreamingDemo`
- Free pricing state: 3 agons/day, anonymous, no signup
- Pro pricing state: $30/month or $300/year, 7-day trial, Opus consensus, persistent library, PDF export, extended research, optional BYO key

### Live-Proof Pricing Contract

The `/pricing` page ships a live-proof strip on the conversion surface to establish
capability credibility before the tier CTA. The contract as of 2026-05-12:

- **Stats counter row** (`data-testid="pricing-stats"`) — rendered via
  `formatPricingStats(initialStats)` from `website/src/lib/pricing/stats.ts`.
  The server wrapper seeds `initialStats` from `getPricingStats()` so the first
  render reflects live counts when the database and framework registry are
  reachable, then the client revalidates from `/api/stats` after mount.
  `PRICING_STATS_DEFAULT` remains the fallback for degraded responses.

- **Social-proof debate scenario strip** (`SOCIAL_PROOF` constant in
  `website/src/app/pricing/page.tsx`) — three anonymised debate topics with council
  composition harvested from `docs/outreach-debates/`. No attribution; only the
  decision and the council are shown. These are static and updated manually when
  better real-use examples are available.

The pricing proof story is intentionally limited to the live stats row plus these
approved scenario cards. Until real customer quotes are shipped and approved, do
not add testimonial placeholders, founder blurbs, or fabricated social-proof
claims to the pricing surface.

The proof strip now uses live-seeded counts rather than a frozen baseline for the
hero counter row. `formatPricingStats` still accepts a plain `PricingStats` object,
so future analytics sources can swap in without touching the page JSX.

## Prioritized Experiments

| Priority | Experiment | Surface | Why now | Expected lift | Status |
|---|---|---|---|---|---|
| 1 | Decision-first hero rewrite | Homepage hero | **Shipped (master, 2026-05-12).** The generic mystical headline was replaced with "You have a decision. / History has a council." — a visceral decision-first headline (≤10 words) framed around the user's decision rather than the product. Primary CTA goes to `/agora` with UTM attribution. A deeper variant ("Make the call. History argues first.") with first-scroll demo consensus preview is on `wanman/homepage-hero-decision-first`, open PR. Monitor: homepage CTA clickthrough rate and bounce rate vs. prior baseline. | Lower bounce, higher CTA clickthrough | Shipped (partial — see notes) |
| 2 | Quiz-driven personalization | Homepage + `/quiz` | **Shipped (PR #335, master, 2026-05-12).** `buildQuizModel` and `QUIZ_ROUTE_GROUPS` route users to a best-fit council based on decision type. The quiz page copy is locked: "Name the decision before you pick the council." with routing hint "The guided quiz narrows the room before it opens Agora." Monitor: quiz start rate from homepage, quiz completion rate, and first-agon conversion rate by quiz-vs-direct entry. | Higher CTR and better first-session relevance | Shipped |
| 3 | Move the streaming demo earlier | Homepage | **Shipped (master).** The `StreamingDemo` section is surfaced above the pack cards behind a `data-testid="streaming-demo-section"` marker, so it earns attention before the first scroll. The deeper first-viewport demo preview (consensus excerpt blockquote) is on the `wanman/homepage-hero-decision-first` branch and not yet on master. | Better engagement and more time on page | Shipped (partial — deeper preview in open PR) |
| 4 | Pricing-page proof without fake testimonials | `/pricing` | **Shipped (master, 2026-05-12).** The `SOCIAL_PROOF` constant holds three anonymized debate topics with council composition. The live stats row (`data-testid="pricing-stats"`) seeds from `getPricingStats()` server-side and revalidates from `/api/stats` on the client. The Pro CTA is a prominent amber button with trust badge (`data-testid="pro-cta-trust-badge"`). UTM params are forwarded from the page URL into the Stripe checkout call. No testimonial placeholders or founder blurbs — proof is limited to the stats row and scenario cards. | Higher trust, fewer credibility leaks | Shipped |
| 5 | Loss-aversion / quota reminders | `/agora` | **Shipped (PR #302, master).** A quota-countdown nudge (`data-testid="quota-countdown-nudge"`) appears when a free user has exactly 1 agon remaining. An email-capture modal (`data-testid="email-capture-modal"`) is shown to free users at the consensus stage to capture Beehiiv subscribers before the upgrade prompt. Monitor: free-to-Pro upgrade rate at and after quota hit; email capture submit rate vs. skip rate. | Better free-to-paid conversion | Shipped |
| 6 | Collection feedback — **implemented (monitoring)** | `/library` | Shipped as `LibraryProofStrip` (PR #184): renders "X minds consulted · Y saved debates" below the `/library` title as a compact monospaced stat bar. The hypothesis that showing cumulative progress increases return visits and shareability is now live; watch library return-visit rate and save-to-share conversion. | Higher return visits and shareability | Shipped |
| 7 | Agora share CTA strip | `/agora` | **Shipped (commit `ef96ee1a`, master, 2026-05-12).** The share CTA strip on the Agora result surface is tightened to component-only scope. `buildTranscriptShareText` formats a pull-quote excerpt with the canonical `/agora/a/[id]` URL. Monitor: share-blob click rate on the `/agora/a/[id]` public share surface. | Higher shareability and viral loop | Shipped |

## Shipped Batch Summary (as of 2026-05-12)

These have all landed:

1. **Homepage hero decision-first copy** — "You have a decision. / History has a council." on master. A deeper variant with first-scroll consensus preview is on an open PR (`wanman/homepage-hero-decision-first`).
2. **Quiz routing by decision type** — PR #335 merged. `buildQuizModel` and `QUIZ_ROUTE_GROUPS` deliver personalized council recommendations.
3. **Demo elevated above pack cards** — `StreamingDemo` moved above the fold on master.
4. **Pricing proof strip** — Live stats row seeded server-side + three anonymized scenario cards + Pro CTA with UTM forwarding. No fake testimonials.
5. **Quota countdown nudge** — PR #302 merged. Shown when free user has 1 agon left.
6. **Email capture at consensus stage** — Beehiiv capture modal for free users at synthesis (`data-testid="email-capture-modal"`).
7. **Agora share CTA strip** — Tightened in commit `ef96ee1a`.

## Metrics To Watch

- Homepage CTA clickthrough (hero → `/agora` direct; hero → `/quiz` guided entry)
- Bounce rate on `/` vs. prior baseline (baseline: pre-2026-05-12 generic headline)
- Quiz start rate from homepage; quiz completion rate; quiz-vs-direct first-agon conversion delta
- Pricing page conversion to checkout; UTM attribution completeness (utm_campaign + utm_content forwarded to Stripe)
- Free-to-Pro upgrade rate at quota hit; email capture submit rate vs. skip rate at consensus stage
- Demo interaction rate (streaming demo autoplay and user engagement)
- Library return-visit rate (Pro users with ≥1 saved debate)
- Share-blob click rate on the `/agora/a/[id]` share CTA

## Guardrails

- Do not add fake testimonials to compensate for missing social proof.
- Do not collapse the public gift surface (`/debates`) into the conversion surface (`/agora`); they serve different parts of the funnel.
- Do not introduce pack-based pricing before there is evidence that users buy by pack instead of by tier.
- Do not widen the homepage before the current hero, demo, and quiz path have been tested.
- Do not re-queue LibraryProofStrip or the transcript share helper as open design gaps — both contracts are shipped (PRs #184 and #180); the remaining open work is the homepage hook and adoption measurement.

## Shipped Features Not Originally Tracked as Experiments

**Transcript share helper (PR #180) — implemented (monitoring)**

`buildTranscriptShareText` in `website/src/lib/share-transcript.ts` formats a pull-quote excerpt from a mind's response into a clipboard-ready share blob: title line, quoted excerpt (capped at 280 chars), canonical `/agora/a/[id]` URL, and attribution line. This directly supports the shareability hypothesis from the Collection feedback research. The implementation is live; watch public agon page traffic from share referrals as the leading indicator.
