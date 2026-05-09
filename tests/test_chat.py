"""Tests for the framework chat adapter."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import json

from framework_forge.chat import MODEL, chat_with_framework, framework_to_system_prompt


def build_framework(incident_count: int = 9) -> dict:
    return {
        "meta": {
            "person": "Steve Jobs",
            "construct_count": 2,
            "incident_count": incident_count,
            "prediction_count": 2,
        },
        "perceptual_lens": {
            "statement": "Sees products as complete experiences.",
            "what_they_notice_first": "Taste and coherence.",
            "what_they_ignore": "Feature checklists.",
        },
        "bipolar_constructs": [
            {
                "construct": "Polish vs. clutter",
                "positive_pole": "Polish",
                "negative_pole": "Clutter",
                "behavioral_implication": "Ship only what feels complete.",
            },
            {
                "construct": "End-to-end vs. modular",
                "positive_pole": "End-to-end",
                "negative_pole": "Modular",
                "behavioral_implication": "Own the whole experience.",
            },
        ],
        "behavioral_divergence_predictions": [
            {
                "situation_type": "Launch readiness",
                "ordinary_response": "Ship the minimum viable product.",
                "framework_response": "Delay until the product feels inevitable.",
                "because": "Experience quality outranks speed.",
            },
            {
                "situation_type": "Product scope",
                "ordinary_response": "Accumulate more features.",
                "framework_response": "Remove everything that weakens the core.",
                "because": "Focus creates coherence.",
            },
        ],
        "critical_incident_database": [
            {
                "decision": f"Decision {i + 1}",
                "context": f"Context {i + 1}",
                "cdm_probes": {
                    "situation_framing": f"Framing {i + 1}",
                    "cues_noticed": f"Cues {i + 1}",
                    "rejected_alternatives": f"Rejected {i + 1}",
                },
                "counterfactual": f"Counterfactual {i + 1}",
            }
            for i in range(incident_count)
        ],
    }


def test_framework_to_system_prompt_includes_core_framework_elements() -> None:
    framework = build_framework()

    prompt = framework_to_system_prompt(framework)

    assert "Steve Jobs" in prompt
    assert "Sees products as complete experiences." in prompt
    assert "Polish vs. clutter" in prompt
    assert "Launch readiness" in prompt
    assert "Decision 1" in prompt
    assert "Decision 8" in prompt
    assert "Decision 9" not in prompt


@patch("framework_forge.chat.LLMClient")
@patch("builtins.input", side_effect=["What should I do?", "quit"])
def test_chat_with_framework_uses_config_default_model_and_override(
    mock_input: MagicMock,
    mock_llm_client_cls: MagicMock,
    tmp_path: Path,
) -> None:
    framework_path = tmp_path / "framework.json"
    framework_path.write_text(json.dumps(build_framework()), encoding="utf-8")

    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="Stay focused.")]
    mock_messages = MagicMock()
    mock_messages.create.return_value = mock_response
    mock_client = MagicMock()
    mock_client._client.messages = mock_messages
    mock_llm_client_cls.return_value = mock_client

    chat_with_framework(framework_path)

    assert mock_llm_client_cls.called
    call_kwargs = mock_messages.create.call_args.kwargs
    assert call_kwargs["model"] == MODEL
    assert call_kwargs["system"]
    assert call_kwargs["messages"][-1] == {"role": "user", "content": "What should I do?"}

    mock_messages.create.reset_mock()
    mock_input.side_effect = ["How should I launch?", "quit"]

    chat_with_framework(framework_path, model="claude-opus-4-20250514")

    call_kwargs = mock_messages.create.call_args.kwargs
    assert call_kwargs["model"] == "claude-opus-4-20250514"
    assert call_kwargs["messages"][-1] == {"role": "user", "content": "How should I launch?"}
