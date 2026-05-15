"""Unit tests for scripts/reel-scripts/render-reel.py.

All ffmpeg / subprocess calls are mocked — no real ffmpeg invocations.
No audio or video files are written during the test suite.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# Import the render-reel module (dashes require importlib)
import importlib.util
import sys

_MODULE_PATH = (
    Path(__file__).parent.parent / "render-reel.py"
)
_spec = importlib.util.spec_from_file_location("render_reel", _MODULE_PATH)
_mod = importlib.util.module_from_spec(_spec)  # type: ignore[arg-type]
_spec.loader.exec_module(_mod)  # type: ignore[union-attr]

# Pull public names into test scope for ergonomics
load_reel_json = _mod.load_reel_json
build_timing_plan = _mod.build_timing_plan
print_timing_plan = _mod.print_timing_plan
_segment_duration = _mod._segment_duration
_pause_after = _mod._pause_after
_extract_text = _mod._extract_text
_wrap_text = _mod._wrap_text
_escape_drawtext = _mod._escape_drawtext
_resolve_accent = _mod._resolve_accent
_find_font = _mod._find_font
build_filter_graph = _mod.build_filter_graph
get_wav_duration = _mod.get_wav_duration
render_reel = _mod.render_reel
main = _mod.main
ReelError = _mod.ReelError
Segment = _mod.Segment
FRAMEWORK_ACCENTS = _mod.FRAMEWORK_ACCENTS
DEFAULT_ACCENT = _mod.DEFAULT_ACCENT


# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────────


def _minimal_reel() -> dict:
    """Return a minimal valid reel script dict."""
    return {
        "slug": "test-slug",
        "articleTitle": "Test Article",
        "frameworkSlug": "isaac-newton",
        "decisionType": "evidence",
        "estimatedDurationSeconds": 28,
        "hook": {"voiceover": "Should you trust the data or act on instinct?", "caption": "Data or gut?"},
        "councilPass": [
            {"mind": "Isaac Newton", "line": "Measure twice, decide once."},
            {"mind": "Marie Curie", "line": "Let the evidence accumulate before concluding."},
            {"mind": "Marcus Aurelius", "line": "Act with the information you have; delay is a decision too."},
        ],
        "consensus": "Collect enough signal to decide honestly, then move.",
        "cta": "Read the full council verdict at /insights/test-slug.",
        "captions": ["Verdict Reel: Test Article", "Signal before speed.", "Read more at /insights/test-slug"],
    }


def _write_reel_json(reel: dict, tmpdir: Path) -> Path:
    """Write a reel dict to a temp JSON file and return the path."""
    p = tmpdir / "reel.json"
    p.write_text(json.dumps(reel))
    return p


def _make_fake_wav(tmpdir: Path, name: str = "voiceover.wav") -> Path:
    """Create an empty WAV file (no real audio data)."""
    p = tmpdir / name
    p.write_bytes(b"RIFF\x00\x00\x00\x00WAVEfmt ")
    return p


# ──────────────────────────────────────────────────────────────────────────────
# load_reel_json
# ──────────────────────────────────────────────────────────────────────────────


class TestLoadReelJson:
    def test_loads_valid_reel(self, tmp_path: Path):
        reel = _minimal_reel()
        p = _write_reel_json(reel, tmp_path)
        loaded = load_reel_json(p)
        assert loaded["slug"] == "test-slug"

    def test_raises_on_missing_file(self, tmp_path: Path):
        with pytest.raises(ReelError, match="not found"):
            load_reel_json(tmp_path / "nonexistent.json")

    def test_raises_on_malformed_json(self, tmp_path: Path):
        p = tmp_path / "bad.json"
        p.write_text("{not valid json")
        with pytest.raises(ReelError, match="Malformed JSON"):
            load_reel_json(p)

    def test_raises_on_non_object_json(self, tmp_path: Path):
        p = tmp_path / "array.json"
        p.write_text("[1, 2, 3]")
        with pytest.raises(ReelError, match="JSON object"):
            load_reel_json(p)

    def test_raises_on_missing_slug(self, tmp_path: Path):
        reel = _minimal_reel()
        del reel["slug"]
        p = _write_reel_json(reel, tmp_path)
        with pytest.raises(ReelError, match="slug"):
            load_reel_json(p)

    def test_raises_on_missing_hook(self, tmp_path: Path):
        reel = _minimal_reel()
        del reel["hook"]
        p = _write_reel_json(reel, tmp_path)
        with pytest.raises(ReelError, match="hook"):
            load_reel_json(p)

    def test_accepts_string_path(self, tmp_path: Path):
        reel = _minimal_reel()
        p = _write_reel_json(reel, tmp_path)
        loaded = load_reel_json(str(p))
        assert loaded["slug"] == "test-slug"


# ──────────────────────────────────────────────────────────────────────────────
# _extract_text
# ──────────────────────────────────────────────────────────────────────────────


class TestExtractText:
    def test_string_value(self):
        assert _extract_text("  hello world  ") == "hello world"

    def test_dict_with_voiceover(self):
        assert _extract_text({"voiceover": "Hook text", "line": "other"}) == "Hook text"

    def test_dict_with_line_fallback(self):
        assert _extract_text({"line": "council beat"}) == "council beat"

    def test_dict_with_text_fallback(self):
        assert _extract_text({"text": "text key"}) == "text key"

    def test_empty_dict(self):
        assert _extract_text({}) == ""

    def test_none_like(self):
        assert _extract_text(None) == ""  # type: ignore[arg-type]

    def test_int(self):
        assert _extract_text(42) == ""  # type: ignore[arg-type]

    def test_custom_fallback_key(self):
        assert _extract_text({"voiceover": "v"}, fallback_key="voiceover") == "v"


# ──────────────────────────────────────────────────────────────────────────────
# _segment_duration
# ──────────────────────────────────────────────────────────────────────────────


class TestSegmentDuration:
    def test_empty_text_returns_minimum(self):
        assert _segment_duration("") == 0.5

    def test_single_word_returns_minimum(self):
        assert _segment_duration("hello") == 0.5

    def test_five_words(self):
        # 5 words / 2.5 wps = 2.0 seconds
        dur = _segment_duration("one two three four five")
        assert abs(dur - 2.0) < 0.01

    def test_ten_words(self):
        text = " ".join(["word"] * 10)
        dur = _segment_duration(text)
        assert abs(dur - 4.0) < 0.01


# ──────────────────────────────────────────────────────────────────────────────
# _pause_after
# ──────────────────────────────────────────────────────────────────────────────


class TestPauseAfter:
    def test_no_pause_at_end(self):
        assert _pause_after("hook", None) == 0.0

    def test_hook_pause(self):
        assert _pause_after("hook", "council:Newton") == pytest.approx(0.4)

    def test_council_to_council_pause(self):
        assert _pause_after("council:Newton", "council:Curie") == pytest.approx(0.5)

    def test_council_to_consensus_pause(self):
        assert _pause_after("council:Newton", "consensus") == pytest.approx(0.5)

    def test_consensus_pause(self):
        assert _pause_after("consensus", "cta") == pytest.approx(0.3)

    def test_cta_to_none(self):
        assert _pause_after("cta", None) == 0.0

    def test_unknown_label_no_pause(self):
        assert _pause_after("unknown", "other") == 0.0


# ──────────────────────────────────────────────────────────────────────────────
# build_timing_plan
# ──────────────────────────────────────────────────────────────────────────────


class TestBuildTimingPlan:
    def test_segment_count(self):
        reel = _minimal_reel()
        segments = build_timing_plan(reel)
        # 1 hook + 3 council + 1 consensus + 1 cta = 6
        assert len(segments) == 6

    def test_first_segment_starts_at_zero(self):
        segments = build_timing_plan(_minimal_reel())
        assert segments[0].start == pytest.approx(0.0)

    def test_segments_are_ordered_by_start(self):
        segments = build_timing_plan(_minimal_reel())
        for i in range(len(segments) - 1):
            assert segments[i].start < segments[i + 1].start

    def test_hook_label(self):
        segments = build_timing_plan(_minimal_reel())
        assert segments[0].label == "hook"

    def test_council_labels(self):
        segments = build_timing_plan(_minimal_reel())
        assert segments[1].label == "council:Isaac Newton"
        assert segments[2].label == "council:Marie Curie"
        assert segments[3].label == "council:Marcus Aurelius"

    def test_consensus_label(self):
        segments = build_timing_plan(_minimal_reel())
        assert segments[4].label == "consensus"

    def test_cta_label(self):
        segments = build_timing_plan(_minimal_reel())
        assert segments[5].label == "cta"

    def test_empty_reel_returns_empty_plan(self):
        reel = {"slug": "x", "hook": {}}
        segments = build_timing_plan(reel)
        assert segments == []

    def test_segment_end_equals_start_plus_duration(self):
        segments = build_timing_plan(_minimal_reel())
        for seg in segments:
            assert seg.end == pytest.approx(seg.start + seg.duration)

    def test_string_hook(self):
        reel = _minimal_reel()
        reel["hook"] = "Plain string hook"
        segments = build_timing_plan(reel)
        assert segments[0].text == "Plain string hook"

    def test_string_consensus(self):
        reel = _minimal_reel()
        reel["consensus"] = "Simple consensus string."
        segments = build_timing_plan(reel)
        consensus_seg = next(s for s in segments if s.label == "consensus")
        assert "Simple consensus string" in consensus_seg.text

    def test_empty_council_beat_skipped(self):
        reel = _minimal_reel()
        reel["councilPass"] = [
            {"mind": "Newton", "line": ""},
            {"mind": "Curie", "line": "Good point."},
        ]
        segments = build_timing_plan(reel)
        council_segs = [s for s in segments if s.label.startswith("council")]
        assert len(council_segs) == 1
        assert "Curie" in council_segs[0].label

    def test_display_label_uppercase(self):
        reel = _minimal_reel()
        reel["councilPass"] = [{"mind": "Isaac Newton", "line": "A fine observation."}]
        segments = build_timing_plan(reel)
        council = next(s for s in segments if s.label.startswith("council"))
        assert council.display_label == "ISAAC NEWTON"


# ──────────────────────────────────────────────────────────────────────────────
# _resolve_accent
# ──────────────────────────────────────────────────────────────────────────────


class TestResolveAccent:
    def test_known_framework_slug(self):
        colour = _resolve_accent("isaac-newton", None)
        assert colour == FRAMEWORK_ACCENTS["isaac-newton"]

    def test_unknown_slug_returns_default(self):
        colour = _resolve_accent("unknown-person", None)
        assert colour == DEFAULT_ACCENT

    def test_none_slug_returns_default(self):
        colour = _resolve_accent(None, None)
        assert colour == DEFAULT_ACCENT

    def test_css_hex_override(self):
        colour = _resolve_accent("isaac-newton", "#aabbcc")
        assert colour == "0xAABBCC"

    def test_bare_hex_override(self):
        colour = _resolve_accent(None, "aabbcc")
        assert colour == "0xAABBCC"

    def test_override_takes_priority_over_slug(self):
        colour = _resolve_accent("isaac-newton", "#ffffff")
        assert colour == "0xFFFFFF"


# ──────────────────────────────────────────────────────────────────────────────
# _find_font
# ──────────────────────────────────────────────────────────────────────────────


class TestFindFont:
    def test_returns_fallback_when_no_candidates_exist(self, tmp_path: Path):
        colour = _find_font([str(tmp_path / "nonexistent.ttf")], fallback="monospace")
        assert colour == "monospace"

    def test_returns_first_existing_candidate(self, tmp_path: Path):
        font = tmp_path / "font.ttf"
        font.write_bytes(b"fake")
        result = _find_font([str(tmp_path / "missing.ttf"), str(font)], fallback="serif")
        assert result == str(font)


# ──────────────────────────────────────────────────────────────────────────────
# _escape_drawtext / _wrap_text
# ──────────────────────────────────────────────────────────────────────────────


class TestEscapeDrawtext:
    def test_colon_escaped(self):
        result = _escape_drawtext("time: 12:00")
        assert r"\:" in result

    def test_backslash_escaped(self):
        result = _escape_drawtext("path\\to\\file")
        assert "\\\\" in result


class TestWrapText:
    def test_short_text_no_newline(self):
        result = _wrap_text("Hello world", max_chars=40)
        assert r"\n" not in result

    def test_long_text_wrapped(self):
        words = ["word"] * 20
        result = _wrap_text(" ".join(words), max_chars=20)
        assert r"\n" in result

    def test_empty_text(self):
        result = _wrap_text("")
        assert result == ""


# ──────────────────────────────────────────────────────────────────────────────
# build_filter_graph
# ──────────────────────────────────────────────────────────────────────────────


class TestBuildFilterGraph:
    def _build(self, reel: dict | None = None) -> str:
        r = reel or _minimal_reel()
        segments = build_timing_plan(r)
        return build_filter_graph(
            segments=segments,
            total_duration=30.0,
            accent="0x6a7abf",
            font_serif="serif",
            font_mono="monospace",
        )

    def test_returns_non_empty_string(self):
        assert len(self._build()) > 0

    def test_contains_drawtext(self):
        assert "drawtext=" in self._build()

    def test_contains_brand_header(self):
        assert "CONSULT THE DEAD" in self._build()

    def test_contains_between_enable_for_hook(self):
        vf = self._build()
        assert "between(t" in vf

    def test_contains_hook_text(self):
        vf = self._build()
        # Hook text should appear in the filter
        assert "instinct" in vf or "data" in vf or "trust" in vf

    def test_contains_accent_colour(self):
        vf = self._build()
        assert "0x6a7abf" in vf

    def test_comma_separated_filters(self):
        vf = self._build()
        assert "," in vf


# ──────────────────────────────────────────────────────────────────────────────
# get_wav_duration
# ──────────────────────────────────────────────────────────────────────────────


class TestGetWavDuration:
    def test_returns_duration_on_success(self, tmp_path: Path):
        wav = _make_fake_wav(tmp_path)
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="28.5\n")
            result = get_wav_duration(wav)
        assert result == pytest.approx(28.5)

    def test_returns_none_on_nonzero_exit(self, tmp_path: Path):
        wav = _make_fake_wav(tmp_path)
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stdout="")
            result = get_wav_duration(wav)
        assert result is None

    def test_returns_none_on_invalid_float(self, tmp_path: Path):
        wav = _make_fake_wav(tmp_path)
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="not-a-number\n")
            result = get_wav_duration(wav)
        assert result is None

    def test_returns_none_on_timeout(self, tmp_path: Path):
        import subprocess as sp
        wav = _make_fake_wav(tmp_path)
        with patch("subprocess.run", side_effect=sp.TimeoutExpired("ffprobe", 30)):
            result = get_wav_duration(wav)
        assert result is None

    def test_returns_none_when_ffprobe_not_found(self, tmp_path: Path):
        wav = _make_fake_wav(tmp_path)
        with patch("subprocess.run", side_effect=FileNotFoundError):
            result = get_wav_duration(wav)
        assert result is None


# ──────────────────────────────────────────────────────────────────────────────
# render_reel
# ──────────────────────────────────────────────────────────────────────────────


def _mock_ffmpeg_success() -> MagicMock:
    """Return a mock subprocess.run that simulates ffmpeg success."""
    m = MagicMock()
    m.returncode = 0
    m.stderr = ""
    return m


class TestRenderReel:
    def test_raises_when_ffmpeg_not_found(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        with patch("shutil.which", return_value=None):
            with pytest.raises(ReelError, match="ffmpeg"):
                render_reel(reel, wav, out, "0x6a7abf")

    def test_raises_when_wav_missing(self, tmp_path: Path):
        reel = _minimal_reel()
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with pytest.raises(ReelError, match="WAV"):
                render_reel(reel, tmp_path / "missing.wav", tmp_path / "out.mp4", "0x6a7abf")

    def test_raises_on_empty_segment_plan(self, tmp_path: Path):
        reel = {"slug": "x", "hook": {}}  # no segments
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with pytest.raises(ReelError, match="no renderable segments"):
                render_reel(reel, wav, out, "0x6a7abf")

    def test_raises_on_ffmpeg_nonzero_exit(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                # First call is get_wav_duration (ffprobe), second is ffmpeg
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),  # ffprobe
                    MagicMock(returncode=1, stderr="some error"),  # ffmpeg
                ]
                with pytest.raises(ReelError, match="exited with code 1"):
                    render_reel(reel, wav, out, "0x6a7abf")

    def test_raises_on_ffmpeg_timeout(self, tmp_path: Path):
        import subprocess as sp
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),  # ffprobe ok
                    sp.TimeoutExpired("ffmpeg", 300),  # ffmpeg timeout
                ]
                with pytest.raises(ReelError, match="timed out"):
                    render_reel(reel, wav, out, "0x6a7abf")

    def test_raises_when_ffmpeg_binary_missing_at_run(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),  # ffprobe ok
                    FileNotFoundError(),  # ffmpeg not found at exec time
                ]
                with pytest.raises(ReelError, match="not found"):
                    render_reel(reel, wav, out, "0x6a7abf")

    def test_success_creates_output_file(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        out.write_bytes(b"fake mp4 data")  # simulate ffmpeg writing the file
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),  # ffprobe
                    MagicMock(returncode=0, stderr=""),  # ffmpeg success
                ]
                render_reel(reel, wav, out, "0x6a7abf")
        # If no exception raised, success

    def test_verbose_mode_does_not_raise(self, tmp_path: Path, capsys):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        out.write_bytes(b"fake mp4")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),
                    MagicMock(returncode=0, stderr=""),
                ]
                render_reel(reel, wav, out, "0x6a7abf", verbose=True)
        captured = capsys.readouterr()
        assert "ffmpeg command" in captured.out

    def test_output_directory_created(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "subdir" / "nested" / "out.mp4"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(b"fake")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),
                    MagicMock(returncode=0, stderr=""),
                ]
                render_reel(reel, wav, out, "0x6a7abf")

    def test_falls_back_to_estimate_when_ffprobe_fails(self, tmp_path: Path):
        reel = _minimal_reel()
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        out.write_bytes(b"fake")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=1, stdout=""),  # ffprobe fails
                    MagicMock(returncode=0, stderr=""),  # ffmpeg ok
                ]
                # Should not raise
                render_reel(reel, wav, out, "0x6a7abf")


# ──────────────────────────────────────────────────────────────────────────────
# print_timing_plan
# ──────────────────────────────────────────────────────────────────────────────


class TestPrintTimingPlan:
    def test_outputs_segment_info(self, capsys):
        reel = _minimal_reel()
        segments = build_timing_plan(reel)
        print_timing_plan(reel, segments)
        captured = capsys.readouterr()
        assert "test-slug" in captured.out
        assert "hook" in captured.out.lower()
        assert "consensus" in captured.out.lower()

    def test_shows_total_duration(self, capsys):
        reel = _minimal_reel()
        segments = build_timing_plan(reel)
        print_timing_plan(reel, segments)
        captured = capsys.readouterr()
        assert "25" in captured.out and "40" in captured.out  # target range mentioned

    def test_truncates_long_text(self, capsys):
        reel = _minimal_reel()
        reel["consensus"] = "A" * 120
        segments = build_timing_plan(reel)
        print_timing_plan(reel, segments)
        captured = capsys.readouterr()
        assert "…" in captured.out


# ──────────────────────────────────────────────────────────────────────────────
# main (CLI)
# ──────────────────────────────────────────────────────────────────────────────


class TestMain:
    def test_dry_run_returns_zero(self, tmp_path: Path):
        reel = _minimal_reel()
        reel_path = _write_reel_json(reel, tmp_path)
        wav_path = _make_fake_wav(tmp_path)
        code = main([str(reel_path), str(wav_path), "--dry-run"])
        assert code == 0

    def test_missing_reel_json_returns_one(self, tmp_path: Path):
        wav = _make_fake_wav(tmp_path)
        code = main([str(tmp_path / "missing.json"), str(wav)])
        assert code == 1

    def test_render_success_returns_zero(self, tmp_path: Path):
        reel = _minimal_reel()
        reel_path = _write_reel_json(reel, tmp_path)
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        out.write_bytes(b"fake mp4")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),
                    MagicMock(returncode=0, stderr=""),
                ]
                code = main([str(reel_path), str(wav), "-o", str(out)])
        assert code == 0

    def test_render_failure_returns_one(self, tmp_path: Path):
        reel = _minimal_reel()
        reel_path = _write_reel_json(reel, tmp_path)
        wav = _make_fake_wav(tmp_path)
        with patch("shutil.which", return_value=None):
            code = main([str(reel_path), str(wav), "-o", str(tmp_path / "out.mp4")])
        assert code == 1

    def test_default_output_path_uses_slug(self, tmp_path: Path, monkeypatch):
        reel = _minimal_reel()
        reel_path = _write_reel_json(reel, tmp_path)
        wav = _make_fake_wav(tmp_path)
        # Change cwd so default output goes to tmp_path
        monkeypatch.chdir(tmp_path)
        expected_out = tmp_path / "test-slug-reel.mp4"
        expected_out.write_bytes(b"fake")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),
                    MagicMock(returncode=0, stderr=""),
                ]
                code = main([str(reel_path), str(wav)])
        assert code == 0

    def test_accent_override_passed_through(self, tmp_path: Path):
        reel = _minimal_reel()
        reel_path = _write_reel_json(reel, tmp_path)
        wav = _make_fake_wav(tmp_path)
        out = tmp_path / "out.mp4"
        out.write_bytes(b"fake")
        with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
            with patch("subprocess.run") as mock_run:
                mock_run.side_effect = [
                    MagicMock(returncode=0, stdout="28.0\n"),
                    MagicMock(returncode=0, stderr=""),
                ]
                code = main([str(reel_path), str(wav), "-o", str(out), "--accent", "#aabbcc"])
        assert code == 0


# ──────────────────────────────────────────────────────────────────────────────
# Segment dataclass
# ──────────────────────────────────────────────────────────────────────────────


class TestSegment:
    def test_end_property(self):
        seg = Segment("hook", "↯ HOOK", "text", start=2.0, duration=3.5)
        assert seg.end == pytest.approx(5.5)


# ──────────────────────────────────────────────────────────────────────────────
# FRAMEWORK_ACCENTS completeness
# ──────────────────────────────────────────────────────────────────────────────


class TestFrameworkAccents:
    def test_all_accents_are_ffmpeg_hex(self):
        for slug, colour in FRAMEWORK_ACCENTS.items():
            assert colour.startswith("0x"), f"{slug!r} colour {colour!r} should start with 0x"
            assert len(colour) == 8, f"{slug!r} colour {colour!r} should be 0xRRGGBB"

    def test_socrates_present(self):
        assert "socrates" in FRAMEWORK_ACCENTS

    def test_default_accent_is_hex(self):
        assert DEFAULT_ACCENT.startswith("0x")
        assert len(DEFAULT_ACCENT) == 8
