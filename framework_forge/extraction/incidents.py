"""Incident identification using Critical Decision Method (CDM) analysis.

Identifies candidate critical incidents from source texts — moments where the
subject made a decision that reveals their underlying perceptual framework.
Based on Klein, Calderwood & Macgregor (1989) Critical Decision Method.
"""

from dataclasses import dataclass, asdict
from typing import Any

from framework_forge.llm import LLMClient


@dataclass
class CandidateIncident:
    """A candidate critical incident extracted from source material.

    Represents a moment where the subject made a decision, took action, or
    expressed a viewpoint that potentially reveals their cognitive framework.
    """

    title: str
    description: str
    source_text_excerpt: str
    source_title: str
    reasoning_visible: bool
    evidence_type: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


INCIDENT_SYSTEM = """\
You are an expert cognitive task analyst applying the Critical Decision Method (CDM)
developed by Klein, Calderwood & Macgregor (1989). Your task is to identify
critical incidents from source material about a specific person.

A critical incident is a moment where the subject:
- Made a non-obvious decision under uncertainty or pressure
- Chose a path that diverges from what a competent peer would have chosen
- Revealed underlying values, perceptual filters, or cognitive patterns
- Faced a conflict between competing goals or principles

For each incident, assess:
- Whether the subject's reasoning is visible in the source (stated rationale,
  explanation, or inference from behavior)
- The evidence type: critical_incident, value_conflict, failure, private_writing,
  own_published_work, firsthand_biography, scholarly_analysis, secondary_reporting

Return ONLY valid JSON with no additional commentary.\
"""

INCIDENT_PROMPT = """\
Analyze the following source text about {person} and identify all critical
decision incidents — moments where {person} made a choice, took a stand, or
acted in a way that reveals their underlying cognitive framework.

Source title: {source_title}

Source text:
---
{source_text}
---

Return a JSON object with this structure:
{{
  "incidents": [
    {{
      "title": "Short descriptive title of the incident",
      "description": "2-3 sentence description of what happened and why it matters",
      "source_text_excerpt": "Brief relevant quote or paraphrase from the source",
      "reasoning_visible": true/false,
      "evidence_type": "critical_incident|value_conflict|failure|private_writing|own_published_work|firsthand_biography|scholarly_analysis|secondary_reporting"
    }}
  ]
}}\
"""


def identify_incidents(
    source_text: str,
    source_title: str,
    person: str,
    client: LLMClient | Any | None = None,
) -> list[CandidateIncident]:
    """Identify candidate critical incidents from a source text.

    Uses CDM-based prompting to extract moments where the subject's decision-making
    reveals their underlying cognitive framework.

    Args:
        source_text: The full text of the source to analyze.
        source_title: Title of the source document.
        person: Name of the person being studied.
        client: An LLMClient instance (or mock). Created if not provided.

    Returns:
        A list of CandidateIncident objects.
    """
    if client is None:
        client = LLMClient()

    user_prompt = INCIDENT_PROMPT.format(
        person=person,
        source_title=source_title,
        source_text=source_text,
    )

    data = client.prompt_json(system=INCIDENT_SYSTEM, user=user_prompt)

    incidents = []
    for item in data.get("incidents", []):
        incidents.append(
            CandidateIncident(
                title=item["title"],
                description=item["description"],
                source_text_excerpt=item["source_text_excerpt"],
                source_title=source_title,
                reasoning_visible=item.get("reasoning_visible", False),
                evidence_type=item.get("evidence_type", "secondary_reporting"),
            )
        )
    return incidents
