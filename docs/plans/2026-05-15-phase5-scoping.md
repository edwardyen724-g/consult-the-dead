# Phase 5 Scoping — Next Automation Horizon

**Status:** Active — duration formula fixed (PR #428); formula now accurate but council beats too long; Track C running
**Owner:** CEO
**Last updated:** 2026-05-15

---

## Context

Phase 4 owns the end-to-end production chain: F5-TTS voice synthesis, reel render pipeline (ffmpeg-based MP4 export), and Instagram Graph API upload. The Phase 4 pilot must run 5 reels through this chain and clear the Phase 3 quality criteria before Phase 5 begins.

Phase 5 picks up from a verified production chain and asks: what is the highest-value automation to add next?

---

## Phase 4 Exit Gate (prerequisite)

Before Phase 5 tasks can start, all of the following must be true (per `docs/plans/2026-05-12-phase3-reel-automation-handoff.md` §3):

- [ ] 5 pilot reels synthesized end-to-end with F5-TTS ← **BLOCKED** (F5-TTS not installed; needs `pip install ".[tts-f5]"`)
- [ ] Same voice chain used for all 5 reels
- [ ] No reel required voice-specific rescue edits after export
- [x] CTA, captions, and council order consistent across the batch ← **PASS** (dry-run eval, PR #422)
- [x] Edward can review a generated script in one pass without re-authoring ← **PASS** (editorial quality confirmed)

**Pilot result (2026-05-15, dry-run, PR #422 — original eval):**
- **Editorial quality:** PASS — hook questions are scenario-first and engaging; council voices are distinct; no JSON errors
- **Duration:** FAIL — `estimatedDurationSeconds` formula counts article description length instead of spoken word count; reports 30s but dry-run computes 49–73s
- **Fix in progress:** task `07b7fe5b`, branch `wanman/fix-reel-duration-formula` (PR #428)
- **Voice synthesis:** Not yet tested — F5-TTS not installed in current environment

**Re-eval result (2026-05-15, task `3de2e7f8` — post duration-formula fix, PR #428):**

Formula now counts words across all 6 spoken segments (hookQuestion + MAIN_BEATS + SUPPORT_BEATS + CLOSE_BEATS + consensus + CTA) at 2.5 wps + 2.2s pauses per reel.

| # | Slug | estimatedDurationSeconds | Word count | In 25–40s range |
|---|------|--------------------------|------------|-----------------|
| 1 | `what-would-marcus-aurelius-say-about-burnout` | 53 s | 126 words | FAIL (over) |
| 2 | `what-would-marie-curie-say-about-when-to-trust-the-data` | 46 s | 110 words | FAIL (over) |
| 3 | `what-would-tesla-say-about-technical-debt` | 50 s | 119 words | FAIL (over) |
| 4 | `what-would-steve-jobs-say-about-product-focus` | 55 s | 132 words | FAIL (over) |
| 5 | `what-would-lincoln-say-about-leading-through-crisis` | 54 s | 129 words | FAIL (over) |

**Duration row result: FAIL (formula accurate; council beats too long)**

The formula is now correct — estimates (46–55s) closely match the voice-level estimates from PR #422 (49–73s). The root cause is that council beats (MAIN_BEATS + SUPPORT_BEATS + CLOSE_BEATS) average 60–70 words each across the pilot slugs, and the consensus paragraph averages ~20 words. Together they push every reel 6–15s over the 40s ceiling.

**Required fix before exit gate can be cleared:** Trim council beat lines to ≤ 15 words each and consensus to ≤ 15 words. This alone should bring reels in the 35–42s range, close enough to target after minor CTA trimming. A follow-up task is needed to trim `MAIN_BEATS`, `SUPPORT_BEATS`, `CLOSE_BEATS`, and `DECISION_COURT[*].consensus` entries.

- **Voice synthesis:** Not yet tested — F5-TTS not installed in current environment
- **Next gate:** trim council beats → re-run dry-run eval → if duration 25–40s, proceed to F5-TTS installation and actual synthesis

---

## Phase 5 Track Options

Three candidate tracks, evaluated below. CEO decision logged in §Decision after pilot results land.

### Track A — Automated Scheduling Cadence

**What:** Auto-schedule approved reels to post on Instagram at optimal times (e.g. Tue/Thu at 9 AM).
**Value:** Converts Edward's one-tap review into a predictable publishing cadence; removes manual upload friction.
**Dependencies:**
- Instagram Graph API posting is wired and tested (PR #410, merged)
- Reel render pipeline produces uploadable MP4 (PR #420, merged)
- Phase 4 pilot must have passed — voice chain and render confirmed stable

**Scope:**
- A scheduler script or cron that reads the `output/reels/` directory for approved MP4s
- Integration with Instagram Graph API media creation + publish endpoints
- State tracking: which reels have been scheduled, posted, or failed

**Risk:** Low if Phase 4 pilot passed cleanly; high if voice or render quality needed rescue.

---

### Track B — Analytics Feedback Loop

**What:** Pull reel performance metrics (views, reach, saves, comments) from the Instagram Insights API and surface them to inform future content selection.
**Value:** Closes the loop — lets data drive which topics, minds, and decision types get prioritized in the content queue.
**Dependencies:**
- Instagram Graph API access token with `instagram_manage_insights` permission
- At least 5-10 posted reels to have baseline data

**Scope:**
- `scripts/instagram/fetch_insights.py` — pull metrics per media object
- A lightweight report (JSON or markdown) written to `output/reel-analytics/`
- Optional: surface high-performing slugs as suggested `topics.yaml` entries

**Risk:** Medium — requires additional Instagram API permission and meaningful data requires reels to have been posted first. Better as Phase 5b after Track A.

---

### Track C — New Mind Extraction + Content Scaling

**What:** Extract Aristotle as the 29th mind (task `90292bb6`, pending), seed Wave 25 queue, and accelerate content wave velocity.
**Value:** Expands the product's intellectual roster and maintains SEO content flywheel momentum.
**Dependencies:**
- None blocking (can proceed in parallel with reel automation)
- Wave 24 must be merged before Wave 25 seeds

**Scope (already queued):**
- `90292bb6` — Aristotle Framework Forge extraction
- `5fc1d0b0` — Wave 25 topic queue seed (blocked on Wave 24 merge)
- Wave 25 content batch (3 collisions + 3 decisions)

**Risk:** Low — this is the proven content pipeline; risk is only execution time.

---

## Decision Framework

| If pilot result is… | Recommended Phase 5 track |
|---|---|
| **Full pass** (0 rescue edits, duration on target) | Track A (scheduling) — unlock automated posting |
| **Partial pass** (minor edits, acceptable duration) | Track A + Track C in parallel |
| **Fail** (rescue edits required, voice instability) | Fix voice chain first; Track C in parallel |

---

## CEO Decision (2026-05-15)

**Pilot outcome:** Partial — editorial quality passes; duration formula bug found and being fixed; F5-TTS synthesis not yet run

**Selected track(s):** Track C (active) + Track A (unblocked when duration fix merges + F5-TTS installed)

**Rationale:** Track C (Aristotle + Wave 25) has no blockers and directly advances product value. Track A (scheduling) requires the duration fix to land, council beats to be trimmed, and F5-TTS to be installed before the pilot can be re-run cleanly. PR #428 fixed the duration formula — formula is now accurate — but re-eval confirms council beats are still too long (46–55s vs 25–40s target). Council beat trimming is required before the Phase 4 exit gate can clear and Track A tasks can begin.

**Phase 5 initiative:** To be created when Phase 4 exit gate fully clears. Track C tasks are already in initiative `d0884bfe`.

---

## Candidate Phase 5 Tasks (drafted, not yet created)

If Track A selected:
- [ ] Build reel post-scheduler: scan `output/reels/`, call Instagram publish API, log post ID
- [ ] Add scheduling config: cron expression, retry/backoff on 429, max posts per day
- [ ] Notify CTO on scheduler PR

If Track B selected (Phase 5b):
- [ ] `scripts/instagram/fetch_insights.py` — pull views/reach/saves per posted reel
- [ ] Write `output/reel-analytics/YYYY-MM-DD.md` summary after each posting cycle
- [ ] Surface top-performing slugs to `topics.yaml` queue

If Track C selected (parallel):
- [x] Trigger `90292bb6` — Aristotle extraction (in_progress, agent dispatched)
- [x] Unblock Wave 25 seed — PR #423 open (Wave 25 topic queue: 4 collisions + 1 decision)

---

## References

- Phase 3 handoff: `docs/plans/2026-05-12-phase3-reel-automation-handoff.md`
- Phase 4 pilot task: `8bdd8d3a`
- Wave 24 content batch task: `74bea873`
- Aristotle extraction task: `90292bb6`
- Instagram API: `scripts/instagram/upload_reel.py`, `scripts/instagram/auth.py`
- Reel render pipeline: `scripts/reel-scripts/` + `output/reels/`
