# Change Summary

## Task
- Make Agora example topics clickable

## Changed Files
- `website/src/app/agora/AgoraApp.tsx`

## What Changed
- Added a labeled sample-question block for the Topic stage so visitors can see the examples as tap-to-start prompts.
- Made each example prompt an explicit `button` with an accessible label and title.
- Wired each sample button to prefill the topic textarea and return focus to the textarea so the user can continue straight to the Council flow.

## Verification
- `wcx pnpm --dir website coverage`
  - Passed: 2 test files, 42 tests.
  - Coverage still reports the existing repo-wide baseline numbers.
  - Vitest emits the pre-existing unresolved-import warning for `vitest/config` in `vitest.config.ts`, but the suite exits successfully.
- `wcx pnpm --dir website lint`
  - Passed with existing repo warnings only; no new errors from the Agora edit.
- `wcx pnpm --dir website build`
  - Passed successfully after installing the website dependencies locally.

## Notes
- The sample-topic edit stayed inside `website/src/app/agora/AgoraApp.tsx` as requested.
- I linked the task to the existing file-scoped AgoraApp capsule before editing because the path was already owned by an active capsule.

## PR #20 Follow-up
- Verified the live non-dry-run send path from `website/` with a temporary Resend stub:
  - `RESEND_API_KEY=re_smoke npx tsx ../scripts/send-outreach.ts --slug abhishek-chakravarty --to smoke@example.com`
  - Result: `Sent via Resend (campaign=founder-outreach-may26, slug=abhishek-chakravarty)` with stub message ID `stub-abhishek-chakravarty`.
- Re-requested CTO review on PR #20 with the smoke-test evidence in a new PR comment.
