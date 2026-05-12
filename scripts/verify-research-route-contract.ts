/**
 * verify-research-route-contract.ts
 *
 * Static contract smoke-check for the company-builder research API route.
 * Reads source files — no network calls, no env vars required.
 *
 * Usage:
 *   tsx scripts/verify-research-route-contract.ts
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const RESEARCH_ROUTE = path.join(
  REPO_ROOT,
  "company-builder",
  "src",
  "app",
  "api",
  "research",
  "route.ts"
);

// ---------------------------------------------------------------------------
// Check registry
// ---------------------------------------------------------------------------

interface CheckResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: CheckResult[] = [];

function check(name: string, passed: boolean, details?: string): void {
  results.push({ name, passed, details });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSource(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return "";
  }
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Assert that a set of substrings all appear in source, and that they appear
 * in the given order (each substring starts after the previous one ends).
 *
 * Returns { ok, missing, outOfOrder } so the caller can compose a message.
 */
function assertOrderedPresence(
  source: string,
  labels: string[]
): { ok: boolean; missing: string[]; outOfOrder: string[] } {
  let cursor = 0;
  const missing: string[] = [];
  const outOfOrder: string[] = [];

  for (const label of labels) {
    const idx = source.indexOf(label, cursor);
    if (idx === -1) {
      // Not found at all — check if it appears earlier (out of order) or nowhere
      const anyIdx = source.indexOf(label);
      if (anyIdx === -1) {
        missing.push(label);
      } else {
        outOfOrder.push(label);
      }
    } else {
      cursor = idx + label.length;
    }
  }

  return { ok: missing.length === 0 && outOfOrder.length === 0, missing, outOfOrder };
}

function checkOrdered(
  source: string,
  labels: string[],
  description: string
): void {
  const { ok, missing, outOfOrder } = assertOrderedPresence(source, labels);
  if (ok) {
    check(description, true);
    return;
  }
  const parts: string[] = [];
  if (missing.length > 0) parts.push(`Missing: ${missing.map((l) => `"${l}"`).join(", ")}`);
  if (outOfOrder.length > 0) parts.push(`Out of order: ${outOfOrder.map((l) => `"${l}"`).join(", ")}`);
  check(description, false, parts.join("; "));
}

// ---------------------------------------------------------------------------
// Contract checks
// ---------------------------------------------------------------------------

// 1. Route source file must exist
const routeSource = readSource(RESEARCH_ROUTE);
check(
  "research route source file exists",
  routeSource.length > 0,
  routeSource.length === 0
    ? `File not found or empty: ${RESEARCH_ROUTE}`
    : undefined
);

if (routeSource.length === 0) {
  // No point running further checks on a missing file
  console.error(`\nFATAL: Cannot find route source at ${RESEARCH_ROUTE}`);
  process.exit(1);
}

// 2. SSE event types emitted by the route handler — order matters:
//    research_sources must be sent first (before streaming text chunks),
//    research_chunk carries the streamed text, and research_complete closes
//    the stream.
checkOrdered(
  routeSource,
  ["research_sources", "research_chunk", "research_complete"],
  "SSE events appear in correct order: research_sources → research_chunk → research_complete"
);

// 3. Synthesis prompt section labels — the 5 sections define the briefing
//    schema consumed by front-end components and the debate engine.  Any
//    rename here would silently break UI copy and label extraction.
checkOrdered(
  routeSource,
  [
    "Key Trends",
    "Key Players",
    "Opportunities",
    "Risks",
    "Key Data Points",
  ],
  "synthesis prompt contains all 5 section labels in order: Key Trends → Key Players → Opportunities → Risks → Key Data Points"
);

// 4. Data-section wire format: the route uses === LABEL === delimiters to
//    separate data sections in the synthesis prompt.  The specific labels
//    must be present so the synthesis prompt builder produces predictable
//    output.
const dataSectionMarkers = [
  "=== WEB SEARCH RESULTS ===",
  "=== HACKERNEWS DISCUSSIONS ===",
  "=== GITHUB REPOSITORIES ===",
  "=== NOTE ===",
];
for (const marker of dataSectionMarkers) {
  check(
    `data-section marker present: ${marker}`,
    routeSource.includes(marker),
    routeSource.includes(marker)
      ? undefined
      : `Marker not found in route source: "${marker}"`
  );
}

// 5. Category routing: the route must recognise all three topic categories
//    and route accordingly.  Any typo here silently degrades data quality.
const categories = ["tech", "business", "general"] as const;
for (const cat of categories) {
  check(
    `category routing handles "${cat}"`,
    routeSource.includes(`'${cat}'`) || routeSource.includes(`"${cat}"`),
    `Category string "${cat}" not found in route source`
  );
}

// 6. Category-based source routing logic:
//    tech     → Tavily + HN + GitHub  (useGitHub must be true for tech)
//    business → Tavily + HN           (useHN must cover business)
//    general  → Tavily only
//    We check the guard expressions that implement this contract.
check(
  "category routing: HN enabled for tech and business",
  routeSource.includes("'tech' || category === 'business'") ||
    routeSource.includes('"tech" || category === "business"') ||
    routeSource.includes("category === 'tech' || category === 'business'"),
  "Expected HN guard `category === 'tech' || category === 'business'` not found"
);
check(
  "category routing: GitHub enabled for tech only",
  routeSource.includes("category === 'tech'") ||
    routeSource.includes('category === "tech"'),
  "Expected GitHub guard `category === 'tech'` not found"
);

// 7. POST must be the only exported HTTP handler
const unexpectedHandlers = ["GET", "PUT", "DELETE", "PATCH"].filter((h) =>
  new RegExp(`export\\s+(async\\s+)?function\\s+${h}\\b`).test(routeSource)
);
check(
  "route exports only POST (no unexpected HTTP handlers)",
  unexpectedHandlers.length === 0,
  unexpectedHandlers.length > 0
    ? `Unexpected exported handlers: ${unexpectedHandlers.join(", ")}`
    : undefined
);

// 8. No env-dependent imports that would break a local import
const forbiddenImports = ["@/lib/db", "@/lib/redis", "pg", "mysql2"];
const foundForbidden = forbiddenImports.filter(
  (imp) =>
    routeSource.includes(`from '${imp}'`) ||
    routeSource.includes(`from "${imp}"`)
);
check(
  "route does not import env-dependent DB/cache clients",
  foundForbidden.length === 0,
  foundForbidden.length > 0
    ? `Found forbidden imports: ${foundForbidden.join(", ")}`
    : undefined
);

// 9. Streaming response contract: must return text/event-stream
check(
  "route returns text/event-stream content type",
  routeSource.includes("text/event-stream"),
  "Expected 'text/event-stream' Content-Type not found in route source"
);

// 10. Error path: 400 on missing topic
check(
  "route returns 400 when topic is missing",
  routeSource.includes("Topic is required") || routeSource.includes("topic is required"),
  "Expected 'Topic is required' error message not found in route source"
);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\nResearch Route Contract Smoke Check");
console.log("====================================");
console.log(`Route: ${RESEARCH_ROUTE}\n`);

for (const result of results) {
  const icon = result.passed ? "PASS" : "FAIL";
  console.log(`  [${icon}] ${result.name}`);
  if (!result.passed && result.details) {
    console.log(`         ${result.details}`);
  }
}

console.log(
  `\n${passed.length}/${results.length} checks passed, ${failed.length} failed`
);

if (failed.length === 0) {
  console.log("\nPASS — research route contract is intact\n");
  process.exit(0);
} else {
  console.log("\nFAIL — research route contract has violations\n");
  process.exit(1);
}
