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
  - Failed on a pre-existing repo issue in `website/src/app/worked-example.tsx`:
    - `react-hooks/set-state-in-effect` at line 311.
  - Also reported unrelated warnings in existing files, including `website/src/app/agora/AgoraApp.tsx`.
- `wcx pnpm --dir website build`
  - Failed because `next` was not resolvable in this environment (`sh: next: command not found`).

## Notes
- The sample-topic edit stayed inside `website/src/app/agora/AgoraApp.tsx` as requested.
- I linked the task to the existing file-scoped AgoraApp capsule before editing because the path was already owned by an active capsule.
