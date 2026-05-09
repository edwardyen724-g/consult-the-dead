import { describe, expect, it, vi } from "vitest";

import { getAllFrameworks } from "@/lib/frameworks";
import {
  formatHeroStats,
  HERO_PRIMARY_CTA_HREF,
  HERO_SECONDARY_CTA_HREF,
} from "@/lib/hero-stats";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: unknown;
  }) => ({ type: "a", props: { href, ...props, children } }),
}));

vi.mock("@/components/MindCard", () => ({
  MindCard: ({ name }: { name: string }) => ({
    type: "article",
    props: { "data-testid": "mind-card", children: name },
  }),
}));

vi.mock("./worked-example", () => ({
  StreamingDemo: () => ({
    type: "section",
    props: { "data-testid": "streaming-demo" },
  }),
}));

import HomePage from "./page";

function expandTree(node: unknown): unknown {
  if (
    node === null ||
    node === undefined ||
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "boolean"
  ) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((child) => expandTree(child));
  }
  if (typeof node === "object" && node !== null && "type" in node) {
    const element = node as {
      type: unknown;
      props?: { children?: unknown };
    };
    if (typeof element.type === "function") {
      return expandTree(element.type(element.props ?? {}));
    }
    return {
      ...(element as Record<string, unknown>),
      props: {
        ...((element.props ?? {}) as Record<string, unknown>),
        children: expandTree(element.props?.children),
      },
    };
  }
  return node;
}

function collectText(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((child) => collectText(child)).join(" ");
  }
  if (typeof node === "object" && node !== null && "props" in node) {
    return collectText((node as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

function collectHrefs(node: unknown, hrefs: string[] = []): string[] {
  if (node === null || node === undefined || typeof node === "boolean") {
    return hrefs;
  }
  if (typeof node === "string" || typeof node === "number") {
    return hrefs;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      collectHrefs(child, hrefs);
    }
    return hrefs;
  }
  if (typeof node === "object" && node !== null && "type" in node) {
    const element = node as {
      type: unknown;
      props?: { href?: unknown; children?: unknown };
    };
    if (typeof element.type === "function") {
      collectHrefs(element.type(element.props ?? {}), hrefs);
      return hrefs;
    }
    if (typeof element.props?.href === "string") {
      hrefs.push(element.props.href);
    }
    collectHrefs(element.props?.children, hrefs);
  }
  return hrefs;
}

describe("HomePage", () => {
  it("renders the hero contract and excludes the removed HeroQuiz surface", () => {
    const tree = expandTree({ type: HomePage, props: {} });
    const heroStats = formatHeroStats({ minds: getAllFrameworks().length });
    const text = collectText(tree);
    const hrefs = collectHrefs(tree);

    expect(text).toContain(heroStats);
    expect(hrefs).toContain(HERO_PRIMARY_CTA_HREF);
    expect(hrefs).toContain(HERO_SECONDARY_CTA_HREF);
    expect(text).toContain("Begin your council — 3 free agons today");
    expect(text).toContain("See pricing");
    expect(text).not.toContain("Quick council finder");
  });
});
