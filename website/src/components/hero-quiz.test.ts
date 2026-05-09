import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const useStateMock = vi.hoisted(() => vi.fn());
const getPackMock = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

vi.mock("@/lib/packs", async () => {
  const actual = await vi.importActual<typeof import("@/lib/packs")>(
    "@/lib/packs",
  );
  return {
    ...actual,
    getPack: getPackMock,
  };
});

import { HeroQuiz } from "./hero-quiz";

function textContent(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (React.isValidElement(node)) return textContent(node.props.children);
  return "";
}

function materialize(node: React.ReactNode): React.ReactNode {
  if (node == null || typeof node === "boolean") return node;
  if (typeof node === "string" || typeof node === "number") return node;
  if (Array.isArray(node)) return node.map(materialize);
  if (!React.isValidElement(node)) return node;

  if (typeof node.type === "function") {
    return materialize((node.type as (props: typeof node.props) => React.ReactNode)(node.props));
  }

  return React.createElement(
    node.type,
    node.props,
    materialize(node.props.children),
  );
}

function collectElements(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
  results: React.ReactElement[] = [],
): React.ReactElement[] {
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, predicate, results);
    return results;
  }

  if (!React.isValidElement(node)) return results;

  if (predicate(node)) results.push(node);
  return collectElements(node.props.children, predicate, results);
}

beforeEach(() => {
  useStateMock.mockReset();
  getPackMock.mockReset();
});

describe("HeroQuiz", () => {
  it("renders the initial question flow and wires the choice handler", () => {
    const setAnswerIds = vi.fn();
    useStateMock.mockReturnValue([[], setAnswerIds]);

    const tree = materialize(HeroQuiz());
    const buttons = collectElements(
      tree,
      (element) => element.type === "button" && typeof element.props.onClick === "function",
    );

    expect(textContent(tree)).toContain("Quick council finder");
    expect(textContent(tree)).toContain("Question 1 of 3");
    expect(buttons).toHaveLength(5);

    const strategyButton = buttons.find((button) =>
      textContent(button).includes("Strategy or competition"),
    );

    expect(strategyButton).toBeDefined();
    strategyButton?.props.onClick();
    expect(setAnswerIds).toHaveBeenCalledWith(["challenge-strategy"]);
  });

  it("renders the recommendation state and wires the reset handler", () => {
    const setAnswerIds = vi.fn();
    getPackMock.mockReturnValue({
      name: "Stoic Council",
      colorVar: "var(--slate)",
    });
    useStateMock.mockReturnValue([
      ["challenge-personal", "pressure-clarity", "outcome-grounding"],
      setAnswerIds,
    ]);

    const tree = materialize(HeroQuiz());
    const buttons = collectElements(
      tree,
      (element) => element.type === "button" && typeof element.props.onClick === "function",
    );
    const links = collectElements(
      tree,
      (element) => typeof element.props.href === "string",
    );

    expect(textContent(tree)).toContain("Suggested council");
    expect(textContent(tree)).toContain("Lead with the Stoic Council");
    expect(textContent(tree)).toContain("Stoic Council · personal");
    expect(links.some((link) => link.props.href === "/agora?pack=stoic-council&utm_source=home&utm_campaign=hero_quiz&utm_content=stoic-council")).toBe(true);

    const resetButton = buttons.find((button) =>
      textContent(button).includes("Retake quiz"),
    );

    expect(resetButton).toBeDefined();
    resetButton?.props.onClick();
    expect(setAnswerIds).toHaveBeenCalledWith([]);
  });

  it("falls back to the category label when the pack lookup misses", () => {
    useStateMock.mockReturnValue([
      ["challenge-personal", "pressure-clarity", "outcome-grounding"],
      vi.fn(),
    ]);
    getPackMock.mockReturnValue(null);

    const tree = materialize(HeroQuiz());
    expect(textContent(tree)).toContain("personal");
    expect(textContent(tree)).not.toContain("Stoic Council · personal");
  });

  it("falls back to the first question when the state index is out of range", () => {
    useStateMock.mockReturnValue([
      [
        "challenge-strategy",
        "pressure-timing",
        "outcome-directive",
        "unknown-answer",
      ],
      vi.fn(),
    ]);

    const tree = materialize(HeroQuiz());
    expect(textContent(tree)).toContain("Suggested council");
  });
});
