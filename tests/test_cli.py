"""Tests for the Framework Forge CLI."""

import json
import runpy
import sys

from click.testing import CliRunner
import pytest

import framework_forge.encoding.framework as encoding_framework_mod
import framework_forge.extraction.cdm_probes as cdm_probes_mod
import framework_forge.extraction.constructs as constructs_mod
import framework_forge.extraction.divergence as divergence_mod
import framework_forge.extraction.incidents as incidents_mod
import framework_forge.extraction.lens as lens_mod
import framework_forge.sources as sources_pkg
import framework_forge.validation.floor_check as floor_check_mod
import framework_forge.validation.tier1 as tier1_mod
import framework_forge.validation.tier2 as tier2_mod
import framework_forge.validation.tier3_prep as tier3_prep_mod
from framework_forge.cli import cli
from framework_forge.sources.triage import SourceEntry


class DummyResult:
    def __init__(self, payload):
        self._payload = payload

    def to_dict(self):
        return self._payload


class DummyLens:
    def __init__(self, statement):
        self.statement = statement

    def to_dict(self):
        return {"statement": self.statement}


class DummyFramework:
    def __init__(self, payload):
        self.payload = payload

    def to_dict(self):
        return self.payload


class FakeLLMClient:
    pass


def test_help_lists_source_workflow_commands():
    runner = CliRunner()

    result = runner.invoke(cli, ["--help"])

    assert result.exit_code == 0
    assert "discover-sources" in result.output
    assert "triage-sources" in result.output


def test_discover_sources_writes_ranked_bibliography(tmp_path, monkeypatch):
    discovered = [
        SourceEntry(
            title="Secondary summary",
            url="https://example.com/summary",
            source_type="secondary_reporting",
            description="summary",
            evidence_layers=["layer1"],
        ),
        SourceEntry(
            title="Critical incident",
            url="https://example.com/incident",
            source_type="critical_incident",
            description="incident",
            evidence_layers=["layer2", "layer3"],
        ),
    ]

    seen = {}

    class FakeLLMClient:
        pass

    def fake_discover(person, client):
        seen["person"] = person
        seen["client_type"] = type(client).__name__
        return discovered

    def fake_triage(entries):
        seen["triage_input"] = [entry.title for entry in entries]
        return list(reversed(entries))

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(sources_pkg, "discover_sources", fake_discover)
    monkeypatch.setattr(sources_pkg, "triage_sources", fake_triage)

    runner = CliRunner()
    output_dir = tmp_path / "steve-jobs"

    result = runner.invoke(
        cli,
        ["discover-sources", "--person", "Steve Jobs", "--output", str(output_dir)],
    )

    assert result.exit_code == 0, result.output
    assert "Discovering sources for Steve Jobs..." in result.output
    assert "Found 2 sources. Bibliography saved to" in result.output
    assert seen["person"] == "Steve Jobs"
    assert seen["client_type"] == "FakeLLMClient"
    assert seen["triage_input"] == ["Secondary summary", "Critical incident"]

    bibliography_path = output_dir / "sources" / "bibliography.json"
    assert bibliography_path.exists()

    written = json.loads(bibliography_path.read_text(encoding="utf-8"))
    assert [entry["title"] for entry in written] == ["Critical incident", "Secondary summary"]
    assert written[0]["source_type"] == "critical_incident"


def test_triage_sources_rewrites_bibliography(tmp_path, monkeypatch):
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Summary",
                    "url": "https://example.com/summary",
                    "source_type": "secondary_reporting",
                    "description": "summary",
                    "evidence_layers": ["layer1"],
                    "fetched": False,
                    "text_path": None,
                },
                {
                    "title": "Incident",
                    "url": "https://example.com/incident",
                    "source_type": "critical_incident",
                    "description": "incident",
                    "evidence_layers": ["layer2", "layer3"],
                    "fetched": False,
                    "text_path": None,
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    seen = {}

    def fake_triage(entries):
        seen["input_titles"] = [entry.title for entry in entries]
        return [entries[1], entries[0]]

    monkeypatch.setattr(sources_pkg, "triage_sources", fake_triage)

    runner = CliRunner()
    result = runner.invoke(
        cli,
        ["triage-sources", "--bibliography", str(bibliography_path)],
    )

    assert result.exit_code == 0, result.output
    assert "Triaging 2 sources from" in result.output
    assert "Ranked 2 sources. Bibliography saved to" in result.output
    assert seen["input_titles"] == ["Summary", "Incident"]

    written = json.loads(bibliography_path.read_text(encoding="utf-8"))
    assert [entry["title"] for entry in written] == ["Incident", "Summary"]
    assert written[0]["source_type"] == "critical_incident"


def test_identify_incidents_writes_candidates(tmp_path, monkeypatch):
    source_dir = tmp_path / "sources"
    source_dir.mkdir()
    (source_dir / "a.txt").write_text("alpha", encoding="utf-8")
    (source_dir / "b.txt").write_text("beta", encoding="utf-8")

    seen = {}

    def fake_identify(text, source_title, person, client):
        seen.setdefault("calls", []).append((source_title, text, person, type(client).__name__))
        return [
            DummyResult(
                {
                    "title": f"{source_title} incident",
                    "description": f"{source_title} description",
                    "source_text_excerpt": text,
                    "source_title": source_title,
                    "reasoning_visible": True,
                    "evidence_type": "critical_incident",
                }
            )
        ]

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(incidents_mod, "identify_incidents", fake_identify)

    runner = CliRunner()
    output_dir = tmp_path / "steve-jobs"

    result = runner.invoke(
        cli,
        [
            "identify-incidents",
            "--person",
            "Steve Jobs",
            "--source-dir",
            str(source_dir),
            "--output",
            str(output_dir),
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Scanning a.txt..." in result.output
    assert "Scanning b.txt..." in result.output
    assert "Total: 2 candidate incidents saved to" in result.output
    assert seen["calls"] == [
        ("a", "alpha", "Steve Jobs", "FakeLLMClient"),
        ("b", "beta", "Steve Jobs", "FakeLLMClient"),
    ]

    candidates_path = output_dir / "incidents" / "candidates.json"
    written = json.loads(candidates_path.read_text(encoding="utf-8"))
    assert [entry["title"] for entry in written] == ["a incident", "b incident"]


def test_reconstruct_writes_incidents(tmp_path, monkeypatch):
    candidates_path = tmp_path / "steve-jobs" / "incidents" / "candidates.json"
    candidates_path.parent.mkdir(parents=True, exist_ok=True)
    candidates_path.write_text(
        json.dumps(
            [
                {
                    "title": "Keyboard decision",
                    "description": "Jobs rethought the phone keyboard",
                    "source_text_excerpt": "Excerpt",
                    "source_title": "Biography",
                    "reasoning_visible": True,
                    "evidence_type": "critical_incident",
                },
                {
                    "title": "Store decision",
                    "description": "Jobs rejected a broader app store",
                    "source_text_excerpt": "Excerpt",
                    "source_title": "Interview",
                    "reasoning_visible": True,
                    "evidence_type": "value_conflict",
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    seen = {}

    def fake_reconstruct_incident(candidate, person, incident_id, client):
        seen.setdefault("calls", []).append((candidate.title, person, incident_id, type(client).__name__))
        return DummyResult(
            {
                "id": incident_id,
                "decision": candidate.title,
                "context": candidate.description,
                "cdm_probes": {
                    "cues_noticed": "cues",
                    "active_goals": "goals",
                    "rejected_alternatives": "alternatives",
                    "situation_framing": "framing",
                    "expected_outcome": "outcome",
                },
                "counterfactual": "counterfactual",
                "divergence_explanation": "divergence",
                "outcome": "outcome",
                "source": candidate.source_title,
            }
        )

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(cdm_probes_mod, "reconstruct_incident", fake_reconstruct_incident)

    runner = CliRunner()
    output_dir = tmp_path / "steve-jobs"

    result = runner.invoke(
        cli,
        [
            "reconstruct",
            "--person",
            "Steve Jobs",
            "--incidents-file",
            str(candidates_path),
            "--output",
            str(output_dir),
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Reconstructing [1/2]: Keyboard decision..." in result.output
    assert "Reconstructing [2/2]: Store decision..." in result.output
    assert seen["calls"] == [
        ("Keyboard decision", "Steve Jobs", "incident-001", "FakeLLMClient"),
        ("Store decision", "Steve Jobs", "incident-002", "FakeLLMClient"),
    ]

    incidents_path = output_dir / "incidents" / "incidents.json"
    written = json.loads(incidents_path.read_text(encoding="utf-8"))
    assert [entry["id"] for entry in written] == ["incident-001", "incident-002"]


def test_build_writes_framework_and_constructs(tmp_path, monkeypatch):
    framework_dir = tmp_path / "steve-jobs"
    incidents_dir = framework_dir / "incidents"
    incidents_dir.mkdir(parents=True)
    (framework_dir / "framework.json").write_text("{}", encoding="utf-8")
    (incidents_dir / "incidents.json").write_text(
        json.dumps(
            [
                {
                    "id": "incident-001",
                    "decision": "Remove keyboard",
                    "context": "Context one",
                    "cdm_probes": {
                        "cues_noticed": "cues one",
                        "active_goals": "goals one",
                        "rejected_alternatives": "alts one",
                        "situation_framing": "framing one",
                        "expected_outcome": "outcome one",
                    },
                    "counterfactual": "counterfactual one",
                    "divergence_explanation": "divergence one",
                    "outcome": "outcome one",
                    "source": "source one",
                },
                {
                    "id": "incident-002",
                    "decision": "Launch store",
                    "context": "Context two",
                    "cdm_probes": {
                        "cues_noticed": "cues two",
                        "active_goals": "goals two",
                        "rejected_alternatives": "alts two",
                        "situation_framing": "framing two",
                        "expected_outcome": "outcome two",
                    },
                    "counterfactual": "counterfactual two",
                    "divergence_explanation": "divergence two",
                    "outcome": "outcome two",
                    "source": "source two",
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    seen = {}

    def fake_map_constructs(incidents, person, client):
        seen["constructs_input"] = [incident.id for incident in incidents]
        return [
            DummyResult(
                {
                    "construct": "construct one",
                    "positive_pole": "positive one",
                    "negative_pole": "negative one",
                    "derived_from_incidents": ["incident-001"],
                    "behavioral_implication": "implication one",
                }
            ),
            DummyResult(
                {
                    "construct": "construct two",
                    "positive_pole": "positive two",
                    "negative_pole": "negative two",
                    "derived_from_incidents": ["incident-002"],
                    "behavioral_implication": "implication two",
                }
            ),
        ]

    def fake_derive_lens(constructs, incidents, person, holdout_ids, client):
        seen["lens_holdout_ids"] = holdout_ids
        seen["lens_constructs"] = [construct.to_dict()["construct"] for construct in constructs]
        return DummyLens("Jobs sees products as experiences.")

    def fake_generate_predictions(lens, constructs, person, client):
        seen["prediction_lens"] = lens.statement
        return [DummyResult({"prediction": "prediction one"}), DummyResult({"prediction": "prediction two"})]

    def fake_assemble_framework(person, domain, incidents, constructs, lens, predictions):
        seen["assemble_domain"] = domain
        seen["assemble_predictions"] = predictions
        return DummyFramework(
            {
                "person": person,
                "domain": domain,
                "incidents": incidents,
                "constructs": constructs,
                "lens": lens,
                "predictions": predictions,
            }
        )

    def fake_save_framework(framework, fw_dir):
        path = fw_dir / "framework.json"
        path.write_text(json.dumps(framework.to_dict(), indent=2), encoding="utf-8")
        return path

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(constructs_mod, "map_constructs", fake_map_constructs)
    monkeypatch.setattr(lens_mod, "derive_lens", fake_derive_lens)
    monkeypatch.setattr(divergence_mod, "generate_predictions", fake_generate_predictions)
    monkeypatch.setattr(encoding_framework_mod, "assemble_framework", fake_assemble_framework)
    monkeypatch.setattr(encoding_framework_mod, "save_framework", fake_save_framework)

    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "build",
            "--person",
            "Steve Jobs",
            "--framework-dir",
            str(framework_dir),
            "--domain",
            "Consumer technology",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Loaded 2 reconstructed incidents." in result.output
    assert "Mapping bipolar constructs..." in result.output
    assert "Deriving perceptual lens (holdout: 2 incidents)..." in result.output
    assert "Generating behavioral divergence predictions..." in result.output
    assert "Assembling framework JSON..." in result.output
    assert seen["constructs_input"] == ["incident-001", "incident-002"]
    assert seen["lens_holdout_ids"] == ["incident-001", "incident-002"]
    assert seen["prediction_lens"] == "Jobs sees products as experiences."
    assert seen["assemble_domain"] == "Consumer technology"
    assert seen["assemble_predictions"] == [{"prediction": "prediction one"}, {"prediction": "prediction two"}]

    constructs_path = framework_dir / "constructs.json"
    framework_json = framework_dir / "framework.json"
    assert constructs_path.exists()
    assert framework_json.exists()


def test_validate_full_and_floor_check(tmp_path, monkeypatch):
    framework_dir = tmp_path / "steve-jobs"
    validation_dir = framework_dir / "validation"
    incidents_dir = framework_dir / "incidents"
    validation_dir.mkdir(parents=True)
    incidents_dir.mkdir(parents=True)
    framework_path = framework_dir / "framework.json"
    framework_path.write_text(json.dumps({"person": "Steve Jobs"}), encoding="utf-8")
    (incidents_dir / "incidents.json").write_text(
        json.dumps(
            [
                {
                    "context": "Context one",
                    "decision": "Decision one",
                    "divergence_explanation": "Explanation one",
                },
                {
                    "context": "Context two",
                    "decision": "Decision two",
                    "divergence_explanation": "Explanation two",
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    seen = {}

    def fake_run_tier1(fw, person, domain, client):
        seen["tier1_domain"] = domain
        return tier1_mod.Tier1Result(
            scenario_results=[
                tier1_mod.ScenarioResult(
                    scenario="Scenario 1",
                    framework_response="Framework 1",
                    baseline_response="Baseline 1",
                    divergence_score=8,
                    specificity_score=9,
                    traceability_score=10,
                    divergent=True,
                ),
                tier1_mod.ScenarioResult(
                    scenario="Scenario 2",
                    framework_response="Framework 2",
                    baseline_response="Baseline 2",
                    divergence_score=7,
                    specificity_score=8,
                    traceability_score=9,
                    divergent=True,
                ),
                tier1_mod.ScenarioResult(
                    scenario="Scenario 3",
                    framework_response="Framework 3",
                    baseline_response="Baseline 3",
                    divergence_score=8,
                    specificity_score=8,
                    traceability_score=9,
                    divergent=True,
                ),
                tier1_mod.ScenarioResult(
                    scenario="Scenario 4",
                    framework_response="Framework 4",
                    baseline_response="Baseline 4",
                    divergence_score=8,
                    specificity_score=8,
                    traceability_score=9,
                    divergent=True,
                ),
                tier1_mod.ScenarioResult(
                    scenario="Scenario 5",
                    framework_response="Framework 5",
                    baseline_response="Baseline 5",
                    divergence_score=4,
                    specificity_score=5,
                    traceability_score=6,
                    divergent=False,
                ),
            ]
        )

    def fake_run_tier2(fw, scenarios, client):
        seen["tier2_scenarios"] = scenarios
        return tier2_mod.Tier2Result(
            traceability_ratio=0.9,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[{"scenario": item["scenario"]} for item in scenarios],
        )

    def fake_prepare_tier3_materials(tier1_result, person, output_dir):
        seen["tier3_person"] = person
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / "review_packet.md"
        path.write_text("review packet", encoding="utf-8")
        return path

    def fake_run_floor_check(fw, historical, client):
        seen["floor_check_historical"] = historical
        return floor_check_mod.FloorCheckResult(
            alignment_ratio=0.75,
            per_decision_results=[{"decision": item["options"]} for item in historical],
        )

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(tier1_mod, "run_tier1", fake_run_tier1)
    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(tier2_mod, "run_tier2", fake_run_tier2)
    monkeypatch.setattr(tier3_prep_mod, "prepare_tier3_materials", fake_prepare_tier3_materials)
    monkeypatch.setattr(floor_check_mod, "run_floor_check", fake_run_floor_check)

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
            "Consumer technology",
            "--mode",
            "full",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Running Tier 1: Baseline Differentiation..." in result.output
    assert "Running Tier 2: Internal Consistency..." in result.output
    assert "Preparing Tier 3 materials for expert review..." in result.output
    assert "Review packet saved to" in result.output
    assert seen["tier1_domain"] == "Consumer technology"
    assert seen["tier2_scenarios"] == [
        {"scenario": "Scenario 1", "framework_response": "Framework 1"},
        {"scenario": "Scenario 2", "framework_response": "Framework 2"},
        {"scenario": "Scenario 3", "framework_response": "Framework 3"},
        {"scenario": "Scenario 4", "framework_response": "Framework 4"},
        {"scenario": "Scenario 5", "framework_response": "Framework 5"},
    ]
    assert seen["tier3_person"] == "Steve Jobs"

    tier1_results_path = validation_dir / "tier1_results.json"
    tier2_results_path = validation_dir / "tier2_results.json"
    assert tier1_results_path.exists()
    assert tier2_results_path.exists()

    floor_result = runner.invoke(
        cli,
        [
            "validate",
            "--framework",
            str(framework_path),
            "--person",
            "Steve Jobs",
            "--domain",
            "Consumer technology",
            "--mode",
            "floor-check",
        ],
    )

    assert floor_result.exit_code == 0, floor_result.output
    assert "Running floor check: historical alignment..." in floor_result.output
    assert "Floor check: PASSED (alignment: 75%)" in floor_result.output
    assert seen["floor_check_historical"] == [
        {
            "context": "Context one",
            "options": "Decision: Decision one",
            "actual_reasoning": "Explanation one",
        },
        {
            "context": "Context two",
            "options": "Decision: Decision two",
            "actual_reasoning": "Explanation two",
        },
    ]


def test_validate_tier2_short_circuits_without_tier1_results(tmp_path, monkeypatch):
    framework_dir = tmp_path / "steve-jobs"
    framework_dir.mkdir()
    framework_path = framework_dir / "framework.json"
    framework_path.write_text(json.dumps({"person": "Steve Jobs"}), encoding="utf-8")

    called = {"tier2": False}

    def fake_run_tier2(fw, scenarios, client):
        called["tier2"] = True
        return tier2_mod.Tier2Result(
            traceability_ratio=0.0,
            lens_consistent=False,
            contradictions=[],
            per_scenario_details=[],
        )

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(tier2_mod, "run_tier2", fake_run_tier2)

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
            "Consumer technology",
            "--mode",
            "tier2",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Tier 1 results not found. Run tier1 first." in result.output
    assert called["tier2"] is False


def test_validate_floor_check_without_incidents(tmp_path, monkeypatch):
    framework_dir = tmp_path / "steve-jobs"
    framework_dir.mkdir()
    framework_path = framework_dir / "framework.json"
    framework_path.write_text(json.dumps({"person": "Steve Jobs"}), encoding="utf-8")

    called = {"floor_check": False}

    def fake_run_floor_check(fw, historical, client):
        called["floor_check"] = True
        raise AssertionError("floor check should not run when incidents are missing")

    monkeypatch.setattr("framework_forge.llm.LLMClient", FakeLLMClient)
    monkeypatch.setattr(floor_check_mod, "run_floor_check", fake_run_floor_check)

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
            "Consumer technology",
            "--mode",
            "floor-check",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Running floor check: historical alignment..." in result.output
    assert "No incidents found for floor check." in result.output
    assert called["floor_check"] is False


def test_cli_main_entrypoint_runs_help(monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["framework_forge.cli", "--help"])

    with pytest.raises(SystemExit) as excinfo:
        runpy.run_module("framework_forge.cli", run_name="__main__")

    assert excinfo.value.code == 0
    captured = capsys.readouterr()
    assert "Framework Forge: Extract thinking frameworks from historical figures." in captured.out
