# Agora Pricing — Canonical Reference

**Last updated:** 2026-05-12
**Canonical copy module:** `website/src/lib/pricing-copy.ts` (metadata strings, free-tier copy, founding-member copy)
**Source of truth for:** marketing copy, README, MARKETING_STRATEGY.md, investor/press inquiries
**Live pricing page:** [consultthedead.com/pricing](https://consultthedead.com/pricing)
**Live product:** [consultthedead.com/agora](https://consultthedead.com/agora)

---

## Tiers

### Free — always free, no signup

| | |
|---|---|
| **Agons per period** | 3 / day (per IP) |
| **Council size** | 2–3 minds |
| **Synthesis model** | Claude Sonnet |
| **Debate library** | Device localStorage only (not persisted on server) |
| **PDF export** | — |
| **Extended research** | — |
| **Bring your own key** | Yes — unlimited when using your own Anthropic key |
| **Account** | Anonymous; no signup required |
| **Founder support** | — |

### Bring Your Own Key (BYO) — free tier + unlimited debates

Same as Free but bypasses the daily agon cap. User enters their `sk-ant-…` Anthropic key via the `/agora` settings drawer. The key is stored only in browser `localStorage`; it is never written to server logs or our database.

### Pro — $30/mo or $25/mo billed annually

| | |
|---|---|
| **Price** | $30/month (monthly) · $25/month = **$300/year** (annual) |
| **Agons per period** | 100 / month |
| **Council size** | 2–5 minds |
| **Synthesis model** | Claude Opus ★ (consensus pass) |
| **Debate library** | Persistent, server-synced, searchable |
| **PDF export** | ✓ |
| **Extended research** | ✓ (Tavily-backed, deeper context pass) |
| **Bring your own key** | Optional override |
| **Account** | Private, synced via Clerk auth |
| **Founder support** | 48-hour email response from Edward |

**7-day free trial** included. Cancel at end of billing period; no partial-month refunds.

---

## Founding-Member Pricing

Early Pro subscribers lock in **$300/year for life** — the current annual rate.

After **Q3 2026**, the annual plan increases to **$360/year**. Monthly stays at $30/month.

Anyone who subscribes on the annual plan before Q3 2026 keeps $300/yr permanently, regardless of future price increases. No action needed to lock it in — it applies automatically at time of subscription.

This offer is not advertised with a countdown and has no separate SKU — it is the current annual price, and it remains locked once subscribed.

---

## Conversion Funnel

```
Anonymous visitor
  ↓ uses 3 free agons
  ↓ hits daily cap → prompt to upgrade or add BYO key
     ↓  (if BYO key)  → unlimited, stays free tier (no revenue)
     ↓  (if Pro)      → Stripe checkout → 7-day trial → $30/mo or $300/yr
                                                         ↑ founding-member lock-in
```

Key friction points:
- Daily cap (3/day) is the primary upgrade trigger for non-technical users
- BYO key is the escape hatch for Anthropic-account holders; reduces urgency to upgrade
- Opus model quality and persistent library are the primary Pro value props post-trial

---

## Pro Features — Implemented Status (as of 2026-05-12)

| Feature | Status |
|---|---|
| Opus for consensus synthesis | ✅ Shipped |
| Persistent debate library | ✅ Shipped |
| PDF export via print dialog | ✅ Shipped |
| Extended Tavily research pass | ✅ Shipped |
| 48h founder email support | ✅ Manual (Edward responds directly) |
| Up to 5 minds council | ✅ Shipped (gated in `/api/agon`) |
| Shareable agon URLs | ✅ Shipped (`/agora/a/[id]` with OG images, Twitter card, share CTA strip) |
| 100 agons/month limit | ✅ Enforced in rate limiter |

---

## Implementation Details

| System | Source |
|---|---|
| Auth | Clerk (`publicMetadata.subscription_tier === "pro"`) |
| Payment | Stripe (monthly + annual products; 7-day trial) |
| Mind-cap enforcement | `/api/agon/route.ts` — `mindMax = isPro ? 5 : 3` |
| Rate-limit enforcement | `website/src/lib/agon/rateLimit.ts` — 3 agons/day free, 100/month Pro |
| Pricing page | `website/src/app/pricing/page.tsx` |
| Pricing constants | `website/src/lib/pricing/pricing-constants.ts` — single source for all numeric values |
| Live stats (social proof) | `website/src/lib/pricing/live-stats.ts` — minds count, agons run, and pack count are fetched live from the database and framework registry; never hardcoded on the pricing page |

---

## What to Quote Externally

**Marketing headline:** "Always free to start. Pro at $30/month — or $300/year while founding pricing lasts."

**Feature differentiation:** "Free gives you 3 debates a day with Sonnet. Pro gives you Opus, your full library, PDF, and deeper research — at the founding member price of $300/year before Q3 2026."

**No-surprises statement:** "Cancel anytime. Monthly and yearly plans stop at the end of the billing period. No partial-month refunds."
