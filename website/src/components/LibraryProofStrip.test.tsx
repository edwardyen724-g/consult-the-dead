/**
 * Unit tests for <LibraryProofStrip/> — Reading Room social-proof strip.
 *
 * Vitest is configured with `environment: "node"` (no jsdom), so we call
 * the function component directly and walk the returned React element tree,
 * locating nodes by `data-testid` and inspecting their props. This mirrors
 * the pattern in ProofStrip.test.tsx and upsell-modal.test.tsx.
 */

import { LibraryProofStrip } from "./LibraryProofStrip";
import type { LibraryProgressStats } from "@/lib/library-stats";

// ──────────────────────────────────────────────────────────────────────────
//  Tiny React element walker utilities (same shape as ProofStrip.test.tsx)
// ──────────────────────────────────────────────────────────────────────────

interface ElementLike {
  type?: unknown;
  props?: Record<string, unknown> & { children?: unknown };
}

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

function findByTestId(root: unknown, id: string): ElementLike | null {
  let found: ElementLike | null = null;
  walk(root, (el) => {
    if (found) return;
    if (el.props && el.props["data-testid"] === id) found = el;
  });
  return found;
}

function findAllByTestId(root: unknown, id: string): ElementLike[] {
  const found: ElementLike[] = [];
  walk(root, (el) => {
    if (el.props && el.props["data-testid"] === id) found.push(el);
  });
  return found;
}

function collectText(node: unknown, acc: string[] = []): string[] {
  if (node == null || node === false) return acc;
  if (typeof node === "string" || typeof node === "number") {
    acc.push(String(node));
    return acc;
  }
  if (Array.isArray(node)) {
    for (const c of node) collectText(c, acc);
    return acc;
  }
  if (isElementLike(node)) {
    if (node.props && "children" in node.props) {
      collectText(node.props.children, acc);
    }
  }
  return acc;
}

function treeText(root: unknown): string {
  return collectText(root).join(" ");
}

// ──────────────────────────────────────────────────────────────────────────
//  Render helper
// ──────────────────────────────────────────────────────────────────────────

function renderStrip(props: Parameters<typeof LibraryProofStrip>[0]) {
  return (LibraryProofStrip as unknown as (
    props: Parameters<typeof LibraryProofStrip>[0],
  ) => unknown)(props);
}

// ──────────────────────────────────────────────────────────────────────────
//  Loading state
// ──────────────────────────────────────────────────────────────────────────

describe("<LibraryProofStrip/> — loading state", () => {
  it("renders the loading container with data-testid='library-proof-strip-loading'", () => {
    const tree = renderStrip({ loading: true });
    const container = findByTestId(tree, "library-proof-strip-loading");
    expect(container).not.toBeNull();
  });

  it("does NOT render the live strip when loading=true", () => {
    const tree = renderStrip({ loading: true });
    expect(findByTestId(tree, "library-proof-strip")).toBeNull();
  });

  it("renders 3 skeleton placeholder elements", () => {
    const tree = renderStrip({ loading: true });
    const skeletons = findAllByTestId(tree, "library-proof-strip-skeleton");
    expect(skeletons).toHaveLength(3);
  });

  it("marks root with aria-busy='true'", () => {
    const tree = renderStrip({ loading: true });
    const container = findByTestId(tree, "library-proof-strip-loading");
    expect(container!.props!["aria-busy"]).toBe("true");
  });

  it("marks root with aria-label='Loading library stats'", () => {
    const tree = renderStrip({ loading: true });
    const container = findByTestId(tree, "library-proof-strip-loading");
    expect(container!.props!["aria-label"]).toBe("Loading library stats");
  });

  it("forwards className to the loading container", () => {
    const tree = renderStrip({ loading: true, className: "my-class" });
    const container = findByTestId(tree, "library-proof-strip-loading");
    expect(container!.props!.className).toBe("my-class");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Fallback (no stats prop)
// ──────────────────────────────────────────────────────────────────────────

describe("<LibraryProofStrip/> — fallback state (no stats prop)", () => {
  it("renders the live strip container", () => {
    const tree = renderStrip({});
    expect(findByTestId(tree, "library-proof-strip")).not.toBeNull();
  });

  it("does NOT render the loading container", () => {
    const tree = renderStrip({});
    expect(findByTestId(tree, "library-proof-strip-loading")).toBeNull();
  });

  it("renders 3 stat label items for zeroed fallback", () => {
    const tree = renderStrip({});
    const items = findAllByTestId(tree, "library-proof-strip-item");
    expect(items).toHaveLength(3);
  });

  it("renders the zeroed minds label", () => {
    const tree = renderStrip({});
    const text = treeText(tree);
    expect(text).toContain("0 minds consulted so far");
  });

  it("renders the zeroed saved debates label", () => {
    const tree = renderStrip({});
    const text = treeText(tree);
    expect(text).toContain("0 saved debates");
  });

  it("renders the static tagline", () => {
    const tree = renderStrip({});
    const text = treeText(tree);
    expect(text).toContain("Growing with every return");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Live stats prop
// ──────────────────────────────────────────────────────────────────────────

describe("<LibraryProofStrip/> — live stats prop provided", () => {
  const liveStats: LibraryProgressStats = {
    consultedMinds: 7,
    savedDebates: 12,
  };

  it("renders the live strip", () => {
    const tree = renderStrip({ stats: liveStats });
    expect(findByTestId(tree, "library-proof-strip")).not.toBeNull();
  });

  it("renders the correct consulted-minds count", () => {
    const tree = renderStrip({ stats: liveStats });
    const text = treeText(tree);
    expect(text).toContain("7 minds consulted so far");
  });

  it("renders the correct saved-debates count", () => {
    const tree = renderStrip({ stats: liveStats });
    const text = treeText(tree);
    expect(text).toContain("12 saved debates");
  });

  it("renders the static tagline", () => {
    const tree = renderStrip({ stats: liveStats });
    const text = treeText(tree);
    expect(text).toContain("Growing with every return");
  });

  it("renders 3 stat label items", () => {
    const tree = renderStrip({ stats: liveStats });
    const items = findAllByTestId(tree, "library-proof-strip-item");
    expect(items).toHaveLength(3);
  });

  it("singularizes 'mind' and 'debate' when counts are one", () => {
    const tree = renderStrip({ stats: { consultedMinds: 1, savedDebates: 1 } });
    const text = treeText(tree);
    expect(text).toContain("1 mind consulted so far");
    expect(text).toContain("1 saved debate");
  });

  it("does NOT render zeroed fallback values when live stats provided", () => {
    const tree = renderStrip({ stats: liveStats });
    const text = treeText(tree);
    expect(text).not.toContain("0 minds");
    expect(text).not.toContain("0 saved debates");
  });

  it("forwards className to the strip container", () => {
    const tree = renderStrip({ stats: liveStats, className: "extra" });
    const container = findByTestId(tree, "library-proof-strip");
    expect(container!.props!.className).toBe("extra");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Accessibility
// ──────────────────────────────────────────────────────────────────────────

describe("<LibraryProofStrip/> — accessibility", () => {
  it("separator dots carry aria-hidden='true'", () => {
    const tree = renderStrip({
      stats: { consultedMinds: 4, savedDebates: 8 },
    });
    let foundAriaHidden = false;
    walk(tree, (el) => {
      if (el.props && el.props["aria-hidden"] === "true") {
        foundAriaHidden = true;
      }
    });
    expect(foundAriaHidden).toBe(true);
  });

  it("renders exactly 2 separator dots for 3 items", () => {
    const tree = renderStrip({
      stats: { consultedMinds: 4, savedDebates: 8 },
    });
    const dots: ElementLike[] = [];
    walk(tree, (el) => {
      if (
        el.props &&
        el.props["aria-hidden"] === "true" &&
        el.props.children === "·"
      ) {
        dots.push(el);
      }
    });
    expect(dots).toHaveLength(2);
  });
});
