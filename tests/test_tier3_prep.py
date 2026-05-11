from __future__ import annotations

import json
from pathlib import Path

from framework_forge.validation.tier1 import ScenarioResult, Tier1Result
from framework_forge.validation.tier3_prep import prepare_tier3_materials


class SequenceRandom:
    def __init__(self, values: list[float]):
        self._values = iter(values)

    def random(self) -> float:
        return next(self._values)


def _build_tier1_result() -> Tier1Result:
    return Tier1Result(
        scenario_results=[
            ScenarioResult(
                scenario="scenario-1",
                framework_response="framework-response-1",
                baseline_response="baseline-response-1",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            ),
            ScenarioResult(
                scenario="scenario-2",
                framework_response="framework-response-2",
                baseline_response="baseline-response-2",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            ),
        ]
    )


def _read_packet(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_prepare_tier3_materials_accepts_injected_random_source(tmp_path):
    tier1 = _build_tier1_result()

    output_path = prepare_tier3_materials(
        tier1_results=tier1,
        person="Steve Jobs",
        output_dir=tmp_path / "validation" / "tier3_materials",
        random_source=SequenceRandom([0.4, 0.6]),
    )

    packet = _read_packet(output_path)

    assert output_path.name == "review_packet.json"
    assert packet["person"] == "Steve Jobs"
    assert [pair["labels"] for pair in packet["pairs"]] == [
        {"response_a": "framework", "response_b": "baseline"},
        {"response_a": "baseline", "response_b": "framework"},
    ]
    assert [pair["response_a"] for pair in packet["pairs"]] == [
        "framework-response-1",
        "baseline-response-2",
    ]
    assert [pair["response_b"] for pair in packet["pairs"]] == [
        "baseline-response-1",
        "framework-response-2",
    ]


def test_prepare_tier3_materials_seed_is_reproducible(tmp_path):
    tier1 = _build_tier1_result()
    output_dir = tmp_path / "validation" / "tier3_materials"

    first_path = prepare_tier3_materials(
        tier1_results=tier1,
        person="Steve Jobs",
        output_dir=output_dir,
        seed=17,
    )
    second_path = prepare_tier3_materials(
        tier1_results=tier1,
        person="Steve Jobs",
        output_dir=output_dir,
        seed=17,
    )

    first_packet = _read_packet(first_path)
    second_packet = _read_packet(second_path)

    assert first_path == second_path
    assert first_packet == second_packet
    assert first_packet["instructions"].startswith(
        "For each scenario below, two responses are given (A and B)."
    )


def test_prepare_tier3_materials_uses_default_rng_when_unseeded(tmp_path):
    tier1 = _build_tier1_result()

    output_path = prepare_tier3_materials(
        tier1_results=tier1,
        person="Steve Jobs",
        output_dir=tmp_path / "validation" / "tier3_materials",
    )

    packet = _read_packet(output_path)

    assert output_path.name == "review_packet.json"
    assert len(packet["pairs"]) == 2
    assert {pair["scenario"] for pair in packet["pairs"]} == {
        "scenario-1",
        "scenario-2",
    }
