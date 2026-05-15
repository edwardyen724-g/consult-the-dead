"""Unit tests for scripts/instagram/auth.py.

All tests mock the HTTP layer; no real network calls are made.
No credentials appear in test code — env vars are patched per test.
"""

from __future__ import annotations

import time
from unittest.mock import MagicMock, patch

import pytest

from scripts.instagram.auth import (
    InstagramAuthClient,
    InstagramAuthError,
    TokenInfo,
    build_oauth_url,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_http_client(json_payload: dict, status_code: int = 200) -> MagicMock:
    """Return a mock httpx.Client whose .get/.post return a pre-built response."""
    response = MagicMock()
    response.json.return_value = json_payload
    response.status_code = status_code
    client = MagicMock()
    client.get.return_value = response
    client.post.return_value = response
    return client


def _client(http_client: MagicMock) -> InstagramAuthClient:
    """Build an InstagramAuthClient with dummy creds and the provided mock."""
    return InstagramAuthClient(
        app_id="test-app-id",
        app_secret="test-app-secret",
        http_client=http_client,
    )


# ---------------------------------------------------------------------------
# TokenInfo
# ---------------------------------------------------------------------------

class TestTokenInfo:
    def test_not_expired_when_no_expiry(self):
        t = TokenInfo(access_token="tok")
        assert not t.is_expired
        assert t.seconds_until_expiry is None

    def test_not_expired_when_future_expiry(self):
        t = TokenInfo(access_token="tok", expires_at=time.time() + 3600)
        assert not t.is_expired
        assert t.seconds_until_expiry > 0

    def test_expired_when_past_expiry(self):
        t = TokenInfo(access_token="tok", expires_at=time.time() - 1)
        assert t.is_expired
        assert t.seconds_until_expiry == 0.0

    def test_seconds_until_expiry_is_bounded_below_zero(self):
        t = TokenInfo(access_token="tok", expires_at=time.time() - 100)
        assert t.seconds_until_expiry == 0.0


# ---------------------------------------------------------------------------
# InstagramAuthClient — constructor
# ---------------------------------------------------------------------------

class TestInstagramAuthClientInit:
    def test_raises_when_no_app_id(self):
        with pytest.raises(InstagramAuthError, match="INSTAGRAM_APP_ID"):
            InstagramAuthClient(app_secret="secret", http_client=MagicMock())

    def test_raises_when_no_app_secret(self):
        with pytest.raises(InstagramAuthError, match="INSTAGRAM_APP_SECRET"):
            InstagramAuthClient(app_id="id", http_client=MagicMock())

    def test_reads_app_id_from_env(self, monkeypatch):
        monkeypatch.setenv("INSTAGRAM_APP_ID", "env-app-id")
        monkeypatch.setenv("INSTAGRAM_APP_SECRET", "env-secret")
        client = InstagramAuthClient(http_client=MagicMock())
        assert client.app_id == "env-app-id"
        assert client.app_secret == "env-secret"


# ---------------------------------------------------------------------------
# exchange_short_lived_token
# ---------------------------------------------------------------------------

class TestExchangeShortLivedToken:
    def test_returns_token_info_on_success(self):
        http = _mock_http_client({
            "access_token": "long-lived-token",
            "token_type": "bearer",
            "expires_in": 5183944,
        })
        client = _client(http)
        result = client.exchange_short_lived_token("short-token")

        assert result.access_token == "long-lived-token"
        assert result.token_type == "bearer"
        assert result.expires_at is not None
        assert result.expires_at > time.time()

    def test_passes_correct_params(self):
        http = _mock_http_client({
            "access_token": "tok",
            "token_type": "bearer",
            "expires_in": 100,
        })
        client = _client(http)
        client.exchange_short_lived_token("my-short-token")

        call_kwargs = http.get.call_args
        params = call_kwargs[1]["params"]  # keyword arg `params`
        assert params["grant_type"] == "fb_exchange_token"
        assert params["client_id"] == "test-app-id"
        assert params["client_secret"] == "test-app-secret"
        assert params["fb_exchange_token"] == "my-short-token"

    def test_raises_on_graph_api_error(self):
        http = _mock_http_client({
            "error": {"code": 190, "message": "Invalid OAuth access token."}
        })
        client = _client(http)
        with pytest.raises(InstagramAuthError, match="190"):
            client.exchange_short_lived_token("bad-token")

    def test_raises_when_access_token_missing(self):
        http = _mock_http_client({"unexpected": "shape"})
        client = _client(http)
        with pytest.raises(InstagramAuthError, match="access_token"):
            client.exchange_short_lived_token("short-token")

    def test_raises_on_json_parse_failure(self):
        response = MagicMock()
        response.json.side_effect = ValueError("not json")
        http = MagicMock()
        http.get.return_value = response
        client = _client(http)
        with pytest.raises(InstagramAuthError, match="failed to parse JSON"):
            client.exchange_short_lived_token("short-token")

    def test_no_expiry_when_expires_in_absent(self):
        http = _mock_http_client({"access_token": "tok", "token_type": "bearer"})
        client = _client(http)
        result = client.exchange_short_lived_token("short-token")
        assert result.expires_at is None


# ---------------------------------------------------------------------------
# refresh_long_lived_token
# ---------------------------------------------------------------------------

class TestRefreshLongLivedToken:
    def test_returns_fresh_token(self):
        http = _mock_http_client({
            "access_token": "refreshed-token",
            "token_type": "bearer",
            "expires_in": 5183944,
        })
        client = _client(http)
        result = client.refresh_long_lived_token("old-long-lived-token")

        assert result.access_token == "refreshed-token"
        assert result.expires_at > time.time()

    def test_passes_old_token_as_fb_exchange_token(self):
        http = _mock_http_client({
            "access_token": "new-tok",
            "token_type": "bearer",
            "expires_in": 100,
        })
        client = _client(http)
        client.refresh_long_lived_token("old-tok")

        params = http.get.call_args[1]["params"]
        assert params["fb_exchange_token"] == "old-tok"

    def test_raises_on_graph_api_error(self):
        http = _mock_http_client({
            "error": {"code": 463, "message": "Session has expired."}
        })
        client = _client(http)
        with pytest.raises(InstagramAuthError, match="463"):
            client.refresh_long_lived_token("expired-token")


# ---------------------------------------------------------------------------
# token_from_env
# ---------------------------------------------------------------------------

class TestTokenFromEnv:
    def test_returns_token_info_from_env(self, monkeypatch):
        monkeypatch.setenv("INSTAGRAM_ACCESS_TOKEN", "env-tok")
        client = _client(MagicMock())
        result = client.token_from_env()
        assert result.access_token == "env-tok"

    def test_raises_when_env_var_missing(self, monkeypatch):
        monkeypatch.delenv("INSTAGRAM_ACCESS_TOKEN", raising=False)
        client = _client(MagicMock())
        with pytest.raises(InstagramAuthError, match="INSTAGRAM_ACCESS_TOKEN"):
            client.token_from_env()


# ---------------------------------------------------------------------------
# ensure_valid_token
# ---------------------------------------------------------------------------

class TestEnsureValidToken:
    def test_returns_same_token_when_plenty_of_time_left(self):
        far_future = time.time() + 60 * 24 * 3600  # 60 days
        token = TokenInfo(access_token="tok", expires_at=far_future)
        http = _mock_http_client({})
        client = _client(http)
        result = client.ensure_valid_token(token)
        assert result is token
        http.get.assert_not_called()

    def test_refreshes_when_expiry_within_threshold(self):
        soon = time.time() + 3600  # 1 hour — less than 7-day default threshold
        token = TokenInfo(access_token="old-tok", expires_at=soon)
        http = _mock_http_client({
            "access_token": "new-tok",
            "token_type": "bearer",
            "expires_in": 5000000,
        })
        client = _client(http)
        result = client.ensure_valid_token(token)
        assert result.access_token == "new-tok"

    def test_raises_when_token_already_expired(self):
        expired = time.time() - 1
        token = TokenInfo(access_token="tok", expires_at=expired)
        client = _client(MagicMock())
        with pytest.raises(InstagramAuthError, match="already expired"):
            client.ensure_valid_token(token)

    def test_no_refresh_when_no_expiry_info(self):
        token = TokenInfo(access_token="tok", expires_at=None)
        http = _mock_http_client({})
        client = _client(http)
        result = client.ensure_valid_token(token)
        assert result is token
        http.get.assert_not_called()


# ---------------------------------------------------------------------------
# Context manager
# ---------------------------------------------------------------------------

class TestContextManager:
    def test_close_called_on_exit(self):
        http = MagicMock()
        client = InstagramAuthClient(
            app_id="id", app_secret="secret", http_client=http
        )
        # Using own client → close() should call http.close()
        client._owns_client = True
        with client:
            pass
        http.close.assert_called_once()


# ---------------------------------------------------------------------------
# build_oauth_url
# ---------------------------------------------------------------------------

class TestBuildOAuthUrl:
    def test_contains_app_id(self):
        url = build_oauth_url(app_id="my-app-123")
        assert "my-app-123" in url

    def test_default_scopes_present(self):
        url = build_oauth_url(app_id="app")
        assert "instagram_basic" in url
        assert "instagram_content_publish" in url
        assert "pages_read_engagement" in url

    def test_custom_scopes(self):
        url = build_oauth_url(app_id="app", scopes=["instagram_basic"])
        assert "instagram_basic" in url
        assert "instagram_content_publish" not in url

    def test_redirect_uri_encoded(self):
        url = build_oauth_url(app_id="app", redirect_uri="https://example.com/cb")
        assert "example.com" in url

    def test_raises_without_app_id(self, monkeypatch):
        monkeypatch.delenv("INSTAGRAM_APP_ID", raising=False)
        with pytest.raises(InstagramAuthError, match="INSTAGRAM_APP_ID"):
            build_oauth_url()

    def test_reads_app_id_from_env(self, monkeypatch):
        monkeypatch.setenv("INSTAGRAM_APP_ID", "env-app")
        url = build_oauth_url()
        assert "env-app" in url
