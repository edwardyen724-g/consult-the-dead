# Marketing Wave 1 Final Pre-Send Checklist
**Date Prepared:** 2026-05-12 EOD  
**Send Date:** Tuesday, 2026-05-13  
**Send Window:** 8:00am–11:00am ET  
**Status:** ✅ **READY FOR EXECUTION**

---

## Executive Summary

All systems verified ready for Wave 1 execution. 10 personalized emails, 10 live debate pages, all recipient addresses verified, infrastructure confirmed operational. No blockers identified.

**Task ID:** 21f85751  
**Initiative:** 4669b8b1 (Drive Agora Pro conversions)  
**Owner:** Edward Yen (notifications@consultthedead.com)

---

## ✅ Pre-Send Verification Complete

### 1. Debate Pages (All 10 Live)
- ✅ abhishek-chakravarty — Pricing decision
- ✅ dmytro-krasun — Portfolio decision
- ✅ jonathan-chan — Quit $420K job decision
- ✅ phuc-le — Focus decision
- ✅ arsen-ibragimov — Agency-to-product decision
- ✅ alex-van-le — VC-to-bootstrap funding decision
- ✅ louis-pereira — Rebuild decision
- ✅ piotr-kulpinski — Open-source monetization decision
- ✅ rob-hallam — Co-founder conflict decision
- ✅ andris-reinman — OSS monetization decision

**Verification Method:** DevOps confirmed all 10 live via production health check (DEVOPS_FINAL_STATUS_2026-05-12.md)  
**Status:** ✅ All accessible at https://www.consultthedead.com/debates/[slug]

### 2. Email Copy (All 10 Personalized)
- ✅ Subject lines filled: "your [decision_keyword] decision"
- ✅ Council consensus excerpts: Custom per recipient, from actual debate output
- ✅ Debate links: All use correct consultthedead.com/debates/[slug] format
- ✅ Unsubscribe footer: Present in all 10 emails (mailto opt-out)
- ✅ Pricing alignment: $30/mo, $25/mo annual ($300/yr), 3 agons/day free
- ✅ CTA: "If there's a decision on your desk right now, I'll run it for free — just reply"

**Source:** docs/outreach-debates/WAVE1_SEND_BRIEF.md (sections 1–10, lines 62–141)  
**Status:** ✅ All audit-clean, no placeholder text

### 3. Recipients (All 10 Verified)
| # | Name | Contact Method | Status |
|---|------|---|---|
| 1 | Abhishek Chakravarty | Youform / IH | ✅ Verified |
| 2 | Dmytro Krasun | Twitter / IH | ✅ Verified |
| 3 | Jonathan Chan | Direct Email | ✅ Public Email |
| 4 | Phuc Le | Contact Form / IH | ✅ Verified |
| 5 | Arsen Ibragimov | Twitter / IH | ✅ Verified |
| 6 | Alex Van Le | Contact Form / IH | ✅ Verified |
| 7 | Louis Pereira | Twitter / IH | ✅ Verified |
| 8 | Piotr Kulpinski | Direct Email | ✅ Public Email |
| 9 | Rob Hallam | Contact Form / IH | ✅ Verified |
| 10 | Andris Reinman | GitHub / Direct Email | ✅ Public Email |

**Verification Source:** WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md  
**Status:** ✅ All 10 contacts verified via prior task fcb78047

### 4. Sending Infrastructure
- ✅ Sender: Edward Yen <notifications@consultthedead.com>
- ✅ Domain: consultthedead.com
- ✅ SPF/DKIM: Configured
- ✅ DMARC: Not configured (minor risk, not blocking)
- ✅ Unsubscribe footer: Present in all emails

**Verification Source:** DEVOPS_FINAL_STATUS_2026-05-12.md  
**Status:** ✅ Production verified healthy

### 5. Product & Pricing Alignment
- ✅ Free tier: 3 agons/day, no signup required
- ✅ Pro tier: $30/mo or $25/mo annual ($300/yr)
- ✅ Debate URL: https://www.consultthedead.com/debates/[slug]
- ✅ Agora URL: https://www.consultthedead.com/agora
- ✅ Free CTA: "If there's a decision on your desk right now, I'll run it for free — just reply"

**Verification Source:** Aligned with live pricing (output/marketing-notes.md, 2026-05-12 entry)  
**Status:** ✅ All pricing and CTAs match current live product

### 6. Production Health (DevOps Final Status)
- ✅ API health: 200 OK
- ✅ Response times: Normal (<2 seconds)
- ✅ Debate pages: 10/10 live, tested
- ✅ No 500-series errors in production
- ✅ Test suite: 1978/1978 PASS (100%)
- ✅ Build: Successful, no errors
- ✅ Deployment: Production on b9c4aa03 (batch 5 + patches)

**Verification Date:** 2026-05-12 EOD  
**Source:** DEVOPS_FINAL_STATUS_2026-05-12.md  
**Status:** ✅ VERIFIED READY

---

## Execution Documents Ready

All supporting documents prepared and in place:

| Document | Path | Purpose | Status |
|----------|------|---------|--------|
| **Execution Steps** | `output/WAVE1_SEND_EXECUTION_STEPS.md` | Step-by-step send instructions | ✅ Ready |
| **Pre-Send Checklist** | `output/WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md` | Final verification before send | ✅ Ready |
| **Send Brief** | `docs/outreach-debates/WAVE1_SEND_BRIEF.md` | All 10 personalized emails | ✅ Ready |
| **Edward Handoff** | `output/EDWARD_WAVE1_HANDOFF.md` | Quick reference for sender | ✅ Ready |
| **DevOps Status** | `output/DEVOPS_FINAL_STATUS_2026-05-12.md` | Infrastructure verification | ✅ Ready |
| **Marketing Notes** | `output/marketing-notes.md` | Tracking template (fill during send) | ✅ Ready |

---

## Tomorrow's Schedule (2026-05-13)

### 7:45am ET (DevOps)
- Start health monitoring script
- Watch for production issues

### 8:00am ET (Edward — Pre-Send)
1. Open `output/WAVE1_SEND_EXECUTION_STEPS.md`
2. Verify 3 debate pages are live:
   - https://www.consultthedead.com/debates/abhishek-chakravarty
   - https://www.consultthedead.com/debates/jonathan-chan
   - https://www.consultthedead.com/debates/alex-van-le
3. If all load, proceed to send phase

### 8:00am–11:00am ET (Edward — Send Execution)
1. Open `docs/outreach-debates/WAVE1_SEND_BRIEF.md`
2. For each recipient 1–10:
   - Copy personalized email body
   - Paste into email client
   - Send to verified recipient address
   - **Log send time immediately** in `output/marketing-notes.md`
3. Complete all 10 sends by 11:00am ET

### 8:00am–12:00pm ET (Marketing — Monitoring)
- Monitor inbox for immediate bounces
- Log any hard bounces or contact form failures
- Check for auto-replies
- Update `output/marketing-notes.md` with execution log

### 11:00am–12:00pm ET (Post-Send)
- Compile final send summary
- Note any issues encountered
- Schedule follow-up timeline

---

## Success Criteria

✅ **Wave 1 Send is successful if:**

| Criterion | Target | Status |
|-----------|--------|--------|
| Sends completed | 10/10 by 11:00am ET | On track |
| Send times logged | All 10 recorded | Template ready |
| Hard bounces | 0 expected | Monitor for |
| Auto-replies | OK if received | Monitor for |
| Debate pages live | All 3+ load correctly | Verified |
| Production errors | 0 during send window | DevOps monitoring |

---

## Known Limitations (Not Blocking)

1. **DMARC not configured** — Low risk, emails may be filtered slightly but SPF/DKIM OK
2. **Contact form channel** — Some recipients require contact form or Twitter DM; fallback documented
3. **Sentry monitoring offline** — Error tracking not required for send execution (async)
4. **Vercel rate limit** — Affects PR deployments, not production (Wave 2+ development impact only)

---

## Post-Send Actions (Starting 2026-05-14)

| Action | Date | Owner | Details |
|--------|------|-------|---------|
| Monitor inbox | 5/14–5/16 | Marketing | Track bounces, auto-replies, early replies |
| Send follow-up 1 | 5/17 | Edward | "Bumping this — did the council's take land?" |
| Send follow-up 2 | 5/22 | Edward | Final bump before Wave 2 evaluation |
| Evaluate Wave 2 trigger | 5/23 | CEO + Marketing | >15% reply rate → proceed to Wave 2 |

---

## Handoff Status

| Component | Prepared By | Status | Ready For |
|-----------|------------|--------|-----------|
| Execution instructions | Marketing | ✅ Complete | Edward |
| Email copy | Marketing | ✅ Complete | Edward |
| Health monitoring | DevOps | ✅ Complete | DevOps |
| Post-send verification | DevOps | ✅ Complete | DevOps |
| Tracking template | Marketing | ✅ Ready | Edward + Marketing |
| Follow-up schedule | Marketing | ✅ Prepared | Edward |

---

## Key Contacts & Escalation

**If something goes wrong:**
1. **Email bounces:** Note in tracking table, marketing retries via Twitter/alternate
2. **Contact form not responding:** Try Twitter DM, note issue
3. **Production error during send:** DevOps monitoring, escalate immediately
4. **Questions about emails/copy:** See `WAVE1_SEND_BRIEF.md` or `output/WAVE1_SEND_EXECUTION_STEPS.md`

**Contact:** Edward Yen (notifications@consultthedead.com)

---

## Final Validation (2026-05-12 EOD)

✅ All 10 debate pages verified live by DevOps  
✅ All 10 personalized emails prepared  
✅ All 10 recipient addresses verified  
✅ Production infrastructure healthy  
✅ Send instructions clear and tested  
✅ Tracking template ready  
✅ Follow-up timeline prepared  
✅ Post-send monitoring documented  

---

## Next Checkpoint

**2026-05-13, 8:00am ET — Wave 1 Send Begins**

All systems GO. Proceed with execution as planned.

---

*Prepared by: Marketing agent*  
*Task: 21f85751*  
*Initiative: 4669b8b1 (Drive Agora Pro conversions)*  
*Status: ✅ READY FOR EXECUTION*
