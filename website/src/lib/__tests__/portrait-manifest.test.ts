/**
 * Portrait-manifest coverage gate.
 *
 * Verifies that every framework slug that has shipped a portrait-led OG
 * card has a corresponding PNG asset in website/public/portraits/.
 *
 * The check intentionally operates on the live filesystem — it is a
 * deployment-readiness gate, not a unit test.  A missing file means the
 * production OG card will render a blank portrait frame for that slug
 * (see docs/release-notes/2026-05-11-framework-detail-preview-image.md).
 */
import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * Slugs for which a portrait asset must exist.
 *
 * This list tracks the 18 originally-deployed minds plus Seneca (added
 * 2026-05-11 — task 34c856a8).  When new portrait assets are shipped for
 * the 2026-05 roster-expansion minds (task 8987b12a) they should be
 * appended here so the gate continuously enforces coverage.
 */
const PORTRAIT_REQUIRED_SLUGS = [
  "isaac-newton",
  "marie-curie",
  "niccolo-machiavelli",
  "nikola-tesla",
  "leonardo-da-vinci",
  "sun-tzu",
  "marcus-aurelius",
  "benjamin-franklin",
  "cicero",
  "epictetus",
  "thomas-edison",
  "archimedes",
  "john-d-rockefeller",
  "harriet-tubman",
  "ada-lovelace",
  "catherine-the-great",
  "alexander-the-great",
  "cleopatra-vii",
  // Added 2026-05-11 (task 34c856a8) — Seneca portrait was returning 404
  "seneca",
] as const;

// __dirname is website/src/lib/__tests__ → go up 3 levels to reach website/
const PORTRAITS_DIR = join(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "portraits",
);

describe("portrait manifest", () => {
  it.each(PORTRAIT_REQUIRED_SLUGS)(
    "%s — portrait asset exists in public/portraits/",
    (slug) => {
      const assetPath = join(PORTRAITS_DIR, `${slug}-portrait.png`);
      expect(
        existsSync(assetPath),
        `Missing portrait: public/portraits/${slug}-portrait.png — add the asset so the OG card renders correctly`,
      ).toBe(true);
    },
  );
});
