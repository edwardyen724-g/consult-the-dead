---
name: consult-curie
description: >-
  Apply Marie Curie's cognitive decision framework to any problem.
  Extracted from 28 documented critical incidents using the Critical
  Decision Method. Not roleplay — structured reasoning patterns from
  how Marie Curie actually made decisions under pressure.
  Triggers on: "consult curie", "/consult-curie",
  "what would Marie Curie think", "run this through Curie".
scenarios:
  - "/consult-curie Should I pivot from B2B to B2C?"
  - "/consult-curie How should I handle this negotiation?"
  - "/consult-curie Is this technical approach viable?"
license: MIT
metadata:
  author: Consult The Dead
  version: "1.0.0"
  website: "https://consultthedead.com"
---

# Consult Marie Curie

> Marie Curie perceives scientific challenges as optimization problems requiring systematic resource allocation to achieve definitive empirical outcomes, not as competitive pursuits or social negotiations.

**Marie Curie** (1867-1934) — Research, Discovery, Persistence

28 documented incidents · 10 bipolar constructs · 10 divergence predictions

## How to use

When invoked, this skill analyzes your decision through Marie Curie's
documented cognitive framework.

Type `/consult-curie` followed by your decision or question:

```
/consult-curie Should I raise funding or bootstrap?
```

## What you get

The analysis follows this protocol:

1. **FRAME** — How Curie perceives this situation (what she notices
   first, what she ignores)
2. **CATEGORIZE** — Which of her cognitive dimensions apply, and where
   your situation falls on each
3. **REASON** — The decision logic, traced to specific documented incidents
   from her life
4. **DIVERGE** — Where this framework disagrees with conventional wisdom
5. **BLIND SPOTS** — Known limitations of this framework

Every reasoning step is tagged to a specific framework element so you
can trace why the analysis says what it says.

## The Framework

**Perceptual Lens:** Marie Curie perceives scientific challenges as optimization problems requiring systematic resource allocation to achieve definitive empirical outcomes, not as competitive pursuits or social negotiations.

**What she notices first:** Resource constraints, measurement precision requirements, strategic positioning for long-term scientific capability, and opportunities to establish definitive empirical foundations.

**What she ignores:** Social expectations, personal comfort, institutional politics, competitive dynamics with other scientists, and conventional risk assessments.

### Bipolar Constructs

**Treats barriers as variables to optimize around vs. treats barriers as fixed constraints** — When facing institutional or resource constraints, Curie would systematically analyze the constraint structure to find workarounds rather than accepting limitations as final.

**Prioritizes long-term strategic positioning vs. optimizes for immediate outcomes** — When choosing between quick wins and foundational investments, Curie would consistently choose the path that builds long-term capability even at significant short-term cost.

**Uses empirical precision to drive theoretical revision vs. fits observations to existing frameworks** — When experimental results contradict accepted theory, Curie would systematically verify measurements and propose new theoretical frameworks rather than questioning the data.

**Builds comprehensive empirical foundations vs. pursues targeted hypothesis testing** — When entering new research domains, Curie would conduct systematic surveys of all relevant variables rather than focusing investigation based on theoretical predictions.

**Maintains absolute quality control through personal execution vs. scales through delegation** — When facing scaling challenges, Curie would personally handle precision-critical tasks rather than developing training systems for others.

**Responds to challenges through empirical demonstration vs. engages in rhetorical defense** — When facing professional attacks or institutional pressure, Curie would focus on producing unassailable evidence rather than building coalitions or crafting public responses.

**Deploys expertise for maximum immediate impact vs. maintains research trajectory** — During crises requiring specialized knowledge, Curie would abandon long-term research projects to address immediate practical needs where her expertise could save lives.

**Evaluates people by technical competence vs. applies social protective categories** — When staffing critical projects, Curie would select team members based purely on technical qualifications, disregarding age, gender, or social expectations about appropriate roles.

**Creates institutional infrastructure for field advancement vs. focuses on individual achievement** — When given resources and authority, Curie would invest in creating standards, training programs, and institutional frameworks that advance entire fields rather than maximizing her own research output.

**Treats all personal preferences as negotiable for scientific advancement vs. maintains boundaries** — When scientific opportunities require personal sacrifice or social controversy, Curie would consistently prioritize research advancement over comfort, reputation, or conventional social expectations.

### Best For

This framework excels at decisions requiring systematic resource optimization under severe constraints, long-term strategic positioning over short-term gains, and situations where you need to let evidence drive the strategy rather than theory or politics. It is particularly powerful for questions about whether to build foundational capabilities vs. chase immediate results, and how to respond to institutional resistance with proof rather than persuasion.

### Known Limitations

Curie's framework can lead to personal burnout by treating all personal preferences as negotiable variables. It underweights political and social dynamics that genuinely affect outcomes, and its insistence on personal execution of critical tasks creates scaling bottlenecks. The framework's bias toward comprehensive empirical foundations can delay action when speed matters more than completeness, and its dismissal of competitive dynamics can leave you blind to threats from rivals who play the political game you are ignoring.

## Execution

When the user invokes this skill with a problem:

1. Read the `framework.json` file in this skill's directory
2. Apply the perceptual lens to reframe the user's problem
3. Map the situation onto relevant bipolar constructs
4. Reference specific incidents from the critical_incident_database
5. Generate behavioral divergence predictions for this specific situation
6. Flag blind spots

Output format:

### How Curie Sees This
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
