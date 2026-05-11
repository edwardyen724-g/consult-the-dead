"""Tests for the Claude API wrapper."""

import json
from types import SimpleNamespace

import pytest
from unittest.mock import MagicMock, patch

from framework_forge.llm import LLMClient, StructuredResponse


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
    def test_prompt_builds_stable_request(self, mock_anthropic_cls):
        """prompt() should forward the expected Anthropic request shape."""
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
        """prompt() should preserve all text returned by the SDK."""
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

        with pytest.raises(ValueError, match="no text content was returned"):
            client.prompt(system="sys", user="usr")

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_raises_on_malformed_json_in_fence(self, mock_anthropic_cls):
        """prompt_json() should raise ValueError when the fenced block contains invalid JSON
        and there is no valid JSON object elsewhere in the response."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        # Fence content is syntactically broken; no valid {…} anywhere else.
        mock_response = MagicMock()
        mock_response.content = [SimpleNamespace(text="```json\n{broken: [}\n```")]
        mock_response.usage = SimpleNamespace(input_tokens=12, output_tokens=8)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="Expected JSON response"):
            client.prompt_json(system="sys", user="usr")

    def test_structured_response_malformed_json_fence_blocks_raw_fallback(self):
        """When fence JSON is malformed AND the raw-regex spans both the broken fence
        content and any trailing JSON (due to greedy DOTALL matching), both extraction
        paths fail and json_content returns None.

        Concretely: r"\\{.*\\}" with re.DOTALL matches from the first '{' in the fence
        all the way to the last '}' in the text, producing a multi-line blob that
        json.loads rejects — so no partial recovery occurs.
        """
        raw_text = "```json\n{broken: [}\n```\n{\"key\": \"val\"}"
        resp = StructuredResponse(raw_text=raw_text, input_tokens=10, output_tokens=5)
        assert resp.json_content is None

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_raises_on_empty_response(self, mock_anthropic_cls):
        """prompt_json() should propagate the ValueError raised by _extract_response_text
        when the API returns an empty content list (no text blocks at all)."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = []  # empty — no text blocks at all
        mock_response.usage = SimpleNamespace(input_tokens=0, output_tokens=0)
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="no text content was returned"):
            client.prompt_json(system="sys", user="usr")
