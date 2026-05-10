# Change Summary

Task: `fac8ad62-0710-49eb-99a9-ecbd67b35699`

Changed files:
- `company-builder/src/app/api/research/route.ts`
- `company-builder/tests/research-route.test.ts`

What changed:
- Added stable SSE error events for research source fetch failures and synthesis stream failures.
- Kept `research_sources` as the first streamed event before any chunks.
- Preserved and regression-tested deterministic source ordering and deduplication across web, Hacker News, and GitHub results.
- Added route-level regression coverage for the success path, source-failure fallback path, and synthesis-failure path.

Verification:
- `cd company-builder && /var/folders/nj/6nhbccys34393w3xv9vxpzfh0000gn/T/wanman-agent-homes/run-mozn9oyg-p70587-ad97d2d0/dev/.wanman/bin/wcx /Users/haotingyen/projects/wanman.dev/node_modules/.bin/vitest run tests/research-route.test.ts`

Result:
- Passed: 3 tests green.
- ESLint verification was blocked because the company-builder app tree does not have the ESLint dependency set installed locally, and its `eslint.config.mjs` cannot resolve `eslint/config` in this capsule environment.
