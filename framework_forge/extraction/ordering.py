"""Shared canonical ordering helpers for extraction outputs.

The extraction pipeline produces multiple artifact shapes that contain lists of
constructs, incident identifiers, and divergence predictions. These helpers
normalize those collections into deterministic orderings so downstream
validation and documentation can compare artifacts reliably across runs.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any


def _dedupe_preserve_order(values: Sequence[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def _coerce_mapping(item: Any) -> dict[str, Any]:
    if isinstance(item, Mapping):
        return dict(item)

    if hasattr(item, "to_dict"):
        payload = item.to_dict()
        if isinstance(payload, Mapping):
            return dict(payload)

    if hasattr(item, "__dict__"):
        return {key: value for key, value in vars(item).items() if not key.startswith("_")}

    raise TypeError(f"Unsupported extraction artifact item type: {type(item).__name__}")


def canonicalize_incident_ids(
    incident_ids: Sequence[Any],
    incident_order: Mapping[str, int] | None = None,
) -> list[str]:
    """Return a stable, de-duplicated ordering for incident identifiers.

    When an ``incident_order`` mapping is supplied, identifiers that appear in
    that mapping are sorted according to the provided order. Any unknown
    identifiers are placed after the known ones in lexicographic order.
    """

    ordered_ids = _dedupe_preserve_order([str(incident_id) for incident_id in incident_ids])
    if incident_order is None:
        return sorted(ordered_ids)

    return sorted(
        ordered_ids,
        key=lambda incident_id: (
            incident_order.get(incident_id, 10_000),
            incident_id,
        ),
    )


def canonicalize_constructs(
    constructs: Sequence[Any],
    incident_order: Mapping[str, int] | None = None,
) -> list[dict[str, Any]]:
    """Canonicalize construct payloads and their traceability lists."""

    ordered_constructs = sorted(
        (_coerce_mapping(construct) for construct in constructs),
        key=lambda payload: (
            str(payload.get("construct", "")),
            str(payload.get("positive_pole", "")),
            str(payload.get("negative_pole", "")),
            str(payload.get("behavioral_implication", "")),
        ),
    )

    canonicalized: list[dict[str, Any]] = []
    for payload in ordered_constructs:
        normalized = dict(payload)
        normalized["derived_from_incidents"] = canonicalize_incident_ids(
            normalized.get("derived_from_incidents", []),
            incident_order=incident_order,
        )
        canonicalized.append(normalized)
    return canonicalized


def canonicalize_lens_payload(
    lens: Any,
    incident_order: Mapping[str, int] | None = None,
) -> dict[str, Any]:
    """Canonicalize the derived-from and holdout lists in a lens payload."""

    payload = _coerce_mapping(lens)
    normalized = dict(payload)
    normalized["derived_from"] = canonicalize_incident_ids(
        normalized.get("derived_from", []),
        incident_order=incident_order,
    )
    normalized["holdout_validation"] = canonicalize_incident_ids(
        normalized.get("holdout_validation", []),
        incident_order=incident_order,
    )
    return normalized


def canonicalize_predictions(predictions: Sequence[Any]) -> list[dict[str, Any]]:
    """Canonicalize divergence predictions into a stable prompt-independent order."""

    def sort_key(payload: dict[str, Any]) -> tuple[str, str, str, str, float]:
        confidence = payload.get("confidence", 0.0)
        try:
            confidence_value = float(confidence)
        except (TypeError, ValueError):
            confidence_value = 0.0

        return (
            str(payload.get("situation_type", "")),
            str(payload.get("ordinary_response", "")),
            str(payload.get("framework_response", "")),
            str(payload.get("because", "")),
            confidence_value,
        )

    ordered_predictions = sorted(
        (_coerce_mapping(prediction) for prediction in predictions),
        key=sort_key,
    )
    return [dict(payload) for payload in ordered_predictions]


__all__ = [
    "canonicalize_constructs",
    "canonicalize_incident_ids",
    "canonicalize_lens_payload",
    "canonicalize_predictions",
]
