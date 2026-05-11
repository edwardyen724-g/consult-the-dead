/**
 * Anthropic API key masking + format validation helpers.
 *
 * Used by:
 *   - /api/user/api-key route (server-side validation before persisting to
 *     Clerk privateMetadata)
 *   - /account page (server-rendered masked display of an already-saved key)
 *
 * The raw key is only ever in flight on the server (POST request body) or
 * stored in Clerk privateMetadata. This module deals only in the safe
 * representations: a masked display string and a `sk-ant-` prefix check.
 *
 * NEVER export a helper that returns the raw key — even by accident — from
 * here. The `mask*` family must only ever produce a censored form that is
 * safe to render in HTML and ship to the client.
 */

/** Real Anthropic API keys begin with this prefix. */
export const ANTHROPIC_KEY_PREFIX = "sk-ant-";

/**
 * Lower bound on a plausible Anthropic API key length. Real keys are ~108
 * chars; we require prefix + 20 so accidental truncations / whitespace pastes
 * fail the format check rather than silently saving a bad key.
 */
export const ANTHROPIC_KEY_MIN_LENGTH = ANTHROPIC_KEY_PREFIX.length + 20;

/**
 * Returns true when `value` looks like a well-formed Anthropic API key:
 *   - is a string
 *   - starts with `sk-ant-`
 *   - is at least ANTHROPIC_KEY_MIN_LENGTH characters long
 *
 * This is a *format* check, not an authenticity check — Anthropic itself
 * is the only authority that can confirm the key actually works. The intent
 * here is to reject the obvious mistakes (empty input, wrong-prefix paste,
 * the literal placeholder text the UI shows) before we persist anything.
 */
export function isValidAnthropicKeyFormat(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!value.startsWith(ANTHROPIC_KEY_PREFIX)) return false;
  if (value.length < ANTHROPIC_KEY_MIN_LENGTH) return false;
  return true;
}

/**
 * Render a saved key as a masked display string of the form
 * `sk-ant-***...***<last4>`.
 *
 * The last four characters of the raw key are preserved so the user can
 * recognise *which* key they have stored without exposing enough secret
 * material to be useful to an attacker. (Anthropic keys end in randomised
 * material so the last four don't leak account identity.)
 *
 * Returns the empty string for empty / non-string input. Strings shorter
 * than four characters are masked entirely (`sk-ant-***...***`) — defensive
 * fallback; in practice we only mask values that already passed
 * `isValidAnthropicKeyFormat`.
 */
export function maskApiKey(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "";
  if (value.length < 4) return `${ANTHROPIC_KEY_PREFIX}***...***`;
  const lastFour = value.slice(-4);
  return `${ANTHROPIC_KEY_PREFIX}***...***${lastFour}`;
}
