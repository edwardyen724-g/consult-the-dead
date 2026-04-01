"""Tier 2 Validation — Internal Consistency.

Checks that framework responses are internally consistent:
- Reasoning steps trace back to documented constructs/lens
- No contradictions between responses to different scenarios
- Perceptual lens is applied consistently
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from framework_forge.config import TIER2_MIN_TRACEABILITY


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class Tier2Result:
    """Aggregate result of Tier 2 validation."""

    traceability_ratio: float
    lens_consistent: bool
    contradictions: list[dict]
    per_scenario_details: list[dict]

    @property
    def passed(self) -> bool:
        return (
            self.traceability_ratio >= TIER2_MIN_TRACEABILITY
            and self.lens_consistent
            and len(self.contradictions) == 0
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "traceability_ratio": self.traceability_ratio,
            "lens_consistent": self.lens_consistent,
            "contradictions": self.contradictions,
            "per_scenario_details": self.per_scenario_details,
            "passed": self.passed,
        }


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

TIER2_SYSTEM = (
    "You are an expert consistency auditor for decision-making frameworks. "
    "Your job is to verify that framework-generated responses are internally "
    "consistent: reasoning traces back to documented constructs, the perceptual "
    "lens is applied uniformly, and there are no logical contradictions."
)

TIER2_PROMPT = (
    "Audit the internal consistency of these framework responses.\n\n"
    "FRAMEWORK:\n{framework}\n\n"
    "SCENARIO RESPONSES:\n{scenarios}\n\n"
    "For each scenario response, check:\n"
    "1. What fraction of reasoning steps trace to a documented construct or the "
    "perceptual lens? (traceability)\n"
    "2. Is the perceptual lens applied consistently across all responses?\n"
    "3. Are there any contradictions where the framework gives opposite advice "
    "for similar situations without justification?\n\n"
    "Return JSON with keys:\n"
    "- traceability_ratio (float 0-1): fraction of reasoning steps traceable\n"
    "- lens_consistent (bool): whether the lens is applied consistently\n"
    "- contradictions (list of dicts with construct, scenario_a, scenario_b, explanation)\n"
    "- per_scenario_details (list of dicts with scenario, traceable_steps, total_steps, "
    "lens_aligned, contradiction)"
)


# ---------------------------------------------------------------------------
# Functions
# ---------------------------------------------------------------------------


def run_tier2(
    framework: dict,
    tier1_scenarios: list[dict],
    client: Any = None,
) -> Tier2Result:
    """Run Tier 2 internal consistency validation.

    Args:
        framework: The assembled framework dict.
        tier1_scenarios: List of dicts with scenario, framework_response, baseline_response.
        client: LLMClient instance (or mock).

    Returns:
        Tier2Result with consistency audit results.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    prompt = TIER2_PROMPT.format(
        framework=json.dumps(framework, indent=2),
        scenarios=json.dumps(tier1_scenarios, indent=2),
    )

    result = client.prompt_json(system=TIER2_SYSTEM, user=prompt)

    return Tier2Result(
        traceability_ratio=result.get("traceability_ratio", 0.0),
        lens_consistent=result.get("lens_consistent", False),
        contradictions=result.get("contradictions", []),
        per_scenario_details=result.get("per_scenario_details", []),
    )
