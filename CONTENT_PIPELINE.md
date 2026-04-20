# Consult The Dead — Content Engine

**Status:** v1, source-of-truth. Updates here cascade to scheduled tasks + topic queue + production workflow.
**Owner:** Edward
**Last updated:** 2026-04-19

This doc is the operating manual for content + Instagram. It exists separately from `MARKETING_STRATEGY.md` (high-level GTM) so the day-to-day rules don't get buried.

---

## 1. North Star

Build organic discovery via two surfaces simultaneously:

1. **SEO-led articles** at `consultthedead.com/insights/{slug}` and `/decisions/{slug}` — long-form, framework-grounded, optimized for both Google ranking AND citation by AI agents (ChatGPT, Claude, Perplexity, Gemini)
2. **Instagram Reels** — short-form (25–40s), product-as-hero, distributed from a faceless brand account

Both surfaces feed the same end goal: **a stranger lands on agora.consultthedead.com and runs a real agon.**

---

## 2. The format we're committing to: Verdict Reel

Picked from research, not vibes. ([Full report sources at end of doc.](#sources))

### Why this and not the alternatives

- **AI talking-head avatars (HeyGen / Argil / Captions / Synthesia):** Meta's labeling system suppresses AI-flagged content reach by 15–80%. Audience sentiment in 2026 is actively negative on AI talking heads ("AI slop" detected within 5s). The product is already AI-driven; the *content* must read as human-made to avoid double-AI fatigue.
- **Quote cards:** saturated. ~400K-follower stoic-quote accounts already own this surface. We can't out-quote them.
- **Real-Edward talking head:** highest trust, but solo-founder bottleneck and your face isn't the product yet.
- **Pure faceless screen-rec / motion graphics:** good for some niches, but doesn't differentiate.

The Verdict Reel wins because **the product output IS the most cinematic asset we have.** Three historical figures debating, with their portraits and one-line verdicts cascading on screen, is exactly the kind of native Instagram visual people screenshot and DM. We're competing on a surface where nobody else has this asset.

### Verdict Reel skeleton (lock this template)

| Time | Element | What goes there |
|---|---|---|
| 0.0–1.5s | **Visual + text hook** | Identity, proof/specificity, or curiosity gap. See hook patterns §3. |
| 1.5–4s | **Setup** | The dilemma in one sentence. On-screen text + voiceover. |
| 4–22s | **Council pass** | 3 figures × ~6s each: name card → one-line position → cut. Visual = product UI cards animating in. |
| 22–27s | **Consensus** | Recommendation + the one tension that matters. ("They agreed on X but Marcus warned Y.") |
| 27–30s | **CTA** | "Run your own → link in bio" with motion arrow toward profile pic. |

**Hard rules:**
- Length: 25–40s. (15–30s = 5.8% engagement band; 31–60s = 4.9%; 90s+ drops to 3.2%.)
- Captions on-screen MANDATORY. ~50% of feed scrollers watch sound-off.
- Voiceover MANDATORY. Sound-on vertical video has 34.5% lower CPA than image; voiceover Reels deliver up to 13% higher incremental conversion.
- CTA at end-card AND in pinned comment AND bio link — never mid-roll (kills retention).

### The voiceover question — resolved 2026-04-20

**Open-source clone of Edward's voice using F5-TTS.** Picked over ElevenLabs (cost) and other open-source options (license issues — XTTS-v2 and Fish-Speech are non-commercial). F5-TTS is MIT licensed, ~30s reference audio is enough, runs at 5-10× real-time on a single GPU. Fallback if F5 is rough: **Chatterbox** (Resemble AI, also MIT). Avoid generic AI voices — they trigger the "AI slop" reaction.

### Visual style commitment

- Brand color palette: existing site amber + framework accent colors (machiavelli red, suntzu green, curie pale-green, etc.)
- Typography: site's Newsreader serif for figure names, JetBrains Mono for labels (matches the product, builds visual continuity site ↔ social)
- Animation: kinetic typography for text, card-shuffle animations for figure transitions (we already have similar in the landing demo — port to short-form)
- B-roll: actual Agora UI screen captures, NOT generic stock footage

---

## 3. Hook patterns (run all four weekly)

Pulled from 2026 hook-template analyses. Mix these — let watch-rate pick winners.

### A. Tension / threat
"You're about to fire your cofounder. Three minds in history made this exact call. They don't agree."

### B. Shortcut / promise
"How to make a hard decision in 90 seconds, using a method NASA actually uses to study experts."

### C. Proof / specificity
"This founder asked 7 dead historical figures whether to raise VC. 6 said no. Here's why."

### D. Identity
"If you're a founder who second-guesses every big call — this is for you."

**Curiosity gap + jump cut in first 3s = 72% more likely to go viral.** Always include a visual surprise in the first 3 seconds.

---

## 4. Posting cadence

| Surface | Cadence | Notes |
|---|---|---|
| **Instagram Reels (Verdict)** | 4–5/week | Daily would be better for algo but unsustainable solo. 4-5 is the floor. |
| **Instagram carousels** | 1/week | Save-bait companion. Multi-slide breakdown of one decision. Carousels: 61% CTR, 2.3× profile-visit lift. |
| **Instagram Stories** | Daily | Behind-the-scenes, polls, question stickers, screenshot of the day's agon. Low-effort, drives profile visits. |
| **SEO articles (`/insights/{slug}`)** | 2–3/week | Mix of evergreen (`how would Sun Tzu evaluate market entry`) and reactive (responding to trending events). Each ships with a corresponding Verdict Reel. |
| **`/decisions/{slug}` pages** | 1/week | Pain-state pages ("should I quit my job and start a company") → drops user into pre-loaded agon. Highest commercial intent. |

Each new article triggers: (a) Search Console URL inspection → "Request Indexing" within 24h, (b) corresponding Verdict Reel script generated for Edward's one-tap approval.

---

## 5. KPIs — what we track, what we ignore

### Ignore (vanity)
- Total likes
- Total followers
- Total views

### Track (signal, in priority order)

| KPI | Why | Benchmark (months 1-3) |
|---|---|---|
| **3-second view rate** | Diagnostic for the hook. Below 50% = video is dead, iterate hook. | ≥65% |
| **Sends / shares** | Mosseri's #1 reach signal; strongest indicator of new-audience exposure. | ≥1% of reach |
| **Saves** | Purchase-intent proxy. Carousels naturally over-index here. | ≥2% of reach for educational content |
| **Profile visits** | Bridge metric — view → consideration | 3–5% of reach (months 1–3), 8%+ once recognized |
| **Bio link clicks** | The conversion bridge. UTM-tagged so we attribute via Vercel Analytics. | 2–5% of profile visits |
| **Free agons started** | The one true north metric. Track via `?utm_source=instagram&utm_medium=reels` in bio link. | 10% of link clicks → run started in month 1 |
| **Email captures** | The durable asset. Daily Stoic / Farnam Street confirm: email is where the business lives. **Action: add email capture to consensus stage.** | n/a yet |

Healthy overall engagement rate for niche accounts in 2026 = 1.5–3%. Below 1% = content not landing → iterate hooks first, then thumbnails, then topics.

### Reporting cadence

The biweekly metrics report (`ctd-biweekly-metrics-report` scheduled task) ingests Vercel Analytics + agon counters. It will be extended in Phase 4 to also ingest Instagram Insights once the Graph API is wired.

---

## 6. The article side (SEO-led)

### Three article types

| Type | Path | Purpose | Volume |
|---|---|---|---|
| **Insight** | `/insights/{slug}` | "What would X say about Y" — captures pop-philosophy queries | 1-2 per week |
| **Decision** | `/decisions/{slug}` | Pain-state queries → drops into pre-loaded agon. Highest commercial intent. | 1 per week |
| **Method** | `/methods/{slug}` | Definitive long-form on real frameworks (CDM, Toulmin, OODA, Cynefin) | 1 per month, evergreen |

### Article structure (lock this template)

1. **Single declarative claim** in the first paragraph (AI agents quote first paragraphs)
2. **Cite specific framework constructs / incidents** — this is our moat. Generic AI articles can't do this; we have the framework JSONs.
3. **Address the search intent directly** — answer the question, then expand
4. **Internal link** to the Agora with a pre-loaded version of the same question
5. **Schema.org `Article` + `Person` JSON-LD** for AI-citability
6. **Length:** 800–1500 words. Long enough to be authoritative, short enough to ship 2-3/week.

### Article generation pipeline (Phase 1 to build)

```
topic from queue → AI draft → PR opened for Edward review → Edward edits + merges →
  ↓ auto on merge:
  - deploy
  - submit URL to Search Console for indexing
  - generate Verdict Reel script for the same topic
  - queue reel script for Edward's one-tap approval
```

### Quality bar — generic AI content gets penalized

Every article must:
- Cite at least 2 specific incidents from the framework JSON files (`frameworks/{slug}/incidents/incidents.json`)
- Reference at least 1 specific bipolar construct
- Open with a claim that doesn't appear in any other article
- End with the user's next action (run an agon, or read a related article)

Edward's review pass takes ~5 min/article. Don't skip it. Generic AI content kills the brand.

---

## 7. Tools stack

### Required

| Need | Tool | Why |
|---|---|---|
| **Voice clone** | F5-TTS (open source, MIT, ~30s ref) — fallback Chatterbox | Both MIT, both free; avoids ElevenLabs cost. **Skip XTTS-v2 and Fish-Speech — non-commercial license** |
| **Video editing** | CapCut Pro (~$8/mo) OR Descript ($16/mo) | Both have AI-assist but ship human-edited result |
| **Captions on-screen** | CapCut auto-captions OR Captions.ai | Either works |
| **B-roll: agon UI captures** | Built — screen rec the live product on agora.consultthedead.com | Native, on-brand |
| **Instagram Graph API** | Meta Business + FB Page + Dev App | Required for automated posting (Phase 3) |
| **Search Console** | Already set up | Index management |
| **UTM links** | URL builder, store in topic queue | Attribution |

### Considered and rejected
- **HeyGen, Synthesia, Captions, Argil avatars** — see §2
- **Stock voiceovers** — triggers AI-slop reaction
- **Generic stock footage** — kills our visual differentiation

### Email — resolved 2026-04-20: Beehiiv
- Newsletter platform, not transactional. Free up to 2,500 subs.
- Built-in growth tools (recommendations, monetization).
- Resend stays in the toolkit for future transactional needs (agon completion notifications, etc.) — different category.

---

## 8. Topic queue

Lives in [`topics.yaml`](topics.yaml) at repo root. Hand-curated to start (50+ entries seeded). Will be supplemented by trends-API-driven discovery in Phase 4.

Each entry:
```yaml
- slug: should-i-raise-vc-or-bootstrap
  type: decision  # insight | decision | method
  search_volume_estimate: high  # high | medium | low
  primary_query: "should I raise VC or bootstrap"
  secondary_queries:
    - "VC vs bootstrap pros and cons"
    - "when to raise venture capital"
  recommended_council: [niccolo-machiavelli, marie-curie, sun-tzu]
  hook_angles: [tension, proof]
  status: queued  # queued | drafting | shipped | killed
  shipped_at: null
```

---

## 9. Decision rules

### When to iterate vs kill

| Signal | Action |
|---|---|
| 3-sec view rate < 50% | Kill hook, try different pattern next time. Topic might still be good. |
| 3-sec view rate good, watch-time bad | Restructure middle. Council pass too slow? Cut to 4s/figure. |
| Watch-time good, profile visits low | CTA too weak. Make it explicit. |
| Profile visits good, link clicks low | Bio copy / link preview too vague. |
| Link clicks good, agons started low | Friction on the agora itself — review the topic-stage UX. |
| Comments asking "what is this?" | We're attracting curious passers-by but not converting. Need stronger explainer in profile bio + Stories highlights. |

### When to scale a winner

If a Reel hits 3× our typical reach AND the topic has search volume:
1. Spin up the corresponding `/decisions/{slug}` page if it doesn't exist
2. Write a long-form `/insights/{slug}` companion article
3. Make a carousel version (different angle, same topic)
4. Cross-post the highlights to LinkedIn and X

### What we don't do

- Buy followers
- Buy engagement
- Engagement pods
- Spammy comment cross-posts on other accounts
- "Comment your decision below" prompts (low-signal noise; ask question stickers in Stories instead)
- Post AI talking-head reels (see §2)

---

## 10. Open decisions — resolved 2026-04-20

1. ~~Voice~~ → **F5-TTS** (open source clone of Edward's voice). Fallback: Chatterbox.
2. ~~Email~~ → **Beehiiv** (newsletter, free 2.5k subs). Resend reserved for future transactional.
3. ~~`/decisions/` slug pattern~~ → **pre-loaded cached agons.** Build-time script generates one real agon per slug, saves to JSON, page renders the actual debate + "run YOUR variation" CTA.
4. ~~Instagram handle~~ → **@consultthedead** (defensive registrations: `@consultthedead_official`, `@theconsultthedead`). Bio mitigation copy required: "Historical decision frameworks. Not mediumship."
5. ~~First topic batch~~ → seeded in [topics.yaml](topics.yaml). Edward to review and adjust before Phase 1 starts publishing.

The remaining unresolved item is Edward's review of the topics.yaml seed list before we start auto-generating articles from it.

---

## Sources

Research backing the format pick:
- [Socialinsider 2026 Instagram Benchmarks](https://www.socialinsider.io/social-media-benchmarks/instagram)
- [InfluenceFlow Instagram Engagement Benchmark 2026](https://influenceflow.io/resources/instagram-engagement-rate-benchmark-complete-2026-guide-for-creators-brands/)
- [Loopex Instagram Reels Statistics 2026](https://www.loopexdigital.com/blog/instagram-reels-statistics)
- [Napolify carousels vs reels](https://napolify.com/blogs/news/carousels-vs-reels)
- [Napolify Instagram AI Label Policy](https://napolify.com/blogs/news/instagram-ai-label-policy)
- [Hootsuite 18 social media trends 2026](https://blog.hootsuite.com/social-media-trends/)
- [MarketingBlocks 50 viral hook templates 2026](https://www.marketingblocks.ai/50-viral-hook-templates-for-ads-reels-tiktok-or-captions-2026-frameworks-examples-ai-prompts-included/)
- [Tapmy link-in-bio CTR benchmarks 2026](https://tapmy.store/blog/link-in-bio-click-through-rate-benchmarks-by-platform-2026-data)
- [Daily Stoic profile](https://www.instagram.com/dailystoic/), [Farnam Street profile](https://www.instagram.com/farnamstreet/)
- [Why FS optimizes for loyalty not pageviews](https://medium.com/the-mission/why-farnam-street-optimizes-for-loyalty-not-pageviews-cf292eaadb1c)
- [Meta Transparency Center: Labeling AI Content](https://transparency.meta.com/governance/tracking-impact/labeling-ai-content/)
