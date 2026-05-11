# DevOps Notes

## Branch

- `wanman/stabilize-framework-forge-divergence-ordering`

## Validation

- Targeted test run passed: `PYTHONPATH=/Users/haotingyen/projects/consult-the-dead/.wanman/worktree wcx uv run pytest tests/test_validation.py tests/test_pipeline.py`
- Result: `23 passed`

## Change Summary

- `framework_forge/cli.py`: carry `baseline_response` into Tier 2 inputs and call Tier 3 prep with explicit keywords.
- `run_next_extractions.ps1`: point identify/reconstruct stages at the framework root so the pipeline writes into the nested `incidents/` directory exactly once.
- `uv.lock`: added lockfile snapshot for the current Python dependency set.

## Notes

- `.coverage` is present locally as generated coverage output and was left untracked.
