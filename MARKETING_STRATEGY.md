# Consult The Dead — Go-To-Market Strategy

**Goal:** Build a self-sustaining content engine that compounds over 90 days into 500+ weekly visitors and 50+ weekly agons started.
**Approach:** Slow-burn, content-led, organic. **Not** a launch-spike strategy.
**Last updated:** 2026-04-19

This is the high-level GTM. The day-to-day operating manual lives in [`CONTENT_PIPELINE.md`](CONTENT_PIPELINE.md). Topic backlog in [`topics.yaml`](topics.yaml).

---

## 1. Why content-led, not launch-spike

Edward considered a Show HN / Product Hunt launch and rejected it. Reasons:

- His prior PH launch underperformed; not eager to repeat
- Launch spikes pull traffic that hasn't been pre-qualified — high bounce, low retention
- The product's value (structured disagreement from historical frameworks) doesn't fit the typical HN "wow" beat — it requires demonstration, which short attention spans on launch days don't give
- The product has a unique "category content" advantage (12 frameworks of structured data nobody else has) that compounds via SEO and AI-citation over time

The slow-burn alternative: ship 2-3 articles + 4-5 reels per week, optimize for what converts, let organic compound. After 90 days, evaluate whether a launch-spike event is worth the variance.

---

## 2. Positioning: The Anti-Trendslop Tool

In March 2026, HBR published "Researchers Asked LLMs for Strategic Advice. They Got Trendslop in Return" — testing 7 major LLMs across 15,000 strategic simulations and finding all models cluster around the same generic, buzzword-heavy advice. Fortune followed up calling trendslop "the new AI-fueled scourge of workplace consultants."

This is the wedge. Every other AI tool gives the same answer. We give **structured disagreement** from historically-documented reasoning frameworks.

### One-liner candidates (test these in copy)

- "Every AI gives the same advice. History doesn't."
- "ChatGPT gives you consensus. We give you the argument you need to hear."
- "The antidote to AI trendslop."
- "Where Sun Tzu and Curie disagree is where your blind spots live."

### Why we're different — talking points

1. **Frameworks extracted via Critical Decision Method** — a real cognitive science methodology used by NASA, not "pretend to be Machiavelli" persona prompting.
2. **Multi-framework disagreement** — the value isn't any single framework's answer, it's where Sun Tzu and Curie disagree.
3. **Documented historical incidents** — each framework grounded in real decisions the historical figure actually made.
4. **Convergence synthesis** — after surfacing disagreement, we show where frameworks converge. That's high-confidence signal.

---

## 3. Target audience

### Primary: Indie founders, solo operators, knowledge workers who use AI tools

- Already paying for AI (ChatGPT Pro, Cursor, API credits)
- Face real strategic decisions weekly (pricing, hiring, pivots, market entry)
- Hang out on: Indie Hackers, r/SaaS, r/startups, AI Twitter/X, Hacker News, Instagram (founder/operator FinTwit-adjacent)
- Will understand "CDM-extracted frameworks" vs "persona prompts" distinction
- Spreads compulsively when something is novel

### Secondary: Strategy consultants & coaches

- Help clients make decisions for a living
- Higher willingness to pay ($50–100/mo range later)
- Reachable through LinkedIn, consulting Slack groups

### Tertiary (later, if signal): philosophy-curious general audience

- Stoicism boom audience (Daily Stoic-adjacent)
- Mental models / Munger-curious
- Reachable via Instagram Reels in the slow-burn phase

### Not targeting (for now)

- General public unfamiliar with AI
- Enterprise (sales cycle too long for validation)
- Students / hobbyists (won't pay)

---

## 4. The content engine — see CONTENT_PIPELINE.md

The full operating manual lives in [`CONTENT_PIPELINE.md`](CONTENT_PIPELINE.md). High-level:

- **2-3 articles/week** — mix of evergreen `/insights/` and pain-state `/decisions/` pages, optimized for both Google ranking and AI-agent citation
- **4-5 Verdict Reels/week + 1 carousel/week** on Instagram, faceless brand account, voiceover + kinetic text + product UI as B-roll
- **Daily Stories** — low-effort, drives profile visits
- **Topic queue:** [`topics.yaml`](topics.yaml), 25+ entries seeded
- **Format pick (Verdict Reel) is data-backed** — we considered AI avatars and rejected them: Meta is suppressing AI-flagged content, audience reception in 2026 is actively negative

---

## 5. Concierge — out of scope for now

The "Submit your decision" form on the landing page stays as-is: free, manual fulfillment by Edward within 24h, Discord webhook for notification. That's been there from day one and continues.

**Explicitly NOT doing for Phase 0-4:**
- $29 paid concierge offer
- Stripe payment link
- Promoting any paid manual service

Reason: focus is the content engine. A paid service before we have organic traction adds operational load (fulfillment, support, refunds) without proven demand. Revisit at Day 90 evaluation only if the metrics report shows clear demand signal.

---

## 6. Metrics that matter

The biweekly metrics report (`ctd-biweekly-metrics-report` scheduled task) tracks all of these. See [CONTENT_PIPELINE.md §5](CONTENT_PIPELINE.md#5-kpis--what-we-track-what-we-ignore) for the full hierarchy.

### Vanity (ignore)
- Total page views
- Total followers
- Total likes

### Signal (track)
- **Free agons started per week** (north star)
- **Article completion rate** (sessions who scroll past 50%)
- **Bio-link CTR from Instagram** (UTM-attributed)
- **Saves / shares per Reel** (algorithm reach signal)
- **3-second view rate per Reel** (hook health)
- **Email captures** (durable asset — pending implementation)

### 90-day targets (slow-burn)

| Metric | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| Articles shipped | 8–12 | 16–24 | 24–36 |
| Reels shipped | 16–20 | 32–40 | 50–60 |
| Indexed pages on Google | 17 (current) | 25 | 40+ |
| Weekly site visitors | 50 | 200 | 500+ |
| Weekly agons started | 5 | 20 | 50+ |
| Instagram followers | 100 | 500 | 2,000+ |
| Email subscribers | n/a (TBD) | 50 | 200+ |

If Day 90 numbers are met or exceeded → keep compounding, no launch event needed.
If Day 90 numbers are missed by 3× → the format isn't working; revisit.

---

## 7. Phase plan

### Phase 0 — done (April 2026)
- Product live (consultthedead.com + agora.consultthedead.com)
- Real agon engine, structured prompts, persistent rate limit, anonymous metrics
- Search Console verified, sitemap submitted
- Biweekly metrics report scheduled
- This doc + CONTENT_PIPELINE + topics.yaml in place

### Phase 1 — content engine groundwork (next 1–2 weeks)
- Edward picks voice approach (real voiceover vs ElevenLabs clone)
- Article generation pipeline built (topic queue → AI draft → PR review → deploy → Search Console submit)
- First 2-4 articles shipped
- Edward records 5 manual reels using picked tooling, no automation yet
- Email capture provider chosen + integrated on consensus stage

### Phase 2 — Instagram launch (weeks 3–4)
- Faceless brand account created (handle TBD: @consultthedead or @councilofthedead)
- Profile bio + Stories highlights + first 5 reels published manually
- Tracking established (UTM links, Vercel attribution)
- 8+ articles shipped by end of phase

### Phase 3 — automation of what works (weeks 5–6)
- Format that won in Phase 2 → Reel template + script generator
- Instagram Graph API wired (Meta Business + FB Page + Dev App + OAuth)
- Article pipeline auto-drafts the corresponding reel script for each new article
- Edward's role becomes one-tap approval + creative direction

### Phase 4 — feedback loop (weeks 7–8)
- Trends-API discovery wired (replaces manual `topics.yaml`)
- Comment ingestion + theme extraction added to biweekly report
- Daily ops checklist (scheduled task fires every morning with the day's checklist for Edward)
- 30+ articles, 40+ reels shipped

### Phase 5 — evaluate (week 9+)
- Hit 90-day targets in §6? Compound, no spike event needed
- Missed targets? Reassess format, audience, channel
- Revenue signal from concierge? Consider monetization tier
- Distribution signal strong? Consider whether a Show HN / Product Hunt event is worth attempting

---

## 8. What we are NOT doing (and why)

### Not doing: AI-avatar talking-head reels
Meta is suppressing AI-flagged content, audience trust collapsed in 2026. See [CONTENT_PIPELINE.md §2](CONTENT_PIPELINE.md#2-the-format-were-committing-to-verdict-reel).

### Not doing: Product Hunt / Show HN launch (yet)
Edward's prior PH was underwhelming. Slow-burn first, evaluate whether a spike event helps after we have organic traction.

### Not doing: Buying followers / engagement / paid ads
Pre-monetization, paid acquisition kills CAC math. We earn audience first, then experiment with paid amplification of proven content.

### Not doing: Quote-card Instagram strategy
Saturated by 400K+ stoic-quote accounts. We'd be the 1000th entrant. Verdict Reels differentiate via product-as-visual.

### Not doing: Generic AI articles
Google's Helpful Content Update penalizes them. AI agents don't cite them. Every article gets Edward's review pass — see [CONTENT_PIPELINE.md §6](CONTENT_PIPELINE.md#6-the-article-side-seo-led).

---

## 9. Open decisions (Edward needs to call)

These shape what gets built next. See also [CONTENT_PIPELINE.md §10](CONTENT_PIPELINE.md#10-open-decisions).

1. **Voice:** real Edward voiceover OR ElevenLabs clone of Edward's voice?
2. **Email provider:** ConvertKit / Beehiiv / Resend / build-our-own?
3. **`/decisions/` slug pattern:** want pre-loaded agons, or just landing pages with "run yours" CTAs?
4. **Instagram handle:** @consultthedead, @councilofthedead, or alternative?
5. ~~Concierge offer~~ — resolved 2026-04-20: out of scope until Day 90 evaluation.

---

## 10. References

- [`CONTENT_PIPELINE.md`](CONTENT_PIPELINE.md) — operating manual
- [`topics.yaml`](topics.yaml) — topic queue
- [`AGORA_PLAN.md`](AGORA_PLAN.md) — product roadmap (Agora pivot)
