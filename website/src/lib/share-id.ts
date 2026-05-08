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
 * Cheap shape check used by routes to decide whether an `[id]` path segment
 * looks like a short share id (vs. a UUID). UUIDs contain hyphens, share ids
 * never do, so a simple structure test suffices — the database layer is the
 * authoritative validator.
 */
export function looksLikeShareId(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length < 4 || value.length > 24) return false;
  return /^[a-z2-9]+$/.test(value);
}
