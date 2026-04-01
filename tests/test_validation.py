"""Tests for validation modules (Tier 1, Tier 2, Tier 3 Prep, Floor Check)."""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from framework_forge.config import (
    FLOOR_CHECK_MIN_ALIGNMENT,
    TIER1_MIN_DIVERGENT_SCENARIOS,
    TIER2_MIN_TRACEABILITY,
)


# ---------------------------------------------------------------------------
# Task 10: Tier 1 — Baseline Differentiation
# ---------------------------------------------------------------------------


class TestTier1:
    """Tests for Tier 1 validation — baseline differentiation."""

    def test_generate_scenario(self):
        """generate_scenario should return a dict with scenario details via LLM."""
        from framework_forge.validation.tier1 import generate_scenario

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "scenario": "A startup must decide whether to launch with a minimal product or wait for full features.",
            "domain_context": "Product strategy",
            "decision_required": "Launch timing",
        }

        result = generate_scenario(
            person="Steve Jobs",
            domain="product design",
            existing_scenarios=[],
            client=mock_client,
        )

        assert isinstance(result, dict)
        assert "scenario" in result
        mock_client.prompt_json.assert_called_once()

    def test_score_divergence_detects_difference(self):
        """score_divergence should return scores via LLM."""
        from framework_forge.validation.tier1 import score_divergence

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "divergence_score": 8,
            "specificity_score": 7,
            "traceability_score": 9,
            "divergent": True,
            "reasoning": "The framework response shows clear perceptual lens influence.",
        }

        result = score_divergence(
            framework_response="Ship the core experience now.",
            baseline_response="Wait for full feature parity.",
            scenario={"scenario": "Launch timing decision"},
            client=mock_client,
        )

        assert result["divergent"] is True
        assert result["divergence_score"] == 8
        mock_client.prompt_json.assert_called_once()

    def test_tier1_result_passes(self):
        """Tier1Result.passed should be True when divergent_count >= threshold."""
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result

        results = []
        for i in range(5):
            results.append(
                ScenarioResult(
                    scenario=f"scenario-{i}",
                    framework_response=f"framework-{i}",
                    baseline_response=f"baseline-{i}",
                    divergence_score=8,
                    specificity_score=7,
                    traceability_score=9,
                    divergent=True,
                )
            )

        tier1 = Tier1Result(scenario_results=results)
        assert tier1.divergent_count == 5
        assert tier1.passed is True

    def test_tier1_result_fails(self):
        """Tier1Result.passed should be False when divergent_count < threshold."""
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result

        results = []
        for i in range(5):
            results.append(
                ScenarioResult(
                    scenario=f"scenario-{i}",
                    framework_response=f"framework-{i}",
                    baseline_response=f"baseline-{i}",
                    divergence_score=3 if i < 3 else 8,
                    specificity_score=3 if i < 3 else 7,
                    traceability_score=3 if i < 3 else 9,
                    divergent=i >= 3,  # only 2 divergent
                )
            )

        tier1 = Tier1Result(scenario_results=results)
        assert tier1.divergent_count == 2
        assert tier1.passed is False


# ---------------------------------------------------------------------------
# Task 11: Tier 2 — Internal Consistency
# ---------------------------------------------------------------------------


class TestTier2:
    """Tests for Tier 2 validation — internal consistency."""

    def test_run_tier2_passes_traceable_responses(self):
        """run_tier2 should pass when responses are traceable and consistent."""
        from framework_forge.validation.tier2 import run_tier2

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "traceability_ratio": 0.90,
            "lens_consistent": True,
            "contradictions": [],
            "per_scenario_details": [
                {
                    "scenario": "Launch timing",
                    "traceable_steps": 9,
                    "total_steps": 10,
                    "lens_aligned": True,
                    "contradiction": None,
                }
            ],
        }

        framework = {"perceptual_lens": {"statement": "test lens"}, "bipolar_constructs": []}
        tier1_scenarios = [
            {
                "scenario": "Launch timing",
                "framework_response": "Ship now",
                "baseline_response": "Wait",
            }
        ]

        result = run_tier2(framework, tier1_scenarios, client=mock_client)

        assert result.passed is True
        assert result.traceability_ratio >= TIER2_MIN_TRACEABILITY
        assert result.lens_consistent is True
        assert len(result.contradictions) == 0
        mock_client.prompt_json.assert_called_once()

    def test_tier2_fails_low_traceability(self):
        """Tier2Result should fail when traceability ratio is below threshold."""
        from framework_forge.validation.tier2 import Tier2Result

        result = Tier2Result(
            traceability_ratio=0.50,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[],
        )

        assert result.passed is False

    def test_tier2_fails_with_contradictions(self):
        """Tier2Result should fail when contradictions are found."""
        from framework_forge.validation.tier2 import Tier2Result

        result = Tier2Result(
            traceability_ratio=0.90,
            lens_consistent=True,
            contradictions=[{"construct": "A", "scenario_a": "s1", "scenario_b": "s2"}],
            per_scenario_details=[],
        )

        assert result.passed is False

    def test_tier2_fails_lens_inconsistent(self):
        """Tier2Result should fail when lens is inconsistent."""
        from framework_forge.validation.tier2 import Tier2Result

        result = Tier2Result(
            traceability_ratio=0.90,
            lens_consistent=False,
            contradictions=[],
            per_scenario_details=[],
        )

        assert result.passed is False


# ---------------------------------------------------------------------------
# Task 12: Tier 3 Prep + Floor Check
# ---------------------------------------------------------------------------


class TestTier3Prep:
    """Tests for Tier 3 preparation — human review materials."""

    def test_prepare_materials_creates_files(self, tmp_framework_dir):
        """prepare_tier3_materials should create review_packet.json."""
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
        from framework_forge.validation.tier3_prep import prepare_tier3_materials

        results = []
        for i in range(5):
            results.append(
                ScenarioResult(
                    scenario=f"scenario-{i}",
                    framework_response=f"framework-response-{i}",
                    baseline_response=f"baseline-response-{i}",
                    divergence_score=8,
                    specificity_score=7,
                    traceability_score=9,
                    divergent=True,
                )
            )

        tier1 = Tier1Result(scenario_results=results)

        output_path = prepare_tier3_materials(
            tier1_results=tier1,
            person="Steve Jobs",
            output_dir=tmp_framework_dir / "validation" / "tier3_materials",
        )

        assert output_path.exists()
        assert output_path.name == "review_packet.json"

        loaded = json.loads(output_path.read_text(encoding="utf-8"))
        assert "person" in loaded
        assert "pairs" in loaded
        assert len(loaded["pairs"]) == 5

        # Verify A/B randomization: each pair has response_a and response_b
        for pair in loaded["pairs"]:
            assert "scenario" in pair
            assert "response_a" in pair
            assert "response_b" in pair
            assert "labels" in pair  # which is A, which is B (for answer key)


class TestFloorCheck:
    """Tests for floor check validation."""

    def test_floor_check_passes(self):
        """FloorCheckResult should pass when alignment >= threshold."""
        from framework_forge.validation.floor_check import run_floor_check

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "alignment_ratio": 0.70,
            "per_decision_results": [
                {
                    "decision": "Remove the keyboard",
                    "framework_would_predict": "Remove it",
                    "aligned": True,
                },
                {
                    "decision": "Launch without Flash",
                    "framework_would_predict": "Launch without Flash",
                    "aligned": True,
                },
                {
                    "decision": "Focus on consumer market",
                    "framework_would_predict": "Focus on consumer",
                    "aligned": True,
                },
            ],
        }

        framework = {"perceptual_lens": {"statement": "test"}}
        historical = [
            {"decision": "Remove the keyboard", "context": "iPhone design"},
            {"decision": "Launch without Flash", "context": "iPad launch"},
            {"decision": "Focus on consumer market", "context": "Apple strategy"},
        ]

        result = run_floor_check(framework, historical, client=mock_client)

        assert result.passed is True
        assert result.alignment_ratio >= FLOOR_CHECK_MIN_ALIGNMENT
        mock_client.prompt_json.assert_called_once()

    def test_floor_check_fails_low_alignment(self):
        """FloorCheckResult should fail when alignment < threshold."""
        from framework_forge.validation.floor_check import FloorCheckResult

        result = FloorCheckResult(
            alignment_ratio=0.30,
            per_decision_results=[
                {"decision": "d1", "aligned": False},
                {"decision": "d2", "aligned": False},
                {"decision": "d3", "aligned": True},
            ],
        )

        assert result.passed is False
