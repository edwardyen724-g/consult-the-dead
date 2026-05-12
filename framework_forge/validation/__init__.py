"""Three-tier validation for thinking frameworks.

Public API
----------
Result objects (stable, serializable, release-gate ready):
    - ScenarioResult         — single Tier 1 scenario comparison
    - Tier1Result            — aggregate Tier 1 baseline differentiation
    - Tier2Result            — Tier 2 internal consistency audit
    - Tier3Result            — Tier 3 human-review packet metadata
    - FloorCheckResult       — historical decision alignment

Runner functions:
    - run_tier1              — execute Tier 1 validation
    - run_tier2              — execute Tier 2 validation
    - prepare_tier3_materials — write Tier 3 review packet and return Tier3Result
    - run_floor_check        — execute floor check

Each result object exposes:
    - ``passed``          — bool gate for release decisions
    - ``failure_reasons`` — list[str] human-readable failure explanations
    - ``to_dict()``       — serialize to a JSON-compatible dict
    - ``from_dict()``     — deserialize from a to_dict() snapshot (classmethod)
"""

from framework_forge.validation.tier1 import (
    ScenarioResult,
    Tier1Result,
    run_tier1,
)
from framework_forge.validation.tier2 import (
    Tier2Result,
    run_tier2,
)
from framework_forge.validation.tier3_prep import (
    Tier3Result,
    prepare_tier3_materials,
)
from framework_forge.validation.floor_check import (
    FloorCheckResult,
    run_floor_check,
)

__all__ = [
    # Result objects
    "ScenarioResult",
    "Tier1Result",
    "Tier2Result",
    "Tier3Result",
    "FloorCheckResult",
    # Runner functions
    "run_tier1",
    "run_tier2",
    "prepare_tier3_materials",
    "run_floor_check",
]
