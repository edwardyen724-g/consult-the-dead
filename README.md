# Consult The Dead

> Multi-framework decision support, extracted from documented historical incidents. Not a persona. Not a clone.

This repo holds Consult The Dead: a Next.js debate app under [`/company-builder`](./company-builder) that runs your decisions through multiple historical-figure decision frameworks in parallel, and the extracted frameworks themselves under [`/frameworks`](./frameworks). Each framework is built from documented incidents using the Critical Decision Method, not scraped from speeches or letters.

The landing page lives in [`/website`](./website). The framework-extraction pipeline lives in [`/framework_forge`](./framework_forge).

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/agora` | Live product | Debate surface — pose a decision, seat 2–5 minds |
| `/frameworks/[slug]` | Public, static | Individual framework detail pages |
| `/listicles/[slug]` | Public, static-generated, SEO | 5 long-tail SEO pages (startup-pivot, career-change, leadership-crisis, investing-risk, product-strategy); each pre-fills the Agora council via UTM CTA |
| `/minds/[id]` | Public, static-generated, SEO | 25 per-mind landing pages (one per active framework); each includes how-they-argue, sample quotes, and UTM-linked /agora CTA |
| `/packs` | Public | Themed pack catalog — browse curated mind packs by domain with guided-quiz CTA |
| `/explore` | Public | Agon gallery — crawlable grid of public debate records |
| `/feed.xml` | Public | RSS feed for public debates and insights |
| `/pricing` | Public | Plan comparison and upgrade flow |
| `/library` | Pro, authenticated | Saved agon library |


Licensed under the MIT License. See [LICENSE](./LICENSE).
