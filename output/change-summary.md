# Change Summary

## Task
- Add quiz result tracking and stronger debate CTA

## Changed Files
- `website/src/app/quiz/page.tsx`
- `website/src/app/quiz/quiz-completion.ts`
- `website/src/app/quiz/quiz-completion.test.ts`

## What Changed
- Added a lightweight completion tracking hook that fires when the quiz reaches the result step.
- The hook emits a browser `CustomEvent` and mirrors the payload into common analytics sinks (`dataLayer` and `gtag`) when they exist.
- Extracted the completion payload builder into a small helper so the result event shape is stable and testable.
- Tightened the result-card copy to push users into the next action immediately.
- Reworded the final CTA from a generic "start" prompt to a more conversion-forward debate prompt while keeping the existing mind-matching and `/agora?minds=...` routing intact.

## Verification
- `wcx pnpm --dir website coverage`
  - Passed: 3 test files, 43 tests.
  - Coverage still reports the existing repo-wide baseline numbers because the app route files are excluded from coverage collection.
- `wcx pnpm --dir website lint`
  - Passed with pre-existing repo warnings only; no new lint errors from the quiz changes.
- `wcx pnpm --dir website build`
  - Passed successfully.

## Notes
- `website/src/app/page.tsx` was already dirty in the worktree before this task and was left untouched.
- The new quiz completion helper stays inside the quiz folder so the page logic remains focused and the tracking payload is unit-tested.
