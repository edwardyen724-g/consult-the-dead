from unittest.mock import MagicMock

import pytest

from framework_forge.extraction.cdm_probes import (
    CDM_PROBE_FIELDS,
    CDMProbes,
    CDM_SYSTEM,
    ReconstructedIncident,
    reconstruct_incident,
)
from framework_forge.extraction.incidents import CandidateIncident


def make_candidate() -> CandidateIncident:
    return CandidateIncident(
        title="The decisive wager",
        description="A risky choice under pressure.",
        source_text_excerpt="He chose the harder route.",
        source_title="Primary source",
        reasoning_visible=True,
        evidence_type="critical_incident",
    )


def make_probe_payload() -> dict[str, str]:
    return {
        "cues_noticed": "He noticed the time pressure and the opportunity cost.",
        "active_goals": "He wanted to preserve long-term leverage.",
        "rejected_alternatives": "He rejected the safer option because it would erode control.",
        "situation_framing": "He framed the choice as a structural commitment test.",
        "expected_outcome": "He expected the decision to reset expectations in his favor.",
    }


def test_reconstruct_incident_returns_typed_probes_and_serializes_cleanly() -> None:
    candidate = make_candidate()
    client = MagicMock()
    client.prompt_json.return_value = {
        "decision": "He chose the harder route.",
        "context": "The situation forced a public commitment under uncertainty.",
        "cdm_probes": make_probe_payload(),
        "counterfactual": "A peer would have taken the safer option.",
        "divergence_explanation": "He optimized for leverage instead of comfort.",
        "outcome": "The decision clarified the next move.",
    }

    incident = reconstruct_incident(
        candidate=candidate,
        person="Ada Lovelace",
        incident_id="incident-001",
        client=client,
    )

    assert isinstance(incident, ReconstructedIncident)
    assert isinstance(incident.cdm_probes, CDMProbes)
    assert incident.cdm_probes.get("situation_framing") == make_probe_payload()[
        "situation_framing"
    ]
    assert incident.cdm_probes["active_goals"] == make_probe_payload()["active_goals"]
    assert incident.to_dict()["cdm_probes"]["cues_noticed"] == make_probe_payload()[
        "cues_noticed"
    ]
    assert client.prompt_json.call_args.kwargs["system"] == CDM_SYSTEM
    assert client.prompt_json.call_args.kwargs["max_tokens"] == 4096
    assert "Ada Lovelace" in client.prompt_json.call_args.kwargs["user"]
    assert tuple(CDM_PROBE_FIELDS) == (
        "cues_noticed",
        "active_goals",
        "rejected_alternatives",
        "situation_framing",
        "expected_outcome",
    )


def test_reconstruct_incident_rejects_missing_cdm_probes() -> None:
    candidate = make_candidate()
    client = MagicMock()
    client.prompt_json.return_value = {
        "decision": "He chose the harder route.",
        "context": "The situation forced a public commitment under uncertainty.",
        "counterfactual": "A peer would have taken the safer option.",
        "divergence_explanation": "He optimized for leverage instead of comfort.",
        "outcome": "The decision clarified the next move.",
    }

    with pytest.raises(ValueError, match="cdm_probes"):
        reconstruct_incident(
            candidate=candidate,
            person="Ada Lovelace",
            incident_id="incident-001",
            client=client,
        )


def test_cdm_probes_from_mapping_requires_all_probe_fields() -> None:
    with pytest.raises(ValueError, match="rejected_alternatives"):
        CDMProbes.from_mapping(
            {
                "cues_noticed": "Observed a deadline.",
                "active_goals": "Protect momentum.",
                "situation_framing": "Treat it as a credibility test.",
                "expected_outcome": "Expected to preserve optionality.",
            }
        )


def test_cdm_probes_from_mapping_rejects_non_mapping_and_bad_values() -> None:
    with pytest.raises(TypeError, match="CDM probes must be a mapping"):
        CDMProbes.from_mapping("not-a-mapping")  # type: ignore[arg-type]

    with pytest.raises(TypeError, match="must be a string"):
        CDMProbes.from_mapping(
            {
                "cues_noticed": 42,
                "active_goals": "Protect momentum.",
                "rejected_alternatives": "Reject the easy path.",
                "situation_framing": "Treat it as a credibility test.",
                "expected_outcome": "Expected to preserve optionality.",
            }
        )

    with pytest.raises(ValueError, match="cannot be empty"):
        CDMProbes.from_mapping(
            {
                "cues_noticed": "Observed a deadline.",
                "active_goals": "Protect momentum.",
                "rejected_alternatives": " ",
                "situation_framing": "Treat it as a credibility test.",
                "expected_outcome": "Expected to preserve optionality.",
            }
        )


def test_reconstructed_incident_from_mapping_validates_raw_payload() -> None:
    payload = {
        "id": "incident-002",
        "decision": "He chose the harder route.",
        "context": "The situation forced a public commitment under uncertainty.",
        "cdm_probes": make_probe_payload(),
        "counterfactual": "A peer would have taken the safer option.",
        "divergence_explanation": "He optimized for leverage instead of comfort.",
        "outcome": "The decision clarified the next move.",
        "source": "Primary source",
    }

    incident = ReconstructedIncident.from_mapping(payload)
    assert incident.id == "incident-002"
    assert incident.source == "Primary source"

    with pytest.raises(TypeError, match="Incident data must be a mapping"):
        ReconstructedIncident.from_mapping("not-a-mapping")  # type: ignore[arg-type]

    with pytest.raises(ValueError, match="non-empty 'id'"):
        ReconstructedIncident.from_mapping(
            {
                "decision": "He chose the harder route.",
                "context": "The situation forced a public commitment under uncertainty.",
                "cdm_probes": make_probe_payload(),
                "counterfactual": "A peer would have taken the safer option.",
                "divergence_explanation": "He optimized for leverage instead of comfort.",
                "outcome": "The decision clarified the next move.",
                "source": "Primary source",
            }
        )

    with pytest.raises(ValueError, match="non-empty 'source'"):
        ReconstructedIncident.from_mapping(
            {
                "id": "incident-003",
                "decision": "He chose the harder route.",
                "context": "The situation forced a public commitment under uncertainty.",
                "cdm_probes": make_probe_payload(),
                "counterfactual": "A peer would have taken the safer option.",
                "divergence_explanation": "He optimized for leverage instead of comfort.",
                "outcome": "The decision clarified the next move.",
            }
        )

    with pytest.raises(ValueError, match="cdm_probes"):
        ReconstructedIncident.from_mapping(
            {
                "id": "incident-004",
                "decision": "He chose the harder route.",
                "context": "The situation forced a public commitment under uncertainty.",
                "counterfactual": "A peer would have taken the safer option.",
                "divergence_explanation": "He optimized for leverage instead of comfort.",
                "outcome": "The decision clarified the next move.",
                "source": "Primary source",
            }
        )


def test_reconstruct_incident_uses_default_client_when_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    candidate = make_candidate()
    client = MagicMock()
    client.prompt_json.return_value = {
        "decision": "He chose the harder route.",
        "context": "The situation forced a public commitment under uncertainty.",
        "cdm_probes": make_probe_payload(),
        "counterfactual": "A peer would have taken the safer option.",
        "divergence_explanation": "He optimized for leverage instead of comfort.",
        "outcome": "The decision clarified the next move.",
    }
    monkeypatch.setattr("framework_forge.extraction.cdm_probes.LLMClient", lambda: client)

    incident = reconstruct_incident(
        candidate=candidate,
        person="Ada Lovelace",
        incident_id="incident-004",
        client=None,
    )

    assert incident.id == "incident-004"
    assert client.prompt_json.called
