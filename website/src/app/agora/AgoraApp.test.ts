import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildAgoraSessionSnapshot,
  restoreAgoraState,
  type AgoraSessionAppState,
} from "./agora-session-store";
import { decodeAgoraSession, encodeAgoraSession } from "@/lib/agora-session";

type AppState = AgoraSessionAppState;

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

const agoraAppPath = resolve("src/app/agora/AgoraApp.tsx");

describe("Agora session app helpers", () => {
  it("projects the persisted session snapshot and round-trips it through storage", () => {
    const snapshot = buildAgoraSessionSnapshot({
      ...baseState,
      stage: "agon",
      topic: "Should Consult The Dead persist its state?",
      apiKey: "sk-ant-live-key",
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
      consensusNode: "node-7",
      quotaRemaining: 4,
      researchData: {
        summary: "Research summary",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      },
      error: "transient error",
      rateLimited: true,
      consensusLoading: true,
      researchLoading: true,
    });

    expect(snapshot).toEqual({
      stage: "agon",
      topic: "Should Consult The Dead persist its state?",
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
      consensusNode: "node-7",
      quotaRemaining: 4,
      researchData: {
        summary: "Research summary",
        sources: [{ title: "Source A", url: "https://example.com/a" }],
      },
    });

    expect(decodeAgoraSession(encodeAgoraSession(snapshot))).toEqual(snapshot);
  });

  it("restores the saved session while preserving the browser api key", () => {
    const restored = restoreAgoraState(
      {
        ...baseState,
        apiKey: "browser-key",
        stage: "research",
        topic: "Old topic",
        researchEnabled: false,
        council: ["old-mind"],
        turns: [],
        activeRound: 1,
        activeMindSlug: "old-mind",
        consensus: consensus as AppState["consensus"],
        consensusNode: "old-node",
        quotaRemaining: 2,
        researchData: null,
        error: "stale error",
        rateLimited: true,
        consensusLoading: true,
        researchLoading: true,
      },
      {
        stage: "agon",
        topic: "Should the session restore?",
        researchEnabled: true,
        council: ["framework-forge", "retention-lab"],
        turns: [],
        activeRound: 5,
        activeMindSlug: "retention-lab",
        consensus: consensus as AppState["consensus"],
        consensusNode: "node-9",
        quotaRemaining: 0,
        researchData: {
          summary: "Saved research",
          sources: [],
        },
      },
      "saved-browser-key",
    );

    expect(restored).toEqual({
      ...baseState,
      apiKey: "saved-browser-key",
      stage: "agon",
      topic: "Should the session restore?",
      researchEnabled: true,
      council: ["framework-forge", "retention-lab"],
      turns: [],
      activeRound: 5,
      activeMindSlug: "retention-lab",
      consensus: consensus as AppState["consensus"],
      consensusNode: "node-9",
      quotaRemaining: 0,
      researchData: {
        summary: "Saved research",
        sources: [],
      },
      error: null,
      rateLimited: false,
      consensusLoading: false,
      researchLoading: false,
    });
  });

  it("leaves the current state untouched when there is no saved session", () => {
    const current = {
      ...baseState,
      apiKey: "browser-key",
      stage: "council",
      topic: "Current topic",
      council: ["framework-forge"],
      researchEnabled: true,
    };

    expect(restoreAgoraState(current, null, null)).toBe(current);
    expect(restoreAgoraState(current, null, "saved-browser-key")).toEqual({
      ...current,
      apiKey: "saved-browser-key",
    });
  });

  it("keeps the AgoraApp session persistence wiring in place", () => {
    const source = readFileSync(agoraAppPath, "utf8");

    expect(source).toContain("AGORA_SESSION_STORAGE_KEY");
    expect(source).toContain("decodeAgoraSession");
    expect(source).toContain("encodeAgoraSession");
    expect(source).toContain("restoreAgoraState");
    expect(source).toContain("localStorage.getItem(AGORA_SESSION_STORAGE_KEY)");
    expect(source).toContain("localStorage.setItem(AGORA_SESSION_STORAGE_KEY, snapshot)");
  });
});
