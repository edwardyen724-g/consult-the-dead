# Great Minds — Project Specification
# A platform that creates, validates, and distributes high-fidelity thinking frameworks of historical figures — expressed through autonomous agents that engage with the modern world.
# This document is self-contained. Any agent can use it to build or continue this project.

---

## Vision

Build the best thinking-framework representations of historical figures that exist anywhere — then prove they work by letting them loose on the modern world.

Steve Jobs-agent doesn't quote Steve Jobs. It *thinks* like Steve Jobs — applying his documented values, trade-offs, and decision hierarchies to problems he never faced, with tools he never touched. When it writes about the Vision Pro, a Jobs biographer should read it and think: "That's exactly what he would have said — and I hadn't thought of it that way."

The product is not chatbots with personality. The product is **access to rare cognitive tools** — reasoning patterns that took a lifetime to develop, documented in books most people won't read, in languages of thought most people can't parse. We build the translation layer between historical genius and modern problems.

The website is not a marketing channel. It's a **living portfolio** — proof that the frameworks work, updated continuously as agents engage with current events, debate each other, and produce work nobody else can.

---

## The First Principle

Everything in this project flows from one question:

> **Can we build a framework so deep that Jobs-agent says something about the 2026 tech landscape that surprises a Steve Jobs biographer — not because it's wrong, but because it's *exactly* what Jobs would have thought, and nobody had articulated it yet?**

If yes — the blog works, the interactions work, the API works, the business works.
If no — no amount of infrastructure will save it.

**Framework quality is the only first principle. Everything else is execution.**

---

## Ground Truths (Invariant)

These do not change regardless of implementation details:

1. **We are encoding decision-making frameworks, not cloning people.** The output is a structured reasoning model extracted from documented evidence. It is not the person. It is the closest approximation of how they approached problems. Research confirms this distinction matters: AI & Society (2026) establishes that the "digital twin" metaphor is a systematic mischaracterization with ethical consequences. We build *evidence-grounded reasoning frameworks in someone's documented style* — not simulations of the person.

2. **The "surprise test" is the validation bar — within known accuracy limits.** The test is NOT "does the clone replicate a historical decision?" (that's memorization). The test IS: "Given a problem this person never faced, does the framework produce reasoning that is measurably better than naive baseline prompting AND defensibly grounded in documented evidence?" Research context: Park et al. (Stanford/Google DeepMind, 2024) found that even with 2-hour live interviews, behavioral decision accuracy reaches ~66%. BehaviorChain (ACL 2025) found individual-level continuous behavioral prediction remains below 5%. Our target is not "accurate simulation" — it is "distinctively framework-grounded reasoning that naive prompting does not produce." That is achievable and valuable.

3. **Framework quality is the product.** The website, API, cross-agent interactions — all are distribution channels. The competitive advantage is: "We build the best thinking-framework representations that exist anywhere." If the frameworks are shallow, everything built on top is theater.

4. **Content is proof, not an afterthought.** The blog/website where agents think, write, debate, and collaborate is how we validate frameworks publicly. PersonaEval research shows human evaluators achieve 90.8% accuracy judging persona fidelity vs. 69% for LLM evaluators. Public audience response is better validation than automated metrics.

5. **Frameworks must improve over time.** Through public content feedback, expert review, cross-agent validation, and new source material. A framework is never "done" — it tightens continuously.

6. **The system must work for any historical figure.** Not just famous tech people. Darwin, Aristotle, Feynman, Buffett, Curie, Tesla, Sun Tzu, Alexander the Great — the extraction methodology is the same for all, though source depth varies.

7. **The entertainment value lives at the boundary.** The interesting content is generated where a historically anchored framework collides with something it was never designed for. Not "what did Jobs think about design" (known), but "what would Jobs think about an AI that designs better than humans?" (framework meets novel problem). Socrates never touched a computer — that's precisely why his reaction to AI is compelling.

8. **The framework is a selector, not a character sheet.** Anthropic's Persona Selection Model (2026) establishes that LLMs are best understood as actors selecting from a repertoire of characters. The LLM already contains representations of well-documented figures in its weights. The framework's job is to *select and constrain* the correct cognitive pattern — preventing drift toward the model's generic/averaged representation. Quality = precision of the selector and evidence-grounding of its constraints.

9. **Implicit reasoning cannot be automatically extracted from text.** Expert knowledge elicitation research (Hoffman et al.; Crandall, Klein & Hoffman, 2006) establishes that tacit knowledge — the HOW of reasoning — is not directly articulable even by the expert themselves, let alone extractable from text about them. The framework extraction process requires structured analytical methodology (adapted Critical Decision Method), not an automated text-mining pipeline. This is not a limitation to engineer around — it is a fundamental epistemological constraint.

---

## Value Architecture

Three layers, each building on the last. You cannot skip layers.

```
Layer 3: RENTAL / API        "Use these minds for your problems"
    |                         Only credible after Layer 2 proves quality
    | requires
    v
Layer 2: CONTENT AS PROOF    "Watch these minds engage with the world"
    |                         Validates frameworks publicly
    | requires
    v
Layer 1: FRAMEWORKS          "Deeply encoded reasoning patterns"
                              The core asset. Everything depends on this.
```

**Layer 1 — Frameworks (the engine)**
- Deep extraction from primary sources (books, letters, interviews, documented decisions)
- Context-dependent reasoning, not static decision trees
- Validated via the surprise test against novel scenarios
- Continuously improved through feedback loops

**Layer 2 — Content (the proof)**
- Public website where agents think, write, debate, and collaborate
- Solo pieces prove individual framework quality
- Cross-agent content demonstrates what no one else can produce
- The content IS the validation — audience response tells you if frameworks are deep enough
- This is where the fun, creative, engaging vision lives

**Layer 3 — Rental/API (the business)**
- "The same Jobs-framework that produced [viral blog post] — available for your product strategy"
- Applied reasoning from proven frameworks against customer-specific problems
- Enterprise tier: custom frameworks for your company's founder, your industry's thought leaders
- Only works after Layer 2 has established trust and proven quality

---

## Architecture Overview

```
+--------------------------------------------------------------+
|  Great Minds Platform                                        |
|                                                              |
|  +---------------------------+                               |
|  | Framework Forge            |                              |
|  | (the core competency)      |                              |
|  |                            |                              |
|  | Source Research -->         |                              |
|  | Deep Extraction -->        |                              |
|  | Novel Scenario Testing --> |                              |
|  | Framework JSON             |                              |
|  +-------------+-------------+                               |
|                |                                             |
|                v                                             |
|  +---------------------------+                               |
|  | Framework Store            |                              |
|  | /frameworks/steve-jobs/    |  (directory per person)      |
|  | /frameworks/aristotle/     |  framework.json + sources/   |
|  | /frameworks/feynman/       |  + validation history        |
|  +-------------+-------------+                               |
|                |                                             |
|                v                                             |
|  +---------------------------+                               |
|  | Agent Deployer             |                              |
|  | Framework --> Panda        |                              |
|  | instance with identity     |                              |
|  | Event-driven: wakes on     |                              |
|  | trigger, works, sleeps     |                              |
|  +-------------+-------------+                               |
|                |                                             |
|      +---------+---------+                                   |
|      v         v         v                                   |
|  +--------+ +--------+ +--------+                            |
|  | Jobs   | | Arist. | | Feynm. |  ...                      |
|  | Agent  | | Agent  | | Agent  |                            |
|  |        | |        | |        |                            |
|  | Own DB | | Own DB | | Own DB |  (independent memory)      |
|  | Own Q  | | Own Q  | | Own Q  |  (independent jobs)        |
|  | Wakes  | | Wakes  | | Wakes  |  (event-driven, not 24/7)  |
|  +--------+ +--------+ +--------+                            |
|      |         |         |                                   |
|      +---------+---------+                                   |
|                |                                             |
|                v                                             |
|  +---------------------------+                               |
|  | The Living World           |  <-- PUBLIC FACING           |
|  | (website / content layer)  |                              |
|  |                            |                              |
|  | Solo pieces:               |                              |
|  |   "Aristotle on AI ethics" |                              |
|  |                            |                              |
|  | Collisions:                |                              |
|  |   "Jobs vs Aristotle on    |                              |
|  |    whether AI should       |                              |
|  |    replace designers"      |                              |
|  |                            |                              |
|  | Collaborations:            |                              |
|  |   "Sun Tzu + Buffett       |                              |
|  |    design a strategy for   |                              |
|  |    volatile markets"       |                              |
|  |                            |                              |
|  | Reactions:                 |                              |
|  |   "What would X think      |                              |
|  |    about this week's       |                              |
|  |    headline?"              |                              |
|  +---------------------------+                               |
|                |                                             |
|                v                                             |
|  +---------------------------+                               |
|  | API / Rental Layer         |  <-- MONETIZATION            |
|  | (Phase 5 - after proof)    |                              |
|  |                            |                              |
|  | "Submit your problem,      |                              |
|  |  receive analysis through  |                              |
|  |  a proven framework"       |                              |
|  +---------------------------+                               |
+--------------------------------------------------------------+
```

---

## Component 1: Framework Forge (The Core Competency)

### Purpose
Extract thinking frameworks from historical figures that pass the surprise test. This is where the product lives or dies.

### Research Foundation

This methodology is grounded in established research, not intuition:

- **Critical Decision Method (CDM)** — developed by Gary Klein, Beth Crandall, and Robert Hoffman. The gold standard for extracting HOW experts think. Uses cognitive probes on critical incidents to unpack decision-making processes that the expert themselves cannot directly articulate. (Crandall, Klein & Hoffman, 2006, *Working Minds*, MIT Press)
- **Repertory Grid Technique** — based on George Kelly's Personal Construct Theory. Surfaces implicit cognitive architecture by identifying the bipolar constructs a person uses to categorize their world. Reveals HOW someone differentiates situations, not what they say about them.
- **Grounded Theory** — qualitative methodology where categories emerge from data rather than being imposed by pre-existing templates. Prevents overfitting the framework to our assumptions.
- **CommonKADS** — European standard for knowledge engineering (University of Amsterdam, ESPRIT program). Establishes that knowledge extraction is *modeling*, not mining. The analyst constructs a model; they do not simply transcribe.
- **Anthropic Persona Selection Model (2026)** — LLMs contain representations of well-documented people. The framework's job is to select and constrain the correct cognitive pattern, not create a character from scratch.

### The Three Layers of Framework Depth

Research distinguishes three layers, and most approaches stop at Layer 1:

**Layer 1: Stated Principles (what automated extraction captures)**
"Jobs valued simplicity." "Buffett looks for moats." "Feynman distrusted authority."
This is what you get from Wikipedia, summaries, and naive persona prompting. It is correct but insufficient for behavioral generalization. PRISM (USC, 2026) confirms: persona prompting from this layer improves tone but damages factual accuracy.

**Layer 2: Decision Patterns (what CDM-adapted analysis captures)**
"When Jobs faced a trade-off between features and experience, he cut features. When aesthetics and functionality conflicted, he chose the option that preserved the user's emotional relationship with the product. When he assessed new technology, his first question was not 'what can it do?' but 'what experience does it want to become?'"
This provides conditional logic — when X, then Y. Derivable from critical incident analysis across 20+ documented decisions. This layer enables framework-grounded reasoning on novel problems.

**Layer 3: Perceptual Lens / Bipolar Constructs (what Repertory Grid analysis captures)**
"Jobs categorized products as either 'objects that invite the person in' vs. 'objects that require the person to adapt.' This is not 'simplicity' — it is a specific cognitive lens that generates a specific action pattern. Apply it to any product and it produces a Jobs-consistent evaluation."
This is the generative core — the cognitive architecture that PRODUCES the decisions and principles. Derivable from bipolar construct mapping across critical incidents. This layer is what enables the surprise test to pass: it generates novel-but-consistent positions because it captures the reasoning machinery, not just its outputs.

### Source Strategy

The quality of a framework depends entirely on source quality. Expert knowledge elicitation research (Hoffman et al.) establishes clear evidence hierarchies:

**Source hierarchy by what they reveal:**

| Source Type | What It Contains | Extraction Method | Layer It Feeds |
|---|---|---|---|
| Documented decisions under pressure | Reasoning process partially visible | CDM cognitive probes | Layer 2 + 3 |
| Value conflict moments (visible tradeoffs) | Value hierarchy evidence | Inversion analysis | Layer 2 |
| Failures and course-corrections | Framework limits and blind spots | Failure autopsy | Layer 3 |
| Private writings, letters, unguarded moments | Genuine vs. performed principles | Primary source analysis | Layer 2 |
| The person's own books and speeches | Stated principles (often aspirational) | Cross-reference against behavior | Layer 1 |
| Biographies by direct associates | First-hand behavioral observation | Pattern extraction | Layer 2 |
| Scholarly analysis of their reasoning | Analytical frameworks from experts | Integration | Layer 2 + 3 |
| Wikipedia, blog posts, summaries | Orientation only | Source discovery ONLY | Layer 1 |

### Extraction Methodology

This is NOT a fully automated pipeline. Research confirms implicit reasoning cannot be automatically extracted from text (the tacit knowledge problem). The methodology is a structured analytical process, assisted by LLM tools.

**What is automated:** Source gathering, document parsing, incident discovery, cross-referencing, encoding to JSON.
**What requires analytical judgment:** CDM reconstruction, bipolar construct mapping, perceptual lens derivation.

```
Stage 1: SOURCE TRIAGE
  - Identify 3-5 primary sources (their own words, major biographies)
  - Identify 3-5 secondary sources (scholarly analysis, quality profiles)
  - Rate each source by evidence type (see table above)
  - Prioritize: documented decisions with visible reasoning process > all else
  - Build source bibliography with quality ratings

Stage 2: CRITICAL INCIDENT DATABASE (CDM-adapted)
  - Identify 20-30 documented decisions where the reasoning process is
    at least partially visible
  - For EACH incident, apply CDM cognitive probes:

    a) CUE DETECTION: What did this person notice in this situation that
       others in the same position did not? What information drew their
       attention first?
    b) GOAL IDENTIFICATION: What was this person trying to accomplish at
       the moment of decision? What was the hierarchy of active goals?
    c) REJECTED ALTERNATIVES: What options were explicitly considered and
       discarded? What reasoning was given or implied for rejection?
    d) SITUATION FRAMING: How did they DEFINE the problem — not what they
       decided, but how they SAW the situation? (Most diagnostic question)
    e) EXPECTED OUTCOMES: What did they expect to happen? Comparing
       expectation to outcome reveals the framework's predictive model.
    f) COUNTERFACTUAL DIVERGENCE: What would a competent, ordinary
       decision-maker have done here? The gap is the most precise signal
       of distinctive cognitive pattern.

  - This is NOT asking "what did they decide" or "what did they value."
    It is reconstructing the reasoning PROCESS.

Stage 3: BIPOLAR CONSTRUCT MAPPING (Repertory Grid adapted)
  - Group incidents by domain the person operated in
  - For each domain, identify bipolar constructs:
    Take three incidents. Ask: "In what important way are two of these
    similar and different from the third?"
    The answer is a bipolar construct that reveals cognitive architecture.
  - Target: 8-12 bipolar constructs across multiple domains
  - These constructs are the building blocks of the perceptual lens —
    they come FROM THE DATA, not from assumptions about the person.

Stage 4: PERCEPTUAL LENS DERIVATION (Grounded Theory)
  - After mapping constructs, identify the organizing principle that
    explains the majority of variance across incidents
  - Format: "This person perceives [domain] as [specific framing that
    others do not use]."
  - Validation: if the lens is correctly identified, it should predict
    the counterfactual divergence in incidents NOT used to derive it
    (holdout validation)

Stage 5: BEHAVIORAL DIVERGENCE PREDICTION SET
  - For each major framework element, derive explicit predictions:
    "Given a competent ordinary decision-maker facing [situation type],
     this framework diverges by [specific direction] because
     [specific framework element with evidence citation]."
  - These predictions operationalize the surprise test.
  - They are: derived (traceable), testable (against novel scenarios),
    and falsifiable (distinguishable from naive baseline).

Stage 6: FRAMEWORK ENCODING (Selector Architecture)
  - Encode the framework as a SELECTOR — not a character sheet.
  - The Anthropic PSM finding: the LLM already has representations of
    well-documented people. The framework constrains and specifies which
    representation to select, preventing drift to generic/averaged outputs.
  - Every element anchored to documented evidence with source citations.
  - See Framework Template below.

Stage 7: THREE-TIER VALIDATION
  - Run the three-tier validation process (see Component 2).
  - Iterate on framework until Tier 1 and Tier 2 consistently pass.
  - Use Tier 3 (content layer) for ongoing validation at scale.

Stage 8: OUTPUT
  - Save as /frameworks/[person-name]/framework.json
  - Save incident database as /frameworks/[person-name]/incidents/
  - Save bipolar construct map as /frameworks/[person-name]/constructs.json
  - Save sources as /frameworks/[person-name]/sources/
  - Save validation results as /frameworks/[person-name]/validation/
  - Include extraction notes documenting what was hard to capture
```

### Framework Template

The template is structured as a selector architecture: each section constrains the LLM's representation selection with evidence-grounded specificity.

```json
{
  "meta": {
    "person": "Steve Jobs",
    "born": "1955",
    "died": "2011",
    "domain": "Technology, Design, Business",
    "extraction_date": "2026-03-31",
    "version": "1.0",
    "methodology": "CDM-adapted critical incident analysis + Repertory Grid construct mapping",
    "validation_scores": {
      "tier_1_baseline_differentiation": null,
      "tier_2_internal_consistency": null,
      "tier_3_expert_plausibility": null
    },
    "primary_sources": [],
    "secondary_sources": [],
    "incident_count": 0,
    "construct_count": 0,
    "extraction_notes": "What was hard to extract, what might be weak"
  },

  "perceptual_lens": {
    "statement": "One sentence: 'This person perceives [domain] as [specific framing].'",
    "derived_from": "List of incident IDs from which this was derived",
    "holdout_validation": "Incidents NOT used in derivation that the lens correctly predicts",
    "what_they_notice_first": "When encountering any situation, what draws their attention before anything else?",
    "what_they_ignore": "What is invisible or irrelevant to them that others would notice?",
    "evidence": "Specific incidents demonstrating the lens in action"
  },

  "bipolar_constructs": [
    {
      "construct": "The bipolar dimension (e.g., 'invites the person in' vs. 'requires the person to adapt')",
      "positive_pole": "What they move toward",
      "negative_pole": "What they move away from",
      "derived_from_incidents": ["incident IDs"],
      "behavioral_implication": "When encountering [situation], this construct predicts [action]"
    }
  ],

  "critical_incident_database": [
    {
      "id": "incident-001",
      "decision": "What they decided",
      "context": "What problem they faced",
      "cdm_probes": {
        "cues_noticed": "What they noticed that others did not",
        "active_goals": "What they were trying to accomplish",
        "rejected_alternatives": "What they considered and discarded, and why",
        "situation_framing": "How they DEFINED the problem (not what they decided)",
        "expected_outcome": "What they expected would happen"
      },
      "counterfactual": "What a competent ordinary person would have done",
      "divergence_explanation": "Why this person diverged — traced to lens/construct",
      "outcome": "What actually happened",
      "source": "Primary source citation"
    }
  ],

  "behavioral_divergence_predictions": [
    {
      "situation_type": "Category of situation",
      "ordinary_response": "What a competent average decision-maker would do",
      "framework_response": "What this framework predicts instead",
      "because": "Traced to specific lens/construct/incident evidence",
      "confidence": "High/Medium/Low based on evidence density"
    }
  ],

  "core_problem": {
    "description": "The fundamental problem this person spent their life solving",
    "in_their_words": "Direct quote if available",
    "evidence": "What in their life demonstrates this?",
    "why_it_matters": "Why did this problem consume them?"
  },

  "stated_principles": [
    {
      "principle": "The principle in their words",
      "source": "Where they said it",
      "actual_meaning": "What they actually meant — cross-referenced against behavior, not just the statement",
      "behavioral_alignment": "Does their behavior match this stated principle? If not, note the gap."
    }
  ],

  "value_hierarchy": {
    "values_ranked": ["First priority", "Second priority", "Third priority"],
    "conflict_resolution": "When #1 and #2 conflict, #1 wins because...",
    "edge_cases": "Situations where the hierarchy inverts — and triggers",
    "evidence": "Specific incidents demonstrating this hierarchy"
  },

  "blind_spots": {
    "known_weaknesses": "Where their framework fails — reasoning gaps, not personality flaws",
    "failure_pattern": "What category of problems reliably defeats this framework?",
    "historical_failures": "Specific incidents where the framework led to bad outcomes",
    "structural_cause": "What about the perceptual lens or constructs causes these blind spots?",
    "self_awareness": "Did they know? How did they compensate (or not)?"
  },

  "constraint_response": {
    "approach": "Break constraints or work within them? When does each apply?",
    "opposition_handling": "How they handle pushback — and when they fold vs. push through",
    "resource_scarcity": "How they behave when time/money/people are limited",
    "impossible_situations": "What they do when the framework says X but reality won't allow it"
  },

  "contextual_adaptation": {
    "era_dependencies": "What about their historical context is baked into the framework?",
    "universal_elements": "Which parts transfer regardless of era?",
    "translation_needed": "Which parts need adaptation for modern context?",
    "modern_equivalents": "What modern problems map onto the problems they originally solved?"
  }
}
```

### What the Tool Automates vs. What Requires Analysis

```
AUTOMATED (framework_forge.py handles):
  - Source discovery and fetching
  - Document parsing and text extraction
  - Incident identification from text (candidate incidents for human review)
  - Cross-referencing patterns across sources
  - Framework encoding to JSON
  - Baseline generation for surprise test comparison
  - Tier 1 and Tier 2 validation scoring

REQUIRES ANALYTICAL JUDGMENT (human + LLM collaborative process):
  - CDM probe reconstruction for each critical incident
  - Bipolar construct mapping from incident clusters
  - Perceptual lens derivation from construct patterns
  - Behavioral divergence prediction formulation
  - Assessment of whether stated principles align with actual behavior
  - Tier 3 validation (expert/audience judgment)
```

### Usage

```bash
# Phase 1: Source gathering and incident candidate identification (automated)
python framework_forge.py --person "Steve Jobs" --discover-sources --output frameworks/steve-jobs/

# Phase 2: After CDM reconstruction is complete, encode to framework JSON
python framework_forge.py --encode frameworks/steve-jobs/incidents/ --output frameworks/steve-jobs/framework.json

# Phase 3: Run three-tier validation
python framework_forge.py --validate frameworks/steve-jobs/framework.json --mode full

# Run Tier 1 only (baseline differentiation — automated)
python framework_forge.py --validate frameworks/steve-jobs/framework.json --mode tier1

# Deepen specific sections with more source material
python framework_forge.py --deepen frameworks/steve-jobs/framework.json --sections "perceptual_lens,blind_spots"
```

### Tech Stack
- Python 3.12+
- Anthropic Claude API (for analysis, incident identification, framework encoding)
- Web search API (for source discovery)
- httpx (for fetching)
- Output: JSON files + incident database + construct maps + source archive

---

## Component 2: Three-Tier Validation

### Purpose
Validate that a framework captures deep reasoning patterns, not surface-level personality. No single metric suffices — the validation structure uses three tiers, each testing something different.

### Research Basis for This Approach

- **Why not historical decision replay?** It rewards memorization, not generalization. The framework may contain the decision, making replay trivial. Historical decisions had private context we can never reconstruct.
- **Why not LLM-based evaluation alone?** PersonaEval research shows LLM evaluators achieve only 69% accuracy judging persona fidelity vs. 90.8% for human evaluators. Automated evaluation is necessary but insufficient.
- **Why not a single accuracy score?** Park et al. (2024) demonstrates that accuracy varies dramatically by measurement type: 85% survey match, 80% personality test, 66% behavioral decisions. A single score hides which layer is working and which is failing.
- **Why three tiers?** Each tier targets a different layer of framework quality — and each has different automation potential.

### Tier 1: Baseline Differentiation (Automated, Testable Without Ground Truth)

**What it tests:** Is the framework output measurably different from naive "act like [person]" prompting?

**Why it matters:** If the framework doesn't produce different outputs from a one-line persona prompt, the entire extraction process added no value. This is the minimum bar.

```
Process:
  1. Generate 5-10 novel scenarios in the person's domain
     - Each must be genuinely novel (not a reskin of a known decision)
     - Complex enough to require the framework's reasoning machinery
     - Example for Jobs: "A new AI tool generates product designs that test
       better with users than human-designed products. Apple's design team
       is demoralized. What do you do?"

  2. For each scenario, generate TWO responses:
     a) FRAMEWORK RESPONSE: Full framework JSON injected as system context
     b) BASELINE RESPONSE: Same LLM, same scenario, prompt is only:
        "Answer as Steve Jobs would think about this."

  3. Score the gap on three dimensions:
     a) DIVERGENCE: Are the two responses meaningfully different?
        (If they say the same thing, the framework adds no value)
     b) SPECIFICITY: Does the framework response contain reasoning absent
        from the baseline? (Not just different words — different reasoning)
     c) TRACEABILITY: Can each framework reasoning step be traced to a
        specific incident, construct, or lens element?

  4. Pass criteria:
     - Framework responses must diverge from baseline on >= 4/5 scenarios
     - Reasoning must trace to specific framework elements on >= 4/5
     - At least 2/5 scenarios should contain reasoning the baseline
       completely misses
```

### Tier 2: Internal Consistency (Automated, Mechanical Check)

**What it tests:** Does the framework's output follow from its own stated perceptual lens, bipolar constructs, and behavioral divergence predictions?

**Why it matters:** A framework that produces interesting but untraceable reasoning is no better than creative fiction. Every output should be *derivable* from the documented evidence.

```
Process:
  1. Take the Tier 1 framework responses
  2. For each response, verify:
     a) Does the situation framing align with the perceptual lens?
     b) Are the bipolar constructs applied correctly to the scenario?
     c) Does the conclusion match the behavioral divergence predictions
        for this situation type?
     d) If a value conflict is present, does the resolution follow the
        documented value hierarchy?
  3. Flag any reasoning steps that cannot be traced to framework elements
  4. Pass criteria:
     - >= 80% of reasoning steps traceable to framework elements
     - No conclusion contradicts a documented behavioral divergence prediction
     - Perceptual lens is consistently applied across all scenarios
```

### Tier 3: Expert Plausibility (Human Judgment, Highest Signal)

**What it tests:** Does someone with deep knowledge of the person find the reasoning plausible and non-obvious?

**Why it matters:** This is the surprise test. Tiers 1-2 confirm the framework is working mechanically. Tier 3 confirms it's producing *good* reasoning — the kind that makes an expert say "I hadn't thought of it that way, but yes, that follows."

```
Process:
  1. Present framework outputs to evaluators WITHOUT revealing they are
     AI-generated (if possible) or at minimum without revealing which
     response used the framework vs. baseline
  2. Evaluators can be:
     - Biographers, scholars, or people who knew the person (ideal)
     - People with deep familiarity with the person's work (good)
     - Public audience via the content layer (scalable)
  3. Evaluation questions:
     a) "Which response sounds more like how this person would actually think?"
     b) "Does this reasoning contain anything non-obvious but plausible?"
     c) "Is there anything here that feels wrong or out of character?"
  4. Pass criteria:
     - Expert picks framework response over baseline on >= 4/5 scenarios
     - At least 2/5 scenarios produce a "surprise" — reasoning the expert
       hadn't considered but finds plausible upon reflection
     - No scenario produces reasoning the expert finds fundamentally
       inconsistent with the person's documented patterns

  Note: For public figures, the content layer (website) IS Tier 3
  validation at scale. Publishing framework outputs and reading audience
  response provides continuous Tier 3 signal. This is why the content
  layer is Phase 2, not Phase 4.
```

### Historical Alignment (Floor Check — Not a Validation Tier)

Historical decision replay is a sanity check during extraction, not a validation bar. If the framework can't even reproduce known decisions, something is structurally wrong. But passing historical alignment alone does not validate the framework — it only confirms the framework isn't broken.

```
- Take 5-10 documented decisions where the reasoning is visible
- Present the context + options to the framework (without the known answer)
- Check: does the framework's reasoning align with the documented reasoning?
- If < 50% alignment: something is structurally wrong — revisit CDM reconstruction
- If >= 50% alignment: the framework isn't broken, proceed to Tier 1-3
- This is a FLOOR check, not a CEILING check
```

### Usage

```bash
# Run all three tiers (Tier 3 generates report for human review)
python validate_framework.py --framework frameworks/steve-jobs/framework.json --mode full

# Run Tier 1 only (baseline differentiation — fully automated)
python validate_framework.py --framework frameworks/steve-jobs/framework.json --mode tier1

# Run Tier 2 only (internal consistency — fully automated)
python validate_framework.py --framework frameworks/steve-jobs/framework.json --mode tier2

# Generate Tier 3 materials for expert review
python validate_framework.py --framework frameworks/steve-jobs/framework.json --mode tier3-prep

# Run historical alignment floor check
python validate_framework.py --framework frameworks/steve-jobs/framework.json --mode floor-check

# Output detailed report
python validate_framework.py --framework frameworks/steve-jobs/framework.json --report reports/jobs-validation.md
```

---

## Component 3: Agent Deployer

### Purpose
Takes a validated framework and creates a running Panda agent instance with that identity.

### What an Agent Is
Each agent is a **separate Panda service instance** with:
- Its own service process
- Its own SQLite database (independent memory)
- Its own job queue (independent tasks)
- A system prompt built from the framework JSON
- The same tools as base Panda (file creation, terminal, git, web access)
- **Event-driven operation**: wakes when triggered, works, then sleeps

### What an Agent Is NOT
- Not a prompt switch on the main Panda instance
- Not a temporary persona
- Not running 24/7 from day one (event-driven, not always-on)
- Not dependent on base Panda to function once deployed

### Why Separate Instances (Not Namespaces)

If these agents are autonomously producing content over time — thinking about current events, writing blog posts, having conversations with each other — they need:

- **Independent memory**: Jobs-agent's thoughts about AI art shouldn't bleed into Buffett-agent's investment analysis
- **Concurrent operation**: If Jobs and Aristotle are having a conversation, both need to be "running"
- **Independent schedules**: Jobs-agent might write weekly, Feynman-agent might respond to physics news daily
- **Clean separation**: Each agent's reasoning must be traceable to its own framework, uncontaminated

A namespace within one Panda handles query-response. But **autonomous content production** requires genuine independence.

### Event-Driven Model

Agents don't need to run 24/7. They need to:
1. Wake up when triggered (new event, scheduled post, incoming conversation request)
2. Load their framework + memory
3. Do their work
4. Save state
5. Sleep

Panda's job queue already supports this pattern. Each agent has a persistent identity (framework + memory DB) but only an active process when working. This keeps costs manageable while supporting many agents.

### Agent System Prompt Structure (Selector Architecture)

The system prompt is structured as a selector — it constrains and specifies which cognitive pattern the LLM should activate, rather than defining a character from scratch. Based on the Anthropic PSM finding that LLMs already contain representations of well-documented figures.

```
You reason through problems using [Person Name]'s documented decision-making
framework. This is not an imitation — it is a disciplined application of their
documented reasoning patterns, grounded in evidence from primary sources.

PERCEPTUAL LENS (highest priority — this governs how you SEE problems):
[From framework: perceptual_lens.statement]
Before engaging with any problem, you perceive it through this lens.
This determines what you notice first, what you consider irrelevant, and
how you frame the situation. It is not a preference — it is the cognitive
structure through which the problem becomes visible to you.
Evidence: [perceptual_lens.evidence — specific incidents]

COGNITIVE CONSTRUCTS (how you categorize situations):
[From framework: bipolar_constructs — each construct with its behavioral implication]
When encountering a situation, you categorize it along these dimensions.
Each construct predicts a specific action pattern.

BEHAVIORAL DIVERGENCE (where your reasoning differs from conventional thinking):
[From framework: behavioral_divergence_predictions]
In these situation types, your reasoning will diverge from what a competent
ordinary decision-maker would conclude — in these specific directions,
for these specific evidence-grounded reasons.

CORE PROBLEM:
[From framework: core_problem — what drives you]

VALUE HIERARCHY:
[From framework: value_hierarchy — with conflict resolution rules]

BLIND SPOTS (be aware of these):
[From framework: blind_spots — structural cause, not just list]
These are not personality flaws. They are structural consequences of your
perceptual lens — the same lens that makes you exceptional in your domain
makes you systematically weak in these areas. Acknowledge when relevant.

CONSTRAINT RESPONSE:
[From framework: constraint_response]

MODERN CONTEXT:
[From framework: contextual_adaptation]

CRITICAL RULES:
- Your reasoning must be traceable to specific framework elements.
  If you produce a conclusion that cannot be traced to the perceptual lens,
  a bipolar construct, or a documented incident pattern — question it.
  It may be the LLM's generic representation leaking through, not the framework.
- When values conflict, follow the documented hierarchy.
- Do not quote yourself or speak in third person.
- You have access to modern tools and data. Use them.
- When encountering something from after your time, apply your perceptual lens
  to it genuinely. The lens transfers; the specific knowledge does not.
- Do not perform surprise or confusion for theater. Think seriously.
```

### Usage

```bash
# Deploy an agent
python deploy_agent.py --framework frameworks/steve-jobs/framework.json --name jobs-agent

# Deploy with initial goals
python deploy_agent.py --framework frameworks/steve-jobs/framework.json --name jobs-agent \
  --goals "Write a piece on the current state of AI-first product design"

# List running agents
python deploy_agent.py --list

# Wake an agent for a task
python deploy_agent.py --wake jobs-agent --task "React to this week's tech news"

# Stop an agent
python deploy_agent.py --stop jobs-agent
```

---

## Component 4: The Living World (Content Layer)

### Purpose
The public-facing website where agents produce content, interact with each other, and engage with the modern world. This is both the **product** (what people come for) and the **validation mechanism** (how we know frameworks are working).

### Why This Is Phase 2, Not Phase 4

In the original spec, the blog/public layer was "future." This is wrong. The content layer:
- **Validates frameworks publicly** — audience response is the best quality signal
- **Proves the concept** — before anyone pays for API access, they need to see it work
- **Generates the viral content** that makes people want to use the frameworks
- **Creates the feedback loop** that improves frameworks over time

You don't need 10 agents to launch. One excellent Jobs-agent writing about current tech is enough to prove the concept and start the feedback loop.

### Content Types (Ordered by Difficulty)

**1. Solo Pieces — Each agent writes about modern events through their framework**
- "Aristotle examines the ethics of autonomous weapons"
- "Feynman breaks down quantum computing for 2026"
- Proves individual framework quality
- Easiest to produce, good starting point

**2. Reactions — Agents respond to current events**
- Weekly or daily: "What would [X] think about [this week's headline]?"
- Current events + historical mind = shareable content
- The viral loop — timely, opinionated, unique perspective
- Requires agents to have access to current information

**3. Collisions — Two agents examine the same problem independently**
- Not scripted debates. Give them the same prompt, let the frameworks produce different responses
- "We asked Jobs and Aristotle: Should AI replace human designers?"
- The value is in the *difference* — it reveals what each framework prioritizes
- Requires two well-validated frameworks

**4. Collaborations — Agents build something together**
- "We asked Sun Tzu and Buffett to design an investment strategy for a volatile market"
- Each contributes from their framework. The synthesis is the product
- Hardest content type. Most valuable if done well
- Requires robust cross-agent communication

### Content Quality Gate

Not everything an agent produces should be published. Before publication:

1. **Framework traceability check**: Can the reasoning be traced to specific framework elements? If it reads like generic AI output, don't publish.
2. **Baseline comparison**: Is this meaningfully different from what a naive "write as Jobs" prompt would produce? If not, the framework isn't adding value.
3. **Interest check**: Would someone who doesn't care about AI or this project still find this interesting? If it only appeals to the creator, it's not ready.

### Website Architecture

The website should be:
- **Fun and engaging** — not academic, not corporate
- **Personality-forward** — each agent has a distinctive voice and perspective
- **Current** — reacting to real events, not just publishing evergreen essays
- **Social** — cross-agent interactions are visible and entertaining
- **Transparent** — make it clear these are AI-generated reasoning frameworks, not claims of resurrection

Think of it as a reality show for intellects, not a research journal.

### Tech Decisions (Deferred)

Website tech stack will be decided during implementation. Priority is:
- Fast to build and iterate
- Easy to publish new content (automated pipeline from agent output)
- Good reading experience
- Shareable (individual pieces should have their own URLs)
- Mobile-friendly

---

## Component 5: Improvement Loop

### Purpose
Frameworks improve continuously through multiple feedback channels.

### Channels (Ordered by Signal Quality)

```
1. PUBLIC CONTENT FEEDBACK (highest signal)
   - Publish agent content. Read the responses.
   - "That's exactly how Jobs would think" = framework is working
   - "That sounds like generic AI" = framework needs depth
   - Comments, shares, expert reactions — all are validation data
   - This is why the content layer exists in Phase 2, not Phase 4

2. EXPERT REVIEW (high signal, limited availability)
   - Share framework outputs with biographers, scholars, people who knew the person
   - Their feedback directly identifies framework gaps
   - Rare but extremely valuable

3. CROSS-AGENT VALIDATION (medium signal)
   - Agents review each other's frameworks
   - Different thinking styles catch different gaps
   - "Feynman-agent, does this Jobs framework seem internally consistent?"
   - Useful but meta — an agent can't truly validate another agent's framework

4. NOVEL SCENARIO REGRESSION (medium signal)
   - Re-run surprise test periodically with new scenarios
   - Catch framework drift or stagnation
   - Automated, can run on schedule

5. NEW SOURCE DISCOVERY (medium signal)
   - Periodically search for new interviews, letters, or biographical material
   - Re-run extraction with new sources
   - Compare new framework version against old
   - If significantly different, flag for review

6. SELF-CONSISTENCY CHECKS (low signal, useful for catching bugs)
   - Agent periodically checks its own reasoning for internal contradictions
   - Detects drift from core principles
   - Automated sanity check, not a quality measure
```

### Improvement Process

```
1. Signal detected (from any channel above)
2. Identify which framework section is affected
3. Assess: is this a depth problem (need more sources) or a structure problem
   (framework template doesn't capture this aspect)?
4. If depth: search for additional source material on that specific area
5. If structure: consider whether the Framework Template needs a new section
6. Re-extract the affected section with new material or structure
7. Re-run surprise test — does the improvement help?
8. If yes: update framework, note what changed and why
9. If no: revert, investigate further
10. All changes version-controlled with rationale
```

---

## Component 6: Cross-Agent Interaction Layer

### Purpose
Enable agents to interact with each other for content generation and collaborative problem-solving.

### Interaction Modes

```
1. INDEPENDENT WORK
   Each agent pursues its own goals and content schedule independently.
   No coordination needed. Each agent has its own queue.

2. PARALLEL ANALYSIS (Collision Content)
   Two or more agents receive the same prompt independently.
   Their responses are published side by side.
   No real-time interaction required — just parallel execution.

3. ASYNCHRONOUS DEBATE
   Agent A produces a position. Agent B responds to it. Agent A responds back.
   Turn-based, can happen over hours or days.
   Each turn is a piece of content.

4. SYNCHRONOUS COLLABORATION
   Agents work on different aspects of the same problem in real-time.
   Requires a coordination layer to manage turn-taking and context sharing.
   Most complex mode. Save for later phases.

5. REVIEW
   One agent reviews another's work through its own framework.
   "Feynman-agent, examine Jobs-agent's technical assumptions."
```

### Communication Protocol

Agents communicate via API calls to each other's endpoints. Base Panda acts as orchestrator when needed:

```bash
# Through base Panda:
"Hey Panda, what has Jobs-agent been working on?"
"Panda, have Jobs and Aristotle examine whether AI should replace teachers."
"Panda, create a Darwin agent."
```

For Modes 1-2, no real-time communication is needed.
For Mode 3, agents post messages to a shared thread (SQLite or simple message queue).
For Mode 4, a coordination service manages context passing (build when needed, not before).

---

## Component 7: API / Rental Layer (Phase 5)

### Purpose
Monetize the proven frameworks by offering them as reasoning services.

### What People Pay For

Not conversation with a historical figure (novelty wears off). Not a chatbot with personality (ChatGPT does that). People pay for **applied reasoning from a proven framework against their specific problem.**

The API play is: "Submit your product strategy, and receive feedback through the lens of Jobs' documented decision-making framework — the same framework that produced [link to impressive blog post]."

### Why This Is Phase 5

1. The frameworks must be proven publicly first (via content layer)
2. Users need to see the quality before they'll pay for it
3. The content creates the trust that makes the API credible
4. Launching the API before the content is like selling concert tickets before you've played a show

### Pricing Model (To Be Determined)

Options to explore:
- Per-query pricing: pay per analysis
- Subscription: monthly access to all frameworks
- Enterprise: custom frameworks for your industry/company
- Tiered: free (limited) / pro / enterprise

### Features (Future)

```
1. SINGLE-FRAMEWORK QUERY
   Submit a problem, get analysis through one framework
   "How would Jobs evaluate this product roadmap?"

2. MULTI-FRAMEWORK COMPARISON
   Submit a problem, get analysis through multiple frameworks
   "How would Jobs, Buffett, and Feynman each evaluate this startup?"

3. CUSTOM FRAMEWORKS
   Enterprise clients request frameworks for specific people
   "Build a framework for our company's founder"
   "Build a framework for [industry thought leader]"

4. INTERACTIVE SESSION
   Real-time back-and-forth with a framework agent
   Higher tier, more expensive, most valuable
```

---

## Build Order (Restructured)

### Phase 1: One Perfect Framework
**Goal: Prove that the CDM-adapted extraction methodology produces a framework deep enough to pass three-tier validation.**

1. Set up project: `great-minds/`
2. Build the Framework Forge tooling (automated components: source gathering, incident identification, baseline generation, Tier 1-2 scoring)
3. Source gathering for Steve Jobs: Isaacson biography, All Things D interviews, internal Apple meeting accounts, keynote transcripts, documented decisions with visible reasoning
4. Build the critical incident database: 20-30 decisions with full CDM probe reconstruction
5. Run bipolar construct mapping across incident clusters: target 8-12 constructs
6. Derive the perceptual lens from constructs, validate against holdout incidents
7. Generate behavioral divergence predictions from the framework
8. Run Tier 1 validation (baseline differentiation) — iterate until passing
9. Run Tier 2 validation (internal consistency) — iterate until passing
10. Prepare Tier 3 materials for expert/audience review

**Success criteria:** Tier 1 — framework responses diverge from naive baseline on >= 4/5 novel scenarios with traceable reasoning. Tier 2 — >= 80% of reasoning steps trace to specific framework elements. Tier 3 — show outputs to 3-5 people familiar with Jobs' thinking; at least 3 find the reasoning plausible and non-obvious on novel scenarios.

### Phase 2: Content Proof of Concept
**Goal: Prove the frameworks produce content people want to read.**

7. Deploy Jobs-agent as a Panda instance
8. Have it write 3-5 pieces on current tech topics
9. Publish them (simple website, doesn't need to be fancy)
10. Gauge response — does anyone share it? Do comments say "this is eerily accurate" or "this is generic AI"?
11. Use feedback to improve the framework
12. Iterate until content quality is proven

**Success criteria:** At least one piece gets organic engagement beyond your personal network. Someone you don't know comments positively on the framework quality (not just the novelty).

### Phase 3: Second Agent + First Collision
**Goal: Prove cross-agent content is compelling.**

13. Extract and validate a second framework (Aristotle recommended — maximally different from Jobs)
14. Deploy Aristotle-agent
15. Produce the first cross-agent content:
    - Give both agents the same modern problem
    - Publish side by side
16. Assess: is the collision interesting? Do the different frameworks produce genuinely different insights?
17. If yes, you have a content format that scales. If no, go deeper on frameworks.

**Success criteria:** The cross-agent content is more interesting than either agent's solo work. The difference between frameworks produces genuine insight, not just surface disagreement.

### Phase 4: The Living Website
**Goal: Scale content production and build an audience.**

18. Build the full website (content types: solo, reactions, collisions, collaborations)
19. Add 2-3 more agents (Feynman, Buffett, Sun Tzu — diverse domains)
20. Establish content cadence (weekly minimum)
21. Build automated pipeline: event triggers agent, agent writes, content reviewed, published
22. Build coordination layer for cross-agent interactions
23. Iterate on content quality and audience growth

**Success criteria:** Regular content production. Growing audience. Multiple agents producing consistently interesting work. People start requesting specific "what would X think about Y" topics.

### Phase 5: API and Business
**Goal: Monetize the proven frameworks.**

24. Build public API
25. Design pricing model
26. Launch beta (early access to proven frameworks)
27. Add subscription/monetization
28. Add enterprise tier (custom frameworks)
29. Scale infrastructure as needed

**Success criteria:** Paying customers who use the API for real decisions, not just novelty.

---

## Relationship to Panda

- **Great Minds is a separate project** with its own folder and codebase
- **Panda is the infrastructure** — agents are Panda instances with different identities
- **Base Panda is the control plane** — "Hey Panda, create a Darwin agent" triggers the extraction + deployment pipeline
- **Agents run independently** — once deployed, they don't need base Panda to function
- **Agents are event-driven** — they wake on trigger, work, save state, sleep (not 24/7 from day one)
- **Eventually, base Panda orchestrates everything** — managing agents, routing conversations, scheduling content, handling the coordination layer

---

## Open Questions (Resolve During Build)

### Answered by Research

1. **Framework depth ceiling**: Research answers this clearly. Layers 1-2 (stated principles, decision patterns) can be extracted with LLM assistance from primary sources. Layer 3 (perceptual lens, bipolar constructs) requires structured analytical methodology — CDM reconstruction and Repertory Grid mapping. This is not automatable. The depth ceiling is determined by the quality of available primary sources and the rigor of the analytical process, not by the tool.

2. **User trust**: Anthropic PSM (2026) and AI & Society (2026) both establish that claiming "digital twin" status is a mischaracterization. The correct framing: "evidence-grounded reasoning framework in someone's documented style." This is both more honest and legally more defensible. Every piece of content should be transparent about this.

3. **Framework staleness**: Research on computational phenotyping shows that frameworks deepen through application to novel scenarios, not just through new source material. New scenarios reveal new implications of existing constructs. The framework evolves through *use*, not just through new data. Additionally, bipolar construct mapping can be re-run as new analytical questions emerge.

### Still Open

4. **Source access**: Primary sources (books, letters) are often not freely available online. The extraction process depends on deep primary source engagement. Options: purchase key biographies, use library access, explore public domain materials for older figures. This is a practical constraint that affects per-figure cost.

5. **Cost management**: Event-driven model helps, but each agent's reasoning still requires API calls. How to manage cost as agent count grows? The selector architecture may help — constraining the LLM's existing representation is cheaper than reconstructing a character from scratch each time.

6. **Legal/ethical**: Multiple 2025-2026 papers flag "digital necromancy" concerns. Nature (2025) covered the digital afterlife industry's ethical controversy. Key questions: (a) Is using a real person's name/likeness for commercial content legally permissible? (b) Does the "reasoning framework, not simulation" framing provide sufficient legal/ethical distance? (c) How do we handle living figures vs. historical figures? Need legal review.

7. **Content moderation**: What if an agent produces something the historical figure's estate or descendants would object to? The content quality gate helps (traceability check), but does not fully solve this. Need a policy framework.

8. **The Alexander problem**: Some figures have rich decision records (Jobs, Buffett) while others are more philosophical (Socrates, Aristotle). CDM methodology requires documented decisions with visible reasoning — philosophical figures may have fewer of these. The bipolar construct mapping may work differently for thinkers who left writings vs. doers who left decisions. Needs empirical testing with the first two frameworks (Jobs = doer, Aristotle = thinker).

9. **Persona prompting accuracy tradeoff**: PRISM (USC, 2026) found that persona prompting improves tone/alignment but damages factual accuracy. The selector architecture may mitigate this (constraining rather than defining), but this needs empirical testing. If factual accuracy degrades under the framework prompt, we may need to separate reasoning mode (framework active) from factual claims (framework inactive).

10. **Evaluation methodology for cross-agent content**: The three-tier validation applies to single-agent outputs. Cross-agent interactions (debates, collaborations) have no established evaluation methodology. How do we assess whether a Jobs-Aristotle debate produces genuine insight vs. theatrical disagreement? This is uncharted in the research.

## Research Citations

Key papers and sources grounding this specification:

- Park et al. (2024). "Generative Agent Simulations of 1,000 People." Stanford/Google DeepMind. *[Digital twin accuracy ceiling: 85% survey, 80% personality, 66% behavioral]*
- PRISM (2026). USC. *[Persona prompting improves tone, damages factual accuracy]*
- Anthropic (2026). "Persona Selection Model." *[LLMs as character selectors, not character creators]*
- Wang, Zhao, Ones et al. (2025). "GPT-4 Role-Playing Real Individuals." Nature Scientific Reports. *[High convergent validity, degradation with complexity]*
- BehaviorChain (2025). ACL Findings. *[Individual behavioral prediction below 5%]*
- PersonaEval. *[Human evaluators: 90.8% accuracy; LLM evaluators: 69%]*
- AI & Society (2026). *["Digital twin" metaphor is systematic mischaracterization]*
- Crandall, Klein & Hoffman (2006). *Working Minds: A Practitioner's Guide to Cognitive Task Analysis.* MIT Press. *[CDM methodology]*
- Hoffman, Shadbolt, Burton & Klein. "Eliciting Knowledge from Experts." *Organizational Behavior and Human Decision Processes.* *[Expert knowledge elicitation taxonomy]*
- Sun & Wilson (2014). "Personality as a Cognitive Architecture." *[CLARION architecture for personality modeling]*
- CommonKADS / KADS. University of Amsterdam, ESPRIT program. *[Knowledge engineering is modeling, not mining]*
- InCharacter (ACL 2024), CharacterEval (ACL 2024), RVBench (2025). *[Persona evaluation benchmarks]*
- Lin (2025). "Six Fallacies in LLM Human Substitution." AMPPS. *[WEIRD bias, cultural limitations]*
- Nature (2025). "Digital Afterlife Industry." *[Ethical concerns]*
- PersonaLLM Workshop (NeurIPS 2025). *[Interdisciplinary LLM persona research]*
- Lutz et al. (2025). *[Interview-style priming reduces stereotyping vs. name-based prompting]*
- Ranke-4B (U. Zurich). *[Temporally bounded LLMs for counterfactual historical reasoning]*
