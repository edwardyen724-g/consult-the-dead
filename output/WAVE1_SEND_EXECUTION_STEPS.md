# Wave 1 Send Execution — Step-by-Step Guide

**Date:** Wednesday, 2026-05-13  
**Time Window:** 8:00am–11:00am ET  
**Owner:** Edward Yen  
**Tracking:** Update `output/marketing-notes.md` as you send

---

## Pre-Send Verification (8:00am–8:15am ET)

### 1. Load and verify 3 test debate pages (should load instantly)
- Open in your browser: https://www.consultthedead.com/debates/abhishek-chakravarty
- Open in your browser: https://www.consultthedead.com/debates/jonathan-chan
- Open in your browser: https://www.consultthedead.com/debates/alex-van-le

**Expected:** All three load with visible Council consensus sections and debate rounds.  
**If any fail:** Stop. Do not send. Notify Marketing (haotingyen@consultthedead.com) immediately.

### 2. Verify your email setup
- Sender email: `notifications@consultthedead.com`
- Mailbox is accessible and empty of blockers
- You have the recipient list and personalized email bodies ready (in WAVE1_SEND_BRIEF.md)

---

## Send Execution (8:15am–11:00am ET)

### For each of the 10 recipients (in order 1–10):

1. **Open WAVE1_SEND_BRIEF.md** and locate the recipient's personalization section (lines 62–140)

2. **Copy the complete email body:**
   - **Recipient:** [Name from section header]
   - **Subject:** (use the subject line from the section, e.g., "your pricing decision")
   - **Body:** Copy the full message including the council consensus excerpt and link

3. **Paste into your email client:**
   - To: [recipient email address]
   - Subject: [from WAVE1_SEND_BRIEF.md section]
   - Body: [personalized message]
   - **Important:** Ensure the unsubscribe footer is present at the bottom:
     ```
     You received this email because you're a founder whose work has influenced this decision.
     Unsubscribe: mailto:noreply@consultthedead.com
     ```

4. **Send the email**

5. **Log immediately in your notes:**
   - Time sent (HH:MM)
   - Recipient name
   - Any immediate errors or bounce messages

6. **Wait ~30 seconds before the next send** (to avoid ISP rate limiting)

---

## Send Order & Recipients

| # | Name | Subject | Link |
|---|------|---------|------|
| 1 | Abhishek Chakravarty | your pricing decision | `/debates/abhishek-chakravarty` |
| 2 | Dmytro Krasun | your portfolio decision | `/debates/dmytro-krasun` |
| 3 | Jonathan Chan | your portfolio decision | `/debates/jonathan-chan` |
| 4 | Phuc Le | your focus decision | `/debates/phuc-le` |
| 5 | Arsen Ibragimov | your agency-to-product decision | `/debates/arsen-ibragimov` |
| 6 | Alex Van Le | your funding decision | `/debates/alex-van-le` |
| 7 | Louis Pereira | your rebuild decision | `/debates/louis-pereira` |
| 8 | Piotr Kulpinski | your open-source monetization decision | `/debates/piotr-kulpinski` |
| 9 | Rob Hallam | your co-founder decision | `/debates/rob-hallam` |
| 10 | Andris Reinman | your monetization decision | `/debates/andris-reinman` |

---

## Tracking During Send

**Keep a simple log as you send:**

```
Send Log — Wednesday 2026-05-13

08:15 — Abhishek Chakravarty — SENT (pricing decision)
08:15 — [any bounces/auto-replies]
---
08:16 — Dmytro Krasun — SENT (portfolio decision)
08:16 — [any bounces/auto-replies]
---
[continue for all 10...]
```

Save this in a text editor so you can paste it into `output/marketing-notes.md` after the send completes.

---

## If Something Goes Wrong

### Soft bounce or temporary error
- **Do not retry immediately.** Wait 30 seconds and try again.
- If it fails twice, note it in your log and skip to the next recipient.
- Marketing will retry soft bounces tomorrow.

### Hard bounce (5xx error / "user not found")
- **Stop and notify Marketing immediately** (haotingyen@consultthedead.com).
- Do not continue until Marketing confirms the alternate contact method.

### Auto-reply received
- **This is OK.** Log it (e.g., "auto-reply from Dmytro: out until May 20") and continue.

### Email client crashes or connection lost
- **Send all 10 before closing** — we can't afford a broken send list.
- If you must stop mid-send, note exactly which recipient was last, then contact Marketing.

---

## Post-Send (11:00am ET)

1. **Paste your send log into `output/marketing-notes.md`** under the "2026-05-13 Wave 1 Send Execution" section
2. **Update the tracking table in WAVE1_SEND_BRIEF.md** with send times and status
3. **Notify Marketing**: Send a quick Slack message or email: "Wave 1 send complete — 10/10 sent, [X bounces/auto-replies to note]"

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| Test pages don't load | Stop. Production may be down. Contact DevOps before sending. |
| Email bounces with "invalid recipient" | Log it. Skip to next. Marketing will investigate. |
| Multiple auto-replies | This is expected and OK. Log them. Continue. |
| Mailbox quota exceeded | Stop. Contact Edward's IT support; contact Marketing. |
| Recipient email address looks wrong | Verify in WAVE1_SEND_BRIEF.md. If correct there, email anyway. |

---

## Success Criteria

✅ All 10 emails sent by 11:00am ET  
✅ Send times logged  
✅ Any bounces noted  
✅ Tracking table updated  
✅ Marketing notified

---

## Questions?

- For email body questions: See `docs/outreach-debates/WAVE1_SEND_BRIEF.md` (personalization notes)
- For recipient address questions: See `docs/outreach-debates/LAUNCH_CHECKLIST.md` (§1.4)
- For infrastructure issues: Contact DevOps (see DEVOPS_FINAL_STATUS_2026-05-12.md)
- For anything else: Contact Marketing (haotingyen@consultthedead.com)

---

**Remember:** This is high-signal outreach to 10 of the highest-leverage founders in the indie hacker ecosystem. The personalized council consensus excerpts are the value — avoid templated language. If you need to adjust a subject line or excerpt to make it more natural, feel free to do so inline, but do not deviate from the debate links (those must be exact).

Good luck! 🚀
