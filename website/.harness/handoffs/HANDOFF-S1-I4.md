# Handoff: Sprint 1, Iteration 3 → 4

## Scores After 3 Iterations
Design 7.5 | Originality 5.5 | Craft 7 | Functionality 8 | Overall 7.10
Target: ALL at 9/10

## What Works Well
- Dark mode fully functional (14.30:1 contrast ratio)
- Mobile responsive, no overflow
- Typography rhythm applied (letter-spacing, margins)
- Spotlight/shadow perceptual lens metaphor is genuinely original
- Framer-motion animations (accordion, page entrance, staggered reveals)
- Reading progress bar
- Gm monogram + weighted wordmark

## THE CRITICAL GAP: Originality (5.5 → 9)

The evaluator says: "The page structure is still a standard Tailwind template." Specifically:
- Homepage = hero → card list (every content site since 2018)
- Framework detail = breadcrumb → description → sections → article list (standard documentation pattern)
- Article view = narrow column centered reading (Medium clone)

To reach 9/10 originality, the STRUCTURE must be different, not just the styling.

### Ideas to break the template:

**Homepage — NOT a card grid/list:**
- What if frameworks aren't cards but SPATIAL presences? Think: a dark room with pools of light, each pool is a framework. The perceptual lens metaphor could extend to the whole page — the user's cursor/scroll reveals minds in the space.
- Or: a single-page experience where each framework gets a full-height section that you scroll through, with parallax and the spotlight/shadow visual extending across the viewport.
- Or: the homepage IS one framework initially (since we only have one). Instead of showing a gallery of one item, make the entire homepage the Innovator's space — a full-screen introduction that pulls you into the framework's world.

**Framework detail — NOT sections stacked vertically:**
- The perceptual lens and constructs could be an interactive spatial layout — constructs arranged radially around the lens, or as a constellation.
- Articles could be presented as "conversations this mind has had with the world" — not a list but a visual timeline or thread.

**Article view — NOT Medium:**
- Framework-colored margin annotations showing which construct is active
- The article could scroll horizontally through sections (paradigm-breaking for reading)
- Or: a dual-column layout where the left column is the article and the right margin shows the framework's running commentary on its own reasoning

### What else needs to reach 9:

**Design (7.5 → 9):**
- The Gm monogram is too small (8x8px). Make it larger, more iconic.
- Add visual texture — the "library" metaphor needs materiality (subtle paper grain, shadow depth, shelf-like elements).
- With only 1 framework, the homepage should feel intentionally curated, not empty.

**Craft (7 → 9):**
- Remove ALL remaining `dark:` Tailwind classes that reference now-redundant colors (grep for `dark:hover:text-accent-dark`, `dark:bg-border-dark`, `dark:hover:shadow-2xl`, etc.)
- Fix the `overflow-x-hidden` on body — find and fix the actual overflowing element
- Add visible focus states for keyboard navigation (`:focus-visible` with accent outline)
- Clean up any `text-muted/60/60` or `text-muted/50/50` malformed Tailwind classes

**Functionality (8 → 9):**
- Add a subtle page transition between routes (not just entrance animation)
- Keyboard accessibility: all interactive elements focusable with visible focus ring
- Mobile: tap targets at least 44px

## Files to Read First
- `src/components/HomeClient.tsx` — homepage, needs structural reimagining
- `src/components/FrameworkDetailClient.tsx` — framework page
- `src/components/ArticleClient.tsx` — article reading view
- `src/app/globals.css` — theme system
- `.harness/evaluations/EVAL-S1-I3.md` — full evaluation with specifics

## Current App State
- Frontend: running at http://localhost:3000
- All 9 success criteria passing
- 1 framework, 2 articles
