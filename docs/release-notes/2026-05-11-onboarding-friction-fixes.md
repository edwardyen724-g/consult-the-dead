# Onboarding Friction Fixes — Release Note (2026-05-11)

**PR:** #115  
**Area:** `/agora` — council stage, pack accordion, free-tier cap  
**Status:** Shipped to production 2026-05-11

---

## What Shipped

Three targeted fixes from the onboarding friction audit (task 2b12751e, audit commit d68705c2):

### 1. Multi-Pack Accordion (Fix 3)

The council stage accordion now opens **every pack that contains a smart-suggested (pre-seated) mind** on first render. Previously only the first pack opened, causing pre-seated minds in other packs to be invisible until the user discovered and expanded those packs manually.

- **File changed:** `website/src/app/agora/AgoraApp.tsx`
- **New helper:** `website/src/lib/agon/councilHelpers.ts` — `getInitialOpenPackIds`
- **Estimated impact:** ~10–20 s of orientation time saved per session for first-time users

### 2. 4th-Mind Cap Upsell Modal (Fix 4)

When a free user has 3 minds seated and taps a 4th mind card, an amber inline banner now appears immediately. Previously, the tap was silently ignored with only a passive footer note that most users missed.

- **Banner copy:** "Free plan seats up to 3 minds. Pro unlocks 5 minds, 100 agons/month, and Opus synthesis."
- **CTA in banner:** "Upgrade to Pro →"
- **File changed:** `website/src/app/agora/AgoraApp.tsx`

### 3. Council Helpers Module Extracted

`suggestCouncil`, `getInitialOpenPackIds`, and `getActivePacks` extracted into `website/src/lib/agon/councilHelpers.ts` as a pure library module with 20 unit tests. This makes the council-suggestion logic independently testable and reusable.

---

## Why

The onboarding friction audit identified the council stage as the highest drop-off point on the free path. Two root causes:

1. **Hidden minds** — smart-suggested minds in secondary packs were not visible on load, making the council stage feel empty and confusing.
2. **Silent rejection** — tapping a 4th mind with no feedback caused free users to assume the feature was broken rather than understanding the cap as a conversion moment.

Together these fixes reduce time-to-first-agon and convert the cap frustration moment into an explicit, actionable upgrade prompt.

Fixes 1 and 2 from the audit (clickable example topics, BYO key hidden behind a disclosure toggle) were already implemented before this PR.

---

## Live Verification Steps

After deployment, smoke-check the following:

```bash
BASE_URL=https://consultthedead.com
```

### Free path

1. Open `$BASE_URL/agora` (use a free or logged-out session).
2. Enter a topic and proceed to the council stage.
3. Confirm the pack accordion renders with at least one pack open.
4. Select 3 minds and submit — debate should complete and consensus should render.

### 4th-mind cap upsell

1. Seat exactly 3 minds in the council stage.
2. Tap any 4th mind card.
3. Confirm the amber banner appears immediately with upgrade copy.

### Multi-pack accordion

1. Enter a strategy/war topic, e.g. `"How should I respond to a price war?"`.
2. At the council stage, verify the War Room pack (Sun Tzu pre-seated) is open on first render.
3. If suggestions span multiple packs, confirm all relevant packs are open.

### Automated tests

```bash
cd website
npx vitest run \
  src/app/agora/AgoraApp.test.tsx \
  src/lib/agon/councilHelpers.test.ts \
  src/components/agora/ShareAgonPanel.test.tsx \
  src/lib/share-url.test.ts
```

Full runbook: [`docs/runbooks/agora-first-agon-smoke.md`](../runbooks/agora-first-agon-smoke.md)

---

## Known Edge Cases

| Scenario | Behavior |
|----------|----------|
| Topic has no keyword match | `suggestCouncil` falls back to the default pack's top minds; first pack opens |
| User deselects a mind after seeing cap banner | Banner clears; user can now tap a different 4th mind and see the banner again |
| Pro user | Cap check is skipped; `MAX_FREE_MINDS` guard does not trigger; up to 5 minds can be seated |
| Mobile (< 640 px) | Accordion renders as stacked cards; cap banner renders full-width below the mind grid |
| No packs in category | `getActivePacks` returns empty; accordion renders with zero open packs (no crash) |
