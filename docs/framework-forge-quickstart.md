# Framework Forge Quickstart

Framework Forge is the extraction pipeline for building a historical figure framework from source material, reconstructing critical incidents, deriving constructs and a perceptual lens, and validating the final framework. The current implementation lives in `framework_forge/cli.py` and exposes a package CLI rather than the older single-file command examples in the phase plan.

## Install And Configure

1. Create and activate a Python environment.
2. Install the project dependencies.
3. Add `ANTHROPIC_API_KEY` to `.env` at the repo root.

Example:

```bash
pip install -e .[dev]
```

Or, if you are using the raw requirements file:

```bash
pip install -r requirements.txt
```

## CLI Command Map

Use either the installed entrypoint:

```bash
framework-forge <command> ...
```

or the module form:

```bash
python -m framework_forge.cli <command> ...
```

| Command | Purpose | Main Input | Main Output |
| --- | --- | --- | --- |
| `discover-sources` | Discover and rank the best source material for a person. | `--person`, optional `--output` | `frameworks/<person>/sources/bibliography.json` |
| `fetch-sources` | Materialise source texts from a saved bibliography (Stage 1b). | `--bibliography`, `--output-dir` | `<output-dir>/*.txt` |
| `identify-incidents` | Scan source text files and extract candidate critical incidents. | `--person`, `--source-dir`, optional `--output` | `frameworks/<person>/incidents/candidates.json` |
| `reconstruct` | Apply CDM probes to each candidate incident. | `--person`, `--incidents-file`, optional `--output` | `frameworks/<person>/incidents/incidents.json` |
| `build` | Map constructs, derive the lens, generate predictions, and assemble the framework JSON. | `--person`, `--framework-dir`, `--domain` | `frameworks/<person>/constructs.json` and `frameworks/<person>/framework.json` |
| `validate` | Run validation at the selected tier (`tier1`, `tier2`, `full`, `floor-check`). | `--framework`, `--person`, `--domain`, `--mode` | `frameworks/<person>/validation/tier1_results.json`, `tier2_results.json`, `tier3_materials/review_packet.json` |

## Typical Flow

1. Discover sources for a person.
2. Fetch and materialise source texts with `fetch-sources` (or place `.txt` files manually under `sources/texts/`).
3. Identify incidents from the text corpus.
4. Reconstruct each candidate incident with CDM probes.
5. Build the framework JSON from the reconstructed incident set.
6. Validate the framework with the appropriate mode.

Example sequence for Steve Jobs:

```bash
framework-forge discover-sources --person "Steve Jobs" --output frameworks/steve-jobs
framework-forge fetch-sources --bibliography frameworks/steve-jobs/sources/bibliography.json --output-dir frameworks/steve-jobs/sources/texts
framework-forge identify-incidents --person "Steve Jobs" --source-dir frameworks/steve-jobs/sources/texts --output frameworks/steve-jobs
framework-forge reconstruct --person "Steve Jobs" --incidents-file frameworks/steve-jobs/incidents/candidates.json --output frameworks/steve-jobs
framework-forge build --person "Steve Jobs" --framework-dir frameworks/steve-jobs --domain "consumer technology"
framework-forge validate --framework frameworks/steve-jobs/framework.json --person "Steve Jobs" --domain "consumer technology" --mode full
```

## Expected Filesystem Layout

The CLI writes artifacts under `frameworks/<person>/`:

```text
frameworks/
└── steve-jobs/
    ├── framework.json
    ├── constructs.json
    ├── incidents/
    │   ├── candidates.json
    │   └── incidents.json
    ├── sources/
    │   ├── bibliography.json
    │   └── texts/
    │       └── *.txt
    └── validation/
        ├── tier1_results.json
        ├── tier2_results.json
        └── tier3_materials/
            └── review_packet.json
```

`discover-sources` populates the bibliography. `identify-incidents` writes candidate incidents. `reconstruct` converts candidates into the full incident database. `build` adds constructs and the final framework file. `validate` writes the validation artifacts.

## How This Fits Phase 1

Phase 1 in `docs/plans/2026-04-01-phase1-framework-forge.md` describes the broader extraction system. This quickstart is the operational version of that plan: it documents the current command surface and artifact layout that workers can use today.

Treat the package CLI commands above as the current usage contract. Older single-file script examples are obsolete and should not be used for new work.
