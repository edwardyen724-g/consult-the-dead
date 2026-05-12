"""Tier 3 Preparation — Human Review Materials.

Generates randomized A/B paired response packets for blind human review.
A human evaluator receives pairs of responses (framework vs. baseline)
without knowing which is which, and judges which better captures the
thinker's actual decision-making style.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from framework_forge.validation.tier1 import Tier1Result


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class Tier3Result:
    """Result of Tier 3 material preparation.

    Wraps the written review packet so callers have a stable result object
    with pass/fail semantics and failure reasons — consistent with Tier1Result,
    Tier2Result, and FloorCheckResult for release-gate reporting.
    """

    path: Path
    person: str
    pairs: list[dict]

    @property
    def passed(self) -> bool:
        """True when at least one scenario pair was written to disk."""
        return len(self.pairs) > 0

    @property
    def failure_reasons(self) -> list[str]:
        """Human-readable reasons for failure, empty when passed.

        Suitable for release-gate reporting and CI output.
        """
        if self.passed:
            return []
        return ["No scenario pairs were generated for human review"]

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": str(self.path),
            "person": self.person,
            "pair_count": len(self.pairs),
            "passed": self.passed,
            "failure_reasons": self.failure_reasons,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Tier3Result":
        """Reconstruct a Tier3Result from a to_dict() snapshot.

        Note: ``pairs`` are not stored in to_dict() to keep the summary compact.
        Load the full packet from ``path`` if you need the pair data.
        """
        return cls(
            path=Path(data["path"]),
            person=data["person"],
            pairs=[],
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _resolve_random_source(
    random_source: Any | None = None,
    seed: int | None = None,
) -> Any:
    """Return a random source with a ``random()`` method.

    An explicit random source takes precedence over a seed so tests can inject
    a custom deterministic sequence, while operators can still reproduce a
    packet by passing a seed.
    """
    if random_source is not None:
        return random_source
    if seed is not None:
        return random.Random(seed)
    return random.Random()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def prepare_tier3_materials(
    tier1_results: "Tier1Result",
    person: str,
    output_dir: Path,
    *,
    random_source: Any | None = None,
    seed: int | None = None,
) -> Tier3Result:
    """Generate review_packet.json with randomized A/B paired responses.

    For each scenario, randomly assigns the framework and baseline responses
    to "response_a" and "response_b", with labels stored separately as an
    answer key.

    Args:
        tier1_results: Completed Tier 1 results with scenario comparisons.
        person: Name of the historical figure.
        output_dir: Directory to write the review packet to.
        random_source: Optional RNG with a ``random()`` method (for testing).
        seed: Optional integer seed for reproducibility.

    Returns:
        Tier3Result containing the output path, person, and generated pairs.
    """
    rng = _resolve_random_source(random_source=random_source, seed=seed)
    pairs: list[dict] = []

    for sr in tier1_results.scenario_results:
        # Randomize which response is A and which is B
        if rng.random() < 0.5:
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

    return Tier3Result(path=path, person=person, pairs=pairs)
