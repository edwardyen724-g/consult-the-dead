# Mind Pack Structure — Proposal

*Draft: 2026-05-01*

## Overview

Organize minds into themed "packs" — curated collections that help users navigate the Agora by use case. A mind can appear in multiple packs. Packs serve two purposes: content discovery (users find the right council for their problem) and eventual pricing leverage (subscribe to packs you care about).

---

## Pack Definitions

### 1. The Stoic Council
**Tagline:** "Wisdom for turbulent times"
**Use case:** Personal resilience, ethical decision-making, navigating adversity, leadership under pressure

| Mind | Status |
|------|--------|
| Marcus Aurelius | ✅ Live |
| Benjamin Franklin | ✅ Live |
| Seneca | 🔜 Candidate (priority) |
| Abraham Lincoln | 🔜 Candidate (priority) |
| Frederick Douglass | 🔜 Candidate |

**Why it works:** Stoicism and practical moral philosophy are the #1 reason people seek historical wisdom. This pack practically sells itself.

---

### 2. The Inventors' Workshop
**Tagline:** "Build what doesn't exist yet"
**Use case:** Technical innovation, creative problem-solving, product development, scientific thinking

| Mind | Status |
|------|--------|
| Isaac Newton | ✅ Live |
| Nikola Tesla | ✅ Live |
| Leonardo da Vinci | ✅ Live |
| Marie Curie | ✅ Live |
| Benjamin Franklin | ✅ Live |
| Ada Lovelace | 📝 Stub |
| Albert Einstein | 🔒 Hidden (trademark) |

**Why it works:** Already 5 live minds — strongest pack at launch. The Newton + Tesla + Da Vinci Agora is a dream team for any technical founder.

---

### 3. The War Room
**Tagline:** "Strategy is everything"
**Use case:** Competitive strategy, negotiation, organizational politics, market positioning

| Mind | Status |
|------|--------|
| Sun Tzu | ✅ Live |
| Niccolò Machiavelli | ✅ Live |
| Benjamin Franklin | ✅ Live |
| Napoleon | 🔜 Candidate |
| Julius Caesar | 🔜 Candidate |
| Alexander the Great | 📝 Stub |
| Cleopatra VII | 📝 Stub |

**Why it works:** The Sun Tzu + Machiavelli + Napoleon Agora is the single best marketing moment for the product. "Three of history's greatest strategists debate your business problem."

---

### 4. The Republic
**Tagline:** "How to move people and nations"
**Use case:** Leadership, governance, persuasion, public communication, coalition building

| Mind | Status |
|------|--------|
| Benjamin Franklin | ✅ Live |
| Niccolò Machiavelli | ✅ Live |
| Marcus Aurelius | ✅ Live |
| Abraham Lincoln | 🔜 Candidate (priority) |
| Frederick Douglass | 🔜 Candidate |
| Catherine the Great | 📝 Stub |

**Why it works:** Bridges philosophy and strategy — the "leadership and persuasion" angle is extremely commercial. Lincoln is the keystone extraction here.

---

### 5. The Trailblazers
**Tagline:** "Change the rules, change the world"
**Use case:** Social innovation, overcoming systemic barriers, building movements, moral courage

| Mind | Status |
|------|--------|
| Marie Curie | ✅ Live |
| Frederick Douglass | 🔜 Candidate |
| Florence Nightingale | 🔜 Candidate |
| Harriet Tubman | 🔜 Candidate |
| Ada Lovelace | 📝 Stub |

**Why it works:** Unique positioning — no other AI product offers a council of barrier-breakers. High appeal for social entrepreneurs, educators, nonprofit leaders.

---

### 6. The Moguls
**Tagline:** "Build an empire"
**Use case:** Business building, wealth creation, scaling operations, deal-making

| Mind | Status |
|------|--------|
| Benjamin Franklin | ✅ Live |
| Niccolò Machiavelli | ✅ Live |
| Andrew Carnegie | 🔜 Candidate |
| Napoleon | 🔜 Candidate |
| Julius Caesar | 🔜 Candidate |

**Why it works:** The "make money" pack. Carnegie is the keystone — his philosophy of building monopolies then giving it all away is genuinely distinctive CDM material.

---

## Extraction Priority (after Franklin)

Based on pack coverage impact:

| Priority | Mind | Packs filled | Rationale |
|----------|------|-------------|-----------|
| 1 | **Abraham Lincoln** | Stoic Council, The Republic | Completes 2 thin packs to 3+ live minds each. Excellent CDM source material (Civil War decisions, cabinet management, Emancipation timing). |
| 2 | **Seneca** | Stoic Council | Keystone Stoic. Rich source material (Letters to Lucilius, exile decisions, Nero advising). Completes the philosophy core. |
| 3 | **Napoleon** | The War Room, The Moguls | The "Sun Tzu + Machiavelli + Napoleon" Agora is the single best marketing screenshot. Abundant CDM material (military campaigns, legal code, institutional design). |
| 4 | **Frederick Douglass** | The Republic, The Trailblazers | Bridges two packs. Unique voice — escaped slavery, self-taught orator, political strategist. CDM-rich (deciding to break with Garrison, recruiting for 54th, newspaper founding). |
| 5 | **Andrew Carnegie** | The Moguls | Completes the business pack. Steel empire + Gospel of Wealth philosophy is distinctive enough to likely pass tier-1 divergence. |
| 6 | **Florence Nightingale** | The Trailblazers | Data-driven reformer, hospital design, statistical innovation. Strong CDM material. |

**Note on stubs:** Ada Lovelace, Alexander the Great, Catherine the Great, and Cleopatra VII have 5-incident stubs. They should be fully extracted when their packs need them, but aren't priority since the packs they'd fill are already anchored by live minds.

---

## Pricing Sketch

### Recommended: Simple launch model

Keep pricing simple now. Use packs for content organization only. Add pack-based pricing later once you see which packs get traction.

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 1 consultation/week, any single mind |
| Pro | $25/mo ($300/yr) | All packs, full Agora (multi-mind councils), unlimited consultations |

### Future option: Pack-based pricing

Once you have 20+ minds across 6+ packs:

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 1 consultation/week, Starter pack only (3 minds) |
| Single Pack | $10/mo | 1 pack of your choice + Agora within that pack |
| All Access | $25/mo ($300/yr) | All packs, cross-pack Agora, priority features |

### Why wait on pack pricing

- With 8 minds, a "pack" of 3-4 doesn't feel premium enough to charge separately
- You need user data on which packs people actually want before pricing them
- The simple model is easier to market: "consult history's greatest minds for $25/mo"
- Pack pricing becomes powerful at 20+ minds when users genuinely won't need all of them

---

## Data Model Changes

### In each `framework.json`

Add to the `meta` object:

```json
{
  "meta": {
    "person": "Benjamin Franklin",
    "domain": "Diplomacy, Science, Entrepreneurship",
    "born": "1706",
    "died": "1790",
    "packs": ["stoic-council", "inventors-workshop", "war-room", "the-republic", "the-moguls"],
    "tags": ["diplomacy", "invention", "entrepreneurship", "philosophy", "statecraft"],
    "status": "live",
    "packRoles": {
      "stoic-council": "The pragmatic moralist — tests principles against real-world outcomes",
      "inventors-workshop": "The practical inventor — bridges science and commerce",
      "the-moguls": "The self-made polymath — built wealth through relentless experimentation"
    }
  }
}
```

**New fields:**
- `packs`: array of pack slugs this mind belongs to
- `tags`: freeform tags for search/filtering (not tied to packs)
- `status`: `"live"` | `"hidden"` | `"stub"` | `"extracting"`
- `packRoles`: optional per-pack description of what this mind contributes to that pack's council dynamic

### New file: `website/data/packs.json`

```json
[
  {
    "slug": "stoic-council",
    "name": "The Stoic Council",
    "tagline": "Wisdom for turbulent times",
    "description": "Personal resilience, ethical decision-making, navigating adversity",
    "color": "var(--color-pack-stoic)",
    "suggestedAgora": ["marcus-aurelius", "benjamin-franklin", "seneca"],
    "minds": ["marcus-aurelius", "benjamin-franklin", "seneca", "abraham-lincoln", "frederick-douglass"]
  }
]
```

### Coverage Matrix

| Mind | Stoic | Inventors | War Room | Republic | Trailblazers | Moguls |
|------|:-----:|:---------:|:--------:|:--------:|:------------:|:------:|
| Marcus Aurelius | ✅ | | | ✅ | | |
| Isaac Newton | | ✅ | | | | |
| Marie Curie | | ✅ | | | ✅ | |
| Machiavelli | | | ✅ | ✅ | | ✅ |
| Tesla | | ✅ | | | | |
| Da Vinci | | ✅ | | | | |
| Sun Tzu | | | ✅ | | | |
| Franklin | ✅ | ✅ | ✅ | ✅ | | ✅ |
| Lincoln* | ✅ | | | ✅ | | |
| Seneca* | ✅ | | | | | |
| Napoleon* | | | ✅ | | | ✅ |
| Douglass* | | | | ✅ | ✅ | |
| Carnegie* | | | | | | ✅ |
| Nightingale* | | | | | ✅ | |

*= not yet extracted
