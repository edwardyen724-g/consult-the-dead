"""Claude API wrapper for structured analytical prompts."""

import json
import re
from dataclasses import dataclass
from typing import Any

import anthropic

from framework_forge.config import ANTHROPIC_API_KEY, MODEL


@dataclass
class StructuredResponse:
    """A parsed response from the LLM, with optional JSON extraction."""

    raw_text: str
    input_tokens: int
    output_tokens: int

    @property
    def json_content(self) -> dict[str, Any] | None:
        """Extract the first JSON block from the response, if any."""
        # Try fenced code block first
        match = re.search(r"```(?:json)?\s*\n(.*?)\n```", self.raw_text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Try raw JSON object
        match = re.search(r"\{.*\}", self.raw_text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        return None


class LLMClient:
    """Wrapper around the Anthropic Claude API for structured analytical prompts."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or ANTHROPIC_API_KEY
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is required. Set it in .env or pass api_key= to LLMClient."
            )
        self._client = anthropic.Anthropic(api_key=self.api_key)

    @staticmethod
    def _build_message_request(
        system: str,
        user: str,
        model: str | None,
        max_tokens: int,
    ) -> dict[str, Any]:
        """Build the Anthropic request payload in one place."""
        return {
            "model": model or MODEL,
            "max_tokens": max_tokens,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }

    @staticmethod
    def _extract_response_text(response: Any) -> str:
        """Join all returned text blocks into a single deterministic string."""
        content = getattr(response, "content", None) or []
        text_parts: list[str] = []

        for block in content:
            text = getattr(block, "text", None)
            if text:
                text_parts.append(text)

        if not text_parts:
            raise ValueError("Expected a text response from Anthropic, but no text content was returned.")

        return "".join(text_parts)

    def prompt(
        self,
        system: str,
        user: str,
        model: str | None = None,
        max_tokens: int = 4096,
    ) -> StructuredResponse:
        """Send a structured prompt and return a parsed response."""
        request = self._build_message_request(system=system, user=user, model=model, max_tokens=max_tokens)
        response = self._client.messages.create(**request)

        raw_text = self._extract_response_text(response)
        return StructuredResponse(
            raw_text=raw_text,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )

    def prompt_json(
        self,
        system: str,
        user: str,
        model: str | None = None,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Send a prompt expecting JSON back. Raises if no JSON found."""
        resp = self.prompt(system=system, user=user, model=model, max_tokens=max_tokens)
        json_content = resp.json_content
        if json_content is None:
            raise ValueError(f"Expected JSON response but got:\n{resp.raw_text[:500]}")
        return json_content
