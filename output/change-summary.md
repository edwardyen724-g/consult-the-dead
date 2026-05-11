# Change Summary

## Task
- 3302397c: Build Ask This Mind topic submission API

## Files Changed
- `website/src/app/api/generate-analysis/route.ts`
- `website/src/app/api/generate-analysis/route.test.ts`

## What Changed
- Added POST `/api/generate-analysis` with origin validation, framework slug/topic validation, framework loading, Anthropic streaming, and shared rate-limit enforcement.
- Stream now emits `analysis_started`, `analysis_chunk`, and `analysis_done` events.
- Added route coverage for happy path, invalid JSON, missing/invalid inputs, missing framework data, missing API key, origin rejection, rate-limit branches, preview-origin bypass, and stream failure.

## Verification
- `wcx pnpm vitest run src/app/api/generate-analysis/route.test.ts --coverage --coverage.include=src/app/api/generate-analysis/route.ts '--coverage.exclude=src/**/*.d.ts' '--coverage.exclude=src/**/*.test.ts' '--coverage.exclude=src/**/*.test.tsx' '--coverage.exclude=src/middleware.ts'`
- `wcx pnpm exec eslint src/app/api/generate-analysis/route.ts src/app/api/generate-analysis/route.test.ts`

## Coverage
- `route.ts`: 100% statements, 100% lines, 100% functions, 100% branches
