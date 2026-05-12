/**
 * Regression tests for /essay/opengraph-image.
 *
 * Asserts the static route contract (exports) and that the branded share
 * card renders the expected essay copy without needing a Satori binary
 * (next/og is mocked via a lightweight MockImageResponse).
 *
 * The essay OG image passes a sub-component (<EssayBody />) to ImageResponse
 * rather than an inline JSX tree, so text assertions call the body's type
 * function (i.e. EssayBody()) to obtain the rendered element tree.
 */
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

import Image, { alt, contentType, runtime, size } from "./opengraph-image";

type ReactNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactElement
  | ReactNode[];

type ReactElement = {
  type?: unknown;
  props?: Record<string, unknown> & { children?: ReactNode };
};

function collectText(node: unknown): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number")
    return [String(node)];
  if (Array.isArray(node)) return (node as unknown[]).flatMap(collectText);
  if (
    typeof node === "object" &&
    "props" in (node as Record<string, unknown>)
  ) {
    return collectText(
      (node as ReactElement).props?.children,
    );
  }
  return [];
}

/**
 * Render the React element body:
 * The essay OG image passes `<EssayBody />` to ImageResponse. That React
 * element has `type = EssayBody` (a function) and empty props. Calling
 * `body.type()` invokes the component and returns its JSX tree, which
 * collectText can then traverse.
 */
function renderBody(body: unknown): unknown {
  if (
    body != null &&
    typeof body === "object" &&
    "type" in (body as Record<string, unknown>) &&
    typeof (body as Record<string, unknown>).type === "function"
  ) {
    return (body as { type: () => unknown }).type();
  }
  return body;
}

describe("essay opengraph-image", () => {
  it("exports the canonical route metadata", () => {
    expect(runtime).toBe("nodejs");
    expect(alt).toBe(
      "Consulting the Dead, Not Distilling the Living — Consult The Dead",
    );
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  it("returns an ImageResponse with the correct dimensions", () => {
    const response = Image();

    expect(response).toMatchObject({ options: size });
    expect(response).toMatchObject({ options: { width: 1200, height: 630 } });
  });

  it("includes the site name and essay label in the rendered card", () => {
    const response = Image();
    const rendered = renderBody((response as { body: unknown }).body);
    const text = collectText(rendered).join(" ");

    expect(text).toContain("Consult The Dead");
    expect(text).toContain("Essay");
  });

  it("includes the essay title headline copy", () => {
    const response = Image();
    const rendered = renderBody((response as { body: unknown }).body);
    const text = collectText(rendered).join(" ");

    expect(text).toContain("Consulting the Dead,");
    expect(text).toContain("Not Distilling the Living.");
    expect(text).toContain("The Operation We Are Doing Instead");
  });

  it("includes the canonical URL slug in the footer", () => {
    const response = Image();
    const rendered = renderBody((response as { body: unknown }).body);
    const text = collectText(rendered).join(" ");

    expect(text).toContain("consultthedead.com/essay");
  });

  it("includes the descriptive sub-copy about framework extraction", () => {
    const response = Image();
    const rendered = renderBody((response as { body: unknown }).body);
    const text = collectText(rendered).join(" ");

    expect(text).toContain(
      "Why we extract decision frameworks from documented history",
    );
  });
});
