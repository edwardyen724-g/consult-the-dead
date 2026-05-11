# Change Summary

## Task
- `wanman/essay-reader-regression`

## Changes
- Added `website/src/app/essay/page.test.tsx`.
- Covered the essay route markdown render path with a mocked `fs.readFileSync` payload.
- Verified the back-link still points to `/` and still renders the `Consult The Dead` label.
- Covered the inline markdown link render contract and the missing-file fallback message.

## Verification
- `cd website && npm run coverage -- src/app/essay/page.test.tsx`
- Result: passed, 2 tests passed.

## Notes
- No production files were modified.
