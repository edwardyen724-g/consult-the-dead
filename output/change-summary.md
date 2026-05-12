# Change Summary

## Task
- Fix missing `next/server` mock in `website/src/lib/__tests__/pricing-stats-route.test.ts`

## Changed Files
- `website/src/lib/__tests__/pricing-stats-route.test.ts`

## Verification
- `cd website && npm test src/lib/__tests__/pricing-stats-route.test.ts`
- `cd website && npm test -- --config /tmp/pricing-coverage-config.ts --coverage src/lib/__tests__/pricing-stats-route.test.ts`

## Results
- Targeted test file passed: 6 tests
- Scoped coverage passed for `src/app/api/stats/route.ts` and `src/lib/pricing/live-stats.ts`
- Coverage summary: statements 100%, branches 100%, functions 100%, lines 100%
