"""Bipolar Construct Mapping using Repertory Grid triad analysis.

Derives bipolar constructs from reconstructed incidents using Kelly's (1955)
Personal Construct Theory and the Repertory Grid technique. Each construct
captures a dimension along which the subject discriminates — revealing the
perceptual categories that organize their decision-making.
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
and grounded in specific incidents.

Return ONLY valid JSON with no additional commentary.\
"""

CONSTRUCT_PROMPT = """\
Analyze the following reconstructed critical incidents about {person} and
derive bipolar constructs using Repertory Grid triad analysis.

Incidents:
{incidents_json}

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

    incidents_json = "\n".join(
        f"- [{inc.id}] {inc.decision} | Context: {inc.context} | "
        f"Framing: {inc.cdm_probes.get('situation_framing', 'N/A')} | "
        f"Divergence: {inc.divergence_explanation}"
        for inc in incidents
    )

    user_prompt = CONSTRUCT_PROMPT.format(
        person=person,
        incidents_json=incidents_json,
    )

    data = client.prompt_json(system=CONSTRUCT_SYSTEM, user=user_prompt)

    constructs = []
    for item in data.get("constructs", []):
        constructs.append(
            BipolarConstruct(
                construct=item["construct"],
                positive_pole=item["positive_pole"],
                negative_pole=item["negative_pole"],
                derived_from_incidents=item.get("derived_from_incidents", []),
                behavioral_implication=item.get("behavioral_implication", ""),
            )
        )
    return constructs
