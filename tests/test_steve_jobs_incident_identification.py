"""Regression tests for Steve Jobs incident identification over the curated corpus.

These tests validate the artifacts produced by running `run_incident_identification`
over the curated Steve Jobs source corpus (5 primary source texts).  They serve as
a lockdown layer: if the candidates.json or incidents.json diverge from the expected
schema or the documented corpus baseline, the tests will fail and prompt a review.

Corpus baseline (established by initial pipeline run):
  - 5 curated source texts (All Things Digital D5 dual/solo, D8 liveblog,
    Computer History Museum, Future of the PC 1990)
  - 30 candidate incidents, all classified as `critical_incident`
  - 30 reconstructed incidents with CDM probes, IDs incident-001..incident-030
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
STEVE_JOBS_DIR = REPO_ROOT / "frameworks" / "steve-jobs"
CANDIDATES_PATH = STEVE_JOBS_DIR / "incidents" / "candidates.json"
INCIDENTS_PATH = STEVE_JOBS_DIR / "incidents" / "incidents.json"

# Curated corpus: the 5 source texts used for the committed candidates
CURATED_CORPUS_SOURCES = {
    "allthingsd_d5_gates_jobs_official_transcript",
    "allthingsd_d5_solo_2007",
    "allthingsd_d8_liveblog",
    "computer_history_museum",
    "future_of_pc_1990",
}

# Number of candidates extracted from the curated corpus
CURATED_CANDIDATE_COUNT = 30

# Required CDM probe keys present in each reconstructed incident
CDM_PROBE_KEYS = {
    "cues_noticed",
    "active_goals",
    "rejected_alternatives",
    "situation_framing",
    "expected_outcome",
}

# Required top-level keys for each reconstructed incident
INCIDENT_KEYS = {
    "id",
    "decision",
    "context",
    "cdm_probes",
    "counterfactual",
    "divergence_explanation",
    "outcome",
    "source",
}

# Required keys for each candidate incident
CANDIDATE_KEYS = {
    "title",
    "description",
    "source_text_excerpt",
    "source_title",
    "reasoning_visible",
    "evidence_type",
}


class TestCandidatesArtifact:
    """Regression lockdown for frameworks/steve-jobs/incidents/candidates.json."""

    def _load_candidates(self) -> list[dict]:
        assert CANDIDATES_PATH.exists(), (
            f"candidates.json not found at {CANDIDATES_PATH}. "
            "Run the incident identification stage first."
        )
        return json.loads(CANDIDATES_PATH.read_text(encoding="utf-8"))

    def test_candidates_file_exists(self):
        """The curated candidates.json artifact must exist on disk."""
        assert CANDIDATES_PATH.exists()

    def test_candidates_count_matches_curated_corpus(self):
        """The curated corpus must produce exactly 30 candidate incidents."""
        candidates = self._load_candidates()
        assert len(candidates) == CURATED_CANDIDATE_COUNT, (
            f"Expected {CURATED_CANDIDATE_COUNT} candidates, got {len(candidates)}. "
            "Re-run incident identification if the corpus has changed."
        )

    def test_candidates_source_coverage(self):
        """All 5 curated source texts must contribute at least one candidate."""
        candidates = self._load_candidates()
        sources_present = {c["source_title"] for c in candidates}
        missing = CURATED_CORPUS_SOURCES - sources_present
        assert not missing, (
            f"No candidates extracted from sources: {missing}. "
            "These source texts must be included in the curated corpus."
        )

    def test_candidates_no_extra_sources(self):
        """candidates.json must not contain sources outside the curated set."""
        candidates = self._load_candidates()
        extra_sources = {c["source_title"] for c in candidates} - CURATED_CORPUS_SOURCES
        assert not extra_sources, (
            f"Unexpected sources in candidates.json: {extra_sources}. "
            "The curated corpus should only include the 5 approved source texts."
        )

    def test_candidates_schema(self):
        """Every candidate must contain all required fields."""
        candidates = self._load_candidates()
        for i, candidate in enumerate(candidates):
            missing_keys = CANDIDATE_KEYS - candidate.keys()
            assert not missing_keys, (
                f"Candidate {i} is missing required fields: {missing_keys}"
            )

    def test_candidates_evidence_types_are_valid(self):
        """Every candidate must have a valid evidence_type."""
        valid_types = {
            "critical_incident",
            "value_conflict",
            "failure",
            "private_writing",
            "own_published_work",
            "firsthand_biography",
            "scholarly_analysis",
            "secondary_reporting",
        }
        candidates = self._load_candidates()
        for i, candidate in enumerate(candidates):
            assert candidate["evidence_type"] in valid_types, (
                f"Candidate {i} has invalid evidence_type: {candidate['evidence_type']!r}"
            )

    def test_candidates_all_have_nonempty_title_and_description(self):
        """Every candidate must have a non-empty title and description."""
        candidates = self._load_candidates()
        for i, candidate in enumerate(candidates):
            assert candidate["title"].strip(), f"Candidate {i} has an empty title"
            assert candidate["description"].strip(), (
                f"Candidate {i} has an empty description"
            )

    def test_candidates_reasoning_visible_is_boolean(self):
        """reasoning_visible must be a boolean for every candidate."""
        candidates = self._load_candidates()
        for i, candidate in enumerate(candidates):
            assert isinstance(candidate["reasoning_visible"], bool), (
                f"Candidate {i}: reasoning_visible must be bool, "
                f"got {type(candidate['reasoning_visible']).__name__}"
            )


class TestIncidentsArtifact:
    """Regression lockdown for frameworks/steve-jobs/incidents/incidents.json."""

    def _load_incidents(self) -> list[dict]:
        assert INCIDENTS_PATH.exists(), (
            f"incidents.json not found at {INCIDENTS_PATH}. "
            "Run the CDM reconstruction stage first."
        )
        return json.loads(INCIDENTS_PATH.read_text(encoding="utf-8"))

    def test_incidents_file_exists(self):
        """The reconstructed incidents.json artifact must exist on disk."""
        assert INCIDENTS_PATH.exists()

    def test_incidents_count_matches_candidates(self):
        """incidents.json must have the same count as the curated candidates.json."""
        incidents = self._load_incidents()
        assert len(incidents) == CURATED_CANDIDATE_COUNT, (
            f"Expected {CURATED_CANDIDATE_COUNT} reconstructed incidents, "
            f"got {len(incidents)}."
        )

    def test_incidents_ids_are_sequential(self):
        """Incident IDs must follow the canonical incident-NNN pattern."""
        incidents = self._load_incidents()
        for i, incident in enumerate(incidents, start=1):
            expected_id = f"incident-{i:03d}"
            assert incident["id"] == expected_id, (
                f"Incident at position {i} has id {incident['id']!r}, "
                f"expected {expected_id!r}"
            )

    def test_incidents_schema(self):
        """Every reconstructed incident must contain all required top-level fields."""
        incidents = self._load_incidents()
        for incident in incidents:
            missing_keys = INCIDENT_KEYS - incident.keys()
            assert not missing_keys, (
                f"Incident {incident.get('id')} is missing required fields: {missing_keys}"
            )

    def test_incidents_cdm_probes_schema(self):
        """Every reconstructed incident must have all 5 CDM probe fields populated."""
        incidents = self._load_incidents()
        for incident in incidents:
            probes = incident.get("cdm_probes", {})
            missing_probes = CDM_PROBE_KEYS - probes.keys()
            assert not missing_probes, (
                f"Incident {incident.get('id')} is missing CDM probe fields: "
                f"{missing_probes}"
            )
            for key in CDM_PROBE_KEYS:
                assert probes[key].strip(), (
                    f"Incident {incident.get('id')} has empty cdm_probes.{key}"
                )

    def test_incidents_source_coverage(self):
        """All 5 curated source texts must appear in the reconstructed incidents."""
        incidents = self._load_incidents()
        sources_present = {inc["source"] for inc in incidents}
        missing = CURATED_CORPUS_SOURCES - sources_present
        assert not missing, (
            f"No reconstructed incidents from sources: {missing}."
        )

    def test_incidents_counterfactual_and_divergence_are_nonempty(self):
        """Every reconstructed incident must have a non-empty counterfactual and divergence."""
        incidents = self._load_incidents()
        for incident in incidents:
            assert incident["counterfactual"].strip(), (
                f"Incident {incident.get('id')} has an empty counterfactual"
            )
            assert incident["divergence_explanation"].strip(), (
                f"Incident {incident.get('id')} has an empty divergence_explanation"
            )


class TestIdentifyIncidentsStageIntegration:
    """Integration tests for the run_incident_identification function using mocks."""

    def test_identify_stage_collects_candidates_from_all_corpus_sources(
        self, tmp_path, monkeypatch
    ):
        """run_incident_identification must call identify_incidents once per source file."""
        from framework_forge.extraction.incidents import CandidateIncident
        from framework_forge.pipeline import run_incident_identification

        source_text_dir = tmp_path / "sources" / "texts"
        source_text_dir.mkdir(parents=True)
        corpus_files = {
            "allthingsd_d5_gates_jobs_official_transcript.txt": "ATD D5 Gates Jobs text",
            "allthingsd_d5_solo_2007.txt": "ATD D5 solo 2007 text",
            "allthingsd_d8_liveblog.txt": "ATD D8 liveblog text",
            "computer_history_museum.txt": "Computer History Museum text",
            "future_of_pc_1990.txt": "Future of the PC 1990 text",
        }
        for filename, content in corpus_files.items():
            (source_text_dir / filename).write_text(content, encoding="utf-8")

        calls: list[str] = []

        def fake_identify(*, source_text: str, source_title: str, person: str):
            calls.append(source_title)
            return [
                CandidateIncident(
                    title=f"{source_title}-incident",
                    description="Test incident",
                    source_text_excerpt=source_text[:20],
                    source_title=source_title,
                    reasoning_visible=True,
                    evidence_type="critical_incident",
                )
            ]

        monkeypatch.setattr(
            "framework_forge.pipeline.identify_incidents", fake_identify
        )

        candidates_path = run_incident_identification(
            "Steve Jobs", source_text_dir, tmp_path / "steve-jobs"
        )

        assert len(calls) == len(corpus_files), (
            f"Expected identify_incidents called {len(corpus_files)} times "
            f"(once per corpus file), got {len(calls)}"
        )
        written = json.loads(candidates_path.read_text(encoding="utf-8"))
        assert len(written) == len(corpus_files)

    def test_identify_stage_passes_person_name_correctly(self, tmp_path, monkeypatch):
        """identify_incidents must receive 'Steve Jobs' as the person argument."""
        from framework_forge.extraction.incidents import CandidateIncident
        from framework_forge.pipeline import run_incident_identification

        source_text_dir = tmp_path / "sources" / "texts"
        source_text_dir.mkdir(parents=True)
        (source_text_dir / "source01.txt").write_text("Source text", encoding="utf-8")

        person_seen: list[str] = []

        def fake_identify(*, source_text: str, source_title: str, person: str):
            person_seen.append(person)
            return [
                CandidateIncident(
                    title="Test",
                    description="Test",
                    source_text_excerpt="text",
                    source_title=source_title,
                    reasoning_visible=True,
                    evidence_type="critical_incident",
                )
            ]

        monkeypatch.setattr(
            "framework_forge.pipeline.identify_incidents", fake_identify
        )

        run_incident_identification("Steve Jobs", source_text_dir, tmp_path / "steve-jobs")

        assert person_seen == ["Steve Jobs"]

    def test_identify_stage_writes_all_candidates_to_json(self, tmp_path, monkeypatch):
        """candidates.json must include every CandidateIncident returned by identify_incidents."""
        from framework_forge.extraction.incidents import CandidateIncident
        from framework_forge.pipeline import run_incident_identification

        source_text_dir = tmp_path / "sources" / "texts"
        source_text_dir.mkdir(parents=True)
        (source_text_dir / "source01.txt").write_text("First source", encoding="utf-8")
        (source_text_dir / "source02.txt").write_text("Second source", encoding="utf-8")

        def fake_identify(*, source_text: str, source_title: str, person: str):
            return [
                CandidateIncident(
                    title=f"{source_title}-A",
                    description="Description A",
                    source_text_excerpt="excerpt",
                    source_title=source_title,
                    reasoning_visible=True,
                    evidence_type="critical_incident",
                ),
                CandidateIncident(
                    title=f"{source_title}-B",
                    description="Description B",
                    source_text_excerpt="excerpt",
                    source_title=source_title,
                    reasoning_visible=False,
                    evidence_type="value_conflict",
                ),
            ]

        monkeypatch.setattr(
            "framework_forge.pipeline.identify_incidents", fake_identify
        )

        candidates_path = run_incident_identification(
            "Steve Jobs", source_text_dir, tmp_path / "steve-jobs"
        )

        written = json.loads(candidates_path.read_text(encoding="utf-8"))
        assert len(written) == 4  # 2 sources × 2 candidates each
        titles = [c["title"] for c in written]
        assert "source01-A" in titles
        assert "source02-B" in titles
