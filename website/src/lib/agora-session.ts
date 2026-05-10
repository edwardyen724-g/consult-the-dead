import type { ConsensusResult, ResearchSource } from "@/lib/agon/types";

export type AgoraStage = "topic" | "research" | "council" | "agon" | "consensus";

export interface AgoraTurnSnapshot {
  mindSlug: string;
  mindName: string;
  round: number;
  text: string;
  done: boolean;
}

export interface AgoraResearchSnapshot {
  summary: string;
  sources: ResearchSource[];
}

export interface AgoraSessionState {
  stage: AgoraStage;
  topic: string;
  researchEnabled: boolean;
  council: string[];
  turns: AgoraTurnSnapshot[];
  activeRound: number | null;
  activeMindSlug: string | null;
  consensus: ConsensusResult | null;
  consensusNode: string | null;
  quotaRemaining: number | undefined;
  researchData: AgoraResearchSnapshot | null;
}

interface AgoraSessionEnvelope {
  version: 1;
  state: AgoraSessionState;
}

export const AGORA_SESSION_STORAGE_KEY = "ctd-agora-session-v1";
const AGORA_STAGE_VALUES: AgoraStage[] = ["topic", "research", "council", "agon", "consensus"];

function hasMeaningfulProgress(state: AgoraSessionState) {
  return (
    state.stage !== "topic" ||
    state.topic.trim().length > 0 ||
    state.researchEnabled ||
    state.council.length > 0 ||
    state.turns.length > 0 ||
    state.consensus !== null ||
    state.researchData !== null ||
    state.quotaRemaining !== undefined
  );
}

function normalizeState(state: AgoraSessionState): AgoraSessionState {
  return {
    ...state,
    activeRound: state.activeRound ?? null,
    activeMindSlug: state.activeMindSlug ?? null,
    consensusNode: state.consensusNode ?? null,
    quotaRemaining: state.quotaRemaining ?? undefined,
  };
}

function isAgoraStage(value: unknown): value is AgoraStage {
  return typeof value === "string" && AGORA_STAGE_VALUES.includes(value as AgoraStage);
}

export function buildAgoraSessionSnapshot(state: AgoraSessionState): AgoraSessionEnvelope | null {
  if (!hasMeaningfulProgress(state)) return null;

  return {
    version: 1,
    state: normalizeState({
      ...state,
      // Transient loading/error flags are intentionally not persisted.
      activeRound: state.activeRound,
      activeMindSlug: state.activeMindSlug,
      consensusNode: state.consensusNode,
      quotaRemaining: state.quotaRemaining,
    }),
  };
}

export function encodeAgoraSession(state: AgoraSessionState): string | null {
  const snapshot = buildAgoraSessionSnapshot(state);
  return snapshot ? JSON.stringify(snapshot) : null;
}

export function decodeAgoraSession(raw: string | null): AgoraSessionState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AgoraSessionEnvelope>;
    if (parsed.version !== 1 || !parsed.state || typeof parsed.state !== "object") {
      return null;
    }

    const state = parsed.state as Partial<AgoraSessionState>;
    if (
      !isAgoraStage(state.stage) ||
      typeof state.topic !== "string" ||
      typeof state.researchEnabled !== "boolean" ||
      !Array.isArray(state.council) ||
      !Array.isArray(state.turns)
    ) {
      return null;
    }

    return normalizeState({
      stage: state.stage as AgoraStage,
      topic: state.topic,
      researchEnabled: state.researchEnabled,
      council: state.council.filter((slug): slug is string => typeof slug === "string"),
      turns: state.turns
        .map((turn) => {
          if (
            !turn ||
            typeof turn !== "object" ||
            typeof turn.mindSlug !== "string" ||
            typeof turn.mindName !== "string" ||
            typeof turn.round !== "number" ||
            typeof turn.text !== "string" ||
            typeof turn.done !== "boolean"
          ) {
            return null;
          }

          return {
            mindSlug: turn.mindSlug,
            mindName: turn.mindName,
            round: turn.round,
            text: turn.text,
            done: turn.done,
          };
        })
        .filter((turn): turn is AgoraTurnSnapshot => turn !== null),
      activeRound: typeof state.activeRound === "number" ? state.activeRound : null,
      activeMindSlug: typeof state.activeMindSlug === "string" ? state.activeMindSlug : null,
      consensus:
        state.consensus && typeof state.consensus === "object"
          ? (state.consensus as ConsensusResult)
          : null,
      consensusNode: typeof state.consensusNode === "string" ? state.consensusNode : null,
      quotaRemaining: typeof state.quotaRemaining === "number" ? state.quotaRemaining : undefined,
      researchData:
        state.researchData && typeof state.researchData === "object"
          ? {
              summary:
                typeof state.researchData.summary === "string" ? state.researchData.summary : "",
              sources: Array.isArray(state.researchData.sources)
                ? state.researchData.sources.filter(
                    (source): source is ResearchSource =>
                      !!source &&
                      typeof source === "object" &&
                      typeof source.title === "string" &&
                      typeof source.url === "string" &&
                      source.url.trim().length > 0,
                  )
                : [],
            }
          : null,
    });
  } catch {
    return null;
  }
}
