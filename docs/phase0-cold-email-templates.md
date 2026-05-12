# Phase 0 — Cold Email Templates (3 Variants)

**Created:** 2026-04-23
**Owner:** Edward
**Purpose:** A/B test three approaches for Agora Pro cold outreach
**Backed by:** Personalized debates in `docs/outreach-debates/<name>.md`

---

## Pre-send requirements

Before sending any of these:
1. Publish each target's debate as a page on consultthedead.com (e.g., `/debates/<slug>`)
2. Set up SPF/DKIM/DMARC on your sending domain
3. Warm the sending mailbox for 2 weeks (or use a warmed address)
4. Cap volume: 20-30 emails/day max from a single mailbox

---

## Variant A — "The Gift" (lead with consensus excerpt)

**What it tests:** Does showing the product's output inline — before asking for anything — drive replies?

**Subject:** your {{decision_keyword}} decision

**Body:**

Hey {{first_name}},

I read your piece on {{source}} about {{one_sentence_decision_context}}. I built a tool that runs decisions like that through a structured debate between historical reasoning frameworks — Machiavelli on power, Curie on evidence, Sun Tzu on positioning — and I ran yours through it.

Here's where the council landed:

> {{2-3 sentence consensus excerpt from their debate — the "Recommended Action" section, trimmed to the sharpest lines}}

The full 3-round debate is here if you're curious: {{link}}

If there's a decision on your desk right now, I'll run it for free — just reply with what you're thinking about.

Edward

---

**Example filled in (Abhishek Chakravarty):**

**Subject:** your pricing decision

Hey Abhishek,

I read your IH feature about competing on price with Youform at $18K MRR. I built a tool that runs decisions like that through a structured debate between historical reasoning frameworks — Machiavelli on power, Curie on evidence, Sun Tzu on positioning — and I ran yours through it.

Here's where the council landed:

> Raise prices on all new customers within 30 days while documenting your 2-3 highest-ROI customer outcomes in parallel. Don't wait for case studies to publish before changing the price, but don't raise prices on existing customers until at least one anchor case study is live.

The full 3-round debate is here if you're curious: consultthedead.com/debates/abhishek-chakravarty

If there's a decision on your desk right now, I'll run it for free — just reply with what you're thinking about.

Edward

---

You're receiving this because your recent writing or social presence signals a live strategic decision. If you'd prefer not to receive future messages like this, reply with "unsubscribe" and I'll remove you immediately.

Edward Yen  
Consult The Dead  
https://consultthedead.com

---

## Variant B — "The Question" (lead with curiosity, defer the gift)

**What it tests:** Does a shorter, question-led email with no inline excerpt get more replies by reducing reading commitment?

**Subject:** {{first_name}} — quick question

**Body:**

Hey {{first_name}},

I saw your {{source}} piece on {{one_sentence_decision_context}}. Curious — did you end up going with {{option_A}} or {{option_B}}?

I ask because I built something that would have been useful before you decided. It runs your specific question through a structured debate between 3 historical reasoning frameworks (think Machiavelli vs. Curie vs. Sun Tzu arguing about YOUR call), then produces a consensus.

I already ran yours: {{link}}

Would love to hear if the council got it right.

Edward

---

**Example filled in (Jonathan Chan):**

**Subject:** jonathan — quick question

Hey Jonathan,

I saw your IH feature on quitting a $420K job to run a two-business portfolio at $30K/mo. Curious — are you still running both, or did you end up killing the weaker one?

I ask because I built something that would have been useful before you decided. It runs your specific question through a structured debate between 3 historical reasoning frameworks (think Machiavelli vs. Sun Tzu vs. Marcus Aurelius arguing about YOUR call), then produces a consensus.

I already ran yours: consultthedead.com/debates/jonathan-chan

Would love to hear if the council got it right.

Edward

---

You're receiving this because your recent writing or social presence signals a live strategic decision. If you'd prefer not to receive future messages like this, reply with "unsubscribe" and I'll remove you immediately.

Edward Yen  
Consult The Dead  
https://consultthedead.com

---

## Variant C — "The Bet" (most direct, challenges their decision)

**What it tests:** Does a bolder, slightly provocative framing drive higher engagement by challenging their thinking?

**Subject:** what machiavelli would say about {{decision_keyword}}

**Body:**

Hey {{first_name}},

{{One provocative line from one advisor's argument in their debate — something that challenges conventional thinking about their decision}}.

That's Machiavelli's take on {{their_decision_in_5_words}}. Curie disagrees. Sun Tzu has a third angle entirely.

I built a tool that runs real decisions through structured debates between historical reasoning frameworks. I ran yours — the one from your {{source}} piece: {{link}}

The consensus surprised me. Might surprise you too.

What's the hardest call on your plate right now? I'll run it free.

Edward

---

**Example filled in (Cameron Trew):**

**Subject:** what machiavelli would say about platform dependency

Hey Cameron,

"LinkedIn is not a platform you use — it is a sovereign whose terms you accept. You cannot build durable power on another prince's land." 

That's Machiavelli's take on your Kleo dependency. Curie disagrees — she says the data on LinkedIn's enforcement patterns doesn't support the panic. Sun Tzu has a third angle entirely.

I built a tool that runs real decisions through structured debates between historical reasoning frameworks. I ran yours — the one from your IH piece about rebuilding after the C&D: consultthedead.com/debates/cameron-trew

The consensus surprised me. Might surprise you too.

What's the hardest call on your plate right now? I'll run it free.

Edward

---

You're receiving this because your recent writing or social presence signals a live strategic decision. If you'd prefer not to receive future messages like this, reply with "unsubscribe" and I'll remove you immediately.

Edward Yen  
Consult The Dead  
https://consultthedead.com

---

## Which variant to send to whom

**Recommended split for the initial 30:**

| Variant | Send to | Count | Why |
|---------|---------|-------|-----|
| A (The Gift) | Founders #1-10 | 10 | Tests the inline-excerpt approach on the broadest sample |
| B (The Question) | Founders #11-18 + VCs #23-26 | 12 | Tests curiosity-driven approach on mixed segments |
| C (The Bet) | Founders #19-22 + VCs #27-30 | 8 | Tests provocative framing on smaller sample |

**Measure after 7 days:**
- Open rate (subject line test: A vs B vs C)
- Reply rate (body test: gift vs question vs bet)
- Quality of replies (did they engage with the debate, or just say "cool"?)

**Follow-up sequence (same for all variants):**

**Day 4 — Follow-up 1:**

Subject: re: {{original_subject}}

Hey {{first_name}}, bumping this — did the council's take land at all? If it missed the mark, that's useful feedback too.

Edward

**Day 9 — Follow-up 2 (final):**

Subject: re: {{original_subject}}

Last note — if the timing's off, no worries. The tool is at consultthedead.com/agora if you ever want to run a decision through it yourself. 3 agons/day, no signup.

Edward

---

## CAN-SPAM & Bounce Compliance

### Opt-Out Footer (required by CAN-SPAM — add to ALL variants)

Append the following footer to every email sent:

```
---

You're receiving this because your recent writing or social presence signals a live strategic decision. 
If you'd prefer not to receive future messages like this, reply with "unsubscribe" and I'll remove you immediately.

Edward Yen
Consult The Dead
https://consultthedead.com
```

**Why this footer:**
- CAN-SPAM requires commercial emails to include a clear opt-out mechanism
- This is B2B founder-to-founder outreach, not marketing spam, but compliance matters
- The footer tone matches the "founder-to-founder" voice rather than corporate unsubscribe language
- Any reply to "unsubscribe" should trigger immediate removal from the send list

### Bounce Handling & Suppression

**Immediate actions on any bounce:**

1. **Hard bounces** (550 / 5xx errors — invalid address)
   - Remove immediately from the send list
   - Update the Email Verification Log in docs/phase0-target-list.md with status `bounced`
   - Do NOT retry; address is permanently invalid

2. **Soft bounces** (421 / 4xx errors — temporary delivery issue)
   - Retry once after 24 hours
   - If second attempt bounces, treat as hard bounce and suppress

3. **Bounce log & tracking**
   - Record bounce status in output/marketing-notes.md under "Wave X Tracking"
   - Use format: `[BOUNCE] {{name}} ({{email}}) — {{bounce_type}} — {{error_code}}`
   - Update the task status as bounces come in

**Suppression list management:**

- Maintain a running suppression list (hard bounces + unsubscribe requests) in output/suppression_list.txt
- Before each subsequent wave, cross-check all new recipients against the suppression list
- Suppress automatically: hard bounces, unsubscribe requests, replies indicating "not interested" or "stop emailing"

---

## Notes

- **Email length:** Variant A is ~100 words, B is ~85 words, C is ~90 words. All within the 50-125 word sweet spot.
- **Subject lines:** All lowercase, short, personal-feeling. No exclamation marks, no "exclusive offer" language.
- **CTA:** All three end with a low-friction ask ("reply with what you're thinking about" or "what's the hardest call on your plate"). Not asking for a meeting or a signup — just a reply.
- **The link:** Goes to consultthedead.com/debates/<slug> — needs to be built as static pages before sending.
- **Tone:** Founder-to-founder. No "we" or "our team." Just Edward.
- **Follow-up:** 2 touches max. The sequence respects their inbox. If they don't reply after 3 emails total, they're done.
- **Compliance:** Every email MUST include the opt-out footer above. Bounce handling guidance is in the "CAN-SPAM & Bounce Compliance" section above.
