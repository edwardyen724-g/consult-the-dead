# Sprint 3: Framework Depth + Topic Submission

## Objective
Add the framework transparency panel, article annotation layer, and topic submission feature. These features transform the site from "chatbot + articles" into "interactive intellectual exploration."

## Features to Implement
1. **F8: Framework Transparency Panel** — Collapsible panel on each framework's page showing its full structure: perceptual lens, bipolar constructs as labeled spectrums, behavioral implications. Rendered directly from JSON — no AI generation needed. "How This Mind Thinks" toggle.
2. **F4: Article Annotation Layer** — Subtle inline markers in articles that reveal which construct or reasoning pattern drove a particular passage. Hover/tap expands the underlying framework logic. Transforms reading from passive consumption into active framework study.
3. **F5: "Ask This Mind" Topic Submission** — Focused input on framework pages: "What question should The Innovator think about?" Generates 400-600 word analysis using Claude API with the framework's system prompt. Rate limited: 3 per day per session.
4. **Topic Submission API** — POST `/api/generate-analysis` accepts `{ frameworkSlug, topic }`, returns streamed analysis response.
5. **Framework Detail Page Enhancement** — Add article count, construct count, and "Ask This Mind" CTA to the framework detail page.

## Success Criteria (Evaluator will verify these)
- [ ] Framework page has a "How This Mind Thinks" toggle that reveals the transparency panel
- [ ] Transparency panel shows the perceptual lens statement prominently
- [ ] Transparency panel shows bipolar constructs as readable dimensions with both poles
- [ ] At least one article has inline annotations that expand on hover/click
- [ ] "Ask This Mind" input is visible on the framework page
- [ ] Submitting a topic returns a streamed analysis grounded in the framework's reasoning
- [ ] After 3 topic submissions, a rate limit message appears
- [ ] All new features work in both dark and light modes
- [ ] Mobile: transparency panel is readable, annotations work on tap

## Technical Requirements
- Transparency panel reads from framework JSON (constructs, lens, etc.)
- Annotation data stored in article JSON as `construct_annotations` array
- Seed at least one article with annotation data for testing
- `/api/generate-analysis` route with streaming response
- Rate limiting for topic submission: 3/day tracked in sessionStorage with date check
- Annotations: CSS-only hover/focus states preferred, JS fallback for mobile tap

## Design Requirements
- Transparency panel: clean layout, constructs shown as labeled spectrums or dimensions
- Each construct shows: dimension name, positive pole, negative pole, behavioral implication
- Annotations: subtle highlight (underline or background tint), expand inline on interaction
- Expanded annotation: small callout showing construct name + how it drove the passage
- "Ask This Mind" input: prominent but not aggressive, fits the library aesthetic
- Analysis output: same typography as articles, streamed in progressively

## Out of Scope
- Interactive construct explorer (P2, deferred)
- Collision articles (Sprint 4)
- SEO/RSS (Sprint 4)
- Framework comparison view (P2, deferred)
