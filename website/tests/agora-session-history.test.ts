/**
 * Regression tests for Agora session history hydration (task 32eb4787).
 *
 * Covers:
 *  1. Session snapshots are saved on meaningful progress
 *  2. Topic-only visits do NOT save a snapshot
 *  3. Snapshot hydration on reload (decodeAgoraSession restores valid state)
 *  4. Invalid / stale JSON falls back to null without throwing
 *  5. /api/chat route is absent — the live flow is /api/agon
 */

import { existsSync } from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AGORA_SESSION_STORAGE_KEY,
  decodeAgoraSession,
  encodeAgoraSession,
  type AgoraSessionState,
} from "../src/lib/agora-session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

const meaningfulState: AgoraSessionState = {
  ...baseState,
  stage: "agon",
  topic: "Should we open-source our core product or keep it proprietary?",
  council: ["niccolo-machiavelli", "sun-tzu", "marie-curie"],
  turns: [
    {
      mindSlug: "niccolo-machiavelli",
      mindName: "Niccolò Machiavelli",
      round: 1,
      text: "Open-sourcing can be a strategic move to build trust.",
      done: true,
    },
  ],
  activeRound: 1,
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("Agora session history: save on progress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("encodes a meaningful session to a non-null JSON string", () => {
    const encoded = encodeAgoraSession(meaningfulState);

    expect(encoded).not.toBeNull();
    expect(typeof encoded).toBe("string");

    // The string must be valid JSON with the correct storage key structure.
    const parsed = JSON.parse(encoded!);
    expect(parsed).toMatchObject({ version: 1, state: expect.any(Object) });
  });

  it("stores the session key name as AGORA_SESSION_STORAGE_KEY constant", () => {
    // Lock down the storage key so a rename doesn't silently break hydration.
    expect(AGORA_SESSION_STORAGE_KEY).toBe("ctd-agora-session-v1");
  });

  it("encodes stage, topic, council, and turns into the snapshot", () => {
    const encoded = encodeAgoraSession(meaningfulState);
    const parsed = JSON.parse(encoded!);

    expect(parsed.state.stage).toBe("agon");
    expect(parsed.state.topic).toBe(
      "Should we open-source our core product or keep it proprietary?",
    );
    expect(parsed.state.council).toEqual([
      "niccolo-machiavelli",
      "sun-tzu",
      "marie-curie",
    ]);
    expect(parsed.state.turns).toHaveLength(1);
    expect(parsed.state.turns[0].mindSlug).toBe("niccolo-machiavelli");
  });
});

describe("Agora session history: no save for topic-only visit", () => {
  it("returns null for a fully blank state (stage=topic, empty topic)", () => {
    expect(encodeAgoraSession(baseState)).toBeNull();
  });

  it("returns null when only apiKey would differ (transient, not persisted)", () => {
    // The session lib only operates on AgoraSessionState, which excludes apiKey.
    // A default-shaped state with no topic/council/turns/etc must not be saved.
    const topicOnlyNoProgress: AgoraSessionState = {
      ...baseState,
      // stage stays "topic", topic stays "", council stays []
    };

    expect(encodeAgoraSession(topicOnlyNoProgress)).toBeNull();
  });

  it("DOES save when a topic string has been entered (even without council)", () => {
    const withTopic: AgoraSessionState = {
      ...baseState,
      topic: "Should I raise VC or bootstrap?",
    };

    const encoded = encodeAgoraSession(withTopic);
    expect(encoded).not.toBeNull();

    const parsed = JSON.parse(encoded!);
    expect(parsed.state.topic).toBe("Should I raise VC or bootstrap?");
    expect(parsed.state.council).toEqual([]);
  });
});

describe("Agora session history: hydration on reload", () => {
  it("decodes a valid snapshot back to the original state", () => {
    const encoded = encodeAgoraSession(meaningfulState);
    expect(encoded).not.toBeNull();

    const restored = decodeAgoraSession(encoded);
    expect(restored).not.toBeNull();

    expect(restored!.stage).toBe("agon");
    expect(restored!.topic).toBe(
      "Should we open-source our core product or keep it proprietary?",
    );
    expect(restored!.council).toEqual([
      "niccolo-machiavelli",
      "sun-tzu",
      "marie-curie",
    ]);
    expect(restored!.turns).toHaveLength(1);
    expect(restored!.turns[0].done).toBe(true);
  });

  it("restores consensus and researchData when present in the snapshot", () => {
    const withConsensus: AgoraSessionState = {
      ...meaningfulState,
      stage: "consensus",
      consensus: {
        points: "Open-source builds trust",
        pointsSummary: "Trust via OSS",
        tensions: "Revenue risk",
        tensionsSummary: "Revenue tension",
        action: "Open-source the SDK, keep the platform proprietary",
        actionSummary: "Hybrid OSS",
        steps: ["Audit codebase", "Write OSS policy"],
        stepsSummary: "Audit then publish",
        risks: "Competitors can fork",
        risksSummary: "Fork risk",
      },
      researchData: {
        summary: "Open-source SDKs have 3× adoption rates",
        sources: [{ title: "OSS Study 2024", url: "https://example.com/oss" }],
      },
      quotaRemaining: 2,
    };

    const encoded = encodeAgoraSession(withConsensus);
    const restored = decodeAgoraSession(encoded);

    expect(restored!.consensus).not.toBeNull();
    expect(restored!.consensus!.action).toBe(
      "Open-source the SDK, keep the platform proprietary",
    );
    expect(restored!.researchData).not.toBeNull();
    expect(restored!.researchData!.sources).toHaveLength(1);
    expect(restored!.quotaRemaining).toBe(2);
  });

  it("normalizes transient fields (activeRound, activeMindSlug) on decode", () => {
    // These fields are saved but, if missing, should fall back to null.
    const raw = JSON.stringify({
      version: 1,
      state: {
        stage: "agon",
        topic: "Is bootstrapping right for us?",
        researchEnabled: false,
        council: ["sun-tzu"],
        turns: [],
        // activeRound and activeMindSlug intentionally omitted
        consensus: null,
        consensusNode: null,
        researchData: null,
      },
    });

    const restored = decodeAgoraSession(raw);
    expect(restored).not.toBeNull();
    expect(restored!.activeRound).toBeNull();
    expect(restored!.activeMindSlug).toBeNull();
  });
});

describe("Agora session history: stale or invalid JSON falls back safely", () => {
  it("returns null for a null input", () => {
    expect(decodeAgoraSession(null)).toBeNull();
  });

  it("returns null for unparseable JSON without throwing", () => {
    expect(() => decodeAgoraSession("not-json-at-all")).not.toThrow();
    expect(decodeAgoraSession("not-json-at-all")).toBeNull();
  });

  it("returns null for a version mismatch (version: 2)", () => {
    const futureEnvelope = JSON.stringify({
      version: 2,
      state: meaningfulState,
    });
    expect(decodeAgoraSession(futureEnvelope)).toBeNull();
  });

  it("returns null when required fields (stage) are missing from state", () => {
    const noStage = JSON.stringify({
      version: 1,
      state: {
        topic: "Some topic",
        researchEnabled: false,
        council: [],
        turns: [],
      },
    });
    expect(decodeAgoraSession(noStage)).toBeNull();
  });

  it("returns null when the state payload itself is null", () => {
    const nullState = JSON.stringify({ version: 1, state: null });
    expect(decodeAgoraSession(nullState)).toBeNull();
  });

  it("returns null when the state payload is a non-object primitive", () => {
    const numberState = JSON.stringify({ version: 1, state: 42 });
    expect(decodeAgoraSession(numberState)).toBeNull();
  });

  it("filters malformed turns while keeping valid ones", () => {
    const withBadTurns = JSON.stringify({
      version: 1,
      state: {
        stage: "agon",
        topic: "A valid topic for this test scenario",
        researchEnabled: false,
        council: ["sun-tzu"],
        turns: [
          // Valid turn
          {
            mindSlug: "sun-tzu",
            mindName: "Sun Tzu",
            round: 1,
            text: "Know the enemy.",
            done: true,
          },
          // Invalid: mindName is a number
          { mindSlug: "sun-tzu", mindName: 99, round: 2, text: "X", done: false },
          // Invalid: null entry
          null,
        ],
        activeRound: null,
        activeMindSlug: null,
        consensus: null,
        consensusNode: null,
        researchData: null,
      },
    });

    const restored = decodeAgoraSession(withBadTurns);
    expect(restored).not.toBeNull();
    expect(restored!.turns).toHaveLength(1);
    expect(restored!.turns[0].mindSlug).toBe("sun-tzu");
  });

  it("filters non-string council slugs while keeping valid ones", () => {
    const withBadCouncil = JSON.stringify({
      version: 1,
      state: {
        stage: "council",
        topic: "Mixed council slugs test topic here",
        researchEnabled: false,
        council: ["sun-tzu", 123, null, "marie-curie"],
        turns: [],
        activeRound: null,
        activeMindSlug: null,
        consensus: null,
        consensusNode: null,
        researchData: null,
      },
    });

    const restored = decodeAgoraSession(withBadCouncil);
    expect(restored).not.toBeNull();
    expect(restored!.council).toEqual(["sun-tzu", "marie-curie"]);
  });
});

describe("Agora session history: sessionStorage integration contract", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips encode → sessionStorage → decode", () => {
    const encoded = encodeAgoraSession(meaningfulState);
    expect(encoded).not.toBeNull();

    sessionStorage.setItem(AGORA_SESSION_STORAGE_KEY, encoded!);

    const raw = sessionStorage.getItem(AGORA_SESSION_STORAGE_KEY);
    expect(raw).toBe(encoded);

    const restored = decodeAgoraSession(raw);
    expect(restored).not.toBeNull();
    expect(restored!.stage).toBe("agon");
    expect(restored!.council).toEqual([
      "niccolo-machiavelli",
      "sun-tzu",
      "marie-curie",
    ]);
  });

  it("decode returns null when sessionStorage contains invalid JSON at the key", () => {
    store[AGORA_SESSION_STORAGE_KEY] = "<<<totally-broken-json>>>";

    const raw = sessionStorage.getItem(AGORA_SESSION_STORAGE_KEY);
    expect(() => decodeAgoraSession(raw)).not.toThrow();
    expect(decodeAgoraSession(raw)).toBeNull();
  });

  it("decode returns null when sessionStorage has nothing at the key", () => {
    const raw = sessionStorage.getItem(AGORA_SESSION_STORAGE_KEY);
    expect(raw).toBeNull();
    expect(decodeAgoraSession(raw)).toBeNull();
  });
});

describe("/api/chat route compatibility check", () => {
  it("website has no /api/chat/route.ts — live flow is /api/agon", () => {
    // The session history feature (task 32eb4787) deliberately did NOT revive
    // /api/chat.  This test acts as a filesystem canary: if a /api/chat route
    // is accidentally added in the future, this test will flag the regression.
    const chatRoutePath = path.resolve(
      __dirname,
      "../src/app/api/chat/route.ts",
    );
    expect(existsSync(chatRoutePath)).toBe(false);
  });

  it("website has /api/agon/route.ts as the active debate endpoint", () => {
    const agonRoutePath = path.resolve(
      __dirname,
      "../src/app/api/agon/route.ts",
    );
    expect(existsSync(agonRoutePath)).toBe(true);
  });
});
