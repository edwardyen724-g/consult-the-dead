"""Fetch source content from URLs and clean HTML to plain text."""

import re
import time
from pathlib import Path

import httpx


class FetchError(Exception):
    """Raised when a source URL cannot be fetched after retries."""


def clean_html(html: str) -> str:
    """Strip HTML tags, scripts, styles, and navigation to plain text."""
    # Remove script and style blocks
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML comments
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    # Remove nav, header, footer blocks
    text = re.sub(r"<(nav|header|footer)[^>]*>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Replace block-level tags with newlines
    text = re.sub(r"<(p|div|br|h[1-6]|li|tr)[^>]*/?>", "\n", text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode common HTML entities
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&quot;", '"').replace("&#39;", "'").replace("&nbsp;", " ")
    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def fetch_source(
    url: str,
    output_path: Path,
    timeout: float = 30.0,
    retries: int = 3,
    retry_delay: float = 1.0,
) -> str:
    """Fetch a URL, clean it to plain text, and save to a file.

    Retries on transient network errors and 5xx server errors.  On
    permanent failure a :class:`FetchError` is raised with a message
    that includes the URL, the HTTP status code (if any), and the
    attempt count so callers can log or surface a useful diagnostic.

    Args:
        url: The URL to fetch.
        output_path: Destination file; parent directories are created
            automatically.
        timeout: Per-request timeout in seconds.
        retries: Total number of attempts (must be >= 1).
        retry_delay: Seconds to wait between attempts.

    Returns:
        The cleaned plain-text content that was written to *output_path*.

    Raises:
        FetchError: If all attempts fail.
    """
    if retries < 1:
        raise ValueError(f"retries must be >= 1, got {retries}")

    headers = {
        "User-Agent": "FrameworkForge/0.1 (research tool)"
    }

    last_exc: Exception | None = None

    for attempt in range(1, retries + 1):
        try:
            response = httpx.get(
                url,
                headers=headers,
                timeout=timeout,
                follow_redirects=True,
            )
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(retry_delay)
            continue
        except httpx.HTTPStatusError as exc:
            # Retry on 5xx; treat 4xx as permanent
            if exc.response.status_code >= 500 and attempt < retries:
                last_exc = exc
                time.sleep(retry_delay)
                continue
            raise FetchError(
                f"HTTP {exc.response.status_code} fetching {url!r} "
                f"(attempt {attempt}/{retries})"
            ) from exc
        except httpx.RequestError as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(retry_delay)
            continue

        # Successful response — process and persist
        content_type = response.headers.get("content-type", "")
        if "html" in content_type:
            text = clean_html(response.text)
        else:
            text = response.text

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(text, encoding="utf-8")
        return text

    raise FetchError(
        f"Failed to fetch {url!r} after {retries} attempt(s): {last_exc}"
    ) from last_exc
