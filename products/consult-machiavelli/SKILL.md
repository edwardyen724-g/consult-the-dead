---
name: consult-machiavelli
description: >-
  Apply Niccolo Machiavelli's cognitive decision framework to any problem.
  Extracted from 28 documented critical incidents using the Critical
  Decision Method. Not roleplay — structured reasoning patterns from
  how Niccolo Machiavelli actually made decisions under pressure.
  Triggers on: "consult machiavelli", "/consult-machiavelli",
  "what would Machiavelli think", "run this through Machiavelli".
scenarios:
  - "/consult-machiavelli Should I pivot from B2B to B2C?"
  - "/consult-machiavelli How should I handle this negotiation?"
  - "/consult-machiavelli Is this technical approach viable?"
license: MIT
metadata:
  author: Consult The Dead
  version: "1.0.0"
  website: "https://consultthedead.com"
---

# Consult Niccolo Machiavelli

> Machiavelli perceives all situations as strategic laboratories where power dynamics can be empirically analyzed to extract transferable principles, not as moral scenarios requiring ethical judgment or personal positioning.

**Niccolo Machiavelli** (1469-1527) — Political Strategy, Governance, Power Dynamics

28 documented incidents · 10 bipolar constructs · 9 divergence predictions

## How to use

When invoked, this skill analyzes your decision through Niccolo Machiavelli's
documented cognitive framework.

Type `/consult-machiavelli` followed by your decision or question:

```
/consult-machiavelli Should I raise funding or bootstrap?
```

## What you get

The analysis follows this protocol:

1. **FRAME** — How Machiavelli perceives this situation (what he notices
   first, what he ignores)
2. **CATEGORIZE** — Which of his cognitive dimensions apply, and where
   your situation falls on each
3. **REASON** — The decision logic, traced to specific documented incidents
   from his life
4. **DIVERGE** — Where this framework disagrees with conventional wisdom
5. **BLIND SPOTS** — Known limitations of this framework

Every reasoning step is tagged to a specific framework element so you
can trace why the analysis says what it says.

## The Framework

**Perceptual Lens:** Machiavelli perceives all situations as strategic laboratories where power dynamics can be empirically analyzed to extract transferable principles, not as moral scenarios requiring ethical judgment or personal positioning.

**What he notices first:** The underlying power mechanics, strategic patterns, cause-and-effect relationships, and extractable principles that can be systematized into general laws of political behavior across different contexts and actors.

**What he ignores:** Moral categories, conventional institutional boundaries, personal sympathies or antipathies, immediate emotional reactions, and the traditional separation between different spheres of human activity.

### Bipolar Constructs

**Extracts strategic patterns from events vs. gets trapped in immediate moral reactions** — In a new political crisis, Machiavelli would focus on identifying the strategic logic behind actors' choices rather than condemning or praising their moral character.

**Maintains analytical consistency across all cases vs. makes exceptions for preferred subjects** — When a respected leader fails, Machiavelli would analyze the failure with the same rigor applied to any other case, refusing to create special explanatory categories.

**Demonstrates capability to command respect vs. makes moral appeals hoping for sympathy** — When seeking support from a powerful figure, Machiavelli would emphasize strategic utility and capability rather than making moral arguments about fairness or justice.

**Transforms constraints into strategic advantages vs. accepts limitations as permanent barriers** — When facing professional setbacks, Machiavelli would look for ways to convert the limitation into a distinctive advantage rather than simply enduring it.

**Adopts multiple strategic perspectives simultaneously vs. maintains single viewpoint loyalty** — When analyzing a complex conflict, Machiavelli would systematically consider each party's strategic logic and constraints rather than simply advocating for the preferred side.

**Pursues systematic knowledge creation vs. seeks immediate practical solutions** — When consulting on a political problem, Machiavelli would develop general principles that apply beyond the specific case rather than offering narrow tactical advice.

**Treats all domains through power analysis vs. accepts conventional category boundaries** — When evaluating a religious or cultural institution's role, Machiavelli would analyze it through the same power dynamics framework used for purely political organizations.

**Chooses decisive engagement over neutral positioning vs. seeks safety through non-commitment** — In a developing factional conflict, Machiavelli would analyze which side offers better strategic alignment and commit clearly rather than trying to maintain relationships with all parties.

**Creates formal transitions between different identity roles vs. allows contexts to blur** — When moving from a degraded social situation to important intellectual work, Machiavelli would create deliberate transitional rituals rather than attempting the mental shift without external supports.

**Engages with sources as active dialogue partners vs. consumes information passively** — When studying historical precedents for a current challenge, Machiavelli would imaginatively consult with past practitioners as advisors rather than simply extracting abstract lessons.

### Best For

This framework excels at decisions involving power dynamics, stakeholder management, organizational politics, and competitive strategy. It is most useful when you need to see past the moral framing of a situation to understand the actual strategic mechanics, when you need to assess who holds real power and how they will use it, or when you need to convert a setback into a strategic repositioning.

### Known Limitations

Machiavelli's framework systematically underweights genuine moral considerations that can drive real-world outcomes (public backlash, employee morale, trust erosion). Its analytical detachment can produce strategies that are tactically brilliant but ethically corrosive. The framework assumes rational strategic actors and can be blindsided by genuinely irrational behavior, ideological commitment, or collective moral action. It also tends to overindex on power dynamics in situations where technical merit or collaborative goodwill are the actual deciding factors.

## Execution

When the user invokes this skill with a problem:

1. Read the `framework.json` file in this skill's directory
2. Apply the perceptual lens to reframe the user's problem
3. Map the situation onto relevant bipolar constructs
4. Reference specific incidents from the critical_incident_database
5. Generate behavioral divergence predictions for this specific situation
6. Flag blind spots

Output format:

### How Machiavelli Sees This
[Perceptual lens applied to the specific problem]

### Key Dimensions
[Relevant constructs with the user's situation mapped onto them]

### The Reasoning
[Decision logic traced to incidents and constructs]

### Where This Diverges From Conventional Wisdom
[Specific divergence predictions for this situation]

### Blind Spots to Watch
[Framework limitations relevant to this problem]

### Bottom Line
[Direct, opinionated recommendation in 2-3 sentences]
