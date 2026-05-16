/**
 * Tests for the Header component.
 *
 * Vitest runs in node (no jsdom). We test:
 *   1. Exported constants — the quiz CTA href contract is verified directly.
 *   2. Structural rendering — Header is called with mocked hooks so we can
 *      walk the React element tree and assert nav items per auth variant.
 *
 * Three nav variants are covered:
 *   - Logged-out: marketing nav (Agora, Council, Find Your Mind, Pricing,
 *     About, Take the Quiz CTA, Sign in, big amber Enter button).
 *   - Free signed-in: trimmed product nav (Agora, Library, Upgrade) + UserButton.
 *   - Pro signed-in: minimal product nav (Agora, Library) + Pro pill + UserButton.
 *
 * The mock strategy mirrors ShareCtaStrip.test.tsx: call the component as a
 * plain function and walk the resulting React element tree.
 */
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* ── Mock external dependencies before importing Header ───────── */

// Next.js Link: a plain pass-through that renders an <a>-like element.
vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => ({ type: "a", props }),
}));

// Clerk hook state — mutable so each describe block can set its own variant.
type UserState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: { publicMetadata?: { subscription_tier?: string } } | null;
};

const userState: UserState = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
};

vi.mock("@clerk/nextjs", () => ({
  useUser: () => userState,
  SignInButton: (props: Record<string, unknown>) => ({
    type: "span",
    props: { ...props, "data-testid": "sign-in-button" },
  }),
  UserButton: () => ({ type: "span", props: { "data-testid": "user-button" } }),
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
import { buildQuizEntryHref } from "@/lib/ctr-experiment";

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

function hrefIs(href: string) {
  return (el: ElementLike) => (el.props as { href?: string }).href === href;
}

function textIncludes(needle: string) {
  return (el: ElementLike) => {
    const children = el.props.children;
    if (typeof children !== "string") return false;
    return children.includes(needle);
  };
}

function setUserState(next: Partial<UserState>): void {
  userState.isLoaded = next.isLoaded ?? true;
  userState.isSignedIn = next.isSignedIn ?? false;
  userState.user = next.user ?? null;
}

const renderHeader = Header as unknown as () => ReactNode;

/* ── Exported constant tests ──────────────────────────────────── */

describe("Header exported constants", () => {
  it("HEADER_QUIZ_ENTRY_HREF resolves to /quiz?entry=guided (guided mode)", () => {
    expect(HEADER_QUIZ_ENTRY_HREF).toBe(buildQuizEntryHref("guided"));
  });

  it("HEADER_QUIZ_CTA_HREF resolves through the shared helper", () => {
    expect(HEADER_QUIZ_CTA_HREF).toBe(buildQuizEntryHref("header"));
  });

  it("HEADER_QUIZ_CTA_HREF includes the required UTM params", () => {
    const url = new URL(buildQuizEntryHref("header"), "https://example.com");
    expect(url.pathname).toBe("/quiz");
    expect(url.searchParams.get("utm_source")).toBe("header");
    expect(url.searchParams.get("utm_medium")).toBe("nav");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });
});

/* ── Logged-out variant ───────────────────────────────────────── */

describe("Header — logged-out variant (marketing nav)", () => {
  beforeEach(() => {
    setUserState({ isLoaded: true, isSignedIn: false, user: null });
  });

  it("renders the Take the Quiz CTA link with UTM params", () => {
    const tree = renderHeader();
    const quizLinks = findAll(tree, hrefIs(HEADER_QUIZ_CTA_HREF));
    expect(quizLinks.length).toBeGreaterThanOrEqual(1);
    const href = (quizLinks[0]!.props as { href: string }).href;
    const url = new URL(href, "https://example.com");
    expect(url.searchParams.get("utm_source")).toBe("header");
    expect(url.searchParams.get("utm_medium")).toBe("nav");
    expect(url.searchParams.get("utm_campaign")).toBe("guided_entry");
  });

  it("Take the Quiz CTA has a descriptive aria-label", () => {
    const tree = renderHeader();
    const quizLinks = findAll(tree, hrefIs(HEADER_QUIZ_CTA_HREF));
    const ariaLabel = (quizLinks[0]!.props as { "aria-label"?: string })["aria-label"];
    expect(typeof ariaLabel).toBe("string");
    expect((ariaLabel as string).length).toBeGreaterThan(0);
  });

  it("Take the Quiz CTA appears in both desktop nav and mobile overlay", () => {
    const tree = renderHeader();
    const quizLinks = findAll(tree, hrefIs(HEADER_QUIZ_CTA_HREF));
    expect(quizLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders The Council, Pricing, About, and Find Your Mind links", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/frameworks")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/pricing")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/essay")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs(HEADER_QUIZ_ENTRY_HREF)).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the big amber Enter CTA pointing at /agora", () => {
    const tree = renderHeader();
    const enterButtons = findAll(
      tree,
      (el) =>
        hrefIs("/agora")(el) &&
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Enter",
    );
    expect(enterButtons.length).toBe(1);
  });

  it("does NOT render the Library link or Upgrade link", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/library")).length).toBe(0);
    expect(findAll(tree, textIncludes("Upgrade")).length).toBe(0);
  });
});

/* ── Free signed-in variant ───────────────────────────────────── */

describe("Header — free signed-in variant (trimmed product nav + Upgrade)", () => {
  beforeEach(() => {
    setUserState({
      isLoaded: true,
      isSignedIn: true,
      user: { publicMetadata: { subscription_tier: undefined } },
    });
  });

  it("renders The Agora and Library nav links", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/agora")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/library")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders an Upgrade link pointing at /pricing", () => {
    const tree = renderHeader();
    const upgradeLinks = findAll(
      tree,
      (el) =>
        hrefIs("/pricing")(el) &&
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Upgrade",
    );
    expect(upgradeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("Upgrade link appears in both desktop nav and mobile overlay", () => {
    const tree = renderHeader();
    const upgradeLinks = findAll(
      tree,
      (el) =>
        hrefIs("/pricing")(el) &&
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Upgrade",
    );
    expect(upgradeLinks.length).toBeGreaterThanOrEqual(2);
  });

it("does NOT render marketing nav items (Council, About, Find Your Mind, Take the Quiz)", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/frameworks")).length).toBe(0);
    expect(findAll(tree, hrefIs("/essay")).length).toBe(0);
    expect(findAll(tree, hrefIs(HEADER_QUIZ_ENTRY_HREF)).length).toBe(0);
    expect(findAll(tree, hrefIs(HEADER_QUIZ_CTA_HREF)).length).toBe(0);
  });

  it("does NOT render the big amber Enter button on the right", () => {
    const tree = renderHeader();
    const enterButtons = findAll(
      tree,
      (el) =>
        hrefIs("/agora")(el) &&
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Enter",
    );
    expect(enterButtons.length).toBe(0);
  });

  it("does NOT render the Pro badge", () => {
    const tree = renderHeader();
    const proBadges = findAll(
      tree,
      (el) =>
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Pro",
    );
    expect(proBadges.length).toBe(0);
  });
});

/* ── Pro signed-in variant ────────────────────────────────────── */

describe("Header — Pro signed-in variant (minimal nav + Pro pill)", () => {
  beforeEach(() => {
    setUserState({
      isLoaded: true,
      isSignedIn: true,
      user: { publicMetadata: { subscription_tier: "pro" } },
    });
  });

  it("renders The Agora and Library nav links", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/agora")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/library")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Pro badge next to the UserButton", () => {
    const tree = renderHeader();
    const proBadges = findAll(
      tree,
      (el) =>
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Pro" &&
        (el.props as { "aria-label"?: string })["aria-label"] === "Pro subscriber",
    );
    expect(proBadges.length).toBeGreaterThanOrEqual(1);
  });

it("does NOT render the Upgrade link", () => {
    const tree = renderHeader();
    const upgradeLinks = findAll(
      tree,
      (el) =>
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Upgrade",
    );
    expect(upgradeLinks.length).toBe(0);
  });

  it("does NOT render marketing nav items or the Enter CTA", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/frameworks")).length).toBe(0);
    expect(findAll(tree, hrefIs("/essay")).length).toBe(0);
    expect(findAll(tree, hrefIs("/pricing")).length).toBe(0);
    expect(findAll(tree, hrefIs(HEADER_QUIZ_CTA_HREF)).length).toBe(0);
    const enterButtons = findAll(
      tree,
      (el) =>
        hrefIs("/agora")(el) &&
        typeof el.props.children === "string" &&
        (el.props.children as string).trim() === "Enter",
    );
    expect(enterButtons.length).toBe(0);
  });
});

/* ── Auth-loading variant ─────────────────────────────────────── */

describe("Header — auth not yet loaded (renders logged-out variant)", () => {
  beforeEach(() => {
    setUserState({ isLoaded: false, isSignedIn: false, user: null });
  });

  it("falls back to marketing nav while Clerk is loading", () => {
    const tree = renderHeader();
    expect(findAll(tree, hrefIs("/frameworks")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/pricing")).length).toBeGreaterThanOrEqual(1);
    expect(findAll(tree, hrefIs("/library")).length).toBe(0);
  });
});
