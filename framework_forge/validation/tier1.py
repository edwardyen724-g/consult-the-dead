"""Tier 1 Validation — Baseline Differentiation.

Generates scenarios, produces framework vs. baseline responses,
and scores divergence to verify the framework is meaningfully different
from generic expert advice.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from framework_forge.config import TIER1_MIN_DIVERGENT_SCENARIOS, TIER1_MIN_SCENARIOS


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class ScenarioResult:
    """Result of a single scenario comparison."""

    scenario: str
    framework_response: str
    baseline_response: str
    divergence_score: int
    specificity_score: int
    traceability_score: int
    divergent: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "scenario": self.scenario,
            "framework_response": self.framework_response,
            "baseline_response": self.baseline_response,
            "divergence_score": self.divergence_score,
            "specificity_score": self.specificity_score,
            "traceability_score": self.traceability_score,
            "divergent": self.divergent,
        }


@dataclass
class Tier1Result:
    """Aggregate result of Tier 1 validation."""

    scenario_results: list[ScenarioResult]

    @property
    def divergent_count(self) -> int:
        return sum(1 for r in self.scenario_results if r.divergent)

    @property
    def passed(self) -> bool:
        return self.divergent_count >= TIER1_MIN_DIVERGENT_SCENARIOS

    def to_dict(self) -> dict[str, Any]:
        return {
            "divergent_count": self.divergent_count,
            "total_scenarios": len(self.scenario_results),
            "passed": self.passed,
            "scenario_results": [r.to_dict() for r in self.scenario_results],
        }


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

SCENARIO_SYSTEM = (
    "You are an expert scenario designer for testing decision-making frameworks. "
    "Generate realistic, domain-specific scenarios that would reveal differences "
    "between a specific thinker's approach and conventional expert advice."
)

SCENARIO_PROMPT = (
    "Generate a new decision scenario for testing the thinking framework of {person} "
    "in the domain of {domain}.\n\n"
    "The scenario should:\n"
    "- Present a genuine decision point with real tradeoffs\n"
    "- Be specific enough that different frameworks would produce different advice\n"
    "- Not overlap with these existing scenarios:\n{existing}\n\n"
    "Return JSON with keys: scenario, domain_context, decision_required."
)

FRAMEWORK_RESPONSE_SYSTEM = (
    "You are role-playing as {person}, using their documented thinking framework "
    "to respond to a decision scenario. Your response should reflect the specific "
    "perceptual lens, constructs, and decision patterns documented in the framework."
)

FRAMEWORK_RESPONSE_PROMPT = (
    "Using this thinking framework:\n{framework}\n\n"
    "Respond to this scenario as {person} would:\n{scenario}\n\n"
    "Provide a specific recommendation with reasoning that traces back to "
    "the framework's constructs and perceptual lens."
)

BASELINE_RESPONSE_SYSTEM = (
    "You are a competent expert in {person}'s domain. You give solid, "
    "conventional expert advice without any specific personal framework."
)

BASELINE_RESPONSE_PROMPT = (
    "As a competent expert, respond to this decision scenario:\n{scenario}\n\n"
    "Provide a specific recommendation with reasoning."
)

SCORE_SYSTEM = (
    "You are an expert evaluator comparing two responses to the same scenario. "
    "Score how different the framework response is from the baseline response."
)

SCORE_PROMPT = (
    "Compare these two responses to the same scenario.\n\n"
    "SCENARIO:\n{scenario}\n\n"
    "FRAMEWORK RESPONSE:\n{framework_response}\n\n"
    "BASELINE RESPONSE:\n{baseline_response}\n\n"
    "Score each dimension 1-10:\n"
    "- divergence_score: How different is the framework response from baseline?\n"
    "- specificity_score: How specific is the framework response to this thinker?\n"
    "- traceability_score: Can reasoning be traced to framework constructs?\n\n"
    "Also determine 'divergent' (true/false): is the framework response meaningfully "
    "different from what any competent expert would say?\n\n"
    "Return JSON with keys: divergence_score, specificity_score, traceability_score, "
    "divergent, reasoning."
)


# ---------------------------------------------------------------------------
# Functions
# ---------------------------------------------------------------------------


def generate_scenario(
    person: str,
    domain: str,
    existing_scenarios: list[str],
    client: Any = None,
) -> dict:
    """Generate a new decision scenario via LLM.

    Args:
        person: Name of the historical figure.
        domain: Their domain of expertise.
        existing_scenarios: Previously generated scenarios to avoid overlap.
        client: LLMClient instance (or mock).

    Returns:
        Dict with scenario, domain_context, decision_required.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    existing_text = "\n".join(f"- {s}" for s in existing_scenarios) if existing_scenarios else "(none)"
    prompt = SCENARIO_PROMPT.format(person=person, domain=domain, existing=existing_text)
    return client.prompt_json(system=SCENARIO_SYSTEM, user=prompt)


def generate_framework_response(
    scenario: dict,
    framework: dict,
    person: str,
    client: Any = None,
) -> str:
    """Generate a response to the scenario using the thinking framework.

    Returns the raw text response.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    system = FRAMEWORK_RESPONSE_SYSTEM.format(person=person)
    prompt = FRAMEWORK_RESPONSE_PROMPT.format(
        framework=json.dumps(framework, indent=2),
        person=person,
        scenario=json.dumps(scenario),
    )
    resp = client.prompt(system=system, user=prompt)
    return resp.raw_text


def generate_baseline_response(
    scenario: dict,
    person: str,
    client: Any = None,
) -> str:
    """Generate a conventional expert response to the scenario.

    Returns the raw text response.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    system = BASELINE_RESPONSE_SYSTEM.format(person=person)
    prompt = BASELINE_RESPONSE_PROMPT.format(scenario=json.dumps(scenario))
    resp = client.prompt(system=system, user=prompt)
    return resp.raw_text


def score_divergence(
    framework_response: str,
    baseline_response: str,
    scenario: dict,
    client: Any = None,
) -> dict:
    """Score the divergence between framework and baseline responses.

    Returns dict with divergence_score, specificity_score, traceability_score,
    divergent, reasoning.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    prompt = SCORE_PROMPT.format(
        scenario=json.dumps(scenario),
        framework_response=framework_response,
        baseline_response=baseline_response,
    )
    return client.prompt_json(system=SCORE_SYSTEM, user=prompt)


def run_tier1(
    framework: dict,
    person: str,
    domain: str,
    num_scenarios: int = TIER1_MIN_SCENARIOS,
    client: Any = None,
) -> Tier1Result:
    """Run full Tier 1 validation: generate scenarios, compare responses, score.

    Args:
        framework: The assembled framework dict.
        person: Name of the historical figure.
        domain: Their domain of expertise.
        num_scenarios: Number of scenarios to generate.
        client: LLMClient instance (or mock).

    Returns:
        Tier1Result with all scenario results.
    """
    if client is None:
        from framework_forge.llm import LLMClient
        client = LLMClient()

    results: list[ScenarioResult] = []
    existing: list[str] = []

    for _ in range(num_scenarios):
        # Generate scenario
        scenario = generate_scenario(person, domain, existing, client=client)
        scenario_text = scenario.get("scenario", str(scenario))
        existing.append(scenario_text)

        # Generate both responses
        fw_response = generate_framework_response(scenario, framework, person, client=client)
        bl_response = generate_baseline_response(scenario, person, client=client)

        # Score divergence
        scores = score_divergence(fw_response, bl_response, scenario, client=client)

        results.append(
            ScenarioResult(
                scenario=scenario_text,
                framework_response=fw_response,
                baseline_response=bl_response,
                divergence_score=scores.get("divergence_score", 0),
                specificity_score=scores.get("specificity_score", 0),
                traceability_score=scores.get("traceability_score", 0),
                divergent=scores.get("divergent", False),
            )
        )

    return Tier1Result(scenario_results=results)
