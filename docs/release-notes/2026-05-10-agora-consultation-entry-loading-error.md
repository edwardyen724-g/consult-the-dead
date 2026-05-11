# Agora Consultation Entry — Loading/Error Boundary Contract — Release State (2026-05-10)

## What shipped

PR #105 ("Split Agora loading and not-found surfaces") introduced the complete
loading and error-boundary contract for Agora routes. The two surfaces shipped
together:

1. **`website/src/app/agora/loading.tsx`** — Next.js segment-level loading UI.
   Rendered automatically by the framework while any page under `/agora` is
   suspended (server component data fetch, dynamic import, or slow DB response).
   The component exports `AgoraLoading`, a full-screen "Gathering the council"
   skeleton that fills the viewport before the real session content arrives.

2. **`website/src/app/agora/a/[id]/page.tsx` — `notFound()` on error** — The
   public consultation entry page (`/agora/a/<share-id>`) does not expose a
   raw 500. Database errors and missing share IDs are both caught and forwarded
   to Next.js `notFound()`, so the user sees a 404-equivalent page rather than
   an unhandled exception. The server logs capture the raw error for
   diagnostics; the public surface is always a controlled fallback.

PR #106 added the shared `@keyframes pulse` animation to `globals.css` that the
loading surface depends on for its step-card and progress-bar animations.

No dedicated `error.tsx` exists at the agora segment level. The chosen contract
is: database and fetch failures degrade to a `notFound()` (friendlier for a
public share link) rather than to a recoverable error boundary.

## Interaction / public contract

### Loading surface (`/agora` and sub-routes while suspended)

- Root element: `<main role="status" aria-busy={true}>`. Screen readers
  announce the region as live and busy.
- Heading: "Gathering the council" (serif, full-width, responsive
  `text-4xl`/`text-5xl`/`text-6xl`).
- Sub-copy: "Consulted minds are being arranged into a deliberate entry
  sequence. The thread, the voices, and the consensus rail will open
  together."
- Three step cards in a responsive grid (stacked on mobile, 3-column on `sm:`
  and wider), pulsing with staggered 180 ms delay:
  - Step 1 — "Inviting minds" / "Historical voices are being queued into the
    council."
  - Step 2 — "Aligning context" / "The topic, prior turns, and constraints are
    settling in."
  - Step 3 — "Opening the hall" / "The live consultation is about to render."
- Right-hand aside (visible on `lg:` grid): animated amber progress bar (50 %
  fill, `pulse 2.4s`), three "queued" mind-state rows (Council memory /
  Contradiction / Consensus), and a "Transition cue" footer: "The chamber is
  not blank. It is being composed, voice by voice, before the council opens."
- No spinner, no raw "Loading…" text. The copy is intentionally thematic to
  stay on-brand.

### Error / not-found surface (`/agora/a/<id>` on missing or failed lookup)

- `notFound()` is called for both missing records and DB exceptions.
- Result: Next.js renders the nearest `not-found` page (global fallback at the
  app root level).
- HTTP status: 404 (Next.js `notFound()` contract).
- The raw error is logged on the server; the public URL never exposes a stack
  trace.

## Live verification path

1. **Loading skeleton** — Open `/agora` or any `/agora/a/<id>` URL in a browser
   with a slow network profile (DevTools → Network → "Slow 3G"). The
   "Gathering the council" full-screen skeleton should appear for the duration
   of the suspended fetch. Confirm `<main role="status" aria-busy="true">` in
   the Elements panel.

2. **Pulse animation** — In the skeleton, all three step cards and the amber
   progress bar animate continuously. Each step card staggered by 180 ms.
   Confirm via DevTools → Animations panel or by inspecting `animation`
   computed style on the step-card divs.

3. **404 on bad share ID** — Navigate to `/agora/a/does-not-exist-abc123`.
   Expect a 404 response (verify via Network tab status code) and the app's
   not-found page copy. No 500, no stack trace visible.

4. **Regression test** — `pnpm vitest run website/src/app/agora/loading.test.tsx`
   (or `pnpm test` from the repo root). Two tests must pass:
   - "renders a busy status region with the expected loading copy"
   - "keeps the transition cue and consultation framing visible"

## Status

Shipped ✅
