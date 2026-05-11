"""Tests for the Claude API wrapper."""

import json
import pytest
from unittest.mock import patch, MagicMock
from framework_forge.llm import LLMClient, StructuredResponse


class TestLLMClient:
    def test_init_requires_api_key(self):
        """Client should raise if no API key is provided or found."""
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
                LLMClient(api_key="")

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

    def test_structured_response_parses_raw_json(self):
        """StructuredResponse should parse raw JSON objects when no fence is present."""
        raw_text = 'Here is the payload: {"key": "value"}'
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content == {"key": "value"}

    def test_structured_response_falls_back_to_raw_json_after_bad_fence(self):
        """StructuredResponse should ignore a bad fenced block and use raw JSON fallback."""
        raw_text = "```json\nnot valid json\n```\n{\"fallback\": true}"
        resp = StructuredResponse(raw_text=raw_text, input_tokens=100, output_tokens=50)
        assert resp.json_content == {"fallback": True}

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
        mock_response.content = [MagicMock(text='```json\n{"result": "ok"}\n```')]
        mock_response.usage.input_tokens = 100
        mock_response.usage.output_tokens = 50
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
    def test_prompt_passes_model_and_max_tokens(self, mock_anthropic_cls):
        """prompt() should forward model and max_tokens."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="ok")]
        mock_response.usage.input_tokens = 10
        mock_response.usage.output_tokens = 5
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")
        client.prompt(system="sys", user="usr", model="claude-opus-4-20250514", max_tokens=8192)

        call_kwargs = mock_client.messages.create.call_args[1]
        assert call_kwargs["model"] == "claude-opus-4-20250514"
        assert call_kwargs["max_tokens"] == 8192

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_returns_dict(self, mock_anthropic_cls):
        """prompt_json() should unwrap structured JSON content."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [MagicMock(text='{"result": "ok"}')]
        mock_response.usage.input_tokens = 12
        mock_response.usage.output_tokens = 8
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")
        result = client.prompt_json(system="sys", user="usr")

        assert result == {"result": "ok"}

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_raises_without_json(self, mock_anthropic_cls):
        """prompt_json() should raise when the model returns no JSON."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="just prose")]
        mock_response.usage.input_tokens = 12
        mock_response.usage.output_tokens = 8
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="Expected JSON response"):
            client.prompt_json(system="sys", user="usr")

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_raises_on_malformed_json_in_fence(self, mock_anthropic_cls):
        """prompt_json() should raise when the fenced block contains invalid JSON and there
        is no valid fallback JSON object elsewhere in the response."""
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        # Fence content is syntactically broken; no valid {…} elsewhere in the text.
        mock_response.content = [MagicMock(text="```json\n{broken: [}\n```")]
        mock_response.usage.input_tokens = 12
        mock_response.usage.output_tokens = 8
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="Expected JSON response"):
            client.prompt_json(system="sys", user="usr")

    def test_structured_response_malformed_json_fence_blocks_raw_fallback(self):
        """When the fence JSON is malformed AND the raw-JSON fallback regex greedily spans
        the broken fence content all the way to the last '}', json.loads also fails on the
        combined match.  json_content must return None rather than silently returning garbage."""
        # The raw regex r"\{.*\}" with re.DOTALL is greedy: it matches from the first '{' in
        # '{broken: [}' all the way to the closing '}' of '{"key": "val"}', producing a
        # multi-line blob that is not valid JSON.  Both extraction paths therefore fail.
        raw_text = '```json\n{broken: [}\n```\n{"key": "val"}'
        resp = StructuredResponse(raw_text=raw_text, input_tokens=10, output_tokens=5)
        assert resp.json_content is None

    @patch("framework_forge.llm.anthropic.Anthropic")
    def test_prompt_json_raises_on_empty_response(self, mock_anthropic_cls):
        """prompt_json() should raise when the API returns an empty content list.

        _extract_response_text raises ValueError (not IndexError) when content=[] because
        the method guards the empty-list case explicitly before accessing any index.
        """
        mock_client = MagicMock()
        mock_anthropic_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = []  # empty — no text blocks at all
        mock_response.usage.input_tokens = 0
        mock_response.usage.output_tokens = 0
        mock_client.messages.create.return_value = mock_response

        client = LLMClient(api_key="sk-ant-test-key")

        with pytest.raises(ValueError, match="Expected a text response"):
            client.prompt_json(system="sys", user="usr")
