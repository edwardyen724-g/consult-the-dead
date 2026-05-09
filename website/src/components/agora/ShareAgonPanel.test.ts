import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reactHarness = vi.hoisted(() => {
  let states: unknown[] = [];
  let cursor = 0;

  return {
    reset() {
      states = [];
      cursor = 0;
    },
    rewind() {
      cursor = 0;
    },
    useState<T>(initial: T) {
      const index = cursor++;
      if (index >= states.length) {
        states[index] = initial;
      } else if (states[index] === undefined) {
        states[index] = initial;
      }
      const setState = (value: T | ((current: T) => T)) => {
        states[index] =
          typeof value === "function"
            ? (value as (current: T) => T)(states[index] as T)
            : value;
      };
      return [states[index] as T, setState] as const;
    },
    useMemo<T>(factory: () => T) {
      return factory();
    },
    useCallback<T extends (...args: unknown[]) => unknown>(fn: T) {
      return fn;
    },
  };
});

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: reactHarness.useState,
    useMemo: reactHarness.useMemo,
    useCallback: reactHarness.useCallback,
  };
});

import {
  ShareAgonPanel,
  buildShareRequestBody,
  copyShareUrl,
  getShareButtonLabel,
  isAbortError,
  persistShareAgon,
  shareAgonLink,
  type ShareAgonInput,
} from "./ShareAgonPanel";

const validShareId = "k7n3pqx9rt";
const baseAgon: ShareAgonInput = {
  topic: "Should I raise VC or bootstrap?",
  mindSlugs: ["steve-jobs", "sam-altman"],
  rounds: 3,
  turns: [],
  consensus: { actionSummary: "Bootstrap" } as never,
  research: undefined,
};

function renderPanel(overrides: Partial<Parameters<typeof ShareAgonPanel>[0]> = {}) {
  reactHarness.rewind();
  return ShareAgonPanel({
    agon: baseAgon,
    existingShareId: null,
    disabled: false,
    ...overrides,
  });
}

type TreeElement = {
  type?: unknown;
  props?: {
    children?: unknown;
  };
};

function collectElements(
  node: unknown,
  predicate: (element: TreeElement) => boolean,
  out: TreeElement[] = [],
) {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectElements(child, predicate, out);
    }
    return out;
  }

  if (!node || typeof node !== "object") {
    return out;
  }

  const element = node as TreeElement;
  if (predicate(element)) {
    out.push(element);
  }

  const children = element.props?.children;
  if (children !== undefined) {
    collectElements(children, predicate, out);
  }

  return out;
}

function firstByType(tree: unknown, type: string) {
  return collectElements(tree, (element) => element.type === type)[0];
}

function textContent(node: unknown): string {
  if (Array.isArray(node)) {
    return node.map(textContent).join("");
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!node || typeof node !== "object") {
    return "";
  }
  const element = node as TreeElement;
  return textContent(element.props?.children);
}

beforeEach(() => {
  reactHarness.reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("share-agon helpers", () => {
  it("builds the POST body from the agon input", () => {
    expect(buildShareRequestBody(baseAgon)).toEqual({
      topic: baseAgon.topic,
      mindSlugs: baseAgon.mindSlugs,
      rounds: baseAgon.rounds,
      turns: baseAgon.turns,
      consensus: baseAgon.consensus,
      research: null,
    });
  });

  it("labels the primary action from save state", () => {
    expect(getShareButtonLabel("idle", false)).toBe("Share this agon");
    expect(getShareButtonLabel("idle", true)).toBe("Share");
    expect(getShareButtonLabel("saving", true)).toBe("Sharing…");
    expect(getShareButtonLabel("error", true)).toBe("Share failed — retry");
  });

  it("detects AbortError share failures", () => {
    expect(isAbortError({ name: "AbortError" })).toBe(true);
    expect(isAbortError(new Error("nope"))).toBe(false);
  });

  it("copies URLs when a clipboard is available and returns false otherwise", async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    await expect(copyShareUrl("https://example.com", clipboard)).resolves.toBe(
      true,
    );
    expect(clipboard.writeText).toHaveBeenCalledWith("https://example.com");
    await expect(copyShareUrl("https://example.com", null)).resolves.toBe(
      false,
    );

    const failingClipboard = {
      writeText: vi.fn().mockRejectedValue(new Error("blocked")),
    };
    await expect(
      copyShareUrl("https://example.com", failingClipboard),
    ).resolves.toBe(false);
  });

  it("persists the agon and extracts the share id on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ shareId: validShareId }),
    });

    await expect(persistShareAgon(baseAgon, fetchImpl)).resolves.toEqual({
      ok: true,
      shareId: validShareId,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/library",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("surfaces save failures from the API, missing share ids, and network errors", async () => {
    await expect(
      persistShareAgon(baseAgon, vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: "boom" }),
      })),
    ).resolves.toEqual({ ok: false, errorMsg: "boom" });

    await expect(
      persistShareAgon(baseAgon, vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      })),
    ).resolves.toEqual({
      ok: false,
      errorMsg: "Save failed (500)",
    });

    await expect(
      persistShareAgon(baseAgon, vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })),
    ).resolves.toEqual({
      ok: false,
      errorMsg: "Save returned no shareId",
    });

    await expect(
      persistShareAgon(baseAgon, vi.fn().mockRejectedValue(new Error("offline"))),
    ).resolves.toEqual({
      ok: false,
      errorMsg: "offline",
    });

    await expect(
      persistShareAgon(baseAgon, vi.fn().mockRejectedValue("offline")),
    ).resolves.toEqual({
      ok: false,
      errorMsg: "Network error",
    });
  });

  it("shares through the native sheet when available and falls back cleanly", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(
      shareAgonLink({
        shareId: validShareId,
        topic: baseAgon.topic,
        navigatorLike: { share },
      }),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
      }),
    );

    const aborted = vi.fn().mockRejectedValue({ name: "AbortError" });
    await expect(
      shareAgonLink({
        shareId: validShareId,
        topic: baseAgon.topic,
        navigatorLike: { share: aborted },
      }),
    ).resolves.toBe("aborted");

    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    await expect(
      shareAgonLink({
        shareId: validShareId,
        topic: baseAgon.topic,
        navigatorLike: { clipboard },
      }),
    ).resolves.toBe("copied");
    expect(clipboard.writeText).toHaveBeenCalledWith(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );

    await expect(
      shareAgonLink({
        shareId: validShareId,
        topic: baseAgon.topic,
        navigatorLike: null,
      }),
    ).resolves.toBe("unavailable");

    const failingShare = vi.fn().mockRejectedValue(new Error("boom"));
    const fallbackClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    await expect(
      shareAgonLink({
        shareId: validShareId,
        topic: baseAgon.topic,
        navigatorLike: { share: failingShare, clipboard: fallbackClipboard },
      }),
    ).resolves.toBe("copied");
    expect(fallbackClipboard.writeText).toHaveBeenCalledWith(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
  });
});

describe("ShareAgonPanel", () => {
  it("renders the idle share state before the agon has been saved", () => {
    const tree = renderPanel();
    const buttons = collectElements(tree, (element) => element.type === "button");

    expect(buttons).toHaveLength(1);
    expect(textContent(buttons[0])).toBe("Share this agon");
    expect(firstByType(tree, "input")).toBeUndefined();
    expect(textContent(tree)).toContain("system share sheet");
  });

  it("renders the saved state with a copy link and URL when a share id exists", () => {
    const tree = renderPanel({ existingShareId: validShareId });
    const buttons = collectElements(tree, (element) => element.type === "button");
    const input = firstByType(tree, "input");

    expect(textContent(buttons[0])).toBe("Share");
    expect(textContent(buttons[1])).toBe("Copy link");
    expect(input.props.value).toBe(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
  });

  it("selects the URL text when the read-only field receives focus", () => {
    const tree = renderPanel({ existingShareId: validShareId });
    const input = firstByType(tree, "input");
    const select = vi.fn();

    input.props.onFocus({ currentTarget: { select } });

    expect(select).toHaveBeenCalledTimes(1);
  });

  it("keeps the disabled share button inert", async () => {
    const fetchImpl = vi.fn();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn() },
    });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
    vi.stubGlobal("fetch", fetchImpl);

    const tree = renderPanel({ disabled: true });
    const button = firstByType(tree, "button");
    await button.props.onClick();

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(textContent(button)).toBe("Share this agon");
  });

  it("leaves the copy button unchanged when no clipboard is available", async () => {
    const props = {
      agon: baseAgon,
      existingShareId: validShareId,
      disabled: false,
    };

    let tree = renderPanel(props);
    const buttons = collectElements(tree, (element) => element.type === "button");
    await buttons[1].props.onClick();

    reactHarness.rewind();
    tree = ShareAgonPanel(props);
    const rerenderedButtons = collectElements(
      tree,
      (element) => element.type === "button",
    );

    expect(textContent(rerenderedButtons[1])).toBe("Copy link");
  });

  it("copies the share URL from the copy button and flips the copied label", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("window", { setTimeout: vi.fn() });

    const props = {
      agon: baseAgon,
      existingShareId: validShareId,
      disabled: false,
    };

    let tree = renderPanel(props);
    const buttons = collectElements(tree, (element) => element.type === "button");
    await buttons[1].props.onClick();

    reactHarness.rewind();
    tree = ShareAgonPanel(props);
    const rerenderedButtons = collectElements(
      tree,
      (element) => element.type === "button",
    );

    expect(writeText).toHaveBeenCalledWith(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    expect(textContent(rerenderedButtons[1])).toBe("Copied ✓");
  });

  it("shares without a navigator object without throwing", async () => {
    const props = {
      agon: baseAgon,
      existingShareId: validShareId,
      disabled: false,
    };

    const tree = renderPanel(props);
    const shareButton = firstByType(tree, "button");
    await shareButton.props.onClick();

    reactHarness.rewind();
    const rerendered = ShareAgonPanel(props);
    expect(textContent(firstByType(rerendered, "button"))).toBe("Share");
  });

  it("persists and shares from the button click, then exposes the copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ shareId: validShareId }),
    });

    vi.stubGlobal("navigator", { share, clipboard: { writeText } });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
    vi.stubGlobal("fetch", fetchImpl);

    const props = {
      agon: baseAgon,
      existingShareId: null,
      disabled: false,
    };

    let tree = renderPanel(props);
    const shareButton = firstByType(tree, "button");
    await shareButton.props.onClick();

    reactHarness.rewind();
    tree = ShareAgonPanel(props);

    const buttons = collectElements(tree, (element) => element.type === "button");
    const input = firstByType(tree, "input");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledTimes(1);
    expect(textContent(buttons[0])).toBe("Share");
    expect(textContent(buttons[1])).toBe("Copy link");
    expect(input.props.value).toBe(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("uses the clipboard fallback when the native share sheet is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ shareId: validShareId }),
    });

    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
    vi.stubGlobal("fetch", fetchImpl);

    const props = {
      agon: baseAgon,
      existingShareId: null,
      disabled: false,
    };

    let tree = renderPanel(props);
    const shareButton = firstByType(tree, "button");
    await shareButton.props.onClick();

    reactHarness.rewind();
    tree = ShareAgonPanel(props);
    const buttons = collectElements(tree, (element) => element.type === "button");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    expect(textContent(buttons[1])).toBe("Copied ✓");
  });

  it("renders the error state when the save request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Save failed (500)" }),
    });

    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", { setTimeout: vi.fn() });
    vi.stubGlobal("fetch", fetchImpl);

    const props = {
      agon: baseAgon,
      existingShareId: null,
      disabled: false,
    };

    let tree = renderPanel(props);
    const shareButton = firstByType(tree, "button");
    await shareButton.props.onClick();

    reactHarness.rewind();
    tree = ShareAgonPanel(props);

    expect(textContent(tree)).toContain("Save failed (500)");
    expect(textContent(firstByType(tree, "button"))).toBe(
      "Share failed — retry",
    );
  });
});
