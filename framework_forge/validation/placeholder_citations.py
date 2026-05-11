"""Validation helpers for placeholder citations in framework artifacts.

The standalone validator scans one or more framework roots, flags any
``mock_placeholder`` strings that survive into JSON artifacts, and can emit a
machine-readable JSON report for CI gates.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PLACEHOLDER_TOKEN = "mock_placeholder"
MANIFEST_NAME = "framework.json"


@dataclass(frozen=True)
class PlaceholderCitationViolation:
    """A single placeholder citation found in a framework artifact."""

    root: str
    artifact_path: str
    json_path: str
    value: str

    def to_dict(self) -> dict[str, str]:
        return {
            "root": self.root,
            "artifact_path": self.artifact_path,
            "json_path": self.json_path,
            "value": self.value,
        }


@dataclass
class PlaceholderCitationValidationResult:
    """Aggregate result for placeholder citation validation."""

    roots: list[str]
    scanned_files: list[str]
    missing_manifests: list[str]
    violations: list[PlaceholderCitationViolation]

    @property
    def passed(self) -> bool:
        return not self.missing_manifests and not self.violations

    def to_dict(self) -> dict[str, Any]:
        return {
            "roots": self.roots,
            "scanned_files": self.scanned_files,
            "missing_manifests": self.missing_manifests,
            "violations": [violation.to_dict() for violation in self.violations],
            "passed": self.passed,
        }


def _scan_payload(
    payload: Any,
    *,
    root: str,
    artifact_path: str,
    json_path: str = "",
) -> list[PlaceholderCitationViolation]:
    """Recursively scan a JSON payload for placeholder citation strings."""
    violations: list[PlaceholderCitationViolation] = []

    if isinstance(payload, str):
        if PLACEHOLDER_TOKEN in payload:
            violations.append(
                PlaceholderCitationViolation(
                    root=root,
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
                _scan_payload(
                    item,
                    root=root,
                    artifact_path=artifact_path,
                    json_path=child_path,
                )
            )
        return violations

    if isinstance(payload, dict):
        for key, value in payload.items():
            child_path = f"{json_path}.{key}" if json_path else f"$.{key}"
            violations.extend(
                _scan_payload(
                    value,
                    root=root,
                    artifact_path=artifact_path,
                    json_path=child_path,
                )
            )

    return violations


def validate_framework_payload(
    payload: Any,
    *,
    artifact_path: str = "<memory>",
    root: str = "<memory>",
) -> PlaceholderCitationValidationResult:
    """Validate a framework payload already loaded into memory."""
    violations = _scan_payload(payload, root=root, artifact_path=artifact_path)
    return PlaceholderCitationValidationResult(
        roots=[root],
        scanned_files=[artifact_path],
        missing_manifests=[],
        violations=violations,
    )


def validate_framework_artifact_tree(root: Path) -> PlaceholderCitationValidationResult:
    """Validate every JSON artifact under a single framework output tree."""
    return validate_framework_artifact_trees([root])


def validate_framework_artifact_trees(
    roots: list[Path],
) -> PlaceholderCitationValidationResult:
    """Validate multiple framework roots in one aggregate run."""
    normalized_roots = [str(path.resolve()) for path in roots]
    scanned_files: list[str] = []
    missing_manifests: list[str] = []
    violations: list[PlaceholderCitationViolation] = []

    for root in roots:
        resolved_root = root.resolve()
        if not resolved_root.exists():
            missing_manifests.append(str(resolved_root))
            continue

        manifest_path = resolved_root / MANIFEST_NAME
        if not manifest_path.exists():
            missing_manifests.append(str(resolved_root))

        json_files = sorted(path for path in resolved_root.rglob("*.json") if path.is_file())
        for path in json_files:
            relative_path = str(path.relative_to(resolved_root))
            scanned_files.append(f"{resolved_root}:{relative_path}")
            payload = json.loads(path.read_text(encoding="utf-8"))
            violations.extend(
                _scan_payload(
                    payload,
                    root=str(resolved_root),
                    artifact_path=relative_path,
                    json_path="$",
                )
            )

    return PlaceholderCitationValidationResult(
        roots=normalized_roots,
        scanned_files=scanned_files,
        missing_manifests=missing_manifests,
        violations=violations,
    )


def main(argv: list[str] | None = None) -> int:
    """CLI entrypoint for CI and local artifact validation."""
    parser = argparse.ArgumentParser(
        description="Fail if framework artifacts contain mock_placeholder citations."
    )
    parser.add_argument(
        "roots",
        nargs="*",
        default=["frameworks"],
        help="One or more framework artifact roots to scan.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit a JSON validation report instead of text output.",
    )
    args = parser.parse_args(argv)

    result = validate_framework_artifact_trees([Path(root) for root in args.roots])

    if args.json:
        print(json.dumps(result.to_dict(), indent=2, sort_keys=True))
    elif result.passed:
        print(
            f"Checked {len(result.scanned_files)} JSON file(s) across "
            f"{len(result.roots)} root(s). No {PLACEHOLDER_TOKEN} citations found."
        )
    else:
        print(
            f"Found {len(result.violations)} placeholder citation(s) in "
            f"{len(result.scanned_files)} JSON file(s) across {len(result.roots)} root(s)."
        )
        if result.missing_manifests:
            print("Missing framework.json manifest for:")
            for path in result.missing_manifests:
                print(f"- {path}")
        for violation in result.violations:
            print(
                f"- {violation.root}:{violation.artifact_path}:{violation.json_path} "
                f"-> {violation.value}"
            )

    return 0 if result.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
