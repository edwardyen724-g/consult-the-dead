"""Validation helpers for placeholder citations in framework artifacts."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


PLACEHOLDER_TOKEN = "mock_placeholder"


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
    """Aggregate result for placeholder citation validation across one or more roots."""

    roots: list[str]
    scanned_files: list[str]
    violations: list[PlaceholderCitationViolation]
    missing_manifests: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return len(self.violations) == 0 and len(self.missing_manifests) == 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "roots": self.roots,
            "scanned_files": self.scanned_files,
            "violations": [v.to_dict() for v in self.violations],
            "missing_manifests": self.missing_manifests,
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
        violations=violations,
        missing_manifests=[],
    )


def validate_framework_artifact_trees(
    roots: list[Path],
) -> PlaceholderCitationValidationResult:
    """Validate every JSON artifact under one or more framework output trees.

    A root that does not contain a ``framework.json`` manifest (or does not
    exist at all) is recorded in ``missing_manifests`` rather than raising.
    """
    resolved_roots: list[str] = []
    scanned_files: list[str] = []
    violations: list[PlaceholderCitationViolation] = []
    missing_manifests: list[str] = []

    for root in roots:
        root = root.resolve()
        resolved_roots.append(str(root))

        if not root.is_dir() or not (root / "framework.json").exists():
            missing_manifests.append(str(root))
            continue

        json_files = sorted(path for path in root.rglob("*.json") if path.is_file())
        for path in json_files:
            payload = json.loads(path.read_text(encoding="utf-8"))
            relative_path = str(path.relative_to(root))
            scanned_files.append(f"{root}:{relative_path}")
            violations.extend(
                _scan_payload(
                    payload,
                    root=str(root),
                    artifact_path=relative_path,
                    json_path="$",
                )
            )

    return PlaceholderCitationValidationResult(
        roots=resolved_roots,
        scanned_files=scanned_files,
        violations=violations,
        missing_manifests=missing_manifests,
    )


def validate_framework_artifact_tree(root: Path) -> PlaceholderCitationValidationResult:
    """Validate every JSON artifact under a single framework output tree.

    Thin wrapper around :func:`validate_framework_artifact_trees` for
    single-root callers.
    """
    return validate_framework_artifact_trees([root])


def main(argv: list[str] | None = None) -> int:
    """CLI entrypoint for CI and local artifact validation."""
    parser = argparse.ArgumentParser(
        description="Fail if framework artifacts contain mock_placeholder citations."
    )
    parser.add_argument(
        "roots",
        nargs="*",
        default=["frameworks"],
        help="Framework artifact root(s) to scan.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Emit a machine-readable JSON report instead of human-readable text.",
    )
    args = parser.parse_args(argv)

    result = validate_framework_artifact_trees([Path(r) for r in args.roots])

    if args.json_output:
        print(json.dumps(result.to_dict()))
        return 0 if result.passed else 1

    if result.passed:
        print(
            f"Checked {len(result.scanned_files)} JSON file(s) across "
            f"{len(result.roots)} root(s). "
            f"No {PLACEHOLDER_TOKEN} citations found."
        )
        return 0

    if result.missing_manifests:
        print("Missing framework.json manifest for:")
        for m in result.missing_manifests:
            print(f"  {m}")

    if result.violations:
        print(
            f"Found {len(result.violations)} placeholder citation(s) in "
            f"{len(result.scanned_files)} JSON file(s):"
        )
        for violation in result.violations:
            print(
                f"- {violation.artifact_path}:{violation.json_path} -> {violation.value}"
            )

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
