"""Configuration surface for the Instagram reel post scheduler."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class InstagramSchedulerConfig:
    """Scheduler knobs shared by the cron entrypoint and the runbook.

    The values intentionally stay small and conservative:

    - one cron expression for the external scheduler
    - a daily post cap so a single run cannot over-post
    - bounded 429 backoff settings so retries fail safely
    """

    cron_expression: str = "0 9 * * 2,4"
    max_posts_per_day: int = 1
    rate_limit_initial_backoff_seconds: float = 300.0
    rate_limit_backoff_multiplier: float = 2.0
    rate_limit_max_backoff_seconds: float = 1800.0
    rate_limit_max_attempts: int = 3
    output_dir: Path = Path("output/reels")
    state_path: Path = Path("output/reels/post-scheduler-state.json")
    reel_public_base_url: str = "https://www.consultthedead.com"
    reel_public_path_prefix: str = "/output/reels"

    @classmethod
    def from_env(cls) -> "InstagramSchedulerConfig":
        """Build config from environment variables with safe defaults."""

        output_dir = Path(os.environ.get("INSTAGRAM_REEL_OUTPUT_DIR", "output/reels"))
        state_path = Path(
            os.environ.get(
                "INSTAGRAM_REEL_POST_STATE_PATH",
                str(output_dir / "post-scheduler-state.json"),
            )
        )
        return cls(
            cron_expression=os.environ.get("INSTAGRAM_REEL_POST_CRON", "0 9 * * 2,4"),
            max_posts_per_day=int(
                os.environ.get("INSTAGRAM_REEL_MAX_POSTS_PER_DAY", "1")
            ),
            rate_limit_initial_backoff_seconds=float(
                os.environ.get("INSTAGRAM_REEL_429_INITIAL_BACKOFF_SECONDS", "300")
            ),
            rate_limit_backoff_multiplier=float(
                os.environ.get("INSTAGRAM_REEL_429_BACKOFF_MULTIPLIER", "2")
            ),
            rate_limit_max_backoff_seconds=float(
                os.environ.get("INSTAGRAM_REEL_429_MAX_BACKOFF_SECONDS", "1800")
            ),
            rate_limit_max_attempts=int(
                os.environ.get("INSTAGRAM_REEL_429_MAX_ATTEMPTS", "3")
            ),
            output_dir=output_dir,
            state_path=state_path,
            reel_public_base_url=os.environ.get(
                "INSTAGRAM_REEL_PUBLIC_BASE_URL",
                os.environ.get("NEXT_PUBLIC_SITE_URL", "https://www.consultthedead.com"),
            ),
            reel_public_path_prefix=os.environ.get(
                "INSTAGRAM_REEL_PUBLIC_PATH_PREFIX", "/output/reels"
            ),
        )
