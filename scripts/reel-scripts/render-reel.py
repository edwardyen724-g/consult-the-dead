#!/usr/bin/env python3
"""render-reel.py — Render a Verdict Reel MP4 from reel JSON + WAV audio.

Takes the reel script JSON produced by generate-reel-scripts.ts and the WAV
voiceover produced by synthesize-voice.py, and outputs a 9:16 MP4 with
on-brand kinetic text captions and the voiceover audio track.

Visual spec (Phase 3 handoff contract):
  - 1080×1920 px, 30 fps, 9:16 Instagram Reels aspect ratio
  - Background: Agora dark (#0e0904)
  - Text: serif headline + monospace labels, brand accent colours
  - Captions timed to voiceover segments (word-rate estimate)
  - No AI-avatar talking heads, no stock footage
  - ffmpeg is the only binary dependency

Usage
-----
  python render-reel.py reel.json voiceover.wav -o output.mp4

  # Dry-run: print timing plan without calling ffmpeg
  python render-reel.py reel.json voiceover.wav --dry-run

  # Override accent colour
  python render-reel.py reel.json voiceover.wav -o out.mp4 --accent '#6a7abf'

Reel JSON format (from generate-reel-scripts.ts)
-------------------------------------------------
{
  "slug": "...",
  "articleTitle": "...",
  "frameworkSlug": "...",
  "estimatedDurationSeconds": 28,
  "hook": { "voiceover": "...", "caption": "..." },
  "councilPass": [{ "mind": "Name", "line": "..." }, ...],
  "consensus": "...",
  "cta": "...",
  "captions": [...]
}
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

# Video dimensions (9:16 Instagram Reels)
WIDTH = 1080
HEIGHT = 1920
FPS = 30

# Agora brand palette (from globals.css / preview-image.tsx)
BG_COLOR = "0x0e0904"  # ffmpeg hex format
TEXT_COLOR = "0xecdbb6"  # parchment
TEXT_DIM = "0xa89878"  # dimmed parchment for labels
DEFAULT_ACCENT = "0xc9924e"  # default Athenian clay

# Accent colours per framework slug (matches ACCENT_COLORS in preview-image.tsx)
FRAMEWORK_ACCENTS: dict[str, str] = {
    "isaac-newton": "0x6a7abf",
    "marie-curie": "0x8a9a4a",
    "niccolo-machiavelli": "0xc9664e",
    "nikola-tesla": "0x4aadbd",
    "leonardo-da-vinci": "0xb09040",
    "sun-tzu": "0x5a8a5a",
    "marcus-aurelius": "0xb08050",
    "benjamin-franklin": "0xd4a017",
    "cicero": "0xb03a3a",
    "epictetus": "0xc8a878",
    "thomas-edison": "0xe0a020",
    "archimedes": "0x3a8ab0",
    "john-d-rockefeller": "0x2f6b4a",
    "harriet-tubman": "0x7a4aa0",
    "ada-lovelace": "0xa888d0",
    "catherine-the-great": "0xd4a830",
    "alexander-the-great": "0xb07840",
    "cleopatra-vii": "0x2f8085",
    "abraham-lincoln": "0x4a6dbf",
    "andrew-carnegie": "0x5a7080",
    "florence-nightingale": "0xcf8a8e",
    "frederick-douglass": "0xb86840",
    "julius-caesar": "0x8f3a4a",
    "napoleon-bonaparte": "0x3a5fa8",
    "seneca": "0x7d8c5e",
    "steve-jobs": "0x5a8fb8",
    "galileo-galilei": "0x5b9bd5",
    "socrates": "0xc9924e",
}

# Words-per-second for spoken voiceover (must match synthesize-voice.py)
_WORDS_PER_SECOND = 2.5
_PAUSE_AFTER_HOOK = 0.4
_PAUSE_BETWEEN_COUNCIL = 0.5
_PAUSE_AFTER_COUNCIL = 0.5
_PAUSE_AFTER_CONSENSUS = 0.3

# ffmpeg font fallback chain (macOS + Linux)
_FONT_CANDIDATES_SERIF = [
    "/System/Library/Fonts/Supplemental/Times New Roman.ttf",  # macOS
    "/Library/Fonts/Times New Roman.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/dejavu/DejaVuSerif.ttf",
]
_FONT_CANDIDATES_MONO = [
    "/System/Library/Fonts/Menlo.ttc",  # macOS
    "/System/Library/Fonts/Monaco.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/dejavu/DejaVuSansMono.ttf",
]


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────


def _find_font(candidates: list[str], fallback: str = "serif") -> str:
    """Return the first font file that exists, or the fallback name."""
    for path in candidates:
        if Path(path).exists():
            return path
    return fallback


def _resolve_accent(framework_slug: str | None, override: str | None) -> str:
    """Return the ffmpeg-format accent colour for the given framework slug."""
    if override:
        # Accept CSS hex (#rrggbb) or bare hex; convert to ffmpeg 0xRRGGBB
        colour = override.lstrip("#")
        return f"0x{colour.upper()}"
    if framework_slug:
        slug = framework_slug.lower().strip()
        if slug in FRAMEWORK_ACCENTS:
            return FRAMEWORK_ACCENTS[slug]
    return DEFAULT_ACCENT


def _segment_duration(text: str) -> float:
    """Estimate spoken duration (seconds) from word count."""
    words = len(text.split())
    return max(0.5, words / _WORDS_PER_SECOND)


def _pause_after(label: str, next_label: str | None) -> float:
    """Return silence duration inserted after this segment."""
    if next_label is None:
        return 0.0
    if label == "hook":
        return _PAUSE_AFTER_HOOK
    if label.startswith("council"):
        return (
            _PAUSE_BETWEEN_COUNCIL
            if next_label.startswith("council")
            else _PAUSE_AFTER_COUNCIL
        )
    if label == "consensus":
        return _PAUSE_AFTER_CONSENSUS
    return 0.0


def _extract_text(value: Any, fallback_key: str = "line") -> str:
    """Extract spoken text from a reel field (string or dict)."""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for key in ("voiceover", fallback_key, "text"):
            if value.get(key):
                return str(value[key]).strip()
    return ""


# ──────────────────────────────────────────────────────────────────────────────
# Reel JSON loading
# ──────────────────────────────────────────────────────────────────────────────


class ReelError(ValueError):
    """Raised for invalid reel JSON or render failures."""


def load_reel_json(path: str | Path) -> dict[str, Any]:
    """Load and basic-validate a reel script JSON file."""
    p = Path(path)
    if not p.exists():
        raise ReelError(f"Reel JSON not found: {p}")
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ReelError(f"Malformed JSON in {p}: {exc}") from exc
    if not isinstance(data, dict):
        raise ReelError("Reel JSON must be a JSON object")
    if not data.get("slug"):
        raise ReelError("Reel JSON missing required field: slug")
    if "hook" not in data:
        raise ReelError("Reel JSON missing required field: hook")
    return data


# ──────────────────────────────────────────────────────────────────────────────
# Timing plan
# ──────────────────────────────────────────────────────────────────────────────


class Segment:
    """A single timed text segment in the reel."""

    __slots__ = ("label", "display_label", "text", "start", "duration")

    def __init__(
        self,
        label: str,
        display_label: str,
        text: str,
        start: float,
        duration: float,
    ) -> None:
        self.label = label
        self.display_label = display_label
        self.text = text
        self.start = start
        self.duration = duration

    @property
    def end(self) -> float:
        return self.start + self.duration


def build_timing_plan(reel: dict[str, Any]) -> list[Segment]:
    """Build the ordered list of timed text segments from a reel dict."""
    segments: list[Segment] = []

    # Collect raw (label, display_label, text) triples
    raw: list[tuple[str, str, str]] = []

    hook_text = _extract_text(reel.get("hook", ""), fallback_key="voiceover")
    if hook_text:
        raw.append(("hook", "↯ HOOK", hook_text))

    for beat in reel.get("councilPass", []):
        mind = beat.get("mind", "Council") if isinstance(beat, dict) else "Council"
        text = _extract_text(beat, fallback_key="line")
        if text:
            raw.append((f"council:{mind}", mind.upper(), text))

    consensus_text = _extract_text(reel.get("consensus", ""), fallback_key="voiceover")
    if consensus_text:
        raw.append(("consensus", "◆ CONSENSUS", consensus_text))

    cta_text = _extract_text(reel.get("cta", ""), fallback_key="voiceover")
    if cta_text:
        raw.append(("cta", "→ READ MORE", cta_text))

    # Build timed segments
    clock = 0.0
    for i, (label, display_label, text) in enumerate(raw):
        dur = _segment_duration(text)
        next_label = raw[i + 1][0] if i + 1 < len(raw) else None
        pause = _pause_after(label, next_label)
        segments.append(Segment(label, display_label, text, clock, dur))
        clock += dur + pause

    return segments


def print_timing_plan(reel: dict[str, Any], segments: list[Segment]) -> None:
    """Print a human-readable timing plan for dry-run mode."""
    slug = reel.get("slug", "unknown")
    total = segments[-1].end if segments else 0.0
    print(f"\n=== Reel render plan: {slug} ===\n")
    print(f"{'START':>7}  {'END':>6}  {'DUR':>5}  SEGMENT")
    print(f"{'─'*7}  {'─'*6}  {'─'*5}  {'─'*40}")
    for seg in segments:
        print(
            f"{seg.start:7.2f}s  {seg.end:5.2f}s  {seg.duration:4.1f}s  "
            f"[{seg.display_label}] {seg.text[:55]}{'…' if len(seg.text) > 55 else ''}"
        )
    print(f"\nEstimated total duration: {total:.1f}s (target 25–40s)")
    print()


# ──────────────────────────────────────────────────────────────────────────────
# ffmpeg filter graph construction
# ──────────────────────────────────────────────────────────────────────────────


def _escape_drawtext(text: str) -> str:
    """Escape text for ffmpeg drawtext filter value."""
    # ffmpeg drawtext special characters: \ : ' ( )
    text = text.replace("\\", "\\\\")
    text = text.replace("'", "’")  # replace ASCII apostrophe with curly
    text = text.replace(":", r"\:")
    return text


def _wrap_text(text: str, max_chars: int = 38) -> str:
    """Wrap text to multiple lines using ffmpeg drawtext newline escape."""
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        if current and len(current) + 1 + len(word) > max_chars:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip() if current else word
    if current:
        lines.append(current)
    return r"\n".join(_escape_drawtext(line) for line in lines)


def build_filter_graph(
    segments: list[Segment],
    total_duration: float,
    accent: str,
    font_serif: str,
    font_mono: str,
) -> str:
    """Build the ffmpeg complex filter graph string for the reel."""
    filters: list[str] = []

    # Brand header: "CONSULT THE DEAD" — always visible
    header_text = _escape_drawtext("CONSULT THE DEAD")
    filters.append(
        f"drawtext="
        f"fontfile={font_mono}:"
        f"text={header_text}:"
        f"fontcolor={TEXT_DIM}:"
        f"fontsize=32:"
        f"x=(w-text_w)/2:"
        f"y=120:"
        f"letterspace=8"
    )

    # Separator line (simulate with a subtitle line)
    for seg in segments:
        t_start = seg.start
        t_end = seg.end
        enable = f"between(t\\,{t_start:.3f}\\,{t_end:.3f})"

        # Label chip (monospace, accent colour, upper-left quadrant)
        label_text = _escape_drawtext(seg.display_label)
        filters.append(
            f"drawtext="
            f"fontfile={font_mono}:"
            f"text={label_text}:"
            f"fontcolor={accent}:"
            f"fontsize=28:"
            f"x=(w-text_w)/2:"
            f"y=760:"
            f"enable={enable}:"
            f"letterspace=5"
        )

        # Main body text (serif, large, centred)
        body_text = _wrap_text(seg.text, max_chars=30)
        filters.append(
            f"drawtext="
            f"fontfile={font_serif}:"
            f"text={body_text}:"
            f"fontcolor={TEXT_COLOR}:"
            f"fontsize=62:"
            f"x=(w-text_w)/2:"
            f"y=820:"
            f"line_spacing=14:"
            f"enable={enable}"
        )

    return ",".join(filters)


# ──────────────────────────────────────────────────────────────────────────────
# Rendering
# ──────────────────────────────────────────────────────────────────────────────


def get_wav_duration(wav_path: Path) -> float | None:
    """Use ffprobe to get WAV duration in seconds, or None on failure."""
    probe_cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(wav_path),
    ]
    try:
        result = subprocess.run(
            probe_cmd, capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return float(result.stdout.strip())
    except (ValueError, subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return None


def render_reel(
    reel: dict[str, Any],
    wav_path: Path,
    output_path: Path,
    accent: str,
    verbose: bool = False,
) -> None:
    """Render the Verdict Reel MP4 using ffmpeg.

    Parameters
    ----------
    reel:
        Parsed reel script dictionary.
    wav_path:
        Path to the WAV voiceover audio file.
    output_path:
        Destination MP4 path.
    accent:
        ffmpeg-format hex accent colour (e.g. '0x6a7abf').
    verbose:
        If True, print the ffmpeg command before running it.
    """
    if not shutil.which("ffmpeg"):
        raise ReelError(
            "ffmpeg is not installed or not on PATH. "
            "Install with: brew install ffmpeg  (macOS) or  apt install ffmpeg  (Linux)"
        )

    if not wav_path.exists():
        raise ReelError(f"WAV audio file not found: {wav_path}")

    # Resolve fonts
    font_serif = _find_font(_FONT_CANDIDATES_SERIF, fallback="serif")
    font_mono = _find_font(_FONT_CANDIDATES_MONO, fallback="monospace")

    # Build timing plan
    segments = build_timing_plan(reel)
    if not segments:
        raise ReelError("Reel has no renderable segments — check hook/councilPass/consensus")

    # Use actual WAV duration if available, else fall back to estimate
    audio_duration = get_wav_duration(wav_path)
    total_duration = audio_duration if audio_duration is not None else segments[-1].end + 0.5

    # Build filter graph
    vf = build_filter_graph(segments, total_duration, accent, font_serif, font_mono)

    # Output directory
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",  # overwrite without asking
        "-f", "lavfi",
        "-i", f"color=c={BG_COLOR}:size={WIDTH}x{HEIGHT}:rate={FPS}",
        "-i", str(wav_path),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        str(output_path),
    ]

    if verbose:
        print("ffmpeg command:")
        print("  " + " ".join(cmd))
        print()

    try:
        result = subprocess.run(
            cmd,
            capture_output=not verbose,
            text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired as exc:
        raise ReelError("ffmpeg render timed out after 5 minutes") from exc
    except FileNotFoundError as exc:
        raise ReelError("ffmpeg binary not found") from exc

    if result.returncode != 0:
        stderr_snippet = (result.stderr or "")[-800:] if not verbose else ""
        raise ReelError(
            f"ffmpeg exited with code {result.returncode}.\n{stderr_snippet}"
        )

    print(f"Rendered: {output_path}")
    print(f"Duration: {total_duration:.1f}s  |  Size: {output_path.stat().st_size // 1024} KB")


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="render-reel",
        description=(
            "Render a Verdict Reel MP4 from a reel JSON script + WAV voiceover.\n\n"
            "Requires ffmpeg on PATH.  Outputs a 9:16 (1080x1920) MP4 with\n"
            "on-brand kinetic text captions and the voiceover audio track."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "reel_json",
        metavar="REEL_JSON",
        help="Path to reel script JSON (from generate-reel-scripts.ts).",
    )
    parser.add_argument(
        "wav_audio",
        metavar="WAV_AUDIO",
        help="Path to WAV voiceover (from synthesize-voice.py).",
    )
    parser.add_argument(
        "--output", "-o",
        default=None,
        metavar="PATH",
        help=(
            "Output MP4 path. Defaults to <slug>-reel.mp4 in the current directory."
        ),
    )
    parser.add_argument(
        "--accent",
        default=None,
        metavar="HEX",
        help=(
            "Override accent colour as CSS hex (e.g. '#6a7abf'). "
            "Defaults to the framework's brand colour from the built-in palette."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the timing plan without calling ffmpeg.",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print ffmpeg command and stderr.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        reel = load_reel_json(args.reel_json)
    except ReelError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    # Resolve output path
    if args.output:
        output_path = Path(args.output)
    else:
        slug = reel.get("slug", "reel")
        output_path = Path(f"{slug}-reel.mp4")

    # Resolve accent
    accent = _resolve_accent(reel.get("frameworkSlug"), args.accent)

    # Dry-run mode
    if args.dry_run:
        segments = build_timing_plan(reel)
        print_timing_plan(reel, segments)
        return 0

    wav_path = Path(args.wav_audio)
    try:
        render_reel(
            reel=reel,
            wav_path=wav_path,
            output_path=output_path,
            accent=accent,
            verbose=args.verbose,
        )
    except ReelError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
