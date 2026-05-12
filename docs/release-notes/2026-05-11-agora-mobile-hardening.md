# Agora Mobile Hardening — Release Note (2026-05-11)

**PR:** #168 (`wanman/agora-mobile-hardening`)  
**Regression PR:** #179 (`wanman/agora-mobile-empty-error-regression`)  
**Area:** `/agora` — mobile layout, empty-state UI, error boundary  
**Status:** In review — pending CTO merge before production deployment

---

## What Shipped (in review)

### 1. Mobile Layout Fixes

Responsive CSS on `.gm-agora-shell` makes the Agora interface usable on narrow
viewports (tested down to 375px / iPhone SE width):

- `min-height: calc(100vh - 80px)` — shell fills the viewport below the nav bar
- `padding: 48px 24px 96px` — top/bottom padding clears mobile browser chrome
- `max-width: 1100px` on the inner content wrapper — prevents overstretching on
  wide desktop without affecting mobile layout
- Footer uses `flex-wrap: wrap` so the usage text and back-link stack vertically
  on narrow screens instead of overflowing
- Example topic cards use `repeat(auto-fit, minmax(220px, 1fr))` grid — cards
  reflow to single-column on small screens
- API-key input hidden behind an expandable toggle — avoids cluttering the
  initial mobile view

Files changed: `website/src/app/agora/AgoraApp.tsx`

### 2. `NoticePanel` Component

New reusable component (`website/src/components/NoticePanel.tsx`) provides
consistent empty-state and error-state UI:

- Left-accent border (color parameterized per use case)
- Eyebrow label, serif title, body copy
- Optional action buttons (retry, navigation)

Integrated into `AgoraApp` for three inline states:

| State | Accent | Copy trigger |
|-------|--------|--------------|
| API error with retry CTA | red | `state.error` is truthy |
| Agon stream gathering / empty turns | amber | debate in-flight, no turns yet |
| Consensus stream stopped | neutral | stream ends before consensus |

Files added: `website/src/components/NoticePanel.tsx`,
`website/src/components/NoticePanel.test.tsx`

### 3. Next.js Error Boundary (`error.tsx`)

`website/src/app/agora/error.tsx` — segment-level Next.js error boundary for
the `/agora` route. Catches unhandled client or server exceptions and renders a
`NoticePanel` with:

- Red left-accent border
- "Retry" button (calls `reset()`)
- "Back to home" link
- Transient-error guidance copy

Files added: `website/src/app/agora/error.tsx`,
`website/src/app/agora/error.test.tsx`

---

## Live Verification Path

Base URL: `https://www.consultthedead.com/agora`

### (a) Mobile viewport check — iOS/Android

1. Open `https://www.consultthedead.com/agora` on an iOS or Android device, or
   use DevTools → Device Toolbar set to a 375×812 viewport (iPhone SE / 14
   Pro).
2. Confirm the page fills the screen vertically with no horizontal scroll.
3. Scroll to the bottom footer — verify the usage text and back-link are
   stacked vertically, not clipped or overlapping.
4. Confirm example topic cards stack to a single column (cards should be at
   least 220px wide and not overflow the viewport edge).
5. Confirm the "your own Anthropic key" section is collapsed behind a toggle
   on first load.

### (b) Empty-state check before first agon

1. Open `https://www.consultthedead.com/agora` in a fresh private/incognito
   session (no prior session history).
2. Confirm: "Stage I — The Question" header is visible.
3. Confirm: the decision textarea is present with placeholder copy ("What
   decision are you carrying…").
4. Confirm: example topics are shown ("Should I raise VC or bootstrap?", etc.).
5. Confirm: no agon transcript, no round headers, no consensus graph are
   rendered in this state.
6. Confirm: the footer shows "Free tier" (or "Pro" for authenticated pro users).
7. Confirm: word count reads "0 Words · Draft 1".

### (c) Error state simulation

Two approaches depending on access level:

**Option 1 — DevTools network block (no code change needed):**
1. Open `/agora` in Chrome DevTools.
2. In the Network panel, right-click the Claude API request and select "Block
   request domain".
3. Enter a topic (10+ characters), select 1–3 minds, click "Begin the Agon".
4. After the blocked request fails, the `NoticePanel` error UI should render
   with a red left-accent border, error copy, and a "Retry" action button.

**Option 2 — Trigger the Next.js error boundary:**
1. If you have access to a staging deployment of PR #168, introduce a
   temporary `throw new Error("test")` at the top of `AgoraApp.tsx`.
2. Navigate to `/agora` — the `error.tsx` boundary should catch it and render
   the full-page error panel (red accent, retry button, home link).
3. Revert the test throw before merging.

---

## Test Coverage Lock

PR #179 (`wanman/agora-mobile-empty-error-regression`) adds **28 regression
tests** across 4 suites in
`website/src/app/agora/AgoraApp.regression.test.tsx`:

| Suite | Tests | What it covers |
|-------|-------|----------------|
| Mobile layout regression | 6 | `min-height`, padding, `max-width`, `flex-wrap`, auto-fit grid, BYO-key toggle |
| Empty / no-session-history state | 10 | Stage I initial render, textarea, no transcript, no consensus, example topics, empty minds list, free/pro footer labels, word count at zero |
| Inline error UI contract | 5 | No spurious error banner on initial render, `AgoraApp` export integrity, research toggle presence, privacy notice always visible |
| Structural / snapshot assertions | 7 | `<main>` root element, dark theme CSS tokens, stage header invariant, BYO key section, free/pro footer back-links, research toggle label |

Tests use `renderToStaticMarkup` only (no `@testing-library/react`) so they
run without a DOM environment and remain green both before and after PR #168
merges.

To run:
```bash
cd website
npx vitest run src/app/agora/AgoraApp.regression.test.tsx
```

PR #168's own test file adds coverage for `NoticePanel` and `error.tsx`
specifically — those run alongside the regression suite after merge.

---

## Pending

- **PR #168 requires CTO merge** before any of the mobile layout, `NoticePanel`,
  or `error.tsx` changes ship to production. The regression tests in PR #179
  are on `master` and are green independently.
- After PR #168 merges, run the full test suite (`pnpm test`) to confirm the
  28 regression tests continue to pass alongside the new PR #168 tests.
- Capture live smoke evidence using the verification steps above and update
  this note's status to "Shipped".
