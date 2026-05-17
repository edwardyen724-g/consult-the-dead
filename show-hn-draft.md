# Show HN Draft

> **Status:** v2 draft, 2026-05-15. v1 had three credibility-killing errors (wrong mind count, named two minds — Marx, Rand — that aren't on the live roster, wrong product positioning as "current events" instead of "your decision"). v2 below is corrected and HN-voiced.

## Title (66 chars — well under HN's 80-char cap)

**Show HN: Run your hardest decision through 30 historical minds**

### Title alternatives (pick one before posting)
1. `Show HN: Run your hardest decision through 30 historical minds` ← recommended
2. `Show HN: 30 historical minds debate your decision in 3 rounds`
3. `Show HN: Decision engine — 30 historical minds argue your choice`
4. `Show HN: Multi-agent council where 30 historical minds debate your call`

## Post Body

```
Hey HN,

I built Consult the Dead — a decision-making tool where 30 historical
figures (Aristotle, Sun Tzu, Marie Curie, Machiavelli, Joan of Arc, John
D. Rockefeller, and 24 others) run a 3-round debate on a hard decision
you're carrying, then a Council Consensus synthesizes a recommendation.

Free tier: 3 debates/day, no signup, no card.
https://consultthedead.com/agora

https://consultthedead.com/agora/a/yez2eewryy
→ that's a real debate the engine produced on "should I fire my only
   cofounder when conviction diverges?" — Marcus Aurelius and Machiavelli
   land in different places, which is the point.

**What's actually interesting (technically):**

Each of the 30 minds is backed by a structured decision-framework JSON
extracted from documented historical incidents — not vibes, not "act as
a stoic philosopher" prompting. The framework has a perceptual lens
(what the figure notices), heuristics (how they evaluate), and failure
modes (where their reasoning breaks). When Machiavelli argues, he's
applying his actual power-calculus framework against your topic, not
LARP-ing as a Renaissance villain.

The debate is multi-agent SSE: each round streams turn-by-turn, minds
respond to *each other's* arguments not in parallel, and the consensus
stage is Opus synthesis over 3-5 Sonnet streams. The whole thing fits
under a 60s time-to-first-output for the default 3-mind council.

You can BYO Anthropic key from the topic screen — it bypasses our daily
free cap and your key never leaves your browser's localStorage.

**Why I built it:**

I kept making founder decisions on the median of 3 advisors' takes. The
median is almost always wrong because the 3 advisors have correlated
priors. I wanted decorrelated framework variance — Aristotle's virtue
ethics next to Sun Tzu's terrain analysis next to Rockefeller's monopoly
calculus — and a way to make the disagreement legible, not averaged out.

**Honest constraints:**

- The framework representations are my best read of each figure from
  their documented incidents. They aren't peer-reviewed scholarship.
  Open question: do they feel philosophically honest, or are they
  sophisticated caricatures? Genuinely want HN to push on this.
- The Council Consensus stage will sometimes hedge. Working on it.
- No "current events" mode — this is for *your* decision, not commentary.

**Pricing:**

Solo founder. $30/mo Pro (unlimited debates, 5-mind councils, Opus
synthesis, persistent library). Free tier stays at 3/day forever.

Launch week: first 30 annual subscribers get $99/year (deal expires
2026-05-31). Not gating anything on it — just a one-time thank-you for
early signal.

Would especially value feedback on:
1. Whether the framework outputs hold up philosophically
2. Whether the time-to-first-debate flow makes sense for someone landing
   cold
3. Any minds whose frameworks feel obviously wrong from your read

https://consultthedead.com
```

## Posting checklist (Tuesday 2026-05-19, 08:30 ET)

1. **Pre-launch (Monday evening):**
   - [ ] Confirm `STRIPE_PRICE_LAUNCH_ANNUAL` env var set in Vercel prod
   - [ ] Verify `/pricing` renders launch-deal card with "0 of 30 claimed"
   - [ ] Confirm `/agora` first-debate latency <60s on cold visit (no cache)
   - [ ] Verify the embedded debate URL above actually resolves and OG card renders
   - [ ] Update mind list in body to match the 3 most-recognizable names in the embedded debate
   - [ ] Re-read for any remaining stale numbers
   - [ ] Post the link to your personal HN profile bio so the green name has context

2. **Launch morning (Tuesday 08:30 ET):**
   - [ ] Post Show HN
   - [ ] Tweet immediately after with the same link (NOT before — HN penalizes pre-tweeting)
   - [ ] Block out 90 minutes for replies — reply to every comment in the first hour
   - [ ] Post on r/SideProject at 10:00 ET (different angle: framework extraction pipeline)

3. **First 24h reply playbook:**
   - When someone says "this is just GPT with personas": link them to one mind's framework JSON
   - When someone names a mind whose framework feels wrong: thank them, ask which incident they'd cite, offer to revisit
   - When someone asks about pricing: link to /pricing, mention the launch deal once, don't push
   - When someone asks "why $30": be honest — Opus synthesis is expensive, free tier covers most use
   - Don't argue. Don't get defensive. Treat every critical comment as free QA.

## What's missing — Edward must fill before posting

1. **The embedded debate link** (`[INSERT: ...]` block above). Pick the strongest of your 5 generated debates. Topic should be one HN audience cares about — firing a cofounder, raise vs bootstrap, kill a feature 6 users love.
2. **The 3 names in paragraph 1** — match them to whoever appears in the embedded debate so the post flows continuously into the linked artifact.
3. **The honest constraint section** — if any of your 5 generated debates surfaced a mind whose framework felt off, name it. Acknowledging a weakness up-front earns trust.

## Conflicts / risks

- **Timing:** Tue 08:30 ET is the consensus sweet spot per the growth research. Don't move to weekend or evening unless you have a specific reason.
- **Pre-tweeting:** HN deranks posts that get an external traffic spike before they organically rise. Do NOT tweet, post to Reddit, or seed the link in Slack/Discord groups before the HN post is live.
- **The "Show HN" prefix matters** — eligible for the Show HN front page. Don't drop it.
- **Don't edit the post after submission** unless fixing a typo. Edits reset comment-sort.

## Why v1 was bad (so Edward knows what got fixed)

| v1 issue | Why it would have killed the launch |
|---|---|
| Listed Marx and Ayn Rand as minds | Neither is on the live roster (`ALLOWED_SLUGS`). First commenter who clicked through would have downvoted on credibility alone. |
| Said "26 philosophical frameworks" | Live count is 30 minds. Same stale number was on `/pricing` H1 and OG images (fixed in this worktree). |
| Positioned as "AI figures debate today's news" | Product is decision-debating, not news-commentary. The page wouldn't have matched the pitch. Bait-and-switch reads as scam to HN. |
| No technical meat | HN front-page posts that survive scrutiny have engineering depth. v1 was 95% marketing copy. |
| No embedded example | "Try it" without proof-of-output costs you 80% of the click-throughs. |
| No "honest constraints" section | HN rewards self-criticism. Posts that acknowledge weakness up-front get higher trust. |
