"""Tests for source discovery, fetching, and triage."""

import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

import httpx

from framework_forge.sources import discovery
from framework_forge.sources.discovery import discover_sources
from framework_forge.sources.fetcher import FetchError, clean_html, fetch_source
from framework_forge.sources.triage import SourceEntry, triage_sources


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

    def test_triage_sends_unknown_types_to_end(self):
        entries = [
            SourceEntry("Known", "http://a.com", "critical_incident", "incident", ["layer2"]),
            SourceEntry("Unknown", "http://b.com", "mystery_type", "fallback", ["layer1"]),
        ]

        ranked = triage_sources(entries)

        assert ranked[0].source_type == "critical_incident"
        assert ranked[1].source_type == "mystery_type"


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

    def test_preserves_article_content_while_stripping_chrome(self):
        html = """
            <html>
              <head><style>body { color: red; }</style></head>
              <body>
                <header><nav>Home About Jobs</nav></header>
                <main>
                  <article>
                    <p>Hello <strong>world</strong> &amp; beyond.</p>
                    <div>Second paragraph with <em>details</em>.</div>
                  </article>
                </main>
                <footer>Footer noise</footer>
                <script>window.alert("ignore me")</script>
              </body>
            </html>
        """

        result = clean_html(html)

        assert "Home About Jobs" not in result
        assert "Footer noise" not in result
        assert "window.alert" not in result
        assert "body { color: red; }" not in result
        assert "Hello world & beyond." in result
        assert "Second paragraph with details." in result
        assert "&amp;" not in result

    def test_strips_navigation_blocks_and_decodes_entities(self):
        html = (
            "<header>Top</header><!--ignore--><nav>Menu</nav>"
            "<p>Hello &amp; goodbye</p><div>Line&nbsp;Two</div>"
            "<footer>Bottom</footer>"
        )
        result = clean_html(html)

        assert "Top" not in result
        assert "Menu" not in result
        assert "Bottom" not in result
        assert "ignore" not in result
        assert "Hello & goodbye" in result
        assert "Line Two" in result


class TestDiscoverSources:
    @patch("framework_forge.sources.discovery.LLMClient")
    def test_discover_sources_maps_sources_and_defaults(self, mock_llm_cls):
        mock_client = MagicMock()
        mock_llm_cls.return_value = mock_client
        mock_client.prompt_json.return_value = {
            "sources": [
                {
                    "title": "Primary Letter",
                    "url": "https://example.com/letter",
                    "source_type": "private_writing",
                    "description": "A direct letter",
                    "evidence_layers": ["layer1", "layer2"],
                },
                {
                    "title": "Sparse Entry",
                },
            ]
        }

        sources = discover_sources("Catherine the Great", client=None)

        assert len(sources) == 2
        assert sources[0].title == "Primary Letter"
        assert sources[0].source_type == "private_writing"
        assert sources[1].title == "Sparse Entry"
        assert sources[1].url == ""
        assert sources[1].source_type == "web_summary"
        assert sources[1].evidence_layers == ["layer1"]
        mock_client.prompt_json.assert_called_once()

    def test_discover_sources_normalizes_llm_payload(self):
        fake_client = MagicMock()
        fake_client.prompt_json.return_value = {
            "sources": [
                {
                    "title": "Founder story",
                    "url": "https://example.com/story",
                    "source_type": "critical_incident",
                    "description": "A canonical decision-making episode.",
                    "evidence_layers": ["layer2", "layer3"],
                },
                {
                    "title": "Fallback summary",
                    "description": "A weak orientation source.",
                },
            ]
        }

        with patch.object(discovery, "LLMClient", return_value=fake_client):
            entries = discovery.discover_sources("Steve Jobs")

        assert fake_client.prompt_json.called
        assert len(entries) == 2
        assert entries[0] == SourceEntry(
            title="Founder story",
            url="https://example.com/story",
            source_type="critical_incident",
            description="A canonical decision-making episode.",
            evidence_layers=["layer2", "layer3"],
        )
        assert entries[1] == SourceEntry(
            title="Fallback summary",
            url="",
            source_type="web_summary",
            description="A weak orientation source.",
            evidence_layers=["layer1"],
        )


class TestFetchSource:
    def _make_response(self, *, text: str, content_type: str) -> MagicMock:
        response = MagicMock()
        response.headers = {"content-type": content_type}
        response.text = text
        response.raise_for_status.return_value = None
        return response

    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_cleans_html_and_writes_file(self, mock_get, tmp_path):
        response = MagicMock()
        response.headers = {"content-type": "text/html; charset=utf-8"}
        response.text = "<p>Hello &amp; goodbye</p>"
        response.raise_for_status.return_value = None
        mock_get.return_value = response

        output_path = tmp_path / "nested" / "page.txt"
        text = fetch_source("https://example.com", output_path)

        assert text == "Hello & goodbye"
        assert output_path.read_text(encoding="utf-8") == "Hello & goodbye"
        mock_get.assert_called_once()

    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_preserves_non_html_text(self, mock_get, tmp_path):
        response = MagicMock()
        response.headers = {"content-type": "text/plain"}
        response.text = "Plain text payload"
        response.raise_for_status.return_value = None
        mock_get.return_value = response

        output_path = tmp_path / "plain.txt"
        text = fetch_source("https://example.com/plain", output_path)

        assert text == "Plain text payload"
        assert output_path.read_text(encoding="utf-8") == "Plain text payload"

    def test_fetch_source_cleans_html_and_writes_output(self, tmp_path):
        url = "https://example.com/article"
        output_path = tmp_path / "sources" / "article.txt"
        response = self._make_response(
            text="""
                <html>
                  <body>
                    <header><nav>Skip me</nav></header>
                    <article><p>Important <b>decision</b> memo.</p></article>
                    <footer>Skip me too</footer>
                  </body>
                </html>
            """,
            content_type="text/html; charset=utf-8",
        )

        with patch("framework_forge.sources.fetcher.httpx.get", return_value=response) as mock_get:
            result = fetch_source(url, output_path)

        assert result == "Important decision memo."
        assert output_path.read_text(encoding="utf-8") == "Important decision memo."
        mock_get.assert_called_once_with(
            url,
            headers={"User-Agent": "FrameworkForge/0.1 (research tool)"},
            timeout=30.0,
            follow_redirects=True,
        )
        response.raise_for_status.assert_called_once()

    def test_fetch_source_round_trips_non_html_payload(self, tmp_path):
        url = "https://example.com/data.txt"
        output_path = tmp_path / "sources" / "data.txt"
        payload = "plain text payload with <angle brackets> left intact"
        response = self._make_response(text=payload, content_type="text/plain; charset=utf-8")

        with patch("framework_forge.sources.fetcher.httpx.get", return_value=response):
            result = fetch_source(url, output_path)

        assert result == payload
        assert output_path.read_text(encoding="utf-8") == payload

    def test_fetch_source_bubbles_request_failures(self, tmp_path):
        url = "https://example.com/unreachable"
        output_path = tmp_path / "sources" / "missing.txt"
        request = httpx.Request("GET", url)
        error = httpx.ConnectError("connection refused", request=request)

        with patch("framework_forge.sources.fetcher.httpx.get", side_effect=error):
            with pytest.raises(FetchError, match="connection refused"):
                fetch_source(url, output_path)

        assert not output_path.exists()
