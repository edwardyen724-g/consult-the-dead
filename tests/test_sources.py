"""Tests for source discovery, fetching, and triage."""

import json
import pytest
from unittest.mock import patch, MagicMock
from framework_forge.config import SOURCE_TYPES
from framework_forge.sources.triage import triage_sources, SourceEntry
from framework_forge.sources.fetcher import clean_html, fetch_source


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

    def test_unknown_source_type_falls_back_to_lowest_priority(self):
        known = SourceEntry("Known", "http://a.com", SOURCE_TYPES[0], "known", ["layer1"])
        unknown = SourceEntry("Unknown", "http://b.com", "made_up_type", "unknown", ["layer1"])

        ranked = triage_sources([unknown, known])

        assert known.rank == 0
        assert unknown.rank == len(SOURCE_TYPES)
        assert ranked[-1].source_type == "made_up_type"


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


class TestFetchSourcePersistence:
    def _make_response(self, *, text: str, content_type: str) -> MagicMock:
        response = MagicMock()
        response.text = text
        response.headers = {"content-type": content_type}
        response.raise_for_status = MagicMock()
        return response

    def test_fetch_source_writes_cleaned_text_to_source_artifact_path(self, tmp_path):
        url = "https://example.com/keynote-decisions"
        output_path = tmp_path / "steve-jobs" / "sources" / "texts" / "keynote-decisions.txt"
        response = self._make_response(
            text="""
                <html>
                  <body>
                    <header><nav>Skip this</nav></header>
                    <article><p>Important <b>decision</b> memo.</p></article>
                    <footer>Skip this too</footer>
                  </body>
                </html>
            """,
            content_type="text/html; charset=utf-8",
        )

        with patch("framework_forge.sources.fetcher.httpx.get", return_value=response) as mock_get:
            first = fetch_source(url, output_path)
            second = fetch_source(url, output_path)

        assert output_path.exists()
        assert output_path.parent.name == "texts"
        assert output_path.parent.parent.name == "sources"
        assert first == "Important decision memo."
        assert second == "Important decision memo."
        assert output_path.read_text(encoding="utf-8") == "Important decision memo."
        mock_get.assert_called_with(
            url,
            headers={"User-Agent": "FrameworkForge/0.1 (research tool)"},
            timeout=30.0,
            follow_redirects=True,
        )
        assert response.raise_for_status.call_count == 2

    def test_fetch_source_preserves_non_html_payloads(self, tmp_path):
        url = "https://example.com/keynote.txt"
        output_path = tmp_path / "steve-jobs" / "sources" / "texts" / "keynote.txt"
        response = self._make_response(
            text="Plain source text\nwith a second line.",
            content_type="text/plain; charset=utf-8",
        )

        with patch("framework_forge.sources.fetcher.httpx.get", return_value=response):
            text = fetch_source(url, output_path)

        assert text == "Plain source text\nwith a second line."
        assert output_path.read_text(encoding="utf-8") == "Plain source text\nwith a second line."

    def test_source_entry_serializes_text_persistence_metadata(self):
        entry = SourceEntry(
            title="Keynote decisions",
            url="https://example.com/keynote",
            source_type="critical_incident",
            description="A source that should be fetched and persisted.",
            evidence_layers=["layer2", "layer3"],
            fetched=True,
            text_path="sources/texts/keynote-decisions.txt",
        )

        payload = entry.to_dict()

        assert payload["fetched"] is True
        assert payload["text_path"] == "sources/texts/keynote-decisions.txt"
        assert payload["evidence_layers"] == ["layer2", "layer3"]
