"""Tests for shared canonical ordering helpers in extraction outputs."""

import pytest

from framework_forge.extraction.constructs import BipolarConstruct
from framework_forge.extraction.divergence import DivergencePrediction
from framework_forge.extraction.lens import PerceptualLens
from framework_forge.extraction.ordering import (
    canonicalize_constructs,
    canonicalize_incident_ids,
    canonicalize_lens_payload,
    canonicalize_predictions,
)


def test_canonicalize_incident_ids_uses_reference_order_and_dedupes():
    order_map = {
        "incident-001": 0,
        "incident-002": 1,
        "incident-003": 2,
    }

    result = canonicalize_incident_ids(
        [
            "incident-003",
            "incident-001",
            "incident-003",
            "incident-999",
            "incident-002",
            "incident-999",
        ],
        incident_order=order_map,
    )

    assert result == [
        "incident-001",
        "incident-002",
        "incident-003",
        "incident-999",
    ]


def test_canonicalize_incident_ids_falls_back_to_lexicographic_order():
    result = canonicalize_incident_ids(
        [
            "incident-10",
            "incident-2",
            "incident-10",
            "incident-01",
        ]
    )

    assert result == [
        "incident-01",
        "incident-10",
        "incident-2",
    ]


def test_canonicalize_constructs_orders_constructs_and_traceability_ids(sample_construct):
    order_map = {
        "incident-001": 0,
        "incident-002": 1,
        "incident-003": 2,
    }

    alpha_construct = BipolarConstruct(
        construct="adjusts to the person vs. forces the person to adjust",
        positive_pole="The product adapts to the human",
        negative_pole="The human adapts to the product",
        derived_from_incidents=[
            "incident-002",
            "incident-001",
            "incident-001",
        ],
        behavioral_implication="Prefer interfaces that disappear into use.",
    )
    zeta_construct = dict(sample_construct)
    zeta_construct["construct"] = "zest vs. restraint"
    zeta_construct["derived_from_incidents"] = [
        "incident-003",
        "incident-001",
        "incident-003",
        "incident-999",
    ]

    result = canonicalize_constructs(
        [zeta_construct, alpha_construct],
        incident_order=order_map,
    )

    assert [item["construct"] for item in result] == [
        "adjusts to the person vs. forces the person to adjust",
        "zest vs. restraint",
    ]
    assert result[0]["derived_from_incidents"] == [
        "incident-001",
        "incident-002",
    ]
    assert result[1]["derived_from_incidents"] == [
        "incident-001",
        "incident-003",
        "incident-999",
    ]


def test_canonicalize_constructs_accepts_plain_attribute_objects():
    class BareConstruct:
        def __init__(self):
            self.construct = "balances speed vs. thoroughness"
            self.positive_pole = "Move quickly"
            self.negative_pole = "Move slowly"
            self.derived_from_incidents = ["incident-002", "incident-001"]
            self.behavioral_implication = "Prefer fast iteration."

    result = canonicalize_constructs([BareConstruct()])

    assert result == [
        {
            "construct": "balances speed vs. thoroughness",
            "positive_pole": "Move quickly",
            "negative_pole": "Move slowly",
            "derived_from_incidents": [
                "incident-001",
                "incident-002",
            ],
            "behavioral_implication": "Prefer fast iteration.",
        }
    ]


def test_canonicalize_lens_payload_orders_derived_and_holdout_ids():
    order_map = {
        "incident-test-001": 0,
        "incident-test-002": 1,
        "incident-test-003": 2,
        "incident-test-004": 3,
        "incident-test-005": 4,
    }

    lens = PerceptualLens(
        statement="Jobs perceives products as experiences waiting to exist.",
        derived_from=[
            "incident-test-003",
            "incident-test-001",
            "incident-test-003",
            "incident-test-002",
        ],
        holdout_validation=[
            "incident-test-005",
            "incident-test-004",
            "incident-test-004",
        ],
        what_they_notice_first="The user experience in motion",
        what_they_ignore="Feature parity and compatibility checklists",
        evidence="Keyboard removal, scroll wheel removal, and port reduction.",
    )

    result = canonicalize_lens_payload(lens, incident_order=order_map)

    assert result["derived_from"] == [
        "incident-test-001",
        "incident-test-002",
        "incident-test-003",
    ]
    assert result["holdout_validation"] == [
        "incident-test-004",
        "incident-test-005",
    ]
    assert result["statement"] == lens.statement


def test_canonicalize_predictions_orders_by_stable_fields():
    alpha_prediction = {
        "situation_type": "Alpha launch decision",
        "ordinary_response": "Wait for full parity",
        "framework_response": "Ship the experience first",
        "because": "The lens privileges experience over completeness.",
        "confidence": 0.8,
    }
    beta_prediction = DivergencePrediction(
        situation_type="Beta launch decision",
        ordinary_response="Wait for full parity",
        framework_response="Ship the experience first",
        because="The lens privileges experience over completeness.",
        confidence=0.9,
    )
    gamma_prediction = {
        "situation_type": "Beta launch decision",
        "ordinary_response": "Wait for full parity",
        "framework_response": "Ship the experience first",
        "because": "The lens privileges experience over completeness.",
        "confidence": 0.7,
    }

    result = canonicalize_predictions([beta_prediction, gamma_prediction, alpha_prediction])

    assert [item["situation_type"] for item in result] == [
        "Alpha launch decision",
        "Beta launch decision",
        "Beta launch decision",
    ]
    assert [item["confidence"] for item in result] == [0.8, 0.7, 0.9]


def test_canonicalize_predictions_uses_zero_for_non_numeric_confidence():
    result = canonicalize_predictions(
        [
            {
                "situation_type": "Gamma launch decision",
                "ordinary_response": "Wait for full parity",
                "framework_response": "Ship the experience first",
                "because": "The lens privileges experience over completeness.",
                "confidence": "unknown",
            }
        ]
    )

    assert result[0]["confidence"] == "unknown"


def test_canonicalize_predictions_rejects_unsupported_items():
    with pytest.raises(TypeError, match="Unsupported extraction artifact item type"):
        canonicalize_predictions([object()])
