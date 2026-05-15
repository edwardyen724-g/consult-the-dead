#!/usr/bin/env python3
"""synthesize-voice.py — F5-TTS voiceover synthesis for Verdict Reel scripts.

Reads a reel script JSON file produced by generate-reel-scripts.ts and
synthesizes the voiceover audio using F5-TTS (MIT-licensed, open-source).

Falls back to Chatterbox TTS (Resemble AI, MIT) if F5-TTS is not installed.

Usage
-----
  python synthesize-voice.py path/to/reel.json \\
      --output voiceover.wav \\
      --reference-audio ~/voice-samples/edward-30s.wav

  # Dry-run: print script text + duration estimate, no TTS call
  python synthesize-voice.py path/to/reel.json --dry-run

  # Force Chatterbox even if F5-TTS is available
  python synthesize-voice.py path/to/reel.json --backend chatterbox

Reel JSON format (from generate-reel-scripts.ts)
-------------------------------------------------
{
  "slug": "...",
  "estimatedDurationSeconds": 28,
  "hook": { "voiceover": "...", "caption": "..." },
  "councilPass": [
    { "mind": "Name", "line": "...", "voiceover": "..." },   # voiceover optional
    ...
  ],
  "consensus": "..." | { "voiceover": "...", ... },
  "cta": "..." | { "voiceover": "...", ... }
}

The script accepts both the current JSON format (bare strings for consensus/cta,
.line for council beats) and a future extended format with explicit .voiceover
fields on every segment.
"""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path
from typing import Any

# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

# Words per second for spoken voiceover (matches ~150 wpm)
_WORDS_PER_SECOND = 2.5

# Silence durations inserted between segments (in seconds)
_PAUSE_AFTER_HOOK = 0.4
_PAUSE_BETWEEN_COUNCIL = 0.5
_PAUSE_AFTER_COUNCIL = 0.5
_PAUSE_AFTER_CONSENSUS = 0.3

# Sample rate for generated silence
_SAMPLE_RATE = 24_000


# ──────────────────────────────────────────────────────────────────────────────
# JSON loading + validation
# ──────────────────────────────────────────────────────────────────────────────


class ReelScriptError(ValueError):
    """Raised for malformed or invalid reel JSON."""


def load_reel_json(path: str | Path) -> dict[str, Any]:
    """Load and validate a reel script JSON file.

    Parameters
    ----------
    path:
        Filesystem path to the reel JSON file.

    Returns
    -------
    dict
        Parsed reel script object.

    Raises
    ------
    ReelScriptError
        If the file does not exist, is not valid JSON, or is missing required
        fields (``slug``, ``hook``).
    """
    p = Path(path)
    if not p.exists():
        raise ReelScriptError(f"Reel JSON file not found: {p}")
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ReelScriptError(f"Malformed JSON in {p}: {exc}") from exc

    if not isinstance(data, dict):
        raise ReelScriptError(f"Expected a JSON object, got {type(data).__name__}")
    if not data.get("slug"):
        raise ReelScriptError("Reel JSON missing required field: slug")
    if "hook" not in data:
        raise ReelScriptError("Reel JSON missing required field: hook")
    return data


# ──────────────────────────────────────────────────────────────────────────────
# Segment extraction
# ──────────────────────────────────────────────────────────────────────────────


def _extract_text(value: Any, fallback_key: str = "line") -> str:
    """Extract voiceover text from a field that may be a string or a dict.

    Accepts the current JSON format (bare string or object with .line) and the
    extended format that adds an explicit .voiceover key.
    """
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        # prefer explicit voiceover field, fall back to 'line' or 'text'
        for key in ("voiceover", fallback_key, "text"):
            if value.get(key):
                return str(value[key]).strip()
    return ""


def extract_segments(reel: dict[str, Any]) -> list[tuple[str, str]]:
    """Extract ordered (label, text) voice segments from a reel script.

    Order: hook → council beats → consensus → cta

    Parameters
    ----------
    reel:
        Parsed reel script dictionary from :func:`load_reel_json`.

    Returns
    -------
    list of (label, text) tuples
        Each tuple is a (human-readable label, spoken text) pair.  Empty
        segments are skipped.
    """
    segments: list[tuple[str, str]] = []

    # Hook
    hook_text = _extract_text(reel.get("hook", ""), fallback_key="voiceover")
    if hook_text:
        segments.append(("hook", hook_text))

    # Council pass
    council_pass = reel.get("councilPass", [])
    for beat in council_pass:
        mind = beat.get("mind", "Unknown") if isinstance(beat, dict) else "Unknown"
        text = _extract_text(beat, fallback_key="line")
        if text:
            segments.append((f"council:{mind}", text))

    # Consensus
    consensus_text = _extract_text(reel.get("consensus", ""), fallback_key="voiceover")
    if consensus_text:
        segments.append(("consensus", consensus_text))

    # CTA
    cta_text = _extract_text(reel.get("cta", ""), fallback_key="voiceover")
    if cta_text:
        segments.append(("cta", cta_text))

    return segments


# ──────────────────────────────────────────────────────────────────────────────
# Duration estimation
# ──────────────────────────────────────────────────────────────────────────────


def estimate_segment_duration(text: str) -> float:
    """Estimate spoken duration of a text segment in seconds."""
    words = len(text.split())
    return max(0.5, words / _WORDS_PER_SECOND)


def estimate_total_duration(segments: list[tuple[str, str]]) -> float:
    """Estimate total voiceover duration including inter-segment pauses.

    Uses :func:`_pause_for_index` to determine the pause inserted between
    consecutive segments.  No pause is added after the final segment.
    """
    if not segments:
        return 0.0

    total = 0.0
    for i, (_, text) in enumerate(segments):
        total += estimate_segment_duration(text)
        total += _pause_for_index(i, segments)
    return total


# ──────────────────────────────────────────────────────────────────────────────
# Dry-run output
# ──────────────────────────────────────────────────────────────────────────────


def print_dry_run(reel: dict[str, Any], segments: list[tuple[str, str]]) -> None:
    """Print reel script text and duration estimate without calling TTS."""
    slug = reel.get("slug", "unknown")
    print(f"\n=== Reel script: {slug} ===\n")
    for label, text in segments:
        print(f"[{label}]")
        print(f"  {text}")
        print(f"  (estimated: {estimate_segment_duration(text):.1f}s)")
        print()
    total = estimate_total_duration(segments)
    print(f"Estimated total voiceover duration: {total:.1f}s")
    print(f"(Reel target range: 25–40s)\n")


# ──────────────────────────────────────────────────────────────────────────────
# TTS backends
# ──────────────────────────────────────────────────────────────────────────────


def _make_silence(duration_seconds: float, sample_rate: int = _SAMPLE_RATE) -> Any:
    """Create a numpy silence array of the specified duration."""
    try:
        import numpy as np  # type: ignore[import-untyped]
    except ImportError:
        return None
    return np.zeros(int(sample_rate * duration_seconds), dtype=np.float32)


def _concatenate_with_pauses(
    audio_chunks: list[Any],
    pauses: list[float],
    sample_rate: int = _SAMPLE_RATE,
) -> Any:
    """Concatenate audio arrays with silence inserted between each chunk."""
    try:
        import numpy as np  # type: ignore[import-untyped]
    except ImportError as exc:
        raise RuntimeError("numpy is required for audio concatenation") from exc

    parts: list[Any] = []
    for i, chunk in enumerate(audio_chunks):
        parts.append(chunk)
        if i < len(pauses) and pauses[i] > 0:
            parts.append(_make_silence(pauses[i], sample_rate))
    return np.concatenate(parts) if parts else np.array([], dtype=np.float32)


def _pause_for_index(
    i: int,
    segments: list[tuple[str, str]],
) -> float:
    """Return the pause duration to insert after segment at index i."""
    if i >= len(segments) - 1:
        return 0.0
    label = segments[i][0]
    next_label = segments[i + 1][0]
    if label == "hook":
        return _PAUSE_AFTER_HOOK
    if label.startswith("council:"):
        return (
            _PAUSE_BETWEEN_COUNCIL
            if next_label.startswith("council:")
            else _PAUSE_AFTER_COUNCIL
        )
    if label == "consensus":
        return _PAUSE_AFTER_CONSENSUS
    return 0.0


def synthesize_f5(
    segments: list[tuple[str, str]],
    output_path: Path,
    reference_audio: str | None,
) -> None:
    """Synthesize voiceover using F5-TTS Python API.

    Parameters
    ----------
    segments:
        Ordered (label, text) voice segments.
    output_path:
        Destination for the merged WAV file.
    reference_audio:
        Path to a 10–30s WAV reference clip of the target voice.  Required for
        F5-TTS zero-shot voice cloning; if omitted the model uses its built-in
        default voice.

    Raises
    ------
    ImportError
        If the ``f5_tts`` package is not installed.
    RuntimeError
        If synthesis fails.
    """
    try:
        from f5_tts.api import F5TTS  # type: ignore[import-untyped]
    except ImportError as exc:
        raise ImportError(
            "f5-tts is not installed. Install with: pip install f5-tts\n"
            "Or use --backend chatterbox as an alternative."
        ) from exc

    try:
        import numpy as np  # type: ignore[import-untyped]
        import soundfile as sf  # type: ignore[import-untyped]
    except ImportError as exc:
        raise RuntimeError(
            "numpy and soundfile are required: pip install numpy soundfile"
        ) from exc

    model = F5TTS()
    sample_rate = _SAMPLE_RATE
    audio_chunks = []

    for label, text in segments:
        print(f"  Synthesizing [{label}]: {text[:60]}{'...' if len(text) > 60 else ''}")
        if reference_audio:
            wav, sr = model.infer(
                ref_file=reference_audio,
                ref_text=None,
                gen_text=text,
                seed=-1,
            )
        else:
            wav, sr = model.infer(
                ref_file=None,
                ref_text=None,
                gen_text=text,
                seed=-1,
            )
        # Resample to target sample rate if needed
        if sr != sample_rate:
            # Simple resample ratio — F5TTS output is typically 24kHz already
            resample_ratio = sample_rate / sr
            indices = np.round(np.arange(0, len(wav), 1 / resample_ratio)).astype(int)
            wav = wav[indices[indices < len(wav)]]
        audio_chunks.append(wav.astype(np.float32))

    pauses = [_pause_for_index(i, segments) for i in range(len(segments))]
    merged = _concatenate_with_pauses(audio_chunks, pauses, sample_rate)
    sf.write(str(output_path), merged, sample_rate)
    print(f"  Saved to: {output_path}")


def synthesize_chatterbox(
    segments: list[tuple[str, str]],
    output_path: Path,
    reference_audio: str | None,
) -> None:
    """Synthesize voiceover using Chatterbox TTS (Resemble AI, MIT licensed).

    Parameters
    ----------
    segments:
        Ordered (label, text) voice segments.
    output_path:
        Destination for the merged WAV file.
    reference_audio:
        Path to a WAV reference clip for voice cloning.  Chatterbox supports
        zero-shot voice cloning from a reference clip.

    Raises
    ------
    ImportError
        If ``chatterbox-tts`` is not installed.
    RuntimeError
        If synthesis fails.
    """
    try:
        from chatterbox.tts import ChatterboxTTS  # type: ignore[import-untyped]
    except ImportError as exc:
        raise ImportError(
            "chatterbox-tts is not installed. Install with: pip install chatterbox-tts\n"
            "See https://github.com/resemble-ai/chatterbox for setup."
        ) from exc

    try:
        import numpy as np  # type: ignore[import-untyped]
        import soundfile as sf  # type: ignore[import-untyped]
        import torch  # type: ignore[import-untyped]
    except ImportError as exc:
        raise RuntimeError(
            "numpy, soundfile, and torch are required: pip install numpy soundfile torch"
        ) from exc

    model = ChatterboxTTS.from_pretrained(device="cuda" if torch.cuda.is_available() else "cpu")
    sample_rate = model.sr if hasattr(model, "sr") else _SAMPLE_RATE
    audio_chunks = []

    for label, text in segments:
        print(f"  Synthesizing [{label}]: {text[:60]}{'...' if len(text) > 60 else ''}")
        wav = model.generate(
            text,
            audio_prompt_path=reference_audio,
        )
        # wav is a torch.Tensor of shape [1, samples]; flatten to numpy
        audio_np = wav.squeeze(0).cpu().numpy().astype(np.float32)
        audio_chunks.append(audio_np)

    pauses = [_pause_for_index(i, segments) for i in range(len(segments))]
    merged = _concatenate_with_pauses(audio_chunks, pauses, sample_rate)
    sf.write(str(output_path), merged, sample_rate)
    print(f"  Saved to: {output_path}")


# ──────────────────────────────────────────────────────────────────────────────
# Backend selection
# ──────────────────────────────────────────────────────────────────────────────

_BACKEND_AUTO = "auto"
_BACKEND_F5 = "f5tts"
_BACKEND_CHATTERBOX = "chatterbox"


def _is_f5tts_available() -> bool:
    try:
        import f5_tts  # type: ignore[import-untyped]  # noqa: F401
        return True
    except ImportError:
        return False


def _is_chatterbox_available() -> bool:
    try:
        import chatterbox  # type: ignore[import-untyped]  # noqa: F401
        return True
    except ImportError:
        return False


def run_synthesis(
    reel: dict[str, Any],
    output_path: Path,
    reference_audio: str | None,
    backend: str,
    dry_run: bool,
) -> None:
    """Top-level synthesis dispatcher.

    Extracts segments from ``reel``, then routes to the appropriate TTS backend
    (or prints a dry-run summary if ``dry_run`` is True).
    """
    segments = extract_segments(reel)
    if not segments:
        print(f"Warning: no voiceover segments found in reel '{reel.get('slug')}'", file=sys.stderr)
        return

    if dry_run:
        print_dry_run(reel, segments)
        return

    resolved_backend = backend
    if backend == _BACKEND_AUTO:
        if _is_f5tts_available():
            resolved_backend = _BACKEND_F5
        elif _is_chatterbox_available():
            resolved_backend = _BACKEND_CHATTERBOX
        else:
            print(
                "ERROR: Neither f5-tts nor chatterbox-tts is installed.\n"
                "Install one of:\n"
                "  pip install f5-tts          # F5-TTS (primary, MIT)\n"
                "  pip install chatterbox-tts  # Chatterbox (fallback, MIT)\n"
                "Or use --dry-run to preview the script without synthesizing.",
                file=sys.stderr,
            )
            sys.exit(1)

    print(f"Backend: {resolved_backend}")
    print(f"Slug: {reel.get('slug')}")
    print(f"Segments: {len(segments)}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    if resolved_backend == _BACKEND_F5:
        synthesize_f5(segments, output_path, reference_audio)
    elif resolved_backend == _BACKEND_CHATTERBOX:
        synthesize_chatterbox(segments, output_path, reference_audio)
    else:
        print(f"Unknown backend: {resolved_backend}", file=sys.stderr)
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="synthesize-voice",
        description=(
            "Synthesize voiceover audio from a Verdict Reel JSON script.\n\n"
            "Primary backend: F5-TTS (MIT, open-source, zero-shot voice clone from\n"
            "~30s reference audio). Install with: pip install f5-tts\n\n"
            "Fallback backend: Chatterbox (Resemble AI, MIT, zero-shot voice clone).\n"
            "Install with: pip install chatterbox-tts\n\n"
            "Use --dry-run to preview the voiceover script without running TTS."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "reel_json",
        metavar="REEL_JSON",
        help="Path to reel script JSON file (from generate-reel-scripts.ts).",
    )
    parser.add_argument(
        "--output",
        "-o",
        default=None,
        metavar="PATH",
        help=(
            "Output audio file path (WAV recommended). "
            "Defaults to <slug>-voiceover.wav in the current directory."
        ),
    )
    parser.add_argument(
        "--reference-audio",
        metavar="WAV",
        default=None,
        help=(
            "Path to a 10–30s WAV reference clip of the target voice. "
            "Used for zero-shot voice cloning in both F5-TTS and Chatterbox."
        ),
    )
    parser.add_argument(
        "--backend",
        choices=[_BACKEND_AUTO, _BACKEND_F5, _BACKEND_CHATTERBOX],
        default=_BACKEND_AUTO,
        help=(
            "TTS backend to use. 'auto' tries F5-TTS first, falls back to "
            "Chatterbox. (default: auto)"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print voiceover script and estimated duration without calling TTS.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # Load + validate reel JSON (fails fast on bad input)
    try:
        reel = load_reel_json(args.reel_json)
    except ReelScriptError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    # Resolve output path
    if args.output:
        output_path = Path(args.output)
    else:
        slug = reel.get("slug", "reel")
        output_path = Path(f"{slug}-voiceover.wav")

    try:
        run_synthesis(
            reel=reel,
            output_path=output_path,
            reference_audio=args.reference_audio,
            backend=args.backend,
            dry_run=args.dry_run,
        )
    except (ImportError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
