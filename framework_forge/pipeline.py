"""Reusable end-to-end Framework Forge pipeline runner."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

from framework_forge.config import FRAMEWORKS_DIR
from framework_forge.encoding.framework import assemble_framework, save_framework
from framework_forge.extraction.cdm_probes import ReconstructedIncident, reconstruct_incident
from framework_forge.extraction.constructs import map_constructs
from framework_forge.extraction.divergence import generate_predictions
from framework_forge.extraction.incidents import CandidateIncident, identify_incidents
from framework_forge.extraction.lens import derive_lens
from framework_forge.sources import discover_sources as discover_framework_sources
from framework_forge.sources import fetch_source
from framework_forge.sources import triage_sources
from framework_forge.sources.triage import SourceEntry
from framework_forge.validation.floor_check import run_floor_check
from framework_forge.validation.tier1 import run_tier1
from framework_forge.validation.tier2 import run_tier2
from framework_forge.validation.tier3_prep import prepare_tier3_materials


def _person_slug(person: str) -> str:
    """Return a stable directory slug for a person's name."""
    slug = re.sub(r"[^a-z0-9]+", "-", person.lower()).strip("-")
    return slug or "framework"


def resolve_output_dir(person: str, output_dir: str | Path | None = None) -> Path:
    """Resolve the framework output directory for a run."""
    if output_dir is not None:
        return Path(output_dir)
    return FRAMEWORKS_DIR / _person_slug(person)


def _write_json(path: Path, payload: Any) -> Path:
    """Write formatted JSON and return the path."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def _slugify_source_title(title: str) -> str:
    """Build a stable filename fragment for a source title."""
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "source"


def _load_bibliography_entries(bibliography_path: Path) -> list[SourceEntry]:
    """Load the bibliography entries written by source discovery."""
    raw_entries = json.loads(bibliography_path.read_text(encoding="utf-8"))
    return [SourceEntry(**entry) for entry in raw_entries]


def _source_text_path(source_text_dir: Path, source: SourceEntry, index: int) -> Path:
    """Return the on-disk path for a discovered source text file."""
    return source_text_dir / f"{index:02d}-{_slugify_source_title(source.title)}.txt"


def materialize_source_texts(bibliography_path: Path, source_text_dir: Path) -> list[Path]:
    """Fetch missing source texts from the bibliography into the source-text directory."""
    ranked_sources = _load_bibliography_entries(bibliography_path)
    source_text_dir.mkdir(parents=True, exist_ok=True)

    for index, source in enumerate(ranked_sources, start=1):
        output_path = _source_text_path(source_text_dir, source, index)
        if output_path.exists():
            continue
        if not source.url or source.url.lower() == "offline":
            continue
        fetch_source(source.url, output_path)

    text_files = sorted(source_text_dir.glob("*.txt"))
    if not text_files:
        raise FileNotFoundError(
            f"No source text files found in {source_text_dir}. "
            "Provide --source-text-dir with .txt files or ensure discovered sources "
            "include fetchable URLs so the pipeline can materialize them."
        )
    return text_files


@dataclass(frozen=True, slots=True)
class PipelineResult:
    """Artifact paths produced by a Framework Forge pipeline run."""

    output_dir: Path
    source_text_dir: Path
    bibliography_path: Path
    candidates_path: Path
    incidents_path: Path
    constructs_path: Path
    framework_path: Path
    tier1_results_path: Path
    tier2_results_path: Path
    tier3_review_packet_path: Path
    floor_check_results_path: Path | None = None


def run_source_discovery(person: str, output_dir: Path) -> Path:
    """Discover and persist ranked sources for a historical figure."""
    ranked_sources = triage_sources(discover_framework_sources(person))
    bibliography_path = output_dir / "sources" / "bibliography.json"
    _write_json(bibliography_path, [source.to_dict() for source in ranked_sources])
    return bibliography_path


def run_incident_identification(
    person: str,
    source_text_dir: Path,
    output_dir: Path,
) -> Path:
    """Identify candidate incidents from source text files and persist them."""
    all_candidates: list[CandidateIncident] = []
    text_files = sorted(source_text_dir.glob("*.txt"))
    if not text_files:
        raise FileNotFoundError(
            f"No source text files found in {source_text_dir}. "
            "The incident stage requires materialized source texts."
        )

    for txt_file in text_files:
        text = txt_file.read_text(encoding="utf-8")
        all_candidates.extend(
            identify_incidents(
                source_text=text,
                source_title=txt_file.stem,
                person=person,
            )
        )

    candidates_path = output_dir / "incidents" / "candidates.json"
    _write_json(candidates_path, [incident.to_dict() for incident in all_candidates])
    return candidates_path


def run_incident_reconstruction(
    person: str,
    candidates_path: Path,
    output_dir: Path,
) -> Path:
    """Apply CDM probes to candidate incidents and persist the results."""
    raw_candidates = json.loads(candidates_path.read_text(encoding="utf-8"))
    reconstructed: list[ReconstructedIncident] = []

    for index, candidate_payload in enumerate(raw_candidates, start=1):
        candidate = CandidateIncident(**candidate_payload)
        reconstructed.append(
            reconstruct_incident(
                candidate=candidate,
                person=person,
                incident_id=f"incident-{index:03d}",
            )
        )

    incidents_path = output_dir / "incidents" / "incidents.json"
    _write_json(incidents_path, [incident.to_dict() for incident in reconstructed])
    return incidents_path


def run_framework_build(
    person: str,
    domain: str,
    incidents_path: Path,
    output_dir: Path,
) -> tuple[Path, Path]:
    """Map constructs, derive the lens, generate predictions, and save the framework."""
    raw_incidents = json.loads(incidents_path.read_text(encoding="utf-8"))
    incidents = [ReconstructedIncident(**incident) for incident in raw_incidents]

    constructs = map_constructs(incidents, person)
    constructs_path = output_dir / "constructs.json"
    _write_json(constructs_path, [construct.to_dict() for construct in constructs])

    holdout_count = max(2, len(incidents) // 5)
    holdout_ids = [incident.id for incident in incidents[-holdout_count:]]
    lens = derive_lens(constructs, incidents, person, holdout_ids)
    predictions = generate_predictions(lens, constructs, person)

    framework = assemble_framework(
        person=person,
        domain=domain,
        incidents=[incident.to_dict() for incident in incidents],
        constructs=[construct.to_dict() for construct in constructs],
        lens=lens.to_dict(),
        predictions=[prediction.to_dict() for prediction in predictions],
    )
    framework_path = save_framework(framework, output_dir)
    return constructs_path, framework_path


def run_framework_validation(
    person: str,
    domain: str,
    framework_path: Path,
    output_dir: Path,
    historical_decisions: Sequence[dict[str, Any]] | None = None,
) -> tuple[Path, Path, Path, Path | None]:
    """Run validation and persist tier artifacts under the framework directory."""
    framework = json.loads(framework_path.read_text(encoding="utf-8"))
    validation_dir = output_dir / "validation"

    tier1 = run_tier1(framework, person, domain)
    tier1_results_path = _write_json(validation_dir / "tier1_results.json", tier1.to_dict())

    tier1_scenarios = [
        {
            "scenario": result.scenario,
            "framework_response": result.framework_response,
            "baseline_response": result.baseline_response,
        }
        for result in tier1.scenario_results
    ]
    tier2 = run_tier2(framework, tier1_scenarios)
    tier2_results_path = _write_json(validation_dir / "tier2_results.json", tier2.to_dict())

    tier3_review_packet_path = prepare_tier3_materials(
        tier1_results=tier1,
        person=person,
        output_dir=validation_dir / "tier3_materials",
    )

    floor_check_results_path: Path | None = None
    if historical_decisions is not None:
        floor_check = run_floor_check(framework, list(historical_decisions))
        floor_check_results_path = _write_json(
            validation_dir / "floor-check_results.json",
            floor_check.to_dict(),
        )

    return (
        tier1_results_path,
        tier2_results_path,
        tier3_review_packet_path,
        floor_check_results_path,
    )


def run_pipeline(
    person: str,
    domain: str,
    output_dir: str | Path | None = None,
    source_text_dir: str | Path | None = None,
    historical_decisions: Sequence[dict[str, Any]] | None = None,
) -> PipelineResult:
    """Run the full Framework Forge pipeline from Python."""
    resolved_output_dir = resolve_output_dir(person, output_dir)
    resolved_source_text_dir = (
        Path(source_text_dir)
        if source_text_dir is not None
        else resolved_output_dir / "sources" / "texts"
    )
    resolved_output_dir.mkdir(parents=True, exist_ok=True)

    bibliography_path = run_source_discovery(person, resolved_output_dir)
    materialize_source_texts(bibliography_path, resolved_source_text_dir)
    candidates_path = run_incident_identification(
        person=person,
        source_text_dir=resolved_source_text_dir,
        output_dir=resolved_output_dir,
    )
    incidents_path = run_incident_reconstruction(
        person=person,
        candidates_path=candidates_path,
        output_dir=resolved_output_dir,
    )
    constructs_path, framework_path = run_framework_build(
        person=person,
        domain=domain,
        incidents_path=incidents_path,
        output_dir=resolved_output_dir,
    )
    (
        tier1_results_path,
        tier2_results_path,
        tier3_review_packet_path,
        floor_check_results_path,
    ) = run_framework_validation(
        person=person,
        domain=domain,
        framework_path=framework_path,
        output_dir=resolved_output_dir,
        historical_decisions=historical_decisions,
    )

    return PipelineResult(
        output_dir=resolved_output_dir,
        source_text_dir=resolved_source_text_dir,
        bibliography_path=bibliography_path,
        candidates_path=candidates_path,
        incidents_path=incidents_path,
        constructs_path=constructs_path,
        framework_path=framework_path,
        tier1_results_path=tier1_results_path,
        tier2_results_path=tier2_results_path,
        tier3_review_packet_path=tier3_review_packet_path,
        floor_check_results_path=floor_check_results_path,
    )


def build_parser() -> argparse.ArgumentParser:
    """Build the module-level CLI parser."""
    parser = argparse.ArgumentParser(description="Run the Framework Forge pipeline end-to-end.")
    parser.add_argument("--person", required=True, help="Full name of the historical figure.")
    parser.add_argument("--domain", required=True, help="Person's domain or domains.")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output directory. Defaults to frameworks/<slug>.",
    )
    parser.add_argument(
        "--source-text-dir",
        type=Path,
        default=None,
        help="Directory containing source text files for incident identification.",
    )
    parser.add_argument(
        "--historical-decisions-file",
        type=Path,
        default=None,
        help="Optional JSON file of historical decisions for the floor check stage.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """CLI entry point for `python -m framework_forge.pipeline`."""
    parser = build_parser()
    args = parser.parse_args(argv)

    historical_decisions: Sequence[dict[str, Any]] | None = None
    if args.historical_decisions_file is not None:
        historical_decisions = json.loads(args.historical_decisions_file.read_text(encoding="utf-8"))

    result = run_pipeline(
        person=args.person,
        domain=args.domain,
        output_dir=args.output,
        source_text_dir=args.source_text_dir,
        historical_decisions=historical_decisions,
    )

    print(f"Pipeline complete for {args.person}")
    print(f"  Output dir: {result.output_dir}")
    print(f"  Framework: {result.framework_path}")
    print(f"  Validation: {result.tier1_results_path.parent}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
