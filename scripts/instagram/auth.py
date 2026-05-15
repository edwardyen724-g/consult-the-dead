"""Instagram Graph API — OAuth token exchange and long-lived token management.

Token lifecycle
---------------
1. Short-lived user token (1 hour) — obtained via the Facebook/Instagram OAuth flow
   after the user grants ``instagram_basic``, ``instagram_content_publish``, and
   ``pages_read_engagement`` permissions.
2. Long-lived user token (60 days) — exchanged from the short-lived token using the
   app secret.  Must be refreshed at least once every 60 days.

All credentials are read from environment variables; nothing is hard-coded here.

Required environment variables
-------------------------------
INSTAGRAM_APP_ID         — Facebook App ID
INSTAGRAM_APP_SECRET     — Facebook App Secret
INSTAGRAM_USER_ID        — Instagram-scoped user ID (IG-USER-ID)

Optional environment variables
-------------------------------
INSTAGRAM_API_VERSION    — Graph API version, e.g. ``v19.0`` (default: ``v19.0``)
INSTAGRAM_ACCESS_TOKEN   — Pre-existing long-lived token (bypasses exchange step)
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlencode

import httpx

_GRAPH_BASE = "https://graph.facebook.com"
_DEFAULT_API_VERSION = "v19.0"


def _graph_url(path: str, api_version: Optional[str] = None) -> str:
    version = api_version or os.environ.get("INSTAGRAM_API_VERSION", _DEFAULT_API_VERSION)
    return f"{_GRAPH_BASE}/{version}{path}"


@dataclass
class TokenInfo:
    """Holds an Instagram access token and its metadata."""

    access_token: str
    token_type: str = "bearer"
    expires_at: Optional[float] = None  # Unix timestamp; None = no expiry info

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return time.time() >= self.expires_at

    @property
    def seconds_until_expiry(self) -> Optional[float]:
        if self.expires_at is None:
            return None
        return max(0.0, self.expires_at - time.time())


class InstagramAuthError(RuntimeError):
    """Raised when an Instagram Graph API auth call fails."""


class InstagramAuthClient:
    """Exchange and refresh Instagram Graph API tokens.

    Parameters
    ----------
    app_id:
        Facebook App ID.  Defaults to ``INSTAGRAM_APP_ID`` env var.
    app_secret:
        Facebook App Secret.  Defaults to ``INSTAGRAM_APP_SECRET`` env var.
    api_version:
        Graph API version string, e.g. ``v19.0``.
        Defaults to ``INSTAGRAM_API_VERSION`` env var or ``v19.0``.
    http_client:
        Optional pre-built ``httpx.Client``.  Useful for testing.
    """

    def __init__(
        self,
        app_id: Optional[str] = None,
        app_secret: Optional[str] = None,
        api_version: Optional[str] = None,
        http_client: Optional[httpx.Client] = None,
    ) -> None:
        self.app_id = app_id or os.environ.get("INSTAGRAM_APP_ID")
        self.app_secret = app_secret or os.environ.get("INSTAGRAM_APP_SECRET")
        self.api_version = api_version or os.environ.get(
            "INSTAGRAM_API_VERSION", _DEFAULT_API_VERSION
        )
        if not self.app_id:
            raise InstagramAuthError("INSTAGRAM_APP_ID is not set")
        if not self.app_secret:
            raise InstagramAuthError("INSTAGRAM_APP_SECRET is not set")

        self._owns_client = http_client is None
        self._http = http_client or httpx.Client(timeout=30)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def exchange_short_lived_token(self, short_lived_token: str) -> TokenInfo:
        """Exchange a short-lived user access token for a long-lived one.

        Parameters
        ----------
        short_lived_token:
            The short-lived token obtained from the Facebook/Instagram OAuth flow.

        Returns
        -------
        TokenInfo
            Long-lived token valid for ~60 days.
        """
        url = _graph_url("/oauth/access_token", self.api_version)
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": short_lived_token,
        }
        response = self._http.get(url, params=params)
        return self._parse_token_response(response, context="exchange_short_lived_token")

    def refresh_long_lived_token(self, long_lived_token: str) -> TokenInfo:
        """Refresh a long-lived token to extend its validity by another 60 days.

        Must be called while the existing token is still valid.

        Parameters
        ----------
        long_lived_token:
            A long-lived user access token that has not yet expired.

        Returns
        -------
        TokenInfo
            A fresh long-lived token.
        """
        url = _graph_url("/oauth/access_token", self.api_version)
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": long_lived_token,
        }
        response = self._http.get(url, params=params)
        return self._parse_token_response(response, context="refresh_long_lived_token")

    def token_from_env(self) -> TokenInfo:
        """Build a :class:`TokenInfo` from ``INSTAGRAM_ACCESS_TOKEN`` env var.

        Use this when you already have a valid long-lived token stored outside the
        process (e.g. in a secrets manager or ``.env`` file injected at runtime).
        """
        token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
        if not token:
            raise InstagramAuthError("INSTAGRAM_ACCESS_TOKEN is not set")
        return TokenInfo(access_token=token)

    def ensure_valid_token(
        self,
        token_info: TokenInfo,
        *,
        refresh_before_seconds: float = 7 * 24 * 3600,  # 7 days
    ) -> TokenInfo:
        """Return a valid token, refreshing if it expires within ``refresh_before_seconds``.

        Parameters
        ----------
        token_info:
            Current token.
        refresh_before_seconds:
            Proactively refresh when fewer than this many seconds remain before
            expiry (default: 7 days).

        Returns
        -------
        TokenInfo
            Either the same token (still valid) or a freshly refreshed one.
        """
        if token_info.is_expired:
            raise InstagramAuthError(
                "Token has already expired — cannot refresh. Obtain a new short-lived "
                "token via the OAuth flow and call exchange_short_lived_token()."
            )
        seconds_left = token_info.seconds_until_expiry
        if seconds_left is not None and seconds_left < refresh_before_seconds:
            return self.refresh_long_lived_token(token_info.access_token)
        return token_info

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _parse_token_response(self, response: httpx.Response, *, context: str) -> TokenInfo:
        """Parse a Graph API token response and raise on error."""
        try:
            data = response.json()
        except Exception as exc:
            raise InstagramAuthError(
                f"{context}: failed to parse JSON response — {exc}"
            ) from exc

        if "error" in data:
            err = data["error"]
            raise InstagramAuthError(
                f"{context}: Graph API error {err.get('code')} — {err.get('message')}"
            )

        if "access_token" not in data:
            raise InstagramAuthError(
                f"{context}: unexpected response shape — 'access_token' missing: {data}"
            )

        expires_in = data.get("expires_in")
        expires_at = (time.time() + int(expires_in)) if expires_in else None

        return TokenInfo(
            access_token=data["access_token"],
            token_type=data.get("token_type", "bearer"),
            expires_at=expires_at,
        )

    def __enter__(self) -> "InstagramAuthClient":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def close(self) -> None:
        if self._owns_client:
            self._http.close()


# ------------------------------------------------------------------
# OAuth redirect URL builder (helper for local dev / manual flow)
# ------------------------------------------------------------------

def build_oauth_url(
    app_id: Optional[str] = None,
    redirect_uri: str = "https://localhost/oauth/callback",
    scopes: Optional[list[str]] = None,
) -> str:
    """Build the Instagram OAuth authorisation URL.

    Parameters
    ----------
    app_id:
        Facebook App ID.  Defaults to ``INSTAGRAM_APP_ID`` env var.
    redirect_uri:
        Where Facebook redirects after the user grants permission.
    scopes:
        OAuth scopes to request.  Defaults to the minimal set required for
        reading profile info and publishing content.

    Returns
    -------
    str
        URL to open in a browser to start the OAuth flow.
    """
    resolved_app_id = app_id or os.environ.get("INSTAGRAM_APP_ID")
    if not resolved_app_id:
        raise InstagramAuthError("INSTAGRAM_APP_ID is not set")

    default_scopes = [
        "instagram_basic",
        "instagram_content_publish",
        "pages_read_engagement",
    ]
    params = {
        "client_id": resolved_app_id,
        "redirect_uri": redirect_uri,
        "scope": ",".join(scopes or default_scopes),
        "response_type": "code",
    }
    return f"https://www.facebook.com/dialog/oauth?{urlencode(params)}"
