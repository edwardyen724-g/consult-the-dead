# Phase 1: Framework Forge — One Perfect Framework (Steve Jobs)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Framework Forge tooling and use it to extract one complete, validated Steve Jobs thinking framework — proving the CDM-adapted methodology produces output deep enough to pass three-tier validation.

**Architecture:** Python CLI tool (`framework_forge`) with four subsystems: source management, extraction pipeline (CDM-adapted), framework encoding, and three-tier validation. Each subsystem is independently testable. The extraction pipeline is LLM-assisted (Claude API) — the tool orchestrates structured analytical prompts, not fully automated extraction. Framework output is a JSON file conforming to the selector architecture template.

**Tech Stack:** Python 3.13, Anthropic Claude API (`anthropic` SDK), `httpx` for web fetching, `pytest` for testing, `click` for CLI, JSON for data storage.

---

## File Structure

```
great-minds/
├── framework_forge/
│   ├── __init__.py
│   ├── cli.py                      # Click CLI entry point
│   ├── config.py                   # API keys, paths, model config
│   ├── llm.py                      # Claude API wrapper (structured prompts)
│   ├── sources/
│   │   ├── __init__.py
│   │   ├── discovery.py            # Search for sources about a person
│   │   ├── fetcher.py              # Fetch and clean source text
│   │   └── triage.py               # Rate sources by evidence type
│   ├── extraction/
│   │   ├── __init__.py
│   │   ├── incidents.py            # Identify candidate incidents from text
│   │   ├── cdm_probes.py           # CDM probe reconstruction per incident
│   │   ├── constructs.py           # Bipolar construct mapping
│   │   ├── lens.py                 # Perceptual lens derivation
│   │   └── divergence.py           # Behavioral divergence predictions
│   ├── encoding/
│   │   ├── __init__.py
│   │   └── framework.py            # Assemble and encode framework JSON
│   └── validation/
│       ├── __init__.py
│       ├── tier1.py                # Baseline differentiation (automated)
│       ├── tier2.py                # Internal consistency (automated)
│       ├── tier3_prep.py           # Generate materials for expert review
│       └── floor_check.py          # Historical alignment sanity check
├── frameworks/                     # Output directory (one subdir per person)
│   └── steve-jobs/
│       ├── framework.json
│       ├── incidents/
│       │   └── incidents.json
│       ├── constructs.json
│       ├── sources/
│       │   ├── bibliography.json
│       │   └── texts/              # Fetched source texts
│       └── validation/
│           ├── tier1_results.json
│           ├── tier2_results.json
│           └── tier3_materials/
├── tests/
│   ├── conftest.py                 # Shared fixtures
│   ├── test_llm.py
│   ├── test_sources.py
│   ├── test_extraction.py
│   ├── test_encoding.py
│   └── test_validation.py
├── requirements.txt
├── pyproject.toml
├── .env.example
├── .env                            # (gitignored) API keys
└── .gitignore
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `pyproject.toml`
- Create: `requirements.txt`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `framework_forge/__init__.py`
- Create: `framework_forge/config.py`
- Create: `tests/conftest.py`

- [ ] **Step 1: Create `pyproject.toml`**

```toml
[project]
name = "framework-forge"
version = "0.1.0"
description = "Extract thinking frameworks from historical figures using CDM-adapted methodology"
requires-python = ">=3.12"
dependencies = [
    "anthropic>=0.40.0",
    "httpx>=0.27.0",
    "click>=8.1.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
]

[project.scripts]
framework-forge = "framework_forge.cli:cli"
```

- [ ] **Step 2: Create `requirements.txt`**

```
anthropic>=0.40.0
httpx>=0.27.0
click>=8.1.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
```

- [ ] **Step 3: Create `.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

- [ ] **Step 4: Create `.gitignore`**

```
__pycache__/
*.pyc
.env
.pytest_cache/
*.egg-info/
dist/
build/
frameworks/*/sources/texts/
```

- [ ] **Step 5: Create `framework_forge/__init__.py`**

```python
"""Framework Forge: Extract thinking frameworks from historical figures."""
```

- [ ] **Step 6: Create `framework_forge/config.py`**

```python
"""Configuration and constants for Framework Forge."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
FRAMEWORKS_DIR = PROJECT_ROOT / "frameworks"

# API
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MODEL_LONG = "claude-sonnet-4-20250514"  # For large context operations

# Extraction targets
MIN_INCIDENTS = 20
TARGET_INCIDENTS = 25
MAX_INCIDENTS = 30
TARGET_CONSTRUCTS = 10
MIN_CONSTRUCTS = 8
MAX_CONSTRUCTS = 12

# Validation thresholds
TIER1_MIN_DIVERGENT_SCENARIOS = 4  # out of 5
TIER1_MIN_SCENARIOS = 5
TIER2_MIN_TRACEABILITY = 0.80  # 80% of reasoning steps traceable
FLOOR_CHECK_MIN_ALIGNMENT = 0.50  # 50% historical alignment

# Source evidence types (ranked by what they reveal)
SOURCE_TYPES = [
    "critical_incident",       # Decisions under pressure — Layer 2+3
    "value_conflict",          # Visible tradeoffs — Layer 2
    "failure",                 # Framework limits — Layer 3
    "private_writing",         # Genuine vs performed — Layer 2
    "own_published_work",      # Stated principles — Layer 1
    "firsthand_biography",     # Behavioral observation — Layer 2
    "scholarly_analysis",      # Expert frameworks — Layer 2+3
    "secondary_reporting",     # Orientation only — Layer 1
    "web_summary",             # Source discovery only — Layer 1
]
```

- [ ] **Step 7: Create `tests/conftest.py`**

```python
"""Shared test fixtures for Framework Forge tests."""

import pytest
from pathlib import Path


@pytest.fixture
def sample_incident():
    """A minimal critical incident for testing."""
    return {
        "id": "incident-test-001",
        "decision": "Decided to remove the physical keyboard from the iPhone",
        "context": "Apple was entering the smartphone market dominated by BlackBerry and Palm, both of which had physical keyboards users loved",
        "cdm_probes": {
            "cues_noticed": "Users interacted with their phones through a fixed physical interface that could not adapt to context",
            "active_goals": "Create a device where the interface disappears and the user interacts directly with content",
            "rejected_alternatives": "Physical keyboard with touchscreen hybrid — rejected because it preserved the barrier between user and content",
            "situation_framing": "This is not a phone design problem. This is a human-experience-with-pocket-computer problem. The keyboard is a cage.",
            "expected_outcome": "Users would initially resist but adapt quickly because direct manipulation is more natural than mediated input",
        },
        "counterfactual": "A competent competitor would have built a better BlackBerry — faster keyboard, better email, more enterprise features",
        "divergence_explanation": "Jobs perceived the existing product category as a cage, not a template. His perceptual lens reframed the problem from 'better phone' to 'what experience wants to exist?'",
        "outcome": "iPhone launched without keyboard, initially criticized, then redefined the entire smartphone category",
        "source": "Isaacson, Walter. Steve Jobs. Simon & Schuster, 2011. Chapter 36.",
    }


@pytest.fixture
def sample_construct():
    """A minimal bipolar construct for testing."""
    return {
        "construct": "invites the person in vs. requires the person to adapt",
        "positive_pole": "The product adapts to the human; the interface disappears",
        "negative_pole": "The human adapts to the product; the interface is a barrier",
        "derived_from_incidents": ["incident-test-001"],
        "behavioral_implication": "When evaluating any product or feature, categorize it along this dimension. Move toward the positive pole even at the cost of features or backward compatibility.",
    }


@pytest.fixture
def sample_lens():
    """A minimal perceptual lens for testing."""
    return {
        "statement": "Jobs perceives products as experiences-waiting-to-exist, not as collections of features to be optimized.",
        "derived_from": ["incident-test-001", "incident-test-002", "incident-test-003"],
        "holdout_validation": ["incident-test-004", "incident-test-005"],
        "what_they_notice_first": "The emotional relationship between the user and the experience — not the technical capability",
        "what_they_ignore": "Feature parity with competitors, backward compatibility, existing user habits",
        "evidence": "iPhone keyboard removal, iPod scroll wheel, iMac port reduction, App Store curation",
    }


@pytest.fixture
def tmp_framework_dir(tmp_path):
    """Create a temporary framework directory structure."""
    fw_dir = tmp_path / "steve-jobs"
    (fw_dir / "incidents").mkdir(parents=True)
    (fw_dir / "sources" / "texts").mkdir(parents=True)
    (fw_dir / "validation" / "tier3_materials").mkdir(parents=True)
    return fw_dir
```

- [ ] **Step 8: Install dependencies and verify**

Run:
```bash
cd C:/projects/greatminds && pip install -e ".[dev]"
```
Expected: Clean install, no errors.

- [ ] **Step 9: Run pytest to verify setup**

Run:
```bash
cd C:/projects/greatminds && python -m pytest tests/ -v
```
Expected: `no tests ran` (0 collected, no errors).

- [ ] **Step 10: Create .env with real API key**

```bash
cp .env.example .env
# Then manually add your ANTHROPIC_API_KEY to .env
```

- [ ] **Step 11: Commit**

```bash
cd C:/projects/greatminds
git init
git add pyproject.toml requirements.txt .env.example .gitignore framework_forge/__init__.py framework_forge/config.py tests/conftest.py
git commit -m "feat: project scaffolding for Framework Forge"
```

---

## Task 2: LLM Wrapper

**Files:**
- Create: `framework_forge/llm.py`
- Create: `tests/test_llm.py`

The LLM wrapper sends structured prompts to Claude and parses structured responses. Every extraction step uses this — it is the foundation.

- [ ] **Step 1: Write the failing test**

Create `tests/test_llm.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_llm.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'framework_forge.llm'`

- [ ] **Step 3: Write the implementation**

Create `framework_forge/llm.py`:

```python
"""Claude API wrapper for structured analytical prompts."""

import json
import re
from dataclasses import dataclass, field
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

    def prompt(
        self,
        system: str,
        user: str,
        model: str | None = None,
        max_tokens: int = 4096,
    ) -> StructuredResponse:
        """Send a structured prompt and return a parsed response.

        Args:
            system: System prompt defining the analytical role.
            user: The user message with the specific task.
            model: Model override. Defaults to config.MODEL.
            max_tokens: Maximum response length. Defaults to 4096.

        Returns:
            StructuredResponse with raw text and optional parsed JSON.
        """
        response = self._client.messages.create(
            model=model or MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )

        raw_text = response.content[0].text
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
        """Send a prompt expecting JSON back. Raises if no JSON found.

        Args:
            system: System prompt defining the analytical role.
            user: The user message. Should instruct the model to respond in JSON.
            model: Model override.
            max_tokens: Maximum response length.

        Returns:
            Parsed JSON dict.

        Raises:
            ValueError: If the response contains no parseable JSON.
        """
        resp = self.prompt(system=system, user=user, model=model, max_tokens=max_tokens)
        if resp.json_content is None:
            raise ValueError(f"Expected JSON response but got:\n{resp.raw_text[:500]}")
        return resp.json_content
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_llm.py -v`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/llm.py tests/test_llm.py
git commit -m "feat: LLM client wrapper with structured response parsing"
```

---

## Task 3: Source Discovery and Fetching

**Files:**
- Create: `framework_forge/sources/__init__.py`
- Create: `framework_forge/sources/discovery.py`
- Create: `framework_forge/sources/fetcher.py`
- Create: `framework_forge/sources/triage.py`
- Create: `tests/test_sources.py`

- [ ] **Step 1: Create `framework_forge/sources/__init__.py`**

```python
"""Source discovery, fetching, and triage for framework extraction."""

from framework_forge.sources.discovery import discover_sources
from framework_forge.sources.fetcher import fetch_source
from framework_forge.sources.triage import triage_sources

__all__ = ["discover_sources", "fetch_source", "triage_sources"]
```

- [ ] **Step 2: Write failing tests**

Create `tests/test_sources.py`:

```python
"""Tests for source discovery, fetching, and triage."""

import json
import pytest
from unittest.mock import patch, MagicMock
from framework_forge.sources.triage import triage_sources, SourceEntry
from framework_forge.sources.fetcher import clean_html


class TestSourceEntry:
    def test_create_source_entry(self):
        entry = SourceEntry(
            title="Steve Jobs biography",
            url="https://example.com/jobs",
            source_type="firsthand_biography",
            description="Isaacson's authorized biography",
            evidence_layers=["layer2"],
        )
        assert entry.title == "Steve Jobs biography"
        assert entry.source_type == "firsthand_biography"

    def test_source_entry_to_dict(self):
        entry = SourceEntry(
            title="Test",
            url="https://example.com",
            source_type="web_summary",
            description="A summary",
            evidence_layers=["layer1"],
        )
        d = entry.to_dict()
        assert d["title"] == "Test"
        assert d["source_type"] == "web_summary"
        assert isinstance(d, dict)


class TestTriage:
    def test_triage_ranks_by_evidence_type(self):
        entries = [
            SourceEntry("Summary", "http://a.com", "web_summary", "wiki", ["layer1"]),
            SourceEntry("Incident", "http://b.com", "critical_incident", "decision doc", ["layer2", "layer3"]),
            SourceEntry("Biography", "http://c.com", "firsthand_biography", "bio", ["layer2"]),
        ]
        ranked = triage_sources(entries)
        assert ranked[0].source_type == "critical_incident"
        assert ranked[1].source_type == "firsthand_biography"
        assert ranked[2].source_type == "web_summary"


class TestCleanHtml:
    def test_strips_tags(self):
        html = "<p>Hello <b>world</b></p>"
        result = clean_html(html)
        assert "<p>" not in result
        assert "<b>" not in result
        assert "Hello" in result
        assert "world" in result

    def test_strips_script_and_style(self):
        html = "<html><style>body{color:red}</style><script>alert(1)</script><p>Content</p></html>"
        result = clean_html(html)
        assert "color:red" not in result
        assert "alert" not in result
        assert "Content" in result
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_sources.py -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 4: Implement `triage.py`**

Create `framework_forge/sources/triage.py`:

```python
"""Rate and rank sources by evidence type and extraction value."""

from dataclasses import dataclass, asdict
from framework_forge.config import SOURCE_TYPES


@dataclass
class SourceEntry:
    """A single source in the bibliography."""

    title: str
    url: str
    source_type: str  # One of SOURCE_TYPES
    description: str
    evidence_layers: list[str]  # Which layers this source can feed: layer1, layer2, layer3
    fetched: bool = False
    text_path: str | None = None  # Path to fetched text file

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def rank(self) -> int:
        """Lower rank = higher value. Based on position in SOURCE_TYPES."""
        try:
            return SOURCE_TYPES.index(self.source_type)
        except ValueError:
            return len(SOURCE_TYPES)


def triage_sources(entries: list[SourceEntry]) -> list[SourceEntry]:
    """Sort sources by evidence value (most valuable first).

    Uses the SOURCE_TYPES hierarchy from config: critical_incident sources
    rank highest, web_summary sources rank lowest.
    """
    return sorted(entries, key=lambda e: e.rank)
```

- [ ] **Step 5: Implement `fetcher.py`**

Create `framework_forge/sources/fetcher.py`:

```python
"""Fetch source content from URLs and clean HTML to plain text."""

import re
from pathlib import Path

import httpx


def clean_html(html: str) -> str:
    """Strip HTML tags, scripts, styles, and navigation to plain text.

    This is a lightweight cleaner — not a full HTML parser. It handles
    the common case of extracting readable text from web pages.
    """
    # Remove script and style blocks
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML comments
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    # Remove nav, header, footer blocks
    text = re.sub(r"<(nav|header|footer)[^>]*>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Replace block-level tags with newlines
    text = re.sub(r"<(p|div|br|h[1-6]|li|tr)[^>]*/?>", "\n", text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode common HTML entities
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&quot;", '"').replace("&#39;", "'").replace("&nbsp;", " ")
    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def fetch_source(url: str, output_path: Path, timeout: float = 30.0) -> str:
    """Fetch a URL, clean it to plain text, and save to a file.

    Args:
        url: The URL to fetch.
        output_path: Where to save the cleaned text.
        timeout: Request timeout in seconds.

    Returns:
        The cleaned text content.

    Raises:
        httpx.HTTPError: If the fetch fails.
    """
    headers = {
        "User-Agent": "FrameworkForge/0.1 (research tool; contact: edward@example.com)"
    }
    response = httpx.get(url, headers=headers, timeout=timeout, follow_redirects=True)
    response.raise_for_status()

    content_type = response.headers.get("content-type", "")
    if "html" in content_type:
        text = clean_html(response.text)
    else:
        text = response.text

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")
    return text
```

- [ ] **Step 6: Implement `discovery.py`**

Create `framework_forge/sources/discovery.py`:

```python
"""Discover sources about a historical figure using LLM-assisted search."""

from framework_forge.llm import LLMClient
from framework_forge.sources.triage import SourceEntry


DISCOVERY_SYSTEM = """You are a research librarian specializing in historical figure analysis.
Your job is to identify the best sources for understanding HOW a person thought — their
decision-making patterns, reasoning processes, and cognitive frameworks.

Prioritize (in order):
1. Primary sources with visible decision-making reasoning (most valuable)
2. Moments of value conflict where tradeoffs are documented
3. Documented failures and course-corrections
4. Private writings, letters, unguarded interviews
5. Their own published works
6. Biographies by people who knew them directly
7. Scholarly analysis of their reasoning patterns
8. Secondary reporting (least valuable, for orientation only)

Respond in JSON format."""


DISCOVERY_PROMPT = """Identify the 10-15 best sources for understanding HOW {person} thought
and made decisions. For each source, provide:

- title: Name of the source
- url: Where to find it online (if available; "offline" if it's a book)
- source_type: One of: critical_incident, value_conflict, failure, private_writing,
  own_published_work, firsthand_biography, scholarly_analysis, secondary_reporting, web_summary
- description: What this source contains and why it's valuable for framework extraction
- evidence_layers: Which layers this feeds — "layer1" (stated principles),
  "layer2" (decision patterns), "layer3" (perceptual lens / constructs)

Focus on sources where the REASONING PROCESS behind decisions is visible, not just
the outcomes.

Respond with a JSON object: {{"sources": [...]}}"""


def discover_sources(person: str, client: LLMClient | None = None) -> list[SourceEntry]:
    """Use LLM to identify the best sources for a historical figure.

    Args:
        person: Full name of the historical figure.
        client: LLM client. Created if not provided.

    Returns:
        List of SourceEntry objects, triaged by evidence value.
    """
    if client is None:
        client = LLMClient()

    result = client.prompt_json(
        system=DISCOVERY_SYSTEM,
        user=DISCOVERY_PROMPT.format(person=person),
        max_tokens=4096,
    )

    entries = []
    for src in result.get("sources", []):
        entries.append(
            SourceEntry(
                title=src.get("title", "Unknown"),
                url=src.get("url", ""),
                source_type=src.get("source_type", "web_summary"),
                description=src.get("description", ""),
                evidence_layers=src.get("evidence_layers", ["layer1"]),
            )
        )

    return entries
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_sources.py -v`
Expected: All 4 tests PASS.

- [ ] **Step 8: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/sources/ tests/test_sources.py
git commit -m "feat: source discovery, fetching, and triage"
```

---

## Task 4: Incident Identification

**Files:**
- Create: `framework_forge/extraction/__init__.py`
- Create: `framework_forge/extraction/incidents.py`
- Create: `tests/test_extraction.py`

This module takes source text and identifies candidate critical incidents — decisions where the reasoning process is at least partially visible.

- [ ] **Step 1: Create `framework_forge/extraction/__init__.py`**

```python
"""Extraction pipeline: incidents, CDM probes, constructs, lens, divergence."""
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_extraction.py`:

```python
"""Tests for the extraction pipeline."""

import json
import pytest
from unittest.mock import patch, MagicMock
from framework_forge.extraction.incidents import (
    identify_incidents,
    CandidateIncident,
    INCIDENT_SYSTEM,
)


class TestCandidateIncident:
    def test_create(self):
        inc = CandidateIncident(
            title="iPhone keyboard removal",
            description="Jobs decided to remove the physical keyboard from iPhone",
            source_text_excerpt="Jobs insisted that the phone would have no keyboard...",
            source_title="Steve Jobs by Isaacson",
            reasoning_visible=True,
            evidence_type="critical_incident",
        )
        assert inc.title == "iPhone keyboard removal"
        assert inc.reasoning_visible is True

    def test_to_dict(self):
        inc = CandidateIncident(
            title="Test",
            description="Test decision",
            source_text_excerpt="excerpt",
            source_title="source",
            reasoning_visible=False,
            evidence_type="value_conflict",
        )
        d = inc.to_dict()
        assert d["title"] == "Test"
        assert d["reasoning_visible"] is False


class TestIdentifyIncidents:
    @patch("framework_forge.extraction.incidents.LLMClient")
    def test_returns_candidate_incidents(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "incidents": [
                {
                    "title": "NeXT acquisition",
                    "description": "Jobs negotiated Apple acquiring NeXT",
                    "source_text_excerpt": "Jobs saw the opportunity...",
                    "source_title": "Isaacson biography",
                    "reasoning_visible": True,
                    "evidence_type": "critical_incident",
                }
            ]
        }

        results = identify_incidents(
            source_text="Some long text about Steve Jobs...",
            source_title="Test Source",
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(results) == 1
        assert results[0].title == "NeXT acquisition"
        assert results[0].reasoning_visible is True
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 4: Implement `incidents.py`**

Create `framework_forge/extraction/incidents.py`:

```python
"""Identify candidate critical incidents from source text."""

from dataclasses import dataclass, asdict

from framework_forge.llm import LLMClient


@dataclass
class CandidateIncident:
    """A decision or event identified as a potential critical incident for CDM analysis."""

    title: str
    description: str
    source_text_excerpt: str
    source_title: str
    reasoning_visible: bool  # Is the WHY behind the decision at least partially visible?
    evidence_type: str  # critical_incident, value_conflict, failure, etc.

    def to_dict(self) -> dict:
        return asdict(self)


INCIDENT_SYSTEM = """You are a cognitive task analyst identifying critical incidents for
CDM (Critical Decision Method) analysis. A critical incident is a decision or moment where:

1. A person made a consequential choice
2. The REASONING behind the choice is at least partially visible in the text
3. Alternatives existed — this was not the only possible action
4. The decision reveals something about HOW this person thinks, not just WHAT they decided

You are looking for decisions where the cognitive process is partially visible — moments
where we can reconstruct the cues they noticed, the goals they held, and the alternatives
they rejected. Decisions where only the outcome is visible (no reasoning) are less valuable.

Prioritize:
- Decisions under pressure or uncertainty (most revealing)
- Value conflicts where tradeoffs are visible
- Failures and course-corrections
- Moments where this person diverged from what a "normal" person would have done

Respond in JSON format."""


INCIDENT_PROMPT = """Read the following source text about {person} and identify all
candidate critical incidents — decisions or moments where the reasoning process is
at least partially visible.

Source: "{source_title}"

---
{source_text}
---

For each incident found, provide:
- title: Short name for the incident (e.g., "iPhone keyboard removal")
- description: 2-3 sentence description of the decision and its context
- source_text_excerpt: The exact excerpt from the text (50-200 words) that documents this incident
- reasoning_visible: true if the text reveals WHY they decided this way, false if only the outcome is visible
- evidence_type: One of "critical_incident", "value_conflict", "failure", "private_writing"

Return: {{"incidents": [...]}}

Focus on quality over quantity. 3 incidents with visible reasoning are worth more than
10 incidents where only the outcome is documented."""


def identify_incidents(
    source_text: str,
    source_title: str,
    person: str,
    client: LLMClient | None = None,
) -> list[CandidateIncident]:
    """Identify candidate critical incidents from source text.

    Uses LLM to find decisions and moments where the reasoning process
    is at least partially visible in the text.

    Args:
        source_text: The full text of the source document.
        source_title: Title of the source (for citation).
        person: Name of the historical figure.
        client: LLM client. Created if not provided.

    Returns:
        List of CandidateIncident objects found in the text.
    """
    if client is None:
        client = LLMClient()

    # For very long texts, we may need to chunk. For now, truncate to
    # fit within context window (leaving room for prompt and response).
    max_chars = 100_000  # ~25k tokens, safe for most models
    truncated = source_text[:max_chars]

    result = client.prompt_json(
        system=INCIDENT_SYSTEM,
        user=INCIDENT_PROMPT.format(
            person=person,
            source_title=source_title,
            source_text=truncated,
        ),
        max_tokens=4096,
    )

    incidents = []
    for inc in result.get("incidents", []):
        incidents.append(
            CandidateIncident(
                title=inc.get("title", "Unknown"),
                description=inc.get("description", ""),
                source_text_excerpt=inc.get("source_text_excerpt", ""),
                source_title=source_title,
                reasoning_visible=inc.get("reasoning_visible", False),
                evidence_type=inc.get("evidence_type", "critical_incident"),
            )
        )

    return incidents
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/extraction/ tests/test_extraction.py
git commit -m "feat: critical incident identification from source text"
```

---

## Task 5: CDM Probe Reconstruction

**Files:**
- Create: `framework_forge/extraction/cdm_probes.py`
- Modify: `tests/test_extraction.py` (add tests)

This is the analytical core. For each candidate incident, we apply the six CDM cognitive probes to reconstruct the reasoning process.

- [ ] **Step 1: Write the failing test**

Add to `tests/test_extraction.py`:

```python
from framework_forge.extraction.cdm_probes import reconstruct_incident, ReconstructedIncident


class TestCDMProbes:
    @patch("framework_forge.extraction.cdm_probes.LLMClient")
    def test_reconstruct_returns_full_incident(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "id": "incident-001",
            "decision": "Removed physical keyboard from iPhone",
            "context": "Entering smartphone market",
            "cdm_probes": {
                "cues_noticed": "Fixed interfaces limit experience",
                "active_goals": "Direct user-content relationship",
                "rejected_alternatives": "Keyboard hybrid — preserves barrier",
                "situation_framing": "Not a phone problem — an experience problem",
                "expected_outcome": "Initial resistance, then adoption",
            },
            "counterfactual": "Build a better BlackBerry",
            "divergence_explanation": "Saw product category as cage",
            "outcome": "Redefined smartphones",
            "source": "Isaacson Ch.36",
        }

        candidate = CandidateIncident(
            title="iPhone keyboard",
            description="Jobs removed the keyboard",
            source_text_excerpt="Jobs insisted there would be no keyboard...",
            source_title="Isaacson",
            reasoning_visible=True,
            evidence_type="critical_incident",
        )

        result = reconstruct_incident(
            candidate=candidate,
            person="Steve Jobs",
            incident_id="incident-001",
            client=mock_client,
        )

        assert isinstance(result, ReconstructedIncident)
        assert result.id == "incident-001"
        assert "cues_noticed" in result.cdm_probes
        assert result.counterfactual is not None

    def test_reconstructed_incident_to_dict(self, sample_incident):
        inc = ReconstructedIncident(**sample_incident)
        d = inc.to_dict()
        assert d["id"] == "incident-test-001"
        assert "cdm_probes" in d
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py::TestCDMProbes -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement `cdm_probes.py`**

Create `framework_forge/extraction/cdm_probes.py`:

```python
"""CDM (Critical Decision Method) probe reconstruction for critical incidents.

Based on Crandall, Klein & Hoffman (2006), Working Minds, MIT Press.
Adapted for text-based historical reconstruction — we cannot interview
the subject, so we reconstruct from documented sources.
"""

from dataclasses import dataclass, asdict

from framework_forge.llm import LLMClient
from framework_forge.extraction.incidents import CandidateIncident


@dataclass
class ReconstructedIncident:
    """A critical incident with full CDM probe reconstruction."""

    id: str
    decision: str
    context: str
    cdm_probes: dict  # Keys: cues_noticed, active_goals, rejected_alternatives, situation_framing, expected_outcome
    counterfactual: str
    divergence_explanation: str
    outcome: str
    source: str

    def to_dict(self) -> dict:
        return asdict(self)


CDM_SYSTEM = """You are a cognitive task analyst trained in the Critical Decision Method
(CDM), developed by Gary Klein, Beth Crandall, and Robert Hoffman. Your job is to
reconstruct the cognitive process behind a historical decision.

CDM was designed for interviewing living experts, but we are adapting it for
historical reconstruction from text. This means:
- You can only reconstruct what the sources document or strongly imply
- You should distinguish between what is documented vs. inferred
- Where evidence is thin, say so explicitly rather than inventing reasoning

The six CDM probes you must apply:
1. CUE DETECTION: What did this person notice that others in the same position did not?
2. ACTIVE GOALS: What were they trying to accomplish at the moment of decision?
3. REJECTED ALTERNATIVES: What options were considered and discarded, and why?
4. SITUATION FRAMING: How did they DEFINE the problem? (Most diagnostic probe)
5. EXPECTED OUTCOME: What did they expect would happen?

Plus the counterfactual analysis:
6. COUNTERFACTUAL: What would a competent, ordinary decision-maker have done?
   The gap between this and the actual decision is the strongest signal of
   distinctive cognitive pattern.

Respond in JSON format."""


CDM_PROMPT = """Reconstruct the cognitive process behind this decision by {person}
using CDM probes.

INCIDENT: {title}
DESCRIPTION: {description}
SOURCE EXCERPT:
---
{excerpt}
---
SOURCE: {source_title}

Apply the six CDM probes. For each probe, provide the best reconstruction
you can from the available evidence. If a probe cannot be answered from the
source material, say "insufficient evidence" rather than speculating.

Respond with:
{{
  "id": "{incident_id}",
  "decision": "What they decided (one sentence)",
  "context": "The situation they faced (2-3 sentences)",
  "cdm_probes": {{
    "cues_noticed": "What they noticed that others did not",
    "active_goals": "What they were trying to accomplish",
    "rejected_alternatives": "What they considered and discarded, with reasoning",
    "situation_framing": "How they DEFINED the problem — not what they decided, but how they SAW it",
    "expected_outcome": "What they expected would happen"
  }},
  "counterfactual": "What a competent ordinary person would have done instead",
  "divergence_explanation": "Why this person diverged — what does the gap reveal about their cognitive pattern?",
  "outcome": "What actually happened",
  "source": "{source_title}"
}}"""


def reconstruct_incident(
    candidate: CandidateIncident,
    person: str,
    incident_id: str,
    client: LLMClient | None = None,
) -> ReconstructedIncident:
    """Apply CDM probes to reconstruct the cognitive process behind a decision.

    Args:
        candidate: The candidate incident identified from source text.
        person: Name of the historical figure.
        incident_id: Unique ID for this incident (e.g., "incident-001").
        client: LLM client. Created if not provided.

    Returns:
        ReconstructedIncident with full CDM probe data.
    """
    if client is None:
        client = LLMClient()

    result = client.prompt_json(
        system=CDM_SYSTEM,
        user=CDM_PROMPT.format(
            person=person,
            title=candidate.title,
            description=candidate.description,
            excerpt=candidate.source_text_excerpt,
            source_title=candidate.source_title,
            incident_id=incident_id,
        ),
        max_tokens=4096,
    )

    return ReconstructedIncident(
        id=result.get("id", incident_id),
        decision=result.get("decision", ""),
        context=result.get("context", ""),
        cdm_probes=result.get("cdm_probes", {}),
        counterfactual=result.get("counterfactual", ""),
        divergence_explanation=result.get("divergence_explanation", ""),
        outcome=result.get("outcome", ""),
        source=result.get("source", candidate.source_title),
    )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/extraction/cdm_probes.py tests/test_extraction.py
git commit -m "feat: CDM probe reconstruction for critical incidents"
```

---

## Task 6: Bipolar Construct Mapping

**Files:**
- Create: `framework_forge/extraction/constructs.py`
- Modify: `tests/test_extraction.py` (add tests)

Takes the reconstructed incident database and identifies bipolar constructs using Repertory Grid-adapted methodology.

- [ ] **Step 1: Write the failing test**

Add to `tests/test_extraction.py`:

```python
from framework_forge.extraction.constructs import map_constructs, BipolarConstruct


class TestConstructMapping:
    @patch("framework_forge.extraction.constructs.LLMClient")
    def test_map_constructs_returns_list(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "constructs": [
                {
                    "construct": "invites the person in vs. requires adaptation",
                    "positive_pole": "Product adapts to human",
                    "negative_pole": "Human adapts to product",
                    "derived_from_incidents": ["incident-001", "incident-002"],
                    "behavioral_implication": "Always choose the option where the interface disappears",
                }
            ]
        }

        incidents = [MagicMock(), MagicMock(), MagicMock()]
        for i, inc in enumerate(incidents):
            inc.to_dict.return_value = {"id": f"incident-00{i+1}", "decision": f"Decision {i+1}"}

        result = map_constructs(
            incidents=incidents,
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(result) == 1
        assert isinstance(result[0], BipolarConstruct)
        assert "invites" in result[0].construct

    def test_bipolar_construct_to_dict(self, sample_construct):
        bc = BipolarConstruct(**sample_construct)
        d = bc.to_dict()
        assert "positive_pole" in d
        assert "negative_pole" in d
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py::TestConstructMapping -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement `constructs.py`**

Create `framework_forge/extraction/constructs.py`:

```python
"""Bipolar construct mapping using Repertory Grid-adapted methodology.

Based on George Kelly's Personal Construct Theory. The method identifies
the implicit dimensions along which a person categorizes their world — not
what they say about categories, but HOW they differentiate situations.
"""

from dataclasses import dataclass, asdict

from framework_forge.llm import LLMClient
from framework_forge.extraction.cdm_probes import ReconstructedIncident
from framework_forge.config import MIN_CONSTRUCTS, MAX_CONSTRUCTS


@dataclass
class BipolarConstruct:
    """A bipolar dimension along which the person categorizes situations."""

    construct: str  # The dimension (e.g., "invites in vs. requires adaptation")
    positive_pole: str  # What they move toward
    negative_pole: str  # What they move away from
    derived_from_incidents: list[str]  # Incident IDs
    behavioral_implication: str  # What this construct predicts about behavior

    def to_dict(self) -> dict:
        return asdict(self)


CONSTRUCT_SYSTEM = """You are a cognitive psychologist using Repertory Grid analysis
(George Kelly's Personal Construct Theory) to identify the implicit dimensions
along which a person categorizes their world.

METHOD: Take three incidents at a time. For each triad, ask: "In what important
way are two of these incidents similar to each other and different from the third?"
The answer reveals a bipolar construct — a dimension of cognitive differentiation
that the person uses implicitly.

A bipolar construct is NOT a stated value or principle. It is the cognitive lens
through which they CATEGORIZE situations. For example:
- NOT: "Jobs valued simplicity" (that's a stated principle)
- YES: "Jobs categorized products as 'invites the person in' vs. 'requires
  the person to adapt'" (that's a bipolar construct — a cognitive dimension)

Target: {min_constructs}-{max_constructs} constructs that together explain the major
patterns in the incident database. Each construct must be derived from at least
2 incidents and must have a clear behavioral implication.

Respond in JSON format."""


CONSTRUCT_PROMPT = """Analyze these reconstructed critical incidents for {person} and
identify the bipolar constructs — the implicit cognitive dimensions along which this
person categorizes situations.

INCIDENT DATABASE:
---
{incidents_json}
---

Use the Repertory Grid triad method: examine groups of three incidents and
identify how two are similar and different from the third. The dimension of
difference is a bipolar construct.

For each construct, provide:
- construct: The bipolar dimension as "[positive pole] vs. [negative pole]"
- positive_pole: What they move toward (1-2 sentences)
- negative_pole: What they move away from (1-2 sentences)
- derived_from_incidents: List of incident IDs that reveal this construct
- behavioral_implication: "When encountering [situation type], this construct
  predicts [specific action or evaluation]"

Target {min_constructs}-{max_constructs} constructs. Quality over quantity —
each construct must be supported by multiple incidents.

Respond with: {{"constructs": [...]}}"""


def map_constructs(
    incidents: list[ReconstructedIncident],
    person: str,
    client: LLMClient | None = None,
) -> list[BipolarConstruct]:
    """Map bipolar constructs from a database of reconstructed incidents.

    Uses Repertory Grid-adapted methodology: examines triads of incidents
    to identify the implicit dimensions along which the person categorizes
    situations.

    Args:
        incidents: List of CDM-reconstructed incidents (minimum 6 recommended).
        person: Name of the historical figure.
        client: LLM client. Created if not provided.

    Returns:
        List of BipolarConstruct objects.
    """
    if client is None:
        client = LLMClient()

    import json
    incidents_json = json.dumps(
        [inc.to_dict() if hasattr(inc, "to_dict") else inc for inc in incidents],
        indent=2,
    )

    result = client.prompt_json(
        system=CONSTRUCT_SYSTEM.format(
            min_constructs=MIN_CONSTRUCTS,
            max_constructs=MAX_CONSTRUCTS,
        ),
        user=CONSTRUCT_PROMPT.format(
            person=person,
            incidents_json=incidents_json,
            min_constructs=MIN_CONSTRUCTS,
            max_constructs=MAX_CONSTRUCTS,
        ),
        max_tokens=8192,
    )

    constructs = []
    for c in result.get("constructs", []):
        constructs.append(
            BipolarConstruct(
                construct=c.get("construct", ""),
                positive_pole=c.get("positive_pole", ""),
                negative_pole=c.get("negative_pole", ""),
                derived_from_incidents=c.get("derived_from_incidents", []),
                behavioral_implication=c.get("behavioral_implication", ""),
            )
        )

    return constructs
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/extraction/constructs.py tests/test_extraction.py
git commit -m "feat: bipolar construct mapping from incident database"
```

---

## Task 7: Perceptual Lens Derivation

**Files:**
- Create: `framework_forge/extraction/lens.py`
- Modify: `tests/test_extraction.py` (add tests)

- [ ] **Step 1: Write the failing test**

Add to `tests/test_extraction.py`:

```python
from framework_forge.extraction.lens import derive_lens, PerceptualLens


class TestLensDerivation:
    @patch("framework_forge.extraction.lens.LLMClient")
    def test_derive_lens_returns_lens(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "statement": "Jobs perceives products as experiences-waiting-to-exist.",
            "derived_from": ["incident-001", "incident-002", "incident-003"],
            "holdout_validation": ["incident-004", "incident-005"],
            "what_they_notice_first": "Emotional relationship between user and experience",
            "what_they_ignore": "Feature parity, backward compatibility",
            "evidence": "iPhone, iPod, iMac, App Store curation",
        }

        constructs = [MagicMock(), MagicMock()]
        for c in constructs:
            c.to_dict.return_value = {"construct": "test", "positive_pole": "a", "negative_pole": "b"}

        incidents = [MagicMock() for _ in range(5)]
        for i, inc in enumerate(incidents):
            inc.to_dict.return_value = {"id": f"incident-00{i+1}"}

        result = derive_lens(
            constructs=constructs,
            incidents=incidents,
            person="Steve Jobs",
            holdout_incident_ids=["incident-004", "incident-005"],
            client=mock_client,
        )

        assert isinstance(result, PerceptualLens)
        assert "Jobs" in result.statement
        assert len(result.holdout_validation) == 2

    def test_perceptual_lens_to_dict(self, sample_lens):
        lens = PerceptualLens(**sample_lens)
        d = lens.to_dict()
        assert "statement" in d
        assert "holdout_validation" in d
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py::TestLensDerivation -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement `lens.py`**

Create `framework_forge/extraction/lens.py`:

```python
"""Perceptual lens derivation from bipolar constructs and incident data.

The perceptual lens is the organizing principle that explains the majority
of variance across incidents. It captures HOW the person sees the world —
not what they decide, but what they notice and what framework they impose
on situations before reasoning begins.
"""

from dataclasses import dataclass, asdict
import json

from framework_forge.llm import LLMClient
from framework_forge.extraction.constructs import BipolarConstruct
from framework_forge.extraction.cdm_probes import ReconstructedIncident


@dataclass
class PerceptualLens:
    """The organizing cognitive principle derived from bipolar constructs."""

    statement: str  # "This person perceives [domain] as [specific framing]."
    derived_from: list[str]  # Incident IDs used to derive
    holdout_validation: list[str]  # Incident IDs NOT used, for validation
    what_they_notice_first: str
    what_they_ignore: str
    evidence: str

    def to_dict(self) -> dict:
        return asdict(self)


LENS_SYSTEM = """You are a cognitive scientist deriving a perceptual lens from
bipolar construct data using grounded theory methodology.

A perceptual lens is the single organizing principle that explains WHY a person
uses the bipolar constructs they do. It is upstream of all decisions — it
determines what the person NOTICES, what they IGNORE, and how they FRAME
situations before conscious reasoning begins.

Format: "This person perceives [domain situations] as [specific framing that
others do not use]."

The lens must:
1. Explain the majority of the bipolar constructs (not just one)
2. Predict the counterfactual divergence in the holdout incidents
3. Be specific enough to generate novel predictions
4. NOT be a restatement of a known principle (e.g., "Jobs valued simplicity"
   is too surface-level — what does the lens BENEATH simplicity look like?)

Respond in JSON format."""


LENS_PROMPT = """Derive the perceptual lens for {person} from these bipolar constructs
and their underlying incident data.

BIPOLAR CONSTRUCTS:
---
{constructs_json}
---

FULL INCIDENT DATABASE (for evidence):
---
{incidents_json}
---

HOLDOUT INCIDENTS (derive the lens WITHOUT these, then check if it predicts them):
Holdout IDs: {holdout_ids}

Instructions:
1. Examine the bipolar constructs together — what deeper organizing principle
   explains why this person categorizes the world along THESE dimensions?
2. Formulate the lens as: "This person perceives [domain] as [specific framing]."
3. Check: does this lens predict the counterfactual divergence in the holdout incidents?
4. If not, refine the lens until it does.

Respond with:
{{
  "statement": "The perceptual lens statement",
  "derived_from": ["incident IDs used to derive this"],
  "holdout_validation": ["holdout incident IDs and whether the lens predicts them"],
  "what_they_notice_first": "When encountering any situation, what draws their attention?",
  "what_they_ignore": "What is invisible or irrelevant to them?",
  "evidence": "Specific incidents demonstrating the lens in action"
}}"""


def derive_lens(
    constructs: list[BipolarConstruct],
    incidents: list[ReconstructedIncident],
    person: str,
    holdout_incident_ids: list[str],
    client: LLMClient | None = None,
) -> PerceptualLens:
    """Derive the perceptual lens from bipolar constructs and incident data.

    The lens is derived from the non-holdout incidents and then validated
    against the holdout set.

    Args:
        constructs: Bipolar constructs from construct mapping.
        incidents: Full incident database.
        person: Name of the historical figure.
        holdout_incident_ids: Incident IDs reserved for validation.
        client: LLM client.

    Returns:
        PerceptualLens — the organizing cognitive principle.
    """
    if client is None:
        client = LLMClient()

    constructs_json = json.dumps(
        [c.to_dict() if hasattr(c, "to_dict") else c for c in constructs],
        indent=2,
    )
    incidents_json = json.dumps(
        [inc.to_dict() if hasattr(inc, "to_dict") else inc for inc in incidents],
        indent=2,
    )

    result = client.prompt_json(
        system=LENS_SYSTEM,
        user=LENS_PROMPT.format(
            person=person,
            constructs_json=constructs_json,
            incidents_json=incidents_json,
            holdout_ids=json.dumps(holdout_incident_ids),
        ),
        max_tokens=4096,
    )

    return PerceptualLens(
        statement=result.get("statement", ""),
        derived_from=result.get("derived_from", []),
        holdout_validation=result.get("holdout_validation", holdout_incident_ids),
        what_they_notice_first=result.get("what_they_notice_first", ""),
        what_they_ignore=result.get("what_they_ignore", ""),
        evidence=result.get("evidence", ""),
    )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/extraction/lens.py tests/test_extraction.py
git commit -m "feat: perceptual lens derivation from bipolar constructs"
```

---

## Task 8: Behavioral Divergence Predictions

**Files:**
- Create: `framework_forge/extraction/divergence.py`
- Modify: `tests/test_extraction.py` (add tests)

- [ ] **Step 1: Write the failing test**

Add to `tests/test_extraction.py`:

```python
from framework_forge.extraction.divergence import generate_predictions, DivergencePrediction


class TestDivergencePredictions:
    @patch("framework_forge.extraction.divergence.LLMClient")
    def test_generate_predictions_returns_list(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "predictions": [
                {
                    "situation_type": "New technology emerges in consumer electronics",
                    "ordinary_response": "Evaluate features, benchmark against competitors",
                    "framework_response": "Ask what experience this technology wants to become",
                    "because": "Perceptual lens: products are experiences-waiting-to-exist",
                    "confidence": "High",
                }
            ]
        }

        lens = MagicMock()
        lens.to_dict.return_value = {"statement": "test lens"}
        constructs = [MagicMock()]
        constructs[0].to_dict.return_value = {"construct": "test"}

        result = generate_predictions(
            lens=lens,
            constructs=constructs,
            person="Steve Jobs",
            client=mock_client,
        )

        assert len(result) == 1
        assert isinstance(result[0], DivergencePrediction)
        assert result[0].confidence == "High"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py::TestDivergencePredictions -v`
Expected: FAIL

- [ ] **Step 3: Implement `divergence.py`**

Create `framework_forge/extraction/divergence.py`:

```python
"""Generate behavioral divergence predictions from the framework.

These predictions operationalize the surprise test: they predict HOW the
framework will diverge from a competent ordinary decision-maker, and WHY.
Each prediction is traceable to specific framework elements.
"""

from dataclasses import dataclass, asdict
import json

from framework_forge.llm import LLMClient
from framework_forge.extraction.lens import PerceptualLens
from framework_forge.extraction.constructs import BipolarConstruct


@dataclass
class DivergencePrediction:
    """A specific prediction about how the framework diverges from conventional thinking."""

    situation_type: str
    ordinary_response: str
    framework_response: str
    because: str  # Traced to specific lens/construct/incident
    confidence: str  # High, Medium, Low

    def to_dict(self) -> dict:
        return asdict(self)


DIVERGENCE_SYSTEM = """You are a cognitive scientist generating testable behavioral
predictions from a thinking framework.

A divergence prediction answers: "In situation type X, a competent ordinary person
would do Y. This framework predicts Z instead, because of [specific framework element]."

Each prediction must be:
1. SPECIFIC — not "they would do something different" but exactly what and why
2. TRACEABLE — explicitly linked to the perceptual lens or a bipolar construct
3. TESTABLE — you could give someone the situation and check the prediction
4. NON-OBVIOUS — not something you'd get from "act like [person]" prompting

Generate 8-12 predictions covering different situation types the person's
framework would apply to.

Respond in JSON format."""


DIVERGENCE_PROMPT = """Generate behavioral divergence predictions for {person}'s framework.

PERCEPTUAL LENS:
---
{lens_json}
---

BIPOLAR CONSTRUCTS:
---
{constructs_json}
---

For each prediction, provide:
- situation_type: Category of situation (e.g., "New technology evaluation")
- ordinary_response: What a competent but ordinary person would do
- framework_response: What this framework predicts instead
- because: Traced to specific lens/construct with evidence
- confidence: "High" (strong evidence), "Medium" (some evidence), "Low" (extrapolation)

Return: {{"predictions": [...]}}"""


def generate_predictions(
    lens: PerceptualLens,
    constructs: list[BipolarConstruct],
    person: str,
    client: LLMClient | None = None,
) -> list[DivergencePrediction]:
    """Generate behavioral divergence predictions from lens and constructs.

    Args:
        lens: The derived perceptual lens.
        constructs: The mapped bipolar constructs.
        person: Name of the historical figure.
        client: LLM client.

    Returns:
        List of DivergencePrediction objects.
    """
    if client is None:
        client = LLMClient()

    lens_json = json.dumps(
        lens.to_dict() if hasattr(lens, "to_dict") else lens, indent=2
    )
    constructs_json = json.dumps(
        [c.to_dict() if hasattr(c, "to_dict") else c for c in constructs], indent=2
    )

    result = client.prompt_json(
        system=DIVERGENCE_SYSTEM,
        user=DIVERGENCE_PROMPT.format(
            person=person,
            lens_json=lens_json,
            constructs_json=constructs_json,
        ),
        max_tokens=4096,
    )

    return [
        DivergencePrediction(
            situation_type=p.get("situation_type", ""),
            ordinary_response=p.get("ordinary_response", ""),
            framework_response=p.get("framework_response", ""),
            because=p.get("because", ""),
            confidence=p.get("confidence", "Medium"),
        )
        for p in result.get("predictions", [])
    ]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_extraction.py -v`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/extraction/divergence.py tests/test_extraction.py
git commit -m "feat: behavioral divergence prediction generation"
```

---

## Task 9: Framework Encoding

**Files:**
- Create: `framework_forge/encoding/__init__.py`
- Create: `framework_forge/encoding/framework.py`
- Create: `tests/test_encoding.py`

Assembles all extraction outputs into the final framework JSON conforming to the selector architecture template.

- [ ] **Step 1: Create `framework_forge/encoding/__init__.py`**

```python
"""Framework encoding: assemble extraction outputs into selector architecture JSON."""
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_encoding.py`:

```python
"""Tests for framework encoding."""

import json
import pytest
from pathlib import Path
from framework_forge.encoding.framework import assemble_framework, save_framework


class TestAssembleFramework:
    def test_assembles_all_sections(self, sample_incident, sample_construct, sample_lens):
        from framework_forge.extraction.cdm_probes import ReconstructedIncident
        from framework_forge.extraction.constructs import BipolarConstruct
        from framework_forge.extraction.lens import PerceptualLens
        from framework_forge.extraction.divergence import DivergencePrediction

        incidents = [ReconstructedIncident(**sample_incident)]
        constructs = [BipolarConstruct(**sample_construct)]
        lens = PerceptualLens(**sample_lens)
        predictions = [
            DivergencePrediction(
                situation_type="New tech evaluation",
                ordinary_response="Benchmark features",
                framework_response="Ask what experience it wants to become",
                because="Perceptual lens",
                confidence="High",
            )
        ]

        fw = assemble_framework(
            person="Steve Jobs",
            domain="Technology, Design, Business",
            incidents=incidents,
            constructs=constructs,
            lens=lens,
            predictions=predictions,
            primary_sources=["Isaacson biography"],
            secondary_sources=["Schlender, Becoming Steve Jobs"],
        )

        assert fw["meta"]["person"] == "Steve Jobs"
        assert fw["perceptual_lens"]["statement"] == lens.statement
        assert len(fw["bipolar_constructs"]) == 1
        assert len(fw["critical_incident_database"]) == 1
        assert len(fw["behavioral_divergence_predictions"]) == 1


class TestSaveFramework:
    def test_save_creates_json(self, tmp_framework_dir):
        fw = {"meta": {"person": "Steve Jobs", "version": "1.0"}}
        path = save_framework(fw, tmp_framework_dir)
        assert path.exists()
        loaded = json.loads(path.read_text())
        assert loaded["meta"]["person"] == "Steve Jobs"
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_encoding.py -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 4: Implement `framework.py`**

Create `framework_forge/encoding/framework.py`:

```python
"""Assemble extraction outputs into the framework JSON (selector architecture)."""

import json
from datetime import date
from pathlib import Path

from framework_forge.extraction.cdm_probes import ReconstructedIncident
from framework_forge.extraction.constructs import BipolarConstruct
from framework_forge.extraction.lens import PerceptualLens
from framework_forge.extraction.divergence import DivergencePrediction


def assemble_framework(
    person: str,
    domain: str,
    incidents: list[ReconstructedIncident],
    constructs: list[BipolarConstruct],
    lens: PerceptualLens,
    predictions: list[DivergencePrediction],
    primary_sources: list[str] | None = None,
    secondary_sources: list[str] | None = None,
    born: str = "",
    died: str = "",
) -> dict:
    """Assemble all extraction outputs into the framework JSON.

    The framework is structured as a selector architecture: each section
    constrains the LLM's representation selection with evidence-grounded specificity.

    Args:
        person: Full name of the historical figure.
        domain: Their primary domain(s).
        incidents: CDM-reconstructed critical incidents.
        constructs: Bipolar constructs from Repertory Grid mapping.
        lens: The derived perceptual lens.
        predictions: Behavioral divergence predictions.
        primary_sources: List of primary source titles.
        secondary_sources: List of secondary source titles.
        born: Birth year.
        died: Death year (or empty string if alive or unknown).

    Returns:
        Complete framework dict conforming to the selector architecture template.
    """
    return {
        "meta": {
            "person": person,
            "born": born,
            "died": died,
            "domain": domain,
            "extraction_date": date.today().isoformat(),
            "version": "1.0",
            "methodology": "CDM-adapted critical incident analysis + Repertory Grid construct mapping",
            "validation_scores": {
                "tier_1_baseline_differentiation": None,
                "tier_2_internal_consistency": None,
                "tier_3_expert_plausibility": None,
            },
            "primary_sources": primary_sources or [],
            "secondary_sources": secondary_sources or [],
            "incident_count": len(incidents),
            "construct_count": len(constructs),
            "extraction_notes": "",
        },
        "perceptual_lens": lens.to_dict(),
        "bipolar_constructs": [c.to_dict() for c in constructs],
        "critical_incident_database": [inc.to_dict() for inc in incidents],
        "behavioral_divergence_predictions": [p.to_dict() for p in predictions],
        "core_problem": {
            "description": "",
            "in_their_words": "",
            "evidence": "",
            "why_it_matters": "",
        },
        "stated_principles": [],
        "value_hierarchy": {
            "values_ranked": [],
            "conflict_resolution": "",
            "edge_cases": "",
            "evidence": "",
        },
        "blind_spots": {
            "known_weaknesses": "",
            "failure_pattern": "",
            "historical_failures": "",
            "structural_cause": "",
            "self_awareness": "",
        },
        "constraint_response": {
            "approach": "",
            "opposition_handling": "",
            "resource_scarcity": "",
            "impossible_situations": "",
        },
        "contextual_adaptation": {
            "era_dependencies": "",
            "universal_elements": "",
            "translation_needed": "",
            "modern_equivalents": "",
        },
    }


def save_framework(framework: dict, output_dir: Path) -> Path:
    """Save the framework JSON to the output directory.

    Args:
        framework: The assembled framework dict.
        output_dir: Directory to save to (e.g., frameworks/steve-jobs/).

    Returns:
        Path to the saved framework.json file.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "framework.json"
    path.write_text(json.dumps(framework, indent=2, ensure_ascii=False), encoding="utf-8")
    return path
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_encoding.py -v`
Expected: All 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/encoding/ tests/test_encoding.py
git commit -m "feat: framework JSON assembly and serialization"
```

---

## Task 10: Tier 1 Validation — Baseline Differentiation

**Files:**
- Create: `framework_forge/validation/__init__.py`
- Create: `framework_forge/validation/tier1.py`
- Create: `tests/test_validation.py`

- [ ] **Step 1: Create `framework_forge/validation/__init__.py`**

```python
"""Three-tier validation for thinking frameworks."""
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_validation.py`:

```python
"""Tests for three-tier validation."""

import pytest
from unittest.mock import patch, MagicMock
from framework_forge.validation.tier1 import (
    generate_scenario,
    generate_framework_response,
    generate_baseline_response,
    score_divergence,
    run_tier1,
    Tier1Result,
    ScenarioResult,
)


class TestTier1:
    @patch("framework_forge.validation.tier1.LLMClient")
    def test_generate_scenario(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "scenario": "AI can now design products that test better than human designers.",
            "domain_relevance": "Product design and technology leadership",
        }

        result = generate_scenario(
            person="Steve Jobs",
            domain="Technology, Design",
            existing_scenarios=[],
            client=mock_client,
        )

        assert "scenario" in result
        assert len(result["scenario"]) > 0

    @patch("framework_forge.validation.tier1.LLMClient")
    def test_score_divergence_detects_difference(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "divergence_score": 8,
            "specificity_score": 7,
            "traceability_score": 9,
            "reasoning": "Framework response considers user experience dimension absent from baseline",
        }

        result = score_divergence(
            framework_response="From my perceptual lens, I see...",
            baseline_response="As Steve Jobs, I would focus on simplicity...",
            scenario="AI designs products",
            client=mock_client,
        )

        assert result["divergence_score"] >= 7

    def test_tier1_result_passes(self):
        results = [
            ScenarioResult(
                scenario="test",
                framework_response="deep response",
                baseline_response="shallow response",
                divergence_score=8,
                specificity_score=7,
                traceability_score=9,
                divergent=True,
            )
            for _ in range(5)
        ]
        tier1 = Tier1Result(scenario_results=results)
        assert tier1.passed is True
        assert tier1.divergent_count == 5

    def test_tier1_result_fails(self):
        results = [
            ScenarioResult(
                scenario="test",
                framework_response="response",
                baseline_response="response",
                divergence_score=3,
                specificity_score=2,
                traceability_score=4,
                divergent=False,
            )
            for _ in range(5)
        ]
        tier1 = Tier1Result(scenario_results=results)
        assert tier1.passed is False
        assert tier1.divergent_count == 0
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py -v`
Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 4: Implement `tier1.py`**

Create `framework_forge/validation/tier1.py`:

```python
"""Tier 1 Validation: Baseline Differentiation.

Tests whether the framework produces meaningfully different output from
naive persona prompting. Fully automated, no ground truth required.
"""

import json
from dataclasses import dataclass, asdict

from framework_forge.llm import LLMClient
from framework_forge.config import TIER1_MIN_DIVERGENT_SCENARIOS, TIER1_MIN_SCENARIOS


@dataclass
class ScenarioResult:
    """Result of a single scenario comparison."""

    scenario: str
    framework_response: str
    baseline_response: str
    divergence_score: int  # 0-10: how different are the responses?
    specificity_score: int  # 0-10: does framework response contain absent reasoning?
    traceability_score: int  # 0-10: can reasoning be traced to framework elements?
    divergent: bool  # True if divergence >= 6 AND specificity >= 5

    def to_dict(self) -> dict:
        return asdict(self)


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

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "divergent_count": self.divergent_count,
            "total_scenarios": len(self.scenario_results),
            "threshold": TIER1_MIN_DIVERGENT_SCENARIOS,
            "scenarios": [r.to_dict() for r in self.scenario_results],
        }


def generate_scenario(
    person: str,
    domain: str,
    existing_scenarios: list[str],
    client: LLMClient | None = None,
) -> dict:
    """Generate a novel scenario for surprise testing.

    Args:
        person: Name of the historical figure.
        domain: Their domain(s).
        existing_scenarios: Already-generated scenarios (to avoid duplicates).
        client: LLM client.

    Returns:
        Dict with "scenario" and "domain_relevance" keys.
    """
    if client is None:
        client = LLMClient()

    existing_list = "\n".join(f"- {s}" for s in existing_scenarios) if existing_scenarios else "None yet."

    return client.prompt_json(
        system="Generate a novel modern scenario for testing a historical thinking framework. The scenario must be genuinely novel (not a reskin of a known decision), complex enough to require deep reasoning, and relevant to the person's domain. Respond in JSON.",
        user=f"""Generate one novel scenario for testing {person}'s thinking framework.

Domain: {domain}
Already generated (do NOT duplicate): {existing_list}

The scenario should present a modern problem {person} never encountered that requires their reasoning framework to navigate. It should be specific and detailed, not abstract.

Return: {{"scenario": "The detailed scenario description", "domain_relevance": "Why this is relevant to {person}'s domain"}}""",
        max_tokens=1024,
    )


def generate_framework_response(
    scenario: str,
    framework: dict,
    person: str,
    client: LLMClient | None = None,
) -> str:
    """Generate a response using the full framework.

    Args:
        scenario: The scenario to respond to.
        framework: The full framework JSON dict.
        person: Name of the historical figure.
        client: LLM client.

    Returns:
        The framework-grounded response text.
    """
    if client is None:
        client = LLMClient()

    # Build selector prompt from framework
    lens = framework.get("perceptual_lens", {})
    constructs = framework.get("bipolar_constructs", [])
    predictions = framework.get("behavioral_divergence_predictions", [])
    values = framework.get("value_hierarchy", {})

    system = f"""You reason through problems using {person}'s documented decision-making framework. This is a disciplined application of their documented reasoning patterns.

PERCEPTUAL LENS (highest priority):
{lens.get('statement', '')}
This determines what you notice first and how you frame situations.

COGNITIVE CONSTRUCTS:
{json.dumps(constructs, indent=2)}

BEHAVIORAL DIVERGENCE PREDICTIONS:
{json.dumps(predictions, indent=2)}

VALUE HIERARCHY:
{json.dumps(values, indent=2)}

Your reasoning must be traceable to specific framework elements. Tag each reasoning step with the framework element it derives from."""

    result = client.prompt(
        system=system,
        user=f"Analyze this situation and provide your reasoning:\n\n{scenario}",
        max_tokens=2048,
    )
    return result.raw_text


def generate_baseline_response(
    scenario: str,
    person: str,
    client: LLMClient | None = None,
) -> str:
    """Generate a naive baseline response (no framework, just persona name).

    Args:
        scenario: The scenario to respond to.
        person: Name of the historical figure.
        client: LLM client.

    Returns:
        The baseline response text.
    """
    if client is None:
        client = LLMClient()

    result = client.prompt(
        system=f"Answer as {person} would think about this.",
        user=f"Analyze this situation and provide your reasoning:\n\n{scenario}",
        max_tokens=2048,
    )
    return result.raw_text


def score_divergence(
    framework_response: str,
    baseline_response: str,
    scenario: str,
    client: LLMClient | None = None,
) -> dict:
    """Score the divergence between framework and baseline responses.

    Args:
        framework_response: Response generated with full framework.
        baseline_response: Response generated with naive persona prompt.
        scenario: The scenario that was presented.
        client: LLM client.

    Returns:
        Dict with divergence_score, specificity_score, traceability_score, reasoning.
    """
    if client is None:
        client = LLMClient()

    return client.prompt_json(
        system="""You are evaluating whether a thinking framework produces meaningfully different output from naive persona prompting. Score on three dimensions (0-10 each):

1. DIVERGENCE: How different are the two responses? (0 = identical reasoning, 10 = completely different approach)
2. SPECIFICITY: Does Response A contain reasoning ABSENT from Response B? (0 = no unique reasoning, 10 = entirely unique reasoning path)
3. TRACEABILITY: Can Response A's reasoning be traced to specific framework elements? (0 = generic, 10 = every step traceable)

Be rigorous. Surface-level differences in wording don't count. Look for differences in REASONING APPROACH, not just vocabulary.

Respond in JSON.""",
        user=f"""SCENARIO: {scenario}

RESPONSE A (framework-grounded):
{framework_response}

RESPONSE B (naive persona prompt):
{baseline_response}

Score the divergence:
{{"divergence_score": N, "specificity_score": N, "traceability_score": N, "reasoning": "explanation"}}""",
        max_tokens=1024,
    )


def run_tier1(
    framework: dict,
    person: str,
    domain: str,
    num_scenarios: int = 5,
    client: LLMClient | None = None,
) -> Tier1Result:
    """Run full Tier 1 validation.

    Generates novel scenarios, produces framework and baseline responses,
    and scores the divergence.

    Args:
        framework: The complete framework JSON dict.
        person: Name of the historical figure.
        domain: Their domain(s).
        num_scenarios: Number of scenarios to test. Default 5.
        client: LLM client.

    Returns:
        Tier1Result with pass/fail and per-scenario details.
    """
    if client is None:
        client = LLMClient()

    num_scenarios = max(num_scenarios, TIER1_MIN_SCENARIOS)
    results = []
    existing_scenarios = []

    for _ in range(num_scenarios):
        # Generate scenario
        scenario_data = generate_scenario(person, domain, existing_scenarios, client)
        scenario = scenario_data["scenario"]
        existing_scenarios.append(scenario)

        # Generate both responses
        fw_response = generate_framework_response(scenario, framework, person, client)
        bl_response = generate_baseline_response(scenario, person, client)

        # Score divergence
        scores = score_divergence(fw_response, bl_response, scenario, client)

        divergence = scores.get("divergence_score", 0)
        specificity = scores.get("specificity_score", 0)
        traceability = scores.get("traceability_score", 0)

        results.append(
            ScenarioResult(
                scenario=scenario,
                framework_response=fw_response,
                baseline_response=bl_response,
                divergence_score=divergence,
                specificity_score=specificity,
                traceability_score=traceability,
                divergent=(divergence >= 6 and specificity >= 5),
            )
        )

    return Tier1Result(scenario_results=results)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py -v`
Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/validation/ tests/test_validation.py
git commit -m "feat: Tier 1 validation — baseline differentiation"
```

---

## Task 11: Tier 2 Validation — Internal Consistency

**Files:**
- Create: `framework_forge/validation/tier2.py`
- Modify: `tests/test_validation.py` (add tests)

- [ ] **Step 1: Write the failing test**

Add to `tests/test_validation.py`:

```python
from framework_forge.validation.tier2 import run_tier2, Tier2Result


class TestTier2:
    @patch("framework_forge.validation.tier2.LLMClient")
    def test_run_tier2_passes_traceable_responses(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "total_reasoning_steps": 10,
            "traceable_steps": 9,
            "traceability_ratio": 0.9,
            "untraceable_steps": [
                {"step": "Minor rhetorical flourish", "reason": "Not framework-derived"}
            ],
            "lens_consistently_applied": True,
            "contradiction_found": False,
            "contradiction_details": None,
        }

        framework = {
            "perceptual_lens": {"statement": "test lens"},
            "bipolar_constructs": [],
            "behavioral_divergence_predictions": [],
        }

        tier1_scenarios = [
            {
                "scenario": "AI designs products",
                "framework_response": "Based on perceptual lens...",
            }
        ]

        result = run_tier2(framework, tier1_scenarios, client=mock_client)
        assert isinstance(result, Tier2Result)
        assert result.passed is True

    def test_tier2_fails_low_traceability(self):
        result = Tier2Result(
            traceability_ratio=0.5,
            lens_consistent=True,
            contradictions=[],
            per_scenario_details=[],
        )
        assert result.passed is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py::TestTier2 -v`
Expected: FAIL

- [ ] **Step 3: Implement `tier2.py`**

Create `framework_forge/validation/tier2.py`:

```python
"""Tier 2 Validation: Internal Consistency.

Checks whether framework outputs follow from the framework's own stated
perceptual lens, bipolar constructs, and behavioral divergence predictions.
"""

import json
from dataclasses import dataclass, asdict

from framework_forge.llm import LLMClient
from framework_forge.config import TIER2_MIN_TRACEABILITY


@dataclass
class Tier2Result:
    """Aggregate result of Tier 2 validation."""

    traceability_ratio: float  # 0.0 - 1.0
    lens_consistent: bool
    contradictions: list[dict]
    per_scenario_details: list[dict]

    @property
    def passed(self) -> bool:
        return (
            self.traceability_ratio >= TIER2_MIN_TRACEABILITY
            and self.lens_consistent
            and len(self.contradictions) == 0
        )

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "traceability_ratio": self.traceability_ratio,
            "threshold": TIER2_MIN_TRACEABILITY,
            "lens_consistent": self.lens_consistent,
            "contradictions": self.contradictions,
            "per_scenario_details": self.per_scenario_details,
        }


TIER2_SYSTEM = """You are auditing a framework-grounded response for internal consistency.

Check:
1. TRACEABILITY: Can each reasoning step be traced to a specific framework element
   (perceptual lens, bipolar construct, or behavioral divergence prediction)?
   Count total reasoning steps and traceable steps.

2. LENS CONSISTENCY: Is the perceptual lens applied consistently? Does the response
   frame the problem the way the lens predicts?

3. CONTRADICTIONS: Does any conclusion contradict a behavioral divergence prediction
   or the value hierarchy?

Be strict. A reasoning step that "sounds like" the person but cannot be traced
to a specific framework element is NOT traceable — it may be the LLM's generic
representation leaking through.

Respond in JSON."""


TIER2_PROMPT = """Audit this framework-grounded response for internal consistency.

FRAMEWORK:
Perceptual Lens: {lens}
Bipolar Constructs: {constructs}
Divergence Predictions: {predictions}

SCENARIO: {scenario}

FRAMEWORK RESPONSE:
{response}

Analyze and return:
{{
  "total_reasoning_steps": N,
  "traceable_steps": N,
  "traceability_ratio": 0.X,
  "untraceable_steps": [{{"step": "...", "reason": "..."}}],
  "lens_consistently_applied": true/false,
  "contradiction_found": true/false,
  "contradiction_details": "..." or null
}}"""


def run_tier2(
    framework: dict,
    tier1_scenarios: list[dict],
    client: LLMClient | None = None,
) -> Tier2Result:
    """Run Tier 2 validation on framework responses from Tier 1.

    Args:
        framework: The complete framework JSON dict.
        tier1_scenarios: List of dicts with "scenario" and "framework_response" keys.
        client: LLM client.

    Returns:
        Tier2Result with pass/fail and details.
    """
    if client is None:
        client = LLMClient()

    lens = json.dumps(framework.get("perceptual_lens", {}))
    constructs = json.dumps(framework.get("bipolar_constructs", []))
    predictions = json.dumps(framework.get("behavioral_divergence_predictions", []))

    all_details = []
    total_steps = 0
    total_traceable = 0
    lens_consistent_all = True
    all_contradictions = []

    for sc in tier1_scenarios:
        result = client.prompt_json(
            system=TIER2_SYSTEM,
            user=TIER2_PROMPT.format(
                lens=lens,
                constructs=constructs,
                predictions=predictions,
                scenario=sc["scenario"],
                response=sc["framework_response"],
            ),
            max_tokens=2048,
        )

        steps = result.get("total_reasoning_steps", 0)
        traceable = result.get("traceable_steps", 0)
        total_steps += steps
        total_traceable += traceable

        if not result.get("lens_consistently_applied", True):
            lens_consistent_all = False

        if result.get("contradiction_found", False):
            all_contradictions.append({
                "scenario": sc["scenario"],
                "details": result.get("contradiction_details", ""),
            })

        all_details.append(result)

    ratio = total_traceable / total_steps if total_steps > 0 else 0.0

    return Tier2Result(
        traceability_ratio=ratio,
        lens_consistent=lens_consistent_all,
        contradictions=all_contradictions,
        per_scenario_details=all_details,
    )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py -v`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/validation/tier2.py tests/test_validation.py
git commit -m "feat: Tier 2 validation — internal consistency check"
```

---

## Task 12: Tier 3 Preparation and Floor Check

**Files:**
- Create: `framework_forge/validation/tier3_prep.py`
- Create: `framework_forge/validation/floor_check.py`
- Modify: `tests/test_validation.py` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `tests/test_validation.py`:

```python
from framework_forge.validation.tier3_prep import prepare_tier3_materials
from framework_forge.validation.floor_check import run_floor_check, FloorCheckResult


class TestTier3Prep:
    def test_prepare_materials_creates_files(self, tmp_framework_dir):
        tier1_results = [
            {
                "scenario": "AI designs products",
                "framework_response": "Framework deep response",
                "baseline_response": "Baseline shallow response",
            }
        ]
        output = prepare_tier3_materials(
            tier1_results=tier1_results,
            person="Steve Jobs",
            output_dir=tmp_framework_dir / "validation" / "tier3_materials",
        )
        assert (tmp_framework_dir / "validation" / "tier3_materials" / "review_packet.json").exists()


class TestFloorCheck:
    @patch("framework_forge.validation.floor_check.LLMClient")
    def test_floor_check_passes(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "alignment_score": 7,
            "aligned": True,
            "reasoning": "Framework reasoning matches documented reasoning on key points",
        }

        framework = {"perceptual_lens": {"statement": "test"}}
        historical_decisions = [
            {
                "context": "Apple entering phone market",
                "options": "Build keyboard phone or touchscreen-only",
                "actual_reasoning": "Keyboard mediates experience; remove it",
            }
        ]

        result = run_floor_check(framework, historical_decisions, client=mock_client)
        assert isinstance(result, FloorCheckResult)
        assert result.passed is True

    def test_floor_check_fails_low_alignment(self):
        result = FloorCheckResult(
            alignment_ratio=0.3,
            per_decision_results=[],
        )
        assert result.passed is False
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py::TestTier3Prep tests/test_validation.py::TestFloorCheck -v`
Expected: FAIL

- [ ] **Step 3: Implement `tier3_prep.py`**

Create `framework_forge/validation/tier3_prep.py`:

```python
"""Tier 3 Preparation: Generate materials for expert human review.

Tier 3 cannot be automated — it requires human judgment. This module
generates the review packet: paired framework/baseline responses,
presented without labels, for expert evaluation.
"""

import json
import random
from pathlib import Path


def prepare_tier3_materials(
    tier1_results: list[dict],
    person: str,
    output_dir: Path,
) -> Path:
    """Generate review materials for expert evaluation.

    Creates a review packet with paired responses (framework vs baseline),
    randomly ordered so the reviewer doesn't know which is which.

    Args:
        tier1_results: List of dicts with scenario, framework_response, baseline_response.
        person: Name of the historical figure.
        output_dir: Where to save the review packet.

    Returns:
        Path to the saved review_packet.json.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    review_items = []
    for i, result in enumerate(tier1_results):
        # Randomly assign A/B to prevent ordering bias
        if random.random() > 0.5:
            response_a = result["framework_response"]
            response_b = result["baseline_response"]
            key = {"a": "framework", "b": "baseline"}
        else:
            response_a = result["baseline_response"]
            response_b = result["framework_response"]
            key = {"a": "baseline", "b": "framework"}

        review_items.append({
            "id": i + 1,
            "scenario": result["scenario"],
            "response_a": response_a,
            "response_b": response_b,
            "_answer_key": key,  # For scoring after review
            "reviewer_choice": None,  # To be filled by reviewer
            "reviewer_notes": None,
        })

    packet = {
        "person": person,
        "instructions": (
            f"You are reviewing reasoning responses attributed to {person}'s thinking framework. "
            f"For each scenario, two responses are presented (A and B). "
            f"Please indicate: (1) Which response better represents how {person} would actually think? "
            f"(2) Does either response contain non-obvious but plausible reasoning? "
            f"(3) Does either response feel wrong or out of character?"
        ),
        "items": review_items,
    }

    path = output_dir / "review_packet.json"
    path.write_text(json.dumps(packet, indent=2, ensure_ascii=False), encoding="utf-8")
    return path
```

- [ ] **Step 4: Implement `floor_check.py`**

Create `framework_forge/validation/floor_check.py`:

```python
"""Floor Check: Historical alignment sanity check.

NOT a validation tier — this is a sanity check confirming the framework
isn't structurally broken. If the framework can't even align with known
historical decisions, something is fundamentally wrong.
"""

import json
from dataclasses import dataclass

from framework_forge.llm import LLMClient
from framework_forge.config import FLOOR_CHECK_MIN_ALIGNMENT


@dataclass
class FloorCheckResult:
    """Result of historical alignment floor check."""

    alignment_ratio: float
    per_decision_results: list[dict]

    @property
    def passed(self) -> bool:
        return self.alignment_ratio >= FLOOR_CHECK_MIN_ALIGNMENT

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "alignment_ratio": self.alignment_ratio,
            "threshold": FLOOR_CHECK_MIN_ALIGNMENT,
            "per_decision_results": self.per_decision_results,
        }


def run_floor_check(
    framework: dict,
    historical_decisions: list[dict],
    client: LLMClient | None = None,
) -> FloorCheckResult:
    """Check framework alignment against known historical decisions.

    Args:
        framework: The complete framework JSON dict.
        historical_decisions: List of dicts with "context", "options", "actual_reasoning".
        client: LLM client.

    Returns:
        FloorCheckResult with pass/fail.
    """
    if client is None:
        client = LLMClient()

    results = []
    aligned_count = 0

    for decision in historical_decisions:
        result = client.prompt_json(
            system=f"""You are evaluating whether a thinking framework's reasoning aligns with a documented historical decision. The framework should produce reasoning that reaches a similar conclusion through a similar logic path. Score alignment 0-10. Respond in JSON.""",
            user=f"""FRAMEWORK:
{json.dumps(framework.get('perceptual_lens', {}), indent=2)}
{json.dumps(framework.get('bipolar_constructs', []), indent=2)}

HISTORICAL DECISION:
Context: {decision['context']}
Options: {decision['options']}
(The framework does NOT know the actual decision — it must reason from the framework.)

ACTUAL REASONING (for comparison, not shown to framework):
{decision['actual_reasoning']}

Apply the framework to this situation, then compare:
{{"alignment_score": N, "aligned": true/false, "reasoning": "explanation"}}""",
            max_tokens=1024,
        )

        if result.get("aligned", False):
            aligned_count += 1
        results.append(result)

    ratio = aligned_count / len(historical_decisions) if historical_decisions else 0.0

    return FloorCheckResult(
        alignment_ratio=ratio,
        per_decision_results=results,
    )
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd C:/projects/greatminds && python -m pytest tests/test_validation.py -v`
Expected: All 8 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/validation/tier3_prep.py framework_forge/validation/floor_check.py tests/test_validation.py
git commit -m "feat: Tier 3 prep and historical alignment floor check"
```

---

## Task 13: CLI Entry Point

**Files:**
- Create: `framework_forge/cli.py`

The CLI ties all subsystems together into the workflow described in the spec.

- [ ] **Step 1: Implement `cli.py`**

Create `framework_forge/cli.py`:

```python
"""CLI entry point for Framework Forge."""

import json
from pathlib import Path

import click

from framework_forge.config import FRAMEWORKS_DIR


@click.group()
def cli():
    """Framework Forge: Extract thinking frameworks from historical figures."""
    pass


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def discover_sources(person: str, output: str | None):
    """Stage 1: Discover and triage sources for a historical figure."""
    from framework_forge.llm import LLMClient
    from framework_forge.sources import discover_sources as _discover, triage_sources

    output_dir = Path(output) if output else FRAMEWORKS_DIR / person.lower().replace(" ", "-")
    output_dir.mkdir(parents=True, exist_ok=True)

    click.echo(f"Discovering sources for {person}...")
    client = LLMClient()
    sources = _discover(person, client)
    ranked = triage_sources(sources)

    bib = [s.to_dict() for s in ranked]
    bib_path = output_dir / "sources" / "bibliography.json"
    bib_path.parent.mkdir(parents=True, exist_ok=True)
    bib_path.write_text(json.dumps(bib, indent=2), encoding="utf-8")

    click.echo(f"Found {len(ranked)} sources. Bibliography saved to {bib_path}")
    for s in ranked[:5]:
        click.echo(f"  [{s.source_type}] {s.title}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--source-dir", type=click.Path(exists=True), required=True, help="Directory with source text files.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def identify_incidents(person: str, source_dir: str, output: str | None):
    """Stage 2: Identify candidate critical incidents from source texts."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.incidents import identify_incidents as _identify

    source_path = Path(source_dir)
    output_dir = Path(output) if output else FRAMEWORKS_DIR / person.lower().replace(" ", "-")

    client = LLMClient()
    all_incidents = []

    for txt_file in sorted(source_path.glob("*.txt")):
        click.echo(f"Scanning {txt_file.name}...")
        text = txt_file.read_text(encoding="utf-8")
        incidents = _identify(text, txt_file.stem, person, client)
        all_incidents.extend(incidents)
        click.echo(f"  Found {len(incidents)} candidate incidents")

    incidents_dir = output_dir / "incidents"
    incidents_dir.mkdir(parents=True, exist_ok=True)
    incidents_path = incidents_dir / "candidates.json"
    incidents_path.write_text(
        json.dumps([i.to_dict() for i in all_incidents], indent=2),
        encoding="utf-8",
    )

    click.echo(f"\nTotal: {len(all_incidents)} candidate incidents saved to {incidents_path}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--incidents-file", type=click.Path(exists=True), required=True, help="Path to candidates.json.")
@click.option("--output", type=click.Path(), default=None, help="Output directory.")
def reconstruct(person: str, incidents_file: str, output: str | None):
    """Stage 2b: Apply CDM probes to reconstruct each incident."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.incidents import CandidateIncident
    from framework_forge.extraction.cdm_probes import reconstruct_incident

    candidates = json.loads(Path(incidents_file).read_text(encoding="utf-8"))
    output_dir = Path(output) if output else Path(incidents_file).parent.parent

    client = LLMClient()
    reconstructed = []

    for i, cand in enumerate(candidates):
        click.echo(f"Reconstructing [{i+1}/{len(candidates)}]: {cand['title']}...")
        candidate = CandidateIncident(**cand)
        incident = reconstruct_incident(
            candidate=candidate,
            person=person,
            incident_id=f"incident-{i+1:03d}",
            client=client,
        )
        reconstructed.append(incident.to_dict())

    out_path = output_dir / "incidents" / "incidents.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(reconstructed, indent=2), encoding="utf-8")
    click.echo(f"\n{len(reconstructed)} incidents reconstructed. Saved to {out_path}")


@cli.command()
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--framework-dir", type=click.Path(exists=True), required=True, help="Framework directory.")
@click.option("--domain", required=True, help="Person's domain(s).")
def build(person: str, framework_dir: str, domain: str):
    """Stages 3-6: Map constructs, derive lens, generate predictions, encode framework."""
    from framework_forge.llm import LLMClient
    from framework_forge.extraction.cdm_probes import ReconstructedIncident
    from framework_forge.extraction.constructs import map_constructs
    from framework_forge.extraction.lens import derive_lens
    from framework_forge.extraction.divergence import generate_predictions
    from framework_forge.encoding.framework import assemble_framework, save_framework

    fw_dir = Path(framework_dir)
    client = LLMClient()

    # Load incidents
    incidents_path = fw_dir / "incidents" / "incidents.json"
    raw_incidents = json.loads(incidents_path.read_text(encoding="utf-8"))
    incidents = [ReconstructedIncident(**inc) for inc in raw_incidents]
    click.echo(f"Loaded {len(incidents)} reconstructed incidents.")

    # Stage 3: Bipolar construct mapping
    click.echo("Mapping bipolar constructs...")
    constructs = map_constructs(incidents, person, client)
    constructs_path = fw_dir / "constructs.json"
    constructs_path.write_text(
        json.dumps([c.to_dict() for c in constructs], indent=2), encoding="utf-8"
    )
    click.echo(f"  {len(constructs)} constructs mapped.")

    # Stage 4: Perceptual lens derivation (hold out last 20% of incidents)
    holdout_count = max(2, len(incidents) // 5)
    holdout_ids = [inc.id for inc in incidents[-holdout_count:]]
    click.echo(f"Deriving perceptual lens (holdout: {len(holdout_ids)} incidents)...")
    lens = derive_lens(constructs, incidents, person, holdout_ids, client)
    click.echo(f"  Lens: {lens.statement}")

    # Stage 5: Behavioral divergence predictions
    click.echo("Generating behavioral divergence predictions...")
    predictions = generate_predictions(lens, constructs, person, client)
    click.echo(f"  {len(predictions)} predictions generated.")

    # Stage 6: Assemble and save framework
    click.echo("Assembling framework JSON...")
    framework = assemble_framework(
        person=person,
        domain=domain,
        incidents=incidents,
        constructs=constructs,
        lens=lens,
        predictions=predictions,
    )
    path = save_framework(framework, fw_dir)
    click.echo(f"Framework saved to {path}")


@cli.command()
@click.option("--framework", type=click.Path(exists=True), required=True, help="Path to framework.json.")
@click.option("--person", required=True, help="Full name of the historical figure.")
@click.option("--domain", required=True, help="Person's domain(s).")
@click.option("--mode", type=click.Choice(["tier1", "tier2", "full", "floor-check"]), default="full")
def validate(framework: str, person: str, domain: str, mode: str):
    """Stage 7: Run three-tier validation."""
    from framework_forge.llm import LLMClient
    from framework_forge.validation.tier1 import run_tier1
    from framework_forge.validation.tier2 import run_tier2
    from framework_forge.validation.tier3_prep import prepare_tier3_materials
    from framework_forge.validation.floor_check import run_floor_check

    fw_path = Path(framework)
    fw_dir = fw_path.parent
    fw = json.loads(fw_path.read_text(encoding="utf-8"))
    client = LLMClient()

    if mode in ("tier1", "full"):
        click.echo("Running Tier 1: Baseline Differentiation...")
        tier1 = run_tier1(fw, person, domain, client=client)
        result_path = fw_dir / "validation" / "tier1_results.json"
        result_path.parent.mkdir(parents=True, exist_ok=True)
        result_path.write_text(json.dumps(tier1.to_dict(), indent=2), encoding="utf-8")
        status = "PASSED" if tier1.passed else "FAILED"
        click.echo(f"  Tier 1: {status} ({tier1.divergent_count}/{len(tier1.scenario_results)} divergent)")

    if mode in ("tier2", "full"):
        # Load Tier 1 results for Tier 2 input
        tier1_path = fw_dir / "validation" / "tier1_results.json"
        if not tier1_path.exists():
            click.echo("  Tier 1 results not found. Run tier1 first.")
            return
        tier1_data = json.loads(tier1_path.read_text())
        scenarios = [
            {"scenario": s["scenario"], "framework_response": s["framework_response"]}
            for s in tier1_data["scenarios"]
        ]

        click.echo("Running Tier 2: Internal Consistency...")
        tier2 = run_tier2(fw, scenarios, client=client)
        result_path = fw_dir / "validation" / "tier2_results.json"
        result_path.write_text(json.dumps(tier2.to_dict(), indent=2), encoding="utf-8")
        status = "PASSED" if tier2.passed else "FAILED"
        click.echo(f"  Tier 2: {status} (traceability: {tier2.traceability_ratio:.0%})")

    if mode == "full":
        click.echo("Preparing Tier 3 materials for expert review...")
        tier1_data = json.loads((fw_dir / "validation" / "tier1_results.json").read_text())
        scenarios = [
            {
                "scenario": s["scenario"],
                "framework_response": s["framework_response"],
                "baseline_response": s["baseline_response"],
            }
            for s in tier1_data["scenarios"]
        ]
        path = prepare_tier3_materials(scenarios, person, fw_dir / "validation" / "tier3_materials")
        click.echo(f"  Review packet saved to {path}")

    if mode == "floor-check":
        click.echo("Running floor check: historical alignment...")
        # Load incidents for historical decisions
        incidents_path = fw_dir / "incidents" / "incidents.json"
        if not incidents_path.exists():
            click.echo("  No incidents found for floor check.")
            return
        incidents = json.loads(incidents_path.read_text())
        historical = [
            {
                "context": inc["context"],
                "options": f"Decision: {inc['decision']}",
                "actual_reasoning": inc.get("divergence_explanation", ""),
            }
            for inc in incidents[:10]
        ]
        result = run_floor_check(fw, historical, client)
        status = "PASSED" if result.passed else "FAILED"
        click.echo(f"  Floor check: {status} (alignment: {result.alignment_ratio:.0%})")


if __name__ == "__main__":
    cli()
```

- [ ] **Step 2: Verify CLI loads**

Run: `cd C:/projects/greatminds && python -m framework_forge.cli --help`
Expected:
```
Usage: python -m framework_forge.cli [OPTIONS] COMMAND [ARGS]...

  Framework Forge: Extract thinking frameworks from historical figures.

Commands:
  build               Stages 3-6: Map constructs, derive lens, generate...
  discover-sources    Stage 1: Discover and triage sources.
  identify-incidents  Stage 2: Identify candidate critical incidents.
  reconstruct         Stage 2b: Apply CDM probes to reconstruct each incident.
  validate            Stage 7: Run three-tier validation.
```

- [ ] **Step 3: Commit**

```bash
cd C:/projects/greatminds
git add framework_forge/cli.py
git commit -m "feat: CLI entry point tying all subsystems together"
```

---

## Task 14: Run Full Pipeline — Steve Jobs Framework

**Files:**
- No new code files — this task uses the tooling built in Tasks 1-13.

This is the actual extraction. It follows the spec's Phase 1 build order exactly.

- [ ] **Step 1: Discover sources**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli discover-sources --person "Steve Jobs" --output frameworks/steve-jobs
```
Expected: Bibliography saved to `frameworks/steve-jobs/sources/bibliography.json` with 10-15 sources.

- [ ] **Step 2: Review bibliography and manually add primary source texts**

Open `frameworks/steve-jobs/sources/bibliography.json` and review. For sources that are books (url = "offline"), you will need to manually prepare text excerpts. Create text files in `frameworks/steve-jobs/sources/texts/`:

```bash
mkdir -p frameworks/steve-jobs/sources/texts
# Add text files manually:
# - isaacson-biography.txt (key chapters with decision-making content)
# - all-things-d-interviews.txt (transcripts)
# - keynote-decisions.txt (documented product decisions)
# - etc.
```

This is the step that requires manual effort — source texts must be gathered from primary materials.

- [ ] **Step 3: Identify candidate incidents from source texts**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli identify-incidents \
  --person "Steve Jobs" \
  --source-dir frameworks/steve-jobs/sources/texts \
  --output frameworks/steve-jobs
```
Expected: `frameworks/steve-jobs/incidents/candidates.json` with 20-30 candidate incidents.

- [ ] **Step 4: Review candidate incidents**

Open `candidates.json`. Remove incidents where `reasoning_visible` is false or the excerpt is too thin. Target: keep 20-25 high-quality incidents with visible reasoning process.

- [ ] **Step 5: Reconstruct incidents with CDM probes**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli reconstruct \
  --person "Steve Jobs" \
  --incidents-file frameworks/steve-jobs/incidents/candidates.json \
  --output frameworks/steve-jobs
```
Expected: `frameworks/steve-jobs/incidents/incidents.json` with full CDM probe reconstruction for each incident.

- [ ] **Step 6: Review reconstructed incidents**

Open `incidents.json`. For each incident, verify:
- CDM probes contain specific, non-generic content
- Counterfactual is genuinely different from the actual decision
- Divergence explanation traces to observable cognitive pattern
- Source citations are accurate

Edit where needed — this is analytical judgment, not automation.

- [ ] **Step 7: Build the framework (constructs, lens, predictions, encoding)**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli build \
  --person "Steve Jobs" \
  --framework-dir frameworks/steve-jobs \
  --domain "Technology, Design, Business"
```
Expected: `frameworks/steve-jobs/framework.json` with full selector architecture.

- [ ] **Step 8: Review the framework**

Open `framework.json`. Verify:
- Perceptual lens is specific (not "Jobs valued simplicity" — deeper than that)
- Bipolar constructs are genuinely bipolar (not just "good vs. bad")
- Behavioral divergence predictions are testable and non-obvious
- 8-12 constructs present
- Source traceability throughout

- [ ] **Step 9: Run Tier 1 validation**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli validate \
  --framework frameworks/steve-jobs/framework.json \
  --person "Steve Jobs" \
  --domain "Technology, Design, Business" \
  --mode tier1
```
Expected: `PASSED` with >= 4/5 divergent scenarios. If FAILED, iterate: review which scenarios failed, identify weak framework sections, deepen those sections, re-run.

- [ ] **Step 10: Run Tier 2 validation**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli validate \
  --framework frameworks/steve-jobs/framework.json \
  --person "Steve Jobs" \
  --domain "Technology, Design, Business" \
  --mode tier2
```
Expected: `PASSED` with >= 80% traceability and no contradictions. If FAILED, review untraceable reasoning steps and strengthen the framework elements they should trace to.

- [ ] **Step 11: Run full validation (includes Tier 3 prep)**

```bash
cd C:/projects/greatminds
python -m framework_forge.cli validate \
  --framework frameworks/steve-jobs/framework.json \
  --person "Steve Jobs" \
  --domain "Technology, Design, Business" \
  --mode full
```
Expected: Tier 1 PASSED, Tier 2 PASSED, and review packet saved to `frameworks/steve-jobs/validation/tier3_materials/review_packet.json`.

- [ ] **Step 12: Run Tier 3 — Expert review**

Share `review_packet.json` with 3-5 people familiar with Jobs' thinking. Collect their responses. This is the surprise test — do they find the framework-grounded reasoning plausible and non-obvious?

Success criteria from spec:
- Expert picks framework response over baseline on >= 4/5 scenarios
- At least 2/5 scenarios produce a "surprise"
- No scenario produces fundamentally inconsistent reasoning

- [ ] **Step 13: Commit final framework**

```bash
cd C:/projects/greatminds
git add frameworks/steve-jobs/
git commit -m "feat: Steve Jobs framework v1.0 — Phase 1 complete"
```

---

## Summary

| Task | What It Builds | Tests |
|------|---------------|-------|
| 1 | Project scaffolding, config, dependencies | Setup verification |
| 2 | LLM client wrapper | 6 tests |
| 3 | Source discovery, fetching, triage | 4 tests |
| 4 | Critical incident identification | 3 tests |
| 5 | CDM probe reconstruction | 2 tests |
| 6 | Bipolar construct mapping | 2 tests |
| 7 | Perceptual lens derivation | 2 tests |
| 8 | Behavioral divergence predictions | 1 test |
| 9 | Framework JSON encoding | 2 tests |
| 10 | Tier 1 validation (baseline differentiation) | 4 tests |
| 11 | Tier 2 validation (internal consistency) | 2 tests |
| 12 | Tier 3 prep + floor check | 3 tests |
| 13 | CLI entry point | Manual verification |
| 14 | Steve Jobs framework extraction | Pipeline execution |

**Total: ~31 automated tests, 14 tasks, one complete framework.**

Phase 1 is complete when:
- All 31 tests pass
- Steve Jobs framework passes Tier 1 (>= 4/5 divergent) and Tier 2 (>= 80% traceable)
- Tier 3 expert reviewers find framework reasoning plausible and non-obvious on >= 2/5 novel scenarios
