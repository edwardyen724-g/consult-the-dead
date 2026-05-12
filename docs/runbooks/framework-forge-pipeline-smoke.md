# Framework Forge Pipeline Smoke Runbook

**Purpose:** verify the live Framework Forge end-to-end pipeline entrypoint and
the artifact chain it produces during a release or readiness smoke.

**Canonical source of truth:**

- `framework_forge/pipeline.py`
- `docs/framework-forge-quickstart.md`
- `docs/plans/2026-04-01-phase1-framework-forge.md`

Use this runbook when:

- validating a deployment that touches Framework Forge discovery, extraction,
  encoding, or validation code
- checking the live one-shot pipeline before a release note is promoted
- confirming the optional floor-check path still persists its results

## Smoke Path

The live end-to-end entrypoint is the pipeline module:

```bash
python -m framework_forge.pipeline \
  --person "Steve Jobs" \
  --domain "consumer technology" \
  --output frameworks/steve-jobs
```

Include a source-text directory when you want deterministic local materialization
instead of relying on live fetches:

```bash
python -m framework_forge.pipeline \
  --person "Steve Jobs" \
  --domain "consumer technology" \
  --output frameworks/steve-jobs \
  --source-text-dir frameworks/steve-jobs/sources/texts
```

Add a historical-decisions file when you want the optional floor-check output:

```bash
python -m framework_forge.pipeline \
  --person "Steve Jobs" \
  --domain "consumer technology" \
  --output frameworks/steve-jobs \
  --source-text-dir frameworks/steve-jobs/sources/texts \
  --historical-decisions-file data/steve-jobs-decisions.json
```

## What The Pipeline Should Do

The pipeline runs these stages in order:

1. Discover ranked sources and write `sources/bibliography.json`
2. Materialize source texts into `sources/texts/`
3. Identify candidate incidents and write `incidents/candidates.json`
4. Reconstruct incidents with CDM probes and write `incidents/incidents.json`
5. Map constructs and derive the framework JSON
6. Run Tier 1, Tier 2, and Tier 3 validation
7. Write `validation/floor-check_results.json` when historical decisions are supplied

## Pass Criteria

- the command exits successfully
- `frameworks/<slug>/sources/bibliography.json` is written
- `frameworks/<slug>/sources/texts/` contains one or more `.txt` files
- `frameworks/<slug>/incidents/candidates.json` exists
- `frameworks/<slug>/incidents/incidents.json` exists
- `frameworks/<slug>/constructs.json` exists
- `frameworks/<slug>/framework.json` exists
- `frameworks/<slug>/validation/tier1_results.json` exists
- `frameworks/<slug>/validation/tier2_results.json` exists
- `frameworks/<slug>/validation/tier3_materials/review_packet.json` exists
- `frameworks/<slug>/validation/floor-check_results.json` exists when the
  historical-decisions file is supplied

## Suggested Smoke Checks

After the run completes, inspect the output tree:

```bash
find frameworks/steve-jobs -maxdepth 3 -type f | sort
```

Confirm the console output names the resolved output directory, framework path,
and validation directory.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No source texts were materialized | Discovery returned only offline sources or the fetch step could not reach a URL | Provide a populated `--source-text-dir` or verify the source URLs in `sources/bibliography.json` |
| Incident identification fails immediately | The source-text directory is empty | Populate `.txt` files before running the pipeline |
| Tier 2 or Tier 3 artifacts are missing | The framework build stage did not complete | Inspect `framework_forge/pipeline.py` and re-run after the build step succeeds |
| `floor-check_results.json` is missing | The optional historical decisions file was not supplied | Re-run with `--historical-decisions-file <path>` |

## Rollback

If a pipeline regression reaches production, revert the offending Framework
Forge change, then rerun this smoke path against the reverted branch before
promoting the next release note.
