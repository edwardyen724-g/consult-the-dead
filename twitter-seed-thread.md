# Twitter / X seed thread — Consult The Dead launch

> **Status:** Draft 2026-05-15. Pair with Show HN post on Tue 2026-05-19. Post the thread **after** the HN post is live (~5–10 min after), NOT before — HN penalizes pre-tweeted posts.

## Why this thread exists

HN is one-shot, broad, and technical. Twitter is repeated, narrow, and emotional. Same product, different framing for each audience. The Show HN post leads with engineering depth; this thread leads with the screenshot-able output. HN readers click for the build; Twitter readers click for the verdict.

## Thread structure (5 tweets)

### Tweet 1 — the hook (must work as standalone scroll-stopper)

```
I built a thing where 30 historical minds debate your hardest founder decision.

Asked it: "should I fire my only cofounder when conviction has diverged?"

Marcus Aurelius and Machiavelli disagreed sharply. Their reasoning, below.

[ATTACH: 4-panel screenshot grid from the strongest debate]
```

**Notes for Edward:**
- The 4-panel grid: one tile per round + one for consensus. Crop tight — no UI chrome, just the typography.
- If the strongest debate isn't the cofounder one, swap the topic line and tweet 2/3 accordingly.
- Don't put the URL in tweet 1. Links in tweet 1 cut reach ~40% on X.
- Word count: 52 words. Plenty of room to tighten if needed.

### Tweet 2 — show one mind's actual argument

```
Marcus Aurelius (Stoic, virtue-based):

"The decision is not about your cofounder. It is about whether you are
prepared to be the kind of leader who continues alone. Most who fire
their partner discover they fired the better half of their judgment."

He's arguing from his actual framework, not LARPing.
```

**Notes:**
- Pull the quote DIRECTLY from one of Edward's 5 generated debates. Verbatim. Don't paraphrase — authenticity is the asset.
- "He's arguing from his actual framework, not LARPing" — this line is the wedge. It's what separates Consult The Dead from "ChatGPT with a costume."
- Word count: 56.

### Tweet 3 — show the disagreement

```
Machiavelli (power calculus):

"Sentiment will make you keep him for six months past the moment of clarity.
Each of those months compounds the cost. Act when you see, not when others
agree you should see."

Same question. Same data. Opposite recommendations. That's the point.
```

**Notes:**
- Same source (Edward's strongest debate). Verbatim quote.
- The closing line "Same question. Same data. Opposite recommendations. That's the point." is the thread's thesis — and the differentiator vs every other "AI advice" tool.
- Word count: 58.

### Tweet 4 — the build

```
The minds aren't personas — each one is backed by a decision-framework JSON
extracted from their documented incidents. Sun Tzu's terrain analysis,
Marie Curie's evidence thresholds, Rockefeller's monopoly logic.

30 minds, 3 rounds, Opus synthesis at the end. Multi-agent SSE streaming.
```

**Notes:**
- This tweet earns the click from engineers who liked tweets 2–3 but want to know if it's a wrapper. The framework-as-JSON line is the answer.
- If "Opus synthesis" is too inside-baseball, swap for "the strongest model writes the recommendation."
- Word count: 52.

### Tweet 5 — the CTA

```
Free tier: 3 debates/day, no signup, no card.
First 30 annual subs get $99/year (expires May 31).

The whole debate above:
https://consultthedead.com/agora/a/<share-id>

Build a council, bring a real decision: https://consultthedead.com/agora
```

**Notes:**
- TWO links in the last tweet — one to the read-only example, one to the live tool. The example link first because most readers want to finish the story before committing to action.
- Mention the launch deal but don't headline it — the credibility comes from the debate quality, not the discount.
- Update `<share-id>` with the actual ID before posting.
- Word count: 38.

## Total thread word count: ~256 words

Well under the X engagement sweet-spot of <2,000 chars per tweet, average ~50 words per tweet — high information density without feeling cramped.

## Post-launch reply playbook

When the thread starts getting replies, these are the high-leverage interactions:

1. **"Is this just GPT?"** — quote-RT the framework-JSON tweet (tweet 4). Don't argue, just point.
2. **"Which mind would tell me to X?"** — engage. This is a viral fishing hook. Reply with a council suggestion + invite them to run it.
3. **"How does it handle [obvious bad case]?"** — answer honestly. Don't claim perfection. "Here's where it breaks: ..." earns more credibility than defending.
4. **"Why $30/mo?"** — link /pricing, mention Opus cost honestly. Don't apologize.
5. **Trolls and "this is dumb" replies** — ignore. Don't engage. The thread's reach won't be hurt by silence; it WILL be hurt by you arguing.

## When to repost / variants

If tweet 1 underperforms (under 10K impressions by Wed evening), the failure mode is almost certainly the hook. Try these variants on subsequent days, NOT all at once:

- **Hook variant A — explicit decision:** "I asked 30 historical minds whether to fire my cofounder. The Stoic said wait. Machiavelli said now. Here's how they argued it out."
- **Hook variant B — engineering angle:** "Built a multi-agent debate engine where 30 historical minds reason from their actual decision frameworks (not personas). Watch Marcus Aurelius and Machiavelli disagree:"
- **Hook variant C — provocation:** "ChatGPT gives you one answer. I wanted 30 — from people who already shipped under harder constraints than me. Built Consult The Dead."

Run each as a separate thread, 48h apart minimum. Don't re-thread the same hook with new copy on the same day — X's de-dupe filter will throttle reach.

## What's missing — Edward must fill before posting

1. **The 4-panel screenshot grid** for tweet 1. Crop from the strongest of your 5 generated debates.
2. **The two quotes in tweets 2 and 3.** Verbatim, from the SAME debate that's screenshotted.
3. **The `<share-id>` in tweet 5.**
4. **The topic in tweet 1** if your strongest debate isn't the cofounder firing case — swap the entire topic line and tweets 2–3 accordingly.

## Risk / conflicts

- **Image quality matters.** A blurry screenshot in tweet 1 will kill the thread. Use a Retina display, export at 2x.
- **The two quotes must be EXACT.** Cold readers cross-check. If you paraphrase and someone clicks through to verify, they'll find the mismatch and call you out.
- **Don't pre-tweet the HN link.** Wait until the HN post has been live ≥5 minutes before posting tweet 5.
- **If X imposes thread truncation,** post tweets 4 and 5 as separate quoted threads, not as a chain — the click-through math is better that way.
