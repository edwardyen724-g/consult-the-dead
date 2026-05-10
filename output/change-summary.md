# Change Summary

## Changed Files
- `tests/test_validation.py`

## What Changed
- Added a CLI smoke test for `framework_forge.cli validate --mode full`.
- The test copies a checked-in framework fixture (`frameworks/abraham-lincoln/framework.json`) into a temp sandbox.
- It stubs Tier 1 and Tier 2 validation to keep the smoke focused on the CLI contract, then asserts:
  - `validation/tier1_results.json` is written
  - `validation/tier2_results.json` is written
  - `validation/tier3_materials/review_packet.json` is written
  - the CLI exits successfully and prints the expected stage messages
- Removed unused imports from the test file while touching it.

## Verification
- `env PYTHONPATH=. uv run --with pytest pytest tests/test_validation.py -q`
  - Result: `12 passed`
- `env PYTHONPATH=. uv run --with pytest --with pytest-cov pytest tests/test_validation.py --cov=framework_forge --cov-report=term-missing`
  - Result: `12 passed`
  - Coverage highlights:
    - `framework_forge/cli.py`: 43%
    - `framework_forge/validation/tier1.py`: 59%
    - `framework_forge/validation/tier2.py`: 92%
    - `framework_forge/validation/tier3_prep.py`: 100%

## Notes
- Unrelated repo changes were already present in `CONTENT_PIPELINE.md`, `MARKETING_STRATEGY.md`, and `output/marketing-notes.md`; I left them untouched.
