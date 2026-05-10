# Design Direction Research - Consult The Dead

**Created:** 2026-04-24
**Status:** Updated to reflect the shipped Reading Room / Late Study UI
**Purpose:** Keep the current visual direction aligned with the live website before more polish work lands

---

## Recommendation: Direction A "Reading Room" with a dark/light toggle

Direction A is still the right call, but it is no longer just a proposal. The live site already ships a serif-led editorial system with warm parchment colors, dark default mode, amber/red accents, and a theme toggle that switches between:

- **Late Study** - the default dark version
- **Reading Room** - the light parchment version

That means the design question is no longer "which aesthetic should we choose?" It is "how do we finish and tighten the aesthetic we already launched?"

### Why this direction still wins

**1. Premium perception through rarity**
Most AI tools still lean dark + monospace or clean SaaS white + sans-serif. The current reading-room system feels deliberate and distinct instead of generic.

**2. Serif = trust for high-stakes decisions**
The site asks users to trust historical frameworks with real decisions. The serif editorial treatment matches that expectation better than a commodity dashboard look.

**3. Warm colors build connection**
The parchment / amber / rust palette gives the product a human tone without making it feel whimsical or soft.

**4. The "Reading Room" metaphor fits the product**
This is not a chat toy. It is a council, a debate, and a synthesis surface. The current design already supports that mental model.

**5. Dark mode is part of the product, not a fallback**
The dark default is not a compromise. It is the "Late Study" variant of the same system, and it gives the product range without splitting the brand.

### Why not Direction B alone

Direction B would push the product toward the same dark analytics / AI-assistant pattern used everywhere else. The live site has already moved past that. Reverting to it would erase the most distinctive part of the brand.

### Why not Direction C as a separate identity

The current implementation already covers the useful part of C: the hybrid light/dark presentation. The next step is polish and consistency, not another visual fork.

---

## Current Live System

The shipped website already uses the Reading Room system across the core surfaces:

- serif display typography
- warm parchment tokens for the light theme
- dark parchment / amber tokens for the default theme
- mind cards with portrait treatment
- themed council packs on the homepage
- editorial section headers and monospaced metadata
- a Reading Room / Late Study theme toggle in the header
- a pricing page that already carries a stats bar and a small social-proof strip, even though those pieces still feel local to that page

That means the memo should track the live site, not the original brainstorming mockups.

---

## Next-Batch Checklist

1. **Keep Direction A as the brand system.** The live site should stay serif-led, warm, and editorial rather than drifting toward a generic SaaS shell.
2. **Treat Late Study and Reading Room as one system.** Maintain the dark default and light toggle as variants of the same visual language.
3. **Tighten the landing-page hierarchy first.** The homepage is already on-brand, but the hero, secondary CTA, and pack browsing still need one more pass so the first scroll feels intentional on mobile and desktop.
4. **Unify the funnel surfaces.** The quiz and pricing pages should read like parts of the same editorial system, not adjacent app screens with similar tokens.
5. **Defer new art-direction experiments.** Finish the current system before adding another visual layer.

### Pages in scope on the live site

- `/` - homepage / landing
- `/agora` - main decision flow
- `/agora/a/[id]` - public shared decision result page
- `/frameworks` - council directory
- `/frameworks/[slug]` - individual framework pages
- `/quiz` - guided mind-picker
- `/debates` - sample debate index
- `/debates/[slug]` - sample debate detail pages
- `/insights` - decision insights index
- `/insights/[slug]` - insight articles
- `/pricing` - pricing and upgrade page
- `/account` - subscription, usage, and BYO key settings
- `/library` - saved debate archive for Pro users
- `/essay` - explanatory about page
- `/privacy` - privacy policy
- `/terms` - terms of service

Auth surfaces such as `/sign-in` and `/sign-up` are Clerk-managed, so they should be visually compatible, but they are not the primary design surface owned by the app.

---

## Remaining Redesign Gaps That Still Matter

1. **Homepage hierarchy still needs sharpening**
   The page is on brand, but the hero, secondary CTA, and pack browsing still need one more pass so the first scroll feels more intentional on mobile and desktop.

2. **Interactive Agora states still feel more functional than ceremonial**
   The main decision flow, loading states, and final synthesis screens should lean harder into the editorial "Reading Room" tone instead of reading like a utilitarian form.

3. **Transactional pages need more visual depth**
   Pricing, account, and library are correctly structured, but they still feel flatter than the rest of the system. They need better hierarchy, stronger section rhythm, and less dashboard energy. The pricing page already has the proof strip and stats row, so the gap is refinement and reuse, not invention.

4. **Shared content pages should inherit the same polish**
   Debates, insights, and public share pages should feel like part of the same publication, not adjacent app screens with slightly different styling.

5. **Mobile navigation and dense layouts need final QA**
   The responsive shell exists, but the remaining work is in density, line length, and touch ergonomics rather than a new aesthetic direction.

---

## Edward's Preferences

- Likes Direction A and C's color palette
- Open to going with gut vs research
- Wants redesign before cold emails so the live site does not break during outreach
- Interested in AI portraits on mind cards
- Interested in tech packs, but that work remains deferred

---

## Sources

- Dark Mode Statistics 2025-2026 (forms.app)
- SaaS Typography Best Practices (fullstop360)
- Custom Illustration ROI for SaaS (orbix.studio)
- Warm vs Cool Color Psychology 2026 (landingpageflow.com)
- SaaS UX Design Best Practices (designmodo.com)
