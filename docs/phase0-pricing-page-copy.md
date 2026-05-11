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
| Synthesis quality | Sonnet | **Opus** |
| Debate library | Device only | **Persistent + searchable** |
| PDF export | — | ✓ |
| Extended research | — | ✓ |
| Founder support | — | **48h email response** |
| Account | Anonymous, no signup | Private, synced |

---

## CTA Buttons

**Free:** "Start thinking — no signup"

**Pro:** "Try Pro free for 7 days"

---

## Annual Callout

Pay yearly and lock in founding-member pricing: **$300/year** — saves you 2 months vs. monthly.

---

## FAQ

**What happens when I hit the free limit?**
You'll see a prompt to upgrade. Nothing gets deleted — your work stays. Upgrade anytime, or come back tomorrow for 3 more.

**Can I cancel anytime?**
Yes. Monthly and yearly plans cancel at end of billing period. No refund for partial months, no hidden charges. Manage everything from your account page.

**What model powers the debates?**
Free uses Claude Sonnet for all turns. Pro uses Sonnet for debate rounds and Opus for the consensus synthesis — the final recommendation gets the strongest model.

**Do I need an Anthropic account?**
No. We handle all AI calls. You don't manage API keys or pay Anthropic directly. Free users don't even need an account with us.

**What's "founder support"?**
Direct email to Edward (the founder). 48-hour response. Real answers about the product, feature requests, decision-framing help. Not a template bot.

**Is my data private?**
Free debates are anonymous — we don't store them. Pro debates live in your private library indefinitely. We don't train on your debates and don't sell data. Full details in our privacy policy.

---

## Scenario Strip

Use anonymized decision scenarios from the Agora library instead of customer testimonials.
This is the shipped release-state block on `/pricing`, and it keeps the page honest about
what we actually have today.

> "Should I keep competing on price at $18K MRR, or reposition as premium before the market locks me in?" — *Machiavelli · Curie · Sun Tzu*

> "I built a product in a half-day hackathon. It’s at $20K MRR. Should I rebuild the fragile codebase or keep shipping?" — *da Vinci · Curie · Sun Tzu*

> "Open-source project at 13K stars. Just launched a paid product on top of it. The community feels betrayed. What do I do?" — *Aurelius · Machiavelli · Curie*

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
- **Scenario strip, not testimonials** — use anonymized debate cards until real customer proof exists
