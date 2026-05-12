/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const setTheme = vi.fn();

let themeState = {
  theme: "system",
  resolvedTheme: "dark",
  setTheme,
};

vi.mock("next-themes", () => ({
  useTheme: () => themeState,
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  setTheme.mockReset();
  themeState = {
    theme: "system",
    resolvedTheme: "dark",
    setTheme,
  };
});

describe("ThemeToggle", () => {
  it("shows the dark-mode label and icon when system preference resolves to dark", async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", { name: "Switch to light mode" });
    expect(button.textContent).toContain("The Late Study");
    expect(button.querySelector("svg circle")).not.toBeNull();
    expect(button.querySelector("svg path")).toBeNull();
  });

  it("shows the light-mode label and icon when system preference resolves to light", async () => {
    themeState = {
      theme: "system",
      resolvedTheme: "light",
      setTheme,
    };

    render(<ThemeToggle />);

    const button = await screen.findByRole("button", { name: "Switch to dark mode" });
    expect(button.textContent).toContain("The Reading Room");
    expect(button.querySelector("svg path")).not.toBeNull();
    expect(button.querySelector("svg circle")).toBeNull();
  });

  it("persists an explicit override based on the resolved OS theme", async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", { name: "Switch to light mode" });
    button.click();

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
