# Change Summary

## Task
- Add regression tests for Framework Forge placeholder validator multi-root and JSON output

## Files Changed
- `framework_forge/validation/placeholder_citations.py`
- `tests/test_placeholder_citations.py`
- `output/change-summary.md`

## What Changed
- Added a standalone placeholder citation validator that:
  - scans multiple framework roots in one run,
  - tracks missing `framework.json` manifests as a stable failure case,
  - emits a JSON report for CI and local review.
- Added regression coverage for:
  - multi-root failure aggregation,
  - missing-manifest handling,
  - in-memory payload serialization,
  - single-root wrapper behavior,
  - `--json` report stability,
  - text-mode success and failure output.

## Verification
- `PYTHONPATH=. uv run --with pytest pytest tests/test_placeholder_citations.py -q`
- `PYTHONPATH=. uv run --with pytest pytest tests/test_validation.py -q`
- `PYTHONPATH=. uv run --with pytest --with pytest-cov pytest tests/test_placeholder_citations.py --cov=framework_forge.validation.placeholder_citations --cov-report=term-missing -q`

## Notes
- Focused coverage on `framework_forge.validation.placeholder_citations` reached 99% in the final run.
