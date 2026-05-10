/**
 * Short share id generator.
 *
 * Generates URL-safe, human-friendly identifiers used as the public handle
 * for shared agons (e.g. /agora/a/<shareId>). Uses a reduced base32 alphabet
 * (no `0/O/1/I/L`) so the IDs survive being read aloud or typed by hand.
 *
 * Collision space at length=10 is 32^10 ≈ 1.1e15. With even 1M shared agons
 * the birthday-bound collision probability is negligible (<1e-3); the DB
 * `share_id` column has a UNIQUE constraint as a final guard.
 */
import { randomBytes } from "node:crypto";

// Lowercase + digits, with the most ambiguous glyphs (0/o/1/l/i) removed.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * Public Agora share handles live in `/agora/a/<id>` and may be either:
 *   - generated short ids from `generateShareId()` (base32-safe, no hyphens)
 *   - pre-seeded outreach slugs such as `abhishek-chakravarty`
 *
 * Keep the contract explicit and conservative: lowercase only, no leading
 * or trailing hyphens, and no repeated separators. This stays URL-safe while
 * still matching the public handles already seeded into the database.
 */
export const PUBLIC_SHARE_ID_PATTERN = /^[a-z2-9]+(?:-[a-z2-9]+)*$/;
export const PUBLIC_SHARE_ID_MIN_LENGTH = 4;
export const PUBLIC_SHARE_ID_MAX_LENGTH = 64;

/**
 * Generate a short share id.
 *
 * @param length Number of characters in the returned id. Defaults to 10.
 *               Each character carries log2(31) ≈ 4.95 bits of entropy.
 * @returns A new random id, e.g. "k7n3pqx9rt".
 */
export function generateShareId(length = 10): string {
  if (!Number.isInteger(length) || length < 4) {
    throw new Error("share id length must be an integer >= 4");
  }

  // Pull more bytes than strictly needed so we can reject any byte that would
  // bias the alphabet. ALPHABET.length (31) does not divide 256, so naively
  // doing `bytes[i] % 31` would give characters at the start of the alphabet
  // a slightly higher probability. Rejection sampling keeps the output
  // uniform.
  const out: string[] = [];
  const max = Math.floor(256 / ALPHABET.length) * ALPHABET.length; // 248
  while (out.length < length) {
    const buf = randomBytes(length * 2);
    for (let i = 0; i < buf.length && out.length < length; i++) {
      const b = buf[i];
      if (b < max) {
        out.push(ALPHABET[b % ALPHABET.length]);
      }
    }
  }
  return out.join("");
}

/**
 * Public-share shape check used by routes to decide whether an `[id]` path
 * segment should be treated as the public Agora handle (vs. an owner-scoped
 * UUID). The database layer remains the authoritative validator, but this
 * keeps the route contract explicit for downstream callers.
 */
export function looksLikeShareId(value: unknown): value is string {
  return isPublicShareId(value);
}

/**
 * Alias for callers that want the contract named after what it does instead of
 * the historical heuristic name.
 */
export function isPublicShareId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (
    value.length < PUBLIC_SHARE_ID_MIN_LENGTH ||
    value.length > PUBLIC_SHARE_ID_MAX_LENGTH
  ) {
    return false;
  }
  return PUBLIC_SHARE_ID_PATTERN.test(value);
}
