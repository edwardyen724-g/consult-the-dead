"""Regression audit: no published framework JSON may contain stale placeholder labels.

Scans every *.json file under frameworks/ and fails if any string field contains
one of the known stale-data markers:

  - mock_placeholder  (exact token used during scaffolding)
  - [placeholder]     (bracketed variant)
  - [SOURCE]          (bracketed source marker)
  - TBD source        (case-insensitive)
  - TODO              (any case)

The test is parameterised over each JSON file so pytest reports the exact
file that contains the violation.

Run with:
    uv run pytest tests/test_framework_json_placeholder_audit.py -v
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FRAMEWORKS_DIR = Path(__file__).resolve().parent.parent / "frameworks"

# Patterns that indicate a field was never populated with real data.
# Each pattern is compiled case-insensitively.
STALE_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"mock_placeholder", re.IGNORECASE),
    re.compile(r"\[placeholder\]", re.IGNORECASE),
    re.compile(r"\[SOURCE\]", re.IGNORECASE),
    re.compile(r"TBD\s+source", re.IGNORECASE),
    re.compile(r"\bTODO\b", re.IGNORECASE),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _collect_string_values(obj: object, path: str = "$") -> list[tuple[str, str]]:
    """Recursively collect (json_path, value) pairs for every string in *obj*."""
    results: list[tuple[str, str]] = []
    if isinstance(obj, str):
        results.append((path, obj))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            results.extend(_collect_string_values(item, f"{path}[{i}]"))
    elif isinstance(obj, dict):
        for key, value in obj.items():
            results.extend(_collect_string_values(value, f"{path}.{key}"))
    return results


def _find_violations(data: object) -> list[tuple[str, str, re.Pattern[str]]]:
    """Return list of (json_path, value, pattern) for each stale marker found."""
    violations: list[tuple[str, str, re.Pattern[str]]] = []
    for json_path, value in _collect_string_values(data):
        for pattern in STALE_PATTERNS:
            if pattern.search(value):
                violations.append((json_path, value, pattern))
    return violations


def _gather_framework_jsons() -> list[Path]:
    """Glob all *.json files under the frameworks/ directory."""
    if not FRAMEWORKS_DIR.exists():
        return []
    return sorted(FRAMEWORKS_DIR.rglob("*.json"))


# ---------------------------------------------------------------------------
# Parametrised test
# ---------------------------------------------------------------------------


def _framework_json_ids(paths: list[Path]) -> list[str]:
    """Produce short human-readable IDs for parametrise output."""
    return [str(p.relative_to(FRAMEWORKS_DIR)) for p in paths]


_FRAMEWORK_JSONS = _gather_framework_jsons()


@pytest.mark.parametrize(
    "json_path",
    _FRAMEWORK_JSONS,
    ids=_framework_json_ids(_FRAMEWORK_JSONS),
)
def test_no_stale_placeholder_markers(json_path: Path) -> None:
    """Each framework JSON must not contain any stale placeholder markers.

    Fails with a detailed message listing the JSON path and offending value
    so the reporter knows exactly what to fix.
    """
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        pytest.fail(
            f"{json_path.relative_to(FRAMEWORKS_DIR)}: invalid JSON — {exc}"
        )

    violations = _find_violations(data)

    if violations:
        lines = [
            f"Stale placeholder markers found in: {json_path.relative_to(FRAMEWORKS_DIR)}"
        ]
        for field_path, value, pattern in violations:
            truncated = value if len(value) <= 120 else value[:117] + "..."
            lines.append(
                f"  field  : {field_path}\n"
                f"  pattern: {pattern.pattern}\n"
                f"  value  : {truncated!r}"
            )
        pytest.fail("\n".join(lines))


# ---------------------------------------------------------------------------
# Sanity check: the frameworks directory must exist and contain at least one
# JSON file.  This catches mis-configured test environments early.
# ---------------------------------------------------------------------------


def test_frameworks_directory_is_populated() -> None:
    """frameworks/ must exist and contain at least one JSON file."""
    assert FRAMEWORKS_DIR.exists(), (
        f"frameworks/ directory not found at expected path: {FRAMEWORKS_DIR}"
    )
    json_files = list(FRAMEWORKS_DIR.rglob("*.json"))
    assert len(json_files) > 0, (
        f"No JSON files found under {FRAMEWORKS_DIR} — "
        "the audit has no data to check."
    )
