"""Regression tests for the placeholder citation validator."""

from __future__ import annotations

import json
from pathlib import Path


def _write_framework(root: Path, payload: dict, *, include_manifest: bool = True) -> None:
    root.mkdir(parents=True, exist_ok=True)
    if include_manifest:
        (root / "framework.json").write_text(json.dumps(payload), encoding="utf-8")


def test_validate_framework_artifact_trees_reports_multi_root_failure(tmp_path):
    """Multi-root validation should preserve failures from the offending root."""
    from framework_forge.validation.placeholder_citations import (
        validate_framework_artifact_trees,
    )

    clean_root = tmp_path / "framework-a"
    dirty_root = tmp_path / "framework-b"

    _write_framework(
        clean_root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )
    _write_framework(
        dirty_root,
        {
            "meta": {"primary_sources": ["mock_placeholder"]},
            "critical_incident_database": [
                {"source": "Walter Isaacson, Steve Jobs", "decision": "Remove the keyboard"}
            ],
        },
    )
    (dirty_root / "sources").mkdir()
    (dirty_root / "sources" / "bibliography.json").write_text(
        json.dumps({"entries": [{"source": "mock_placeholder"}]}),
        encoding="utf-8",
    )

    result = validate_framework_artifact_trees([clean_root, dirty_root])

    assert result.passed is False
    assert result.roots == [str(clean_root.resolve()), str(dirty_root.resolve())]
    assert result.missing_manifests == []
    assert any(violation.root == str(dirty_root.resolve()) for violation in result.violations)
    assert any(
        violation.artifact_path == "sources/bibliography.json" for violation in result.violations
    )


def test_validate_framework_artifact_trees_records_missing_manifest(tmp_path):
    """A root without framework.json should fail in a stable, reportable way."""
    from framework_forge.validation.placeholder_citations import (
        validate_framework_artifact_trees,
    )

    root = tmp_path / "framework-missing-manifest"
    root.mkdir()
    (root / "notes.txt").write_text("unrelated file", encoding="utf-8")

    result = validate_framework_artifact_trees([root])

    assert result.passed is False
    assert result.scanned_files == []
    assert result.missing_manifests == [str(root.resolve())]
    assert result.violations == []
    assert result.to_dict()["missing_manifests"] == [str(root.resolve())]


def test_validate_framework_artifact_trees_records_missing_root(tmp_path):
    """A non-existent root should be reported as a missing manifest root."""
    from framework_forge.validation.placeholder_citations import (
        validate_framework_artifact_trees,
    )

    root = tmp_path / "framework-does-not-exist"

    result = validate_framework_artifact_trees([root])

    assert result.passed is False
    assert result.scanned_files == []
    assert result.missing_manifests == [str(root.resolve())]
    assert result.violations == []


def test_validate_framework_payload_serializes_violations(tmp_path):
    """In-memory payload validation should serialize violations deterministically."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    payload = {
        "meta": {
            "primary_sources": ["mock_placeholder"],
        },
        "critical_incident_database": [
            {"source": "Walter Isaacson, Steve Jobs", "decision": "Remove the keyboard"}
        ],
    }

    result = validate_framework_payload(payload, artifact_path="framework.json", root="root-a")

    assert result.passed is False
    assert result.roots == ["root-a"]
    assert result.scanned_files == ["framework.json"]
    assert result.violations[0].to_dict() == {
        "root": "root-a",
        "artifact_path": "framework.json",
        "json_path": "$.meta.primary_sources[0]",
        "value": "mock_placeholder",
    }
    assert result.to_dict() == {
        "missing_manifests": [],
        "passed": False,
        "roots": ["root-a"],
        "scanned_files": ["framework.json"],
        "violations": [
            {
                "root": "root-a",
                "artifact_path": "framework.json",
                "json_path": "$.meta.primary_sources[0]",
                "value": "mock_placeholder",
            }
        ],
    }


def test_validate_framework_artifact_tree_wrapper(tmp_path):
    """The single-root wrapper should delegate to the multi-root validator."""
    from framework_forge.validation.placeholder_citations import (
        validate_framework_artifact_tree,
    )

    root = tmp_path / "framework-clean"
    _write_framework(
        root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )

    result = validate_framework_artifact_tree(root)

    assert result.passed is True
    assert result.roots == [str(root.resolve())]
    assert result.missing_manifests == []


def test_main_json_report_is_stable_for_multi_root_runs(tmp_path, capsys):
    """The --json report should remain machine-readable and deterministic."""
    from framework_forge.validation.placeholder_citations import main

    clean_root = tmp_path / "framework-clean"
    missing_root = tmp_path / "framework-missing"

    _write_framework(
        clean_root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )
    missing_root.mkdir()

    exit_code = main([str(clean_root), str(missing_root), "--json"])
    captured = capsys.readouterr()
    report = json.loads(captured.out)

    assert exit_code == 1
    assert report == {
        "missing_manifests": [str(missing_root.resolve())],
        "passed": False,
        "roots": [str(clean_root.resolve()), str(missing_root.resolve())],
        "scanned_files": [f"{clean_root.resolve()}:framework.json"],
        "violations": [],
    }


def test_main_json_report_marks_clean_tree_as_passed(tmp_path, capsys):
    """A clean tree should emit a passed JSON report and exit zero."""
    from framework_forge.validation.placeholder_citations import main

    clean_root = tmp_path / "framework-clean"
    _write_framework(
        clean_root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )

    exit_code = main([str(clean_root), "--json"])
    captured = capsys.readouterr()
    report = json.loads(captured.out)

    assert exit_code == 0
    assert report == {
        "missing_manifests": [],
        "passed": True,
        "roots": [str(clean_root.resolve())],
        "scanned_files": [f"{clean_root.resolve()}:framework.json"],
        "violations": [],
    }


def test_main_text_mode_reports_clean_tree(tmp_path, capsys):
    """Text mode should report success for a clean tree."""
    from framework_forge.validation.placeholder_citations import main

    clean_root = tmp_path / "framework-clean"
    _write_framework(
        clean_root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )

    exit_code = main([str(clean_root)])
    captured = capsys.readouterr()

    assert exit_code == 0
    assert "No mock_placeholder citations found." in captured.out


def test_main_text_mode_reports_failures(tmp_path, capsys):
    """Text mode should mention missing manifests and placeholder citations."""
    from framework_forge.validation.placeholder_citations import main

    dirty_root = tmp_path / "framework-dirty"
    dirty_root.mkdir()
    (dirty_root / "framework.json").write_text(
        json.dumps({"meta": {"primary_sources": ["mock_placeholder"]}}),
        encoding="utf-8",
    )
    missing_root = tmp_path / "framework-missing"

    exit_code = main([str(dirty_root), str(missing_root)])
    captured = capsys.readouterr()

    assert exit_code == 1
    assert "Missing framework.json manifest for:" in captured.out
    assert str(missing_root.resolve()) in captured.out
    assert "mock_placeholder" in captured.out
