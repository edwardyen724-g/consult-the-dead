import type { ConsensusResult, ResearchSource } from "@/lib/agon/types";
import type { AgoraSessionState } from "@/lib/agora-session";

export interface AgoraSessionAppState {
  stage: AgoraSessionState["stage"];
  topic: string;
  apiKey: string;
  researchEnabled: boolean;
  council: string[];
  turns: AgoraSessionState["turns"];
  activeRound: number | null;
  activeMindSlug: string | null;
  consensus: ConsensusResult | null;
  consensusLoading: boolean;
  consensusNode: string | null;
  error: string | null;
  rateLimited: boolean;
  quotaRemaining: number | undefined;
  researchLoading: boolean;
  researchData: {
    summary: string;
    sources: ResearchSource[];
  } | null;
}

const INITIAL_SESSION_APP_STATE: AgoraSessionAppState = {
  stage: "topic",
  topic: "",
  apiKey: "",
  researchEnabled: false,
  council: [],
  turns: [],
  activeRound: null,
  activeMindSlug: null,
  consensus: null,
  consensusLoading: false,
  consensusNode: null,
  error: null,
  rateLimited: false,
  quotaRemaining: undefined,
  researchLoading: false,
  researchData: null,
};

export function buildAgoraSessionSnapshot(
  state: AgoraSessionAppState,
): AgoraSessionState {
  return {
    stage: state.stage,
    topic: state.topic,
    researchEnabled: state.researchEnabled,
    council: state.council,
    turns: state.turns,
    activeRound: state.activeRound,
    activeMindSlug: state.activeMindSlug,
    consensus: state.consensus,
    consensusNode: state.consensusNode,
    quotaRemaining: state.quotaRemaining,
    researchData: state.researchData,
  };
}

export function restoreAgoraState(
  current: AgoraSessionAppState,
  session: AgoraSessionState | null,
  apiKey: string | null,
): AgoraSessionAppState {
  const nextApiKey = apiKey ?? current.apiKey;

  if (!session) {
    return nextApiKey === current.apiKey ? current : { ...current, apiKey: nextApiKey };
  }

  return {
    ...INITIAL_SESSION_APP_STATE,
    ...current,
    apiKey: nextApiKey,
    stage: session.stage,
    topic: session.topic,
    researchEnabled: session.researchEnabled,
    council: session.council,
    turns: session.turns,
    activeRound: session.activeRound,
    activeMindSlug: session.activeMindSlug,
    consensus: session.consensus,
    consensusNode: session.consensusNode,
    quotaRemaining: session.quotaRemaining,
    researchData: session.researchData,
    error: null,
    rateLimited: false,
    consensusLoading: false,
    researchLoading: false,
  };
}
