# Change Summary

Task: `cd7251fb` - Add framework transparency toggle and Ask This Mind form

## Files Changed

- `website/src/app/frameworks/[slug]/page.tsx`
- `website/src/components/framework-transparency-panel.tsx`
- `website/src/components/framework-transparency-panel.test.tsx`
- `website/src/app/api/generate-analysis/route.ts`
- `website/src/app/api/generate-analysis/route.test.ts`

## What Changed

- Added a client-side framework transparency panel with:
  - toggleable transparency section
  - framework depth metrics
  - validation copy
  - inline Ask This Mind form
  - streamed analysis rendering state
- Wired the framework detail page to render the new transparency panel and removed the standalone validation block.
- Restored the `/api/generate-analysis` route so the Ask This Mind form can stream a framework-grounded analysis from a framework slug + topic.
- Added unit tests for:
  - payload building
  - topic validation
  - SSE parsing
  - API submission success/error paths
  - transparency panel render states
  - generate-analysis route happy/error paths

## Verification

- `pnpm vitest run src/components/framework-transparency-panel.test.tsx src/app/api/generate-analysis/route.test.ts`
- `pnpm coverage -- src/components/framework-transparency-panel.test.tsx src/app/api/generate-analysis/route.test.ts`
- `pnpm lint`

## Notes

- `pnpm build` fails in `website/src/app/account/page.tsx:32` with `Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'`.
- That build failure is outside the capsule scope for this task, so I did not modify it.
- Coverage for `website/src/components/framework-transparency-panel.tsx` reached `95.23%` lines in the focused run.
