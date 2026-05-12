# Insights Hero / Index Release-State Note

**Date:** 2026-05-11
**Task ID:** `db1c5ed0`
**PR:** [#200 feat(insights): add hero summary panel and denser index cards](https://github.com/edwardyen724-g/consult-the-dead/pull/200)
**Branch:** `wanman/insights-hero-panels`
**Status:** Open — awaiting CTO merge before reaching production

---

## What Shipped (in review)

### `/insights` — Index page

**Before:** Vertical stacked-doc list with minimal metadata per entry.

**After:** Compact card rows, each showing:
- Left accent bar (visual scan anchor)
- Mind name badge (e.g. "Newton", "Machiavelli")
- Decision-type pill (e.g. "Pivot", "Firing")
- Reading-time estimate
- 1-line excerpt from the insight

More above-the-fold density; visitors can skim decision type and mind before clicking.

### `/insights/[slug]` — Detail pages

**Before:** Article body starts immediately below the page title.

**After:** Above-fold hero panel containing:
- Portrait icon for the relevant mind(s)
- Mind/domain link row
- 2-sentence perceptual-lens excerpt
- Meta row: decision-type pill, publish date, reading time
- `h1` and `application/ld+json` structured data preserved below for SEO

For collision insights (two minds), both portraits appear in the hero panel.

---

## Routes Affected

| Route | Change |
|---|---|
| `/insights` | Compact card rows replace stacked-doc list |
| `/insights/[slug]` | Hero panel added above article body |

---

## Live Verification Path

### Manual

1. Visit [https://www.consultthedead.com/insights](https://www.consultthedead.com/insights)
   - Confirm each card shows: mind badge, decision-type pill, reading time, 1-line excerpt
   - Confirm no horizontal overflow on mobile viewport
2. Visit a specific insight detail page, e.g.:
   - `/insights/how-newton-would-approach-your-pivot-decision`
   - `/insights/machiavelli-on-when-to-fire-your-cofounder`
   - Confirm the hero panel appears above the article body (portrait icon, lens excerpt, meta row)
   - Confirm `h1` is still present in page source

### curl smoke checks (post-deploy)

```sh
# Index: confirm excerpt and reading time are rendered in HTML
curl -s 'https://www.consultthedead.com/insights' | grep -i 'min read\|excerpt'

# Detail: confirm hero panel marker is present
curl -s 'https://www.consultthedead.com/insights/how-newton-would-approach-your-pivot-decision' \
  | grep -i 'hero\|min read\|perceptual'
```

---

## Pending

- **PR #200 must be merged by the CTO** before these changes reach production.
- After merge, trigger a Vercel deployment and re-run the curl smoke checks above.

---

## Sprint Follow-Ups (same sprint, open PRs)

- **PR #201** — [docs: reconcile CTR and design notes with shipped library retention surface](https://github.com/edwardyen724-g/consult-the-dead/pull/201) (`wanman/essay-reader-editorial`) — editorial consistency pass on research docs
- **PR #205** — [feat(frameworks): spatial grid layout replacing stacked-doc presentation](https://github.com/edwardyen724-g/consult-the-dead/pull/205) (`wanman/frameworks-index-spatial`) — `/frameworks` index moves from stacked-doc list to responsive 3-column gallery grid with featured treatment for Newton, Machiavelli, and Sun Tzu
