# Smoke Runbook: Agora Share Page + Consultation Progress Cue

**Feature area:** `/agora` — loading state, share-result flow, public transcript page  
**Key PRs:** #105 (loading/not-found split), #8 (GAP-03 public page), #36 (CTA polish)  
**Date:** 2026-05-11

---

## Overview

This runbook covers three related surfaces that form the Agora's share funnel:

1. **Consultation progress cue** — `loading.tsx`, the Suspense fallback shown while `/agora` hydrates
2. **Share transcript flow** — the "Share Result" button inside the ConsensusStage (inside the live app)
3. **Public share page** — `/agora/a/<share_id>`, the read-only transcript visible to anyone

Verify all three after any deployment that touches `website/src/app/agora/`, `website/src/components/ShareCtaStrip.tsx`, or `website/src/lib/share-cta-link.ts`.

---

## 1 — Consultation Progress Cue (`loading.tsx`)

### What it is

Next.js renders `website/src/app/agora/loading.tsx` as a Suspense fallback while the `/agora` server component fetches data. It is a **purely visual, server-rendered** loading state — no JS hydration required.

### Verify locally

```bash
cd website
npm run dev
# http://localhost:3000/agora
```

To hold the loading state open (it flashes briefly on localhost):

- Open DevTools → Network → throttle to **Slow 3G**.
- Navigate to `http://localhost:3000/agora`.
- Expect the loading screen to fill the viewport for 1–3 s.

Alternatively, temporarily add `await new Promise(r => setTimeout(r, 5000))` at the top of `page.tsx` while testing.

### Accept criteria

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Three ritual step cards | "Inviting minds", "Aligning context", "Opening the hall" — in that order |
| 2 | Step badges | Each card shows its step number in an amber badge |
| 3 | Card animation | Each card pulses with `animation-delay`: 0 ms / 180 ms / 360 ms |
| 4 | Right-side sidebar | "Consulted minds" heading + "Three voices in motion" subtitle |
| 5 | Progress bar | Amber shimmer bar visible, animating |
| 6 | Mind rows | "Council memory", "Contradiction", "Consensus" — each with a `queued` badge |
| 7 | Transition cue | Footer text reads: *"The chamber is not blank. It is being composed, voice by voice, before the council opens."* |
| 8 | Background | Amber radial glow at top + horizontal amber band at the very top edge |
| 9 | Accessibility | Root `<main>` carries `role="status"` and `aria-busy={true}` |

### Regression tests

File: `website/src/app/agora/loading.test.tsx`

```bash
cd website
npx vitest run src/app/agora/loading.test.tsx
```

Covers: accessibility attributes, all three step titles, all three consulted-mind labels, transition cue copy, `loading` badge text.

### Edge cases

| Scenario | Expected behavior |
|----------|------------------|
| Mobile (< 640 px) | Step cards stack to single column (`sm:grid-cols-3` inactive). Sidebar renders below. No overflow clipping at 375 px. |
| Fast connection | Loading screen may flash < 200 ms. Expected — no artificial delay. |
| No JS / SSR only | Screen is visible as raw HTML before any JS runs. No JS-only spinner fallback needed. |
| Dark mode | Component uses CSS vars; no light-mode variant. Confirm site enforces global dark mode before filing contrast bugs. |
| Second visit (cached) | Client-side navigation may skip the loading screen if the segment is already cached. Expected. |

---

## 2 — Share Transcript Flow (inside the app)

### What it is

At the ConsensusStage (final stage after an agon completes), users see a **"Share Result"** button. It uses `navigator.share` when available (mobile native share sheet), falling back to clipboard copy.

**Share payload:**
```
I asked: "<topic>"

Council: <Mind 1>, <Mind 2>, <Mind 3>

Key action: <consensus.actionSummary>

Try it yourself at consultthedead.com
```

### Verify locally or in production

1. Go to `/agora` and complete a full debate (select 3 minds, submit a question, wait for all rounds).
2. Wait for consensus to render. The "Share Result" button becomes active.
3. Click **Share Result**:
   - **Desktop / no `navigator.share`:** button briefly changes to **"Copied!"** (resets after 2 s). Paste in any text editor — the payload above should appear.
   - **Mobile with `navigator.share`:** native share sheet opens with the text pre-filled.
4. If share fails or is cancelled on mobile, the clipboard fallback fires silently.

### Accept criteria

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Button disabled state | "Share Result" is greyed out / `disabled` while consensus is null |
| 2 | Clipboard copy | After click, button reads "Copied!" for ~2 s then resets to "Share Result" |
| 3 | Payload content | Copied text contains the topic, mind names, action summary, and `consultthedead.com` |
| 4 | Mobile share | `navigator.share` sheet opens with correct title and text |
| 5 | No errors | No console errors during the share action |

> **Note:** The "Share Result" button copies a plain-text summary. It does **not** automatically create a public link — that is the "Save to Library" action (Pro only). The public link surface is `/agora/a/<share_id>`.

---

## 3 — Public Share Page (`/agora/a/<share_id>`)

### What it is

A server-rendered, auth-free read-only transcript at `/agora/a/<share_id>`. Resolves `share_id` via `db.getPublicAgonByShareId`. Returns 404 on missing or invalid IDs.

### Verify in production

```bash
BASE_URL=https://consultthedead.com

# Use any known share_id — the 30 outreach seeds are in the agons table.
# Substitute a real one:
SHARE_ID=<known-share-id>

curl -sf "$BASE_URL/agora/a/$SHARE_ID" | grep -c 'The Agora · Public Transcript'
# expect: 1
```

Or open `https://consultthedead.com/agora/a/<share_id>` in a browser.

### Accept criteria

#### Page header
| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Header label | "The Agora · Public Transcript" (top-left, monospace, small caps) |
| 2 | Read-only badge | "Read-only" label in top-right |

#### The Question section
| # | Check | Pass condition |
|---|-------|---------------|
| 3 | Topic text | Renders in serif italic, wrapped in `"…"` |
| 4 | Social proof line | Text below topic reads "Generated by Consult The Dead — 26 minds, infinite debates" |

#### Council section
| # | Check | Pass condition |
|---|-------|---------------|
| 5 | Mind cards | One card per council member, amber left-border accent, mind-specific color |
| 6 | Era displayed | Era text visible under each mind name |

#### Research Brief (when present)
| # | Check | Pass condition |
|---|-------|---------------|
| 7 | Summary text | Rendered in serif with left border hairline |
| 8 | Sources list | Linked bibliography items (title + URL) |

#### The Agon transcript
| # | Check | Pass condition |
|---|-------|---------------|
| 9  | Round headers | "Round I", "Round II", … in roman numerals |
| 10 | Turn attribution | Mind name rendered in that mind's color variable |
| 11 | Turn text | Serif, `white-space: pre-wrap`, correct speaker order per round |

#### Council Consensus (when present)
| # | Check | Pass condition |
|---|-------|---------------|
| 12 | Consensus Points block | Amber label + content |
| 13 | Live Tensions block | Amber label + content |
| 14 | Recommended Action block | Amber label + content |
| 15 | Immediate Next Steps | `<ul>` list if `steps.length > 0` |
| 16 | Risks block | Amber label + content |

#### CTA and conversion
| # | Check | Pass condition |
|---|-------|---------------|
| 17 | Funnel lead-in | Visible above the transcript on desktop: read-only banner, "Liked the verdict? Begin your own agon.", and the CTA button |
| 18 | Inline CTA strip | Visible on desktop (> 720 px): amber left-border panel, "Begin your own agon", "Start a free agon →" button |
| 19 | Sticky CTA bar | Visible on mobile (≤ 720 px): fixed bottom bar, same copy and button |
| 20 | CTA href | Both links point to `/agora?utm_source=share&utm_campaign=agon_share&utm_content=<share_id>` |
| 21 | "Run your own agon →" footer | Button at bottom of page links to `/agora` (with UTM if present in incoming URL) |
| 22 | UTM passthrough | If page was opened with `?utm_campaign=X&utm_content=Y`, footer CTA preserves those params |
| 23 | Generated-by footer | Italic serif "Generated by Consult The Dead — The Agora" with dotted link |

#### Print / OG
| # | Check | Pass condition |
|---|-------|---------------|
| 24 | Print — CTA hidden | Both ShareCtaStrip instances and the funnel lead-in banner are absent in print preview / saved PDF |
| 25 | Print — attribution | "Generated by …" footer line visible in print |
| 26 | OG title | `<title>` is `Agon: <truncated topic> · Consult The Dead` |
| 27 | OG description | Twitter / OG description is the topic trimmed to ≤ 180 chars |
| 28 | Canonical URL | `<link rel="canonical">` equals `https://www.consultthedead.com/agora/a/<share_id>` |

#### Error state
| # | Check | Pass condition |
|---|-------|---------------|
| 29 | Missing share_id | `/agora/a/nonexistent` returns a 404 page (not a 500) |

### Verify 404 behavior

```bash
curl -o /dev/null -w "%{http_code}\n" https://consultthedead.com/agora/a/does-not-exist
# expect: 404
```

### Regression tests

| File | What it covers |
|------|---------------|
| `website/src/app/agora/a/[id]/lib.test.ts` | `normalizeTurns`, `groupTurnsByRound`, `hasUsableConsensus`, `normalizeResearch`, `buildAgoraCtaHref`, `buildShareDescription` |
| `website/src/components/__tests__/ShareCtaStrip.test.tsx` | ShareCtaStrip render, CTA href shape, variant show/hide attributes |

```bash
cd website
npx vitest run src/app/agora/a/\\[id\\]/lib.test.ts
npx vitest run src/components/__tests__/ShareCtaStrip.test.tsx
```

---

## Full suite (all three surfaces)

```bash
cd website
npx vitest run \
  src/app/agora/loading.test.tsx \
  "src/app/agora/a/[id]/lib.test.ts" \
  src/components/__tests__/ShareCtaStrip.test.tsx
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Loading screen never appears | Agora page is a client component — Suspense doesn't trigger | Ensure `page.tsx` is an `async` server component |
| Loading screen permanent | DB query hanging | Check Neon connection pool / `DATABASE_URL` env var |
| "Share Result" stays grey | Consensus object is null after generation | Check `/api/agora/stream` response and consensus parsing |
| Share copies empty text | `consensus.actionSummary` is undefined | Check consensus schema normalisation in `AgoraApp.tsx` |
| `/agora/a/<id>` returns 500 | `db.getPublicAgonByShareId` throws | Check `DATABASE_URL`; verify `share_id` column is indexed |
| CTA strip not visible | Wrong breakpoint or `.sct-inline`/`.sct-sticky` CSS missing | Confirm `ShareCtaStyles` is rendered once above both `<ShareCtaStrip>` instances |
| UTM not forwarded on footer CTA | `buildAgoraCtaHref` not receiving searchParams | Check `page.tsx` passes `sp?.utm_campaign` and `sp?.utm_content` |
| OG image missing | `opengraph-image.tsx` route not deployed | Verify build includes `website/src/app/agora/a/[id]/opengraph-image.tsx` |
