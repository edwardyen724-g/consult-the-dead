"""Unit tests for scripts.instagram.scheduler_config."""

from __future__ import annotations

from pathlib import Path

from scripts.instagram.scheduler_config import InstagramSchedulerConfig


class TestInstagramSchedulerConfig:
    def test_defaults_match_the_scheduler_contract(self):
        config = InstagramSchedulerConfig()

        assert config.cron_expression == "0 9 * * 2,4"
        assert config.max_posts_per_day == 1
        assert config.rate_limit_initial_backoff_seconds == 300.0
        assert config.rate_limit_backoff_multiplier == 2.0
        assert config.rate_limit_max_backoff_seconds == 1800.0
        assert config.rate_limit_max_attempts == 3
        assert config.output_dir == Path("output/reels")
        assert config.state_path == Path("output/reels/post-scheduler-state.json")

    def test_from_env_overrides_the_scheduler_knobs(self, monkeypatch, tmp_path):
        monkeypatch.setenv("INSTAGRAM_REEL_POST_CRON", "15 10 * * 1")
        monkeypatch.setenv("INSTAGRAM_REEL_MAX_POSTS_PER_DAY", "2")
        monkeypatch.setenv("INSTAGRAM_REEL_429_INITIAL_BACKOFF_SECONDS", "45")
        monkeypatch.setenv("INSTAGRAM_REEL_429_BACKOFF_MULTIPLIER", "3")
        monkeypatch.setenv("INSTAGRAM_REEL_429_MAX_BACKOFF_SECONDS", "900")
        monkeypatch.setenv("INSTAGRAM_REEL_429_MAX_ATTEMPTS", "5")
        monkeypatch.setenv("INSTAGRAM_REEL_OUTPUT_DIR", str(tmp_path / "reels"))
        monkeypatch.setenv(
            "INSTAGRAM_REEL_POST_STATE_PATH",
            str(tmp_path / "state" / "scheduler.json"),
        )
        monkeypatch.setenv(
            "INSTAGRAM_REEL_PUBLIC_BASE_URL", "https://media.example.test"
        )
        monkeypatch.setenv("INSTAGRAM_REEL_PUBLIC_PATH_PREFIX", "/public/reels")

        config = InstagramSchedulerConfig.from_env()

        assert config.cron_expression == "15 10 * * 1"
        assert config.max_posts_per_day == 2
        assert config.rate_limit_initial_backoff_seconds == 45.0
        assert config.rate_limit_backoff_multiplier == 3.0
        assert config.rate_limit_max_backoff_seconds == 900.0
        assert config.rate_limit_max_attempts == 5
        assert config.output_dir == tmp_path / "reels"
        assert config.state_path == tmp_path / "state" / "scheduler.json"
        assert config.reel_public_base_url == "https://media.example.test"
        assert config.reel_public_path_prefix == "/public/reels"
