# Sprint 1: Foundation + Reading Surfaces

## Objective
Track the shipped public surface: the council-style home page, framework catalog, framework detail pages, and the long-form reading views that replaced the original bootstrap-era "The Innovator" story.

## Features to Implement
1. **Project scaffolding** - Next.js App Router, Tailwind, custom typography tokens, `next-themes`, and the shared site chrome are already in place.
2. **Framework index** - The live `/frameworks` page is the catalog entry point, showing the current mind roster, pack groupings, and perceptual lens excerpts.
3. **Reading views** - The shipped article-style surfaces are `/insights/[slug]` and `/agora/a/[id]`, both using constrained typography and metadata-aware layouts.
4. **Legal disclaimer system** - The footer disclaimer is live on every page and the site is already using public-safe framework labels.
5. **Dark/light mode** - The header toggle exists and persists across navigation, but it is still manual rather than system-following.
6. **Seed content** - The original "The Innovator" placeholder has been superseded by the broader historical council roster.

## Success Criteria (Evaluator will verify these)
- [x] Home page renders a live framework/council gallery with multiple shipped minds
- [x] Each framework card shows the mind name, domain, and perceptual lens excerpt
- [x] Clicking a framework navigates to a detail page with description, lens, counts, and a CTA into Agora
- [x] Clicking an insight or debate transcript opens a reading view with constrained typography
- [x] Dark/light mode toggle works and persists across navigation
- [x] Legal disclaimer is visible in the footer on every page
- [x] The site runs without console errors on `npm run dev` in the shipped flow
- [x] Mobile responsive behavior is part of the shipped baseline for the home, framework, and reading pages
- [ ] The original `The Innovator` seed-content wording is no longer accurate and should not be treated as the live contract
- [ ] System-following theme behavior is still a gap because the current toggle is manual

## Technical Requirements
- Next.js App Router with filesystem-backed framework data
- `next-themes` for the manual light/dark toggle
- Typography and metadata already wired through the root layout and per-route metadata APIs
- The live content surface is now the council/agora/insights set, not the original single-framework bootstrap

## Design Requirements
- The live visual language is the private-library / council aesthetic, not the old bootstrap spec
- Framework detail pages and reading views already use restrained typography and narrow measure
- The remaining design gap is a true system-aware theme default, if that is still desired

## Out of Scope
- Dedicated chat UI (see Sprint 2, but the shipped product uses Agora debate instead)
- Transparency toggle and annotation overlays (Sprint 3)
- RSS and collision articles (Sprint 4)
