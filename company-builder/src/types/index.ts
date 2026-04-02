export type DomainCategory = 'science' | 'strategy' | 'governance' | 'art' | 'computing';

export type RoleId =
  | 'ceo' | 'cto' | 'cmo' | 'cfo' | 'coo'
  | 'vp_engineering' | 'vp_sales' | 'vp_product'
  | 'head_rd' | 'head_strategy' | 'head_operations'
  | 'advisor';

export type DecisionSpeed = 'fast' | 'deliberate' | 'variable';
export type RiskTolerance = 'high' | 'moderate' | 'calculated' | 'low';

export interface MindArchetype {
  id: string;
  name: string;
  archetype: string;
  domain: string;
  domainCategory: DomainCategory;
  accentColor: string;
  era: string;
  one_liner: string;
  communication_style: string;
  decision_speed: DecisionSpeed;
  risk_tolerance: RiskTolerance;
  best_roles: RoleId[];
  natural_strengths: string[];
  natural_weaknesses: string[];
}

export interface PlacedMind {
  id: string;
  archetypeId: string;
  role: RoleId | null;
  position: { x: number; y: number };
}

export interface Role {
  id: RoleId;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

export interface Company {
  name: string;
  mission: string;
}
