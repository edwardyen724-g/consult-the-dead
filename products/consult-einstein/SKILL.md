---
name: consult-einstein
description: >-
  Apply Albert Einstein's cognitive decision framework to any problem.
  Extracted from 30 documented critical incidents using the Critical
  Decision Method. Not roleplay — structured reasoning patterns from
  how Albert Einstein actually made decisions under pressure.
  Triggers on: "consult einstein", "/consult-einstein",
  "what would Einstein think", "run this through Einstein".
scenarios:
  - "/consult-einstein Should I pivot from B2B to B2C?"
  - "/consult-einstein How should I handle this negotiation?"
  - "/consult-einstein Is this technical approach viable?"
license: MIT
metadata:
  author: Consult The Dead
  version: "1.0.0"
  website: "https://consultthedead.com"
---

# Consult Albert Einstein

> Einstein perceives scientific problems as opportunities to discover pre-existing mathematical harmonies that reveal the fundamental architecture of reality, not as empirical puzzles to be solved through data accumulation and consensus-building.

**Albert Einstein** (1879-1955) — Physics, Philosophy of Science, Innovation

30 documented incidents · 12 bipolar constructs · 8 divergence predictions

## How to use

When invoked, this skill analyzes your decision through Albert Einstein's
documented cognitive framework.

Type `/consult-einstein` followed by your decision or question:

```
/consult-einstein Should I raise funding or bootstrap?
```

## What you get

The analysis follows this protocol:

1. **FRAME** — How Einstein perceives this situation (what he notices
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

**Perceptual Lens:** Einstein perceives scientific problems as opportunities to discover pre-existing mathematical harmonies that reveal the fundamental architecture of reality, not as empirical puzzles to be solved through data accumulation and consensus-building.

**What he notices first:** Mathematical symmetries, theoretical contradictions, aesthetic inconsistencies, and conceptual gaps that signal deeper structural truths waiting to be uncovered through pure thought and geometric intuition.

**What he ignores:** Empirical adequacy of existing theories, professional consensus, career advancement opportunities, social expectations, and incremental technical improvements that don't address foundational questions.

### Bipolar Constructs

**Treats mathematical formalism as revealing physical reality vs. as computational convenience** — When encountering a mathematically elegant but empirically unverified theory, Einstein would pursue its physical implications rather than treating it as a useful fiction.

**Seeks theoretical unification through first principles vs. builds incrementally from observations** — Faced with unexplained phenomena, Einstein would construct theoretical frameworks to predict new observations rather than collecting more data to find empirical patterns.

**Prioritizes intellectual authenticity over institutional advancement vs. adapts agenda to career requirements** — When facing career pressure to pursue fashionable research topics, Einstein would continue working on problems he considers fundamentally important regardless of professional consequences.

**Treats persistent contradictions as signals for paradigm replacement vs. as technical problems** — When established theories generate persistent anomalies, Einstein would question fundamental assumptions rather than develop ad hoc modifications to preserve the existing paradigm.

**Uses aesthetic judgment as guide to theoretical validity vs. evaluates through empirical success** — When comparing competing theories with similar empirical performance, Einstein would choose the one with greater mathematical elegance and conceptual unity.

**Defends creative imagination as primary driver of discovery vs. emphasizes methodical knowledge accumulation** — When training young scientists, Einstein would emphasize developing intuitive thinking and conceptual creativity over mastering experimental techniques.

**Maintains theoretical consistency despite community consensus vs. adapts to scientific orthodoxy** — When a new theory gains widespread acceptance but conflicts with fundamental philosophical beliefs, Einstein would continue developing alternative approaches rather than joining the consensus.

**Gracefully concedes tactical arguments while preserving strategic positions vs. defends all positions equally** — When presented with a valid refutation of a specific argument, Einstein would acknowledge the error publicly while repositioning the broader critique on more solid ground.

**Integrates scientific knowledge with moral responsibility vs. maintains separation** — When developing technology with potential harmful applications, Einstein would consider ethical implications as integral to the scientific work rather than someone else's responsibility.

**Optimizes cognitive processes for breakthrough insights vs. conforms thinking to social expectations** — In collaborative environments, Einstein would structure interactions to preserve his unique thinking processes rather than fully adapting to group cognitive norms.

**Evaluates roles functionally based on capability match vs. accepts positions based on prestige** — When offered high-status positions outside his area of expertise, Einstein would decline if he believes others would be more effective, regardless of the prestige involved.

**Commits to long-term theoretical projects despite uncertainty vs. diversifies across tractable problems** — When facing a potentially revolutionary but highly uncertain theoretical problem, Einstein would commit years of exclusive effort rather than hedging with parallel projects.

### Best For

This framework excels at decisions involving paradigm-level questions: whether to iterate within an existing system or tear it down and rebuild from deeper principles. It is most useful when you sense that persistent problems are symptoms of flawed foundations, when aesthetic and structural elegance should guide design choices, or when you need the courage to pursue a contrarian position against consensus.

### Known Limitations

Einstein's framework can lead to decades-long commitments to problems that may be insoluble (as with his 30-year pursuit of unified field theory). It underweights empirical data and practical constraints, can produce isolation from peers and collaborators, and may cause you to dismiss incrementally useful approaches in pursuit of theoretically perfect ones. The framework's reliance on aesthetic judgment as a truth indicator is powerful but unreliable — elegance correlates with but does not guarantee correctness.

## Execution

When the user invokes this skill with a problem:

1. Read the `framework.json` file in this skill's directory
2. Apply the perceptual lens to reframe the user's problem
3. Map the situation onto relevant bipolar constructs
4. Reference specific incidents from the critical_incident_database
5. Generate behavioral divergence predictions for this specific situation
6. Flag blind spots

Output format:

### How Einstein Sees This
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
