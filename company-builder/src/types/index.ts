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

export type ConnectionType = 'reporting' | 'collaboration';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
}

export interface Company {
  name: string;
  mission: string;
}

export interface DebateMessage {
  id: string;
  mindId: string;          // PlacedMind.id
  archetypeId: string;     // MindArchetype.id for resolving display info
  content: string;
  round: number;
  timestamp: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Debate {
  id: string;
  topic: string;
  participantIds: string[];
  participantArchetypeIds: string[];
  messages: DebateMessage[];
  status: 'running' | 'complete' | 'error';
  startedAt: string;
  completedAt?: string;
  companyName: string;
  companyMission: string;
  researchBriefing?: string;
  researchSources?: ResearchSource[];
  documents?: string[];
  convergenceSynthesis?: string;
}

export interface ChemistryResult {
  score: number;             // 0-100
  warmth: 'tension' | 'neutral' | 'synergy';
  summary: string;           // Short hint
  detail: string;            // Longer explanation
}

export interface SaveState {
  version: number;
  company: Company;
  placedMinds: PlacedMind[];
  connections: Connection[];
  debates: Debate[];
  savedAt: string;
}
