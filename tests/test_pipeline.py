"""Tests for the reusable Framework Forge pipeline runner."""

from __future__ import annotations

import json
import warnings
from pathlib import Path

import pytest

from framework_forge.config import (
    FLOOR_CHECK_MIN_ALIGNMENT,
    TIER1_MIN_DIVERGENT_SCENARIOS,
    TIER2_MIN_TRACEABILITY,
)
from framework_forge.extraction.cdm_probes import CDMProbes, ReconstructedIncident
from framework_forge.extraction.incidents import CandidateIncident
from framework_forge.pipeline import (
    PipelineResult,
    main,
    materialize_source_texts,
    resolve_output_dir,
    run_framework_build,
    run_framework_validation,
    run_incident_identification,
    run_incident_reconstruction,
    run_pipeline,
    run_source_discovery,
)
from framework_forge.sources.fetcher import FetchError
from framework_forge.sources.triage import SourceEntry
from framework_forge.validation.floor_check import FloorCheckResult
from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
from framework_forge.validation.tier2 import Tier2Result


def test_run_source_discovery_writes_ranked_bibliography(tmp_path, monkeypatch):
    sources = [
        SourceEntry(
            title="Source B",
            url="https://example.com/b",
            source_type="scholarly_analysis",
            description="B",
            evidence_layers=["layer2"],
        ),
        SourceEntry(
            title="Source A",
            url="https://example.com/a",
            source_type="critical_incident",
            description="A",
            evidence_layers=["layer3"],
        ),
    ]

    monkeypatch.setattr("framework_forge.pipeline.discover_framework_sources", lambda person: list(sources))
    monkeypatch.setattr("framework_forge.pipeline.triage_sources", lambda entries: list(reversed(entries)))

    bibliography_path = run_source_discovery("Steve Jobs", tmp_path / "steve-jobs")

    assert bibliography_path == tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    written = json.loads(bibliography_path.read_text(encoding="utf-8"))
    assert [item["title"] for item in written] == ["Source A", "Source B"]


def test_run_source_discovery_reuses_existing_bibliography(tmp_path, monkeypatch):
    """If bibliography.json already exists, return it without calling the LLM."""
    output_dir = tmp_path / "steve-jobs"
    bibliography_path = output_dir / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(json.dumps([{"title": "Cached"}]), encoding="utf-8")

    discover_calls: list[str] = []
    monkeypatch.setattr(
        "framework_forge.pipeline.discover_framework_sources",
        lambda person: discover_calls.append(person) or [],
    )

    result = run_source_discovery("Steve Jobs", output_dir)

    assert result == bibliography_path
    assert discover_calls == [], "LLM discovery must not be called when bibliography already exists"


def test_run_source_discovery_force_reruns_discovery(tmp_path, monkeypatch):
    """force=True must re-run discovery even when bibliography.json exists."""
    output_dir = tmp_path / "steve-jobs"
    bibliography_path = output_dir / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(json.dumps([{"title": "Stale"}]), encoding="utf-8")

    fresh_source = SourceEntry(
        title="Fresh Source",
        url="https://example.com",
        source_type="critical_incident",
        description="fresh",
        evidence_layers=["layer2"],
    )
    monkeypatch.setattr(
        "framework_forge.pipeline.discover_framework_sources",
        lambda person: [fresh_source],
    )
    monkeypatch.setattr(
        "framework_forge.pipeline.triage_sources",
        lambda entries: entries,
    )

    result = run_source_discovery("Steve Jobs", output_dir, force=True)

    assert result == bibliography_path
    written = json.loads(bibliography_path.read_text(encoding="utf-8"))
    assert written[0]["title"] == "Fresh Source"


def test_materialize_source_texts_warns_on_fetch_error_and_continues(tmp_path, monkeypatch):
    """A FetchError for one source must emit a warning but not crash the pipeline."""
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Source Good",
                    "url": "https://example.com/good",
                    "source_type": "critical_incident",
                    "description": "Good source",
                    "evidence_layers": ["layer2"],
                    "fetched": False,
                    "text_path": None,
                },
                {
                    "title": "Source Bad",
                    "url": "https://example.com/bad",
                    "source_type": "value_conflict",
                    "description": "Bad source",
                    "evidence_layers": ["layer3"],
                    "fetched": False,
                    "text_path": None,
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    source_text_dir = tmp_path / "steve-jobs" / "sources" / "texts"

    def fake_fetch(url: str, output_path: Path, timeout: float = 30.0):
        if "bad" in url:
            raise FetchError(f"Connection refused for {url!r}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(f"Content from {url}", encoding="utf-8")
        return output_path.read_text(encoding="utf-8")

    monkeypatch.setattr("framework_forge.pipeline.fetch_source", fake_fetch)

    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        text_files = materialize_source_texts(bibliography_path, source_text_dir)

    assert len(text_files) == 1
    assert text_files[0].name == "01-source-good.txt"
    assert len(caught) == 1
    assert "Source Bad" in str(caught[0].message)


def test_materialize_source_texts_all_fetch_error_raises_file_not_found(tmp_path, monkeypatch):
    """If every fetchable source fails, FileNotFoundError must still be raised."""
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Bad Source",
                    "url": "https://example.com/bad",
                    "source_type": "critical_incident",
                    "description": "Bad",
                    "evidence_layers": ["layer2"],
                    "fetched": False,
                    "text_path": None,
                }
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "framework_forge.pipeline.fetch_source",
        lambda url, output_path, timeout=30.0: (_ for _ in ()).throw(FetchError("network error")),
    )

    with warnings.catch_warnings(record=True):
        warnings.simplefilter("always")
        with pytest.raises(FileNotFoundError, match="fetchable URLs"):
            materialize_source_texts(
                bibliography_path, tmp_path / "steve-jobs" / "sources" / "texts"
            )


def test_run_incident_identification_collects_all_text_files(tmp_path, monkeypatch):
    source_text_dir = tmp_path / "sources" / "texts"
    source_text_dir.mkdir(parents=True)
    (source_text_dir / "alpha.txt").write_text("Alpha source text", encoding="utf-8")
    (source_text_dir / "beta.txt").write_text("Beta source text", encoding="utf-8")

    calls: list[tuple[str, str, str]] = []

    def fake_identify_incidents(*, source_text: str, source_title: str, person: str):
        calls.append((source_title, source_text, person))
        return [
            CandidateIncident(
                title=f"{source_title}-incident",
                description=f"{source_title} description",
                source_text_excerpt=source_text[:12],
                source_title=source_title,
                reasoning_visible=True,
                evidence_type="critical_incident",
            )
        ]

    monkeypatch.setattr("framework_forge.pipeline.identify_incidents", fake_identify_incidents)

    candidates_path = run_incident_identification("Steve Jobs", source_text_dir, tmp_path / "steve-jobs")

    assert candidates_path == tmp_path / "steve-jobs" / "incidents" / "candidates.json"
    assert calls == [
        ("alpha", "Alpha source text", "Steve Jobs"),
        ("beta", "Beta source text", "Steve Jobs"),
    ]

    written = json.loads(candidates_path.read_text(encoding="utf-8"))
    assert [item["title"] for item in written] == ["alpha-incident", "beta-incident"]


def test_run_incident_identification_requires_source_text_files(tmp_path):
    source_text_dir = tmp_path / "sources" / "texts"
    source_text_dir.mkdir(parents=True)

    with pytest.raises(FileNotFoundError, match="No source text files found"):
        run_incident_identification("Steve Jobs", source_text_dir, tmp_path / "steve-jobs")


def test_materialize_source_texts_fetches_missing_sources_and_reuses_existing_files(
    tmp_path, monkeypatch
):
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Source A",
                    "url": "https://example.com/a",
                    "source_type": "critical_incident",
                    "description": "A",
                    "evidence_layers": ["layer2"],
                    "fetched": False,
                    "text_path": None,
                },
                {
                    "title": "Source B",
                    "url": "https://example.com/b",
                    "source_type": "value_conflict",
                    "description": "B",
                    "evidence_layers": ["layer3"],
                    "fetched": False,
                    "text_path": None,
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    source_text_dir = tmp_path / "steve-jobs" / "sources" / "texts"
    source_text_dir.mkdir(parents=True)
    existing_path = source_text_dir / "01-source-a.txt"
    existing_path.write_text("Existing source A", encoding="utf-8")

    fetched: list[tuple[str, Path]] = []

    def fake_fetch_source(url: str, output_path: Path, timeout: float = 30.0):
        fetched.append((url, output_path))
        output_path.write_text(f"Fetched {url}", encoding="utf-8")
        return output_path.read_text(encoding="utf-8")

    monkeypatch.setattr("framework_forge.pipeline.fetch_source", fake_fetch_source)

    text_files = materialize_source_texts(bibliography_path, source_text_dir)

    assert fetched == [("https://example.com/b", source_text_dir / "02-source-b.txt")]
    assert text_files == [
        source_text_dir / "01-source-a.txt",
        source_text_dir / "02-source-b.txt",
    ]
    assert existing_path.read_text(encoding="utf-8") == "Existing source A"


def test_materialize_source_texts_requires_fetchable_sources(tmp_path):
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Offline Source",
                    "url": "offline",
                    "source_type": "secondary_reporting",
                    "description": "Offline",
                    "evidence_layers": ["layer1"],
                    "fetched": False,
                    "text_path": None,
                }
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    with pytest.raises(FileNotFoundError, match="fetchable URLs"):
        materialize_source_texts(bibliography_path, tmp_path / "steve-jobs" / "sources" / "texts")


def test_materialize_source_texts_warns_on_offline_and_empty_urls(tmp_path):
    """Offline or empty URL sources must emit a warning with a skip reason."""
    bibliography_path = tmp_path / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    source_text_dir = tmp_path / "steve-jobs" / "sources" / "texts"
    # Pre-create a text file so the directory check won't raise FileNotFoundError
    source_text_dir.mkdir(parents=True, exist_ok=True)
    (source_text_dir / "00-preexisting.txt").write_text("preexisting", encoding="utf-8")

    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Offline Book",
                    "url": "offline",
                    "source_type": "firsthand_biography",
                    "description": "A physical book",
                    "evidence_layers": ["layer2"],
                    "fetched": False,
                    "text_path": None,
                },
                {
                    "title": "No URL Source",
                    "url": "",
                    "source_type": "private_writing",
                    "description": "No URL available",
                    "evidence_layers": ["layer1"],
                    "fetched": False,
                    "text_path": None,
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        materialize_source_texts(bibliography_path, source_text_dir)

    assert len(caught) == 2
    messages = [str(w.message) for w in caught]
    assert any("Offline Book" in m and "offline" in m for m in messages)
    assert any("No URL Source" in m for m in messages)


def test_run_incident_reconstruction_preserves_order_and_ids(tmp_path, monkeypatch):
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
                },
                {
                    "title": "Second incident",
                    "description": "Second description",
                    "source_text_excerpt": "excerpt 2",
                    "source_title": "Source 2",
                    "reasoning_visible": True,
                    "evidence_type": "value_conflict",
                },
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    seen_ids: list[str] = []

    def fake_reconstruct_incident(*, candidate, person, incident_id):
        seen_ids.append(incident_id)
        payload = {
            "id": incident_id,
            "decision": candidate.title,
            "context": candidate.description,
            "cdm_probes": CDMProbes(
                cues_noticed="noticed",
                active_goals="goals",
                rejected_alternatives="alternatives",
                situation_framing="framing",
                expected_outcome="outcome",
            ),
            "counterfactual": "counterfactual",
            "divergence_explanation": "divergence",
            "outcome": "outcome",
            "source": candidate.source_title,
        }
        return ReconstructedIncident(**payload)

    monkeypatch.setattr("framework_forge.pipeline.reconstruct_incident", fake_reconstruct_incident)

    incidents_path = run_incident_reconstruction("Steve Jobs", candidates_path, tmp_path / "steve-jobs")

    assert incidents_path == tmp_path / "steve-jobs" / "incidents" / "incidents.json"
    assert seen_ids == ["incident-001", "incident-002"]

    written = json.loads(incidents_path.read_text(encoding="utf-8"))
    assert [item["id"] for item in written] == ["incident-001", "incident-002"]


def test_run_framework_build_uses_tail_holdout_and_persists_outputs(tmp_path, monkeypatch):
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
        def to_dict(self):
            return {"statement": "lens"}

    class FakePrediction:
        def to_dict(self):
            return {"situation_type": "situation"}

    def fake_map_constructs(incidents, person, client=None):
        observed["map_constructs_incident_ids"] = [incident.id for incident in incidents]
        observed["map_constructs_person"] = person
        return [FakeConstruct()]

    def fake_derive_lens(constructs, incidents, person, holdout_ids, client=None):
        observed["derive_lens_holdout_ids"] = holdout_ids
        observed["derive_lens_person"] = person
        observed["derive_lens_construct_count"] = len(constructs)
        observed["derive_lens_incident_ids"] = [incident.id for incident in incidents]
        return FakeLens()

    def fake_generate_predictions(lens, constructs, person, client=None):
        observed["generate_predictions_person"] = person
        observed["generate_predictions_lens"] = lens.to_dict()
        return [FakePrediction()]

    def fake_assemble_framework(**kwargs):
        observed["assemble_framework_kwargs"] = kwargs
        return {
            "meta": {"person": kwargs["person"], "domain": kwargs["domain"]},
            "perceptual_lens": kwargs["lens"],
            "bipolar_constructs": kwargs["constructs"],
            "critical_incident_database": kwargs["incidents"],
            "behavioral_divergence_predictions": kwargs["predictions"],
        }

    def fake_save_framework(framework, output_dir):
        path = output_dir / "framework.json"
        path.write_text(json.dumps(framework, indent=2), encoding="utf-8")
        return path

    monkeypatch.setattr("framework_forge.pipeline.map_constructs", fake_map_constructs)
    monkeypatch.setattr("framework_forge.pipeline.derive_lens", fake_derive_lens)
    monkeypatch.setattr("framework_forge.pipeline.generate_predictions", fake_generate_predictions)
    monkeypatch.setattr("framework_forge.pipeline.assemble_framework", fake_assemble_framework)
    monkeypatch.setattr("framework_forge.pipeline.save_framework", fake_save_framework)

    constructs_path, framework_path = run_framework_build(
        "Steve Jobs",
        "consumer technology",
        incidents_path,
        tmp_path / "steve-jobs",
    )

    assert constructs_path == tmp_path / "steve-jobs" / "constructs.json"
    assert framework_path == tmp_path / "steve-jobs" / "framework.json"
    assert observed["map_constructs_person"] == "Steve Jobs"
    assert observed["map_constructs_incident_ids"] == [
        "incident-001",
        "incident-002",
        "incident-003",
        "incident-004",
        "incident-005",
    ]
    assert observed["derive_lens_holdout_ids"] == ["incident-004", "incident-005"]
    assert observed["generate_predictions_person"] == "Steve Jobs"
    assert json.loads(constructs_path.read_text(encoding="utf-8")) == [{"construct": "construct-1"}]


def test_run_framework_validation_writes_validation_artifacts(tmp_path, monkeypatch):
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}, indent=2), encoding="utf-8")

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
        traceability_ratio=0.92,
        lens_consistent=True,
        contradictions=[],
        per_scenario_details=[{"scenario": "Scenario 1"}],
    )
    floor_result = FloorCheckResult(
        alignment_ratio=0.67,
        per_decision_results=[{"decision": "Decision 1", "aligned": True}],
    )

    def fake_run_tier1(framework, person, domain, client=None):
        assert person == "Steve Jobs"
        assert domain == "consumer technology"
        return tier1_result

    def fake_run_tier2(framework, tier1_scenarios, client=None):
        assert tier1_scenarios == [
            {
                "scenario": "Scenario 1",
                "framework_response": "Framework response",
                "baseline_response": "Baseline response",
            }
        ]
        return tier2_result

    def fake_prepare_tier3_materials(tier1_results, person, output_dir):
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / "review_packet.json"
        path.write_text(json.dumps({"person": person, "pairs": []}, indent=2), encoding="utf-8")
        return path

    def fake_run_floor_check(framework, historical_decisions, client=None):
        assert historical_decisions == [{"decision": "Decision 1"}]
        return floor_result

    monkeypatch.setattr("framework_forge.pipeline.run_tier1", fake_run_tier1)
    monkeypatch.setattr("framework_forge.pipeline.run_tier2", fake_run_tier2)
    monkeypatch.setattr("framework_forge.pipeline.prepare_tier3_materials", fake_prepare_tier3_materials)
    monkeypatch.setattr("framework_forge.pipeline.run_floor_check", fake_run_floor_check)

    tier1_path, tier2_path, tier3_path, floor_path = run_framework_validation(
        "Steve Jobs",
        "consumer technology",
        framework_path,
        tmp_path / "steve-jobs",
        historical_decisions=[{"decision": "Decision 1"}],
    )

    assert tier1_path.name == "tier1_results.json"
    assert tier2_path.name == "tier2_results.json"
    assert tier3_path.name == "review_packet.json"
    assert floor_path is not None and floor_path.name == "floor-check_results.json"
    assert json.loads(tier1_path.read_text(encoding="utf-8"))["divergent_count"] == 1
    assert json.loads(tier2_path.read_text(encoding="utf-8"))["traceability_ratio"] == 0.92
    assert json.loads(floor_path.read_text(encoding="utf-8"))["alignment_ratio"] == 0.67


def test_run_framework_validation_serializes_threshold_artifacts(tmp_path, monkeypatch):
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}, indent=2), encoding="utf-8")

    tier1_result = Tier1Result(
        scenario_results=[
            ScenarioResult(
                scenario=f"Scenario {index}",
                framework_response="Framework response",
                baseline_response="Baseline response",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            )
            for index in range(TIER1_MIN_DIVERGENT_SCENARIOS)
        ]
    )
    tier2_result = Tier2Result(
        traceability_ratio=TIER2_MIN_TRACEABILITY,
        lens_consistent=True,
        contradictions=[],
        per_scenario_details=[{"scenario": "Scenario 0", "traceable_steps": 9, "total_steps": 10}],
    )
    floor_result = FloorCheckResult(
        alignment_ratio=FLOOR_CHECK_MIN_ALIGNMENT,
        per_decision_results=[{"decision": "Decision 1", "aligned": True}],
    )

    def fake_run_tier1(framework, person, domain, client=None):
        assert person == "Steve Jobs"
        assert domain == "consumer technology"
        return tier1_result

    def fake_run_tier2(framework, tier1_scenarios, client=None):
        assert len(tier1_scenarios) == TIER1_MIN_DIVERGENT_SCENARIOS
        return tier2_result

    def fake_prepare_tier3_materials(tier1_results, person, output_dir):
        assert tier1_results is tier1_result
        assert person == "Steve Jobs"
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / "review_packet.json"
        path.write_text(json.dumps({"person": person, "pairs": []}, indent=2), encoding="utf-8")
        return path

    def fake_run_floor_check(framework, historical_decisions, client=None):
        assert historical_decisions == [{"decision": "Decision 1"}]
        return floor_result

    monkeypatch.setattr("framework_forge.pipeline.run_tier1", fake_run_tier1)
    monkeypatch.setattr("framework_forge.pipeline.run_tier2", fake_run_tier2)
    monkeypatch.setattr("framework_forge.pipeline.prepare_tier3_materials", fake_prepare_tier3_materials)
    monkeypatch.setattr("framework_forge.pipeline.run_floor_check", fake_run_floor_check)

    tier1_path, tier2_path, tier3_path, floor_path = run_framework_validation(
        "Steve Jobs",
        "consumer technology",
        framework_path,
        tmp_path / "steve-jobs",
        historical_decisions=[{"decision": "Decision 1"}],
    )

    validation_dir = tmp_path / "steve-jobs" / "validation"
    assert tier1_path == validation_dir / "tier1_results.json"
    assert tier2_path == validation_dir / "tier2_results.json"
    assert tier3_path == validation_dir / "tier3_materials" / "review_packet.json"
    assert floor_path == validation_dir / "floor-check_results.json"

    assert json.loads(tier1_path.read_text(encoding="utf-8"))["passed"] is True
    assert json.loads(tier2_path.read_text(encoding="utf-8"))["passed"] is True
    assert json.loads(floor_path.read_text(encoding="utf-8"))["passed"] is True
    assert json.loads(tier1_path.read_text(encoding="utf-8"))["divergent_count"] == TIER1_MIN_DIVERGENT_SCENARIOS
    assert json.loads(tier2_path.read_text(encoding="utf-8"))["traceability_ratio"] == TIER2_MIN_TRACEABILITY
    assert json.loads(floor_path.read_text(encoding="utf-8"))["alignment_ratio"] == FLOOR_CHECK_MIN_ALIGNMENT


def test_run_framework_validation_skips_floor_check_without_historical_decisions(
    tmp_path, monkeypatch
):
    framework_path = tmp_path / "steve-jobs" / "framework.json"
    framework_path.parent.mkdir(parents=True, exist_ok=True)
    framework_path.write_text(json.dumps({"meta": {"person": "Steve Jobs"}}, indent=2), encoding="utf-8")

    tier1_result = Tier1Result(scenario_results=[])
    tier2_result = Tier2Result(
        traceability_ratio=0.81,
        lens_consistent=True,
        contradictions=[],
        per_scenario_details=[],
    )

    def fake_run_tier1(framework, person, domain, client=None):
        return tier1_result

    def fake_run_tier2(framework, tier1_scenarios, client=None):
        return tier2_result

    def fake_prepare_tier3_materials(*, tier1_results, person, output_dir):
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / "review_packet.json"
        path.write_text(json.dumps({"person": person, "pairs": []}, indent=2), encoding="utf-8")
        return path

    monkeypatch.setattr("framework_forge.pipeline.run_tier1", fake_run_tier1)
    monkeypatch.setattr("framework_forge.pipeline.run_tier2", fake_run_tier2)
    monkeypatch.setattr("framework_forge.pipeline.prepare_tier3_materials", fake_prepare_tier3_materials)

    tier1_path, tier2_path, tier3_path, floor_path = run_framework_validation(
        "Steve Jobs",
        "consumer technology",
        framework_path,
        tmp_path / "steve-jobs",
    )

    assert tier1_path.exists()
    assert tier2_path.exists()
    assert tier3_path.exists()
    assert floor_path is None
    assert not (framework_path.parent / "validation" / "floor-check_results.json").exists()


def test_run_pipeline_uses_default_output_dir_and_call_order(tmp_path, monkeypatch):
    import framework_forge.pipeline as pipeline_module

    monkeypatch.setattr(pipeline_module, "FRAMEWORKS_DIR", tmp_path / "frameworks")

    calls: list[tuple[str, tuple]] = []

    def fake_run_source_discovery(person, output_dir):
        calls.append(("discover", (person, output_dir)))
        return output_dir / "sources" / "bibliography.json"

    def fake_materialize_source_texts(bibliography_path, source_text_dir):
        calls.append(("materialize", (bibliography_path, source_text_dir)))
        return [source_text_dir / "01-source.txt"]

    def fake_run_incident_identification(person, source_text_dir, output_dir):
        calls.append(("identify", (person, source_text_dir, output_dir)))
        return output_dir / "incidents" / "candidates.json"

    def fake_run_incident_reconstruction(person, candidates_path, output_dir):
        calls.append(("reconstruct", (person, candidates_path, output_dir)))
        return output_dir / "incidents" / "incidents.json"

    def fake_run_framework_build(person, domain, incidents_path, output_dir):
        calls.append(("build", (person, domain, incidents_path, output_dir)))
        return output_dir / "constructs.json", output_dir / "framework.json"

    def fake_run_framework_validation(person, domain, framework_path, output_dir, historical_decisions=None):
        calls.append(("validate", (person, domain, framework_path, output_dir, historical_decisions)))
        return (
            output_dir / "validation" / "tier1_results.json",
            output_dir / "validation" / "tier2_results.json",
            output_dir / "validation" / "tier3_materials" / "review_packet.json",
            None,
        )

    monkeypatch.setattr(pipeline_module, "run_source_discovery", fake_run_source_discovery)
    monkeypatch.setattr(pipeline_module, "materialize_source_texts", fake_materialize_source_texts)
    monkeypatch.setattr(pipeline_module, "run_incident_identification", fake_run_incident_identification)
    monkeypatch.setattr(pipeline_module, "run_incident_reconstruction", fake_run_incident_reconstruction)
    monkeypatch.setattr(pipeline_module, "run_framework_build", fake_run_framework_build)
    monkeypatch.setattr(pipeline_module, "run_framework_validation", fake_run_framework_validation)

    result = run_pipeline("Steve Jobs", "consumer technology")

    assert isinstance(result, PipelineResult)
    assert result.output_dir == tmp_path / "frameworks" / "steve-jobs"
    assert result.source_text_dir == tmp_path / "frameworks" / "steve-jobs" / "sources" / "texts"
    assert [name for name, _ in calls] == [
        "discover",
        "materialize",
        "identify",
        "reconstruct",
        "build",
        "validate",
    ]


def test_run_pipeline_persists_the_full_artifact_contract(tmp_path, monkeypatch):
    import framework_forge.pipeline as pipeline_module

    monkeypatch.setattr(pipeline_module, "FRAMEWORKS_DIR", tmp_path / "frameworks")

    def fake_run_source_discovery(person, output_dir):
        path = output_dir / "sources" / "bibliography.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(
                [
                    {
                        "title": "Source A",
                        "url": "https://example.com/a",
                        "source_type": "critical_incident",
                        "description": "A",
                        "evidence_layers": ["layer2"],
                        "fetched": False,
                        "text_path": None,
                    }
                ],
                indent=2,
            ),
            encoding="utf-8",
        )
        return path

    def fake_materialize_source_texts(bibliography_path, source_text_dir):
        source_text_dir.mkdir(parents=True, exist_ok=True)
        text_path = source_text_dir / "01-source-a.txt"
        text_path.write_text("Source A text", encoding="utf-8")
        return [text_path]

    def fake_run_incident_identification(person, source_text_dir, output_dir):
        path = output_dir / "incidents" / "candidates.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps([{"title": "Candidate A"}], indent=2), encoding="utf-8")
        return path

    def fake_run_incident_reconstruction(person, candidates_path, output_dir):
        path = output_dir / "incidents" / "incidents.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps([{"id": "incident-001"}], indent=2), encoding="utf-8")
        return path

    def fake_run_framework_build(person, domain, incidents_path, output_dir):
        constructs_path = output_dir / "constructs.json"
        framework_path = output_dir / "framework.json"
        constructs_path.write_text(json.dumps([{"construct": "Construct A"}], indent=2), encoding="utf-8")
        framework_path.write_text(
            json.dumps({"meta": {"person": person, "domain": domain}}, indent=2),
            encoding="utf-8",
        )
        return constructs_path, framework_path

    def fake_run_framework_validation(person, domain, framework_path, output_dir, historical_decisions=None):
        validation_dir = output_dir / "validation"
        validation_dir.mkdir(parents=True, exist_ok=True)
        tier1_path = validation_dir / "tier1_results.json"
        tier2_path = validation_dir / "tier2_results.json"
        tier3_path = validation_dir / "tier3_materials" / "review_packet.json"
        floor_path = validation_dir / "floor-check_results.json" if historical_decisions else None

        tier1_path.write_text(
            json.dumps({"passed": True, "divergent_count": 1, "total_scenarios": 1}, indent=2),
            encoding="utf-8",
        )
        tier2_path.write_text(
            json.dumps({"passed": True, "traceability_ratio": 0.9}, indent=2),
            encoding="utf-8",
        )
        tier3_path.parent.mkdir(parents=True, exist_ok=True)
        tier3_path.write_text(json.dumps({"person": person, "pairs": []}, indent=2), encoding="utf-8")
        if floor_path is not None:
            floor_path.write_text(
                json.dumps({"passed": True, "alignment_ratio": 0.75}, indent=2),
                encoding="utf-8",
            )

        return tier1_path, tier2_path, tier3_path, floor_path

    monkeypatch.setattr(pipeline_module, "run_source_discovery", fake_run_source_discovery)
    monkeypatch.setattr(pipeline_module, "materialize_source_texts", fake_materialize_source_texts)
    monkeypatch.setattr(pipeline_module, "run_incident_identification", fake_run_incident_identification)
    monkeypatch.setattr(pipeline_module, "run_incident_reconstruction", fake_run_incident_reconstruction)
    monkeypatch.setattr(pipeline_module, "run_framework_build", fake_run_framework_build)
    monkeypatch.setattr(pipeline_module, "run_framework_validation", fake_run_framework_validation)

    result = run_pipeline(
        "Steve Jobs",
        "consumer technology",
        historical_decisions=[{"decision": "Decision 1"}],
    )

    assert result.output_dir == tmp_path / "frameworks" / "steve-jobs"
    assert result.source_text_dir == tmp_path / "frameworks" / "steve-jobs" / "sources" / "texts"
    assert result.bibliography_path.exists()
    assert result.candidates_path.exists()
    assert result.incidents_path.exists()
    assert result.constructs_path.exists()
    assert result.framework_path.exists()
    assert result.tier1_results_path.exists()
    assert result.tier2_results_path.exists()
    assert result.tier3_review_packet_path.exists()
    assert result.floor_check_results_path is not None
    assert result.floor_check_results_path.exists()

    validation_dir = result.output_dir / "validation"
    assert sorted(path.name for path in validation_dir.iterdir() if path.is_file()) == [
        "floor-check_results.json",
        "tier1_results.json",
        "tier2_results.json",
    ]
    assert (validation_dir / "tier3_materials" / "review_packet.json").exists()


def test_run_pipeline_surfaces_materialization_errors(tmp_path, monkeypatch):
    import framework_forge.pipeline as pipeline_module

    monkeypatch.setattr(pipeline_module, "FRAMEWORKS_DIR", tmp_path / "frameworks")

    bibliography_path = tmp_path / "frameworks" / "steve-jobs" / "sources" / "bibliography.json"
    bibliography_path.parent.mkdir(parents=True, exist_ok=True)
    bibliography_path.write_text(
        json.dumps(
            [
                {
                    "title": "Offline Source",
                    "url": "offline",
                    "source_type": "secondary_reporting",
                    "description": "Offline",
                    "evidence_layers": ["layer1"],
                    "fetched": False,
                    "text_path": None,
                }
            ],
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(pipeline_module, "run_source_discovery", lambda person, output_dir: bibliography_path)

    with pytest.raises(FileNotFoundError, match="No source text files found"):
        run_pipeline("Steve Jobs", "consumer technology")


def test_main_parses_args_and_delegates_to_pipeline(tmp_path, monkeypatch, capsys):
    import framework_forge.pipeline as pipeline_module

    historical_decisions_file = tmp_path / "historical.json"
    historical_decisions_file.write_text(json.dumps([{"decision": "Decision 1"}], indent=2), encoding="utf-8")

    expected_result = PipelineResult(
        output_dir=tmp_path / "steve-jobs",
        source_text_dir=tmp_path / "steve-jobs" / "sources" / "texts",
        bibliography_path=tmp_path / "steve-jobs" / "sources" / "bibliography.json",
        candidates_path=tmp_path / "steve-jobs" / "incidents" / "candidates.json",
        incidents_path=tmp_path / "steve-jobs" / "incidents" / "incidents.json",
        constructs_path=tmp_path / "steve-jobs" / "constructs.json",
        framework_path=tmp_path / "steve-jobs" / "framework.json",
        tier1_results_path=tmp_path / "steve-jobs" / "validation" / "tier1_results.json",
        tier2_results_path=tmp_path / "steve-jobs" / "validation" / "tier2_results.json",
        tier3_review_packet_path=tmp_path / "steve-jobs" / "validation" / "tier3_materials" / "review_packet.json",
        floor_check_results_path=tmp_path / "steve-jobs" / "validation" / "floor-check_results.json",
    )

    seen = {}

    def fake_run_pipeline(*, person, domain, output_dir=None, source_text_dir=None, historical_decisions=None):
        seen["person"] = person
        seen["domain"] = domain
        seen["output_dir"] = output_dir
        seen["source_text_dir"] = source_text_dir
        seen["historical_decisions"] = historical_decisions
        return expected_result

    monkeypatch.setattr(pipeline_module, "run_pipeline", fake_run_pipeline)

    exit_code = main(
        [
            "--person",
            "Steve Jobs",
            "--domain",
            "consumer technology",
            "--output",
            str(tmp_path / "steve-jobs"),
            "--source-text-dir",
            str(tmp_path / "sources" / "texts"),
            "--historical-decisions-file",
            str(historical_decisions_file),
        ]
    )

    assert exit_code == 0
    assert seen["person"] == "Steve Jobs"
    assert seen["domain"] == "consumer technology"
    assert seen["output_dir"] == Path(tmp_path / "steve-jobs")
    assert seen["source_text_dir"] == Path(tmp_path / "sources" / "texts")
    assert seen["historical_decisions"] == [{"decision": "Decision 1"}]
    stdout = capsys.readouterr().out
    assert "Pipeline complete for Steve Jobs" in stdout


def test_resolve_output_dir_defaults_to_slugified_framework_dir(tmp_path, monkeypatch):
    import framework_forge.pipeline as pipeline_module

    monkeypatch.setattr(pipeline_module, "FRAMEWORKS_DIR", tmp_path / "frameworks")

    assert resolve_output_dir("Steve Jobs") == tmp_path / "frameworks" / "steve-jobs"


def test_resolve_output_dir_uses_explicit_path(tmp_path):
    explicit = tmp_path / "custom-output"
    assert resolve_output_dir("Steve Jobs", explicit) == explicit
