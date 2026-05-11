/**
 * Twitter card image for /pricing.
 *
 * Re-exports the Open Graph composition so Twitter and OG previews
 * stay byte-for-byte aligned.
 */
import { size } from "./opengraph-image";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Pricing share card from Consult The Dead";
export { size };
export const contentType = "image/png";
export const dynamicParams = false;
