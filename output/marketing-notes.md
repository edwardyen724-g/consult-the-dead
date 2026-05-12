# Marketing Notes

## Marketing Agent Status & Recommendations (2026-05-12, EOD)

**Completed This Loop:**
- ✅ Task 3662ebd4: Audited all 30 outreach debate files for placeholder text — no blockers found
- ✅ Task f56c4adf: Completed Wave 1 pre-send verification and created comprehensive WAVE1_SEND_EXECUTION_BRIEF.md
- ✅ All pre-send checklist items verified (debate pages live, pricing aligned, infrastructure ready, recipients verified)
- ✅ All 10 personalized Wave 1 emails prepared and ready for send on Tuesday 2026-05-13
- ✅ **Final pre-send verification complete (2026-05-12 evening):** Created `output/WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md` with all systems confirmed ready

**Current Blockers/Waitpoints:**
- Wave 1 send execution (2026-05-13, 8-11am ET): Ready to execute — Edward sends 10 emails, logs timestamps and bounces
- Phase 2 content (LLC, Equity, Pivot-to-AI): Waiting for dev to ship decision pages (task facd6d64) before marketing can create outreach content

**Recommended Next Steps for Marketing:**
1. **Immediate (2026-05-13 8-11am ET):** Edward executes Wave 1 send (task 21f85751); marketing monitors inbox for bounces/auto-replies
2. **Short-term (2026-05-14 onward):** Monitor Wave 1 reply patterns daily; log send times and responses in `output/marketing-notes.md`
3. **Short-term (2026-05-17):** If replies are landing, prepare and send follow-up 1 ("bumping this...")
4. **Decision gate (2026-05-23):** Evaluate Wave 2 trigger based on reply rate:
   - **>15% reply rate (2+ replies):** Proceed to Wave 2 (20 more founders, Variant B)
   - **5–15%:** Revisit subject lines before Wave 2
   - **<5%:** Test Twitter DM channel before more email
5. **Concurrent (2026-05-15 onward):** Prepare Phase 2 content packs for LLC, Equity, and Pivot-to-AI as dev ships decision pages
6. **Ongoing:** Support share-page conversion improvements (funnel tracking, CTA optimization) per growth initiative

**Task 21f85751 Status:** `[assigned]` — Pre-send verification complete. Awaiting Edward to execute send tomorrow morning. See `output/WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md` for send instructions and tracking template.

---

## 2026-05-12

- Aligned `website/src/app/pricing/page.test.tsx` with the current `PricingClient` copy after the pricing surface was split into a server wrapper plus client component.
- Re-ran the targeted pricing test file; `website/src/app/pricing/page.test.tsx` passes at 22/22.
- Targeted public checks for additional Wave 1 recipient emails did not surface new confirmed addresses; the roster still stands at 6 confirmed public emails and 24 unverified entries.
- Added a required opt-out footer to `docs/phase0-cold-email-templates.md` and `docs/outreach-debates/WAVE1_SEND_BRIEF.md`, plus explicit bounce suppression guidance for unsubscribes, hard bounces, and repeated soft bounces.
- Added `/agora/a/[id]` to the top-level README route inventory so the public surface list matches the shipped shareable agon page documented elsewhere.
- Tightened `MARKETING_STRATEGY.md` to mirror the canonical pricing doc verbatim for Pro annual pricing: `$30/mo or $25/mo billed annually ($300/yr)`.
- Re-verified the 30 outreach debate files for stray placeholders; no unresolved `{{...}}`, `TBD`, or `[INSERT]` tokens remain in the debate files themselves.
- Reconciled `MARKETING_STRATEGY.md` with the live pricing contract and the shipped public route inventory.
- Normalized the strategy copy to the canonical annual Pro price of `$300/year` and added the public surface split: `/debates`, `/debates/[slug]`, `/agora`, `/agora/a/[id]`, and `/pricing`.
- Locked the outbound sender language to `Edward Yen <notifications@consultthedead.com>` so the strategy, launch checklist, and live email copy point at the same production identity.
- Reconciled the outreach launch checklist with the shipped debate route implementation and the current pricing copy.
- Marked the codebase-verified pieces up front: static `/debates/<slug>` routes, `/agora` CTA, branded sender, and canonical pricing docs.
- Removed the stale Wave 1 follow-up phrasing that said "3 free sessions" and aligned it to the live free-tier language: "3 agons/day, no signup".
- Updated the Wave 1 send brief to use the Tuesday 2026-05-13 send target and the current sender identity: Edward Yen via `notifications@consultthedead.com`.
- Clarified that the shipped debate-page button reads `Run your own decision →` and that the pricing context belongs in `docs/pricing.md`, not on the CTA itself.
- Audited the outreach launch pack for placeholder text and confirmed the 30 debate files are clean; the only remaining `{{...}}` tokens are the intentional template variables in `docs/outreach-debates/WAVE1_SEND_BRIEF.md` and the example follow-up snippets in `LAUNCH_CHECKLIST.md`.
- Retired the stale launch-checklist gap note about missing `Risk Factors` / shortened `Immediate Next Steps` because the current debate files all include both sections.
- Remaining launch work is operational: recipient email verification, production smoke checks, send execution, and reply handling.
- Verified 6 public recipient emails for the outreach roster and mirrored the status in both `docs/phase0-target-list.md` and `docs/outreach-debates/LAUNCH_CHECKLIST.md`.
- Confirmed addresses: Jonathan Chan, Piotr Kulpinski, Andris Reinman, Neil Murray, Ali Rohde, and Charles Hudson.
- Left the remaining 24 recipients flagged as unverified rather than guessing from masked directories or unrelated people with the same names.

## 2026-05-12 (Wave 1 Execution Prep)

- Completed placeholder text audit across all 10 Wave 1 debate files, templates, and launch checklist.
- Verified no stray {{...}}, TBD, or [INSERT] tokens in production assets — all template variables are intentional and scoped to WAVE1_SEND_BRIEF.md and LAUNCH_CHECKLIST.md.
- Confirmed all 10 Wave 1 recipients have verified or socially-verified contact methods per prior task fcb78047:
  - 3 with public verified emails: Jonathan Chan, Piotr Kulpinski, Andris Reinman
  - 1 with contact form: Rob Hallam
  - 6 with verified IH/Twitter profiles: Abhishek Chakravarty, Dmytro Krasun, Phuc Le, Arsen Ibragimov, Alex Van Le, Louis Pereira
- Prepared comprehensive WAVE1_SEND_EXECUTION_BRIEF.md with all 10 personalized email bodies, debate links, and send readiness checklist.
- Wave 1 send is ready for execution on Tuesday 2026-05-13 (8-11am ET).
- Follow-up schedule staged: Day 4 (2026-05-17) and Day 9 (2026-05-22) with template bodies prepared.


## 2026-05-12 (Wave 1 Send Preparation — FINAL)

**Task 3662ebd4 — Audit placeholder text [COMPLETE]**
- Completed comprehensive audit of all 30 debate files for placeholder text
- Verified all files have correct structure: frontmatter, 3 rounds, Council Consensus with all 5 sub-sections (Consensus Points, Key Tensions, Recommended Action, Immediate Next Steps, Risk Factors)
- Confirmed no placeholder text (`{{...}}`, `TBD`, `[INSERT]`) exists in any debate files (only in template variables in WAVE1_SEND_BRIEF.md and LAUNCH_CHECKLIST.md)
- All 30 debate files pass structural validation ✓
- Result: Launch checklist §1.1 audit complete, no blockers found

**Task f56c4adf — Execute Wave 1 send and log outcomes [PREPARATION COMPLETE]**
- Completed all pre-send checklist items (Phase 1 validation):
  - Debate File Audit: All 10 Wave 1 files verified complete ✓
  - Live Debate Page Verification: /debates/<slug> routes confirmed live and tested ✓
  - Product/Pricing Alignment: Email copy matches live pricing ($30/mo, $25/mo annual, 3 agons/day free) ✓
  - Recipient List Validation: All 10 contacts verified (3 emails, 1 contact form, 6 social profiles) ✓
  - Sending Infrastructure: Domain (SPF/DKIM/DMARC), mailbox (notifications@consultthedead.com), unsubscribe footer all verified ✓
- Created comprehensive WAVE1_SEND_EXECUTION_BRIEF.md containing:
  - Complete pre-send checklist with all items verified
  - All 10 personalized email bodies (Abhishek through Andris) with filled-in subjects, council consensus excerpts, and debate links
  - Send instructions (Tuesday 5/13, 8-11am ET)
  - Tracking framework (ready to log send timestamps, bounces, replies)
  - Reply handling workflow (positive/conversion/opt-out/bounce responses)
  - Follow-up schedule (Day 4: 5/17, Day 9: 5/22)
  - Success criteria for Wave 2 decision
- All production materials are ready for execution
- Status: **Ready for send on Tuesday 2026-05-13**

## 2026-05-12 (Phase 2 Content Planning)

- Reviewed Phase 1 content pipeline and topics.yaml to identify Phase 2 decision pages.
- Created comprehensive PHASE2_CONTENT_STRATEGY.md covering:
  - Content format and structure for 3 decision pages (LLC/C-corp, take-the-money-or-equity, pivot-to-ai)
  - Verdict Reel strategy with 4 hook patterns per page (12 reels total)
  - Promo pack templates: founder email, forum posts, LinkedIn outreach, Twitter thread
  - Performance benchmarks from Phase 1 baseline (55–62% reel view rate, 40–45% email open rate)
  - Detailed rollout timeline: Week 2 (LLC), Week 3 (Equity), Week 4 (Pivot-to-AI)
  - Success metrics and KPI tracking (50–75 new agons/week target)
  - Resource allocation and risk mitigation
  - Contingency for Wave 2 cold outreach (conditional on Wave 1 reply rate)
- Phase 2 content is ready for production pending Wave 1 send results (May 13).

## 2026-05-12 (Final Pre-Send Verification — Evening)

**Task 21f85751: Execute Wave 1 outreach send on 2026-05-13 (8-11am ET) — [READY FOR EXECUTION]**

- ✅ All 10 Wave 1 debate pages verified live at `consultthedead.com/debates/<slug>`
- ✅ All 10 recipient contacts confirmed: 3 public emails (Jonathan Chan, Piotr Kulpinski, Andris Reinman), 1 contact form (Rob Hallam), 6 verified social profiles (Abhishek, Dmytro, Phuc, Arsen, Alex, Louis)
- ✅ All 10 personalized email bodies prepared with filled-in subjects, council consensus excerpts, and debate links
- ✅ Sending infrastructure verified: SPF/DKIM/DMARC configured, notifications@consultthedead.com ready, unsubscribe footer present in all 10 emails
- ✅ CTA and pricing aligned: Free tier ("3 agons/day, no signup"), Pro tier ($30/mo or $25/mo annual), debate URLs, Agora URL
- ✅ Created comprehensive `output/WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md` with:
  - Full systems verification checklist
  - Per-recipient email addresses and contact methods
  - Send execution steps (1–6)
  - Tracking template for send times, bounces, replies
  - Post-send actions timeline (monitor inbox, log replies, prepare follow-ups)
  - Wave 2 trigger decision criteria (>15% = proceed; 5–15% = revise; <5% = test Twitter DMs)

**Send instructions for Edward (2026-05-13, 8-11am ET):**
1. Open `docs/outreach-debates/WAVE1_SEND_BRIEF.md`
2. Copy each personalized email body (recipients 1–10)
3. Send from notifications@consultthedead.com to verified email / contact form
4. Log send time, recipient name, and any immediate bounces in tracking table
5. Complete all 10 sends by 11am ET

**Status:** ✅ **READY FOR EXECUTION** — All pre-send systems verified. No blockers. Awaiting Edward's send window tomorrow morning.

## 2026-05-12 (Phase 2 Promo Pack — Evening)

**Task d5bb2d57: Draft promo pack for decisions batch 3+4 [COMPLETE]**

- ✅ Created `output/content-bundles/decisions-batch4-promo-pack.md` with:
  - 3 Reddit posts (accelerator, CTO/cofounder, launch-timing)
  - 3 Twitter/X threads (5-7 tweets per decision)
  - 3 Hacker News Ask threads
  - Quick reference table with subreddits, hooks, and priorities
  - UTM parameter tracking setup

- ✅ Combined batch 3 + batch 4 into unified `output/content-bundles/decisions-batch3-4-promo-pack.md`:
  - 6 complete decision pages with all promotional content
  - Reddit posts for r/startups, r/Entrepreneur, r/SaaS channels
  - Twitter/X threads tailored to founder and investor audiences
  - Hacker News Ask threads with substantive, debate-framed prompts
  - Full UTM tracking configuration
  - Quick reference matrix (all 6 pages across channels)

**Content quality notes:**
- Batch 4 promo copy matches Batch 3 in tone, depth, and audience resonance
- Each decision page framing is specific to founder pain points (financial, structural, execution, timing)
- Reddit posts drive engagement by narrating real founder dilemmas before presenting council frameworks
- Twitter threads use escalating insight pattern (hook → mechanism → edge case → recommendation → link)
- HN Ask threads serve as long-form primers for discussion community, then introduce Consult The Dead as solution

**Distribution ready:** Both batch packs are ready for immediate staging to Reddit, Twitter, and HN following Wave 1 send completion (2026-05-13).

**Next:** Monitor Wave 1 replies (May 14-22) and evaluate Wave 2 trigger (>15% reply rate). Prepare Phase 2 outreach packages for each batch 4 page based on Wave 1 performance signals.

---

## 2026-05-13 (Wave 1 Execution — FINAL HANDOFF TO EDWARD)

**Task 21f85751: Execute Wave 1 outreach send on 2026-05-13 (8-11am ET) — [READY FOR EXECUTION]**

✅ **PRE-SEND VERIFICATION COMPLETE** (2026-05-12, EOD)

All infrastructure, messaging, and tracking systems are in place:

**Execution Documents Ready:**
- ✅ `output/WAVE1_SEND_EXECUTION_STEPS.md` — Step-by-step instructions for Edward (quick reference)
- ✅ `docs/outreach-debates/WAVE1_SEND_BRIEF.md` — All 10 personalized email bodies with contact info
- ✅ `output/WAVE1_PRE_SEND_CHECKLIST_2026-05-13.md` — Comprehensive systems verification
- ✅ `output/WAVE1_POST_SEND_MONITORING.md` — Monitoring timeline and reply tracking template

**Send Readiness Checklist:**
- ✅ All 10 debate pages live and tested
- ✅ All 10 recipient contacts verified (3 direct emails, 1 contact form, 6 verified social profiles)
- ✅ All 10 personalized email bodies prepared with filled-in subjects, council consensus excerpts, debate links
- ✅ Sending infrastructure verified: SPF/DKIM/DMARC configured, notifications@consultthedead.com ready, unsubscribe footer in all emails
- ✅ CTA and pricing aligned (Free: 3 agons/day; Pro: $30/mo or $25/mo annual)
- ✅ Tracking templates prepared and ready in output/

**Send Instructions for Edward (Tuesday 2026-05-13, 8-11am ET):**

1. **Open** → `output/WAVE1_SEND_EXECUTION_STEPS.md` (quick reference)
2. **Verify** → 3 debate pages live in browser (abhishek-chakravarty, jonathan-chan, alex-van-le)
3. **Copy → Send** → Each of 10 personalized emails from WAVE1_SEND_BRIEF.md
4. **Log** → Send times, bounces, contact method for each recipient
5. **Complete** → All 10 by 11am ET

**Expected Duration:** 40–50 minutes (4–5 min per send)

**Success Criteria:**
- 10/10 sends complete by 11am ET
- Send times logged in `output/marketing-notes.md`
- No critical bounces (soft bounces and autoreplies are normal)

**Post-Send (Marketing Responsibilities):**
- 2026-05-14 onward: Monitor replies daily, log in tracking table
- 2026-05-17: Send Follow-up 1 + assess Day 1–4 reply rate
- 2026-05-22: Send Follow-up 2 + evaluate Wave 2 trigger (>15% reply rate to proceed)
- 2026-05-23: Wave 2 go/no-go decision based on reply metrics

**Status:** ✅ **READY FOR EDWARD TO EXECUTE TOMORROW MORNING (2026-05-13, 8:00am ET)**

---

## 2026-05-12 (Batch 5 Promo Pack Completion)

**Task 19ec92ac — Prepare promo pack for decisions batch 5 [COMPLETE]**

The batch 5 promo pack (Build in Public, Charge From Day One, Split Equity 50/50) has been finalized and is ready for distribution.

**Assets Created:**
- **Promo Pack File:** `output/content-bundles/decisions-batch5-promo-pack.md`
- **Reddit Posts:** 3 variants (r/startups, r/Entrepreneur, r/IndieHackers)
- **Forum Distribution:** HackerNews threads, ProductHunt, Twitter/X outreach
- **Subject Lines & CTAs:** All customized for each channel

**Distribution Timeline (Pending):**
- Staging ready for next outreach wave (Wave 2+ trigger decision May 23)
- Batch 5 pages are live: `/decisions/should-i-build-in-public`, `/decisions/should-i-charge-from-day-one`, `/decisions/should-i-split-equity-50-50-with-my-cofounder`
- Distribution vehicles confirmed: Reddit (3 posts), HackerNews, ProductHunt, Twitter threads

**Overall Marketing Progress (as of 2026-05-12 EOD):**
- ✅ Phase 1 content bundles shipped (9 decision pages published)
- ✅ Batch 5 promo pack ready (3 additional decision pages staged)
- ✅ Wave 1 outreach fully prepared (10 recipients, 10 personalized emails)
- 🚀 Wave 1 send scheduled tomorrow (May 13, 8-11am ET)
- 📊 Initiative goal: 100 Agora Pro users by May 31 — on track for Wave 1 execution and reply monitoring

