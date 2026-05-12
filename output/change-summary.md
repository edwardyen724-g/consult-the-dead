# Change Summary

## 2026-05-12 RSS feed canonical metadata and route coverage

- Task: `3c6cd63c-071f-40e0-a7b4-a0f69d08d27f`
- Branch: `wanman/rss-feed-canonical-metadata`
- Changed files: `website/src/app/feed.xml/route.ts`, `website/src/app/feed.xml/route.test.ts`
- Update: rewired `/feed.xml` to build from the shared RSS helper with real public debate and insight entries, preserving canonical `link`/`guid` URLs and the shipped cache headers while removing the route-local XML duplication.
- Verification:
  - `wcx pnpm vitest run src/app/feed.xml/route.test.ts src/lib/rss-feed.test.ts`
  - `wcx pnpm coverage`

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
## 2026-05-12 Sprint 4 polish note refresh

- Task: `d814464a-57da-4ba2-9069-28a370a02716`
- Changed file: `output/feedback-report.md`
- Update: rewrote the Sprint 4 polish note so it no longer implies `/feed.xml` or the app shell are missing; the note now treats the shipped RSS feed and app shell as baseline and limits follow-up language to genuine polish cleanup.
- Verification: `git diff --check`

## 2026-05-12 README route inventory refresh

- Task: `33a7d2b3-86ea-4d95-a93c-0e90505553d8`
- Changed files: `README.md`, `website/README.md`
- Update: added the shipped `/debates` index and `/debates/[slug]` public route to the route tables, and clarified that the debate pages are public Agora samples that link readers back to `/agora` for a fresh run.
- Verification: `git diff --check`

## 2026-05-12 monetization playbook and CTR brief reconciliation

- Task: `fd6084f9-1625-4dc4-a4bb-3fb806a1256d`
- Branch: `wanman/rss-feed-canonical-metadata` (current worktree branch)
- Changed files: `docs/pricing.md`, `docs/ctr-research-notes.md`, `docs/phase0-pricing-page-copy.md`
- Update: reconciled the monetization reference with the shipped public debate archive, `/agora` conversion surface, pricing proof strip, and production email sender so the playbook and CTR brief now describe the same canonical funnel.
- Verification: `git diff --check`
