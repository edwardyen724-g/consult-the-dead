Changed files:
- website/src/app/pricing/page.tsx
- website/src/app/pricing/page.test.tsx
- website/pnpm-lock.yaml

Verification:
- `pnpm coverage -- --coverage.reportsDirectory /tmp/consult-the-dead-vitest-coverage` (pass)
- The full website coverage run passed after rerouting the coverage output to `/tmp/consult-the-dead-vitest-coverage` to avoid the repo-local Vitest ENOENT on `coverage/.tmp`.

Results:
- 118 test files passed
- 1404 tests passed
- Coverage: 99.33% statements, 97.94% branches, 100% functions, 100% lines
