import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import {
  ALLOWED_SLUGS,
  getAllFrameworks,
  getFramework,
} from "@/lib/frameworks";

const LIVE_ROSTER_SLUGS = [
  "cicero",
  "epictetus",
  "thomas-edison",
  "john-d-rockefeller",
] as const;

function readFrameworkJson(slug: string): {
  meta?: { construct_count?: number };
  bipolar_constructs?: unknown[];
} {
  const filePath = path.resolve(
    process.cwd(),
    "data",
    "frameworks",
    slug,
    "framework.json",
  );

  expect(fs.existsSync(filePath)).toBe(true);

  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    meta?: { construct_count?: number };
    bipolar_constructs?: unknown[];
  };
}

describe("framework roster", () => {
  it("keeps getAllFrameworks aligned with the allowed live slug list", () => {
    const rosterSlugs = getAllFrameworks().map((framework) => framework.slug);

    expect(rosterSlugs).toEqual([...ALLOWED_SLUGS]);
    expect(rosterSlugs).not.toContain("albert-einstein");
  });

  it("resolves framework.json with era and construct metadata for the remaining live pages", () => {
    for (const slug of LIVE_ROSTER_SLUGS) {
      const framework = getFramework(slug);
      expect(framework).not.toBeNull();
      expect(framework?.era).toBeTruthy();
      expect(framework?.meta.construct_count).toBeGreaterThan(0);

      const frameworkJson = readFrameworkJson(slug);
      const constructCount =
        frameworkJson.meta?.construct_count ??
        frameworkJson.bipolar_constructs?.length ??
        0;

      expect(constructCount).toBeGreaterThan(0);
      expect(framework?.meta.construct_count).toBe(constructCount);
    }
  });
});
