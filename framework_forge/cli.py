"""CLI entry point for Framework Forge."""

import json
from pathlib import Path

import click

from framework_forge.config import FRAMEWORKS_DIR


@click.group()
def cli():
    """Framework Forge: Extract thinking frameworks from historical figures."""
    pass


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def discover_sources(person: str, output: str | None):
    """Stage 1: Discover and triage sources for a historical figure."""
    from framework_forge.llm import LLMClient
    from framework_forge.sources import discover_sources as _discover, triage_sources

    output_dir = Path(output) if output else FRAMEWORKS_DIR / person.lower().replace(" ", "-")
    output_dir.mkdir(parents=True, exist_ok=True)

    click.echo(f"Discovering sources for {person}...")
    client = LLMClient()
    sources = _discover(person, client)
    ranked = triage_sources(sources)

    bib = [s.to_dict() for s in ranked]
    bib_path = output_dir / "sources" / "bibliography.json"
    bib_path.parent.mkdir(parents=True, exist_ok=True)
    bib_path.write_text(json.dumps(bib, indent=2), encoding="utf-8")

    click.echo(f"Found {len(ranked)} sources. Bibliography saved to {bib_path}")
    for s in ranked[:5]:
        click.echo(f"  [{s.source_type}] {s.title}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--source-dir", type=click.Path(exists=True), required=True, help="Directory with source text files.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def identify_incidents(person: str, source_dir: str, output: str | None):
    """Stage 2: Identify candidate critical incidents from source texts."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.incidents import identify_incidents as _identify

    source_path = Path(source_dir)
    output_dir = Path(output) if output else FRAMEWORKS_DIR / person.lower().replace(" ", "-")

    client = LLMClient()
    all_incidents = []

    for txt_file in sorted(source_path.glob("*.txt")):
        click.echo(f"Scanning {txt_file.name}...")
        text = txt_file.read_text(encoding="utf-8")
        incidents = _identify(text, txt_file.stem, person, client)
        all_incidents.extend(incidents)
        click.echo(f"  Found {len(incidents)} candidate incidents")

    incidents_dir = output_dir / "incidents"
    incidents_dir.mkdir(parents=True, exist_ok=True)
    incidents_path = incidents_dir / "candidates.json"
    incidents_path.write_text(
        json.dumps([i.to_dict() for i in all_incidents], indent=2),
        encoding="utf-8",
    )

    click.echo(f"\nTotal: {len(all_incidents)} candidate incidents saved to {incidents_path}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--incidents-file", type=click.Path(exists=True), required=True, help="Path to candidates.json.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def reconstruct(person: str, incidents_file: str, output: str | None):
    """Stage 2b: Apply CDM probes to reconstruct each incident."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.incidents import CandidateIncident
    from framework_forge.extraction.cdm_probes import reconstruct_incident

    candidates = json.loads(Path(incidents_file).read_text(encoding="utf-8"))
    output_dir = Path(output) if output else Path(incidents_file).parent.parent

    client = LLMClient()
    reconstructed = []

    for i, cand in enumerate(candidates):
        click.echo(f"Reconstructing [{i+1}/{len(candidates)}]: {cand['title']}...")
        candidate = CandidateIncident(**cand)
        incident = reconstruct_incident(
            candidate=candidate,
            person=person,
            incident_id=f"incident-{i+1:03d}",
            client=client,
        )
        reconstructed.append(incident.to_dict())

    out_path = output_dir / "incidents" / "incidents.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(reconstructed, indent=2), encoding="utf-8")
    click.echo(f"\n{len(reconstructed)} incidents reconstructed. Saved to {out_path}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--framework-dir", type=click.Path(exists=True), required=True, help="Framework directory.")
@click.option("--domain", required=True, help="Person's domain(s).")
def build(person: str, framework_dir: str, domain: str):
    """Stages 3-6: Map constructs, derive lens, generate predictions, encode framework."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.cdm_probes import ReconstructedIncident
    from framework_forge.extraction.constructs import map_constructs
    from framework_forge.extraction.lens import derive_lens
    from framework_forge.extraction.divergence import generate_predictions
    from framework_forge.encoding.framework import assemble_framework, save_framework

    fw_dir = Path(framework_dir)
    client = LLMClient()

    # Load incidents
    incidents_path = fw_dir / "incidents" / "incidents.json"
    raw_incidents = json.loads(incidents_path.read_text(encoding="utf-8"))
    incidents = [ReconstructedIncident(**inc) for inc in raw_incidents]
    click.echo(f"Loaded {len(incidents)} reconstructed incidents.")

    # Stage 3: Bipolar construct mapping
    click.echo("Mapping bipolar constructs...")
    constructs = map_constructs(incidents, person, client)
    constructs_path = fw_dir / "constructs.json"
    constructs_path.write_text(
        json.dumps([c.to_dict() for c in constructs], indent=2), encoding="utf-8"
    )
    click.echo(f"  {len(constructs)} constructs mapped.")

    # Stage 4: Perceptual lens derivation (hold out last 20% of incidents)
    holdout_count = max(2, len(incidents) // 5)
    holdout_ids = [inc.id for inc in incidents[-holdout_count:]]
    click.echo(f"Deriving perceptual lens (holdout: {len(holdout_ids)} incidents)...")
    lens = derive_lens(constructs, incidents, person, holdout_ids, client)
    click.echo(f"  Lens: {lens.statement}")

    # Stage 5: Behavioral divergence predictions
    click.echo("Generating behavioral divergence predictions...")
    predictions = generate_predictions(lens, constructs, person, client)
    click.echo(f"  {len(predictions)} predictions generated.")

    # Stage 6: Assemble and save framework
    click.echo("Assembling framework JSON...")
    framework = assemble_framework(
        person=person,
        domain=domain,
        incidents=incidents,
        constructs=constructs,
        lens=lens,
        predictions=predictions,
    )
    path = save_framework(framework, fw_dir)
    click.echo(f"Framework saved to {path}")


@cli.command()
@click.option("--framework", type=click.Path(exists=True), required=True, help="Path to framework.json.")
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--domain", required=True, help="Person's domain(s).")
@click.option("--mode", type=click.Choice(["tier1", "tier2", "full", "floor-check"]), default="full")
def validate(framework: str, person: str, domain: str, mode: str):
    """Stage 7: Run three-tier validation."""
    from framework_forge.llm import LLMClient
    from framework_forge.validation.tier1 import run_tier1
    from framework_forge.validation.tier2 import run_tier2
    from framework_forge.validation.tier3_prep import prepare_tier3_materials
    from framework_forge.validation.floor_check import run_floor_check

    fw_path = Path(framework)
    fw_dir = fw_path.parent
    fw = json.loads(fw_path.read_text(encoding="utf-8"))
    client = LLMClient()

    if mode in ("tier1", "full"):
        click.echo("Running Tier 1: Baseline Differentiation...")
        tier1 = run_tier1(fw, person, domain, client=client)
        result_path = fw_dir / "validation" / "tier1_results.json"
        result_path.parent.mkdir(parents=True, exist_ok=True)
        result_path.write_text(json.dumps(tier1.to_dict(), indent=2), encoding="utf-8")
        status = "PASSED" if tier1.passed else "FAILED"
        click.echo(f"  Tier 1: {status} ({tier1.divergent_count}/{len(tier1.scenario_results)} divergent)")

    if mode in ("tier2", "full"):
        # Load Tier 1 results for Tier 2 input
        tier1_path = fw_dir / "validation" / "tier1_results.json"
        if not tier1_path.exists():
            click.echo("  Tier 1 results not found. Run tier1 first.")
            return
        tier1_data = json.loads(tier1_path.read_text())
        scenarios = [
            {"scenario": s["scenario"], "framework_response": s["framework_response"]}
            for s in tier1_data["scenarios"]
        ]

        click.echo("Running Tier 2: Internal Consistency...")
        tier2 = run_tier2(fw, scenarios, client=client)
        result_path = fw_dir / "validation" / "tier2_results.json"
        result_path.write_text(json.dumps(tier2.to_dict(), indent=2), encoding="utf-8")
        status = "PASSED" if tier2.passed else "FAILED"
        click.echo(f"  Tier 2: {status} (traceability: {tier2.traceability_ratio:.0%})")

    if mode == "full":
        click.echo("Preparing Tier 3 materials for expert review...")
        tier1_data = json.loads((fw_dir / "validation" / "tier1_results.json").read_text())
        scenarios = [
            {
                "scenario": s["scenario"],
                "framework_response": s["framework_response"],
                "baseline_response": s["baseline_response"],
            }
            for s in tier1_data["scenarios"]
        ]
        path = prepare_tier3_materials(scenarios, person, fw_dir / "validation" / "tier3_materials")
        click.echo(f"  Review packet saved to {path}")

    if mode == "floor-check":
        click.echo("Running floor check: historical alignment...")
        # Load incidents for historical decisions
        incidents_path = fw_dir / "incidents" / "incidents.json"
        if not incidents_path.exists():
            click.echo("  No incidents found for floor check.")
            return
        incidents = json.loads(incidents_path.read_text())
        historical = [
            {
                "context": inc["context"],
                "options": f"Decision: {inc['decision']}",
                "actual_reasoning": inc.get("divergence_explanation", ""),
            }
            for inc in incidents[:10]
        ]
        result = run_floor_check(fw, historical, client)
        status = "PASSED" if result.passed else "FAILED"
        click.echo(f"  Floor check: {status} (alignment: {result.alignment_ratio:.0%})")


if __name__ == "__main__":
    cli()
