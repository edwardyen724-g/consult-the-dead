#!/usr/bin/env bash
# Convenience wrapper for the founder-checkpoint live metrics pull.
#
# Resolves the repo root and passes --env-file .env.local to tsx so you
# don't have to remember the flag or the correct working directory.
#
# Usage (from anywhere in the repo):
#   bash scripts/founder-checkpoint/run-live.sh
#   bash scripts/founder-checkpoint/run-live.sh | jq .
#
# Required: fill in the four blank entries in .env.local first —
#   STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, VERCEL_TOKEN
#   See README.md §"Environment" for where to get each credential.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${here}/../.." && pwd)"
env_file="${repo_root}/.env.local"

if [[ ! -f "${env_file}" ]]; then
  echo "[run-live] ERROR: .env.local not found at ${env_file}" >&2
  echo "[run-live] Copy .env.example to .env.local and fill in credentials." >&2
  exit 1
fi

# Check that at least one credential is filled in — if all four required
# Stripe/Vercel vars are blank, warn clearly rather than returning a stub
# silently.  The script itself degrades gracefully; this check is for
# operator clarity.
missing=()
for var in STRIPE_SECRET_KEY STRIPE_PRICE_MONTHLY STRIPE_PRICE_ANNUAL VERCEL_TOKEN; do
  val="$(grep -E "^${var}=.+" "${env_file}" | head -1 | cut -d= -f2- || true)"
  if [[ -z "${val}" ]]; then
    missing+=("${var}")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "[run-live] WARNING: the following credentials are still blank in .env.local:" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  echo "[run-live] The script will emit a stub report (paying_users: null)." >&2
  echo "[run-live] See scripts/founder-checkpoint/README.md for setup instructions." >&2
fi

exec npx tsx --env-file "${env_file}" "${here}/pull-metrics.ts"
