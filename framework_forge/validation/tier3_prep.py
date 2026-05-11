"""Tier 3 Preparation — Human Review Materials.

Generates randomized A/B paired response packets for blind human review.
A human evaluator receives pairs of responses (framework vs. baseline)
without knowing which is which, and judges which better captures the
thinker's actual decision-making style.
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any, Callable, TYPE_CHECKING

if TYPE_CHECKING:
    from framework_forge.validation.tier1 import Tier1Result


def _resolve_random_source(
    random_source: Callable[[], float] | None,
    seed: int | None,
) -> Callable[[], float]:
    """Resolve the randomness source used to place responses."""
    if random_source is not None:
        return random_source
    if seed is not None:
        return random.Random(seed).random
    return random.random


def prepare_tier3_materials(
    tier1_results: Tier1Result,
    person: str,
    output_dir: Path,
    random_source: Callable[[], float] | None = None,
    seed: int | None = None,
) -> Path:
    """Generate review_packet.json with randomized A/B paired responses.

    For each scenario, randomly assigns the framework and baseline responses
    to "response_a" and "response_b", with labels stored separately as an
    answer key.

    Args:
        tier1_results: Completed Tier 1 results with scenario comparisons.
        person: Name of the historical figure.
        output_dir: Directory to write the review packet to.
        random_source: Optional callable returning a float in [0.0, 1.0).
        seed: Optional seed for deterministic shuffling when random_source
            is not provided.

    Returns:
        Path to the written review_packet.json.
    """
    pick_random = _resolve_random_source(random_source, seed)
    pairs = []

    for sr in tier1_results.scenario_results:
        # Randomize which response is A and which is B
        if pick_random() < 0.5:
            response_a = sr.framework_response
            response_b = sr.baseline_response
            labels = {"response_a": "framework", "response_b": "baseline"}
        else:
            response_a = sr.baseline_response
            response_b = sr.framework_response
            labels = {"response_a": "baseline", "response_b": "framework"}

        pairs.append({
            "scenario": sr.scenario,
            "response_a": response_a,
            "response_b": response_b,
            "labels": labels,
        })

    packet = {
        "person": person,
        "instructions": (
            f"For each scenario below, two responses are given (A and B). "
            f"One was generated using a thinking framework modeled on {person}'s "
            f"decision-making patterns. The other is generic expert advice. "
            f"For each pair, indicate which response (A or B) better captures "
            f"how {person} would actually think about and respond to this situation."
        ),
        "pairs": pairs,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "review_packet.json"
    path.write_text(json.dumps(packet, indent=2, ensure_ascii=False), encoding="utf-8")
    return path
