import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const nextThemesProvider = vi.fn(({ children }: { children?: ReactNode }) => children);

vi.mock("next-themes", () => ({
  ThemeProvider: (props: Record<string, unknown>) => nextThemesProvider(props),
}));

import { ThemeProvider } from "./ThemeProvider";

describe("ThemeProvider", () => {
  it("configures next-themes for system-following class-based theme control", () => {
    const element = ThemeProvider({ children: null });

    expect(element.props.attribute).toBe("class");
    expect(element.props.defaultTheme).toBe("system");
    expect(element.props.enableSystem).toBe(true);
    expect(element.props.disableTransitionOnChange).toBe(false);
  });
});
