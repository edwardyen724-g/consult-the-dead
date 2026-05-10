# Phase 0 — Pricing Page Copy

**Created:** 2026-04-23
**Owner:** Edward
**Purpose:** Archived phase0 copy brief for the Agora pricing page. The live pricing canon now lives in [`docs/pricing.md`](docs/pricing.md), and the live product surface is [`/agora`](https://consultthedead.com/agora).
**Tone:** Thoughtful, direct, slightly literary. Not SaaS-bro.

---

## Headline

**Run your hardest decision through 26 historical minds.**

## Subhead

They'll disagree. You'll decide.

---

## Pricing Comparison

| | **Free** | **BYO Key** | **Pro** ★ |
|---|---|---|---|
| **Price** | Always free | Free (you pay Anthropic) | **$30/month** or **$25/month billed annually** (**$300/year**) |
| Agons per period | 3/day | Unlimited | 100/month |
| Council size | 2–3 minds | 2–3 minds | Up to 5 minds |
| Synthesis quality | Sonnet | Sonnet | **Opus** |
| Debate library | Device only | Device only | **Persistent + searchable** |
| PDF export | — | — | ✓ |
| Extended research | — | — | ✓ |
| Founder support | — | — | **48h email response** |
| Account | Anonymous, no signup | Anonymous, no signup | Private, synced |

**BYO Key note:** Same free-tier experience, but unlimited debates when the user supplies their own Anthropic key. The key stays in browser storage only and is never written to our servers.

---

## CTA Buttons

**Free:** "Start thinking — no signup"

**Pro:** "Start 7-day Pro trial — Opus + Library"

---

## Annual Callout

Pay yearly and lock in founding-member pricing: **$300/year for life**. After Q3 2026, the annual plan increases to **$360/year** for new annual subscribers.

---

## FAQ

**What happens when I hit the free limit?**
You'll see a prompt to upgrade or add your own Anthropic key. Nothing gets deleted — your work stays. Upgrade anytime, or come back tomorrow for 3 more.

**Can I cancel anytime?**
Yes. Monthly and yearly plans cancel at end of billing period. No refund for partial months, no hidden charges. Manage everything from your account page.

**What model powers the debates?**
Free uses Claude Sonnet for all turns. Pro uses Sonnet for debate rounds and Opus for the consensus synthesis — the final recommendation gets the strongest model.

**Do I need an Anthropic account?**
No for Free or Pro. We handle all AI calls. If you choose BYO Key, you enter your own Anthropic key locally for unlimited debates. Free users don't even need an account with us.

**What's "founder support"?**
Direct email to Edward (the founder). 48-hour response. Real answers about the product, feature requests, decision-framing help. Not a template bot.

**Is my data private?**
Free debates are anonymous — we don't store them. Pro debates live in your private library indefinitely. We don't train on your debates and don't sell data. Full details in our privacy policy.

---

## Founding Member Badge

**Founding-member pricing.** Early subscribers lock in **$300/year for life**. After Q3 2026, annual plans go to **$360/year**. Monthly stays at $30.

---

## Closing Line

Good decisions are harder with unlimited options and no outside view. Agora is your sparring partner — not a therapist, not a calculator, not a consensus machine. Historical minds who've already thought through the problem you're facing, arguing it out on your behalf.

---

## Implementation Notes

- **Canonical reference:** `docs/pricing.md` should stay authoritative for pricing, feature status, and founding-member terms.
- **7-day free trial** for Pro remains part of the shipped checkout flow.
- **Pro CTA text** should match the live page copy: "Start 7-day Pro trial — Opus + Library".
- **Social proof should be transcript-backed scenario cards** from `docs/outreach-debates/`; do not fabricate testimonials.
- **"No signup" on the Free CTA** remains the right friction-reduction copy.
- **Opus vs Sonnet callout** is the core quality differentiator and should stay visible.
- **Pro today is shipped** with Opus consensus, persistent library, PDF export, extended research, 5-mind councils, shareable agon URLs, and 48h founder support. Keep any copy brief aligned to that current feature set rather than the earlier phase-0 placeholder wording.
