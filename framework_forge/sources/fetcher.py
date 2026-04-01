"""Fetch source content from URLs and clean HTML to plain text."""

import re
from pathlib import Path

import httpx


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


def fetch_source(url: str, output_path: Path, timeout: float = 30.0) -> str:
    """Fetch a URL, clean it to plain text, and save to a file."""
    headers = {
        "User-Agent": "FrameworkForge/0.1 (research tool)"
    }
    response = httpx.get(url, headers=headers, timeout=timeout, follow_redirects=True)
    response.raise_for_status()

    content_type = response.headers.get("content-type", "")
    if "html" in content_type:
        text = clean_html(response.text)
    else:
        text = response.text

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")
    return text
