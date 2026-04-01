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
