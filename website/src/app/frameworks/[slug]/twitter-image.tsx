/**
 * Twitter card image for /frameworks/[slug].
 *
 * Re-exports the Open Graph composition so the Twitter preview stays
 * byte-for-byte aligned with the canonical framework share image.
 */
import { ALLOWED_SLUGS } from "@/lib/frameworks";
import { FRAMEWORK_OG_IMAGE_SIZE } from "@/lib/framework-og-image";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export function generateStaticParams() {
  return ALLOWED_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;
export const revalidate = 3600;
export const alt = "A framework detail card from Consult The Dead";
export const size = FRAMEWORK_OG_IMAGE_SIZE;
export const contentType = "image/png";
