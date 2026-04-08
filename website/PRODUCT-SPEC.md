# Great Minds -- Website Product Specification

---

## 1. Product Vision

### Description

Great Minds is a content website and interactive AI platform where users encounter AI-generated articles that analyze current technology and business topics through the cognitive frameworks of history's greatest thinkers -- then converse with those frameworks directly. Each "mind" is a deeply encoded reasoning model (not a chatbot with personality) presented as an abstract archetype: "The Innovator," "The Philosopher," "The Scientist." The site functions as a living library where these frameworks collide with modern problems, producing analysis that neither a human writer nor a generic AI could replicate. The interface disappears; what remains is pure intellectual encounter.

### Target Users and Pain Points

**Primary: Ambitious generalists and decision-makers (founders, product leaders, strategists, senior engineers)**
- Pain: They know that reading biographies and philosophy would improve their thinking, but lack the time or the interpretive skill to extract actionable cognitive models from dense source material.
- Pain: Generic AI chat gives them average thinking. They want reasoning that is distinctively shaped by a specific intellectual tradition.
- Pain: Business media gives them takes; they want frameworks -- reusable mental structures that survive past the next news cycle.

**Secondary: Intellectually curious professionals and lifelong learners**
- Pain: They consume podcasts, newsletters, and book summaries, but these flatten complex thinking into listicles. They want to engage with deep reasoning, not consume shallow summaries.
- Pain: They want to pressure-test their own ideas against frameworks sharper than their own, but hiring a mentor or advisor is expensive and slow.

**Tertiary: Writers, educators, and content creators**
- Pain: They need fresh analytical angles on familiar topics. A framework-grounded analysis produces perspectives that feel genuinely novel.

### Core Value Proposition

Access to rare cognitive tools -- reasoning patterns that took a lifetime to develop, translated into interactive frameworks that think alongside you about problems their originators never faced. The articles prove the frameworks work. The chat lets you wield them yourself.

---

## 2. Feature List

### F1. Framework-Driven Article Engine
AI-generated long-form articles where a specific framework analyzes a current topic. Each article names the archetype ("The Innovator analyzes...") and exposes the reasoning structure visibly -- the reader sees not just what the framework concludes, but how it reasons. Articles are generated via Claude API using framework JSON system prompts.

- **Priority:** P0 (MVP)
- **AI Integration:** Claude API generates articles from framework JSON + topic prompt. The framework's bipolar constructs and perceptual lens shape the analysis, producing reasoning that generic prompting cannot.

### F2. Interactive Framework Chat
A conversational interface where users engage directly with a selected framework. The chat is not a Q&A bot; it reasons through the user's problem using the framework's documented decision patterns, constructs, and values hierarchy. The system prompt is loaded dynamically from the framework JSON file.

- **Priority:** P0 (MVP)
- **AI Integration:** Claude API with framework-specific system prompts. Each message passes through the full framework context (perceptual lens, bipolar constructs, behavioral implications). Conversation history maintained in session.

### F3. Framework Index ("The Library")
The homepage experience: a curated gallery of available frameworks presented as intellectual presences, not product cards. Each framework has a name (archetype), a domain, a one-line perceptual lens statement, and a count of published articles. Adding a new framework means adding a JSON file; the index renders automatically.

- **Priority:** P0 (MVP)
- **AI Integration:** Framework metadata (perceptual lens, domain, constructs) is read directly from the JSON files and displayed as living descriptions.

### F4. Article Detail with Framework Annotation Layer
When reading an article, users see subtle inline annotations that reveal which construct or reasoning pattern drove a particular passage. Hovering or tapping an annotation expands the underlying framework logic. This transforms reading from passive consumption into active framework study.

- **Priority:** P1 (important)
- **AI Integration:** During article generation, Claude tags passages with the specific constructs they derive from. The frontend renders these as interactive annotations.

### F5. "Ask This Mind About Anything" -- Topic Submission
Users submit a topic or question, select a framework, and receive a generated analysis. This is the bridge between passive reading and active use. Submitted topics also feed the editorial pipeline -- popular submissions become full articles.

- **Priority:** P1 (important)
- **AI Integration:** Claude API generates a focused analysis (shorter than a full article) using the selected framework's system prompt. Rate-limited per session to manage API costs.

### F6. Framework Collision Articles
Articles where two frameworks analyze the same topic from opposing cognitive positions. "The Innovator vs. The Philosopher on whether AI should replace human designers." These collision pieces expose the genuine differences between reasoning traditions and are the site's highest-engagement content format.

- **Priority:** P1 (important)
- **AI Integration:** Two separate Claude calls (one per framework), then a third call that weaves the outputs into a structured debate format. The collision reveals construct-level disagreements, not surface-level opinion differences.

### F7. Reading Experience: Distraction-Free Typography
A reading view engineered for sustained intellectual engagement. No sidebars, no pop-ups, no share buttons competing for attention. Long-form typography optimized for screen reading: generous line height, constrained measure (65-75 characters), carefully chosen serif/sans pairing. The content occupies the full cognitive field.

- **Priority:** P0 (MVP)
- **AI Integration:** None directly. This is the canvas on which AI-generated content earns trust.

### F8. Framework Transparency Panel
A collapsible panel on each framework's page that exposes its structure: the perceptual lens, the bipolar constructs, the behavioral implications. Full transparency about what the framework notices first, what it ignores, and how it makes trade-offs. This is both an honesty mechanism and a teaching tool.

- **Priority:** P1 (important)
- **AI Integration:** Renders directly from the framework JSON. No generation needed -- the framework's own structure is the content.

### F9. Dark/Light Mode with "Library" Atmosphere
Two carefully crafted visual modes. Light mode: warm parchment tones that evoke a reading room. Dark mode: deep charcoal with warm amber accents that evoke late-night study. The toggle is seamless and respects system preference. Both modes maintain the "library of living minds" atmosphere.

- **Priority:** P1 (important)
- **AI Integration:** None.

### F10. Legal Disclaimer and Framework Attribution System
A persistent but unobtrusive disclaimer system. Every framework page and article carries a footer note: "This framework is an abstract reasoning model. It is not affiliated with, endorsed by, or representative of any real individual." The archetype naming convention ("The Innovator," not a person's name) is enforced at the data level -- framework JSON files use archetype names as the public-facing identity.

- **Priority:** P0 (MVP)
- **AI Integration:** System prompts include instructions to never reference the source individual by name in generated content. The framework JSON includes both internal `person` (for research tracking) and public `archetype_name` (for display).

### F11. "How This Mind Thinks" -- Interactive Construct Explorer
A visual, interactive representation of a framework's bipolar constructs. Users see the construct dimensions as spectrums and can explore how the framework would shift its reasoning if a construct weighting changed. This is the "wow factor" feature: it makes invisible cognitive structures tangible and explorable.

- **Priority:** P2 (nice-to-have)
- **AI Integration:** Claude generates short behavioral predictions for different construct positions. "If The Innovator weighted 'open platform dynamics' more heavily than 'controlled experience curation,' the analysis of this topic would shift from X to Y."

### F12. Content RSS Feed and SEO Optimization
Auto-generated RSS feed for all published articles. Full SEO metadata: Open Graph tags, structured data (Article schema), semantic HTML, server-side rendering via Next.js. Each article is a standalone, indexable, shareable URL. The site's growth strategy is organic -- great content that ranks and spreads.

- **Priority:** P1 (important)
- **AI Integration:** Claude generates SEO-optimized meta descriptions and titles during article creation.

### F13. Session-Based Chat History
Chat conversations persist within a browser session so users can revisit earlier exchanges without re-establishing context. No accounts required -- the experience is frictionless. History is stored in browser sessionStorage and cleared on tab close.

- **Priority:** P1 (important)
- **AI Integration:** Conversation history is passed as context to subsequent Claude API calls within the session.

### F14. Framework Comparison View
A side-by-side view showing how two or more frameworks differ on their core constructs, perceptual lenses, and what they notice vs. ignore. Not a generated article, but a structural comparison rendered directly from framework JSON data. Helps users choose which mind to consult.

- **Priority:** P2 (nice-to-have)
- **AI Integration:** Optional: Claude generates a brief narrative summary of the key differences between selected frameworks.

---

## 3. Technical Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS with a custom design token system (colors, typography, spacing defined as Tailwind theme extensions)
- **Key Libraries:**
  - `next-mdx-remote` or raw MDX for article rendering with custom components (annotation overlays, construct callouts)
  - `framer-motion` for subtle, purposeful animations (page transitions, panel reveals)
  - `next-themes` for dark/light mode
  - `react-markdown` for rendering chat responses with formatting

### Backend
- **Runtime:** Next.js API Routes (Route Handlers in App Router)
- **AI Provider:** Anthropic SDK (`@anthropic-ai/sdk`) calling Claude
- **Database:** None initially. Content is file-based:
  - Framework definitions: `/frameworks/{archetype-slug}/framework.json`
  - Published articles: `/content/articles/{slug}.json` (generated, then stored as static files)
  - No user data persisted server-side
- **Future database path:** When user accounts or saved chats are needed, add a lightweight solution (Vercel KV or Vercel Postgres)

### API Structure (REST)
All endpoints are Next.js Route Handlers under `/app/api/`:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Send message to a framework chat session. Body: `{ frameworkSlug, messages[], userMessage }`. Returns streamed Claude response. |
| `/api/generate-analysis` | POST | Generate a short analysis for a user-submitted topic. Body: `{ frameworkSlug, topic }`. Returns streamed response. |
| `/api/frameworks` | GET | List all available frameworks (reads from filesystem). |
| `/api/frameworks/[slug]` | GET | Get full framework metadata for display. |
| `/api/articles` | GET | List published articles with metadata. Query params: `framework`, `limit`, `offset`. |
| `/api/articles/[slug]` | GET | Get a single article's full content. |

### Authentication
- **MVP: None.** No user accounts. The site is fully public. Chat and analysis features are rate-limited by IP or session token (stored in a cookie).
- **Rate Limiting:** Implement via Vercel Edge Middleware or in-route logic. Free tier: 10 chat messages per session, 3 topic submissions per day.
- **Future:** Optional accounts via NextAuth.js if saved chat history or premium tiers are added.

### Deployment
- **Platform:** Vercel
- **Build:** Static generation (ISR) for article pages, server-side for API routes
- **Environment Variables:** `ANTHROPIC_API_KEY` stored in Vercel environment settings
- **Edge Functions:** Rate limiting middleware runs at the edge for low latency
- **Content Strategy:** Articles are pre-generated and committed as JSON/MDX files, enabling static builds. Chat and analysis are dynamic API routes.

---

## 4. Data Model

### Core Entities

```
Framework
  |-- has many --> Articles
  |-- provides context for --> Chat Sessions
  |-- compared in --> Framework Collisions (Article subtype)
```

### Framework (file: `/frameworks/{slug}/framework.json`)
| Field | Type | Description |
|---|---|---|
| `slug` | string | URL-safe identifier, e.g., `the-innovator` |
| `archetype_name` | string | Public display name: "The Innovator" |
| `archetype_title` | string | Short descriptor: "Paradigm-Shifting Product Visionary" |
| `domain` | string | Area of expertise: "Technology, Design, Business" |
| `internal_person` | string | Research reference only, never displayed publicly |
| `perceptual_lens` | object | What this mind notices first, what it ignores, evidence |
| `bipolar_constructs` | array | 8-12 construct dimensions with poles and behavioral implications |
| `system_prompt` | string | Full system prompt for Claude API calls (or path to .txt file) |
| `generated_utc` | string | ISO timestamp of framework generation |
| `source_count` | number | Number of primary/secondary sources used |
| `incident_count` | number | Number of documented decision incidents analyzed |

### Article (file: `/content/articles/{slug}.json`)
| Field | Type | Description |
|---|---|---|
| `slug` | string | URL-safe identifier |
| `title` | string | Article headline |
| `subtitle` | string | One-line summary |
| `framework_slug` | string | Which framework authored this |
| `framework_name` | string | Archetype display name |
| `topic` | string | The real-world topic analyzed |
| `content` | string | Full article body (Markdown) |
| `construct_annotations` | array | Passages tagged with which construct drove them |
| `generated_utc` | string | When the article was generated |
| `word_count` | number | For reading time estimation |
| `meta_description` | string | SEO meta description |
| `meta_title` | string | SEO title tag |
| `type` | enum | `solo` | `collision` | `collaboration` |
| `collision_frameworks` | array | For collision articles: slugs of participating frameworks |

### Chat Message (client-side only, sessionStorage)
| Field | Type | Description |
|---|---|---|
| `id` | string | UUID |
| `framework_slug` | string | Active framework |
| `role` | enum | `user` | `assistant` |
| `content` | string | Message text |
| `timestamp` | string | ISO timestamp |

### Framework Display Config (derived, not stored separately)
| Field | Type | Description |
|---|---|---|
| `color_accent` | string | Unique accent color for this framework's pages |
| `icon` | string | Abstract icon/symbol representing the archetype |
| `article_count` | number | Computed from articles directory |

---

## 5. User Flows

### Flow 1: First Visit -- Discovery and First Read

1. User arrives at the homepage (likely from a shared article link or search).
2. They see the site title, a single sentence of purpose, and the Library -- a grid of available frameworks, each showing the archetype name, domain, and perceptual lens excerpt.
3. No signup wall, no pop-up, no cookie banner beyond legal minimum. The content is immediately accessible.
4. User is drawn to "The Innovator" and clicks through to the framework's page.
5. They see the framework's description, its core reasoning patterns (constructs shown as readable dimensions), and a list of recent articles.
6. They click an article: "The Innovator on Why the AI Hardware Race Is Already Over."
7. The reading view fills the screen. Clean typography. No distractions. They read.
8. Inline annotations glow subtly, revealing which construct drove each analytical move. They explore one or two.
9. At the article's end: a quiet prompt -- "Continue this conversation" -- links to the chat with The Innovator, pre-seeded with the article's topic.

### Flow 2: Interactive Chat Session

1. User navigates to The Innovator's chat (either from an article or from the framework page).
2. The chat interface is minimal: a text input at the bottom, the framework's name and a one-line lens statement at the top. No avatar, no fake typing animation.
3. User types: "I'm building a developer tools company. Should I go open-source or proprietary?"
4. The framework responds with structured reasoning that explicitly surfaces its constructs: "Through the lens of controlled experience curation versus open platform dynamics..." The response is substantive, opinionated, and grounded in the framework's documented patterns.
5. User follows up: "But the market expects open source in dev tools now."
6. The framework pushes back using its perceptual lens -- it notices paradigm-shifting potential and challenges the assumption that market expectations should constrain strategy.
7. Chat history persists in the session. User can scroll back, copy passages, and continue later (within the same browser session).

### Flow 3: Topic Submission and Analysis

1. User clicks "Ask This Mind" on any framework page.
2. A focused input appears: "What question should The Innovator think about?"
3. User types: "Should Apple build its own search engine?"
4. A loading state shows (streaming response). Within seconds, a 400-600 word analysis appears, structured with the framework's reasoning made visible.
5. A note at the bottom: "Found this useful? This kind of analysis becomes a full article when enough people ask about it."
6. Rate limit: after 3 submissions per day, a gentle message appears explaining the limit and inviting them to return tomorrow.

### Flow 4: Framework Collision Discovery

1. User browses the articles index and notices a "Collision" tag on an article.
2. They click: "The Innovator vs. The Philosopher: Should AI Systems Have Aesthetic Preferences?"
3. The article opens with a brief framing of the question, then alternates between the two frameworks' analyses, each clearly attributed to its archetype.
4. Points of genuine disagreement are highlighted -- not manufactured conflict, but real divergence in how the frameworks perceive the problem.
5. A synthesis section at the end identifies what each framework reveals that the other misses.
6. At the bottom: links to chat with either framework to continue exploring the disagreement.

### Flow 5: Framework Exploration (Transparency)

1. User clicks "How This Mind Thinks" on a framework page.
2. The transparency panel expands, showing the full construct structure in a readable format.
3. Each construct is displayed as a labeled spectrum (e.g., "Controlled experience curation <---> Open platform dynamics").
4. Behavioral implications are shown beneath each construct: "When facing X, this framework tends to Y."
5. The perceptual lens is shown prominently: "Notices first: [X]. Tends to ignore: [Y]."
6. User gains genuine understanding of the framework's intellectual structure -- not just what it says, but how it is built.

---

## 6. Design Direction

### Visual Style: Intellectual Minimalism

Not "clean SaaS." Not "creative agency." The visual language is **scholarly calm with modern precision** -- the feeling of a well-curated private library that happens to exist on a screen. Every element breathes. White space is not empty; it is architectural. The design evokes the experience of opening a beautifully typeset book, not logging into a dashboard.

The design differentiator: **the interface disappears.** There are no competing visual elements. No notification badges, no hamburger menus hiding complexity, no feature announcements. The user's attention goes entirely to ideas. If a UI element cannot justify its existence in one glance, it is removed.

### Color Palette

**Light Mode ("The Reading Room")**
- Background: `#FAF8F5` -- warm off-white, the color of quality paper
- Primary text: `#1A1A1A` -- near-black, high contrast without harshness
- Secondary text: `#6B6B6B` -- warm gray for metadata, timestamps, annotations
- Accent: `#C45D3E` -- burnt sienna, used sparingly for active states and framework identity markers
- Surface: `#F0EDE8` -- slightly darker warm tone for cards and panels
- Border: `#E5E0DA` -- barely visible, structural only

**Dark Mode ("The Late Study")**
- Background: `#161616` -- deep charcoal, not pure black
- Primary text: `#E8E4DF` -- warm off-white, easy on the eyes
- Secondary text: `#8A8580` -- muted warm gray
- Accent: `#E07A5F` -- warm terracotta, slightly brighter than light mode to maintain visibility
- Surface: `#1E1E1E` -- subtle elevation
- Border: `#2A2A2A` -- minimal separation

**Per-Framework Accent Colors** (each mind gets a unique accent, applied to its pages and articles):
- The Innovator: `#C45D3E` (burnt sienna -- intensity, conviction)
- The Philosopher: `#5B7B6A` (sage green -- contemplation, depth)
- The Scientist: `#4A6FA5` (steel blue -- precision, curiosity)
- (Future frameworks receive unique accents from this curated palette)

### Typography

**Heading Stack:** A high-quality serif for intellectual authority.
- Primary: `Newsreader` (Google Fonts, variable) or `Lora` -- literary, confident, excellent at large sizes
- Used for: article titles, framework names, section headings, the site wordmark

**Body Stack:** A humanist sans-serif for comfortable long-form reading.
- Primary: `Source Sans 3` (Google Fonts, variable) or `Inter` -- warm, highly legible, optimized for screens
- Used for: article body, chat messages, descriptions, UI text

**Monospace** (code and data contexts): `JetBrains Mono` -- clean, distinctive ligatures

**Type Scale:**
- Article body: 18px / 1.75 line-height (generous for sustained reading)
- Measure: max-width 680px (65-75 characters per line)
- Headings: bold, tight letter-spacing, generous top margin to create breathing room

### Key UI Patterns

**The Library (Homepage)**
- A grid of framework cards, but not "cards" in the SaaS sense. Each framework is a typographic block: archetype name large, domain small, perceptual lens excerpt as a pull quote. Minimal borders. The grid breathes. Feels like a table of contents, not a product catalog.

**Article View**
- Full-width content column, centered, no sidebar. Title and framework attribution at the top. Body text fills the screen. Annotations are inline, subtle (small superscript markers that expand on hover/tap into side panels, not pop-ups). Reading progress shown as a thin accent-colored bar at the very top of the viewport.

**Chat Interface**
- Minimal to the point of austerity. Framework name and one-line lens at the top. Messages stack cleanly. User messages are right-aligned, framework responses left-aligned. No avatars, no timestamps visible by default. The conversation feels like a direct channel to the framework's reasoning, not a customer support widget.

**Framework Page**
- Hero section: archetype name, title, domain. No hero image. The perceptual lens statement is the visual centerpiece, rendered as a large pull quote. Below: construct explorer (interactive in P2, static list in P0). Below that: article list.

**Navigation**
- Minimal top bar: site wordmark (left), "Library" and "About" links (right), dark/light toggle (far right). No search bar on MVP (the content volume does not warrant it). Navigation is nearly invisible -- the content is the interface.

**Transitions and Motion**
- Page transitions: subtle fade (200ms). No sliding, no bouncing, no parallax.
- Panel reveals (annotations, construct explorer): smooth height animation.
- Loading states: a single thin line animating across the top of the viewport (accent color).
- Philosophy: motion confirms that something happened. It never entertains.

### Legal and Disclaimer Design
- Disclaimers are present but do not dominate. A single line in the site footer: "All frameworks are abstract reasoning models derived from documented sources. They are not affiliated with, endorsed by, or representative of any living or deceased individual."
- Each framework page repeats this in smaller text beneath the archetype description.
- The design treats disclaimers as a mark of intellectual honesty, not a liability afterthought.

---

## Appendix: MVP Scope Summary

The MVP (P0 features) delivers:
1. A homepage listing available frameworks from the filesystem
2. Framework detail pages with metadata and construct display
3. At least 3-5 pre-generated articles for The Innovator
4. A distraction-free article reading experience
5. Interactive chat with The Innovator (session-based, no auth)
6. Legal disclaimers throughout
7. Dark/light mode
8. Deployed on Vercel, fully functional

This is enough to validate the core thesis: that deeply encoded reasoning frameworks, expressed through AI, produce content and interactions that are measurably more interesting than generic AI output.

Everything after MVP exists to prove that thesis at scale.
