# Change Summary

## Files Changed
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/components/shared/ErrorBoundary.tsx`
- `src/components/shared/ApiKeyIndicator.tsx`
- `src/components/shared/ApiKeyModal.tsx`
- `src/components/shared/CommandPalette.tsx`
- `src/components/shared/useFocusRestore.ts`
- `src/components/panels/DetailPanel.tsx`
- `src/components/panels/DebateHistory.tsx`
- `src/components/panels/DebatePanel.tsx`
- `src/store/settingsStore.ts`
- `tests/app-shell-polish.mjs`

## What Changed
- Added route-level loading and error shells for the company-builder app.
- Polished the shared error boundary with clearer recovery actions and alert semantics.
- Added predictable focus restore behavior for the API key modal, command palette, detail panel, debate panel, and debate history panel.
- Exposed the API key indicator and modal in the app shell so the modal flow is reachable.
- Added a browser regression script for the shell loading / modal / palette focus flow.
- Added dev-only bridge hooks for deterministic regression access in the local browser harness.

## Verification
- `npx eslint src/app/page.tsx src/app/error.tsx src/app/loading.tsx src/components/shared/ErrorBoundary.tsx src/components/shared/ApiKeyIndicator.tsx src/components/shared/ApiKeyModal.tsx src/components/shared/CommandPalette.tsx src/components/shared/useFocusRestore.ts src/components/panels/DetailPanel.tsx src/components/panels/DebateHistory.tsx src/components/panels/DebatePanel.tsx src/store/settingsStore.ts tests/app-shell-polish.mjs`
- `npm run build`
- `node tests/app-shell-polish.mjs`

## Results
- ESLint: passed on the touched files.
- Build: passed.
- Browser regression: still hits a headless runtime/hydration mismatch when waiting for the modal input to become visible in this environment.
