# Change Summary

## Task
- Restore missing Ask This Mind API route source and unblock streamed analysis

## Files Changed
- `website/src/lib/ask-this-mind.test.ts`
- `website/src/app/api/generate-analysis/route.ts`
- `website/src/app/api/generate-analysis/route.test.ts`
- `website/src/lib/ask-this-mind.ts`

## What Changed
- Restored `POST /api/generate-analysis` with the existing SSE analysis contract.
- Added route regression coverage for:
  - valid streamed analysis
  - invalid JSON / missing slug / unknown slug / topic length validation
  - missing Anthropic API key
  - rate-limit failures
  - fallback framework-name behavior
- Tightened `streamAskThisMindAnalysis` type narrowing so the website build passes strict TypeScript checks.

## Verification
- `wcx pnpm vitest run src/app/api/generate-analysis/route.test.ts`
- `wcx pnpm vitest run src/lib/ask-this-mind.test.ts`
- `wcx pnpm vitest run --coverage src/app/api/generate-analysis/route.test.ts src/lib/ask-this-mind.test.ts`
- `wcx pnpm eslint src/app/api/generate-analysis/route.ts src/app/api/generate-analysis/route.test.ts src/lib/ask-this-mind.ts src/lib/ask-this-mind.test.ts`
- `wcx pnpm build`

## Notes
- Vitest coverage excludes `src/app/**` route handlers in this repo’s config, so the route is validated by direct tests but does not appear in LCOV output.
