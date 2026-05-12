"""Tests for validation modules (Tier 1, Tier 2, Tier 3 Prep, Floor Check)."""

import json
from shutil import copyfile
from pathlib import Path
from unittest.mock import MagicMock, patch

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

    def test_tier1_result_passes_at_threshold(self):
        """Tier1Result.passed should flip on at the documented threshold."""
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result

        results = []
        for i in range(TIER1_MIN_DIVERGENT_SCENARIOS):
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

        assert tier1.divergent_count == TIER1_MIN_DIVERGENT_SCENARIOS
        assert tier1.passed is True

    def test_tier1_helpers_and_result_serialization(self):
        """Tier 1 helper functions should work through the default client path."""
        from framework_forge.validation import tier1 as tier1_module

        mock_client = MagicMock()
        mock_client.prompt_json.side_effect = [
            {
                "scenario": "Launch a stripped-down product now",
                "domain_context": "Product strategy",
                "decision_required": "Launch timing",
            },
            {
                "divergence_score": 9,
                "specificity_score": 8,
                "traceability_score": 7,
                "divergent": True,
                "reasoning": "Strong framework-specific advice.",
            },
            {
                "scenario": "Ship a smaller product first",
                "domain_context": "Product strategy",
                "decision_required": "Launch timing",
            },
            {
                "divergence_score": 9,
                "specificity_score": 8,
                "traceability_score": 7,
                "divergent": True,
                "reasoning": "Strong framework-specific advice.",
            },
        ]
        mock_response = MagicMock()
        mock_response.raw_text = "Framework answer"
        mock_client.prompt.return_value = mock_response

        with patch("framework_forge.llm.LLMClient", return_value=mock_client):
            scenario = tier1_module.generate_scenario(
                person="Steve Jobs",
                domain="product design",
                existing_scenarios=[],
                client=None,
            )
            framework_response = tier1_module.generate_framework_response(
                scenario=scenario,
                framework={"perceptual_lens": {"statement": "test"}},
                person="Steve Jobs",
                client=None,
            )
            baseline_response = tier1_module.generate_baseline_response(
                scenario=scenario,
                person="Steve Jobs",
                client=None,
            )
            scores = tier1_module.score_divergence(
                framework_response=framework_response,
                baseline_response=baseline_response,
                scenario=scenario,
                client=None,
            )
            result = tier1_module.run_tier1(
                framework={"perceptual_lens": {"statement": "test"}},
                person="Steve Jobs",
                domain="product design",
                num_scenarios=1,
                client=None,
            )

        assert scenario["scenario"] == "Launch a stripped-down product now"
        assert framework_response == "Framework answer"
        assert baseline_response == "Framework answer"
        assert scores["divergent"] is True
        assert result.divergent_count == 1
        assert result.passed is False

        summary = result.to_dict()
        assert summary["divergent_count"] == 1
        assert summary["total_scenarios"] == 1
        assert summary["scenario_results"][0]["scenario"] == "Ship a smaller product first"


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

    def test_tier2_default_client_and_serialization(self):
        """run_tier2 should work through the default client path and serialize cleanly."""
        from framework_forge.validation.tier2 import Tier2Result, run_tier2

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "traceability_ratio": 0.95,
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

        with patch("framework_forge.llm.LLMClient", return_value=mock_client):
            result = run_tier2(framework, tier1_scenarios, client=None)

        assert result.passed is True
        summary = result.to_dict()
        assert summary["traceability_ratio"] == 0.95
        assert summary["passed"] is True
        assert summary["per_scenario_details"][0]["scenario"] == "Launch timing"

        direct = Tier2Result(
            traceability_ratio=0.95,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[],
        )
        assert direct.to_dict()["passed"] is True

    def test_tier2_result_passes_at_threshold(self):
        """Tier2Result.passed should allow the exact traceability threshold."""
        from framework_forge.validation.tier2 import Tier2Result

        result = Tier2Result(
            traceability_ratio=TIER2_MIN_TRACEABILITY,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[],
        )

        assert result.passed is True


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

    def test_floor_check_default_client_and_serialization(self):
        """run_floor_check should work through the default client path and serialize cleanly."""
        from framework_forge.validation.floor_check import FloorCheckResult, run_floor_check

        mock_client = MagicMock()
        mock_client.prompt_json.return_value = {
            "alignment_ratio": 0.75,
            "per_decision_results": [
                {
                    "decision": "Remove the keyboard",
                    "framework_would_predict": "Remove it",
                    "aligned": True,
                    "reasoning": "Matches the documented lens.",
                }
            ],
        }

        framework = {"perceptual_lens": {"statement": "test"}}
        historical = [{"decision": "Remove the keyboard", "context": "iPhone design"}]

        with patch("framework_forge.llm.LLMClient", return_value=mock_client):
            result = run_floor_check(framework, historical, client=None)

        assert result.passed is True
        summary = result.to_dict()
        assert summary["alignment_ratio"] == 0.75
        assert summary["passed"] is True
        assert summary["per_decision_results"][0]["decision"] == "Remove the keyboard"

        direct = FloorCheckResult(alignment_ratio=0.75, per_decision_results=[])
        assert direct.to_dict()["passed"] is True

    def test_floor_check_result_passes_at_threshold(self):
        """FloorCheckResult.passed should allow the exact alignment threshold."""
        from framework_forge.validation.floor_check import FloorCheckResult

        result = FloorCheckResult(
            alignment_ratio=FLOOR_CHECK_MIN_ALIGNMENT,
            per_decision_results=[],
        )

        assert result.passed is True


class TestValidationCliSmoke:
    """End-to-end smoke coverage for the validate CLI contract."""

    def test_validate_full_emits_expected_artifacts_from_saved_fixture(
        self,
        tmp_path,
        monkeypatch,
    ):
        """Full validation should write Tier 1, Tier 2, and Tier 3 outputs."""
        from click.testing import CliRunner

        from framework_forge.cli import cli
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
        from framework_forge.validation.tier2 import Tier2Result

        fixture_path = (
            Path(__file__).resolve().parents[1]
            / "frameworks"
            / "abraham-lincoln"
            / "framework.json"
        )
        framework_dir = tmp_path / "framework-fixture"
        framework_dir.mkdir(parents=True)
        framework_path = framework_dir / "framework.json"
        copyfile(fixture_path, framework_path)

        class DummyLLMClient:
            """Placeholder client so validate() can instantiate safely."""

        def fake_run_tier1(framework, person, domain, client=None):
            assert framework["meta"]["person"] == "Abraham Lincoln"
            assert person == "Steve Jobs"
            assert domain == "Technology, Design, Business"
            return Tier1Result(
                scenario_results=[
                    ScenarioResult(
                        scenario=f"Launch timing {index}",
                        framework_response="Ship now",
                        baseline_response="Wait",
                        divergence_score=8,
                        specificity_score=7,
                        traceability_score=9,
                        divergent=True,
                    )
                    for index in range(5)
                ]
            )

        def fake_run_tier2(framework, tier1_scenarios, client=None):
            assert framework["meta"]["person"] == "Abraham Lincoln"
            assert len(tier1_scenarios) == 5
            assert tier1_scenarios[0]["scenario"] == "Launch timing 0"
            assert all(
                scenario["scenario"].startswith("Launch timing ")
                and scenario["framework_response"] == "Ship now"
                for scenario in tier1_scenarios
            )
            return Tier2Result(
                traceability_ratio=0.9,
                lens_consistent=True,
                contradictions=[],
                per_scenario_details=[
                    {
                        "scenario": f"Launch timing {index}",
                        "traceable_steps": 9,
                        "total_steps": 10,
                        "lens_aligned": True,
                        "contradiction": None,
                    }
                    for index in range(5)
                ],
            )

        monkeypatch.setattr("framework_forge.llm.LLMClient", DummyLLMClient)
        monkeypatch.setattr("framework_forge.validation.tier1.run_tier1", fake_run_tier1)
        monkeypatch.setattr("framework_forge.validation.tier2.run_tier2", fake_run_tier2)

        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "validate",
                "--framework",
                str(framework_path),
                "--person",
                "Steve Jobs",
                "--domain",
                "Technology, Design, Business",
                "--mode",
                "full",
            ],
        )

        assert result.exit_code == 0, result.output
        assert "Running Tier 1: Baseline Differentiation..." in result.output
        assert "Running Tier 2: Internal Consistency..." in result.output
        assert "Review packet saved to" in result.output

        validation_dir = framework_dir / "validation"
        tier1_path = validation_dir / "tier1_results.json"
        tier2_path = validation_dir / "tier2_results.json"
        tier3_path = validation_dir / "tier3_materials" / "review_packet.json"

        assert tier1_path.exists()
        assert tier2_path.exists()
        assert tier3_path.exists()

        tier1_data = json.loads(tier1_path.read_text(encoding="utf-8"))
        tier2_data = json.loads(tier2_path.read_text(encoding="utf-8"))
        tier3_data = json.loads(tier3_path.read_text(encoding="utf-8"))

        assert tier1_data["passed"] is True
        assert len(tier1_data["scenario_results"]) == 5
        assert tier1_data["scenario_results"][0]["scenario"] == "Launch timing 0"
        assert tier2_data["passed"] is True
        assert tier2_data["traceability_ratio"] == 0.9
        assert tier3_data["person"] == "Steve Jobs"
        assert len(tier3_data["pairs"]) == 5


class TestPlaceholderCitations:
    """Tests for placeholder citation validation."""

    def test_validate_framework_payload_passes_clean_data(self):
        """Clean framework payloads should pass placeholder validation."""
        from framework_forge.validation.placeholder_citations import (
            validate_framework_payload,
        )

        payload = {
            "meta": {
                "primary_sources": ["Walter Isaacson, Steve Jobs"],
                "secondary_sources": ["Brent Schlender, Becoming Steve Jobs"],
            },
            "critical_incident_database": [
                {
                    "source": "Walter Isaacson, Steve Jobs",
                    "decision": "Remove the keyboard",
                }
            ],
            "behavioral_divergence_predictions": [],
        }

        result = validate_framework_payload(payload)

        assert result.passed is True
        assert result.violations == []
        assert result.to_dict()["passed"] is True
        assert result.to_dict()["scanned_files"] == ["<memory>"]

    def test_validate_framework_payload_rejects_mock_placeholder(self):
        """Any mock_placeholder citation should fail validation."""
        from framework_forge.validation.placeholder_citations import (
            validate_framework_payload,
        )

        payload = {
            "meta": {
                "primary_sources": ["mock_placeholder"],
                "secondary_sources": [],
            },
            "critical_incident_database": [
                {
                    "source": "Walter Isaacson, Steve Jobs",
                    "decision": "Remove the keyboard",
                }
            ],
        }

        result = validate_framework_payload(payload, artifact_path="framework.json")

        assert result.passed is False
        assert len(result.violations) == 1
        violation = result.violations[0]
        assert violation.artifact_path == "framework.json"
        assert violation.json_path == "$.meta.primary_sources[0]"
        assert violation.value == "mock_placeholder"
        assert violation.to_dict() == {
            "root": "<memory>",
            "artifact_path": "framework.json",
            "json_path": "$.meta.primary_sources[0]",
            "value": "mock_placeholder",
        }

    def test_validate_framework_artifact_tree_reports_placeholder(self, tmp_framework_dir):
        """Tree validation should scan JSON artifacts and fail on placeholders."""
        from framework_forge.validation.placeholder_citations import (
            validate_framework_artifact_tree,
        )

        clean_framework = {
            "meta": {
                "primary_sources": ["Walter Isaacson, Steve Jobs"],
                "secondary_sources": [],
            },
            "critical_incident_database": [],
        }
        bad_bibliography = {
            "entries": [
                {
                    "title": "Interview transcript",
                    "source": "mock_placeholder",
                }
            ]
        }

        (tmp_framework_dir / "framework.json").write_text(
            json.dumps(clean_framework), encoding="utf-8"
        )
        bibliography_path = tmp_framework_dir / "sources" / "bibliography.json"
        bibliography_path.write_text(json.dumps(bad_bibliography), encoding="utf-8")

        resolved = str(tmp_framework_dir.resolve())
        result = validate_framework_artifact_tree(tmp_framework_dir)

        assert result.passed is False
        assert result.scanned_files == [
            f"{resolved}:framework.json",
            f"{resolved}:sources/bibliography.json",
        ]
        assert any(v.artifact_path == "sources/bibliography.json" for v in result.violations)
        assert any(v.value == "mock_placeholder" for v in result.violations)
        assert result.to_dict()["passed"] is False

    def test_main_returns_zero_for_clean_tree(self, tmp_framework_dir, capsys):
        """The CLI entrypoint should exit zero when the tree is clean."""
        from framework_forge.validation.placeholder_citations import main

        payload = {
            "meta": {
                "primary_sources": ["Walter Isaacson, Steve Jobs"],
                "secondary_sources": [],
            }
        }
        (tmp_framework_dir / "framework.json").write_text(
            json.dumps(payload), encoding="utf-8"
        )

        exit_code = main([str(tmp_framework_dir)])
        captured = capsys.readouterr()

        assert exit_code == 0
        assert "No mock_placeholder citations found" in captured.out

    def test_main_returns_nonzero_for_placeholder_tree(self, tmp_framework_dir, capsys):
        """The CLI entrypoint should exit non-zero when placeholders exist."""
        from framework_forge.validation.placeholder_citations import main

        payload = {
            "meta": {
                "primary_sources": ["mock_placeholder"],
                "secondary_sources": [],
            }
        }
        (tmp_framework_dir / "framework.json").write_text(
            json.dumps(payload), encoding="utf-8"
        )

        exit_code = main([str(tmp_framework_dir)])
        captured = capsys.readouterr()

        assert exit_code == 1
        assert "mock_placeholder" in captured.out
