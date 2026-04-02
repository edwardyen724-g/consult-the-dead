/**
 * Chemistry matrix: predefined pairings between mind archetypes.
 * Keys are sorted alphabetically and joined with '|'.
 */

export type ChemistryWarmth = 'synergy' | 'tension' | 'neutral';

export interface ChemistryPair {
  warmth: ChemistryWarmth;
  hint: string;
}

const RAW_CHEMISTRY: Record<string, ChemistryPair> = {
  'albert-einstein|nikola-tesla': {
    warmth: 'synergy',
    hint: 'Rival visionaries — push each other toward impossible breakthroughs',
  },
  'albert-einstein|isaac-newton': {
    warmth: 'tension',
    hint: 'Fundamental disagreements about the nature of reality',
  },
  'niccolo-machiavelli|sun-tzu': {
    warmth: 'synergy',
    hint: 'Masters of strategic patience and calculated action',
  },
  'ada-lovelace|leonardo-da-vinci': {
    warmth: 'synergy',
    hint: 'Cross-disciplinary visionaries bridging art and logic',
  },
  'nikola-tesla|steve-jobs': {
    warmth: 'tension',
    hint: 'Both visionary but clash on product vs pure invention',
  },
  'catherine-the-great|cleopatra-vii': {
    warmth: 'synergy',
    hint: 'Power through intelligence — natural governance allies',
  },
  'alexander-the-great|sun-tzu': {
    warmth: 'tension',
    hint: 'Bold conquest vs patient strategy — explosive friction',
  },
  'albert-einstein|marie-curie': {
    warmth: 'synergy',
    hint: 'Kindred spirits in relentless scientific pursuit',
  },
  'isaac-newton|marie-curie': {
    warmth: 'synergy',
    hint: 'Methodical rigor meets experimental persistence',
  },
  'ada-lovelace|nikola-tesla': {
    warmth: 'synergy',
    hint: 'Algorithmic elegance meets systemic invention',
  },
  'alexander-the-great|steve-jobs': {
    warmth: 'synergy',
    hint: 'Charismatic conquerors who reshape reality by force of will',
  },
  'cleopatra-vii|niccolo-machiavelli': {
    warmth: 'tension',
    hint: 'Both read power but differ on charm vs cynicism',
  },
  'catherine-the-great|niccolo-machiavelli': {
    warmth: 'synergy',
    hint: 'Pragmatic reformers who understand institutional power',
  },
  'isaac-newton|ada-lovelace': {
    warmth: 'synergy',
    hint: 'Mathematical foundations meet computational vision',
  },
  'leonardo-da-vinci|steve-jobs': {
    warmth: 'synergy',
    hint: 'Aesthetic obsessives who merge form and function',
  },
  'alexander-the-great|cleopatra-vii': {
    warmth: 'tension',
    hint: 'Competing empires — mutual respect, zero trust',
  },
  'leonardo-da-vinci|nikola-tesla': {
    warmth: 'synergy',
    hint: 'Restless inventors who see decades ahead',
  },
  'marie-curie|nikola-tesla': {
    warmth: 'synergy',
    hint: 'Tireless experimentalists with shared disregard for comfort',
  },
  'sun-tzu|steve-jobs': {
    warmth: 'tension',
    hint: 'Patient strategy clashes with reality-distortion urgency',
  },
  'albert-einstein|leonardo-da-vinci': {
    warmth: 'synergy',
    hint: 'Boundless curiosity bridging art and physics',
  },
  'catherine-the-great|alexander-the-great': {
    warmth: 'tension',
    hint: 'Empire-builders with clashing governance philosophies',
  },
};

/**
 * Look up chemistry between two mind archetype IDs.
 * Returns undefined if no notable pairing exists.
 */
export function getChemistry(idA: string, idB: string): ChemistryPair | undefined {
  const key = [idA, idB].sort().join('|');
  return RAW_CHEMISTRY[key];
}
