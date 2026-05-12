import { describe, expect, it } from 'vitest'
import { isValidAnthropicKey } from '../lib/api-key-validation'

describe('isValidAnthropicKey', () => {
  it('accepts a well-formed sk-ant- key', () => {
    expect(isValidAnthropicKey('sk-ant-api03-abcdefghijklmnopqrstuvwxyz')).toBe(true)
  })

  it('accepts the minimum valid key (exactly 21 chars, starts sk-ant-)', () => {
    // 'sk-ant-' = 7 chars; need length > 20, so 21 total
    expect(isValidAnthropicKey('sk-ant-' + 'a'.repeat(14))).toBe(true)
  })

  it('rejects a key that does not start with sk-ant-', () => {
    expect(isValidAnthropicKey('sk-abc-api03-somethinglong')).toBe(false)
  })

  it('rejects an OpenAI-style key', () => {
    expect(isValidAnthropicKey('sk-proj-abc123xyz')).toBe(false)
  })

  it('rejects a key that starts with sk-ant- but is too short', () => {
    // 'sk-ant-abc' = 10 chars (≤ 20)
    expect(isValidAnthropicKey('sk-ant-abc')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidAnthropicKey('')).toBe(false)
  })

  it('rejects whitespace-only input', () => {
    expect(isValidAnthropicKey('   ')).toBe(false)
  })

  it('rejects input that has sk-ant- as a suffix rather than prefix', () => {
    expect(isValidAnthropicKey('prefix-sk-ant-api03-somethinglong')).toBe(false)
  })

  it('is case-sensitive — SK-ANT- does not pass', () => {
    expect(isValidAnthropicKey('SK-ANT-api03-abcdefghijklmnopqrstuvwxyz')).toBe(false)
  })
})
