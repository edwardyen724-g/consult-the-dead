import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CouncilForm } from "./council-form";

const useStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

type FormState = {
  name: string;
  email: string;
  decision: string;
  status: "idle" | "submitting" | "success" | "error";
  errorMsg: string | null;
};

let state: FormState;
let hookIndex = 0;
let fetchMock: ReturnType<typeof vi.fn>;

function makeSetter<K extends keyof FormState>(key: K) {
  return (value: FormState[K] | ((current: FormState[K]) => FormState[K])) => {
    const next =
      typeof value === "function"
        ? (value as (current: FormState[K]) => FormState[K])(state[key])
        : value;
    state[key] = next;
  };
}

function setup(initial?: Partial<FormState>) {
  state = {
    name: "",
    email: "",
    decision: "",
    status: "idle",
    errorMsg: null,
    ...initial,
  };
  hookIndex = 0;
  useStateMock.mockImplementation(() => {
    switch (hookIndex++) {
      case 0:
        return [state.name, makeSetter("name")];
      case 1:
        return [state.email, makeSetter("email")];
      case 2:
        return [state.decision, makeSetter("decision")];
      case 3:
        return [state.status, makeSetter("status")];
      case 4:
        return [state.errorMsg, makeSetter("errorMsg")];
      default:
        throw new Error("Unexpected useState call");
    }
  });
}

function mount() {
  hookIndex = 0;
  return CouncilForm();
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
  if (node == null || typeof node === "boolean") return found;
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

function getInputs(root: React.ReactNode) {
  return collectElements(root, element => element.type === "input");
}

function getTextarea(root: React.ReactNode) {
  return findElement(root, element => element.type === "textarea");
}

function getForm(root: React.ReactNode) {
  return findElement(root, element => element.type === "form");
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  useStateMock.mockReset();
});

describe("CouncilForm", () => {
  it("renders the success state after a successful submission", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    setup();
    let tree = mount();

    getInputs(tree)[0].props.onChange({ target: { value: "Ada Lovelace" } });
    tree = mount();
    getInputs(tree)[1].props.onChange({
      target: { value: "ada@example.com" },
    });
    tree = mount();
    getTextarea(tree).props.onChange({
      target: { value: "Should I launch the new feature?" },
    });
    tree = mount();

    await getForm(tree).props.onSubmit({ preventDefault: vi.fn() });
    tree = mount();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ada Lovelace",
          email: "ada@example.com",
          decision: "Should I launch the new feature?",
        }),
      }),
    );
    expect(textOf(tree)).toContain("Noted. The council will convene.");
    expect(textOf(tree)).toContain("reply within 24 hours");
  });

  it("surfaces server copy on a 400 response and keeps the typed values", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "Missing fields" }),
    });

    setup();
    let tree = mount();

    getInputs(tree)[0].props.onChange({ target: { value: "Grace Hopper" } });
    tree = mount();
    getInputs(tree)[1].props.onChange({
      target: { value: "grace@example.com" },
    });
    tree = mount();
    getTextarea(tree).props.onChange({
      target: { value: "Should I keep the existing rollout?" },
    });
    tree = mount();

    await getForm(tree).props.onSubmit({ preventDefault: vi.fn() });
    tree = mount();

    expect(textOf(tree)).toContain("Missing fields");
    expect(getInputs(tree)[0].props.value).toBe("Grace Hopper");
    expect(getInputs(tree)[1].props.value).toBe("grace@example.com");
    expect(getTextarea(tree).props.value).toBe(
      "Should I keep the existing rollout?",
    );
  });

  it("shows the network error copy and preserves the draft on fetch failure", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    setup();
    let tree = mount();

    getInputs(tree)[0].props.onChange({ target: { value: "Linus Torvalds" } });
    tree = mount();
    getInputs(tree)[1].props.onChange({
      target: { value: "linus@example.com" },
    });
    tree = mount();
    getTextarea(tree).props.onChange({
      target: { value: "Should I wait for the next release train?" },
    });
    tree = mount();

    await getForm(tree).props.onSubmit({ preventDefault: vi.fn() });
    tree = mount();

    expect(textOf(tree)).toContain("Network error. Try again.");
    expect(getInputs(tree)[0].props.value).toBe("Linus Torvalds");
    expect(getInputs(tree)[1].props.value).toBe("linus@example.com");
    expect(getTextarea(tree).props.value).toBe(
      "Should I wait for the next release train?",
    );
  });
});
