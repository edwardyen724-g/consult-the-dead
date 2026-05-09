# Change Summary

## Task
Landing-page quick-quiz personalization for first-time visitors

## Files Changed
- `website/src/app/page.tsx`
- `website/src/components/hero-quiz.tsx`
- `website/src/lib/hero-quiz.ts`
- `website/src/lib/__tests__/hero-quiz.test.ts`

## What Changed
- Added a three-question landing-page quiz component beneath the existing home hero.
- The quiz maps answer patterns to a suggested council pack and a tailored CTA link.
- Added a pure helper for quiz scoring / recommendation selection.
- Added direct-run + vitest-compatible tests for the helper logic.
- Kept the existing hero, social-proof strip, CTA cluster, and demo intact.

## Verification
- `wcx npx tsx src/lib/__tests__/hero-quiz.test.ts`
- `wcx npm run lint`
- `wcx npx vitest run src/lib/__tests__/hero-stats.test.ts src/lib/__tests__/hero-quiz.test.ts`
- `wcx npm run build`

## Result
- Helper tests passed.
- `npm run lint` passed with pre-existing repository warnings only; no errors in the new quiz files.
- `npm run build` passed successfully.
