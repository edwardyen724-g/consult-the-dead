"""Perceptual lens derivation using grounded theory methodology.

Synthesizes bipolar constructs and reconstructed incidents into a single
perceptual lens statement — the core cognitive filter through which the
subject perceives situations. Holdout incidents are excluded from derivation
so the returned validation set is actually held out.
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


def _incident_payload(incident: ReconstructedIncident | dict[str, Any] | Any) -> dict[str, Any]:
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
        "cdm_probes": getattr(incident, "cdm_probes", {}),
        "divergence_explanation": getattr(incident, "divergence_explanation", ""),
    }


def _incident_sort_key(incident: ReconstructedIncident | dict[str, Any] | Any) -> tuple[str, str, str]:
    payload = _incident_payload(incident)
    return (
        str(payload.get("source", "")),
        str(payload.get("decision", "")),
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


def _normalize_ids(ids: list[str], order_map: dict[str, int]) -> list[str]:
    normalized = _dedupe_preserve_order([str(incident_id) for incident_id in ids])
    return sorted(normalized, key=lambda incident_id: (order_map.get(incident_id, 10_000), incident_id))


def split_holdout_incidents(
    incidents: list[ReconstructedIncident | dict[str, Any] | Any],
    holdout_incident_ids: list[str],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[str]]:
    """Split a full incident set into derivation and holdout groups."""

    ordered_incidents = sorted(incidents, key=_incident_sort_key)
    payloads = [_incident_payload(incident) for incident in ordered_incidents]
    order_map = {
        str(payload.get("id", "")): index
        for index, payload in enumerate(payloads)
    }
    canonical_holdouts = _normalize_ids(holdout_incident_ids, order_map)
    holdout_set = set(canonical_holdouts)

    derivation_incidents = [payload for payload in payloads if str(payload.get("id", "")) not in holdout_set]
    holdout_incidents = [payload for payload in payloads if str(payload.get("id", "")) in holdout_set]
    return derivation_incidents, holdout_incidents, canonical_holdouts


def _format_incident(payload: dict[str, Any]) -> str:
    return (
        f"- [{payload.get('id', '')}] {payload.get('decision', '')} | "
        f"Source: {payload.get('source', '')} | "
        f"Framing: {payload.get('cdm_probes', {}).get('situation_framing', 'N/A')} | "
        f"Divergence: {payload.get('divergence_explanation', '')}"
    )


def _format_construct(payload: BipolarConstruct | dict[str, Any]) -> str:
    if isinstance(payload, BipolarConstruct):
        construct = payload.construct
        positive = payload.positive_pole
        negative = payload.negative_pole
    else:
        construct = payload.get("construct", "")
        positive = payload.get("positive_pole", "")
        negative = payload.get("negative_pole", "")
    return f"- {construct}: (+) {positive} / (-) {negative}"


def _normalize_lens_payload(data: dict[str, Any], fallback_holdouts: list[str]) -> PerceptualLens:
    derived_from = _dedupe_preserve_order([str(incident_id) for incident_id in data.get("derived_from", [])])
    holdout_validation_source = data.get("holdout_validation") or fallback_holdouts
    holdout_validation = _dedupe_preserve_order([str(incident_id) for incident_id in holdout_validation_source])
    return PerceptualLens(
        statement=data["statement"],
        derived_from=derived_from,
        holdout_validation=holdout_validation,
        what_they_notice_first=data.get("what_they_notice_first", ""),
        what_they_ignore=data.get("what_they_ignore", ""),
        evidence=data.get("evidence", ""),
    )


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

Holdout incident summaries (validation only):
{holdout_incidents_json}

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

    ordered_constructs = sorted(constructs, key=lambda construct: (construct.construct, construct.positive_pole, construct.negative_pole))
    derivation_incidents, holdout_incidents, canonical_holdouts = split_holdout_incidents(
        incidents=incidents,
        holdout_incident_ids=holdout_incident_ids,
    )

    constructs_json = "\n".join(_format_construct(construct) for construct in ordered_constructs)
    incidents_json = "\n".join(_format_incident(payload) for payload in derivation_incidents)
    holdout_incidents_json = "\n".join(_format_incident(payload) for payload in holdout_incidents)
    holdout_ids = ", ".join(canonical_holdouts) if canonical_holdouts else "none"

    user_prompt = LENS_PROMPT.format(
        person=person,
        constructs_json=constructs_json,
        incidents_json=incidents_json,
        holdout_ids=holdout_ids,
        holdout_incidents_json=holdout_incidents_json or "(no holdout incidents)",
    )

    data = client.prompt_json(system=LENS_SYSTEM, user=user_prompt)

    return _normalize_lens_payload(data, canonical_holdouts)
