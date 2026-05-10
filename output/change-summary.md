# Change Summary

## Files Changed
- `scripts/send-outreach.ts`
- `scripts/__tests__/send-outreach.test.ts`

## What Changed
- Simplified `firstName()` by removing a dead fallback branch.
- Added coverage for:
  - `firstName(undefined)` runtime behavior.
  - `fallbackSubject()` with a single long token.
  - `sendOutreach()` using `recipient.email` when `--to` is absent.
  - `cliMain()` when Resend returns an error without a message.

## Verification
- `npx tsx scripts/__tests__/send-outreach.test.ts`
- `npx c8 --reporter=text --reporter=json-summary npx tsx scripts/__tests__/send-outreach.test.ts`

## Result
- Standalone suite passed: `50 tests passed`
- `scripts/send-outreach.ts` branch coverage: `96.15%`
