"""Perceptual Lens Derivation using grounded theory methodology.

Synthesizes bipolar constructs and reconstructed incidents into a single
perceptual lens statement — the core cognitive filter through which the
subject perceives situations. Uses grounded theory's constant comparative
method to derive the lens from evidence rather than imposing it.
"""

from dataclasses import dataclass, asdict
from typing import Any

from framework_forge.llm import LLMClient
from framework_forge.extraction.cdm_probes import ReconstructedIncident
from framework_forge.extraction.constructs import BipolarConstruct


@dataclass
class PerceptualLens:
    """The derived perceptual lens — the subject's core cognitive filter.

    Captures what the subject notices first, what they systematically ignore,
    and how this shapes their decision-making in novel situations.
    """

    statement: str
    derived_from: list[str]
    holdout_validation: list[str]
    what_they_notice_first: str
    what_they_ignore: str
    evidence: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


LENS_SYSTEM = """\
You are an expert in grounded theory methodology (Glaser & Strauss, 1967) and
cognitive task analysis. Your task is to derive a perceptual lens from a set of
bipolar constructs and reconstructed critical incidents.

A PERCEPTUAL LENS is the core cognitive filter through which the subject
perceives situations. It is NOT a personality trait or a value statement — it is
the specific way the subject's attention is structured, determining:

1. WHAT THEY NOTICE FIRST — The perceptual cues that automatically attract their
   attention before deliberate analysis begins. This is the filter that shapes
   which information reaches conscious processing.

2. WHAT THEY SYSTEMATICALLY IGNORE — The information and considerations that are
   consistently absent from their decision-making, even when others would consider
   them relevant. This reveals the blind spots inherent in the lens.

METHODOLOGY — Grounded Theory Constant Comparative Method:
- Compare each construct with every other construct, looking for a unifying
  perceptual pattern that explains why all these constructs co-occur.
- The lens should predict the constructs, not merely summarize them.
- Test the lens against holdout incidents (incidents not used to derive constructs)
  to check if it retrodicts those decisions correctly.

The lens statement should be one sentence in the form:
"[Person] perceives [domain] as [lens-specific framing], not as [conventional framing]."

Return ONLY valid JSON with no additional commentary.\
"""

LENS_PROMPT = """\
Derive a perceptual lens for {person} from the following bipolar constructs
and reconstructed incidents using grounded theory constant comparative method.

Bipolar Constructs:
{constructs_json}

Incidents used for derivation:
{incidents_json}

Holdout incident IDs (for validation — do NOT use these for derivation):
{holdout_ids}

Return a JSON object with this structure:
{{
  "statement": "One-sentence perceptual lens statement",
  "derived_from": ["incident-ids used for derivation"],
  "holdout_validation": ["incident-ids that the lens successfully retrodicts"],
  "what_they_notice_first": "The perceptual cues that automatically attract attention",
  "what_they_ignore": "Information systematically absent from their decisions",
  "evidence": "Brief summary of the evidence grounding this lens"
}}\
"""


def derive_lens(
    constructs: list[BipolarConstruct],
    incidents: list[ReconstructedIncident],
    person: str,
    holdout_incident_ids: list[str],
    client: LLMClient | Any | None = None,
) -> PerceptualLens:
    """Derive a perceptual lens from constructs and incidents.

    Uses grounded theory constant comparative method to synthesize bipolar
    constructs into a single perceptual lens statement, then validates against
    holdout incidents.

    Args:
        constructs: List of BipolarConstruct objects.
        incidents: List of ReconstructedIncident objects.
        person: Name of the person being studied.
        holdout_incident_ids: Incident IDs reserved for validation.
        client: An LLMClient instance (or mock). Created if not provided.

    Returns:
        A PerceptualLens object.
    """
    if client is None:
        client = LLMClient()

    constructs_json = "\n".join(
        f"- {c.construct}: (+) {c.positive_pole} / (-) {c.negative_pole}"
        for c in constructs
    )

    incidents_json = "\n".join(
        f"- [{inc.id}] {inc.decision} | Framing: "
        f"{inc.cdm_probes.get('situation_framing', 'N/A')}"
        for inc in incidents
    )

    holdout_ids = ", ".join(holdout_incident_ids) if holdout_incident_ids else "none"

    user_prompt = LENS_PROMPT.format(
        person=person,
        constructs_json=constructs_json,
        incidents_json=incidents_json,
        holdout_ids=holdout_ids,
    )

    data = client.prompt_json(system=LENS_SYSTEM, user=user_prompt)

    return PerceptualLens(
        statement=data["statement"],
        derived_from=data.get("derived_from", []),
        holdout_validation=data.get("holdout_validation", []),
        what_they_notice_first=data.get("what_they_notice_first", ""),
        what_they_ignore=data.get("what_they_ignore", ""),
        evidence=data.get("evidence", ""),
    )
