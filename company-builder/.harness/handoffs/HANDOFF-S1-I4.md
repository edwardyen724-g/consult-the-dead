# Handoff: Sprint 1, Iteration 3 → 4

## Scores: Design 7.5, Originality 7, Craft 7.5, Functionality 7.5 (7.375 overall)
## Target: ALL at 9/10

## The Evaluator's Core Insight: "Opacity Cowardice"
All three original concepts from iter 3 exist in code but are hidden behind opacity values of 0.04-0.2. In screenshots they're nearly invisible. The features need to be SEEN, not sensed.

## Surgical Fixes (3 changes that could reach 9)

### Fix 1: Make Ghost Constellation VISIBLE (Design + Originality)
Current: ghost dots at 12% opacity, names at 12% → barely visible
Fix:
- Ghost dots: 25-35% opacity with a subtle glow (box-shadow in accent color)
- Ghost names: 18-25% opacity
- During drag: brighten to 50-60% (currently 30%)
- The dragged mind's ghost: 80% with strong halo
- The constellation should be the FIRST thing you notice on an empty canvas

### Fix 2: Place Minds at Ghost Positions (Design + Originality + Craft)
Current: clicking a mind in sidebar places it on a rigid 3x2 grid
Fix: when placing a mind, position it at (or near) its ghost constellation position
- This creates a seamless transition: ghost brightens → dissolves → real node materializes in same spot
- The constellation becomes a LAYOUT GUIDE, not just decoration
- If the user drags (not clicks), they still choose their own position

### Fix 3: Make Domain Motifs and Chemistry Arcs Visible (Craft + Originality)
Current: domain patterns at 3-4.5% opacity (imperceptible), chemistry arcs are thin whispers
Fix:
- Domain motifs: 8-12% opacity (still subtle but perceptible on close inspection)
- Chemistry arcs: thicker stroke (2-3px instead of 1px), higher opacity on the text
- Add a subtle tooltip or onboarding hint: "Move minds closer to discover their chemistry"
- The arcs should be visible enough to make the user curious

### Fix 4: Polish Details
- When a mind is placed at its ghost position, the other ghosts should subtly rearrange/tighten
- Add a gentle intro animation when the canvas first loads (ghosts fade in staggered over 1-2s)
- The "Deployed" indicator in sidebar should be more prominent

## Files to Modify
- `src/components/canvas/Canvas.tsx` — ghost opacity values, placement logic
- `src/components/canvas/MindNode.tsx` — domain motif opacity
- `src/store/companyStore.ts` — placement position logic (use ghost coords)
- `src/data/chemistry.ts` — no changes needed (data is fine)

## What NOT to Change
- The breathing auras, color bleed, particles, ceremony — all working well
- Custom dropdown — working well
- Node removal ceremony — working well
