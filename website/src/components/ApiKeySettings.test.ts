import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { ApiKeySettings } from "./ApiKeySettings";

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

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "removing" }
  | { kind: "error"; message: string };

type Store = {
  maskedKey: string | null;
  draft: string;
  editing: boolean;
  status: Status;
};

const TEST_MASKED_KEY = "sk-ant-***...***WXYZ";

let store: Store;
let hookIndex = 0;
let initialMaskedKey: string | null;
let fetchMock: ReturnType<typeof vi.fn>;

function makeSetter<K extends keyof Store>(key: K) {
  return (value: Store[K] | ((current: Store[K]) => Store[K])) => {
    const next =
      typeof value === "function"
        ? (value as (current: Store[K]) => Store[K])(store[key])
        : value;
    store[key] = next;
  };
}

function mount(initialValue: string | null) {
  initialMaskedKey = initialValue;
  hookIndex = 0;
  return ApiKeySettings({ initialMaskedKey });
}

function setup(initialValue: string | null) {
  store = {
    maskedKey: initialValue,
    draft: "",
    editing: initialValue === null,
    status: { kind: "idle" },
  };
  useStateMock.mockImplementation(() => {
    switch (hookIndex++) {
      case 0:
        return [store.maskedKey, makeSetter("maskedKey")];
      case 1:
        return [store.draft, makeSetter("draft")];
      case 2:
        return [store.editing, makeSetter("editing")];
      case 3:
        return [store.status, makeSetter("status")];
      default:
        throw new Error("Unexpected useState call");
    }
  });
}

function childrenOf(node: React.ReactNode): React.ReactNode[] {
  if (node == null || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node;
  if (React.isValidElement(node)) {
    return childrenOf(node.props.children);
  }
  return [];
}

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join("");
  }
  if (React.isValidElement(node)) {
    return textOf(node.props.children);
  }
  return "";
}

function collectElements(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
  found: React.ReactElement[] = [],
): React.ReactElement[] {
  if (node == null || typeof node === "boolean") {
    return found;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, predicate, found);
    return found;
  }
  if (!React.isValidElement(node)) return found;
  if (predicate(node)) found.push(node);
  for (const child of childrenOf(node)) {
    collectElements(child, predicate, found);
  }
  return found;
}

function findElement(
  root: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
) {
  const matches = collectElements(root, predicate);
  if (matches.length === 0) {
    throw new Error("Expected element not found");
  }
  return matches[0];
}

function getButton(root: React.ReactNode, label: string) {
  return findElement(
    root,
    element => element.type === "button" && textOf(element).includes(label),
  );
}

function getInput(root: React.ReactNode) {
  return findElement(root, element => element.type === "input");
}

function getMaskedDisplay(root: React.ReactNode) {
  return findElement(
    root,
    element =>
      element.props["data-testid"] === "masked-key" &&
      textOf(element) === store.maskedKey,
  );
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  useStateMock.mockReset();
});

describe("ApiKeySettings", () => {
  it("renders the empty state when no key is on file", () => {
    setup(null);
    const tree = mount(null);

    expect(getInput(tree).props.placeholder).toBe("sk-ant-…");
    expect(textOf(getButton(tree, "Save key"))).toBe("Save key");
    expect(
      findElement(
        tree,
        element => element.type === "span" && textOf(element) === "Not set",
      ),
    ).toBeTruthy();
  });

  it("renders the masked state and exposes replace/remove actions", () => {
    setup(TEST_MASKED_KEY);
    const tree = mount(TEST_MASKED_KEY);

    expect(textOf(getMaskedDisplay(tree))).toBe(TEST_MASKED_KEY);
    expect(textOf(getButton(tree, "Replace key"))).toBe("Replace key");
    expect(textOf(getButton(tree, "Remove key"))).toBe("Remove key");
  });

  it("saves a valid key, trims whitespace, and flips back to masked mode", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    setup(null);
    let tree = mount(null);

    const input = getInput(tree);
    input.props.onChange({ target: { value: `  sk-ant-${"x".repeat(20)}WXYZ  ` } });
    tree = mount(null);

    await getButton(tree, "Save key").props.onClick();
    mount(null);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/api-key",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: `sk-ant-${"x".repeat(20)}WXYZ` }),
      }),
    );
    expect(store.maskedKey).toBe("sk-ant-***...***WXYZ");
    expect(store.editing).toBe(false);
    expect(store.draft).toBe("");
  });

  it("shows a local validation error for non-sk-ant keys", async () => {
    setup(null);
    let tree = mount(null);

    getInput(tree).props.onChange({ target: { value: "sk-prod-123456" } });
    tree = mount(null);

    await getButton(tree, "Save key").props.onClick();
    tree = mount(null);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      textOf(findElement(tree, element => element.props.role === "alert")),
    ).toContain("sk-ant-");
  });

  it("surfaces server errors when saving fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Save failed from server" }),
    });
    setup(null);
    let tree = mount(null);

    getInput(tree).props.onChange({ target: { value: `sk-ant-${"x".repeat(20)}WXYZ` } });
    tree = mount(null);

    await getButton(tree, "Save key").props.onClick();
    tree = mount(null);

    expect(textOf(findElement(tree, element => element.props.role === "alert"))).toContain(
      "Save failed from server",
    );
  });

  it("removes the stored key and returns to the empty form", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    setup(TEST_MASKED_KEY);
    let tree = mount(TEST_MASKED_KEY);

    await getButton(tree, "Remove key").props.onClick();
    tree = mount(TEST_MASKED_KEY);

    expect(fetchMock).toHaveBeenCalledWith("/api/user/api-key", {
      method: "DELETE",
    });
    expect(getInput(tree)).toBeTruthy();
    expect(textOf(getButton(tree, "Save key"))).toBe("Save key");
    expect(
      findElement(tree, element => element.type === "span" && textOf(element) === "Not set"),
    ).toBeTruthy();
  });

  it("surfaces server errors when removing fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("remove response is malformed");
      },
    });
    setup(TEST_MASKED_KEY);
    let tree = mount(TEST_MASKED_KEY);

    await getButton(tree, "Remove key").props.onClick();
    tree = mount(TEST_MASKED_KEY);

    expect(textOf(findElement(tree, element => element.props.role === "alert"))).toBe(
      "Remove failed.",
    );
  });

  it("lets the user cancel replacement and restore the masked view", () => {
    setup(TEST_MASKED_KEY);
    let tree = mount(TEST_MASKED_KEY);

    getButton(tree, "Replace key").props.onClick();
    tree = mount(TEST_MASKED_KEY);
    expect(textOf(getButton(tree, "Cancel"))).toBe("Cancel");

    getButton(tree, "Cancel").props.onClick();
    tree = mount(TEST_MASKED_KEY);

    expect(textOf(getMaskedDisplay(tree))).toBe(TEST_MASKED_KEY);
    expect(textOf(getButton(tree, "Replace key"))).toBe("Replace key");
  });
});
