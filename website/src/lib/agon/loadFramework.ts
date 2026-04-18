import fs from "fs";
import path from "path";
import type { FrameworkSlug } from "@/lib/frameworks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadFrameworkRaw(slug: FrameworkSlug): any | null {
  try {
    const filePath = path.resolve(
      process.cwd(),
      "data",
      "frameworks",
      slug,
      "framework.json"
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getMindName(slug: FrameworkSlug): string {
  const raw = loadFrameworkRaw(slug);
  return raw?.meta?.person ?? slug;
}
