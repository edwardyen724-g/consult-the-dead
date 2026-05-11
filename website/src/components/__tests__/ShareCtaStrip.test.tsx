/**
 * Structural tests for the ShareCtaStrip server component.
 *
 * Vitest is configured for node (not jsdom), so we can't render with
 * react-dom or testing-library. Instead we exercise these server
 * components as plain functions: they return a ReactElement tree, and
 * we walk the tree to assert structural invariants — UTM contract on
 * the rendered href, presence of the data-print="hide" attribute,
 * variant-specific class names, and copy constants from the shared
 * source of truth.
 *
 * This keeps the component coverage-eligible (per dev protocol's 95%
 * gate on changed files) without pulling in a full DOM stack.
 */
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  SHARE_CTA_BUTTON_LABEL,
  SHARE_CTA_HEADLINE,
  SHARE_CTA_SUBLINE,
} from "@/lib/share-cta-link";

import { ShareCtaStrip, ShareCtaStyles } from "../ShareCtaStrip";

/* ── React-tree walking helpers ───────────────────────────────── */

interface ElementLike {
  type: unknown;
  props: Record<string, unknown> & { children?: ReactNode };
}

function isElement(node: unknown): node is ElementLike {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    "props" in node
  );
}

/**
 * Recursively expand any function-component elements (e.g. the inner
 * <InlinePanel /> returned by ShareCtaStrip) by invoking them with
 * their props. Server components are pure functions, so this gives us
 * the fully rendered intrinsic tree to assert on.
 */
function expand(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(expand);
  if (!isElement(node)) return node;
  if (typeof node.type === "function") {
    const fn = node.type as (props: Record<string, unknown>) => ReactNode;
    return expand(fn(node.props));
  }
  // Intrinsic element ("div", "span", "a", "style", …): recurse into
  // children but keep the element itself.
  const next = { ...node, props: { ...node.props } };
  if (node.props.children !== undefined) {
    next.props.children = expand(node.props.children as ReactNode) as ReactNode;
  }
  return next as ElementLike;
}

function flatten(node: ReactNode): ElementLike[] {
  const out: ElementLike[] = [];
  function walk(n: ReactNode): void {
    if (Array.isArray(n)) {
      for (const child of n) walk(child);
      return;
    }
    if (!isElement(n)) return;
    out.push(n);
    const children = n.props.children;
    if (children !== undefined) walk(children as ReactNode);
  }
  walk(node);
  return out;
}

function findFirst(
  tree: ReactElement,
  predicate: (el: ElementLike) => boolean,
): ElementLike | null {
  for (const el of flatten(tree)) {
    if (predicate(el)) return el;
  }
  return null;
}

function findAll(
  tree: ReactElement,
  predicate: (el: ElementLike) => boolean,
): ElementLike[] {
  return flatten(tree).filter(predicate);
}

function getString(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getString).join("");
  if (isElement(node)) return getString(node.props.children as ReactNode);
  return "";
}

/* ── Inline variant ───────────────────────────────────────────── */

describe("ShareCtaStrip — inline variant", () => {
  const tree = expand(
    ShareCtaStrip({ shareId: "ali-rohde-pivot", variant: "inline" }),
  ) as ReactElement;

  it("returns an element with the .sct-inline class", () => {
    const root = tree as unknown as ElementLike;
    expect(root.props.className).toBe("sct-inline");
  });

  it("carries data-print=\"hide\" on the root", () => {
    const root = tree as unknown as ElementLike;
    expect(root.props["data-print"]).toBe("hide");
  });

  it("renders a Link/<a> whose href is the share-CTA URL", () => {
    const link = findFirst(tree, (el) => {
      const href = (el.props as { href?: string }).href;
      return typeof href === "string" && href.startsWith("/agora?");
    });
    expect(link).not.toBeNull();
    const href = (link!.props as { href: string }).href;
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("share");
    expect(url.searchParams.get("utm_campaign")).toBe("agon_share");
    expect(url.searchParams.get("utm_content")).toBe("ali-rohde-pivot");
  });

  it("includes both the headline and the subline copy", () => {
    const text = getString(tree);
    expect(text).toContain(SHARE_CTA_HEADLINE);
    expect(text).toContain(SHARE_CTA_SUBLINE);
    expect(text).toContain(SHARE_CTA_BUTTON_LABEL);
  });
});

/* ── Sticky variant ───────────────────────────────────────────── */

describe("ShareCtaStrip — sticky variant", () => {
  const tree = expand(
    ShareCtaStrip({ shareId: "ali-rohde-pivot", variant: "sticky" }),
  ) as ReactElement;

  it("returns an element with the .sct-sticky class", () => {
    const root = tree as unknown as ElementLike;
    expect(root.props.className).toBe("sct-sticky");
  });

  it("uses position:fixed so it stays at the viewport bottom", () => {
    const root = tree as unknown as ElementLike;
    const style = root.props.style as Record<string, unknown> | undefined;
    expect(style?.position).toBe("fixed");
    expect(style?.bottom).toBe(0);
  });

  it("carries data-print=\"hide\" on the root", () => {
    const root = tree as unknown as ElementLike;
    expect(root.props["data-print"]).toBe("hide");
  });

  it("renders the share-CTA href with the same UTM contract", () => {
    const links = findAll(tree, (el) => {
      const href = (el.props as { href?: string }).href;
      return typeof href === "string" && href.startsWith("/agora?");
    });
    expect(links.length).toBeGreaterThan(0);
    const href = (links[0].props as { href: string }).href;
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("share");
    expect(url.searchParams.get("utm_campaign")).toBe("agon_share");
    expect(url.searchParams.get("utm_content")).toBe("ali-rohde-pivot");
  });

  it("includes the headline and button label in the rendered text", () => {
    const text = getString(tree);
    expect(text).toContain(SHARE_CTA_HEADLINE);
    expect(text).toContain(SHARE_CTA_BUTTON_LABEL);
  });
});

/* ── ShareCtaStyles — responsive show/hide ────────────────────── */

describe("ShareCtaStyles", () => {
  it("emits a <style> element with both .sct-inline and .sct-sticky rules", () => {
    const tree = ShareCtaStyles() as ReactElement;
    const root = tree as unknown as ElementLike;
    expect(root.type).toBe("style");
    const html = (
      root.props.dangerouslySetInnerHTML as { __html: string } | undefined
    )?.__html ?? "";
    expect(html).toContain(".sct-inline");
    expect(html).toContain(".sct-sticky");
    expect(html).toContain("@media (max-width: 720px)");
    expect(html).toContain("@media print");
  });
});
