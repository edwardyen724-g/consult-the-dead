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
  // Roster expansion 2026-05 (task 8987b12a / capsule ff13fd3d) — 7 new minds
  // taking the live roster from 19 → 26. Einstein remains hidden pending legal review.
  "abraham-lincoln",
  "andrew-carnegie",
  "florence-nightingale",
  "frederick-douglass",
  "julius-caesar",
  "napoleon-bonaparte",
  "seneca",
  // SEO listicle expansion 2026-05 (task c7400a14) — Steve Jobs added for product insight page
  "steve-jobs",
  // Wave 8 roster expansion 2026-05 — Galileo Galilei (framework already extracted)
  "galileo-galilei",
  // Socrates added as 28th live mind (task ce256e9b / capsule a24e6e0c) — 2026-05
  "socrates",
  // Aristotle added as 29th live mind (task 90292bb6) — 2026-05
  "aristotle",
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
  // Roster expansion 2026-05 — 7 new minds
  "abraham-lincoln": "var(--color-lincoln)",
  "andrew-carnegie": "var(--color-carnegie)",
  "florence-nightingale": "var(--color-nightingale)",
  "frederick-douglass": "var(--color-douglass)",
  "julius-caesar": "var(--color-caesar)",
  "napoleon-bonaparte": "var(--color-napoleon)",
  "seneca": "var(--color-seneca)",
  // SEO listicle expansion 2026-05 (task c7400a14)
  "steve-jobs": "var(--color-jobs)",
  // Wave 8 roster expansion 2026-05
  "galileo-galilei": "var(--color-galileo)",
  // Socrates added as 28th live mind 2026-05
  "socrates": "var(--color-socrates)",
  // Aristotle added as 29th live mind 2026-05
  "aristotle": "var(--color-aristotle)",
};

/* ── Fallback era strings (some JSONs lack born/died) ── */
const ERA_FALLBACK: Record<FrameworkSlug, string> = {
  "isaac-newton": "1643–1727",
  // "albert-einstein": "1879–1955", // HIDDEN 2026-04-16
  "marie-curie": "1867–1934",
  "niccolo-machiavelli": "1469–1527",
  "nikola-tesla": "1856–1943",
  "leonardo-da-vinci": "1452–1519",
  "sun-tzu": "c. 544–496 BC",
  "marcus-aurelius": "121–180 AD",
  "benjamin-franklin": "1706–1790",
  "cicero": "106–43 BC",
  "epictetus": "c. 50–135 AD",
  "thomas-edison": "1847–1931",
  "archimedes": "c. 287–212 BC",
  "john-d-rockefeller": "1839–1937",
  "harriet-tubman": "c. 1822–1913",
  "ada-lovelace": "1815–1852",
  "catherine-the-great": "1729–1796",
  "alexander-the-great": "356–323 BC",
  "cleopatra-vii": "69–30 BC",
  // Roster expansion 2026-05 — 7 new minds
  "abraham-lincoln": "1809–1865",
  "andrew-carnegie": "1835–1919",
  "florence-nightingale": "1820–1910",
  "frederick-douglass": "1818–1895",
  "julius-caesar": "100–44 BC",
  "napoleon-bonaparte": "1769–1821",
  "seneca": "c. 4 BC–65 AD",
  // SEO listicle expansion 2026-05 (task c7400a14)
  "steve-jobs": "1955–2011",
  // Wave 8 roster expansion 2026-05
  "galileo-galilei": "1564–1642",
  // Socrates added as 28th live mind 2026-05
  "socrates": "c. 470–399 BC",
  // Aristotle added as 29th live mind 2026-05
  "aristotle": "384–322 BC",
};

/* ── Display order for the index page ── */
export const DISPLAY_ORDER: FrameworkSlug[] = [
  "socrates",
  "aristotle",
  "galileo-galilei",
  "isaac-newton",
  // "albert-einstein", // HIDDEN 2026-04-16
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
  "marcus-aurelius",
  "seneca",
  "epictetus",
  "cicero",
  "benjamin-franklin",
  "abraham-lincoln",
  "frederick-douglass",
  "thomas-edison",
  "archimedes",
  "john-d-rockefeller",
  "andrew-carnegie",
  "harriet-tubman",
  "florence-nightingale",
  "ada-lovelace",
  "catherine-the-great",
  "alexander-the-great",
  "julius-caesar",
  "napoleon-bonaparte",
  "cleopatra-vii",
  "steve-jobs",
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
    era = `${meta.born}–${meta.died}`;
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
