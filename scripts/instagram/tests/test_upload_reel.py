"""Unit tests for scripts/instagram/upload_reel.py.

All tests mock the HTTP layer; no real network calls are made.
No credentials appear in test code — env vars are patched per test.
"""

from __future__ import annotations

import time
from unittest.mock import MagicMock, call, patch

import pytest

from scripts.instagram.auth import TokenInfo
from scripts.instagram.upload_reel import (
    ReelSpec,
    ReelUploadError,
    ReelUploadResult,
    ReelUploader,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _token() -> TokenInfo:
    return TokenInfo(access_token="test-access-token", expires_at=time.time() + 3600)


def _response(payload: dict, status_code: int = 200) -> MagicMock:
    r = MagicMock()
    r.json.return_value = payload
    r.status_code = status_code
    return r


def _uploader(http_client: MagicMock, poll_timeout: float = 1, **kwargs) -> ReelUploader:
    return ReelUploader(
        ig_user_id="123456789",
        poll_interval=0,   # no sleep in tests
        poll_timeout=poll_timeout,
        http_client=http_client,
        **kwargs,
    )


# ---------------------------------------------------------------------------
# ReelSpec
# ---------------------------------------------------------------------------

class TestReelSpec:
    def test_defaults(self):
        spec = ReelSpec(video_url="https://cdn.example.com/reel.mp4")
        assert spec.caption == ""
        assert spec.share_to_feed is True
        assert spec.cover_url is None

    def test_custom_values(self):
        spec = ReelSpec(
            video_url="https://cdn.example.com/reel.mp4",
            caption="hello",
            share_to_feed=False,
            cover_url="https://cdn.example.com/cover.jpg",
        )
        assert spec.caption == "hello"
        assert not spec.share_to_feed
        assert spec.cover_url == "https://cdn.example.com/cover.jpg"


# ---------------------------------------------------------------------------
# ReelUploader — constructor
# ---------------------------------------------------------------------------

class TestReelUploaderInit:
    def test_raises_when_no_ig_user_id(self, monkeypatch):
        monkeypatch.delenv("INSTAGRAM_USER_ID", raising=False)
        with pytest.raises(ReelUploadError, match="INSTAGRAM_USER_ID"):
            ReelUploader(http_client=MagicMock())

    def test_reads_ig_user_id_from_env(self, monkeypatch):
        monkeypatch.setenv("INSTAGRAM_USER_ID", "env-user-id")
        uploader = ReelUploader(http_client=MagicMock())
        assert uploader.ig_user_id == "env-user-id"

    def test_accepts_explicit_ig_user_id(self):
        uploader = ReelUploader(ig_user_id="explicit-id", http_client=MagicMock())
        assert uploader.ig_user_id == "explicit-id"


# ---------------------------------------------------------------------------
# _create_container
# ---------------------------------------------------------------------------

class TestCreateContainer:
    def test_returns_container_id(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "container-001"})
        uploader = _uploader(http)
        container_id = uploader._create_container(
            ReelSpec(video_url="https://example.com/v.mp4", caption="cap"),
            _token(),
        )
        assert container_id == "container-001"

    def test_posts_to_correct_url(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "c-001"})
        uploader = _uploader(http)
        uploader._create_container(
            ReelSpec(video_url="https://example.com/v.mp4"),
            _token(),
        )
        url, _ = http.post.call_args[0][0], http.post.call_args
        assert "123456789/media" in url

    def test_payload_includes_required_fields(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "c-001"})
        uploader = _uploader(http)
        spec = ReelSpec(
            video_url="https://example.com/v.mp4",
            caption="My caption",
            share_to_feed=False,
        )
        uploader._create_container(spec, _token())
        payload = http.post.call_args[1]["data"]
        assert payload["media_type"] == "REELS"
        assert payload["video_url"] == "https://example.com/v.mp4"
        assert payload["caption"] == "My caption"
        assert payload["share_to_feed"] == "false"
        assert payload["access_token"] == "test-access-token"

    def test_cover_url_included_when_set(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "c-001"})
        uploader = _uploader(http)
        spec = ReelSpec(
            video_url="https://example.com/v.mp4",
            cover_url="https://example.com/cover.jpg",
        )
        uploader._create_container(spec, _token())
        payload = http.post.call_args[1]["data"]
        assert payload["cover_url"] == "https://example.com/cover.jpg"

    def test_cover_url_absent_when_not_set(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "c-001"})
        uploader = _uploader(http)
        uploader._create_container(
            ReelSpec(video_url="https://example.com/v.mp4"),
            _token(),
        )
        payload = http.post.call_args[1]["data"]
        assert "cover_url" not in payload

    def test_raises_when_id_missing(self):
        http = MagicMock()
        http.post.return_value = _response({"unexpected": True})
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="'id' missing"):
            uploader._create_container(
                ReelSpec(video_url="https://example.com/v.mp4"),
                _token(),
            )

    def test_raises_on_graph_api_error(self):
        http = MagicMock()
        http.post.return_value = _response(
            {"error": {"code": 9, "message": "User not eligible."}}
        )
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="9"):
            uploader._create_container(
                ReelSpec(video_url="https://example.com/v.mp4"),
                _token(),
            )


# ---------------------------------------------------------------------------
# _wait_for_container
# ---------------------------------------------------------------------------

class TestWaitForContainer:
    def test_returns_immediately_when_finished(self):
        http = MagicMock()
        http.get.return_value = _response({"status_code": "FINISHED"})
        uploader = _uploader(http)
        # Should not raise
        uploader._wait_for_container("container-001", _token())
        http.get.assert_called_once()

    def test_polls_until_finished(self):
        http = MagicMock()
        http.get.side_effect = [
            _response({"status_code": "IN_PROGRESS"}),
            _response({"status_code": "IN_PROGRESS"}),
            _response({"status_code": "FINISHED"}),
        ]
        uploader = _uploader(http, poll_timeout=10)
        uploader._wait_for_container("c-001", _token())
        assert http.get.call_count == 3

    def test_raises_on_error_status(self):
        http = MagicMock()
        http.get.return_value = _response(
            {"status_code": "ERROR", "status": "Video processing failed."}
        )
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="processing failed"):
            uploader._wait_for_container("c-001", _token())

    def test_raises_on_already_published(self):
        http = MagicMock()
        http.get.return_value = _response({"status_code": "PUBLISHED"})
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="already published"):
            uploader._wait_for_container("c-001", _token())

    def test_raises_on_timeout(self):
        http = MagicMock()
        # Always returns IN_PROGRESS so we time out
        http.get.return_value = _response({"status_code": "IN_PROGRESS"})
        uploader = ReelUploader(
            ig_user_id="123456789",
            poll_interval=0,
            poll_timeout=0,  # immediate timeout
            http_client=http,
        )
        with pytest.raises(ReelUploadError, match="did not reach FINISHED"):
            uploader._wait_for_container("c-001", _token())

    def test_passes_token_in_params(self):
        http = MagicMock()
        http.get.return_value = _response({"status_code": "FINISHED"})
        uploader = _uploader(http)
        uploader._wait_for_container("c-001", _token())
        params = http.get.call_args[1]["params"]
        assert params["access_token"] == "test-access-token"
        assert "status_code" in params["fields"]


# ---------------------------------------------------------------------------
# _publish_container
# ---------------------------------------------------------------------------

class TestPublishContainer:
    def test_returns_media_id(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "media-999"})
        uploader = _uploader(http)
        media_id = uploader._publish_container("c-001", _token())
        assert media_id == "media-999"

    def test_posts_to_media_publish_endpoint(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "m-001"})
        uploader = _uploader(http)
        uploader._publish_container("c-001", _token())
        url = http.post.call_args[0][0]
        assert "123456789/media_publish" in url

    def test_payload_includes_creation_id(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "m-001"})
        uploader = _uploader(http)
        uploader._publish_container("c-999", _token())
        payload = http.post.call_args[1]["data"]
        assert payload["creation_id"] == "c-999"
        assert payload["access_token"] == "test-access-token"

    def test_raises_when_id_missing(self):
        http = MagicMock()
        http.post.return_value = _response({"unexpected": True})
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="'id' missing"):
            uploader._publish_container("c-001", _token())

    def test_raises_on_graph_api_error(self):
        http = MagicMock()
        http.post.return_value = _response(
            {"error": {"code": 200, "message": "Permissions error."}}
        )
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="200"):
            uploader._publish_container("c-001", _token())


# ---------------------------------------------------------------------------
# upload (end-to-end through mocked HTTP)
# ---------------------------------------------------------------------------

class TestUploadEndToEnd:
    def _make_http(self) -> MagicMock:
        http = MagicMock()
        # create_container → POST → {"id": "c-100"}
        # _wait_for_container → GET → {"status_code": "FINISHED"}
        # _publish_container → POST → {"id": "m-200"}
        http.post.side_effect = [
            _response({"id": "c-100"}),
            _response({"id": "m-200"}),
        ]
        http.get.return_value = _response({"status_code": "FINISHED"})
        return http

    def test_happy_path_returns_result(self):
        http = self._make_http()
        uploader = _uploader(http)
        spec = ReelSpec(video_url="https://cdn.example.com/reel.mp4", caption="cap")
        result = uploader.upload(spec, _token())

        assert isinstance(result, ReelUploadResult)
        assert result.media_id == "m-200"
        assert result.container_id == "c-100"
        assert result.ig_user_id == "123456789"

    def test_http_called_in_correct_order(self):
        http = self._make_http()
        uploader = _uploader(http)
        uploader.upload(
            ReelSpec(video_url="https://cdn.example.com/reel.mp4"),
            _token(),
        )
        # First call: create container (POST)
        # Second call: poll status (GET)
        # Third call: publish (POST)
        assert http.post.call_count == 2
        assert http.get.call_count == 1

    def test_propagates_create_container_error(self):
        http = MagicMock()
        http.post.return_value = _response(
            {"error": {"code": 9, "message": "Not eligible."}}
        )
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="9"):
            uploader.upload(
                ReelSpec(video_url="https://cdn.example.com/reel.mp4"),
                _token(),
            )

    def test_propagates_poll_error(self):
        http = MagicMock()
        http.post.return_value = _response({"id": "c-100"})
        http.get.return_value = _response({"status_code": "ERROR", "status": "Failed."})
        uploader = _uploader(http)
        with pytest.raises(ReelUploadError, match="processing failed"):
            uploader.upload(
                ReelSpec(video_url="https://cdn.example.com/reel.mp4"),
                _token(),
            )


# ---------------------------------------------------------------------------
# _parse_response (static helper)
# ---------------------------------------------------------------------------

class TestParseResponse:
    def test_returns_data_on_success(self):
        response = _response({"id": "123"})
        data = ReelUploader._parse_response(response, context="test")
        assert data["id"] == "123"

    def test_raises_on_error_key(self):
        response = _response({"error": {"code": 1, "message": "Oops."}})
        with pytest.raises(ReelUploadError, match="Oops"):
            ReelUploader._parse_response(response, context="test")

    def test_raises_on_json_parse_failure(self):
        response = MagicMock()
        response.json.side_effect = ValueError("bad json")
        with pytest.raises(ReelUploadError, match="failed to parse JSON"):
            ReelUploader._parse_response(response, context="test")


# ---------------------------------------------------------------------------
# Context manager
# ---------------------------------------------------------------------------

class TestReelUploaderContextManager:
    def test_close_called_on_exit(self):
        http = MagicMock()
        uploader = ReelUploader(ig_user_id="uid", http_client=http)
        uploader._owns_client = True
        with uploader:
            pass
        http.close.assert_called_once()
