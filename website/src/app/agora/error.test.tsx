import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import AgoraError from "./error";

describe("AgoraError boundary page", () => {
  it("renders the error notice panel with red accent", () => {
    const markup = renderToStaticMarkup(
      <AgoraError
        error={new Error("boom")}
        reset={() => {}}
      />,
    );

    expect(markup).toContain("The council could not load just now.");
    expect(markup).toContain("The Agora");
    expect(markup).toContain("var(--red)");
  });

  it("shows retry and home actions", () => {
    const markup = renderToStaticMarkup(
      <AgoraError
        error={new Error("boom")}
        reset={() => {}}
      />,
    );

    expect(markup).toContain("Retry loading the Agora");
    expect(markup).toContain("Return to the landing page");
    expect(markup).toContain('href="/"');
  });

  it("contains transient-error guidance copy", () => {
    const markup = renderToStaticMarkup(
      <AgoraError
        error={new Error("network")}
        reset={() => {}}
      />,
    );

    expect(markup).toContain(
      "This is usually a transient network or server problem.",
    );
  });
});
