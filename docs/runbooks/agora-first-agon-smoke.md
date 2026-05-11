# Smoke Runbook: Agora First-Agon (Onboarding-Fix Follow-Up)

**Feature area:** `/agora` — free path, multi-pack accordion, 4th-mind cap upsell, council helpers  
**Key PR:** #115 (onboarding friction fixes — multi-pack accordion, cap upsell, `councilHelpers.ts`)  
**Date:** 2026-05-11

---

## Overview

This runbook verifies the post-PR#115 Agora free path end-to-end and the two new friction-reduction surfaces:

1. **Free-tier end-to-end path** — pick pack → pick minds → enter topic → get response
2. **4th-mind cap upsell** — amber banner when a free user taps a 4th mind at the 3-mind cap
3. **Multi-pack accordion** — packs containing pre-seated (smart-suggested) minds open automatically on first render

Run this runbook after any deployment that touches `website/src/app/agora/`, `website/src/lib/agon/councilHelpers.ts`, or `website/src/components/agora/`.

---

## Pre-flight

```bash
# Local
cd website
npm run dev
# Navigate to http://localhost:3000/agora

# Production
BASE_URL=https://consultthedead.com
```

Use a **free-tier account** (or log out to exercise the unauthenticated/free guest path) for cap-upsell checks.

---

## 1 — Free-Tier End-to-End Path

### What to verify

The complete happy path for a free user: from landing on `/agora` to receiving a consensus response.

### Steps

1. Navigate to `/agora`.
2. Confirm the **topic input** is visible and focused (or can be clicked into).
3. Enter a topic, e.g. `"How do I find product-market fit?"`.
4. Proceed to the **council stage**. Confirm pack accordion renders.
5. Select exactly **3 minds** from any packs.
6. Submit and wait for the debate to complete.
7. Confirm the **consensus stage** renders with all three council sections: Consensus Points, Live Tensions, Recommended Action.

### Accept criteria

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Topic input | Visible on `/agora` load; placeholder text present |
| 2 | Council stage transition | Clicking into the topic and proceeding renders the pack accordion |
| 3 | Mind selection | 3 minds can be selected (cards toggle to a selected state) |
| 4 | Agon submission | Submit button becomes active with 3 minds selected |
| 5 | Streaming response | Debate rounds stream in without console errors |
| 6 | Consensus rendered | All three consensus sections visible on completion |
| 7 | Share button | "Share Result" button is active at the ConsensusStage |

### URL flow

```
/agora                (topic entry)
  → /agora            (council stage — same route, next step in client state)
  → /agora            (agon streaming)
  → /agora/a/<id>     (optional: after "Save to Library" for Pro users)
```

The free path does not automatically create a public share page — that is a Pro feature. The "Share Result" button copies a plain-text payload to clipboard.

---

## 2 — 4th-Mind Cap Upsell

### What it is

When a free user has 3 minds already seated and taps a 4th mind card, an amber inline banner replaces the passive footer note. This is the PR#115 "Fix 4" change.

### Steps

1. Go to `/agora` and navigate to the council stage.
2. Select exactly 3 minds — all three should show as seated/selected.
3. Tap any **4th mind card** that is not already selected.
4. Confirm the amber upsell banner appears immediately.

### Accept criteria

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Banner triggers | Amber banner appears immediately on 4th mind tap |
| 2 | Banner copy | "Free plan seats up to 3 minds. Pro unlocks 5 minds, 100 agons/month, and Opus synthesis." |
| 3 | Upgrade CTA | "Upgrade to Pro →" link visible inside the banner |
| 4 | 4th mind not seated | The tapped 4th mind card does NOT enter a selected state |
| 5 | Existing 3 minds unaffected | Previously selected minds remain seated |
| 6 | Banner dismissal | If user deselects a mind, the banner clears (or banner is only shown once) |

### Regression tests

```bash
cd website
npx vitest run src/app/agora/AgoraApp.test.tsx
```

---

## 3 — Multi-Pack Accordion

### What it is

PR#115 "Fix 3": the council stage accordion now opens **every pack that contains a smart-suggested (pre-seated) mind** on first render. Previously only the first pack opened, leaving pre-seated minds in other packs invisible until the user manually opened those packs.

### Steps

1. Navigate to `/agora`.
2. Enter a topic that maps to a non-default pack, e.g. a strategy/war topic: `"How should I respond to a price war?"`.
3. Proceed to the council stage.
4. Observe which accordion sections are open on initial render.

### Accept criteria

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Suggested minds visible | Any pack containing a smart-suggested mind is open by default |
| 2 | Multiple packs open | If suggestions span more than one pack, all relevant packs are expanded |
| 3 | Non-suggested packs | Packs without suggested minds may remain closed — no regression |
| 4 | Manual toggle | User can collapse open packs and expand closed packs normally |
| 5 | Topic: "strategy" | War Room pack (Sun Tzu pre-seated) is open on first render |

### Regression tests

```bash
cd website
npx vitest run src/lib/agon/councilHelpers.test.ts
```

Covers: `getInitialOpenPackIds`, `suggestCouncil`, `getActivePacks`, keyword scoring, fallback fill path, edge cases.

---

## 4 — Full Regression Suite

```bash
cd website
npx vitest run \
  src/app/agora/AgoraApp.test.tsx \
  src/lib/agon/councilHelpers.test.ts \
  src/components/agora/ShareAgonPanel.test.tsx \
  src/lib/share-url.test.ts
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Topic input not visible | Page rendered before client hydration | Hard refresh; check `AgoraApp.tsx` for early return conditions |
| Council stage never appears | Topic submit handler broken | Check browser console for errors in `AgoraApp.tsx` submit path |
| 4th-mind banner missing | Cap logic not triggered | Verify `selectedMinds.length >= 3` check in `AgoraApp.tsx`; check `MAX_FREE_MINDS` constant |
| All packs collapsed on load | `getInitialOpenPackIds` returning empty | Check `councilHelpers.ts` — ensure suggested mind pack IDs are included |
| Accordion won't open | Click handler broken | Inspect the accordion component for event propagation issues |
| Debate never completes | `/api/chat` streaming error | Check Vercel function logs; confirm `OPENAI_API_KEY` / model env vars |
| Share button greyed out at consensus | Consensus object null | Check `/api/agora/stream` response and consensus parsing in `AgoraApp.tsx` |

---

## Rollback: How to Revert PR#115

If PR#115 introduces a critical regression (e.g., accordion blocks agon submission, cap upsell crashes the page), revert via GitHub:

```bash
# 1. Create a revert branch from master
git checkout -b fix/revert-pr115 origin/master

# 2. Revert the merge commit for PR#115
#    Find the merge commit SHA:
git log --oneline origin/master | grep "onboarding friction"
#    Example output: a56770e feat(agora): onboarding friction fixes (#115)

git revert -m 1 a56770e

# 3. Push and open a PR
git push -u origin fix/revert-pr115
gh pr create --title "revert: undo PR#115 onboarding friction fixes" --body "Emergency revert of #115 due to: <describe issue>"
```

**What the revert restores:**
- Accordion reverts to opening only the first pack
- 4th-mind tap silently ignores without showing the cap upsell banner
- `councilHelpers.ts` is removed (logic returns inline to `AgoraApp.tsx`)

**What is NOT reverted by this rollback:**
- Any subsequent PRs that imported from `councilHelpers.ts` — check for follow-on imports before merging the revert.
