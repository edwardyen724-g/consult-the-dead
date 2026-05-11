"""Regression coverage for Catherine the Great source wiring."""

import json
from pathlib import Path


def test_catherine_incident_sources_reference_real_narratives():
    framework_path = (
        Path(__file__).resolve().parents[1]
        / "frameworks"
        / "catherine-the-great"
        / "framework.json"
    )
    framework = json.loads(framework_path.read_text(encoding="utf-8"))
    expected_sources = {
        "incident-001": "01_arrival_in_russia_1744",
        "incident-003": "02_marriage_to_peter_iii_1745_1762",
        "incident-005": "03_coup_june_28_1762",
        "incident-006": "03_coup_june_28_1762",
        "incident-009": "05_pugachev_rebellion_1773_1775",
    }

    for incident in framework["critical_incident_database"]:
        source = incident["source"]
        assert source != "mock_placeholder"
        assert source == expected_sources[incident["id"]]


def test_shared_framework_fixtures_are_wired(sample_incident, sample_construct, sample_lens, tmp_framework_dir):
    assert sample_incident["id"] == "incident-test-001"
    assert sample_incident["cdm_probes"]["situation_framing"].startswith("This is not a phone design problem")
    assert sample_construct["derived_from_incidents"] == ["incident-test-001"]
    assert "interface disappears" in sample_construct["positive_pole"]
    assert sample_lens["derived_from"] == ["incident-test-001", "incident-test-002", "incident-test-003"]
    assert "feature parity" in sample_lens["what_they_ignore"].lower()

    assert (tmp_framework_dir / "incidents").is_dir()
    assert (tmp_framework_dir / "sources" / "texts").is_dir()
    assert (tmp_framework_dir / "validation" / "tier3_materials").is_dir()
