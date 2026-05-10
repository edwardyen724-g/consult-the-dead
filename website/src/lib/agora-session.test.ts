import {
  buildAgoraSessionSnapshot,
  decodeAgoraSession,
  encodeAgoraSession,
  type AgoraSessionState,
} from "./agora-session";

const baseState: AgoraSessionState = {
  stage: "topic",
  topic: "",
  researchEnabled: false,
  council: [],
  turns: [],
  activeRound: null,
  activeMindSlug: null,
  consensus: null,
  consensusNode: null,
  quotaRemaining: undefined,
  researchData: null,
};

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

describe("agora session persistence", () => {
  it("skips empty topic-only state", () => {
    expect(buildAgoraSessionSnapshot(baseState)).toBeNull();
    expect(encodeAgoraSession(baseState)).toBeNull();
  });

  it("persists non-topic progress even when the topic is empty", () => {
    const snapshot = buildAgoraSessionSnapshot({
      ...baseState,
      stage: "research",
      researchEnabled: true,
    });

    expect(snapshot).toEqual({
      version: 1,
      state: {
        ...baseState,
        stage: "research",
        researchEnabled: true,
        activeRound: null,
        activeMindSlug: null,
        consensusNode: null,
        quotaRemaining: undefined,
      },
    });
  });

  it("round-trips meaningful progress and normalizes transient fields", () => {
    const state: AgoraSessionState = {
      ...baseState,
      stage: "agon",
      topic: "Should Consult The Dead ship a session store?",
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
      activeMindSlug: null,
      consensus: consensus as AgoraSessionState["consensus"],
      consensusNode: null,
      quotaRemaining: 7,
      researchData: {
        summary: "Research summary",
        sources: [
          { title: "Source A", url: "https://example.com/a" },
          { title: "Ignored source", url: "" } as { title: string; url: string },
        ],
      },
    };

    const encoded = encodeAgoraSession(state);
    expect(encoded).not.toBeNull();

    const decoded = decodeAgoraSession(encoded);
    expect(decoded).toEqual({
      ...state,
      activeRound: 3,
      activeMindSlug: null,
      consensusNode: null,
      researchData: {
        summary: "Research summary",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      },
    });
  });

  it("filters malformed payload data while keeping valid persisted progress", () => {
    const encoded = JSON.stringify({
      version: 1,
      state: {
        stage: "consensus",
        topic: "Should we keep this session?",
        researchEnabled: true,
        council: ["framework-forge", 123, null, "retention-lab"],
        turns: [
          {
            mindSlug: "framework-forge",
            mindName: "Framework Forge",
            round: 2,
            text: "Keep the state.",
            done: false,
          },
          null,
          {
            mindSlug: "retention-lab",
            mindName: 99,
            round: "3",
            text: "Ignore me.",
            done: true,
          },
        ],
        activeRound: "3",
        activeMindSlug: 99,
        consensus: consensus,
        consensusNode: 42,
        quotaRemaining: "7",
        researchData: {
          summary: 99,
          sources: [
            { title: "Source A", url: "https://example.com/a" },
            { title: "Source B", url: "" },
            { title: 10, url: "https://example.com/c" },
            null,
          ],
        },
      },
    });

    expect(decodeAgoraSession(encoded)).toEqual({
      stage: "consensus",
      topic: "Should we keep this session?",
      researchEnabled: true,
      council: ["framework-forge", "retention-lab"],
      turns: [
        {
          mindSlug: "framework-forge",
          mindName: "Framework Forge",
          round: 2,
          text: "Keep the state.",
          done: false,
        },
      ],
      activeRound: null,
      activeMindSlug: null,
      consensus: consensus as AgoraSessionState["consensus"],
      consensusNode: null,
      quotaRemaining: undefined,
      researchData: {
        summary: "",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      },
    });
  });

  it("retains string identifiers and falls back when research sources are missing", () => {
    const encoded = JSON.stringify({
      version: 1,
      state: {
        stage: "agon",
        topic: "How should we proceed?",
        researchEnabled: false,
        council: ["framework-forge"],
        turns: [],
        activeRound: 2,
        activeMindSlug: "framework-forge",
        consensus: consensus,
        consensusNode: "node-7",
        quotaRemaining: 0,
        researchData: {
          summary: "Research summary",
          sources: "not-an-array",
        },
      },
    });

    expect(decodeAgoraSession(encoded)).toEqual({
      stage: "agon",
      topic: "How should we proceed?",
      researchEnabled: false,
      council: ["framework-forge"],
      turns: [],
      activeRound: 2,
      activeMindSlug: "framework-forge",
      consensus: consensus as AgoraSessionState["consensus"],
      consensusNode: "node-7",
      quotaRemaining: 0,
      researchData: {
        summary: "Research summary",
        sources: [],
      },
    });
  });

  it("rejects malformed payloads", () => {
    expect(decodeAgoraSession(null)).toBeNull();
    expect(decodeAgoraSession("not-json")).toBeNull();
    expect(
      decodeAgoraSession(
        JSON.stringify({
          version: 1,
          state: {
            topic: "",
            researchEnabled: false,
            council: [],
            turns: [],
          },
        }),
      ),
    ).toBeNull();
    expect(
      decodeAgoraSession(
        JSON.stringify({
          version: 2,
          state: baseState,
        }),
      ),
    ).toBeNull();
  });
});
