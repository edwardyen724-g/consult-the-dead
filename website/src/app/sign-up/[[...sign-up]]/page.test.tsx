import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createElement } from "react";

const SignUpMock = vi.hoisted(() => function SignUpMock() {
  return null;
});

vi.mock("@clerk/nextjs", () => ({
  SignUp: SignUpMock,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    createElement("a", { href }, children)
  ),
}));

import SignUpPage from "./page";
import {
  SIGN_UP_TIER_COPY,
  buildSignUpUnsafeMetadata,
} from "./utm-stamper";

function collectElements(node: unknown, out: Array<{ type: unknown; props: Record<string, unknown> }>) {
  if (!node || typeof node !== "object") return;
  const element = node as { type?: unknown; props?: Record<string, unknown> };
  if (element.type && element.props) out.push({ type: element.type, props: element.props });

  const props = element.props;
  if (!props) return;
  for (const value of Object.values(props)) {
    if (Array.isArray(value)) {
      for (const item of value) collectElements(item, out);
    } else {
      collectElements(value, out);
    }
  }
}

describe("buildSignUpUnsafeMetadata", () => {
  it("stamps the preserved UTM keys and ignores missing values", () => {
    expect(
      buildSignUpUnsafeMetadata({ utm_source: "home", utm_campaign: "spring" }),
    ).toEqual({ utm_source: "home", utm_campaign: "spring" });
    expect(buildSignUpUnsafeMetadata({ utm_source: "   " })).toBeUndefined();
    expect(buildSignUpUnsafeMetadata(undefined)).toBeUndefined();
  });

  it("takes the first array entry when Next.js provides repeated params", () => {
    expect(
      buildSignUpUnsafeMetadata({
        utm_source: ["newsletter", "ignored"],
        utm_campaign: ["free-path", "ignored"],
      }),
    ).toEqual({ utm_source: "newsletter", utm_campaign: "free-path" });
  });

  it("ignores non-string repeated and scalar params", () => {
    expect(
      buildSignUpUnsafeMetadata(
        {
          utm_source: [123 as unknown as string],
          utm_campaign: 456 as unknown as string,
        } as unknown as never,
      ),
    ).toBeUndefined();
  });
});

describe("SignUpPage", () => {
  it("renders the branded shell and forwards the unsafe metadata to Clerk", async () => {
    const tree = await SignUpPage({
      searchParams: Promise.resolve({
        utm_source: "home",
        utm_campaign: "hero_primary",
      }),
    });

    const elements: Array<{ type: unknown; props: Record<string, unknown> }> = [];
    collectElements(tree, elements);
    const clerkNode = elements.find((entry) => entry.type === SignUpMock);

    expect(clerkNode).toBeTruthy();
    expect(clerkNode?.props).toMatchObject({
      routing: "path",
      path: "/sign-up",
      signInUrl: "/sign-in",
      fallbackRedirectUrl: "/agora",
      signInFallbackRedirectUrl: "/agora",
      unsafeMetadata: {
        utm_source: "home",
        utm_campaign: "hero_primary",
      },
    });
  });

  it("keeps the tier copy aligned with the free/BYO/pro contract", () => {
    expect(SIGN_UP_TIER_COPY.map((tier) => tier.name)).toEqual([
      "Free",
      "BYO key",
      "Pro",
    ]);
    expect(SIGN_UP_TIER_COPY[0].copy).toContain("3 agons per day");
    expect(SIGN_UP_TIER_COPY[1].copy).toContain("Unlimited agons");
    expect(SIGN_UP_TIER_COPY[2].copy).toContain("private library");
  });

  it("falls back to the dim color when a tier omits its accent", async () => {
    const firstTier = SIGN_UP_TIER_COPY[0] as { color?: string };
    const originalColor = firstTier.color;
    delete firstTier.color;

    try {
      const tree = await SignUpPage({
        searchParams: Promise.resolve({}),
      });

      const elements: Array<{ type: unknown; props: Record<string, unknown> }> =
        [];
      collectElements(tree, elements);
      const freeTierLabel = elements.find(
        (entry) => entry.props.children === "Free",
      );

      expect(freeTierLabel?.props.style).toMatchObject({
        color: "var(--fg-dim)",
      });
    } finally {
      firstTier.color = originalColor;
    }
  });
});
