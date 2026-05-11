"""Tests for the Framework Forge CLI wrappers."""

from __future__ import annotations

import json
import runpy
from pathlib import Path

from click.testing import CliRunner

from framework_forge.cli import cli
from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
from framework_forge.validation.tier2 import Tier2Result


def _patch_llm(monkeypatch):
    class DummyLLMClient:
        pass

    monkeypatch.setattr("framework_forge.llm.LLMClient", DummyLLMClient)


def test_discover_sources_command_writes_ranked_bibliography(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)

    source_entry = type(
        "SourceEntryLike",
        (),
        {"source_type": "scholarly_analysis", "title": "Source A", "to_dict": lambda self: {"title": "Source A"}},
    )()
    monkeypatch.setattr("framework_forge.sources.discover_sources", lambda person, client=None: [source_entry])
    monkeypatch.setattr("framework_forge.sources.triage_sources", lambda entries: list(entries))

    output_dir = tmp_path / "steve-jobs"
    result = CliRunner().invoke(
        cli,
        ["discover-sources", "--person", "Steve Jobs", "--output", str(output_dir)],
    )

    assert result.exit_code == 0, result.output
    bibliography = json.loads((output_dir / "sources" / "bibliography.json").read_text(encoding="utf-8"))
    assert bibliography == [{"title": "Source A"}]


def test_identify_incidents_command_writes_candidates(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    source_dir = tmp_path / "sources" / "texts"
    source_dir.mkdir(parents=True)
    (source_dir / "alpha.txt").write_text("Alpha source text", encoding="utf-8")
    (source_dir / "beta.txt").write_text("Beta source text", encoding="utf-8")

    monkeypatch.setattr(
        "framework_forge.extraction.incidents.identify_incidents",
        lambda text, source_title, person, client=None: [
            type(
                "Candidate",
                (),
                {"to_dict": lambda self: {"title": f"{source_title}-incident"}},
            )()
        ],
    )

    output_dir = tmp_path / "steve-jobs"
    result = CliRunner().invoke(
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
    candidates = json.loads((output_dir / "incidents" / "candidates.json").read_text(encoding="utf-8"))
    assert [item["title"] for item in candidates] == ["alpha-incident", "beta-incident"]


def test_reconstruct_command_writes_incidents(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    candidates_path = tmp_path / "steve-jobs" / "incidents" / "candidates.json"
    candidates_path.parent.mkdir(parents=True, exist_ok=True)
    candidates_path.write_text(
        json.dumps(
            [
                {
                    "title": "First incident",
                    "description": "First description",
                    "source_text_excerpt": "excerpt 1",
                    "source_title": "Source 1",
                    "reasoning_visible": True,
                    "evidence_type": "critical_incident",
                }
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "framework_forge.extraction.cdm_probes.reconstruct_incident",
        lambda candidate, person, incident_id, client=None: type(
            "Incident",
            (),
            {"to_dict": lambda self: {"id": incident_id, "source": candidate.source_title}},
        )(),
    )

    output_dir = tmp_path / "steve-jobs"
    result = CliRunner().invoke(
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
    incidents = json.loads((output_dir / "incidents" / "incidents.json").read_text(encoding="utf-8"))
    assert incidents == [{"id": "incident-001", "source": "Source 1"}]


def test_build_command_writes_framework(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    incidents_path = tmp_path / "steve-jobs" / "incidents" / "incidents.json"
    incidents_path.parent.mkdir(parents=True, exist_ok=True)
    incidents_path.write_text(
        json.dumps(
            [
                {
                    "id": f"incident-00{i}",
                    "decision": f"Decision {i}",
                    "context": f"Context {i}",
                    "cdm_probes": {
                        "cues_noticed": "noticed",
                        "active_goals": "goals",
                        "rejected_alternatives": "alternatives",
                        "situation_framing": "framing",
                        "expected_outcome": "outcome",
                    },
                    "counterfactual": "counterfactual",
                    "divergence_explanation": f"Divergence {i}",
                    "outcome": "outcome",
                    "source": "Source",
                }
                for i in range(1, 6)
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    observed = {}

    class FakeConstruct:
        def to_dict(self):
            return {"construct": "construct-1"}

    class FakeLens:
        statement = "lens"

        def to_dict(self):
            return {"statement": self.statement}

    class FakePrediction:
        def to_dict(self):
            return {"situation_type": "situation"}

    def fake_map_constructs(incidents, person, client=None):
        observed["construct_person"] = person
        return [FakeConstruct()]

    def fake_derive_lens(constructs, incidents, person, holdout_ids, client=None):
        observed["holdout_ids"] = holdout_ids
        return FakeLens()

    def fake_generate_predictions(lens, constructs, person, client=None):
        observed["prediction_person"] = person
        return [FakePrediction()]

    monkeypatch.setattr("framework_forge.extraction.constructs.map_constructs", fake_map_constructs)
    monkeypatch.setattr("framework_forge.extraction.lens.derive_lens", fake_derive_lens)
    monkeypatch.setattr("framework_forge.extraction.divergence.generate_predictions", fake_generate_predictions)

    def fake_assemble_framework(**kwargs):
        observed["assemble_kwargs"] = kwargs
        return {
            "meta": {"person": kwargs["person"], "domain": kwargs["domain"]},
            "perceptual_lens": kwargs["lens"],
            "bipolar_constructs": kwargs["constructs"],
            "critical_incident_database": kwargs["incidents"],
            "behavioral_divergence_predictions": kwargs["predictions"],
        }

    monkeypatch.setattr("framework_forge.encoding.framework.assemble_framework", fake_assemble_framework)

    def fake_save_framework(framework, output_dir):
        path = output_dir / "framework.json"
        path.write_text(json.dumps(framework, indent=2), encoding="utf-8")
        return path

    monkeypatch.setattr("framework_forge.encoding.framework.save_framework", fake_save_framework)

    output_dir = tmp_path / "steve-jobs"
    result = CliRunner().invoke(
        cli,
        ["build", "--person", "Steve Jobs", "--framework-dir", str(output_dir), "--domain", "consumer technology"],
    )

    assert result.exit_code == 0, result.output
    assert observed["holdout_ids"] == ["incident-004", "incident-005"]
    assert observed["assemble_kwargs"]["domain"] == "consumer technology"
    assert json.loads((output_dir / "framework.json").read_text(encoding="utf-8"))["meta"]["person"] == "Steve Jobs"


def test_validate_command_preserves_baseline_response_and_keyword_calls(tmp_path, monkeypatch):
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}), encoding="utf-8")

    tier1_result = Tier1Result(
        scenario_results=[
            ScenarioResult(
                scenario="Scenario 1",
                framework_response="Framework response",
                baseline_response="Baseline response",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            )
        ]
    )
    tier2_result = Tier2Result(
        traceability_ratio=0.9,
        lens_consistent=True,
        contradictions=[],
        per_scenario_details=[],
    )

    captured = {}

    _patch_llm(monkeypatch)
    monkeypatch.setattr("framework_forge.validation.tier1.run_tier1", lambda *args, **kwargs: tier1_result)

    def fake_run_tier2(framework, tier1_scenarios, client=None):
        captured["tier1_scenarios"] = tier1_scenarios
        return tier2_result

    def fake_prepare_tier3_materials(**kwargs):
        captured["tier3_kwargs"] = kwargs
        output_dir = kwargs["output_dir"]
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / "review_packet.json"
        path.write_text(json.dumps({"person": kwargs["person"]}, indent=2), encoding="utf-8")
        return path

    monkeypatch.setattr("framework_forge.validation.tier2.run_tier2", fake_run_tier2)
    monkeypatch.setattr("framework_forge.validation.tier3_prep.prepare_tier3_materials", fake_prepare_tier3_materials)

    result = CliRunner().invoke(
        cli,
        [
            "validate",
            "--framework",
            str(framework_path),
            "--person",
            "Steve Jobs",
            "--domain",
            "consumer technology",
            "--mode",
            "full",
        ],
    )

    assert result.exit_code == 0, result.output
    assert captured["tier1_scenarios"] == [
        {
            "scenario": "Scenario 1",
            "framework_response": "Framework response",
            "baseline_response": "Baseline response",
        }
    ]
    assert captured["tier3_kwargs"]["person"] == "Steve Jobs"
    assert captured["tier3_kwargs"]["tier1_results"] == tier1_result
    assert captured["tier3_kwargs"]["output_dir"] == framework_path.parent / "validation" / "tier3_materials"

    tier1_results = json.loads((framework_path.parent / "validation" / "tier1_results.json").read_text(encoding="utf-8"))
    assert tier1_results["scenario_results"][0]["baseline_response"] == "Baseline response"


def test_validate_command_floor_check_uses_historical_decisions(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}), encoding="utf-8")
    incidents_path = framework_path.parent / "incidents" / "incidents.json"
    incidents_path.parent.mkdir(parents=True, exist_ok=True)
    incidents_path.write_text(
        json.dumps(
            [
                {
                    "context": "Context 1",
                    "decision": "Decision 1",
                    "divergence_explanation": "Why",
                }
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    captured = {}

    def fake_run_floor_check(framework, historical, client=None):
        captured["historical"] = historical

        class Result:
            passed = True
            alignment_ratio = 1.0

        return Result()

    monkeypatch.setattr("framework_forge.validation.floor_check.run_floor_check", fake_run_floor_check)

    result = CliRunner().invoke(
        cli,
        [
            "validate",
            "--framework",
            str(framework_path),
            "--person",
            "Steve Jobs",
            "--domain",
            "consumer technology",
            "--mode",
            "floor-check",
        ],
    )

    assert result.exit_code == 0, result.output
    assert captured["historical"] == [
        {
            "context": "Context 1",
            "options": "Decision: Decision 1",
            "actual_reasoning": "Why",
        }
    ]


def test_validate_command_tier2_returns_when_tier1_results_are_missing(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}), encoding="utf-8")

    result = CliRunner().invoke(
        cli,
        [
            "validate",
            "--framework",
            str(framework_path),
            "--person",
            "Steve Jobs",
            "--domain",
            "consumer technology",
            "--mode",
            "tier2",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Tier 1 results not found. Run tier1 first." in result.output
    assert not (framework_path.parent / "validation" / "tier2_results.json").exists()


def test_validate_command_floor_check_returns_when_incidents_are_missing(tmp_path, monkeypatch):
    _patch_llm(monkeypatch)
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}), encoding="utf-8")

    result = CliRunner().invoke(
        cli,
        [
            "validate",
            "--framework",
            str(framework_path),
            "--person",
            "Steve Jobs",
            "--domain",
            "consumer technology",
            "--mode",
            "floor-check",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "No incidents found for floor check." in result.output


def test_cli_module_entrypoint_invokes_group(monkeypatch):
    invoked = {}

    def fake_group_call(self, *args, **kwargs):
        invoked["called"] = True
        return None

    monkeypatch.setattr("click.core.Group.__call__", fake_group_call)

    cli_path = Path(__file__).resolve().parents[1] / "framework_forge" / "cli.py"
    runpy.run_path(str(cli_path), run_name="__main__")

    assert invoked["called"] is True
