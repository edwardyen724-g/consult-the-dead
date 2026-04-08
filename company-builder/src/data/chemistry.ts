/**
 * Chemistry matrix: predefined pairings between mind archetypes.
 * Keys are sorted alphabetically and joined with '|'.
 * Enhanced with scores and detailed explanations for Sprint 3.
 */

export type ChemistryWarmth = 'synergy' | 'tension' | 'neutral';

export interface ChemistryPair {
  score: number;           // 0-100
  warmth: ChemistryWarmth;
  hint: string;            // Short one-liner
  detail: string;          // Longer explanation for detail panel / hover
}

const RAW_CHEMISTRY: Record<string, ChemistryPair> = {
  'albert-einstein|nikola-tesla': {
    score: 82,
    warmth: 'synergy',
    hint: 'Rival visionaries — push each other toward impossible breakthroughs',
    detail: 'Einstein\'s theoretical physics and Tesla\'s applied engineering create a powerful complementary loop. Einstein provides the mathematical framework; Tesla converts abstract concepts into working systems. Their rivalry is fuel, not friction — each pushes the other to prove their approach superior, accelerating innovation.',
  },
  'albert-einstein|isaac-newton': {
    score: 35,
    warmth: 'tension',
    hint: 'Fundamental disagreements about the nature of reality',
    detail: 'Newton\'s deterministic clockwork universe collides with Einstein\'s relativistic spacetime. Newton demands rigorous proof and absolute certainty; Einstein embraces thought experiments and paradox. Both brilliant, but their philosophical foundations are incompatible — productive only if someone mediates.',
  },
  'niccolo-machiavelli|sun-tzu': {
    score: 88,
    warmth: 'synergy',
    hint: 'Masters of strategic patience and calculated action',
    detail: 'Both think in systems of power, deception, and timing. Sun Tzu provides the strategic architecture; Machiavelli adds political realism about human nature. Together they create layered strategies that account for both competitive dynamics and internal organizational politics.',
  },
  'ada-lovelace|leonardo-da-vinci': {
    score: 85,
    warmth: 'synergy',
    hint: 'Cross-disciplinary visionaries bridging art and logic',
    detail: 'Lovelace sees algorithmic beauty in everything; da Vinci sees artistic pattern in nature. Both bridge abstraction and application, imagination and rigor. Their collaboration would produce designs that are both computationally sound and aesthetically transcendent.',
  },
  'nikola-tesla|steve-jobs': {
    score: 38,
    warmth: 'tension',
    hint: 'Both visionary but clash on product vs pure invention',
    detail: 'Tesla invents for the sake of human progress; Jobs invents for market dominance. Tesla sees commercialization as a necessary evil; Jobs sees it as the art form itself. Tesla would be frustrated by Jobs\'s willingness to simplify; Jobs would be frustrated by Tesla\'s refusal to ship.',
  },
  'catherine-the-great|cleopatra-vii': {
    score: 78,
    warmth: 'synergy',
    hint: 'Power through intelligence — natural governance allies',
    detail: 'Both mastered governance in male-dominated worlds through intelligence, charm, and strategic alliance-building. Catherine brings institutional reform capability; Cleopatra brings diplomatic finesse and cultural intelligence. Together they create unshakeable organizational foundations.',
  },
  'alexander-the-great|sun-tzu': {
    score: 30,
    warmth: 'tension',
    hint: 'Bold conquest vs patient strategy — explosive friction',
    detail: 'Alexander leads from the front, betting everything on decisive action and personal courage. Sun Tzu advises winning without fighting, through positioning and patience. Alexander would see Sun Tzu as overly cautious; Sun Tzu would see Alexander as recklessly brave. The friction is real but can produce balanced strategy.',
  },
  'albert-einstein|marie-curie': {
    score: 90,
    warmth: 'synergy',
    hint: 'Kindred spirits in relentless scientific pursuit',
    detail: 'Real historical colleagues who deeply respected each other. Einstein\'s theoretical leaps pair perfectly with Curie\'s experimental rigor. Both challenge institutional gatekeeping, both prioritize truth over politics. Their mutual respect creates a research environment where ideas are tested fearlessly.',
  },
  'isaac-newton|marie-curie': {
    score: 75,
    warmth: 'synergy',
    hint: 'Methodical rigor meets experimental persistence',
    detail: 'Newton\'s mathematical foundations give structure to Curie\'s experimental discoveries. Both are meticulous documenters. Newton provides the theoretical framework; Curie provides the empirical validation. The challenge: Newton\'s combative personality may clash with Curie\'s quiet determination.',
  },
  'ada-lovelace|nikola-tesla': {
    score: 80,
    warmth: 'synergy',
    hint: 'Algorithmic elegance meets systemic invention',
    detail: 'Lovelace sees the computational potential in Tesla\'s electrical systems. Tesla sees engineering applications for Lovelace\'s algorithmic thinking. Together they would build systems that are both technically innovative and computationally optimized — true systems engineering.',
  },
  'alexander-the-great|steve-jobs': {
    score: 76,
    warmth: 'synergy',
    hint: 'Charismatic conquerors who reshape reality by force of will',
    detail: 'Both possess a reality distortion field. Alexander conquers physical empires; Jobs conquers markets. Both inspire fanatical loyalty and demand excellence. Their combined charisma could move mountains — but two alpha personalities in one organization risk a power struggle.',
  },
  'cleopatra-vii|niccolo-machiavelli': {
    score: 42,
    warmth: 'tension',
    hint: 'Both read power but differ on charm vs cynicism',
    detail: 'Cleopatra wields power through personal magnetism and genuine alliance-building. Machiavelli wields it through calculated manipulation and institutional design. Cleopatra would find Machiavelli\'s cynicism distasteful; Machiavelli would find Cleopatra\'s reliance on personal charm strategically vulnerable.',
  },
  'catherine-the-great|niccolo-machiavelli': {
    score: 83,
    warmth: 'synergy',
    hint: 'Pragmatic reformers who understand institutional power',
    detail: 'Catherine implemented Machiavelli\'s principles naturally — co-opting opposition, reforming through institutional channels, building power through competence. Machiavelli would see Catherine as a model prince. Their combined understanding of how organizations actually work is unmatched.',
  },
  'isaac-newton|ada-lovelace': {
    score: 79,
    warmth: 'synergy',
    hint: 'Mathematical foundations meet computational vision',
    detail: 'Newton built the calculus; Lovelace saw how computation could extend it. Newton\'s rigorous mathematical framework gives Lovelace\'s algorithmic thinking a solid foundation. Lovelace\'s vision of general-purpose computation would fascinate and challenge Newton\'s worldview.',
  },
  'leonardo-da-vinci|steve-jobs': {
    score: 87,
    warmth: 'synergy',
    hint: 'Aesthetic obsessives who merge form and function',
    detail: 'Both believe beauty and function are inseparable. Da Vinci\'s Renaissance approach to integrating art and engineering mirrors Jobs\'s insistence on design as a core business strategy. Together they would create products that are both technically brilliant and visually stunning.',
  },
  'alexander-the-great|cleopatra-vii': {
    score: 32,
    warmth: 'tension',
    hint: 'Competing empires — mutual respect, zero trust',
    detail: 'Both rule through personal authority and strategic brilliance, but their territorial ambitions make genuine alliance nearly impossible. Alexander\'s direct conquest style clashes with Cleopatra\'s diplomatic approach. Historical predecessors in the same geopolitical sphere — rivals by nature.',
  },
  'leonardo-da-vinci|nikola-tesla': {
    score: 84,
    warmth: 'synergy',
    hint: 'Restless inventors who see decades ahead',
    detail: 'Both visualize complete systems before building them. Da Vinci sketched helicopters centuries early; Tesla envisioned wireless power transmission. Their shared ability to see future technology and prototype relentlessly would create an R&D engine of extraordinary power.',
  },
  'marie-curie|nikola-tesla': {
    score: 77,
    warmth: 'synergy',
    hint: 'Tireless experimentalists with shared disregard for comfort',
    detail: 'Both sacrifice personal wellbeing for their work. Curie\'s methodical experimental approach complements Tesla\'s intuitive engineering. Both are driven by genuine curiosity rather than commercial gain. Together they would build a research lab of relentless, selfless innovation.',
  },
  'sun-tzu|steve-jobs': {
    score: 40,
    warmth: 'tension',
    hint: 'Patient strategy clashes with reality-distortion urgency',
    detail: 'Sun Tzu counsels patience, preparation, and winning through positioning. Jobs demands immediate action, impossible timelines, and market disruption. Sun Tzu would see Jobs\'s urgency as strategic weakness; Jobs would see Sun Tzu\'s patience as lack of ambition. The tension is real but both could learn.',
  },
  'albert-einstein|leonardo-da-vinci': {
    score: 86,
    warmth: 'synergy',
    hint: 'Boundless curiosity bridging art and physics',
    detail: 'Both possess insatiable curiosity that crosses every boundary. Einstein\'s thought experiments are artistic in nature; da Vinci\'s art is grounded in scientific observation. Together they represent the highest form of Renaissance thinking applied to any challenge.',
  },
  'catherine-the-great|alexander-the-great': {
    score: 34,
    warmth: 'tension',
    hint: 'Empire-builders with clashing governance philosophies',
    detail: 'Alexander builds empires through military conquest and personal heroism. Catherine builds them through institutional reform and political maneuvering. Alexander would see Catherine\'s approach as slow; Catherine would see Alexander\'s as unsustainable. Both are right — for different timescales.',
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

/**
 * Get the warmth color for rendering connection lines.
 * Returns CSS color strings.
 */
export function getWarmthColor(warmth: ChemistryWarmth): { stroke: string; glow: string; badge: string } {
  switch (warmth) {
    case 'synergy':
      return {
        stroke: 'rgba(220, 180, 80, 0.8)',     // warm amber
        glow: 'rgba(220, 180, 80, 0.3)',
        badge: 'rgba(220, 180, 80, 0.9)',
      };
    case 'tension':
      return {
        stroke: 'rgba(100, 140, 220, 0.8)',     // cool blue
        glow: 'rgba(100, 140, 220, 0.3)',
        badge: 'rgba(100, 140, 220, 0.9)',
      };
    case 'neutral':
    default:
      return {
        stroke: 'rgba(160, 160, 170, 0.6)',     // neutral gray
        glow: 'rgba(160, 160, 170, 0.2)',
        badge: 'rgba(160, 160, 170, 0.8)',
      };
  }
}
