"""Regression tests for the Framework Forge runbook workflow."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import framework_forge.pipeline as pipeline


REPO_ROOT = Path(__file__).resolve().parents[1]
RUNBOOK_PATH = REPO_ROOT / "docs" / "plans" / "2026-04-01-phase1-framework-forge.md"


def test_runbook_documents_the_executable_pipeline_steps() -> None:
    """The phase-1 runbook should keep the documented pipeline commands stable."""
    runbook = RUNBOOK_PATH.read_text(encoding="utf-8")

    expected_snippets = [
        "python -m framework_forge.cli discover-sources",
        "python -m framework_forge.cli identify-incidents",
        "python -m framework_forge.cli reconstruct",
        "python -m framework_forge.cli build",
        "python -m framework_forge.cli validate",
        "--mode tier1",
        "--mode tier2",
        "--mode full",
        "frameworks/steve-jobs/framework.json",
        "frameworks/steve-jobs/validation/tier3_materials/review_packet.json",
    ]

    for snippet in expected_snippets:
        assert snippet in runbook

    parser = pipeline.build_parser()
    option_dests = {
        action.dest for action in parser._actions if action.option_strings
    }
    assert {
        "person",
        "domain",
        "output",
        "source_text_dir",
        "historical_decisions_file",
    }.issubset(option_dests)


def test_runbook_pipeline_flow_executes_all_stages(tmp_path, monkeypatch) -> None:
    """The staged pipeline should still produce the artifacts described in the runbook."""
    output_dir = tmp_path / "frameworks" / "steve-jobs"
    historical_decisions = [{"decision": "Decision 1", "context": "Context 1"}]
    call_order: list[str] = []

    def fake_run_source_discovery(person: str, out_dir: Path) -> Path:
        call_order.append("discover")
        bibliography_path = out_dir / "sources" / "bibliography.json"
        bibliography_path.parent.mkdir(parents=True, exist_ok=True)
        bibliography_path.write_text(
            json.dumps(
                [
                    {
                        "title": "Source A",
                        "url": "offline",
                        "source_type": "critical_incident",
                        "description": "Source A",
                        "evidence_layers": ["layer3"],
                        "fetched": False,
                        "text_path": None,
                    }
                ],
                indent=2,
            ),
            encoding="utf-8",
        )
        return bibliography_path

    def fake_materialize_source_texts(bibliography_path: Path, source_text_dir: Path) -> list[Path]:
        call_order.append("materialize")
        source_text_dir.mkdir(parents=True, exist_ok=True)
        text_path = source_text_dir / "01-source-a.txt"
        text_path.write_text("Source text for the runbook regression test.", encoding="utf-8")
        return [text_path]

    def fake_run_incident_identification(
        person: str,
        source_text_dir: Path,
        output_dir: Path,
    ) -> Path:
        call_order.append("identify")
        assert person == "Steve Jobs"
        assert sorted(p.name for p in source_text_dir.glob("*.txt")) == ["01-source-a.txt"]
        candidates_path = output_dir / "incidents" / "candidates.json"
        candidates_path.parent.mkdir(parents=True, exist_ok=True)
        candidates_path.write_text(
            json.dumps(
                [
                    {
                        "title": "Candidate 1",
                        "description": "Candidate 1 description",
                        "source_text_excerpt": "excerpt",
                        "source_title": "Source A",
                        "reasoning_visible": True,
                        "evidence_type": "critical_incident",
                    }
                ],
                indent=2,
            ),
            encoding="utf-8",
        )
        return candidates_path

    def fake_run_incident_reconstruction(
        person: str,
        candidates_path: Path,
        output_dir: Path,
    ) -> Path:
        call_order.append("reconstruct")
        raw_candidates = json.loads(candidates_path.read_text(encoding="utf-8"))
        assert raw_candidates[0]["title"] == "Candidate 1"
        incidents_path = output_dir / "incidents" / "incidents.json"
        incidents_path.parent.mkdir(parents=True, exist_ok=True)
        incidents_path.write_text(
            json.dumps(
                [
                    {
                        "id": "incident-001",
                        "decision": "Decision 1",
                        "context": "Context 1",
                        "cdm_probes": {
                            "cues_noticed": "noticed",
                            "active_goals": "goals",
                            "rejected_alternatives": "alternatives",
                            "situation_framing": "framing",
                            "expected_outcome": "outcome",
                        },
                        "counterfactual": "counterfactual",
                        "divergence_explanation": "divergence",
                        "outcome": "outcome",
                        "source": "Source A",
                    }
                ],
                indent=2,
            ),
            encoding="utf-8",
        )
        return incidents_path

    def fake_run_framework_build(
        person: str,
        domain: str,
        incidents_path: Path,
        output_dir: Path,
    ):
        call_order.append("build")
        assert person == "Steve Jobs"
        assert domain == "consumer technology"
        assert json.loads(incidents_path.read_text(encoding="utf-8"))[0]["id"] == "incident-001"

        constructs_path = output_dir / "constructs.json"
        constructs_path.write_text(
            json.dumps([{"construct": "construct-1"}], indent=2),
            encoding="utf-8",
        )

        framework_path = output_dir / "framework.json"
        framework_path.write_text(
            json.dumps(
                {
                    "meta": {"person": person, "domain": domain},
                    "perceptual_lens": {"statement": "lens"},
                    "bipolar_constructs": [{"construct": "construct-1"}],
                    "critical_incident_database": [],
                    "behavioral_divergence_predictions": [],
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        return constructs_path, framework_path

    def fake_run_framework_validation(
        person: str,
        domain: str,
        framework_path: Path,
        output_dir: Path,
        historical_decisions=None,
    ):
        call_order.append("validate")
        assert person == "Steve Jobs"
        assert domain == "consumer technology"
        assert historical_decisions == [
            {"decision": "Decision 1", "context": "Context 1"}
        ]
        assert json.loads(framework_path.read_text(encoding="utf-8"))["meta"]["person"] == "Steve Jobs"

        validation_dir = output_dir / "validation"
        tier1_path = validation_dir / "tier1_results.json"
        tier2_path = validation_dir / "tier2_results.json"
        tier3_path = validation_dir / "tier3_materials" / "review_packet.json"
        floor_path = validation_dir / "floor-check_results.json"

        tier1_path.parent.mkdir(parents=True, exist_ok=True)
        tier1_path.write_text(
            json.dumps(
                {
                    "divergent_count": 1,
                    "total_scenarios": 1,
                    "passed": False,
                    "scenario_results": [],
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        tier2_path.write_text(
            json.dumps(
                {
                    "traceability_ratio": 1.0,
                    "lens_consistent": True,
                    "contradictions": [],
                    "per_scenario_details": [],
                    "passed": True,
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        tier3_path.parent.mkdir(parents=True, exist_ok=True)
        tier3_path.write_text(json.dumps({"person": person, "pairs": []}, indent=2), encoding="utf-8")
        floor_path.write_text(
            json.dumps(
                {"alignment_ratio": 1.0, "per_decision_results": [], "passed": True},
                indent=2,
            ),
            encoding="utf-8",
        )
        return tier1_path, tier2_path, tier3_path, floor_path

    monkeypatch.setattr(pipeline, "run_source_discovery", fake_run_source_discovery)
    monkeypatch.setattr(pipeline, "materialize_source_texts", fake_materialize_source_texts)
    monkeypatch.setattr(pipeline, "run_incident_identification", fake_run_incident_identification)
    monkeypatch.setattr(pipeline, "run_incident_reconstruction", fake_run_incident_reconstruction)
    monkeypatch.setattr(pipeline, "run_framework_build", fake_run_framework_build)
    monkeypatch.setattr(pipeline, "run_framework_validation", fake_run_framework_validation)

    result = pipeline.run_pipeline(
        person="Steve Jobs",
        domain="consumer technology",
        output_dir=output_dir,
        historical_decisions=historical_decisions,
    )

    assert call_order == [
        "discover",
        "materialize",
        "identify",
        "reconstruct",
        "build",
        "validate",
    ]
    assert result.output_dir == output_dir
    assert result.source_text_dir == output_dir / "sources" / "texts"
    assert result.bibliography_path == output_dir / "sources" / "bibliography.json"
    assert result.candidates_path == output_dir / "incidents" / "candidates.json"
    assert result.incidents_path == output_dir / "incidents" / "incidents.json"
    assert result.constructs_path == output_dir / "constructs.json"
    assert result.framework_path == output_dir / "framework.json"
    assert result.tier1_results_path == output_dir / "validation" / "tier1_results.json"
    assert result.tier2_results_path == output_dir / "validation" / "tier2_results.json"
    assert result.tier3_review_packet_path == (
        output_dir / "validation" / "tier3_materials" / "review_packet.json"
    )
    assert result.floor_check_results_path == (
        output_dir / "validation" / "floor-check_results.json"
    )
    assert result.framework_path.exists()
    assert result.tier3_review_packet_path.exists()
