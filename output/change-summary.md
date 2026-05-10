# Change Summary

## Task
- Lock the pricing share-preview contract in regression tests

## Changed Files
- `website/src/lib/pricing-copy.test.ts`
- `website/src/lib/pricing-copy.ts`
- `website/src/app/pricing/layout.tsx`
- `website/src/app/pricing/layout.test.ts`

## What Changed
- Promoted the pricing metadata title and Twitter card into the canonical pricing helper so the `/pricing` metadata now reads from one source of truth.
- Wired the pricing route layout to the helper-backed title, description, and `summary_large_image` card.
- Kept the helper regression coverage in place for the canonical free-limit, BYO-key, and founding-member strings.
- Tightened the pricing metadata regression test to assert all three metadata fields against the helper exports.

## Verification
- `npm test -- --coverage src/app/pricing/layout.test.ts src/app/pricing/page.test.tsx src/lib/pricing-copy.test.ts`
  - Passed: 3 test files, 8 tests
