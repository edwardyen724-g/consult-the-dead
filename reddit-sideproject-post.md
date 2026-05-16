# r/SideProject — Consult The Dead launch post

> **Status:** Draft v2, 2026-05-15. Supersedes the r/SideProject section in `/reddit-launch-drafts.md`, which had the same stale-count + wrong-minds errors as Show HN v1 (says "26 frameworks", lists Marx/Rand who aren't on the roster, positions as "current events" instead of decision-debating). v2 below is corrected, audience-tuned, and honest about the goal.

## When to post

**Tuesday 2026-05-19, 10:00 ET** — exactly 90 minutes after the Show HN post. This gives the HN post time to settle into its initial rank before adding a second traffic source. r/SideProject moderators don't penalize cross-channel launches, but the audience does notice copy-paste between subreddits.

## Why r/SideProject (not r/InternetIsBeautiful, not r/artificial)

- **r/SideProject (222K members)** — promo-friendly, indie-founder culture, MRR-curious, accepts honest "here's what I built" posts. Best fit for converting interest → signups.
- **r/InternetIsBeautiful** — sterile, link-only culture, low conversion. Skip pre-launch.
- **r/artificial** — pedantic, will flame on "framework JSON" claims. Save for later when there are more eyes.
- **r/philosophy** — bans most self-promotion. Skip unless comment-level value-add.
- **r/stoicism / r/history** — possible but require deeper engagement than a single launch post buys.

The r/philosophy / r/history / r/artificial drafts in `/reddit-launch-drafts.md` should sit for a week post-launch and be revisited once you have signal on what kind of audience converts.

## Post

### Title (under r/SideProject's 300-char cap, ~90 chars recommended)

**Show r/SideProject: I built a multi-agent debate engine where 30 historical minds argue your hardest decision — solo, $30/mo, launching this week**

### Body

```
**What it is**

Consult The Dead (https://consultthedead.com) — you bring a hard
decision, the engine convenes a council of 2–5 historical minds, they
run a 3-round debate, and a final "Council Consensus" stage synthesizes
a recommendation.

30 minds currently live, including Marcus Aurelius, Sun Tzu, Machiavelli,
Marie Curie, John D. Rockefeller, Joan of Arc, Steve Jobs, and Aristotle.
Each one reasons from their own decision-framework — not as a persona.

Free tier: 3 debates per day, no signup, no card.
https://consultthedead.com/agora

[INSERT: link to strongest debate, e.g. https://consultthedead.com/agora/a/<id>]
That's a real debate the engine ran on whether to fire a cofounder when
conviction has diverged. Marcus Aurelius and Machiavelli end up in
different places — that's the entire point of the tool.

**Why I built it**

I was making founder decisions on the median of 3 advisors' takes. The
median is almost always wrong, because the 3 advisors have correlated
priors (same age, same industry, same incentive). I wanted decorrelated
framework variance — what would Aristotle's virtue ethics say next to
Sun Tzu's terrain analysis next to Rockefeller's monopoly logic?

The minds aren't "act as a stoic" prompting. Each one has a structured
JSON framework — perceptual lens (what they notice), heuristics (how
they evaluate), failure modes (where their reasoning breaks). Extracted
from documented historical incidents, not vibes.

**The build**

- Next.js / Vercel for the app
- Anthropic Claude — Sonnet for the debate rounds, Opus for the final
  consensus synthesis
- SSE streaming with multi-agent turn coordination (each mind responds
  to the previous turn's actual content, not just monologue in parallel)
- Postgres for the persistent library, Clerk for auth, Stripe for billing
- BYO Anthropic key option from the topic screen — bypasses our free cap,
  key never leaves the browser's localStorage

**Where I'm at**

Honest revenue picture: zero paying users as of today. Built nights and
weekends over the last few months. Going wider this week (Show HN
Tuesday morning, this post Tuesday mid-morning).

Goal: 30 paying subscribers by 2026-05-31. Math: $30/mo rack rate, plus
a launch deal of $99/year for the first 30 annual subscribers (deal
expires the same day).

**What I want from r/SideProject**

Three honest questions:
1. The product surface is at https://consultthedead.com/agora — does
   the cold-visitor flow get you to a first debate in under 60 seconds,
   or is the on-ramp friction killing the conversion math?
2. The $30/mo price — too high, too low, or wrong currency entirely
   (e.g. should this be usage-based, not flat)?
3. If you've been here before with an indie product and zero users, what
   was the single move that unlocked your first 10 paid?

Happy to answer build questions, philosophy-encoding questions, or
"how does Stripe / Clerk / Resend wire up" questions in comments.
```

### CTA placement decisions (deliberate)

- **No link in the title.** r/SideProject's title-link feature has 5–10x lower CTR than body links. Body links convert because users self-select after reading.
- **Two body links to the product, both above the fold (within first 200 words).** The example debate link should NOT be a separate paragraph — it lives inside the "what it is" framing.
- **The "what I want" section pulls comments, not clicks.** This is intentional. r/SideProject upvotes posts with engagement; comments lift the post higher in the sub.
- **Goal stated honestly: 30 paying subs by 2026-05-31.** Indie founders trust transparent revenue talk. Hiding it reads as defensive.

## Reply playbook for the first 4 hours

| Comment type | Response |
|---|---|
| "I tried it, here's what I'd change" | Thank, ask one clarifying Q, do NOT defend |
| "How do you handle [edge case]?" | Honest answer. Don't claim coverage you don't have. |
| "$30 is too high" | Explain Opus cost transparently. Note the launch deal. Don't apologize. |
| "Reminds me of [competitor X]" | Acknowledge, name the actual differentiator (framework JSON vs persona prompt), link the example debate. |
| "I'm interested but X" | Ask what X is. Often the same objection from multiple commenters → product signal. |
| "+ I want to subscribe" | Reply with the launch deal link. Don't push. |

## Don't do these (kill the post)

- ❌ Edit the post after submission unless fixing a typo. Reddit deranks edited posts.
- ❌ Use bullet-heavy formatting (>40% bullets). r/SideProject prefers paragraphs.
- ❌ Pin the post on your profile. The mod team de-emphasizes pinned posts.
- ❌ DM commenters who showed interest. Reply in-thread or in the open.
- ❌ Cross-post to r/Entrepreneur / r/startups within 48h. Both have spam filters that will catch the URL.

## What's missing — Edward must fill before posting

1. **The `[INSERT: ...]` debate link.** Same one as the Show HN post — single artifact, multiple channels.
2. **The cofounder-firing framing in the description paragraph** — if your strongest debate isn't the cofounder one, swap the example accordingly. Keep the disagreement structure ("X and Y end up in different places") regardless of topic.
3. **Optional but recommended: add a screenshot of the debate** as an image attachment. r/SideProject accepts image posts; a screenshot with the comment "the actual output" doubles dwell time.

## Risk / conflicts

- **r/SideProject has a 24h cooldown on multiple posts.** If this fails, you can't re-post for a day.
- **The post will get downvotes from the "AI slop" crowd.** Expected; r/SideProject normalizes 60–75% upvote ratio for AI products. Don't panic if you're at 65% after the first hour.
- **The "zero paying users" honesty is calibrated.** It earns trust on r/SideProject. It would be a credibility-killer on Show HN (which doesn't expect founders to admit zero MRR up-front). Different audiences, different copy.
- **If you choose to launch a Twitter thread the same day, post r/SideProject AFTER the Twitter thread, not before** — Twitter virality compounds the Reddit click-through rate.
