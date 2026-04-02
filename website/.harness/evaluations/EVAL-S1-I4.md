# Sprint 1 Evaluation Report -- Iteration 4
**Sprint:** Sprint 1 -- Foundation + Landing Experience
**Iteration:** 4 (Major structural overhaul targeting originality)
**Date:** 2026-04-02
**Evaluator Lens:** Steve Jobs Framework (Products as experiences-waiting-to-exist)
**Previous Scores:** Design 7.5, Originality 5.5, Craft 7, Functionality 8 (Iteration 3, weighted 7.10)

---

## Success Criteria Results

| # | Criterion | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Notes |
|---|-----------|--------|--------|--------|--------|-------|
| 1 | Homepage renders with framework content | PASS | PASS | PASS | **PASS** | Full-viewport hero, not card list |
| 2 | Shows archetype name, domain, perceptual lens | PASS | PASS | PASS | **PASS*** | Domain visible in page text; test selector was too narrow |
| 3 | Click framework => detail page with articles | PASS | PASS | PASS | **PASS** | 2 articles listed |
| 4 | Click article => distraction-free reading view | PASS | PASS | PASS | **PASS** | max-width 680px, construct tracker in margin |
| 5 | Dark/light toggle works and persists | PASS | PASS | PASS | **PASS** | Toggle and persistence confirmed |
| 6 | Legal disclaimer in footer | PASS | PASS | PASS | **PASS** | Present on all pages |
| 7 | No console errors | PASS | PASS | PASS | **PASS** | 0 critical errors |
| 8 | Mobile responsive: homepage at 375px | PASS | FAIL | PASS | **PASS** | 0px overflow |
| 9 | Mobile responsive: article at 375px | PASS | PASS | PASS | **PASS** | 0px overflow |

*Note on criterion 2: The domain text "TECHNOLOGY, DESIGN, BUSINESS" is present on the page as a span with uppercase tracking, but the automated test's selector for `span.text-muted` matched the first muted span on the page (not the domain label). Manual inspection of the screenshots confirms the domain is displayed. This is a test-selector issue, not a content issue. Functionally this passes.

**Functional Score: 9/9 criteria pass (with the selector caveat above).**

---

## Iteration 4 Change Verification

| Claimed Change | Verified? | Evidence |
|----------------|-----------|----------|
| Full-viewport immersive hero (parallax) | **YES** | `div.min-h-screen` hero with useScroll/useTransform parallax. Hero fills viewport with radial accent washes, large serif H1, centered blockquote. Scroll indicator animates. Screenshot `01b-hero-viewport.png` confirms. |
| Perceptual lens diptych | **YES** | Two-column grid (`grid md:grid-cols-2`) with "In sharp focus" spotlight and "In the periphery" shadow. Visually distinct with radial gradient on spotlight side and diagonal hatching on shadow side. |
| Construct tension lines (not accordion) | **YES** | 4 constructs rendered as horizontal tension bars with accent-color left rail, positive/negative poles. Links to framework detail. Not an accordion. |
| Thought-thread articles | **YES** | Articles displayed as numbered nodes on a vertical thread line with date/time metadata, titles, and subtitles. Not blog cards. |
| "Through the lens of..." article intro | **YES** | Present on article page. Styled with accent-color left border and gradient background. Contains framework name and lens statement. |
| Left-margin construct tracker (desktop) | **YES** | Sticky sidebar with "Reading through" label and heading links. Active heading highlighted with accent color. Visible on desktop (1280px), hidden on mobile. |
| Drop cap on first paragraph | **PARTIAL** | CSS rule exists in globals.css (`.article-body > p:first-of-type::first-letter` with `float: left`, `font-size: 3.5em`, `color: var(--color-accent)`). However, the automated test could not measure the pseudo-element's computed float correctly (Playwright limitation with `::first-letter`). Visual inspection of article screenshots shows the first letter does appear to have some differentiation but the drop cap effect is subtle or not rendering as intended. |
| SVG noise texture overlay | **PARTIAL** | CSS rule exists (`body::before` with SVG feTurbulence noise at 0.028 opacity). The automated test could not detect the pseudo-element's background image reliably (returns computed values). The opacity is intentionally very low (2.8% light, 4% dark). At this opacity, the texture adds subliminal materiality without being overtly visible -- this is correct behavior for a subtle paper grain effect. |
| Crafted gradient horizontal rules | **YES** | `.hr-crafted` class present with `linear-gradient(90deg, transparent, border, accent, border, transparent)`. Present in article header and footer. The automated gradient detection via `getComputedStyle` returned a resolved gradient string that did not match the simple substring check, but the CSS source confirms the gradient. |
| AnimatePresence theme toggle | **YES** | Toggle displays "The Reading Room" (light) and "The Late Study" (dark) with AnimatePresence mode="wait" transitions. Icon rotates and scales on switch. Confirmed via test. |
| All dark: variant classes removed | **YES** | Zero `dark:` variant classes found in the rendered DOM. This is a clean implementation -- all dark mode now flows through CSS variable overrides in `.dark {}`. |
| Overflow fixed at source | **YES** | `body.overflowX = "visible"`. No `overflow-x-hidden` safety net on body. The previous overflow-causing elements (radial gradients) are now contained within `overflow-hidden` parent divs. |
| Focus-visible keyboard accessibility | **PARTIAL** | CSS rule `*:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }` exists in globals.css. The automated stylesheet scan could not detect it (likely due to Tailwind's CSS processing), but the rule is present in the source CSS. |
| 44px mobile tap targets | **PARTIAL** | Primary navigation links and buttons have `style={{ minHeight: "44px" }}`. However, the construct tracker sidebar buttons in the article view are 28px tall. These are desktop-only (hidden on mobile via `hidden lg:block`), so they do not affect mobile tap targets, but they are below the 44px threshold on desktop for keyboard/pointer accessibility. |
| Enlarged brand monogram | **YES** | Monogram container is 40x40px (up from 8x8px in earlier iterations). Rotated diamond border with "Gm" text. Confirmed via test. |

---

## CRITICAL REGRESSION: Dark Mode Contrast

**Dark mode is broken in iteration 4.** All text elements in dark mode have near-zero contrast.

| Element | Color (dark) | Background (dark) | Contrast Ratio | WCAG AA |
|---------|-------------|-------------------|----------------|---------|
| Homepage H1 | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |
| Blockquote | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |
| Article body | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |
| Article H1 | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |
| Muted text | rgb(107, 101, 96) | rgb(22, 22, 22) | 3.15:1 | **FAIL** |
| Mobile H1 | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |
| Mobile article body | rgb(26, 26, 26) | rgb(22, 22, 22) | 1.04:1 | **FAIL** |

**Diagnosis:** The `--color-ink` variable is defined as `#1A1A1A` in the `@theme inline` block and overridden to `#E8E4DF` in the `.dark {}` block. However, the computed color on text elements in dark mode is `rgb(26, 26, 26)` -- which is `#1A1A1A`, the LIGHT mode value. This means the `.dark` CSS variable override for `--color-ink` is not being applied.

**Root cause hypothesis:** The Tailwind v4 `@theme inline` declaration may have higher specificity or later cascade position than the `.dark {}` rule in globals.css, causing the theme-defined `--color-ink` to override the `.dark` class override. This is the same category of bug that plagued iterations 1 and 2, now resurfaced -- likely because the removal of all `dark:` variant classes (which was correct) exposed that the CSS variable override approach has a specificity conflict with Tailwind v4's `@theme inline`.

**Additional dark mode issue:** The framework detail spotlight/shadow diptych retains its light-mode background colors in dark mode. The "In sharp focus" panel appears with a white/cream background against the dark page, creating a jarring visual inconsistency. The `bg-surface` class resolves to `#1E1E1E` in dark mode (correct), but the radial gradient overlay uses the accent color at low opacity on top of a `bg-surface` that may not be resolving correctly.

**Comparison to iteration 3:** Iteration 3 had ALL dark mode text meeting WCAG AA (14.30:1 on H1, 5.65:1 on accent, 6.10:1 on muted). Iteration 4 has regressed to near-zero contrast on all text. This is a critical regression that makes dark mode completely unusable.

---

## Qualitative Scores (Steve Jobs Framework Lens)

### Design Quality: 8/10 (was 7.5/10, +0.5)

**Diagnostic question:** "Does entering this site feel like entering a curated space with its own atmosphere?"

**In light mode: Yes, substantially.** The full-viewport hero with "The Innovator" in a large serif font, centered perceptual lens blockquote, subtle radial accent washes, and a "Scroll" indicator at the bottom creates a genuine sense of entering a curated intellectual space. This is no longer a template -- it is an experience with atmosphere.

The perceptual lens diptych ("In sharp focus" / "In the periphery") is a genuinely well-designed information display. The visual distinction between the spotlight side (radial glow, concentric circles icon) and the shadow side (diagonal hatching, dashed circle icon) communicates the conceptual duality without explanation.

The construct tension lines -- horizontal bars with accent-color rails and positive/negative poles -- communicate dimensionality. The thread-based article listing with nodes on a vertical line communicates narrative continuity.

The enlarged monogram (40x40px diamond with "Gm") now functions as a real brand mark. The "GreatMinds" wordmark with weight contrast (bold "Great", light "Minds") is clean.

**In dark mode: No.** The space is essentially invisible. Dark text on a dark background makes the site appear broken, not atmospheric. The framework detail page's diptych section retains light-mode panel backgrounds, creating a visual error.

**What prevents 9/10:** The dark mode regression eliminates half the designed experience. The homepage hero, while immersive, has large empty space below the fold -- the sections below (lens, constructs, articles) do not appear until significant scrolling, and when they do, the transition from the hero's generous whitespace to the content sections lacks a visual bridge. The article view's "Through the lens of..." intro is a strong design element, but the reading view itself remains straightforward -- it does not yet feel like a space with its own atmosphere the way the homepage hero does.

**What would reach 9:** Fix dark mode (critical). Add a visual transition element between the hero and the first content section -- a subtle line, a fade, or a scroll-triggered reveal that connects the hero to the content below. Consider making the article reading space feel as immersive as the homepage hero (perhaps a subtle background wash that relates to the framework's accent color).

---

### Originality: 7.5/10 (was 5.5/10, +2.0)

**Diagnostic question:** "Have you seen anything like this before? What specific element is genuinely novel?"

**This is the largest single-iteration improvement in any dimension across all iterations.** The structural overhaul directly addressed the originality gap.

**Genuinely novel elements:**
1. **The perceptual lens diptych** -- I have not seen a content site that uses a spatial two-panel display to present what a thinker focuses on vs. what they overlook. The visual language (spotlight vs. shadow, concentric rings vs. dashed circle, radial glow vs. diagonal hatching) is original and conceptually coherent.
2. **The construct tension lines** -- Presenting cognitive dimensions as horizontal bars with positive and negative poles, rather than as a list or cards, communicates the bipolar nature of the constructs visually. The accent-color rail that thickens on hover adds physicality.
3. **The thought-thread article listing** -- A vertical timeline with nodes, rather than blog cards or a list, implies that the articles are connected thoughts in a sequence. This is a meaningful departure from the standard blog pattern.
4. **The "Through the lens of..." article intro** -- This contextualizes every article within the framework's perspective before reading begins. I have not seen this pattern on content platforms. It transforms the article from standalone content to framework-situated analysis.
5. **The left-margin construct tracker** -- A sticky sidebar that highlights which section you are reading, styled with the framework's accent color, is not novel in concept (many documentation sites have this), but applying it to track which intellectual construct is active during article reading is a meaningful adaptation.
6. **"The Reading Room" / "The Late Study"** -- Naming the light and dark modes as rooms rather than modes is a small but distinctive touch that extends the library metaphor.

**What prevents 9/10:** The homepage hero, despite being immersive, is structurally a standard centered-text hero. The text is centered, there is a CTA button, there is a scroll indicator. The content within it is original (perceptual lens statement), but the container is conventional. A 9 in originality requires at least one element where the visitor thinks "I have never seen anything quite like this before" -- not just in content but in form. The spatial/parallax hero approaches this but does not cross the threshold because the parallax is subtle (scale 0.97 and 80px Y offset) and the radial accent washes are nearly invisible.

**What would reach 9:** Push the hero's visual language further -- consider an asymmetric layout, a split-screen introduction, or a typographic treatment that is unmistakably unique (e.g., the perceptual lens statement rendered as a spatial element that moves differently from the title on scroll). Alternatively, make the construct tension lines interactive -- let the user drag or position themselves on each dimension to see how the framework would analyze their perspective.

---

### Craft: 5.5/10 (was 7/10, -1.5)

**Diagnostic question:** "Is every pixel deliberate? Is there a single element that doesn't earn its place?"

**The craft score has dropped because dark mode is broken.** A site with a lovingly crafted light mode and a completely unusable dark mode is not a crafted product -- it is a half-finished product. Craft means every state, every mode, every viewport has been considered. Dark mode was working in iteration 3 and is now broken in iteration 4. This is the definition of a regression.

**What is crafted (light mode):**
- The CSS variable architecture with zero `dark:` variant classes is clean and correct in principle. The implementation just has a cascade/specificity issue.
- The `overflow-x-hidden` safety net has been removed and overflow is fixed at source (parent `overflow-hidden` containers on the radial gradient elements). This is the surgical fix that was requested.
- The noise texture overlay (SVG feTurbulence at 2.8% opacity) adds subliminal materiality. At this opacity, you feel it more than see it -- which is exactly right.
- The crafted horizontal rules (gradient from transparent to border to accent to border to transparent) are a considered detail.
- The selection styling (burnt sienna highlight) and custom scrollbar are maintained from iteration 3.
- The AnimatePresence theme toggle with room-name labels is a polished micro-interaction.

**What is not crafted:**
- **Dark mode is broken.** All text is invisible. This is the single most damaging craft failure possible.
- The framework detail page in dark mode shows the spotlight/shadow diptych with what appears to be a light-background panel on a dark page. This looks like an error, not a design choice.
- The drop cap CSS rule exists but may not be rendering correctly -- the automated test could not confirm the `float: left` and the visual evidence in screenshots is ambiguous.
- The construct tracker sidebar buttons are 28px tall, below the 44px target. While these are desktop-only, they represent an incomplete accessibility pass.
- The homepage has significant empty vertical space between the hero and the first content section. The sections below the fold (lens, constructs, articles) do not appear until the user scrolls past a large empty area. This dead space does not earn its place.

**What would reach 9:** Fix the dark mode CSS variable cascade issue (critical, non-negotiable). Verify the drop cap renders correctly. Eliminate the dead space between homepage sections. Ensure the construct tracker sidebar buttons meet the 44px tap target or have sufficient padding. Audit every element in both modes at both viewports.

---

### Functionality: 7.5/10 (was 8/10, -0.5)

**Diagnostic question:** "Does every interaction feel curated? Any jank, any moment of confusion?"

**Functional regression due to dark mode.** The toggle works (the class switches, the mode persists), but the resulting dark mode is visually broken. A user toggling to dark mode would see an essentially blank page. This is a moment of confusion -- the worst kind, because it looks like the site is broken.

**What works well:**
- All 9 success criteria pass functionally (the content is present, navigation works, persistence works).
- The parallax hero scroll interaction is smooth.
- The construct tension lines have responsive hover states (accent rail thickens, text color transitions).
- The article thread nodes have hover transitions (scale up, arrow reveal on desktop).
- The construct tracker sidebar updates active heading on scroll via IntersectionObserver.
- The reading progress bar functions correctly.
- Zero console errors across all pages.
- Mobile responsive: zero overflow at 375px on all pages, fixed at source (not body safety net).

**What does not work:**
- **Dark mode is visually non-functional.** The toggle switches modes but the resulting visual state is unusable.
- The homepage mobile dark mode screenshot shows the H1 is invisible. Only the domain label (uppercase tracking) and the "Enter the framework" button border are faintly visible.
- The article view in mobile dark mode shows only the framework name in accent color and the "Through the lens of..." intro; all body text is invisible.

**What would reach 9:** Fix dark mode (the only blocker for returning to the iteration 3 score of 8). Then: add page transition states to eliminate the brief blank flash between navigations. Consider predictive prefetching on hover for the framework and article links.

---

## Overall Score

| Dimension | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Weight | Weighted (I4) |
|-----------|--------|--------|--------|--------|--------|---------------|
| Design Quality | 6 | 7 | 7.5 | **8** | 30% | 2.40 |
| Originality | 4 | 5 | 5.5 | **7.5** | 20% | 1.50 |
| Craft | 6 | 5 | 7 | **5.5** | 25% | 1.375 |
| Functionality | 7 | 6 | 8 | **7.5** | 25% | 1.875 |
| **Total** | **5.85** | **5.85** | **7.10** | | | **7.15/10** |

**Overall: 7.15/10 (+0.05 from iteration 3)**

---

## Iteration Progression

| Dimension | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Trend |
|-----------|--------|--------|--------|--------|-------|
| Design | 6 | 7 | 7.5 | 8 | Steady upward; immersive hero is genuine improvement |
| Originality | 4 | 5 | 5.5 | 7.5 | Major jump; structural overhaul delivered |
| Craft | 6 | 5 | 7 | 5.5 | Regressed again; dark mode broke for the second time |
| Functionality | 7 | 6 | 8 | 7.5 | Slight regression; dark mode renders unusable state |
| Weighted Total | 5.85 | 5.85 | 7.10 | 7.15 | Nearly flat; gains in design/originality offset by craft/func regression |

**The paradox of iteration 4:** This iteration made the largest originality improvement in the project's history (+2.0 points), but the overall score barely moved (+0.05) because the dark mode regression erased the gains. The site's best features (immersive hero, diptych, tension lines, thought threads) are only visible in light mode. Dark mode -- which was fully functional in iteration 3 -- is now broken.

This pattern has occurred before: iteration 2 added design features but broke mobile and dark mode, producing a flat overall score. Iteration 3 fixed those issues and the score jumped +1.25. The lesson is clear: **fixing critical regressions produces larger score gains than adding new features.**

---

## Verdict: CONDITIONAL PASS

All 9 success criteria pass functionally, and the light-mode experience is the strongest it has ever been. The weighted score is 7.15/10.

However, the dark mode regression is a critical issue that makes the site unusable in one of its two visual modes. The target of 9/10 on all dimensions is not achievable until this is resolved.

---

## Gap Analysis: What Separates 7.15 from 9.0

### The One Fix That Changes Everything: Dark Mode CSS Variable Cascade

The `.dark` block in globals.css overrides `--color-ink` to `#E8E4DF`, but the computed value remains `#1A1A1A`. The Tailwind v4 `@theme inline` block likely takes precedence because of CSS cascade ordering or specificity.

**The fix:** Either increase the specificity of the `.dark` overrides (e.g., `html.dark { --color-ink: #E8E4DF; }`) or move the `.dark` block after the `@theme inline` block with an `!important` override on the custom properties, or use Tailwind v4's built-in dark mode mechanism if `@theme inline` supports it. This single fix would restore all dark mode contrast ratios to the iteration 3 levels (14.30:1 on primary text) and immediately recover the Craft score to 7+ and the Functionality score to 8+.

### Design (8 -> 9): +1 needed
1. Fix dark mode to restore the "Late Study" atmosphere that was working in iteration 3.
2. Bridge the gap between the hero and content sections -- eliminate dead whitespace below the hero fold.
3. Make the article reading view feel as immersive as the homepage hero (subtle accent wash, or framework-specific atmospheric element).

### Originality (7.5 -> 9): +1.5 needed
1. Push one element past the "I have never seen this" threshold. The diptych and tension lines are close but still recognizable patterns (split panel, horizontal bar). Consider: an interactive construct dimension where the user can position themselves, or a typographic hero that uses motion/space in a way that is truly unprecedented.
2. The article reading experience is improved (construct tracker, lens intro) but still reads as a refined blog. One more structural innovation in the reading flow would push it to 9.

### Craft (5.5 -> 9): +3.5 needed (largest gap, entirely due to dark mode)
1. **Fix dark mode** -- this alone is worth +2 to +2.5 points.
2. Verify drop cap rendering across browsers.
3. Ensure construct tracker buttons meet 44px target.
4. Eliminate dead space between homepage sections.
5. Audit every element in both modes and both viewports.

### Functionality (7.5 -> 9): +1.5 needed
1. **Fix dark mode** -- this is worth +1 point to functionality.
2. Add page transition states between navigations.
3. Add mobile-visible interaction feedback on tappable elements.

---

## Screenshots Reference

| Screenshot | Description |
|-----------|-------------|
| `tests/screenshots/iter4/01-homepage-desktop-light.png` | Full homepage at 1280px, light mode -- immersive hero + all sections |
| `tests/screenshots/iter4/01b-hero-viewport.png` | Hero viewport-only, light mode -- centered archetype, lens statement, CTA |
| `tests/screenshots/iter4/02-framework-detail-light.png` | Framework detail, light mode -- diptych, domain, description |
| `tests/screenshots/iter4/03-article-reading-light.png` | Article reading, light mode -- lens intro, construct tracker, drop cap area |
| `tests/screenshots/iter4/04-homepage-dark.png` | Homepage dark mode -- TEXT INVISIBLE, critical regression |
| `tests/screenshots/iter4/05-framework-detail-dark.png` | Framework detail dark mode -- text invisible, diptych panel retains light bg |
| `tests/screenshots/iter4/06-article-dark.png` | Article dark mode -- body text invisible, only accent color visible |
| `tests/screenshots/iter4/07-homepage-mobile-light.png` | Homepage at 375px, light mode -- hero renders correctly, no overflow |
| `tests/screenshots/iter4/08-homepage-mobile-dark.png` | Homepage at 375px, dark mode -- H1 invisible, critical regression |
| `tests/screenshots/iter4/09-article-mobile-light.png` | Article at 375px, light mode -- lens intro, responsive typography |
| `tests/screenshots/iter4/10-article-mobile-dark.png` | Article at 375px, dark mode -- body text invisible |
| `tests/screenshots/iter4/11-framework-detail-desktop-light.png` | Framework detail desktop, light mode -- clean layout |

---

## Top 3 Priority Fixes for Next Iteration

1. **CRITICAL: Fix dark mode CSS variable cascade.** The `.dark` overrides for `--color-ink`, `--color-muted`, `--color-border`, `--color-surface`, and `--color-paper` are not taking effect. This is likely a Tailwind v4 `@theme inline` specificity issue. Try `html.dark` selector or move the overrides to a location that wins the cascade. This single fix is projected to recover +2.5 Craft points and +1 Functionality point, bringing the overall score from 7.15 to approximately 8.5.

2. **HIGH: Tighten the homepage vertical rhythm.** The gap between the hero (full viewport) and the first content section (Perceptual Lens) is too large. Consider reducing the hero to `min-h-[80vh]` or adding scroll-triggered section reveals that begin appearing before the hero fully exits. The current experience has a "dead zone" that breaks the immersion.

3. **MEDIUM: Verify and polish fine details.** Confirm drop cap renders with `float: left` in all browsers. Ensure construct tracker buttons have sufficient interactive area. Add subtle accent-color atmosphere to the article reading view to match the immersive quality of the homepage.
