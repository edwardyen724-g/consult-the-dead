"""CDM Probe Reconstruction: deep cognitive analysis of critical incidents.

Applies Klein, Crandall & Hoffman's six Critical Decision Method probes to
reconstruct the cognitive processes behind each candidate incident. The probes
surface cues noticed, active goals, rejected alternatives, situation framing,
and expected outcomes — revealing the perceptual filters that drive decisions.
"""

from dataclasses import dataclass, asdict
from typing import Any

from framework_forge.llm import LLMClient
from framework_forge.extraction.incidents import CandidateIncident


@dataclass
class ReconstructedIncident:
    """A critical incident reconstructed through CDM probe analysis.

    Contains the original decision context enriched with cognitive probes
    that reveal the subject's underlying perceptual framework.
    """

    id: str
    decision: str
    context: str
    cdm_probes: dict  # Keys: cues_noticed, active_goals, rejected_alternatives, situation_framing, expected_outcome
    counterfactual: str
    divergence_explanation: str
    outcome: str
    source: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


CDM_SYSTEM = """\
You are an expert cognitive task analyst applying the Critical Decision Method
(CDM) developed by Klein, Crandall & Hoffman (2006). Your task is to reconstruct
a critical decision incident using the six standard CDM probes.

The CDM probes you must apply:

1. CUES NOTICED — What information did the decision-maker attend to? What
   perceptual cues triggered their recognition of the situation? What did they
   notice that others might have missed or dismissed?

2. ACTIVE GOALS — What were the decision-maker's operative goals at the moment
   of decision? Not their stated mission, but the goals actively shaping their
   perception and action selection.

3. REJECTED ALTERNATIVES — What options did they consider and reject? Why were
   those alternatives dismissed? The rejection criteria reveal the decision-maker's
   deeper evaluative framework.

4. SITUATION FRAMING — How did the decision-maker mentally categorize this
   situation? What mental model or analogy did they use? A key CDM insight is that
   experts often reframe situations in ways that novices or peers would not.

5. EXPECTED OUTCOME — What did the decision-maker expect would happen as a result
   of their choice? This reveals their causal mental model and confidence calibration.

Additionally, construct:
- A COUNTERFACTUAL: What would a competent but ordinary peer have done in the
  same situation? This anchors the divergence analysis.
- A DIVERGENCE EXPLANATION: Why did this person's decision differ from the
  counterfactual? What in their perceptual framework drove the difference?

Return ONLY valid JSON with no additional commentary.\
"""

CDM_PROMPT = """\
Reconstruct the following critical incident about {person} using the six CDM
probes (cues_noticed, active_goals, rejected_alternatives, situation_framing,
expected_outcome) plus counterfactual and divergence analysis.

Incident title: {title}
Incident description: {description}
Source excerpt: {source_text_excerpt}
Source: {source_title}

Return a JSON object with this structure:
{{
  "decision": "One-sentence statement of the decision made",
  "context": "2-3 sentences describing the situation and constraints",
  "cdm_probes": {{
    "cues_noticed": "What perceptual cues did {person} attend to?",
    "active_goals": "What goals were operatively shaping their action?",
    "rejected_alternatives": "What did they consider and reject, and why?",
    "situation_framing": "How did they mentally categorize this situation?",
    "expected_outcome": "What did they expect would happen?"
  }},
  "counterfactual": "What would a competent peer have done instead?",
  "divergence_explanation": "Why did {person}'s choice differ from the counterfactual?",
  "outcome": "What actually happened as a result?"
}}\
"""


def reconstruct_incident(
    candidate: CandidateIncident,
    person: str,
    incident_id: str,
    client: LLMClient | Any | None = None,
) -> ReconstructedIncident:
    """Reconstruct a candidate incident using CDM probe analysis.

    Applies Klein/Crandall/Hoffman's six CDM probes to extract the cognitive
    structure behind a critical decision, including counterfactual and divergence
    analysis.

    Args:
        candidate: The CandidateIncident to reconstruct.
        person: Name of the person being studied.
        incident_id: Unique identifier for this incident.
        client: An LLMClient instance (or mock). Created if not provided.

    Returns:
        A ReconstructedIncident with full CDM probe analysis.
    """
    if client is None:
        client = LLMClient()

    user_prompt = CDM_PROMPT.format(
        person=person,
        title=candidate.title,
        description=candidate.description,
        source_text_excerpt=candidate.source_text_excerpt,
        source_title=candidate.source_title,
    )

    data = client.prompt_json(system=CDM_SYSTEM, user=user_prompt)

    return ReconstructedIncident(
        id=incident_id,
        decision=data["decision"],
        context=data["context"],
        cdm_probes=data["cdm_probes"],
        counterfactual=data["counterfactual"],
        divergence_explanation=data["divergence_explanation"],
        outcome=data["outcome"],
        source=candidate.source_title,
    )
