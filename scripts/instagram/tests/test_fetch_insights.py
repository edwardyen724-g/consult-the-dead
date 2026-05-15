"""Unit tests for scripts/instagram/fetch_insights.py."""

from __future__ import annotations

from datetime import date, datetime, timezone
from unittest.mock import MagicMock

import pytest

from scripts.instagram.auth import TokenInfo
from scripts.instagram.fetch_insights import (
    ReelAnalyticsReport,
    ReelInsightRecord,
    ReelInsightsError,
    ReelInsightsFetcher,
    _build_parser,
    build_report_from_env,
    write_markdown_report,
)


def _token() -> TokenInfo:
    return TokenInfo(access_token="access-token")


def _response(payload: dict) -> MagicMock:
    response = MagicMock()
    response.json.return_value = payload
    return response


def _fetcher(http_client: MagicMock) -> ReelInsightsFetcher:
    return ReelInsightsFetcher(ig_user_id="123456789", http_client=http_client)


class TestReelAnalyticsReport:
    def test_selection_score_weights_saves_and_comments(self):
        record = ReelInsightRecord(
            media_id="m1",
            permalink="https://example.com/m1",
            timestamp="2026-05-15T12:00:00+0000",
            caption="cap",
            views=100,
            reach=80,
            saves=3,
            comments=2,
        )

        assert record.selection_score == 100 + 80 + (3 * 5) + (2 * 4)
        assert record.save_rate == pytest.approx(3 / 80)
        assert record.comment_rate == pytest.approx(2 / 80)

    def test_rates_are_zero_when_reach_is_zero(self):
        record = ReelInsightRecord(
            media_id="m1",
            permalink="https://example.com/m1",
            timestamp="2026-05-15T12:00:00+0000",
            caption="cap",
            views=10,
            reach=0,
            saves=4,
            comments=3,
        )

        assert record.save_rate == 0.0
        assert record.comment_rate == 0.0

    def test_to_markdown_renders_summary_and_table(self):
        report = ReelAnalyticsReport(
            generated_at=datetime(2026, 5, 15, 18, 30, tzinfo=timezone.utc),
            ig_user_id="123456789",
            api_version="v19.0",
            records=(
                ReelInsightRecord(
                    media_id="m1",
                    permalink="https://example.com/m1",
                    timestamp="2026-05-15T12:00:00+0000",
                    caption="cap",
                    views=100,
                    reach=80,
                    saves=3,
                    comments=2,
                ),
                ReelInsightRecord(
                    media_id="m2",
                    permalink="https://example.com/m2",
                    timestamp="2026-05-14T12:00:00+0000",
                    caption="cap",
                    views=50,
                    reach=40,
                    saves=6,
                    comments=5,
                ),
            ),
        )

        markdown = report.to_markdown()
        assert "# Reel analytics report" in markdown
        assert "Reels analyzed: 2" in markdown
        assert "| Rank | Media ID | Posted | Views | Reach | Saves | Comments | Score |" in markdown
        assert "`m2`" in markdown
        assert "Selection notes" in markdown

    def test_to_markdown_handles_empty_reports(self):
        report = ReelAnalyticsReport(
            generated_at=datetime(2026, 5, 15, 18, 30, tzinfo=timezone.utc),
            ig_user_id="123456789",
            api_version="v19.0",
            records=(),
        )

        markdown = report.to_markdown()
        assert "No reels were found." in markdown
        assert "Top reel" not in markdown


class TestWriteMarkdownReport:
    def test_writes_file_using_report_date(self, tmp_path):
        report = ReelAnalyticsReport(
            generated_at=datetime(2026, 5, 15, 18, 30, tzinfo=timezone.utc),
            ig_user_id="123456789",
            api_version="v19.0",
            records=(),
        )

        path = write_markdown_report(
            report,
            output_dir=tmp_path,
            report_date=date(2026, 5, 16),
        )

        assert path == tmp_path / "2026-05-16.md"
        assert path.read_text(encoding="utf-8").startswith("# Reel analytics report")


class TestFetcherMediaCollection:
    def test_fetch_report_collects_only_reels_and_paginates(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 7,
                        },
                        {
                            "id": "feed-video",
                            "caption": "Not a reel",
                            "media_product_type": "FEED",
                            "permalink": "https://example.com/feed-video",
                            "timestamp": "2026-05-15T11:00:00+0000",
                            "comments_count": 99,
                        },
                    ],
                    "paging": {"cursors": {"after": "cursor-1"}},
                }
            ),
            _response(
                {
                    "data": [
                        {
                            "id": "reel-2",
                            "caption": "Second reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-2",
                            "timestamp": "2026-05-14T12:00:00+0000",
                            "comments_count": 2,
                        }
                    ]
                }
            ),
            _response({"data": [{"name": "views", "values": [{"value": 120}]}]}),
            _response({"data": [{"name": "reach", "values": [{"value": 90}]}]}),
            _response({"data": [{"name": "saved", "values": [{"value": 11}]}]}),
            _response({"data": [{"name": "views", "values": [{"value": 45}]}]}),
            _response({"data": [{"name": "reach", "values": [{"value": 30}]}]}),
            _response({"data": [{"name": "saved", "values": [{"value": 4}]}]}),
        ]

        fetcher = _fetcher(http)
        report = fetcher.fetch_report(_token())

        assert len(report.records) == 2
        assert [record.media_id for record in report.records] == ["reel-1", "reel-2"]
        assert report.records[0].comments == 7
        assert report.records[0].views == 120
        assert report.records[1].saves == 4
        assert http.get.call_count == 8

    def test_comments_metric_is_used_when_media_comment_count_is_zero(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 0,
                        }
                    ]
                }
            ),
            _response({"data": [{"name": "views", "values": [{"value": 10}]}]}),
            _response({"data": [{"name": "reach", "values": [{"value": 20}]}]}),
            _response({"data": [{"name": "saved", "values": [{"value": 3}]}]}),
            _response({"data": [{"name": "comments", "values": [{"value": 5}]}]}),
        ]

        fetcher = _fetcher(http)
        report = fetcher.fetch_report(_token(), limit=1)

        assert report.records[0].comments == 5
        assert http.get.call_count == 5

    def test_fetch_report_respects_limit(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        },
                        {
                            "id": "reel-2",
                            "caption": "Second reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-2",
                            "timestamp": "2026-05-14T12:00:00+0000",
                            "comments_count": 2,
                        },
                    ]
                }
            ),
            _response({"data": [{"name": "views", "values": [{"value": 10}]}]}),
            _response({"data": [{"name": "reach", "values": [{"value": 20}]}]}),
            _response({"data": [{"name": "saved", "values": [{"value": 3}]}]}),
        ]

        fetcher = _fetcher(http)
        report = fetcher.fetch_report(_token(), limit=1)

        assert len(report.records) == 1
        assert report.records[0].media_id == "reel-1"


class TestFetcherMetricFallback:
    def test_views_falls_back_to_plays_when_needed(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        }
                    ]
                }
            ),
            _response({"error": {"code": 100, "message": "Unsupported metric."}}),
            _response({"data": [{"name": "plays", "values": [{"value": 222}]}]}),
            _response({"data": [{"name": "reach", "values": [{"value": 50}]}]}),
            _response({"data": [{"name": "saved", "values": [{"value": 6}]}]}),
        ]

        fetcher = _fetcher(http)
        report = fetcher.fetch_report(_token(), limit=1)

        assert report.records[0].views == 222

    def test_views_raises_when_all_aliases_error(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        }
                    ]
                }
            ),
            _response({"error": {"code": 100, "message": "Unsupported metric."}}),
            _response({"error": {"code": 100, "message": "Unsupported metric."}}),
            _response({"error": {"code": 100, "message": "Unsupported metric."}}),
        ]

        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="Unsupported metric"):
            fetcher.fetch_report(_token(), limit=1)


class TestFetcherErrors:
    def test_raises_when_user_id_missing(self):
        with pytest.raises(ReelInsightsError, match="INSTAGRAM_USER_ID"):
            ReelInsightsFetcher(http_client=MagicMock())

    def test_raises_on_graph_error(self):
        http = MagicMock()
        http.get.return_value = _response(
            {"error": {"code": 190, "message": "Invalid OAuth access token."}}
        )
        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="190"):
            fetcher._fetch_reel_media(_token())

    def test_raises_on_invalid_media_shape(self):
        http = MagicMock()
        http.get.return_value = _response(
            {
                "data": [
                    {
                        "caption": "Missing id",
                        "media_product_type": "REELS",
                        "permalink": "https://example.com/reel-1",
                        "timestamp": "2026-05-15T12:00:00+0000",
                        "comments_count": 1,
                    }
                ]
            }
        )
        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="media id missing"):
            fetcher._fetch_reel_media(_token())

    def test_raises_on_missing_metric_data(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        }
                    ]
                }
            ),
            _response({"data": []}),
        ]
        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="missing metric data"):
            fetcher.fetch_report(_token(), limit=1)

    def test_raises_on_missing_metric_values(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        }
                    ]
                }
            ),
            _response({"data": [{"name": "views", "values": []}]}),
            _response({"data": [{"name": "plays", "values": []}]}),
        ]
        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="missing values"):
            fetcher.fetch_report(_token(), limit=1)

    def test_raises_on_invalid_metric_value(self):
        http = MagicMock()
        http.get.side_effect = [
            _response(
                {
                    "data": [
                        {
                            "id": "reel-1",
                            "caption": "First reel",
                            "media_product_type": "REELS",
                            "permalink": "https://example.com/reel-1",
                            "timestamp": "2026-05-15T12:00:00+0000",
                            "comments_count": 1,
                        }
                    ]
                }
            ),
            _response({"data": [{"name": "views", "values": [{"value": "nan"}]}]}),
        ]
        fetcher = _fetcher(http)

        with pytest.raises(ReelInsightsError, match="invalid numeric value"):
            fetcher.fetch_report(_token(), limit=1)

    def test_parse_response_raises_on_json_failure(self):
        response = MagicMock()
        response.json.side_effect = ValueError("bad json")

        with pytest.raises(ReelInsightsError, match="failed to parse JSON"):
            ReelInsightsFetcher._parse_response(response, context="test")


class TestBuildReportFromEnv:
    def test_writes_report_from_env_credentials(self, monkeypatch, tmp_path):
        monkeypatch.setenv("INSTAGRAM_ACCESS_TOKEN", "env-token")
        monkeypatch.setenv("INSTAGRAM_APP_ID", "app-id")
        monkeypatch.setenv("INSTAGRAM_APP_SECRET", "app-secret")

        auth_client = MagicMock()
        auth_client.__enter__.return_value = auth_client
        auth_client.__exit__.return_value = None
        auth_client.token_from_env.return_value = _token()

        fetcher = MagicMock()
        fetcher.__enter__.return_value = fetcher
        fetcher.__exit__.return_value = None
        fetcher.fetch_report.return_value = ReelAnalyticsReport(
            generated_at=datetime(2026, 5, 15, 18, 30, tzinfo=timezone.utc),
            ig_user_id="123456789",
            api_version="v19.0",
            records=(),
        )

        from scripts.instagram import fetch_insights as module

        monkeypatch.setattr(module, "InstagramAuthClient", lambda: auth_client)
        monkeypatch.setattr(
            module,
            "ReelInsightsFetcher",
            lambda **kwargs: fetcher,
        )

        output_path = build_report_from_env(output_dir=tmp_path)

        assert output_path == tmp_path / "2026-05-15.md"
        assert output_path.exists()

    def test_raises_when_token_resolution_returns_none(self, monkeypatch, tmp_path):
        auth_client = MagicMock()
        auth_client.__enter__.return_value = auth_client
        auth_client.__exit__.return_value = None
        auth_client.token_from_env.return_value = None

        from scripts.instagram import fetch_insights as module

        monkeypatch.setattr(module, "InstagramAuthClient", lambda: auth_client)

        with pytest.raises(ReelInsightsError, match="access token is not available"):
            build_report_from_env(output_dir=tmp_path)


class TestFetcherLifecycle:
    def test_context_manager_closes_owned_client(self):
        http = MagicMock()
        fetcher = ReelInsightsFetcher(ig_user_id="123456789", http_client=http)
        fetcher._owns_client = True

        with fetcher:
            pass

        http.close.assert_called_once()

    def test_close_noops_when_client_not_owned(self):
        http = MagicMock()
        fetcher = ReelInsightsFetcher(ig_user_id="123456789", http_client=http)

        fetcher.close()

        http.close.assert_not_called()


class TestParser:
    def test_build_parser_accepts_cli_arguments(self):
        parser = _build_parser()
        args = parser.parse_args(
            [
                "--ig-user-id",
                "user-1",
                "--api-version",
                "v22.0",
                "--limit",
                "3",
                "--output-dir",
                "output/reel-analytics",
            ]
        )

        assert args.ig_user_id == "user-1"
        assert args.api_version == "v22.0"
        assert args.limit == 3
        assert args.output_dir == "output/reel-analytics"
