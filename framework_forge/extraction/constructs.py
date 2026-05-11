"""Bipolar construct mapping using Repertory Grid triad analysis.

Derives bipolar constructs from reconstructed incidents using Kelly's (1955)
Personal Construct Theory and the Repertory Grid technique. Each construct
captures a dimension along which the subject discriminates, and the incident
grouping stays stable so traceability is reproducible across runs.
"""

from dataclasses import dataclass, asdict
from typing import Any

from framework_forge.llm import LLMClient
from framework_forge.extraction.cdm_probes import ReconstructedIncident


@dataclass
class BipolarConstruct:
    """A bipolar construct derived from Repertory Grid triad analysis.

    Represents a dimension of discrimination the subject uses to evaluate
    situations, with a positive pole (preferred) and negative pole (avoided).
    """

    construct: str
    positive_pole: str
    negative_pole: str
    derived_from_incidents: list[str]
    behavioral_implication: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _incident_payload(incident: ReconstructedIncident | dict[str, Any] | Any) -> dict[str, Any]:
    """Coerce an incident-like object into a serializable mapping."""

    if isinstance(incident, dict):
        return incident

    if hasattr(incident, "to_dict"):
        payload = incident.to_dict()
        if isinstance(payload, dict):
            return payload

    return {
        "id": getattr(incident, "id", ""),
        "decision": getattr(incident, "decision", ""),
        "context": getattr(incident, "context", ""),
        "source": getattr(incident, "source", ""),
        "source_title": getattr(incident, "source_title", ""),
        "cdm_probes": getattr(incident, "cdm_probes", {}),
        "divergence_explanation": getattr(incident, "divergence_explanation", ""),
    }


def _incident_sort_key(incident: ReconstructedIncident | dict[str, Any] | Any) -> tuple[str, str, str, str]:
    payload = _incident_payload(incident)
    return (
        str(payload.get("source", payload.get("source_title", ""))),
        str(payload.get("decision", "")),
        str(payload.get("context", "")),
        str(payload.get("id", "")),
    )


def _dedupe_preserve_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def group_incident_triads(
    incidents: list[ReconstructedIncident | dict[str, Any] | Any],
) -> list[list[dict[str, Any]]]:
    """Group incidents into stable prompt triads.

    Incidents are sorted by source, decision, context, and id so the triads are
    reproducible. The final bucket may contain two or more incidents if an exact
    triad boundary would otherwise produce a singleton.
    """

    ordered_incidents = sorted(incidents, key=_incident_sort_key)
    if not ordered_incidents:
        return []

    triads: list[list[dict[str, Any]]] = []
    for start in range(0, len(ordered_incidents), 3):
        group = [_incident_payload(incident) for incident in ordered_incidents[start : start + 3]]
        if len(group) == 1 and triads:
            triads[-1].extend(group)
        else:
            triads.append(group)
    return triads


def _format_incident(payload: dict[str, Any]) -> str:
    return (
        f"- [{payload.get('id', '')}] {payload.get('decision', '')} | "
        f"Source: {payload.get('source', payload.get('source_title', ''))} | "
        f"Context: {payload.get('context', '')} | "
        f"Framing: {payload.get('cdm_probes', {}).get('situation_framing', 'N/A')} | "
        f"Divergence: {payload.get('divergence_explanation', '')}"
    )


def _format_triads_for_prompt(
    incidents: list[ReconstructedIncident | dict[str, Any] | Any],
) -> str:
    triads = group_incident_triads(incidents)
    blocks: list[str] = []
    for index, triad in enumerate(triads, start=1):
        blocks.append(
            "\n".join(
                [f"Triad {index} (stable order):"]
                + [_format_incident(payload) for payload in triad]
            )
        )
    return "\n\n".join(blocks) if blocks else "(no incidents)"


def _normalize_construct_payload(
    item: dict[str, Any],
    incident_order: dict[str, int],
) -> BipolarConstruct:
    derived = _dedupe_preserve_order([str(incident_id) for incident_id in item.get("derived_from_incidents", [])])
    derived.sort(key=lambda incident_id: (incident_order.get(incident_id, 10_000), incident_id))
    return BipolarConstruct(
        construct=item["construct"],
        positive_pole=item["positive_pole"],
        negative_pole=item["negative_pole"],
        derived_from_incidents=derived,
        behavioral_implication=item.get("behavioral_implication", ""),
    )


CONSTRUCT_SYSTEM = """\
You are an expert in Personal Construct Theory (Kelly, 1955) and the Repertory
Grid technique. Your task is to derive bipolar constructs from a set of
reconstructed critical incidents about a specific person.

METHODOLOGY — Repertory Grid Triad Analysis:
1. Take incidents in groups of three (triads).
2. For each triad, ask: "In what important way are two of these incidents
   similar to each other and different from the third?" The answer reveals a
   bipolar construct — a dimension of discrimination the subject uses.
3. Each construct must have:
   - A POSITIVE POLE: the end the subject moves toward
   - A NEGATIVE POLE: the end the subject moves away from
   - These are NOT simply opposites; they capture the subject's personal
     meaning system. "Simple vs. complex" is NOT a good construct.
     "Invites the person in vs. requires the person to adapt" IS a good one.
4. Constructs should be BEHAVIORAL — they predict what the subject would do
   in a new situation, not just describe past behavior.

Target: Produce constructs that are non-redundant, behaviorally predictive,
and grounded in specific incidents. Maintain stable triad ordering so the same
incident set yields the same traceability map across runs.

Return ONLY valid JSON with no additional commentary.\
"""

CONSTRUCT_PROMPT = """\
Analyze the following reconstructed critical incidents about {person} and
derive bipolar constructs using Repertory Grid triad analysis.

Incidents:
{incident_triads}

For each construct, identify:
- The bipolar dimension of discrimination
- Which pole {person} consistently moves toward (positive) and away from (negative)
- Which specific incidents ground this construct
- What behavioral prediction this construct makes for new situations

Return a JSON object with this structure:
{{
  "constructs": [
    {{
      "construct": "positive pole vs. negative pole (as a dimension)",
      "positive_pole": "Description of the preferred end",
      "negative_pole": "Description of the avoided end",
      "derived_from_incidents": ["incident-id-1", "incident-id-2"],
      "behavioral_implication": "In situation X, this person would do Y because of this construct"
    }}
  ]
}}\
"""


def map_constructs(
    incidents: list[ReconstructedIncident],
    person: str,
    client: LLMClient | Any | None = None,
) -> list[BipolarConstruct]:
    """Map bipolar constructs from reconstructed incidents using Repertory Grid analysis.

    Applies Kelly's triad analysis to extract the dimensions of discrimination
    the subject uses to evaluate situations and make decisions.

    Args:
        incidents: List of ReconstructedIncident objects to analyze.
        person: Name of the person being studied.
        client: An LLMClient instance (or mock). Created if not provided.

    Returns:
        A list of BipolarConstruct objects.
    """
    if client is None:
        client = LLMClient()

    ordered_incidents = sorted(incidents, key=_incident_sort_key)
    incident_order = {
        str(_incident_payload(incident).get("id", "")): index
        for index, incident in enumerate(ordered_incidents)
    }

    user_prompt = CONSTRUCT_PROMPT.format(
        person=person,
        incident_triads=_format_triads_for_prompt(ordered_incidents),
    )

    data = client.prompt_json(system=CONSTRUCT_SYSTEM, user=user_prompt)

    constructs = []
    for item in data.get("constructs", []):
        constructs.append(_normalize_construct_payload(item, incident_order))
    return constructs
