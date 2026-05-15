# Phase 4 Pilot Reel Batch Evaluation

**Date:** 2026-05-15
**Status:** Dry-run evaluation complete — F5-TTS synthesis pending
**Branch:** wanman/phase4-pilot-reel-batch
**Author:** wanman/ceo agent

---

## 1. Pilot Approach

This document records the Phase 4 quality gate: a dry-run evaluation of five shipped insight slugs
before committing to full audio synthesis.

F5-TTS is not yet installed in the worktree environment. The evaluation uses two existing tools:

- `generate-reel-scripts.ts --dry-run` — emits the deterministic JSON verdict-reel artifact for
  each slug (hook, council beats, consensus, CTA, estimated script-level duration).
- `synthesize-voice.py --dry-run` — recomputes duration from the actual word count of all segments
  at 2.5 words/second, adding inter-segment pauses (hook→council: 0.4 s; between council: 0.5 s;
  after council: 0.5 s; after consensus: 0.3 s).

The two duration estimates are independent:

- **Script-level estimate** (`estimatedDurationSeconds` in JSON): calculated from hook question
  length and description length using `base = 26 + round((hookLen + descLen) / 140)`, capped
  to [25, 40] s.
- **Voice-level estimate** (synthesize-voice.py dry-run): calculated from actual spoken word count
  across all six segments (hook + 3 council + consensus + CTA).

A reel passes the duration gate if both estimates fall within the 25–40 s target.

---

## 2. Reel Evaluation Table

| # | Slug | Hook text (first 80 chars) | Script est. (s) | Voice est. (s) | Pass? | Council minds |
|---|------|---------------------------|-----------------|----------------|-------|---------------|
| 1 | `what-would-marcus-aurelius-say-about-burnout` | You're so exhausted you can't tell what the work actually is anymore. Everything | 30 | 59.0 | FAIL (voice) | Marcus Aurelius, Marie Curie, Niccolò Machiavelli |
| 2 | `what-would-marie-curie-say-about-when-to-trust-the-data` | You have charts, surveys, and three months of A/B tests. Everyone is asking you  | 30 | 49.4 | FAIL (voice) | Marie Curie, Isaac Newton, Marcus Aurelius |
| 3 | `what-would-tesla-say-about-technical-debt` | Your codebase is held together with duct tape and prayer. The team says 'we'll f | 30 | 56.6 | FAIL (voice) | Nikola Tesla, Isaac Newton, Leonardo da Vinci |
| 4 | `what-would-steve-jobs-say-about-product-focus` | Your roadmap has thirty features on it. The team wants to build five at once. A  | 30 | 72.6 | FAIL (voice) | Steve Jobs, Leonardo da Vinci, Marcus Aurelius |
| 5 | `what-would-lincoln-say-about-leading-through-crisis` | You are three months into your hardest stretch as a leader. The team is losing c | 30 | 68.2 | FAIL (voice) | Abraham Lincoln, Marcus Aurelius, Niccolò Machiavelli |

---

## 3. Detailed Duration Breakdown

### Reel 1 — `what-would-marcus-aurelius-say-about-burnout`

| Segment | Text (truncated) | Est. (s) |
|---------|-----------------|---------|
| hook | You're so exhausted you can't tell what the work actually is anymore. Everything feels necessary. Nothing feels meaningful... | 11.6 |
| council: Marcus Aurelius | Inspect the duty before you inspect the energy. Fatigue that follows meaningful work is different from fatigue that follows the wrong work. | 8.8 |
| council: Marie Curie | Extraordinary output requires extraordinary sacrifice — but only when the sacrifice is in service of the right duty. Check the duty first. | 8.8 |
| council: Niccolò Machiavelli | If the duty is real, recover enough to return to it. If it is not, no vacation will make it worth having. | 8.8 |
| consensus | Before you rest, name whether the duty itself is broken or just the pace. If the duty is sound, the strain is a season. If the duty is wrong, no amount of rest will fix it. | 14.4 |
| cta | Read the full article at /insights/... | 4.4 |
| **Total** | | **59.0 s** |

Script-level estimate: 30 s. Voice-level: 59.0 s. Gap: +29.0 s.

### Reel 2 — `what-would-marie-curie-say-about-when-to-trust-the-data`

| Segment | Text (truncated) | Est. (s) |
|---------|-----------------|---------|
| hook | You have charts, surveys, and three months of A/B tests. Everyone is asking you to decide. But do you actually have enough signal... | 13.2 |
| council: Marie Curie | Keep collecting signal until the dataset can stand on its own. Do not confuse impatience with clarity. | 6.8 |
| council: Isaac Newton | The goal is not more data forever. The goal is enough data to stop lying to yourself. | 6.8 |
| council: Marcus Aurelius | When the signal is finally strong enough, decide once and move without apology. | 5.2 |
| consensus | Collect enough signal to decide honestly, then move. The danger is not waiting too long; it is pretending the data is already clear when it is not. | 10.8 |
| cta | Read the full article at /insights/... | 4.4 |
| **Total** | | **49.4 s** |

Script-level estimate: 30 s. Voice-level: 49.4 s. Gap: +19.4 s.

### Reel 3 — `what-would-tesla-say-about-technical-debt`

| Segment | Text (truncated) | Est. (s) |
|---------|-----------------|---------|
| hook | Your codebase is held together with duct tape and prayer. The team says 'we'll fix it after launch.' But Tesla refused to build... | 13.2 |
| council: Nikola Tesla | Technology bets should be justified by physics and first principles, not by the current hype cycle. | 6.4 |
| council: Isaac Newton | The question is not whether the technology is impressive. The question is whether it changes the frame in a way that matters. | 8.8 |
| council: Leonardo da Vinci | The right technology bet changes the frame. The wrong one just adds complexity to an already complicated situation. | 7.2 |
| consensus | Technology bets are right or wrong based on physics and first principles, not the current hype cycle. Build the version that would still be right in ten years... | 14.4 |
| cta | Read the full article at /insights/... | 4.4 |
| **Total** | | **56.6 s** |

Script-level estimate: 30 s. Voice-level: 56.6 s. Gap: +26.6 s.

### Reel 4 — `what-would-steve-jobs-say-about-product-focus`

| Segment | Text (truncated) | Est. (s) |
|---------|-----------------|---------|
| hook | Your roadmap has thirty features on it. The team wants to build five at once. A major customer just asked for something... | 14.0 |
| council: Steve Jobs | Focus is a subtraction problem. Every feature you keep is attention you cannot spend elsewhere. Choose what to cut, not just what to build. | 9.6 |
| council: Leonardo da Vinci | Jobs did not succeed by building more — he succeeded by cutting everything that did not belong. The discipline to remove is harder than the discipline to add. | 11.2 |
| council: Marcus Aurelius | What is on your roadmap that does not belong? Cut that first. Then build the rest. | 6.4 |
| consensus | The most dangerous thing you can build into a product is optionality you are not willing to cut. Focus is a discipline decision before it is a product decision... | 24.8 |
| cta | Read the full article at /insights/... | 4.4 |
| **Total** | | **72.6 s** |

Script-level estimate: 30 s. Voice-level: 72.6 s. Gap: +42.6 s.

### Reel 5 — `what-would-lincoln-say-about-leading-through-crisis`

| Segment | Text (truncated) | Est. (s) |
|---------|-----------------|---------|
| hook | You are three months into your hardest stretch as a leader. The team is losing confidence. The original plan is not working... | 12.4 |
| council: Abraham Lincoln | A crisis does not require perfect decisions — it requires decisions honest about their own uncertainty and built to be revised when the evidence changes. | 10.0 |
| council: Marcus Aurelius | Lincoln's greatest leadership quality was not certainty. It was his willingness to revise decisions as the war evolved without losing strategic direction. | 8.8 |
| council: Niccolò Machiavelli | What does your decision look like if the next thing you hear is bad news? Build the decision to survive that. | 8.4 |
| consensus | In a crisis, the failure mode is not making the wrong decision — it is pretending you have more certainty than you do and locking yourself into a course you cannot revise... | 22.0 |
| cta | Read the full article at /insights/... | 4.4 |
| **Total** | | **68.2 s** |

Script-level estimate: 30 s. Voice-level: 68.2 s. Gap: +38.2 s.

---

## 4. Overall Assessment

### Scripts are editorially production-ready

All five scripts pass editorial quality checks:

- Hook questions are engaging and immediately actionable (scenario-first framing, no generic opener).
- Council beats are distinct per mind — each voice has a recognisable epistemic style (Aurelius:
  duty/stoic; Curie: evidence threshold; Machiavelli: realpolitik; Newton: first-principles; Tesla:
  physics; Jobs: subtraction).
- Consensus lines resolve the council tension without repeating hook language.
- CTA lines are correctly formatted and point to the live article URL.
- No formatting errors, missing fields, or JSON parse failures across all 5 slugs.

### Duration gap: script-level estimate is systematically too short

The `estimatedDurationSeconds` formula in `generate-reel-scripts.ts` targets 25–40 s but measures
only the hook question and description, not the council beats or consensus. When the full spoken
text (all six segments) is evaluated by `synthesize-voice.py`, every reel exceeds the 40 s ceiling
by a wide margin:

| Reel | Script est. | Voice est. | Overrun |
|------|-------------|------------|---------|
| burnout | 30 s | 59.0 s | +29.0 s |
| curie-data | 30 s | 49.4 s | +19.4 s |
| tesla-techdebt | 30 s | 56.6 s | +26.6 s |
| jobs-focus | 30 s | 72.6 s | +42.6 s |
| lincoln-crisis | 30 s | 68.2 s | +38.2 s |

Root cause: `estimatedDurationSeconds` in the generator accounts only for
`(hookQuestion.length + description.length) / 140` word-rate proxy — it does not include the three
council beats, the consensus paragraph, or the CTA. The consensus paragraph alone runs 10–25 s
across these five reels.

### Format issues identified

1. **`estimatedDurationSeconds` in JSON is misleading.** The field reflects pre-generation script
   metadata, not actual spoken duration. Downstream tooling that reads this field for scheduling
   or posting decisions will make incorrect estimates. The field should either be removed or
   replaced with the voice-level estimate from `synthesize-voice.py`.

2. **Consensus lines are too long for 25–40 s total budget.** The consensus paragraphs average
   ~40 words (16 s) — that alone, combined with hook (12 s) and CTA (4.4 s), leaves fewer than
   8 s for three council beats. Trimming consensus to one punchy sentence (~15 words / 6 s) would
   bring voice-level duration into target range.

3. **CTA is non-negotiable but costs 4.4 s.** That is within budget if the rest of the script
   is trimmed.

---

## 5. Recommended Fixes Before F5-TTS Synthesis

Priority order:

1. **Trim consensus paragraphs to ≤ 20 words** in `DECISION_COURT` entries. This alone should
   save 6–15 s per reel and bring the shortest reels (curie-data) close to the 40 s ceiling.

2. **Fix `estimatedDurationSeconds`** in `generate-reel-scripts.ts` to include word count of
   council beats, consensus, and CTA in addition to hook/description. The voice-level formula
   from `synthesize-voice.py` (2.5 wps + inter-segment pauses) is the correct model.

3. **Re-run dry-run evaluation** on the same 5 slugs after the consensus trims to verify
   voice-level estimates fall in 25–40 s before committing to F5-TTS synthesis.

---

## 6. Next Steps

1. Fix `estimatedDurationSeconds` calculation and trim consensus lines (separate PR, ~30 min).
2. Install F5-TTS in the worktree environment:
   ```
   pip install ".[tts-f5]"
   ```
3. Re-run this evaluation against the same 5 slugs with actual synthesis to confirm audio output
   quality and final duration.
4. If audio quality is confirmed, proceed to Phase 4 batch synthesis for all 54 shipped slugs.

---

## 7. Appendix — Raw Slug List Evaluated

```
1. what-would-marcus-aurelius-say-about-burnout
2. what-would-marie-curie-say-about-when-to-trust-the-data
3. what-would-tesla-say-about-technical-debt
4. what-would-steve-jobs-say-about-product-focus
5. what-would-lincoln-say-about-leading-through-crisis
```

All five slugs confirmed present in `INSIGHT_ENTRIES` (via `--help` output of
`generate-reel-scripts.ts`). JSON artifacts written to `/tmp/reel-<slug>.json` during evaluation.
