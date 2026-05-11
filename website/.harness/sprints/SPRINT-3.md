# Sprint 3: Framework Depth + Topic Submission

## Objective
Capture the shipped depth surface and the remaining planned gap. The framework detail page now exposes the lens, construct counts, validation, and a CTA into Agora, but the planned toggle/annotation/topic-submission interactions are not yet in the live UI.

## Features to Implement
1. **Framework depth sections** - `/frameworks/[slug]` already renders perceptual lens, construct counts, incident counts, validation, and pack membership chips.
2. **Insight articles** - `/insights/[slug]` is the shipped article-style deep dive with metadata, JSON-LD, construct dimensions, divergence, and blind spots.
3. **Topic submission** - The original free-form "Ask This Mind" prompt and `/api/generate-analysis` route are still unshipped.
4. **Transparency toggle** - The planned collapsible "How This Mind Thinks" panel has not been shipped as a toggle; the information is currently static sections.
5. **Annotation layer** - Inline article annotations are still a backlog item, not a shipped surface.

## Success Criteria (Evaluator will verify these)
- [x] Framework detail pages show perceptual lens, construct count, incident count, and a route into Agora
- [x] Insight pages show construct dimensions, divergence, and blind spots in a readable article format
- [x] Metadata-aware article pages are already generated for the shipped deep-dive routes
- [ ] There is still no toggle-based transparency panel on the framework page
- [ ] There is still no inline article annotation layer
- [ ] There is still no free-form topic-submission input with streamed analysis
- [ ] The `Ask This Mind` CTA remains a planned product idea, not the live contract

## Technical Requirements
- Framework and insight pages are filesystem-backed and already use route metadata
- JSON-LD Article markup is already present on the insight route
- The remaining planned work would need new UI state plus a new analysis API route

## Design Requirements
- Shipped deep-dive pages should stay readable and text-first
- Any future transparency/annotation work should reuse the same restrained reading aesthetic
- Keep the distinction clear between shipped static sections and planned interactive affordances

## Out of Scope
- Collision articles (Sprint 4)
- SEO/RSS (Sprint 4)
- Framework comparison view
