# Sprint 1: Foundation + Landing Experience

## Objective
Set up the Next.js project, build the landing page ("The Library"), framework detail page, and distraction-free article reading view with real content from the Steve Jobs framework.

## Features to Implement
1. **Project Scaffolding** — Next.js 14+ App Router, Tailwind CSS with custom design tokens (color palette from spec), Google Fonts (Newsreader + Source Sans 3), dark/light mode via next-themes
2. **F3: Framework Index ("The Library")** — Landing page that reads framework JSON files from `/frameworks/` and renders them as a curated gallery. Each framework shows archetype name, domain, perceptual lens excerpt. Must feel like entering a library, not a SaaS dashboard.
3. **F7: Distraction-Free Reading View** — Article detail page with optimized typography: 65-75 char measure, generous line height, serif/sans pairing. No sidebars, no competing elements. Content fills the cognitive field.
4. **F10: Legal Disclaimer System** — Footer disclaimer on every page: "These frameworks are abstract reasoning models. They are not affiliated with, endorsed by, or representative of any real individual." Framework JSON uses `archetype_name` for public display.
5. **F9: Dark/Light Mode** — Two crafted visual modes. Light ("The Reading Room": warm paper tones). Dark ("The Late Study": deep charcoal + amber). Respects system preference. Toggle in header.
6. **Seed Content** — Create a public-facing framework config for "The Innovator" derived from the existing Steve Jobs framework.json. Create 2 seed articles as static JSON files.

## Success Criteria (Evaluator will verify these)
- [ ] Homepage renders a framework gallery with at least one framework ("The Innovator")
- [ ] Each framework card shows archetype name, domain, and perceptual lens excerpt
- [ ] Clicking a framework navigates to its detail page showing description + article list
- [ ] Clicking an article opens a distraction-free reading view with proper typography
- [ ] Dark/light mode toggle works and persists across page navigation
- [ ] Legal disclaimer is visible in the footer on every page
- [ ] The site runs without console errors on `npm run dev`
- [ ] Mobile responsive: homepage and article view work on 375px width

## Technical Requirements
- Next.js 14+ with App Router (not Pages Router)
- Tailwind CSS with custom theme extending the spec's color palette
- Framework data loaded from filesystem at build time (using `fs` in server components)
- Articles stored as JSON in `/content/articles/`
- Google Fonts: Newsreader (headings) + Source Sans 3 (body)
- `next-themes` for dark/light mode

## Design Requirements
- Light background: `#FAF8F5`, dark background: `#161616`
- Primary text: `#1A1A1A` (light) / `#E8E4DF` (dark)
- Accent: `#C45D3E` (The Innovator's burnt sienna)
- Article reading: max-width ~680px, line-height 1.7-1.8, font-size 18-20px
- No hamburger menus, no notification badges, no feature announcements
- The design should feel like a private library, not a tech product

## Out of Scope
- Chat functionality (Sprint 2)
- API routes (Sprint 2)
- Framework transparency panel (Sprint 3)
- Annotation layer on articles (Sprint 3)
- Topic submission (Sprint 3)
- Collision articles (Sprint 4)
- SEO/RSS (Sprint 4)
