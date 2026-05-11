/**
 * Twitter card image for /minds/[id].
 *
 * Re-exports the Open Graph composition so the Twitter preview stays
 * byte-for-byte aligned with the canonical mind share image.
 */
import { MIND_SLUGS } from "@/lib/mind-content";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export function generateStaticParams() {
  return MIND_SLUGS.map((id) => ({ id }));
}
export const dynamicParams = false;
export const revalidate = 3600;
export const alt = "A mind profile card from Consult The Dead";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";
