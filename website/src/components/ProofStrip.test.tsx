/**
 * Unit tests for <ProofStrip/> — reusable social-proof signal strip.
 *
 * Vitest is configured with `environment: "node"` (no jsdom), so we
 * call the function component directly and walk the returned React
 * element tree, locating nodes by `data-testid` and inspecting their
 * props. This mirrors the pattern in upsell-modal.test.tsx.
 */

import { ProofStrip } from "./ProofStrip";
import { PROOF_STRIP_FALLBACK, type ProofStripData } from "@/lib/proof-strip";

// ──────────────────────────────────────────────────────────────────────────
//  Tiny React element walker utilities (same shape as upsell-modal.test.tsx)
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
//  Render helpers
// ──────────────────────────────────────────────────────────────────────────

function renderProofStrip(props: Parameters<typeof ProofStrip>[0]) {
  return (ProofStrip as unknown as (
    props: Parameters<typeof ProofStrip>[0],
  ) => unknown)(props);
}

// ──────────────────────────────────────────────────────────────────────────
//  Loading state
// ──────────────────────────────────────────────────────────────────────────

describe("<ProofStrip/> — loading state", () => {
  it("renders the loading container with data-testid='proof-strip-loading'", () => {
    const tree = renderProofStrip({ loading: true });
    const container = findByTestId(tree, "proof-strip-loading");
    expect(container).not.toBeNull();
  });

  it("does NOT render the live strip when loading=true", () => {
    const tree = renderProofStrip({ loading: true });
    expect(findByTestId(tree, "proof-strip")).toBeNull();
  });

  it("renders 3 skeleton placeholder elements", () => {
    const tree = renderProofStrip({ loading: true });
    const skeletons = findAllByTestId(tree, "proof-strip-skeleton");
    expect(skeletons).toHaveLength(3);
  });

  it("marks root with aria-busy='true'", () => {
    const tree = renderProofStrip({ loading: true });
    const container = findByTestId(tree, "proof-strip-loading");
    expect(container!.props!["aria-busy"]).toBe("true");
  });

  it("forwards className to the loading container", () => {
    const tree = renderProofStrip({ loading: true, className: "my-class" });
    const container = findByTestId(tree, "proof-strip-loading");
    expect(container!.props!.className).toBe("my-class");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Fallback state (no data, no loading)
// ──────────────────────────────────────────────────────────────────────────

describe("<ProofStrip/> — fallback state (no data prop)", () => {
  it("renders the live strip container", () => {
    const tree = renderProofStrip({});
    expect(findByTestId(tree, "proof-strip")).not.toBeNull();
  });

  it("does NOT render the loading container", () => {
    const tree = renderProofStrip({});
    expect(findByTestId(tree, "proof-strip-loading")).toBeNull();
  });

  it("renders the fallback subscriber count", () => {
    const tree = renderProofStrip({});
    const text = treeText(tree);
    expect(text).toContain(`${PROOF_STRIP_FALLBACK.subscriberCount}+`);
  });

  it("renders the fallback agon session count", () => {
    const tree = renderProofStrip({});
    const text = treeText(tree);
    expect(text).toContain(`${PROOF_STRIP_FALLBACK.agoraSessions}+`);
  });

  it("renders the fallback tagline text", () => {
    const tree = renderProofStrip({});
    const text = treeText(tree);
    expect(text).toContain(PROOF_STRIP_FALLBACK.tagline!);
  });

  it("renders 3 proof-strip-item nodes for the 3 fallback fields", () => {
    const tree = renderProofStrip({});
    const items = findAllByTestId(tree, "proof-strip-item");
    expect(items).toHaveLength(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Data prop state
// ──────────────────────────────────────────────────────────────────────────

describe("<ProofStrip/> — data prop provided", () => {
  const liveData: ProofStripData = {
    subscriberCount: 750,
    agoraSessions: 2000,
    tagline: "Trusted by smart founders",
  };

  it("renders the live strip", () => {
    const tree = renderProofStrip({ data: liveData });
    expect(findByTestId(tree, "proof-strip")).not.toBeNull();
  });

  it("renders the provided subscriber count", () => {
    const tree = renderProofStrip({ data: liveData });
    const text = treeText(tree);
    expect(text).toContain("750+");
  });

  it("renders the provided agon session count", () => {
    const tree = renderProofStrip({ data: liveData });
    const text = treeText(tree);
    expect(text).toContain("2000+");
  });

  it("renders the provided tagline", () => {
    const tree = renderProofStrip({ data: liveData });
    const text = treeText(tree);
    expect(text).toContain("Trusted by smart founders");
  });

  it("does NOT render fallback values when live data is provided", () => {
    const tree = renderProofStrip({ data: liveData });
    const text = treeText(tree);
    // Fallback has 500+ — live data is 750+, so 500+ must not appear
    expect(text).not.toContain("500+");
  });

  it("renders the correct number of items matching provided fields", () => {
    const tree = renderProofStrip({ data: liveData });
    const items = findAllByTestId(tree, "proof-strip-item");
    expect(items).toHaveLength(3);
  });

  it("renders only 1 item when only subscriberCount is provided", () => {
    const tree = renderProofStrip({ data: { subscriberCount: 100 } });
    const items = findAllByTestId(tree, "proof-strip-item");
    expect(items).toHaveLength(1);
  });

  it("renders only 1 item when only agoraSessions is provided", () => {
    const tree = renderProofStrip({ data: { agoraSessions: 400 } });
    const items = findAllByTestId(tree, "proof-strip-item");
    expect(items).toHaveLength(1);
  });

  it("renders only 1 item when only tagline is provided", () => {
    const tree = renderProofStrip({ data: { tagline: "A tagline" } });
    const items = findAllByTestId(tree, "proof-strip-item");
    expect(items).toHaveLength(1);
  });

  it("forwards className to the strip container", () => {
    const tree = renderProofStrip({ data: liveData, className: "extra" });
    const container = findByTestId(tree, "proof-strip");
    expect(container!.props!.className).toBe("extra");
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Empty data → returns null
// ──────────────────────────────────────────────────────────────────────────

describe("<ProofStrip/> — empty data object", () => {
  it("returns null when no fields produce any items", () => {
    const tree = renderProofStrip({ data: {} });
    expect(tree).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────
//  Accessibility
// ──────────────────────────────────────────────────────────────────────────

describe("<ProofStrip/> — accessibility", () => {
  it("separator dots carry aria-hidden='true'", () => {
    const tree = renderProofStrip({});
    let foundAriaHidden = false;
    walk(tree, (el) => {
      if (el.props && el.props["aria-hidden"] === "true") {
        foundAriaHidden = true;
      }
    });
    expect(foundAriaHidden).toBe(true);
  });

  it("value nodes have data-testid='proof-strip-value'", () => {
    const tree = renderProofStrip({ data: { subscriberCount: 100 } });
    const values = findAllByTestId(tree, "proof-strip-value");
    expect(values.length).toBeGreaterThan(0);
  });
});
