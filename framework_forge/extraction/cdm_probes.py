"""CDM probe reconstruction for critical incidents.

Applies Klein, Crandall & Hoffman's Critical Decision Method probes to
reconstruct the cognitive processes behind each candidate incident. The module
keeps a typed probe object that still behaves like a mapping so downstream
construct and lens code can consume reconstructed incidents without change.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from collections.abc import Mapping
from typing import Any

from framework_forge.llm import LLMClient
from framework_forge.extraction.incidents import CandidateIncident


CDM_PROBE_FIELDS = (
    "cues_noticed",
    "active_goals",
    "rejected_alternatives",
    "situation_framing",
    "expected_outcome",
)


def _require_text_field(
    data: Mapping[str, Any],
    field: str,
    *,
    context: str,
) -> str:
    """Return a required non-empty text field from a mapping."""
    if field not in data:
        raise ValueError(f"{context} is missing required field '{field}'")

    value = data[field]
    if not isinstance(value, str):
        raise TypeError(f"{context}.{field} must be a string, got {type(value).__name__}")

    if not value.strip():
        raise ValueError(f"{context}.{field} cannot be empty")

    return value


@dataclass(frozen=True)
class CDMProbes:
    """Typed Critical Decision Method probe responses."""

    cues_noticed: str
    active_goals: str
    rejected_alternatives: str
    situation_framing: str
    expected_outcome: str

    @classmethod
    def from_mapping(cls, data: Mapping[str, Any]) -> "CDMProbes":
        """Build a typed probe bundle from a mapping with validation."""
        if not isinstance(data, Mapping):
            raise TypeError(f"CDM probes must be a mapping, got {type(data).__name__}")

        return cls(
            cues_noticed=_require_text_field(data, "cues_noticed", context="cdm_probes"),
            active_goals=_require_text_field(data, "active_goals", context="cdm_probes"),
            rejected_alternatives=_require_text_field(
                data, "rejected_alternatives", context="cdm_probes"
            ),
            situation_framing=_require_text_field(
                data, "situation_framing", context="cdm_probes"
            ),
            expected_outcome=_require_text_field(
                data, "expected_outcome", context="cdm_probes"
            ),
        )

    def to_dict(self) -> dict[str, str]:
        return asdict(self)

    def get(self, key: str, default: Any = None) -> Any:
        """Mapping-style access for existing downstream code."""
        return self.to_dict().get(key, default)

    def __getitem__(self, key: str) -> str:
        return self.to_dict()[key]

    def __contains__(self, key: object) -> bool:
        return key in self.to_dict()


@dataclass
class ReconstructedIncident:
    """A critical incident reconstructed through CDM probe analysis.

    Contains the original decision context enriched with cognitive probes
    that reveal the subject's underlying perceptual framework.
    """

    id: str
    decision: str
    context: str
    cdm_probes: CDMProbes
    counterfactual: str
    divergence_explanation: str
    outcome: str
    source: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(
        cls,
        data: Mapping[str, Any],
        *,
        incident_id: str | None = None,
        source: str | None = None,
    ) -> "ReconstructedIncident":
        """Build a reconstructed incident from a raw mapping with validation."""
        if not isinstance(data, Mapping):
            raise TypeError(f"Incident data must be a mapping, got {type(data).__name__}")

        resolved_id = data.get("id") or incident_id
        if not isinstance(resolved_id, str) or not resolved_id.strip():
            raise ValueError("ReconstructedIncident requires a non-empty 'id'")

        resolved_source = data.get("source") or source
        if not isinstance(resolved_source, str) or not resolved_source.strip():
            raise ValueError("ReconstructedIncident requires a non-empty 'source'")

        cdm_probes = data.get("cdm_probes")
        if cdm_probes is None:
            raise ValueError("ReconstructedIncident is missing required field 'cdm_probes'")

        return cls(
            id=resolved_id,
            decision=_require_text_field(data, "decision", context="ReconstructedIncident"),
            context=_require_text_field(data, "context", context="ReconstructedIncident"),
            cdm_probes=CDMProbes.from_mapping(cdm_probes),
            counterfactual=_require_text_field(
                data, "counterfactual", context="ReconstructedIncident"
            ),
            divergence_explanation=_require_text_field(
                data, "divergence_explanation", context="ReconstructedIncident"
            ),
            outcome=_require_text_field(data, "outcome", context="ReconstructedIncident"),
            source=resolved_source,
        )


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

    data = client.prompt_json(system=CDM_SYSTEM, user=user_prompt, max_tokens=4096)

    cdm_probes = data.get("cdm_probes")
    if cdm_probes is None:
        raise ValueError("CDM response is missing required field 'cdm_probes'")

    return ReconstructedIncident.from_mapping(
        {
            "decision": data.get("decision", candidate.title),
            "context": data.get("context", candidate.description),
            "cdm_probes": cdm_probes,
            "counterfactual": data.get(
                "counterfactual",
                "A competent peer would have followed conventional approaches.",
            ),
            "divergence_explanation": data.get("divergence_explanation", ""),
            "outcome": data.get("outcome", data.get("actual_outcome", candidate.description)),
            "source": candidate.source_title,
        },
        incident_id=incident_id,
    )
