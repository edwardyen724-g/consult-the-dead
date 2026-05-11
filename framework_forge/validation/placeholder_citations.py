"""Validation helpers for placeholder citations in framework artifacts."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PLACEHOLDER_TOKEN = "mock_placeholder"


@dataclass(frozen=True)
class PlaceholderCitationViolation:
    """A single placeholder citation found in a framework artifact."""

    artifact_path: str
    json_path: str
    value: str

    def to_dict(self) -> dict[str, str]:
        return {
            "artifact_path": self.artifact_path,
            "json_path": self.json_path,
            "value": self.value,
        }


@dataclass
class PlaceholderCitationValidationResult:
    """Aggregate result for placeholder citation validation."""

    root: Path
    scanned_files: list[str]
    violations: list[PlaceholderCitationViolation]

    @property
    def passed(self) -> bool:
        return len(self.violations) == 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "root": str(self.root),
            "scanned_files": self.scanned_files,
            "violations": [violation.to_dict() for violation in self.violations],
            "passed": self.passed,
        }


def _scan_payload(
    payload: Any,
    *,
    artifact_path: str,
    json_path: str = "",
) -> list[PlaceholderCitationViolation]:
    """Recursively scan a JSON payload for placeholder citation strings."""
    violations: list[PlaceholderCitationViolation] = []

    if isinstance(payload, str):
        if PLACEHOLDER_TOKEN in payload:
            violations.append(
                PlaceholderCitationViolation(
                    artifact_path=artifact_path,
                    json_path=json_path or "$",
                    value=payload,
                )
            )
        return violations

    if isinstance(payload, list):
        for index, item in enumerate(payload):
            child_path = f"{json_path}[{index}]" if json_path else f"$[{index}]"
            violations.extend(
                _scan_payload(item, artifact_path=artifact_path, json_path=child_path)
            )
        return violations

    if isinstance(payload, dict):
        for key, value in payload.items():
            child_path = f"{json_path}.{key}" if json_path else f"$.{key}"
            violations.extend(
                _scan_payload(value, artifact_path=artifact_path, json_path=child_path)
            )

    return violations


def validate_framework_payload(
    payload: Any,
    *,
    artifact_path: str = "<memory>",
) -> PlaceholderCitationValidationResult:
    """Validate a framework payload already loaded into memory."""
    violations = _scan_payload(payload, artifact_path=artifact_path)
    return PlaceholderCitationValidationResult(
        root=Path(artifact_path),
        scanned_files=[artifact_path],
        violations=violations,
    )


def validate_framework_artifact_tree(root: Path) -> PlaceholderCitationValidationResult:
    """Validate every JSON artifact under a framework output tree."""
    root = root.resolve()
    json_files = sorted(path for path in root.rglob("*.json") if path.is_file())
    violations: list[PlaceholderCitationViolation] = []

    for path in json_files:
        payload = json.loads(path.read_text(encoding="utf-8"))
        relative_path = str(path.relative_to(root))
        violations.extend(
            _scan_payload(payload, artifact_path=relative_path, json_path="$")
        )

    return PlaceholderCitationValidationResult(
        root=root,
        scanned_files=[str(path.relative_to(root)) for path in json_files],
        violations=violations,
    )


def main(argv: list[str] | None = None) -> int:
    """CLI entrypoint for CI and local artifact validation."""
    parser = argparse.ArgumentParser(
        description="Fail if framework artifacts contain mock_placeholder citations."
    )
    parser.add_argument(
        "root",
        nargs="?",
        default="frameworks",
        help="Framework artifact root to scan.",
    )
    args = parser.parse_args(argv)

    root = Path(args.root)
    result = validate_framework_artifact_tree(root)

    if result.passed:
        print(
            f"Checked {len(result.scanned_files)} JSON file(s) under {root}. "
            f"No {PLACEHOLDER_TOKEN} citations found."
        )
        return 0

    print(
        f"Found {len(result.violations)} placeholder citation(s) in "
        f"{len(result.scanned_files)} JSON file(s) under {root}:"
    )
    for violation in result.violations:
        print(f"- {violation.artifact_path}:{violation.json_path} -> {violation.value}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
