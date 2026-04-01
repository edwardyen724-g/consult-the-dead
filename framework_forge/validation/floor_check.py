"""Floor Check — Historical Decision Alignment.

Verifies that the framework can retrodict (predict in hindsight) the
thinker's known historical decisions at a minimum alignment rate.
This is a necessary-but-not-sufficient check: if the framework cannot
even explain past decisions, it certainly cannot predict future ones.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from framework_forge.config import FLOOR_CHECK_MIN_ALIGNMENT


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class FloorCheckResult:
    """Result of floor check validation."""

    alignment_ratio: float
    per_decision_results: list[dict]

    @property
    def passed(self) -> bool:
        return self.alignment_ratio >= FLOOR_CHECK_MIN_ALIGNMENT

    def to_dict(self) -> dict[str, Any]:
        return {
            "alignment_ratio": self.alignment_ratio,
            "per_decision_results": self.per_decision_results,
            "passed": self.passed,
        }


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

FLOOR_CHECK_SYSTEM = (
    "You are an expert evaluator testing whether a thinking framework "
    "can retrodict (predict in hindsight) known historical decisions. "
    "For each historical decision, determine whether the framework would "
    "have predicted that decision given the context."
)

FLOOR_CHECK_PROMPT = (
    "Given this thinking framework:\n{framework}\n\n"
    "For each of the following historical decisions, determine whether "
    "the framework would have predicted this decision.\n\n"
    "HISTORICAL DECISIONS:\n{decisions}\n\n"
    "Return JSON with keys:\n"
    "- alignment_ratio (float 0-1): fraction of decisions the framework retrodicts\n"
    "- per_decision_results (list of dicts with decision, framework_would_predict, "
    "aligned (bool), reasoning)"
)


# ---------------------------------------------------------------------------
# Functions
# ---------------------------------------------------------------------------


def run_floor_check(
    framework: dict,
    historical_decisions: list[dict],
    client: Any = None,
) -> FloorCheckResult:
    """Run floor check against known historical decisions.

    Args:
        framework: The assembled framework dict.
        historical_decisions: List of dicts with at least 'decision' and 'context'.
        client: LLMClient instance (or mock).

    Returns:
        FloorCheckResult with alignment ratio and per-decision details.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    prompt = FLOOR_CHECK_PROMPT.format(
        framework=json.dumps(framework, indent=2),
        decisions=json.dumps(historical_decisions, indent=2),
    )

    result = client.prompt_json(system=FLOOR_CHECK_SYSTEM, user=prompt)

    return FloorCheckResult(
        alignment_ratio=result.get("alignment_ratio", 0.0),
        per_decision_results=result.get("per_decision_results", []),
    )
