# Change Summary

Task: `6ca8147e-e40b-4a37-b505-38db98f83885`
Capsule: `506b090c-d063-4f8d-af5d-2737bf724633`

## Files Changed

- `website/src/app/layout.tsx`
- `website/src/components/ThemeToggle.tsx`
- `website/src/app/footer-toggle.tsx`
- `website/src/components/ThemeProvider.test.tsx`
- `website/src/components/ThemeToggle.test.tsx`
- `website/src/app/footer-toggle.test.tsx`

## What Changed

- Switched the public app shell to the local `ThemeProvider` wrapper so the shell inherits the shared system-following theme defaults.
- Kept the theme toggles aligned with the resolved OS theme by reading `resolvedTheme` with a fallback to `theme`.
- Added focused tests for the provider defaults and for both toggles' dark/light label and icon states.

## Verification

- `npm run test -- src/components/ThemeProvider.test.tsx src/components/ThemeToggle.test.tsx src/app/footer-toggle.test.tsx`
- `npm run build`

## Notes

- `pnpm` was unavailable in this environment because the local shim requires `corepack`, which is not installed here.
- `next build` completed successfully with existing project warnings unrelated to this change.

---

# Change Summary

Task: `ddb92e0c-9fa1-4248-aa17-2d6d5d7d43ae`
Capsule: `7cffad97-a433-4ddf-aedb-c49776c3428f`

## Files Changed

- `docs/release-notes/2026-05-12-vercel-preview-rate-limit.md`
- `docs/environment-variables.md`
- `docs/release-notes/index.md`

## What Changed

- Tightened the Vercel preview blocker guidance in the environment-variable reference so it points to the verified release-state note and keeps the failure classified as a Vercel quota issue, not an application regression.
- Published the release-state note for the verified Vercel preview quota failure and linked it from the release-note index.
- Reworded the promoted release-state index entry to match that same blocker status and unblock path: preview failure, CI passing independently, and the 24-hour reset or plan upgrade as the remedy.

## Verification

- `git diff --check -- docs/environment-variables.md docs/release-notes/index.md`
- `sed -n '165,195p' docs/environment-variables.md`
- `sed -n '10,25p' docs/release-notes/index.md`

## Notes

- No code changes were required; this task only tightened release-state documentation wording.
