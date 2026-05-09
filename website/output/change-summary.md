# Change Summary

- Tightened production cron auth so the retention routes only accept a matching bearer secret.
- Redacted Clerk user IDs and email addresses from retention cron dry-run responses.
- Added route-level tests for production auth rejection and summary redaction on both cron routes.
- Verification:
  - `pnpm test -- --run src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.test.ts` passed.
  - `pnpm coverage -- --run src/lib/emails/cron.test.ts` passed.
  - `pnpm eslint src/lib/emails/cron.ts src/app/api/cron/retention-emails/nudge/route.ts src/app/api/cron/retention-emails/digest/route.ts src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.test.ts` passed.
  - `pnpm lint` failed on pre-existing unrelated repo issues outside this capsule, including `website/src/app/worked-example.tsx`.
  - `pnpm build` passed.
