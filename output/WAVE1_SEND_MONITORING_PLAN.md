# Wave 1 Send Monitoring & Execution Plan — Marketing Agent

**Send Date:** Wednesday, 2026-05-13  
**Send Window:** 8:00am–11:00am ET  
**Owner:** Marketing Agent (haotingyen@consultthedead.com)  
**Edward's Role:** Execute 10 sends, log times and bounces  
**Marketing's Role:** Monitor, track, document, unblock any issues

---

## Marketing Responsibilities During Send

### 7:45am ET — Pre-Send Readiness Check

- [ ] Verify production health: Load `/agora` page, check response times
- [ ] Verify all 10 debate pages are live and accessible:
  - Load abhishek-chakravarty, jonathan-chan, alex-van-le (quick smoke test)
  - Spot-check dmytro-krasun and andris-reinman from the list
- [ ] Confirm Edward has documents:
  - `output/EDWARD_WAVE1_HANDOFF.md` (quick reference)
  - `output/WAVE1_SEND_EXECUTION_STEPS.md` (detailed steps)
  - `docs/outreach-debates/WAVE1_SEND_BRIEF.md` (recipient data + email bodies)
- [ ] Confirm Edward has mailbox access to `notifications@consultthedead.com`
- [ ] Check production Sentry for any error spikes
- [ ] Notify Edward: "All systems ready. You're clear to send at 8:00am."

### 8:00am–11:00am ET — Active Monitoring

**Monitoring checklist:**

- [ ] Watch inbox (notifications@consultthedead.com) for bounces and auto-replies
  - Log any hard bounces (5xx / "user not found")
  - Log auto-replies (vacation, out-of-office) with return date
  - Note soft bounces (4xx / temporary failures) for later retry
- [ ] Monitor production health:
  - API response times (should stay <2 sec)
  - No 500-series errors during send window
  - Debate pages remain accessible
- [ ] Check email logs/sendgrid for delivery status (if available)
- [ ] Stay available for Edward to escalate any issues
- [ ] Set a timer: expect completion by 11:00am ET

**Quick contact checklist:**
- Edward's email: notifications@consultthedead.com
- Edward's Slack/phone: [available during send window]
- DevOps escalation: [if production goes down]

### 11:00am–12:00pm ET — Post-Send Capture

**Immediately after Edward finishes:**

- [ ] Collect Edward's send log
  - Recipient names
  - Send times (exact HH:MM)
  - Any bounces or auto-replies
  - Any issues encountered
- [ ] Log all findings in `output/marketing-notes.md` (Section: "2026-05-13 Wave 1 Send Execution")
- [ ] Update `docs/outreach-debates/WAVE1_SEND_BRIEF.md` tracking table:
  - Fill in actual send times
  - Mark status for each recipient (sent / bounced / auto-reply)
  - Add notes column for any special handling
- [ ] Compile summary:
  - Total sends completed (should be 10/10)
  - Hard bounce count
  - Auto-reply count
  - Any issues that need follow-up
- [ ] Create `output/wave1-post-send-verification.md` with:
  - Complete send evidence (times, statuses, any bounces)
  - Auto-reply details (if any)
  - Soft bounce list (for later retry)
  - Any contact form failures or alternate routing needed
- [ ] Store Edward's original send log as reference

---

## Bounce Handling Workflow

### Hard Bounce (5xx, "user not found", invalid domain)
- **Action:** Do not retry immediately
- **Marketing:** Check LAUNCH_CHECKLIST.md for alternate contact method (Twitter, contact form, etc.)
- **Next:** Prepare retry via alternate channel for 5/14 or 5/15
- **Log:** Record original email, bounce reason, alternate method

### Soft Bounce (temporary failure, rate limit, timeout)
- **Action:** Log and retry 5/14
- **Marketing:** Add to soft-bounce retry list
- **Log:** Original email, bounce reason, attempt count

### Auto-Reply
- **Action:** No action needed (expected)
- **Marketing:** Log the reply for context (e.g., "out until May 20")
- **Track:** Note if sender is likely to see follow-up #1 on 5/17

### No Bounce, Delivery Confirmed
- **Action:** Mark as "sent" in tracking table
- **Track:** Monitor for reply from now until 5/22

---

## Tracking Table Template

Fill this in `output/marketing-notes.md` after send completes:

```markdown
## 2026-05-13 Wave 1 Send Execution — Results

**Send completed:** [Date/Time]
**Edward's executor:** Edward Yen
**Total sends:** 10/10
**Hard bounces:** [#]
**Soft bounces:** [#]
**Auto-replies:** [#]
**Success rate:** [#]/10

| # | Recipient | Email | Sent Time (ET) | Status | Notes |
|---|-----------|-------|---|--------|-------|
| 1 | Abhishek Chakravarty | abhishek... | 08:15 | sent | — |
| 2 | Dmytro Krasun | dmytro... | 08:16 | sent | — |
| [etc.] | | | | | |

### Bounces & Issues
- [List hard bounces with reasons]
- [List soft bounces for retry]
- [List auto-reply details]

### Lessons for Wave 2
- [Any email delivery patterns worth noting]
- [Domain reputation status]
- [Contact verification insights]
```

---

## Post-Send Tasks (Marketing Backlog)

After successful send, these tasks become unblocked:

1. **7face497** — Capture Wave 1 post-send evidence trail
   - Create `output/wave1-post-send-verification.md` with all delivery evidence
   - Document bounce patterns, auto-replies, timing distribution
   - This becomes the durable outcome record separate from the send brief

2. **392cdb64** — Normalize Wave 1 send handoff references
   - Ensure `docs/outreach-debates/WAVE1_SEND_BRIEF.md` is the canonical brief
   - Update any legacy references to "Tuesday" vs "Wednesday" in docs/notes
   - Confirm all handoff language points to the right document

3. **992e9341** — Audit and close Wave 1 launch checklist
   - Verify final checklist items: dispute pages live, pricing aligned, send executed
   - Mark checklist as reconciled or document any residual gaps
   - Update LAUNCH_CHECKLIST.md with completion notes

---

## Timeline for Follow-ups

- **5/14–5/16:** Monitor inbox for early replies and bounce clarifications
- **5/17:** Send follow-up #1 ("Did the council's take land?")
  - Task: draft and prepare (if not already staged)
- **5/19:** Track reply rate progress (should have data from early responders)
- **5/22:** Send follow-up #2 (final touch with Agora CTA)
- **5/23:** Evaluate Wave 2 trigger:
  - >15% reply rate (2+ replies) → greenlight Wave 2
  - 5–15% → revisit subject lines before Wave 2
  - <5% → test Twitter DM channel before more email

---

## Success Criteria for Today

✅ Edward has clear, detailed execution docs  
✅ Production is healthy and debate pages are live  
✅ All 10 sends executed by 11:00am ET  
✅ Send times and bounce data captured  
✅ Post-send evidence trail documented  
✅ Marketing can unblock Wave 2 evaluation by 5/23

---

## Escalation Plan (If Issues Arise)

| Issue | Owner | Action |
|-------|-------|--------|
| Production page down | DevOps | Stop send, fix, confirm before resuming |
| Mailbox quota exceeded | Edward/IT | Extend mailbox, resume send |
| Hard bounce on all emails | Marketing | Pause, investigate domain reputation |
| Contact form failures | Marketing | Switch to Twitter DM fallback |
| Email never delivers | Marketing | Check with sendgrid/mail provider |

---

## Notes

- This is Wave 1 of a 3-wave campaign targeting 100 pro conversions by 5/31
- Each email is personalized with founder-specific context and debate excerpt
- High personalization = likely to be read by high-signal founders
- Goal: establish Consult The Dead as a decision-making advisor, not a pitch
- Reply rate directly gates Wave 2 expansion

**After send complete → unblock 3 downstream marketing tasks → prepare Wave 2 content pipeline**

---

*Prepared by: Marketing Agent*  
*Task: 21f85751 (Execute Wave 1 outreach send)*  
*Created: 2026-05-12 evening (pre-send)*  
*Status: Ready for execution 2026-05-13*
