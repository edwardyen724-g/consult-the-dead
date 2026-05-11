/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

const themeState = vi.hoisted(() => ({
  theme: "dark" as "dark" | "light",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: themeState.theme,
    setTheme: themeState.setTheme,
  }),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: { children: ReactNode }) => (
      <span {...props}>{children}</span>
    ),
  },
}));

beforeEach(() => {
  themeState.setTheme.mockReset();
  themeState.theme = "dark";
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("shows the late study copy in dark mode and flips to light mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ThemeToggle />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toContain("Mode");
    expect(button?.textContent).toContain("Late Study");

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(themeState.setTheme).toHaveBeenCalledWith("light");
    root.unmount();
  });

  it("shows the reading room copy in light mode and flips back to dark mode", async () => {
    themeState.theme = "light";

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ThemeToggle />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toContain("Mode");
    expect(button?.textContent).toContain("Reading Room");

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
    root.unmount();
  });
});
