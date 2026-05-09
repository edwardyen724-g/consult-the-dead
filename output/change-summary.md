# Framework Forge constructs and lens derivation

## Files Changed
- `framework_forge/extraction/constructs.py`
- `framework_forge/extraction/lens.py`
- `tests/test_extraction.py`

## What Changed
- Added stable incident normalization and triad grouping helpers in `constructs.py`, including canonical ordering for prompt generation and traceable `derived_from_incidents` normalization.
- Updated `constructs.py` to format incidents as stable triads before prompting, and to fall back cleanly when the caller does not pass an `LLMClient`.
- Updated `lens.py` to exclude holdout incidents from the derivation prompt, keep holdout validation separate, and normalize the returned lens payload.
- Expanded extraction tests to cover stable ordering, singleton triad merging, holdout exclusion, dict/object coercion, and the default-client branches.

## Verification
- `python3 -m py_compile framework_forge/extraction/cdm_probes.py framework_forge/extraction/constructs.py framework_forge/extraction/lens.py tests/test_extraction.py`
  - Result: passed
- `uv run --with pytest --with pytest-asyncio python -m pytest tests/test_extraction.py -q`
  - Result: `13 passed`
- `uv run --with pytest --with pytest-asyncio --with pytest-cov python -m pytest -q --cov=framework_forge --cov-report=term-missing`
  - Result: `49 passed`
  - Changed-file coverage:
    - `framework_forge/extraction/constructs.py`: `100%`
    - `framework_forge/extraction/lens.py`: `100%`
