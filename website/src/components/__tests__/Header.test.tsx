/**
 * Tests for the Header component.
 *
 * Vitest runs in node (no jsdom). We test:
 *   1. Exported constants — the quiz CTA href contract is verified directly.
 *   2. Structural rendering — Header is called with mocked hooks so we can
 *      walk the React element tree and assert the CTA link is present.
 *
 * The mock strategy mirrors ShareCtaStrip.test.tsx: call the component as a
 * plain function and walk the resulting React element tree.
 */
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeAll } from "vitest";

/* ── Mock external dependencies before importing Header ───────── */

// Next.js Link: a plain pass-through that renders an <a>-like element.
vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => ({ type: "a", props }),
}));

// Clerk hooks — return a stable signed-out state so the conditional nav
// items are predictable without needing a real Clerk context.
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: false }),
  SignInButton: (props: Record<string, unknown>) => ({
    type: "span",
    props,
  }),
  UserButton: () => ({ type: "span", props: {} }),
}));

// ThemeToggle — not relevant to link structure.
vi.mock("../ThemeToggle", () => ({
  ThemeToggle: () => ({ type: "span", props: { "data-testid": "theme-toggle" } }),
}));

// React.useState — stub so we can call Header in node without a React runtime.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => [initial, () => {}],
  };
});

import {
  HEADER_QUIZ_ENTRY_HREF,
  HEADER_QUIZ_CTA_HREF,
  Header,
} from "../Header";

/* ── Tree-walking helpers (same pattern as ShareCtaStrip.test.tsx) ── */

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

function findAll(
  tree: ReactNode,
  predicate: (el: ElementLike) => boolean,
): ElementLike[] {
  return flatten(tree).filter(predicate);
}

/* ── Exported constant tests ──────────────────────────────────── */

describe("Header exported constants", () => {
  it("HEADER_QUIZ_ENTRY_HREF resolves to /quiz?entry=guided (guided mode)", () => {
    expect(HEADER_QUIZ_ENTRY_HREF).toBe("/quiz?entry=guided");
  });

  it("HEADER_QUIZ_CTA_HREF includes the required UTM params", () => {
    const url = new URL(HEADER_QUIZ_CTA_HREF, "https://example.com");
    expect(url.pathname).toBe("/quiz");
    expect(url.searchParams.get("utm_source")).toBe("header");
    expect(url.searchParams.get("utm_medium")).toBe("nav");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });
});

/* ── Structural rendering tests ───────────────────────────────── */

describe("Header component — quiz CTA link", () => {
  const tree = Header({});

  it("renders at least one link pointing to HEADER_QUIZ_CTA_HREF", () => {
    const quizLinks = findAll(tree as ReactNode, (el) => {
      const href = (el.props as { href?: string }).href;
      return href === HEADER_QUIZ_CTA_HREF;
    });
    expect(quizLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("quiz CTA link has the correct full href with all UTM params", () => {
    const quizLinks = findAll(tree as ReactNode, (el) => {
      const href = (el.props as { href?: string }).href;
      return typeof href === "string" && href.includes("utm_campaign=guided_entry");
    });
    expect(quizLinks.length).toBeGreaterThanOrEqual(1);
    const href = (quizLinks[0]!.props as { href: string }).href;
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("header");
    expect(url.searchParams.get("utm_medium")).toBe("nav");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });

  it("quiz CTA appears in the mobile overlay (navLinks shared between desktop and mobile)", () => {
    // The mobile overlay uses the same navLinks fragment, so we expect
    // at least 2 instances of the CTA link in the full tree.
    const quizLinks = findAll(tree as ReactNode, (el) => {
      const href = (el.props as { href?: string }).href;
      return href === HEADER_QUIZ_CTA_HREF;
    });
    expect(quizLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("quiz CTA link has a descriptive aria-label", () => {
    const quizLinks = findAll(tree as ReactNode, (el) => {
      const href = (el.props as { href?: string }).href;
      return href === HEADER_QUIZ_CTA_HREF;
    });
    const ariaLabel = (quizLinks[0]!.props as { "aria-label"?: string })["aria-label"];
    expect(typeof ariaLabel).toBe("string");
    expect((ariaLabel as string).length).toBeGreaterThan(0);
  });
});
