# Sprint 1 Evaluation Report -- Iteration 2
**Sprint:** Sprint 1 -- Foundation + Landing Experience
**Iteration:** 2
**Date:** 2026-04-02
**Evaluator Lens:** Steve Jobs Framework (Products as experiences-waiting-to-exist)
**Previous Scores:** Design 6/10, Originality 4/10, Craft 6/10, Functionality 7/10 (Overall: 5.85)

---

## Success Criteria Results

| # | Criterion | Iter 1 | Iter 2 | Notes |
|---|-----------|--------|--------|-------|
| 1 | Homepage renders framework gallery with >= 1 framework | PASS | **PASS** | |
| 2 | Card shows archetype name, domain, perceptual lens | PASS | **PASS** | |
| 3 | Click framework => detail page with description + articles | PASS | **PASS** | |
| 4 | Click article => distraction-free reading view | PASS | **PASS** | |
| 5 | Dark/light toggle works and persists across navigation | PASS | **PASS** | |
| 6 | Legal disclaimer visible in footer on every page | PASS | **PASS** | |
| 7 | No console errors on npm run dev | PASS | **PASS** | Zero errors |
| 8 | Mobile responsive: homepage at 375px | PASS | **FAIL** | Horizontal overflow detected |
| 9 | Mobile responsive: article view at 375px | PASS | **PASS** | |

**Functional Score: 8/9 criteria passed.**

Criterion 8 regressed. The mobile homepage at 375px now has horizontal overflow that did not exist in iteration 1. This is likely caused by the new card styling (4px accent border + radial glow absolutely-positioned element) or the diamond monogram in the header. This is a regression that must be fixed.

---

## Iteration 2 Change Verification

The Generator claimed five categories of changes. Here is what was verified:

| Claimed Change | Verified? | Evidence |
|----------------|-----------|----------|
| Dark mode contrast: removed /90 opacity | **NOT FIXED** | Article body still uses class `text-ink/90 dark:text-ink-light`. The dark mode article text renders as nearly invisible. Screenshot `08-article-dark.png` shows body text is unreadable against dark background. The H1 on the homepage in dark mode renders as rgb(26,26,26) on rgb(22,22,22) -- completely invisible. |
| Gm monogram in rotated diamond | **YES** | Monogram renders with `Gm` text inside a `rotate-45` bordered container. Diamond rotates on hover to 50deg. |
| Weighted wordmark (Great bold + Minds light) | **PARTIAL** | "Great" uses `font-semibold` (600) and "Minds" uses `font-light` (300). The test flagged `weighted_wordmark` as missing because the semibold span content is "Great" but the test looked for `font-semibold` class specifically within the header link, which exists. The weight contrast is present. |
| 4px accent borders on cards | **YES** | Cards have `borderLeftWidth: 4px` in accent color (#C45D3E). |
| Radial accent glow on cards | **YES** | A radial-gradient div exists inside each card with opacity transitions on hover. |
| Spotlight/shadow spatial metaphor for perceptual lens | **YES** | Framework detail page has a 2-column grid with "In sharp focus" (spotlight with radial glow) and "In the periphery" (shadow with diagonal lines). Custom SVG icons for each side (concentric circles vs dashed circle). |
| Editorial single-column gallery | **YES** | Frameworks render as `space-y-8` vertical stack, not a grid. |
| Framer-motion page transitions | **YES** | All pages use `motion.div` with initial/animate for fade+slide entrance. |
| SVG chevron with rotation animation | **YES** | Accordion uses `motion.span` with `rotate: 180` animation on the SVG chevron. |
| Framer-motion accordion | **YES** | `AnimatePresence` with height/opacity animation on expand/collapse. Smooth. |
| -0.01em letter-spacing on article body | **NOT VERIFIED** | The CSS rule `.article-body p { letter-spacing: -0.01em; }` exists in `globals.css` but computed style reports `normal`. This may be a specificity or cascade issue where the rule is not taking effect. |
| Distinct vertical rhythm | **NOT WORKING** | CSS rules exist in `globals.css` for `.article-body h2` (margin-top: 3em, margin-bottom: 0.75em) and `.article-body p` (margin-bottom: 1.5em), but computed values report 0px for all margins. The rules are not being applied -- likely overridden by Tailwind reset or not reaching the elements. |
| Reading progress bar | **YES** | Fixed-position bar at top of article pages, updates on scroll. Width reaches ~48% at half-scroll. |
| Staggered entrance animations | **YES** | Homepage framework cards use `staggerChildren: 0.12` with individual `y: 20` to `y: 0` transitions. |
| Scroll-triggered reveals | **YES** | Framework detail sections wrapped in `ScrollReveal` component using `whileInView`. |
| Card hover lift+glow | **YES** | Cards have `hover:-translate-y-0.5` and `hover:shadow-lg` with `transition-all duration-500`. |
| Redesigned footer | **YES** | Footer has HR separator, serif brand text with weight contrast, tagline ("A Library of Living Minds"), and disclaimer in proper 11px type. |
| Theme toggle labels visible | **YES** | "The Reading Room" / "The Late Study" labels are visible inline in the toggle button. |

---

## Qualitative Scores (Steve Jobs Framework Lens)

### Design Quality: 7/10 (was 6/10, +1)

**What improved:**
- The Gm monogram in the rotated diamond is a genuine identity element. It is small, but it is a mark. The rotation-on-hover is a nice tactile detail.
- The weighted wordmark (Great semibold + Minds light) creates typographic interest in what was previously a plain text logo.
- The spotlight/shadow metaphor for the perceptual lens is a meaningful visual concept. The "In sharp focus" side with concentric circle icon and warm radial glow vs the "In the periphery" side with dashed circle and diagonal lines creates a genuine spatial language for the intellectual content. This is the first element that feels designed rather than styled.
- The 4px accent border on framework cards gives each card more visual weight and brand presence. Combined with the radial glow on hover, the cards feel more substantial.

**What still fails the Jobs test:**
- The dark mode is still broken. The hero heading on the homepage is invisible in dark mode (dark ink color on dark background). The article body text is unreadable. This was the #1 critical fix from iteration 1, and it was not actually fixed. The class `text-ink/90` is still present on article body paragraphs, and while `dark:text-ink-light` is specified alongside it, the dark mode computed colors show the text is effectively invisible. This suggests either (a) the dark class is not being applied correctly, or (b) there is a specificity issue where `text-ink/90` overrides `dark:text-ink-light`.
- The homepage with a single framework still feels like a prototype. The editorial single-column layout is better than a card grid, but one card in a vertical stack is still one card.
- The Gm monogram, while present, is decorative rather than iconic. At 8x8 pixels with a 1px border diamond, it reads as a UI flourish, not a brand mark. To be iconic, it would need more visual weight or a more distinctive treatment.

**Why not 8+:** The dark mode failure is a dealbreaker. You cannot score 8 on design quality when 50% of the visual modes render unreadable text. Additionally, the single-framework gallery still communicates "demo" rather than "curated collection."

---

### Originality: 5/10 (was 4/10, +1)

**What improved:**
- The spotlight/shadow perceptual lens metaphor is genuinely original. The idea of mapping "what a mind focuses on" vs "what it pushes to the periphery" using visual language (warm glow + focus icon vs cool diagonal lines + dashed circle) is an approach I have not seen on other content sites. This is a concept that earns its place.
- The "Reading Room" / "Late Study" naming for light/dark modes is now visible to users (previously buried in a `title` attribute). This editorial voice is distinctive.
- The accordion with "Emergent pole" / "Implicit pole" labeling gives the bipolar constructs a vocabulary that is specific to this product. It is not a generic FAQ.

**What remains generic:**
- The overall page structure is still the canonical Tailwind content site: header with logo left / action right, hero section, card list, detail page with breadcrumb, article with narrow reading column. No amount of styling on this skeleton changes the skeleton.
- The framework card, despite the accent border and radial glow, still reads as a styled content card. Compare to something like Stripe's documentation cards or Apple's product feature sections -- those create spatial relationships that make you understand the content through the layout itself. Here, the layout is a container for text.
- The article reading view is a standard Medium/Substack pattern. Competent, but not something you would screenshot to show someone.
- Would you remember this site tomorrow? The spotlight/shadow section might stick. The rest blends with every other well-designed content site.

**Why not 6+:** The template skeleton is still recognizable. To reach 6, the layout itself needs to do something unexpected -- not just the styling of individual components.

---

### Craft: 5/10 (was 6/10, -1)

**What improved:**
- The SVG chevron with framer-motion rotation animation is a genuine craft improvement over the raw `+` character. The accordion expand/collapse is now smooth with height transition.
- The footer has proper typographic treatment -- serif brand text with weight contrast, a separator, the tagline, and the disclaimer in proportional 11px type.
- The framer-motion entrance animations (stagger on cards, scroll-triggered reveals) add a layer of choreographed motion that the static iteration 1 lacked.
- The selection color styling in both modes is a considered detail.

**What is worse or still broken (justifying the score drop):**
- **The vertical rhythm rules are not being applied.** The CSS in `globals.css` specifies `.article-body h2 { margin-top: 3em; margin-bottom: 0.75em; }` and `.article-body p { margin-bottom: 1.5em; }`, but computed values show 0px. This means the article body has no spacing between paragraphs beyond what Tailwind provides. The reading experience is worse than intended because these rules are silently failing.
- **The letter-spacing rule (-0.01em) is not being applied** either. Computed value shows `normal`. Same root cause -- the CSS rules are not reaching the elements.
- **Dark mode is not crafted -- it is broken.** The article body text in dark mode is unreadable. This was explicitly called out as the #1 craft priority. The iteration 2 summary claims "removed /90 opacity, full-opacity text throughout" but the article body class still contains `text-ink/90`. The generator either did not make this change or it was reverted.
- **Mobile homepage has a regression.** Horizontal overflow now exists at 375px. This is the kind of regression that indicates changes were made without testing.
- **The reading progress bar has `position: static`** in computed style, not `position: fixed`. The CSS specifies `.reading-progress { position: fixed; top: 0; }` but computed shows `static`. Another CSS rule that is not being applied. The bar works functionally (width updates on scroll, visible in screenshots) but its positioning may depend on the component's inline styles rather than the CSS class.

**Why the score dropped:** Iteration 1 had fewer ambitions but executed them cleanly. Iteration 2 has more ambitions but several are silently broken. The CSS rules that define the reading experience (vertical rhythm, letter-spacing) are not being applied, which means the "museum-quality typography" claim is unfounded. And dark mode -- the single most critical fix requested -- remains broken. Craft is not about adding features; it is about making every existing detail work flawlessly. This iteration added features while leaving critical details broken.

---

### Functionality: 6/10 (was 7/10, -1)

**What improved:**
- The framer-motion animations are smooth. No jank observed in accordion open/close or page entrance animations.
- The reading progress bar updates correctly on scroll.
- The construct accordion works properly with expand/collapse, staggered animations, and SVG chevron rotation.
- Zero console errors across all pages.

**What regressed:**
- **Mobile homepage has horizontal overflow.** This is a criterion 8 failure and a functionality regression. Something in the new card or header styling is exceeding the 375px viewport.
- **Dark mode is functionally broken for reading.** If a user toggles to dark mode and opens an article, the body text is unreadable. This makes the article feature unusable in dark mode.
- **The vertical rhythm CSS is not being applied.** This means the article reading experience is not what was designed -- paragraphs and headings do not have the intended spacing. The content is readable but not comfortable.

**What else:**
- Theme toggle and persistence work correctly.
- Navigation flow is clean: homepage -> framework -> article -> back. All breadcrumbs work.
- The reading progress bar adds subtle value without distraction.
- Footer renders correctly on all pages.

**Why the score dropped:** Functionality should not regress between iterations. The mobile overflow is a new bug. The dark mode text was the #1 fix priority and is still broken. These are not minor issues -- they affect core usability.

---

## Overall Score

| Dimension | Iter 1 | Iter 2 | Weight | Weighted |
|-----------|--------|--------|--------|----------|
| Design Quality | 6/10 | 7/10 | 30% | 2.10 |
| Originality | 4/10 | 5/10 | 20% | 1.00 |
| Craft | 6/10 | 5/10 | 25% | 1.25 |
| Functionality | 7/10 | 6/10 | 25% | 1.50 |
| **Total** | **5.85** | | | **5.85/10** |

**Overall: 5.85/10 (unchanged from iteration 1)**

---

## Verdict: CONDITIONAL PASS (same as iteration 1)

8/9 success criteria pass (regression on mobile homepage). The overall weighted score is unchanged. The iteration added genuine design improvements (monogram, spotlight/shadow, accordion animation, visible theme labels) but introduced regressions (mobile overflow) and failed to fix the most critical issue from iteration 1 (dark mode text contrast).

The net effect is zero improvement in overall score because gains in design identity were offset by losses in craft and functionality.

---

## Critical Blockers for Iteration 3

### 1. CRITICAL: Dark mode text is still unreadable
This was the #1 priority from iteration 1 and it was not fixed. The specific issues:
- `text-ink/90` on article body paragraphs produces near-black text. In dark mode, `dark:text-ink-light` should override this, but the computed color shows the text is effectively invisible.
- The H1 on the homepage in dark mode renders as `rgb(26, 26, 26)` on a `rgb(22, 22, 22)` background -- zero contrast.
- **Root cause investigation needed:** Either the Tailwind dark mode variant is not being applied correctly, or there is a specificity issue. The `text-ink/90` class may be overriding `dark:text-ink-light` because opacity modifiers in Tailwind v4 may have higher specificity than dark variants. Test by removing the `/90` modifier entirely and using `text-ink dark:text-ink-light` (no opacity).

### 2. HIGH: Mobile homepage horizontal overflow (new regression)
Something in the iteration 2 changes causes the homepage to exceed 375px width. Likely culprits:
- The radial gradient absolutely-positioned div (`w-48 h-48`) inside the card with `translate(30%, -30%)` may overflow the card boundary.
- The header monogram or wordmark may not have proper overflow control.
- Debug by inspecting which element exceeds the viewport.

### 3. HIGH: CSS rules in globals.css not being applied
The vertical rhythm rules (`.article-body h2`, `.article-body p`) and letter-spacing rule are defined in `globals.css` but have zero effect. This is likely because:
- Tailwind v4's CSS reset may be overriding these rules with higher specificity.
- The `@import "tailwindcss"` at the top of `globals.css` brings in Tailwind's preflight, which may set margins to 0 with higher specificity.
- Fix: Use Tailwind utility classes directly on the elements in JSX rather than relying on CSS rules in `globals.css`, or use `!important` (less ideal), or move the rules after the Tailwind import with more specific selectors.

---

## What Would Get to 9/10

**Design (currently 7):** Fix dark mode completely. Add 2-3 more frameworks to make the gallery feel populated. Give the Gm monogram more visual weight -- consider a filled background instead of just a border. The homepage should feel like opening a leather-bound folio, not viewing a component library.

**Originality (currently 5):** Break the Tailwind template skeleton. Consider: asymmetric layouts for the hero, a sidebar navigation for frameworks instead of a vertical stack, a visual timeline or spatial metaphor for the framework gallery instead of a list. The spotlight/shadow concept proves you can think beyond templates -- apply that thinking to the page structure itself.

**Craft (currently 5):** Fix the CSS specificity issues so the typography rules actually apply. Every element in every mode must be tested and verified. The reading experience needs the intended vertical rhythm. Dark mode needs to be as carefully crafted as light mode -- every text element, every border, every surface.

**Functionality (currently 6):** Fix the mobile overflow regression. Fix dark mode readability. Add loading/transition states between pages. Test every change at both viewport sizes and both color modes before submitting.

---

## Screenshots Reference

| Screenshot | Description |
|-----------|-------------|
| `tests/screenshots/iter2/01-homepage-desktop-light.png` | Homepage at 1280px, light mode |
| `tests/screenshots/iter2/02-framework-detail-light.png` | Framework detail page, light mode |
| `tests/screenshots/iter2/03-article-reading-light.png` | Article reading view, light mode |
| `tests/screenshots/iter2/04-theme-toggled.png` | Homepage after dark mode toggle |
| `tests/screenshots/iter2/05-homepage-mobile-light.png` | Homepage at 375px, light mode |
| `tests/screenshots/iter2/06-article-mobile-light.png` | Article reading at 375px, light |
| `tests/screenshots/iter2/07-homepage-dark.png` | Homepage dark mode (hero text invisible) |
| `tests/screenshots/iter2/08-article-dark.png` | Article dark mode (body text unreadable) |
| `tests/screenshots/iter2/09-framework-detail-dark.png` | Framework detail dark mode |
| `tests/screenshots/iter2/10-homepage-mobile-dark.png` | Homepage mobile dark mode |
| `tests/screenshots/iter2/11-article-mobile-dark.png` | Article mobile dark mode (text unreadable) |
| `tests/screenshots/iter2/12-construct-accordion-open.png` | Accordion expanded, light mode |

---

## Top 3 Priority Fixes (Unchanged from Iteration 1)

1. **CRITICAL (unchanged):** Dark mode text contrast. The article body text and homepage H1 are invisible in dark mode. Remove `text-ink/90` from article paragraphs. Verify every text element's computed color in dark mode. This must be the first thing fixed in iteration 3.

2. **HIGH (new regression):** Mobile homepage horizontal overflow. Debug which element exceeds the viewport at 375px.

3. **HIGH (new issue):** CSS rules in `globals.css` are not being applied. The vertical rhythm and letter-spacing that define the reading experience are silently failing. Either fix the specificity issue or move the styles to inline/utility classes.
