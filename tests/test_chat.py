"""Regression tests for framework_forge/chat.py — system prompt contract.

These tests lock down the content contract for framework_to_system_prompt():
- person name must appear in the output
- perceptual lens statement must appear
- each construct name must appear
- each divergence prediction's situation_type must appear
- edge cases: empty constructs and empty predictions must not raise
"""

from __future__ import annotations

import pytest

from framework_forge.chat import framework_to_system_prompt


# ---------------------------------------------------------------------------
# Shared minimal fixture
# ---------------------------------------------------------------------------

def _make_framework(
    person: str = "Marie Curie",
    lens_statement: str = "Curie perceives phenomena as measurement problems waiting to be solved.",
    constructs: list | None = None,
    predictions: list | None = None,
) -> dict:
    """Build a minimal but valid framework dict for testing."""
    if constructs is None:
        constructs = [
            {
                "construct": "rigorous evidence vs. unfounded assumption",
                "positive_pole": "Draws conclusions only from reproducible measurements",
                "negative_pole": "Relies on intuition or convention without empirical support",
                "behavioral_implication": "Reject claims that cannot be verified experimentally.",
            },
            {
                "construct": "independent inquiry vs. deference to authority",
                "positive_pole": "Challenges established theories with new data",
                "negative_pole": "Accepts expert consensus without verification",
                "behavioral_implication": "Pursue anomalies even when peers dismiss them.",
            },
        ]
    if predictions is None:
        predictions = [
            {
                "situation_type": "unexpected experimental result",
                "ordinary_response": "Recheck for measurement error and discard the anomaly",
                "framework_response": "Treat the anomaly as a signal — investigate its source systematically",
                "because": "Anomalies are the entry points to new phenomena",
            },
            {
                "situation_type": "peer review rejection",
                "ordinary_response": "Revise the paper to align with reviewer expectations",
                "framework_response": "Re-examine whether the reviewers' objections are measurement-based",
                "because": "Authority is only as valid as the data behind it",
            },
        ]
    return {
        "meta": {
            "person": person,
            "construct_count": len(constructs),
            "incident_count": 0,
            "prediction_count": len(predictions),
        },
        "perceptual_lens": {
            "statement": lens_statement,
            "what_they_notice_first": "Quantifiable signals in experimental data",
            "what_they_ignore": "Unverifiable anecdotes and appeals to authority",
        },
        "bipolar_constructs": constructs,
        "behavioral_divergence_predictions": predictions,
        "critical_incident_database": [],
    }


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestFrameworkToSystemPromptPersonName:
    """The person's name must appear in the generated system prompt."""

    def test_framework_to_system_prompt_includes_person_name(self):
        framework = _make_framework(person="Marie Curie")
        prompt = framework_to_system_prompt(framework)
        assert "Marie Curie" in prompt, (
            "Expected person name 'Marie Curie' to appear in the system prompt"
        )

    def test_person_name_appears_multiple_times_for_context_headers(self):
        """The name should appear in at least the opening sentence and reference section."""
        framework = _make_framework(person="Marie Curie")
        prompt = framework_to_system_prompt(framework)
        assert prompt.count("Marie Curie") >= 2, (
            "Person name should appear in multiple places (opening, reference section)"
        )


class TestFrameworkToSystemPromptLensStatement:
    """The perceptual lens statement must appear verbatim in the output."""

    def test_framework_to_system_prompt_includes_lens_statement(self):
        lens_statement = "Curie perceives phenomena as measurement problems waiting to be solved."
        framework = _make_framework(lens_statement=lens_statement)
        prompt = framework_to_system_prompt(framework)
        assert lens_statement in prompt, (
            f"Expected lens statement to appear verbatim in system prompt.\n"
            f"Statement: {lens_statement!r}"
        )


class TestFrameworkToSystemPromptConstructNames:
    """Every bipolar construct name must appear in the system prompt."""

    def test_framework_to_system_prompt_includes_construct_names(self):
        constructs = [
            {
                "construct": "rigorous evidence vs. unfounded assumption",
                "positive_pole": "Draws conclusions only from reproducible measurements",
                "negative_pole": "Relies on intuition without empirical support",
                "behavioral_implication": "Reject unverifiable claims.",
            },
            {
                "construct": "independent inquiry vs. deference to authority",
                "positive_pole": "Challenges established theories with new data",
                "negative_pole": "Accepts expert consensus without verification",
                "behavioral_implication": "Pursue anomalies even when peers dismiss them.",
            },
        ]
        framework = _make_framework(constructs=constructs)
        prompt = framework_to_system_prompt(framework)

        for c in constructs:
            assert c["construct"] in prompt, (
                f"Expected construct name {c['construct']!r} to appear in system prompt"
            )


class TestFrameworkToSystemPromptDivergenceSituations:
    """Every divergence prediction's situation_type must appear in the system prompt."""

    def test_framework_to_system_prompt_includes_divergence_situations(self):
        predictions = [
            {
                "situation_type": "unexpected experimental result",
                "ordinary_response": "Recheck for measurement error and discard",
                "framework_response": "Investigate the anomaly systematically",
                "because": "Anomalies signal new phenomena",
            },
            {
                "situation_type": "peer review rejection",
                "ordinary_response": "Revise to meet reviewer expectations",
                "framework_response": "Re-examine the measurement basis of objections",
                "because": "Authority is only as valid as the data behind it",
            },
        ]
        framework = _make_framework(predictions=predictions)
        prompt = framework_to_system_prompt(framework)

        for p in predictions:
            assert p["situation_type"] in prompt, (
                f"Expected situation_type {p['situation_type']!r} to appear in system prompt"
            )


class TestFrameworkToSystemPromptEdgeCases:
    """Edge cases: empty lists must not raise and must still include person name."""

    def test_framework_to_system_prompt_empty_constructs(self):
        framework = _make_framework(person="Marie Curie", constructs=[])
        # Must not raise
        prompt = framework_to_system_prompt(framework)
        assert "Marie Curie" in prompt, (
            "Person name must still appear when bipolar_constructs is empty"
        )

    def test_framework_to_system_prompt_empty_predictions(self):
        framework = _make_framework(person="Marie Curie", predictions=[])
        # Must not raise
        prompt = framework_to_system_prompt(framework)
        assert "Marie Curie" in prompt, (
            "Person name must still appear when behavioral_divergence_predictions is empty"
        )

    def test_framework_to_system_prompt_empty_constructs_and_predictions(self):
        """Fully stripped framework — only meta and lens — must not raise."""
        framework = _make_framework(person="Marie Curie", constructs=[], predictions=[])
        prompt = framework_to_system_prompt(framework)
        assert isinstance(prompt, str)
        assert len(prompt) > 0
