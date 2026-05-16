import { describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => {
  class MockImageResponse {
    body: unknown;
    options: unknown;

    constructor(body: unknown, options: unknown) {
      this.body = body;
      this.options = options;
    }
  }

  return { ImageResponse: MockImageResponse };
});

import Image, {
  alt,
  contentType,
  dynamicParams,
  revalidate,
  runtime,
  size,
} from "./opengraph-image";
import {
  getPricingMetadataDescription,
  getPricingMetadataTitle,
  getPricingSharePreviewCard,
} from "@/lib/pricing-copy";

function collectText(node: unknown): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectText);
  if (typeof node === "object" && "props" in node) {
    return collectText((node as { props?: { children?: unknown } }).props?.children);
  }
  return [];
}

describe("pricing opengraph-image", () => {
  it("exports the canonical route metadata", () => {
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(dynamicParams).toBe(false);
    expect(alt).toBe("Pricing share card from Consult The Dead");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  it("renders the canonical pricing copy into the share image", async () => {
    const response = await Image();
    const text = collectText((response as { body: unknown }).body).join(" ");

    expect(response).toMatchObject({ options: size });
    expect(text).toContain("Run your hardest decision through 30 historical minds.");
    expect(text).toContain("They'll disagree. You'll decide.");
    expect(text).toContain(getPricingMetadataTitle());
    expect(text).toContain(getPricingMetadataDescription());
    expect(text).toContain(getPricingSharePreviewCard());
    expect(text).toContain("Always free to start with 3 agons/day");
    expect(text).toContain("Free-tier limits reset each day at UTC midnight");
    expect(text).toContain("BYO key unlimited mode");
    expect(text).toContain("founding-member pricing at $300/year");
  });
});
