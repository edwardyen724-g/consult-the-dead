# Handoff: Sprint 1, Iteration 2 → 3

## Scores: Design 7, Originality 6, Craft 7, Functionality 7 (6.75 overall)
## Target: ALL at 9/10

## The Core Problem
The evaluator says: "The sidebar-list + rectangular-cards-on-canvas pattern still reads as a standard developer tool. Nothing about the interaction paradigm is uniquely Great Mind Company Builder."

Visual polish went from 5.5 to 6.75. But we're hitting a ceiling — no amount of glow effects will make a conventional UX pattern score 9 on originality. We need to break the paradigm.

## What Must Change

### 1. The Empty Canvas Must Be an Experience (Originality + Design)
When no minds are placed, the canvas should NOT be an empty void with "drag a mind here" text. Instead:
- Show a subtle constellation pattern — 12 faint stars arranged in a loose cluster, each labeled with a mind archetype name at very low opacity (15-20%)
- As the user drags a mind onto the canvas, its corresponding star brightens and the constellation shifts
- The empty state should feel like "these minds are WAITING to be summoned" not "this canvas is empty"
- This transforms the canvas from a blank sheet into a living space

### 2. Mind Nodes Need Character, Not Just Glow (Originality)
Right now all nodes look the same except for accent color. Each mind should feel DISTINCT:
- Each node should have a unique visual motif or pattern that reflects their domain:
  - Science minds (Einstein, Newton, Curie, Tesla): geometric/angular patterns, circuit-like decorations
  - Strategy minds (Sun Tzu, Machiavelli, Alexander): sharp lines, chevron motifs
  - Art/Design minds (da Vinci, Lovelace, Jobs): organic curves, spiral motifs
  - Governance minds (Cleopatra, Catherine): crown/star emblems
- This doesn't need to be complex — even a subtle CSS pattern or SVG decoration per category would differentiate

### 3. Proximity Chemistry Hints (Originality + Functionality)
When two nodes are dragged CLOSE to each other (within 200px), before any connection is made:
- A faint line or arc appears between them
- A brief chemistry hint text fades in: "Creative tension likely" or "Natural collaborators"
- This makes the spatial arrangement MEANINGFUL — closeness matters
- It teaches the user that the canvas is not just a layout tool

### 4. Remove Mind and Rearrangement Polish (Craft + Functionality)
- Right-click or X button to remove a mind from canvas (with a dismissal animation — fades to a point of light and vanishes)
- Double-click a node to center/zoom to it
- Shift+click to select multiple nodes

### 5. Fix: Duplicate React Key Warning (Craft)
When same mind is placed via both drag and click, a duplicate key warning appears. Fix the key generation.

## What Already Works Well (don't break these)
- Breathing auras with randomized phase offsets
- Color bleed pools per mind
- Placement ceremony (flash + quote)
- Custom glassmorphic role dropdown
- Canvas invitation pulse during drag
- 30 ambient particles
- Noise texture overlay
- All 12 success criteria pass

## Files to Read
- `src/components/canvas/Canvas.tsx`
- `src/components/canvas/MindNode.tsx`
- `src/components/sidebar/MindLibrary.tsx`
- `src/store/companyStore.ts`
- `src/app/globals.css`
- `.harness/evaluations/EVAL-S1-I2.md`
