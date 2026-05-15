"""Unit tests for scripts.instagram.post_scheduler."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from scripts.instagram.auth import TokenInfo
from scripts.instagram.post_scheduler import (
    ReelPostScheduler,
    SchedulerRecord,
    SchedulerState,
    _candidate_next_attempt,
    _is_approved_mp4,
    _load_sidecar_metadata,
    _parse_bool,
    _parse_iso_datetime,
    run_from_env,
)
from scripts.instagram.scheduler_config import InstagramSchedulerConfig
from scripts.instagram.upload_reel import ReelUploadError, ReelUploadResult, ReelUploader


def _token() -> TokenInfo:
    return TokenInfo(access_token="access-token")


def _write_mp4(tmp_path: Path, name: str, *, approved: bool = True) -> Path:
    mp4 = tmp_path / name
    mp4.write_bytes(b"mp4-bytes")
    if approved:
        sidecar = mp4.with_suffix(".json")
        sidecar.write_text(json.dumps({"approved": True}), encoding="utf-8")
    return mp4


class _FakeAuthClient:
    def token_from_env(self) -> TokenInfo:
        return _token()


class _FakeUploader:
    def __init__(self, outcomes: list[object]) -> None:
        self._outcomes = outcomes
        self.calls: list[tuple[object, TokenInfo]] = []

    def upload(self, spec, token):  # noqa: ANN001 - test helper
        self.calls.append((spec, token))
        if not self._outcomes:
            raise AssertionError("upload called more times than expected")
        outcome = self._outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


class TestApprovalScanning:
    def test_scan_approved_reels_returns_empty_when_output_dir_is_missing(self, tmp_path):
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(output_dir=tmp_path / "missing"),
            uploader=_FakeUploader([]),
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path / "missing",
            state_path=tmp_path / "state.json",
        )

        assert scheduler.scan_approved_reels() == []

    def test_scan_approved_reels_accepts_approved_suffix_and_sidecar_flag(self, tmp_path):
        approved_suffix = tmp_path / "alpha.approved.mp4"
        approved_suffix.write_bytes(b"1")
        approved_sidecar = tmp_path / "beta.mp4"
        approved_sidecar.write_bytes(b"2")
        approved_sidecar.with_suffix(".json").write_text(
            json.dumps({"approved": True}),
            encoding="utf-8",
        )
        rejected = tmp_path / "gamma.mp4"
        rejected.write_bytes(b"3")
        rejected.with_suffix(".json").write_text(
            json.dumps({"approved": False}),
            encoding="utf-8",
        )

        assert _is_approved_mp4(approved_suffix)
        assert _is_approved_mp4(approved_sidecar)
        assert not _is_approved_mp4(rejected)

        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(output_dir=tmp_path),
            uploader=_FakeUploader([]),
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
        )

        names = {path.name for path in scheduler.scan_approved_reels()}
        assert names == {"alpha.approved.mp4", "beta.mp4"}

    def test_build_spec_uses_metadata_overrides(self, tmp_path):
        reel = _write_mp4(tmp_path, "override.approved.mp4")
        reel.with_suffix(".json").write_text(
            json.dumps(
                {
                    "approved": True,
                    "caption": "hello",
                    "share_to_feed": "false",
                    "cover_url": "https://media.example.test/cover.jpg",
                    "video_url": "https://media.example.test/custom.mp4",
                }
            ),
            encoding="utf-8",
        )
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(output_dir=tmp_path),
            uploader=_FakeUploader([]),
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
        )

        spec = scheduler._build_spec(reel)
        assert spec.video_url == "https://media.example.test/custom.mp4"
        assert spec.caption == "hello"
        assert spec.share_to_feed is False
        assert spec.cover_url == "https://media.example.test/cover.jpg"


class TestHelperFunctions:
    def test_parse_bool_supports_common_truthy_and_falsy_values(self):
        assert _parse_bool(None, True) is True
        assert _parse_bool(False, True) is False
        assert _parse_bool(True, False) is True
        assert _parse_bool("true", False) is True
        assert _parse_bool("0", True) is False
        assert _parse_bool("maybe", False) is True

    def test_parse_iso_datetime_and_candidate_retry_time(self):
        assert _parse_iso_datetime(None) is None
        parsed = _parse_iso_datetime("2026-05-15T12:34:56+00:00")
        assert parsed is not None
        record = SchedulerRecord(
            path="/tmp/reel.mp4",
            digest="digest",
            status="failed",
            attempts=1,
            next_attempt_at="2026-05-15T12:34:56+00:00",
        )
        assert _candidate_next_attempt(record) == parsed

    def test_sidecar_metadata_helpers_handle_missing_and_malformed_files(self, tmp_path):
        reel = tmp_path / "alpha.mp4"
        reel.write_bytes(b"1")
        assert _load_sidecar_metadata(reel) == {}
        assert not _is_approved_mp4(reel)

        sidecar = reel.with_suffix(".json")
        sidecar.write_text("{not json", encoding="utf-8")
        assert _load_sidecar_metadata(reel) == {}
        assert not _is_approved_mp4(reel)

    def test_scheduler_state_load_tolerates_missing_and_invalid_state(self, tmp_path):
        missing = tmp_path / "missing.json"
        assert SchedulerState.load(missing) == SchedulerState()

        malformed = tmp_path / "malformed.json"
        malformed.write_text("not json", encoding="utf-8")
        assert SchedulerState.load(malformed) == SchedulerState()

    def test_eligible_after_and_daily_count_helpers(self, tmp_path):
        reel = tmp_path / "alpha.approved.mp4"
        reel.write_bytes(b"1")
        state = SchedulerState(
            records={
                str(reel): SchedulerRecord(
                    path=str(reel),
                    digest="digest",
                    status="posted",
                    attempts=1,
                    posted_at="2026-05-15T08:00:00+00:00",
                ),
                str(tmp_path / "failed.mp4"): SchedulerRecord(
                    path=str(tmp_path / "failed.mp4"),
                    digest="digest",
                    status="failed",
                    attempts=1,
                    next_attempt_at="2026-05-15T14:00:00+00:00",
                ),
            }
        )
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(output_dir=tmp_path),
            uploader=_FakeUploader([]),
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
        )

        assert scheduler._daily_post_count(
            state, today=datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc)
        ) == 1
        assert scheduler._eligible_after(state.records[str(tmp_path / "failed.mp4")]) == datetime(
            2026, 5, 15, 14, 0, tzinfo=timezone.utc
        )

    def test_scheduler_record_round_trip(self):
        record = SchedulerRecord(
            path="/tmp/reel.mp4",
            digest="digest",
            status="posted",
            attempts=2,
            media_id="media",
            container_id="container",
            posted_at="2026-05-15T12:00:00+00:00",
            error="err",
            retry_after_seconds=17.0,
            next_attempt_at="2026-05-15T12:10:00+00:00",
            updated_at="2026-05-15T12:00:01+00:00",
        )

        payload = record.to_dict()
        assert SchedulerRecord.from_dict(payload) == record


class TestSchedulerRun:
    def test_posts_reel_persists_post_ids_and_skips_the_same_file_later(
        self, tmp_path
    ):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        uploader = _FakeUploader(
            [
                ReelUploadResult(
                    media_id="media-123",
                    container_id="container-456",
                    ig_user_id="ig-789",
                )
            ]
        )
        config = InstagramSchedulerConfig(
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            reel_public_base_url="https://media.example.test",
            reel_public_path_prefix="/public/reels",
            max_posts_per_day=2,
        )
        scheduler = ReelPostScheduler(
            config=config,
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            sleep=lambda _: None,
            now=lambda: datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc),
        )

        result = scheduler.run(token=_token())

        assert result.posted == 1
        assert result.failed == 0
        assert result.skipped == 0
        assert uploader.calls[0][0].video_url == (
            "https://media.example.test/public/reels/alpha.approved.mp4"
        )
        assert uploader.calls[0][0].caption == ""

        state = SchedulerState.load(tmp_path / "state.json")
        record = state.get(reel)
        assert record is not None
        assert record.status == "posted"
        assert record.media_id == "media-123"
        assert record.container_id == "container-456"
        assert record.attempts == 1

        second_run = scheduler.run(token=_token())
        assert second_run.posted == 0
        assert second_run.skipped == 1
        assert len(uploader.calls) == 1

    def test_daily_cap_stops_before_new_posts_when_a_post_already_happened_today(
        self, tmp_path
    ):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        state_path = tmp_path / "state.json"
        state = SchedulerState(
            records={
                str(reel): SchedulerRecord(
                    path=str(reel),
                    digest="digest",
                    status="posted",
                    attempts=1,
                    media_id="media-1",
                    container_id="container-1",
                    posted_at="2026-05-15T08:00:00+00:00",
                )
            }
        )
        state.save(state_path)

        uploader = _FakeUploader([])
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=state_path,
                max_posts_per_day=1,
            ),
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=state_path,
        )

        result = scheduler.run(token=_token())

        assert result.posted == 0
        assert result.stopped_early
        assert uploader.calls == []

    def test_retries_on_429_then_posts_and_records_sleep_durations(self, tmp_path):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        uploaded = ReelUploadResult(
            media_id="media-999",
            container_id="container-999",
            ig_user_id="ig-789",
        )
        uploader = _FakeUploader(
            [
                ReelUploadError("rate-limited", status_code=429, retry_after_seconds=None),
                ReelUploadError("rate-limited", status_code=429, retry_after_seconds=None),
                uploaded,
            ]
        )
        sleeps: list[float] = []
        config = InstagramSchedulerConfig(
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            max_posts_per_day=2,
            rate_limit_initial_backoff_seconds=5,
            rate_limit_backoff_multiplier=2,
            rate_limit_max_backoff_seconds=60,
            rate_limit_max_attempts=3,
        )
        scheduler = ReelPostScheduler(
            config=config,
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            sleep=sleeps.append,
            now=lambda: datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc),
        )

        result = scheduler.run(token=_token())

        assert result.posted == 1
        assert result.failed == 0
        assert sleeps == [5, 10]
        assert len(uploader.calls) == 3
        record = SchedulerState.load(tmp_path / "state.json").get(reel)
        assert record is not None
        assert record.status == "posted"
        assert record.media_id == "media-999"

    def test_skips_when_next_attempt_is_in_the_future(self, tmp_path):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        state_path = tmp_path / "state.json"
        state = SchedulerState(
            records={
                str(reel): SchedulerRecord(
                    path=str(reel),
                    digest="digest",
                    status="failed",
                    attempts=1,
                    error="rate limited",
                    retry_after_seconds=30,
                    next_attempt_at="2026-05-15T13:00:00+00:00",
                )
            }
        )
        state.save(state_path)
        uploader = _FakeUploader([])
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=state_path,
                max_posts_per_day=2,
            ),
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=state_path,
            now=lambda: datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc),
        )

        result = scheduler.run(token=_token())

        assert result.skipped == 1
        assert result.posted == 0
        assert uploader.calls == []

    def test_non_rate_limited_error_is_recorded_without_retry(self, tmp_path):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        uploader = _FakeUploader(
            [ReelUploadError("boom", status_code=500, retry_after_seconds=None)]
        )
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=tmp_path / "state.json",
                max_posts_per_day=2,
            ),
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            sleep=lambda _: None,
            now=lambda: datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc),
        )

        result = scheduler.run(token=_token())

        assert result.failed == 1
        assert result.posted == 0
        record = SchedulerState.load(tmp_path / "state.json").get(reel)
        assert record is not None
        assert record.status == "failed"
        assert record.error == "boom"

    def test_exhausted_429_retry_marks_failed_and_sets_next_attempt(self, tmp_path):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        uploader = _FakeUploader(
            [
                ReelUploadError(
                    "rate-limited", status_code=429, retry_after_seconds=None
                ),
                ReelUploadError(
                    "rate-limited", status_code=429, retry_after_seconds=None
                ),
            ]
        )
        sleeps: list[float] = []
        now = datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc)
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=tmp_path / "state.json",
                max_posts_per_day=2,
                rate_limit_initial_backoff_seconds=7,
                rate_limit_backoff_multiplier=2,
                rate_limit_max_backoff_seconds=60,
                rate_limit_max_attempts=2,
            ),
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
            sleep=sleeps.append,
            now=lambda: now,
        )

        result = scheduler.run(token=_token())

        assert result.failed == 1
        assert result.stopped_early
        assert sleeps == [7]
        assert len(uploader.calls) == 2
        record = SchedulerState.load(tmp_path / "state.json").get(reel)
        assert record is not None
        assert record.status == "failed"
        assert record.next_attempt_at is not None
        assert record.retry_after_seconds == 14

    def test_retry_after_seconds_prefers_header_over_smaller_backoff(self, tmp_path):
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=tmp_path / "state.json",
                rate_limit_initial_backoff_seconds=5,
                rate_limit_backoff_multiplier=2,
                rate_limit_max_backoff_seconds=60,
            ),
            uploader=_FakeUploader([]),
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
        )

        exc = ReelUploadError("rate-limited", status_code=429, retry_after_seconds=22)
        assert scheduler._retry_after_seconds(exc, attempts=1) == 22

    def test_publish_with_retry_returns_failure_when_retry_budget_is_zero(self, tmp_path):
        reel = _write_mp4(tmp_path, "alpha.approved.mp4")
        uploader = _FakeUploader([])
        scheduler = ReelPostScheduler(
            config=InstagramSchedulerConfig(
                output_dir=tmp_path,
                state_path=tmp_path / "state.json",
                rate_limit_max_attempts=0,
            ),
            uploader=uploader,
            auth_client=_FakeAuthClient(),
            output_dir=tmp_path,
            state_path=tmp_path / "state.json",
        )

        outcome = scheduler._publish_with_retry(
            reel_path=reel,
            digest="digest",
            spec=scheduler._build_spec(reel),
            token=_token(),
            state=SchedulerState(),
        )

        assert outcome.status == "failed"
        assert outcome.attempts == 0
        assert outcome.retry_after_seconds is None


class TestUploadReel429Parsing:
    def test_parse_response_preserves_http_429_retry_after(self):
        response = MagicMock()
        response.status_code = 429
        response.headers = {"Retry-After": "42"}
        response.json.return_value = {
            "error": {"code": 4, "message": "Application request limit reached"}
        }

        with pytest.raises(ReelUploadError) as exc_info:
            ReelUploader._parse_response(response, context="publish_container")

        assert exc_info.value.status_code == 429
        assert exc_info.value.retry_after_seconds == 42.0


class TestRunFromEnv:
    def test_returns_scheduler_result_from_the_default_entrypoint(self, monkeypatch):
        sentinel = object()

        class _FakeScheduler:
            def __init__(self):
                self.called = True

            def run(self):
                return sentinel

        monkeypatch.setattr(
            "scripts.instagram.post_scheduler.ReelPostScheduler",
            _FakeScheduler,
        )

        assert run_from_env() is sentinel
