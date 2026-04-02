# Sprint 4: Polish, SEO, and Content Pipeline

## Objective
Add SEO infrastructure, RSS feed, collision article support, and overall polish. Make the site production-ready for Vercel deployment.

## Features to Implement
1. **F12: SEO + RSS** — Open Graph tags, structured data (Article schema), semantic HTML on all pages. Auto-generated RSS feed at `/feed.xml`. Each article is a standalone, indexable, shareable URL with proper meta tags.
2. **F6: Framework Collision Articles** — Support for articles where two frameworks analyze the same topic. Article JSON has `type: "collision"` and `collision_frameworks` array. Rendering alternates between frameworks with clear attribution and divergence highlights.
3. **F1 Enhancement: Article Engine** — CLI or script to generate new articles: takes a framework slug + topic, calls Claude API, saves output as article JSON with metadata. Not user-facing — an internal content pipeline tool.
4. **Production Polish** — Error boundaries, loading states, 404 page, favicon, og:image template, proper `<head>` metadata, accessibility audit (keyboard nav, ARIA labels, focus management).
5. **Vercel Deployment Config** — `vercel.json` if needed, environment variable documentation, ISR configuration for article pages.

## Success Criteria (Evaluator will verify these)
- [ ] Every page has proper `<title>`, `<meta description>`, and Open Graph tags
- [ ] `/feed.xml` returns valid RSS with all published articles
- [ ] At least one collision article renders with clear dual-framework attribution
- [ ] Collision article visually distinguishes between the two frameworks' reasoning
- [ ] 404 page renders for invalid routes
- [ ] Loading states are visible during chat and analysis generation
- [ ] All pages pass basic accessibility: keyboard navigable, no ARIA violations
- [ ] The site builds without errors (`npm run build`)
- [ ] Lighthouse performance score >= 80 on article pages

## Technical Requirements
- Next.js metadata API for per-page SEO (generateMetadata)
- RSS feed: generate at build time or as API route returning XML
- Collision articles: extend article JSON schema with `type` and `collision_frameworks`
- Article generation script: Node.js script in `/scripts/generate-article.ts`
- Error boundary: React error boundary wrapping main layout
- `next.config.js`: configure ISR revalidation for article pages

## Design Requirements
- Collision articles: each framework's sections marked with its accent color
- A subtle "vs" divider or alternating layout between framework perspectives
- 404 page: on-brand, minimal, suggests returning to the Library
- Loading states: subtle, no spinners — a gentle fade or skeleton that matches the library aesthetic
- Favicon: abstract mark that works at 16x16

## Out of Scope
- Interactive construct explorer (P2)
- Framework comparison view (P2)
- User accounts / authentication
- Payment / premium tiers
- Analytics integration (can be added post-launch)
