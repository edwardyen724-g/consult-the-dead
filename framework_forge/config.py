"""Configuration and constants for Framework Forge."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
FRAMEWORKS_DIR = PROJECT_ROOT / "frameworks"

# API
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MODEL_LONG = "claude-sonnet-4-20250514"  # For large context operations

# Extraction targets
MIN_INCIDENTS = 20
TARGET_INCIDENTS = 25
MAX_INCIDENTS = 30
TARGET_CONSTRUCTS = 10
MIN_CONSTRUCTS = 8
MAX_CONSTRUCTS = 12

# Validation thresholds
TIER1_MIN_DIVERGENT_SCENARIOS = 4  # out of 5
TIER1_MIN_SCENARIOS = 5
TIER2_MIN_TRACEABILITY = 0.80  # 80% of reasoning steps traceable
FLOOR_CHECK_MIN_ALIGNMENT = 0.50  # 50% historical alignment

# Source evidence types (ranked by what they reveal)
SOURCE_TYPES = [
    "critical_incident",       # Decisions under pressure — Layer 2+3
    "value_conflict",          # Visible tradeoffs — Layer 2
    "failure",                 # Framework limits — Layer 3
    "private_writing",         # Genuine vs performed — Layer 2
    "own_published_work",      # Stated principles — Layer 1
    "firsthand_biography",     # Behavioral observation — Layer 2
    "scholarly_analysis",      # Expert frameworks — Layer 2+3
    "secondary_reporting",     # Orientation only — Layer 1
    "web_summary",             # Source discovery only — Layer 1
]
