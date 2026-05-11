import path from "path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const readFileSyncMock = vi.hoisted(() => vi.fn());

vi.mock("fs", () => ({
  default: {
    readFileSync: readFileSyncMock,
  },
  readFileSync: readFileSyncMock,
}));

import EssayPage from "./page";

type ElementLike = {
  type?: unknown;
  props?: Record<string, unknown> & { children?: unknown };
};

function isElementLike(node: unknown): node is ElementLike {
  return (
    typeof node === "object" &&
    node !== null &&
    "props" in (node as Record<string, unknown>)
  );
}

function walk(node: unknown, visit: (el: ElementLike) => void): void {
  if (node == null || node === false) return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!isElementLike(node)) return;
  visit(node);
  if (node.props && "children" in node.props) {
    walk(node.props.children, visit);
  }
}

function collectText(node: unknown, acc: string[] = []): string[] {
  if (node == null || node === false) return acc;
  if (typeof node === "string" || typeof node === "number") {
    acc.push(String(node));
    return acc;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, acc);
    return acc;
  }
  if (isElementLike(node) && node.props && "children" in node.props) {
    collectText(node.props.children, acc);
  }
  return acc;
}

function textOf(node: unknown): string {
  return collectText(node).join(" ");
}

function findByHref(root: unknown, href: string): ElementLike | null {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.props?.href === href) {
      found = el;
    }
  });
  return found;
}

describe("essay page", () => {
  beforeEach(() => {
    readFileSyncMock.mockReset();
  });

  it("renders the essay markdown file, keeps the back-link, and preserves inline markdown links", () => {
    readFileSyncMock.mockReturnValue(
      [
        "# From the Archive",
        "",
        "A short essay with [contact us](/contact) and *emphasis*.",
        "",
        "## Next Steps",
      ].join("\n"),
    );

    const tree = EssayPage();
    const expectedPath = path.join(
      process.cwd(),
      "content",
      "consulting-the-dead.md",
    );

    expect(readFileSyncMock).toHaveBeenCalledWith(expectedPath, "utf-8");
    expect(textOf(tree)).toContain("From the Archive");
    expect(textOf(tree)).toContain("Next Steps");

    const backLink = findByHref(tree, "/");
    expect(backLink).not.toBeNull();
    expect(textOf(backLink)).toContain("Consult The Dead");

    const inlineLink = findByHref(tree, "/contact");
    expect(inlineLink).not.toBeNull();
    expect(textOf(inlineLink)).toContain("contact us");
    expect(inlineLink?.props?.target).toBe("_blank");
  });

  it("falls back to the missing-file message when the essay markdown cannot be read", () => {
    readFileSyncMock.mockImplementation(() => {
      throw new Error("ENOENT");
    });

    const tree = EssayPage();

    expect(textOf(tree)).toContain("Essay not found");
    expect(textOf(tree)).toContain("The essay markdown file is missing.");
    expect(findByHref(tree, "/")).not.toBeNull();
  });
});
