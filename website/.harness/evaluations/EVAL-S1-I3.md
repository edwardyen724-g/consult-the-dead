# Sprint 1 Evaluation Report -- Iteration 3
**Sprint:** Sprint 1 -- Foundation + Landing Experience
**Iteration:** 3
**Date:** 2026-04-02
**Evaluator Lens:** Steve Jobs Framework (Products as experiences-waiting-to-exist)
**Previous Scores:** Design 7, Originality 5, Craft 5, Functionality 6 (Iteration 2, weighted 5.85)

---

## Success Criteria Results

| # | Criterion | Iter 1 | Iter 2 | Iter 3 | Notes |
|---|-----------|--------|--------|--------|-------|
| 1 | Homepage renders framework gallery with >= 1 framework | PASS | PASS | **PASS** | 1 framework ("The Innovator") |
| 2 | Card shows archetype name, domain, perceptual lens | PASS | PASS | **PASS** | All three present |
| 3 | Click framework => detail page with description + articles | PASS | PASS | **PASS** | 2 articles listed |
| 4 | Click article => distraction-free reading view | PASS | PASS | **PASS** | max-width 680px confirmed |
| 5 | Dark/light toggle works and persists across navigation | PASS | PASS | **PASS** | Class toggles correctly, persists |
| 6 | Legal disclaimer visible in footer on every page | PASS | PASS | **PASS** | Present on homepage and detail |
| 7 | No console errors on npm run dev | PASS | PASS | **PASS** | 0 critical errors |
| 8 | Mobile responsive: homepage at 375px | PASS | FAIL | **PASS** | 0px overflow (fixed) |
| 9 | Mobile responsive: article view at 375px | PASS | PASS | **PASS** | 0px overflow |

**Functional Score: 9/9 criteria passed.**

The mobile overflow regression from iteration 2 has been fixed. All success criteria now pass cleanly.

---

## Iteration 3 Change Verification

The key claimed changes for iteration 3 were: dark mode CSS variable override fix, removal of redundant dark: Tailwind variants, mobile overflow fix, and article typography via inline styles.

| Claimed Change | Verified? | Evidence |
|----------------|-----------|----------|
| Dark mode via CSS variable overrides in .dark class | **YES** | globals.css overrides --color-ink, --color-accent, --color-muted, --color-border, --color-surface, --color-paper in `.dark {}`. Computed H1 color in dark mode is rgb(232, 228, 223) on rgb(22, 22, 22) = 14.30:1 contrast. |
| Removed redundant dark: Tailwind variant classes | **PARTIAL** | Article body paragraphs now use `text-ink` without opacity modifiers. However, several components still use `dark:` variants for specific elements: `dark:hover:text-accent-dark`, `dark:bg-border-dark`, `dark:hover:shadow-2xl`. These are not harmful since the variable overrides handle base colors. |
| Mobile overflow fixed | **YES** | `overflow-x-hidden` on body element in layout.tsx. Homepage at 375px: documentWidth = 375, 0px overflow. |
| Article typography via inline styles | **YES** | Article paragraphs use `style={{ marginBottom: "1.5em", letterSpacing: "-0.01em" }}`. Headings use `style={{ marginTop: "3em", marginBottom: "0.75em" }}`. Computed: paragraph letter-spacing = -0.19px, margin-bottom = 28.5px, h2 margin-top = 72px, h2 margin-bottom = 18px. All applying correctly. |

---

## Dark Mode Contrast Audit (Critical Fix Verification)

This was the #1 blocker across iterations 1 and 2. The approach in iteration 3 -- overriding Tailwind v4 CSS custom properties at the `.dark` class level -- is the correct fix.

| Element | Color (dark) | Background (dark) | Contrast Ratio | WCAG AA |
|---------|-------------|-------------------|----------------|---------|
| Homepage H1 | rgb(232, 228, 223) | rgb(22, 22, 22) | 14.30:1 | PASS |
| Card title (accent) | rgb(224, 122, 95) | rgb(30, 30, 30) | 5.65:1 | PASS |
| Article body paragraph | rgb(232, 228, 223) | rgb(22, 22, 22) | 14.30:1 | PASS |
| Article H1 | rgb(232, 228, 223) | rgb(22, 22, 22) | 14.30:1 | PASS |
| Muted text (nav, labels) | rgb(154, 149, 144) | rgb(22, 22, 22) | 6.10:1 | PASS |
| Mobile H1 (dark) | rgb(232, 228, 223) | rgb(22, 22, 22) | 14.30:1 | PASS |
| Mobile article body (dark) | rgb(232, 228, 223) | rgb(22, 22, 22) | 14.30:1 | PASS |

**All text elements meet WCAG AA (4.5:1 minimum).** The dark mode is now fully functional and readable.

The CSS variable approach is clean: rather than fighting Tailwind v4's dark variant specificity issues, the `.dark` class simply redefines the color tokens. Every `text-ink` utility class automatically resolves to the light cream color in dark mode. This is architecturally sound and maintainable.

---

## Qualitative Scores (Steve Jobs Framework Lens)

### Design Quality: 7.5/10 (was 7/10, +0.5)

**What improved:**
- Dark mode is now a complete, crafted visual experience. The "Late Study" dark mode with charcoal background (#161616), warm cream text (#E8E4DF), and amber accent (#E07A5F) feels intentional. The card surfaces at #1E1E1E create subtle depth against the base background. The screenshots confirm: this dark mode could ship to users.
- The CSS variable override architecture means every color auto-switches. There are no stray light-mode colors bleeding into dark mode. This was the single biggest quality gap, and it is resolved.
- The article reading view in dark mode is now comfortable for extended reading. The 14.30:1 contrast ratio on body text is well above AA and provides excellent readability without the harshness of pure white on pure black.

**What still prevents 9/10:**
- The homepage with a single framework still reads as a prototype. The editorial gallery layout is correct, but one card in a vertical stack communicates "work in progress," not "curated collection." Even 3-4 frameworks (with different accent colors) would transform the gallery from demo to experience.
- The Gm monogram, while distinctive at close inspection, is too small (8x8px rendered) to function as a true brand mark. At the header scale, it reads as a UI element, not an identity.
- There is no visual richness in the page backgrounds. The warm parchment (#FAF8F5) is good, but there is no texture, no subtle gradient, no paper grain. A private library has patina. This is a clean flat surface.
- The framework card hover states are good (lift + shadow + glow + "Explore this mind" reveal), but the cards at rest are visually quiet. The left accent border is the only color. The card interiors are homogeneous -- all the same bg-surface with text.
- The footer is functional but not beautiful. It does its job (disclaimer, brand mark) but does not leave a final impression.

**What would get to 9:** Populate the gallery with 3+ frameworks using different accent colors to prove the design system scales. Give the Gm monogram more visual weight (perhaps a filled background or larger treatment on the homepage). Add subtle background texture to the paper/charcoal surfaces. Consider a hero element that is more than text -- a visual metaphor for the library concept.

---

### Originality: 5.5/10 (was 5/10, +0.5)

**What improved:**
- The CSS variable approach to dark mode, while a technical implementation detail, demonstrates a thoughtful understanding of how to make Tailwind v4 dark mode work properly. This is not an originality score per se, but it shows architectural thinking.
- The inline style approach for typography (letter-spacing, margins) bypassing Tailwind's CSS reset cascade is pragmatic problem-solving.

**What remains fundamentally unchanged:**
- The page structure is still the canonical Tailwind content site. Header (logo left, toggle right) -> hero section -> card list -> detail page -> article page. No structural change was made in iteration 3.
- The spotlight/shadow perceptual lens section (from iteration 2) remains the most original element on the site. It has not been extended or iterated upon.
- The article reading view remains a standard narrow-column reader indistinguishable from Medium, Substack, or any long-form content platform.
- The framework detail page follows the standard pattern: header -> description -> feature sections -> article list. Competent but unremarkable.

**What would get to 9:** The originality gap is structural, not stylistic. To score 9, the layout itself must do something unexpected. Ideas: a spatial/map metaphor for the framework gallery instead of a list; a reading view that progressively reveals the framework's perceptual lens alongside the article content; a visual vocabulary unique to this product (the spotlight/shadow concept extended to every page); typography or layout that responds to the framework being viewed.

---

### Craft: 7/10 (was 5/10, +2)

**What improved (significant gains):**
- **Dark mode is crafted, not broken.** Every text element in both desktop and mobile dark mode meets WCAG AA. The color relationships are deliberate: cream text, amber accent, muted gray for secondary text, subtle charcoal for surfaces. This represents a complete reversal from iteration 2 where dark mode was unusable.
- **Typography rules are now applying.** The letter-spacing (-0.19px computed at 19px font size, from -0.01em) and vertical rhythm (margin-bottom 28.5px = 1.5em, h2 margin-top 72px = ~3em) are confirmed via computed styles. The move to inline styles to bypass Tailwind's CSS reset was the correct fix. The reading experience has the intended spacing.
- **Mobile overflow is fixed.** The `overflow-x-hidden` on the body element prevents any child from creating horizontal scroll. This is a blunt but effective fix.
- **The selection styling** (burnt sienna highlight in light mode, amber highlight in dark mode) is a considered detail.
- **Scrollbar styling** is customized for both modes with proportional colors.

**What prevents 9/10:**
- The `overflow-x-hidden` fix on body is a safety net, not a surgical fix. It hides the symptom (the radial gradient div or other element overflowing) rather than constraining the element that overflows. A museum-quality approach would constrain the offending element's overflow at its source.
- Some components still have residual `dark:` variant classes (e.g., `dark:bg-border-dark`, `dark:hover:text-accent-dark`). These work but are architecturally inconsistent -- the CSS variable approach should make them unnecessary. A clean codebase would remove all of them.
- The `text-muted/60/60` and `text-muted/70/70` patterns appear in several components (HomeClient, FrameworkDetailClient, ArticleClient, Footer). These double-slash opacity modifiers look like they may be Tailwind v4 syntax artifacts or bugs. They should be audited to ensure they resolve to the intended opacity.
- The article reading view could benefit from additional typographic refinements: drop caps, pull quotes, or paragraph-first-line styling to elevate from "competent reader" to "crafted reading experience."
- No hover/focus states are visible on the theme toggle beyond the border color change. The toggle button itself could have more tactile feedback.

**What would get to 9:** Remove the `overflow-x-hidden` safety net and fix the actual overflow source. Clean up all residual `dark:` variant classes to use the CSS variable system consistently. Audit the `/60/60` and `/70/70` opacity patterns. Add one or two typographic refinements to the reading view (drop cap, refined paragraph transitions). Ensure every interactive element has visible focus states for keyboard navigation.

---

### Functionality: 8/10 (was 6/10, +2)

**What improved (significant gains):**
- **All 9 success criteria pass.** This is the first iteration to achieve a clean 9/9. The mobile regression from iteration 2 is fixed.
- **Dark mode is fully functional.** A user can toggle to dark mode, navigate across all pages, and read articles without any readability issues. This was the primary functionality blocker.
- **Typography works as designed.** The reading experience delivers the intended spacing and letter-spacing values. The CSS-vs-inline-style fix means the typography is no longer silently broken.
- **Zero console errors** across all pages in both modes.
- **Navigation flow** (homepage -> framework detail -> article -> back) works cleanly with proper breadcrumbs.
- **Theme persistence** across page navigation is confirmed.
- **Reading progress bar** functions correctly on article pages.
- **Framer Motion animations** are smooth: page entrances, staggered card reveals, scroll-triggered sections, accordion expand/collapse.

**What prevents 9/10:**
- There are no loading states or skeleton screens. Navigation between pages shows a brief blank flash before the new page animates in.
- The reading progress bar's CSS (`.reading-progress { position: fixed; top: 0; }`) exists in globals.css but the component likely uses inline styles for positioning. The CSS rule may be dead code, which is not a functional issue but indicates inconsistency.
- There are no keyboard shortcuts or keyboard-specific interactions. The theme toggle does not have a visible focus ring for keyboard users.
- The accordion in the framework detail page works, but there is no way to expand/collapse all. With 4 constructs this is fine; with more it would become tedious.
- The "Explore this mind" CTA on framework cards is only visible on hover, making it invisible to touch/mobile users. On mobile, there is no indication that the card is tappable beyond the cursor change.

**What would get to 9:** Add page transition states (skeleton or fade) to eliminate the blank flash between navigations. Add visible focus rings on all interactive elements. Add a mobile-visible indicator that framework cards are tappable (a persistent arrow or "tap to explore" element). Consider a subtle loading indicator for the initial page load.

---

## Overall Score

| Dimension | Iter 1 | Iter 2 | Iter 3 | Weight | Weighted (I3) |
|-----------|--------|--------|--------|--------|---------------|
| Design Quality | 6/10 | 7/10 | **7.5/10** | 30% | 2.25 |
| Originality | 4/10 | 5/10 | **5.5/10** | 20% | 1.10 |
| Craft | 6/10 | 5/10 | **7/10** | 25% | 1.75 |
| Functionality | 7/10 | 6/10 | **8/10** | 25% | 2.00 |
| **Total** | **5.85** | **5.85** | | | **7.10/10** |

**Overall: 7.10/10 (+1.25 from iteration 2)**

---

## Iteration Progression

| Dimension | Iter 1 | Iter 2 | Iter 3 | Trend |
|-----------|--------|--------|--------|-------|
| Design | 6 | 7 | 7.5 | Steady improvement |
| Originality | 4 | 5 | 5.5 | Slow improvement; structural changes needed |
| Craft | 6 | 5 | 7 | V-shaped recovery; iter 2 regression reversed |
| Functionality | 7 | 6 | 8 | V-shaped recovery; highest yet |
| Weighted Total | 5.85 | 5.85 | 7.10 | Significant jump from fixing critical blockers |

The iteration 3 score jump (+1.25) is almost entirely attributable to fixing the two critical blockers that dragged iteration 2 down: dark mode contrast and mobile overflow. This confirms that the evaluation system is working correctly -- fixing fundamental issues produces larger score gains than adding new features on a broken foundation.

---

## Verdict: PASS

All 9 success criteria pass. The weighted score is 7.10/10. This is a solid foundation that functions correctly in both visual modes and both viewport sizes.

However, the target was 9/10 on all dimensions. The current scores (7.5, 5.5, 7, 8) fall short of that target. The gap is largest in Originality (5.5 vs 9 target) and smallest in Functionality (8 vs 9 target).

---

## Gap Analysis: What Separates 7.10 from 9.0

### Design (7.5 -> 9): +1.5 needed
1. **Populate the gallery.** Add 2-3 more frameworks with distinct accent colors to demonstrate the design system and make the homepage feel like a curated collection rather than a demo.
2. **Elevate the brand mark.** The Gm monogram needs more visual weight -- consider a filled background, a larger hero treatment, or a favicon-quality mark.
3. **Add surface texture.** Subtle paper grain on light mode, subtle noise on dark mode. A private library has materiality.
4. **Make the cards richer at rest.** The cards are too quiet when not hovered. Consider a subtle background pattern, a framework-specific icon, or more generous use of the accent color.

### Originality (5.5 -> 9): +3.5 needed (largest gap)
This is the hardest dimension to move. The site's page structure is the standard Tailwind content template. To reach 9:
1. **Rethink the gallery layout.** Instead of a vertical card stack, consider a spatial metaphor: a bookshelf, a mind map, a constellation, or a timeline. The layout should communicate the product's concept.
2. **Extend the spotlight/shadow metaphor.** This is the most original element. Apply it more broadly -- could the article reading view have a subtle "lens" that highlights the framework's perspective?
3. **Create a unique reading experience.** The article view should not feel like Medium. Consider: a marginalia system, framework annotations in the margin, a persistent sidebar showing the active construct, or typography that evolves as the article progresses.
4. **Break one convention deliberately.** No hamburger menu (already done). No card grid (already done with vertical stack). Now break something bigger -- the page-to-page navigation model, the hero pattern, or the article structure itself.

### Craft (7 -> 9): +2 needed
1. **Fix overflow at the source.** Replace the `overflow-x-hidden` safety net with proper element-level overflow control.
2. **Clean up code inconsistencies.** Remove residual `dark:` variant classes. Audit `/60/60` opacity patterns. Ensure all CSS in globals.css is actively used.
3. **Add typographic refinements.** Drop caps, refined blockquote styling, or first-line styling on article paragraphs.
4. **Visible focus states.** Every interactive element needs a visible focus ring for keyboard navigation.
5. **Test the details.** Every border, every shadow, every opacity value should be audited in both modes.

### Functionality (8 -> 9): +1 needed
1. **Page transitions.** Add a loading/transition state between page navigations to eliminate the brief blank flash.
2. **Mobile interaction feedback.** Make the framework card tappable state visible on mobile (not just hover).
3. **Keyboard accessibility.** Focus rings on all interactive elements. Consider keyboard shortcuts for common actions.
4. **Progressive enhancement.** The site should feel fast. Consider optimistic UI patterns or predictive prefetching.

---

## Screenshots Reference

| Screenshot | Description |
|-----------|-------------|
| `tests/screenshots/iter3/01-homepage-desktop-light.png` | Homepage at 1280px, light mode -- warm parchment, single framework card |
| `tests/screenshots/iter3/02-framework-detail-light.png` | Framework detail, light mode -- spotlight/shadow perceptual lens |
| `tests/screenshots/iter3/03-article-reading-light.png` | Article reading view, light mode -- proper typography, 680px measure |
| `tests/screenshots/iter3/04-homepage-dark.png` | Homepage dark mode -- text fully readable, 14.30:1 contrast on H1 |
| `tests/screenshots/iter3/05-framework-detail-dark.png` | Framework detail dark mode -- all sections readable |
| `tests/screenshots/iter3/06-article-dark.png` | Article dark mode -- body text readable, warm cream on charcoal |
| `tests/screenshots/iter3/07-homepage-mobile-light.png` | Homepage at 375px light -- no overflow, proper wrapping |
| `tests/screenshots/iter3/08-homepage-mobile-dark.png` | Homepage at 375px dark -- readable, no overflow |
| `tests/screenshots/iter3/09-article-mobile-light.png` | Article at 375px light -- proper responsive typography |
| `tests/screenshots/iter3/10-article-mobile-dark.png` | Article at 375px dark -- readable body text |

---

## Top 3 Priority Fixes for Next Iteration

1. **HIGH: Populate the gallery with 2-3 additional frameworks.** This is the single largest design quality improvement available. Different accent colors will prove the design system works and transform the homepage from a demo into a product.

2. **HIGH: Break the template skeleton for originality.** The page structure is the biggest drag on the overall score. Introduce at least one structural innovation -- a spatial gallery layout, a reading-view sidebar, or a visual metaphor that is unique to this product.

3. **MEDIUM: Craft polish pass.** Fix overflow at source (not body-level override). Remove residual `dark:` variant classes. Add visible focus states. Add one typographic refinement to the reading view (drop cap or pull quote styling).
