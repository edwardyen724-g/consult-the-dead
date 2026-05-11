/**
 * Twitter card image for /frameworks (the frameworks index page).
 *
 * Re-exports the Open Graph composition so the Twitter preview stays
 * byte-for-byte aligned with the canonical index share image.
 */
import { FRAMEWORK_OG_IMAGE_SIZE } from "@/lib/framework-og-image";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export const alt = "All Decision Frameworks — Consult The Dead";
export const size = FRAMEWORK_OG_IMAGE_SIZE;
export const contentType = "image/png";
