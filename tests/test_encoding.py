"""Tests for framework encoding module."""

import json
from pathlib import Path

import pytest


class TestAssembleFramework:
    """Tests for assemble_framework function."""

    def test_assembles_all_sections(self, sample_incident, sample_construct, sample_lens):
        """assemble_framework should produce a dict with all required sections."""
        from framework_forge.encoding.framework import assemble_framework

        predictions = [
            {
                "situation_type": "Product launch with incomplete feature set",
                "ordinary_response": "Delay launch until feature parity achieved",
                "framework_response": "Ship the core experience now; features follow",
                "because": "The lens prioritizes experience integrity over feature checklists",
                "confidence": 0.85,
            }
        ]

        result = assemble_framework(
            person="Steve Jobs",
            domain="product design and technology leadership",
            incidents=[sample_incident],
            constructs=[sample_construct],
            lens=sample_lens,
            predictions=predictions,
            primary_sources=["Isaacson biography"],
            secondary_sources=["Schlender - Becoming Steve Jobs"],
            born="1955-02-24",
            died="2011-10-05",
        )

        assert isinstance(result, dict)

        # All required top-level sections must be present
        required_sections = [
            "meta",
            "perceptual_lens",
            "bipolar_constructs",
            "critical_incident_database",
            "behavioral_divergence_predictions",
            "core_problem",
            "stated_principles",
            "value_hierarchy",
            "blind_spots",
            "constraint_response",
            "contextual_adaptation",
        ]
        for section in required_sections:
            assert section in result, f"Missing section: {section}"

        # Meta section checks
        assert result["meta"]["person"] == "Steve Jobs"
        assert result["meta"]["domain"] == "product design and technology leadership"
        assert result["meta"]["born"] == "1955-02-24"
        assert result["meta"]["died"] == "2011-10-05"
        assert "primary_sources" in result["meta"]
        assert "secondary_sources" in result["meta"]

        # Data sections should contain the inputs
        assert len(result["bipolar_constructs"]) == 1
        assert len(result["critical_incident_database"]) == 1
        assert len(result["behavioral_divergence_predictions"]) == 1
        assert result["perceptual_lens"] == sample_lens

    def test_assembles_without_optional_fields(self, sample_incident, sample_construct, sample_lens):
        """assemble_framework should work without optional born/died/sources."""
        from framework_forge.encoding.framework import assemble_framework

        result = assemble_framework(
            person="Steve Jobs",
            domain="product design",
            incidents=[sample_incident],
            constructs=[sample_construct],
            lens=sample_lens,
            predictions=[],
        )

        assert result["meta"]["person"] == "Steve Jobs"
        assert result["meta"]["born"] == ""
        assert result["meta"]["died"] == ""
        assert result["meta"]["primary_sources"] == []
        assert result["meta"]["secondary_sources"] == []


class TestSaveFramework:
    """Tests for save_framework function."""

    def test_save_creates_json(self, tmp_framework_dir, sample_incident, sample_construct, sample_lens):
        """save_framework should write framework.json to the output directory."""
        from framework_forge.encoding.framework import assemble_framework, save_framework

        framework = assemble_framework(
            person="Steve Jobs",
            domain="product design",
            incidents=[sample_incident],
            constructs=[sample_construct],
            lens=sample_lens,
            predictions=[],
        )

        result_path = save_framework(framework, tmp_framework_dir)

        assert result_path.exists()
        assert result_path.name == "framework.json"
        assert result_path.parent == tmp_framework_dir

        loaded = json.loads(result_path.read_text(encoding="utf-8"))
        assert loaded["meta"]["person"] == "Steve Jobs"
        assert "bipolar_constructs" in loaded
