/**
 * Twitter card image for /agora/a/[id].
 *
 * Re-uses the Open-Graph image route's default export so Twitter / X
 * `summary_large_image` cards render the same 1200×630 visual without
 * a duplicate `ImageResponse` build. The route-segment config
 * (`runtime`, `revalidate`) MUST be declared statically per file
 * (Next.js cannot follow them through a re-export), so we duplicate
 * the literals from `opengraph-image.tsx` here. The values must stay
 * in sync — see the matching comment in that file.
 *
 * Capsule: bdcb79ca · Task: fd349805.
 */
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og-image-url";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "An agon from Consult The Dead — The Agora";
export const size = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
export const contentType = "image/png";
