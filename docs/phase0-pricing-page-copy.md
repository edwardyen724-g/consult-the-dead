# Phase 0 — Pricing Page Copy

**Created:** 2026-04-23
**Owner:** Edward
**Purpose:** Ready-to-implement copy for consultthedead.com/pricing
**Tone:** Thoughtful, direct, slightly literary. Not SaaS-bro.

---

## Headline

**Get Better Counsel**

## Subhead

Think through your hardest decisions with historical minds. Unbiased, rigorous, immediate.

---

## Pricing Comparison

| | **Agora Free** | **Agora Pro** ★ |
|---|---|---|
| **Price** | Always free | **$30/month** or **$300/year** (2 months free) |
| Agons per period | 3/day | 100/month |
| Council size | 2–3 minds | Up to 5 minds |
| Synthesis quality | Sonnet | **Opus ★** |
| Debate library | Device only | **Persistent + searchable** |
| PDF export | — | ✓ |
| Extended research | — | ✓ |
| Bring your own key | Unlimited (you pay Anthropic) | Optional override |
| Founder support | — | **48h email response** |
| Account | Anonymous, no signup | Private, synced |

---

## CTA Buttons

**Free:** "Start thinking — no signup"

**Pro:** "Try Pro free for 7 days"

---

## Annual Callout

Pay yearly and lock in founding-member pricing: **$300/year** — saves you 2 months vs. monthly.

## Demo / Case Study Slot

Reserve a visible slot on the pricing page for a short Loom or the first customer case study. The copy should stay concrete and low-friction:

> A short Loom can live here, or this can become the first customer case study.

Use the space for a 60-90 second walkthrough of one real decision, then swap in a proof block once the first customer story is ready.

If the video is not ready yet, use a small callout that says:

> Embed-ready frame for Loom or customer callout

This keeps the pricing surface conversion-clear without pretending there is more social proof than exists.

---

## FAQ

**What happens when I hit the free limit?**
You'll see a prompt to upgrade. Nothing gets deleted — your work stays. Upgrade anytime, or come back tomorrow for 3 more.

**Can I cancel anytime?**
Yes. Monthly and yearly plans cancel at end of billing period. No refund for partial months, no hidden charges. Manage everything from your account page.

**What model powers the debates?**
Free uses Claude Sonnet for all turns. Pro uses Sonnet for debate rounds and Opus for the consensus synthesis — the final recommendation gets the strongest model.

**Do I need an Anthropic account?**
No, not for the default flow. We handle all AI calls and billing on Free and Pro, so you don't need an Anthropic account or API key. If you'd rather pay Anthropic directly and skip our limits, you can plug in your own key. Free users don't need an account with us either.

**Can I use my own Anthropic API key (BYO key)?**
Yes, on any tier. Open /agora, expand the optional Anthropic key drawer on the topic screen, and paste your `sk-ant-…` key. The key stays in browser localStorage and is forwarded in the request header; it is never written to server logs or our database. Using your own key bypasses the free-tier daily cap, so you get unlimited debates for as long as your Anthropic account has credit. Pro subscribers can use a BYO key too if they want to spend their own quota on heavy days.

**What's "founder support"?**
Direct email to Edward (the founder). 48-hour response. Real answers about the product, feature requests, decision-framing help. Not a template bot.

**Is my data private?**
Free debates are anonymous — we don't store them. Pro debates live in your private library indefinitely. We don't train on your debates and don't sell data. Full details in our privacy policy.

---

## Social Proof

No published customer testimonials yet. Keep this page free of fake quote blocks until real customer quotes are approved.

---

## Founding Member Badge

**Founding-member pricing.** Early subscribers lock in $300/year for life. After Q3 2026, annual plans go to $360. Monthly stays at $30.

---

## Closing Line

Good decisions are harder with unlimited options and no outside view. Agora is your sparring partner — not a therapist, not a calculator, not a consensus machine. Historical minds who've already thought through the problem you're facing, arguing it out on your behalf.

---

## Implementation Notes

- **7-day free trial** for Pro — reduces risk for the buyer, standard SaaS pattern
- **"Most Useful" or ★ badge** on Pro column — anchors attention without being pushy
- **No enterprise tier** — per playbook, enterprise is deferred until a paying customer asks
- **Feature count per tier** — kept to 8 rows max for scannability
- **Opus vs Sonnet callout** — this is the real quality differentiator; make it visible
- **"No signup" on free CTA** — removes friction for curiosity-driven visitors
- **Demo slot** — leave a visible embed-ready block on pricing for a Loom or first customer case study
- **No testimonial placeholders** — leave social proof blank until a real customer quote lands
