# Marketing Notes

## 2026-05-10

- Reconciled `CONTENT_PIPELINE.md` with shipped decisions:
  - F5-TTS is the canonical voiceover stack.
  - Beehiiv is the canonical email capture provider.
  - `@consultthedead` is the canonical Instagram handle.
  - Removed the stale unresolved topics-review note and marked the seed list reviewed/ready.
- Reconciled `MARKETING_STRATEGY.md` with the same shipped-state decisions:
  - Replaced `TBD` subscriber language with Beehiiv-aligned metrics.
  - Updated the phase plan so voice, email capture, and handle read as implemented rather than pending.
  - Converted the open-decisions section into a resolved decision lock-in mirror.
- Verified the broader content-engine docs still match the resolved decisions:
  - `CONTENT_PIPELINE.md` and `MARKETING_STRATEGY.md` both canonicalize F5-TTS, Beehiiv, and `@consultthedead`.
  - Left `docs/runbooks/email-smoke-test.md` unchanged because it is a transactional Resend runbook, not a content-engine source-of-truth.
- Reconciled `MONETIZATION_PLAYBOOK.md` with the same locked decisions:
  - Replaced the stale "voice/email/handle deferred" language with the resolved F5-TTS, Beehiiv, and `@consultthedead` choices.
  - Trimmed the open-decision list so it only contains decisions that still need human input.
- No code or test changes were required.
