"""Instagram Graph API — Reel upload script.

Upload flow
-----------
The Instagram Graph API uses a two-step publish process for Reels:

1. Create a media container — POST /{ig-user-id}/media
   Provide ``media_type=REELS``, a publicly accessible ``video_url``, a caption, and
   optional share-to-feed settings.  The API responds with a container ID.

2. Poll for readiness — GET /{container-id}?fields=status_code
   The container moves through ``IN_PROGRESS`` before becoming ``FINISHED``.
   ``ERROR`` is terminal; ``PUBLISHED`` means another client already published it.

3. Publish — POST /{ig-user-id}/media_publish
   Provide ``creation_id={container-id}``.  The API returns the media ID of the
   published Reel.

Required environment variables
-------------------------------
INSTAGRAM_USER_ID        — Instagram-scoped user ID (IG-USER-ID)

Optional environment variables
-------------------------------
INSTAGRAM_API_VERSION    — Graph API version, e.g. ``v19.0`` (default: ``v19.0``)
INSTAGRAM_ACCESS_TOKEN   — Pre-existing long-lived token (used when no token is passed)
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Optional

import httpx

from .auth import InstagramAuthError, TokenInfo, _graph_url

_DEFAULT_POLL_INTERVAL = 5   # seconds between status checks
_DEFAULT_POLL_TIMEOUT  = 300 # seconds before giving up on container readiness


class ReelUploadError(RuntimeError):
    """Raised when the reel upload or publish step fails."""


@dataclass
class ReelUploadResult:
    """Result returned after a successful reel publish."""

    media_id: str
    container_id: str
    ig_user_id: str


@dataclass
class ReelSpec:
    """Specification for a single Reel to upload.

    Parameters
    ----------
    video_url:
        Publicly accessible URL of the video file.  Must be a direct link (not a
        redirect) and reachable by Facebook's servers.
    caption:
        Caption text for the Reel (max ~2 200 characters).
    share_to_feed:
        If ``True`` the Reel also appears on the creator's feed grid.
    cover_url:
        Optional URL of a cover image for the Reel thumbnail.
    """

    video_url: str
    caption: str = ""
    share_to_feed: bool = True
    cover_url: Optional[str] = None


class ReelUploader:
    """Upload and publish a Reel via the Instagram Graph API.

    Parameters
    ----------
    ig_user_id:
        Instagram-scoped user ID.  Defaults to ``INSTAGRAM_USER_ID`` env var.
    api_version:
        Graph API version, e.g. ``v19.0``.  Defaults to ``INSTAGRAM_API_VERSION``
        env var or ``v19.0``.
    poll_interval:
        Seconds between container-status poll requests.
    poll_timeout:
        Maximum seconds to wait for the container to become ``FINISHED``.
    http_client:
        Optional pre-built ``httpx.Client``.  Useful for testing.
    """

    def __init__(
        self,
        ig_user_id: Optional[str] = None,
        api_version: Optional[str] = None,
        poll_interval: float = _DEFAULT_POLL_INTERVAL,
        poll_timeout: float = _DEFAULT_POLL_TIMEOUT,
        http_client: Optional[httpx.Client] = None,
    ) -> None:
        self.ig_user_id = ig_user_id or os.environ.get("INSTAGRAM_USER_ID")
        if not self.ig_user_id:
            raise ReelUploadError("INSTAGRAM_USER_ID is not set")

        self.api_version = api_version or os.environ.get(
            "INSTAGRAM_API_VERSION", "v19.0"
        )
        self.poll_interval = poll_interval
        self.poll_timeout = poll_timeout

        self._owns_client = http_client is None
        self._http = http_client or httpx.Client(timeout=60)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def upload(self, spec: ReelSpec, token: TokenInfo) -> ReelUploadResult:
        """Upload and publish a Reel.

        Parameters
        ----------
        spec:
            Reel content specification.
        token:
            A valid Instagram access token.

        Returns
        -------
        ReelUploadResult
            Contains the published media ID and container ID.
        """
        container_id = self._create_container(spec, token)
        self._wait_for_container(container_id, token)
        media_id = self._publish_container(container_id, token)
        return ReelUploadResult(
            media_id=media_id,
            container_id=container_id,
            ig_user_id=self.ig_user_id,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _create_container(self, spec: ReelSpec, token: TokenInfo) -> str:
        """Step 1 — create the media container and return its ID."""
        url = _graph_url(f"/{self.ig_user_id}/media", self.api_version)
        payload: dict[str, object] = {
            "media_type": "REELS",
            "video_url": spec.video_url,
            "caption": spec.caption,
            "share_to_feed": str(spec.share_to_feed).lower(),
            "access_token": token.access_token,
        }
        if spec.cover_url:
            payload["cover_url"] = spec.cover_url

        response = self._http.post(url, data=payload)
        data = self._parse_response(response, context="create_container")
        container_id = data.get("id")
        if not container_id:
            raise ReelUploadError(
                f"create_container: 'id' missing in response: {data}"
            )
        return str(container_id)

    def _wait_for_container(self, container_id: str, token: TokenInfo) -> None:
        """Step 2 — poll until container status is FINISHED."""
        url = _graph_url(f"/{container_id}", self.api_version)
        params = {
            "fields": "status_code,status",
            "access_token": token.access_token,
        }
        deadline = time.time() + self.poll_timeout
        status_code = ""
        while time.time() < deadline:
            response = self._http.get(url, params=params)
            data = self._parse_response(response, context="poll_container_status")
            status_code = data.get("status_code", "")

            if status_code == "FINISHED":
                return
            if status_code == "ERROR":
                raise ReelUploadError(
                    f"Container {container_id} processing failed: {data.get('status')}"
                )
            if status_code == "PUBLISHED":
                raise ReelUploadError(
                    f"Container {container_id} was already published by another client."
                )
            # IN_PROGRESS or unknown — keep waiting
            time.sleep(self.poll_interval)

        raise ReelUploadError(
            f"Container {container_id} did not reach FINISHED within "
            f"{self.poll_timeout}s (last status_code={status_code!r})"
        )

    def _publish_container(self, container_id: str, token: TokenInfo) -> str:
        """Step 3 — publish the container and return the media ID."""
        url = _graph_url(f"/{self.ig_user_id}/media_publish", self.api_version)
        payload = {
            "creation_id": container_id,
            "access_token": token.access_token,
        }
        response = self._http.post(url, data=payload)
        data = self._parse_response(response, context="publish_container")
        media_id = data.get("id")
        if not media_id:
            raise ReelUploadError(
                f"publish_container: 'id' missing in response: {data}"
            )
        return str(media_id)

    @staticmethod
    def _parse_response(response: httpx.Response, *, context: str) -> dict:
        """Parse a Graph API response, raising on error."""
        try:
            data = response.json()
        except Exception as exc:
            raise ReelUploadError(
                f"{context}: failed to parse JSON — {exc}"
            ) from exc

        if "error" in data:
            err = data["error"]
            raise ReelUploadError(
                f"{context}: Graph API error {err.get('code')} — {err.get('message')}"
            )
        return data

    def __enter__(self) -> "ReelUploader":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def close(self) -> None:
        if self._owns_client:
            self._http.close()


# ------------------------------------------------------------------
# CLI entry point
# ------------------------------------------------------------------

def main() -> None:  # pragma: no cover
    """Minimal CLI wrapper — invoked as ``python -m scripts.instagram.upload_reel``.

    Environment variables control credentials (see module docstring).
    Pass the video URL and caption as positional CLI arguments:

        python -m scripts.instagram.upload_reel \\
            https://cdn.example.com/reel.mp4 \\
            "Should you pivot or persist? Here's what history says."
    """
    import sys

    if len(sys.argv) < 2:
        print(
            "Usage: python -m scripts.instagram.upload_reel <video_url> [caption]",
            file=sys.stderr,
        )
        sys.exit(1)

    video_url = sys.argv[1]
    caption = sys.argv[2] if len(sys.argv) > 2 else ""

    from .auth import InstagramAuthClient

    with InstagramAuthClient() as auth_client:
        token = auth_client.token_from_env()

    with ReelUploader() as uploader:
        spec = ReelSpec(video_url=video_url, caption=caption)
        result = uploader.upload(spec, token)

    print(f"Published! media_id={result.media_id} container_id={result.container_id}")


if __name__ == "__main__":  # pragma: no cover
    main()
