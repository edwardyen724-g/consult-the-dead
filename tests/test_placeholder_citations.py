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


# ---------------------------------------------------------------------------
# 1. Deeply nested JSON scanning
# ---------------------------------------------------------------------------


def test_scan_finds_placeholder_at_arbitrary_nesting_depth():
    """Placeholder buried at obj > obj > list > obj depth should be reported."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    payload = {
        "level1": {
            "items": [
                {"nested": {"field": "clean value"}},
                {"nested": {"field": "another clean value"}},
                {"nested": {"field": "mock_placeholder"}},
            ]
        }
    }

    result = validate_framework_payload(payload, artifact_path="framework.json", root="root-a")

    assert result.passed is False
    assert len(result.violations) == 1
    assert result.violations[0].json_path == "$.level1.items[2].nested.field"
    assert result.violations[0].value == "mock_placeholder"


def test_scan_skips_non_string_leaf_types():
    """None, integers, and booleans at any nesting depth should not be reported."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    payload = {
        "null_field": None,
        "int_field": 42,
        "bool_field": True,
        "nested": {
            "also_null": None,
            "also_int": 0,
            "also_bool": False,
            "list_of_scalars": [None, 1, False, 3.14],
        },
    }

    result = validate_framework_payload(payload, artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


def test_scan_placeholder_only_in_deep_key_is_found():
    """A dict that has a clean top-level but a deep placeholder value is caught."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    payload = {
        "clean": "value",
        "section": {
            "subsection": {
                "entries": [
                    {"title": "Real Title", "source": "Real Author"},
                    {"title": "Placeholder Title", "source": "mock_placeholder"},
                ]
            }
        },
    }

    result = validate_framework_payload(payload, artifact_path="deep.json", root="root-b")

    assert result.passed is False
    assert any(
        v.json_path == "$.section.subsection.entries[1].source" for v in result.violations
    )


# ---------------------------------------------------------------------------
# 2. Missing-manifest handling edge cases
# ---------------------------------------------------------------------------


def test_missing_manifest_still_scans_json_files(tmp_path):
    """Root with JSON files but no framework.json: missing_manifests set AND files scanned."""
    from framework_forge.validation.placeholder_citations import validate_framework_artifact_trees

    root = tmp_path / "framework-no-manifest"
    root.mkdir()
    (root / "data.json").write_text(
        json.dumps({"source": "mock_placeholder"}), encoding="utf-8"
    )
    # No framework.json — deliberate omission.

    result = validate_framework_artifact_trees([root])

    assert str(root.resolve()) in result.missing_manifests
    # Validator continues past missing manifest and scans data.json.
    assert any("data.json" in f for f in result.scanned_files)
    assert any(v.artifact_path == "data.json" for v in result.violations)
    assert result.passed is False


def test_missing_manifest_clean_json_files_still_scanned(tmp_path):
    """Root without framework.json but clean JSON: missing_manifests set, no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_artifact_trees

    root = tmp_path / "framework-no-manifest-clean"
    root.mkdir()
    (root / "data.json").write_text(
        json.dumps({"source": "Walter Isaacson, Steve Jobs"}), encoding="utf-8"
    )

    result = validate_framework_artifact_trees([root])

    assert str(root.resolve()) in result.missing_manifests
    assert any("data.json" in f for f in result.scanned_files)
    assert result.violations == []
    # Still fails because of missing manifest.
    assert result.passed is False


def test_mixed_roots_some_with_manifest_some_without(tmp_path):
    """Roots with and without manifests are handled independently in one run."""
    from framework_forge.validation.placeholder_citations import validate_framework_artifact_trees

    root_with = tmp_path / "has-manifest"
    root_without = tmp_path / "no-manifest"

    _write_framework(
        root_with,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )

    root_without.mkdir()
    (root_without / "extra.json").write_text(
        json.dumps({"info": "mock_placeholder"}), encoding="utf-8"
    )

    result = validate_framework_artifact_trees([root_with, root_without])

    assert str(root_without.resolve()) in result.missing_manifests
    assert str(root_with.resolve()) not in result.missing_manifests
    assert any(v.root == str(root_without.resolve()) for v in result.violations)
    assert result.passed is False


# ---------------------------------------------------------------------------
# 3. CLI exit behavior
# ---------------------------------------------------------------------------


def test_main_clean_dir_exits_zero(tmp_path):
    """main() with a clean framework root returns integer 0."""
    from framework_forge.validation.placeholder_citations import main

    root = tmp_path / "clean-root"
    _write_framework(
        root,
        {
            "meta": {"primary_sources": ["Walter Isaacson, Steve Jobs"]},
            "critical_incident_database": [],
        },
    )

    exit_code = main([str(root)])

    assert exit_code == 0
    assert isinstance(exit_code, int)


def test_main_dir_with_placeholder_exits_one(tmp_path):
    """main() with a placeholder-containing root returns integer 1."""
    from framework_forge.validation.placeholder_citations import main

    root = tmp_path / "dirty-root"
    _write_framework(
        root,
        {"meta": {"primary_sources": ["mock_placeholder"]}},
    )

    exit_code = main([str(root)])

    assert exit_code == 1
    assert isinstance(exit_code, int)


def test_main_nonexistent_dir_exits_one(tmp_path):
    """main() with a non-existent root (missing manifest) returns integer 1."""
    from framework_forge.validation.placeholder_citations import main

    root = tmp_path / "does-not-exist"

    exit_code = main([str(root)])

    assert exit_code == 1
    assert isinstance(exit_code, int)


def test_main_return_value_is_int_not_system_exit(tmp_path):
    """main() must return an int, not raise SystemExit."""
    import sys
    from framework_forge.validation.placeholder_citations import main

    root = tmp_path / "check-return-type"
    _write_framework(root, {"clean": "payload"})

    # Should never raise; the __main__ guard wraps it in SystemExit, not main() itself.
    try:
        result = main([str(root)])
    except SystemExit:
        assert False, "main() raised SystemExit — it should return int instead"

    assert isinstance(result, int)


# ---------------------------------------------------------------------------
# 4. Scan behavior with placeholder in various positions
# ---------------------------------------------------------------------------


def test_scan_placeholder_as_substring_of_longer_string():
    """Placeholder embedded in a longer string is still caught (substring match)."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    payload = {"description": "see mock_placeholder for details"}

    result = validate_framework_payload(payload, artifact_path="framework.json", root="root-a")

    assert result.passed is False
    assert len(result.violations) == 1
    assert result.violations[0].value == "see mock_placeholder for details"
    assert result.violations[0].json_path == "$.description"


def test_scan_empty_dict_produces_no_violations():
    """An empty dict payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload({}, artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


def test_scan_empty_list_produces_no_violations():
    """An empty list payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload([], artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


# ---------------------------------------------------------------------------
# 5. validate_framework_payload with non-string top-level types
# ---------------------------------------------------------------------------


def test_validate_framework_payload_with_none():
    """None payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload(None, artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


def test_validate_framework_payload_with_integer():
    """Integer payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload(42, artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


def test_validate_framework_payload_with_empty_list():
    """Empty list payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload([], artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []


def test_validate_framework_payload_with_empty_dict():
    """Empty dict payload should produce no violations."""
    from framework_forge.validation.placeholder_citations import validate_framework_payload

    result = validate_framework_payload({}, artifact_path="framework.json", root="root-a")

    assert result.passed is True
    assert result.violations == []
