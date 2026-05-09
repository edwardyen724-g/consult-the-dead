# CDM Probe Reconstruction

## Files Changed
- `framework_forge/extraction/cdm_probes.py`
- `tests/test_cdm_probes.py`

## What Changed
- Added a typed `CDMProbes` dataclass that validates required probe fields and still supports mapping-style access for downstream consumers.
- Added `ReconstructedIncident.from_mapping()` so raw incident payloads can be rebuilt with explicit validation.
- Hardened `reconstruct_incident()` to require `cdm_probes` in the LLM payload and to use the typed reconstruction path.
- Added tests for the happy path, missing-field failures, bad type/empty-value failures, and the default-client branch.

## Verification
- `PYTHONPATH=. uv run --with pytest pytest tests/test_cdm_probes.py -q`
  - Result: `6 passed`
- `PYTHONPATH=. uv run --with pytest --with pytest-cov pytest tests/test_cdm_probes.py --cov=framework_forge.extraction.cdm_probes --cov-report=term-missing -q`
  - Result: `6 passed`, `framework_forge/extraction/cdm_probes.py` at `100%` coverage
