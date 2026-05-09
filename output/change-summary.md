# Change Summary

Task: `59106ea8-1ff5-4357-84d6-aea9898c4941`
Branch: `wanman/sync-quiz-routing-matrix`
Capsule: `94fbed29-74eb-42d9-b3bd-6169208ac25f`

## Files Changed

- `website/src/app/quiz/page.tsx`
- `website/src/app/quiz/QuizFlow.tsx`
- `website/src/app/quiz/quiz-routing.ts`
- `website/src/app/quiz/quiz-routing.test.ts`

## What Changed

- Split the quiz into a server page wrapper plus a client interaction component.
- Built the quiz model from the live framework catalog passed in from `getAllFrameworks()`.
- Replaced the hardcoded mind-name/domain maps with catalog-derived data.
- Added a pure routing helper that scores frameworks from their live catalog metadata instead of hardcoded slugs.
- Added vitest coverage for:
  - catalog-derived mind labels/domains
  - routing decisions based on catalog keywords
  - never emitting slugs that are absent from the supplied catalog

## Verification

- `pnpm exec vitest run src/app/quiz/quiz-routing.test.ts`
- `pnpm lint`
- `pnpm build`
- `pnpm test`

## Results

- Vitest: passed
- Lint: passed with pre-existing warnings outside this task
- Build: passed
