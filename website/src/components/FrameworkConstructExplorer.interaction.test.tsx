import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";

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

import {
  FrameworkConstructExplorer,
  type ConstructExplorerConstruct,
  type ConstructExplorerPrediction,
} from "./FrameworkConstructExplorer";

type Store = {
  positions: number[];
};

let store: Store;
let hookIndex = 0;

const constructs: ConstructExplorerConstruct[] = [
  {
    construct: "systematic verification vs. incremental validation",
    positive_pole: "Rebuilds knowledge from first principles",
    negative_pole: "Builds on accepted practice",
    behavioral_implication:
      "Would audit and rebuild core processes rather than trusting inherited workflows.",
  },
];

const predictions: ConstructExplorerPrediction[] = [
  {
    situation_type: "Joining a new organization",
    ordinary_response: "Learn the current playbook and improve it gradually.",
    framework_response:
      "Would systematically audit the institution's core processes from first principles.",
    because: "The framework prioritizes reconstruction over incremental accommodation.",
    confidence: 0.88,
  },
];

function makeSetter() {
  return (value: number[] | ((current: number[]) => number[])) => {
    store.positions =
      typeof value === "function" ? value(store.positions) : value;
  };
}

function setup(initialPositions: number[]) {
  store = { positions: initialPositions };
  hookIndex = 0;
  useStateMock.mockImplementation(() => {
    if (hookIndex++ > 0) {
      throw new Error("Unexpected useState call");
    }
    return [store.positions, makeSetter()];
  });
}

function childrenOf(node: React.ReactNode): React.ReactNode[] {
  if (node == null || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node;
  if (React.isValidElement(node)) {
    if (typeof node.type === "function") {
      return [node.type(node.props)];
    }
    return childrenOf(node.props.children);
  }
  return [];
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
  if (typeof node.type === "function") {
    collectElements(node.type(node.props), predicate, found);
    return found;
  }
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

function getInput(root: React.ReactNode) {
  return findElement(root, (element) => element.type === "input");
}

function mount() {
  hookIndex = 0;
  return FrameworkConstructExplorer({
    person: "Isaac Newton",
    color: "var(--amber)",
    constructs,
    predictions,
  });
}

beforeEach(() => {
  useStateMock.mockReset();
});

describe("FrameworkConstructExplorer interaction", () => {
  it("updates the rendered orientation when the slider changes", () => {
    setup([]);
    const initialTree = mount();
    const input = getInput(initialTree);

    expect(input.props["aria-valuetext"]).toBe("balanced between the poles");

    input.props.onChange({ target: { value: "80" } });
    expect(store.positions).toEqual([80]);

    const rerenderedTree = mount();
    const rerenderedInput = getInput(rerenderedTree);

    expect(rerenderedInput.props["aria-valuetext"]).toBe(
      "leaning toward Rebuilds knowledge from first principles",
    );
  });
});
