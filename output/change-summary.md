# Change Summary

Task: `09b35ef6-9573-4213-8146-1cc87ddae27b`

Changed files:
- `website/src/lib/public-portrait-manifest.ts`
- `website/src/lib/__tests__/public-portrait-manifest.test.ts`
- `website/vitest.config.ts`
- `website/public/portraits/abraham-lincoln-portrait.png`
- `website/public/portraits/andrew-carnegie-portrait.png`
- `website/public/portraits/florence-nightingale-portrait.png`
- `website/public/portraits/frederick-douglass-portrait.png`
- `website/public/portraits/julius-caesar-portrait.png`
- `website/public/portraits/napoleon-bonaparte-portrait.png`
- `website/public/portraits/seneca-portrait.png`

What changed:
- Added a `public-portrait-manifest` helper that derives the public portrait asset list from `ALLOWED_SLUGS`, resolves the canonical `website/public/portraits` path, and exposes a fail-fast coverage assertion.
- Added a vitest suite that verifies every allowed public framework slug has a manifest entry and an on-disk portrait asset, including the missing/zero-byte failure path through a temp-directory fixture.
- Extended the website coverage config so the new helper is included in the coverage gate.
- Added valid PNG fallback portraits for the seven roster-expansion slugs that were missing from `website/public/portraits`, so the manifest check passes on the current tree.

Verification:
- `cd website && pnpm vitest run src/lib/__tests__/public-portrait-manifest.test.ts src/lib/frameworks.test.ts`
- `cd website && pnpm lint`
- `cd website && pnpm build`
- `cd website && pnpm coverage`

Result:
- Passed: focused vitest slice green.
- Passed: lint completed with pre-existing warnings in unrelated files.
- Passed: coverage green at 100% on the repository-wide vitest run, including the new helper.
- Build: failed because the worktree already contains unrelated untracked Next route files under `website/src/app/pricing`, `website/src/app/privacy`, and `website/src/app/terms` that export route-segment config in a way Turbopack rejects; this task did not touch those files.

---

Task: `9260f99f-50fb-4a96-8c26-e858d687c300`

Changed files:
- `tests/test_framework_forge_runbook.py`

What changed:
- Added a source-discovery smoke regression that runs `framework_forge.pipeline.run_source_discovery()` with a shuffled source shortlist and verifies the persisted bibliography comes back ranked by evidence value.
- Asserted the persisted shortlist stays queryable by title and preserves the source metadata needed for the next pipeline stage.

Verification:
- `wcx /opt/homebrew/bin/pytest /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/tests/test_framework_forge_runbook.py`
- `wcx /opt/homebrew/bin/pytest --cov=framework_forge.pipeline --cov=framework_forge.sources --cov-report=term-missing /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/tests/test_framework_forge_runbook.py`

Result:
- Passed: 3 tests green.
- Passed: targeted coverage run completed successfully with the smoke path covering `framework_forge.pipeline` and `framework_forge.sources`.

Task: `1b9ccb13-70ce-4cfd-a2a0-cf75c06fcc54`

Changed files:
- `website/src/app/privacy/page.tsx`
- `website/src/app/terms/page.tsx`
- `website/src/lib/legal-seo.ts`
- `website/src/lib/legal-seo.test.ts`
- `website/src/app/legal-images.test.ts`
- `website/src/app/privacy/opengraph-image.tsx`
- `website/src/app/privacy/twitter-image.tsx`
- `website/src/app/terms/opengraph-image.tsx`
- `website/src/app/terms/twitter-image.tsx`

What changed:
- Added a shared legal SEO helper that emits canonical URLs, noindex metadata, Open Graph, and Twitter metadata for `/privacy` and `/terms`.
- Wired both legal pages to the shared metadata builder so the page surfaces stay aligned with one source of truth.
- Added dedicated Open Graph and Twitter preview image routes for both legal pages with page-specific card copy.
- Added regression tests for the shared metadata helper and the legal image route contracts.

Verification:
- `cd website && npx vitest run --coverage --coverage.include src/lib/legal-seo.ts --coverage.include src/app/privacy/page.tsx --coverage.include src/app/terms/page.tsx --coverage.include src/app/privacy/opengraph-image.tsx --coverage.include src/app/privacy/twitter-image.tsx --coverage.include src/app/terms/opengraph-image.tsx --coverage.include src/app/terms/twitter-image.tsx --coverage.thresholds.lines 95 --coverage.thresholds.functions 95 --coverage.thresholds.branches 95 --coverage.thresholds.statements 95 src/lib/legal-seo.test.ts src/app/legal-images.test.ts`
- `cd website && npx eslint src/app/privacy/page.tsx src/app/terms/page.tsx src/lib/legal-seo.ts src/lib/legal-seo.test.ts src/app/legal-images.test.ts src/app/privacy/opengraph-image.tsx src/app/privacy/twitter-image.tsx src/app/terms/opengraph-image.tsx src/app/terms/twitter-image.tsx`

Result:
- Passed: 5 tests green.
- Passed: targeted coverage on the legal-page scope at 100% lines/branches/functions/statements.
- Passed: targeted eslint on the touched files.

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

---

# Change Summary

Task: `81e78764-3310-4f70-851d-890e962edda0`

Changed files:
- `website/src/app/pricing/opengraph-image.tsx`
- `website/src/app/pricing/twitter-image.tsx`
- `website/src/app/pricing/opengraph-image.test.ts`
- `website/src/app/pricing/twitter-image.test.ts`

What changed:
- Added dedicated `/pricing` Open Graph and Twitter image route modules.
- Reused canonical pricing copy from `website/src/lib/pricing-copy.ts` so the share card stays aligned with the live pricing surface.
- Re-exported the Open Graph composition from the Twitter route so both preview surfaces stay byte-for-byte aligned.
- Added route-contract tests that verify the metadata exports and render the preview markup against the canonical pricing copy.

Verification:
- `cd website && pnpm vitest run src/app/pricing/opengraph-image.test.ts src/app/pricing/twitter-image.test.ts`
- `cd website && pnpm eslint src/app/pricing/opengraph-image.tsx src/app/pricing/twitter-image.tsx src/app/pricing/opengraph-image.test.ts src/app/pricing/twitter-image.test.ts`

Result:
- Passed: 4 route-contract tests green.
- Passed: targeted eslint on the four touched files.

---

# Change Summary

Task: `86ea5011-c917-448f-afc7-4a7b37034912`

Changed files:
- `website/src/app/debates/[slug]/page.tsx`
- `website/src/app/debates/[slug]/page.test.tsx`
- `website/src/lib/debates.ts`

What changed:
- Added a shared canonical URL helper for debate detail pages.
- Hardened debate detail metadata with canonical, Open Graph, Twitter, and description fields.
- Added `dynamicParams = false` plus static params generation so unknown debate slugs resolve as 404s instead of falling through.
- Added regression coverage for detail metadata, invalid-slug fallback, the detail render path, and the public debates index links.

Verification:
- `cd website && npx vitest run --coverage 'src/app/debates/[slug]/page.test.tsx'`
- `cd website && npm run coverage`
- `cd website && npm run lint`
- `cd website && npm run build`

Result:
- Passed: targeted debate route tests green.
- Passed: full repository vitest coverage gate green at 100% lines/statements/branches/functions.
- Passed: lint completed with existing warnings in unrelated files.
- Build: failed in unrelated `/pricing/twitter-image` route-segment config exports already present in the worktree, not in the debate files changed for this task.

---

# Change Summary

Task: `134-public-debate-metadata-review-fix`

Changed files:
- `website/src/app/api/admin/metrics/route.ts`
- `website/src/app/api/admin/metrics/route.test.ts` (removed)
- `website/src/lib/admin-subscriber-count.ts` (removed)
- `website/src/lib/admin-subscriber-count.test.ts` (removed)
- `website/src/app/debates/[slug]/page.coverage.test.tsx`
- `website/src/lib/debates.test.ts`

What changed:
- Removed the unrelated admin metrics subscriber-count additions from this PR so the review scope matches the debate metadata task.
- Added focused debate coverage for `getAllDebateSlugs()` and `getDebate()` fallback branches.
- Added a render coverage test that exercises the debate page's empty-paragraph guard, bullet-list path, inline markdown formatting, and default advisor-color branch.

Verification:
- `cd website && npx vitest run --coverage src/app/debates/\\[slug\\]/page.test.tsx src/app/debates/\\[slug\\]/page.coverage.test.tsx src/lib/debates.test.ts --coverage.include=src/app/debates/\\[slug\\]/page.tsx --coverage.include=src/lib/debates.ts`
- `cd website && npm run lint`

Result:
- Passed: debate-file coverage hit 100% branches, 100% statements, 100% functions, and 100% lines for the touched debate files.
- Passed: lint completed with pre-existing warnings only.
