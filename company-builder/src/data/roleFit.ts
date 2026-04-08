import type { RoleId } from '@/types';

export type FitLevel = 'strong' | 'moderate' | 'poor';

/**
 * Role-fit affinity matrix: maps each mind archetype to their fit level for each role.
 * "strong" = role is in their best_roles (green indicator)
 * "moderate" = role is adjacent to their strengths (amber indicator)
 * "poor" = role conflicts with their domain (red indicator)
 */
export const ROLE_FIT: Record<string, Record<RoleId, FitLevel>> = {
  'albert-einstein': {
    ceo: 'poor',
    cto: 'moderate',
    cmo: 'poor',
    cfo: 'poor',
    coo: 'poor',
    vp_engineering: 'moderate',
    vp_sales: 'poor',
    vp_product: 'moderate',
    head_rd: 'strong',
    head_strategy: 'moderate',
    head_operations: 'poor',
    advisor: 'strong',
  },
  'alexander-the-great': {
    ceo: 'strong',
    cto: 'poor',
    cmo: 'moderate',
    cfo: 'poor',
    coo: 'strong',
    vp_engineering: 'poor',
    vp_sales: 'moderate',
    vp_product: 'poor',
    head_rd: 'poor',
    head_strategy: 'strong',
    head_operations: 'moderate',
    advisor: 'moderate',
  },
  'leonardo-da-vinci': {
    ceo: 'poor',
    cto: 'moderate',
    cmo: 'moderate',
    cfo: 'poor',
    coo: 'poor',
    vp_engineering: 'strong',
    vp_sales: 'poor',
    vp_product: 'strong',
    head_rd: 'strong',
    head_strategy: 'poor',
    head_operations: 'poor',
    advisor: 'moderate',
  },
  'cleopatra-vii': {
    ceo: 'strong',
    cto: 'poor',
    cmo: 'strong',
    cfo: 'moderate',
    coo: 'moderate',
    vp_engineering: 'poor',
    vp_sales: 'strong',
    vp_product: 'poor',
    head_rd: 'poor',
    head_strategy: 'moderate',
    head_operations: 'moderate',
    advisor: 'moderate',
  },
  'sun-tzu': {
    ceo: 'moderate',
    cto: 'poor',
    cmo: 'poor',
    cfo: 'poor',
    coo: 'strong',
    vp_engineering: 'poor',
    vp_sales: 'moderate',
    vp_product: 'poor',
    head_rd: 'poor',
    head_strategy: 'strong',
    head_operations: 'moderate',
    advisor: 'strong',
  },
  'nikola-tesla': {
    ceo: 'poor',
    cto: 'strong',
    cmo: 'poor',
    cfo: 'poor',
    coo: 'poor',
    vp_engineering: 'strong',
    vp_sales: 'poor',
    vp_product: 'moderate',
    head_rd: 'strong',
    head_strategy: 'poor',
    head_operations: 'poor',
    advisor: 'moderate',
  },
  'catherine-the-great': {
    ceo: 'strong',
    cto: 'poor',
    cmo: 'moderate',
    cfo: 'moderate',
    coo: 'strong',
    vp_engineering: 'poor',
    vp_sales: 'moderate',
    vp_product: 'poor',
    head_rd: 'poor',
    head_strategy: 'moderate',
    head_operations: 'strong',
    advisor: 'moderate',
  },
  'isaac-newton': {
    ceo: 'poor',
    cto: 'strong',
    cmo: 'poor',
    cfo: 'strong',
    coo: 'poor',
    vp_engineering: 'moderate',
    vp_sales: 'poor',
    vp_product: 'poor',
    head_rd: 'strong',
    head_strategy: 'moderate',
    head_operations: 'moderate',
    advisor: 'moderate',
  },
  'niccolo-machiavelli': {
    ceo: 'moderate',
    cto: 'poor',
    cmo: 'moderate',
    cfo: 'moderate',
    coo: 'strong',
    vp_engineering: 'poor',
    vp_sales: 'moderate',
    vp_product: 'poor',
    head_rd: 'poor',
    head_strategy: 'strong',
    head_operations: 'moderate',
    advisor: 'strong',
  },
  'marie-curie': {
    ceo: 'poor',
    cto: 'strong',
    cmo: 'poor',
    cfo: 'poor',
    coo: 'poor',
    vp_engineering: 'strong',
    vp_sales: 'poor',
    vp_product: 'moderate',
    head_rd: 'strong',
    head_strategy: 'poor',
    head_operations: 'moderate',
    advisor: 'moderate',
  },
  'ada-lovelace': {
    ceo: 'poor',
    cto: 'strong',
    cmo: 'poor',
    cfo: 'poor',
    coo: 'poor',
    vp_engineering: 'strong',
    vp_sales: 'poor',
    vp_product: 'strong',
    head_rd: 'moderate',
    head_strategy: 'poor',
    head_operations: 'poor',
    advisor: 'moderate',
  },
};

/**
 * Get the fit level for a given mind and role.
 * Returns undefined if mind not found.
 */
export function getRoleFit(archetypeId: string, roleId: RoleId): FitLevel | undefined {
  return ROLE_FIT[archetypeId]?.[roleId];
}

/**
 * Get the CSS color for a fit level.
 */
export function getFitColor(fit: FitLevel): string {
  switch (fit) {
    case 'strong': return '#4CAF50';
    case 'moderate': return '#FFC107';
    case 'poor': return '#F44336';
  }
}
