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

  it("rejects malformed payloads", () => {
    expect(decodeAgoraSession("not-json")).toBeNull();
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
