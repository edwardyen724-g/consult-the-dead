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
    """Use LLM to identify the best sources for a historical figure."""
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
