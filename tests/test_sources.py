"""Tests for source discovery, fetching, and triage."""

import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock, call
import httpx
from framework_forge.sources.discovery import discover_sources
from framework_forge.sources.triage import triage_sources, SourceEntry
from framework_forge.sources.fetcher import clean_html, fetch_source, FetchError


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


class TestFetchSource:
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

    @patch("framework_forge.sources.fetcher.time.sleep")
    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_retries_on_timeout_and_raises_fetch_error(
        self, mock_get, mock_sleep, tmp_path
    ):
        mock_get.side_effect = httpx.TimeoutException("timed out")

        output_path = tmp_path / "out.txt"
        with pytest.raises(FetchError, match="Failed to fetch"):
            fetch_source("https://slow.example.com", output_path, retries=3, retry_delay=0.1)

        assert mock_get.call_count == 3
        assert mock_sleep.call_count == 2

    @patch("framework_forge.sources.fetcher.time.sleep")
    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_retries_on_5xx_then_succeeds(self, mock_get, mock_sleep, tmp_path):
        fail_response = MagicMock()
        fail_response.status_code = 503
        http_err = httpx.HTTPStatusError(
            "503", request=MagicMock(), response=fail_response
        )
        fail_response.raise_for_status.side_effect = http_err

        ok_response = MagicMock()
        ok_response.headers = {"content-type": "text/plain"}
        ok_response.text = "Recovered"
        ok_response.raise_for_status.return_value = None

        mock_get.side_effect = [fail_response, ok_response]

        output_path = tmp_path / "out.txt"
        text = fetch_source("https://example.com", output_path, retries=3, retry_delay=0.1)

        assert text == "Recovered"
        assert mock_get.call_count == 2
        assert mock_sleep.call_count == 1

    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_raises_fetch_error_on_4xx(self, mock_get, tmp_path):
        fail_response = MagicMock()
        fail_response.status_code = 404
        http_err = httpx.HTTPStatusError(
            "404", request=MagicMock(), response=fail_response
        )
        fail_response.raise_for_status.side_effect = http_err
        mock_get.return_value = fail_response

        output_path = tmp_path / "out.txt"
        with pytest.raises(FetchError, match="HTTP 404"):
            fetch_source("https://example.com/missing", output_path, retries=3)

        # 4xx should not be retried
        assert mock_get.call_count == 1

    @patch("framework_forge.sources.fetcher.time.sleep")
    @patch("framework_forge.sources.fetcher.httpx.get")
    def test_fetch_source_retries_on_request_error(self, mock_get, mock_sleep, tmp_path):
        mock_get.side_effect = httpx.RequestError("connection refused")

        output_path = tmp_path / "out.txt"
        with pytest.raises(FetchError, match="Failed to fetch"):
            fetch_source("https://example.com", output_path, retries=2, retry_delay=0.0)

        assert mock_get.call_count == 2

    def test_fetch_source_raises_value_error_for_zero_retries(self, tmp_path):
        output_path = tmp_path / "out.txt"
        with pytest.raises(ValueError, match="retries must be >= 1"):
            fetch_source("https://example.com", output_path, retries=0)
