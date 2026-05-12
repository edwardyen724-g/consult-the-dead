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
- a framed `/agora` entry layer that introduces the council flow before the live app state begins
- a public `/agora/a/[id]` share surface that already exists as a shipped product surface, including the transcript-link copy button
- a tightened share CTA strip on the Agora result surface (commit `ef96ee1a`, master, 2026-05-12)
- an email capture modal (`data-testid="email-capture-modal"`) shown to free users at the consensus stage (Beehiiv, shipped PR #244)
- a quota-countdown nudge (`data-testid="quota-countdown-nudge"`) shown when a free user has exactly 1 agon remaining (PR #302)
- a pricing page that already carries a live-seeded stats bar (`data-testid="pricing-stats"`, server-seeded from `getPricingStats()` then revalidated via `/api/stats`), a scenario-based social-proof strip (`SOCIAL_PROOF` constant — three anonymized decision topics), and a strong Pro CTA with trust badge (`data-testid="pro-cta-trust-badge"`) and UTM forwarding into the Stripe checkout (all shipped, master, 2026-05-12)
- a `/quiz` page with locked copy and personalized routing via `buildQuizModel` and `QUIZ_ROUTE_GROUPS` — decision type maps to best-fit council pack (PR #335, master, 2026-05-12)
- **LibraryProofStrip** (`website/src/components/LibraryProofStrip.tsx`) shipped in PR #184 and is rendered on the `/library` page below the title, showing "X minds consulted · Y saved debates" as a compact monospaced stat bar; callers own the data-loading lifecycle and pass a `LibraryProgressStats` prop
- **Transcript share helper** (`website/src/lib/share-transcript.ts`) shipped in PR #180; `buildTranscriptShareText` formats a pull-quote excerpt with a canonical `/agora/a/[id]` URL and attribution line into a clipboard-ready share blob, capped at 280 characters to fit share previews
- the remaining work on this layer is surface-specific polish and parity, not inventing another helper layer
- `/debates` and `/insights` are already on the publication-system baseline and should not be re-opened as active visual-parity gaps

Pricing social proof stays on a narrow contract: the live stats row plus the
anonymized scenario cards. Do not reintroduce testimonial-style placeholders or
invented customer quotes until they are actually approved and shipped.

That means the memo should track the live site, not the original brainstorming mockups. The remaining work is a narrow set of publication-surface refinements, not a fresh visual system.

## Current In-Flight Surface Map

1. `/quiz` and the header entry path
   - **Shipped (PR #335, master, 2026-05-12):** Quiz routing by decision type is live. `QUIZ_ROUTE_GROUPS` maps decision categories to best-fit packs; `buildQuizModel` drives the `QuizFlow` component. Quiz page copy is locked: eyebrow "Decision clarity first", headline "Name the decision before you pick the council.", routing hint "The guided quiz narrows the room before it opens Agora." Regression tests cover both the copy and routing behaviour (commit `95a7062f`).
   - Remaining: the `wanman/homepage-hero-decision-first` open PR includes a first-scroll demo preview on the homepage that further integrates with the quiz entry path. Until that merges, the "Not sure who to ask? →" secondary CTA on the homepage links to `/quiz` via `buildQuizEntryHref()`.
   - Keep scoped to the live decision-entry experience, not a new homepage redesign.

2. `/agora` mobile, empty, and error states
   - In flight: the remaining live-flow hardening work is in `adcba12c` ("Harden Agora mobile, empty, and error states") and the regression follow-up `0bd70ca0`.
   - This is state polish on the shipped debate flow, not a broader redesign of the route.

3. Pricing preview metadata and release-note gating
   - **Pricing page shipped (master, 2026-05-12):** The Pro CTA (`"Start 7-day Pro trial"`, amber button) is live with a trust badge (`data-testid="pro-cta-trust-badge"`) and UTM forwarding. The social-proof strip (`SOCIAL_PROOF` constant — three anonymized decision topics) and live stats row (`data-testid="pricing-stats"`) are all on master. Pricing proof is cleanly separated from testimonial placeholders per the guardrail.
   - In flight: `bb399f47` ("Re-verify pricing preview metadata before publishing the release note") blocks the release-note follow-ups `b1c60e21`, `b58f3321`, `a15f6e3f`, and `5abe8ca0`.
   - Guardrail: keep release-state lanes like preview metadata and the linked release-note work in the release-state bucket, not in the active visual-gap narrative.

4. Public-share regression work
   - In flight: `4f4bf881` ("Add regression coverage for public Agora share metadata and CTA attribution") plus `5de76e09` ("Add regression coverage for Agora share metadata helpers") keep the public share contract honest.
   - The preview/runbook side is already covered by `61a28eb2`, `620812b9`, and `5956421b`, so this bucket is about preventing drift rather than inventing a new share surface.

5. Publication-system consolidation
   - In flight: `/pricing`, `/account`, `/library`, and `/agora/a/[id]` still need to read like one publication system.
   - `/library` now carries the shipped `LibraryProofStrip` stat bar (PR #184); the open work is rhythm and density convergence with the other publication-style pages, not adding a proof surface.
   - `/debates` and `/insights` are already shipped on the publication-system baseline, so they stay out of the active gap list.
   - This is consolidation work, not a new visual direction.
   - Do not pull the homepage hero or `/agora` transition work back into this bucket; those lanes are already covered elsewhere.

---

## Ranked Next-Batch Candidates

1. **Merge the homepage hero open PR.** `wanman/homepage-hero-decision-first` ships the deeper decision-first headline ("Make the call. History argues first.") and a first-scroll consensus excerpt blockquote. It builds on the already-merged quiz routing work. Once merged, homepage CTR and bounce rate become the primary leading signals for the decision-first copy hypothesis.
2. **Close the Agora mobile-state hardening pass.** `adcba12c` and `0bd70ca0` are the right place to finish the remaining empty/error/mobile polish on the shipped route.
3. **Unblock the pricing preview metadata gate.** `bb399f47` is the dependency; the release-note and operator-index follow-ups should stay behind it.
4. **Keep public-share metadata from drifting.** `4f4bf881` and `5de76e09` are the high-value regressions here because they protect the shipped share surface without re-opening the visual system.
5. **Unify the publication-style pages that are still genuinely open.** `/account`, `/library`, `/pricing`, and `/agora/a/[id]` should read like one publication system rather than adjacent app screens with similar tokens. Note: `/library` already has the LibraryProofStrip retention layer (PR #184) and the upsell nudge (PR #172 pending); `/agora/a/[id]` already has the pull-quote highlight card, transcript-share CTA, and transcript-link copy button shipped. The open work on these two pages is typographic rhythm, density, and parity — not inventing new retention helpers.

Guardrail: when a refresh mentions pricing preview metadata, public-share release notes, or other release-state launch work, keep that lane out of the active visual-gap list. Those items belong in release-state tracking, not in the design-research backlog.

Guardrail: do not re-queue LibraryProofStrip (PR #184) or the transcript share helper (PR #180) as open design work — both contracts are shipped; the remaining open surface work is publication-system parity and adoption measurement.

The homepage hero, `/debates`, and `/insights` are already shipped baseline; do not re-queue them here as active redesign ideas.

### Pages in scope on the live site

- `/` - homepage / landing
- `/agora` - main decision flow
- `/agora/a/[id]` - public shared decision result page
- `/frameworks` - council directory
- `/frameworks/[slug]` - individual framework pages
- `/quiz` - guided mind-picker
- `/debates` - sample debate index, already covered by publication-system alignment work
- `/debates/[slug]` - sample debate detail pages, already covered by publication-system alignment work
- `/insights` - decision insights index, already covered by publication-system alignment work
- `/insights/[slug]` - insight articles, already covered by publication-system alignment work
- `/pricing` - pricing and upgrade page
- `/account` - subscription, usage, and BYO key settings
- `/library` - saved debate archive for Pro users
- `/essay` - explanatory about page
- `/privacy` - privacy policy
- `/terms` - terms of service

Auth surfaces such as `/sign-in` and `/sign-up` are Clerk-managed, so they should be visually compatible, but they are not the primary design surface owned by the app.

---

## Remaining Redesign Gaps That Still Matter

1. **Homepage hero — partially shipped, open PR for deeper variant**
   The current master ships "You have a decision. / History has a council." (decision-first framing, PR #335 era). A deeper variant with a first-scroll consensus excerpt blockquote is on `wanman/homepage-hero-decision-first`. The remaining attention should be on merging that PR rather than opening a new homepage redesign. Secondary CTA ("Not sure who to ask? →") already routes to the quiz via `buildQuizEntryHref()`. Both hero CTA and footer CTA point to `/agora` with `utm_campaign=homepage_hero&utm_content=ask_your_question`.

2. **Interactive Agora states still need ceremony, not a new route**
   The remaining `/agora` work is mobile, empty, and error-state polish. It should feel more editorial and less functional, but the route itself is already shipped.

3. **The publication-system gap is now narrow**
   The genuinely open publication-surface work is the polish and consistency pass across `/pricing`, `/account`, `/library`, and `/agora/a/[id]`. The page inventory is not missing; the rhythm and density still need convergence. `/library` and `/agora/a/[id]` have their retention helpers shipped (LibraryProofStrip, transcript-share, and the copy-link button); do not treat those as an open design gap — they are part of the shipped baseline.

4. **Shared content pages stay out of the active gap list**
   `/debates` and `/insights` already belong to the publication-system baseline, so they should not be re-queued as active redesign work.

5. **Mobile and dense-layout QA is still a release risk**
   The responsive shell exists, but the remaining work is in density, line length, and touch ergonomics rather than a new aesthetic direction.

---

## Edward's Preferences

- Likes Direction A and C's color palette
- Open to going with gut vs research
- Wants redesign before cold emails so the live site does not break during outreach
- Interested in AI portraits on mind cards
- Interested in tech packs, but that work remains deferred

## Sources

- Dark Mode Statistics 2025-2026 (forms.app)
- SaaS Typography Best Practices (fullstop360)
- Custom Illustration ROI for SaaS (orbix.studio)
- Warm vs Cool Color Psychology 2026 (landingpageflow.com)
- SaaS UX Design Best Practices (designmodo.com)
