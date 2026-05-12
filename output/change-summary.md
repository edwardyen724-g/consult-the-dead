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
