"""Structural tests for validation artifacts of the 8 frameworks.

Verifies that all eight frameworks that previously lacked tier validation
artifacts now have the complete required structure:
- frameworks/<slug>/validation/tier1_results.json
- frameworks/<slug>/validation/tier2_results.json
- frameworks/<slug>/validation/tier3_materials/review_packet.json

Also validates that each artifact conforms to the expected schema
(required keys, correct types, plausible numeric ranges).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

FRAMEWORKS_DIR = Path(__file__).parent.parent / "frameworks"

FRAMEWORKS_UNDER_TEST = [
    ("ada-lovelace", "Ada Lovelace"),
    ("alexander-the-great", "Alexander the Great"),
    ("catherine-the-great", "Catherine the Great"),
    ("cleopatra-vii", "Cleopatra VII"),
    ("epictetus", "Epictetus"),
    ("galileo-galilei", "Galileo Galilei"),
    ("harriet-tubman", "Harriet Tubman"),
    ("john-d-rockefeller", "John D. Rockefeller"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _validation_dir(slug: str) -> Path:
    return FRAMEWORKS_DIR / slug / "validation"


def _load_json(path: Path) -> dict:
    assert path.exists(), f"Missing required artifact: {path}"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Tier 1 structure tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("slug,name", FRAMEWORKS_UNDER_TEST)
class TestTier1ArtifactStructure:
    """Tier 1 artifact must exist and have required keys."""

    def test_tier1_file_exists(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier1_results.json"
        assert path.exists(), (
            f"frameworks/{slug}/validation/tier1_results.json is missing"
        )

    def test_tier1_required_keys(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier1_results.json"
        data = _load_json(path)
        required_keys = {"divergent_count", "total_scenarios", "passed", "scenario_results"}
        missing = required_keys - data.keys()
        assert not missing, f"{slug} tier1 missing keys: {missing}"

    def test_tier1_scenario_count(self, slug: str, name: str) -> None:
        """Must have at least 5 scenarios (TIER1_MIN_SCENARIOS)."""
        data = _load_json(_validation_dir(slug) / "tier1_results.json")
        assert data["total_scenarios"] >= 5, (
            f"{slug} tier1 has only {data['total_scenarios']} scenarios; expected >= 5"
        )
        assert len(data["scenario_results"]) == data["total_scenarios"]

    def test_tier1_scenario_results_schema(self, slug: str, name: str) -> None:
        """Each scenario result must have the correct keys."""
        data = _load_json(_validation_dir(slug) / "tier1_results.json")
        required = {
            "scenario", "framework_response", "baseline_response",
            "divergence_score", "specificity_score", "traceability_score", "divergent",
        }
        for i, sr in enumerate(data["scenario_results"]):
            missing = required - sr.keys()
            assert not missing, f"{slug} tier1 scenario_results[{i}] missing keys: {missing}"

    def test_tier1_divergent_count_consistent(self, slug: str, name: str) -> None:
        """divergent_count must match actual number of divergent=True entries."""
        data = _load_json(_validation_dir(slug) / "tier1_results.json")
        actual_divergent = sum(1 for s in data["scenario_results"] if s["divergent"])
        assert actual_divergent == data["divergent_count"], (
            f"{slug} tier1 divergent_count {data['divergent_count']} != "
            f"actual divergent entries {actual_divergent}"
        )

    def test_tier1_passed_field_type(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier1_results.json")
        assert isinstance(data["passed"], bool), (
            f"{slug} tier1 'passed' should be bool, got {type(data['passed'])}"
        )


# ---------------------------------------------------------------------------
# Tier 2 structure tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("slug,name", FRAMEWORKS_UNDER_TEST)
class TestTier2ArtifactStructure:
    """Tier 2 artifact must exist and have required keys."""

    def test_tier2_file_exists(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier2_results.json"
        assert path.exists(), (
            f"frameworks/{slug}/validation/tier2_results.json is missing"
        )

    def test_tier2_required_keys(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier2_results.json"
        data = _load_json(path)
        required_keys = {
            "traceability_ratio", "lens_consistent", "contradictions",
            "per_scenario_details", "passed",
        }
        missing = required_keys - data.keys()
        assert not missing, f"{slug} tier2 missing keys: {missing}"

    def test_tier2_traceability_ratio_range(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        ratio = data["traceability_ratio"]
        assert 0.0 <= ratio <= 1.0, (
            f"{slug} tier2 traceability_ratio {ratio} outside [0, 1]"
        )

    def test_tier2_lens_consistent_type(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        assert isinstance(data["lens_consistent"], bool), (
            f"{slug} tier2 'lens_consistent' should be bool"
        )

    def test_tier2_contradictions_is_list(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        assert isinstance(data["contradictions"], list), (
            f"{slug} tier2 'contradictions' should be list"
        )

    def test_tier2_per_scenario_details_is_list(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        assert isinstance(data["per_scenario_details"], list), (
            f"{slug} tier2 'per_scenario_details' should be list"
        )

    def test_tier2_per_scenario_details_not_empty(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        assert len(data["per_scenario_details"]) > 0, (
            f"{slug} tier2 'per_scenario_details' is empty"
        )

    def test_tier2_per_scenario_details_schema(self, slug: str, name: str) -> None:
        """Each per_scenario_details entry must have the required keys."""
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        required = {"scenario", "traceable_steps", "total_steps", "lens_aligned"}
        for i, detail in enumerate(data["per_scenario_details"]):
            missing = required - detail.keys()
            assert not missing, (
                f"{slug} tier2 per_scenario_details[{i}] missing keys: {missing}"
            )

    def test_tier2_passed_field_type(self, slug: str, name: str) -> None:
        data = _load_json(_validation_dir(slug) / "tier2_results.json")
        assert isinstance(data["passed"], bool), (
            f"{slug} tier2 'passed' should be bool"
        )


# ---------------------------------------------------------------------------
# Tier 3 structure tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("slug,name", FRAMEWORKS_UNDER_TEST)
class TestTier3ArtifactStructure:
    """Tier 3 review packet must exist and have required keys."""

    def test_tier3_dir_exists(self, slug: str, name: str) -> None:
        tier3_dir = _validation_dir(slug) / "tier3_materials"
        assert tier3_dir.is_dir(), (
            f"frameworks/{slug}/validation/tier3_materials/ directory is missing"
        )

    def test_tier3_review_packet_exists(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        assert path.exists(), (
            f"frameworks/{slug}/validation/tier3_materials/review_packet.json is missing"
        )

    def test_tier3_review_packet_required_keys(self, slug: str, name: str) -> None:
        path = _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        data = _load_json(path)
        required_keys = {"person", "instructions", "pairs"}
        missing = required_keys - data.keys()
        assert not missing, f"{slug} tier3 review_packet missing keys: {missing}"

    def test_tier3_person_is_nonempty_string(self, slug: str, name: str) -> None:
        data = _load_json(
            _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        )
        assert isinstance(data["person"], str) and data["person"].strip(), (
            f"{slug} tier3 'person' must be a non-empty string"
        )

    def test_tier3_pairs_is_list_with_entries(self, slug: str, name: str) -> None:
        data = _load_json(
            _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        )
        assert isinstance(data["pairs"], list), f"{slug} tier3 'pairs' must be list"
        assert len(data["pairs"]) > 0, f"{slug} tier3 'pairs' must be non-empty"

    def test_tier3_pairs_schema(self, slug: str, name: str) -> None:
        """Each pair must have scenario, response_a, response_b, labels."""
        data = _load_json(
            _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        )
        required_pair_keys = {"scenario", "response_a", "response_b", "labels"}
        for i, pair in enumerate(data["pairs"]):
            missing = required_pair_keys - pair.keys()
            assert not missing, (
                f"{slug} tier3 pairs[{i}] missing keys: {missing}"
            )

    def test_tier3_pairs_labels_schema(self, slug: str, name: str) -> None:
        """labels must identify which response is framework and which is baseline."""
        data = _load_json(
            _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        )
        valid_values = {"framework", "baseline"}
        for i, pair in enumerate(data["pairs"]):
            labels = pair.get("labels", {})
            assert "response_a" in labels and "response_b" in labels, (
                f"{slug} tier3 pairs[{i}] labels missing response_a or response_b"
            )
            assert labels["response_a"] in valid_values, (
                f"{slug} tier3 pairs[{i}] labels.response_a invalid: {labels['response_a']}"
            )
            assert labels["response_b"] in valid_values, (
                f"{slug} tier3 pairs[{i}] labels.response_b invalid: {labels['response_b']}"
            )
            assert labels["response_a"] != labels["response_b"], (
                f"{slug} tier3 pairs[{i}] labels must differ (one framework, one baseline)"
            )


# ---------------------------------------------------------------------------
# Cross-tier consistency tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("slug,name", FRAMEWORKS_UNDER_TEST)
class TestCrossTierConsistency:
    """Sanity checks across tiers for each framework."""

    def test_tier1_and_tier3_pair_counts_match(self, slug: str, name: str) -> None:
        """Tier 3 should have one pair per tier 1 scenario."""
        tier1 = _load_json(_validation_dir(slug) / "tier1_results.json")
        tier3 = _load_json(
            _validation_dir(slug) / "tier3_materials" / "review_packet.json"
        )
        assert len(tier3["pairs"]) == tier1["total_scenarios"], (
            f"{slug}: tier3 has {len(tier3['pairs'])} pairs but "
            f"tier1 has {tier1['total_scenarios']} scenarios"
        )
