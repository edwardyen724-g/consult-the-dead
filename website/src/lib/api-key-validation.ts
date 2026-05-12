/**
 * Validation helpers for BYO Anthropic API key.
 *
 * Extracted to a pure utility so these can be tested in vitest without
 * pulling in React or other browser dependencies.
 */

/**
 * Returns true if `key` looks like a real Anthropic API key:
 *   - must start with the canonical "sk-ant-" prefix
 *   - must be longer than 20 characters (real keys are ~100+)
 *
 * The server also validates the key, but this client-side check gives
 * instant feedback before the round-trip.
 */
export function isValidAnthropicKey(key: string): boolean {
  return key.startsWith('sk-ant-') && key.length > 20
}
