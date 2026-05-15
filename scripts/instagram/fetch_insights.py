"""Instagram Graph API - Reel insights fetcher and report writer.

This module pulls per-reel performance metrics from the Instagram Graph API and
renders a lightweight markdown report suitable for content prioritization.

The fetcher uses two Graph API surfaces:

* ``/{ig-user-id}/media`` to enumerate posted reels and read metadata such as
  caption, permalink, timestamp, and comment count.
* ``/{ig-media-id}/insights`` to pull reel metrics. ``views`` is preferred, but
  the fetcher falls back to older aliases such as ``plays`` and ``video_views``
  when needed.

The report is written to ``output/reel-analytics/YYYY-MM-DD.md`` by default.
"""

from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional, Sequence

import httpx

from .auth import InstagramAuthClient, TokenInfo, _graph_url

_DEFAULT_API_VERSION = "v19.0"
_DEFAULT_MEDIA_PAGE_SIZE = 50
_DEFAULT_OUTPUT_DIR = Path("output/reel-analytics")
_VIEW_METRIC_ALIASES: tuple[str, ...] = ("views", "plays", "video_views")


class ReelInsightsError(RuntimeError):
    """Raised when fetching reel insights or writing the report fails."""


@dataclass(frozen=True)
class ReelMediaRecord:
    """Metadata for a single posted reel."""

    media_id: str
    caption: str
    permalink: str
    timestamp: str
    comments_count: int


@dataclass(frozen=True)
class ReelInsightRecord:
    """Normalized analytics for a single reel."""

    media_id: str
    permalink: str
    timestamp: str
    caption: str
    views: int
    reach: int
    saves: int
    comments: int

    @property
    def selection_score(self) -> int:
        """Heuristic score for content prioritization.

        Saves and comments receive extra weight because they are stronger
        signals of downstream value than raw views alone.
        """

        return self.views + self.reach + (self.saves * 5) + (self.comments * 4)

    @property
    def save_rate(self) -> float:
        if self.reach <= 0:
            return 0.0
        return self.saves / self.reach

    @property
    def comment_rate(self) -> float:
        if self.reach <= 0:
            return 0.0
        return self.comments / self.reach


@dataclass(frozen=True)
class ReelAnalyticsReport:
    """Collection of reel analytics records and their generation metadata."""

    generated_at: datetime
    ig_user_id: str
    api_version: str
    records: tuple[ReelInsightRecord, ...]

    @property
    def total_views(self) -> int:
        return sum(record.views for record in self.records)

    @property
    def total_reach(self) -> int:
        return sum(record.reach for record in self.records)

    @property
    def total_saves(self) -> int:
        return sum(record.saves for record in self.records)

    @property
    def total_comments(self) -> int:
        return sum(record.comments for record in self.records)

    @property
    def top_record(self) -> ReelInsightRecord | None:
        if not self.records:
            return None
        return max(self.records, key=lambda record: record.selection_score)

    def sorted_records(self) -> list[ReelInsightRecord]:
        return sorted(
            self.records,
            key=lambda record: (
                record.selection_score,
                record.saves,
                record.comments,
                record.views,
            ),
            reverse=True,
        )

    def to_markdown(self) -> str:
        """Render the report as markdown."""

        lines: list[str] = []
        lines.append("# Reel analytics report")
        lines.append("")
        lines.append(f"- Generated at: {self.generated_at.isoformat()}")
        lines.append(f"- Instagram user ID: {self.ig_user_id}")
        lines.append(f"- API version: {self.api_version}")
        lines.append(f"- Reels analyzed: {len(self.records)}")
        lines.append(f"- Total views: {self.total_views}")
        lines.append(f"- Total reach: {self.total_reach}")
        lines.append(f"- Total saves: {self.total_saves}")
        lines.append(f"- Total comments: {self.total_comments}")
        lines.append("")

        if not self.records:
            lines.append("No reels were found.")
            return "\n".join(lines) + "\n"

        top_record = self.top_record
        if top_record is not None:
            lines.append("## Top reel")
            lines.append("")
            lines.append(f"- Media ID: `{top_record.media_id}`")
            lines.append(f"- Selection score: {top_record.selection_score}")
            lines.append(f"- Permalink: {top_record.permalink}")
            lines.append("")

        lines.append("## Per-post metrics")
        lines.append("")
        lines.append(
            "| Rank | Media ID | Posted | Views | Reach | Saves | Comments | Score |"
        )
        lines.append(
            "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |"
        )

        for index, record in enumerate(self.sorted_records(), start=1):
            posted = record.timestamp[:10] if record.timestamp else ""
            lines.append(
                f"| {index} | `{record.media_id}` | {posted} | "
                f"{record.views} | {record.reach} | {record.saves} | "
                f"{record.comments} | {record.selection_score} |"
            )

        lines.append("")
        lines.append("## Selection notes")
        lines.append("")
        lines.append(
            "The report ranks reels by a weighted signal score: views + reach + "
            "(saves x 5) + (comments x 4)."
        )
        return "\n".join(lines) + "\n"


class ReelInsightsFetcher:
    """Fetch per-reel insights for a professional Instagram account."""

    def __init__(
        self,
        ig_user_id: Optional[str] = None,
        api_version: Optional[str] = None,
        http_client: Optional[httpx.Client] = None,
    ) -> None:
        self.ig_user_id = ig_user_id or os.environ.get("INSTAGRAM_USER_ID")
        if not self.ig_user_id:
            raise ReelInsightsError("INSTAGRAM_USER_ID is not set")

        self.api_version = api_version or _DEFAULT_API_VERSION
        self._owns_client = http_client is None
        self._http = http_client or httpx.Client(timeout=60)

    def fetch_report(
        self,
        token: TokenInfo,
        *,
        limit: Optional[int] = None,
    ) -> ReelAnalyticsReport:
        """Fetch reel insights and return a normalized analytics report."""

        media_records = self._fetch_reel_media(token, limit=limit)
        analytics = tuple(
            self._build_insight_record(media_record, token)
            for media_record in media_records
        )
        return ReelAnalyticsReport(
            generated_at=datetime.now(timezone.utc),
            ig_user_id=self.ig_user_id,
            api_version=self.api_version,
            records=analytics,
        )

    def close(self) -> None:
        if self._owns_client:
            self._http.close()

    def __enter__(self) -> "ReelInsightsFetcher":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _fetch_reel_media(
        self,
        token: TokenInfo,
        *,
        limit: Optional[int] = None,
    ) -> list[ReelMediaRecord]:
        url = _graph_url(f"/{self.ig_user_id}/media", self.api_version)
        params: dict[str, object] = {
            "fields": (
                "id,caption,media_type,media_product_type,permalink,timestamp,"
                "comments_count"
            ),
            "limit": _DEFAULT_MEDIA_PAGE_SIZE,
            "access_token": token.access_token,
        }

        records: list[ReelMediaRecord] = []
        after: Optional[str] = None
        while True:
            if after:
                params["after"] = after
            elif "after" in params:
                params.pop("after")

            response = self._http.get(url, params=params)
            data = self._parse_response(response, context="fetch_media")
            for item in data.get("data", []):
                if not self._is_reel(item):
                    continue
                records.append(self._normalize_media_record(item))
                if limit is not None and len(records) >= limit:
                    return records

            paging = data.get("paging") or {}
            cursors = paging.get("cursors") or {}
            after = cursors.get("after")
            if not after:
                return records

    def _build_insight_record(
        self,
        media_record: ReelMediaRecord,
        token: TokenInfo,
    ) -> ReelInsightRecord:
        views = self._fetch_single_metric(media_record.media_id, token, "views")
        reach = self._fetch_single_metric(media_record.media_id, token, "reach")
        saves = self._fetch_single_metric(media_record.media_id, token, "saved")
        comments = media_record.comments_count
        if comments == 0:
            try:
                comments = self._fetch_single_metric(media_record.media_id, token, "comments")
            except ReelInsightsError:
                comments = 0

        return ReelInsightRecord(
            media_id=media_record.media_id,
            permalink=media_record.permalink,
            timestamp=media_record.timestamp,
            caption=media_record.caption,
            views=views,
            reach=reach,
            saves=saves,
            comments=comments,
        )

    def _fetch_single_metric(
        self,
        media_id: str,
        token: TokenInfo,
        metric_name: str,
    ) -> int:
        last_error: Optional[Exception] = None
        for alias in self._metric_aliases(metric_name):
            url = _graph_url(f"/{media_id}/insights", self.api_version)
            params = {
                "metric": alias,
                "access_token": token.access_token,
            }
            response = self._http.get(url, params=params)
            try:
                data = self._parse_response(response, context=f"fetch_{metric_name}")
            except ReelInsightsError as exc:
                last_error = exc
                continue

            metric_data = data.get("data") or []
            if not metric_data:
                raise ReelInsightsError(
                    f"fetch_{metric_name}: missing metric data for {media_id}"
                )

            first = metric_data[0]
            values = first.get("values") or []
            if not values:
                raise ReelInsightsError(
                    f"fetch_{metric_name}: missing values for {media_id}"
                )

            raw_value = values[0].get("value", 0)
            try:
                return int(raw_value)
            except (TypeError, ValueError) as exc:
                raise ReelInsightsError(
                    f"fetch_{metric_name}: invalid numeric value {raw_value!r}"
                ) from exc

        if last_error is not None:
            raise ReelInsightsError(str(last_error)) from last_error
        raise ReelInsightsError(f"fetch_{metric_name}: unable to resolve alias")

    @staticmethod
    def _metric_aliases(metric_name: str) -> tuple[str, ...]:
        if metric_name == "views":
            return _VIEW_METRIC_ALIASES
        return (metric_name,)

    @staticmethod
    def _is_reel(item: dict) -> bool:
        return item.get("media_product_type") == "REELS"

    @staticmethod
    def _normalize_media_record(item: dict) -> ReelMediaRecord:
        media_id = str(item.get("id", ""))
        if not media_id:
            raise ReelInsightsError("fetch_media: media id missing")
        return ReelMediaRecord(
            media_id=media_id,
            caption=str(item.get("caption") or ""),
            permalink=str(item.get("permalink") or ""),
            timestamp=str(item.get("timestamp") or ""),
            comments_count=int(item.get("comments_count") or 0),
        )

    @staticmethod
    def _parse_response(response: httpx.Response, *, context: str) -> dict:
        try:
            data = response.json()
        except Exception as exc:
            raise ReelInsightsError(f"{context}: failed to parse JSON - {exc}") from exc

        if "error" in data:
            err = data["error"]
            raise ReelInsightsError(
                f"{context}: Graph API error {err.get('code')} - {err.get('message')}"
            )
        return data


def write_markdown_report(
    report: ReelAnalyticsReport,
    output_dir: Path | str = _DEFAULT_OUTPUT_DIR,
    *,
    report_date: Optional[date] = None,
) -> Path:
    """Write the report to ``output/reel-analytics/YYYY-MM-DD.md``."""

    target_dir = Path(output_dir)
    target_dir.mkdir(parents=True, exist_ok=True)
    filename_date = report_date or report.generated_at.date()
    output_path = target_dir / f"{filename_date.isoformat()}.md"
    output_path.write_text(report.to_markdown(), encoding="utf-8")
    return output_path


def build_report_from_env(
    *,
    limit: Optional[int] = None,
    output_dir: Path | str = _DEFAULT_OUTPUT_DIR,
    ig_user_id: Optional[str] = None,
    api_version: Optional[str] = None,
    token: Optional[TokenInfo] = None,
) -> Path:
    """Fetch insights using environment credentials and write a markdown report."""

    resolved_token = token
    if resolved_token is None:
        with InstagramAuthClient() as auth_client:
            resolved_token = auth_client.token_from_env()

    if resolved_token is None:
        raise ReelInsightsError("Instagram access token is not available")

    with ReelInsightsFetcher(ig_user_id=ig_user_id, api_version=api_version) as fetcher:
        report = fetcher.fetch_report(resolved_token, limit=limit)

    return write_markdown_report(report, output_dir=output_dir)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fetch Instagram reel insights and write a markdown report."
    )
    parser.add_argument(
        "--ig-user-id",
        default=None,
        help="Instagram-scoped user ID. Defaults to INSTAGRAM_USER_ID.",
    )
    parser.add_argument(
        "--api-version",
        default=None,
        help="Instagram Graph API version. Defaults to v19.0.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of reels to include in the report.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(_DEFAULT_OUTPUT_DIR),
        help="Directory where the markdown report will be written.",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> None:  # pragma: no cover
    """CLI wrapper for manual runs."""

    parser = _build_parser()
    args = parser.parse_args(argv)
    output_path = build_report_from_env(
        limit=args.limit,
        output_dir=Path(args.output_dir),
        ig_user_id=args.ig_user_id,
        api_version=args.api_version,
    )
    print(f"Wrote reel analytics report to {output_path}")


if __name__ == "__main__":  # pragma: no cover
    main()
