'use client'

/**
 * BYO Anthropic API key settings card.
 *
 * Renders inside /account. The server (account/page.tsx) is responsible for
 * reading the masked-display string out of Clerk privateMetadata and passing
 * it down via `initialMaskedKey` — this component never fetches the raw key.
 *
 * Server contract (see /api/user/api-key/route.ts):
 *   POST   { key }                   201 / 400 (sk-ant- prefix + length check)
 *   DELETE                            201 — clears the stored key
 *   GET                               { hasKey: boolean } (we don't use it
 *                                     here; the server page already did the
 *                                     read at SSR time)
 *
 * UX:
 *   - When no key on file → free-text input + Save button.
 *   - When a key is on file → masked placeholder (last 4 chars) + Replace / Remove buttons.
 *   - Replace switches back to the input form (Save commits, Cancel reverts).
 *   - Inline help line: "Your key, your bill — Anthropic charges you
 *     directly. We never see your conversations." (verbatim from task spec.)
 *   - Validation: key must start with "sk-ant-"; error shown with aria-describedby.
 *   - Success toast after save, confirmation prompt before remove.
 */

import { useState } from 'react'
import { isValidAnthropicKey } from '@/lib/api-key-validation'

// Re-export so callers that import from this component file still work.
export { isValidAnthropicKey } from '@/lib/api-key-validation'

interface Props {
  /**
   * Pre-rendered masked display string for the saved key (e.g.
   * "sk-ant-***...***WXYZ"), or null if the user has no key on file.
   * Computed server-side from privateMetadata in account/page.tsx.
   */
  initialMaskedKey: string | null
}

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'removing' }
  | { kind: 'success'; message: string }
  | { kind: 'confirm-remove' }
  | { kind: 'error'; message: string }

const HELP_ID = 'anthropic-api-key-help'
const ERROR_ID = 'anthropic-api-key-error'

export function ApiKeySettings({ initialMaskedKey }: Props) {
  const [maskedKey, setMaskedKey] = useState<string | null>(initialMaskedKey)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(initialMaskedKey === null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const busy = status.kind === 'saving' || status.kind === 'removing'

  async function handleSave() {
    const trimmed = draft.trim()
    if (!isValidAnthropicKey(trimmed)) {
      setStatus({
        kind: 'error',
        message: 'API key must start with sk-ant- and be at least 20 characters.',
      })
      return
    }
    setStatus({ kind: 'saving' })
    try {
      const res = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'Save failed.')
      }
      // Optimistically render a masked display locally so the UI flips
      // immediately. The next /account SSR will reconcile from privateMetadata.
      const last4 = trimmed.slice(-4)
      setMaskedKey(`sk-ant-...${last4}`)
      setDraft('')
      setEditing(false)
      setStatus({
        kind: 'success',
        message: 'Key saved — your agons will now use your Anthropic account.',
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Save failed.',
      })
    }
  }

  async function handleRemove() {
    setStatus({ kind: 'removing' })
    try {
      const res = await fetch('/api/user/api-key', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'Remove failed.')
      }
      setMaskedKey(null)
      setDraft('')
      setEditing(true)
      setStatus({ kind: 'idle' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Remove failed.',
      })
    }
  }

  // aria-describedby wires the input to the relevant help/error text for SR users.
  const inputDescribedBy =
    status.kind === 'error'
      ? ERROR_ID
      : HELP_ID

  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '48px',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--hairline)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
          }}
        >
          Anthropic API Key
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: '3px',
            background: maskedKey ? 'var(--amber-wash)' : 'var(--surface)',
            color: maskedKey ? 'var(--amber)' : 'var(--fg-dim)',
          }}
        >
          {maskedKey ? 'On file' : 'Not set'}
        </span>
      </div>

      <div style={{ padding: '24px' }}>
        <p
          id={HELP_ID}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.95rem',
            color: 'var(--fg-dim)',
            margin: '0 0 20px',
            lineHeight: 1.6,
          }}
        >
          Bring your own Anthropic API key for unlimited agons (no daily cap).
          Your key, your bill — Anthropic charges you directly. We never see
          your conversations.
        </p>

        {editing ? (
          <>
            <label
              htmlFor="anthropic-api-key"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                marginBottom: '8px',
              }}
            >
              Paste your key
            </label>
            <input
              id="anthropic-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-ant-…"
              value={draft}
              onChange={e => {
                setDraft(e.target.value)
                // Clear error as user edits so they see live feedback
                if (status.kind === 'error') setStatus({ kind: 'idle' })
              }}
              disabled={busy}
              aria-describedby={inputDescribedBy}
              aria-invalid={status.kind === 'error'}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '10px 12px',
                border: `1px solid ${status.kind === 'error' ? 'var(--red, #c44)' : 'var(--hairline)'}`,
                borderRadius: '4px',
                background: 'var(--surface)',
                color: 'var(--fg)',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy || draft.trim().length === 0}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  border: 'none',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy || draft.trim().length === 0 ? 0.6 : 1,
                }}
              >
                {status.kind === 'saving' ? 'Saving…' : 'Save key'}
              </button>
              {maskedKey && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setDraft('')
                    setStatus({ kind: 'idle' })
                  }}
                  disabled={busy}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    background: 'transparent',
                    color: 'var(--fg)',
                    border: '1px solid var(--hairline)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        ) : status.kind === 'confirm-remove' ? (
          /* Inline confirmation prevents accidental key removal */
          <div
            role="alertdialog"
            aria-labelledby="confirm-remove-label"
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: '4px',
              padding: '16px',
              background: 'var(--surface)',
            }}
          >
            <p
              id="confirm-remove-label"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
                color: 'var(--fg)',
                margin: '0 0 14px',
                lineHeight: 1.5,
              }}
            >
              Remove your API key? You&rsquo;ll revert to the monthly limit.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--red, #c44)',
                  border: '1px solid var(--hairline)',
                  cursor: 'pointer',
                }}
              >
                Yes, remove key
              </button>
              <button
                type="button"
                onClick={() => setStatus({ kind: 'idle' })}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--hairline)',
                  cursor: 'pointer',
                }}
              >
                Keep key
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '10px 12px',
                border: '1px solid var(--hairline)',
                borderRadius: '4px',
                background: 'var(--surface)',
                color: 'var(--fg-dim)',
                marginBottom: '16px',
                userSelect: 'all',
              }}
              data-testid="masked-key"
            >
              {maskedKey}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(true)
                  setStatus({ kind: 'idle' })
                }}
                disabled={busy}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--hairline)',
                  cursor: 'pointer',
                }}
              >
                Replace key
              </button>
              <button
                type="button"
                onClick={() => setStatus({ kind: 'confirm-remove' })}
                disabled={busy}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--red, #c44)',
                  border: '1px solid var(--hairline)',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {status.kind === 'removing' ? 'Removing…' : 'Remove key'}
              </button>
            </div>
          </>
        )}

        {status.kind === 'error' && (
          <p
            id={ERROR_ID}
            role="alert"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--red, #c44)',
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            {status.message}
          </p>
        )}

        {status.kind === 'success' && (
          <p
            role="status"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--green, #5a8)',
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            {status.message}
          </p>
        )}
      </div>
    </div>
  )
}
