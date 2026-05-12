/**
 * Regression tests for <ShareTranscriptButton/>.
 *
 * Locks three behavioural contracts:
 *   1. Disabled state — button is disabled when shareId is missing/incomplete
 *   2. className passthrough — additional className is merged onto the button
 *   3. Share payload wiring — click triggers buildTranscriptShareText with the
 *      correct payload and writes the result to the clipboard
 *
 * Uses vi.mock("react") to stub useState — same technique as ApiKeySettings.test.ts.
 * Vitest is configured with `environment: "node"` (no jsdom), so we call the
 * component function directly and inspect the returned React element tree.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";

import {
  ShareTranscriptButton,
  isSharePayloadComplete,
  LABEL_IDLE,
  LABEL_COPIED,
  COPIED_RESET_MS,
  type ShareTranscriptButtonProps,
} from "./ShareTranscriptButton";

import { buildTranscriptShareText } from "@/lib/share-transcript";

// ──────────────────────────────────────────────────────────────────────────
//  useState mock (same pattern as ApiKeySettings.test.ts)
// ──────────────────────────────────────────────────────────────────────────

const { useStateMock } = vi.hoisted(() => ({
  useStateMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

// ──────────────────────────────────────────────────────────────────────────
//  React element tree walker (same pattern as upsell-modal.test.tsx)
// ──────────────────────────────────────────────────────────────────────────

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf(node.props.children);
  return "";
}

function collectElements(
  node: React.ReactNode,
  predicate: (el: React.ReactElement) => boolean,
  found: React.ReactElement[] = [],
): React.ReactElement[] {
  if (node == null || typeof node === "boolean") return found;
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, predicate, found);
    return found;
  }
  if (!React.isValidElement(node)) return found;
  if (predicate(node)) found.push(node);
  collectElements(node.props.children, predicate, found);
  return found;
}

function findByTestId(
  root: React.ReactNode,
  testId: string,
): React.ReactElement | null {
  const matches = collectElements(
    root,
    (el) => (el.props as Record<string, unknown>)["data-testid"] === testId,
  );
  return matches[0] ?? null;
}

// ──────────────────────────────────────────────────────────────────────────
//  Render helper
// ──────────────────────────────────────────────────────────────────────────

/**
 * Mount the component in a simulated state.
 * `copiedState` controls what useState returns for the `copied` boolean.
 */
function mount(
  props: ShareTranscriptButtonProps,
  copiedState = false,
): React.ReactNode {
  useStateMock.mockReturnValue([copiedState, () => undefined]);
  return (
    ShareTranscriptButton as unknown as (
      p: ShareTranscriptButtonProps,
    ) => React.ReactNode
  )(props);
}

beforeEach(() => {
  useStateMock.mockReset();
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests — isSharePayloadComplete helper (pure function, no mocks needed)
// ──────────────────────────────────────────────────────────────────────────

describe("isSharePayloadComplete", () => {
  it("returns true when shareId is a non-empty string", () => {
    expect(isSharePayloadComplete({ shareId: "abc123" })).toBe(true);
  });

  it("returns true when shareId has leading/trailing spaces (trimmed internally)", () => {
    expect(isSharePayloadComplete({ shareId: "  abc  " })).toBe(true);
  });

  it("returns false when shareId is undefined", () => {
    expect(isSharePayloadComplete({})).toBe(false);
  });

  it("returns false when shareId is null", () => {
    expect(isSharePayloadComplete({ shareId: null })).toBe(false);
  });

  it("returns false when shareId is an empty string", () => {
    expect(isSharePayloadComplete({ shareId: "" })).toBe(false);
  });

  it("returns false when shareId is whitespace-only", () => {
    expect(isSharePayloadComplete({ shareId: "   " })).toBe(false);
  });

  it("ignores title — only shareId gates completeness", () => {
    expect(
      isSharePayloadComplete({ title: "Topic", shareId: null }),
    ).toBe(false);
  });

  it("ignores excerpt — only shareId gates completeness", () => {
    expect(
      isSharePayloadComplete({ excerpt: "Text", shareId: null }),
    ).toBe(false);
  });

  it("returns true when only shareId is provided and is non-empty", () => {
    expect(isSharePayloadComplete({ shareId: "id1" })).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests — disabled state (Contract 1)
// ──────────────────────────────────────────────────────────────────────────

describe("<ShareTranscriptButton/> disabled state", () => {
  it("is disabled when shareId is absent", () => {
    const tree = mount({ shareInput: { title: "Topic", excerpt: "Text" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect(btn).not.toBeNull();
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);
  });

  it("is disabled when shareId is null", () => {
    const tree = mount({ shareInput: { shareId: null } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);
  });

  it("is disabled when shareId is empty string", () => {
    const tree = mount({ shareInput: { shareId: "" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);
  });

  it("is disabled when shareId is whitespace-only", () => {
    const tree = mount({ shareInput: { shareId: "   " } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);
  });

  it("is NOT disabled when shareId is a valid non-empty string", () => {
    const tree = mount({ shareInput: { shareId: "abc123" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(false);
  });

  it("renders as an HTML <button> element", () => {
    const tree = mount({ shareInput: { shareId: "x" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect(btn!.type).toBe("button");
  });

  it("has type='button' to prevent accidental form submission", () => {
    const tree = mount({ shareInput: { shareId: "x" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).type).toBe("button");
  });

  it("shows the idle label in initial (not-copied) state", () => {
    const tree = mount({ shareInput: { shareId: "abc" } }, false);
    const btn = findByTestId(tree, "share-transcript-button");
    expect(textOf(btn)).toBe(LABEL_IDLE);
  });

  it("shows the copied label when copied state is true", () => {
    const tree = mount({ shareInput: { shareId: "abc" } }, true);
    const btn = findByTestId(tree, "share-transcript-button");
    expect(textOf(btn)).toBe(LABEL_COPIED);
  });

  it("shows the idle label when disabled (shareId absent)", () => {
    const tree = mount({ shareInput: { shareId: null } }, false);
    const btn = findByTestId(tree, "share-transcript-button");
    expect(textOf(btn)).toBe(LABEL_IDLE);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests — className passthrough (Contract 2)
// ──────────────────────────────────────────────────────────────────────────

describe("<ShareTranscriptButton/> className passthrough", () => {
  it("passes className onto the root button element", () => {
    const tree = mount({
      shareInput: { shareId: "x" },
      className: "my-custom-class",
    });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).className).toBe(
      "my-custom-class",
    );
  });

  it("passes multiple class names as a single string", () => {
    const tree = mount({
      shareInput: { shareId: "x" },
      className: "class-a class-b class-c",
    });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).className).toBe(
      "class-a class-b class-c",
    );
  });

  it("does not apply a className when the prop is omitted", () => {
    const tree = mount({ shareInput: { shareId: "x" } });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).className).toBeUndefined();
  });

  it("passes className even when the button is disabled", () => {
    const tree = mount({
      shareInput: { shareId: null },
      className: "disabled-style",
    });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);
    expect((btn!.props as Record<string, unknown>).className).toBe(
      "disabled-style",
    );
  });

  it("className is exactly the passed string — no automatic merging", () => {
    const rawClass = "padded-space";
    const tree = mount({
      shareInput: { shareId: "y" },
      className: rawClass,
    });
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).className).toBe(rawClass);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests — share payload wiring (Contract 3)
// ──────────────────────────────────────────────────────────────────────────

describe("share payload wiring — buildTranscriptShareText output", () => {
  it("produces the canonical text when all fields are present", () => {
    const result = buildTranscriptShareText({
      title: "Should I raise VC or bootstrap?",
      excerpt: "Pursue what you love and the money will follow.",
      shareId: "k7n3pqx9rt",
      origin: "https://www.consultthedead.com",
    });
    expect(result.title).toBe(
      "Consult The Dead — Should I raise VC or bootstrap?",
    );
    expect(result.canonicalUrl).toBe(
      "https://www.consultthedead.com/agora/a/k7n3pqx9rt",
    );
    expect(result.attribution).toBe("— via Consult The Dead");
    expect(result.text).toContain(result.title);
    expect(result.text).toContain(result.canonicalUrl);
    expect(result.text).toContain(result.attribution);
    expect(result.text).toContain(
      '"Pursue what you love and the money will follow."',
    );
  });

  it("payload includes the excerpt in quotes", () => {
    const result = buildTranscriptShareText({
      title: "My Topic",
      excerpt: "A famous quote",
      shareId: "abc",
    });
    expect(result.text).toContain('"A famous quote"');
  });

  it("payload omits the URL section when shareId is absent", () => {
    const result = buildTranscriptShareText({
      title: "My Topic",
      excerpt: "A famous quote",
    });
    expect(result.canonicalUrl).toBe("");
    expect(result.text).not.toContain("/agora/a/");
  });

  it("payload omits the excerpt section when excerpt is absent", () => {
    const result = buildTranscriptShareText({
      title: "My Topic",
      shareId: "abc",
    });
    expect(result.text).not.toContain('"');
  });

  it("payload uses the default title when title is absent", () => {
    const result = buildTranscriptShareText({ shareId: "abc" });
    expect(result.title).toBe("Consult The Dead");
  });

  it("payload always ends with the attribution line", () => {
    const result = buildTranscriptShareText({
      title: "Topic",
      excerpt: "Excerpt",
      shareId: "xyz",
    });
    const lines = result.text.split("\n");
    expect(lines[lines.length - 1]).toBe("— via Consult The Dead");
  });

  it("truncates a long excerpt at a word boundary when a space exists in the latter half", () => {
    // Build an excerpt of exactly 285 chars where the last space is at position 260
    // (well past the 140-char midpoint), so it should truncate at that space.
    const wordPart = "word ".repeat(52); // 260 chars, ends with space
    const tailPart = "xxxxxxxxxxxxxxxxxxxxxxxxxx"; // 25 chars, no spaces
    const longExcerpt = wordPart + tailPart; // 285 chars total
    expect(longExcerpt.length).toBeGreaterThan(280);

    const result = buildTranscriptShareText({
      title: "T",
      excerpt: longExcerpt,
      shareId: "s",
    });
    // Excerpt is quoted in the text; it must end with the ellipsis character
    expect(result.text).toContain("…");
    // The raw excerpt should NOT appear verbatim (it was truncated)
    expect(result.text).not.toContain(tailPart);
  });

  it("falls back to a hard slice when no space exists in the latter half of the excerpt", () => {
    // 280 chars with no spaces at all — forces the hard-slice branch (lastSpace <= max/2)
    const noSpaceExcerpt = "x".repeat(285);
    const result = buildTranscriptShareText({
      title: "T",
      excerpt: noSpaceExcerpt,
      shareId: "s",
    });
    expect(result.text).toContain("…");
    // The truncated excerpt fits within the quoted portion
    const quotedMatch = result.text.match(/"([^"]+)"/);
    expect(quotedMatch).not.toBeNull();
    // Sliced text must be <= EXCERPT_MAX_CHARS + 1 (for the ellipsis char)
    expect(quotedMatch![1].length).toBeLessThanOrEqual(281);
  });

  it("button onClick handler writes the correct text to the clipboard", async () => {
    const shareInput = {
      title: "Is bootstrapping right for me?",
      excerpt:
        "Capital is a tool, not a goal. Use it when the tool fits the job.",
      shareId: "testShareId42",
    };

    const writtenTexts: string[] = [];
    const fakeClipboard = {
      writeText: async (text: string) => {
        writtenTexts.push(text);
      },
    };
    const onCopied = vi.fn();

    // Mount the component (enabled state)
    const tree = mount(
      {
        shareInput,
        clipboard: fakeClipboard,
        onCopied,
      },
      false, // initial copied=false
    );
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(false);

    // Invoke the click handler
    const onClick = (btn!.props as Record<string, unknown>).onClick as () => Promise<void>;
    await onClick();

    // Verify clipboard received the exact text from buildTranscriptShareText
    const expected = buildTranscriptShareText(shareInput);
    expect(writtenTexts).toHaveLength(1);
    expect(writtenTexts[0]).toBe(expected.text);
    expect(writtenTexts[0]).toContain("Is bootstrapping right for me?");
    expect(writtenTexts[0]).toContain("Capital is a tool, not a goal");
    expect(writtenTexts[0]).toContain("/agora/a/testShareId42");
    expect(writtenTexts[0]).toContain("— via Consult The Dead");
    expect(onCopied).toHaveBeenCalledOnce();
  });

  it("button onClick does not write to clipboard when button is disabled", async () => {
    const shareInput = { shareId: null };

    const writtenTexts: string[] = [];
    const fakeClipboard = {
      writeText: async (text: string) => {
        writtenTexts.push(text);
      },
    };

    const tree = mount({ shareInput, clipboard: fakeClipboard }, false);
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>).disabled).toBe(true);

    const onClick = (btn!.props as Record<string, unknown>).onClick as () => Promise<void>;
    await onClick();

    // Guard: disabled button still fires onClick (browser preventDefault is
    // handled by the `disabled` attribute, not by the handler). The handler
    // itself must guard and bail out when !enabled.
    expect(writtenTexts).toHaveLength(0);
  });

  it("calls onCopied after a successful clipboard write", async () => {
    const fakeClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    const onCopied = vi.fn();

    const tree = mount(
      {
        shareInput: { shareId: "myid" },
        clipboard: fakeClipboard,
        onCopied,
      },
      false,
    );
    const btn = findByTestId(tree, "share-transcript-button");
    const onClick = (btn!.props as Record<string, unknown>).onClick as () => Promise<void>;
    await onClick();

    expect(fakeClipboard.writeText).toHaveBeenCalledOnce();
    expect(onCopied).toHaveBeenCalledOnce();
  });
});

  it("falls back to setTimeout when onCopied is not provided", async () => {
    // Set up a fake timer to capture the setTimeout call
    const originalSetTimeout = globalThis.setTimeout;
    const timerCallbacks: Array<() => void> = [];
    globalThis.setTimeout = ((cb: () => void, _ms: number) => {
      timerCallbacks.push(cb);
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout;

    try {
      const fakeClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
      // No onCopied passed — should use setTimeout
      const setCopied = vi.fn();
      useStateMock.mockReturnValue([false, setCopied]);

      const tree = (
        ShareTranscriptButton as unknown as (
          p: ShareTranscriptButtonProps,
        ) => React.ReactNode
      )({ shareInput: { shareId: "myid" }, clipboard: fakeClipboard });

      const btn = findByTestId(tree, "share-transcript-button");
      const onClick = (btn!.props as Record<string, unknown>).onClick as () => Promise<void>;
      await onClick();

      // setTimeout should have been called (not onCopied)
      expect(timerCallbacks).toHaveLength(1);
      // Invoke the timer callback to verify it calls setCopied(false)
      timerCallbacks[0]();
      expect(setCopied).toHaveBeenCalledWith(false);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  it("skips clipboard write when no clipboard is available", async () => {
    // This tests the branch where clipboardApi is null
    // When navigator is undefined (node env) and no clipboard override is provided,
    // clipboardApi is null and writeText is skipped.
    const onCopied = vi.fn();

    const tree = mount(
      {
        shareInput: { shareId: "myid" },
        // No clipboard prop — in node env, navigator.clipboard is undefined
        onCopied,
      },
      false,
    );
    const btn = findByTestId(tree, "share-transcript-button");
    const onClick = (btn!.props as Record<string, unknown>).onClick as () => Promise<void>;
    // Should not throw even with no clipboard
    await expect(onClick()).resolves.toBeUndefined();
    // onCopied is still called (copy succeeded without actual clipboard)
    expect(onCopied).toHaveBeenCalledOnce();
  });

// ──────────────────────────────────────────────────────────────────────────
//  Tests — constants are stable and exported
// ──────────────────────────────────────────────────────────────────────────

describe("exported constants", () => {
  it("COPIED_RESET_MS is a positive number", () => {
    expect(typeof COPIED_RESET_MS).toBe("number");
    expect(COPIED_RESET_MS).toBeGreaterThan(0);
  });

  it("LABEL_IDLE is a non-empty string", () => {
    expect(typeof LABEL_IDLE).toBe("string");
    expect(LABEL_IDLE.length).toBeGreaterThan(0);
  });

  it("LABEL_COPIED is a non-empty string", () => {
    expect(typeof LABEL_COPIED).toBe("string");
    expect(LABEL_COPIED.length).toBeGreaterThan(0);
  });

  it("LABEL_IDLE and LABEL_COPIED are distinct", () => {
    expect(LABEL_IDLE).not.toBe(LABEL_COPIED);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Tests — aria-label wiring
// ──────────────────────────────────────────────────────────────────────────

describe("<ShareTranscriptButton/> accessibility", () => {
  it("has aria-label set to the idle label in initial state", () => {
    const tree = mount({ shareInput: { shareId: "x" } }, false);
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>)["aria-label"]).toBe(
      LABEL_IDLE,
    );
  });

  it("has aria-label set to copied label when copied=true", () => {
    const tree = mount({ shareInput: { shareId: "x" } }, true);
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>)["aria-label"]).toBe(
      LABEL_COPIED,
    );
  });

  it("has aria-label set to idle label when disabled", () => {
    const tree = mount({ shareInput: { shareId: null } }, false);
    const btn = findByTestId(tree, "share-transcript-button");
    expect((btn!.props as Record<string, unknown>)["aria-label"]).toBe(
      LABEL_IDLE,
    );
  });
});
