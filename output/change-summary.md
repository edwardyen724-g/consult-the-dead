Changed files:
- website/src/app/pricing/page.tsx
- website/src/app/pricing/page.test.tsx
- website/pnpm-lock.yaml

Verification:
- ./node_modules/.bin/vitest run --coverage --coverage.reportsDirectory /tmp/consult-the-dead-vitest-coverage (pass)
- The default repo-local coverage directory path failed in this environment with Vitest ENOENT on coverage/.tmp, so the validation was rerun successfully with an external reports directory.
