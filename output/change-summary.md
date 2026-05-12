# Change Summary

## Branch

- `wanman/should-i-sell-my-startup-phase1-content-bundle`

## Changed Files

- `website/content/debates/should-i-sell-my-startup.md`
- `output/articles/should-i-sell-my-startup.md`
- `output/phase1-promo-packs/should-i-sell-my-startup.md`
- `output/distribution-briefs/should-i-sell-my-startup.md`

## Notes

- Added the full "Should I Sell My Startup?" debate page plus the supporting article, promo pack, and distribution brief.
- The bundle is content-only; there are no repo test scripts in `package.json`.
- This branch is a continuation of already-validated content work, moved off `master` so it can be reviewed and merged normally.

## Verification

- Manual review of all four content files for internal consistency and expected cross-links.
- `git diff --check` after staging to confirm there are no whitespace or patch-format issues.

## 2026-05-12 — Public Agora share conversion lead-in

### Branch

- `wanman/public-agora-share-funnel`

### Changed Files

- `website/src/app/agora/a/[id]/page.tsx`
- `website/src/app/agora/a/[id]/page.test.tsx`
- `docs/runbooks/public-agora-share-page-smoke.md`

### Notes

- Added a read-only conversion lead-in above the existing public share CTA so `/agora/a/[id]` more clearly invites readers back into `/agora`.
- Kept the canonical share URL, generated-by footer, and share-page UTM contract unchanged.
- Updated the public-share smoke runbook so the desktop lead-in banner is documented alongside the existing inline and sticky CTA checks.

### Verification

- `pnpm vitest run src/app/agora/a/\[id\]/page.test.tsx src/app/agora/a/\[id\]/lib.test.ts src/components/__tests__/ShareCtaStrip.test.tsx src/lib/__tests__/share-cta-link.test.ts`
- `pnpm coverage`

## 2026-05-12 — Root npm script proxies

### Branch

- `wanman/root-scripts`

### Changed Files

- `package.json`

### Notes

- Added root-level `build`, `lint`, and `test` scripts that proxy to the existing website package entrypoints.
- Kept the website package itself unchanged; the root script layer now serves repo-level automation and release checks.

### Verification

- `npm run lint`
- `npm run build`
- `npm run test`

### Results

- `lint` passed with pre-existing website warnings only.
- `build` completed successfully through Next.js production build.
- `test` passed with 139 files and 1921 tests green.

## 2026-05-12 — Pricing proof strip live-seeding

### Branch

- `wanman/public-agora-share-funnel`

### Changed Files

- `website/src/app/pricing/PricingClient.tsx`
- `website/src/app/pricing/page.tsx`
- `website/src/app/pricing/page.test.tsx`
- `website/src/lib/pricing/stats.ts`
- `docs/ctr-research-notes.md`
- `CHANGELOG.md`

### Notes

- Split `/pricing` into a server wrapper plus client component so the proof strip can seed from `getPricingStats()` on first render and then refresh from `/api/stats`.
- Kept the static pricing defaults as the degraded fallback, but they no longer define the normal render path when live stats are available.
- Updated the research notes and changelog to match the live-seeded pricing contract.

### Verification

- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && ./node_modules/.bin/vitest run --coverage src/app/pricing/page.test.tsx src/lib/__tests__/pricing-stats-route.test.ts`
- `cd /Users/haotingyen/projects/consult-the-dead/.wanman/worktree/website && ./node_modules/.bin/vitest run --coverage`

### Results

- The targeted pricing tests passed.
- The full website coverage run passed with 139 test files green and 99.49% statements / 98.1% branches / 100% functions / 99.81% lines.
