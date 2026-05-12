"""Claude API wrapper for structured analytical prompts."""

import json
import os
import re
from dataclasses import dataclass
from typing import Any

import anthropic

from framework_forge.config import ANTHROPIC_API_KEY, MODEL

ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", None)


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


class LLMError(RuntimeError):
    """Base error for Anthropic wrapper failures."""


class LLMRequestError(LLMError):
    """Raised when the Anthropic request itself fails."""


class LLMResponseError(LLMError):
    """Raised when Anthropic returns an unusable response."""


class LLMClient:
    """Wrapper around the Anthropic Claude API for structured analytical prompts."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or ANTHROPIC_API_KEY
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is required. Set it in .env or pass api_key= to LLMClient."
            )
        kwargs: dict = {"api_key": self.api_key}
        if ANTHROPIC_BASE_URL:
            kwargs["base_url"] = ANTHROPIC_BASE_URL
        self._client = anthropic.Anthropic(**kwargs)

    @staticmethod
    def _validate_prompt_inputs(system: str, user: str, max_tokens: int) -> None:
        """Reject invalid prompt inputs before the SDK call is attempted."""
        if not isinstance(system, str) or not system.strip():
            raise ValueError("system must be a non-empty string")
        if not isinstance(user, str) or not user.strip():
            raise ValueError("user must be a non-empty string")
        if not isinstance(max_tokens, int):
            raise TypeError(f"max_tokens must be an int, got {type(max_tokens).__name__}")
        if max_tokens <= 0:
            raise ValueError("max_tokens must be a positive integer")

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
            if isinstance(text, str) and text:
                text_parts.append(text)

        if not text_parts:
            raise LLMResponseError(
                "Anthropic returned no text content; cannot continue with extraction."
            )

        return "".join(text_parts)

    @staticmethod
    def _extract_usage(response: Any) -> tuple[int, int]:
        """Validate and return usage metadata from a response."""
        usage = getattr(response, "usage", None)
        if usage is None:
            raise LLMResponseError("Anthropic response is missing usage metadata.")

        input_tokens = getattr(usage, "input_tokens", None)
        output_tokens = getattr(usage, "output_tokens", None)

        if not isinstance(input_tokens, int) or not isinstance(output_tokens, int):
            raise LLMResponseError(
                "Anthropic response usage metadata is incomplete or invalid."
            )

        return input_tokens, output_tokens

    def prompt(
        self,
        system: str,
        user: str,
        model: str | None = None,
        max_tokens: int = 4096,
    ) -> StructuredResponse:
        """Send a structured prompt and return a parsed response."""
        self._validate_prompt_inputs(system=system, user=user, max_tokens=max_tokens)
        request = self._build_message_request(
            system=system,
            user=user,
            model=model,
            max_tokens=max_tokens,
        )

        try:
            response = self._client.messages.create(**request)
        except Exception as exc:  # pragma: no cover - exercised by unit test via mock
            raise LLMRequestError(
                f"Anthropic request failed for model {request['model']!r} "
                f"with max_tokens={max_tokens}."
            ) from exc

        raw_text = self._extract_response_text(response)
        input_tokens, output_tokens = self._extract_usage(response)
        return StructuredResponse(
            raw_text=raw_text,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
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
