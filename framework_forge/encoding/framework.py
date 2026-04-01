"""Assemble extraction outputs into the final selector-architecture JSON."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def assemble_framework(
    person: str,
    domain: str,
    incidents: list[dict],
    constructs: list[dict],
    lens: dict,
    predictions: list[dict],
    primary_sources: list[str] | None = None,
    secondary_sources: list[str] | None = None,
    born: str = "",
    died: str = "",
) -> dict[str, Any]:
    """Assemble all extraction outputs into the final framework JSON.

    Returns a dict with sections: meta, perceptual_lens, bipolar_constructs,
    critical_incident_database, behavioral_divergence_predictions, core_problem,
    stated_principles, value_hierarchy, blind_spots, constraint_response,
    contextual_adaptation.
    """
    framework: dict[str, Any] = {
        "meta": {
            "person": person,
            "domain": domain,
            "born": born,
            "died": died,
            "generated_utc": datetime.now(timezone.utc).isoformat(),
            "primary_sources": primary_sources or [],
            "secondary_sources": secondary_sources or [],
            "incident_count": len(incidents),
            "construct_count": len(constructs),
            "prediction_count": len(predictions),
        },
        "perceptual_lens": lens,
        "bipolar_constructs": constructs,
        "critical_incident_database": incidents,
        "behavioral_divergence_predictions": predictions,
        # Placeholder sections filled during LLM synthesis or left for downstream
        "core_problem": {},
        "stated_principles": [],
        "value_hierarchy": [],
        "blind_spots": [],
        "constraint_response": {},
        "contextual_adaptation": {},
    }
    return framework


def save_framework(framework: dict, output_dir: Path) -> Path:
    """Save the assembled framework to framework.json in output_dir.

    Returns the Path to the written file.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "framework.json"
    path.write_text(json.dumps(framework, indent=2, ensure_ascii=False), encoding="utf-8")
    return path
