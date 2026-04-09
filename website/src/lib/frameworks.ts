import fs from "fs";
import path from "path";

/* ── Allowed slugs (public, validated frameworks only) ── */
export const ALLOWED_SLUGS = [
  "isaac-newton",
  "albert-einstein",
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
] as const;

export type FrameworkSlug = (typeof ALLOWED_SLUGS)[number];

/* ── Slug → CSS custom-property name ── */
export const SLUG_COLOR_VAR: Record<FrameworkSlug, string> = {
  "isaac-newton": "var(--color-newton)",
  "albert-einstein": "var(--color-einstein)",
  "marie-curie": "var(--color-curie)",
  "niccolo-machiavelli": "var(--color-machiavelli)",
  "nikola-tesla": "var(--color-tesla)",
  "leonardo-da-vinci": "var(--color-leonardo)",
  "sun-tzu": "var(--color-suntzu)",
};

/* ── Fallback era strings (some JSONs lack born/died) ── */
const ERA_FALLBACK: Record<FrameworkSlug, string> = {
  "isaac-newton": "1643\u20131727",
  "albert-einstein": "1879\u20131955",
  "marie-curie": "1867\u20131934",
  "niccolo-machiavelli": "1469\u20131527",
  "nikola-tesla": "1856\u20131943",
  "leonardo-da-vinci": "1452\u20131519",
  "sun-tzu": "c.\u2009544\u2013496 BC",
};

/* ── Display order for the index page ── */
export const DISPLAY_ORDER: FrameworkSlug[] = [
  "isaac-newton",
  "albert-einstein",
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
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
  return path.resolve(process.cwd(), "..", "frameworks");
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

  // Read incidents from separate file if it exists
  let incidents: Incident[] = [];
  const incidentsFile = path.join(dir, "incidents", "incidents.json");
  const rawIncidents = readJson<Incident[]>(incidentsFile);
  if (rawIncidents && Array.isArray(rawIncidents)) {
    incidents = rawIncidents;
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
