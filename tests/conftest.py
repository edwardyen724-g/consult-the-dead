"""Shared test fixtures for Framework Forge tests."""

import pytest
from pathlib import Path


@pytest.fixture
def sample_incident():
    """A minimal critical incident for testing."""
    return {
        "id": "incident-test-001",
        "decision": "Decided to remove the physical keyboard from the iPhone",
        "context": "Apple was entering the smartphone market dominated by BlackBerry and Palm, both of which had physical keyboards users loved",
        "cdm_probes": {
            "cues_noticed": "Users interacted with their phones through a fixed physical interface that could not adapt to context",
            "active_goals": "Create a device where the interface disappears and the user interacts directly with content",
            "rejected_alternatives": "Physical keyboard with touchscreen hybrid — rejected because it preserved the barrier between user and content",
            "situation_framing": "This is not a phone design problem. This is a human-experience-with-pocket-computer problem. The keyboard is a cage.",
            "expected_outcome": "Users would initially resist but adapt quickly because direct manipulation is more natural than mediated input",
        },
        "counterfactual": "A competent competitor would have built a better BlackBerry — faster keyboard, better email, more enterprise features",
        "divergence_explanation": "Jobs perceived the existing product category as a cage, not a template. His perceptual lens reframed the problem from 'better phone' to 'what experience wants to exist?'",
        "outcome": "iPhone launched without keyboard, initially criticized, then redefined the entire smartphone category",
        "source": "Isaacson, Walter. Steve Jobs. Simon & Schuster, 2011. Chapter 36.",
    }


@pytest.fixture
def sample_construct():
    """A minimal bipolar construct for testing."""
    return {
        "construct": "invites the person in vs. requires the person to adapt",
        "positive_pole": "The product adapts to the human; the interface disappears",
        "negative_pole": "The human adapts to the product; the interface is a barrier",
        "derived_from_incidents": ["incident-test-001"],
        "behavioral_implication": "When evaluating any product or feature, categorize it along this dimension. Move toward the positive pole even at the cost of features or backward compatibility.",
    }


@pytest.fixture
def sample_lens():
    """A minimal perceptual lens for testing."""
    return {
        "statement": "Jobs perceives products as experiences-waiting-to-exist, not as collections of features to be optimized.",
        "derived_from": ["incident-test-001", "incident-test-002", "incident-test-003"],
        "holdout_validation": ["incident-test-004", "incident-test-005"],
        "what_they_notice_first": "The emotional relationship between the user and the experience — not the technical capability",
        "what_they_ignore": "Feature parity with competitors, backward compatibility, existing user habits",
        "evidence": "iPhone keyboard removal, iPod scroll wheel, iMac port reduction, App Store curation",
    }


@pytest.fixture
def tmp_framework_dir(tmp_path):
    """Create a temporary framework directory structure."""
    fw_dir = tmp_path / "steve-jobs"
    (fw_dir / "incidents").mkdir(parents=True)
    (fw_dir / "sources" / "texts").mkdir(parents=True)
    (fw_dir / "validation" / "tier3_materials").mkdir(parents=True)
    return fw_dir
