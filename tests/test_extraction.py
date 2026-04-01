"""Tests for the extraction pipeline: incidents, CDM probes, constructs, lens, divergence."""

import json
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Task 4 – CandidateIncident & identify_incidents
# ---------------------------------------------------------------------------

class TestCandidateIncident:
    """Tests for the CandidateIncident dataclass."""

    def test_create(self):
        from framework_forge.extraction.incidents import CandidateIncident

        ci = CandidateIncident(
            title="Removed the physical keyboard",
            description="Jobs decided to remove the physical keyboard from the iPhone",
            source_text_excerpt="He wanted a full touchscreen device...",
            source_title="Steve Jobs by Isaacson",
            reasoning_visible=True,
            evidence_type="critical_incident",
        )
        assert ci.title == "Removed the physical keyboard"
        assert ci.reasoning_visible is True
        assert ci.evidence_type == "critical_incident"

    def test_to_dict(self):
        from framework_forge.extraction.incidents import CandidateIncident

        ci = CandidateIncident(
            title="Removed the physical keyboard",
            description="Jobs decided to remove the physical keyboard",
            source_text_excerpt="excerpt",
            source_title="Steve Jobs",
            reasoning_visible=True,
            evidence_type="critical_incident",
        )
        d = ci.to_dict()
        assert isinstance(d, dict)
        assert d["title"] == "Removed the physical keyboard"
        assert d["reasoning_visible"] is True
        assert "evidence_type" in d


class TestIdentifyIncidents:
    """Tests for identify_incidents with a mocked LLM client."""

    def test_identify_incidents_returns_candidates(self):
        from framework_forge.extraction.incidents import identify_incidents

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "incidents": [
                {
                    "title": "Removed the physical keyboard",
                    "description": "Decided to ship iPhone without a physical keyboard",
                    "source_text_excerpt": "Jobs insisted on a full touchscreen...",
                    "reasoning_visible": True,
                    "evidence_type": "critical_incident",
                },
                {
                    "title": "Reduced iPod buttons to one",
                    "description": "Simplified iPod interface to a single click wheel",
                    "source_text_excerpt": "He kept sending it back...",
                    "reasoning_visible": True,
                    "evidence_type": "value_conflict",
                },
            ]
        }

        results = identify_incidents(
            source_text="Some long source text about Steve Jobs...",
            source_title="Steve Jobs by Isaacson",
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(results) == 2
        assert results[0].title == "Removed the physical keyboard"
        assert results[1].evidence_type == "value_conflict"
        mock_client.prompt_json.assert_called_once()


# ---------------------------------------------------------------------------
# Task 5 – ReconstructedIncident & reconstruct_incident
# ---------------------------------------------------------------------------

class TestCDMProbes:
    """Tests for CDM probe reconstruction."""

    def test_reconstructed_incident_to_dict(self, sample_incident):
        from framework_forge.extraction.cdm_probes import ReconstructedIncident

        ri = ReconstructedIncident(**sample_incident)
        d = ri.to_dict()
        assert isinstance(d, dict)
        assert d["id"] == "incident-test-001"
        assert "cues_noticed" in d["cdm_probes"]

    def test_reconstruct_incident_with_mock(self):
        from framework_forge.extraction.incidents import CandidateIncident
        from framework_forge.extraction.cdm_probes import reconstruct_incident

        candidate = CandidateIncident(
            title="Removed the physical keyboard",
            description="Jobs decided to remove the physical keyboard",
            source_text_excerpt="He wanted a full touchscreen device...",
            source_title="Steve Jobs by Isaacson",
            reasoning_visible=True,
            evidence_type="critical_incident",
        )

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "decision": "Removed the physical keyboard from iPhone",
            "context": "Smartphone market dominated by BlackBerry",
            "cdm_probes": {
                "cues_noticed": "Fixed physical interface",
                "active_goals": "Direct manipulation of content",
                "rejected_alternatives": "Keyboard hybrid",
                "situation_framing": "Not a phone problem",
                "expected_outcome": "Users would adapt",
            },
            "counterfactual": "A competitor would have built a better BlackBerry",
            "divergence_explanation": "Jobs reframed the problem entirely",
            "outcome": "iPhone redefined smartphones",
        }

        result = reconstruct_incident(
            candidate=candidate,
            person="Steve Jobs",
            incident_id="incident-001",
            client=mock_client,
        )

        assert result.id == "incident-001"
        assert result.decision == "Removed the physical keyboard from iPhone"
        assert "cues_noticed" in result.cdm_probes
        mock_client.prompt_json.assert_called_once()


# ---------------------------------------------------------------------------
# Task 6 – BipolarConstruct & map_constructs
# ---------------------------------------------------------------------------

class TestConstructMapping:
    """Tests for bipolar construct mapping."""

    def test_bipolar_construct_to_dict(self, sample_construct):
        from framework_forge.extraction.constructs import BipolarConstruct

        bc = BipolarConstruct(**sample_construct)
        d = bc.to_dict()
        assert isinstance(d, dict)
        assert d["construct"] == sample_construct["construct"]
        assert "positive_pole" in d
        assert "negative_pole" in d

    def test_map_constructs_with_mock(self, sample_incident):
        from framework_forge.extraction.cdm_probes import ReconstructedIncident
        from framework_forge.extraction.constructs import map_constructs

        incidents = [ReconstructedIncident(**sample_incident)]

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "constructs": [
                {
                    "construct": "invites the person in vs. requires the person to adapt",
                    "positive_pole": "Product adapts to human",
                    "negative_pole": "Human adapts to product",
                    "derived_from_incidents": ["incident-test-001"],
                    "behavioral_implication": "Move toward positive pole",
                },
            ]
        }

        results = map_constructs(
            incidents=incidents,
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(results) == 1
        assert results[0].construct == "invites the person in vs. requires the person to adapt"
        mock_client.prompt_json.assert_called_once()


# ---------------------------------------------------------------------------
# Task 7 – PerceptualLens & derive_lens
# ---------------------------------------------------------------------------

class TestLensDerivation:
    """Tests for perceptual lens derivation."""

    def test_perceptual_lens_to_dict(self, sample_lens):
        from framework_forge.extraction.lens import PerceptualLens

        pl = PerceptualLens(**sample_lens)
        d = pl.to_dict()
        assert isinstance(d, dict)
        assert d["statement"] == sample_lens["statement"]
        assert "what_they_notice_first" in d
        assert "what_they_ignore" in d

    def test_derive_lens_with_mock(self, sample_incident, sample_construct):
        from framework_forge.extraction.cdm_probes import ReconstructedIncident
        from framework_forge.extraction.constructs import BipolarConstruct
        from framework_forge.extraction.lens import derive_lens

        incidents = [ReconstructedIncident(**sample_incident)]
        constructs = [BipolarConstruct(**sample_construct)]

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "statement": "Jobs sees products as experiences-waiting-to-exist",
            "derived_from": ["incident-test-001"],
            "holdout_validation": [],
            "what_they_notice_first": "Emotional relationship between user and experience",
            "what_they_ignore": "Feature parity, backward compatibility",
            "evidence": "iPhone keyboard removal, iPod scroll wheel",
        }

        result = derive_lens(
            constructs=constructs,
            incidents=incidents,
            person="Steve Jobs",
            holdout_incident_ids=["incident-test-002"],
            client=mock_client,
        )

        assert result.statement == "Jobs sees products as experiences-waiting-to-exist"
        assert isinstance(result.derived_from, list)
        mock_client.prompt_json.assert_called_once()


# ---------------------------------------------------------------------------
# Task 8 – DivergencePrediction & generate_predictions
# ---------------------------------------------------------------------------

class TestDivergencePredictions:
    """Tests for behavioral divergence predictions."""

    def test_divergence_prediction_to_dict(self):
        from framework_forge.extraction.divergence import DivergencePrediction

        dp = DivergencePrediction(
            situation_type="Product feature debate",
            ordinary_response="Add the feature because competitors have it",
            framework_response="Remove the feature because it clutters the experience",
            because="Jobs' lens prioritizes experience purity over feature parity",
            confidence=0.85,
        )
        d = dp.to_dict()
        assert isinstance(d, dict)
        assert d["confidence"] == 0.85
        assert "situation_type" in d

    def test_generate_predictions_with_mock(self, sample_lens, sample_construct):
        from framework_forge.extraction.lens import PerceptualLens
        from framework_forge.extraction.constructs import BipolarConstruct
        from framework_forge.extraction.divergence import generate_predictions

        lens = PerceptualLens(**sample_lens)
        constructs = [BipolarConstruct(**sample_construct)]

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "predictions": [
                {
                    "situation_type": "Product feature debate",
                    "ordinary_response": "Add the feature",
                    "framework_response": "Remove the feature",
                    "because": "Experience purity over feature parity",
                    "confidence": 0.85,
                },
                {
                    "situation_type": "Market entry timing",
                    "ordinary_response": "Wait for market validation",
                    "framework_response": "Create the market",
                    "because": "Lens sees latent demand invisible to others",
                    "confidence": 0.80,
                },
            ]
        }

        results = generate_predictions(
            lens=lens,
            constructs=constructs,
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(results) == 2
        assert results[0].confidence == 0.85
        assert results[1].situation_type == "Market entry timing"
        mock_client.prompt_json.assert_called_once()
