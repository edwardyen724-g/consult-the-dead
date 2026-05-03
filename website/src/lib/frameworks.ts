import fs from "fs";
import path from "path";

/* ── Allowed slugs (public, validated frameworks only) ── */
// HIDDEN 2026-04-16 pending legal review — see docs/roster-expansion.md
// "albert-einstein" removed until Hebrew University trademark question is resolved.
// To re-enable: restore "albert-einstein" to ALLOWED_SLUGS, SLUG_COLOR_VAR, ERA_FALLBACK, DISPLAY_ORDER.
export const ALLOWED_SLUGS = [
  "isaac-newton",
  // "albert-einstein", // HIDDEN 2026-04-16 pending legal review — see docs/roster-expansion.md
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
  "marcus-aurelius",
  "benjamin-franklin",
  "cicero",
  "epictetus",
  "thomas-edison",
  "archimedes",
  "john-d-rockefeller",
  "harriet-tubman",
  "ada-lovelace",
  "catherine-the-great",
  "alexander-the-great",
  "cleopatra-vii",
] as const;

export type FrameworkSlug = (typeof ALLOWED_SLUGS)[number];

/* ── Slug → CSS custom-property name ── */
export const SLUG_COLOR_VAR: Record<FrameworkSlug, string> = {
  "isaac-newton": "var(--color-newton)",
  // "albert-einstein": "var(--color-einstein)", // HIDDEN 2026-04-16
  "marie-curie": "var(--color-curie)",
  "niccolo-machiavelli": "var(--color-machiavelli)",
  "nikola-tesla": "var(--color-tesla)",
  "leonardo-da-vinci": "var(--color-leonardo)",
  "sun-tzu": "var(--color-suntzu)",
  "marcus-aurelius": "var(--color-aurelius)",
  "benjamin-franklin": "var(--color-franklin)",
  "cicero": "var(--color-cicero)",
  "epictetus": "var(--color-epictetus)",
  "thomas-edison": "var(--color-edison)",
  "archimedes": "var(--color-archimedes)",
  "john-d-rockefeller": "var(--color-rockefeller)",
  "harriet-tubman": "var(--color-tubman)",
  "ada-lovelace": "var(--color-lovelace)",
  "catherine-the-great": "var(--color-catherine)",
  "alexander-the-great": "var(--color-alexander)",
  "cleopatra-vii": "var(--color-cleopatra)",
};

/* ── Fallback era strings (some JSONs lack born/died) ── */
const ERA_FALLBACK: Record<FrameworkSlug, string> = {
  "isaac-newton": "1643\u20131727",
  // "albert-einstein": "1879\u20131955", // HIDDEN 2026-04-16
  "marie-curie": "1867\u20131934",
  "niccolo-machiavelli": "1469\u20131527",
  "nikola-tesla": "1856\u20131943",
  "leonardo-da-vinci": "1452\u20131519",
  "sun-tzu": "c.\u2009544\u2013496 BC",
  "marcus-aurelius": "121\u2013180 AD",
  "benjamin-franklin": "1706\u20131790",
  "cicero": "106\u201343 BC",
  "epictetus": "c.\u200950\u2013135 AD",
  "thomas-edison": "1847\u20131931",
  "archimedes": "c.\u2009287\u2013212 BC",
  "john-d-rockefeller": "1839\u20131937",
  "harriet-tubman": "c.\u20091822\u20131913",
  "ada-lovelace": "1815\u20131852",
  "catherine-the-great": "1729\u20131796",
  "alexander-the-great": "356\u2013323 BC",
  "cleopatra-vii": "69\u201330 BC",
};

/* ── Display order for the index page ── */
export const DISPLAY_ORDER: FrameworkSlug[] = [
  "isaac-newton",
  // "albert-einstein", // HIDDEN 2026-04-16
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
  "marcus-aurelius",
  "benjamin-franklin",
  "cicero",
  "epictetus",
  "thomas-edison",
  "archimedes",
  "john-d-rockefeller",
  "harriet-tubman",
  "ada-lovelace",
  "catherine-the-great",
  "alexander-the-great",
  "cleopatra-vii",
];

/* ── Types ── */
export interface FrameworkMeta {
  person: string;
  domain: string;
  born?: string;
  died?: string;
  era?: string;
  incident_count: number;
  construct_count?: number;
}

export interface BipolarConstruct {
  construct: string;
  positive_pole: string;
  negative_pole: string;
  behavioral_implication: string;
}

export interface PerceptualLens {
  statement: string;
  what_they_notice_first: string;
  what_they_ignore: string;
}

export interface Incident {
  id: string;
  decision: string;
  context: string;
  divergence_explanation: string;
}

export interface BlindSpot {
  description: string;
  evidence?: string[];
}

export interface BehavioralPrediction {
  situation_type: string;
  conventional_response?: string;
  ordinary_response?: string;
  framework_response: string;
  confidence?: number | string;
}

export interface Framework {
  slug: FrameworkSlug;
  meta: FrameworkMeta;
  era: string;
  perceptual_lens: PerceptualLens;
  bipolar_constructs: BipolarConstruct[];
  blind_spots: BlindSpot[];
  behavioral_divergence_predictions: BehavioralPrediction[];
  incidents: Incident[];
}

export interface ValidationResult {
  divergent_count: number;
  total_scenarios: number;
  passed: boolean;
  scenario_results: Array<{
    divergence_score: number;
    specificity_score: number;
    traceability_score: number;
    divergent: boolean;
  }>;
}

/* ── Helpers ── */

function frameworksDir(): string {
  // Use bundled data inside website/data/frameworks/ so Vercel builds
  // work (Vercel only has access to the website/ directory, not the
  // monorepo root). The data is copied from frameworks/ at commit time.
  return path.resolve(process.cwd(), "data", "frameworks");
}

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/* ── Public API ── */

export function getFramework(slug: FrameworkSlug): Framework | null {
  const dir = path.join(frameworksDir(), slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = readJson<any>(path.join(dir, "framework.json"));
  if (!raw) return null;

  const meta: FrameworkMeta = raw.meta ?? {};

  // Compute era string
  let era = ERA_FALLBACK[slug] ?? "";
  if (meta.born && meta.died) {
    era = `${meta.born}\u2013${meta.died}`;
  } else if (meta.era) {
    era = meta.era;
  }

  // Construct count: use meta field, or count the actual array
  const constructs: BipolarConstruct[] = raw.bipolar_constructs ?? [];
  const constructCount =
    meta.construct_count ?? constructs.length;

  // Read incidents: prefer inline critical_incident_database in framework.json,
  // fall back to separate incidents/incidents.json file.
  let incidents: Incident[] = [];
  const inlineIncidents = raw.critical_incident_database;
  if (Array.isArray(inlineIncidents) && inlineIncidents.length > 0) {
    incidents = inlineIncidents;
  } else {
    const incidentsFile = path.join(dir, "incidents", "incidents.json");
    const rawIncidents = readJson<Incident[]>(incidentsFile);
    if (rawIncidents && Array.isArray(rawIncidents)) {
      incidents = rawIncidents;
    }
  }

  return {
    slug,
    meta: { ...meta, construct_count: constructCount },
    era,
    perceptual_lens: raw.perceptual_lens ?? {
      statement: "",
      what_they_notice_first: "",
      what_they_ignore: "",
    },
    bipolar_constructs: constructs,
    blind_spots: raw.blind_spots ?? [],
    behavioral_divergence_predictions:
      raw.behavioral_divergence_predictions ?? [],
    incidents,
  };
}

export function getAllFrameworks(): Framework[] {
  return DISPLAY_ORDER.map((slug) => getFramework(slug)).filter(
    (f): f is Framework => f !== null
  );
}

export function getValidation(slug: FrameworkSlug): ValidationResult | null {
  const filePath = path.join(
    frameworksDir(),
    slug,
    "validation",
    "tier1_results.json"
  );
  return readJson<ValidationResult>(filePath);
}
