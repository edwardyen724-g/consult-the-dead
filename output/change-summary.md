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
