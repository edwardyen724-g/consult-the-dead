# Change Summary

## Scope

- Hardened the retention-email cron auth path so `dryRun=1` no longer bypasses production auth.
- Redacted Clerk identifiers and email addresses from cron route JSON responses.
- Added route-level tests for production auth rejection and response redaction.

## Changed Files

- `website/src/lib/emails/cron.ts`
- `website/src/lib/emails/cron.test.ts`
- `website/src/app/api/cron/retention-emails/nudge/route.ts`
- `website/src/app/api/cron/retention-emails/nudge/route.test.ts`
- `website/src/app/api/cron/retention-emails/digest/route.ts`
- `website/src/app/api/cron/retention-emails/digest/route.test.ts`

## Verification

- `pnpm vitest run src/lib/emails/cron.test.ts src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.test.ts`
- `pnpm vitest run --coverage src/lib/emails/cron.test.ts`
- `pnpm eslint src/lib/emails/cron.ts src/lib/emails/cron.test.ts src/app/api/cron/retention-emails/nudge/route.ts src/app/api/cron/retention-emails/nudge/route.test.ts src/app/api/cron/retention-emails/digest/route.ts src/app/api/cron/retention-emails/digest/route.test.ts`

## Results

- Focused Vitest suite: 3 files passed, 26 tests passed.
- Coverage run: `website/src/lib/emails/cron.ts` reached 100% statements / 100% functions / 91.42% branches / 100% lines in the focused coverage run.
- ESLint: passed with no errors or warnings on the touched files.
