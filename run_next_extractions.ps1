# run_next_extractions.ps1
# Run from: C:\projects\greatminds
# Usage:    .\run_next_extractions.ps1
#
# What this does:
#   1. Runs tier-2 validation for all tier1-complete frameworks
#   2. Extracts Seneca (full pipeline)
#   3. Commits results to GitHub
#
# Prerequisites: Python 3.12, ANTHROPIC_API_KEY in .env

Set-Location $PSScriptRoot

# Load .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}

$LOG = "pipeline_run.log"
"[$(Get-Date -Format 'u')] Pipeline started" | Tee-Object -FilePath $LOG

# ── Tier-2 validation for tier1-ready frameworks ──────────────────────────────
$tier1Ready = @(
    @{ slug = "albert-einstein";    person = "Albert Einstein";       domain = "Physics, Philosophy of Science, Innovation" },
    @{ slug = "isaac-newton";       person = "Isaac Newton";          domain = "Mathematics, Physics, Natural Philosophy" },
    @{ slug = "leonardo-da-vinci";  person = "Leonardo da Vinci";     domain = "Polymath / Art + Science + Engineering" },
    @{ slug = "marie-curie";        person = "Marie Curie";           domain = "Research, Discovery, Persistence" },
    @{ slug = "niccolo-machiavelli";person = "Niccolo Machiavelli";   domain = "Political Strategy, Governance, Power Dynamics" },
    @{ slug = "nikola-tesla";       person = "Nikola Tesla";          domain = "Invention, Electrical Engineering, Systems Thinking" },
    @{ slug = "sun-tzu";            person = "Sun Tzu";               domain = "Military Strategy / Statecraft" }
)

foreach ($fw in $tier1Ready) {
    $slug = $fw.slug
    $t2File = "frameworks\$slug\validation\tier2_results.json"
    if (Test-Path $t2File) {
        "[$(Get-Date -Format 'u')] Skipping $slug (tier2 already exists)" | Tee-Object -FilePath $LOG -Append
        continue
    }
    "[$(Get-Date -Format 'u')] Running tier2 for $slug ..." | Tee-Object -FilePath $LOG -Append
    python -m framework_forge.cli validate `
        --framework "frameworks\$slug\framework.json" `
        --person $fw.person `
        --domain $fw.domain `
        --mode tier2 2>&1 | Tee-Object -FilePath $LOG -Append
    "[$(Get-Date -Format 'u')] tier2 $slug done (exit $LASTEXITCODE)" | Tee-Object -FilePath $LOG -Append
}

# ── Seneca full extraction ─────────────────────────────────────────────────────
$SLUG   = "seneca"
$PERSON = "Seneca the Younger"
$DOMAIN = "Stoic Philosophy, Ethics, Rhetoric, Political Counsel"
$FW_DIR = "frameworks\$SLUG"

"[$(Get-Date -Format 'u')] Starting Seneca extraction ..." | Tee-Object -FilePath $LOG -Append

New-Item -ItemType Directory -Path "$FW_DIR\sources\texts" -Force | Out-Null

# Stage 1: discover-sources
python -m framework_forge.cli discover-sources --person $PERSON --output $FW_DIR 2>&1 | Tee-Object -FilePath $LOG -Append

# Stage 2a: identify-incidents
$textsDir = "$FW_DIR\sources\texts"
$nTexts = (Get-ChildItem $textsDir -ErrorAction SilentlyContinue).Count
if ($nTexts -gt 0) {
    python -m framework_forge.cli identify-incidents --person $PERSON --source-dir $textsDir --output "$FW_DIR\incidents" 2>&1 | Tee-Object -FilePath $LOG -Append

    # Stage 2b: reconstruct
    $candsFile = "$FW_DIR\incidents\candidates.json"
    if (Test-Path $candsFile) {
        python -m framework_forge.cli reconstruct --person $PERSON --incidents-file $candsFile --output "$FW_DIR\incidents" 2>&1 | Tee-Object -FilePath $LOG -Append

        # Stages 3-6: build
        $incFile = "$FW_DIR\incidents\incidents.json"
        if (Test-Path $incFile) {
            python -m framework_forge.cli build --person $PERSON --framework-dir $FW_DIR --domain $DOMAIN 2>&1 | Tee-Object -FilePath $LOG -Append

            # Stage 7: validate
            $fwJson = "$FW_DIR\framework.json"
            if (Test-Path $fwJson) {
                python -m framework_forge.cli validate --framework $fwJson --person $PERSON --domain $DOMAIN --mode full 2>&1 | Tee-Object -FilePath $LOG -Append
            }
        }
    }
} else {
    "[$(Get-Date -Format 'u')] WARNING: No source texts downloaded for Seneca. Check discover-sources output above." | Tee-Object -FilePath $LOG -Append
}

# ── Commit results ─────────────────────────────────────────────────────────────
"[$(Get-Date -Format 'u')] Committing results ..." | Tee-Object -FilePath $LOG -Append
git add frameworks/ framework_forge/llm.py
git commit -m "feat: run tier2 validation for 7 frameworks + extract Seneca framework"
git push

"[$(Get-Date -Format 'u')] All done. See pipeline_run.log for details." | Tee-Object -FilePath $LOG -Append
