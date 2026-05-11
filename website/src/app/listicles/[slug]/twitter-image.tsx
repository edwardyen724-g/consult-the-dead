import {
  LISTICLE_SHARE_IMAGE_HEIGHT,
  LISTICLE_SHARE_IMAGE_WIDTH,
} from "@/lib/listicle-content";

export { default } from "./opengraph-image";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Consult The Dead listicle share card";
export const size = {
  width: LISTICLE_SHARE_IMAGE_WIDTH,
  height: LISTICLE_SHARE_IMAGE_HEIGHT,
};
export const contentType = "image/png";
