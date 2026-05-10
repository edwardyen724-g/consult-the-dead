import { describe, expect, it } from "vitest";
import { restoreAgoraAppState, serializeAgoraAppSession } from "./AgoraApp";
import { buildAgoraSessionSnapshot } from "./agora-session-store";
import {
  decodeAgoraSession,
  encodeAgoraSession,
  type AgoraSessionState,
} from "@/lib/agora-session";

type AppState = Parameters<typeof restoreAgoraAppState>[0];

const consensus = {
  points: "point",
  pointsSummary: "summary",
  tensions: "tension",
  tensionsSummary: "tension summary",
  action: "action",
  actionSummary: "action summary",
  steps: ["step-1", "step-2"],
  stepsSummary: "steps summary",
  risks: "risk",
  risksSummary: "risk summary",
};

const baseState: AppState = {
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

describe("AgoraApp session persistence", () => {
  it("restores the saved app session and browser api key", () => {
    const savedSessionRaw = encodeAgoraSession({
      stage: "agon",
      topic: "Should Consult The Dead keep this session alive?",
      researchEnabled: true,
      council: ["framework-forge", "retention-lab"],
      turns: [
        {
          mindSlug: "framework-forge",
          mindName: "Framework Forge",
          round: 1,
          text: "Persist the session state.",
          done: true,
        },
      ],
      activeRound: 3,
      activeMindSlug: "framework-forge",
      consensus: consensus as AgoraSessionState["consensus"],
      consensusNode: "ACTION",
      quotaRemaining: 4,
      researchData: {
        summary: "Research summary",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      },
    })!;

    const restored = restoreAgoraAppState(
      {
        ...baseState,
        apiKey: "browser-key",
        stage: "research",
        topic: "Old topic",
        council: ["old-mind"],
        activeRound: 1,
        activeMindSlug: "old-mind",
        consensus: consensus as AppState["consensus"],
        consensusNode: null,
        quotaRemaining: 2,
        researchData: null,
        error: "stale error",
        rateLimited: true,
        consensusLoading: true,
        researchLoading: true,
      },
      savedSessionRaw,
      "saved-browser-key",
    );

    expect(restored).toEqual({
      shouldClearSavedSession: false,
      state: {
        ...baseState,
        apiKey: "saved-browser-key",
        stage: "agon",
        topic: "Should Consult The Dead keep this session alive?",
        researchEnabled: true,
        council: ["framework-forge", "retention-lab"],
        turns: [
          {
            mindSlug: "framework-forge",
            mindName: "Framework Forge",
            round: 1,
            text: "Persist the session state.",
            done: true,
          },
        ],
        activeRound: 3,
        activeMindSlug: "framework-forge",
        consensus: consensus as AppState["consensus"],
        consensusNode: "ACTION",
        quotaRemaining: 4,
        researchData: {
          summary: "Research summary",
          sources: [{ title: "Source A", url: "https://example.com/a" }],
        },
        error: null,
        rateLimited: false,
        consensusLoading: false,
        researchLoading: false,
      },
    });
  });

  it("drops malformed saved session state and keeps the current browser key", () => {
    const current = {
      ...baseState,
      apiKey: "browser-key",
      stage: "council",
      topic: "Current topic",
      researchEnabled: true,
      council: ["framework-forge"],
    };

    expect(restoreAgoraAppState(current, "not-json", null)).toEqual({
      shouldClearSavedSession: true,
      state: current,
    });
    expect(restoreAgoraAppState(current, "not-json", "saved-browser-key")).toEqual({
      shouldClearSavedSession: true,
      state: {
        ...current,
        apiKey: "saved-browser-key",
      },
    });
  });

  it("serializes only meaningful progress and round-trips through storage", () => {
    expect(serializeAgoraAppSession(baseState)).toBeNull();

    const session: AppState = {
      ...baseState,
      stage: "research",
      topic: "Should Consult The Dead persist session state?",
      researchEnabled: true,
      council: ["framework-forge", "retention-lab"],
      turns: [],
      activeRound: null,
      activeMindSlug: null,
      consensus: null,
      consensusNode: null,
      quotaRemaining: undefined,
      researchData: null,
    };

    const encoded = serializeAgoraAppSession(session);
    expect(encoded).toBe(encodeAgoraSession(buildAgoraSessionSnapshot(session)));
    expect(decodeAgoraSession(encoded)).toEqual({
      stage: "research",
      topic: "Should Consult The Dead persist session state?",
      researchEnabled: true,
      council: ["framework-forge", "retention-lab"],
      turns: [],
      activeRound: null,
      activeMindSlug: null,
      consensus: null,
      consensusNode: null,
      quotaRemaining: undefined,
      researchData: null,
    });
  });
});
