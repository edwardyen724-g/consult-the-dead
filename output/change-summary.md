# Change Summary

Task: `be5f4bc1-dc0a-4724-a22f-ae6e4bf1cf7c` - Keep robots metadata aligned with the public route inventory
Capsule: `7ae8c15a-1b69-417c-b2c3-38046b887d2b` - `wanman/robots-metadata`

## Changed Files

- `website/src/app/robots.ts`

## What Changed

- Kept the robots metadata pointed at the canonical sitemap URL.
- Derived the sitemap URL from the canonical site origin constant so the robots response stays aligned if the site origin changes.

## Verification

- `npm run lint`
  - Result: passes with pre-existing warnings in unrelated files.
- `npm run test`
  - Result: passes, `21` files and `268` tests green.
- `npm run build`
  - Result: passes; Next.js build completed successfully.

## Notes

- `npm ci` was required in `website/` because the local workspace install was incomplete before verification.
- The build emitted an expected Vercel Postgres environment warning while prerendering sitemap data, but the build completed successfully.
