import type { FrameworkSlug } from "@/lib/frameworks";

export interface AgonRequest {
  topic: string;
  mindSlugs: FrameworkSlug[];
  rounds?: number;
  research?: boolean;
}

export interface ResearchSource {
  title: string;
  url: string;
}

export type AgonEvent =
  | { type: "research_started" }
  | { type: "research_line"; text: string }
  | { type: "research_done"; sources: ResearchSource[]; summary: string }
  | { type: "round_start"; round: number }
  | { type: "turn_start"; mindSlug: FrameworkSlug; mindName: string; round: number }
  | { type: "turn_chunk"; mindSlug: FrameworkSlug; text: string }
  | { type: "turn_done"; mindSlug: FrameworkSlug; mindName: string; round: number; content: string }
  | { type: "consensus_started" }
  | { type: "consensus_done"; consensus: ConsensusResult }
  | { type: "agon_done" }
  | { type: "error"; message: string; rateLimited?: boolean };

export interface ConsensusResult {
  points: string;
  pointsSummary: string;
  tensions: string;
  tensionsSummary: string;
  action: string;
  actionSummary: string;
  steps: string[];
  stepsSummary: string;
  risks: string;
  risksSummary: string;
}

export interface AgonTurn {
  mindSlug: FrameworkSlug;
  mindName: string;
  round: number;
  content: string;
}
