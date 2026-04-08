/**
 * Shared color utilities for the Great Mind Company Builder.
 * Consolidates hexToRgb, blendColors, and warmth color logic
 * that was previously duplicated across 5+ files.
 */

/** Convert a hex color (#RRGGBB) to an "R, G, B" string for use in rgba() */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/** Parse hex to { r, g, b } object */
export function hexToRgbObj(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/** Blend two hex colors 50/50 and return "R, G, B" string */
export function blendColors(color1: string, color2: string): string {
  const a = hexToRgbObj(color1);
  const b = hexToRgbObj(color2);
  return `${Math.round((a.r + b.r) / 2)}, ${Math.round((a.g + b.g) / 2)}, ${Math.round((a.b + b.b) / 2)}`;
}

/** Mind accent colors — canonical source */
export const MIND_COLORS: Record<string, string> = {
  'albert-einstein': '#6C63FF',
  'leonardo-da-vinci': '#D4A853',
  'sun-tzu': '#2D7A4F',
  'cleopatra': '#C2185B',
  'nikola-tesla': '#00BCD4',
  'isaac-newton': '#7B8794',
  'niccolo-machiavelli': '#8B0000',
  'alexander-the-great': '#FFB300',
  'catherine-the-great': '#9C27B0',
  'marie-curie': '#26A69A',
  'ada-lovelace': '#EC407A',
};

/** Warmth-based connection colors */
export function getWarmthRgb(warmth: 'synergy' | 'tension' | 'neutral'): string {
  switch (warmth) {
    case 'synergy':
      return '120, 200, 160';
    case 'tension':
      return '220, 120, 100';
    case 'neutral':
      return '180, 180, 180';
  }
}

/** Fit-level colors */
export const FIT_COLORS = {
  strong: '#4CAF50',
  moderate: '#FFC107',
  poor: '#F44336',
} as const;
