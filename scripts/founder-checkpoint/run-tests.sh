#!/usr/bin/env bash
# Run the founder-checkpoint metrics-pull tests using the vitest binary
# already installed for the Next.js website workspace. We cd into website/
# (so vitest can resolve `vitest/config` and friends from its own
# node_modules) and pass our test file path as an explicit argument.
#
# Usage:
#   bash scripts/founder-checkpoint/run-tests.sh             # tests
#   bash scripts/founder-checkpoint/run-tests.sh --coverage  # tests + coverage
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${here}/../.." && pwd)"
website_dir="${repo_root}/website"
vitest_bin="${website_dir}/node_modules/.bin/vitest"
test_file="${here}/pull-metrics.test.ts"

if [[ ! -x "${vitest_bin}" ]]; then
  echo "[run-tests] vitest binary not found at ${vitest_bin}" >&2
  echo "[run-tests] run 'npm install' inside ${website_dir} first." >&2
  exit 1
fi

cd "${website_dir}"

# Override website's coverage `include` (which is src/**) so it measures
# our script. Without --coverage flag this is harmless.
export VITEST_FOUNDER_CHECKPOINT_TEST="${test_file}"

if [[ "${1:-}" == "--coverage" ]]; then
  exec "${vitest_bin}" run \
    --root "${here}" \
    --coverage \
    --coverage.include="metrics.ts" \
    --coverage.exclude="**/*.test.ts" \
    --coverage.exclude="pull-metrics.ts" \
    --coverage.reporter=text \
    --coverage.reporter=lcov
fi

exec "${vitest_bin}" run --root "${here}"
