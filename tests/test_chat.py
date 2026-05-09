"""Tests for the framework chat adapter."""

from __future__ import annotations

from click.testing import CliRunner
from pathlib import Path
from unittest.mock import MagicMock, patch

import json

from framework_forge.chat import MODEL, chat, chat_with_framework, framework_to_system_prompt


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


def _assert_chat_exits_cleanly_on_input_interrupt(
    input_exc: type[BaseException], tmp_path: Path
) -> None:
    framework_path = tmp_path / "framework.json"
    framework_path.write_text(json.dumps(build_framework()), encoding="utf-8")

    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="Stay focused.")]
    mock_messages = MagicMock()
    mock_messages.create.return_value = mock_response

    with patch("framework_forge.chat.LLMClient") as mock_llm_client_cls, patch(
        "builtins.input", side_effect=input_exc()
    ) as mock_input:
        mock_client = MagicMock()
        mock_client._client.messages = mock_messages
        mock_llm_client_cls.return_value = mock_client

        chat_with_framework(framework_path)

    mock_input.assert_called_once()
    mock_messages.create.assert_not_called()


def test_chat_with_framework_exits_cleanly_on_eof(tmp_path: Path) -> None:
    _assert_chat_exits_cleanly_on_input_interrupt(EOFError, tmp_path)


def test_chat_with_framework_exits_cleanly_on_keyboard_interrupt(
    tmp_path: Path,
) -> None:
    _assert_chat_exits_cleanly_on_input_interrupt(KeyboardInterrupt, tmp_path)


@patch("framework_forge.chat.LLMClient")
@patch("builtins.input", side_effect=["", "quit"])
def test_chat_with_framework_exits_on_blank_input(
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

    mock_messages.create.assert_not_called()


@patch("framework_forge.chat.LLMClient")
@patch("builtins.input", side_effect=["First question?", "Second question?", "quit"])
def test_chat_with_framework_carries_history_between_turns(
    mock_input: MagicMock,
    mock_llm_client_cls: MagicMock,
    tmp_path: Path,
) -> None:
    framework_path = tmp_path / "framework.json"
    framework_path.write_text(json.dumps(build_framework()), encoding="utf-8")

    first_response = MagicMock()
    first_response.content = [MagicMock(text="First reply.")]
    second_response = MagicMock()
    second_response.content = [MagicMock(text="Second reply.")]
    mock_messages = MagicMock()
    mock_messages.create.side_effect = [first_response, second_response]
    mock_client = MagicMock()
    mock_client._client.messages = mock_messages
    mock_llm_client_cls.return_value = mock_client

    chat_with_framework(framework_path)

    assert mock_messages.create.call_count == 2
    first_call = mock_messages.create.call_args_list[0].kwargs
    second_call = mock_messages.create.call_args_list[1].kwargs

    assert first_call["messages"] == [
        {"role": "user", "content": "First question?"}
    ]
    assert second_call["messages"] == [
        {"role": "user", "content": "First question?"},
        {"role": "assistant", "content": "First reply."},
        {"role": "user", "content": "Second question?"},
    ]


@patch("framework_forge.chat.chat_with_framework")
def test_chat_cli_delegates_to_chat_with_framework(
    mock_chat_with_framework: MagicMock,
    tmp_path: Path,
) -> None:
    framework_path = tmp_path / "framework.json"
    framework_path.write_text(json.dumps(build_framework()), encoding="utf-8")

    result = CliRunner().invoke(
        chat,
        ["--framework", str(framework_path), "--model", "claude-opus-4-20250514"],
    )

    assert result.exit_code == 0
    mock_chat_with_framework.assert_called_once_with(
        Path(framework_path), model="claude-opus-4-20250514"
    )
