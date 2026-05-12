# Edward's Wave 1 Send Handoff — Quick Reference

**Send Date:** Wednesday, 2026-05-13  
**Send Window:** 8:00am–11:00am ET (aim for start at 8:00am)  
**Recipients:** 10 founders  
**Est. Time:** ~30 minutes for all sends (3 min per email)

---

## The Mission

Send 10 personalized debate excerpts to high-signal indie founders. Each email:
- References their real work (IH posts, Twitter threads, public company info)
- Includes a custom council consensus excerpt from their debate
- Positions Consult The Dead as a decision-making co-pilot
- CTA: "Reply with your next decision, I'll run it for free"

**Goal:** 15% reply rate → unlock Wave 2 (20 more founders)

---

## Documents You'll Need

1. **`output/WAVE1_SEND_EXECUTION_STEPS.md`** ← Start here for step-by-step instructions
2. **`docs/outreach-debates/WAVE1_SEND_BRIEF.md`** ← Source of all 10 personalized emails (lines 62–140)
3. **`output/marketing-notes.md`** ← Paste your send log here after completing all 10

---

## The 10 Recipients

| # | Founder | Subject | Email Source | Debate Link |
|---|---------|---------|--------------|-------------|
| 1 | Abhishek Chakravarty | your pricing decision | IH | debates/abhishek-chakravarty |
| 2 | Dmytro Krasun | your portfolio decision | Twitter/IH | debates/dmytro-krasun |
| 3 | Jonathan Chan | your portfolio decision | IH | debates/jonathan-chan |
| 4 | Phuc Le | your focus decision | IH/Twitter | debates/phuc-le |
| 5 | Arsen Ibragimov | your agency-to-product decision | IH/Twitter | debates/arsen-ibragimov |
| 6 | Alex Van Le | your funding decision | IH/Twitter | debates/alex-van-le |
| 7 | Louis Pereira | your rebuild decision | IH/Twitter | debates/louis-pereira |
| 8 | Piotr Kulpinski | your open-source monetization decision | IH/Twitter | debates/piotr-kulpinski |
| 9 | Rob Hallam | your co-founder decision | IH/Twitter | debates/rob-hallam |
| 10 | Andris Reinman | your monetization decision | IH/Twitter/GitHub | debates/andris-reinman |

---

## Send Template (Variant A — "The Gift")

```
Subject: your {{decision_keyword}} decision

Hey {{first_name}},

I read your piece on {{source}} about {{one_sentence_decision_context}}. 
I built a tool that runs decisions like that through a structured debate 
between historical reasoning frameworks — Machiavelli on power, Curie on 
evidence, Sun Tzu on positioning — and I ran yours through it.

Here's where the council landed:

> {{2-3 sentence consensus excerpt}}

The full 3-round debate is here if you're curious: {{link}}

If there's a decision on your desk right now, I'll run it for free — 
just reply with what you're thinking about.

Edward

---
You received this email because you're a founder whose work has influenced 
this decision.
Unsubscribe: mailto:noreply@consultthedead.com
```

**Note:** All personalization (first_name, source, context, excerpt, link) is pre-filled in WAVE1_SEND_BRIEF.md. Just copy and send.

---

## What Could Go Wrong (And How to Handle It)

| Issue | What to Do |
|-------|-----------|
| Debate page doesn't load | Stop. Don't send. Contact Marketing. |
| Email bounces with 5xx | Log it. Skip to next. Marketing retries tomorrow. |
| Auto-reply from recipient | OK! Log it. Continue. |
| Email send times out | Wait 30 sec, try again. If fails twice, skip & note. |
| "User not found" error | Stop. Notify Marketing immediately. |

---

## During the Send (8:00am–11:00am ET)

1. **8:00am:** Load test pages (abhishek-chakravarty, jonathan-chan, alex-van-le)
2. **8:15am:** Start sending (Abhishek → Andris, in order)
3. **Timing:** ~2–3 min per email, allow 30 sec between sends
4. **Log:** Jot down send times and any bounces as you go
5. **11:00am:** All 10 should be done

---

## After the Send

1. **Paste send log** into `output/marketing-notes.md` (under "2026-05-13 Wave 1 Send Execution")
2. **Update tracking table** in `docs/outreach-debates/WAVE1_SEND_BRIEF.md` with actual send times
3. **Notify Marketing**: "Wave 1 send complete — 10/10 sent, [notes on bounces/auto-replies]"

---

## Key Numbers

- **Free tier:** 3 agons/day, no signup
- **Pro tier:** $30/mo or $300/yr (that's $25/mo if billed annually)
- **Free CTA in email:** "If there's a decision on your desk right now, I'll run it for free — just reply"
- **Debate page base URL:** `consultthedead.com/debates/[slug]`
- **Agora home:** `consultthedead.com/agora`

---

## Success Criteria

✅ All 10 sent by 11:00am ET  
✅ No hard bounces (soft bounces are fine)  
✅ Send times logged  
✅ Tracking table updated  
✅ Marketing notified

If you hit any snags, see `output/WAVE1_SEND_EXECUTION_STEPS.md` for detailed troubleshooting.

---

## Follow-ups (You'll handle these later)

- **May 17 (Day 4):** Reply thread bump: "Did the council's take land at all?"
- **May 22 (Day 9):** Final touch: "The tool is at consultthedead.com/agora if you want to try it — 3 agons/day free."
- **May 23:** Evaluate reply rate to decide Wave 2 (20 more founders)

---

**Questions?** See the full execution guide at `output/WAVE1_SEND_EXECUTION_STEPS.md`.

**You've got this.** 🎯
