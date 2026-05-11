/**
 * Twitter card image for the homepage root (/).
 *
 * Re-exports the Open Graph composition so the Twitter preview stays
 * byte-for-byte aligned with the canonical homepage share image.
 * Twitter expects a 2:1 ratio (1200x628 or 1200x630) — this matches
 * the OG image size export exactly.
 */
export {
  default,
  alt,
  contentType,
  runtime,
  size,
} from "./opengraph-image";
