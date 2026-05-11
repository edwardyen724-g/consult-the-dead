# Agora Guided Progress Cue — Release State (2026-05-10)

## What shipped

PR #105 ("Split Agora loading and not-found surfaces") shipped `AgoraLoading`
— the guided progress cue shown to users while an Agora session is loading.

The component lives at `website/src/app/agora/loading.tsx` and is picked up
automatically by Next.js as the segment-level loading boundary for all routes
under `/agora`. It replaces a blank white flash with a full-screen, thematic
skeleton that communicates the three-stage preparation sequence the Agora
engine performs before a council session opens.

PR #106 added the global `@keyframes pulse` definition to
`website/src/app/globals.css`. Both PRs are required for the animation to
render correctly; `loading.tsx` references `pulse` by name without inlining
the definition.

## Interaction / public contract

### ARIA contract

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `"status"` | Root `<main>` element. Announces the loading region to screen readers. |
| `aria-busy` | `true` (boolean) | Signals that content is being fetched. Removed automatically when Next.js replaces the segment with the real page content. |

The Vitest test suite asserts both attributes directly:

```ts
expect(status?.props?.['aria-busy']).toBe(true)   // boolean, not string
```

### Rendered content at load time

**Left column (full width on mobile, 1.2fr on `lg:` grid)**

- Eyebrow: "The Agora" (mono, 10 px, 0.42 em tracking, `--fg-faint`)
- Heading: "Gathering the council" (serif, responsive `text-4xl` → `text-6xl`)
- Sub-heading: "Consulted minds are being arranged into a deliberate entry
  sequence. The thread, the voices, and the consensus rail will open together."
- Step grid (3 columns on `sm:` and wider, each card pulsing with staggered
  180 ms delay):

  | Step | Title | Detail |
  |------|-------|--------|
  | 1 | Inviting minds | Historical voices are being queued into the council. |
  | 2 | Aligning context | The topic, prior turns, and constraints are settling in. |
  | 3 | Opening the hall | The live consultation is about to render. |

  Each card: amber step number badge (mono, 10 px, 0.3 em tracking), serif
  title, small detail text. `animation: pulse 2.8s ease-in-out infinite`.

**Right aside (0.8fr, `lg:` grid only)**

- Header: "Consulted minds" / "Three voices in motion" with a `loading` badge.
- Amber progress bar: `h-2`, 50 % fill, shimmer via
  `animation: pulse 2.4s ease-in-out infinite`.
- Three mind-state rows, each with a colored dot (amber / dim / green),
  serif label, and a "queued" monospace tag:

  | Label | Note | Dot color |
  |-------|------|-----------|
  | Council memory | Pulling prior decisions into view | amber (`--amber`) |
  | Contradiction | Arranging the strongest objections | dim (`--fg-dim`) |
  | Consensus | Preparing the final thread | green (`--green`) |

- Transition cue footer: "The chamber is not blank. It is being composed,
  voice by voice, before the council opens."

### Animation specification

| Element | Animation | Duration | Timing | Delay |
|---------|-----------|----------|--------|-------|
| Step card 1 | `pulse` | 2.8 s | `ease-in-out` | 0 ms |
| Step card 2 | `pulse` | 2.8 s | `ease-in-out` | 180 ms |
| Step card 3 | `pulse` | 2.8 s | `ease-in-out` | 360 ms |
| Progress bar fill | `pulse` | 2.4 s | `ease-in-out` | 0 ms |

`@keyframes pulse` (defined in `globals.css`):
- 0 %, 100 %: `opacity: 0.55`, `transform: translateY(0)`
- 50 %: `opacity: 1`, `transform: translateY(-1px)`

### Lifecycle

The loading UI is shown by the Next.js App Router as long as the page segment
remains suspended. Once `AgoraLoading`'s sibling page resolves its async data
(DB fetch, session decode, etc.), the framework replaces it with the real
content in a single paint. No JavaScript in `loading.tsx` — it is a pure
server component.

## Live verification path

1. **Manual** — Open any `/agora` route in a browser. In DevTools set Network
   throttle to "Slow 3G". Reload. The "Gathering the council" skeleton should
   fill the viewport. Confirm:
   - `<main role="status" aria-busy="true">` present in the DOM.
   - Step cards 1–3 are visible with their exact title strings.
   - The right-side aside shows "Three voices in motion" and three queued
     mind rows (visible only on viewports ≥ 1024 px, i.e. `lg:`).
   - All cards and the progress bar are animating (pulsing opacity + subtle
     vertical shift).

2. **Automated** — Run the unit test:
   ```
   pnpm vitest run website/src/app/agora/loading.test.tsx
   ```
   Two tests must pass:
   - `"renders a busy status region with the expected loading copy"` — asserts
     `aria-busy === true`, heading, all three step titles, and all three mind
     labels are present in the rendered tree.
   - `"keeps the transition cue and consultation framing visible"` — asserts
     "Transition cue", "The chamber is not blank.", and the "loading" badge
     text are all present.

3. **Accessibility audit** — Run axe or Lighthouse Accessibility on the
   skeleton URL. Expect zero critical violations on the `role="status"` +
   `aria-busy` region; heading hierarchy `h1 → h2` is intact.

## Status

Shipped ✅
