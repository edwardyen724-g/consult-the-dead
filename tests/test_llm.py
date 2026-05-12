"""Tests for the Claude API wrapper."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from framework_forge.llm import LLMClient, LLMRequestError, LLMResponseError, StructuredResponse


class TestLLMClient:
    def test_init_requires_api_key(self):
        """Client should raise if no API key is provided or found."""
        with patch("framework_forge.llm.ANTHROPIC_API_KEY", ""):
            with pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
                LLMClient()

    def test_init_with_explicit_key(self):
        """Client should accept an explicit API key."""
        client = LLMClient(api_key="sk-ant-test-key")
        assert client.api_key == "sk-ant-test-key"

    def test_structured_response_parses_json(self):
        """StructuredResponse should parse JSON from text blocks."""
        raw_text = 'Here is the analysis:\n```json\n{"key": "value"}\n```\nDone.'
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content == {"key": "value"}

    def test_structured_response_no_json(self):
        """StructuredResponse should return None if no JSON found."""
        raw_text = "Just plain text with no JSON."
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content is None

    def test_structured_response_invalid_fenced_json_returns_none(self):
        """StructuredResponse should ignore malformed fenced JSON blocks."""
        raw_text = "```json\nnot-json\n```"
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content is None

    def test_structured_response_invalid_raw_json_returns_none(self):
        """StructuredResponse should ignore malformed inline JSON objects."""
        raw_text = "Before {not-json} after."
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content is None

    def test_structured_response_plain_text(self):
        """StructuredResponse should expose the full raw text."""
        raw_text = "Some analysis text."
        resp = StructuredResponse(raw_text=raw_text, input_tokens=10, output_tokens=5)
        assert resp.raw_text == "Some analysis text."

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_returns_structured_response(self, mock_anthropic_cls):
        """prompt() should return a StructuredResponse."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(text='```json\n{"result": "ok"}\n```')]
        mock_response.usage = SimpleNamespace(input_tokens=100, output_tokens=50)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")
        result = client.prompt(
            system="You are an analyst.",
            user="Analyze this.",
        )

        assert isinstance(result, StructuredResponse)
        assert result.json_content == {"result": "ok"}
        mock_client.messages.create.assert_called_once()

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_passes_stable_request_shape(self, mock_anthropic_cls):
        """prompt() should forward the stable Anthropic request shape."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(text="ok")]
        mock_response.usage = SimpleNamespace(input_tokens=10, output_tokens=5)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")
        client.prompt(system="sys", user="usr", model="claude-opus-4-20250514", max_tokens=8192)

        call_kwargs = mock_client.messages.create.call_args[1]
        assert call_kwargs == {
            "model": "claude-opus-4-20250514",
            "max_tokens": 8192,
            "system": "sys",
            "messages": [{"role": "user", "content": "usr"}],
        }

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_joins_all_text_blocks(self, mock_anthropic_cls):
        """prompt() should preserve every returned text block."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [
            SimpleNamespace(text="Hello, "),
            SimpleNamespace(text="world."),
            SimpleNamespace(type="tool_use"),
        ]
        mock_response.usage = SimpleNamespace(input_tokens=4, output_tokens=2)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")
        result = client.prompt(system="sys", user="usr")

        assert result.raw_text == "Hello, world."

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_raises_when_no_text_content(self, mock_anthropic_cls):
        """prompt() should fail loudly if Anthropic returns no text blocks."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(type="tool_use")]
        mock_response.usage = SimpleNamespace(input_tokens=1, output_tokens=1)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(LLMResponseError, match="no text content"):
            client.prompt(system="sys", user="usr")

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_wraps_client_errors(self, mock_anthropic_cls):
        """prompt() should wrap SDK failures in a stable wrapper exception."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = RuntimeError("rate limited")
        mock_anthropic_cls.return_value = mock_client

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(LLMRequestError, match="Anthropic request failed"):
            client.prompt(system="sys", user="usr")

        assert isinstance(mock_client.messages.create.call_args[1], dict)

    @pytest.mark.parametrize(
        "system,user,max_tokens,expected_error",
        [
            ("", "usr", 1, "system must be a non-empty string"),
            ("sys", "", 1, "user must be a non-empty string"),
            ("sys", "usr", 0, "max_tokens must be a positive integer"),
            ("sys", "usr", "bad", "max_tokens must be an int"),
        ],
    )
    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_validates_inputs(self, mock_anthropic_cls, system, user, max_tokens, expected_error):
        """prompt() should reject invalid inputs before making a request."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises((TypeError, ValueError), match=expected_error):
            client.prompt(system=system, user=user, max_tokens=max_tokens)

        mock_client.messages.create.assert_not_called()

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_raises_when_usage_is_missing(self, mock_anthropic_cls):
        """prompt() should fail loudly if usage metadata is absent."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(text="ok")]
        mock_response.usage = None
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(LLMResponseError, match="missing usage metadata"):
            client.prompt(system="sys", user="usr")

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_raises_when_usage_is_invalid(self, mock_anthropic_cls):
        """prompt() should fail loudly if usage metadata is incomplete."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(text="ok")]
        mock_response.usage = SimpleNamespace(input_tokens="1", output_tokens=None)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(LLMResponseError, match="usage metadata is incomplete or invalid"):
            client.prompt(system="sys", user="usr")

    @patch("framework_forge.llm.LLMClient.prompt")
    def test_prompt_json_raises_when_no_json_is_returned(self, mock_prompt):
        """prompt_json() should surface a clear error when parsing fails."""
        mock_prompt.return_value = StructuredResponse(
            raw_text="plain text only",
            input_tokens=1,
            output_tokens=1,
        )

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="Expected JSON response"):
            client.prompt_json(system="sys", user="usr")

    @patch("framework_forge.llm.LLMClient.prompt")
    def test_prompt_json_returns_parsed_json(self, mock_prompt):
        """prompt_json() should return the parsed JSON payload on success."""
        mock_prompt.return_value = StructuredResponse(
            raw_text='```json\n{"answer": "ok"}\n```',
            input_tokens=1,
            output_tokens=1,
        )

        client = LLMClient(api_key="sk-ant-test-key")

        assert client.prompt_json(system="sys", user="usr") == {"answer": "ok"}
