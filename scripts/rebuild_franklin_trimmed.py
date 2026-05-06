"""Rebuild Franklin framework using already-trimmed constructs.json.

Skips construct-mapping (use existing trimmed file). Regenerates lens
and predictions tied to the smaller construct set, then re-assembles.
"""

import json
from pathlib import Path

from framework_forge.llm import LLMClient
from framework_forge.extraction.cdm_probes import ReconstructedIncident
from framework_forge.extraction.constructs import BipolarConstruct
from framework_forge.extraction.lens import derive_lens
from framework_forge.extraction.divergence import generate_predictions
from framework_forge.encoding.framework import assemble_framework, save_framework


def main():
    fw_dir = Path("frameworks/benjamin-franklin")
    person = "Benjamin Franklin"
    domain = "Diplomacy, Science, Entrepreneurship"

    client = LLMClient()

    raw_incidents = json.loads((fw_dir / "incidents" / "incidents.json").read_text(encoding="utf-8"))
    incidents = [ReconstructedIncident(**inc) for inc in raw_incidents]
    print(f"Loaded {len(incidents)} incidents.")

    raw_constructs = json.loads((fw_dir / "constructs.json").read_text(encoding="utf-8"))
    constructs = [BipolarConstruct(**c) for c in raw_constructs]
    print(f"Loaded {len(constructs)} (trimmed) constructs.")

    holdout_count = max(2, len(incidents) // 5)
    holdout_ids = [inc.id for inc in incidents[-holdout_count:]]
    print(f"Deriving perceptual lens (holdout: {len(holdout_ids)} incidents)...")
    lens = derive_lens(constructs, incidents, person, holdout_ids, client)
    print(f"  Lens: {lens.statement}")

    print("Generating behavioral divergence predictions...")
    predictions = generate_predictions(lens, constructs, person, client)
    print(f"  {len(predictions)} predictions generated.")

    print("Assembling framework JSON...")
    framework = assemble_framework(
        person=person,
        domain=domain,
        incidents=[inc.to_dict() for inc in incidents],
        constructs=[c.to_dict() for c in constructs],
        lens=lens.to_dict(),
        predictions=[p.to_dict() for p in predictions],
    )
    path = save_framework(framework, fw_dir)
    print(f"Framework saved to {path}")


if __name__ == "__main__":
    main()
