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

import { FooterToggle } from "./footer-toggle";

beforeEach(() => {
  setTheme.mockReset();
  themeState = {
    theme: "system",
    resolvedTheme: "dark",
    setTheme,
  };
});

describe("FooterToggle", () => {
  it("shows the dark-mode icon and aria label when system preference resolves to dark", async () => {
    render(<FooterToggle />);

    const button = await screen.findByRole("button", { name: "Switch to light mode" });
    expect(button.querySelector("svg circle")).not.toBeNull();
  });

  it("shows the light-mode icon and aria label when system preference resolves to light", async () => {
    themeState = {
      theme: "system",
      resolvedTheme: "light",
      setTheme,
    };

    render(<FooterToggle />);

    const button = await screen.findByRole("button", { name: "Switch to dark mode" });
    expect(button.querySelector("svg path")).not.toBeNull();
    expect(button.querySelector("svg circle")).toBeNull();
  });

  it("persists explicit overrides using the resolved theme state", async () => {
    render(<FooterToggle />);

    const button = await screen.findByRole("button", { name: "Switch to light mode" });
    button.click();

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
