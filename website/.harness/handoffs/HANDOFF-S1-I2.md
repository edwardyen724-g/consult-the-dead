# Handoff: Sprint 1, Iteration 1 → 2

## What Was Built
- Next.js 16 App Router + Tailwind CSS + next-themes
- Homepage ("The Library") with framework gallery
- Framework detail page with expandable constructs
- Article reading view (680px, Newsreader + Source Sans 3)
- Dark/light mode with system preference
- Legal disclaimer footer
- 1 framework ("The Innovator") + 2 seed articles

## What Works
All 9 functional success criteria pass. Navigation, theme persistence, mobile responsiveness, zero console errors.

## What Failed (Evaluator Critique — Steve Jobs Framework Lens)

### CRITICAL: Dark Mode Article Contrast (Craft failure)
- Article body text in dark mode is nearly invisible
- The `text-ink/90 dark:text-ink-light/90` class produces dangerously low contrast
- **Fix:** Change to `dark:text-ink-light` (full opacity) or ensure computed color meets WCAG AA (4.5:1 ratio against #161616 background)
- Screenshot: `tests/screenshots/09-dark-mode-article.png`

### HIGH: Zero Brand Identity (Design failure)
- Header is plain text "Great Minds" + theme toggle. No mark, no distinctive wordmark treatment
- Framework cards use a tiny 3px colored dot as their only visual differentiator — "an afterthought, not a design decision"
- **Fix:** Add a distinctive visual identity element to the header. Give frameworks richer visual treatment — larger accent elements, perhaps a subtle pattern or visual motif per archetype

### HIGH: Indistinguishable from Template (Originality: 4/10)
- Layout is the canonical header → hero → card grid → detail page pattern
- Card hover effects are the most common Tailwind pattern
- Collapsible constructs use raw `<details>` with `+` icon — default FAQ component
- Article view is standard Medium-style layout
- **Fix:** Break away from template conventions. The "perceptual lens" concept (notice first / ignore) is intellectually interesting but rendered as plain bordered boxes — this should use a visual metaphor (lens, spotlight, filter). The theme names ("The Reading Room" / "The Late Study") are charming but hidden in title attributes nobody sees — surface them.

### MEDIUM: Empty Library (Design failure)
- One framework + two articles makes the product feel like a skeleton
- "A well-built container with almost nothing in it"
- **Fix:** The homepage needs to feel inhabited. Consider visual weight, editorial intro, or atmospheric elements that communicate depth even with limited content.

### MEDIUM: Craft Shortcuts
- Footer disclaimer is unstyled 12px plain text — "a legal afterthought"
- `<details>` snap open without animation — feels jarring
- No letter-spacing adjustment for body text at 19px
- No vertical rhythm variation (heading-to-paragraph vs paragraph-to-paragraph)
- **Fix:** Animated expand/collapse. Proper expand icon (not `+` character). Subtle letter-spacing (-0.01em). Distinct spacing rhythm.

## Target Scores for This Iteration
The user wants ALL dimensions at 9/10. This means:
- Design: Must be "exceptional, distinctive aesthetic that elevates the product"
- Originality: Must have "innovative design choices that set it apart" — NOT a template
- Craft: Must be "museum quality — every pixel deliberate"
- Functionality: Must be "flawless with delightful micro-interactions"

## Files to Read First
- `C:/projects/greatminds/website/src/app/page.tsx` (homepage)
- `C:/projects/greatminds/website/src/app/frameworks/[id]/page.tsx` (framework detail)
- `C:/projects/greatminds/website/src/app/articles/[id]/page.tsx` (article reading)
- `C:/projects/greatminds/website/src/app/globals.css` (theme tokens + typography)
- `C:/projects/greatminds/website/src/components/Header.tsx`
- `C:/projects/greatminds/website/src/components/Footer.tsx`
- `C:/projects/greatminds/website/tailwind.config.ts` (design tokens)

## Current App State
- Frontend: running at http://localhost:3000 via `npm run dev`
- No backend API yet (Sprint 2)
- Content: file-based, `/content/frameworks/` and `/content/articles/`
