"""Artifact persistence tests for Framework Forge validation modules.

Verifies that every result object:
- exposes a stable ``failure_reasons`` property for release gating
- round-trips cleanly through ``to_dict()`` / ``from_dict()``
- serializes to valid JSON with all required keys
- surfaces threshold violations with human-readable messages

Also covers the public __init__ re-exports and the Tier3Result dataclass.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from framework_forge.config import (
    FLOOR_CHECK_MIN_ALIGNMENT,
    TIER1_MIN_DIVERGENT_SCENARIOS,
    TIER2_MIN_TRACEABILITY,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_scenario_result(divergent: bool = True):
    from framework_forge.validation.tier1 import ScenarioResult

    return ScenarioResult(
        scenario="A startup must decide whether to launch now or wait.",
        framework_response="Ship the core experience immediately.",
        baseline_response="Wait for full feature parity.",
        divergence_score=8 if divergent else 3,
        specificity_score=7,
        traceability_score=9,
        divergent=divergent,
    )


def _make_tier1_result(divergent_count: int = 5, total: int = 5):
    from framework_forge.validation.tier1 import Tier1Result

    results = []
    for i in range(total):
        results.append(_make_scenario_result(divergent=i < divergent_count))
    return Tier1Result(scenario_results=results)


def _make_tier2_result(
    traceability_ratio: float = 0.9,
    lens_consistent: bool = True,
    contradictions: list | None = None,
):
    from framework_forge.validation.tier2 import Tier2Result

    return Tier2Result(
        traceability_ratio=traceability_ratio,
        lens_consistent=lens_consistent,
        contradictions=contradictions or [],
        per_scenario_details=[
            {
                "scenario": "Launch timing",
                "traceable_steps": 9,
                "total_steps": 10,
                "lens_aligned": True,
                "contradiction": None,
            }
        ],
    )


def _make_floor_check_result(alignment_ratio: float = 0.7):
    from framework_forge.validation.floor_check import FloorCheckResult

    return FloorCheckResult(
        alignment_ratio=alignment_ratio,
        per_decision_results=[
            {
                "decision": "Remove the keyboard",
                "framework_would_predict": "Remove it",
                "aligned": True,
                "reasoning": "Matches the documented lens.",
            }
        ],
    )


# ---------------------------------------------------------------------------
# ScenarioResult round-trip
# ---------------------------------------------------------------------------


class TestScenarioResultPersistence:
    """ScenarioResult serialization and deserialization."""

    def test_to_dict_contains_all_fields(self):
        sr = _make_scenario_result()
        d = sr.to_dict()
        expected_keys = {
            "scenario",
            "framework_response",
            "baseline_response",
            "divergence_score",
            "specificity_score",
            "traceability_score",
            "divergent",
        }
        assert set(d.keys()) == expected_keys

    def test_from_dict_round_trip_divergent(self):
        from framework_forge.validation.tier1 import ScenarioResult

        original = _make_scenario_result(divergent=True)
        restored = ScenarioResult.from_dict(original.to_dict())
        assert restored.scenario == original.scenario
        assert restored.framework_response == original.framework_response
        assert restored.baseline_response == original.baseline_response
        assert restored.divergence_score == original.divergence_score
        assert restored.specificity_score == original.specificity_score
        assert restored.traceability_score == original.traceability_score
        assert restored.divergent is True

    def test_from_dict_round_trip_non_divergent(self):
        from framework_forge.validation.tier1 import ScenarioResult

        original = _make_scenario_result(divergent=False)
        restored = ScenarioResult.from_dict(original.to_dict())
        assert restored.divergent is False

    def test_json_serializable(self):
        sr = _make_scenario_result()
        # Must not raise
        blob = json.dumps(sr.to_dict())
        reparsed = json.loads(blob)
        assert reparsed["divergent"] is True


# ---------------------------------------------------------------------------
# Tier1Result failure_reasons and round-trip
# ---------------------------------------------------------------------------


class TestTier1ResultPersistence:
    """Tier1Result failure_reasons, serialization, deserialization."""

    def test_failure_reasons_empty_when_passed(self):
        tier1 = _make_tier1_result(divergent_count=TIER1_MIN_DIVERGENT_SCENARIOS)
        assert tier1.passed is True
        assert tier1.failure_reasons == []

    def test_failure_reasons_present_when_failed(self):
        # Only 1 divergent out of 5 → below threshold of 4
        tier1 = _make_tier1_result(divergent_count=1, total=5)
        assert tier1.passed is False
        reasons = tier1.failure_reasons
        assert len(reasons) == 1
        assert "divergent scenarios" in reasons[0]
        assert str(TIER1_MIN_DIVERGENT_SCENARIOS) in reasons[0]
        assert "1 of 5" in reasons[0]

    def test_failure_reasons_in_to_dict(self):
        tier1 = _make_tier1_result(divergent_count=1)
        d = tier1.to_dict()
        assert "failure_reasons" in d
        assert isinstance(d["failure_reasons"], list)
        assert len(d["failure_reasons"]) == 1

    def test_failure_reasons_empty_in_to_dict_when_passed(self):
        tier1 = _make_tier1_result(divergent_count=5)
        d = tier1.to_dict()
        assert d["failure_reasons"] == []

    def test_to_dict_contains_required_keys(self):
        tier1 = _make_tier1_result()
        d = tier1.to_dict()
        for key in ("divergent_count", "total_scenarios", "passed", "failure_reasons", "scenario_results"):
            assert key in d, f"Missing key: {key}"

    def test_from_dict_round_trip_passed(self):
        from framework_forge.validation.tier1 import Tier1Result

        original = _make_tier1_result(divergent_count=5)
        restored = Tier1Result.from_dict(original.to_dict())
        assert restored.divergent_count == 5
        assert restored.passed is True
        assert len(restored.scenario_results) == 5

    def test_from_dict_round_trip_failed(self):
        from framework_forge.validation.tier1 import Tier1Result

        original = _make_tier1_result(divergent_count=1)
        restored = Tier1Result.from_dict(original.to_dict())
        assert restored.divergent_count == 1
        assert restored.passed is False
        assert restored.failure_reasons == original.failure_reasons

    def test_json_round_trip(self):
        from framework_forge.validation.tier1 import Tier1Result

        original = _make_tier1_result(divergent_count=4)
        blob = json.dumps(original.to_dict())
        restored = Tier1Result.from_dict(json.loads(blob))
        assert restored.divergent_count == 4
        assert restored.passed is True

    def test_from_dict_preserves_scenario_fields(self):
        from framework_forge.validation.tier1 import Tier1Result

        original = _make_tier1_result(divergent_count=5, total=5)
        restored = Tier1Result.from_dict(original.to_dict())
        sr = restored.scenario_results[0]
        assert sr.scenario == "A startup must decide whether to launch now or wait."
        assert sr.framework_response == "Ship the core experience immediately."
        assert sr.divergent is True


# ---------------------------------------------------------------------------
# Tier2Result failure_reasons and round-trip
# ---------------------------------------------------------------------------


class TestTier2ResultPersistence:
    """Tier2Result failure_reasons, serialization, deserialization."""

    def test_failure_reasons_empty_when_passed(self):
        tier2 = _make_tier2_result()
        assert tier2.passed is True
        assert tier2.failure_reasons == []

    def test_failure_reasons_low_traceability(self):
        tier2 = _make_tier2_result(traceability_ratio=0.5)
        assert tier2.passed is False
        reasons = tier2.failure_reasons
        assert any("Traceability" in r for r in reasons)
        assert any(f"{TIER2_MIN_TRACEABILITY:.0%}" in r for r in reasons)
        assert any("50%" in r for r in reasons)

    def test_failure_reasons_lens_inconsistent(self):
        tier2 = _make_tier2_result(lens_consistent=False)
        assert tier2.passed is False
        reasons = tier2.failure_reasons
        assert any("lens" in r.lower() for r in reasons)

    def test_failure_reasons_contradictions(self):
        contradiction = {"construct": "A", "scenario_a": "s1", "scenario_b": "s2", "explanation": "x"}
        tier2 = _make_tier2_result(contradictions=[contradiction])
        assert tier2.passed is False
        reasons = tier2.failure_reasons
        assert any("contradiction" in r.lower() for r in reasons)
        assert any("1" in r for r in reasons)

    def test_failure_reasons_multiple_contradictions_plural(self):
        contradictions = [
            {"construct": "A", "scenario_a": "s1", "scenario_b": "s2", "explanation": "x"},
            {"construct": "B", "scenario_a": "s3", "scenario_b": "s4", "explanation": "y"},
        ]
        tier2 = _make_tier2_result(contradictions=contradictions)
        reasons = tier2.failure_reasons
        assert any("2 contradictions" in r for r in reasons)

    def test_failure_reasons_all_causes_combined(self):
        tier2 = _make_tier2_result(
            traceability_ratio=0.5,
            lens_consistent=False,
            contradictions=[{"construct": "A"}],
        )
        reasons = tier2.failure_reasons
        assert len(reasons) == 3

    def test_failure_reasons_in_to_dict(self):
        tier2 = _make_tier2_result(traceability_ratio=0.5)
        d = tier2.to_dict()
        assert "failure_reasons" in d
        assert len(d["failure_reasons"]) >= 1

    def test_to_dict_contains_required_keys(self):
        tier2 = _make_tier2_result()
        d = tier2.to_dict()
        for key in (
            "traceability_ratio",
            "lens_consistent",
            "contradictions",
            "per_scenario_details",
            "passed",
            "failure_reasons",
        ):
            assert key in d, f"Missing key: {key}"

    def test_from_dict_round_trip_passed(self):
        from framework_forge.validation.tier2 import Tier2Result

        original = _make_tier2_result()
        restored = Tier2Result.from_dict(original.to_dict())
        assert restored.traceability_ratio == original.traceability_ratio
        assert restored.lens_consistent is True
        assert restored.contradictions == []
        assert restored.passed is True

    def test_from_dict_round_trip_failed(self):
        from framework_forge.validation.tier2 import Tier2Result

        original = _make_tier2_result(traceability_ratio=0.6, lens_consistent=False)
        restored = Tier2Result.from_dict(original.to_dict())
        assert restored.traceability_ratio == 0.6
        assert restored.lens_consistent is False
        assert restored.passed is False
        assert restored.failure_reasons == original.failure_reasons

    def test_json_round_trip(self):
        from framework_forge.validation.tier2 import Tier2Result

        original = _make_tier2_result(traceability_ratio=0.85)
        blob = json.dumps(original.to_dict())
        restored = Tier2Result.from_dict(json.loads(blob))
        assert restored.traceability_ratio == 0.85
        assert restored.passed is True

    def test_from_dict_preserves_per_scenario_details(self):
        from framework_forge.validation.tier2 import Tier2Result

        original = _make_tier2_result()
        restored = Tier2Result.from_dict(original.to_dict())
        assert len(restored.per_scenario_details) == 1
        assert restored.per_scenario_details[0]["scenario"] == "Launch timing"


# ---------------------------------------------------------------------------
# FloorCheckResult failure_reasons and round-trip
# ---------------------------------------------------------------------------


class TestFloorCheckResultPersistence:
    """FloorCheckResult failure_reasons, serialization, deserialization."""

    def test_failure_reasons_empty_when_passed(self):
        fc = _make_floor_check_result(alignment_ratio=0.7)
        assert fc.passed is True
        assert fc.failure_reasons == []

    def test_failure_reasons_present_when_failed(self):
        fc = _make_floor_check_result(alignment_ratio=0.3)
        assert fc.passed is False
        reasons = fc.failure_reasons
        assert len(reasons) == 1
        assert "alignment" in reasons[0].lower()
        assert f"{FLOOR_CHECK_MIN_ALIGNMENT:.0%}" in reasons[0]
        assert "30%" in reasons[0]

    def test_failure_reasons_at_exact_threshold(self):
        fc = _make_floor_check_result(alignment_ratio=FLOOR_CHECK_MIN_ALIGNMENT)
        assert fc.passed is True
        assert fc.failure_reasons == []

    def test_failure_reasons_in_to_dict(self):
        fc = _make_floor_check_result(alignment_ratio=0.3)
        d = fc.to_dict()
        assert "failure_reasons" in d
        assert len(d["failure_reasons"]) == 1

    def test_to_dict_contains_required_keys(self):
        fc = _make_floor_check_result()
        d = fc.to_dict()
        for key in ("alignment_ratio", "per_decision_results", "passed", "failure_reasons"):
            assert key in d, f"Missing key: {key}"

    def test_from_dict_round_trip_passed(self):
        from framework_forge.validation.floor_check import FloorCheckResult

        original = _make_floor_check_result(alignment_ratio=0.75)
        restored = FloorCheckResult.from_dict(original.to_dict())
        assert restored.alignment_ratio == 0.75
        assert restored.passed is True
        assert restored.failure_reasons == []

    def test_from_dict_round_trip_failed(self):
        from framework_forge.validation.floor_check import FloorCheckResult

        original = _make_floor_check_result(alignment_ratio=0.2)
        restored = FloorCheckResult.from_dict(original.to_dict())
        assert restored.alignment_ratio == 0.2
        assert restored.passed is False
        assert restored.failure_reasons == original.failure_reasons

    def test_json_round_trip(self):
        from framework_forge.validation.floor_check import FloorCheckResult

        original = _make_floor_check_result(alignment_ratio=0.6)
        blob = json.dumps(original.to_dict())
        restored = FloorCheckResult.from_dict(json.loads(blob))
        assert restored.alignment_ratio == 0.6
        assert restored.passed is True

    def test_from_dict_preserves_per_decision_results(self):
        from framework_forge.validation.floor_check import FloorCheckResult

        original = _make_floor_check_result()
        restored = FloorCheckResult.from_dict(original.to_dict())
        assert len(restored.per_decision_results) == 1
        assert restored.per_decision_results[0]["decision"] == "Remove the keyboard"


# ---------------------------------------------------------------------------
# Tier3Result
# ---------------------------------------------------------------------------


class TestTier3Result:
    """Tier3Result dataclass: passed, failure_reasons, to_dict, from_dict."""

    def _make_tier3_result(self, pair_count: int = 5, tmp_path: Path = None):
        from framework_forge.validation.tier3_prep import Tier3Result

        path = (tmp_path or Path("/tmp")) / "review_packet.json"
        pairs = [
            {
                "scenario": f"scenario-{i}",
                "response_a": "A",
                "response_b": "B",
                "labels": {"response_a": "framework", "response_b": "baseline"},
            }
            for i in range(pair_count)
        ]
        return Tier3Result(path=path, person="Steve Jobs", pairs=pairs)

    def test_passed_when_pairs_exist(self, tmp_path):
        tier3 = self._make_tier3_result(pair_count=5, tmp_path=tmp_path)
        assert tier3.passed is True

    def test_failed_when_no_pairs(self, tmp_path):
        tier3 = self._make_tier3_result(pair_count=0, tmp_path=tmp_path)
        assert tier3.passed is False

    def test_failure_reasons_empty_when_passed(self, tmp_path):
        tier3 = self._make_tier3_result(pair_count=3, tmp_path=tmp_path)
        assert tier3.failure_reasons == []

    def test_failure_reasons_present_when_no_pairs(self, tmp_path):
        tier3 = self._make_tier3_result(pair_count=0, tmp_path=tmp_path)
        reasons = tier3.failure_reasons
        assert len(reasons) == 1
        assert "human review" in reasons[0].lower()

    def test_to_dict_contains_required_keys(self, tmp_path):
        tier3 = self._make_tier3_result(tmp_path=tmp_path)
        d = tier3.to_dict()
        for key in ("path", "person", "pair_count", "passed", "failure_reasons"):
            assert key in d, f"Missing key: {key}"

    def test_to_dict_pair_count(self, tmp_path):
        tier3 = self._make_tier3_result(pair_count=7, tmp_path=tmp_path)
        assert tier3.to_dict()["pair_count"] == 7

    def test_to_dict_path_is_string(self, tmp_path):
        tier3 = self._make_tier3_result(tmp_path=tmp_path)
        d = tier3.to_dict()
        assert isinstance(d["path"], str)

    def test_from_dict_round_trip(self, tmp_path):
        from framework_forge.validation.tier3_prep import Tier3Result

        original = self._make_tier3_result(pair_count=5, tmp_path=tmp_path)
        d = original.to_dict()
        restored = Tier3Result.from_dict(d)
        assert restored.path == original.path
        assert restored.person == original.person
        # pairs are not stored in to_dict — they must be loaded from the file
        assert restored.pairs == []

    def test_json_serializable(self, tmp_path):
        tier3 = self._make_tier3_result(tmp_path=tmp_path)
        blob = json.dumps(tier3.to_dict())
        reparsed = json.loads(blob)
        assert reparsed["person"] == "Steve Jobs"
        assert reparsed["passed"] is True

    def test_prepare_tier3_materials_returns_tier3_result(self, tmp_path):
        """prepare_tier3_materials should return a Tier3Result, not a Path."""
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
        from framework_forge.validation.tier3_prep import Tier3Result, prepare_tier3_materials

        results = [
            ScenarioResult(
                scenario=f"s-{i}",
                framework_response=f"fw-{i}",
                baseline_response=f"bl-{i}",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            )
            for i in range(3)
        ]
        tier1 = Tier1Result(scenario_results=results)

        tier3 = prepare_tier3_materials(
            tier1_results=tier1,
            person="Abraham Lincoln",
            output_dir=tmp_path / "tier3",
            seed=42,
        )

        assert isinstance(tier3, Tier3Result)
        assert tier3.path.exists()
        assert tier3.person == "Abraham Lincoln"
        assert len(tier3.pairs) == 3
        assert tier3.passed is True
        assert tier3.failure_reasons == []

    def test_prepare_tier3_materials_no_scenarios_fails(self, tmp_path):
        """An empty Tier1Result should produce a Tier3Result that fails."""
        from framework_forge.validation.tier1 import Tier1Result
        from framework_forge.validation.tier3_prep import prepare_tier3_materials

        tier1 = Tier1Result(scenario_results=[])
        tier3 = prepare_tier3_materials(
            tier1_results=tier1,
            person="Nobody",
            output_dir=tmp_path / "tier3-empty",
        )

        assert tier3.passed is False
        assert len(tier3.failure_reasons) == 1

    def test_prepare_tier3_materials_explicit_random_source(self, tmp_path):
        """prepare_tier3_materials should accept an explicit random_source."""
        import random as _random
        from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
        from framework_forge.validation.tier3_prep import prepare_tier3_materials

        # Use a custom RNG that always returns >= 0.5, forcing the else branch
        class AlwaysSwap:
            def random(self):
                return 0.9  # always >= 0.5, so framework goes to response_b

        results = [
            ScenarioResult(
                scenario="swap-test",
                framework_response="FRAMEWORK",
                baseline_response="BASELINE",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            )
        ]
        tier1 = Tier1Result(scenario_results=results)
        tier3 = prepare_tier3_materials(
            tier1_results=tier1,
            person="Tester",
            output_dir=tmp_path / "tier3-swap",
            random_source=AlwaysSwap(),
        )

        assert tier3.passed is True
        # When rng.random() >= 0.5: response_a=baseline, response_b=framework
        pair = tier3.pairs[0]
        assert pair["response_a"] == "BASELINE"
        assert pair["response_b"] == "FRAMEWORK"
        assert pair["labels"]["response_a"] == "baseline"
        assert pair["labels"]["response_b"] == "framework"


# ---------------------------------------------------------------------------
# __init__ public exports
# ---------------------------------------------------------------------------


class TestValidationPublicExports:
    """The framework_forge.validation package should re-export all public symbols."""

    def test_all_result_classes_importable(self):
        from framework_forge.validation import (
            FloorCheckResult,
            ScenarioResult,
            Tier1Result,
            Tier2Result,
            Tier3Result,
        )
        assert ScenarioResult is not None
        assert Tier1Result is not None
        assert Tier2Result is not None
        assert Tier3Result is not None
        assert FloorCheckResult is not None

    def test_all_runner_functions_importable(self):
        from framework_forge.validation import (
            prepare_tier3_materials,
            run_floor_check,
            run_tier1,
            run_tier2,
        )
        assert callable(run_tier1)
        assert callable(run_tier2)
        assert callable(prepare_tier3_materials)
        assert callable(run_floor_check)

    def test_all_symbols_in_dunder_all(self):
        import framework_forge.validation as val_pkg

        expected = {
            "ScenarioResult",
            "Tier1Result",
            "Tier2Result",
            "Tier3Result",
            "FloorCheckResult",
            "run_tier1",
            "run_tier2",
            "prepare_tier3_materials",
            "run_floor_check",
        }
        assert expected <= set(val_pkg.__all__)

    def test_tier1_result_has_from_dict(self):
        from framework_forge.validation import Tier1Result
        assert hasattr(Tier1Result, "from_dict")
        assert callable(Tier1Result.from_dict)

    def test_tier2_result_has_from_dict(self):
        from framework_forge.validation import Tier2Result
        assert hasattr(Tier2Result, "from_dict")
        assert callable(Tier2Result.from_dict)

    def test_floor_check_result_has_from_dict(self):
        from framework_forge.validation import FloorCheckResult
        assert hasattr(FloorCheckResult, "from_dict")
        assert callable(FloorCheckResult.from_dict)

    def test_tier3_result_has_from_dict(self):
        from framework_forge.validation import Tier3Result
        assert hasattr(Tier3Result, "from_dict")
        assert callable(Tier3Result.from_dict)

    def test_scenario_result_has_from_dict(self):
        from framework_forge.validation import ScenarioResult
        assert hasattr(ScenarioResult, "from_dict")
        assert callable(ScenarioResult.from_dict)


# ---------------------------------------------------------------------------
# Release gate integration: all failure_reasons are non-empty strings
# ---------------------------------------------------------------------------


class TestReleaseGateFailureMessages:
    """Failure messages must be informative strings, not empty or generic."""

    def test_tier1_failure_message_mentions_threshold(self):
        tier1 = _make_tier1_result(divergent_count=0)
        for r in tier1.failure_reasons:
            assert len(r) > 20, "Failure reason is too short to be useful"
            assert str(TIER1_MIN_DIVERGENT_SCENARIOS) in r

    def test_tier2_failure_message_includes_percentage(self):
        from framework_forge.validation.tier2 import Tier2Result

        result = Tier2Result(
            traceability_ratio=0.55,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[],
        )
        for r in result.failure_reasons:
            # Must include both actual and threshold values
            assert "%" in r

    def test_floor_check_failure_message_includes_percentage(self):
        from framework_forge.validation.floor_check import FloorCheckResult

        result = FloorCheckResult(alignment_ratio=0.1, per_decision_results=[])
        for r in result.failure_reasons:
            assert "%" in r

    def test_tier3_failure_message_is_descriptive(self):
        from framework_forge.validation.tier3_prep import Tier3Result

        result = Tier3Result(path=Path("/tmp/x.json"), person="X", pairs=[])
        for r in result.failure_reasons:
            assert len(r) > 10

    def test_passed_results_have_no_failure_reasons(self):
        """A passing result must never surface spurious failure messages."""
        assert _make_tier1_result(divergent_count=5).failure_reasons == []
        assert _make_tier2_result().failure_reasons == []
        assert _make_floor_check_result(0.75).failure_reasons == []

    def test_failure_reasons_are_json_serializable(self):
        """failure_reasons must be serializable for CI output consumers."""
        tier1 = _make_tier1_result(divergent_count=1)
        tier2 = _make_tier2_result(traceability_ratio=0.5, lens_consistent=False)
        fc = _make_floor_check_result(alignment_ratio=0.1)

        for result in [tier1, tier2, fc]:
            reasons = result.failure_reasons
            blob = json.dumps(reasons)  # must not raise
            reparsed = json.loads(blob)
            assert isinstance(reparsed, list)
            assert all(isinstance(r, str) for r in reparsed)
