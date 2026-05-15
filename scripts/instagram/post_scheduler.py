"""Cron-backed Instagram reel post scheduler.

The scheduler scans ``output/reels/`` for approved MP4 exports, publishes them
through the existing Instagram upload path, and persists the resulting post IDs
so later runs stay idempotent.
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable

from .auth import InstagramAuthClient, TokenInfo
from .scheduler_config import InstagramSchedulerConfig
from .upload_reel import ReelSpec, ReelUploadError, ReelUploader


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso_now(now: datetime) -> str:
    return now.astimezone(timezone.utc).isoformat()


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value)


def _parse_bool(value: object, default: bool) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "yes", "y", "on"}:
            return True
        if normalized in {"0", "false", "no", "n", "off"}:
            return False
    return bool(value)


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _is_approved_mp4(path: Path) -> bool:
    if not path.is_file() or path.suffix.lower() != ".mp4":
        return False
    if ".approved." in path.name or path.name.endswith(".approved.mp4"):
        return True
    metadata_path = path.with_suffix(".json")
    if metadata_path.is_file():
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except Exception:
            return False
        return bool(metadata.get("approved"))
    return False


def _load_sidecar_metadata(path: Path) -> dict:
    metadata_path = path.with_suffix(".json")
    if not metadata_path.is_file():
        return {}
    try:
        raw = metadata_path.read_text(encoding="utf-8")
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _candidate_next_attempt(record: "SchedulerRecord") -> datetime | None:
    return _parse_iso_datetime(record.next_attempt_at)


@dataclass(slots=True)
class SchedulerRecord:
    path: str
    digest: str
    status: str
    attempts: int
    media_id: str | None = None
    container_id: str | None = None
    posted_at: str | None = None
    error: str | None = None
    retry_after_seconds: float | None = None
    next_attempt_at: str | None = None
    updated_at: str | None = None

    def to_dict(self) -> dict:
        return {
            "path": self.path,
            "digest": self.digest,
            "status": self.status,
            "attempts": self.attempts,
            "media_id": self.media_id,
            "container_id": self.container_id,
            "posted_at": self.posted_at,
            "error": self.error,
            "retry_after_seconds": self.retry_after_seconds,
            "next_attempt_at": self.next_attempt_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, payload: dict) -> "SchedulerRecord":
        return cls(
            path=str(payload.get("path", "")),
            digest=str(payload.get("digest", "")),
            status=str(payload.get("status", "failed")),
            attempts=int(payload.get("attempts", 0)),
            media_id=payload.get("media_id"),
            container_id=payload.get("container_id"),
            posted_at=payload.get("posted_at"),
            error=payload.get("error"),
            retry_after_seconds=payload.get("retry_after_seconds"),
            next_attempt_at=payload.get("next_attempt_at"),
            updated_at=payload.get("updated_at"),
        )


@dataclass(slots=True)
class SchedulerState:
    version: int = 1
    records: dict[str, SchedulerRecord] = field(default_factory=dict)

    @classmethod
    def load(cls, path: Path) -> "SchedulerState":
        if not path.is_file():
            return cls()
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return cls()
        records = {
            record_path: SchedulerRecord.from_dict(record)
            for record_path, record in raw.get("records", {}).items()
        }
        return cls(version=int(raw.get("version", 1)), records=records)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "version": self.version,
            "updated_at": _iso_now(_utc_now()),
            "records": {
                path: record.to_dict() for path, record in sorted(self.records.items())
            },
        }
        path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def get(self, reel_path: Path) -> SchedulerRecord | None:
        return self.records.get(str(reel_path))

    def upsert(self, record: SchedulerRecord) -> None:
        self.records[record.path] = record


@dataclass(slots=True)
class SchedulerOutcome:
    path: Path
    status: str
    attempts: int
    media_id: str | None = None
    container_id: str | None = None
    error: str | None = None
    retry_after_seconds: float | None = None
    next_attempt_at: datetime | None = None


@dataclass(slots=True)
class SchedulerRunResult:
    scanned: int = 0
    posted: int = 0
    failed: int = 0
    skipped: int = 0
    outcomes: list[SchedulerOutcome] = field(default_factory=list)
    stopped_early: bool = False


class ReelPostScheduler:
    """Scan approved reel exports and publish them through Instagram."""

    def __init__(
        self,
        config: InstagramSchedulerConfig | None = None,
        *,
        uploader: ReelUploader | None = None,
        auth_client: InstagramAuthClient | None = None,
        output_dir: Path | None = None,
        state_path: Path | None = None,
        sleep: Callable[[float], None] = time.sleep,
        now: Callable[[], datetime] = _utc_now,
    ) -> None:
        self.config = config or InstagramSchedulerConfig.from_env()
        self.output_dir = output_dir or self.config.output_dir
        self.state_path = state_path or self.config.state_path
        self.uploader = uploader or ReelUploader()
        self.auth_client = auth_client or InstagramAuthClient()
        self._sleep = sleep
        self._now = now

    def scan_approved_reels(self) -> list[Path]:
        if not self.output_dir.is_dir():
            return []
        candidates = [
            path
            for path in self.output_dir.iterdir()
            if _is_approved_mp4(path)
        ]
        return sorted(candidates, key=lambda path: (path.stat().st_mtime, path.name))

    def _public_video_url(self, reel_path: Path, metadata: dict) -> str:
        override = metadata.get("video_url")
        if isinstance(override, str) and override:
            return override

        base_url = metadata.get("public_base_url") or self.config.reel_public_base_url
        path_prefix = metadata.get("public_path_prefix") or self.config.reel_public_path_prefix
        return (
            f"{str(base_url).rstrip('/')}/"
            f"{str(path_prefix).strip('/')}/"
            f"{reel_path.name}"
        )

    def _build_spec(self, reel_path: Path) -> ReelSpec:
        metadata = _load_sidecar_metadata(reel_path)
        caption = metadata.get("caption", "")
        share_to_feed = _parse_bool(metadata.get("share_to_feed"), True)
        cover_url = metadata.get("cover_url")
        return ReelSpec(
            video_url=self._public_video_url(reel_path, metadata),
            caption=caption if isinstance(caption, str) else "",
            share_to_feed=share_to_feed,
            cover_url=cover_url if isinstance(cover_url, str) and cover_url else None,
        )

    def _state(self) -> SchedulerState:
        return SchedulerState.load(self.state_path)

    def _eligible_after(self, record: SchedulerRecord) -> datetime | None:
        return _candidate_next_attempt(record)

    def _daily_post_count(self, state: SchedulerState, *, today: datetime) -> int:
        count = 0
        for record in state.records.values():
            if record.status != "posted" or not record.posted_at:
                continue
            posted_at = _parse_iso_datetime(record.posted_at)
            if posted_at is not None and posted_at.date() == today.date():
                count += 1
        return count

    def _store_record(self, state: SchedulerState, record: SchedulerRecord) -> None:
        state.upsert(record)
        state.save(self.state_path)

    def run(self, token: TokenInfo | None = None) -> SchedulerRunResult:
        state = self._state()
        result = SchedulerRunResult()
        token = token or self.auth_client.token_from_env()
        today = self._now()
        posts_today = self._daily_post_count(state, today=today)

        for reel_path in self.scan_approved_reels():
            result.scanned += 1
            record = state.get(reel_path)
            digest = _sha256_file(reel_path)

            if record and record.status == "posted" and record.digest == digest:
                result.skipped += 1
                result.outcomes.append(
                    SchedulerOutcome(
                        path=reel_path,
                        status="skipped",
                        attempts=record.attempts,
                    )
                )
                continue

            if record is not None and record.next_attempt_at:
                eligible_after = self._eligible_after(record)
                if eligible_after is not None and eligible_after > today:
                    result.skipped += 1
                    result.outcomes.append(
                        SchedulerOutcome(
                            path=reel_path,
                            status="skipped",
                            attempts=record.attempts,
                            error=record.error,
                            retry_after_seconds=record.retry_after_seconds,
                            next_attempt_at=eligible_after,
                        )
                    )
                    continue

            if posts_today >= self.config.max_posts_per_day:
                result.stopped_early = True
                break

            spec = self._build_spec(reel_path)
            outcome = self._publish_with_retry(
                reel_path=reel_path,
                digest=digest,
                spec=spec,
                token=token,
                state=state,
            )
            result.outcomes.append(outcome)
            if outcome.status == "posted":
                result.posted += 1
                posts_today += 1
            elif outcome.status == "failed":
                result.failed += 1
                if outcome.retry_after_seconds is not None:
                    result.stopped_early = True
                    break

        return result

    def _publish_with_retry(
        self,
        *,
        reel_path: Path,
        digest: str,
        spec: ReelSpec,
        token: TokenInfo,
        state: SchedulerState,
    ) -> SchedulerOutcome:
        attempts = 0
        next_attempt_at: datetime | None = None

        while attempts < self.config.rate_limit_max_attempts:
            attempts += 1
            try:
                upload_result = self.uploader.upload(spec, token)
            except ReelUploadError as exc:
                if exc.status_code == 429:
                    retry_after_seconds = self._retry_after_seconds(exc, attempts)
                    next_attempt_at = self._now() + timedelta(seconds=retry_after_seconds)
                    record = SchedulerRecord(
                        path=str(reel_path),
                        digest=digest,
                        status="failed",
                        attempts=attempts,
                        error=str(exc),
                        retry_after_seconds=retry_after_seconds,
                        next_attempt_at=_iso_now(next_attempt_at),
                        updated_at=_iso_now(self._now()),
                    )
                    self._store_record(state, record)
                    if attempts >= self.config.rate_limit_max_attempts:
                        return SchedulerOutcome(
                            path=reel_path,
                            status="failed",
                            attempts=attempts,
                            error=str(exc),
                            retry_after_seconds=retry_after_seconds,
                            next_attempt_at=next_attempt_at,
                        )
                    self._sleep(retry_after_seconds)
                    continue

                record = SchedulerRecord(
                    path=str(reel_path),
                    digest=digest,
                    status="failed",
                    attempts=attempts,
                    error=str(exc),
                    updated_at=_iso_now(self._now()),
                )
                self._store_record(state, record)
                return SchedulerOutcome(
                    path=reel_path,
                    status="failed",
                    attempts=attempts,
                    error=str(exc),
                )

            record = SchedulerRecord(
                path=str(reel_path),
                digest=digest,
                status="posted",
                attempts=attempts,
                media_id=upload_result.media_id,
                container_id=upload_result.container_id,
                posted_at=_iso_now(self._now()),
                updated_at=_iso_now(self._now()),
            )
            self._store_record(state, record)
            return SchedulerOutcome(
                path=reel_path,
                status="posted",
                attempts=attempts,
                media_id=upload_result.media_id,
                container_id=upload_result.container_id,
            )

        return SchedulerOutcome(
            path=reel_path,
            status="failed",
            attempts=attempts,
            error="Rate limit retry attempts exhausted",
            retry_after_seconds=(
                (next_attempt_at - self._now()).total_seconds() if next_attempt_at else None
            ),
            next_attempt_at=next_attempt_at,
        )

    def _retry_after_seconds(self, exc: ReelUploadError, attempts: int) -> float:
        header_value = exc.retry_after_seconds
        exponential = self.config.rate_limit_initial_backoff_seconds * (
            self.config.rate_limit_backoff_multiplier ** (attempts - 1)
        )
        if header_value is None:
            candidate = exponential
        else:
            candidate = max(header_value, exponential)
        return min(candidate, self.config.rate_limit_max_backoff_seconds)


def run_from_env() -> SchedulerRunResult:
    """Convenience wrapper for CLI or cron entrypoints."""

    scheduler = ReelPostScheduler()
    return scheduler.run()
